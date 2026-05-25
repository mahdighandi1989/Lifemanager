"""Tests for planner_service.generate_daily_plan and search_tasks.

Replaces the previous file which referenced a class PlannerService with
create_plan/get_plan methods — neither exists in this codebase.
"""

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.database import Base
from app.models.task import Task, TaskPriority, TaskStatus
from app.services.planner_service import generate_daily_plan, search_tasks


@pytest_asyncio.fixture
async def session_factory():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    yield factory
    await engine.dispose()


async def _add_task(session_factory, **kwargs):
    async with session_factory() as db:
        t = Task(**kwargs)
        db.add(t)
        await db.commit()
        await db.refresh(t)
        return t


# --- generate_daily_plan -----------------------------------------------------

@pytest.mark.asyncio
async def test_generate_daily_plan_returns_empty_for_user_without_tasks(session_factory):
    async with session_factory() as db:
        plan = await generate_daily_plan(db, user_id=42, target_date="2025-03-15")
    assert plan["total"] == 0
    assert plan["tasks"] == []
    assert plan["daily_plan"] == []
    assert plan["date"] == "2025-03-15"


@pytest.mark.asyncio
async def test_generate_daily_plan_includes_user_tasks(session_factory):
    await _add_task(session_factory, title="a", user_id=1)
    await _add_task(session_factory, title="b", user_id=1)
    async with session_factory() as db:
        plan = await generate_daily_plan(db, user_id=1)
    assert plan["total"] == 2
    assert {t["title"] for t in plan["tasks"]} == {"a", "b"}
    assert len(plan["daily_plan"]) == 2


@pytest.mark.asyncio
async def test_generate_daily_plan_sorts_by_priority(session_factory):
    """Critical/high priorities come before medium/low."""
    await _add_task(session_factory, title="medium-task", user_id=1, priority=TaskPriority.MEDIUM)
    await _add_task(session_factory, title="critical-task", user_id=1, priority=TaskPriority.CRITICAL)
    await _add_task(session_factory, title="low-task", user_id=1, priority=TaskPriority.LOW)
    async with session_factory() as db:
        plan = await generate_daily_plan(db, user_id=1)
    titles = [t["title"] for t in plan["tasks"]]
    assert titles.index("critical-task") < titles.index("medium-task") < titles.index("low-task")


@pytest.mark.asyncio
async def test_generate_daily_plan_excludes_done_tasks(session_factory):
    await _add_task(session_factory, title="open", user_id=1, status=TaskStatus.TODO)
    await _add_task(session_factory, title="done", user_id=1, status=TaskStatus.DONE)
    async with session_factory() as db:
        plan = await generate_daily_plan(db, user_id=1)
    titles = [t["title"] for t in plan["tasks"]]
    assert "open" in titles
    assert "done" not in titles


@pytest.mark.asyncio
async def test_generate_daily_plan_schedule_carries_starts_at(session_factory):
    await _add_task(session_factory, title="x", user_id=1)
    async with session_factory() as db:
        plan = await generate_daily_plan(db, user_id=1, target_date="2025-03-15")
    slot = plan["daily_plan"][0]
    assert slot["task_id"] is not None
    assert slot["starts_at"].startswith("2025-03-15T09:00")
    assert slot["ends_at"].startswith("2025-03-15T09:30")


# --- search_tasks (parameterized — SQL injection is impossible) -------------

@pytest.mark.asyncio
async def test_search_tasks_finds_substring_match(session_factory):
    await _add_task(session_factory, title="buy milk", user_id=1)
    await _add_task(session_factory, title="write report", user_id=1)
    async with session_factory() as db:
        rows = await search_tasks(db, user_id=1, query="milk")
    assert [t.title for t in rows] == ["buy milk"]


@pytest.mark.asyncio
async def test_search_tasks_treats_injection_payload_as_literal(session_factory):
    """A SQL-injection probe must not bypass the user_id filter."""
    await _add_task(session_factory, title="user-1 task", user_id=1)
    await _add_task(session_factory, title="user-2 task", user_id=2)
    async with session_factory() as db:
        rows = await search_tasks(db, user_id=1, query="' OR 1=1--")
    # The probe is treated as literal text in a LIKE pattern and matches
    # nothing real. user_id=2's row is NOT returned.
    assert rows == []
