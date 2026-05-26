"""End-to-end tests for the Self-Improvement (خودسازی) module.

Covers the full backend surface:
  * /api/self-improvement/overview              (dashboard payload)
  * /api/self-improvement/daily-update          (tick one/many)
  * /api/self-improvement/profile-analytics     (cached row + lazy backfill)
  * /api/self-improvement/profile-analytics/refresh

Auth: the routes depend on ``get_current_user`` which normally
verifies a JWT. The conftest in-memory DB doesn't have a real user,
so we override the dependency to return a hard-coded synthetic user
for each test. This matches the pattern used by the rest of the
codebase for service-layer integration tests.

Also covers the pure service-layer helpers — daily refresh,
auto-tick, basic-analytics computation — by driving them directly
through a SessionLocal-backed AsyncSession.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.database import Base, get_db
from app.dependencies.auth import get_current_user
from app.main import app
from app.models.self_improvement import (
    CHECKIN_STATUS_AUTO_DONE,
    CHECKIN_STATUS_DONE,
    SelfImprovementCheckIn,
)
from app.models.todo_item import TodoItem
from app.models.todo_list import TodoList, todo_list_items
from app.models.user import User
from app.services import self_improvement_service
from app.services._self_improvement_seed_data import (
    MUHASEBE_LIST_NAME,
    SELF_IMPROVEMENT_LISTS,
)


# --- Fixtures ---------------------------------------------------------------


class _StubUser:
    """Tiny stand-in for the User row the auth dependency would return.

    The routes only read ``id``, so a duck-type is enough — no need to
    INSERT a real User and chase the password-hash branch.
    """

    id = 1


@pytest_asyncio.fixture
async def si_client():
    """TestClient + per-test SQLite + auth dependency stubbed.

    Seeds the four خودسازی lists/items (mirrors what migration 0008
    does on a real DB) so the routes have something to operate on.
    """
    from fastapi.testclient import TestClient

    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def _get_db():
        async with factory() as session:
            yield session

    async def _get_current_user():
        return _StubUser()

    # Seed the four خودسازی sub-lists + items.
    async with factory() as session:
        await _seed_self_improvement_lists(session)

    app.dependency_overrides[get_db] = _get_db
    app.dependency_overrides[get_current_user] = _get_current_user
    try:
        client = TestClient(app)
        yield client, factory
    finally:
        app.dependency_overrides.clear()
        await engine.dispose()


async def _seed_self_improvement_lists(session):
    """Mirror migration 0008's seed pattern in the in-memory DB."""
    from app.services._self_improvement_seed_data import MUHASEBE_ITEMS
    from sqlalchemy import insert

    # Master list.
    muhasebe = TodoList(name=MUHASEBE_LIST_NAME)
    session.add(muhasebe)
    await session.commit()
    await session.refresh(muhasebe)
    for pos, content in enumerate(MUHASEBE_ITEMS):
        item = TodoItem(content=content)
        session.add(item)
        await session.commit()
        await session.refresh(item)
        await session.execute(
            insert(todo_list_items).values(
                todo_list_id=muhasebe.id, todo_item_id=item.id, position=pos
            )
        )
    await session.commit()

    # Three sub-lists.
    for list_name, items in SELF_IMPROVEMENT_LISTS.items():
        lst = TodoList(name=list_name)
        session.add(lst)
        await session.commit()
        await session.refresh(lst)
        for pos, content in enumerate(items):
            item = TodoItem(content=content)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            await session.execute(
                insert(todo_list_items).values(
                    todo_list_id=lst.id, todo_item_id=item.id, position=pos
                )
            )
        await session.commit()


# --- Overview endpoint -----------------------------------------------------


@pytest.mark.asyncio
async def test_overview_returns_four_sections_with_expected_counts(si_client):
    client, _factory = si_client
    r = client.get("/api/self-improvement/overview")
    assert r.status_code == 200, r.text
    body = r.json()
    # Four sections in priority order: muhasebe first, then the three habit cats.
    cats = [s["category"] for s in body["sections"]]
    assert cats[0] == "muhasebe"
    assert set(cats[1:]) == {"willpower", "love_god", "fears"}

    counts_by_cat = {s["category"]: s["total"] for s in body["sections"]}
    assert counts_by_cat["willpower"] == 28
    assert counts_by_cat["love_god"] == 12
    assert counts_by_cat["fears"] == 40
    # Aggregate total: 28+12+40 + len(muhasebe items)=10 = 90.
    assert body["items_total"] == 90
    # Nothing ticked yet.
    assert body["completed_today_total"] == 0
    for s in body["sections"]:
        for it in s["items"]:
            assert it["status"] == "pending"


@pytest.mark.asyncio
async def test_overview_persists_pending_rows_idempotently(si_client):
    client, factory = si_client
    # First call should create rows.
    client.get("/api/self-improvement/overview")
    async with factory() as db:
        from sqlalchemy import func, select
        n1 = (await db.execute(select(func.count()).select_from(SelfImprovementCheckIn))).scalar_one()
    assert n1 == 90  # one per item
    # Second call must NOT duplicate.
    client.get("/api/self-improvement/overview")
    async with factory() as db:
        from sqlalchemy import func, select
        n2 = (await db.execute(select(func.count()).select_from(SelfImprovementCheckIn))).scalar_one()
    assert n2 == 90


# --- Daily-update endpoint -------------------------------------------------


@pytest.mark.asyncio
async def test_daily_update_single_tick_returns_200(si_client):
    client, factory = si_client
    client.get("/api/self-improvement/overview")  # backfill pending rows
    # Pick the first willpower item.
    overview = client.get("/api/self-improvement/overview").json()
    willpower = next(s for s in overview["sections"] if s["category"] == "willpower")
    item_id = willpower["items"][0]["item_id"]

    r = client.post(
        "/api/self-improvement/daily-update",
        json={"item_id": item_id, "status": "done"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["applied"] == 1
    assert body["checkins"][0]["status"] == "done"
    assert body["checkins"][0]["item_id"] == item_id

    # Overview now reflects the tick.
    overview2 = client.get("/api/self-improvement/overview").json()
    assert overview2["completed_today_total"] == 1


@pytest.mark.asyncio
async def test_daily_update_bulk_ticks_many_items(si_client):
    client, _factory = si_client
    client.get("/api/self-improvement/overview")
    overview = client.get("/api/self-improvement/overview").json()
    fears = next(s for s in overview["sections"] if s["category"] == "fears")
    ids = [it["item_id"] for it in fears["items"][:5]]
    r = client.post(
        "/api/self-improvement/daily-update",
        json={"updates": [{"item_id": i, "status": "done"} for i in ids]},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["applied"] == 5
    assert all(c["status"] == "done" for c in body["checkins"])


@pytest.mark.asyncio
async def test_daily_update_then_untick_round_trip(si_client):
    client, _factory = si_client
    client.get("/api/self-improvement/overview")
    overview = client.get("/api/self-improvement/overview").json()
    item_id = overview["sections"][0]["items"][0]["item_id"]

    client.post(
        "/api/self-improvement/daily-update",
        json={"item_id": item_id, "status": "done"},
    )
    r2 = client.post(
        "/api/self-improvement/daily-update",
        json={"item_id": item_id, "status": "pending"},
    )
    assert r2.status_code == 200
    assert r2.json()["checkins"][0]["status"] == "pending"
    overview2 = client.get("/api/self-improvement/overview").json()
    assert overview2["completed_today_total"] == 0


# --- Profile analytics endpoint --------------------------------------------


@pytest.mark.asyncio
async def test_profile_analytics_lazy_backfill_returns_200(si_client):
    client, _factory = si_client
    r = client.get("/api/self-improvement/profile-analytics")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["user_id"] == 1
    assert body["payload"] is not None
    # Empty-state payload still has the per_category list populated
    # (with zeroes) for each category that has items in the DB.
    cats = {c["category"] for c in body["payload"]["per_category"]}
    assert {"willpower", "love_god", "fears", "muhasebe"} <= cats
    # Weekly chart has exactly 7 points.
    assert len(body["payload"]["weekly_completion"]) == 7


@pytest.mark.asyncio
async def test_profile_analytics_refresh_writes_summary(si_client):
    client, _factory = si_client
    r = client.post("/api/self-improvement/profile-analytics/refresh")
    assert r.status_code == 200, r.text
    body = r.json()
    # Even in no-API-key mode the placeholder generator returns a
    # deterministic prefix.
    assert body["summary"] is not None
    assert body["summary"].startswith("[ai-placeholder]") or len(body["summary"]) > 0
    assert body["last_refreshed_at"] is not None


# --- Service-layer direct tests --------------------------------------------


@pytest_asyncio.fixture
async def db_session():
    """Plain AsyncSession against an in-memory DB, no FastAPI overrides."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        await _seed_self_improvement_lists(session)
    async with factory() as session:
        yield session
    await engine.dispose()


@pytest.mark.asyncio
async def test_apply_ai_auto_ticks_marks_rows_as_auto_done(db_session):
    # Resolve a couple of item ids from the seeded willpower list.
    from sqlalchemy import select
    res = await db_session.execute(
        select(TodoItem.id).join(
            todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id
        ).join(TodoList, TodoList.id == todo_list_items.c.todo_list_id)
        .where(TodoList.name.in_(SELF_IMPROVEMENT_LISTS.keys()))
        .limit(3)
    )
    item_ids = [r for (r,) in res.all()]
    assert len(item_ids) == 3

    affected = await self_improvement_service.apply_ai_auto_ticks(
        db_session,
        user_id=42,
        item_ids=item_ids,
        reason="unit-test auto-tick",
        model="rule:test",
    )
    assert affected == 3
    # Verify status.
    from sqlalchemy import select as _select
    rows = (
        await db_session.execute(
            _select(SelfImprovementCheckIn).where(SelfImprovementCheckIn.user_id == 42)
        )
    ).scalars().all()
    assert len(rows) == 3
    assert all(r.status == CHECKIN_STATUS_AUTO_DONE for r in rows)
    assert all(r.ai_reason == "unit-test auto-tick" for r in rows)
    assert all(r.ai_model == "rule:test" for r in rows)


@pytest.mark.asyncio
async def test_compute_basic_analytics_30day_streak_math(db_session):
    """A 4-day consecutive streak ending today must report current=4."""
    from sqlalchemy import select
    res = await db_session.execute(
        select(TodoItem.id).join(
            todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id
        ).join(TodoList, TodoList.id == todo_list_items.c.todo_list_id)
        .where(TodoList.name.in_(SELF_IMPROVEMENT_LISTS.keys()))
        .limit(1)
    )
    (item_id,) = res.first()
    today = datetime.now(timezone.utc).date()
    for offset in range(4):
        d = today - timedelta(days=offset)
        await self_improvement_service.upsert_checkin(
            db_session,
            user_id=7,
            item_id=item_id,
            status=CHECKIN_STATUS_DONE,
            on_date=d,
        )

    payload = await self_improvement_service.compute_basic_analytics(
        db_session, user_id=7, lookback_days=30,
    )
    assert len(payload["weekly_completion"]) == 7
    # The category containing this item should have current_streak=4.
    streaks = [c for c in payload["per_category"] if c["current_streak_days"] == 4]
    assert len(streaks) == 1


@pytest.mark.asyncio
async def test_refresh_daily_pending_rows_is_idempotent(db_session):
    n1 = await self_improvement_service.refresh_daily_pending_rows(
        db_session, user_id=99,
    )
    assert n1 == 90  # 10 + 28 + 12 + 40
    n2 = await self_improvement_service.refresh_daily_pending_rows(
        db_session, user_id=99,
    )
    assert n2 == 0


# --- Auth coverage ---------------------------------------------------------


def test_overview_requires_auth(api_client):
    """Without the dependency override, anonymous requests must 401/403."""
    r = api_client.get("/api/self-improvement/overview")
    assert r.status_code in (401, 403), r.text
