"""/api/search — جستجوی سراسری (phase 4, completeness-critic #7).

One query box over EVERY content domain: tasks, list items, lists,
writings, people, projects, transactions, documents, synced emails.
Case-insensitive substring via parameterised ``ilike`` (injection-safe);
every block fail-opens so one broken table never blanks the results.
Each hit carries a ``url`` the SPA can navigate to.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import enforce_auth_when_required, get_optional_user_id
from app.middleware import handle_errors
from app.services.focus_service import focus_url

logger = logging.getLogger(__name__)

router = APIRouter()

_PER_TYPE_LIMIT = 8


def _scope(col, uid: int):
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


@router.get("/api/search", tags=["search"])
@handle_errors
async def global_search(
    q: str = Query(default="", max_length=200),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    q = (q or "").strip()
    if len(q) < 2:
        return {"ok": True, "query": q, "results": [], "total": 0}
    pattern = f"%{q}%"
    results: List[Dict[str, Any]] = []

    def add(kind: str, kind_fa: str, id_, title: str, snippet: str, url: str) -> None:
        # The search already knows the exact row and used to throw the id away
        # at the link — every hit landed on a page ROOT and the owner had to
        # find the thing again by eye. `?focus=` carries the row through, and
        # a page that ignores the param behaves exactly as before.
        results.append({
            "kind": kind, "kind_fa": kind_fa, "id": id_,
            "title": (title or "")[:120], "snippet": (snippet or "")[:160],
            "url": focus_url(url, kind, id_),
        })

    try:  # tasks
        from app.models.task import Task

        rows = (await db.execute(
            select(Task).where(
                _scope(Task.user_id, user_id),
                or_(Task.title.ilike(pattern), Task.description.ilike(pattern)),
            ).limit(_PER_TYPE_LIMIT)
        )).scalars().all()
        for t in rows:
            add("task", "تسک", t.id, t.title, t.description or "", "/tasks")
    except Exception as exc:
        logger.debug("search tasks skipped: %r", exc)

    try:  # todo items (live only) + their first list for deep links
        from app.models.todo_item import TodoItem
        from app.models.todo_list import todo_list_items

        from app.models.todo_list import TodoList

        owned_items = (
            select(todo_list_items.c.todo_item_id)
            .join(TodoList, TodoList.id == todo_list_items.c.todo_list_id)
            .where(_scope(TodoList.user_id, user_id))
        )
        linked_items = select(todo_list_items.c.todo_item_id)
        rows = (await db.execute(
            select(TodoItem, todo_list_items.c.todo_list_id)
            .join(
                todo_list_items,
                todo_list_items.c.todo_item_id == TodoItem.id,
                isouter=True,
            )
            .where(
                TodoItem.deleted_at.is_(None),
                or_(
                    TodoItem.id.in_(owned_items),
                    TodoItem.id.notin_(linked_items),
                ),
                or_(
                    TodoItem.content.ilike(pattern),
                    TodoItem.description.ilike(pattern),
                ),
            ).limit(_PER_TYPE_LIMIT)
        )).all()
        seen: set = set()
        for item, list_id in rows:
            if item.id in seen:
                continue
            seen.add(item.id)
            add(
                "todo_item", "آیتم لیست", item.id, item.content,
                item.description or "",
                f"/lists/{list_id}" if list_id else "/lists",
            )
    except Exception as exc:
        logger.debug("search todo skipped: %r", exc)

    try:  # lists
        from app.models.todo_list import TodoList

        rows = (await db.execute(
            select(TodoList).where(
                _scope(TodoList.user_id, user_id),
                or_(TodoList.name.ilike(pattern), TodoList.description.ilike(pattern)),
            ).limit(_PER_TYPE_LIMIT)
        )).scalars().all()
        for lst in rows:
            add("list", "لیست", lst.id, lst.name, lst.description or "", f"/lists/{lst.id}")
    except Exception as exc:
        logger.debug("search lists skipped: %r", exc)

    try:  # writings (live only)
        from app.models.personal_writing import PersonalWriting

        w_scope = (
            or_(PersonalWriting.user_id == user_id, PersonalWriting.user_id.is_(None))
            if user_id == 0 else (PersonalWriting.user_id == user_id)
        )
        rows = (await db.execute(
            select(PersonalWriting).where(
                w_scope,
                PersonalWriting.deleted_at.is_(None),
                or_(
                    PersonalWriting.title.ilike(pattern),
                    PersonalWriting.body.ilike(pattern),
                    PersonalWriting.category.ilike(pattern),
                ),
            ).limit(_PER_TYPE_LIMIT)
        )).scalars().all()
        for w in rows:
            add("writing", "نوشته", w.id, w.title, w.category or "", "/writings")
    except Exception as exc:
        logger.debug("search writings skipped: %r", exc)

    try:  # people
        from app.models.person import Person

        rows = (await db.execute(
            select(Person).where(
                _scope(Person.user_id, user_id),
                or_(
                    Person.name.ilike(pattern),
                    Person.notes.ilike(pattern),
                    Person.email.ilike(pattern),
                ),
            ).limit(_PER_TYPE_LIMIT)
        )).scalars().all()
        for p in rows:
            add("person", "فرد", p.id, p.name, p.notes or "", f"/people/{p.id}/profile")
    except Exception as exc:
        logger.debug("search people skipped: %r", exc)

    try:  # projects
        from app.models.project import Project

        rows = (await db.execute(
            select(Project).where(
                _scope(Project.user_id, user_id),
                or_(Project.name.ilike(pattern), Project.description.ilike(pattern)),
            ).limit(_PER_TYPE_LIMIT)
        )).scalars().all()
        for pr in rows:
            add("project", "پروژه", pr.id, pr.name, pr.description or "", "/projects")
    except Exception as exc:
        logger.debug("search projects skipped: %r", exc)

    try:  # transactions
        from app.models.finance import FinancialAccount, Transaction

        owned = select(FinancialAccount.id).where(
            _scope(FinancialAccount.user_id, user_id)
        )
        rows = (await db.execute(
            select(Transaction).where(
                Transaction.account_id.in_(owned),
                or_(
                    Transaction.description.ilike(pattern),
                    Transaction.category.ilike(pattern),
                ),
            ).limit(_PER_TYPE_LIMIT)
        )).scalars().all()
        for t in rows:
            add(
                "transaction", "تراکنش", t.id,
                t.description or f"{t.transaction_type} {t.amount}",
                str(t.amount), "/finance",
            )
    except Exception as exc:
        logger.debug("search transactions skipped: %r", exc)

    try:  # synced emails (metadata only) — single-tenant scope only
        from app.models.personal_sync import PersonalEmail

        rows = [] if user_id != 0 else (await db.execute(
            select(PersonalEmail).where(
                or_(
                    PersonalEmail.subject.ilike(pattern),
                    PersonalEmail.from_addr.ilike(pattern),
                ),
            ).limit(_PER_TYPE_LIMIT)
        )).scalars().all()
        for e in rows:
            add("email", "ایمیل", e.id, e.subject or "بدون موضوع", e.ai_summary or "", "/settings?tab=drive")
    except Exception as exc:
        logger.debug("search emails skipped: %r", exc)

    return {"ok": True, "query": q, "results": results, "total": len(results)}
