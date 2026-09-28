"""Locating and running FFmpeg/FFprobe.

Every invocation here is built from a fixed argument list plus paths this service
generated itself. User-supplied text (file names, metadata values) never reaches a
command line, and the input is always a plain local file, so no FFmpeg protocol
handler other than `file` can be reached.
"""
from __future__ import annotations

import json
import logging
import shutil
import subprocess
from functools import lru_cache
from pathlib import Path

from ..config import get_settings
from .errors import UnsupportedVideo, VideoToolsMissing

log = logging.getLogger("aimr.video.tools")
settings = get_settings()

# Quiet and non-interactive. `-nostdin` and `-y` are ffmpeg-only options; ffprobe
# rejects them outright, so the two tools get their own prefixes.
FFMPEG_BASE = ["-hide_banner", "-loglevel", "error", "-nostdin", "-y"]
FFPROBE_BASE = ["-hide_banner", "-loglevel", "error"]


@lru_cache
def _resolve(configured: str, name: str) -> str | None:
    if configured:
        p = Path(configured)
        if p.is_dir():
            for candidate in (p / f"{name}.exe", p / name):
                if candidate.exists():
                    return str(candidate)
            return None
        return str(p) if p.exists() else None
    return shutil.which(name)


def ffmpeg_bin() -> str | None:
    return _resolve(settings.ffmpeg_path, "ffmpeg")


def ffprobe_bin() -> str | None:
    return _resolve(settings.ffprobe_path, "ffprobe")


def available() -> bool:
    return bool(settings.video_enabled and ffmpeg_bin() and ffprobe_bin())


@lru_cache
def version() -> str:
    """First line of `ffmpeg -version`, for the health endpoint and admin panel."""
    exe = ffmpeg_bin()
    if not exe:
        return ""
    try:
        out = subprocess.run([exe, "-version"], capture_output=True, timeout=10, check=False)
        return out.stdout.decode("utf-8", "ignore").splitlines()[0][:120]
    except (OSError, subprocess.SubprocessError, IndexError):
        return ""


def require() -> tuple[str, str]:
    ff, fp = ffmpeg_bin(), ffprobe_bin()
    if not settings.video_enabled:
        raise VideoToolsMissing("Video cleaning is switched off on this server.")
    if not ff or not fp:
        raise VideoToolsMissing(
            "Video cleaning is unavailable because FFmpeg is not installed on this server."
        )
    return ff, fp


def run(exe: str, args: list[str], timeout: float, *, base: list[str] | None = None) -> subprocess.CompletedProcess:
    if base is None:
        base = FFPROBE_BASE if Path(exe).stem.lower().endswith("ffprobe") else FFMPEG_BASE
    try:
        return subprocess.run([exe, *base, *args], capture_output=True, timeout=timeout, check=False,
                              stdin=subprocess.DEVNULL)
    except subprocess.TimeoutExpired as exc:
        raise UnsupportedVideo("This video took too long to process. Try a shorter clip.") from exc
    except OSError as exc:  # binary vanished mid-flight
        raise VideoToolsMissing("FFmpeg could not be started on this server.") from exc


def probe(path: Path) -> dict:
    """Full ffprobe report: format, streams, chapters and every tag attached to them."""
    _, fp = require()
    proc = run(fp, ["-print_format", "json", "-show_format", "-show_streams", "-show_chapters",
                    "-show_error", "-i", str(path)], settings.video_probe_timeout)
    try:
        data = json.loads(proc.stdout.decode("utf-8", "ignore") or "{}")
    except json.JSONDecodeError as exc:
        raise UnsupportedVideo("This file could not be read as a video.") from exc
    if not data or "streams" not in data:
        err = proc.stderr.decode("utf-8", "ignore").strip().splitlines()
        log.info("ffprobe rejected upload: %s", err[-1] if err else "no output")
        raise UnsupportedVideo("This file is damaged or is not a video we can read.")
    return data


def stream_checksum(path: Path, spec: str) -> str | None:
    """MD5 of one stream's packets, copied without decoding.

    Two files whose video streams share a checksum contain the very same compressed
    frames, which is how we prove that cleaning did not touch the picture. Returns
    None when the stream does not exist or FFmpeg refuses to remux it in isolation.
    """
    ff, _ = require()
    proc = run(ff, ["-i", str(path), "-map", spec, "-c", "copy", "-f", "md5", "-"],
               settings.video_clean_timeout)
    if proc.returncode != 0:
        return None
    text = proc.stdout.decode("utf-8", "ignore").strip()
    return text.split("=", 1)[1] if text.startswith("MD5=") else None
