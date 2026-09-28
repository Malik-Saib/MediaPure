import io
import json
import shutil
import subprocess

import pytest
from PIL import Image

from app.engine import UnsupportedImage, clean_image, inspect, pixel_digest
from tests import fixtures

MAX = 100_000_000
CASES = {
    "jpeg": fixtures.jpeg,
    "jpeg-progressive": lambda: fixtures.jpeg(progressive=True),
    "png": fixtures.png,
    "webp": fixtures.webp,
    "webp-lossless": lambda: fixtures.webp(lossless=True),
}
STRUCTURAL = {"ExifTool", "System", "File", "Composite", "JFIF", "ICC_Profile", "PNG", "RIFF",
              "PNG-pHYs", "VP8", "VP8L", "VP8X"}


@pytest.mark.parametrize("name", CASES)
def test_removes_everything_and_keeps_pixels(name):
    src = CASES[name]()
    res = clean_image(src, max_pixels=MAX)
    before, after = res["before"], res["after"]
    assert before["field_count"] >= 5, before
    assert after["field_count"] == 0, after["fields"]
    assert after["privacy_score"] == 100
    assert before["privacy_score"] < 70
    assert res["pixels_identical"] is True
    assert pixel_digest(src) == pixel_digest(res["cleaned"])
    assert res["cleaned_size"] < res["original_size"]
    Image.open(io.BytesIO(res["cleaned"])).load()  # still a valid image


def test_categories_detected_for_jpeg():
    res = clean_image(fixtures.jpeg(), max_pixels=MAX)
    cats = {c["key"] for c in res["before"]["categories"]}
    assert {"location", "device", "software", "creator", "timestamps", "ai", "credentials", "hidden"} <= cats
    assert res["orientation_kept"] == 6
    assert "Orientation" in res["after"]["preserved"]
    assert b"HIDDEN-TRAILING-PAYLOAD" not in res["cleaned"]
    assert b"Jane" not in res["cleaned"]


def test_png_ai_prompt_detected():
    rep = inspect(fixtures.png())
    ai = [f for f in rep.fields if f.category == "ai"]
    assert any(f.name == "parameters" for f in ai)


def test_rejects_non_images():
    with pytest.raises(UnsupportedImage):
        clean_image(b"<?php system($_GET['x']); ?>" * 10, max_pixels=MAX)
    with pytest.raises(UnsupportedImage):
        clean_image(b"\xff\xd8\xff\xe0" + b"garbage" * 50, max_pixels=MAX)


def test_polyglot_payload_is_dropped():
    evil = fixtures.png() + b"PK\x03\x04 zip smuggled after IEND"
    res = clean_image(evil, max_pixels=MAX)
    assert b"PK\x03\x04" not in res["cleaned"]


def test_decompression_bomb_blocked():
    buf = io.BytesIO()
    Image.new("L", (6000, 6000)).save(buf, "PNG")
    with pytest.raises(UnsupportedImage):
        clean_image(buf.getvalue(), max_pixels=10_000_000)


@pytest.mark.skipif(not shutil.which("exiftool"), reason="exiftool not installed")
@pytest.mark.parametrize("name", CASES)
def test_exiftool_confirms_clean(name, tmp_path):
    res = clean_image(CASES[name](), max_pixels=MAX)
    p = tmp_path / "out"
    p.write_bytes(res["cleaned"])
    out = json.loads(subprocess.run(["exiftool", "-j", "-G1", "-a", str(p)], capture_output=True).stdout)[0]
    leftover = {k: v for k, v in out.items() if ":" in k and k.split(":")[0] not in STRUCTURAL
                and not k.startswith("ICC")}
    leftover.pop("IFD0:Orientation", None)
    assert not leftover, leftover
