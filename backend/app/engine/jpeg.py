"""Lossless JPEG metadata stripping by rewriting marker segments.

Entropy-coded image data is copied byte-for-byte, so decoded pixels are
identical to the original. Only metadata segments are dropped.
"""
from .errors import UnsupportedImage
from .tiff import orientation_tiff, read_orientation

SOI, EOI, SOS = 0xD8, 0xD9, 0xDA
STANDALONE = {0x01, *range(0xD0, 0xD8)}


def segments(data: bytes):
    """Yield (marker, payload, raw). marker None = bytes trailing after EOI."""
    if data[:2] != b"\xff\xd8":
        raise UnsupportedImage("Not a JPEG file")
    i, n = 2, len(data)
    yield SOI, b"", b"\xff\xd8"
    while i < n:
        if data[i] != 0xFF:
            raise UnsupportedImage("Corrupt JPEG marker stream")
        while i < n and data[i] == 0xFF:
            i += 1
        if i >= n:
            break
        m = data[i]
        i += 1
        if m == EOI:
            yield EOI, b"", b"\xff\xd9"
            if i < n:
                yield None, data[i:], b""
            return
        if m in STANDALONE:
            yield m, b"", bytes([0xFF, m])
            continue
        if i + 2 > n:
            raise UnsupportedImage("Truncated JPEG segment")
        ln = int.from_bytes(data[i:i + 2], "big")
        if ln < 2 or i + ln > n:
            raise UnsupportedImage("Invalid JPEG segment length")
        payload = data[i + 2:i + ln]
        start = i - 2
        i += ln
        if m == SOS:
            j = i
            while j < n - 1:
                if data[j] == 0xFF:
                    nb = data[j + 1]
                    if nb == 0x00 or 0xD0 <= nb <= 0xD7:
                        j += 2
                        continue
                    if nb == 0xFF:
                        j += 1
                        continue
                    break
                j += 1
            else:
                j = n
            yield SOS, payload, data[start:j]
            i = j
            continue
        yield m, payload, data[start:i]


def _keep(m: int, payload: bytes) -> bool:
    if m == 0xE0:  # APP0: keep JFIF header, drop JFXX thumbnails
        return payload.startswith(b"JFIF\x00")
    if m == 0xE2:  # APP2: keep ICC colour profile only (drops MPF, FlashPix)
        return payload.startswith(b"ICC_PROFILE\x00")
    if m == 0xEE:  # APP14 Adobe: colour transform flag, needed for correct colours
        return payload.startswith(b"Adobe")
    if 0xE1 <= m <= 0xEF:  # EXIF, XMP, IPTC/Photoshop, C2PA/JUMBF (APP11), vendor data
        return False
    if m == 0xFE:  # COM comments
        return False
    return True


def clean(data: bytes) -> tuple[bytes, dict]:
    out = bytearray()
    orientation = None
    removed = 0
    for m, payload, raw in segments(data):
        if m is None:
            removed += len(payload)  # appended data (e.g. hidden files, secondary images)
            continue
        if m in (SOI, EOI, SOS) or m in STANDALONE:
            out += raw
            continue
        if m == 0xE1 and payload.startswith(b"Exif\x00\x00") and orientation is None:
            orientation = read_orientation(payload[6:])
        if _keep(m, payload):
            out += raw
        else:
            removed += len(raw)
    kept = None
    if orientation and orientation != 1:
        seg_payload = b"Exif\x00\x00" + orientation_tiff(orientation)
        seg = b"\xff\xe1" + (len(seg_payload) + 2).to_bytes(2, "big") + seg_payload
        pos = 2
        if out[2:4] == b"\xff\xe0":
            pos = 4 + int.from_bytes(out[4:6], "big")
        out[pos:pos] = seg
        kept = orientation
    return bytes(out), {"orientation_kept": kept, "removed_bytes": removed}
