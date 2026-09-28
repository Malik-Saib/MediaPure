import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
_tmp = tempfile.mkdtemp()
os.environ.setdefault("DATABASE_URL", f"sqlite+aiosqlite:///{_tmp}/test.db")
os.environ.setdefault("TEMP_DIR", f"{_tmp}/files")
os.environ.setdefault("ADMIN_PASSWORD", "test-password-123")
os.environ.setdefault("SECRET_KEY", "test-secret-key-please")
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("TRUST_PROXY_HEADERS", "false")

# FFmpeg is optional for the image pipeline, so the test run must not depend on it being
# on PATH. Point the video engine at a local build when one is present.
if not os.environ.get("FFMPEG_PATH"):
    for _candidate in (r"C:\ffmpeg\ffmpeg-8.0.1-essentials_build\bin", "/usr/bin", "/usr/local/bin"):
        if Path(_candidate, "ffmpeg.exe").exists() or Path(_candidate, "ffmpeg").exists():
            os.environ["FFMPEG_PATH"] = _candidate
            os.environ["FFPROBE_PATH"] = _candidate
            break
