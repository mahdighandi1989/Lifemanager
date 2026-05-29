"""AIService ↔ DB integration tests (audit task b7894694).

Exercises the real AIService against the in-memory SQLite session (no mocks):
config CRUD, the no-key query/generate fallbacks, and active-config selection —
including the two cases the prior flat file omitted
(test_ai_service_query_without_api_key, test_get_active_config_returns_active_config).
"""
from __future__ import annotations

import pytest

from app.schemas.ai_schema import AIModelConfigCreate, AIQueryRequest


@pytest.mark.asyncio
async def test_ai_service_config_crud_roundtrip(db_session):
    from app.services.ai_service import AIService

    svc = AIService(db_session)
    created = await svc.create_config(
        AIModelConfigCreate(
            name="gpt", provider="openai", model_name="gpt-4o-mini", is_active=True
        ),
        user_id=1,
    )
    assert created.id is not None
    listing = await svc.get_user_configs(user_id=1)
    assert any(c.id == created.id for c in listing)

    deleted = await svc.delete_config(created.id, user_id=1)
    assert deleted is True
    assert all(c.id != created.id for c in await svc.get_user_configs(user_id=1))


@pytest.mark.asyncio
async def test_ai_service_query_without_api_key(db_session, monkeypatch):
    """Without an upstream key the query path still returns the canonical
    AIQueryResponse shape (no crash, no external call)."""
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    from app.services.ai_service import AIService

    svc = AIService(db_session, api_key=None)
    resp = await svc.query(AIQueryRequest(prompt="hello"), user_id=1)
    assert resp.model_used and isinstance(resp.response, str)
    assert resp.tokens_used == 0


@pytest.mark.asyncio
async def test_generate_text_placeholder_without_key(db_session, monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    from app.services.ai_service import AIService

    out = await AIService(db_session, api_key=None).generate_text(prompt="hi")
    assert "generated_text" in out and out["model_used"]


@pytest.mark.asyncio
async def test_get_active_config_returns_active_config(db_session):
    from app.services.ai.model_service import get_active_config
    from app.services.ai_service import AIService

    svc = AIService(db_session)
    await svc.create_config(
        AIModelConfigCreate(name="inactive", provider="openai", model_name="m1", is_active=False),
        user_id=1,
    )
    active = await svc.create_config(
        AIModelConfigCreate(name="active", provider="openai", model_name="m2", is_active=True),
        user_id=1,
    )
    found = await get_active_config(db_session)
    assert found is not None and found.id == active.id and found.is_active is True
