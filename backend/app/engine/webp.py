"""Lossless WebP metadata stripping by rewriting RIFF chunks."""
import struct

from .errors import UnsupportedImage
from .tiff import orientation_tiff, read_orientation

KEEP = {b"VP8 ", b"VP8L", b"VP8X", b"ALPH", b"ANIM", b"ANMF", b"ICCP"}


def chunks(data: bytes):
    if len(data) < 12 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        raise UnsupportedImage("Not a WebP file")
    n = min(len(data), 8 + struct.unpack("<I", data[4:8])[0])
    i = 12
    while i + 8 <= n:
        fourcc = data[i:i + 4]
        (ln,) = struct.unpack("<I", data[i + 4:i + 8])
        if i + 8 + ln > len(data):
            raise UnsupportedImage("Truncated WebP chunk")
        end = i + 8 + ln + (ln & 1)
        yield fourcc, data[i + 8:i + 8 + ln], data[i:min(end, len(data))]
        i = end


def _chunk(fourcc: bytes, body: bytes) -> bytes:
    return fourcc + struct.pack("<I", len(body)) + body + (b"\x00" if len(body) & 1 else b"")


def clean(data: bytes) -> tuple[bytes, dict]:
    body = bytearray()
    removed = 0
    orientation = None
    vp8x_at = None
    for fourcc, payload, raw in chunks(data):
        if fourcc == b"EXIF":
            tiff = payload[6:] if payload.startswith(b"Exif\x00\x00") else payload
            orientation = read_orientation(tiff)
        if fourcc in KEEP:
            if fourcc == b"VP8X":
                vp8x_at = len(body)
            body += raw
        else:
            removed += len(raw)
    kept = None
    if vp8x_at is not None:
        fpos = vp8x_at + 8
        flags = body[fpos] & ~0x0C  # clear EXIF (0x08) and XMP (0x04) flags
        if orientation and orientation != 1:
            flags |= 0x08
            body += _chunk(b"EXIF", orientation_tiff(orientation))
            kept = orientation
        body[fpos] = flags
    out = b"RIFF" + struct.pack("<I", len(body) + 4) + b"WEBP" + bytes(body)
    return out, {"orientation_kept": kept, "removed_bytes": removed}
