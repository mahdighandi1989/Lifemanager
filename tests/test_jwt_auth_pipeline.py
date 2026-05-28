"""JWT auth pipeline — production-key validation, expiry, and
bearer-token enforcement on list/todo-item endpoints.

Audit task task_78c0e8e0a9b5 consolidates ten sub-tasks around the
JWT pipeline. The behaviour-level ACs covered here:

* AC: production refuses to start with the dev SECRET_KEY default.
* AC: expired access tokens are rejected with 401.
* AC: valid tokens pass through cleanly.
* AC: list endpoints accept bearer tokens (and the optional-auth path
  still serves anon traffic so the frontend's login-bypass mode keeps
  working).
"""
from __future__ import annotations

import importlib
import os
import sys
from datetime import datetime, timedelta

from jose import jwt
import pytest

from app.config import _DEV_SECRET_SENTINEL


def test_production_refuses_dev_secret_sentinel(monkeypatch):
    """ENVIRONMENT=production + dev SECRET_KEY must raise at import time."""
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("JWT_SECRET_KEY", _DEV_SECRET_SENTINEL)

    # Force re-import so the validator runs against the patched env.
    sys.modules.pop("app.config", None)
    with pytest.raises(RuntimeError, match="ENVIRONMENT=production"):
        importlib.import_module("app.config")

    # Leave the module space in a clean state for the rest of the suite.
    sys.modules.pop("app.config", None)
    monkeypatch.setenv("ENVIRONMENT", "development")
    monkeypatch.delenv("JWT_SECRET_KEY", raising=False)
    monkeypatch.setenv("JWT_SECRET_KEY", "test-key-not-for-prod")
    importlib.import_module("app.config")


def test_production_accepts_real_secret_key(monkeypatch):
    """ENVIRONMENT=production + a real (non-sentinel) SECRET_KEY must
    load without raising."""
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("JWT_SECRET_KEY", "a-real-secret-key-for-prod-rotation")
    sys.modules.pop("app.config", None)
    cfg = importlib.import_module("app.config")
    assert cfg.settings.ENVIRONMENT.lower() == "production"
    # Restore.
    sys.modules.pop("app.config", None)
    monkeypatch.setenv("ENVIRONMENT", "development")
    monkeypatch.setenv("JWT_SECRET_KEY", "test-key-not-for-prod")
    importlib.import_module("app.config")


def test_production_refuses_env_example_placeholder(monkeypatch):
    """A ``.env`` copied verbatim from ``.env.example`` leaves
    JWT_SECRET_KEY as the literal "<YOUR_JWT_SECRET_KEY>" placeholder.
    Production must refuse that too — not only the in-code dev sentinel —
    or a deploy boots with a guessable key (task task_78c0e8e0a9b5,
    sub-task 2)."""
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("JWT_SECRET_KEY", "<YOUR_JWT_SECRET_KEY>")
    sys.modules.pop("app.config", None)
    with pytest.raises(RuntimeError, match="ENVIRONMENT=production"):
        importlib.import_module("app.config")
    # Leave the module space clean for the rest of the suite.
    sys.modules.pop("app.config", None)
    monkeypatch.setenv("ENVIRONMENT", "development")
    monkeypatch.setenv("JWT_SECRET_KEY", "test-key-not-for-prod")
    importlib.import_module("app.config")


def test_expired_jwt_is_rejected():
    """validate_token must reject a token whose exp is in the past."""
    from app.services import auth_service

    expired_payload = {
        "sub": "1",
        "exp": datetime.utcnow() - timedelta(minutes=1),
    }
    token = jwt.encode(
        expired_payload,
        "test-key-not-for-prod",
        algorithm="HS256",
    )
    assert auth_service.validate_token(token) is None


def test_valid_jwt_is_accepted():
    """A token within its exp window decodes cleanly."""
    from app.services import auth_service

    token = auth_service.create_access_token({"sub": "1", "email": "x@example.com"})
    payload = auth_service.validate_token(token)
    assert payload is not None
    assert payload["sub"] == "1"


def test_list_lists_works_anon(api_client):
    """Backwards compat: the frontend's login-bypass mode keeps working —
    a request without an Authorization header resolves to the default
    anon scope and returns 200, not 401."""
    response = api_client.get("/api/lists")
    assert response.status_code == 200


def test_list_lists_accepts_valid_bearer(api_client):
    """With a real bearer JWT, the dep validates the signature + expiry
    and the request still 200s."""
    from app.services import auth_service

    token = auth_service.create_access_token({"sub": "1", "email": "x@example.com"})
    response = api_client.get(
        "/api/lists",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200


def test_list_todo_items_works_anon(api_client):
    response = api_client.get("/api/todo-items")
    assert response.status_code == 200


def test_list_todo_items_accepts_valid_bearer(api_client):
    from app.services import auth_service

    token = auth_service.create_access_token({"sub": "1", "email": "x@example.com"})
    response = api_client.get(
        "/api/todo-items",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200


# ── Step 25: list_tasks scopes by user_id ──────────────────────────


def test_list_tasks_works_anon(api_client):
    """The optional-auth path resolves anon to DEFAULT_ANON_USER_ID
    (=0) so the frontend's login-bypass mode keeps working."""
    response = api_client.get("/api/tasks")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_tasks_accepts_valid_bearer(api_client):
    from app.services import auth_service

    token = auth_service.create_access_token({"sub": "1", "email": "x@example.com"})
    response = api_client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200


# ── Steps 38-40: JWT payload minimization ──────────────────────────


def test_jwt_payload_carries_only_documented_claims():
    """The issued JWT must carry exactly {sub, email, exp}. A surplus
    claim (role, password, profile_pic_url, ...) leaking into the
    token would expand the public surface and let any client read
    server-side fields without an explicit endpoint."""
    from jose import jwt as _jwt
    from app.config import settings
    from app.services import auth_service

    token = auth_service.create_access_token({"sub": "42", "email": "u@example.com"})
    payload = _jwt.decode(
        token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
    )
    assert set(payload.keys()) == {"sub", "email", "exp"}, (
        f"unexpected JWT claims leaked: {set(payload.keys()) - {'sub', 'email', 'exp'}}"
    )
    assert payload["sub"] == "42"


# ── AC 18-19 conversion: ACCESS_TOKEN_EXPIRE_MINUTES IS read ─────


def test_access_token_expire_minutes_is_consumed_by_jwt_exp():
    """The audit AC 18-19 claimed ACCESS_TOKEN_EXPIRE_MINUTES was unused.
    That is false: this test pins that the setting is the source of
    truth for the JWT `exp` claim, so a future cleanup PR can't silently
    delete the variable from .env.example or config without breaking
    the JWT expiry contract."""
    from jose import jwt as _jwt
    from datetime import datetime, timezone
    from app.config import settings
    from app.services import auth_service

    token = auth_service.create_access_token({"sub": "1", "email": "x@example.com"})
    payload = _jwt.decode(
        token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
    )
    exp_dt = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
    now = datetime.now(tz=timezone.utc)
    delta_minutes = (exp_dt - now).total_seconds() / 60
    # Allow a generous 2-minute tolerance for clock drift / test latency.
    assert abs(delta_minutes - settings.ACCESS_TOKEN_EXPIRE_MINUTES) < 2


# ── AC 17 edge case: tampered signature ────────────────────────────


def test_tampered_signature_is_rejected():
    from app.services import auth_service

    token = auth_service.create_access_token({"sub": "1", "email": "x@example.com"})
    header, payload, signature = token.split(".")
    # Corrupt the FIRST signature character, not the last. A JWS signature is
    # base64url with no padding, so its final char carries 2 "don't-care"
    # padding bits — flipping only that char can decode to the same HMAC
    # bytes and leave the token valid (a flaky check that passed in isolation
    # but failed inside the full suite when the timestamp-dependent signature
    # ended on such a char). Mutating the leading char always changes the tag.
    bad_first = "B" if signature[0] != "B" else "C"
    tampered = f"{header}.{payload}.{bad_first}{signature[1:]}"
    assert auth_service.validate_token(tampered) is None
