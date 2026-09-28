"""Video endpoints.

Videos are far too large to hold in memory the way images are, so an upload is
streamed straight to a private file in the staging directory (mode 0700, random name,
opened O_EXCL) and deleted in a `finally` the moment cleaning finishes — success or
failure. Only the cleaned copy survives, under the same ten-minute expiry and the same
download route as a cleaned image.

Work runs as a background task behind a bounded worker pool, and the browser polls for
progress. Nothing about the image pipeline is touched by anything in this file.
"""
from __future__ import annotations

import asyncio
import logging
import os
import secrets
import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from .. import storage, video
from ..config import get_settings
from ..db import SessionLocal, get_db
from ..jobs import Job, JobStore
from ..models import ProcessingJob
from ..security import limit, visitor_hash

router = APIRouter(prefix="/api/v1/video", tags=["video"])
settings = get_settings()
log = logging.getLogger("aimr.video.api")

_workers = asyncio.Semaphore(settings.video_workers)
jobs = JobStore(max_pending=settings.video_queue_depth, ttl_seconds=settings.video_job_ttl_seconds)

# Browsers are inconsistent about video MIME types and some send nothing at all, so the
# header only gets us into the building; `video.sniff` reads the magic bytes and decides.
ALLOWED_TYPES = {
    "video/mp4", "video/quicktime", "video/x-m4v", "video/m4v", "video/webm",
    "video/x-matroska", "video/matroska", "video/avi", "video/x-msvideo", "video/msvideo",
    "application/octet-stream", "",
}


def _require_tools() -> None:
    if not video.available():
        raise HTTPException(503, "Video cleaning is temporarily unavailable on this server. "
                                 "Image cleaning is unaffected.")


def _file_name(raw: str | None) -> str:
    from urllib.parse import unquote
    try:
        return unquote(raw or "video")[:200]
    except Exception:  # noqa: BLE001
        return "video"


async def _receive(request: Request) -> tuple[Path, int]:
    """Stream the request body to a private file, enforcing the size cap as it arrives."""
    ctype = (request.headers.get("content-type") or "").split(";")[0].strip().lower()
    if ctype not in ALLOWED_TYPES:
        raise HTTPException(415, "Upload an MP4, MOV, WebM, MKV or AVI video.")
    declared = request.headers.get("content-length")
    if declared and declared.isdigit() and int(declared) > settings.max_video_bytes:
        raise HTTPException(413, f"This video is larger than {settings.max_video_mb} MB.")

    incoming = storage.ensure_incoming()
    path = incoming / f"{secrets.token_urlsafe(18)}.upload"
    size = 0
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(fd, "wb") as fh:
            async for chunk in request.stream():
                size += len(chunk)
                if size > settings.max_video_bytes:
                    raise HTTPException(413, f"This video is larger than {settings.max_video_mb} MB.")
                fh.write(chunk)
    except BaseException:
        path.unlink(missing_ok=True)
        raise
    if size < 1024:
        path.unlink(missing_ok=True)
        raise HTTPException(400, "The file is empty.")
    return path, size


async def _record(**kw) -> None:
    """Anonymous statistics. Never stores the video, the file name or any metadata value."""
    try:
        async with SessionLocal() as db:
            db.add(ProcessingJob(media="video", **kw))
            await db.commit()
    except Exception:  # noqa: BLE001 - statistics must never break the tool
        log.exception("could not record video job")


async def _run(job: Job) -> None:
    """Clean one video. Always leaves the job in a terminal state and the staging file gone."""
    workdir: Path | None = None
    try:
        async with _workers:
            if job.state == "cancelled":
                return
            workdir = Path(tempfile.mkdtemp(prefix="clean-", dir=storage.ensure_incoming()))
            job.workdir = workdir
            container = await asyncio.to_thread(video.sniff, job.source, job.file_name)

            loop = asyncio.get_running_loop()

            def phase(name: str) -> None:
                loop.call_soon_threadsafe(job.set_state, name)

            result = await asyncio.to_thread(video.clean_video, job.source, workdir, container,
                                             on_phase=phase)

        name = storage.safe_name(job.file_name, result["ext"], default="video")
        token = await asyncio.to_thread(storage.save_path, result.pop("path"), name)
        job.token = token

        before, after = result["before"], result["after"]
        cats = {c["key"] for c in before["categories"]}
        job.result = {
            "token": token,
            "file_name": name,
            "download_url": f"/api/v1/files/{token}",
            "expires_in": settings.file_ttl_seconds,
            **{k: result[k] for k in (
                "container", "label", "mime", "method", "deep_scrub", "scrub_stats",
                "original_size", "cleaned_size", "streams_identical", "re_encoded",
                "duration_ms", "technical", "technical_after")},
            "before": before,
            "after": after,
        }
        job.set_state("done")
        await _record(visitor_hash=job.visitor, file_format=result["container"],
                      original_size=result["original_size"], cleaned_size=result["cleaned_size"],
                      fields_found=before["field_count"],
                      fields_removed=before["field_count"] - after["field_count"],
                      privacy_before=before["privacy_score"], privacy_after=after["privacy_score"],
                      had_location="location" in cats,
                      had_ai_data=bool(cats & {"ai", "credentials"}),
                      duration_ms=result["duration_ms"])

    except (video.UnsupportedVideo, video.VideoProcessingError) as exc:
        job.error = str(exc)
        job.set_state("error")
        await _record(visitor_hash=job.visitor, status="rejected", original_size=job.file_size,
                      error=str(exc)[:200])
    except video.VideoToolsMissing as exc:
        job.error = str(exc)
        job.set_state("error")
    except asyncio.CancelledError:
        job.set_state("cancelled")
        raise
    except Exception as exc:  # noqa: BLE001
        log.exception("video cleaning failed")
        job.error = "Processing failed. Your video was not stored."
        job.set_state("error")
        await _record(visitor_hash=job.visitor, status="error", original_size=job.file_size,
                      error=type(exc).__name__)
    finally:
        # The original never outlives the job, whatever happened above.
        if job.source:
            video.purge(job.source)
            job.source = None
        if workdir:
            shutil.rmtree(workdir, ignore_errors=True)
            job.workdir = None


@router.get("/status")
async def status():
    """Lets the page tell a visitor up front whether video cleaning is available."""
    return {
        "available": video.available(),
        "max_file_mb": settings.max_video_mb,
        "max_seconds": settings.max_video_seconds,
        "formats": [{"key": k, "label": v["label"], "ext": v["ext"], "mime": v["mime"]}
                    for k, v in video.CONTAINERS.items()],
        "queue": jobs.stats(),
        "accepting": jobs.has_room(),
    }


@router.post("/jobs", status_code=202,
             dependencies=[Depends(limit("video", settings.rate_video_per_minute, 60)),
                           Depends(limit("video-day", settings.rate_video_per_day, 86_400))])
async def create_job(request: Request, x_file_name: str | None = Header(default=None)):
    _require_tools()
    if not jobs.has_room():
        raise HTTPException(503, "The cleaner is busy right now. Try again in a minute.",
                            headers={"Retry-After": "45"})

    path, size = await _receive(request)
    name = _file_name(x_file_name)
    try:
        await asyncio.to_thread(video.sniff, path, name)
    except video.UnsupportedVideo as exc:
        path.unlink(missing_ok=True)
        raise HTTPException(422, str(exc)) from exc
    except Exception:  # noqa: BLE001
        path.unlink(missing_ok=True)
        raise

    job = jobs.create(kind="video", visitor=visitor_hash(request), file_name=name, file_size=size)
    job.source = path
    job.task = asyncio.create_task(_run(job))
    return {**job.as_dict(), "poll_url": f"/api/v1/video/jobs/{job.id}", "poll_after_ms": 700}


@router.get("/jobs/{job_id}", dependencies=[Depends(limit("video-poll", 600, 60))])
async def read_job(job_id: str):
    job = jobs.get(job_id)
    if job is None:
        raise HTTPException(404, "This job has expired. Upload the video again to clean it.")
    return {**job.as_dict(), "poll_after_ms": 0 if job.done else 700}


@router.delete("/jobs/{job_id}", status_code=204)
async def delete_job(job_id: str):
    """Cancel work in flight, or delete a finished result and its download immediately."""
    job = jobs.drop(job_id)
    if job is None:
        return
    if job.task and not job.task.done():
        job.set_state("cancelled")
        job.task.cancel()
    if job.token:
        storage.delete(job.token)
    if job.source:
        video.purge(job.source)
    if job.workdir:
        shutil.rmtree(job.workdir, ignore_errors=True)


@router.post("/scan", dependencies=[Depends(limit("video-scan", settings.rate_video_per_minute, 60))])
async def scan(request: Request, db: AsyncSession = Depends(get_db),
               x_file_name: str | None = Header(default=None)):
    """Read-only: report what is inside a video without producing a cleaned copy."""
    _require_tools()
    path, size = await _receive(request)
    try:
        container = await asyncio.to_thread(video.sniff, path, _file_name(x_file_name))
        async with _workers:
            report = await asyncio.to_thread(video.scan_video, path, container)
    except video.UnsupportedVideo as exc:
        raise HTTPException(422, str(exc)) from exc
    finally:
        video.purge(path)

    body = report["report"]
    cats = {c["key"] for c in body["categories"]}
    try:
        db.add(ProcessingJob(media="video", kind="scan", visitor_hash=visitor_hash(request),
                             file_format=container, original_size=size,
                             fields_found=body["field_count"], privacy_before=body["privacy_score"],
                             had_location="location" in cats,
                             had_ai_data=bool(cats & {"ai", "credentials"})))
        await db.commit()
    except Exception:  # noqa: BLE001
        await db.rollback()
    return report


async def janitor() -> None:
    """Drop expired jobs and reclaim anything their workers left behind."""
    while True:
        try:
            for job in jobs.expired():
                if job.task and not job.task.done():
                    job.task.cancel()
                if job.source:
                    video.purge(job.source)
                if job.workdir:
                    shutil.rmtree(job.workdir, ignore_errors=True)
            await asyncio.to_thread(_sweep_incoming)
        except asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001
            log.exception("video janitor sweep failed")
        await asyncio.sleep(settings.janitor_interval_seconds)


def _sweep_incoming() -> None:
    """Belt and braces: remove staged uploads orphaned by a crash or a hard restart."""
    import time

    cutoff = time.time() - max(settings.video_job_ttl_seconds, settings.video_clean_timeout) * 2
    d = storage.ensure_incoming()
    for p in d.iterdir():
        try:
            if p.stat().st_mtime > cutoff:
                continue
            if p.is_dir():
                shutil.rmtree(p, ignore_errors=True)
            else:
                p.unlink(missing_ok=True)
            log.info("removed orphaned upload %s", p.name)
        except OSError:
            continue
