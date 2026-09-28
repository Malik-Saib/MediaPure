"""Minimal TIFF/EXIF helpers."""
import struct


def orientation_tiff(orientation: int) -> bytes:
    """Build a tiny big-endian TIFF block holding only the Orientation tag.

    Orientation is kept (and nothing else) so phone photos are not displayed
    rotated after cleaning. It carries no identifying information.
    """
    header = b"MM\x00\x2a" + struct.pack(">I", 8)
    ifd = struct.pack(">H", 1)
    ifd += struct.pack(">HHI", 0x0112, 3, 1) + struct.pack(">HH", orientation, 0)
    ifd += struct.pack(">I", 0)
    return header + ifd


def read_orientation(tiff: bytes) -> int | None:
    """Read Orientation (0x0112) from IFD0 of a raw TIFF block."""
    try:
        if tiff[:2] == b"II":
            e = "<"
        elif tiff[:2] == b"MM":
            e = ">"
        else:
            return None
        (off,) = struct.unpack(e + "I", tiff[4:8])
        (n,) = struct.unpack(e + "H", tiff[off:off + 2])
        for i in range(n):
            p = off + 2 + i * 12
            tag, typ, _cnt = struct.unpack(e + "HHI", tiff[p:p + 8])
            if tag == 0x0112 and typ == 3:
                (v,) = struct.unpack(e + "H", tiff[p + 8:p + 10])
                return v if 1 <= v <= 8 else None
    except (struct.error, IndexError):
        return None
    return None
