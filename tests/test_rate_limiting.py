"""Rate-limit behaviour tests.

These tests flip RATE_LIMIT_DISABLED off at the Limiter level and set
tight per-test limits via the shared settings object. The decorators in
app/routes/auth.py read settings.RATE_LIMIT_* at request time, so we can
override the limit values without reloading the app module.

conftest.py defaults RATE_LIMIT_DISABLED=true for the rest of the suite.
"""
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.config import settings
from app.database import Base, get_db
from app.main import app


@pytest_asyncio.fixture
async def rate_limited_client(monkeypatch):
    """TestClient with the slowapi limiter enabled and tight per-test limits."""
    # Enable enforcement on the live limiter and tighten the limit values
    # the route decorators read at request time.
    monkeypatch.setattr(app.state.limiter, "enabled", True)
    monkeypatch.setattr(settings, "RATE_LIMIT_LOGIN", "2/minute")
    monkeypatch.setattr(settings, "RATE_LIMIT_REGISTER", "2/hour")
    app.state.limiter.reset()

    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def _get_db():
        async with factory() as s:
            yield s

    app.dependency_overrides[get_db] = _get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
    app.state.limiter.reset()
    await engine.dispose()


def test_rate_limit(rate_limited_client):
    """AC catch-all node — verifies the basic 'too many requests trip 429'
    behaviour. Named `test_rate_limit` to match the AC's test_node hint.
    """
    c = rate_limited_client
    # Under the 2/minute quota
    c.post("/auth/login", json={"email": "x@x.com", "password": "wrong"})
    c.post("/auth/login", json={"email": "x@x.com", "password": "wrong"})
    over = c.post("/auth/login", json={"email": "x@x.com", "password": "wrong"})
    assert over.status_code == 429


def test_login_returns_429_after_limit_exceeded(rate_limited_client):
    """AC: 5+ failed login attempts -> 429. Tightened here to 2/minute."""
    c = rate_limited_client
    r1 = c.post("/auth/login", json={"email": "x@x.com", "password": "wrong"})
    r2 = c.post("/auth/login", json={"email": "x@x.com", "password": "wrong"})
    assert r1.status_code == 401
    assert r2.status_code == 401
    r3 = c.post("/auth/login", json={"email": "x@x.com", "password": "wrong"})
    assert r3.status_code == 429, f"expected 429, got {r3.status_code}: {r3.text}"


def test_429_response_has_ratelimit_headers(rate_limited_client):
    """AC: X-RateLimit-Remaining must be on the rate-limited response."""
    c = rate_limited_client
    for _ in range(2):
        c.post("/auth/login", json={"email": "x@x.com", "password": "wrong"})
    over = c.post("/auth/login", json={"email": "x@x.com", "password": "wrong"})
    assert over.status_code == 429
    keys = {k.lower() for k in over.headers.keys()}
    assert "x-ratelimit-remaining" in keys
    # slowapi can stamp the header from both the route decorator and the
    # exception handler (it then appears as "0, 0"); either form must report
    # a remaining quota of 0.
    remaining_values = [
        v.strip() for v in over.headers["x-ratelimit-remaining"].split(",")
    ]
    assert "0" in remaining_values, over.headers["x-ratelimit-remaining"]


def test_register_returns_429_after_limit_exceeded(rate_limited_client):
    """AC: 3+ registrations/hour -> 429. Tightened here to 2/hour."""
    c = rate_limited_client
    payload_a = {"email": "a@b.com", "username": "a", "password": "passwordA1"}
    payload_b = {"email": "c@b.com", "username": "c", "password": "passwordB2"}
    payload_c = {"email": "d@b.com", "username": "d", "password": "passwordC3"}
    assert c.post("/auth/register", json=payload_a).status_code == 201
    assert c.post("/auth/register", json=payload_b).status_code == 201
    over = c.post("/auth/register", json=payload_c)
    assert over.status_code == 429


def test_rate_limit_resets_for_separate_window(rate_limited_client):
    """A reset (simulates window expiry) drops the counter back to zero."""
    c = rate_limited_client
    for _ in range(2):
        c.post("/auth/login", json={"email": "x@x.com", "password": "wrong"})
    assert (
        c.post("/auth/login", json={"email": "x@x.com", "password": "wrong"}).status_code
        == 429
    )
    app.state.limiter.reset()
    r = c.post("/auth/login", json={"email": "x@x.com", "password": "wrong"})
    assert r.status_code == 401, "after reset, the limiter releases the IP"


def test_rate_limit_is_environment_configurable():
    """AC: rate-limit values come from environment-driven Settings."""
    # The Settings class declares these as fields, which means they're
    # picked up from env (RATE_LIMIT_LOGIN, RATE_LIMIT_REGISTER) on import.
    fields = settings.__class__.model_fields
    assert "RATE_LIMIT_LOGIN" in fields
    assert "RATE_LIMIT_REGISTER" in fields


# ── dict-returning @limiter.limit endpoints need a `response: Response` ────────
# Regression for the 2026-07-21 production 500: an endpoint that is
# @limiter.limit-guarded AND returns a plain dict must declare a
# `response: Response` parameter, or slowapi's post-call header injection
# raises "parameter `response` must be an instance of starlette.responses.
# Response". Rate-limiting is DISABLED for the rest of the suite, so these are
# the only tests that exercise the header-injection path — the bug was
# invisible everywhere else.
def test_backup_run_under_active_limiter_returns_200_not_500(
    rate_limited_client, tmp_path, monkeypatch
):
    from app.services import backup_service

    monkeypatch.setattr(backup_service, "BACKUPS_DIR", tmp_path / "backups")

    async def _no_client(db):
        return None

    monkeypatch.setattr("app.services.google_api_client.build_drive_client", _no_client)
    monkeypatch.delenv("GOOGLE_DRIVE_REFRESH_TOKEN", raising=False)
    monkeypatch.delenv("GOOGLE_SHEETS_REFRESH_TOKEN", raising=False)

    r = rate_limited_client.post("/api/backup/run")
    assert r.status_code == 200, r.text  # NOT 500 from slowapi header injection
    assert r.json()["ok"] is True
    keys = {k.lower() for k in r.headers.keys()}
    assert "x-ratelimit-limit" in keys or "x-ratelimit-remaining" in keys


def test_assistant_chat_under_active_limiter_returns_200_not_500(rate_limited_client):
    # answer_question never raises and returns a dict even with no AI model,
    # so a 200 here proves the slowapi header injection succeeded.
    r = rate_limited_client.post("/api/ai/chat", json={"message": "سلام"})
    assert r.status_code == 200, r.text  # NOT 500 from slowapi header injection
    keys = {k.lower() for k in r.headers.keys()}
    assert "x-ratelimit-limit" in keys or "x-ratelimit-remaining" in keys
