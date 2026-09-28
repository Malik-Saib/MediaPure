"""Video metadata removal.

Public surface kept deliberately small, mirroring `app.engine` for images:

    available()                 - is FFmpeg reachable on this host?
    sniff(path, filename)       - which container is this, by its bytes?
    scan_video(path, container) - read-only metadata report
    clean_video(path, workdir, container) - cleaned file plus before/after reports
"""
from .clean import clean_video, purge, scan_video, sniff
from .errors import UnsupportedVideo, VideoProcessingError, VideoToolsMissing
from .probe import CONTAINERS
from .tools import available, ffmpeg_bin, ffprobe_bin, version

__all__ = [
    "CONTAINERS",
    "UnsupportedVideo",
    "VideoProcessingError",
    "VideoToolsMissing",
    "available",
    "clean_video",
    "ffmpeg_bin",
    "ffprobe_bin",
    "purge",
    "scan_video",
    "sniff",
    "version",
]
