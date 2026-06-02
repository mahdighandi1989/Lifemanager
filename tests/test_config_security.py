"""Config security gate (audit task task_78c0e8e0a9b5, sub-task 2).

Pins the canonical verify node
``tests/test_config_security.py::test_jwt_secret_key_placeholder_prevents_startup_in_production``.

The behaviour under test (refuse to boot in production with a
default/placeholder ``JWT_SECRET_KEY``) is implemented by
``app.config._validate`` — see also the broader coverage in
``tests/test_jwt_auth_pipeline.py``. This module gives the audit's
verify_plan the exact node it looks for.
"""
from __future__ import annotations

import importlib
import sys

import pytest

from app.config import _DEV_SECRET_SENTINEL


def _reimport_config():
    sys.modules.pop("app.config", None)
    return importlib.import_module("app.config")


def _restore_dev_config(monkeypatch):
    """Leave the module space in a clean dev state for the rest of the suite."""
    sys.modules.pop("app.config", None)
    monkeypatch.setenv("ENVIRONMENT", "development")
    monkeypatch.setenv("JWT_SECRET_KEY", "test-key-not-for-prod")
    importlib.import_module("app.config")


@pytest.mark.parametrize(
    "placeholder",
    [
        _DEV_SECRET_SENTINEL,            # in-code dev default
        "change-me-in-production",       # legacy default
        "<YOUR_JWT_SECRET_KEY>",         # unfilled .env.example template
        "",                              # empty / unset
    ],
)
def test_jwt_secret_key_placeholder_prevents_startup_in_production(monkeypatch, placeholder):
    """ENVIRONMENT=production + a placeholder/default JWT_SECRET_KEY must
    raise a clear RuntimeError at import time so the app fails loudly
    instead of signing tokens with a guessable key."""
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("JWT_SECRET_KEY", placeholder)
    sys.modules.pop("app.config", None)
    with pytest.raises(RuntimeError, match="ENVIRONMENT=production"):
        _reimport_config()
    _restore_dev_config(monkeypatch)


def test_production_accepts_real_secret_key(monkeypatch):
    """A real (non-placeholder) secret loads cleanly in production."""
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("JWT_SECRET_KEY", "a-genuinely-random-production-secret-value")
    cfg = _reimport_config()
    assert cfg.settings.ENVIRONMENT.lower() == "production"
    _restore_dev_config(monkeypatch)
