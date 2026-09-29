from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "MediaPure API"
    environment: str = "production"
    database_url: str = "sqlite+aiosqlite:///./aimr.db"

    # comma separated list of allowed browser origins
    cors_origins: str = (
        "https://mediapure.site,https://www.mediapure.site,"
        "http://localhost:3000,http://127.0.0.1:3000"
    )
    trust_proxy_headers: bool = True

    temp_dir: Path = Path("/tmp/aimr")
    file_ttl_seconds: int = 600
    janitor_interval_seconds: int = 60

    max_file_mb: int = 25
    max_pixels: int = 100_000_000
    max_zip_files: int = 50
    processing_workers: int = 4

    rate_clean_per_minute: int = 30
    rate_clean_per_day: int = 500
    rate_contact_per_hour: int = 5
    rate_login_per_15min: int = 10

    use_exiftool: bool = True

    # ---------------------------------------------------------------- video
    # Video is opt-out rather than opt-in: with no FFmpeg on the box the endpoints
    # answer 503 with a clear message instead of disappearing from the API.
    video_enabled: bool = True
    ffmpeg_path: str = ""   # blank = look for "ffmpeg" on PATH
    ffprobe_path: str = ""  # blank = look for "ffprobe" on PATH

    max_video_mb: int = 500
    max_video_seconds: int = 4 * 3600
    max_video_pixels: int = 8192 * 8192          # per frame, guards absurd resolutions
    video_workers: int = 2                       # concurrent FFmpeg processes
    video_queue_depth: int = 24                  # pending jobs before we shed load
    video_probe_timeout: int = 30
    video_clean_timeout: int = 900
    video_job_ttl_seconds: int = 1800            # how long a finished job stays readable
    video_verify: bool = True                    # compare stream checksums after cleaning

    rate_video_per_minute: int = 6
    rate_video_per_day: int = 60

    admin_username: str = "admin"
    admin_password: str = Field(default="", description="Required to enable the admin panel")
    secret_key: str = Field(default="change-me")
    admin_token_hours: int = 12

    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    contact_notify_to: str = "thevectorrr@gmail.com"

    @field_validator("database_url", mode="before")
    @classmethod
    def _postgres_async_driver(cls, v: object) -> object:
        if isinstance(v, str):
            if v.startswith("postgres://"):
                return "postgresql+asyncpg://" + v.removeprefix("postgres://")
            if v.startswith("postgresql://"):
                return "postgresql+asyncpg://" + v.removeprefix("postgresql://")
        return v

    @field_validator("secret_key", mode="before")
    @classmethod
    def _secret_key_or_placeholder(cls, v: object) -> object:
        """An empty SECRET_KEY must not stop the app from booting.

        It falls back to the placeholder, which development accepts and which the
        production startup check in main.py rejects loudly.
        """
        if v is None or (isinstance(v, str) and not v.strip()):
            return "change-me"
        return v

    @property
    def max_file_bytes(self) -> int:
        return self.max_file_mb * 1024 * 1024

    @property
    def max_video_bytes(self) -> int:
        return self.max_video_mb * 1024 * 1024

    @property
    def video_incoming_dir(self) -> Path:
        """Uploads in flight. Kept in a subdirectory so the download janitor ignores them."""
        return self.temp_dir / "incoming"

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
