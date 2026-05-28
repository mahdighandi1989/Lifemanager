"""Unit tests for app/services/ai_service.py — the actual class surface.

The prior file targeted methods that never existed on AIService
(`generate_response`, `analyze_text`, `get_suggestions`, `_call_ai_api`)
and tried to construct it with no arguments. The real class needs a
`db: AsyncSession` and exposes get_user_configs / create_config /
update_config / delete_config / query / verify_token. The module-level
`generate_text` is the helper used by /ai/generate.
"""
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.database import Base
from app.schemas.ai_schema import AIModelConfigCreate, AIQueryRequest
from app.services.ai_service import AIService, generate_text, get_active_config


@pytest_asyncio.fixture
async def session_factory():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    yield factory
    await engine.dispose()


# --- import smoke -----------------------------------------------------------

def test_ai_service_runs():
    """AC test_node `tests/test_ai_service.py::test_ai_service_runs`.

    The AI service module must import cleanly and expose the class +
    helpers. The class needs a db session at construction time; just
    asserting the symbol surface is enough for this smoke check.
    """
    assert AIService is not None
    assert callable(generate_text)
    assert callable(get_active_config)


def test_ai_service_initializes_without_import_errors():
    """AC7 (task 97867b277c1b): removing the dead module-level
    ``generate_text`` import from ``app/routes/ai.py`` must not leave the AI
    surface unimportable. Importing the routes module raises no ImportError,
    the removed symbol does not leak back into the routes namespace (AC5),
    and ``/ai/generate`` still resolves through the AIService instance
    method rather than a module-level helper (AC6)."""
    import importlib
    import inspect

    routes_ai = importlib.import_module("app.routes.ai")
    # The dead `generate_text` symbol must NOT be bound in the routes module
    # namespace — that import was the thing removed (AC5).
    assert not hasattr(routes_ai, "generate_text"), (
        "app/routes/ai.py still binds a module-level generate_text — the "
        "dead import should have been removed."
    )
    # AIService remains the canonical entry point and is constructible.
    assert callable(AIService)
    # The generate endpoint routes through the AIService instance method.
    assert "ai_service.generate_text" in inspect.getsource(routes_ai.generate)


# --- generate_text (no API key -> placeholder) ------------------------------

@pytest.mark.asyncio
async def test_generate_text_returns_placeholder_without_api_key(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    result = await generate_text("hello world")
    assert "generated_text" in result
    assert result["generated_text"].startswith("[ai-placeholder]")
    assert result["model_used"]
    assert result["tokens_used"] == 0


@pytest.mark.asyncio
async def test_generate_text_includes_prompt_length_in_placeholder(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    result = await generate_text("hi")
    assert "length=2" in result["generated_text"]


# --- AIService config CRUD (in-memory SQLite) -------------------------------

@pytest.mark.asyncio
async def test_aiservice_create_then_list_configs(session_factory):
    async with session_factory() as db:
        svc = AIService(db)
        created = await svc.create_config(
            AIModelConfigCreate(
                name="dev-openai",
                provider="openai",
                model_name="gpt-3.5-turbo",
                is_active=True,
            ),
            user_id=1,
        )
        assert created.id is not None
        assert created.name == "dev-openai"

    async with session_factory() as db:
        svc = AIService(db)
        configs = await svc.get_user_configs(user_id=1)
        assert any(c.name == "dev-openai" for c in configs)


@pytest.mark.asyncio
async def test_aiservice_delete_config_removes_row(session_factory):
    async with session_factory() as db:
        svc = AIService(db)
        created = await svc.create_config(
            AIModelConfigCreate(
                name="to-remove",
                provider="openai",
                model_name="gpt-3.5-turbo",
            ),
            user_id=1,
        )
        config_id = created.id

    async with session_factory() as db:
        svc = AIService(db)
        ok = await svc.delete_config(config_id, user_id=1)
        assert ok is True

    async with session_factory() as db:
        svc = AIService(db)
        ok_again = await svc.delete_config(config_id, user_id=1)
        assert ok_again is False  # already gone


@pytest.mark.asyncio
async def test_aiservice_query_returns_response(session_factory):
    async with session_factory() as db:
        svc = AIService(db)
        resp = await svc.query(
            AIQueryRequest(prompt="hello world"),
            user_id=1,
        )
        assert resp.response
        assert resp.model_used


@pytest.mark.asyncio
async def test_get_active_config_returns_none_when_empty(session_factory):
    async with session_factory() as db:
        assert await get_active_config(db) is None
