"""Budget-aware purchase evaluation (audit task 4ae4b3ca AC 12).

When the user considers a purchase, ``evaluate_purchase`` weighs its amount
against the available budget (the latest BudgetPlan.remaining_budget, falling
back to total account balance) and returns a priority. If the purchase exceeds
the available budget it fires a high-priority ``budget_alert`` notification so
the user is warned rather than silently overspending.
"""
from __future__ import annotations

from decimal import Decimal
from typing import Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.finance import BudgetPlan, FinancialAccount


async def _available_budget(db: AsyncSession, user_id: int) -> Tuple[Decimal, Optional[int]]:
    """Return (available_amount, budget_plan_id). Prefers an explicit
    BudgetPlan's remaining_budget; falls back to total account balance."""
    plan = (
        await db.execute(
            select(BudgetPlan)
            .where(BudgetPlan.user_id == user_id)
            .order_by(BudgetPlan.id.desc())
        )
    ).scalars().first()
    if plan is not None:
        return Decimal(plan.remaining_budget or 0), plan.id

    rows = (
        await db.execute(
            select(FinancialAccount).where(FinancialAccount.user_id == user_id)
        )
    ).scalars().all()
    total = sum((Decimal(a.balance or 0) for a in rows), Decimal(0))
    return total, None


async def evaluate_purchase(
    db: AsyncSession,
    *,
    user_id: int,
    amount,
    label: Optional[str] = None,
) -> dict:
    """Evaluate a prospective purchase against the user's budget.

    Returns ``{affordable, available_budget, requested, priority,
    budget_plan_id, notified, label}``. ``priority`` is ``blocked`` (over
    budget), or ``high``/``normal``/``low`` by how big the purchase is relative
    to what's available. Over-budget purchases fire a budget_alert notification.
    """
    amount = Decimal(str(amount))
    available, plan_id = await _available_budget(db, user_id)

    affordable = amount <= available
    if not affordable:
        priority = "blocked"
    elif available > 0 and amount <= available * Decimal("0.25"):
        priority = "high"
    elif available > 0 and amount <= available * Decimal("0.6"):
        priority = "normal"
    else:
        priority = "low"

    notified = False
    if not affordable:
        try:
            from app.services.notification_service import notify_event

            label_txt = f" «{label}»" if label else ""
            await notify_event(
                "budget_alert",
                user_id=user_id,
                db=db,
                priority="high",
                silent=False,
                message=(
                    f"بودجهٔ کافی برای این خرید{label_txt} ندارید: مبلغ "
                    f"{amount} از موجودی قابل‌دسترس {available} بیشتر است."
                ),
                title="هشدار بودجه",
            )
            notified = True
        except Exception:  # never let a notification failure block the answer
            notified = False

    return {
        "affordable": affordable,
        "available_budget": float(available),
        "requested": float(amount),
        "priority": priority,
        "budget_plan_id": plan_id,
        "notified": notified,
        "label": label,
    }
