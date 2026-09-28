"""Read every metadata block we know how to find and turn it into a report.

The report is what users see in the scanner: individual fields, the category
each one falls into, and a privacy score derived from what was found.
"""
from __future__ import annotations

import re
import struct
import zlib
from dataclasses import dataclass, field

from PIL import ExifTags, Image, TiffImagePlugin

from . import jpeg, png, webp
from .errors import UnsupportedImage

MAX_FIELDS = 400
MAX_VALUE = 180

AI_MARKERS = re.compile(
    rb"(trainedAlgorithmicMedia|compositeWithTrainedAlgorithmicMedia|openai|chatgpt|dall[-. ]?e|"
    rb"midjourney|stable ?diffusion|comfyui|automatic1111|invokeai|novelai|firefly|imagen|gemini|"
    rb"leonardo\.ai|ideogram|flux|sdxl|negative prompt|sampler:|cfg scale)",
    re.I,
)
AI_KEYS = {"parameters", "prompt", "workflow", "negative_prompt", "sd-metadata", "invokeai_metadata",
           "dream", "generation_data", "comfyui", "aigc", "ai_metadata"}

# weight subtracted from a perfect score when a category is present
WEIGHTS = {"location": 35, "creator": 12, "device": 12, "ai": 12, "credentials": 10,
           "software": 6, "timestamps": 6, "description": 5, "hidden": 4, "technical": 2}

CATEGORY_LABELS = {
    "location": "Location data",
    "device": "Camera & device details",
    "software": "Software information",
    "creator": "Creator & copyright",
    "timestamps": "Dates & timestamps",
    "ai": "AI generation data",
    "credentials": "Content Credentials (C2PA)",
    "description": "Titles, captions & comments",
    "hidden": "Hidden & vendor data",
    "technical": "Technical EXIF properties",
}

IPTC_NAMES = {5: "ObjectName", 25: "Keywords", 40: "SpecialInstructions", 55: "DateCreated",
              60: "TimeCreated", 80: "By-line", 85: "By-lineTitle", 90: "City", 92: "Sub-location",
              95: "Province-State", 101: "Country", 105: "Headline", 110: "Credit", 115: "Source",
              116: "CopyrightNotice", 118: "Contact", 120: "Caption-Abstract", 122: "Writer-Editor"}


@dataclass
class Field:
    group: str
    name: str
    value: str
    category: str

    def as_dict(self):
        return {"group": self.group, "name": self.name, "value": self.value, "category": self.category}


@dataclass
class Report:
    format: str
    width: int = 0
    height: int = 0
    mode: str = ""
    frames: int = 1
    fields: list[Field] = field(default_factory=list)
    preserved: list[str] = field(default_factory=list)
    blocks: list[str] = field(default_factory=list)

    def add(self, group: str, name: str, value, category: str | None = None):
        if len(self.fields) >= MAX_FIELDS:
            return
        text = _stringify(value)
        cat = category or categorise(name, text)
        if cat != "ai" and AI_MARKERS.search(text.encode("utf-8", "ignore")):
            cat = "ai"
        self.fields.append(Field(group, name, text, cat))

    @property
    def categories(self) -> dict[str, int]:
        counts: dict[str, int] = {}
        for f in self.fields:
            counts[f.category] = counts.get(f.category, 0) + 1
        return counts

    @property
    def privacy_score(self) -> int:
        score = 100 - sum(WEIGHTS.get(c, 2) for c in self.categories)
        return max(5, score) if self.fields else 100

    def as_dict(self):
        cats = self.categories
        return {
            "format": self.format,
            "width": self.width,
            "height": self.height,
            "mode": self.mode,
            "frames": self.frames,
            "field_count": len(self.fields),
            "privacy_score": self.privacy_score,
            "categories": [
                {"key": k, "label": CATEGORY_LABELS.get(k, k), "count": cats[k]}
                for k in sorted(cats, key=lambda c: -WEIGHTS.get(c, 0))
            ],
            "fields": [f.as_dict() for f in self.fields],
            "preserved": self.preserved,
            "blocks": self.blocks,
        }


def categorise(name: str, value: str = "") -> str:
    n = name.lower().replace(" ", "").split(":")[-1]
    if n in AI_KEYS or "prompt" in n or "digitalsourcetype" in n:
        return "ai"
    if n.startswith("gps") or n in {"city", "country", "province-state", "sub-location", "location",
                                    "state", "countrycode", "gpsinfo"}:
        return "location"
    if any(k in n for k in ("c2pa", "jumbf", "contentcredential", "manifest")):
        return "credentials"
    if any(k in n for k in ("artist", "copyright", "author", "creator", "by-line", "rights", "owner",
                            "credit", "contact", "writer", "source", "usageterms")) and "tool" not in n:
        return "creator"
    if any(k in n for k in ("software", "creatortool", "hostcomputer", "processing", "history",
                            "toolkit", "producer", "agent", "generator")):
        return "software"
    if any(k in n for k in ("make", "model", "lens", "serial", "bodyserial", "makernote", "fnumber",
                            "exposure", "iso", "focal", "flash", "aperture", "shutter", "whitebalance",
                            "meteringmode", "brightness", "subjectdistance", "sensing", "scenetype",
                            "gaincontrol", "uniqueid", "imageuniqueid", "device")):
        return "device"
    if "date" in n or "time" in n or n in {"offsettime", "subsectime"}:
        return "timestamps"
    if any(k in n for k in ("description", "comment", "title", "caption", "keyword", "subject",
                            "headline", "label", "rating", "instruction", "objectname")):
        return "description"
    return "technical"


def _stringify(v) -> str:
    if isinstance(v, bytes):
        v = v.rstrip(b"\x00")
        if not v:
            return ""
        try:
            s = v.decode("utf-8")
            if sum(ch.isprintable() for ch in s) / max(1, len(s)) > 0.9:
                return s[:MAX_VALUE]
        except UnicodeDecodeError:
            pass
        if v.startswith(b"UNICODE\x00") or v.startswith(b"ASCII\x00\x00\x00"):
            return _stringify(v[8:].replace(b"\x00", b""))
        return f"Binary data ({len(v):,} bytes)"
    if isinstance(v, TiffImagePlugin.IFDRational):
        try:
            return f"{float(v):g}"
        except ZeroDivisionError:
            return "0"
    if isinstance(v, (tuple, list)):
        if len(v) == 3 and all(isinstance(x, TiffImagePlugin.IFDRational) for x in v):
            d, m, s = (float(x) if x.denominator else 0.0 for x in v)
            return f"{d:g}\u00b0 {m:g}' {s:.2f}\""
        return ", ".join(_stringify(x) for x in v)[:MAX_VALUE]
    s = str(v).strip()
    return s if len(s) <= MAX_VALUE else s[:MAX_VALUE - 1] + "\u2026"


# ---------------------------------------------------------------- EXIF
EXIF_SKIP = {0x8769, 0x8825, 0xA005, 0x0201, 0x0202}  # pointers & thumbnail offsets


def read_exif(report: Report, tiff: bytes, group: str = "EXIF"):
    exif = Image.Exif()
    try:
        exif.load(tiff)
    except Exception:  # noqa: BLE001 - malformed EXIF is common; report as opaque block
        report.add(group, "EXIF block", f"Unreadable EXIF ({len(tiff):,} bytes)", "hidden")
        return
    report.blocks.append("EXIF")

    def emit(tags: dict, names: dict, grp: str):
        for tag, val in tags.items():
            if tag in EXIF_SKIP:
                continue
            name = names.get(tag, f"Tag 0x{tag:04X}")
            if tag == 0x0112:  # orientation is preserved, not a privacy concern
                if "Orientation" not in report.preserved:
                    report.preserved.append("Orientation")
                continue
            if tag == 0x927C:
                report.add(grp, "MakerNote", f"Vendor data ({len(val) if hasattr(val, '__len__') else 0:,} bytes)",
                           "device")
                continue
            if name.startswith("XP") and isinstance(val, (bytes, tuple)):
                raw = bytes(val) if isinstance(val, tuple) else val
                val = raw.decode("utf-16-le", "ignore").rstrip("\x00")
            report.add(grp, name, val)

    emit(dict(exif), ExifTags.TAGS, group)
    for ifd, grp in ((0x8769, group), (0x8825, "GPS")):
        try:
            sub = exif.get_ifd(ifd)
        except Exception:  # noqa: BLE001
            continue
        if sub:
            emit(sub, ExifTags.GPSTAGS if ifd == 0x8825 else ExifTags.TAGS, grp)
            if ifd == 0x8825:
                report.blocks.append("GPS")
    if getattr(exif, "_ifds", None) is not None:
        try:
            thumb = exif.get_ifd(ExifTags.IFD.IFD1)
            if thumb:
                report.add(group, "Embedded thumbnail", "Preview copy of the original image", "hidden")
        except Exception:  # noqa: BLE001
            pass


# ---------------------------------------------------------------- XMP
XMP_ATTR = re.compile(r'\b([A-Za-z][\w-]*):([A-Za-z][\w-]*)="([^"]*)"')
XMP_ELEM = re.compile(r"<([A-Za-z][\w-]*):([A-Za-z][\w-]*)(?:\s[^>]*)?>([^<]+)</\1:\2>")
XMP_SKIP_NS = {"xmlns", "rdf", "x", "xml", "stEvt", "stRef", "xmpG"}


def read_xmp(report: Report, xml: bytes):
    report.blocks.append("XMP")
    text = xml.decode("utf-8", "ignore")
    seen = set()
    for ns, key, val in XMP_ATTR.findall(text) + XMP_ELEM.findall(text):
        if ns in XMP_SKIP_NS or not val.strip():
            continue
        name = f"{ns}:{key}"
        if (name, val) in seen:
            continue
        seen.add((name, val))
        if key == "Orientation":
            continue
        report.add("XMP", name, val.strip())
    if not seen:
        report.add("XMP", "XMP packet", f"{len(xml):,} bytes", "hidden")


# ---------------------------------------------------------------- IPTC
def read_photoshop(report: Report, data: bytes):
    report.blocks.append("IPTC")
    i = data.find(b"8BIM")
    found = False
    while 0 <= i < len(data) - 12:
        rid = struct.unpack(">H", data[i + 4:i + 6])[0]
        nlen = data[i + 6]
        pascal = 1 + nlen
        p = i + 6 + pascal + (pascal & 1)
        if p + 4 > len(data):
            break
        (size,) = struct.unpack(">I", data[p:p + 4])
        body = data[p + 4:p + 4 + size]
        if rid == 0x0404:
            found = True
            j = 0
            while j + 5 <= len(body) and body[j] == 0x1C:
                rec, ds = body[j + 1], body[j + 2]
                (ln,) = struct.unpack(">H", body[j + 3:j + 5])
                val = body[j + 5:j + 5 + ln]
                if rec == 2 and ds != 0:
                    report.add("IPTC", IPTC_NAMES.get(ds, f"Dataset 2:{ds}"), val)
                j += 5 + ln
        nxt = p + 4 + size + (size & 1)
        i = data.find(b"8BIM", nxt)
    if not found:
        report.add("Photoshop", "Photoshop resources", f"{len(data):,} bytes", "software")


def _cbor_text(data: bytes, pos: int) -> tuple[str | None, int]:
    """Read a CBOR text string starting at pos. Returns (text, next_pos)."""
    if pos >= len(data):
        return None, pos
    head = data[pos]
    if head >> 5 != 3:
        return None, pos
    ln = head & 0x1F
    pos += 1
    if ln == 24:
        ln, pos = data[pos], pos + 1
    elif ln == 25:
        ln, pos = int.from_bytes(data[pos:pos + 2], "big"), pos + 2
    elif ln > 25:
        return None, pos
    return data[pos:pos + ln].decode("utf-8", "ignore"), pos + ln


def _cbor_value_after(data: bytes, key: bytes, start: int = 0) -> str | None:
    """Find CBOR text key and return the text value that follows it."""
    i = data.find(key, start)
    while i >= 0:
        val, _ = _cbor_text(data, i + len(key))
        if val:
            return val
        i = data.find(key, i + 1)
    return None


def _cbor_name_in_map(data: bytes, key: bytes) -> str | None:
    i = data.find(key)
    if i < 0:
        return None
    window = data[i:i + 200]
    name = _cbor_value_after(window, b"dname")
    version = _cbor_value_after(window, b"gversion")
    if name and version:
        return f"{name} ({version})"
    return name


def read_c2pa(report: Report, data: bytes, where: str):
    report.blocks.append("C2PA")
    report.add("C2PA", "Content Credentials manifest", f"Signed manifest in {where} ({len(data):,} bytes)",
               "credentials")
    gen = _cbor_name_in_map(data, b"claim_generator_info") or _cbor_value_after(data, b"oclaim_generator")
    if gen:
        report.add("C2PA", "Claim generator", gen, "software")
    agent = _cbor_name_in_map(data, b"softwareAgent")
    if agent:
        report.add("C2PA", "Software agent", agent, "ai" if AI_MARKERS.search(agent.encode()) else "software")
    src = _cbor_value_after(data, b"digitalSourceType")
    if src:
        report.add("C2PA", "Digital source type", src.rsplit("/", 1)[-1], "ai")
    when = re.search(rb"c2pa\.created.{0,12}?when\xc0x.([0-9T:\-.Z+]{10,40})", data, re.S)
    if when:
        report.add("C2PA", "Creation time", when.group(1).decode(), "timestamps")
    signer = re.search(rb"(?:CN=|\x06\x03U\x04\x03\x0c.)([\x20-\x7e]{3,60})", data)
    if signer:
        name = signer.group(1).decode("latin-1")
        name = name[: name.rfind(")") + 1] if ")" in name else name
        report.add("C2PA", "Certificate issuer", name.strip(), "credentials")
    if not (gen or agent or src):
        hints = sorted({m.decode("latin-1") for m in AI_MARKERS.findall(data)}, key=str.lower)
        if hints:
            report.add("C2PA", "Manifest mentions", ", ".join(hints)[:MAX_VALUE], "ai")


# ---------------------------------------------------------------- per-format
def inspect_jpeg(data: bytes, report: Report):
    for m, payload, raw in jpeg.segments(data):
        if m is None:
            report.add("File", "Data after end of image", f"{len(payload):,} hidden bytes", "hidden")
            continue
        if m == 0xE1 and payload.startswith(b"Exif\x00\x00"):
            read_exif(report, payload)
        elif m == 0xE1 and payload.startswith(b"http://ns.adobe.com/xap/1.0/\x00"):
            read_xmp(report, payload[29:])
        elif m == 0xE1 and payload.startswith(b"http://ns.adobe.com/xmp/extension/\x00"):
            read_xmp(report, payload[35 + 40:])
        elif m == 0xED:
            read_photoshop(report, payload)
        elif m == 0xEB:
            read_c2pa(report, payload, "APP11")
        elif m == 0xFE:
            report.add("Comment", "JPEG comment", payload, "description")
        elif m == 0xE2 and payload.startswith(b"ICC_PROFILE"):
            if "ICC colour profile" not in report.preserved:
                report.preserved.append("ICC colour profile")
        elif m == 0xE2 and payload.startswith(b"MPF"):
            report.add("MPF", "Multi-picture data", "Secondary images or depth maps", "hidden")
        elif m == 0xE0 and not payload.startswith(b"JFIF"):
            report.add("APP0", "JFXX extension", "Embedded thumbnail", "hidden")
        elif 0xE1 <= m <= 0xEF and m != 0xEE:
            tag = payload[:24].split(b"\x00")[0].decode("latin-1", "ignore") or f"APP{m - 0xE0}"
            report.add(f"APP{m - 0xE0}", "Vendor block", f"{tag} ({len(payload):,} bytes)", "hidden")


def _png_text(key: str, text: bytes | str, report: Report):
    text = text.decode("latin-1") if isinstance(text, bytes) else text
    if key == "XML:com.adobe.xmp":
        read_xmp(report, text.encode("utf-8"))
        return
    if key.lower() in ("raw profile type exif", "raw profile type app1"):
        report.add("PNG text", key, "Embedded EXIF profile", "hidden")
        return
    cat = "ai" if key.lower() in AI_KEYS else None
    report.add("PNG text", key, text, cat)


def inspect_png(data: bytes, report: Report):
    total = 8
    for typ, body, raw in png.chunks(data):
        total += len(raw)
        t = typ.decode("latin-1")
        try:
            if typ == b"tEXt":
                k, _, v = body.partition(b"\x00")
                _png_text(k.decode("latin-1"), v, report)
            elif typ == b"zTXt":
                k, _, rest = body.partition(b"\x00")
                _png_text(k.decode("latin-1"), zlib.decompress(rest[1:])[:20000], report)
            elif typ == b"iTXt":
                k, _, rest = body.partition(b"\x00")
                comp = rest[0]
                rest = rest[2:]
                _lang, _, rest = rest.partition(b"\x00")
                _tk, _, txt = rest.partition(b"\x00")
                txt = zlib.decompress(txt)[:200000] if comp else txt
                _png_text(k.decode("latin-1"), txt.decode("utf-8", "ignore"), report)
            elif typ == b"eXIf":
                read_exif(report, body)
            elif typ == b"tIME":
                y, mo, d, h, mi, s = struct.unpack(">HBBBBB", body[:7])
                report.add("PNG", "LastModified", f"{y:04}-{mo:02}-{d:02} {h:02}:{mi:02}:{s:02}", "timestamps")
            elif typ == b"caBX":
                read_c2pa(report, body, "caBX chunk")
            elif typ == b"iCCP":
                report.preserved.append("ICC colour profile")
            elif t[:1].islower() and typ not in png.KEEP:
                report.add("PNG", f"Private chunk {t}", f"{len(body):,} bytes", "hidden")
        except (zlib.error, struct.error, IndexError):
            report.add("PNG", f"Chunk {t}", "Unreadable metadata chunk", "hidden")
    if len(data) > total:
        report.add("File", "Data after end of image", f"{len(data) - total:,} hidden bytes", "hidden")


def inspect_webp(data: bytes, report: Report):
    for fourcc, body, _raw in webp.chunks(data):
        if fourcc == b"EXIF":
            read_exif(report, body[6:] if body.startswith(b"Exif\x00\x00") else body)
        elif fourcc == b"XMP ":
            read_xmp(report, body)
        elif fourcc == b"ICCP":
            report.preserved.append("ICC colour profile")
        elif fourcc not in webp.KEEP:
            name = fourcc.decode("latin-1").strip()
            if name.lower() in ("c2pa", "jumb"):
                read_c2pa(report, body, "RIFF chunk")
            else:
                report.add("WebP", f"Private chunk {name}", f"{len(body):,} bytes", "hidden")


def detect_format(data: bytes) -> str:
    if data[:3] == b"\xff\xd8\xff":
        return "jpeg"
    if data[:8] == png.SIG:
        return "png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    raise UnsupportedImage("Unsupported file type. Upload a JPG, PNG or WebP image.")


def inspect(data: bytes, fmt: str | None = None) -> Report:
    fmt = fmt or detect_format(data)
    report = Report(format=fmt)
    {"jpeg": inspect_jpeg, "png": inspect_png, "webp": inspect_webp}[fmt](data, report)
    report.preserved = list(dict.fromkeys(report.preserved))
    return report
