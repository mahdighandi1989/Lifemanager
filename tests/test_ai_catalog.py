"""AI catalog (ALLIN1 port) — seed idempotency, resolver, and endpoints.

Covers app/services/ai/catalog.py, manager.py, and app/routes/ai_catalog.py.
Unit tests use the real ``db_session`` fixture (the api_client fixture does not
run the startup seed). API tests assert the static parts of /overview + guards.
"""
from __future__ import annotations

import pytest


# ── seed + resolver (unit, against a real session) ───────────────────


@pytest.mark.asyncio
async def test_seed_ai_catalog_is_idempotent(db_session):
    from app.services.ai.catalog import seed_ai_catalog

    first = await seed_ai_catalog(db_session)
    assert first["providers_added"] > 0
    assert first["models_added"] > 0
    assert first["routes_added"] == 12  # one per TASK_TYPES entry

    second = await seed_ai_catalog(db_session)
    assert second == {"providers_added": 0, "models_added": 0, "routes_added": 0}


@pytest.mark.asyncio
async def test_resolver_needs_enabled_configured_provider(db_session, monkeypatch):
    from app.models.ai_catalog import AICatalogProvider
    from app.services.ai.catalog import seed_ai_catalog
    from app.services.ai.manager import ai_manager

    await seed_ai_catalog(db_session)

    # Nothing enabled/keyed yet → no model resolves.
    assert await ai_manager.is_available(db_session) is False
    assert await ai_manager.resolve(db_session, "chat") is None

    # Enable Anthropic and provide a key via the env-var fallback.
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-test-123456")
    provider = await db_session.get(AICatalogProvider, "anthropic")
    provider.enabled = True
    await db_session.commit()

    resolved = await ai_manager.resolve(db_session, "chat")
    assert resolved is not None and resolved.is_usable
    assert resolved.provider_key == "anthropic"
    assert resolved.api_key == "sk-test-123456"
    assert "reasoning" in resolved.capabilities
    status = await ai_manager.status(db_session)
    assert status["any_available"] is True and "anthropic" in status["configured_providers"]


@pytest.mark.asyncio
async def test_task_route_pins_specific_model(db_session, monkeypatch):
    from sqlalchemy import select

    from app.models.ai_catalog import AICatalogModel, AICatalogProvider, AITaskRoute
    from app.services.ai.catalog import seed_ai_catalog
    from app.services.ai.manager import ai_manager

    await seed_ai_catalog(db_session)
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-test-123456")
    provider = await db_session.get(AICatalogProvider, "anthropic")
    provider.enabled = True

    # Pin the "summarization" task to Haiku explicitly.
    haiku = (
        await db_session.execute(
            select(AICatalogModel).where(AICatalogModel.model_key == "claude-haiku-4-5-20251001")
        )
    ).scalar_one()
    route = await db_session.get(AITaskRoute, "summarization")
    route.model_id = haiku.id
    await db_session.commit()

    resolved = await ai_manager.resolve(db_session, "summarization")
    assert resolved is not None and resolved.model_key == haiku.api_id


# ── endpoints (api_client; catalog unseeded here) ────────────────────


def test_overview_serves_static_catalog_metadata(api_client):
    res = api_client.get("/api/ai/overview")
    assert res.status_code == 200, res.text
    body = res.json()
    task_ids = {t["id"] for t in body["tasks"]}
    assert {"chat", "planning", "document_extraction", "summarization"} <= task_ids
    cap_ids = {c["id"] for c in body["capabilities"]}
    assert {"documents", "vision", "reasoning"} <= cap_ids
    assert body["status"]["any_available"] is False  # nothing seeded/configured


def test_overview_dual_mounted(api_client):
    # SPA calls /api/ai/...; legacy /ai/... must also resolve.
    assert api_client.get("/api/ai/overview").status_code == 200
    assert api_client.get("/ai/overview").status_code == 200


def test_create_model_rejects_unknown_provider(api_client):
    res = api_client.post(
        "/api/ai/models",
        json={"model_key": "x-custom", "provider_key": "does-not-exist"},
    )
    assert res.status_code == 400, res.text


def test_update_unknown_route_rejected(api_client):
    assert api_client.put("/api/ai/routes/not-a-task", json={"model_id": 0}).status_code == 400
