"""Automatic AI model refresh (owner 2026-10-12: «به‌روز رسانی مدل‌ها نباید هارد کد
باشد … خودکار، بدون زدن دکمه»). The live provider list decides; a daily job
(``ai_model_refresh``) and the existing button run the same reconcile."""
from __future__ import annotations

import pytest
from sqlalchemy import select


def _g(mid, out=65536, inp=1048576, methods=("generateContent", "countTokens")):
    return {"id": mid, "display": mid.replace("-", " ").title(), "methods": list(methods),
            "input_limit": inp, "output_limit": out}


LIVE = [
    _g("gemini-4.0-flash"), _g("gemini-3.8-flash"), _g("gemini-4.0-flash-lite"), _g("gemini-4.0-pro"),
    _g("gemini-4.1-flash-preview-11-2026"), _g("gemini-flash-latest"),
    _g("text-embedding-005", methods=("embedContent",)), _g("imagen-5.0-generate"),
    _g("gemma-4-27b-it"),
]


def test_classification_is_inferred_not_listed():
    from app.services.ai.model_discovery import assign_priorities, classify

    assert classify("gemini", _g("text-embedding-005", methods=("embedContent",))) is None
    assert classify("gemini", _g("imagen-5.0-generate")) is None
    assert classify("gemini", _g("gemma-4-27b-it")) is None
    pro = classify("gemini", _g("gemini-4.0-pro"))
    assert pro["stable"] and "reasoning" in pro["caps"] and "fast" not in pro["caps"]
    lite = classify("gemini", _g("gemini-4.0-flash-lite"))
    assert lite["tier"] == "flash-lite" and "fast" in lite["caps"]
    assert classify("gemini", _g("gemini-4.1-flash-preview-11-2026"))["stable"] is False
    assert classify("anthropic", {"id": "claude-sonnet-5-5"})["tier"] == "sonnet"
    assert classify("anthropic", {"id": "claude-2.1"}) is None
    other = classify("openai", {"id": "gpt-x"})
    assert other["stable"] is False  # unknown families are listed, never auto-enabled

    entries = [{"info": i, "cls": classify("gemini", i)} for i in LIVE]
    entries = [e for e in entries if e["cls"]]
    assign_priorities(entries)
    pri = {e["info"]["id"]: e["priority"] for e in entries}
    assert pri["gemini-4.0-flash"] == 2 and pri["gemini-3.8-flash"] == 4  # older stable flash demoted
    assert pri["gemini-4.0-flash-lite"] == 3 and pri["gemini-4.0-pro"] == 4
    assert pri["gemini-4.1-flash-preview-11-2026"] == 7


async def _setup(db, monkeypatch):
    from app.models.ai_catalog import AICatalogProvider
    from app.services.ai.catalog import seed_ai_catalog

    await seed_ai_catalog(db)
    monkeypatch.setenv("GEMINI_API_KEY", "g-test-123456")
    (await db.get(AICatalogProvider, "gemini")).enabled = True
    await db.commit()


async def _rows(db):
    from app.models.ai_catalog import AICatalogModel

    return {m.model_key: m for m in (await db.execute(select(AICatalogModel))).scalars().all()}


@pytest.mark.asyncio
async def test_refresh_adds_new_retires_vanished_and_routes_to_the_newest(db_session, monkeypatch):
    from app.services.ai import model_discovery as md
    from app.services.ai.catalog import seed_ai_catalog
    from app.services.ai.manager import ai_manager

    await _setup(db_session, monkeypatch)

    async def fake_list(provider, key):
        assert key == "g-test-123456"
        return LIVE

    monkeypatch.setattr(md, "list_live_models", fake_list)
    res = await md.refresh_provider(db_session, "gemini")
    assert res["ok"] and res["added"] >= 4 and res["retired"] >= 1

    rows = await _rows(db_session)
    assert rows["gemini-4.0-flash"].enabled and rows["gemini-4.0-flash"].max_output_tokens == 65536
    assert rows["gemini-4.0-flash-lite"].enabled and rows["gemini-4.0-pro"].enabled
    assert rows["gemini-4.1-flash-preview-11-2026"].enabled is False, "previews stay off"
    assert "gemma-4-27b-it" not in rows and "text-embedding-005" not in rows
    # gemini-3.6-flash (seeded) is no longer listed ⇒ off, labelled, kept
    gone = rows["gemini-3.6-flash"]
    assert gone.enabled is False and md.GONE_MARK in gone.notes and md.GONE_SUFFIX in gone.display_name
    # resolver follows automatically — no code change, no button
    assert (await ai_manager.resolve(db_session, "learning_architecture")).model_key == "gemini-4.0-flash"
    assert (await ai_manager.resolve(db_session, "summarization")).model_key == "gemini-4.0-flash"

    # the boot-time seed must not undo the refresh
    await seed_ai_catalog(db_session)
    rows = await _rows(db_session)
    assert rows["gemini-3.6-flash"].enabled is False and md.GONE_SUFFIX in rows["gemini-3.6-flash"].display_name
    assert rows["gemini-3.8-flash"].priority == 4 and rows["gemini-3.8-flash"].max_output_tokens == 65536

    # it comes back ⇒ label removed
    async def back(provider, key):
        return LIVE + [_g("gemini-3.6-flash")]

    monkeypatch.setattr(md, "list_live_models", back)
    await md.refresh_provider(db_session, "gemini")
    r = (await _rows(db_session))["gemini-3.6-flash"]
    assert md.GONE_MARK not in (r.notes or "") and md.GONE_SUFFIX not in r.display_name


@pytest.mark.asyncio
async def test_outage_or_empty_list_never_switches_anything_off(db_session, monkeypatch):
    from app.services.ai import model_discovery as md

    await _setup(db_session, monkeypatch)
    before = {k: m.enabled for k, m in (await _rows(db_session)).items()}

    async def empty(provider, key):
        return []

    async def boom(provider, key):
        raise RuntimeError("HTTP 503 https://x/v1beta/models?key=AIzaSECRETSECRETSECRETSECRETSECRET12345")

    monkeypatch.setattr(md, "list_live_models", empty)
    assert (await md.refresh_provider(db_session, "gemini"))["ok"] is False
    monkeypatch.setattr(md, "list_live_models", boom)
    res = await md.refresh_all(db_session)
    assert res["gemini"]["ok"] is False and "AIzaSECRET" not in res["gemini"]["message"], "key never echoed"
    assert {k: m.enabled for k, m in (await _rows(db_session)).items()} == before


@pytest.mark.asyncio
async def test_owner_choice_is_kept_but_a_vanished_model_still_goes_off(db_session, monkeypatch):
    from app.services.ai import model_discovery as md

    await _setup(db_session, monkeypatch)
    rows = await _rows(db_session)
    rows["gemini-3.8-flash"].enabled = False
    rows["gemini-3.8-flash"].priority = 1
    rows["gemini-3.8-flash"].notes = md.OWNER_MARK
    await db_session.commit()

    async def fake_list(provider, key):
        return [_g("gemini-3.8-flash"), _g("gemini-3.6-flash")]

    monkeypatch.setattr(md, "list_live_models", fake_list)
    await md.refresh_provider(db_session, "gemini")
    r = (await _rows(db_session))["gemini-3.8-flash"]
    assert r.enabled is False and r.priority == 1, "owner's off + priority survive the refresh"

    async def without(provider, key):
        return [_g("gemini-3.6-flash")]

    rows["gemini-3.8-flash"].enabled = True
    await db_session.commit()
    monkeypatch.setattr(md, "list_live_models", without)
    await md.refresh_provider(db_session, "gemini")
    assert (await _rows(db_session))["gemini-3.8-flash"].enabled is False, "a dead model is off even if owner-pinned"


@pytest.mark.asyncio
async def test_model_key_collisions_get_a_free_key(db_session, monkeypatch):
    from app.models.ai_catalog import AICatalogModel, AICatalogProvider
    from app.services.ai import model_discovery as md

    await _setup(db_session, monkeypatch)
    # an owner's custom row already uses the bare id
    db_session.add(AICatalogModel(model_key="gemini-4.0-flash", provider_key="gemini", display_name="mine",
                                  enabled=True, capabilities=["text"], priority=5, source="custom", is_custom=True))
    await db_session.commit()

    async def fake_list(provider, key):
        return [_g("gemini-4.0-flash")]

    monkeypatch.setattr(md, "list_live_models", fake_list)
    await md.refresh_provider(db_session, "gemini")
    rows = await _rows(db_session)
    assert rows["gemini-4.0-flash"].is_custom and rows["gemini-4.0-flash"].display_name == "mine"
    new = rows["gemini:gemini-4.0-flash"]
    assert new.api_id == "gemini-4.0-flash" and new.provider_key == "gemini"
    # second run finds it by api id — no duplicate
    await md.refresh_provider(db_session, "gemini")
    assert len([k for k in await _rows(db_session) if "gemini-4.0-flash" in k]) == 2

    # claude ids under both providers
    taken = {"claude-sonnet-5-5": AICatalogModel(model_key="claude-sonnet-5-5", provider_key="anthropic")}
    assert md._key_for("claude_subscription", "claude-sonnet-5-5", taken) == "claude-sonnet-5-5-sub"
    assert AICatalogProvider  # imported for clarity


def test_daily_job_is_registered():
    from app.services.jobs_engine import JOBS

    jobs = {k: fn() for k, _t, fn, _b in JOBS}
    assert jobs["ai_model_refresh"] == 24 * 60.0


@pytest.mark.asyncio
async def test_owner_edit_marks_the_row(db_session, monkeypatch):
    from app.routes.ai_catalog import update_catalog_model
    from app.schemas.ai_catalog_schema import CatalogModelUpdate

    await _setup(db_session, monkeypatch)
    mid = (await _rows(db_session))["gemini-3.8-flash"].id
    r = await update_catalog_model(mid, CatalogModelUpdate(enabled=False, notes="یادداشت"), db_session, 0)
    assert r["notes"].startswith("یادداشت") and "[owner]" in r["notes"]
    r = await update_catalog_model(mid, CatalogModelUpdate(display_name="x"), db_session, 0)
    assert r["notes"].count("[owner]") == 1
