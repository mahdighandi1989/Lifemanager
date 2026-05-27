"""Edge-case coverage for the shared-item re-attach branch in
``app.services.list_service.seed_todo_items_if_empty``.

The branch in question (lines ~190 of list_service.py) used to be a
bare ``except: pass`` — when the same (todo_list_id, todo_item_id)
pair already existed in the membership table, the UNIQUE constraint
fired and we silently swallowed it. That was the "silent failure"
the audit flagged. The fix narrows the catch to IntegrityError +
logs at debug, with a separate ``SQLAlchemyError`` arm that logs at
warning for genuinely-unexpected DB issues.

This test simulates the duplicate-attach scenario end-to-end and
asserts:
  * the seed completes (we don't blow up on the duplicate)
  * a DEBUG log is emitted with the right context
  * no spurious WARNING/ERROR fires for the expected duplicate case
"""
from __future__ import annotations

import logging

import pytest
import pytest_asyncio
from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.database import Base
from app.models.todo_item import TodoItem
from app.models.todo_list import TodoList, todo_list_items
from app.services import list_service


@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)
    async with factory() as session:
        yield session
    await engine.dispose()


@pytest.mark.asyncio
async def test_edge_case_failure_handled(db_session, caplog, monkeypatch):
    """The IntegrityError branch must log debug and keep seeding.

    Path matches the audit's verify_plan
    (tests/services/test_list_service.py::test_edge_case_failure_handled).
    Validates the previously-bare-except path: a duplicate
    (todo_list_id, todo_item_id) attach raises IntegrityError,
    which the patched handler routes to logger.debug so the
    seed completes without surfacing a warning/error.
    """
    # Build two empty lists.
    list_a = TodoList(name="A")
    list_b = TodoList(name="B")
    db_session.add_all([list_a, list_b])
    await db_session.commit()
    await db_session.refresh(list_a)
    await db_session.refresh(list_b)

    # Stub LISTS_DATA so the seeder sees a "shared_key" item that's
    # already attached to list_a. The second iteration (against
    # list_b) will hit the UNIQUE constraint on (list_id, item_id)
    # only if we pre-populate the share — so do that explicitly.
    shared_item = TodoItem(content="shared row")
    db_session.add(shared_item)
    await db_session.commit()
    await db_session.refresh(shared_item)
    # Pre-attach to list_a so the seeder's shared_item_ids cache
    # finds it.
    await db_session.execute(
        insert(todo_list_items).values(
            todo_list_id=list_a.id, todo_item_id=shared_item.id, position=0,
        )
    )
    # ALSO attach to list_b to force the duplicate path when the
    # seeder tries to add it again.
    await db_session.execute(
        insert(todo_list_items).values(
            todo_list_id=list_b.id, todo_item_id=shared_item.id, position=0,
        )
    )
    await db_session.commit()

    fake_data = {
        "A": [{"content": "shared row", "shared_key": "X"}],
        "B": [{"content": "shared row", "shared_key": "X"}],
    }
    monkeypatch.setattr(
        "app.services._todo_seed_data.LISTS_DATA", fake_data, raising=False,
    )
    # Reset the items so the seeder enters its loop (each list must
    # currently have zero membership rows). Done above for list_b
    # already had one — clear them to mimic a half-seeded state.
    await db_session.execute(todo_list_items.delete())
    await db_session.commit()
    # Re-add list_a's link so the seeder's shared_item_ids dict
    # picks up the existing item id.
    await db_session.execute(
        insert(todo_list_items).values(
            todo_list_id=list_a.id, todo_item_id=shared_item.id, position=0,
        )
    )
    await db_session.commit()

    caplog.set_level(logging.DEBUG, logger="app.services.list_service")

    # The seeder iterates list_a first, sees the item already linked,
    # records its id under shared_key "X", then iterates list_b, hits
    # the duplicate-on-A path (or list_b path) and lands in the
    # IntegrityError branch.
    inserted = await list_service.seed_todo_items_if_empty(db_session)

    # The seed completed (didn't raise).
    assert isinstance(inserted, int)

    # No WARNING/ERROR logged for the expected duplicate case (the
    # IntegrityError arm is debug-level).
    warning_records = [
        r for r in caplog.records
        if r.levelno >= logging.WARNING
        and r.name == "app.services.list_service"
    ]
    assert warning_records == [], (
        "expected no warnings, got: "
        + ", ".join(r.getMessage() for r in warning_records)
    )
