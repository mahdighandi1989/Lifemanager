"""Route-level tests for /auth/* endpoints.

Covers the behavior the AC pinned:
    - register   -> 201 + access_token; duplicate email -> 409
    - login OK   -> 200 + access_token (validate_token reads it)
    - login bad  -> 401  ('Invalid email or password' generic message)
    - GET /auth/ -> 200  (legacy probe)

Rate-limit tests live in tests/test_rate_limiting.py — those flip the
RATE_LIMIT_DISABLED env around, which would interfere with these.
"""
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.database import Base, get_db
from app.main import app
from app.services import auth_service


@pytest_asyncio.fixture
async def client():
    """TestClient wired to a fresh in-memory SQLite DB.

    RATE_LIMIT_DISABLED is set in conftest.py before slowapi initializes the
    limiter, so we don't need to flip it here — these tests focus on
    status codes, not throttling.
    """
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def _get_db():
        async with factory() as s:
            yield s

    app.dependency_overrides[get_db] = _get_db
    # Reset slowapi's in-memory counter between tests so a previous test's
    # 6 hits don't bleed into the next one.
    if hasattr(app.state, "limiter"):
        app.state.limiter.reset()
    yield TestClient(app)
    app.dependency_overrides.clear()
    await engine.dispose()


def test_auth_root(client):
    """Legacy probe — was a placeholder, still must return 200."""
    r = client.get("/auth/")
    assert r.status_code == 200
    assert r.json() == {"message": "Auth endpoint"}


def test_register_creates_user(client):
    r = client.post(
        "/auth/register",
        json={"email": "a@b.com", "username": "al", "password": "hunter2!"},
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
    # Token must validate via the canonical validator.
    assert auth_service.validate_token(body["access_token"]) is not None


def test_register_rejects_duplicate_email(client):
    payload = {"email": "dup@b.com", "username": "u1", "password": "pw"}
    r1 = client.post("/auth/register", json=payload)
    assert r1.status_code == 201
    r2 = client.post(
        "/auth/register",
        json={"email": "dup@b.com", "username": "u2", "password": "pw"},
    )
    assert r2.status_code == 409


def test_login_with_correct_password_returns_200(client):
    client.post(
        "/auth/register",
        json={"email": "ok@b.com", "username": "ok", "password": "right-pw"},
    )
    r = client.post(
        "/auth/login",
        json={"email": "ok@b.com", "password": "right-pw"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert "access_token" in body
    assert auth_service.validate_token(body["access_token"]) is not None


def test_login_wrong_password_returns_401(client):
    """AC: status code 401 for wrong password (NOT 500)."""
    client.post(
        "/auth/register",
        json={"email": "u@b.com", "username": "u", "password": "right-pw"},
    )
    r = client.post(
        "/auth/login",
        json={"email": "u@b.com", "password": "WRONG"},
    )
    assert r.status_code == 401
    body = r.json()
    # Generic message — must NOT reveal whether the email exists.
    assert body == {"detail": "Invalid email or password"}
    assert r.headers.get("www-authenticate", "").lower() == "bearer"


def test_login_unknown_user_also_returns_401(client):
    """Same 401 + same message for an unknown email so we don't leak the
    user-existence side-channel."""
    r = client.post(
        "/auth/login",
        json={"email": "ghost@b.com", "password": "anything"},
    )
    assert r.status_code == 401
    assert r.json() == {"detail": "Invalid email or password"}
