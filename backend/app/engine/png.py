"""Lossless PNG metadata stripping by dropping ancillary metadata chunks."""
import struct
import zlib

from .errors import UnsupportedImage
from .tiff import orientation_tiff, read_orientation

SIG = b"\x89PNG\r\n\x1a\n"
# Chunks that affect how pixels render, plus APNG animation. Other ancillary chunks go.
KEEP = {b"IHDR", b"PLTE", b"IDAT", b"IEND", b"tRNS", b"gAMA", b"cHRM", b"sRGB",
        b"iCCP", b"sBIT", b"bKGD", b"pHYs", b"cICP", b"mDCv", b"cLLi",
        b"acTL", b"fcTL", b"fdAT"}


def chunks(data: bytes):
    if not data.startswith(SIG):
        raise UnsupportedImage("Not a PNG file")
    i, n = 8, len(data)
    while i + 8 <= n:
        ln, typ = struct.unpack(">I4s", data[i:i + 8])
        end = i + 12 + ln
        if end > n:
            raise UnsupportedImage("Truncated PNG chunk")
        yield typ, data[i + 8:i + 8 + ln], data[i:end]
        i = end
        if typ == b"IEND":
            return


def _chunk(typ: bytes, body: bytes) -> bytes:
    crc = zlib.crc32(typ + body) & 0xFFFFFFFF
    return struct.pack(">I", len(body)) + typ + body + struct.pack(">I", crc)


def clean(data: bytes) -> tuple[bytes, dict]:
    out = bytearray(SIG)
    orientation = None
    removed = 0
    total = 8
    for typ, body, raw in chunks(data):
        total += len(raw)
        if typ == b"eXIf":
            orientation = read_orientation(body)
        critical = typ[:1].isupper()
        if typ in KEEP or critical:
            out += raw
        else:
            removed += len(raw)
    removed += max(0, len(data) - total)  # bytes appended after IEND
    kept = None
    if orientation and orientation != 1:
        out[33:33] = _chunk(b"eXIf", orientation_tiff(orientation))  # right after IHDR
        kept = orientation
    return bytes(out), {"orientation_kept": kept, "removed_bytes": removed}
