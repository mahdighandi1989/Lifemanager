"""User-context retrieval for the AI pipeline (audit task 1a08ded2).

The AI analyze / generate flows often want the caller's current
task/project/todo/notification surface as context. This module pulls
that data, scoped to a single ``user_id``, in a deliberately
read-only way — never reaches across users, never writes.
"""
from __future__ import annotations

from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.finance import FinancialAccount
from app.models.notification import Notification
from app.models.project import Project
from app.models.task import Task
from app.models.todo_item import TodoItem


async def get_user_tasks(db: AsyncSession, *, user_id: int) -> List[Task]:
    result = await db.execute(select(Task).where(Task.user_id == user_id))
    return list(result.scalars().all())


async def get_user_projects(db: AsyncSession, *, user_id: int) -> List[Project]:
    result = await db.execute(select(Project).where(Project.user_id == user_id))
    return list(result.scalars().all())


async def get_user_todo_items(db: AsyncSession, *, user_id: int) -> List[TodoItem]:
    """TodoItem has no direct user_id — items live on lists which carry
    user_id. We join through the association table and the list."""
    from app.models.todo_list import TodoList, todo_list_items

    result = await db.execute(
        select(TodoItem)
        .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
        .join(TodoList, TodoList.id == todo_list_items.c.todo_list_id)
        .where(TodoList.user_id == user_id)
    )
    return list(result.scalars().all())


async def get_user_notifications(
    db: AsyncSession, *, user_id: int, limit: int = 50
) -> List[Notification]:
    stmt = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.id.desc())
        .limit(max(1, min(limit, 200)))
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_user_financial_accounts(
    db: AsyncSession, *, user_id: int
) -> List[FinancialAccount]:
    """Bank/broker/exchange accounts for the user (audit task 4ae4b3ca AC 13 —
    so the AI analysis flow can reason over the caller's financial picture)."""
    result = await db.execute(
        select(FinancialAccount).where(FinancialAccount.user_id == user_id)
    )
    return list(result.scalars().all())


async def get_user_data_context(db: AsyncSession, *, user_id: int) -> dict:
    """Return a single dict carrying every per-user signal the AI
    pipeline cares about. The shape is intentionally flat so the
    consumer can serialise it directly into a prompt."""
    tasks = await get_user_tasks(db, user_id=user_id)
    projects = await get_user_projects(db, user_id=user_id)
    todos = await get_user_todo_items(db, user_id=user_id)
    notifications = await get_user_notifications(db, user_id=user_id, limit=20)
    accounts = await get_user_financial_accounts(db, user_id=user_id)
    return {
        "tasks": [
            {"id": t.id, "title": t.title, "status": getattr(t, "status", None)}
            for t in tasks
        ],
        "projects": [{"id": p.id, "name": p.name} for p in projects],
        "todo_items": [
            {"id": i.id, "content": i.content, "is_completed": i.is_completed}
            for i in todos
        ],
        "notifications": [
            {"id": n.id, "title": n.title, "priority": n.priority}
            for n in notifications
        ],
        # Financial picture (audit task 4ae4b3ca AC 13) — feeds the AI
        # analysis so it can surface budget-aware suggestions.
        "financial_accounts": [
            {
                "id": a.id,
                "name": a.name,
                "kind": a.kind,
                "balance": float(a.balance or 0),
                "currency": a.currency,
            }
            for a in accounts
        ],
    }
