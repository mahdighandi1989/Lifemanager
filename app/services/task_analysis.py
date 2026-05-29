"""Task pattern analysis (audit task e606cca6 AC6).

``analyze_user_tasks`` identifies and groups the user's work patterns — by
status, priority, and project — and surfaces an overdue cluster plus a few
derived natural-language patterns the AI feedback layer can lean on. Pure DB
read; deterministic; no upstream call.
"""
from __future__ import annotations

from collections import Counter
from datetime import date
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task


def _status(t) -> str:
    return str(getattr(t.status, "value", t.status) or "")


def _priority(t) -> str:
    return str(getattr(t.priority, "value", t.priority) or "")


def _derive_patterns(by_status: Counter, total: int, overdue: List[int]) -> List[str]:
    patterns: List[str] = []
    if overdue:
        patterns.append(f"{len(overdue)} تسک عقب‌افتاده نیاز به رسیدگی دارد")
    if total and by_status.get("done", 0) / total > 0.7:
        patterns.append("نرخ تکمیل بالا — عملکرد خوبی دارید")
    if by_status.get("in_progress", 0) > 5:
        patterns.append("تسک‌های در حال انجام زیاد است — بهتر است تمرکز کنید")
    if total == 0:
        patterns.append("هنوز تسکی ثبت نشده است")
    return patterns


async def analyze_user_tasks(db: AsyncSession, *, user_id: int) -> dict:
    """Identify + group the user's work patterns. Returns
    ``{total, groups:{by_status,by_priority,by_project}, overdue_ids, patterns}``.
    """
    rows = (
        await db.execute(
            select(Task).where(Task.user_id == user_id, Task.merged_into_id.is_(None))
        )
    ).scalars().all()

    today = date.today()
    by_status = Counter(_status(t) for t in rows)
    by_priority = Counter(_priority(t) for t in rows)
    by_project = Counter(t.project_id for t in rows if t.project_id is not None)
    overdue = [
        t.id
        for t in rows
        if t.due_date
        and t.due_date < today
        and _status(t) not in ("done", "cancelled")
    ]

    return {
        "total": len(rows),
        "groups": {
            "by_status": dict(by_status),
            "by_priority": dict(by_priority),
            "by_project": {str(k): v for k, v in by_project.items()},
        },
        "overdue_ids": overdue,
        "patterns": _derive_patterns(by_status, len(rows), overdue),
    }
