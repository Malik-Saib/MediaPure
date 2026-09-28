"""Second-pass scrubber for MP4/MOV/M4V containers.

`ffmpeg -map_metadata -1` clears tag dictionaries, but an ISOBMFF file keeps identity in
places that are not tags at all:

  * `hdlr` handler names, e.g. "ISO Media file produced by Google Inc." or "Apple Video
    Media Handler" — a reliable fingerprint of the recording device.
  * `uuid` boxes holding XMP packets and C2PA/JUMBF manifests, which FFmpeg copies
    through untouched on some inputs.
  * Creation and modification timestamps in `mvhd`, `tkhd` and `mdhd`, which are header
    fields rather than metadata and survive every remux.
  * The four-byte `vendor` field in every sample description, where FFmpeg writes "FFMP"
    and cameras write their own code ("appl", "GoPr", "SONY").
  * Leftover `udta`/`meta` islands inside individual tracks.

Only the small boxes are ever held in memory: `mdat` holds the media and is copied from
the source in chunks, so peak memory is the size of `moov` — a few megabytes even for a
long 4K clip — rather than the size of the file.

Removing boxes moves `mdat`, so every chunk offset in `stco`/`co64` is rewritten by the
same delta. The result is checked by the caller against the original's stream checksums;
if anything here were wrong that check fails and the un-scrubbed FFmpeg output is served
instead. Nothing in this module re-encodes a single frame.
"""
from __future__ import annotations

import logging
import struct
from pathlib import Path

log = logging.getLogger("aimr.video.isobmff")

# Boxes whose children we walk into. `stsd` is deliberately absent: it holds codec
# configuration that must survive byte for byte, apart from the vendor field.
CONTAINERS = {b"moov", b"trak", b"mdia", b"minf", b"stbl", b"edts", b"dinf", b"mvex", b"udta"}

# Boxes removed wholesale. Every one of these is optional for playback.
DROP = {b"udta", b"meta", b"uuid", b"free", b"skip", b"ilst", b"loci", b"SDLN", b"pnot"}

# Presence of any of these means a layout this scrubber will not risk rewriting.
BAIL = {b"moof", b"sidx", b"senc", b"saio", b"saiz", b"pssh", b"mfra"}

MAX_DEPTH = 8
# Metadata boxes larger than this are pathological; refuse rather than pull them into memory.
MAX_HEADER_BYTES = 256 * 1024 * 1024
COPY_CHUNK = 4 * 1024 * 1024


class Box:
    __slots__ = ("type", "start", "size", "header_len", "payload", "children")

    def __init__(self, typ: bytes, start: int, size: int, header_len: int):
        self.type = typ
        self.start = start
        self.size = size
        self.header_len = header_len
        self.payload: bytes | None = None
        self.children: list[Box] | None = None


# ---------------------------------------------------------------- parsing
def _read_header(fh, at: int, limit: int) -> tuple[bytes, int, int] | None:
    """(type, total size, header length) for the box starting at `at`."""
    fh.seek(at)
    head = fh.read(8)
    if len(head) < 8:
        return None
    (size,) = struct.unpack(">I", head[:4])
    typ = head[4:8]
    header_len = 8
    if size == 1:
        ext = fh.read(8)
        if len(ext) < 8:
            return None
        (size,) = struct.unpack(">Q", ext)
        header_len = 16
    elif size == 0:
        size = limit - at
    if size < header_len or at + size > limit:
        return None
    return typ, size, header_len


def _top_level(fh, total: int) -> list[Box] | None:
    boxes: list[Box] = []
    at = 0
    while at < total:
        got = _read_header(fh, at, total)
        if not got:
            return None
        typ, size, header_len = got
        if typ in BAIL:
            return None
        boxes.append(Box(typ, at, size, header_len))
        at += size
    return boxes if at == total else None


def _parse_children(data: bytes, start: int, end: int, base: int, depth: int) -> list[Box] | None:
    """Parse boxes inside an already-loaded buffer. `base` maps buffer offsets to file offsets."""
    boxes: list[Box] = []
    i = start
    while i + 8 <= end:
        (size,) = struct.unpack_from(">I", data, i)
        typ = data[i + 4:i + 8]
        header_len = 8
        if size == 1:
            if i + 16 > end:
                return None
            (size,) = struct.unpack_from(">Q", data, i + 8)
            header_len = 16
        elif size == 0:
            size = end - i
        if size < header_len or i + size > end:
            return None
        if typ in BAIL:
            return None
        box = Box(typ, base + i, size, header_len)
        if typ in CONTAINERS and depth < MAX_DEPTH:
            kids = _parse_children(data, i + header_len, i + size, base, depth + 1)
            if kids is None:
                return None
            box.children = kids
        else:
            box.payload = data[i + header_len:i + size]
        boxes.append(box)
        i += size
    return boxes if i == end else None


# ---------------------------------------------------------------- rewriting
def _wrap(typ: bytes, body: bytes) -> bytes:
    size = len(body) + 8
    if size > 0xFFFFFFFF:
        return struct.pack(">I", 1) + typ + struct.pack(">Q", size + 8) + body
    return struct.pack(">I", size) + typ + body


def _zero_times(payload: bytes) -> tuple[bytes, int]:
    """Blank creation/modification time in a full box header. Length never changes."""
    if len(payload) < 12:
        return payload, 0
    width = 8 if payload[0] == 1 else 4
    if len(payload) < 4 + width * 2:
        return payload, 0
    if not any(payload[4:4 + width * 2]):
        return payload, 0
    return payload[:4] + bytes(width * 2) + payload[4 + width * 2:], 1


def _blank_handler(payload: bytes) -> tuple[bytes, int]:
    """Keep the handler box (playback needs its type) but drop its human-readable name.

    Layout: version+flags(4) pre_defined(4) handler_type(4) reserved(12) name(...)
    """
    if len(payload) <= 24 or not any(payload[24:]):
        return payload, 0
    return payload[:24] + bytes(1), 1


def _blank_vendors(payload: bytes) -> tuple[bytes, int]:
    """Zero the `vendor` field of every entry in a sample description table.

    Layout of `stsd`: version+flags(4) entry_count(4) then one box per entry. Each entry
    begins with the SampleEntry header — reserved(6) data_reference_index(2) — followed by
    version(2) revision(2) vendor(4) in QuickTime, which ISO defines as zeroed reserved
    space. Writing zeros there is correct under both readings and, because the field keeps
    its length, no offset anywhere in the file moves.
    """
    if len(payload) < 8:
        return payload, 0
    (count,) = struct.unpack_from(">I", payload, 4)
    if count > 64:
        return payload, 0
    out = bytearray(payload)
    i, n, touched = 8, len(out), 0
    for _ in range(count):
        if i + 8 > n:
            break
        (size,) = struct.unpack_from(">I", out, i)
        if size < 8 or i + size > n:
            break
        body = i + 8
        if size >= 24 and any(out[body + 12:body + 16]):
            out[body + 12:body + 16] = bytes(4)
            touched += 1
        i += size
    return (bytes(out), touched) if touched else (payload, 0)


def _rebuild(boxes: list[Box], stats: dict) -> bytes:
    out = bytearray()
    for b in boxes:
        if b.type in DROP:
            stats["removed_boxes"] += 1
            stats["removed_bytes"] += b.size
            stats["names"].append(b.type.decode("latin-1", "ignore"))
            continue
        if b.children is not None:
            body = _rebuild(b.children, stats)
            if not body and b.type in (b"moov", b"trak", b"mdia", b"minf", b"stbl"):
                continue
            out += _wrap(b.type, body)
            continue
        payload = b.payload or b""
        if b.type == b"hdlr":
            payload, n = _blank_handler(payload)
        elif b.type == b"stsd":
            payload, n = _blank_vendors(payload)
        elif b.type in (b"mvhd", b"tkhd", b"mdhd"):
            payload, n = _zero_times(payload)
        else:
            n = 0
        stats["scrubbed_fields"] += n
        out += _wrap(b.type, payload)
    return bytes(out)


def _shift_chunk_offsets(data: bytearray, delta: int) -> int:
    """Apply one delta to every `stco`/`co64` entry. Sizes are untouched."""
    patched = 0
    for typ, width, fmt in ((b"stco", 4, ">I"), (b"co64", 8, ">Q")):
        i = 0
        while True:
            i = data.find(typ, i)
            if i < 0:
                break
            box_start = i - 4
            if box_start < 0:
                i += 4
                continue
            (size,) = struct.unpack_from(">I", data, box_start)
            body = box_start + 8
            if size < 16 or box_start + size > len(data):
                i += 4
                continue
            (count,) = struct.unpack_from(">I", data, body + 4)
            if body + 8 + count * width != box_start + size:
                i += 4  # four bytes that merely happen to spell stco/co64
                continue
            for k in range(count):
                at = body + 8 + k * width
                (value,) = struct.unpack_from(fmt, data, at)
                new = value + delta
                if new < 0 or (width == 4 and new > 0xFFFFFFFF):
                    raise ValueError("chunk offset out of range after scrubbing")
                struct.pack_into(fmt, data, at, new)
            patched += count
            i = box_start + size
    return patched


# ---------------------------------------------------------------- entry point
def scrub_file(src: Path, dst: Path) -> dict | None:
    """Write a scrubbed copy of `src` to `dst`. Returns stats, or None if it is not safe."""
    stats: dict = {"removed_boxes": 0, "removed_bytes": 0, "scrubbed_fields": 0, "names": []}
    try:
        total = src.stat().st_size
        with src.open("rb") as fh:
            boxes = _top_level(fh, total)
            if not boxes or not any(b.type == b"moov" for b in boxes):
                return None
            if sum(b.size for b in boxes if b.type != b"mdat") > MAX_HEADER_BYTES:
                log.info("metadata boxes are implausibly large; skipping the deep scrub")
                return None

            # Load everything except the media itself, and rebuild it.
            rebuilt: list[tuple[Box, bytes | None]] = []
            for b in boxes:
                if b.type == b"mdat":
                    rebuilt.append((b, None))
                    continue
                if b.type in DROP:
                    stats["removed_boxes"] += 1
                    stats["removed_bytes"] += b.size
                    stats["names"].append(b.type.decode("latin-1", "ignore"))
                    continue
                fh.seek(b.start)
                raw = fh.read(b.size)
                if len(raw) != b.size:
                    return None
                if b.type in CONTAINERS:
                    kids = _parse_children(raw, b.header_len, b.size, b.start, 1)
                    if kids is None:
                        return None
                    rebuilt.append((b, _wrap(b.type, _rebuild(kids, stats))))
                else:
                    rebuilt.append((b, raw))

            # Where does the media land now? Every mdat must move by the same amount.
            deltas: set[int] = set()
            cursor = 0
            for b, data in rebuilt:
                if data is None:
                    deltas.add(cursor - b.start)
                    cursor += b.size
                else:
                    cursor += len(data)
            if len(deltas) > 1:
                log.info("mdat boxes would move by differing amounts; skipping the deep scrub")
                return None
            delta = deltas.pop() if deltas else 0

            if delta:
                patched = 0
                for idx, (b, data) in enumerate(rebuilt):
                    if data is not None and b.type == b"moov":
                        buf = bytearray(data)
                        patched += _shift_chunk_offsets(buf, delta)
                        rebuilt[idx] = (b, bytes(buf))
                stats["patched_offsets"] = patched

            with dst.open("wb") as out:
                for b, data in rebuilt:
                    if data is not None:
                        out.write(data)
                        continue
                    fh.seek(b.start)
                    left = b.size
                    while left > 0:
                        chunk = fh.read(min(COPY_CHUNK, left))
                        if not chunk:
                            raise ValueError("source ended inside mdat")
                        out.write(chunk)
                        left -= len(chunk)
        return stats
    except (struct.error, ValueError, IndexError, MemoryError, OSError):
        log.warning("ISOBMFF scrub aborted; serving the FFmpeg output as-is", exc_info=True)
        dst.unlink(missing_ok=True)
        return None
