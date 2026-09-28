import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import storage, video
from .config import get_settings
from .db import init_db
from .engine import exiftool_available
from .routers import admin, contact, tools
from .routers import video as video_router
from .security import SecurityHeaders

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if settings.environment == "production" and (settings.secret_key == "change-me" or len(settings.secret_key) < 32):
        raise RuntimeError("Set SECRET_KEY to a random value of at least 32 characters before running in production.")
    storage.ensure_dir()
    storage.ensure_incoming()
    storage.sweep()
    await init_db()
    if settings.video_enabled and not video.available():
        logging.getLogger("aimr").warning(
            "FFmpeg was not found, so video cleaning will answer 503. Install FFmpeg or set "
            "FFMPEG_PATH/FFPROBE_PATH. Image cleaning is unaffected.")
    tasks = [asyncio.create_task(storage.janitor()),
             asyncio.create_task(video_router.janitor())]
    yield
    for task in tasks:
        task.cancel()


app = FastAPI(
    title=settings.app_name,
    lifespan=lifespan,
    docs_url="/api/docs" if settings.environment != "production" else None,
    redoc_url=None,
    openapi_url="/api/openapi.json" if settings.environment != "production" else None,
)
app.add_middleware(SecurityHeaders)
app.add_middleware(CORSMiddleware, allow_origins=settings.origins, allow_methods=["GET", "POST", "PATCH", "DELETE"],
                   allow_headers=["Content-Type", "Authorization", "X-File-Name"], max_age=600)


@app.exception_handler(RequestValidationError)
async def validation_error(_req: Request, exc: RequestValidationError):
    first = exc.errors()[0] if exc.errors() else {}
    msg = str(first.get("msg", "Invalid request")).removeprefix("Value error, ")
    field = first.get("loc", ["", ""])[-1]
    return JSONResponse(status_code=422, content={"detail": msg, "field": field})


app.include_router(tools.router)
app.include_router(video_router.router)
app.include_router(contact.router)
app.include_router(admin.router)


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "exiftool": exiftool_available(),
        "video": video.available(),
        "ffmpeg": video.version(),
    }
