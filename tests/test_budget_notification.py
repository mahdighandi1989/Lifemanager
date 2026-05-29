"""Budget affordability notifications (audit task 4ae4b3ca, AC5)."""
from decimal import Decimal

import pytest
from sqlalchemy import select

from app.models.finance import FinancialAccount
from app.models.notification import Notification
from app.models.task import Task
from app.services.budget_notification_service import notify_affordable_tasks


@pytest.mark.asyncio
async def test_affordable_task_triggers_notification(db_session):
    db_session.add(FinancialAccount(user_id=5, name="bank", kind="bank", balance=Decimal("1000"), currency="IRR"))
    db_session.add(Task(user_id=5, title="خرید کتاب", status="todo", estimated_cost=Decimal("200")))
    db_session.add(Task(user_id=5, title="سفر گران", status="todo", estimated_cost=Decimal("5000")))
    await db_session.commit()

    notified = await notify_affordable_tasks(db_session, user_id=5)
    assert len(notified) == 1  # only the affordable one

    notes = (
        await db_session.execute(select(Notification).where(Notification.user_id == 5))
    ).scalars().all()
    assert len(notes) == 1
    assert "خرید کتاب" in notes[0].message
    assert "می‌توانید" in notes[0].message


@pytest.mark.asyncio
async def test_no_cost_or_done_tasks_are_skipped(db_session):
    db_session.add(FinancialAccount(user_id=6, name="bank", kind="bank", balance=Decimal("1000"), currency="IRR"))
    db_session.add(Task(user_id=6, title="no cost", status="todo"))  # estimated_cost None
    db_session.add(Task(user_id=6, title="done cheap", status="done", estimated_cost=Decimal("10")))
    await db_session.commit()

    notified = await notify_affordable_tasks(db_session, user_id=6)
    assert notified == []
