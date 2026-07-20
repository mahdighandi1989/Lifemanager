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
from app.dependencies.auth import get_optional_user_id
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


_STUB_USER_ID = 1


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

    async def _get_optional_user_id():
        return _STUB_USER_ID

    # Seed the four خودسازی sub-lists + items.
    async with factory() as session:
        await _seed_self_improvement_lists(session)

    app.dependency_overrides[get_db] = _get_db
    app.dependency_overrides[get_optional_user_id] = _get_optional_user_id
    try:
        client = TestClient(app)
        yield client, factory
    finally:
        app.dependency_overrides.clear()
        await engine.dispose()


async def _seed_self_improvement_lists(session):
    """Seed the five خودسازی lists into the in-memory DB.

    Delegates to the runtime seeder so the tests exercise the same
    code path the production startup hook uses (no duplication of
    insert logic). The runtime helper also handles descriptions and
    the new divine-man list — features migration 0008 alone doesn't
    cover.
    """
    from app.services.self_improvement_service import ensure_lists_seeded
    await ensure_lists_seeded(session)


# --- Overview endpoint -----------------------------------------------------


@pytest.mark.asyncio
async def test_overview_returns_eight_sections_with_expected_counts(si_client):
    client, _factory = si_client
    r = client.get("/api/self-improvement/overview")
    assert r.status_code == 200, r.text
    body = r.json()
    cats = [s["category"] for s in body["sections"]]
    # muhasebe leads; the four habit categories + three new lists follow.
    assert cats[0] == "muhasebe"
    assert set(cats[1:]) == {
        "willpower", "love_god", "fears", "divine_man",
        "muraqebe", "tazakkor", "dreams",
    }

    counts_by_cat = {s["category"]: s["total"] for s in body["sections"]}
    assert counts_by_cat["muhasebe"] == 17
    assert counts_by_cat["willpower"] == 28
    assert counts_by_cat["love_god"] == 12
    assert counts_by_cat["fears"] == 40
    assert counts_by_cat["divine_man"] == 39
    assert counts_by_cat["muraqebe"] == 7
    # tazakkor + dreams are description-only / user-journal lists.
    assert counts_by_cat["tazakkor"] == 0
    assert counts_by_cat["dreams"] == 0
    # Aggregate: 17 + 28 + 12 + 40 + 39 + 7 + 0 + 0 = 143.
    assert body["items_total"] == 143
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
    assert n1 == 143  # one per item across all eight lists
    # Second call must NOT duplicate.
    client.get("/api/self-improvement/overview")
    async with factory() as db:
        from sqlalchemy import func, select
        n2 = (await db.execute(select(func.count()).select_from(SelfImprovementCheckIn))).scalar_one()
    assert n2 == 143


@pytest.mark.asyncio
async def test_realign_runs_even_when_list_already_full(si_client):
    """Reproduces the *exact* production state after the previous
    deploy: divine_man has all 41 rows (35 traits + note + header +
    4 reflections) BUT the note and header sit at the end (positions
    39 + 40) instead of between items 35 and 36. The catch-up
    branch can't fire (n_items == len(items)) so the realign must
    run from the n_items-already-full branch too — otherwise the
    bad order stays forever.
    """
    from sqlalchemy import insert, select, delete as _del
    from app.services._self_improvement_seed_data import (
        SELF_IMPROVEMENT_LISTS,
    )
    from app.services.self_improvement_service import (
        _parse_seed_item,
        SI_DESCRIPTION_NOTE,
        SI_DESCRIPTION_HEADER,
        ensure_lists_seeded,
    )

    client, factory = si_client
    divine_name = "شخصیت یک مرد الهی – مردِ خدا ..."
    seed_items = SELF_IMPROVEMENT_LISTS[divine_name]

    # Wipe the fixture-seeded rows and re-insert in WRONG order:
    # the 39 checklist rows first, then the note + header tacked
    # on at the end — mirroring what an old catch-up append would
    # have produced on production.
    async with factory() as db:
        lst = (await db.execute(
            select(TodoList).where(TodoList.name == divine_name)
        )).scalar_one()
        await db.execute(todo_list_items.delete().where(
            todo_list_items.c.todo_list_id == lst.id
        ))
        # Also clear orphaned TodoItems from this list.
        orphan_ids = (await db.execute(
            select(TodoItem.id)
            .join(todo_list_items,
                  todo_list_items.c.todo_item_id == TodoItem.id,
                  isouter=True)
            .where(todo_list_items.c.todo_item_id.is_(None))
        )).all()
        if orphan_ids:
            await db.execute(_del(TodoItem).where(
                TodoItem.id.in_([r[0] for r in orphan_ids])
            ))
        await db.commit()

        pos = 0
        # All checklist rows first (in their original seed order
        # but with note/header skipped).
        for raw in seed_items:
            content, kind = _parse_seed_item(raw)
            if kind is not None:
                continue
            it = TodoItem(content=content)
            db.add(it)
            await db.commit()
            await db.refresh(it)
            await db.execute(insert(todo_list_items).values(
                todo_list_id=lst.id, todo_item_id=it.id, position=pos,
            ))
            pos += 1
        # Then note + header tacked on at the end.
        for raw in seed_items:
            content, kind = _parse_seed_item(raw)
            if kind is None:
                continue
            it = TodoItem(content=content, description=kind)
            db.add(it)
            await db.commit()
            await db.refresh(it)
            await db.execute(insert(todo_list_items).values(
                todo_list_id=lst.id, todo_item_id=it.id, position=pos,
            ))
            pos += 1
        await db.commit()

    # Sanity: list is "full" (41/41) so the catch-up branch will
    # NOT enter. Realign must fire from the already-full branch.
    async with factory() as db:
        await ensure_lists_seeded(db)

    async with factory() as db:
        lst = (await db.execute(
            select(TodoList).where(TodoList.name == divine_name)
        )).scalar_one()
        rows = (await db.execute(
            select(TodoItem.content, TodoItem.description, todo_list_items.c.position)
            .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
            .where(todo_list_items.c.todo_list_id == lst.id)
            .order_by(todo_list_items.c.position)
        )).all()
    assert len(rows) == 41
    assert rows[34][0].startswith("خارج از چشم بقیه")  # item 35
    assert rows[35][1] == SI_DESCRIPTION_NOTE  # note
    assert rows[36][1] == SI_DESCRIPTION_HEADER  # header
    assert rows[37][0].startswith("وارد جزئیات بیخود")  # item 36
    assert rows[40][0].startswith("شب ها در دل شب")  # item 39


@pytest.mark.asyncio
async def test_catch_up_realigns_note_header_to_canonical_position(si_client):
    """Reproduces the production state the user flagged: divine_man had
    all 39 checklist rows already (from the previous cut), but the
    inline note + header rows that the latest seed adds between
    items 35 and 36 don't exist yet. A naive catch-up that just
    appends at the end of the list would dump the prose to position
    39/40 — visually AFTER item 39 instead of between 35 and 36.
    The realign pass must restore the canonical seed order."""
    from sqlalchemy import insert, select
    from app.services._self_improvement_seed_data import (
        SELF_IMPROVEMENT_LISTS,
    )
    from app.services.self_improvement_service import (
        _parse_seed_item,
        ensure_lists_seeded,
    )

    client, factory = si_client
    divine_name = "شخصیت یک مرد الهی – مردِ خدا ..."
    seed_items = SELF_IMPROVEMENT_LISTS[divine_name]

    # Build a "no-prose" version of the list: 39 checklist rows in
    # their relative order, no note + no header. This mirrors what
    # an old-cut production DB looks like.
    async with factory() as db:
        lst = (await db.execute(
            select(TodoList).where(TodoList.name == divine_name)
        )).scalar_one()
        await db.execute(todo_list_items.delete().where(
            todo_list_items.c.todo_list_id == lst.id
        ))
        # Also wipe the orphaned TodoItem rows from the fixture seed.
        from sqlalchemy import delete as _del
        old_ids = (await db.execute(
            select(TodoItem.id)
            .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id, isouter=True)
            .where(todo_list_items.c.todo_item_id.is_(None))
        )).all()
        if old_ids:
            await db.execute(_del(TodoItem).where(TodoItem.id.in_([r[0] for r in old_ids])))
        await db.commit()
        # Insert only the 39 checklist rows, contiguous positions 0-38.
        pos = 0
        for raw in seed_items:
            content, kind = _parse_seed_item(raw)
            if kind is not None:
                continue  # skip note/header
            it = TodoItem(content=content)
            db.add(it)
            await db.commit()
            await db.refresh(it)
            await db.execute(insert(todo_list_items).values(
                todo_list_id=lst.id, todo_item_id=it.id, position=pos,
            ))
            pos += 1
        await db.commit()

    # Run the seeder — catch-up should add the note + header AND
    # realign so the canonical seed order is restored.
    async with factory() as db:
        await ensure_lists_seeded(db)

    # Final inspection: items ordered by position. Position 35 must
    # be the note, position 36 must be the header, position 37 the
    # first "after-header" checklist row.
    async with factory() as db:
        lst = (await db.execute(
            select(TodoList).where(TodoList.name == divine_name)
        )).scalar_one()
        rows = (await db.execute(
            select(TodoItem.content, TodoItem.description, todo_list_items.c.position)
            .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
            .where(todo_list_items.c.todo_list_id == lst.id)
            .order_by(todo_list_items.c.position)
        )).all()
    assert len(rows) == 41  # 35 + 1 note + 1 header + 4
    # Spot-check critical positions.
    assert rows[34][0].startswith("خارج از چشم بقیه")  # item 35
    assert rows[35][1] == "__SI_NOTE__"  # paragraph
    assert rows[35][0].startswith("همه این موارد")
    assert rows[36][1] == "__SI_HEADER__"  # header
    assert rows[36][0] == "مرد خدا اینجوریه که:"
    assert rows[37][0].startswith("وارد جزئیات بیخود")  # item 36 (user's #)
    assert rows[40][0].startswith("شب ها در دل شب")  # item 39 (user's #)


@pytest.mark.asyncio
async def test_divine_man_carries_note_and_header_between_items_35_and_36(si_client):
    """User's restructure: between items 35 and 36 of the شخصیت یک مرد
    الهی list, a paragraph (kind=note) and a section header
    (kind=header) sit between the original 35 character traits and
    the final 4 reflections. The frontend renders these specially
    (no checkbox), and they don't count toward the list's tickable
    `total`. They DO ride in the items payload so the prose lives
    inline with the surrounding checklist."""
    client, _factory = si_client
    body = client.get("/api/self-improvement/overview").json()
    divine = [s for s in body["sections"] if s["category"] == "divine_man"][0]
    kinds = [it["kind"] for it in divine["items"]]
    assert kinds.count("note") == 1
    assert kinds.count("header") == 1
    # Note + header sit AFTER 35 checklist rows and BEFORE the last 4.
    checklist_before = sum(
        1 for k in kinds[:kinds.index("note")] if k == "checklist"
    )
    assert checklist_before == 35
    # Tickable total excludes the two prose rows.
    assert divine["total"] == 39
    # But the items payload includes them (35 + 2 + 4 = 41).
    assert len(divine["items"]) == 41
    # Verify the actual content sentinel-free.
    note = next(it for it in divine["items"] if it["kind"] == "note")
    assert note["content"].startswith("همه این موارد")
    assert "__SI_" not in note["content"]
    header = next(it for it in divine["items"] if it["kind"] == "header")
    assert header["content"] == "مرد خدا اینجوریه که:"


@pytest.mark.asyncio
async def test_old_list_names_are_renamed_to_form_titles(si_client):
    """The user asked for list names to match the form titles exactly
    (e.g. "خودسازی - عشق به خدا" → "خودسازی - کارهایی که منو عاشق خدا
    میکنه"). The seeder's rename step must promote any old-name list
    to the new name while preserving its items."""
    from sqlalchemy import insert, select
    from app.services.self_improvement_service import (
        LIST_NAME_RENAMES,
        ensure_lists_seeded,
    )

    client, factory = si_client
    # Seed already ran in the fixture. Recreate the OLD-named list
    # (the form the user landed on after the previous deploy) so we
    # can prove the rename step finds and renames it.
    async with factory() as db:
        # Pick one rename: love_god list.
        old_name = "خودسازی - عشق به خدا"
        new_name = LIST_NAME_RENAMES[old_name]
        # The seeder already created the NEW name. Drop the NEW list
        # association rows so we can simulate "only old-name list
        # exists in production".
        new = (await db.execute(
            select(TodoList).where(TodoList.name == new_name)
        )).scalar_one()
        # Rename it backward to simulate the legacy state.
        new.name = old_name
        await db.commit()

    # Run the seeder — rename step must restore the new name.
    async with factory() as db:
        await ensure_lists_seeded(db)

    async with factory() as db:
        all_names = {r[0] for r in (await db.execute(select(TodoList.name))).all()}
    assert new_name in all_names
    assert old_name not in all_names


@pytest.mark.asyncio
async def test_lists_have_long_form_descriptions(si_client):
    """Three habit lists + muhasebe master carry the user's framing text.

    Description backfill is part of the seeding contract — the user
    explicitly asked for the per-list philosophy text to come along
    for the ride so the /lists view surfaces it.
    """
    client, factory = si_client
    client.get("/api/self-improvement/overview")
    from sqlalchemy import select
    async with factory() as db:
        rows = (await db.execute(select(TodoList.name, TodoList.description))).all()
    desc_by_name = {n: d for n, d in rows}
    # muhasebe + willpower + fears + divine_man have multi-hundred-char
    # framings; love_god is intentionally short (no form-level desc).
    assert len(desc_by_name["خودسازی - محاسبه میان و پایان هفته"] or "") > 500
    assert len(desc_by_name["کارهایی که اراده من رو تقویت یا ضعیف میکنه"] or "") > 500
    assert len(desc_by_name["لیست ترس هایی که دارم و یا کارهایی که منو شجاع میکنه"] or "") > 1500
    assert len(desc_by_name["شخصیت یک مرد الهی – مردِ خدا ..."] or "") > 500


@pytest.mark.asyncio
async def test_placeholder_muhasebe_items_are_replaced(si_client):
    """If an older deploy seeded the muhasebe list with the auto-generated
    placeholders, a subsequent overview read replaces them with the
    real PDF content. Idempotent — second read is a no-op."""
    from sqlalchemy import insert, select
    from app.services._self_improvement_seed_data import MUHASEBE_LIST_NAME
    from app.services.self_improvement_service import ensure_lists_seeded

    client, factory = si_client
    # Wipe the seeded muhasebe items and insert the OLD placeholder
    # set, mimicking a production DB that landed before the OCR fix.
    async with factory() as db:
        ml = (await db.execute(select(TodoList).where(TodoList.name == MUHASEBE_LIST_NAME))).scalar_one()
        await db.execute(todo_list_items.delete().where(todo_list_items.c.todo_list_id == ml.id))
        await db.commit()
        old_items = [
            "این هفته چند مورد از لیست تقویت اراده را رعایت کردم؟",
            "stale placeholder #2",
        ]
        for pos, content in enumerate(old_items):
            it = TodoItem(content=content)
            db.add(it)
            await db.commit()
            await db.refresh(it)
            await db.execute(insert(todo_list_items).values(
                todo_list_id=ml.id, todo_item_id=it.id, position=pos))
        await db.commit()

    # Now hit the overview endpoint — replacement happens inside.
    r = client.get("/api/self-improvement/overview")
    body = r.json()
    muhasebe = [s for s in body["sections"] if s["category"] == "muhasebe"][0]
    assert muhasebe["total"] == 17
    assert muhasebe["items"][0]["content"].startswith("مشارطه")


@pytest.mark.asyncio
async def test_stale_muhasebe_rows_are_removed_by_seeder(si_client):
    """Three families of stale rows accumulated in the muhasebe list
    across earlier seed revisions:
      * four "ثبت روزانه: …" meta-instructions (a9b81c1) — moved
        into MUHASEBE_DESCRIPTION.
      * seven "مراقبه: …" pre-action questions + three "نکته: …"
        wisdom points + one "ثبت خواب‌ها …" row (d5951e9) — promoted
        to dedicated lists.
    The runtime seeder must strip them all from any production list
    that still carries them, while leaving user-added rows alone.
    """
    from sqlalchemy import insert, select
    from app.services._self_improvement_seed_data import MUHASEBE_LIST_NAME
    from app.services.self_improvement_service import (
        _OLD_MUHASEBE_DAILY_LOG_ITEMS,
        _OLD_MUHASEBE_PREFIX_CLEANUP,
        ensure_lists_seeded,
    )

    client, factory = si_client
    # Inject every flavour of stale row + one user-added row that
    # must survive the cleanup.
    stale_rows = list(_OLD_MUHASEBE_DAILY_LOG_ITEMS) + [
        "مراقبه: چه خدایی، چه کاری کنی؟",
        "مراقبه: قصدت چیست؟ آیا مناسب اوست؟",
        "نکته: همیشه سکوت کن، گر سخن گفتن از لازم احوال باشد",
    ]
    user_added = "آیتم دلخواه کاربر — نباید حذف شود"

    async with factory() as db:
        ml = (await db.execute(
            select(TodoList).where(TodoList.name == MUHASEBE_LIST_NAME)
        )).scalar_one()
        next_pos = (await db.execute(
            select(todo_list_items.c.position).where(
                todo_list_items.c.todo_list_id == ml.id
            )
        )).all()
        start = (max((p for (p,) in next_pos), default=-1)) + 1
        for offset, content in enumerate(stale_rows + [user_added]):
            it = TodoItem(content=content)
            db.add(it)
            await db.commit()
            await db.refresh(it)
            await db.execute(insert(todo_list_items).values(
                todo_list_id=ml.id, todo_item_id=it.id, position=start + offset,
            ))
        await db.commit()

    async with factory() as db:
        await ensure_lists_seeded(db)

    async with factory() as db:
        ml = (await db.execute(select(TodoList).where(TodoList.name == MUHASEBE_LIST_NAME))).scalar_one()
        rows = (await db.execute(
            select(TodoItem.content)
            .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
            .where(todo_list_items.c.todo_list_id == ml.id)
        )).all()
    contents = {r[0] for r in rows}
    # No exact-match stale row, no prefix-match stale row.
    assert _OLD_MUHASEBE_DAILY_LOG_ITEMS.isdisjoint(contents)
    assert not any(
        c.startswith(p) for c in contents for p in _OLD_MUHASEBE_PREFIX_CLEANUP
    )
    # User row survives.
    assert user_added in contents


@pytest.mark.asyncio
async def test_partially_seeded_list_is_topped_up(si_client):
    """Reproduces the production incident: VARCHAR(1000) on Postgres
    rejected long love_god items, leaving the list with 2/12 rows
    committed. After the column is widened (migration 0010) the
    runtime helper must recognise the partial seed and append the
    missing items without duplicating the survivors.
    """
    from sqlalchemy import select
    from app.services._self_improvement_seed_data import SELF_IMPROVEMENT_LISTS
    from app.services.self_improvement_service import ensure_lists_seeded

    client, factory = si_client
    love_god_name = "کارهایی که منو عاشق خدا میکنه"
    expected_items = SELF_IMPROVEMENT_LISTS[love_god_name]
    assert len(expected_items) == 12

    # Delete 10 of the 12 items to simulate partial seeding.
    async with factory() as db:
        lst = (await db.execute(
            select(TodoList).where(TodoList.name == love_god_name)
        )).scalar_one()
        survivors = (await db.execute(
            select(TodoItem.id, TodoItem.content, todo_list_items.c.position)
            .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
            .where(todo_list_items.c.todo_list_id == lst.id)
            .order_by(todo_list_items.c.position)
        )).all()
        # Keep first 2 short items (mimic VARCHAR(1000) survival pattern).
        keep = sorted(survivors, key=lambda r: len(r[1]))[:2]
        keep_ids = {r[0] for r in keep}
        drop_ids = [r[0] for r in survivors if r[0] not in keep_ids]
        from sqlalchemy import delete as _d
        await db.execute(todo_list_items.delete().where(
            todo_list_items.c.todo_item_id.in_(drop_ids)
        ))
        await db.execute(_d(TodoItem).where(TodoItem.id.in_(drop_ids)))
        await db.commit()

    # Sanity: list now has 2 items.
    async with factory() as db:
        lst = (await db.execute(select(TodoList).where(TodoList.name == love_god_name))).scalar_one()
        n_before = (await db.execute(
            select(todo_list_items).where(todo_list_items.c.todo_list_id == lst.id)
        )).all()
        assert len(n_before) == 2

    # Trigger the catch-up via the runtime helper.
    async with factory() as db:
        added = await ensure_lists_seeded(db)
        assert added == 10  # exactly the 10 missing love_god items

    # Final state: 12 items, no duplicates.
    async with factory() as db:
        lst = (await db.execute(select(TodoList).where(TodoList.name == love_god_name))).scalar_one()
        rows = (await db.execute(
            select(TodoItem.content)
            .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
            .where(todo_list_items.c.todo_list_id == lst.id)
        )).all()
    contents = [r[0] for r in rows]
    assert len(contents) == 12
    assert set(contents) == set(expected_items)


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
    assert body["user_id"] == _STUB_USER_ID
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
    assert n1 == 143  # 17 + 28 + 12 + 40 + 39 + 7 + 0 + 0 across eight lists
    n2 = await self_improvement_service.refresh_daily_pending_rows(
        db_session, user_id=99,
    )
    assert n2 == 0


# --- Auth coverage ---------------------------------------------------------


def test_overview_works_anonymously_during_login_bypass(api_client):
    """While the frontend's login bypass is enabled, anonymous reads
    of /overview must NOT 403/401 — they fall back to the default
    anon user_id scope. This matches AuthContext.jsx's behaviour and
    keeps the dashboard usable until real auth is reinstated.

    The first call lazily seeds the four خودسازی sub-lists, so the
    response carries the canonical 90-item shape.
    """
    r = api_client.get("/api/self-improvement/overview")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["items_total"] == 143
    cats = {s["category"] for s in body["sections"]}
    assert {"muhasebe", "willpower", "love_god", "fears", "divine_man"} <= cats


def test_overview_with_garbage_token_falls_back_to_anon(api_client):
    """Invalid bearer must NOT 401 — same fallback as the no-header case."""
    r = api_client.get(
        "/api/self-improvement/overview",
        headers={"Authorization": "Bearer not.a.real.jwt"},
    )
    assert r.status_code == 200, r.text


# --- Owner-data guards (2026-07-20) ----------------------------------------


def _divine_rows(seed_items, *, misorder=False, completed_idx=None,
                 edited_idx=None, drop_last=False):
    """Build (id, content, description, position, is_completed) tuples
    mirroring the production divine_man list state."""
    from app.services.self_improvement_service import _parse_seed_item

    rows = []
    for i, raw in enumerate(seed_items):
        content, kind = _parse_seed_item(raw)
        rows.append([i + 1, content, kind, i, False])
    if misorder:
        # Note + header (canonical positions 35/36) tacked on at the
        # end — the exact bug state the hard reset was built for.
        prose = [r for r in rows if r[2] is not None]
        rows = [r for r in rows if r[2] is None] + prose
        for pos, r in enumerate(rows):
            r[3] = pos
    if completed_idx is not None:
        rows[completed_idx][4] = True
    if edited_idx is not None:
        rows[edited_idx][1] = "متن ویرایش‌شدهٔ خود مالک"
    if drop_last:
        rows = rows[:-1]
    return [tuple(r) for r in rows]


def test_divine_man_hard_reset_verdict_guards_owner_data():
    """The startup wipe may only fire for the pure-seed misorder bug —
    any owner add/edit/tick (سال‌ها محتوای جمع‌شده) must disable it."""
    from app.services.self_improvement_service import (
        divine_man_hard_reset_verdict,
    )

    divine_name = "شخصیت یک مرد الهی – مردِ خدا ..."
    seed = SELF_IMPROVEMENT_LISTS[divine_name]

    # Canonical order → nothing to do.
    ok, reason = divine_man_hard_reset_verdict(_divine_rows(seed), seed)
    assert (ok, reason) == (False, "order-ok")

    # Full count, pure seed, misordered → the one state that resets.
    ok, reason = divine_man_hard_reset_verdict(
        _divine_rows(seed, misorder=True), seed
    )
    assert (ok, reason) == (True, "misordered-pure-seed")

    # Owner deleted a row → count mismatch → never reset.
    ok, reason = divine_man_hard_reset_verdict(
        _divine_rows(seed, misorder=True, drop_last=True), seed
    )
    assert (ok, reason) == (False, "count-mismatch")

    # Owner ticked an item → reset would erase the tick → skip.
    ok, _ = divine_man_hard_reset_verdict(
        _divine_rows(seed, misorder=True, completed_idx=0), seed
    )
    assert ok is False

    # Owner edited an item's text → reset would revert it → skip.
    ok, _ = divine_man_hard_reset_verdict(
        _divine_rows(seed, misorder=True, edited_idx=0), seed
    )
    assert ok is False


@pytest.mark.asyncio
async def test_muhasebe_prefix_rows_survive_when_migration_done(si_client):
    """Once the old exact-match rows are gone (migration finished), a
    «نکته: …» / «مراقبه: …» row is the OWNER'S own note and must never
    be deleted by the seeder — prefix cleanup only applies to the
    pre-migration state that still carries exact-match stale rows."""
    from sqlalchemy import insert, select

    from app.services.self_improvement_service import ensure_lists_seeded

    client, factory = si_client
    owner_note = "نکته: یادداشت شخصی مالک — نباید هرگز حذف شود"
    owner_moraghebe = "مراقبه: تمرین جدید خودم"

    async with factory() as db:
        ml = (await db.execute(
            select(TodoList).where(TodoList.name == MUHASEBE_LIST_NAME)
        )).scalar_one()
        taken = (await db.execute(
            select(todo_list_items.c.position).where(
                todo_list_items.c.todo_list_id == ml.id
            )
        )).all()
        start = (max((p for (p,) in taken), default=-1)) + 1
        for offset, content in enumerate([owner_note, owner_moraghebe]):
            it = TodoItem(content=content)
            db.add(it)
            await db.commit()
            await db.refresh(it)
            await db.execute(insert(todo_list_items).values(
                todo_list_id=ml.id, todo_item_id=it.id,
                position=start + offset,
            ))
        await db.commit()

    async with factory() as db:
        await ensure_lists_seeded(db)

    async with factory() as db:
        ml = (await db.execute(
            select(TodoList).where(TodoList.name == MUHASEBE_LIST_NAME)
        )).scalar_one()
        rows = (await db.execute(
            select(TodoItem.content)
            .join(todo_list_items,
                  todo_list_items.c.todo_item_id == TodoItem.id)
            .where(todo_list_items.c.todo_list_id == ml.id)
        )).all()
    contents = {r[0] for r in rows}
    assert owner_note in contents
    assert owner_moraghebe in contents
