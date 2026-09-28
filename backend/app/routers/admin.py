from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import case, delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from .. import storage, video
from ..config import get_settings
from ..db import get_db
from ..engine import exiftool_available
from ..models import ContactMessage, ProcessingJob
from ..security import check_credentials, issue_token, limit, require_admin
from . import video as video_router

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])
settings = get_settings()


class LoginIn(BaseModel):
    username: str
    password: str


@router.post("/login", dependencies=[Depends(limit("login", settings.rate_login_per_15min, 900))])
async def login(body: LoginIn):
    if not settings.admin_password:
        raise HTTPException(503, "Admin panel is disabled. Set ADMIN_PASSWORD on the server.")
    if not check_credentials(body.username, body.password):
        raise HTTPException(401, "Username or password is incorrect.")
    return {"token": issue_token(body.username), "expires_in": settings.admin_token_hours * 3600}


@router.get("/overview")
async def overview(days: int = 14, db: AsyncSession = Depends(get_db), _: str = Depends(require_admin)):
    days = max(1, min(days, 90))
    since = datetime.now(timezone.utc) - timedelta(days=days)
    J = ProcessingJob
    ok = J.status == "success"

    totals = (await db.execute(select(
        func.count(J.id),
        func.sum(case((ok & (J.kind == "clean"), 1), else_=0)),
        func.sum(case((ok & (J.kind == "scan"), 1), else_=0)),
        func.sum(case((J.status != "success", 1), else_=0)),
        func.count(func.distinct(J.visitor_hash)),
        func.coalesce(func.sum(J.original_size), 0),
        func.coalesce(func.sum(J.fields_removed), 0),
        func.coalesce(func.avg(case((ok & (J.kind == "clean"), J.duration_ms))), 0),
        func.sum(case((J.had_location, 1), else_=0)),
        func.sum(case((J.had_ai_data, 1), else_=0)),
    ))).one()

    window = (await db.execute(select(func.count(J.id), func.count(func.distinct(J.visitor_hash)))
                               .where(J.created_at >= since))).one()

    day = func.date(J.created_at)
    daily_rows = (await db.execute(
        select(day, func.count(J.id), func.count(func.distinct(J.visitor_hash)))
        .where(J.created_at >= since).group_by(day).order_by(day))).all()

    formats = (await db.execute(select(J.file_format, func.count(J.id)).where(ok)
                                .group_by(J.file_format))).all()
    media_rows = (await db.execute(
        select(J.media, func.count(J.id), func.coalesce(func.sum(J.fields_removed), 0),
               func.coalesce(func.sum(J.original_size), 0))
        .where(ok).group_by(J.media))).all()
    errors = (await db.execute(select(J.created_at, J.status, J.error).where(J.status != "success")
                               .order_by(J.created_at.desc()).limit(8))).all()
    unread = (await db.execute(select(func.count(ContactMessage.id)).where(ContactMessage.is_read.is_(False)))).scalar()

    return {
        "totals": {
            "jobs": totals[0] or 0, "cleaned": totals[1] or 0, "scanned": totals[2] or 0,
            "failed": totals[3] or 0, "unique_visitors": totals[4] or 0, "bytes_processed": int(totals[5] or 0),
            "fields_removed": int(totals[6] or 0), "avg_ms": round(float(totals[7] or 0)),
            "with_location": totals[8] or 0, "with_ai_data": totals[9] or 0, "unread_messages": unread or 0,
        },
        "window": {"days": days, "jobs": window[0], "visitors": window[1]},
        "daily": [{"date": str(d), "jobs": j, "visitors": v} for d, j, v in daily_rows],
        "formats": [{"format": f or "unknown", "count": c} for f, c in formats],
        "media": [{"media": m or "image", "count": c, "fields_removed": int(fr or 0),
                   "bytes": int(b or 0)} for m, c, fr, b in media_rows],
        "recent_errors": [{"at": a.isoformat(), "status": s, "error": e} for a, s, e in errors],
        "storage": storage.usage(),
        "engine": {
            "exiftool": exiftool_available(),
            "max_file_mb": settings.max_file_mb,
            "video": video.available(),
            "ffmpeg": video.version(),
            "max_video_mb": settings.max_video_mb,
            "video_queue": video_router.jobs.stats(),
        },
    }


@router.get("/messages")
async def messages(limit_: int = 100, db: AsyncSession = Depends(get_db), _: str = Depends(require_admin)):
    rows = (await db.execute(select(ContactMessage).order_by(ContactMessage.created_at.desc())
                             .limit(max(1, min(limit_, 500))))).scalars().all()
    return [{"id": m.id, "created_at": m.created_at.isoformat(), "name": m.name, "email": m.email,
             "topic": m.topic, "message": m.message, "is_read": m.is_read} for m in rows]


class MessagePatch(BaseModel):
    is_read: bool


@router.patch("/messages/{mid}")
async def mark(mid: int, body: MessagePatch, db: AsyncSession = Depends(get_db), _: str = Depends(require_admin)):
    await db.execute(update(ContactMessage).where(ContactMessage.id == mid).values(is_read=body.is_read))
    await db.commit()
    return {"ok": True}


@router.delete("/messages/{mid}", status_code=204)
async def remove(mid: int, db: AsyncSession = Depends(get_db), _: str = Depends(require_admin)):
    await db.execute(delete(ContactMessage).where(ContactMessage.id == mid))
    await db.commit()
