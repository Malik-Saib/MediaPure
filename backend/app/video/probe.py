"""Turn a video file into the same kind of metadata report the image scanner produces.

The shape of the report is deliberately identical to `app.engine.inspect.Report`
(fields, categories, privacy score, preserved list) so the browser can render an
image result and a video result with one component and one vocabulary.
"""
from __future__ import annotations

import json
import logging
import re
import subprocess
from dataclasses import dataclass, field
from pathlib import Path

from ..config import get_settings
from ..engine.inspect import CATEGORY_LABELS, MAX_VALUE, WEIGHTS, AI_MARKERS, categorise
from .errors import UnsupportedVideo
from . import tools

log = logging.getLogger("aimr.video.probe")
settings = get_settings()

MAX_FIELDS = 400

# ---------------------------------------------------------------- containers
CONTAINERS = {
    "mp4": {"label": "MP4", "ext": "mp4", "mime": "video/mp4", "family": "isobmff"},
    "mov": {"label": "MOV (QuickTime)", "ext": "mov", "mime": "video/quicktime", "family": "isobmff"},
    "m4v": {"label": "M4V", "ext": "m4v", "mime": "video/x-m4v", "family": "isobmff"},
    "webm": {"label": "WebM", "ext": "webm", "mime": "video/webm", "family": "ebml"},
    "mkv": {"label": "Matroska (MKV)", "ext": "mkv", "mime": "video/x-matroska", "family": "ebml"},
    "avi": {"label": "AVI", "ext": "avi", "mime": "video/x-msvideo", "family": "riff"},
}
QUICKTIME_BRANDS = {b"qt  "}
M4V_BRANDS = {b"M4V ", b"M4VH", b"M4VP"}


def detect_container(head: bytes, filename: str = "") -> str:
    """Identify the container from its leading bytes. The file name is only a tie-breaker."""
    if len(head) >= 12 and head[4:8] == b"ftyp":
        brand = head[8:12]
        if brand in QUICKTIME_BRANDS:
            return "mov"
        if brand in M4V_BRANDS:
            return "m4v"
        # Some cameras write MOV content under an mp4 brand; the extension breaks the tie
        # and both take the identical ISOBMFF path anyway.
        if filename.lower().endswith(".mov"):
            return "mov"
        return "mp4"
    if head[:4] == b"\x1aE\xdf\xa3":
        window = head[:1024]
        if b"webm" in window:
            return "webm"
        return "mkv"
    if head[:4] == b"RIFF" and head[8:12] == b"AVI ":
        return "avi"
    raise UnsupportedVideo("Unsupported file type. Upload an MP4, MOV, WebM, MKV or AVI video.")


# ---------------------------------------------------------------- categorising
VIDEO_CATEGORY = (
    ("location", ("location", "gps", "©xyz", "xyz", "iso6709", "geotag")),
    ("device", ("handler_name", "vendor_id", "make", "model", "camera", "device", "serial",
                "lensmodel", "androidcaptureFps".lower())),
    ("software", ("encoder", "writingapp", "muxingapp", "writing_application", "muxing_application",
                  "software", "application", "producer", "toolkit", "libraryname", "comapplequicktimesoftware")),
    ("timestamps", ("creation_time", "creationdate", "modification", "dateutc", "date", "time")),
    ("credentials", ("c2pa", "jumbf", "contentcredential", "manifest", "provenance")),
    ("ai", ("prompt", "digitalsourcetype", "generat", "sora", "veo", "runway", "pika", "luma", "kling")),
    ("creator", ("artist", "author", "copyright", "creator", "owner", "rights", "publisher",
                 "album_artist", "composer", "credit")),
    ("description", ("title", "comment", "description", "synopsis", "keyword", "genre",
                     "show", "episode", "rating", "purl")),
)


def categorise_video(name: str, value: str = "") -> str:
    n = name.lower().replace(" ", "").replace("-", "").replace("_", "")
    for cat, needles in VIDEO_CATEGORY:
        if any(k.replace("_", "").replace("-", "") in n for k in needles):
            return cat
    return categorise(name, value)


# Tags that describe the format rather than the person: reporting them as "found and
# removed" would be a lie, because a video cannot exist without them.
# Values that mean "nothing here": a zeroed vendor code, an undefined language, an empty
# string. Reporting them as findings would inflate the count with placeholders.
PLACEHOLDER_VALUES = {"", "0", "und", "undefined", "none", "[0][0][0][0]",
                      "0000", "unknown", "n/a"}

SKIP_TAGS = {"major_brand", "minor_version", "compatible_brands", "language", "duration",
             "bps", "number_of_frames", "number_of_bytes", "source", "statistics_writing_app",
             "statistics_writing_date_utc", "statistics_tags", "_statistics_writing_app",
             "_statistics_writing_date_utc", "_statistics_tags"}


# Timed-metadata tracks whose payload lives in `mdat`, not in any tag. A GoPro GPMF
# track is a second-by-second GPS log; ffprobe shows only that the track exists.
TELEMETRY = {
    "gpmd": ("GoPro GPMF telemetry: GPS track log, speed and sensor data", "location"),
    "mebx": ("Apple timed metadata: may include a continuous location track", "location"),
    "rtmd": ("Sony real-time metadata: camera settings and lens telemetry", "device"),
    "camm": ("Google CAMM track: GPS positions and device orientation", "location"),
    "tmcd": ("Embedded timecode track from the recording session", "timestamps"),
}


@dataclass
class VField:
    group: str
    name: str
    value: str
    category: str

    def as_dict(self) -> dict:
        return {"group": self.group, "name": self.name, "value": self.value, "category": self.category}


@dataclass
class VideoReport:
    container: str
    fields: list[VField] = field(default_factory=list)
    preserved: list[str] = field(default_factory=list)
    blocks: list[str] = field(default_factory=list)

    def add(self, group: str, name: str, value: object, category: str | None = None) -> None:
        if len(self.fields) >= MAX_FIELDS:
            return
        text = str(value).strip()
        if not text or text.lower() in PLACEHOLDER_VALUES or not text.strip(chr(0)):
            return
        if len(text) > MAX_VALUE:
            text = text[: MAX_VALUE - 1] + "…"
        cat = category or categorise_video(name, text)
        if cat not in ("ai",) and AI_MARKERS.search(text.encode("utf-8", "ignore")):
            cat = "ai"
        self.fields.append(VField(group, name, text, cat))

    @property
    def categories(self) -> dict[str, int]:
        counts: dict[str, int] = {}
        for f in self.fields:
            counts[f.category] = counts.get(f.category, 0) + 1
        return counts

    @property
    def privacy_score(self) -> int:
        if not self.fields:
            return 100
        return max(5, 100 - sum(WEIGHTS.get(c, 2) for c in self.categories))

    def as_dict(self) -> dict:
        cats = self.categories
        return {
            "format": self.container,
            "field_count": len(self.fields),
            "privacy_score": self.privacy_score,
            "categories": [{"key": k, "label": CATEGORY_LABELS.get(k, k), "count": cats[k]}
                           for k in sorted(cats, key=lambda c: -WEIGHTS.get(c, 0))],
            "fields": [f.as_dict() for f in self.fields],
            "preserved": list(dict.fromkeys(self.preserved)),
            "blocks": list(dict.fromkeys(self.blocks)),
        }


# ---------------------------------------------------------------- technical summary
def _fraction(text: str | None) -> float:
    if not text or "/" not in text:
        try:
            return float(text or 0)
        except ValueError:
            return 0.0
    num, _, den = text.partition("/")
    try:
        n, d = float(num), float(den)
    except ValueError:
        return 0.0
    return n / d if d else 0.0


def technical(data: dict) -> dict:
    """Everything the cleaned file must still match, plus what the UI shows the user."""
    fmt = data.get("format") or {}
    streams = data.get("streams") or []
    video = next((s for s in streams if s.get("codec_type") == "video"), None)
    audio = next((s for s in streams if s.get("codec_type") == "audio"), None)
    if video is None:
        raise UnsupportedVideo("This file has no video track. Upload a video file.")

    rotation = 0
    for sd in video.get("side_data_list") or []:
        if "rotation" in sd:
            try:
                rotation = int(float(sd["rotation"]))
            except (TypeError, ValueError):
                rotation = 0
    if not rotation:
        try:
            rotation = int(float((video.get("tags") or {}).get("rotate", 0)))
        except (TypeError, ValueError):
            rotation = 0

    return {
        "duration": round(float(fmt.get("duration") or video.get("duration") or 0), 3),
        "bit_rate": int(fmt.get("bit_rate") or 0),
        "width": int(video.get("width") or 0),
        "height": int(video.get("height") or 0),
        "fps": round(_fraction(video.get("avg_frame_rate")) or _fraction(video.get("r_frame_rate")), 4),
        "video_codec": video.get("codec_name") or "",
        "video_profile": video.get("profile") or "",
        "pix_fmt": video.get("pix_fmt") or "",
        "video_bit_rate": int(video.get("bit_rate") or 0),
        "frames": int(video.get("nb_frames") or 0),
        "rotation": ((rotation % 360) + 360) % 360,
        "has_audio": audio is not None,
        "audio_codec": (audio or {}).get("codec_name") or "",
        "audio_channels": int((audio or {}).get("channels") or 0),
        "audio_sample_rate": int((audio or {}).get("sample_rate") or 0),
        "audio_bit_rate": int((audio or {}).get("bit_rate") or 0),
        "stream_count": len(streams),
        "subtitle_streams": sum(1 for s in streams if s.get("codec_type") == "subtitle"),
    }


# ---------------------------------------------------------------- ExifTool enrichment
EXIFTOOL_SKIP_GROUPS = {"ExifTool", "System", "File", "Composite"}
EXIFTOOL_GROUP_LABELS = {"Jpeg2000": "C2PA", "JUMBF": "C2PA", "CBOR": "C2PA",
                         "Track1": "Track", "Track2": "Track", "Track3": "Track"}
# Structural facts ExifTool reports that are not metadata in any privacy sense.
EXIFTOOL_SKIP_NAMES = {
    "MajorBrand", "MinorVersion", "CompatibleBrands", "MovieDataSize", "MovieDataOffset",
    "MediaDuration", "TrackDuration", "Duration", "ImageWidth", "ImageHeight", "ImageSize",
    "VideoFrameRate", "AvgBitrate", "AudioChannels", "AudioSampleRate", "AudioBitsPerSample",
    "MediaTimeScale", "TimeScale", "MediaLanguageCode", "TrackLayer", "TrackVolume",
    "MatrixStructure", "Rotation", "SourceImageWidth", "SourceImageHeight", "GraphicsMode",
    "OpColor", "Balance", "AudioFormat", "VideoFullRangeFlag", "ColorPrimaries",
    "TransferCharacteristics", "MatrixCoefficients", "ColorRepresentation", "BitDepth",
    "CompressorID", "PreferredRate", "PreferredVolume", "PosterTime", "SelectionTime",
    "SelectionDuration", "CurrentTime", "NextTrackID", "MediaHeaderVersion", "TrackHeaderVersion",
    "MovieHeaderVersion", "HandlerClass", "HandlerType", "HandlerVendorID", "SampleRate",
    "Channels", "FileType", "FileTypeExtension", "MIMEType",
}


def exiftool_fields(path: Path, report: VideoReport) -> int:
    """Second opinion from ExifTool: QuickTime atoms, XMP and C2PA that ffprobe never surfaces."""
    import shutil as _shutil

    exe = _shutil.which("exiftool")
    if not exe:
        return 0
    try:
        proc = subprocess.run(
            [exe, "-j", "-G1", "-a", "-s", "-n", "-api", "LargeFileSupport=1", str(path)],
            capture_output=True, timeout=settings.video_probe_timeout, check=False)
        rows = json.loads(proc.stdout.decode("utf-8", "ignore") or "[]")
        if not rows or not isinstance(rows[0], dict):
            return 0
    except Exception:  # noqa: BLE001 - enrichment must never fail a request
        log.warning("exiftool enrichment failed for a video; using the ffprobe report", exc_info=True)
        return 0

    added = 0
    for key, val in rows[0].items():
        if ":" not in key:
            continue
        group, name = key.split(":", 1)
        if group in EXIFTOOL_SKIP_GROUPS or name in EXIFTOOL_SKIP_NAMES:
            continue
        text = str(val)
        if not text.strip() or text.lower() in PLACEHOLDER_VALUES or text == "undef":
            continue
        before = len(report.fields)
        report.add(EXIFTOOL_GROUP_LABELS.get(group, group), name, text)
        added += len(report.fields) - before
        if group.lower().startswith(("jumbf", "cbor", "jpeg2000")):
            report.blocks.append("C2PA")
        elif group.lower().startswith("xmp"):
            report.blocks.append("XMP")
    return added


# ---------------------------------------------------------------- report builder
C2PA_HINT = re.compile(rb"(c2pa|jumbf|urn:uuid:|contentauth)", re.I)


def scan_raw_markers(path: Path, report: VideoReport) -> None:
    """Content Credentials live in a `uuid` box FFprobe never mentions. Look for them directly."""
    try:
        with path.open("rb") as fh:
            head = fh.read(4 * 1024 * 1024)
            fh.seek(max(0, path.stat().st_size - 2 * 1024 * 1024))
            tail = fh.read(2 * 1024 * 1024)
    except OSError:
        return
    blob = head + tail
    if b"c2pa" in blob.lower() or b"jumb" in blob.lower():
        if "C2PA" not in report.blocks:
            report.blocks.append("C2PA")
            report.add("C2PA", "Content Credentials manifest",
                       "Signed provenance manifest embedded in the container", "credentials")
    hints = sorted({m.decode("latin-1").lower() for m in AI_MARKERS.findall(blob)})
    if hints:
        report.add("Container", "AI tool references", ", ".join(hints)[:MAX_VALUE], "ai")


def build_report(path: Path, data: dict, container: str, *, deep: bool = True) -> VideoReport:
    report = VideoReport(container=container)
    fmt = data.get("format") or {}

    mark = len(report.fields)
    for k, v in (fmt.get("tags") or {}).items():
        if k.lower() in SKIP_TAGS:
            continue
        report.add("Container", k, v)
    if len(report.fields) > mark:
        report.blocks.append("Container tags")

    for s in data.get("streams") or []:
        kind = (s.get("codec_type") or "stream").capitalize()
        idx = s.get("index", 0)
        group = f"{kind} #{idx}"
        mark = len(report.fields)
        for k, v in (s.get("tags") or {}).items():
            if k.lower() in SKIP_TAGS:
                continue
            if k.lower() == "rotate":
                continue  # orientation: preserved, reported separately
            report.add(group, k, v)
        if len(report.fields) > mark:
            report.blocks.append(f"{kind} stream tags")
        if s.get("codec_type") == "video":
            for sd in s.get("side_data_list") or []:
                if "rotation" in sd and int(float(sd.get("rotation") or 0)):
                    report.preserved.append("Rotation flag")
        elif s.get("codec_type") == "data":
            tag = (s.get("codec_tag_string") or "data").strip()
            label, cat = TELEMETRY.get(tag, (f"Timed metadata track ({tag})", "hidden"))
            report.add(group, "Telemetry track", label, cat)
            report.blocks.append("Timed metadata track")

    mark = len(report.fields)
    for ch in data.get("chapters") or []:
        for k, v in (ch.get("tags") or {}).items():
            report.add("Chapters", k, v, "description")
    if len(report.fields) > mark:
        report.blocks.append("Chapters")

    if deep:
        exiftool_fields(path, report)
        scan_raw_markers(path, report)

    # De-duplicate: ffprobe and ExifTool frequently name the same atom differently.
    seen: set[tuple[str, str]] = set()
    unique: list[VField] = []
    for f in report.fields:
        key = (f.name.lower().replace("_", ""), f.value)
        if key in seen:
            continue
        seen.add(key)
        unique.append(f)
    report.fields = unique
    return report


def inspect(path: Path, container: str, *, deep: bool = True) -> tuple[VideoReport, dict, dict]:
    """Probe a video once: returns (report, technical summary, raw ffprobe output)."""
    data = tools.probe(path)
    tech = technical(data)
    if tech["duration"] > settings.max_video_seconds:
        raise UnsupportedVideo(
            f"This video is longer than {settings.max_video_seconds // 3600} hours.")
    if tech["width"] * tech["height"] > settings.max_video_pixels:
        raise UnsupportedVideo("This video's resolution is too large to process safely.")
    return build_report(path, data, container, deep=deep), tech, data
