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

import jwt
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
