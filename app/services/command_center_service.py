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

    # ── Phase 2 buckets (2026-07-20, audit #5): مالی، تقویم، افراد، رشد —
    # the domains that had NO card in «امروز من». Each is fail-open so a
    # broken domain never blanks the dashboard or the morning brief.
    finance_bucket = await _finance_bucket(db, user_id)
    calendar_bucket = await _calendar_bucket(db)
    people_bucket = await _people_bucket(db)
    growth_bucket = await _growth_bucket(db, user_id, today)
    commands_bucket = await _commands_bucket(db, user_id)

    return {
        "today": today.isoformat(),
        "finance": finance_bucket,
        "calendar": calendar_bucket,
        "people": people_bucket,
        "growth": growth_bucket,
        "commands": commands_bucket,
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


# --- Phase 2 bucket builders (fail-open, each isolated) ---------------------


async def _finance_bucket(db: AsyncSession, user_id: int) -> Dict[str, Any]:
    """Balances grouped per currency (NEVER summed across currencies —
    audit #20) + subscriptions with a known next payment."""
    try:
        from app.models.finance import FinancialAccount
        from app.models.subscription_account import SubscriptionAccount

        rows = (
            await db.execute(
                select(
                    FinancialAccount.currency,
                    func.count(FinancialAccount.id),
                    func.sum(FinancialAccount.balance),
                )
                .where(_scope(FinancialAccount.user_id, user_id))
                .group_by(FinancialAccount.currency)
            )
        ).all()
        subs = (
            await db.execute(
                select(SubscriptionAccount)
                .where(_scope(SubscriptionAccount.user_id, user_id))
                .limit(10)
            )
        ).scalars().all()
        return {
            "balances_by_currency": [
                {
                    "currency": r[0] or "?",
                    "accounts": int(r[1] or 0),
                    "total": float(r[2] or 0),
                }
                for r in rows
            ],
            "subscriptions": [
                {
                    "id": s.id,
                    "provider": s.provider,
                    "plan": s.plan,
                    "next_payment_date": s.next_payment_date,
                }
                for s in subs
            ],
        }
    except Exception:
        return {"balances_by_currency": [], "subscriptions": []}


async def _calendar_bucket(db: AsyncSession) -> Dict[str, Any]:
    """Today's + tomorrow's Google Calendar mirror rows (read-only)."""
    try:
        from app.models.personal_sync import PersonalEvent

        now = datetime.now(timezone.utc)
        window_end = now + timedelta(hours=36)
        events = (
            await db.execute(
                select(PersonalEvent)
                .where(
                    PersonalEvent.start_at.is_not(None),
                    PersonalEvent.start_at >= now - timedelta(hours=6),
                    PersonalEvent.start_at <= window_end,
                    or_(
                        PersonalEvent.status.is_(None),
                        PersonalEvent.status != "cancelled",
                    ),
                )
                .order_by(PersonalEvent.start_at.asc())
                .limit(10)
            )
        ).scalars().all()
        return {
            "events": [
                {
                    "id": e.id,
                    "summary": e.summary,
                    "start_at": e.start_at.isoformat() if e.start_at else None,
                    "all_day": bool(e.all_day),
                    "location": e.location,
                }
                for e in events
            ],
        }
    except Exception:
        return {"events": []}


async def _people_bucket(db: AsyncSession) -> Dict[str, Any]:
    """Flagged «فراموش نکنم» deeds across all people — the CRM's reminders
    finally surfacing outside each person's own page (audit #11)."""
    try:
        from app.models.person import Person
        from app.models.person_profile import PersonProfile

        rows = (
            await db.execute(
                select(PersonProfile, Person.name)
                .join(Person, Person.id == PersonProfile.person_id)
                .limit(200)
            )
        ).all()
        reminders: List[Dict[str, Any]] = []
        for profile, person_name in rows:
            for entry in (profile.behavior_log or []):
                if isinstance(entry, dict) and entry.get("important"):
                    reminders.append({
                        "person_id": profile.person_id,
                        "person_name": person_name,
                        "note": (entry.get("text") or entry.get("note") or "")[:200],
                    })
        return {"reminders": reminders[:10], "reminders_count": len(reminders)}
    except Exception:
        return {"reminders": [], "reminders_count": 0}


async def _growth_bucket(db: AsyncSession, user_id: int, today: date) -> Dict[str, Any]:
    """Self-improvement today: X از Y (check-ins) — the growth domain's
    first appearance on the dashboard/brief."""
    try:
        from app.models.self_improvement import (
            CHECKIN_STATUS_AUTO_DONE,
            CHECKIN_STATUS_DONE,
            SelfImprovementCheckIn,
        )

        total = int(
            (
                await db.execute(
                    select(func.count())
                    .select_from(SelfImprovementCheckIn)
                    .where(
                        SelfImprovementCheckIn.checkin_date == today,
                        _scope(SelfImprovementCheckIn.user_id, user_id),
                    )
                )
            ).scalar()
            or 0
        )
        done = int(
            (
                await db.execute(
                    select(func.count())
                    .select_from(SelfImprovementCheckIn)
                    .where(
                        SelfImprovementCheckIn.checkin_date == today,
                        _scope(SelfImprovementCheckIn.user_id, user_id),
                        SelfImprovementCheckIn.status.in_(
                            [CHECKIN_STATUS_DONE, CHECKIN_STATUS_AUTO_DONE]
                        ),
                    )
                )
            ).scalar()
            or 0
        )
        return {"today_total": total, "today_done": done}
    except Exception:
        return {"today_total": 0, "today_done": 0}


async def _commands_bucket(db, user_id: int) -> Dict[str, Any]:
    """«فرمان‌های امروز» — today's internalization commands (read-only preview;
    the directive engine loop / the /today endpoint own the persisted
    surfacing). Fail-open so a broken engine never blanks the dashboard."""
    try:
        from app.services import directive_service as _ds

        res = await _ds.select_today_commands(db, user_id, persist=False)
        cmds = res.get("commands") or []
        # proposed count: lets the dashboard nudge «N فرمانِ پیشنهادی منتظرِ
        # تأیید» when there are no ACTIVE commands yet — so a brand-new owner's
        # first open is an actionable invitation, not a dead empty card.
        proposed = len(await _ds.list_directives(db, user_id, status="proposed"))
        return {
            "items": cmds,
            "count": len(cmds),
            "done": sum(1 for c in cmds if c.get("done") is True),
            "proposed": proposed,
        }
    except Exception:
        return {"items": [], "count": 0, "done": 0, "proposed": 0}
