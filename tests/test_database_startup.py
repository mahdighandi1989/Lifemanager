"""Startup database-probe behaviour (audit task task_882723eb07de).

The anti-pattern the audit flagged was a threshold-outcome mismatch: a
failed DB connection at startup was logged at WARNING (or swallowed)
instead of CRITICAL, and there was no machine-readable signal for "did
the DB come up?". app/main.py now logs CRITICAL on failure, keeps serving
DB-free routes, and sets the module-level ``database_available`` flag.

These tests previously tried ``patch("app.main.engine.begin", ...)``, but
``AsyncEngine.begin`` is a read-only method — the patch raised
AttributeError at teardown and never actually exercised startup. We patch
the whole ``app.main.engine`` symbol with a tiny fake whose ``begin()``
either yields a no-op connection or raises, which is what the startup path
actually calls.
"""
import pytest
from unittest.mock import patch

import app.main as main_mod
from app.main import app


class _FakeConn:
    """A connection that no-ops every call startup_event makes
    (run_sync for create_all, execute for the idempotent ALTERs)."""

    async def run_sync(self, *args, **kwargs):
        return None

    async def execute(self, *args, **kwargs):
        return None


class _FakeBeginCtx:
    async def __aenter__(self):
        return _FakeConn()

    async def __aexit__(self, *exc):
        return False


class _OkEngine:
    """engine.begin() succeeds — create_all + the startup ALTERs run clean."""

    def begin(self):
        return _FakeBeginCtx()


class _BoomEngine:
    """engine.begin() raises — simulates an unreachable database."""

    def begin(self):
        raise Exception("Connection refused")


@pytest.mark.asyncio
async def test_startup_database_failure_logs_critical():
    """A DB connection failure at startup logs at CRITICAL (not WARNING) —
    the fix for the threshold-outcome-mismatch anti-pattern."""
    with patch("app.main.engine", _BoomEngine()):
        with patch("app.main.logger.critical") as mock_critical:
            await app.router.startup()

    assert mock_critical.called, "logger.critical should fire on DB failure"
    messages = [call.args[0] for call in mock_critical.call_args_list]
    assert any("Database connection failed" in m for m in messages), messages


@pytest.mark.asyncio
async def test_startup_database_success_logs_info():
    """A successful DB probe logs the 'tables created' message at INFO."""
    with patch("app.main.engine", _OkEngine()):
        with patch("app.main.logger.info") as mock_info:
            await app.router.startup()

    assert mock_info.called, "logger.info should fire on DB success"
    messages = [call.args[0] for call in mock_info.call_args_list]
    assert any("Database tables created successfully" in m for m in messages), messages


@pytest.mark.asyncio
async def test_startup_database_failure_app_continues():
    """The app keeps running (serves DB-free routes) when the DB is down —
    startup must not raise."""
    with patch("app.main.engine", _BoomEngine()):
        await app.router.startup()  # must not raise
    assert True


@pytest.mark.asyncio
async def test_startup_sets_database_available_flag():
    """``database_available`` reflects the startup probe outcome so health
    checks / tests can read which branch ran."""
    with patch("app.main.engine", _OkEngine()):
        await app.router.startup()
        assert main_mod.database_available is True

    with patch("app.main.engine", _BoomEngine()):
        await app.router.startup()
        assert main_mod.database_available is False
