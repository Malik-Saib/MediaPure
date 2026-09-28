from __future__ import annotations

import asyncio
import logging
import re
import smtplib
from email.message import EmailMessage

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from ..config import get_settings
from ..db import get_db
from ..models import ContactMessage
from ..security import limit, visitor_hash

router = APIRouter(prefix="/api/v1", tags=["contact"])
settings = get_settings()
log = logging.getLogger("aimr.contact")
EMAIL_RE = re.compile(r"^[^@\s]{1,64}@[^@\s]{1,190}\.[A-Za-z]{2,}$")
TOPICS = {"General", "Support", "Business & API", "Privacy request", "Press", "Bug report"}


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(max_length=200)
    topic: str = "General"
    message: str = Field(min_length=10, max_length=5000)
    website: str = ""  # honeypot: humans never see this field

    @field_validator("email")
    @classmethod
    def valid_email(cls, v: str) -> str:
        v = v.strip()
        if not EMAIL_RE.match(v):
            raise ValueError("Enter a valid email address.")
        return v

    @field_validator("topic")
    @classmethod
    def valid_topic(cls, v: str) -> str:
        return v if v in TOPICS else "General"


def _notify(msg: ContactIn) -> None:
    if not (settings.smtp_host and settings.smtp_from and settings.contact_notify_to):
        return
    em = EmailMessage()
    em["Subject"] = f"[AIMR contact] {msg.topic} from {msg.name}"
    em["From"] = settings.smtp_from
    em["To"] = settings.contact_notify_to
    em["Reply-To"] = msg.email
    em.set_content(f"Name: {msg.name}\nEmail: {msg.email}\nTopic: {msg.topic}\n\n{msg.message}")
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as s:
        s.starttls()
        if settings.smtp_user:
            s.login(settings.smtp_user, settings.smtp_password)
        s.send_message(em)


@router.post("/contact", status_code=201,
             dependencies=[Depends(limit("contact", settings.rate_contact_per_hour, 3600))])
async def contact(body: ContactIn, request: Request, db: AsyncSession = Depends(get_db)):
    if body.website:  # bot filled the honeypot; pretend success
        return {"ok": True}
    db.add(ContactMessage(name=body.name.strip(), email=body.email, topic=body.topic,
                          message=body.message.strip(), visitor_hash=visitor_hash(request)))
    try:
        await db.commit()
    except Exception as exc:  # noqa: BLE001
        await db.rollback()
        raise HTTPException(500, "Your message could not be saved. Email us directly instead.") from exc
    try:
        await asyncio.to_thread(_notify, body)
    except Exception:  # noqa: BLE001
        log.exception("contact email notification failed")
    return {"ok": True}
