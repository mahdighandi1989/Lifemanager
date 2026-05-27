"""Service layer for the Self-Improvement (خودسازی) module.

The route layer is thin — it parses the request, calls one of the
coroutines here, and serialises the result. All business logic
(category lookups, daily refresh, overview aggregation, AI auto-tick
application, analytics rebuild) lives in this module so the Celery
tasks and tests can re-use it without round-tripping through HTTP.

Conventions match the rest of the codebase:
  * Async + AsyncSession throughout.
  * NoResultFound when a primary key lookup fails (the @handle_errors
    decorator on the routes turns it into a 404).
  * Idempotent writes where the operation is naturally so (the daily
    check-in upsert, the analytics row upsert) — repeating a call
    must not duplicate rows.
"""
from __future__ import annotations

import logging
from datetime import date, datetime, timedelta, timezone
from typing import Iterable, List, Optional, Sequence

from sqlalchemy import and_, delete, func, insert, or_, select, update
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.self_improvement import (
    CHECKIN_STATUS_AUTO_DONE,
    CHECKIN_STATUS_DONE,
    CHECKIN_STATUS_PENDING,
    SelfImprovementCheckIn,
    UserProfileAnalytics,
)
from app.models.todo_item import TodoItem
from app.models.todo_list import TodoList, todo_list_items
from app.services._self_improvement_seed_data import (
    CATEGORY_BY_LIST_NAME,
    CATEGORY_LABELS_FA,
    LIST_DESCRIPTIONS,
    MUHASEBE_DESCRIPTION,
    MUHASEBE_ITEMS,
    MUHASEBE_LIST_NAME,
    SELF_IMPROVEMENT_LISTS,
)

logger = logging.getLogger(__name__)


# The category code for the master "محاسبه" list — kept separate
# from the three habit categories because it's a weekly review, not
# a daily habit tracker.
MUHASEBE_CATEGORY = "muhasebe"
MUHASEBE_LABEL_FA = "محاسبه میان و پایان هفته"


# First item of the placeholder set we seeded in commit 70f7e78 before
# the PDF OCR succeeded. Used as a sentinel by ensure_lists_seeded to
# detect "the user hasn't touched the auto-generated placeholders, it's
# safe to replace them with the real PDF content".
_PLACEHOLDER_MUHASEBE_FIRST_ITEM = (
    "این هفته چند مورد از لیست تقویت اراده را رعایت کردم؟"
)

# Rows that landed in the muhasebe list under earlier revisions but
# the user later asked to move elsewhere:
#
#   * "ثبت روزانه: …" (a9b81c1) — meta-instructions, demoted into
#     MUHASEBE_DESCRIPTION.
#   * "مراقبه: …" + "نکته: …" + "ثبت خواب‌ها …" (d5951e9) — promoted
#     into dedicated lists (MURAQEBE_LIST_NAME / TAZAKKOR_LIST_NAME /
#     DREAMS_LIST_NAME) so they're structurally separate from the
#     weekly review and read with the right semantics.
#
# Detection is exact content match — the cleanup is idempotent (a
# no-op once gone) and surgical (only the listed rows are touched,
# so anything the user added themselves stays put). Prefix-based
# matches catch the مراقبه/نکته families regardless of which exact
# wording I tried last time.
_OLD_MUHASEBE_DAILY_LOG_ITEMS = {
    "ثبت روزانه: ترس ها و شجاعت های امروز (جهت محاسبه در پایان هفته)",
    "ثبت روزانه: قوت و ضعف های نیروی اراده ام در امروز (جهت محاسبه پایان هفته)",
    "ثبت روزانه: کارهایی که امروز انجام دادی و احساس میکنی یک مرد الهی و یک مرد ایده آل انجام میده (جهت محاسبه در پایان هفته)",
    "ثبت روزانه: کارهایی که خلاف کاراکترهای یک مرد الهی و ایده آل است",
    "ثبت خواب‌ها و رویاها (شب قبل و پیغام احتمالی آنها)",
}

# Prefix-based muhasebe cleanup — any row whose content starts with
# one of these is treated as relocated content from the prior cut.
_OLD_MUHASEBE_PREFIX_CLEANUP = (
    "مراقبه:",
    "نکته:",
)


# ── Special-item conventions ─────────────────────────────────────
# Seed strings prefixed with one of these markers are inserted as
# TodoItems with the corresponding TodoItem.description sentinel
# (and the prefix stripped from .content). The frontend uses the
# sentinel to render the row as a paragraph note or section header
# instead of a tickable checkbox. Avoids a schema change while
# letting us splice prose between checklist items in the same list.
_KIND_PREFIX_NOTE = "__SI_NOTE__|"
_KIND_PREFIX_HEADER = "__SI_HEADER__|"
SI_DESCRIPTION_NOTE = "__SI_NOTE__"
SI_DESCRIPTION_HEADER = "__SI_HEADER__"


def _parse_seed_item(raw: str) -> tuple[str, Optional[str]]:
    """Split a seed string into (content, description-sentinel).

    Returns (raw, None) for normal items. For "__SI_NOTE__|<text>"
    or "__SI_HEADER__|<text>" returns (<text>, sentinel) so the
    caller can persist the kind in TodoItem.description while
    keeping TodoItem.content user-readable.
    """
    if raw.startswith(_KIND_PREFIX_NOTE):
        return raw[len(_KIND_PREFIX_NOTE):], SI_DESCRIPTION_NOTE
    if raw.startswith(_KIND_PREFIX_HEADER):
        return raw[len(_KIND_PREFIX_HEADER):], SI_DESCRIPTION_HEADER
    return raw, None


# Names the lists carried in earlier deploys. The startup rename
# step (see app.main.startup_event) UPDATEs todo_lists.name from
# the old form to the new form so the seeder lookup matches and the
# user's existing items/check-ins stay attached.
LIST_NAME_RENAMES: dict[str, str] = {
    # Original short names from migration 0008.
    "خودسازی - عشق به خدا": "کارهایی که منو عاشق خدا میکنه",
    "خودسازی - ترس‌ها و شجاعت": "لیست ترس هایی که دارم و یا کارهایی که منو شجاع میکنه",
    "خودسازی - تقویت اراده": "کارهایی که اراده من رو تقویت یا ضعیف میکنه",
    "خودسازی - شخصیت مرد الهی": "شخصیت یک مرد الهی – مردِ خدا ...",
    # Intermediate names from commit e8e077c (form-title with the
    # "خودسازی - " category prefix). User clarified: titles must
    # match the form image VERBATIM with no prefix. Map those to
    # the prefix-free finals so production stays in sync.
    "خودسازی - کارهایی که منو عاشق خدا میکنه": "کارهایی که منو عاشق خدا میکنه",
    "خودسازی - لیست ترس هایی که دارم و یا کارهایی که منو شجاع میکنه": "لیست ترس هایی که دارم و یا کارهایی که منو شجاع میکنه",
    "خودسازی - کارهایی که اراده من رو تقویت یا ضعیف میکنه": "کارهایی که اراده من رو تقویت یا ضعیف میکنه",
    "خودسازی - شخصیت یک مرد الهی – مردِ خدا ...": "شخصیت یک مرد الهی – مردِ خدا ...",
}


# --- Helpers ---------------------------------------------------------------

def _today_utc() -> date:
    """Return today's date in UTC.

    The check-in date is stored as a plain Date so we anchor to UTC
    here — per-user timezone support can be added later by reading
    the user's profile and shifting before normalising.
    """
    return datetime.now(timezone.utc).date()


def _category_for_list(list_name: str) -> str:
    """Map a TodoList name to its self-improvement category code."""
    if list_name == MUHASEBE_LIST_NAME:
        return MUHASEBE_CATEGORY
    return CATEGORY_BY_LIST_NAME.get(list_name, "other")


def _category_label_fa(category: str) -> str:
    if category == MUHASEBE_CATEGORY:
        return MUHASEBE_LABEL_FA
    return CATEGORY_LABELS_FA.get(category, category)


async def _self_improvement_lists(db: AsyncSession) -> Sequence[TodoList]:
    """Fetch the four خودسازی sub-lists, ordered with muhasebe first.

    Returns whatever the DB has — missing lists are silently omitted
    so a partially-migrated env still gets a usable response.
    """
    wanted = [MUHASEBE_LIST_NAME, *SELF_IMPROVEMENT_LISTS.keys()]
    stmt = (
        select(TodoList)
        .where(TodoList.name.in_(wanted))
        .where(TodoList.is_archived.is_(False))
    )
    result = await db.execute(stmt)
    lists = list(result.scalars().all())
    # Preserve the wanted order regardless of DB insertion order.
    order = {name: i for i, name in enumerate(wanted)}
    lists.sort(key=lambda lst: order.get(lst.name, len(order)))
    return lists


async def _realign_positions(
    db: AsyncSession, list_id: int, seed_items: Sequence[str]
) -> int:
    """Rewrite todo_list_items.position so the rows match seed order.

    Builds a canonical content→index map from the seed strings (with
    NOTE/HEADER prefixes stripped). For each existing row in the
    list, looks up its position by content; user-added rows that
    aren't in the seed are parked after the canonical block in their
    current relative order.

    The two-step write (move everything into a high temporary band
    first, then back down to its final value) sidesteps the
    UNIQUE(todo_list_id, position) constraint that would otherwise
    fire mid-update when two rows transiently share a position.

    Returns the number of rows whose position actually changed —
    callers log this so we can confirm in production that the
    realign fired and what it touched.
    """
    canonical_pos: dict[str, int] = {}
    for idx, raw in enumerate(seed_items):
        content, _kind = _parse_seed_item(raw)
        canonical_pos[content] = idx

    rows = (
        await db.execute(
            select(todo_list_items.c.todo_item_id, TodoItem.content,
                   todo_list_items.c.position)
            .join(TodoItem, todo_list_items.c.todo_item_id == TodoItem.id)
            .where(todo_list_items.c.todo_list_id == list_id)
            .order_by(todo_list_items.c.position)
        )
    ).all()
    if not rows:
        return 0

    desired: list[tuple[int, int, int]] = []  # (item_id, new_pos, old_pos)
    user_added: list[tuple[int, int]] = []  # (item_id, old_pos)
    for item_id, content, old_pos in rows:
        if content in canonical_pos:
            desired.append((item_id, canonical_pos[content], old_pos))
        else:
            user_added.append((item_id, old_pos))
    # Park user-added items right after the canonical tail in their
    # current relative order.
    tail_start = len(seed_items)
    for off, (item_id, old_pos) in enumerate(user_added):
        desired.append((item_id, tail_start + off, old_pos))

    changed = sum(1 for (_iid, new_pos, old_pos) in desired if new_pos != old_pos)
    if not changed:
        return 0

    # Phase 1: move every row into a high temporary band so the
    # final writes don't collide with each other.
    REALIGN_TMP_BASE = 100000
    for off, (item_id, _new_pos, _old_pos) in enumerate(desired):
        await db.execute(
            update(todo_list_items)
            .where(
                and_(
                    todo_list_items.c.todo_list_id == list_id,
                    todo_list_items.c.todo_item_id == item_id,
                )
            )
            .values(position=REALIGN_TMP_BASE + off)
        )
    await db.commit()

    # Phase 2: write the desired positions.
    for item_id, new_pos, _old_pos in desired:
        await db.execute(
            update(todo_list_items)
            .where(
                and_(
                    todo_list_items.c.todo_list_id == list_id,
                    todo_list_items.c.todo_item_id == item_id,
                )
            )
            .values(position=new_pos)
        )
    await db.commit()

    logger.info(
        "self-improvement realign: list_id=%s, %d/%d rows repositioned",
        list_id, changed, len(desired),
    )
    return changed


async def ensure_lists_seeded(db: AsyncSession) -> int:
    """Lazily seed the five خودسازی sub-lists + their items.

    Called on the first read of each route so environments that
    skip alembic (Render's free tier just runs Base.metadata.create_all
    on startup) still end up with the canonical content. Idempotent
    on three axes so it's safe to call on every request:

      * a list whose name already exists is reused, not duplicated.
      * a list that already has any items keeps them — we don't
        overwrite user edits made through the regular TodoItem UI.
      * descriptions are backfilled only when missing/empty. The
        user can replace a description in-app at any time and the
        next seeder run won't clobber their text.

    Returns the count of newly inserted items so callers can log
    "seeded N items" the first time it runs.
    """
    # ── List rename step ───────────────────────────────────────────
    # Earlier deploys carried shorter, paraphrased list names
    # ("خودسازی - عشق به خدا" etc). The user asked for the names to
    # match the form titles verbatim. Apply the rename here so the
    # lookup below finds the existing list and reattaches the user's
    # items / check-ins instead of creating a duplicate.
    for old_name, new_name in LIST_NAME_RENAMES.items():
        old = (await db.execute(
            select(TodoList).where(TodoList.name == old_name)
        )).scalar_one_or_none()
        if old is None:
            continue
        new = (await db.execute(
            select(TodoList).where(TodoList.name == new_name)
        )).scalar_one_or_none()
        if new is None:
            # No conflict — just rename.
            old.name = new_name
            await db.commit()
            logger.info("self-improvement: renamed list '%s' → '%s'", old_name, new_name)
        else:
            # Conflict (new name already exists, e.g. from a fresh
            # deploy that ran the seeder before this rename block).
            # Move items from old to new, then drop the empty old.
            await db.execute(
                update(todo_list_items)
                .where(todo_list_items.c.todo_list_id == old.id)
                .values(todo_list_id=new.id)
            )
            await db.execute(delete(TodoList).where(TodoList.id == old.id))
            await db.commit()
            logger.info(
                "self-improvement: merged '%s' into existing '%s'",
                old_name, new_name,
            )

    # (list_name, description, items)
    wanted: list[tuple[str, str, list[str]]] = [
        (MUHASEBE_LIST_NAME, MUHASEBE_DESCRIPTION, MUHASEBE_ITEMS),
    ]
    for list_name, items in SELF_IMPROVEMENT_LISTS.items():
        wanted.append((
            list_name,
            LIST_DESCRIPTIONS.get(list_name, ""),
            items,
        ))

    total_new_items = 0
    for list_name, description, items in wanted:
        existing = (
            await db.execute(select(TodoList).where(TodoList.name == list_name))
        ).scalar_one_or_none()
        if existing is None:
            lst = TodoList(
                name=list_name,
                description=description or None,
            )
            db.add(lst)
            await db.commit()
            await db.refresh(lst)
            existing = lst
        else:
            # Keep the canonical description in sync with the seed.
            # Earlier revisions only backfilled when empty, but the
            # user's latest pass rewrote every description verbatim
            # and explicitly asked for the new wording to land — so
            # we overwrite when the stored text differs from the
            # canonical. (The user edits descriptions through a
            # different code path that bypasses ensure_lists_seeded,
            # so this doesn't fight their changes.)
            if description and (existing.description or "") != description:
                existing.description = description
                await db.commit()
                await db.refresh(existing)

        # If the list already has items, leave them alone UNLESS this
        # is the muhasebe list still holding the auto-generated
        # placeholder set — those landed before the PDF OCR succeeded,
        # so a fresh deploy with the real PDF content needs to replace
        # them once. Detection is exact-match on the first item so the
        # moment the user edits anything in-app, this branch becomes a
        # no-op forever.
        existing_items = (
            await db.execute(
                select(TodoItem.id, TodoItem.content, todo_list_items.c.position)
                .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
                .where(todo_list_items.c.todo_list_id == existing.id)
                .order_by(todo_list_items.c.position)
            )
        ).all()
        n_items = len(existing_items)

        # Drop stale rows from the muhasebe list — exact-match against
        # _OLD_MUHASEBE_DAILY_LOG_ITEMS (meta-instructions + dream
        # tracker), plus prefix-match for "مراقبه: …" / "نکته: …" rows
        # that were promoted to their own lists. Idempotent and
        # surgical so anything the user added themselves stays.
        if list_name == MUHASEBE_LIST_NAME and n_items > 0:
            stale = [
                (iid, _p) for (iid, c, _p) in existing_items
                if c in _OLD_MUHASEBE_DAILY_LOG_ITEMS
                or any(c.startswith(p) for p in _OLD_MUHASEBE_PREFIX_CLEANUP)
            ]
            if stale:
                stale_ids = [iid for iid, _p in stale]
                await db.execute(
                    todo_list_items.delete().where(
                        and_(
                            todo_list_items.c.todo_list_id == existing.id,
                            todo_list_items.c.todo_item_id.in_(stale_ids),
                        )
                    )
                )
                await db.execute(
                    delete(TodoItem).where(TodoItem.id.in_(stale_ids))
                )
                await db.commit()
                logger.info(
                    "self-improvement: removed %d stale 'ثبت روزانه' rows from muhasebe",
                    len(stale),
                )
                # Refresh the working copy so the catch-up branch
                # below sees the new (smaller) row count.
                existing_items = [
                    (iid, c, p) for (iid, c, p) in existing_items
                    if iid not in set(stale_ids)
                ]
                n_items = len(existing_items)

        is_placeholder_muhasebe = (
            list_name == MUHASEBE_LIST_NAME
            and n_items > 0
            and existing_items[0][1] == _PLACEHOLDER_MUHASEBE_FIRST_ITEM
        )
        if is_placeholder_muhasebe:
            # Hard-replace: delete association rows, then orphaned
            # items. We deliberately don't touch any SelfImprovementCheckIn
            # rows that reference the placeholder items — those just
            # become history pointing at deleted item ids, which the
            # overview tolerates.
            placeholder_item_ids = [iid for (iid, _c, _p) in existing_items]
            await db.execute(
                todo_list_items.delete().where(
                    todo_list_items.c.todo_list_id == existing.id
                )
            )
            await db.execute(
                delete(TodoItem).where(TodoItem.id.in_(placeholder_item_ids))
            )
            await db.commit()
            n_items = 0

        # ── Catch-up branch ─────────────────────────────────────────
        # A list with FEWER items than the canonical seed is treated
        # as partially seeded — top it up with whatever's missing,
        # AND reorder so the canonical seed order is preserved. The
        # original "append at end" version was wrong for divine_man:
        # the inline note + header belong between checklist rows 35
        # and 36, but production already had items 1-39 contiguous,
        # so appending dumped the prose to the bottom. We now insert
        # at high positions to avoid the unique-position collision,
        # then do a final realign pass that sets each row's position
        # to its seed index (and parks any user-added rows after the
        # canonical block).
        if 0 < n_items < len(items):
            # Use a high temporary offset so newly inserted positions
            # never collide with the existing ones — the realign pass
            # below overrides them anyway.
            TMP_BASE = 10000
            existing_contents = {c for (_i, c, _p) in existing_items}
            for offset, raw in enumerate(items):
                content, kind = _parse_seed_item(raw)
                if content in existing_contents:
                    continue
                try:
                    item = TodoItem(content=content, description=kind)
                    db.add(item)
                    await db.commit()
                    await db.refresh(item)
                    await db.execute(
                        insert(todo_list_items).values(
                            todo_list_id=existing.id,
                            todo_item_id=item.id,
                            position=TMP_BASE + offset,
                        )
                    )
                    await db.commit()
                    total_new_items += 1
                except Exception as exc:
                    await db.rollback()
                    logger.warning(
                        "self-improvement catch-up: skip item len=%d in '%s': %s",
                        len(content), list_name, exc,
                    )

            # Realign every row's position to its seed index so the
            # canonical order is restored even if the previous deploy
            # left items at unexpected positions.
            await _realign_positions(db, existing.id, items)
            continue

        if n_items:
            # Already-populated list: nothing to insert, but we
            # still realign positions so any earlier deploy that
            # appended rows to the end (instead of dropping them
            # into their canonical seed slot — the divine_man note
            # + header case) gets healed on the next request. The
            # realign is content-keyed, so it's a no-op when the
            # order is already correct.
            if items:
                await _realign_positions(db, existing.id, items)
            continue
        for position, raw in enumerate(items):
            content, kind = _parse_seed_item(raw)
            try:
                item = TodoItem(content=content, description=kind)
                db.add(item)
                await db.commit()
                await db.refresh(item)
                await db.execute(
                    insert(todo_list_items).values(
                        todo_list_id=existing.id,
                        todo_item_id=item.id,
                        position=position,
                    )
                )
                await db.commit()
                total_new_items += 1
            except Exception as exc:
                await db.rollback()
                logger.warning(
                    "self-improvement seed: skip item len=%d in '%s': %s",
                    len(content), list_name, exc,
                )
    return total_new_items


async def _items_for_list(db: AsyncSession, list_id: int) -> List[tuple[TodoItem, int]]:
    """Return (item, position) tuples for one list, ordered by position."""
    stmt = (
        select(TodoItem, todo_list_items.c.position)
        .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
        .where(todo_list_items.c.todo_list_id == list_id)
        .order_by(todo_list_items.c.position, TodoItem.id)
    )
    result = await db.execute(stmt)
    return [(it, pos) for it, pos in result.all()]


# --- Check-in CRUD ---------------------------------------------------------

async def get_checkin(
    db: AsyncSession, *, user_id: int, item_id: int, on_date: date,
) -> Optional[SelfImprovementCheckIn]:
    """Look up one check-in row, or None if it doesn't exist yet."""
    stmt = select(SelfImprovementCheckIn).where(
        and_(
            SelfImprovementCheckIn.user_id == user_id,
            SelfImprovementCheckIn.item_id == item_id,
            SelfImprovementCheckIn.checkin_date == on_date,
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def upsert_checkin(
    db: AsyncSession,
    *,
    user_id: int,
    item_id: int,
    status: str,
    on_date: Optional[date] = None,
    note: Optional[str] = None,
    ai_reason: Optional[str] = None,
    ai_model: Optional[str] = None,
) -> SelfImprovementCheckIn:
    """Create or update the (user, item, date) check-in row.

    Idempotent: calling twice with the same args yields the same
    row (no duplicate). The repeat call updates status/note/ai
    fields in place — convenient for the user-clicks-then-AI-also
    -ticks race (last write wins).
    """
    if on_date is None:
        on_date = _today_utc()
    existing = await get_checkin(db, user_id=user_id, item_id=item_id, on_date=on_date)
    if existing is None:
        row = SelfImprovementCheckIn(
            user_id=user_id,
            item_id=item_id,
            checkin_date=on_date,
            status=status,
            note=note,
            ai_reason=ai_reason,
            ai_model=ai_model,
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row
    # Update in place. We only overwrite ai_reason/ai_model when the
    # caller actually supplies them so manual edits don't blank out
    # the AI's earlier justification.
    existing.status = status
    if note is not None:
        existing.note = note
    if ai_reason is not None:
        existing.ai_reason = ai_reason
    if ai_model is not None:
        existing.ai_model = ai_model
    await db.commit()
    await db.refresh(existing)
    return existing


async def bulk_upsert_checkins(
    db: AsyncSession,
    *,
    user_id: int,
    updates: Iterable[dict],
) -> List[SelfImprovementCheckIn]:
    """Apply many check-in updates in a single transaction.

    Each update is a dict with at least ``item_id`` and ``status``;
    optional ``checkin_date``, ``note``, ``ai_reason``, ``ai_model``.
    Returns the persisted rows in input order.
    """
    rows: list[SelfImprovementCheckIn] = []
    for upd in updates:
        row = await upsert_checkin(
            db,
            user_id=user_id,
            item_id=upd["item_id"],
            status=upd["status"],
            on_date=upd.get("checkin_date"),
            note=upd.get("note"),
            ai_reason=upd.get("ai_reason"),
            ai_model=upd.get("ai_model"),
        )
        rows.append(row)
    return rows


# --- Overview / dashboard --------------------------------------------------

async def build_overview(
    db: AsyncSession, *, user_id: int, on_date: Optional[date] = None,
) -> dict:
    """Return the dashboard payload: 4 sections + aggregate totals."""
    if on_date is None:
        on_date = _today_utc()

    lists = await _self_improvement_lists(db)
    sections: list[dict] = []
    total_items = 0
    total_done = 0

    for lst in lists:
        items_pos = await _items_for_list(db, lst.id)
        item_ids = [it.id for it, _pos in items_pos]
        checkins_by_item: dict[int, SelfImprovementCheckIn] = {}
        if item_ids:
            stmt = select(SelfImprovementCheckIn).where(
                and_(
                    SelfImprovementCheckIn.user_id == user_id,
                    SelfImprovementCheckIn.checkin_date == on_date,
                    SelfImprovementCheckIn.item_id.in_(item_ids),
                )
            )
            result = await db.execute(stmt)
            for row in result.scalars().all():
                checkins_by_item[row.item_id] = row

        items_payload: list[dict] = []
        done_in_section = 0
        # Counted toward "total" only for tickable rows. Notes /
        # headers ride in the payload (so the frontend can render
        # the inline prose) but they aren't habits to complete.
        tickable_in_section = 0
        for item, position in items_pos:
            # Map TodoItem.description sentinels onto a clean
            # `kind` enum the frontend can switch on. Avoids
            # leaking the internal "__SI_…__" convention to the UI
            # while still letting paragraph notes and section
            # headers ride along inside the items list.
            if item.description == SI_DESCRIPTION_NOTE:
                kind = "note"
                desc_payload = None
            elif item.description == SI_DESCRIPTION_HEADER:
                kind = "header"
                desc_payload = None
            else:
                kind = "checklist"
                desc_payload = item.description

            ci = checkins_by_item.get(item.id)
            status = ci.status if ci else CHECKIN_STATUS_PENDING
            is_auto = bool(
                ci
                and ci.status == CHECKIN_STATUS_AUTO_DONE
            )
            if kind == "checklist":
                tickable_in_section += 1
                if status in (CHECKIN_STATUS_DONE, CHECKIN_STATUS_AUTO_DONE):
                    done_in_section += 1
            items_payload.append({
                "item_id": item.id,
                "content": item.content,
                "description": desc_payload,
                "status": status,
                "is_auto": is_auto,
                "ai_reason": ci.ai_reason if ci else None,
                "note": ci.note if ci else None,
                "position": position,
                "kind": kind,
            })
        cat = _category_for_list(lst.name)
        sections.append({
            "category": cat,
            "label_fa": _category_label_fa(cat),
            "list_id": lst.id,
            "list_name": lst.name,
            # Surface the user's long-form framing so the dashboard
            # can render the original philosophical context as a
            # collapsible note above the items.
            "list_description": lst.description or None,
            "items": items_payload,
            "completed_today": done_in_section,
            # Tickable rows only — notes / headers ride in `items`
            # but aren't counted against progress.
            "total": tickable_in_section,
        })
        total_done += done_in_section
        total_items += tickable_in_section

    return {
        "as_of": on_date,
        "sections": sections,
        "completed_today_total": total_done,
        "items_total": total_items,
    }


# --- Daily refresh (Celery beat) ------------------------------------------

async def refresh_daily_pending_rows(db: AsyncSession, *, user_id: int,
                                     on_date: Optional[date] = None) -> int:
    """Pre-create ``pending`` check-in rows for today's habits.

    Called by the daily Celery task. Idempotent — the unique
    constraint plus the get-or-create path means re-running mid-day
    won't blow away user edits.

    Returns the number of *new* rows created.
    """
    if on_date is None:
        on_date = _today_utc()
    lists = await _self_improvement_lists(db)
    list_ids = [lst.id for lst in lists]
    if not list_ids:
        return 0
    # All TICKABLE items across the lists — note/header rows
    # (TodoItem.description ∈ {SI_DESCRIPTION_NOTE, …_HEADER}) are
    # display-only and don't need check-in rows.
    stmt = (
        select(TodoItem.id)
        .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
        .where(todo_list_items.c.todo_list_id.in_(list_ids))
        .where(
            or_(
                TodoItem.description.is_(None),
                and_(
                    TodoItem.description != SI_DESCRIPTION_NOTE,
                    TodoItem.description != SI_DESCRIPTION_HEADER,
                ),
            )
        )
        .distinct()
    )
    item_ids = [r for (r,) in (await db.execute(stmt)).all()]
    if not item_ids:
        return 0
    # Which ones already have a row for today?
    have_stmt = select(SelfImprovementCheckIn.item_id).where(
        and_(
            SelfImprovementCheckIn.user_id == user_id,
            SelfImprovementCheckIn.checkin_date == on_date,
            SelfImprovementCheckIn.item_id.in_(item_ids),
        )
    )
    have = {r for (r,) in (await db.execute(have_stmt)).all()}
    missing = [iid for iid in item_ids if iid not in have]
    for iid in missing:
        db.add(SelfImprovementCheckIn(
            user_id=user_id,
            item_id=iid,
            checkin_date=on_date,
            status=CHECKIN_STATUS_PENDING,
        ))
    if missing:
        await db.commit()
    return len(missing)


# --- AI auto-tick application ----------------------------------------------

async def apply_ai_auto_ticks(
    db: AsyncSession,
    *,
    user_id: int,
    item_ids: Iterable[int],
    reason: str,
    model: str,
    on_date: Optional[date] = None,
) -> int:
    """Mark a batch of items as auto-completed by the AI for today.

    Idempotent — calling twice on the same item produces one row
    with the same status. Used by the AI auto-tick task when it
    decides the user "did" some habits implicitly (e.g. logged a
    workout via the planner ⇒ tick "ورزش / فعالیت بدنی").
    """
    if on_date is None:
        on_date = _today_utc()
    affected = 0
    for iid in item_ids:
        await upsert_checkin(
            db,
            user_id=user_id,
            item_id=iid,
            status=CHECKIN_STATUS_AUTO_DONE,
            on_date=on_date,
            ai_reason=reason,
            ai_model=model,
        )
        affected += 1
    return affected


# --- Profile analytics -----------------------------------------------------

async def get_profile_analytics(db: AsyncSession, *, user_id: int,
                                ) -> Optional[UserProfileAnalytics]:
    stmt = select(UserProfileAnalytics).where(UserProfileAnalytics.user_id == user_id)
    return (await db.execute(stmt)).scalar_one_or_none()


async def upsert_profile_analytics(
    db: AsyncSession,
    *,
    user_id: int,
    summary: Optional[str],
    payload: Optional[dict],
    ai_model: Optional[str],
) -> UserProfileAnalytics:
    """Persist the analytics row, creating it the first time."""
    existing = await get_profile_analytics(db, user_id=user_id)
    if existing is None:
        row = UserProfileAnalytics(
            user_id=user_id,
            summary=summary,
            payload=payload,
            ai_model=ai_model,
            last_refreshed_at=datetime.now(timezone.utc),
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return row
    existing.summary = summary
    existing.payload = payload
    existing.ai_model = ai_model
    existing.last_refreshed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(existing)
    return existing


async def compute_basic_analytics(
    db: AsyncSession, *, user_id: int, lookback_days: int = 30,
) -> dict:
    """Compute the chart-ready stats payload (no AI needed).

    The AI narrative is layered on top by the Celery task; this
    function is fully deterministic and SQL-only so the analytics
    page works even without an OpenAI key.
    """
    today = _today_utc()
    since = today - timedelta(days=lookback_days - 1)

    # Map list → category for the items the user actually has.
    lists = await _self_improvement_lists(db)
    list_ids = [lst.id for lst in lists]
    list_name_by_id = {lst.id: lst.name for lst in lists}

    # All item-ids per category.
    items_by_category: dict[str, list[int]] = {}
    for lst in lists:
        cat = _category_for_list(lst.name)
        items_by_category.setdefault(cat, [])
        for item, _pos in await _items_for_list(db, lst.id):
            items_by_category[cat].append(item.id)

    # Pull all check-ins in the window in one go.
    ci_stmt = select(SelfImprovementCheckIn).where(
        and_(
            SelfImprovementCheckIn.user_id == user_id,
            SelfImprovementCheckIn.checkin_date >= since,
            SelfImprovementCheckIn.checkin_date <= today,
        )
    )
    checkins = list((await db.execute(ci_stmt)).scalars().all())

    done_states = {CHECKIN_STATUS_DONE, CHECKIN_STATUS_AUTO_DONE}

    # --- Per-category stats ---------------------------------------------
    per_category: list[dict] = []
    for category, item_ids in items_by_category.items():
        item_id_set = set(item_ids)
        cat_checkins = [c for c in checkins if c.item_id in item_id_set]
        completed = sum(1 for c in cat_checkins if c.status in done_states)
        opportunities = len(item_ids) * lookback_days
        pct = (completed / opportunities * 100.0) if opportunities else 0.0

        # Streak: walk back from today; a day counts if ANY item in
        # the category was marked done that day.
        days_with_done: set[date] = {
            c.checkin_date for c in cat_checkins if c.status in done_states
        }
        current_streak = 0
        cursor = today
        while cursor in days_with_done:
            current_streak += 1
            cursor = cursor - timedelta(days=1)

        # Longest streak in the window.
        longest_streak = 0
        if days_with_done:
            sorted_days = sorted(days_with_done)
            run = 1
            longest_streak = 1
            for prev, cur in zip(sorted_days, sorted_days[1:]):
                if cur - prev == timedelta(days=1):
                    run += 1
                    longest_streak = max(longest_streak, run)
                else:
                    run = 1

        per_category.append({
            "category": category,
            "label_fa": _category_label_fa(category),
            "completed_last_30_days": completed,
            "total_opportunities_last_30_days": opportunities,
            "completion_pct_30d": round(pct, 2),
            "current_streak_days": current_streak,
            "longest_streak_days": longest_streak,
        })

    # --- Weekly completion chart (last 7 days) --------------------------
    # Dates are serialised as ISO strings here because the payload
    # ends up in a JSON column — SQLAlchemy's default json_serializer
    # (json.dumps) doesn't know how to encode datetime.date.
    weekly_completion: list[dict] = []
    total_items = sum(len(v) for v in items_by_category.values())
    for offset in range(6, -1, -1):
        d = today - timedelta(days=offset)
        day_checkins = [c for c in checkins if c.checkin_date == d]
        completed = sum(1 for c in day_checkins if c.status in done_states)
        pct = (completed / total_items * 100.0) if total_items else 0.0
        weekly_completion.append({
            "date": d.isoformat(),
            "completed": completed,
            "total": total_items,
            "pct": round(pct, 2),
        })

    return {
        "per_category": per_category,
        "weekly_completion": weekly_completion,
        "ai_recommendations": [],
        "lists": [
            {"id": lst.id, "name": list_name_by_id[lst.id]} for lst in lists
        ],
    }


# --- AI narrative ----------------------------------------------------------

async def regenerate_ai_narrative(
    db: AsyncSession, *, user_id: int,
) -> UserProfileAnalytics:
    """Recompute basic stats + ask the AI for a Persian summary.

    Falls back gracefully when no API key is configured (the
    placeholder ai_service still returns a deterministic string,
    so the analytics row is always populated).
    """
    from app.services.ai.nlp_service import generate_text
    from app.services.ai.model_service import DEFAULT_MODEL

    payload = await compute_basic_analytics(db, user_id=user_id)
    prompt = _build_summary_prompt(payload)
    ai_resp = await generate_text(prompt, max_tokens=400, temperature=0.4)
    summary = ai_resp.get("generated_text", "")
    model_used = ai_resp.get("model_used", DEFAULT_MODEL)

    return await upsert_profile_analytics(
        db,
        user_id=user_id,
        summary=summary,
        payload=payload,
        ai_model=model_used,
    )


def _build_summary_prompt(payload: dict) -> str:
    """Build the Persian prompt for the analytics narrative."""
    lines = [
        "تو مربی خودسازی هستی. بر اساس داده‌های آماری زیر، یک خلاصه‌ی فارسی",
        "حداکثر ۸ خطی بنویس که شامل: نقاط قوت کاربر، نقاط ضعف، و سه پیشنهاد",
        "مشخص برای هفته‌ی بعد باشد. لحن گرم و انگیزشی باشد.",
        "",
        "آمار ۳۰ روز اخیر به تفکیک دسته:",
    ]
    for cat in payload.get("per_category", []):
        lines.append(
            f"  - {cat['label_fa']}: "
            f"{cat['completed_last_30_days']}/{cat['total_opportunities_last_30_days']} "
            f"({cat['completion_pct_30d']}%), "
            f"رکورد فعلی: {cat['current_streak_days']} روز، "
            f"بهترین رکورد: {cat['longest_streak_days']} روز"
        )
    lines.append("")
    lines.append("روند ۷ روز اخیر:")
    for pt in payload.get("weekly_completion", []):
        lines.append(f"  - {pt['date']}: {pt['completed']}/{pt['total']} ({pt['pct']}%)")
    return "\n".join(lines)


# --- Cleanup helper for tests ----------------------------------------------

async def reset_user_data(db: AsyncSession, *, user_id: int) -> None:
    """Delete all check-ins + analytics for one user (test fixture).

    Not exposed via the API.
    """
    await db.execute(
        delete(SelfImprovementCheckIn).where(SelfImprovementCheckIn.user_id == user_id)
    )
    await db.execute(
        delete(UserProfileAnalytics).where(UserProfileAnalytics.user_id == user_id)
    )
    await db.commit()
