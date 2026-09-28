"""Builds small videos carrying the metadata a camera, an editor or an AI tool leaves behind.

Everything is generated with FFmpeg at import time into a temporary directory, so the
repository carries no binary fixtures. When FFmpeg is missing, `available()` is False and
the video tests skip rather than fail: image cleaning does not depend on FFmpeg and its
test run must not either.
"""
from __future__ import annotations

import struct
import subprocess
import tempfile
from functools import lru_cache
from pathlib import Path

from app.video import tools

META = [
    "-metadata", "title=Rooftop shoot, take 3",
    "-metadata", "artist=Jane Designer",
    "-metadata", "copyright=(c) 2026 Jane Designer",
    "-metadata", "comment=Internal cut. Prompt: cinematic drone shot, golden hour",
    "-metadata", "encoder=Adobe Premiere Pro 2026.1",
    "-metadata", "creation_time=2026-03-14T09:26:53.000000Z",
    "-metadata", "make=Apple",
    "-metadata", "model=iPhone 15 Pro",
    "-metadata", "location=+33.5145+073.0476/",
    "-metadata", "com.apple.quicktime.location.ISO6709=+33.5145+073.0476+512.000/",
    "-metadata:s:v:0", "handler_name=Core Media Video",
]

# Strings planted above that must not survive cleaning, anywhere in the file.
SECRETS = [b"Jane Designer", b"iPhone 15 Pro", b"Rooftop shoot", b"Premiere",
           b"33.5145", b"073.0476", b"Core Media", b"golden hour", b"Lavf"]

XMP_UUID = bytes.fromhex("BE7ACFCB97A942E89C71999491E3AFAC")


def available() -> bool:
    return tools.available()


@lru_cache
def _dir() -> Path:
    return Path(tempfile.mkdtemp(prefix="aimr-video-fixtures-"))


def _build(name: str, args: list[str]) -> Path | None:
    path = _dir() / name
    if path.exists():
        return path
    exe = tools.ffmpeg_bin()
    if not exe:
        return None
    src = ["-f", "lavfi", "-i", "testsrc2=size=320x240:rate=25:duration=1",
           "-f", "lavfi", "-i", "sine=frequency=440:duration=1"]
    proc = subprocess.run([exe, "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                           *src, *args, str(path)], capture_output=True, timeout=120)
    return path if proc.returncode == 0 and path.exists() else None


def mp4() -> Path | None:
    return _build("sample.mp4", ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "30",
                                 "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", *META])


def mov() -> Path | None:
    return _build("sample.mov", ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "30",
                                 "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", *META,
                                 "-f", "mov"])


def webm() -> Path | None:
    return _build("sample.webm", ["-c:v", "libvpx-vp9", "-b:v", "150k", "-cpu-used", "8",
                                  "-c:a", "libopus", "-shortest", *META])


def mkv() -> Path | None:
    return _build("sample.mkv", ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "30",
                                 "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", *META,
                                 "-f", "matroska"])


def avi() -> Path | None:
    return _build("sample.avi", ["-c:v", "mpeg4", "-q:v", "10", "-c:a", "libmp3lame",
                                 "-shortest", *META, "-f", "avi"])


def rotated() -> Path | None:
    """Portrait clip with a real display matrix, the phone-video case."""
    base = mp4()
    exe = tools.ffmpeg_bin()
    if not base or not exe:
        return None
    path = _dir() / "rotated.mp4"
    if path.exists():
        return path
    proc = subprocess.run([exe, "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                           "-display_rotation", "90", "-i", str(base), "-c", "copy",
                           *META, str(path)], capture_output=True, timeout=120)
    return path if proc.returncode == 0 and path.exists() else None


def silent() -> Path | None:
    return _build("silent.mp4", ["-map", "0:v", "-c:v", "libx264", "-preset", "ultrafast",
                                 "-crf", "30", "-pix_fmt", "yuv420p", *META])


def with_c2pa() -> Path | None:
    """An MP4 with a trailing XMP `uuid` box and a JUMBF Content Credentials manifest.

    Both are appended after `mdat`, which leaves every existing offset valid, so the
    result is a legitimate file that simply carries provenance data.
    """
    base = mp4()
    if not base:
        return None
    path = _dir() / "with-c2pa.mp4"
    if path.exists():
        return path

    xmp = (b'<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF><rdf:Description '
           b'xmp:CreatorTool="Adobe Premiere Pro 2026" photoshop:City="Islamabad" '
           b'dc:creator="Jane Designer" Iptc4xmpExt:DigitalSourceType='
           b'"http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"/>'
           b'</rdf:RDF></x:xmpmeta>')
    xmp_box = struct.pack(">I", 8 + 16 + len(xmp)) + b"uuid" + XMP_UUID + xmp

    jumb = (b"c2pa" + bytes(4) + b"jumdc2pa" + bytes(8)
            + b"claim_generator_infodnameoOpenAI Media Servicegversione1.0.2"
            + b"softwareAgentdnamegChatGPTdigitalSourceType"
            + b"xhttp://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia")
    jumb_box = struct.pack(">I", 8 + len(jumb)) + b"jumb" + jumb
    c2pa_box = struct.pack(">I", 8 + 16 + len(jumb_box)) + b"uuid" + bytes(16) + jumb_box

    path.write_bytes(base.read_bytes() + xmp_box + c2pa_box)
    return path


def not_a_video() -> bytes:
    return b"%PDF-1.7\n" + b"x" * 4096
