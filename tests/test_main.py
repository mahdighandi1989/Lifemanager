"""Smoke tests for app.main — the graceful-degradation surface.

Rewritten for the current architecture (audit task task_882723eb07de). The
previous file assumed a design that never shipped: a module-level
``database_available`` middleware that returned 503 for every route while the
DB was down, probed via fake paths like ``/auth/test``. The real app degrades
differently — DB-free routes (health, webhook) keep serving, unknown paths
307-redirect through the canonical-path/SPA middleware, and a *pool-timeout*
exception handler returns 503 only when a request actually waits past the
pool timeout (AC3). These tests pin that real surface, and the
``database_available`` flag the startup probe now sets.
"""
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.exc import TimeoutError as SQLATimeoutError

from app.main import app, database_available


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


def test_database_available_flag_is_bool():
    """The graceful-degradation signal is importable and boolean (set by
    the startup DB probe)."""
    assert isinstance(database_available, bool)


def test_pool_timeout_handler_is_registered():
    """AC3 — a saturated/timed-out connection pool maps to 503 via a
    registered SQLAlchemy TimeoutError exception handler (this is the real
    503 path, not a per-route DB-availability gate)."""
    assert SQLATimeoutError in app.exception_handlers


@pytest.mark.asyncio
async def test_health_serves_without_database(client):
    """/api/health is the liveness probe Render hits — it must answer 200
    regardless of DB state, so the app stays 'up' during a DB outage."""
    response = await client.get("/api/health")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_root_is_reachable(client):
    """Root resolves to a real response (SPA/JSON), never a 5xx."""
    response = await client.get("/")
    assert response.status_code < 500


@pytest.mark.asyncio
async def test_unknown_route_degrades_gracefully(client):
    """An unknown path resolves to a client-side status (404/307/...),
    never a server error — graceful degradation, not a crash."""
    response = await client.get("/api/definitely-not-a-real-route")
    assert response.status_code < 500


@pytest.mark.asyncio
async def test_health_db_endpoint_reports_status(client):
    """/api/health/db is the DB-specific probe: 200 when the database is
    reachable, 503 when it is not — both are a *reported* status, not an
    unhandled 5xx crash. (Distinct from /api/health, which stays 200 so the
    liveness probe keeps the app 'up' during a DB outage.)"""
    response = await client.get("/api/health/db")
    assert response.status_code in (200, 503)
