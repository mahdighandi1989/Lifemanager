"""Behaviour tests for the critical Google-OAuth auth routes (security
task b4a3c74f).

``app/routes/auth_google.py`` carries the highest-risk surfaces in the
codebase: the OAuth callback that mints a JWT and sets the auth cookie,
plus the admin-only endpoints that list and approve pending users. No
direct test covered the *route behaviour* before — only the conditional
mount (tests/test_auth_google_mount.py). This file pins:

  * /auth/google/callback — every branch (exchange failure, missing
    id_token, token-verify failure, missing email, pending vs approved
    redirect, cookie issuance).
  * /admin/pending-users and /admin/approve-user/{id} — the RBAC gate
    (non-admin → 403) and the happy path / 404-not-found for admins.
  * /auth/me, /auth/logout, /auth/google redirect + 500-when-unconfigured.

The auth_google router is INTENTIONALLY UNMOUNTED on the real app unless
GOOGLE_CLIENT_ID is configured (see app/main.py), so these tests build a
dedicated FastAPI app, ``include_router`` it, and override get_db /
get_current_user just like the production wiring would. The network-bound
Google service calls (exchange_code_for_token / verify_google_token) are
monkeypatched at the route module's namespace; the DB-bound service calls
(get_or_create_user / get_all_pending_users / approve_user) run for real
against a per-test in-memory SQLite engine so contract drift fails loudly.
"""
from __future__ import annotations

import pytest
import pytest_asyncio
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.database import Base, get_db
from app.dependencies.auth import get_current_user
from app.models.user_oauth import OAuthUser, UserPermission, UserRole
from app.routes import auth_google


# --- Fixtures --------------------------------------------------------------


@pytest_asyncio.fixture
async def oauth_app():
    """A FastAPI app with ONLY the auth_google router mounted, backed by a
    fresh in-memory SQLite engine.

    Yields ``(client, factory, set_current_user)`` where:
      * ``client`` is a TestClient that does NOT follow redirects (so the
        302 from the callback and its Set-Cookie are observable),
      * ``factory`` is the async_sessionmaker for seeding rows directly,
      * ``set_current_user(user)`` installs a get_current_user override.
    """
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def _get_db():
        async with factory() as session:
            yield session

    app = FastAPI()
    app.include_router(auth_google.router)
    app.dependency_overrides[get_db] = _get_db

    def set_current_user(user):
        app.dependency_overrides[get_current_user] = lambda: user

    client = TestClient(app, follow_redirects=False)
    try:
        yield client, factory, set_current_user
    finally:
        app.dependency_overrides.clear()
        await engine.dispose()


async def _seed_user(factory, *, email, name=None, role, permissions, status):
    """Insert an OAuthUser row and return its refreshed instance."""
    async with factory() as session:
        user = OAuthUser(
            email=email,
            name=name,
            role=role,
            permissions=permissions,
            status=status,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


def _admin_namespace(**overrides):
    """A lightweight object that satisfies is_admin() as an admin."""
    from types import SimpleNamespace

    defaults = dict(
        id=999,
        email="admin@example.com",
        name="Admin",
        role=UserRole.ADMIN,
        permissions=UserPermission.ADMIN,
        status="approved",
    )
    defaults.update(overrides)
    return SimpleNamespace(**defaults)


def _nonadmin_namespace(**overrides):
    from types import SimpleNamespace

    defaults = dict(
        id=500,
        email="user@example.com",
        name="Regular",
        role=UserRole.APPROVED,
        permissions=UserPermission.READ_ONLY,
        status="approved",
    )
    defaults.update(overrides)
    return SimpleNamespace(**defaults)


# --- /auth/google/callback -------------------------------------------------


@pytest.mark.asyncio
async def test_callback_approved_user_redirects_to_dashboard_with_cookie(
    oauth_app, monkeypatch
):
    """A fully approved user is redirected to /dashboard and handed the
    Bearer cookie. This is the core 'logged in' path."""
    client, factory, _ = oauth_app

    async def fake_exchange(code):
        assert code == "good-code"
        return {"id_token": "id-tok"}

    async def fake_verify(id_token):
        return {"email": "approved@example.com", "name": "Approved"}

    monkeypatch.setattr(auth_google, "exchange_code_for_token", fake_exchange)
    monkeypatch.setattr(auth_google, "verify_google_token", fake_verify)

    # Seed an already-approved user so get_or_create_user returns it.
    await _seed_user(
        factory,
        email="approved@example.com",
        role=UserRole.APPROVED,
        permissions=UserPermission.READ_ONLY,
        status="approved",
    )

    resp = client.get("/auth/google/callback", params={"code": "good-code"})

    assert resp.status_code == 302
    assert resp.headers["location"] == "/dashboard"
    set_cookie = resp.headers.get("set-cookie", "")
    assert "access_token=" in set_cookie
    assert "Bearer" in set_cookie
    assert "httponly" in set_cookie.lower()


@pytest.mark.asyncio
async def test_callback_pending_user_redirects_to_pending_no_cookie(
    oauth_app, monkeypatch
):
    """A brand-new (non-admin) user is created with status 'pending' and
    bounced to /auth/pending — and must NOT receive an auth cookie."""
    client, factory, _ = oauth_app

    async def fake_exchange(code):
        return {"id_token": "id-tok"}

    async def fake_verify(id_token):
        return {"email": "newcomer@example.com", "name": "Newcomer"}

    monkeypatch.setattr(auth_google, "exchange_code_for_token", fake_exchange)
    monkeypatch.setattr(auth_google, "verify_google_token", fake_verify)

    resp = client.get("/auth/google/callback", params={"code": "c"})

    assert resp.status_code == 302
    assert resp.headers["location"] == "/auth/pending"
    assert "access_token=" not in resp.headers.get("set-cookie", "")

    # The user really was persisted as pending.
    from sqlalchemy import select

    async with factory() as session:
        row = (
            await session.execute(
                select(OAuthUser).where(OAuthUser.email == "newcomer@example.com")
            )
        ).scalar_one()
        assert row.status == "pending"
        assert row.role == UserRole.PENDING


@pytest.mark.asyncio
async def test_callback_exchange_failure_returns_400(oauth_app, monkeypatch):
    """If the code→token exchange fails, the callback must 400 and never
    touch the user store."""
    client, _, _ = oauth_app

    async def fake_exchange(code):
        return None

    monkeypatch.setattr(auth_google, "exchange_code_for_token", fake_exchange)

    resp = client.get("/auth/google/callback", params={"code": "bad"})
    assert resp.status_code == 400
    assert "exchange" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_callback_missing_id_token_returns_400(oauth_app, monkeypatch):
    """A token response without an id_token is rejected with 400."""
    client, _, _ = oauth_app

    async def fake_exchange(code):
        return {"access_token": "only-access"}  # no id_token

    monkeypatch.setattr(auth_google, "exchange_code_for_token", fake_exchange)

    resp = client.get("/auth/google/callback", params={"code": "c"})
    assert resp.status_code == 400
    assert "id token" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_callback_token_verify_failure_returns_400(oauth_app, monkeypatch):
    """If Google won't verify the id_token, the callback 400s."""
    client, _, _ = oauth_app

    async def fake_exchange(code):
        return {"id_token": "tampered"}

    async def fake_verify(id_token):
        return None

    monkeypatch.setattr(auth_google, "exchange_code_for_token", fake_exchange)
    monkeypatch.setattr(auth_google, "verify_google_token", fake_verify)

    resp = client.get("/auth/google/callback", params={"code": "c"})
    assert resp.status_code == 400
    assert "verify" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_callback_missing_email_returns_400(oauth_app, monkeypatch):
    """A verified token with no email claim cannot be trusted to identify a
    user — must 400 rather than create an emailless account."""
    client, _, _ = oauth_app

    async def fake_exchange(code):
        return {"id_token": "id-tok"}

    async def fake_verify(id_token):
        return {"name": "No Email"}  # email missing

    monkeypatch.setattr(auth_google, "exchange_code_for_token", fake_exchange)
    monkeypatch.setattr(auth_google, "verify_google_token", fake_verify)

    resp = client.get("/auth/google/callback", params={"code": "c"})
    assert resp.status_code == 400
    assert "email" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_callback_requires_code_param(oauth_app):
    """The callback's ``code`` is a required query param — omitting it is a
    422 from FastAPI validation, never an unhandled 500."""
    client, _, _ = oauth_app
    resp = client.get("/auth/google/callback")
    assert resp.status_code == 422


# --- /admin/pending-users (RBAC) -------------------------------------------


@pytest.mark.asyncio
async def test_pending_users_listed_for_admin(oauth_app):
    """An admin sees exactly the users whose status is 'pending'."""
    client, factory, set_current_user = oauth_app

    await _seed_user(
        factory,
        email="p1@example.com",
        role=UserRole.PENDING,
        permissions=UserPermission.READ_ONLY,
        status="pending",
    )
    await _seed_user(
        factory,
        email="p2@example.com",
        role=UserRole.PENDING,
        permissions=UserPermission.READ_ONLY,
        status="pending",
    )
    await _seed_user(
        factory,
        email="approved@example.com",
        role=UserRole.APPROVED,
        permissions=UserPermission.EDITOR,
        status="approved",
    )

    set_current_user(_admin_namespace())
    resp = client.get("/admin/pending-users")

    assert resp.status_code == 200
    emails = {u["email"] for u in resp.json()}
    assert emails == {"p1@example.com", "p2@example.com"}


@pytest.mark.asyncio
async def test_pending_users_forbidden_for_non_admin(oauth_app):
    """A non-admin caller is rejected with 403 — the core access-control
    invariant of the admin panel."""
    client, factory, set_current_user = oauth_app

    await _seed_user(
        factory,
        email="p1@example.com",
        role=UserRole.PENDING,
        permissions=UserPermission.READ_ONLY,
        status="pending",
    )

    set_current_user(_nonadmin_namespace())
    resp = client.get("/admin/pending-users")

    assert resp.status_code == 403
    assert "admin" in resp.json()["detail"].lower()


# --- /admin/approve-user/{id} (RBAC + behaviour) ---------------------------


@pytest.mark.asyncio
async def test_approve_user_promotes_pending_user_for_admin(oauth_app):
    """An admin approving a pending user flips status→approved, role→
    approved, and applies the requested permission tier."""
    client, factory, set_current_user = oauth_app

    pending = await _seed_user(
        factory,
        email="promoteme@example.com",
        role=UserRole.PENDING,
        permissions=UserPermission.READ_ONLY,
        status="pending",
    )

    set_current_user(_admin_namespace())
    resp = client.post(
        f"/admin/approve-user/{pending.id}", params={"permissions": "editor"}
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "approved"
    assert body["role"] == "approved"
    assert body["permissions"] == "editor"

    # Persisted, not just echoed.
    from sqlalchemy import select

    async with factory() as session:
        row = (
            await session.execute(
                select(OAuthUser).where(OAuthUser.id == pending.id)
            )
        ).scalar_one()
        assert row.status == "approved"
        assert row.permissions == UserPermission.EDITOR


@pytest.mark.asyncio
async def test_approve_user_forbidden_for_non_admin(oauth_app):
    """A non-admin cannot approve anyone — 403, and the target stays
    pending (privilege-escalation guard)."""
    client, factory, set_current_user = oauth_app

    pending = await _seed_user(
        factory,
        email="victim@example.com",
        role=UserRole.PENDING,
        permissions=UserPermission.READ_ONLY,
        status="pending",
    )

    set_current_user(_nonadmin_namespace())
    resp = client.post(f"/admin/approve-user/{pending.id}")

    assert resp.status_code == 403

    from sqlalchemy import select

    async with factory() as session:
        row = (
            await session.execute(
                select(OAuthUser).where(OAuthUser.id == pending.id)
            )
        ).scalar_one()
        assert row.status == "pending"  # untouched


@pytest.mark.asyncio
async def test_approve_unknown_user_returns_404_for_admin(oauth_app):
    """Approving a non-existent user id is a 404, not a 500."""
    client, _, set_current_user = oauth_app

    set_current_user(_admin_namespace())
    resp = client.post("/admin/approve-user/123456")

    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_approve_user_defaults_to_read_only(oauth_app):
    """Omitting ``permissions`` defaults the approved user to read-only."""
    client, factory, set_current_user = oauth_app

    pending = await _seed_user(
        factory,
        email="defaultperm@example.com",
        role=UserRole.PENDING,
        permissions=UserPermission.READ_ONLY,
        status="pending",
    )

    set_current_user(_admin_namespace())
    resp = client.post(f"/admin/approve-user/{pending.id}")

    assert resp.status_code == 200
    assert resp.json()["permissions"] == "read-only"


@pytest.mark.asyncio
async def test_admin_recognised_via_email_bootstrap(oauth_app):
    """is_admin also honours the ADMIN_EMAILS bootstrap list — a user with a
    non-admin role but an admin email still passes the gate. conftest seeds
    ADMIN_EMAILS=mohamad.mahdi1988@gmail.com."""
    client, factory, set_current_user = oauth_app

    await _seed_user(
        factory,
        email="p1@example.com",
        role=UserRole.PENDING,
        permissions=UserPermission.READ_ONLY,
        status="pending",
    )

    bootstrap_admin = _nonadmin_namespace(
        email="mohamad.mahdi1988@gmail.com",
        role=UserRole.APPROVED,
        permissions=UserPermission.READ_ONLY,
    )
    set_current_user(bootstrap_admin)
    resp = client.get("/admin/pending-users")

    assert resp.status_code == 200
    assert {u["email"] for u in resp.json()} == {"p1@example.com"}


# --- /auth/me, /auth/logout, /auth/google ----------------------------------


@pytest.mark.asyncio
async def test_me_returns_current_user(oauth_app):
    """/auth/me echoes the authenticated user's public profile."""
    client, _, set_current_user = oauth_app

    set_current_user(
        _nonadmin_namespace(
            id=42, email="me@example.com", name="Me", created_at=None
        )
    )
    resp = client.get("/auth/me")

    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == "me@example.com"
    assert body["id"] == 42


@pytest.mark.asyncio
async def test_logout_redirects_home_and_clears_cookie(oauth_app):
    """/auth/logout redirects to / and deletes the access_token cookie."""
    client, _, _ = oauth_app

    resp = client.get("/auth/logout")

    assert resp.status_code == 302
    assert resp.headers["location"] == "/"
    set_cookie = resp.headers.get("set-cookie", "")
    assert "access_token=" in set_cookie
    # A deletion is expressed as an immediate expiry.
    assert "max-age=0" in set_cookie.lower() or "expires=" in set_cookie.lower()


@pytest.mark.asyncio
async def test_google_login_serves_gis_page_when_configured(oauth_app, monkeypatch):
    """/auth/google serves the Google Identity Services sign-in page.

    Contract change, deliberately (see ``google_login``'s docstring): the
    entry point used to 302 to Google's classic consent screen, which
    required a configured ``GOOGLE_REDIRECT_URI`` matching the deployment
    origin. It now renders the in-browser GIS credential flow instead, so
    the operator only has to authorise the origin. The redirect half of the
    classic flow is NOT gone — ``/auth/google/callback`` still exchanges a
    ``code`` (covered above) — only this entry point changed shape.

    The test previously asserted the old 302 and had been failing ever
    since the switch; it is realigned to the live contract, and the two
    things that actually matter are what it now pins: the page is served,
    and it carries the configured client id (without it the GIS button
    renders but can never mint a credential).
    """
    client, _, _ = oauth_app
    monkeypatch.setattr(
        auth_google.settings, "GOOGLE_CLIENT_ID", "cid.apps.googleusercontent.com"
    )

    resp = client.get("/auth/google")

    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/html")
    body = resp.text
    assert "cid.apps.googleusercontent.com" in body
    # the GIS client library and the POST-back endpoint that mints our cookie
    assert "accounts.google.com/gsi/client" in body
    assert "/auth/google/token" in body


@pytest.mark.asyncio
async def test_google_login_500_when_unconfigured(oauth_app, monkeypatch):
    """Without GOOGLE_CLIENT_ID the login route refuses with a 500 rather
    than redirecting to a broken consent URL."""
    client, _, _ = oauth_app
    monkeypatch.setattr(auth_google.settings, "GOOGLE_CLIENT_ID", "")

    resp = client.get("/auth/google")

    assert resp.status_code == 500
    assert "not configured" in resp.json()["detail"].lower()
