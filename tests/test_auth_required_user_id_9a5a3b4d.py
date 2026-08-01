"""Security coverage for the strict identity dependency
``get_required_user_id`` and the sensitive routes wired to it
(security task 9a5a3b4d).

The vulnerability: every user-scoped route resolved identity through
``get_optional_user_id``, which silently downgraded *any* failure —
missing header OR a present-but-forged/expired bearer token — to the
default anon scope (user 0). So an anonymous (or actively malicious)
caller reached user 0's data with full read/write, and a stolen-but-
expired token kept working forever.

The fix adds ``get_required_user_id`` and points the sensitive routes
(finance, assets, context) at it. Its contract:

  * a VALID token            → that user's id
  * a present-but-INVALID    → 401, ALWAYS (the attack-signal case),
    bearer token               independent of settings.REQUIRE_AUTH
  * NO Authorization header  → governed by settings.REQUIRE_AUTH:
                                 False (default) → anon fallback (so the
                                   current login-bypass frontend works and
                                   legacy user-0 data stays reachable until
                                   it is migrated — the manual AC3 step)
                                 True            → 401

``get_optional_user_id`` is deliberately left lenient (the dashboard /
self-improvement reads depend on the anon fallback even with a garbage
token) — a regression guard for that is included at the bottom.

Note on the unit doubles (rewritten 2026-08-01)
-----------------------------------------------
The first version of these unit tests was written against an EARLIER shape
of the dependency: ``get_required_user_id(credentials=..., db=...)`` that
built an ``AuthService`` internally. The dependency was later refactored to
take the whole ``Request`` (so the token can arrive in the ``access_token``
cookie as well as the header — see ``_extract_token``) and to resolve the
token through the module-level ``validate_token``. The old doubles kept
patching a name (``auth_deps.AuthService``) that no longer exists and
calling a keyword (``credentials=``) that no longer exists, so all five
unit tests died in setup — they were pinning an API instead of a
behaviour, and stopped guarding the security property entirely while
still *looking* like coverage.

They are now expressed against the real signature: a real
``starlette.Request`` carrying (or not carrying) the credential, and a
minimal DB double, so they exercise ``_extract_token`` →
``_resolve_data_scope_user_id`` for real. The behaviours pinned are
unchanged — that contract is the point, not the plumbing.
"""
from __future__ import annotations

import pytest
from fastapi import HTTPException
from starlette.requests import Request

from app.config import settings
from app.dependencies import auth as auth_deps
from app.dependencies.auth import (
    DEFAULT_ANON_USER_ID,
    get_optional_user_id,
    get_required_user_id,
)


# --- Test doubles ----------------------------------------------------------


def _request(*, bearer: str | None = None, cookie: str | None = None) -> Request:
    """A real ``Request`` carrying the credential the way a client would.

    Built from a raw ASGI scope rather than mocked, so ``_extract_token``'s
    header/cookie parsing is genuinely exercised — that parsing is the part
    an attacker touches first.
    """
    headers: list[tuple[bytes, bytes]] = []
    if bearer is not None:
        headers.append((b"authorization", f"Bearer {bearer}".encode()))
    if cookie is not None:
        headers.append((b"cookie", f"access_token={cookie}".encode()))
    return Request(
        {
            "type": "http",
            "method": "GET",
            "path": "/",
            "query_string": b"",
            "headers": headers,
        }
    )


class _FakeUser:
    def __init__(self, uid: int):
        self.id = uid


class _FakeResult:
    def __init__(self, user):
        self._user = user

    def scalar_one_or_none(self):
        return self._user


class _FakeDB:
    """Minimal AsyncSession stand-in — the dependency only ever awaits
    ``execute()`` and reads ``scalar_one_or_none()`` off the result."""

    def __init__(self, user=None, raises: BaseException | None = None):
        self._user = user
        self._raises = raises

    async def execute(self, *_args, **_kwargs):
        if self._raises is not None:
            raise self._raises
        return _FakeResult(self._user)


def _patch_token(monkeypatch, payload):
    """Pin what the JWT decoder yields for any token, so these unit tests
    stay independent of signing keys and clock skew."""
    monkeypatch.setattr(auth_deps, "validate_token", lambda _tok: payload)


# --- get_required_user_id: unit behaviour ----------------------------------


@pytest.mark.asyncio
async def test_required_valid_token_returns_user_id(monkeypatch):
    """A valid bearer resolves to the real user id."""
    _patch_token(monkeypatch, {"sub": "42"})
    uid = await get_required_user_id(
        _request(bearer="good.jwt"), db=_FakeDB(user=_FakeUser(42))
    )
    assert uid == 42


@pytest.mark.asyncio
async def test_required_token_in_cookie_also_resolves(monkeypatch):
    """The OAuth HTML pages carry the token in the ``access_token`` cookie —
    a plain browser navigation cannot add an Authorization header. That path
    must resolve identically, or those pages 401 forever."""
    _patch_token(monkeypatch, {"sub": "7"})
    uid = await get_required_user_id(
        _request(cookie="good.jwt"), db=_FakeDB(user=_FakeUser(7))
    )
    assert uid == 7


@pytest.mark.asyncio
async def test_required_invalid_token_is_401_even_when_bypass_on(monkeypatch):
    """A present-but-invalid token is rejected with 401 regardless of
    REQUIRE_AUTH — a forged/expired token must never reach the anon scope."""
    _patch_token(monkeypatch, None)  # decoder rejects it
    monkeypatch.setattr(settings, "REQUIRE_AUTH", False)
    with pytest.raises(HTTPException) as exc:
        await get_required_user_id(_request(bearer="forged.jwt"), db=_FakeDB())
    assert exc.value.status_code == 401
    assert "Invalid or expired token" in exc.value.detail


@pytest.mark.asyncio
async def test_required_valid_signature_unknown_user_is_401(monkeypatch):
    """A correctly-signed token whose ``sub`` no longer exists (deleted
    account) must not fall through to the anon scope either."""
    _patch_token(monkeypatch, {"sub": "999"})
    with pytest.raises(HTTPException) as exc:
        await get_required_user_id(_request(bearer="orphan.jwt"), db=_FakeDB(user=None))
    assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_required_token_resolution_exception_is_401(monkeypatch):
    """If token resolution blows up, fail closed with 401 — never anon."""
    _patch_token(monkeypatch, {"sub": "1"})
    with pytest.raises(HTTPException) as exc:
        await get_required_user_id(
            _request(bearer="boom.jwt"), db=_FakeDB(raises=RuntimeError("db exploded"))
        )
    assert exc.value.status_code == 401


@pytest.mark.asyncio
async def test_required_no_header_falls_back_to_anon_by_default(monkeypatch):
    """REQUIRE_AUTH=False (default): a missing header still resolves to the
    anon scope so the current login-bypass frontend keeps working."""
    monkeypatch.setattr(settings, "REQUIRE_AUTH", False)
    uid = await get_required_user_id(_request(), db=_FakeDB())
    assert uid == DEFAULT_ANON_USER_ID


@pytest.mark.asyncio
async def test_required_no_header_is_401_when_require_auth_on(monkeypatch):
    """REQUIRE_AUTH=True: a missing header is refused with 401."""
    monkeypatch.setattr(settings, "REQUIRE_AUTH", True)
    with pytest.raises(HTTPException) as exc:
        await get_required_user_id(_request(), db=_FakeDB())
    assert exc.value.status_code == 401
    assert "Authentication required" in exc.value.detail


# --- Sensitive routes reject forged tokens (the live vulnerability) --------


@pytest.mark.parametrize(
    "path",
    [
        "/api/finance/incomes",
        "/api/finance/assets",
        "/api/assets",
        "/api/context/recommendations",
    ],
)
def test_sensitive_get_with_invalid_bearer_is_401(api_client, path):
    """The validation probe from the task:

        curl /api/finance/incomes -H 'Authorization: Bearer invalid_token' → 401

    A garbage bearer on a sensitive route must be rejected, not served the
    anon scope."""
    resp = api_client.get(path, headers={"Authorization": "Bearer invalid_token"})
    assert resp.status_code == 401, resp.text


def test_finance_write_with_invalid_bearer_is_401(api_client):
    """Write paths are the highest risk — a forged token must not create
    rows under user 0."""
    resp = api_client.post(
        "/api/finance/incomes",
        json={"description": "x", "amount": 10, "currency": "USD"},
        headers={"Authorization": "Bearer not.a.real.jwt"},
    )
    assert resp.status_code == 401, resp.text


def test_expired_bearer_on_sensitive_route_is_401(api_client):
    """A token with a past ``exp`` is rejected (not silently downgraded)."""
    from datetime import datetime, timedelta
    from jose import jwt

    expired = jwt.encode(
        {"sub": "1", "exp": datetime.utcnow() - timedelta(minutes=5)},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    resp = api_client.get(
        "/api/assets", headers={"Authorization": f"Bearer {expired}"}
    )
    assert resp.status_code == 401, resp.text


# --- Backwards compatibility: anon (no header) still works by default ------


def test_sensitive_get_without_header_still_200(api_client):
    """REQUIRE_AUTH defaults False, so the login-bypass frontend (which
    sends no Authorization header) keeps reaching the sensitive routes."""
    assert api_client.get("/api/assets").status_code == 200
    assert api_client.get("/api/finance/incomes").status_code == 200


# --- Regression guard: get_optional_user_id stays lenient ------------------


@pytest.mark.asyncio
async def test_optional_invalid_token_still_falls_back_to_anon(monkeypatch):
    """The lenient dependency must NOT start 401-ing on a bad token — the
    self-improvement / dashboard reads rely on the anon fallback (see
    tests/test_self_improvement.py::test_overview_with_garbage_token...)."""
    _patch_token(monkeypatch, None)  # decoder rejects it
    uid = await get_optional_user_id(_request(bearer="garbage"), db=_FakeDB())
    assert uid == DEFAULT_ANON_USER_ID


@pytest.mark.asyncio
async def test_optional_resolution_exception_still_falls_back_to_anon(monkeypatch):
    """Even a DB blow-up must not turn the lenient dependency into a 401 —
    that is the whole reason the two dependencies exist separately."""
    _patch_token(monkeypatch, {"sub": "1"})
    uid = await get_optional_user_id(
        _request(bearer="ok.jwt"), db=_FakeDB(raises=RuntimeError("db exploded"))
    )
    assert uid == DEFAULT_ANON_USER_ID


def test_optional_route_with_garbage_token_is_not_401(api_client):
    """End-to-end: a route on the optional dep tolerates a garbage bearer."""
    resp = api_client.get(
        "/api/lists", headers={"Authorization": "Bearer not.a.real.jwt"}
    )
    assert resp.status_code == 200, resp.text


def test_required_dep_is_importable_and_distinct():
    """The strict dep exists and is a different callable than the lenient one
    (pins the wiring so a future refactor can't silently re-alias them)."""
    assert get_required_user_id is not get_optional_user_id
    assert callable(get_required_user_id)
