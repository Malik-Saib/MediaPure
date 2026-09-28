"""Second-pass scrubber for Matroska and WebM containers.

FFmpeg clears the Tags element and never copies attachments unless asked, but the Segment
Info block still names the muxer and carries a wall-clock date. Those live in fixed-size
elements, so they are blanked in place: not one byte of the file moves, which means Cues
and SeekHead positions stay valid by construction.

The file is walked with seeks rather than read into memory, so a 500 MB clip costs the
same as a 5 MB one. Only the byte ranges that need zeroing are ever written.
"""
from __future__ import annotations

import logging
import struct
from pathlib import Path

log = logging.getLogger("aimr.video.ebml")

SEGMENT = 0x18538067
INFO = 0x1549A966
MASTERS = {SEGMENT, INFO}

# Segment Info children that identify the muxer, the machine or the moment.
BLANK = {
    0x4D80: "MuxingApp",
    0x5741: "WritingApp",
    0x7BA9: "Title",
    0x4461: "DateUTC",
}
MAX_DEPTH = 4
COPY_CHUNK = 4 * 1024 * 1024


def _read_vint(fh, at: int, keep_marker: bool) -> tuple[int, int] | None:
    """Return (value, bytes consumed). Element IDs keep their marker bit; sizes drop it."""
    fh.seek(at)
    first_byte = fh.read(1)
    if not first_byte:
        return None
    first = first_byte[0]
    if first == 0:
        return None
    length = 8 - first.bit_length() + 1
    if length < 1 or length > 8:
        return None
    rest = fh.read(length - 1) if length > 1 else b""
    if len(rest) != length - 1:
        return None
    raw = first_byte + rest
    if keep_marker:
        return int.from_bytes(raw, "big"), length
    value = first & ((1 << (8 - length)) - 1)
    for byte in rest:
        value = (value << 8) | byte
    if value == (1 << (7 * length)) - 1:  # "unknown length" sentinel
        return None
    return value, length


def _find_ranges(fh, total: int) -> list[tuple[int, int, str]] | None:
    """Byte ranges to zero, as (offset, length, element name)."""
    found: list[tuple[int, int, str]] = []

    def walk(start: int, end: int, depth: int) -> bool:
        at = start
        while at < end:
            got_id = _read_vint(fh, at, keep_marker=True)
            if not got_id:
                return False
            eid, id_len = got_id
            got_size = _read_vint(fh, at + id_len, keep_marker=False)
            if not got_size:
                return False
            size, size_len = got_size
            body = at + id_len + size_len
            if body + size > end:
                return False
            if eid in MASTERS and depth < MAX_DEPTH:
                if not walk(body, body + size, depth + 1):
                    return False
            elif eid in BLANK and size:
                fh.seek(body)
                if any(fh.read(size)):
                    found.append((body, size, BLANK[eid]))
            at = body + size
        return True

    return found if walk(0, total, 0) else None


def scrub_file(src: Path, dst: Path) -> dict | None:
    """Copy `src` to `dst`, zeroing the identifying Segment Info elements as it goes."""
    stats: dict = {"removed_boxes": 0, "removed_bytes": 0, "scrubbed_fields": 0, "names": []}
    try:
        with src.open("rb") as fh:
            if fh.read(4) != b"\x1aE\xdf\xa3":
                return None
            total = src.stat().st_size
            ranges = _find_ranges(fh, total)
            if ranges is None:
                log.info("EBML walk did not complete; leaving the Matroska header as FFmpeg wrote it")
                return None

            fh.seek(0)
            with dst.open("wb") as out:
                while True:
                    chunk = fh.read(COPY_CHUNK)
                    if not chunk:
                        break
                    out.write(chunk)
            for offset, length, name in ranges:
                stats["scrubbed_fields"] += 1
                stats["names"].append(name)
            with dst.open("r+b") as out:
                for offset, length, _ in ranges:
                    out.seek(offset)
                    out.write(bytes(length))
        return stats
    except (struct.error, IndexError, ValueError, OSError):
        log.warning("EBML scrub aborted; serving the FFmpeg output as-is", exc_info=True)
        dst.unlink(missing_ok=True)
        return None
