# MediaPure

The complete media metadata cleaning platform. A free, privacy-first web tool that removes hidden
metadata (EXIF, GPS, XMP, IPTC, AI generation data and C2PA Content Credentials) from **images and
video** without re-encoding them. Every cleaned file is checked against the original before it is
offered for download: pixel by pixel for images, stream by stream for video.

Formerly *AI Images Metadata Remover*. The image cleaner is unchanged and still lives at
`/image-metadata-cleaner`; the video cleaner is new and sits at `/video-metadata-cleaner`.

Built by [The Vector](https://thevector.systems/).

---

## What's in the box

| Path | Contents |
|---|---|
| `backend/app/engine/` | Lossless **image** engine: JPEG / PNG / WebP container rewriting |
| `backend/app/video/` | Lossless **video** engine: FFmpeg stream copy + per-container deep scrub |
| `backend/` | FastAPI service: API, job store, admin endpoints, tests |
| `frontend/` | Next.js 15 site: 12 public pages, blog, admin dashboard |
| `deploy/` | docker-compose (Postgres + API + web + nginx + certbot), nginx config, systemd units |
| `DEPLOYMENT.md` | Server requirements, install and go-live guide, sizing and scaling notes |
| `COMPETITOR_ANALYSIS.md` | Market scan and positioning |
| `BRAND.md` | Name, logo usage, colours, type, voice |

## How image cleaning works

1. The browser uploads the raw file body (no multipart), so the **original never touches disk**.
2. The engine validates the real format from its magic bytes, decodes it once with Pillow to check
   dimensions (decompression-bomb guard: 100 MP max) and computes a pixel digest.
3. It reads every metadata block it can find (built-in parsers, plus ExifTool when installed for the
   fullest report), and categorises each field: location, creator, device, AI generation data,
   Content Credentials, software, timestamps, descriptions, hidden extras, technical.
4. It rewrites the **container**, not the image:
   - **JPEG** – drops APP1 (EXIF/XMP), APP13 (IPTC/Photoshop), APP11 (JUMBF/C2PA), COM and other app
     segments; keeps JFIF, Adobe APP14 (colour transform) and the ICC profile; copies the entropy-coded
     scan data byte-for-byte. If the photo relies on EXIF Orientation, a minimal EXIF with only that tag
     is kept so it doesn't turn sideways.
   - **PNG** – keeps only chunks needed to render (IHDR, PLTE, IDAT, IEND, tRNS, gamma/colour chunks,
     iCCP, pHYs, APNG animation chunks); drops tEXt/zTXt/iTXt (where Stable Diffusion/ComfyUI prompts
     live), eXIf, caBX (C2PA), time and private chunks.
   - **WebP** – drops EXIF and XMP chunks, fixes the VP8X flags, keeps ICCP and animation chunks.
   - Anything appended after the end of the image (EOI/IEND) is removed, which also neutralises
     polyglot files.
5. It decodes the cleaned file and compares pixel digests for **every frame**. If anything differs,
   the request fails instead of returning a damaged image.
6. The cleaned file is saved under a random 32-character token and deleted after 10 minutes (or
   immediately via "Delete now"). A janitor sweeps expired files every minute.

## How video cleaning works

Video is far too large to hold in memory, so an upload is streamed to a private file in
`TEMP_DIR/incoming` (mode 0600, random name, opened `O_EXCL`) and deleted in a `finally` the moment the
job ends — success or failure. Work runs as a background job behind a bounded worker pool and the
browser polls for progress.

1. **Identify.** The container is read from its bytes: the ISOBMFF `ftyp` box (MP4/MOV/M4V), the EBML
   header (WebM/MKV) or the RIFF header (AVI). The file name is only a tie-breaker.
2. **Probe.** `ffprobe` reports format, streams, chapters and every tag. ExifTool adds QuickTime atoms,
   XMP and C2PA when installed. A raw scan looks for JUMBF/C2PA markers that neither tool surfaces.
   Files with no video track, longer than `MAX_VIDEO_SECONDS` or above `MAX_VIDEO_PIXELS` are refused.
3. **Rewrite.** FFmpeg remuxes with `-c copy`: compressed video and audio are moved, never decoded.
   `-map_metadata -1 -map_chapters -1 -fflags +bitexact` clears the tag dictionaries and FFmpeg's own
   signature, and only video/audio/subtitle streams are mapped — so a **timed GPS/telemetry track**
   (GoPro GPMF, Apple `mebx`, Google CAMM, Sony RTMD) is dropped rather than copied. MP4/MOV output is
   written index-first (`+faststart`). If a subtitle codec blocks the stream copy, it retries without
   subtitles rather than failing the upload.
4. **Deep scrub.** `-map_metadata -1` leaves identity in places that are not tags, so each container
   family gets a second pass of our own:
   - **ISOBMFF** (`app/video/isobmff.py`) – removes `udta`/`meta`/`ilst`/`uuid`/`free`; blanks `hdlr`
     handler names; zeroes the `vendor` field of every sample description; zeroes creation and
     modification times in `mvhd`/`tkhd`/`mdhd`; rewrites every `stco`/`co64` chunk offset by the delta
     that removing boxes introduced. `mdat` is copied in 4 MB chunks, so peak memory is the size of
     `moov`, not the size of the file.
   - **EBML** (`app/video/ebml.py`) – blanks `MuxingApp`, `WritingApp`, `Title` and `DateUTC` **in
     place**, so no byte moves and Cues/SeekHead stay valid by construction.
   - **RIFF** (`app/video/riff.py`) – renames each `INFO` list to `JUNK` (same length) and zeroes the
     body, leaving every index offset correct.
5. **Verify.** Each candidate is re-probed and its per-stream packet checksums
   (`ffmpeg -map 0:v:0 -c copy -f md5 -`) are compared with the original's, alongside codec, resolution,
   frame rate, duration, frame count and rotation. The deep-scrubbed file is preferred; if it fails any
   check the plain remux is served instead, and if that fails too the job errors rather than handing
   over a damaged file. **A file is never released unverified.**
6. **Deliver.** The result is moved into the same short-lived token storage the image cleaner uses, so
   the download route, the 10-minute expiry and the janitor are shared.

Rotation is the one flag a phone video cannot lose, so it is read before cleaning, re-asserted on the
remux and checked again afterwards — the video analogue of the EXIF orientation tag.

The database stores only anonymous statistics (media type, format, sizes, counts, duration) and contact
messages. No media, file names or metadata values are stored.

## Local development

Requirements: Python 3.11+, Node.js 20+ (22 recommended), and **FFmpeg** for the video cleaner
(`sudo apt install ffmpeg` / `brew install ffmpeg`, or a Windows build plus `FFMPEG_PATH`). ExifTool is
optional but improves the report for both media (`sudo apt install libimage-exiftool-perl`).

Without FFmpeg the video endpoints answer `503` with a clear message and **image cleaning is completely
unaffected** — nothing in the image path imports the video package.

```bash
# API
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env            # set ENVIRONMENT=development; SQLite is used if DATABASE_URL is unset
uvicorn app.main:app --reload --port 8000     # docs at http://localhost:8000/api/docs

# Web (new terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev                     # http://localhost:3000 (proxies /api to BACKEND_URL)
```

On Windows, `.\dev.ps1` starts both halves and tells you whether FFmpeg was found.

Admin dashboard: set `ADMIN_PASSWORD` and `SECRET_KEY` in `backend/.env`, then open `/admin`.

## Tests

```bash
cd backend && pytest -q          # 47 tests.
                                 # Image engine: baseline/progressive JPEG with EXIF, GPS, ICC,
                                 #   orientation and C2PA; PNG with AI prompts; lossy/lossless WebP;
                                 #   polyglots; decompression bombs; ExifTool cross-check.
                                 # Video engine: MP4/MOV/WebM/MKV/AVI cleaned losslessly with
                                 #   per-stream checksum equality; technical properties preserved;
                                 #   rotation kept; silent video; C2PA + XMP found and removed;
                                 #   scrubbers refuse unknown input; scrubbers never slurp the file.
                                 # API: clean/download/delete, scan, video job lifecycle, bad types,
                                 #   path traversal, staging cleanup, contact + admin auth, rate limits.
cd frontend && npm run typecheck && npm run build
```

Video tests skip automatically when FFmpeg is absent; fixtures are generated with FFmpeg at run time,
so no binaries live in the repository.

## API

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/v1/scan` | Report image metadata without cleaning (raw image body) |
| POST | `/api/v1/clean` | Clean an image (raw body, `X-File-Name` header). Returns before/after report and a download token |
| GET | `/api/v1/video/status` | Whether video cleaning is available, limits, formats, queue depth |
| POST | `/api/v1/video/jobs` | Upload one video (raw body, `X-File-Name`). Returns `202` with a job id |
| GET | `/api/v1/video/jobs/{id}` | Job state (`queued`/`analyzing`/`cleaning`/`verifying`/`done`/`error`) and, once done, the full result |
| DELETE | `/api/v1/video/jobs/{id}` | Cancel work in flight, or delete a finished result and its download |
| POST | `/api/v1/video/scan` | Report video metadata without producing a cleaned copy |
| GET | `/api/v1/files/{token}` | Download a cleaned file, image or video (expires after 10 min) |
| DELETE | `/api/v1/files/{token}` | Delete it now |
| POST | `/api/v1/files/zip` | ZIP several cleaned images (`{"tokens": [...]}`) |
| POST | `/api/v1/contact` | Contact form |
| POST | `/api/v1/admin/login` | Admin token |
| GET | `/api/v1/admin/overview?days=14` | Stats: uploads, visitors, formats, image vs video, storage, errors |
| GET/PATCH/DELETE | `/api/v1/admin/messages[/{id}]` | Contact submissions |
| GET | `/api/health` | Health check, including FFmpeg availability and version |

## Environment variables

Backend: see `backend/.env.example` (every variable is documented inline). The video-specific ones are
`VIDEO_ENABLED`, `FFMPEG_PATH`, `FFPROBE_PATH`, `MAX_VIDEO_MB`, `MAX_VIDEO_SECONDS`, `MAX_VIDEO_PIXELS`,
`VIDEO_WORKERS`, `VIDEO_QUEUE_DEPTH`, `VIDEO_CLEAN_TIMEOUT`, `VIDEO_JOB_TTL_SECONDS`, `VIDEO_VERIFY`,
`RATE_VIDEO_PER_MINUTE` and `RATE_VIDEO_PER_DAY`.

Frontend: `NEXT_PUBLIC_SITE_URL` (canonical URLs, sitemap, schema), `BACKEND_URL` (dev/single-box proxy),
`NEXT_PUBLIC_MAX_FILE_MB` and `NEXT_PUBLIC_MAX_VIDEO_MB` (both must match the backend).

## Upgrading from AI Images Metadata Remover

- `processing_jobs` gains a `media` column (`image` | `video`). The API adds it automatically on start
  for SQLite and PostgreSQL; `backend/schema.sql` has the statement if you provision schemas yourself.
- Install FFmpeg on the API host, or set `VIDEO_ENABLED=false` to keep running images only.
- `nginx.conf` adds a `/api/v1/video/` location with a 500 MB body limit and longer timeouts.
- The API container now needs real scratch space for video — see `DEPLOYMENT.md` for the sizing formula.
- Set `NEXT_PUBLIC_SITE_URL` to the MediaPure domain. `/image-metadata-cleaner` keeps its URL, so no
  image-side redirects are needed.

## Scope and honesty notes

- The tool removes **metadata**. It does not remove watermarks embedded in the pixels or frames (for
  example Google SynthID or visible logos), and it does not make AI-generated media "undetectable".
  Platform and legal AI-disclosure obligations still apply; the FAQ, blog and Terms say so plainly.
- ImageMagick is intentionally not used: it re-encodes images, which is exactly what this tool avoids.
  For the same reason video is never transcoded — FFmpeg is only ever invoked with `-c copy`.
- Images are processed entirely in memory. Videos cannot be, so the site says so plainly rather than
  claiming that nothing ever touches disk.
- The "Optimizing" step from the original brief is shown as "Verifying", because the tool verifies
  pixels and frames rather than optimising or recompressing them.
- Terms of Service and Privacy Policy are solid drafts; have them reviewed by a lawyer for your
  jurisdiction before launch.
#   M e d i a P u r e  
 