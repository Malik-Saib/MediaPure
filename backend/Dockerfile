FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
# ffmpeg powers the video cleaner; exiftool enriches the metadata report for both media.
# Neither is imported by Python, so image cleaning still works if a build drops them.
RUN apt-get update \
 && apt-get install -y --no-install-recommends libimage-exiftool-perl ffmpeg \
 && rm -rf /var/lib/apt/lists/* \
 && useradd --system --uid 10001 --home /app aimr

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app ./app

USER aimr
ENV TEMP_DIR=/tmp/aimr
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8000/api/health').status==200 else 1)"

# One process on purpose: the rate limiter, the video job store and the temp-file index
# all live in memory. Parallelism comes from the bounded worker pools (PROCESSING_WORKERS
# for images, VIDEO_WORKERS for video). See DEPLOYMENT.md to scale out.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*", "--no-server-header"]
