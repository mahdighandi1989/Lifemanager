"""Tests for the split AI service package + DI verification on AIService / AuthService.

ACs covered:
  * AIService and AuthService accept a `db` in __init__ (DI).
  * The split ai_service package re-exports the same symbols the legacy
    module used to expose.
  * Each split file is under 250 lines.
  * Tests can mock the service without monkey-patching globals.
"""
from __future__ import annotations

import inspect
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.database import Base
from app.services.ai_service import (
    DEFAULT_MODEL,
    AIService,
    generate_text,
)
from app.services.auth_service import AuthService


# ── DI: both services accept an AsyncSession in __init__ ────────────


def test_aiservice_init_takes_db():
    sig = inspect.signature(AIService.__init__)
    assert "db" in sig.parameters, "AIService.__init__ must accept `db` for DI"


def test_authservice_init_takes_db():
    sig = inspect.signature(AuthService.__init__)
    assert "db" in sig.parameters, "AuthService.__init__ must accept `db` for DI"


def test_aiservice_can_be_constructed_with_mock_session():
    """The DI shape lets tests pass a MagicMock instead of a live engine."""
    fake_db = MagicMock()
    svc = AIService(fake_db)
    assert svc.db is fake_db


def test_authservice_can_be_constructed_with_mock_session():
    fake_db = MagicMock()
    svc = AuthService(fake_db)
    assert svc.db is fake_db


# ── AIService CRUD round-trip against a real in-memory engine ───────


@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        yield session
    await engine.dispose()


@pytest.mark.asyncio
async def test_aiservice_get_user_configs_returns_empty_on_fresh_db(db_session):
    svc = AIService(db_session)
    configs = await svc.get_user_configs(user_id=1)
    assert configs == []


# ── generate_text falls back to placeholder when no API key is set ──


@pytest.mark.asyncio
async def test_generate_text_placeholder_without_api_key(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    result = await generate_text("hello world")
    assert result["generated_text"].startswith("[ai-placeholder]")
    assert result["model_used"] == DEFAULT_MODEL
    assert result["tokens_used"] == 0


@pytest.mark.asyncio
async def test_generate_text_returns_correct_response_shape(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    result = await generate_text("hi")
    assert set(result.keys()) == {"generated_text", "model_used", "tokens_used"}


@pytest.mark.asyncio
async def test_generate_text_can_be_mocked_via_provider_layer(monkeypatch):
    """The provider_service layer is the single place to monkeypatch when
    a test wants to assert the upstream payload — the DI split makes this
    clean without patching globals on the legacy module.
    """
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")
    from app.services.ai import nlp_service

    fake = AsyncMock(return_value={
        "generated_text": "mocked",
        "model_used": "gpt-4",
        "tokens_used": 42,
    })
    monkeypatch.setattr(nlp_service, "call_openai_chat", fake)
    result = await nlp_service.generate_text("test")
    assert result["generated_text"] == "mocked"
    assert fake.await_count == 1


# ── Split files stay under 250 lines (AC) ───────────────────────────


def test_split_ai_files_each_under_250_lines():
    base = Path(__file__).resolve().parents[1] / "app" / "services" / "ai"
    for path in (
        base / "model_service.py",
        base / "nlp_service.py",
        base / "provider_service.py",
    ):
        assert path.exists(), f"missing split file: {path}"
        line_count = sum(1 for _ in path.open(encoding="utf-8"))
        assert line_count < 250, (
            f"{path.name} is {line_count} lines — AC requires < 250"
        )


def test_legacy_ai_service_reexports_split_symbols():
    """The shim re-exports the same names the legacy module used to expose,
    so existing `from app.services.ai_service import X` stays valid.
    """
    from app.services import ai_service as legacy

    for name in (
        "AIService",
        "DEFAULT_MODEL",
        "DEFAULT_PROVIDER",
        "generate_text",
        "get_active_config",
    ):
        assert hasattr(legacy, name), f"shim missing {name}"


# ── crypt_service has no dead encrypt_password function (AC) ────────


def test_crypt_service_has_no_encrypt_password_function():
    """AC: `def encrypt_password` must not appear in crypt_service.py."""
    import inspect

    from app.services import crypt_service

    src = inspect.getsource(crypt_service)
    assert "def encrypt_password" not in src, (
        "encrypt_password was removed as dead code — it must not be reintroduced"
    )


def test_no_module_imports_removed_encrypt_password():
    """Make sure no other module tries to import the removed symbol."""
    repo = Path(__file__).resolve().parents[1]
    bad_lines = []
    for py in repo.glob("app/**/*.py"):
        text = py.read_text(encoding="utf-8")
        if "import encrypt_password" in text or "encrypt_password," in text:
            bad_lines.append(str(py))
    assert not bad_lines, (
        f"these files still reference the removed encrypt_password: {bad_lines}"
    )
