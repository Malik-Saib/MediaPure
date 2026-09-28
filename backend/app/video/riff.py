"""Second-pass scrubber for AVI containers.

AVI keeps authorship in RIFF `INFO` chunks (ISFT software, IART artist, ICOP copyright,
ICRD date and friends). Each one is neutralised by renaming its four-byte identifier to
`JUNK` — the RIFF specification's own "ignore this" chunk — and zeroing the body.
Identifiers are the same length either way, so every offset in the index chunk stays
correct and the file length does not change.

Like the Matroska pass, the file is walked with seeks and copied in chunks, so memory
does not scale with the size of the video.
"""
from __future__ import annotations

import logging
import struct
from pathlib import Path

log = logging.getLogger("aimr.video.riff")

LIST_TYPES_TO_DROP = {b"INFO"}
MAX_DEPTH = 3
COPY_CHUNK = 4 * 1024 * 1024


def _find_lists(fh, start: int, end: int, depth: int) -> list[tuple[int, int, str]] | None:
    """INFO lists to neutralise, as (chunk offset, body length, list type)."""
    found: list[tuple[int, int, str]] = []

    def walk(at: int, stop: int, level: int) -> bool:
        while at + 8 <= stop:
            fh.seek(at)
            head = fh.read(8)
            if len(head) < 8:
                return False
            fourcc = head[:4]
            (size,) = struct.unpack("<I", head[4:8])
            body = at + 8
            if body + size > stop:
                return False
            if fourcc in (b"LIST", b"RIFF"):
                fh.seek(body)
                list_type = fh.read(4)
                if list_type in LIST_TYPES_TO_DROP:
                    found.append((at, size, list_type.decode("latin-1", "ignore")))
                elif level < MAX_DEPTH:
                    if not walk(body + 4, body + size, level + 1):
                        return False
            at = body + size + (size & 1)  # RIFF chunks are word-aligned
        return True

    return found if walk(start, end, depth) else None


def scrub_file(src: Path, dst: Path) -> dict | None:
    stats: dict = {"removed_boxes": 0, "removed_bytes": 0, "scrubbed_fields": 0, "names": []}
    try:
        total = src.stat().st_size
        with src.open("rb") as fh:
            head = fh.read(12)
            if head[:4] != b"RIFF" or head[8:12] != b"AVI ":
                return None
            (riff_size,) = struct.unpack("<I", head[4:8])
            lists = _find_lists(fh, 12, min(total, 8 + riff_size), 0)
            if lists is None:
                log.info("RIFF walk did not complete; leaving the AVI header as FFmpeg wrote it")
                return None

            fh.seek(0)
            with dst.open("wb") as out:
                while True:
                    chunk = fh.read(COPY_CHUNK)
                    if not chunk:
                        break
                    out.write(chunk)

        with dst.open("r+b") as out:
            for offset, size, list_type in lists:
                out.seek(offset)
                out.write(b"JUNK")          # same length, so nothing after it moves
                out.seek(offset + 8)
                out.write(bytes(size))
                stats["removed_boxes"] += 1
                stats["removed_bytes"] += size
                stats["names"].append(list_type)
        return stats
    except (struct.error, IndexError, ValueError, OSError):
        log.warning("RIFF scrub aborted; serving the FFmpeg output as-is", exc_info=True)
        dst.unlink(missing_ok=True)
        return None
