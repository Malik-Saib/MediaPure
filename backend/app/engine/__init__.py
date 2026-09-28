"""Public engine API: inspect an image, clean it losslessly, verify the result."""
from __future__ import annotations

import hashlib
import io
import json
import shutil
import subprocess
import time
import logging
import warnings

from PIL import Image

from . import jpeg, png, webp
from .errors import UnsupportedImage
from .inspect import Report, categorise, detect_format, inspect

log = logging.getLogger("aimr.engine")

__all__ = ["UnsupportedImage", "detect_format", "inspect", "clean_image", "decode_info", "pixel_digest"]

CLEANERS = {"jpeg": jpeg.clean, "png": png.clean, "webp": webp.clean}
MIME = {"jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp"}
EXT = {"jpeg": "jpg", "png": "png", "webp": "webp"}


def decode_info(data: bytes, max_pixels: int) -> dict:
    """Fully decode the image to validate it (and guard against decompression bombs)."""
    Image.MAX_IMAGE_PIXELS = max_pixels
    with warnings.catch_warnings():
        warnings.simplefilter("error", Image.DecompressionBombWarning)
        try:
            with Image.open(io.BytesIO(data)) as im:
                if im.width * im.height > max_pixels:
                    raise UnsupportedImage("Image dimensions are too large to process safely.")
                im.load()
                return {"width": im.width, "height": im.height, "mode": im.mode,
                        "frames": getattr(im, "n_frames", 1)}
        except (Image.DecompressionBombError, Image.DecompressionBombWarning) as exc:
            raise UnsupportedImage("Image dimensions are too large to process safely.") from exc
        except UnsupportedImage:
            raise
        except Exception as exc:  # noqa: BLE001
            raise UnsupportedImage("The file is damaged or is not a valid image.") from exc


def pixel_digest(data: bytes) -> str:
    """Hash of the decoded pixels of every frame — equal digests mean identical pixels."""
    h = hashlib.sha256()
    with Image.open(io.BytesIO(data)) as im:
        for i in range(getattr(im, "n_frames", 1)):
            im.seek(i)
            h.update(im.mode.encode())
            h.update(f"{im.size}".encode())
            h.update(im.tobytes())
    return h.hexdigest()


# ---------------------------------------------------------------- ExifTool (optional)
EXIFTOOL_SKIP_GROUPS = {"ExifTool", "System", "File", "Composite", "JFIF", "ICC_Profile", "ICC-header",
                        "ICC-view", "ICC-meas", "PNG", "RIFF", "VP8", "VP8L", "VP8X", "PNG-pHYs",
                        "PNG-gAMA", "PNG-cHRM", "PNG-sRGB", "APP14", "Adobe"}


def exiftool_available() -> bool:
    return shutil.which("exiftool") is not None


# ExifTool reports C2PA manifests through its JPEG 2000 box parser; show users what the data actually is.
EXIFTOOL_GROUP_LABELS = {"Jpeg2000": "C2PA", "JUMBF": "C2PA", "CBOR": "C2PA", "XMP-x": "XMP", "PNG-pHYs": "PNG"}


def exiftool_fields(data: bytes, timeout: float = 15.0) -> list[dict] | None:
    """Richer field extraction via ExifTool when installed. Returns None on any failure."""
    if not exiftool_available():
        return None
    try:
        proc = subprocess.run(["exiftool", "-j", "-G1", "-a", "-s", "-api", "LargeFileSupport=1", "-"],
                              input=data, capture_output=True, timeout=timeout, check=False)
        rows = json.loads(proc.stdout.decode("utf-8", "ignore") or "[]")
        if not rows or not isinstance(rows, list) or not isinstance(rows[0], dict):
            return None
        fields = []
        for key, val in rows[0].items():
            if ":" not in key:
                continue
            group, name = key.split(":", 1)
            if group in EXIFTOOL_SKIP_GROUPS or group.startswith("ICC") or name in ("Orientation",):
                continue
            text = str(val)[:180]
            group = EXIFTOOL_GROUP_LABELS.get(group, group)
            fields.append({"group": group, "name": name, "value": text, "category": categorise(name, text)})
        return fields
    except Exception:  # noqa: BLE001 - enrichment is optional and must never fail the request
        log.warning("exiftool enrichment failed; falling back to the built-in parsers", exc_info=True)
        return None


def clean_image(data: bytes, *, max_pixels: int, use_exiftool: bool = False) -> dict:
    """Validate, inspect, strip and verify. Returns cleaned bytes plus before/after reports."""
    started = time.perf_counter()
    fmt = detect_format(data)
    info = decode_info(data, max_pixels)
    before = inspect(data, fmt)
    before.width, before.height, before.mode, before.frames = (info["width"], info["height"],
                                                               info["mode"], info["frames"])
    if use_exiftool:
        # Belt and braces: cleaning must succeed whether or not ExifTool is installed or healthy.
        try:
            rich = exiftool_fields(data)
            if rich is not None and len(rich) > len(before.fields):
                from .inspect import Field
                before.fields = [Field(**f) for f in rich]
        except Exception:  # noqa: BLE001
            log.warning("could not apply exiftool fields; using the built-in report", exc_info=True)
    cleaned, meta = CLEANERS[fmt](data)
    after = inspect(cleaned, fmt)
    identical = pixel_digest(data) == pixel_digest(cleaned)
    if not identical:  # should never happen; refuse to hand out a damaged file
        raise UnsupportedImage("Verification failed: cleaning would change the image. Nothing was modified.")
    after.width, after.height, after.mode, after.frames = before.width, before.height, before.mode, before.frames
    return {
        "format": fmt,
        "mime": MIME[fmt],
        "ext": EXT[fmt],
        "cleaned": cleaned,
        "before": before.as_dict(),
        "after": after.as_dict(),
        "original_size": len(data),
        "cleaned_size": len(cleaned),
        "pixels_identical": identical,
        "orientation_kept": meta["orientation_kept"],
        "duration_ms": round((time.perf_counter() - started) * 1000),
    }


def inspect_only(data: bytes, *, max_pixels: int) -> Report:
    fmt = detect_format(data)
    info = decode_info(data, max_pixels)
    r = inspect(data, fmt)
    r.width, r.height, r.mode, r.frames = info["width"], info["height"], info["mode"], info["frames"]
    return r
