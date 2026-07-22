"""Test-junk finder (owner: «چرا هنوز آشغالِ تستی توش می‌بینم»).

Scans the core content tables for rows that are obviously leftover TEST data
(title/name/content like «test», «تست», «sample»…) and removes the selected
ones REVERSIBLY, using each table's existing soft-delete marker so nothing is
truly lost (the owner's standing data-safety rule):

  * Task      → status = CANCELLED   (hidden from open views + attention)
  * Project   → is_active = False    (hidden by list_projects filter)
  * TodoList  → is_archived = True   (hidden from the lists index)
  * TodoItem  → deleted_at = now     (moves to /api/trash, restorable)

Subscriptions are reported too (they surface as «نیازمند توجه» when a test row
has a past renewal date) but flagged reversible=False — the owner confirms a
hard remove for those since the table has no soft-delete (a snapshot re-added
with one POST).
"""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any, Dict, List

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

# Conservative patterns — whole-word latin tokens (so «contest» is safe) plus
# explicit Persian test words.
_LATIN = re.compile(r"(?i)\b(test|tests|sample|samples|example|dummy|placeholder|foobar|asdf)\b")
_FA_TOKENS = ("تست", "آزمایش", "نمونه‌ی تست", "تستی")

# EXACT-match tokens for the auto-purge — dead-safe (the whole title/content IS
# a test word, trimmed), so a startup one-shot can remove them WITHOUT the owner
# hunting for the cleanup button. Substring matches are left to the manual tool.
_EXACT_TEST_LATIN = {
    "test", "tests", "testing", "sample", "samples", "example", "examples",
    "dummy", "placeholder", "foobar", "asdf", "xxx",
}
_EXACT_TEST_FA = {"تست", "تستی", "آزمایش", "آزمایشی", "نمونه"}


def _looks_test(text: str | None) -> bool:
    if not text:
        return False
    if _LATIN.search(text):
        return True
    return any(tok in text for tok in _FA_TOKENS)


def _is_exact_test(text: str | None) -> bool:
    """True only when the ENTIRE value (trimmed) is a test token — no
    substrings, so a legitimate row that merely contains 'test' is never
    auto-removed."""
    if not text:
        return False
    t = text.strip()
    return t.lower() in _EXACT_TEST_LATIN or t in _EXACT_TEST_FA


def _scope(col, uid: int):
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


async def scan_test_junk(db: AsyncSession, user_id: int = 0) -> List[Dict[str, Any]]:
    """Read-only: return candidate test-junk rows across the content tables.
    Each item: {kind, id, label, reversible}. Never mutates anything."""
    from app.models.project import Project
    from app.models.subscription_account import SubscriptionAccount
    from app.models.task import Task, TaskStatus
    from app.models.todo_item import TodoItem
    from app.models.todo_list import TodoList

    found: List[Dict[str, Any]] = []

    tasks = (
        await db.execute(
            select(Task).where(_scope(Task.user_id, user_id), Task.merged_into_id.is_(None))
        )
    ).scalars().all()
    for t in tasks:
        if t.status != TaskStatus.CANCELLED and _looks_test(t.title):
            found.append({"kind": "task", "id": t.id, "label": t.title, "reversible": True})

    projects = (
        await db.execute(select(Project).where(_scope(Project.user_id, user_id), Project.is_active.isnot(False)))
    ).scalars().all()
    for p in projects:
        if _looks_test(p.name):
            found.append({"kind": "project", "id": p.id, "label": p.name, "reversible": True})

    lists = (
        await db.execute(select(TodoList).where(_scope(TodoList.user_id, user_id), TodoList.is_archived.is_(False)))
    ).scalars().all()
    for lst in lists:
        if _looks_test(lst.name):
            found.append({"kind": "list", "id": lst.id, "label": lst.name, "reversible": True})

    items = (
        await db.execute(select(TodoItem).where(_scope(TodoItem.owner_id, user_id), TodoItem.deleted_at.is_(None)))
    ).scalars().all()
    for it in items:
        if _looks_test(it.content):
            found.append({"kind": "todo", "id": it.id, "label": it.content[:80], "reversible": True})

    subs = (await db.execute(select(SubscriptionAccount).where(_scope(SubscriptionAccount.user_id, user_id)))).scalars().all()
    for s in subs:
        if _looks_test(s.provider) or _looks_test(s.plan):
            found.append({"kind": "subscription", "id": s.id, "label": s.provider, "reversible": False})

    # Inbox review-queue rows (owner saw «test» clutter in صندوق ورودی). Soft
    # via status='dismissed'. Skip the machine-generated password_request rows —
    # those have their own «فایل‌های رمزدار» cleanup.
    from app.models.inbox_item import InboxItem

    inbox = (
        await db.execute(
            select(InboxItem).where(_scope(InboxItem.user_id, user_id), InboxItem.status == "pending")
        )
    ).scalars().all()
    for r in inbox:
        if r.suggested_type == "password_request":
            continue
        if _looks_test(r.content):
            found.append({"kind": "inbox", "id": r.id, "label": (r.content or "")[:80], "reversible": True})

    return found


async def remove_test_junk(db: AsyncSession, user_id: int, items: List[Dict[str, Any]]) -> Dict[str, int]:
    """Remove the selected rows. Reversible tables use their soft-delete marker;
    subscriptions (no soft-delete) are hard-removed on explicit request. Returns
    a per-kind count of what was removed."""
    from app.models.project import Project
    from app.models.subscription_account import SubscriptionAccount
    from app.models.task import Task, TaskStatus
    from app.models.todo_item import TodoItem
    from app.models.todo_list import TodoList

    from app.models.inbox_item import InboxItem

    now = datetime.now(timezone.utc)
    removed = {"task": 0, "project": 0, "list": 0, "todo": 0, "subscription": 0, "inbox": 0}

    # group ids by kind
    by_kind: Dict[str, List[int]] = {}
    for it in items:
        by_kind.setdefault(str(it.get("kind")), []).append(int(it.get("id")))

    for tid in by_kind.get("task", []):
        t = await db.get(Task, tid)
        if t is not None and (t.user_id in (None, user_id) or user_id == 0):
            t.status = TaskStatus.CANCELLED
            removed["task"] += 1
    for pid in by_kind.get("project", []):
        p = await db.get(Project, pid)
        if p is not None and (p.user_id in (None, user_id) or user_id == 0):
            p.is_active = False
            removed["project"] += 1
    for lid in by_kind.get("list", []):
        lst = await db.get(TodoList, lid)
        if lst is not None and (lst.user_id in (None, user_id) or user_id == 0):
            lst.is_archived = True
            removed["list"] += 1
    for iid in by_kind.get("todo", []):
        it = await db.get(TodoItem, iid)
        if it is not None and it.deleted_at is None and (it.owner_id in (None, user_id) or user_id == 0):
            it.deleted_at = now
            removed["todo"] += 1
    for sid in by_kind.get("subscription", []):
        s = await db.get(SubscriptionAccount, sid)
        if s is not None and (s.user_id in (None, user_id) or user_id == 0):
            await db.delete(s)  # no soft-delete column; hard remove on request
            removed["subscription"] += 1
    for iid in by_kind.get("inbox", []):
        r = await db.get(InboxItem, iid)
        if r is not None and r.status != "dismissed" and (r.user_id in (None, user_id) or user_id == 0):
            r.status = "dismissed"  # soft — kept, restorable
            removed["inbox"] += 1

    await db.commit()
    return removed


async def auto_purge_exact_test_junk(db: AsyncSession, user_id: int = 0) -> Dict[str, int]:
    """Startup one-shot: reversibly soft-delete rows whose ENTIRE title/name/
    content is a test token (exact match — dead-safe). This is what actually
    makes «test» junk disappear without the owner hunting for the cleanup
    button. Idempotent: soft-deleted rows no longer match, so re-runs are
    no-ops. Never touches substring/ambiguous rows (those stay for the manual
    tool)."""
    from app.models.inbox_item import InboxItem
    from app.models.project import Project
    from app.models.task import Task, TaskStatus
    from app.models.todo_item import TodoItem
    from app.models.todo_list import TodoList

    now = datetime.now(timezone.utc)
    removed = {"task": 0, "project": 0, "list": 0, "todo": 0, "inbox": 0}

    tasks = (
        await db.execute(select(Task).where(_scope(Task.user_id, user_id), Task.merged_into_id.is_(None)))
    ).scalars().all()
    for t in tasks:
        if t.status != TaskStatus.CANCELLED and _is_exact_test(t.title):
            t.status = TaskStatus.CANCELLED
            removed["task"] += 1

    projects = (
        await db.execute(select(Project).where(_scope(Project.user_id, user_id), Project.is_active.isnot(False)))
    ).scalars().all()
    for p in projects:
        if _is_exact_test(p.name):
            p.is_active = False
            removed["project"] += 1

    lists = (
        await db.execute(select(TodoList).where(_scope(TodoList.user_id, user_id), TodoList.is_archived.is_(False)))
    ).scalars().all()
    for lst in lists:
        if _is_exact_test(lst.name):
            lst.is_archived = True
            removed["list"] += 1

    items = (
        await db.execute(select(TodoItem).where(_scope(TodoItem.owner_id, user_id), TodoItem.deleted_at.is_(None)))
    ).scalars().all()
    for it in items:
        if _is_exact_test(it.content):
            it.deleted_at = now
            removed["todo"] += 1

    inbox = (
        await db.execute(select(InboxItem).where(_scope(InboxItem.user_id, user_id), InboxItem.status == "pending"))
    ).scalars().all()
    for r in inbox:
        if r.suggested_type != "password_request" and _is_exact_test(r.content):
            r.status = "dismissed"
            removed["inbox"] += 1

    await db.commit()
    return removed


async def scan_locked_boilerplate(db: AsyncSession, user_id: int = 0) -> List[Dict[str, Any]]:
    """Pending «فایل رمزدار» requests whose file is worthless broker boilerplate
    (Terms/Policy/Disclosure…). Read-only. Each: {kind, id, label, reversible}."""
    from app.models.inbox_item import InboxItem
    from app.services.ingest.email_ingest import _is_worthless_locked

    rows = (
        await db.execute(
            select(InboxItem).where(
                _scope(InboxItem.user_id, user_id),
                InboxItem.status == "pending",
                InboxItem.suggested_type == "password_request",
            )
        )
    ).scalars().all()
    out: List[Dict[str, Any]] = []
    for r in rows:
        fn = (r.suggestion or {}).get("filename") or ""
        if _is_worthless_locked(fn):
            out.append({"kind": "password_request", "id": r.id, "label": fn, "reversible": True})
    return out


async def dismiss_locked_boilerplate(db: AsyncSession, user_id: int = 0) -> Dict[str, int]:
    """Dismiss (soft, restorable) every pending boilerplate «فایل رمزدار» request
    — the retroactive purge of the dozens the owner already saw. Idempotent."""
    from app.models.inbox_item import InboxItem
    from app.services.ingest.email_ingest import _is_worthless_locked

    rows = (
        await db.execute(
            select(InboxItem).where(
                _scope(InboxItem.user_id, user_id),
                InboxItem.status == "pending",
                InboxItem.suggested_type == "password_request",
            )
        )
    ).scalars().all()
    n = 0
    for r in rows:
        fn = (r.suggestion or {}).get("filename") or ""
        if _is_worthless_locked(fn):
            r.status = "dismissed"
            n += 1
    await db.commit()
    return {"dismissed": n}
