"""Startup Alembic auto-migration gating (audit task 3ea5622b, Step 5).

Covers: disabled by default, refused in production, runs in dev, and errors are
swallowed (graceful degradation — startup never crashes).
"""
from __future__ import annotations

import pytest

import app.services.migration_runner as mr


@pytest.mark.asyncio
async def test_disabled_by_default(monkeypatch):
    monkeypatch.delenv("RUN_ALEMBIC_MIGRATIONS_ON_STARTUP", raising=False)
    out = await mr.run_migrations_if_enabled()
    assert out == {"ran": False, "reason": "disabled"}


@pytest.mark.asyncio
async def test_skips_in_production(monkeypatch):
    monkeypatch.setenv("RUN_ALEMBIC_MIGRATIONS_ON_STARTUP", "true")
    from app.config import settings

    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    out = await mr.run_migrations_if_enabled()
    assert out["ran"] is False
    assert out["reason"] == "production_skipped"


@pytest.mark.asyncio
async def test_runs_in_development(monkeypatch):
    monkeypatch.setenv("RUN_ALEMBIC_MIGRATIONS_ON_STARTUP", "true")
    from app.config import settings

    monkeypatch.setattr(settings, "ENVIRONMENT", "development")
    calls = {"n": 0}

    def _fake_upgrade():
        calls["n"] += 1

    monkeypatch.setattr(mr, "run_alembic_upgrade", _fake_upgrade)
    out = await mr.run_migrations_if_enabled()
    assert out == {"ran": True}
    assert calls["n"] == 1


@pytest.mark.asyncio
async def test_swallows_migration_errors(monkeypatch):
    monkeypatch.setenv("RUN_ALEMBIC_MIGRATIONS_ON_STARTUP", "true")
    from app.config import settings

    monkeypatch.setattr(settings, "ENVIRONMENT", "development")

    def _boom():
        raise RuntimeError("alembic boom")

    monkeypatch.setattr(mr, "run_alembic_upgrade", _boom)
    out = await mr.run_migrations_if_enabled()
    assert out["ran"] is False
    assert out["reason"] == "error"


@pytest.mark.asyncio
async def test_startup_event_invokes_hook_without_crashing(monkeypatch):
    """The startup hook is wired in and no-ops by default (no crash)."""
    import app.main as main_mod

    calls = {"n": 0}

    async def _fake_hook():
        calls["n"] += 1
        return {"ran": False, "reason": "disabled"}

    monkeypatch.setattr(
        "app.services.migration_runner.run_migrations_if_enabled", _fake_hook
    )

    class _OkEngine:
        def begin(self):
            class _Ctx:
                async def __aenter__(self):
                    class _Conn:
                        async def run_sync(self, *a, **k):
                            return None

                        async def execute(self, *a, **k):
                            return None

                    return _Conn()

                async def __aexit__(self, *exc):
                    return False

            return _Ctx()

    monkeypatch.setattr(main_mod, "engine", _OkEngine())
    await main_mod.app.router.startup()
    assert calls["n"] == 1
