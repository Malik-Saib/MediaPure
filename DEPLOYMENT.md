# Deployment guide — MediaPure

## Server requirements

| | Images only | Images + video (recommended) |
|---|---|---|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 2 GB | 4 GB |
| Disk | 20 GB SSD | 40 GB SSD + scratch space (see below) |
| OS | Ubuntu 22.04 / 24.04 LTS (any Linux with Docker works) | Ubuntu 24.04 LTS |
| Software | Docker 24+ with Compose v2 **or** Python 3.12, Node 22, PostgreSQL 16, nginx, ExifTool | the same, plus **FFmpeg** |
| Network | Ports 80 and 443 open, a domain with A/AAAA records pointing to the server | |

**Memory.** A 100-megapixel image needs roughly 300–400 MB while its pixels are verified;
`PROCESSING_WORKERS=4` caps that, so 4 GB is comfortable and 2 GB wants `PROCESSING_WORKERS=2`.
Video memory does **not** scale with file size: nothing is decoded, `mdat` is copied in 4 MB chunks and
the scrubbers stream, so a 500 MB clip costs about as much RAM as a 5 MB one.

**Scratch disk (video only).** A job can briefly hold three copies of one file — the upload, the
rewrite and the scrubbed candidate — so size `TEMP_DIR` at:

```
3 × MAX_VIDEO_MB × VIDEO_WORKERS   +   headroom for cleaned files awaiting download
```

At the defaults (500 MB, 2 workers) that is about 3 GB; the compose file provisions an 8 GB volume.
The peak is brief: the loser candidate and the staged original are removed as soon as the job ends.
A RAM-backed tmpfs works if the host has the memory, but on a small box use a real volume — or lower
`MAX_VIDEO_MB`, which is the honest way to fit video onto a 2 GB server.

**Without FFmpeg**, set `VIDEO_ENABLED=false` (or simply leave FFmpeg uninstalled): the video endpoints
answer `503` with a clear message, the video page tells visitors so, and image cleaning is untouched.

## Option A: Docker Compose (recommended)

```bash
# 1. Server prep  (the API image installs FFmpeg and ExifTool itself)
sudo apt update && sudo apt install -y docker.io docker-compose-v2 certbot
sudo git clone <your-repo> /opt/aimr   # or unzip the package there
cd /opt/aimr

# 2. Configure
cp backend/.env.example backend/.env
nano backend/.env
#   SECRET_KEY      -> python3 -c "import secrets; print(secrets.token_hex(32))"
#   ADMIN_PASSWORD  -> a long unique password
#   CORS_ORIGINS    -> https://yourdomain.com
#   MAX_VIDEO_MB    -> must match NEXT_PUBLIC_MAX_VIDEO_MB and nginx client_max_body_size
#   VIDEO_WORKERS   -> 2 on a 2-vCPU box; raise only alongside the scratch-disk budget
#   SMTP_*          -> optional (Gmail: use an App Password)
export DOMAIN=yourdomain.com
export POSTGRES_PASSWORD=$(openssl rand -hex 24)
printf "DOMAIN=%s\nPOSTGRES_PASSWORD=%s\n" "$DOMAIN" "$POSTGRES_PASSWORD" > deploy/.env   # keep private; compose reads it

# 3. First TLS certificate (nginx is not running yet, so use standalone mode once)
sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --agree-tos -m thevectorrr@gmail.com

# 4. Start
cd deploy && docker compose up -d --build
docker compose ps && curl -s https://$DOMAIN/api/health
```

The certbot container renews certificates every 12 hours when due. After a renewal run
`docker compose exec nginx nginx -s reload` (or add it to a weekly cron).

Updating: `git pull && docker compose up -d --build`.

## Option B: plain VPS with systemd

```bash
sudo apt install -y python3.12-venv nodejs npm postgresql nginx certbot python3-certbot-nginx \
                    libimage-exiftool-perl ffmpeg          # ffmpeg powers the video cleaner
sudo useradd --system --home /opt/aimr aimr
# database
sudo -u postgres psql -c "CREATE USER aimr WITH PASSWORD 'CHANGE_ME';"
sudo -u postgres psql -c "CREATE DATABASE aimr OWNER aimr;"
psql "postgresql://aimr:CHANGE_ME@127.0.0.1:5432/aimr" -f /opt/aimr/backend/schema.sql
# api
cd /opt/aimr/backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env && nano .env
# web
cd /opt/aimr/frontend && npm ci
NEXT_PUBLIC_SITE_URL=https://yourdomain.com BACKEND_URL=http://127.0.0.1:8000 \
  NEXT_PUBLIC_MAX_FILE_MB=25 NEXT_PUBLIC_MAX_VIDEO_MB=500 npm run build
cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
sudo chown -R aimr:aimr /opt/aimr
# services
sudo cp /opt/aimr/deploy/systemd/*.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now aimr-api aimr-web
# nginx: copy deploy/nginx.conf to /etc/nginx/sites-available/aimr, replace ${DOMAIN},
# change upstreams to 127.0.0.1:8000 and 127.0.0.1:3000, enable, then:
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Option C: Cloudflare Workers Builds

Set the Workers Builds project root to `frontend`, the build command to
`npm run build`, and the deploy command to `npm run deploy`. The build command
creates the OpenNext worker; the deploy script also builds before deployment
for environments that invoke it directly. The tracked `wrangler.jsonc` names
the Worker `mediapure` and points to `.open-next/worker.js`. To preview locally,
run `npm run preview`; generated build output should not be committed.

## Go-live checklist

- [ ] `ENVIRONMENT=production` (API docs hidden; the API refuses to start with a weak `SECRET_KEY`)
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real domain **before** building (sitemap, canonicals, schema)
- [ ] HTTPS works and http:// redirects; HSTS header present
- [ ] `curl https://yourdomain.com/api/health` reports `"video": true` and an FFmpeg version
- [ ] Upload a JPG with GPS from a phone, confirm clean download and "Pixel-identical"
- [ ] Upload a phone video with GPS, confirm "Frame-identical", that it still plays the right way up,
      and that the downloaded file opens with sound
- [ ] Upload a video near `MAX_VIDEO_MB` and confirm nginx does not reject it (`413` means
      `client_max_body_size` on `/api/v1/video/` is too low)
- [ ] Check `TEMP_DIR/incoming` is empty a minute after a job finishes
- [ ] `/admin` login works; contact form arrives in the dashboard (and by email if SMTP is set)
- [ ] Submit `https://yourdomain.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools
- [ ] Run PageSpeed Insights on the live homepage (local Lighthouse: 96–100 mobile, 100 desktop)
- [ ] Legal review of `/terms` and `/privacy-policy`
- [ ] Back up the Postgres volume (it holds contact messages and statistics only)

## Security model

- **Images** are processed in memory and never written to disk. **Videos** are too large for that, so an
  upload is streamed to `TEMP_DIR/incoming` — a 0700 directory, random name, mode 0600, opened `O_EXCL` —
  and deleted in a `finally` the moment the job ends, success or failure. Only the cleaned copy survives,
  for 10 minutes, under an unguessable token. A second sweep removes anything a crash could orphan.
- Validation by magic bytes, not extension or MIME; 25 MB / 100 MP for images, 500 MB / 4 h / 64 MP per
  frame for video, all enforced while the body arrives; full decode check for images and an `ffprobe`
  sanity check for video; trailing data stripped; downloads sent as `application/octet-stream` with
  `nosniff`.
- FFmpeg is invoked with a fixed argument list and paths the service generated itself — never a shell,
  never a user-supplied string, and always a local file, so no other FFmpeg protocol handler is reachable.
- Rate limits per IP: clean/scan 30/min and 500/day, video 6/min and 60/day, video polling 600/min,
  downloads 120/min, ZIP 20/min, contact 5/hour, admin login 10 per 15 min. nginx adds burst limits in
  front, with a separate, gentler bucket for `/api/v1/video/`.
- Video work runs in a bounded pool (`VIDEO_WORKERS`) behind a capped queue (`VIDEO_QUEUE_DEPTH`); when
  the queue is full the API sheds load with a `503` and `Retry-After` rather than accepting work it
  cannot finish.
- Security headers: CSP, HSTS, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy.
- Containers run as non-root, API filesystem read-only, `no-new-privileges`.
- Visitor counts use a salted hash that rotates daily; raw IPs are not stored.
- nginx does not log `/api/` requests, so download tokens don't end up in access logs.

## Scaling

The API runs as **one process on purpose**: the rate limiter, the video job store and the temp-file
index all live in memory. A single 2-vCPU box handles thousands of image cleans per day (100–300 ms
each) and comfortably handles video too, because stream copying is I/O-bound rather than CPU-bound —
an 18 MB clip cleans and verifies in about 3 seconds, most of which is the two checksum passes.

Tuning knobs, in the order worth reaching for:

- `VIDEO_WORKERS` — concurrent FFmpeg processes. Raise with spare I/O **and** scratch disk; each extra
  worker adds `3 × MAX_VIDEO_MB` to the peak disk budget.
- `VIDEO_VERIFY=false` — skips the per-stream checksum comparison, roughly halving the work per job.
  It also removes the guarantee that frames are untouched, so the site's central claim no longer holds.
  Leave it on unless you are deliberately trading that away.
- `MAX_VIDEO_MB` — the most effective lever on a small box, and the one users understand.

To run several API replicas, move rate limiting, the job store and file storage to shared services
(Redis for counters and jobs, a shared volume or object storage with a TTL for cleaned files) and put
the replicas behind nginx `upstream`. Until then, keep video on one box: a job id is only meaningful to
the process that created it, so a round-robin load balancer would break polling. The frontend is
static-heavy and scales freely; a CDN (Cloudflare) in front of `/_next/static` and `/brand` is a cheap
win — but do not cache `/api/`, and note that some CDNs cap request bodies well below 500 MB.
