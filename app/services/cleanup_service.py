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


def _looks_test(text: str | None) -> bool:
    if not text:
        return False
    if _LATIN.search(text):
        return True
    return any(tok in text for tok in _FA_TOKENS)


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

    now = datetime.now(timezone.utc)
    removed = {"task": 0, "project": 0, "list": 0, "todo": 0, "subscription": 0}

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

    await db.commit()
    return removed
