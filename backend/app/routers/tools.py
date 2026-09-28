"""Public image endpoints. Uploads are read into memory only — originals never touch disk."""
from __future__ import annotations

import asyncio
import io
import logging
import zipfile
from urllib.parse import quote

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from .. import storage
from ..config import get_settings
from ..db import get_db
from ..engine import UnsupportedImage, clean_image, inspect_only
from ..models import ProcessingJob
from ..security import limit, visitor_hash

router = APIRouter(prefix="/api/v1", tags=["tools"])
settings = get_settings()
log = logging.getLogger("aimr.tools")
_workers = asyncio.Semaphore(settings.processing_workers)

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "application/octet-stream"}


async def read_upload(request: Request) -> bytes:
    ctype = (request.headers.get("content-type") or "").split(";")[0].strip().lower()
    if ctype not in ALLOWED_TYPES:
        raise HTTPException(415, "Upload a JPG, PNG or WebP image.")
    declared = request.headers.get("content-length")
    if declared and declared.isdigit() and int(declared) > settings.max_file_bytes:
        raise HTTPException(413, f"This file is larger than {settings.max_file_mb} MB.")
    buf = bytearray()
    async for chunk in request.stream():
        buf += chunk
        if len(buf) > settings.max_file_bytes:
            raise HTTPException(413, f"This file is larger than {settings.max_file_mb} MB.")
    if len(buf) < 16:
        raise HTTPException(400, "The file is empty.")
    return bytes(buf)


def _file_name(raw: str | None) -> str:
    try:
        from urllib.parse import unquote
        return unquote(raw or "image")[:200]
    except Exception:  # noqa: BLE001
        return "image"


async def _record(db: AsyncSession, **kw) -> None:
    try:
        db.add(ProcessingJob(**kw))
        await db.commit()
    except Exception:  # noqa: BLE001 - stats must never break the tool
        await db.rollback()
        log.exception("could not record job")


@router.post("/scan", dependencies=[Depends(limit("scan", settings.rate_clean_per_minute, 60))])
async def scan(request: Request, db: AsyncSession = Depends(get_db)):
    data = await read_upload(request)
    vh = visitor_hash(request)
    try:
        async with _workers:
            report = await asyncio.to_thread(inspect_only, data, max_pixels=settings.max_pixels)
    except UnsupportedImage as exc:
        await _record(db, visitor_hash=vh, kind="scan", status="rejected", original_size=len(data),
                      error=str(exc)[:200])
        raise HTTPException(422, str(exc)) from exc
    body = report.as_dict()
    cats = {c["key"] for c in body["categories"]}
    await _record(db, visitor_hash=vh, kind="scan", file_format=report.format, original_size=len(data),
                  fields_found=body["field_count"], privacy_before=body["privacy_score"],
                  had_location="location" in cats, had_ai_data=bool(cats & {"ai", "credentials"}))
    return {"file_size": len(data), "report": body}


@router.post("/clean", dependencies=[Depends(limit("clean", settings.rate_clean_per_minute, 60)),
                                     Depends(limit("clean-day", settings.rate_clean_per_day, 86_400))])
async def clean(request: Request, db: AsyncSession = Depends(get_db),
                x_file_name: str | None = Header(default=None)):
    data = await read_upload(request)
    vh = visitor_hash(request)
    try:
        async with _workers:
            result = await asyncio.to_thread(clean_image, data, max_pixels=settings.max_pixels,
                                             use_exiftool=settings.use_exiftool)
    except UnsupportedImage as exc:
        await _record(db, visitor_hash=vh, status="rejected", original_size=len(data), error=str(exc)[:200])
        raise HTTPException(422, str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        log.exception("clean failed")
        await _record(db, visitor_hash=vh, status="error", original_size=len(data), error=type(exc).__name__)
        raise HTTPException(500, "Processing failed. The original file was not stored.") from exc
    finally:
        del data  # original leaves memory as soon as we are done with it

    name = storage.safe_name(_file_name(x_file_name), result["ext"])
    token = await asyncio.to_thread(storage.save, result.pop("cleaned"), name)
    before, after = result["before"], result["after"]
    cats = {c["key"] for c in before["categories"]}
    await _record(db, visitor_hash=vh, file_format=result["format"], original_size=result["original_size"],
                  cleaned_size=result["cleaned_size"], fields_found=before["field_count"],
                  fields_removed=before["field_count"] - after["field_count"],
                  privacy_before=before["privacy_score"], privacy_after=after["privacy_score"],
                  had_location="location" in cats, had_ai_data=bool(cats & {"ai", "credentials"}),
                  duration_ms=result["duration_ms"])
    return {
        "token": token,
        "file_name": name,
        "download_url": f"/api/v1/files/{token}",
        "expires_in": settings.file_ttl_seconds,
        **{k: result[k] for k in ("format", "mime", "original_size", "cleaned_size", "pixels_identical",
                                  "orientation_kept", "duration_ms")},
        "before": before,
        "after": after,
    }


@router.get("/files/{token}", dependencies=[Depends(limit("download", 120, 60))])
async def download(token: str):
    found = storage.resolve(token)
    if not found:
        raise HTTPException(404, "This download has expired. Clean the image again to get a new link.")
    path, name = found
    return FileResponse(path, media_type="application/octet-stream", headers={
        "Content-Disposition": f"attachment; filename=\"{name.encode('ascii', 'ignore').decode() or 'image'}\"; "
                               f"filename*=UTF-8''{quote(name)}",
        "Cache-Control": "no-store",
    })


@router.delete("/files/{token}", status_code=204)
async def delete_now(token: str):
    if storage.TOKEN_RE.match(token):
        storage.delete(token)


class ZipRequest(BaseModel):
    tokens: list[str] = Field(min_length=1, max_length=50)


@router.post("/files/zip", dependencies=[Depends(limit("zip", 20, 60))])
async def download_zip(body: ZipRequest):
    items = [storage.resolve(t) for t in body.tokens[:settings.max_zip_files]]
    items = [i for i in items if i]
    if not items:
        raise HTTPException(404, "These downloads have expired. Clean the images again.")

    def build() -> bytes:
        buf = io.BytesIO()
        used: set[str] = set()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_STORED) as zf:  # images are already compressed
            for path, name in items:
                n, i = name, 1
                while n in used:
                    stem, _, ext = name.rpartition(".")
                    n, i = f"{stem}-{i}.{ext}", i + 1
                used.add(n)
                zf.write(path, n)
        return buf.getvalue()

    data = await asyncio.to_thread(build)
    return StreamingResponse(iter([data]), media_type="application/zip", headers={
        "Content-Disposition": 'attachment; filename="cleaned-images.zip"', "Cache-Control": "no-store"})
