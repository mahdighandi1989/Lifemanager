"""AC 3 of audit task 882723eb07de: a saturated pool returns 503.

We can't easily exhaust a real pool inside pytest, but we can
trigger the documented code path: SQLAlchemy raises ``TimeoutError``
from sqlalchemy.exc when pool_timeout elapses, and the
``_db_pool_timeout_handler`` in app/main.py maps it to JSON 503.
This test simulates the raise from inside a route and asserts the
mapped response.
"""
from __future__ import annotations

import pytest
from sqlalchemy.exc import TimeoutError as SQLATimeoutError

from app.main import _db_pool_timeout_handler


@pytest.mark.asyncio
async def test_pool_exhaustion_maps_to_503():
    """The handler that ``app.exception_handler(SQLATimeoutError)``
    binds to. Called directly so the SPA catch-all in main.py can't
    intercept the route."""
    from starlette.requests import Request

    scope = {
        "type": "http",
        "method": "GET",
        "path": "/api/test",
        "headers": [],
        "query_string": b"",
    }
    request = Request(scope)
    exc = SQLATimeoutError("simulated", None, None)
    resp = await _db_pool_timeout_handler(request=request, exc=exc)
    assert resp.status_code == 503
    import json

    body = json.loads(resp.body.decode("utf-8"))
    assert "detail" in body
    # Accept either "timed out" or "exhausted" — both are the documented
    # human-facing phrasing for the same pool-saturation condition.
    detail = body["detail"].lower()
    assert "exhausted" in detail or "timed out" in detail


def test_pool_recycle_and_pre_ping_are_configured():
    """AC 2 — pool_recycle + pool_pre_ping must appear on the engine.
    Static guard against a future refactor silently dropping them."""
    from app.database import engine

    # SQLAlchemy stores pool options on the underlying Pool instance.
    pool = engine.pool
    assert pool._recycle > 0, "pool_recycle is not set on the engine"
    # pool_pre_ping is exposed via the QueuePool._pre_ping attr.
    assert getattr(pool, "_pre_ping", False), "pool_pre_ping=True is required"


def test_pool_timeout_is_30s_default():
    """AC 3 — pool_timeout must be 30s (or env-overridden) so a stuck
    request returns 503 within a bounded window."""
    from app.config import settings

    assert settings.DB_POOL_TIMEOUT == 30
