"""Clean a video without re-encoding it, then prove that nothing was re-encoded.

The pipeline is deliberately conservative:

  1. Identify the container from its bytes and probe it once.
  2. Remux with `-c copy`. Compressed frames are moved, never decoded, so picture and
     sound come out bit-for-bit identical. Metadata dictionaries, chapters and
     timed-telemetry tracks are dropped at this step.
  3. Run a container-specific second pass for the identity FFmpeg leaves behind
     (handler names, header timestamps, stray uuid boxes, muxer signatures).
  4. Verify. The video and audio streams of the candidate are checksummed and compared
     with the original's, and the technical summary is compared field by field.

Step 3 is the only aggressive step, and step 4 is what makes it safe: a candidate that
fails verification is discarded in favour of the plain FFmpeg output, which is verified
in turn. A file is never handed over unverified.
"""
from __future__ import annotations

import logging
import time
from pathlib import Path

from ..config import get_settings
from . import ebml, isobmff, probe, riff, tools
from .errors import UnsupportedVideo, VideoProcessingError

log = logging.getLogger("aimr.video.clean")
settings = get_settings()

MUXER = {"mp4": "mp4", "m4v": "mp4", "mov": "mov", "webm": "webm", "mkv": "matroska", "avi": "avi"}
SCRUBBERS = {"isobmff": isobmff.scrub_file, "ebml": ebml.scrub_file, "riff": riff.scrub_file}

# Duration may legitimately drift by a frame when a container's own duration field is
# rounded differently by the muxer. Anything larger means the content changed.
DURATION_TOLERANCE = 0.75


def _remux_args(src: Path, dst: Path, container: str, *, with_subs: bool, rotation: int = 0) -> list[str]:
    # Orientation is the one flag a phone video cannot lose: without it a portrait clip
    # plays on its side. It is re-asserted on the input so the display matrix survives
    # `-map_metadata -1`, exactly as the image engine re-adds the EXIF orientation tag.
    args = ["-display_rotation", str(rotation)] if rotation else []
    args += ["-i", str(src), "-map", "0:v?", "-map", "0:a?"]
    if with_subs:
        args += ["-map", "0:s?"]
    args += [
        "-c", "copy",
        "-map_metadata", "-1",          # drop every tag dictionary, container and per-stream
        "-map_chapters", "-1",          # chapter titles are user-written text
        "-dn",                          # never carry GPS/telemetry data tracks across
        "-fflags", "+bitexact",         # stop FFmpeg stamping its own name and build into the file
        "-flags:v", "+bitexact",
        "-flags:a", "+bitexact",
        "-max_muxing_queue_size", "4096",
    ]
    if container in ("mp4", "m4v", "mov"):
        # Put the index in front of the media so the file starts playing before it finishes
        # downloading. This moves boxes around; it does not touch a single frame.
        args += ["-movflags", "+faststart"]
    args += ["-f", MUXER[container], str(dst)]
    return args


def _remux(src: Path, dst: Path, container: str, rotation: int = 0) -> None:
    ff, _ = tools.require()
    proc = tools.run(ff, _remux_args(src, dst, container, with_subs=True, rotation=rotation),
                     settings.video_clean_timeout)
    if proc.returncode == 0 and dst.exists() and dst.stat().st_size > 0:
        return
    # Subtitle tracks are the usual reason a stream copy is refused (a text codec the
    # target container cannot hold). Everything else about the video is unaffected, so
    # retry without them rather than failing the upload.
    log.info("stream copy with subtitles failed; retrying without subtitle tracks")
    dst.unlink(missing_ok=True)
    proc = tools.run(ff, _remux_args(src, dst, container, with_subs=False, rotation=rotation),
                     settings.video_clean_timeout)
    if proc.returncode != 0 or not dst.exists() or dst.stat().st_size == 0:
        err = proc.stderr.decode("utf-8", "ignore").strip().splitlines()
        detail = err[-1] if err else "no error output"
        log.warning("ffmpeg remux failed: %s", detail)
        raise UnsupportedVideo("This video could not be rewritten without re-encoding it. "
                               "It may use an unusual codec or be partly damaged.")


def _checksums(path: Path) -> dict[str, str | None]:
    if not settings.video_verify:
        return {}
    return {"video": tools.stream_checksum(path, "0:v:0"),
            "audio": tools.stream_checksum(path, "0:a:0")}


def _matches(original: dict, cleaned: dict, sums_before: dict, sums_after: dict) -> tuple[bool, str]:
    """Is the candidate the same video? Returns (ok, reason when not)."""
    for key in ("width", "height", "video_codec", "pix_fmt"):
        if original[key] != cleaned[key]:
            return False, f"{key} changed ({original[key]} -> {cleaned[key]})"
    if original["has_audio"] != cleaned["has_audio"]:
        return False, "audio track count changed"
    if original["has_audio"] and original["audio_codec"] != cleaned["audio_codec"]:
        return False, "audio codec changed"
    if original["fps"] and cleaned["fps"] and abs(original["fps"] - cleaned["fps"]) > 0.01:
        return False, f"frame rate changed ({original['fps']} -> {cleaned['fps']})"
    if original["duration"] and cleaned["duration"]:
        if abs(original["duration"] - cleaned["duration"]) > DURATION_TOLERANCE:
            return False, f"duration changed ({original['duration']}s -> {cleaned['duration']}s)"
    if original["frames"] and cleaned["frames"] and original["frames"] != cleaned["frames"]:
        return False, f"frame count changed ({original['frames']} -> {cleaned['frames']})"
    if original["rotation"] != cleaned["rotation"]:
        return False, f"rotation flag changed ({original['rotation']} -> {cleaned['rotation']})"
    if settings.video_verify:
        for kind in ("video", "audio"):
            a, b = sums_before.get(kind), sums_after.get(kind)
            if a and b and a != b:
                return False, f"{kind} stream checksum changed"
    return True, ""


def clean_video(src: Path, workdir: Path, container: str, *,
                on_phase=lambda name: None) -> dict:
    """Clean one video. `workdir` receives the temporary outputs and is the caller's to remove."""
    started = time.perf_counter()
    tools.require()

    on_phase("analyzing")
    before, tech_before, _raw = probe.inspect(src, container, deep=True)
    sums_before = _checksums(src)

    on_phase("cleaning")
    remuxed = workdir / f"remux.{probe.CONTAINERS[container]['ext']}"
    _remux(src, remuxed, container, rotation=tech_before["rotation"])

    candidates: list[tuple[str, Path, dict]] = []
    scrub = SCRUBBERS.get(probe.CONTAINERS[container]["family"])
    if scrub is not None:
        deep = workdir / f"deep.{probe.CONTAINERS[container]['ext']}"
        stats = scrub(remuxed, deep)
        if stats is not None and deep.exists() and deep.stat().st_size > 0:
            candidates.append(("deep", deep, stats))
    # The plain remux is always kept as the fallback, and is verified in its own right.
    candidates.append(("remux", remuxed, {}))

    on_phase("verifying")
    chosen: tuple[str, Path, dict] | None = None
    after = tech_after = None
    rejected: list[str] = []
    for name, path, stats in candidates:
        try:
            cand_report, cand_tech, _ = probe.inspect(path, container, deep=True)
        except UnsupportedVideo as exc:
            rejected.append(f"{name}: unreadable ({exc})")
            continue
        ok, why = _matches(tech_before, cand_tech, sums_before, _checksums(path))
        if not ok:
            rejected.append(f"{name}: {why}")
            continue
        chosen, after, tech_after = (name, path, stats), cand_report, cand_tech
        break

    if chosen is None:
        log.error("every cleaned candidate failed verification: %s", "; ".join(rejected))
        raise VideoProcessingError(
            "Verification failed: the cleaned video did not match the original exactly. "
            "Nothing was changed and your file was not stored.")
    if rejected:
        log.info("deep scrub rejected, serving the plain remux instead: %s", "; ".join(rejected))

    method, path, stats = chosen
    return {
        "container": container,
        "label": probe.CONTAINERS[container]["label"],
        "ext": probe.CONTAINERS[container]["ext"],
        "mime": probe.CONTAINERS[container]["mime"],
        "path": path,
        "method": "container rewrite" + (" + deep scrub" if method == "deep" else ""),
        "deep_scrub": method == "deep",
        "scrub_stats": {k: v for k, v in stats.items() if k != "names"},
        "before": before.as_dict(),
        "after": after.as_dict(),
        "technical": tech_before,
        "technical_after": tech_after,
        "original_size": src.stat().st_size,
        "cleaned_size": path.stat().st_size,
        "streams_identical": bool(settings.video_verify),
        "rotation_kept": tech_before["rotation"] or None,
        "re_encoded": False,
        "duration_ms": round((time.perf_counter() - started) * 1000),
    }


def scan_video(src: Path, container: str) -> dict:
    """Read-only inspection, for the scan endpoint."""
    tools.require()
    report, tech, _ = probe.inspect(src, container, deep=True)
    return {"container": container, "label": probe.CONTAINERS[container]["label"],
            "report": report.as_dict(), "technical": tech,
            "file_size": src.stat().st_size}


def sniff(path: Path, filename: str = "") -> str:
    """Container from the first bytes on disk; the name is only a tie-breaker."""
    try:
        with path.open("rb") as fh:
            head = fh.read(4096)
    except OSError as exc:
        raise UnsupportedVideo("The upload could not be read.") from exc
    if len(head) < 16:
        raise UnsupportedVideo("The file is empty.")
    return probe.detect_container(head, filename)


def purge(*paths: Path) -> None:
    for p in paths:
        try:
            if p:
                p.unlink(missing_ok=True)
        except OSError:
            log.warning("could not remove temporary file %s", p, exc_info=True)
