"""Video engine and API tests.

The central claim these guard is that cleaning removes metadata *and* leaves the
compressed picture and sound untouched. That is checked the same way the engine checks
it in production: by comparing per-stream packet checksums before and after.
"""
import shutil
import tempfile
import time
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.video import tools
from tests import video_fixtures as vf

pytestmark = pytest.mark.skipif(not vf.available(), reason="FFmpeg is not installed")


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def workdir():
    d = Path(tempfile.mkdtemp())
    yield d
    shutil.rmtree(d, ignore_errors=True)


def _clean(path, workdir):
    from app import video

    return video.clean_video(path, workdir, video.sniff(path, path.name))


# ---------------------------------------------------------------- engine
@pytest.mark.parametrize("name", ["mp4", "mov", "webm", "mkv", "avi"])
def test_every_container_is_cleaned_losslessly(name, workdir):
    src = getattr(vf, name)()
    if src is None:
        pytest.skip(f"FFmpeg on this host cannot build a {name} fixture")

    result = _clean(src, workdir)

    assert result["before"]["field_count"] > 0, "fixture should carry metadata"
    assert result["after"]["field_count"] == 0
    assert result["after"]["privacy_score"] == 100
    assert result["re_encoded"] is False

    blob = result["path"].read_bytes()
    leaked = [s.decode() for s in vf.SECRETS if s in blob]
    assert not leaked, f"{name} still contains {leaked}"

    # The picture and sound must be the very same packets, not merely similar.
    assert tools.stream_checksum(src, "0:v:0") == tools.stream_checksum(result["path"], "0:v:0")
    a_before = tools.stream_checksum(src, "0:a:0")
    if a_before:
        assert a_before == tools.stream_checksum(result["path"], "0:a:0")


@pytest.mark.parametrize("name", ["mp4", "mov", "webm", "mkv", "avi"])
def test_technical_properties_survive(name, workdir):
    src = getattr(vf, name)()
    if src is None:
        pytest.skip(f"FFmpeg on this host cannot build a {name} fixture")
    r = _clean(src, workdir)
    before, after = r["technical"], r["technical_after"]
    for key in ("width", "height", "video_codec", "pix_fmt", "has_audio", "audio_codec"):
        assert before[key] == after[key], f"{key} changed for {name}"
    assert abs(before["fps"] - after["fps"]) < 0.01
    assert abs(before["duration"] - after["duration"]) < 0.75


def test_rotation_flag_is_kept(workdir):
    src = vf.rotated()
    if src is None:
        pytest.skip("could not build a rotated fixture")
    r = _clean(src, workdir)
    assert r["technical"]["rotation"] == 90, "fixture should be rotated"
    assert r["technical_after"]["rotation"] == 90, "a portrait clip must not end up sideways"
    assert r["rotation_kept"] == 90


def test_video_without_audio(workdir):
    src = vf.silent()
    if src is None:
        pytest.skip("could not build a silent fixture")
    r = _clean(src, workdir)
    assert r["technical_after"]["has_audio"] is False
    assert r["after"]["field_count"] == 0


def test_content_credentials_and_xmp_are_found_and_removed(workdir):
    src = vf.with_c2pa()
    if src is None:
        pytest.skip("could not build a C2PA fixture")
    r = _clean(src, workdir)

    categories = {c["key"] for c in r["before"]["categories"]}
    assert "credentials" in categories, "the C2PA manifest should be reported"
    assert "ai" in categories, "AI provenance should be reported"
    assert "C2PA" in r["before"]["blocks"]

    blob = r["path"].read_bytes().lower()
    for marker in (b"c2pa", b"jumb", b"openai", b"chatgpt", b"trainedalgorithmicmedia",
                   b"islamabad", b"xmpmeta"):
        assert marker not in blob, f"{marker.decode()} survived cleaning"
    assert r["after"]["field_count"] == 0


def test_location_and_device_are_categorised(workdir):
    src = vf.mp4()
    if src is None:
        pytest.skip("could not build an mp4 fixture")
    r = _clean(src, workdir)
    cats = {c["key"] for c in r["before"]["categories"]}
    assert {"location", "device", "creator", "timestamps"} <= cats
    assert r["before"]["privacy_score"] < 60, "a file this revealing should score badly"


def test_rejects_a_file_that_is_not_a_video(workdir):
    from app import video

    path = workdir / "fake.mp4"
    path.write_bytes(vf.not_a_video())
    with pytest.raises(video.UnsupportedVideo):
        video.sniff(path, "fake.mp4")


def test_scrubbers_refuse_unfamiliar_input(workdir):
    """Every scrubber returns None rather than guessing, so the caller falls back safely."""
    from app.video import ebml, isobmff, riff

    src = workdir / "junk.bin"
    src.write_bytes(b"not a container at all" * 8)
    for i, scrub in enumerate((isobmff.scrub_file, ebml.scrub_file, riff.scrub_file)):
        assert scrub(src, workdir / f"out{i}.bin") is None


def test_deep_scrub_never_slurps_the_media(workdir, monkeypatch):
    """Peak memory must track the metadata boxes, not the size of the video.

    A 500 MB upload cannot be pulled into a bytes object on a modest box, so the property
    is guarded directly: the scrubbers must stream, never `read_bytes()` the whole file.
    """
    from pathlib import Path as _Path

    from app.video import ebml, isobmff, riff

    def refuse(self):
        raise AssertionError(f"read the whole of {self} into memory")

    monkeypatch.setattr(_Path, "read_bytes", refuse)

    for name, scrub in (("mp4", isobmff.scrub_file), ("mkv", ebml.scrub_file), ("avi", riff.scrub_file)):
        src = getattr(vf, name)()
        if src is None:
            continue
        stats = scrub(src, workdir / f"deep.{name}")
        assert stats is not None, f"{name} scrub should have succeeded"


# ---------------------------------------------------------------- API
def _poll(client, job_id, timeout=90):
    deadline = time.time() + timeout
    while time.time() < deadline:
        body = client.get(f"/api/v1/video/jobs/{job_id}").json()
        if body["state"] in ("done", "error", "cancelled"):
            return body
        time.sleep(0.2)
    raise AssertionError(f"job {job_id} did not finish within {timeout}s")


def test_status_endpoint(client):
    body = client.get("/api/v1/video/status").json()
    assert body["available"] is True
    assert body["max_file_mb"] > 0
    assert {f["key"] for f in body["formats"]} >= {"mp4", "mov", "webm", "mkv", "avi"}


def test_upload_poll_download_delete(client):
    src = vf.mp4()
    if src is None:
        pytest.skip("could not build an mp4 fixture")

    r = client.post("/api/v1/video/jobs", content=src.read_bytes(),
                    headers={"Content-Type": "video/mp4",
                             "X-File-Name": "My%20Clip%20%E2%9C%A8.mp4"})
    assert r.status_code == 202, r.text
    created = r.json()
    assert created["state"] in ("queued", "analyzing", "cleaning", "verifying", "done")

    body = _poll(client, created["job_id"])
    assert body["state"] == "done", body.get("error")
    assert body["after"]["field_count"] == 0
    assert body["file_name"] == "My Clip-clean.mp4"
    assert body["streams_identical"] is True
    assert body["re_encoded"] is False

    got = client.get(body["download_url"])
    assert got.status_code == 200
    assert got.content[4:8] == b"ftyp"
    assert b"Jane Designer" not in got.content
    assert got.headers["cache-control"] == "no-store"

    assert client.delete(f"/api/v1/video/jobs/{created['job_id']}").status_code == 204
    assert client.get(body["download_url"]).status_code == 404


def test_scan_endpoint_reports_without_cleaning(client):
    src = vf.mp4()
    if src is None:
        pytest.skip("could not build an mp4 fixture")
    r = client.post("/api/v1/video/scan", content=src.read_bytes(),
                    headers={"Content-Type": "video/mp4", "X-File-Name": "clip.mp4"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["report"]["field_count"] > 5
    assert body["technical"]["width"] == 320
    assert "token" not in body, "scanning must not produce a downloadable file"


def test_rejects_wrong_content_type_and_fake_video(client):
    assert client.post("/api/v1/video/jobs", content=b"x" * 2048,
                       headers={"Content-Type": "text/html"}).status_code == 415
    r = client.post("/api/v1/video/jobs", content=vf.not_a_video(),
                    headers={"Content-Type": "video/mp4"})
    assert r.status_code == 422


def test_rejects_an_empty_upload(client):
    assert client.post("/api/v1/video/jobs", content=b"",
                       headers={"Content-Type": "video/mp4"}).status_code == 400


def test_unknown_job_is_not_found(client):
    assert client.get("/api/v1/video/jobs/does-not-exist").status_code == 404
    assert client.delete("/api/v1/video/jobs/does-not-exist").status_code == 204


def test_health_reports_video_support(client):
    body = client.get("/api/health").json()
    assert body["status"] == "ok"
    assert body["video"] is True
    assert "ffmpeg" in body


def test_originals_are_never_left_on_disk(client):
    """After a job completes, nothing of the upload may remain in the staging area."""
    from app import storage

    src = vf.mp4()
    if src is None:
        pytest.skip("could not build an mp4 fixture")
    r = client.post("/api/v1/video/jobs", content=src.read_bytes(),
                    headers={"Content-Type": "video/mp4", "X-File-Name": "clip.mp4"})
    body = _poll(client, r.json()["job_id"])
    assert body["state"] == "done"
    leftovers = [p.name for p in storage.ensure_incoming().iterdir()]
    assert not leftovers, f"staging directory still holds {leftovers}"
