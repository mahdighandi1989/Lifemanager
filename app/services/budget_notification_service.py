"""Budget notifier — flag tasks the user can already afford (task 4ae4b3ca, AC5).

When a Task carries an estimated_cost and the user's total account balance
covers it, create a "شما می‌توانید [تسک] را انجام دهید" notification via the
NotificationService. Done tasks are skipped. Returns the ids of the tasks
notified about.
"""
from __future__ import annotations

from decimal import Decimal
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.finance import FinancialAccount
from app.models.task import Task

_DONE = {"done", "completed"}


def _to_decimal(value) -> Decimal:
    if value is None:
        return Decimal(0)
    return Decimal(str(value))


async def notify_affordable_tasks(db: AsyncSession, user_id: int) -> List[int]:
    """Notify the user about each estimated-cost task their balance covers."""
    # 2026-07-20 audit #20: this helper was both plan-blind and summed
    # currencies raw. It now shares budget_service's single source of
    # truth (plan first, else the largest single-currency total).
    from app.services.budget_service import _available_budget

    total_balance, _plan_id, _currency = await _available_budget(db, user_id)

    tasks = (
        await db.execute(
            select(Task).where(
                Task.user_id == user_id, Task.estimated_cost.isnot(None)
            )
        )
    ).scalars().all()

    from app.services.notification_service import notify_event

    notified: List[int] = []
    for task in tasks:
        status = getattr(getattr(task, "status", None), "value", None) or str(
            getattr(task, "status", "")
        )
        if status in _DONE:
            continue
        if _to_decimal(task.estimated_cost) <= total_balance:
            await notify_event(
                "budget_affordable",
                user_id=user_id,
                db=db,
                message=f"شما می‌توانید {task.title} را انجام دهید",
                title="بودجه کافی",
                priority="normal",
            )
            notified.append(task.id)
    return notified
