from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ProcessingJob(Base):
    """Anonymous processing statistics.

    Never stores media, file names or metadata values: only counts, sizes and durations.
    """

    __tablename__ = "processing_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    visitor_hash: Mapped[str] = mapped_column(String(64), index=True)
    media: Mapped[str] = mapped_column(String(8), default="image", index=True)  # image | video
    kind: Mapped[str] = mapped_column(String(16), default="clean")  # clean | scan
    status: Mapped[str] = mapped_column(String(16), default="success", index=True)
    file_format: Mapped[str] = mapped_column(String(8), default="")
    original_size: Mapped[int] = mapped_column(Integer, default=0)
    cleaned_size: Mapped[int] = mapped_column(Integer, default=0)
    fields_found: Mapped[int] = mapped_column(Integer, default=0)
    fields_removed: Mapped[int] = mapped_column(Integer, default=0)
    privacy_before: Mapped[int] = mapped_column(Integer, default=0)
    privacy_after: Mapped[int] = mapped_column(Integer, default=0)
    had_location: Mapped[bool] = mapped_column(Boolean, default=False)
    had_ai_data: Mapped[bool] = mapped_column(Boolean, default=False)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    error: Mapped[str] = mapped_column(String(200), default="")


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(200))
    topic: Mapped[str] = mapped_column(String(60), default="General")
    message: Mapped[str] = mapped_column(Text)
    visitor_hash: Mapped[str] = mapped_column(String(64), default="")
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
