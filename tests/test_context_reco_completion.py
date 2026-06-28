"""Completion of the context-aware recommendation engine (task 2165524b re-audit):
item↔place correlation, idle auto-detection, and the per-user scheduled loop.

These pin the gaps the engine had: the location branch now names the actual
registered item near a place, idle is inferred from a stale last_activity_time,
and the celery task reports per-user work in addition to the orchestrator self-check.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest


# ── (a) location branch correlates a registered item with a nearby place ─────


@pytest.mark.asyncio
async def test_location_recommendation_names_matching_task(db_session, monkeypatch):
    import app.services.recommendation_engine as engine
    from app.models.task import Task

    db_session.add(Task(user_id=0, title="خرید نان از نانوایی", status="todo"))
    await db_session.commit()

    async def fake_nearby(lat, lng, **kw):
        return [{"name": "نانوایی بربری", "place_id": "p1", "lat": lat, "lng": lng}]

    monkeypatch.setattr(engine, "find_nearby_places", fake_nearby)

    recs = await engine.generate_contextual_recommendations(
        db_session, user_id=0, context={"current_location": {"lat": 35.7, "lng": 51.4}}
    )
    loc = [r for r in recs if r["recommendation_type"] == "location"]
    assert loc, "a location recommendation should be produced"
    # the actual registered item is named, and the rec is linked to the task
    assert any("نان" in r["text"] for r in loc)
    assert any(r.get("task_id") for r in loc)


@pytest.mark.asyncio
async def test_location_recommendation_geo_match_by_coords(db_session, monkeypatch):
    """A task pinned to (near) the place's coordinates is matched even without a
    name overlap."""
    import app.services.recommendation_engine as engine
    from app.models.task import Task

    db_session.add(
        Task(user_id=0, title="ثبت‌نام کلاس", status="todo", location_lat=35.700, location_lng=51.400)
    )
    await db_session.commit()

    async def fake_nearby(lat, lng, **kw):
        return [{"name": "آموزشگاه", "place_id": "p2", "lat": 35.7005, "lng": 51.4005}]

    monkeypatch.setattr(engine, "find_nearby_places", fake_nearby)

    recs = await engine.generate_contextual_recommendations(
        db_session, user_id=0, context={"current_location": {"lat": 35.7, "lng": 51.4}}
    )
    loc = [r for r in recs if r["recommendation_type"] == "location"]
    assert any("ثبت‌نام کلاس" in r["text"] for r in loc)


@pytest.mark.asyncio
async def test_location_recommendation_generic_fallback_without_match(db_session, monkeypatch):
    """No registered item near the place → the generic nudge is still produced
    (behaviour-preserving)."""
    import app.services.recommendation_engine as engine

    async def fake_nearby(lat, lng, **kw):
        return [{"name": "فروشگاه", "place_id": "p3", "lat": lat, "lng": lng}]

    monkeypatch.setattr(engine, "find_nearby_places", fake_nearby)

    recs = await engine.generate_contextual_recommendations(
        db_session, user_id=0, context={"current_location": {"lat": 1.0, "lng": 2.0}}
    )
    loc = [r for r in recs if r["recommendation_type"] == "location"]
    assert loc and any("موردی از لیست‌تان" in r["text"] for r in loc)


# ── (c) idle auto-detection from a stale last_activity_time ───────────────────


@pytest.mark.asyncio
async def test_idle_inferred_from_stale_last_activity(db_session):
    import app.services.recommendation_engine as engine

    old = (datetime.now(timezone.utc) - timedelta(hours=3)).isoformat()
    recs = await engine.generate_contextual_recommendations(
        db_session, user_id=0, context={"last_activity_time": old}
    )
    assert any(r["recommendation_type"] == "behavioral" for r in recs)


@pytest.mark.asyncio
async def test_recent_activity_is_not_idle(db_session):
    import app.services.recommendation_engine as engine

    recent = datetime.now(timezone.utc).isoformat()
    recs = await engine.generate_contextual_recommendations(
        db_session, user_id=0, context={"last_activity_time": recent}
    )
    assert not any(r["recommendation_type"] == "behavioral" for r in recs)


@pytest.mark.asyncio
async def test_empty_context_still_returns_nothing(db_session):
    """Regression: an empty context must still produce no recommendations."""
    import app.services.recommendation_engine as engine

    assert await engine.generate_contextual_recommendations(db_session, user_id=0, context={}) == []


# ── (d) scheduled task reports per-user work (in addition to the self-check) ──


def test_analyze_user_context_reports_per_user_keys():
    from app.tasks import analyze_user_context

    result = analyze_user_context()
    assert result["suggestions"] >= 1  # orchestrator self-check (DB-free)
    assert "users_analyzed" in result
    assert "recommendations" in result


# ── (h) the analysis interval is configurable ────────────────────────────────


def test_context_interval_setting_exists():
    from app.config import settings

    assert hasattr(settings, "CONTEXT_ANALYSIS_INTERVAL_MINUTES")
    assert hasattr(settings, "CONTEXT_IDLE_MINUTES")
