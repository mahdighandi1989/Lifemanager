"""Rate limiter wiring for the FastAPI app.

We use slowapi (https://github.com/laurentS/slowapi), a Flask-Limiter-style
middleware for Starlette/FastAPI. The limiter is keyed by client IP (taking
X-Forwarded-For into account, since Render terminates TLS upstream).

Limits per endpoint are read from settings so tests / production can tune
them independently. Setting RATE_LIMIT_DISABLED=true skips enforcement —
useful for the test suite where determinism matters more than throttling.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import settings


def _client_ip(request) -> str:
    """Prefer the first IP in X-Forwarded-For (Render sets this), fall
    back to the direct peer address.
    """
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return get_remote_address(request)


limiter = Limiter(
    key_func=_client_ip,
    enabled=not settings.RATE_LIMIT_DISABLED,
    headers_enabled=True,  # adds X-RateLimit-Limit / -Remaining / -Reset headers
)
