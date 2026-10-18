"""«lla_coach» task route (Pólya tour round 20, decision MT2, 2026-10-18).

Evidence: on the same prompts the fast tier failed 4/8 scenarios and the balanced tier 0/8 (decisive-turn judgment,
ignoring her answer). Coaching turns of the page's floating assistant go to a new route whose AUTOMATIC pick is the
catalog's balanced tier (Flash/Sonnet: «reasoning» preferred, the top tier Opus/Pro ordered after them — the catalog's
own rule «Pro/Opus only on explicit pin»), with the same vision+documents requirement as «lla_assistant».
Every other route keeps its old order."""
from __future__ import annotations

import pytest
from sqlalchemy import select


def _task(tid):
    from app.services.ai.catalog import TASK_TYPES

    t = [x for x in TASK_TYPES if x["id"] == tid]
    assert len(t) == 1, tid
    return t[0]


def test_route_is_in_the_catalog_next_to_the_assistant():
    from app.services.ai.catalog import TASK_TYPES, task_preferred_capability, task_required_capabilities, task_tier

    ids = [t["id"] for t in TASK_TYPES]
    assert ids.index("lla_coach") == ids.index("lla_assistant") + 1
    t = _task("lla_coach")
    assert t["label"] and t["description"] and any("؀" <= ch <= "ۿ" for ch in t["label"])
    assert task_preferred_capability("lla_coach") == "reasoning"
    assert task_tier("lla_coach") == "balanced"
    assert task_required_capabilities("lla_coach") == task_required_capabilities("lla_assistant") == ["vision", "documents"]


def test_other_routes_unchanged():
    from app.services.ai.catalog import task_tier

    a = _task("lla_assistant")
    assert a["preferred"] == "fast" and a["requires"] == ["vision", "documents"] and "tier" not in a
    assert _task("learning_architecture")["preferred"] == "reasoning"
    from app.services.ai.catalog import TASK_TYPES

    assert [t["id"] for t in TASK_TYPES if task_tier(t["id"])] == ["lla_coach"]


def test_top_tier_is_derived_from_the_catalogs_tier_table():
    from app.services.ai.model_discovery import TOP_TIERS, model_tier

    assert TOP_TIERS == {"opus", "pro"}
    assert model_tier("anthropic", "claude-opus-4-8") == "opus"
    assert model_tier("anthropic", "claude-sonnet-4-6") == "sonnet"
    assert model_tier("gemini", "gemini-3.8-flash") == "flash"
    assert model_tier("openai", "gpt-4o") == "other"


def test_app_ai_accepts_the_coach_task(api_client, monkeypatch):
    from app.config import settings
    from tests.test_app_records import _signin

    # the owner gate is not under test here (test_app_records covers it); no admin configured ⇒ the gate is open
    monkeypatch.setattr(settings, "ADMIN_EMAILS", "")
    _signin(api_client)
    import app.services.ai.inference_gateway as gw

    seen = {}

    async def fake_complete(db, prompt, task="general", system=None, max_tokens=2500, **kw):
        seen["task"] = task
        return {"ok": True, "text": "سلام", "model": "m"}

    monkeypatch.setattr(gw, "complete", fake_complete)
    base = "/api/app-records/learning-architecture/ai"
    r = api_client.post(base, json={"system": "s", "user": "u", "task": "lla_coach"})
    assert r.status_code == 200 and r.json()["ok"] and seen["task"] == "lla_coach"
    r = api_client.post(base, json={"system": "s", "user": "u", "task": "lla_assistant"})
    assert r.status_code == 200 and seen["task"] == "lla_assistant"
    assert api_client.post(base, json={"system": "s", "user": "u", "task": "general"}).status_code == 422
    from app.routes.app_records import _AI_TASKS

    assert _AI_TASKS == {"learning_architecture", "lla_assistant", "lla_coach"}


async def _anthropic_only(db, monkeypatch):
    from app.models.ai_catalog import AICatalogProvider
    from app.services.ai.catalog import seed_ai_catalog

    await seed_ai_catalog(db)
    for k in ("GEMINI_API_KEY", "OPENAI_API_KEY", "CLAUDE_CODE_OAUTH_TOKEN"):
        monkeypatch.delenv(k, raising=False)
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test-1234567890")
    for p in (await db.execute(select(AICatalogProvider))).scalars().all():
        p.enabled = p.key == "anthropic"
    await db.commit()


@pytest.mark.asyncio
async def test_coach_auto_pick_is_the_balanced_tier_not_the_top(db_session, monkeypatch):
    """Static seed: Opus has priority 1, Sonnet 2. The coach still gets Sonnet; the top tier stays a later choice."""
    from app.services.ai.manager import ai_manager

    await _anthropic_only(db_session, monkeypatch)
    rm = await ai_manager.resolve(db_session, "lla_coach")
    assert rm.model_key == "claude-sonnet-4-6"
    order = [m.model_key for m in await ai_manager._auto_order(db_session, "lla_coach")]
    assert order.index("claude-sonnet-4-6") < order.index("claude-opus-4-8")
    # behaviour-preserving: a reasoning route without a tier keeps the old priority order
    assert (await ai_manager.resolve(db_session, "learning_architecture")).model_key == "claude-opus-4-8"
    # the assistant stays on the fast tier (Sonnet is the only fast model with vision+documents in this seed)
    assert (await ai_manager.resolve(db_session, "lla_assistant")).model_key == "claude-sonnet-4-6"


@pytest.mark.asyncio
async def test_coach_falls_back_to_the_top_tier_when_it_is_the_only_capable_model(db_session, monkeypatch):
    from app.models.ai_catalog import AICatalogModel
    from app.services.ai.manager import ai_manager

    await _anthropic_only(db_session, monkeypatch)
    son = (await db_session.execute(select(AICatalogModel).where(AICatalogModel.model_key == "claude-sonnet-4-6"))).scalar_one()
    son.enabled = False
    await db_session.commit()
    assert (await ai_manager.resolve(db_session, "lla_coach")).model_key == "claude-opus-4-8"


@pytest.mark.asyncio
async def test_coach_pin_wins_and_route_row_is_seeded(db_session, monkeypatch):
    from app.models.ai_catalog import AICatalogModel, AITaskRoute
    from app.services.ai.manager import ai_manager

    await _anthropic_only(db_session, monkeypatch)
    route = await db_session.get(AITaskRoute, "lla_coach")
    assert route is not None and route.model_id is None and route.enabled
    opus = (await db_session.execute(select(AICatalogModel).where(AICatalogModel.model_key == "claude-opus-4-8"))).scalar_one()
    route.model_id = opus.id
    await db_session.commit()
    assert (await ai_manager.resolve(db_session, "lla_coach")).model_key == "claude-opus-4-8"


@pytest.mark.asyncio
async def test_coach_after_live_refresh_picks_flash_not_pro(db_session, monkeypatch):
    from tests.test_ai_auto_selection import _live
    from app.services.ai.manager import ai_manager

    await _live(db_session, monkeypatch, ["gemini-4.0-flash", "gemini-4.0-flash-lite", "gemini-4.0-pro"])
    assert (await ai_manager.resolve(db_session, "lla_coach")).model_key == "gemini-4.0-flash"
    assert (await ai_manager.resolve(db_session, "lla_assistant")).model_key == "gemini-4.0-flash"


def test_settings_task_list_shows_the_coach_next_to_the_assistant(api_client):
    """The AI settings page lists tasks from the catalog overview (pin-able row, labels in Persian)."""
    r = api_client.get("/api/ai/overview")
    assert r.status_code == 200, r.text
    body = r.json()
    tasks = body.get("tasks") or (body.get("data") or {}).get("tasks")
    ids = [t["id"] for t in tasks]
    assert ids.index("lla_coach") == ids.index("lla_assistant") + 1
    assert [t for t in tasks if t["id"] == "lla_coach"][0]["requires"] == ["vision", "documents"]
