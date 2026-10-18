"""Per-user data scope for Google accounts + one birth date per user (2026-10-18).

Decided plan: docs/decisions/2026-10-18-age-and-user-scope.md items 1 and 2.

Pinned here:
  * the OWNER's Google account keeps the shared scope 0 exactly as before;
  * any OTHER approved Google account resolves to its own users.id and sees
    none of scope 0's app records or identity fields;
  * local password accounts, anonymous callers and pending/rejected Google
    accounts behave exactly as before;
  * PER_USER_OAUTH_SCOPE=false restores the old «everyone → 0» mapping;
  * the birth date is optional at registration, stored as a DATE in the
    owner-identity store of that user, validated (real, past, ≥ 1900), and
    readable/writable by the signed-in user via /api/me/date-of-birth.
"""
import asyncio
import datetime as dt

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.config import settings
from app.database import Base, get_db
from app.main import app
from app.models.owner_identity import OwnerIdentityField
from app.models.user import User
from app.models.user_oauth import OAuthUser, UserPermission, UserRole
from app.services import auth_service
from app.services.google_auth import create_jwt_token

OWNER = "mohamad.mahdi1988@gmail.com"  # the ADMIN_EMAILS bootstrap seeded by tests/conftest.py
APP_URL = "/api/app-records/learning-architecture"


@pytest_asyncio.fixture
async def env():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def _get_db():
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = _get_db
    async with factory() as s:
        # the anon anchor row app/main.py seeds on startup
        s.add(User(id=0, email="anon@lifemanager.local", username="anon", hashed_password="!"))
        s.add_all([
            OAuthUser(id=1, email=OWNER, role=UserRole.ADMIN, permissions=UserPermission.ADMIN, status="approved"),
            OAuthUser(id=2, email="second@example.com", role=UserRole.APPROVED,
                      permissions=UserPermission.EDITOR, status="approved", name="Second"),
            OAuthUser(id=3, email="pending@example.com", status="pending"),
            OAuthUser(id=4, email="rejected@example.com", status="rejected"),
            User(id=50, email="local@example.com", username="local", hashed_password="x"),
        ])
        # the owner's existing data in scope 0
        s.add(OwnerIdentityField(user_id=0, field="date_of_birth", label_fa="تاریخ تولد",
                                 value="1988-03-08", owner_locked=True, source="owner"))
        s.add(OwnerIdentityField(user_id=0, field="full_name", label_fa="نام کامل",
                                 value="OWNER NAME", owner_locked=True, source="owner"))
        await s.commit()
        oauth = {i: create_jwt_token(await s.get(OAuthUser, i)) for i in (1, 2, 3, 4)}
    local = auth_service.create_access_token(data={"sub": "50", "email": "local@example.com"})
    client = TestClient(app)
    yield {"client": client, "factory": factory, "oauth": oauth, "local": local}
    app.dependency_overrides.clear()
    await engine.dispose()


def _h(tok):
    return {"Authorization": f"Bearer {tok}"}


async def _scope(factory, token):
    from app.dependencies.auth import _resolve_data_scope_user_id

    async with factory() as s:
        return await _resolve_data_scope_user_id(token, s)


# ── item 1: scope ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_owner_keeps_scope_zero(env):
    assert await _scope(env["factory"], env["oauth"][1]) == 0


@pytest.mark.asyncio
async def test_second_google_user_gets_own_stable_scope(env):
    first = await _scope(env["factory"], env["oauth"][2])
    again = await _scope(env["factory"], env["oauth"][2])
    assert first not in (0, None, 50)
    assert first == again
    async with env["factory"]() as s:
        row = await s.get(User, first)
        assert row.email.endswith("@oauth-scope.invalid")
        assert row.hashed_password == "!"
        assert (await s.execute(select(User).where(User.email.like("%oauth-scope.invalid")))).scalars().all().__len__() == 1


@pytest.mark.asyncio
async def test_local_pending_rejected_anon_unchanged(env):
    assert await _scope(env["factory"], env["local"]) == 50
    assert await _scope(env["factory"], env["oauth"][3]) == 0
    assert await _scope(env["factory"], env["oauth"][4]) == 0
    assert await _scope(env["factory"], "garbage") is None
    c = env["client"]
    assert c.get(APP_URL).status_code == 401                              # anon: signed-in route
    assert c.get(APP_URL, headers=_h(env["oauth"][3])).status_code == 403  # pending
    assert c.get(APP_URL, headers=_h(env["oauth"][4])).status_code == 403  # rejected


@pytest.mark.asyncio
async def test_flag_off_restores_shared_scope(env, monkeypatch):
    monkeypatch.setattr(settings, "PER_USER_OAUTH_SCOPE", False)
    assert await _scope(env["factory"], env["oauth"][2]) == 0
    assert await _scope(env["factory"], env["oauth"][1]) == 0


@pytest.mark.asyncio
async def test_owner_fallback_without_configured_emails(env, monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_EMAILS", "")
    monkeypatch.setattr(settings, "OWNER_EMAIL", "")
    # first Google account holding the admin role = the owner
    assert await _scope(env["factory"], env["oauth"][1]) == 0
    assert await _scope(env["factory"], env["oauth"][2]) not in (0, None)


@pytest.mark.asyncio
async def test_owner_email_setting_wins(env, monkeypatch):
    monkeypatch.setattr(settings, "OWNER_EMAIL", "Second@Example.com")
    assert await _scope(env["factory"], env["oauth"][2]) == 0
    assert await _scope(env["factory"], env["oauth"][1]) not in (0, None)


@pytest.mark.asyncio
async def test_second_user_sees_none_of_the_owners_records(env):
    c = env["client"]
    owner, second = _h(env["oauth"][1]), _h(env["oauth"][2])
    r = c.post(APP_URL + "/bulk", json={"records": [{"id": "settings", "type": "settings",
                                                       "profile": {"birth": "1988-03-08"}}]}, headers=owner)
    assert r.status_code == 200, r.text
    assert [x["id"] for x in c.get(APP_URL, headers=owner).json()["records"]] == ["settings"]
    assert c.get(APP_URL, headers=second).json()["records"] == []
    # and the second user's own writes stay out of scope 0
    c.post(APP_URL + "/bulk", json={"records": [{"id": "mine", "type": "note"}]}, headers=second)
    assert [x["id"] for x in c.get(APP_URL, headers=second).json()["records"]] == ["mine"]
    assert [x["id"] for x in c.get(APP_URL, headers=owner).json()["records"]] == ["settings"]


@pytest.mark.asyncio
async def test_second_user_sees_none_of_the_owners_identity(env):
    c = env["client"]
    mine = c.get("/api/identity-profile", headers=_h(env["oauth"][2])).json()
    assert all(not f["value"] for f in mine["fields"]), mine["fields"]
    assert c.get("/api/me/date-of-birth", headers=_h(env["oauth"][2])).json()["date_of_birth"] is None
    owner = c.get("/api/me/date-of-birth", headers=_h(env["oauth"][1])).json()
    assert owner["date_of_birth"] == "1988-03-08"


# ── item 2: date of birth ───────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_register_with_date_of_birth_stores_the_date_not_an_age(env):
    c = env["client"]
    r = c.post("/auth/register", json={"email": "new@example.com", "password": "password123",
                                       "username": "newbie", "date_of_birth": "2001-07-15"})
    assert r.status_code == 201, r.text
    tok = r.json()["access_token"]
    got = c.get("/api/me/date-of-birth", headers=_h(tok)).json()
    assert got["date_of_birth"] == "2001-07-15" and got["owner_locked"] is True
    async with env["factory"]() as s:
        uid = (await s.execute(select(User.id).where(User.email == "new@example.com"))).scalar_one()
        row = (await s.execute(select(OwnerIdentityField).where(
            OwnerIdentityField.user_id == uid, OwnerIdentityField.field == "date_of_birth"))).scalar_one()
        assert row.value == "2001-07-15"


@pytest.mark.asyncio
async def test_register_without_date_of_birth_unchanged(env):
    c = env["client"]
    r = c.post("/auth/register", json={"email": "plain@example.com", "password": "password123", "username": "plain"})
    assert r.status_code == 201, r.text
    r2 = c.post("/auth/register", json={"email": "plain2@example.com", "password": "password123",
                                        "username": "plain2", "date_of_birth": ""})
    assert r2.status_code == 201, r2.text
    assert c.get("/api/me/date-of-birth", headers=_h(r.json()["access_token"])).json()["date_of_birth"] is None


@pytest.mark.parametrize("bad", ["1899-12-31", "2999-01-01", "2023-02-30", "not a date"])
@pytest.mark.asyncio
async def test_register_rejects_invalid_birth_dates(env, bad):
    r = env["client"].post("/auth/register", json={"email": "x@example.com", "password": "password123",
                                                   "username": "x", "date_of_birth": bad})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_me_date_of_birth_roundtrip_and_validation(env):
    c = env["client"]
    h = _h(env["local"])
    assert c.get("/api/me/date-of-birth", headers=h).json()["date_of_birth"] is None
    r = c.put("/api/me/date-of-birth", json={"date_of_birth": "1975-11-02"}, headers=h)
    assert r.status_code == 200 and r.json()["date_of_birth"] == "1975-11-02" and r.json()["owner_locked"]
    tomorrow = (dt.date.today() + dt.timedelta(days=1)).isoformat()
    for bad in (tomorrow, dt.date.today().isoformat(), "1850-01-01", "31/02/1990", "abc"):
        assert c.put("/api/me/date-of-birth", json={"date_of_birth": bad}, headers=h).status_code == 422, bad
    assert c.get("/api/me/date-of-birth", headers=h).json()["date_of_birth"] == "1975-11-02"
    # clearing removes the value and the lock
    r = c.put("/api/me/date-of-birth", json={"date_of_birth": ""}, headers=h)
    assert r.json()["date_of_birth"] is None and r.json()["owner_locked"] is False


@pytest.mark.asyncio
async def test_me_date_of_birth_needs_a_signed_in_approved_user(env):
    c = env["client"]
    assert c.get("/api/me/date-of-birth").status_code == 401
    assert c.put("/api/me/date-of-birth", json={"date_of_birth": "1990-01-01"}).status_code == 401
    assert c.put("/api/me/date-of-birth", json={"date_of_birth": "1990-01-01"},
                 headers=_h(env["oauth"][3])).status_code == 403
    # owner's date untouched by any of the above
    assert c.get("/api/me/date-of-birth", headers=_h(env["oauth"][1])).json()["date_of_birth"] == "1988-03-08"


@pytest.mark.asyncio
async def test_second_user_write_does_not_touch_the_owners_birth_date(env):
    c = env["client"]
    c.put("/api/me/date-of-birth", json={"date_of_birth": "2010-04-04"}, headers=_h(env["oauth"][2]))
    assert c.get("/api/me/date-of-birth", headers=_h(env["oauth"][2])).json()["date_of_birth"] == "2010-04-04"
    assert c.get("/api/me/date-of-birth", headers=_h(env["oauth"][1])).json()["date_of_birth"] == "1988-03-08"


@pytest.mark.asyncio
async def test_identity_profile_put_validates_birth_date(env):
    c = env["client"]
    h = _h(env["local"])
    assert c.put("/api/identity-profile/date_of_birth", json={"value": "2999-01-01"}, headers=h).status_code == 400
    ok = c.put("/api/identity-profile/date_of_birth", json={"value": "08 Mar 1989"}, headers=h)
    assert ok.status_code == 200 and ok.json()["owner_locked"] is True
    # the loose spelling the owner already uses is still accepted and read back as ISO
    assert c.get("/api/me/date-of-birth", headers=h).json()["date_of_birth"] == "1989-03-08"
    # other fields are not date-validated (unchanged)
    assert c.put("/api/identity-profile/full_name", json={"value": "x"}, headers=h).status_code == 200


def test_check_date_of_birth_boundaries():
    from app.services.owner_identity_service import check_date_of_birth

    today = dt.date(2026, 10, 18)
    assert check_date_of_birth("1900-01-01", today=today) == dt.date(1900, 1, 1)
    assert check_date_of_birth("2026-10-17", today=today) == dt.date(2026, 10, 17)
    for bad in ("1899-12-31", "2026-10-18", "2026-10-19", "", None):
        with pytest.raises(ValueError):
            check_date_of_birth(bad, today=today)


def test_shadow_scope_email_cannot_be_registered_or_logged_into():
    from pydantic import ValidationError

    from app.dependencies.auth import oauth_scope_email
    from app.schemas.auth import UserCreate, UserLogin

    email = oauth_scope_email("second@example.com")
    with pytest.raises(ValidationError):
        UserCreate(email=email, password="password123", username="u")
    with pytest.raises(ValidationError):
        UserLogin(email=email, password="!")
