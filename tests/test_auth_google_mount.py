"""auth_google router is gated on GOOGLE_CLIENT_ID.

Audit task 3b90d409 flagged app/routes/auth_google.py as orphan
(reverse_import = 0). The "appropriate action" we chose was to
conditionally mount the router from app/main.py when an operator
has actually configured GOOGLE_CLIENT_ID — that turns the orphan
into a referenced, operator-gated surface area without exposing
broken endpoints when OAuth isn't configured.
"""
from __future__ import annotations

import importlib
import os
import sys


def _reload_main() -> object:
    """Re-import app.main fresh so the module-level mount logic re-runs
    against the current env vars."""
    for mod in [
        "app.main",
        "app.config",
        "app.core.config",
        "app.routes.auth_google",
    ]:
        sys.modules.pop(mod, None)
    return importlib.import_module("app.main")


def test_auth_google_router_unmounted_without_client_id(monkeypatch):
    """Without GOOGLE_CLIENT_ID, /auth/google must not exist."""
    monkeypatch.delenv("GOOGLE_CLIENT_ID", raising=False)
    main = _reload_main()
    paths = {getattr(r, "path", None) for r in main.app.routes}
    assert "/auth/google" not in paths
    assert "/auth/google/callback" not in paths


def test_auth_google_router_mounted_with_client_id(monkeypatch):
    """With GOOGLE_CLIENT_ID set, the orphan router becomes referenced."""
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "test-client-id.apps.googleusercontent.com")
    main = _reload_main()
    paths = {getattr(r, "path", None) for r in main.app.routes}
    assert "/auth/google" in paths
    assert "/auth/google/callback" in paths
