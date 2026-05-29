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

import pytest


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


@pytest.fixture(autouse=True)
def _restore_reloaded_modules():
    """Contain the ``_reload_main`` side effect to this file.

    ``_reload_main`` pops app.main / app.config / app.core.config /
    app.routes.auth_google from ``sys.modules`` and re-imports them, which
    swaps in brand-new module objects. Without restoring the originals, a
    later test that does ``patch("app.main.engine", ...)`` patches the fresh
    module object while its own imported ``app`` / ``engine`` still reference
    the original one — so the patch silently misses and the real Postgres
    engine is probed (observed: tests/test_database_startup.py failing only in
    the full suite). Snapshot the originals and restore them after each test so
    the reload can't leak into the rest of the session.
    """
    names = ("app.main", "app.config", "app.core.config", "app.routes.auth_google")
    saved = {name: sys.modules.get(name) for name in names}
    try:
        yield
    finally:
        for name, original in saved.items():
            if original is not None:
                sys.modules[name] = original
            else:
                sys.modules.pop(name, None)
            # Re-importing also rebinds the submodule as an attribute on its
            # parent package (e.g. ``app.config`` on ``app``). Restoring only
            # sys.modules would leave attribute access (``app.config``) and the
            # import system (``from app.config import ...``) pointing at
            # different module objects — which silently breaks reload-based
            # tests like tests/test_database.py::test_echo_enabled_in_debug.
            # Keep both in sync.
            parent_name, _, child = name.rpartition(".")
            parent = sys.modules.get(parent_name)
            if parent is not None:
                if original is not None:
                    setattr(parent, child, original)
                else:
                    try:
                        delattr(parent, child)
                    except AttributeError:
                        pass


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
