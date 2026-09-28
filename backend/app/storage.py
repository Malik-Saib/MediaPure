"""Short-lived storage for cleaned files. Originals are never written to disk."""
from __future__ import annotations

import asyncio
import logging
import os
import re
import secrets
import shutil
import time
from pathlib import Path

from .config import get_settings

log = logging.getLogger("aimr.storage")
settings = get_settings()
TOKEN_RE = re.compile(r"^[A-Za-z0-9_-]{32}$")


def ensure_dir() -> Path:
    settings.temp_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    return settings.temp_dir


def ensure_incoming() -> Path:
    """Staging area for uploads still being received.

    A subdirectory, not the download directory: `sweep` skips directories, so a slow
    500 MB upload can never be deleted out from under itself by the janitor.
    """
    d = ensure_dir() / "incoming"
    d.mkdir(parents=True, exist_ok=True, mode=0o700)
    return d


def safe_name(original: str, ext: str, default: str = "image") -> str:
    stem = Path(original or default).stem
    stem = re.sub(r"[^A-Za-z0-9._ -]+", "", stem).strip(" .-_")[:80] or default
    return f"{stem}-clean.{ext}"


def save(data: bytes, download_name: str) -> str:
    """Store cleaned bytes; returns an unguessable token. Name travels in a sidecar file."""
    d = ensure_dir()
    token = secrets.token_urlsafe(24)
    path = d / f"{token}.bin"
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "wb") as fh:
        fh.write(data)
    (d / f"{token}.name").write_text(download_name, encoding="utf-8")
    return token


def save_path(src: Path, download_name: str) -> str:
    """Take ownership of an already-written file. Used for outputs too large to hold in memory."""
    d = ensure_dir()
    token = secrets.token_urlsafe(24)
    dest = d / f"{token}.bin"
    try:
        os.replace(src, dest)          # same filesystem: instant, no copy
    except OSError:
        shutil.move(str(src), str(dest))
    os.chmod(dest, 0o600)
    (d / f"{token}.name").write_text(download_name, encoding="utf-8")
    return token


def resolve(token: str) -> tuple[Path, str] | None:
    if not TOKEN_RE.match(token):
        return None
    d = ensure_dir()
    path = d / f"{token}.bin"
    try:
        age = time.time() - path.stat().st_mtime
    except FileNotFoundError:
        return None
    if age > settings.file_ttl_seconds:
        delete(token)
        return None
    try:
        name = (d / f"{token}.name").read_text(encoding="utf-8")
    except FileNotFoundError:
        name = "image-clean"
    return path, name


def delete(token: str) -> None:
    d = ensure_dir()
    for suffix in (".bin", ".name"):
        try:
            (d / f"{token}{suffix}").unlink()
        except FileNotFoundError:
            pass


def usage() -> dict:
    d = ensure_dir()
    files = [p for p in d.glob("*.bin")]
    staged = [p for p in ensure_incoming().glob("*") if p.is_file()]
    return {"files": len(files), "bytes": sum(p.stat().st_size for p in files if p.exists()),
            "staged_uploads": len(staged),
            "staged_bytes": sum(p.stat().st_size for p in staged if p.exists()),
            "ttl_seconds": settings.file_ttl_seconds}


def sweep() -> int:
    d = ensure_dir()
    now = time.time()
    removed = 0
    for p in d.iterdir():
        try:
            if p.is_dir():
                continue  # "incoming" holds uploads in flight; the video worker owns those
            if now - p.stat().st_mtime > settings.file_ttl_seconds:
                p.unlink()
                removed += p.suffix == ".bin"
        except (FileNotFoundError, PermissionError, OSError):
            continue
    return removed


async def janitor() -> None:
    while True:
        try:
            n = await asyncio.to_thread(sweep)
            if n:
                log.info("janitor removed %d expired files", n)
        except Exception:  # noqa: BLE001
            log.exception("janitor sweep failed")
        await asyncio.sleep(settings.janitor_interval_seconds)
