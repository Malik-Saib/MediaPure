"""Rate limiting, client identification, admin tokens and security headers."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import threading
import time
from collections import defaultdict, deque

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette.middleware.base import BaseHTTPMiddleware

from .config import get_settings

settings = get_settings()


def client_ip(request: Request) -> str:
    if settings.trust_proxy_headers:
        fwd = request.headers.get("x-forwarded-for")
        if fwd:
            return fwd.split(",")[0].strip()
        real = request.headers.get("x-real-ip")
        if real:
            return real.strip()
    return request.client.host if request.client else "unknown"


def visitor_hash(request: Request) -> str:
    """Salted, daily-rotating hash so we can count unique visitors without storing IPs."""
    day = time.strftime("%Y-%m-%d", time.gmtime())
    raw = f"{settings.secret_key}|{day}|{client_ip(request)}".encode()
    return hashlib.sha256(raw).hexdigest()


class RateLimiter:
    """In-process sliding-window limiter.

    Run the API as a single process with several threads (the default in the
    provided Docker/systemd setup) or swap this for Redis when scaling out.
    """

    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, key: str, limit: int, window: float) -> None:
        now = time.monotonic()
        with self._lock:
            q = self._hits[key]
            while q and now - q[0] > window:
                q.popleft()
            if len(q) >= limit:
                retry = int(window - (now - q[0])) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Too many requests. Try again in {retry} seconds.",
                    headers={"Retry-After": str(retry)},
                )
            q.append(now)
            if len(self._hits) > 50_000:  # memory guard
                for k in list(self._hits)[:10_000]:
                    if not self._hits[k] or now - self._hits[k][-1] > 86_400:
                        del self._hits[k]


limiter = RateLimiter()


def limit(bucket: str, per: int, window: float):
    def dep(request: Request) -> None:
        limiter.check(f"{bucket}:{client_ip(request)}", per, window)

    return dep


# ---------------------------------------------------------------- admin tokens
def _b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def _unb64(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def issue_token(subject: str) -> str:
    payload = _b64(json.dumps({"sub": subject, "exp": int(time.time()) + settings.admin_token_hours * 3600}).encode())
    sig = _b64(hmac.new(settings.secret_key.encode(), payload.encode(), hashlib.sha256).digest())
    return f"{payload}.{sig}"


def verify_token(token: str) -> str | None:
    try:
        payload, sig = token.split(".", 1)
        good = _b64(hmac.new(settings.secret_key.encode(), payload.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, good):
            return None
        data = json.loads(_unb64(payload))
        if data.get("exp", 0) < time.time():
            return None
        return data.get("sub")
    except (ValueError, json.JSONDecodeError):
        return None


bearer = HTTPBearer(auto_error=False)


def require_admin(creds: HTTPAuthorizationCredentials | None = Depends(bearer)) -> str:
    if not settings.admin_password:
        raise HTTPException(status_code=503, detail="Admin panel is disabled. Set ADMIN_PASSWORD.")
    sub = verify_token(creds.credentials) if creds else None
    if not sub:
        raise HTTPException(status_code=401, detail="Sign in again to continue.")
    return sub


def check_credentials(username: str, password: str) -> bool:
    if not settings.admin_password:
        return False
    u = hmac.compare_digest(username.encode(), settings.admin_username.encode())
    p = hmac.compare_digest(password.encode(), settings.admin_password.encode())
    return u and p


class SecurityHeaders(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        h = response.headers
        h.setdefault("X-Content-Type-Options", "nosniff")
        h.setdefault("X-Frame-Options", "DENY")
        h.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        h.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        h.setdefault("Cross-Origin-Resource-Policy", "same-site")
        h.setdefault("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
        if request.url.path.startswith("/api/"):
            h.setdefault("Cache-Control", "no-store")
        return response
