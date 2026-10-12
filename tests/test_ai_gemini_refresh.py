"""Gemini catalog refresh (2026-10-12).

Production had only Gemini configured, with gemini-2.0-flash and gemini-1.5-pro —
both shut down by Google — so every AI feature resolved to a dead model. The
catalog now carries current models, switches the retired rows off (kept, never
deleted), and the Gemini adapter retries once when a "thinking" model spends the
whole output cap on reasoning and returns an empty answer.
"""
from __future__ import annotations

import pytest


@pytest.mark.asyncio
async def test_retired_gemini_rows_are_switched_off_and_current_ones_win(db_session, monkeypatch):
    from app.models.ai_catalog import AICatalogModel, AICatalogProvider
    from app.services.ai.catalog import seed_ai_catalog
    from app.services.ai.manager import ai_manager
    from sqlalchemy import select

    # An existing production-like DB: the old rows are there and enabled.
    db_session.add(AICatalogModel(model_key="gemini-1.5-pro", provider_key="gemini", display_name="Gemini 1.5 Pro",
                                  enabled=True, capabilities=["text", "reasoning"], priority=3, source="catalog", is_custom=False))
    db_session.add(AICatalogModel(model_key="gemini-2.0-flash", provider_key="gemini", display_name="Gemini 2.0 Flash",
                                  enabled=True, capabilities=["text", "fast"], priority=2, source="catalog", is_custom=False))
    await db_session.commit()

    summary = await seed_ai_catalog(db_session)
    await db_session.commit()
    assert summary.get("models_retired") == 2

    rows = {m.model_key: m for m in (await db_session.execute(select(AICatalogModel))).scalars().all()}
    assert rows["gemini-1.5-pro"].enabled is False and rows["gemini-2.0-flash"].enabled is False  # kept, off
    assert rows["gemini-3.8-flash"].enabled and rows["gemini-3.6-flash"].enabled

    monkeypatch.setenv("GEMINI_API_KEY", "g-test-123456")
    provider = await db_session.get(AICatalogProvider, "gemini")
    provider.enabled = True
    await db_session.commit()

    assert (await ai_manager.resolve(db_session, "learning_architecture")).model_key == "gemini-3.8-flash"  # reasoning
    assert (await ai_manager.resolve(db_session, "summarization")).model_key == "gemini-3.6-flash"  # fast
    for task in ("general", "chat", "translation", "document_extraction"):
        assert (await ai_manager.resolve(db_session, task)).model_key not in ("gemini-1.5-pro", "gemini-2.0-flash")

    # a second boot changes nothing (already off)
    again = await seed_ai_catalog(db_session)
    assert "models_retired" not in again


@pytest.mark.asyncio
async def test_gemini_empty_thinking_answer_is_retried_with_room(monkeypatch):
    from app.services.ai import inference_gateway as gw

    calls = []

    class Resp:
        def __init__(self, data):
            self._d = data

        def raise_for_status(self):
            return None

        def json(self):
            return self._d

    class Client:
        def __init__(self, *a, **k):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *a):
            return False

        async def post(self, url, json=None, **k):
            calls.append(json["generationConfig"]["maxOutputTokens"])
            if len(calls) == 1:
                return Resp({"candidates": [{"content": {"parts": [{"text": "…", "thought": True}]}, "finishReason": "MAX_TOKENS"}]})
            return Resp({"candidates": [{"content": {"parts": [{"text": "فکر", "thought": True}, {"text": "پاسخ"}]}, "finishReason": "STOP"}]})

    import httpx

    monkeypatch.setattr(httpx, "AsyncClient", Client)

    class RM:
        base_url = None
        model_key = "gemini-3.8-flash"
        api_key = "k"

    out = await gw._gemini_text(RM(), "سلام", None, 1024, None)
    assert out == "پاسخ"  # thought parts never leak into the answer
    assert calls == [1024, 8192]
