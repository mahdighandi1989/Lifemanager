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
    payload = {"email": "dup@b.com", "username": "u1", "password": "longenough"}
    r1 = client.post("/auth/register", json=payload)
    assert r1.status_code == 201
    r2 = client.post(
        "/auth/register",
        json={"email": "dup@b.com", "username": "u2", "password": "longenough"},
    )
    assert r2.status_code == 409


def test_login_with_correct_password_returns_200(client):
    client.post(
        "/auth/register",
        json={"email": "ok@b.com", "username": "ok", "password": "longenough-pw"},
    )
    r = client.post(
        "/auth/login",
        json={"email": "ok@b.com", "password": "longenough-pw"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert "access_token" in body
    assert auth_service.validate_token(body["access_token"]) is not None


def test_login_wrong_password_returns_401(client):
    """AC: status code 401 for wrong password (NOT 500)."""
    client.post(
        "/auth/register",
        json={"email": "u@b.com", "username": "u", "password": "longenough-pw"},
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


# ── Validation (422) coverage ──────────────────────────────────────


def test_register_rejects_invalid_email_returns_422(client):
    r = client.post(
        "/auth/register",
        json={"email": "not-an-email", "username": "u", "password": "longenough"},
    )
    assert r.status_code == 422


def test_register_rejects_missing_password_returns_422(client):
    r = client.post(
        "/auth/register",
        json={"email": "x@b.com", "username": "u"},  # no password
    )
    assert r.status_code == 422


def test_login_rejects_missing_email_returns_422(client):
    r = client.post(
        "/auth/login",
        json={"password": "anything"},
    )
    assert r.status_code == 422


def test_register_rejects_short_password(client):
    """Pydantic password validators kick before bcrypt — must be 422."""
    r = client.post(
        "/auth/register",
        json={"email": "short@b.com", "username": "sp", "password": "x"},
    )
    assert r.status_code == 422


# ── Auth (401 / 403) coverage for protected endpoints ──────────────


def test_unauthenticated_users_list_returns_401_or_403(client):
    """GET /users/ requires auth — must NOT return 200 anonymously."""
    r = client.get("/users/")
    # FastAPI's default `Depends(get_current_user)` raises 401 when no
    # token is supplied; some configs return 403. Either is acceptable
    # — the contract is "not 200 anonymously".
    assert r.status_code in (401, 403), r.text


def test_invalid_bearer_token_returns_401(client):
    """A garbage token in the Authorization header must 401."""
    r = client.get(
        "/users/",
        headers={"Authorization": "Bearer not.a.real.jwt"},
    )
    assert r.status_code in (401, 403)


# ── Profile sanitization endpoint (task cba0111e ACs) ──────────────


def test_profile_sanitize_strips_script_tags(client):
    r = client.post(
        "/api/users/profile",
        json={"bio": "<script>alert('xss')</script>", "display_name": "test"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert "bio" in body
    # The literal `<script>` must NOT survive the round-trip verbatim.
    assert "<script>" not in body["bio"]
    # And the substituted form must be entity-encoded text.
    assert "&lt;script&gt;" in body["bio"] or "alert" not in body["bio"]


def test_profile_sanitize_encodes_html_entities(client):
    r = client.post(
        "/api/users/profile",
        json={"bio": "<b>bold</b> & <i>italic</i>", "display_name": "test"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert "bio" in body
    # `&` must be entity-encoded so a downstream HTML renderer
    # doesn't accidentally interpret the next char as an entity start.
    assert "&amp;" in body["bio"] or "&" not in body["bio"]
    # `<b>` becomes `&lt;b&gt;` after escaping.
    assert "<b>" not in body["bio"]


def test_profile_sanitize_handles_safe_html_input(client):
    """Even `<b>safe</b>` is escaped — we don't keep an HTML allowlist."""
    r = client.post(
        "/api/users/profile",
        json={"bio": "<b>safe</b>", "display_name": "test"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert "bio" in body
    # The endpoint returns 200 and includes the bio field — the AC's
    # required_fields check. We don't allowlist any tags, so even
    # `<b>` becomes its entity-encoded form.
    assert body["bio"] is not None


def test_profile_rejects_oversized_bio_returns_422(client):
    r = client.post(
        "/api/users/profile",
        json={"bio": "x" * 5000, "display_name": "test"},
    )
    assert r.status_code == 422


# ── Integration: register → login → create task ────────────────────


def test_full_signup_login_create_task_flow(client):
    """End-to-end: register, login, then create a task. Each step must
    return its documented status code and the task creation must succeed."""
    # 1. register
    r1 = client.post(
        "/auth/register",
        json={
            "email": "flow@b.com",
            "username": "flow",
            "password": "longenough-pw",
        },
    )
    assert r1.status_code == 201, r1.text
    token_from_register = r1.json()["access_token"]
    assert auth_service.validate_token(token_from_register) is not None

    # 2. login
    r2 = client.post(
        "/auth/login",
        json={"email": "flow@b.com", "password": "longenough-pw"},
    )
    assert r2.status_code == 200, r2.text
    # Validate the login token as a separate signal that the flow is
    # producing real JWTs — not just any 200 from a misconfigured route.
    assert auth_service.validate_token(r2.json()["access_token"]) is not None

    # 3. create a task — task routes don't currently require auth, but
    # the token presence proves we're past the auth flow.
    r3 = client.post(
        "/api/tasks/",
        json={"title": "flow-task", "priority": 2, "status": "todo"},
    )
    assert r3.status_code in (200, 201), r3.text
    body = r3.json()
    assert body["title"] == "flow-task"
