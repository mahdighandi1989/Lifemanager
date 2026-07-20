"""Command center (میز فرمان «امروز من») — the one aggregate the Dashboard reads.

Collects, in ONE call, everything the owner needs at the start of the
day, across modules that each already have their own API surface:

* tasks     — overdue / due today / upcoming (7 days), open count
* todo      — list items due (overdue + next 7 days) and starred-open
* alerts    — unread notification count + the latest few
* inbox     — pending capture count + the latest few (صندوق ورودی)
* stats     — the same three counters the legacy Dashboard cards show

Read-only; every bucket is scoped exactly like its home router (anon 0
also reads legacy NULL-owner rows). No FastAPI imports.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inbox_item import InboxItem
from app.models.notification import Notification
from app.models.project import Project
from app.models.task import Task, TaskStatus
from app.models.todo_item import TodoItem

_UPCOMING_DAYS = 7
_LIST_LIMIT = 10


def _scope(col, uid: int):
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


def _task_row(t: Task) -> Dict[str, Any]:
    return {
        "id": t.id,
        "title": t.title,
        "priority": t.priority.value if t.priority else None,
        "status": t.status.value if t.status else None,
        "due_date": t.due_date.isoformat() if t.due_date else None,
        "deadline": t.deadline.isoformat() if t.deadline else None,
        "project_id": t.project_id,
    }


def _todo_row(i: TodoItem) -> Dict[str, Any]:
    return {
        "id": i.id,
        "content": i.content,
        "due_date": i.due_date.isoformat() if i.due_date else None,
        "is_starred": bool(i.is_starred),
    }


def _effective_due(t: Task, today: date) -> tuple[int, date]:
    """Sort key: earliest of due_date/deadline-date, missing dates last."""
    candidates: List[date] = []
    if t.due_date:
        candidates.append(t.due_date)
    if t.deadline:
        candidates.append(t.deadline.date())
    if not candidates:
        return (1, today)
    return (0, min(candidates))


async def build_today(db: AsyncSession, user_id: int = 0) -> Dict[str, Any]:
    """Assemble the full «امروز من» payload. Pure reads, one session."""
    today = datetime.now(timezone.utc).date()
    horizon = today + timedelta(days=_UPCOMING_DAYS)

    open_tasks = (
        await db.execute(
            select(Task).where(
                _scope(Task.user_id, user_id),
                Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS]),
                Task.merged_into_id.is_(None),
            )
        )
    ).scalars().all()

    overdue: List[Task] = []
    due_today: List[Task] = []
    upcoming: List[Task] = []
    for t in open_tasks:
        dates: List[date] = []
        if t.due_date:
            dates.append(t.due_date)
        if t.deadline:
            dates.append(t.deadline.date())
        if not dates:
            continue
        effective = min(dates)
        if effective < today:
            overdue.append(t)
        elif effective == today:
            due_today.append(t)
        elif effective <= horizon:
            upcoming.append(t)
    overdue.sort(key=lambda t: _effective_due(t, today))
    due_today.sort(key=lambda t: _effective_due(t, today))
    upcoming.sort(key=lambda t: _effective_due(t, today))

    todo_due = (
        await db.execute(
            select(TodoItem)
            .where(
                _scope(TodoItem.owner_id, user_id),
                TodoItem.deleted_at.is_(None),
                TodoItem.is_completed.is_(False),
                TodoItem.due_date.isnot(None),
                TodoItem.due_date <= horizon,
            )
            .order_by(TodoItem.due_date.asc())
            .limit(_LIST_LIMIT)
        )
    ).scalars().all()
    todo_starred = (
        await db.execute(
            select(TodoItem)
            .where(
                _scope(TodoItem.owner_id, user_id),
                TodoItem.deleted_at.is_(None),
                TodoItem.is_completed.is_(False),
                TodoItem.is_starred.is_(True),
            )
            .order_by(TodoItem.id.desc())
            .limit(_LIST_LIMIT)
        )
    ).scalars().all()

    # Notifications: user_id is NOT NULL on this table, so plain == scope.
    unread_count = int(
        (
            await db.execute(
                select(func.count())
                .select_from(Notification)
                .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            )
        ).scalar()
        or 0
    )
    latest_notifications = (
        await db.execute(
            select(Notification)
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            .order_by(Notification.id.desc())
            .limit(5)
        )
    ).scalars().all()

    inbox_pending = (
        await db.execute(
            select(InboxItem)
            .where(_scope(InboxItem.user_id, user_id), InboxItem.status == "pending")
            .order_by(InboxItem.id.desc())
            .limit(_LIST_LIMIT)
        )
    ).scalars().all()
    inbox_pending_count = int(
        (
            await db.execute(
                select(func.count())
                .select_from(InboxItem)
                .where(_scope(InboxItem.user_id, user_id), InboxItem.status == "pending")
            )
        ).scalar()
        or 0
    )

    tasks_total = int(
        (
            await db.execute(
                select(func.count()).select_from(Task).where(_scope(Task.user_id, user_id))
            )
        ).scalar()
        or 0
    )
    tasks_done = int(
        (
            await db.execute(
                select(func.count())
                .select_from(Task)
                .where(_scope(Task.user_id, user_id), Task.status == TaskStatus.DONE)
            )
        ).scalar()
        or 0
    )
    projects_total = int(
        (
            await db.execute(
                select(func.count())
                .select_from(Project)
                .where(_scope(Project.user_id, user_id))
            )
        ).scalar()
        or 0
    )

    return {
        "today": today.isoformat(),
        "tasks": {
            "overdue": [_task_row(t) for t in overdue[:_LIST_LIMIT]],
            "due_today": [_task_row(t) for t in due_today[:_LIST_LIMIT]],
            "upcoming": [_task_row(t) for t in upcoming[:_LIST_LIMIT]],
            "overdue_count": len(overdue),
            "due_today_count": len(due_today),
            "upcoming_count": len(upcoming),
            "open_count": len(open_tasks),
        },
        "todo": {
            "due": [_todo_row(i) for i in todo_due],
            "starred": [_todo_row(i) for i in todo_starred],
        },
        "notifications": {
            "unread_count": unread_count,
            "latest": [
                {
                    "id": n.id,
                    "title": n.title,
                    "message": n.message,
                    "priority": n.priority,
                    "created_at": n.created_at.isoformat() if n.created_at else None,
                }
                for n in latest_notifications
            ],
        },
        "inbox": {
            "pending_count": inbox_pending_count,
            "latest": [
                {
                    "id": i.id,
                    "content": i.content,
                    "suggested_type": i.suggested_type,
                    "suggestion": i.suggestion,
                    "created_at": i.created_at.isoformat() if i.created_at else None,
                }
                for i in inbox_pending
            ],
        },
        "stats": {
            "tasks_total": tasks_total,
            "tasks_done": tasks_done,
            "projects_total": projects_total,
        },
    }
