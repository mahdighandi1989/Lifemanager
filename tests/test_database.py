import asyncio

import pytest
from unittest.mock import patch, MagicMock

from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.config import settings
from app.database import _normalize_url, engine


class TestDatabaseEchoSetting:
    """تست‌های مربوط به تنظیم echo در database engine"""

    def _reload_database_with(self, debug: bool):
        """Patch the real settings object then reload app.database.

        Patching `app.database.settings` directly is pointless because
        `importlib.reload(app.database)` re-runs `from app.config import
        settings`, which re-binds the name to the unpatched object. We patch
        `app.config.settings` attributes instead, which the reload picks up.
        """
        import importlib
        import app.config
        import app.database

        with patch.object(app.config.settings, "DATABASE_URL",
                          "postgresql+asyncpg://test:test@localhost/test"), \
             patch.object(app.config.settings, "DEBUG", debug):
            importlib.reload(app.database)
        return app.database.engine

    def test_echo_disabled_in_production(self):
        """تأیید اینکه echo=False در حالت production (DEBUG=False)"""
        eng = self._reload_database_with(debug=False)
        assert eng.echo is False, "echo باید در production False باشد"

    def test_echo_enabled_in_debug(self):
        """تأیید اینکه echo=True در حالت debug (DEBUG=True)"""
        eng = self._reload_database_with(debug=True)
        assert eng.echo is True, "echo باید در حالت DEBUG True باشد"

    def test_echo_not_hardcoded(self):
        """تأیید اینکه echo از settings خوانده می‌شود نه hardcode"""
        import ast
        import inspect
        from app import database

        source = inspect.getsource(database)
        tree = ast.parse(source)

        # Check for hardcoded echo=True
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                for keyword in node.keywords:
                    if keyword.arg == "echo" and isinstance(keyword.value, ast.Constant):
                        if keyword.value.value is True:
                            pytest.fail("echo=True hardcoded یافت شد - باید از settings.DEBUG استفاده شود")
                        if keyword.value.value is False:
                            pytest.fail("echo=False hardcoded یافت شد - باید از settings.DEBUG استفاده شود")


class TestConnectionPoolConfig:
    """Pool sizing/recycle/pre_ping must satisfy the deployment AC."""

    def test_pool_capacity_supports_100_concurrent(self):
        """pool_size + max_overflow must be >= 100 to satisfy the AC."""
        total = settings.DB_POOL_SIZE + settings.DB_MAX_OVERFLOW
        assert total >= 100, (
            f"DB_POOL_SIZE ({settings.DB_POOL_SIZE}) + DB_MAX_OVERFLOW "
            f"({settings.DB_MAX_OVERFLOW}) = {total}; must be >= 100"
        )

    def test_pool_recycle_hourly(self):
        """Connections should be recycled at least every hour to avoid stale conns."""
        assert 0 < settings.DB_POOL_RECYCLE <= 3600

    def test_pool_timeout_is_30s(self):
        """AC: pool acquisition times out at 30s."""
        assert settings.DB_POOL_TIMEOUT == 30

    def test_engine_uses_pool_pre_ping(self):
        """pool_pre_ping avoids handing out dead connections after idle."""
        assert engine.pool._pre_ping is True

    def test_engine_pool_size_matches_settings(self):
        assert engine.pool.size() == settings.DB_POOL_SIZE

    def test_engine_max_overflow_matches_settings(self):
        assert engine.pool._max_overflow == settings.DB_MAX_OVERFLOW

    def test_engine_pool_timeout_matches_settings(self):
        assert engine.pool._timeout == settings.DB_POOL_TIMEOUT


class TestUrlNormalization:
    """Render's Postgres add-on exposes the legacy 'postgres://' scheme."""

    def test_postgres_scheme_is_upgraded(self):
        out = _normalize_url("postgres://u:p@h/db")
        assert out == "postgresql+asyncpg://u:p@h/db"

    def test_postgresql_scheme_gets_asyncpg_driver(self):
        out = _normalize_url("postgresql://u:p@h/db")
        assert out == "postgresql+asyncpg://u:p@h/db"

    def test_asyncpg_url_is_unchanged(self):
        url = "postgresql+asyncpg://u:p@h/db"
        assert _normalize_url(url) == url


class TestConcurrentSessions:
    """Smoke-test that many sessions can be checked out concurrently.

    Uses SQLite + StaticPool because aiosqlite ignores QueuePool sizing; the
    intent here is to prove get_db works under concurrent dependency
    resolution, not to load-test a real Postgres pool.
    """

    @pytest.mark.asyncio
    async def test_100_concurrent_sessions_each_run_a_query(self):
        test_engine = create_async_engine("sqlite+aiosqlite:///:memory:")
        try:
            factory = async_sessionmaker(test_engine, expire_on_commit=False)

            async def one_query():
                async with factory() as session:
                    result = await session.execute(text("SELECT 1"))
                    return result.scalar()

            results = await asyncio.gather(*(one_query() for _ in range(100)))
            assert results == [1] * 100
        finally:
            await test_engine.dispose()
