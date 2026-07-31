"""Shared test setup.

We disable per-IP rate limiting before any app module is imported, so the
slowapi Limiter built in app/rate_limit.py initializes with enabled=False
and tests can hit /auth/login as many times as they need without 429s.
Tests that exercise rate-limit behavior re-enable it locally with their
own Limiter (see tests/test_rate_limiting.py).
"""
import importlib
import os

os.environ.setdefault("RATE_LIMIT_DISABLED", "true")
# A stable signing key keeps token-shape assertions deterministic.
os.environ.setdefault("JWT_SECRET_KEY", "test-key-not-for-prod")
# Bootstrap admin identity for the admin-gated suites. The admin email used
# to be a hardcoded literal in the source; it is now sourced from ADMIN_EMAILS
# (see app/config.py). Seed it here so the existing admin-roundtrip tests
# (settings global prompt, analysis prompt, auth deps) still grant admin.
os.environ.setdefault("ADMIN_EMAILS", "mohamad.mahdi1988@gmail.com")


# --- Shared fixtures (auto-discovered by pytest) ---------------------------
# Importing has to come after the env vars above so app.config sees them.
import pytest  # noqa: E402
import pytest_asyncio  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest_asyncio.fixture
async def api_client():
    """TestClient backed by a per-test in-memory SQLite engine. Routes,
    validators, and exception handlers from the real app are exercised."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def _get_db():
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = _get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
    await engine.dispose()


@pytest_asyncio.fixture
async def soft_api_client():
    """Same as api_client but TestClient doesn't re-raise server exceptions
    — needed when asserting the response shape of the 500 handler."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def _get_db():
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = _get_db
    yield TestClient(app, raise_server_exceptions=False)
    app.dependency_overrides.clear()
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session():
    """A real AsyncSession bound to a per-test in-memory SQLite engine.

    Provided as a top-level fixture (audit task b7894694) so service-level
    integration tests don't each repeat the engine + sessionmaker setup.
    The session participates in real SQL — INSERT/SELECT/UPDATE against
    the same metadata the app uses — so contract drift between services
    and the schema fails the test rather than silently passing.
    """
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        yield session
    await engine.dispose()


@pytest.fixture(autouse=True)
def _reset_process_caches():
    """Process-wide caches must not leak between tests.

    Found 2026-07-31: a random test order surfaced a real isolation bug — the
    Render owner-id cache is keyed by a hash of the API token, so two suites
    using the same fake token but different fake owners silently reused the
    first owner id and the second suite queried the wrong owner. Ordering
    decided whether the suite was green, which makes every other result
    untrustworthy. Cleared per test rather than per file so a future cache
    cannot reintroduce the same class of flake.
    """
    def _clear():
        for module, fn in (
            ("app.services.dev_sync.render_sync_service", "reset_for_tests"),
            ("app.services.system_pulse_service", "reset_for_tests"),
        ):
            try:
                mod = importlib.import_module(module)
                getattr(mod, fn)()
            except Exception:
                pass
        try:
            from app.services import mobile_dispatch_service as _md

            _md._AI_CACHE.clear()
            _md._ai_calls.clear()
        except Exception:
            pass

    _clear()
    yield
    _clear()
