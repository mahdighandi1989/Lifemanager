"""Fully automatic model choice (owner 2026-10-14: «مدل خودکار انتخاب شود، وصل به همان بخشی که مدل‌ها از آن تغذیه
می‌کنند، همیشه به‌روز، بی انتخاب یا به‌روزرسانیِ دستی؛ منقضی‌ها کنار گذاشته شوند»):
- a task's REQUIRED capabilities (the chat assistant reads screenshots/PDFs at any turn) beat a text-only fast model;
- priority ties go to the NEWER model, not database order;
- a failed call (retired model, outage) falls over to the next candidate;
- a pin to a model the provider retired is released by the refresh;
- the Claude id parser no longer reads a date as a minor version."""
from __future__ import annotations

import pytest
from sqlalchemy import select

pytestmark = pytest.mark.asyncio


def _g(mid):
    return {"id": mid, "display": mid, "methods": ["generateContent"], "input_limit": 1048576, "output_limit": 65536}


async def _live(db, monkeypatch, ids):
    from app.models.ai_catalog import AICatalogProvider
    from app.services.ai import model_discovery as md
    from app.services.ai.catalog import seed_ai_catalog

    await seed_ai_catalog(db)
    monkeypatch.setenv("GEMINI_API_KEY", "g-test-123456")
    (await db.get(AICatalogProvider, "gemini")).enabled = True
    await db.commit()

    async def fake_list(provider, key):
        return [_g(i) for i in ids]

    monkeypatch.setattr(md, "list_live_models", fake_list)
    assert (await md.refresh_provider(db, "gemini"))["ok"]


async def _model(db, key):
    from app.models.ai_catalog import AICatalogModel

    return (await db.execute(select(AICatalogModel).where(AICatalogModel.model_key == key))).scalar_one()


def test_claude_date_is_not_a_minor_version():
    from app.services.ai.model_discovery import classify

    assert classify("anthropic", {"id": "claude-opus-4-20250514"})["rank"] == 4.0
    assert classify("anthropic", {"id": "claude-opus-4-1"})["rank"] == 4.1
    assert classify("anthropic", {"id": "claude-sonnet-5-5"})["rank"] == 5.5


async def test_assistant_gets_newest_fast_vision_model_automatically(db_session, monkeypatch):
    from app.services.ai.manager import ai_manager

    await _live(db_session, monkeypatch, ["gemini-4.0-flash", "gemini-4.0-flash-lite", "gemini-4.0-pro"])
    rm = await ai_manager.resolve(db_session, "lla_assistant")
    assert rm.model_key == "gemini-4.0-flash"
    assert {"fast", "vision", "documents"} <= set(rm.capabilities)

    # a text-only «fast» model must not win just because it is fast (owner-made row, same priority)
    from app.models.ai_catalog import AICatalogModel

    flash = await _model(db_session, "gemini-4.0-flash")
    db_session.add(AICatalogModel(provider_key="gemini", model_key="gemini-textonly-fast", display_name="t",
                                  capabilities=["text", "fast"], enabled=True, priority=1, source="custom"))
    await db_session.commit()
    assert (await ai_manager.resolve(db_session, "lla_assistant")).model_key == flash.model_key
    # tasks without a requirement keep the old behaviour (lowest priority among the preferred capability)
    assert (await ai_manager.resolve(db_session, "translation")).model_key == "gemini-textonly-fast"


async def test_priority_tie_goes_to_the_newer_model(db_session, monkeypatch):
    from app.services.ai.manager import ai_manager

    await _live(db_session, monkeypatch, ["gemini-3.8-flash", "gemini-4.0-flash"])
    old = await _model(db_session, "gemini-3.8-flash")
    old.priority = 2  # same priority as the newest (e.g. an owner edit) — newness must decide
    await db_session.commit()
    assert (await ai_manager.resolve(db_session, "summarization")).model_key == "gemini-4.0-flash"


async def test_failed_call_falls_over_to_the_next_candidate(db_session, monkeypatch):
    from app.services.ai import inference_gateway as gw

    await _live(db_session, monkeypatch, ["gemini-4.0-flash", "gemini-4.0-flash-lite"])
    seen = []

    async def fake_text(rm, prompt, system, max_tokens, temperature):
        seen.append(rm.model_key)
        if rm.model_key == "gemini-4.0-flash":
            raise RuntimeError("404 model retired")
        return "ok from " + rm.model_key

    monkeypatch.setattr(gw, "_gemini_text", fake_text)
    res = await gw.complete(db_session, "hi", task="lla_assistant")
    assert res["ok"] and res["text"] == "ok from gemini-4.0-flash-lite"
    assert seen == ["gemini-4.0-flash", "gemini-4.0-flash-lite"]


async def test_refresh_releases_a_pin_to_a_retired_model(db_session, monkeypatch):
    from app.models.ai_catalog import AITaskRoute
    from app.services.ai import model_discovery as md

    await _live(db_session, monkeypatch, ["gemini-4.0-flash", "gemini-3.8-flash"])
    old = await _model(db_session, "gemini-3.8-flash")
    route = await db_session.get(AITaskRoute, "lla_assistant")
    if route is None:
        route = AITaskRoute(task="lla_assistant", enabled=True)
        db_session.add(route)
    route.model_id = old.id
    await db_session.commit()

    async def fake_list(provider, key):
        return [_g("gemini-4.0-flash")]  # 3.8 retired by the provider

    monkeypatch.setattr(md, "list_live_models", fake_list)
    res = await md.refresh_all(db_session)
    assert "lla_assistant" in res["_routes"]["released"]
    route = await db_session.get(AITaskRoute, "lla_assistant")
    assert route.model_id is None and "auto-released" in (route.notes or "")
