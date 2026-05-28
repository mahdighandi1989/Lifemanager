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


def test_auth_google_is_no_longer_orphan():
    """Audit task 3b90d409 AC 1-2 — the file was flagged as orphan
    (reverse_import = 0). The conditional mount in app/main.py means
    the import path now exists. Pin that contract."""
    import re
    main_text = (Path(__file__).resolve().parent.parent / "app" / "main.py").read_text(
        encoding="utf-8"
    )
    # The file MUST contain a reference to the auth_google module,
    # either as an explicit conditional import or as a top-level import.
    assert re.search(r"\bauth_google\b", main_text), (
        "app/main.py no longer references auth_google — task 3b90d409 regressed"
    )


def test_auth_google_router_carries_documented_routes():
    """When mounted, the router carries exactly the documented
    /auth/google + /auth/google/callback routes."""
    import os
    os.environ["GOOGLE_CLIENT_ID"] = "test-cid"
    main = _reload_main()
    paths = [getattr(r, "path", None) for r in main.app.routes]
    assert paths.count("/auth/google") == 1
    assert paths.count("/auth/google/callback") == 1
    del os.environ["GOOGLE_CLIENT_ID"]


# Make Path importable at module top.
from pathlib import Path  # noqa: E402
