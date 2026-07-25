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


async def _available_budget(
    db: AsyncSession, user_id: int
) -> Tuple[Decimal, Optional[int], Optional[str]]:
    """Return (available_amount, budget_plan_id, currency). Prefers an
    explicit BudgetPlan's remaining_budget; the fallback is the LARGEST
    single-currency account total — 2026-07-20 audit #20: IRR+AED+USD
    were being summed raw, making the only budget number meaningless."""
    plan = (
        await db.execute(
            select(BudgetPlan)
            .where(BudgetPlan.user_id == user_id)
            .order_by(BudgetPlan.id.desc())
        )
    ).scalars().first()
    if plan is not None:
        return Decimal(plan.remaining_budget or 0), plan.id, getattr(plan, "currency", None)

    rows = (
        await db.execute(
            select(FinancialAccount).where(FinancialAccount.user_id == user_id)
        )
    ).scalars().all()
    by_currency: dict[str, Decimal] = {}
    for a in rows:
        cur = (a.currency or "?").upper()
        by_currency[cur] = by_currency.get(cur, Decimal(0)) + Decimal(a.balance or 0)
    if not by_currency:
        return Decimal(0), None, None
    currency, total = max(by_currency.items(), key=lambda kv: kv[1])
    return total, None, currency


async def balances_by_currency(db: AsyncSession, user_id: int) -> list[dict]:
    """Grouped account totals — the only honest «موجودی کل» for a
    multi-currency owner (audit #20). No cross-currency summing, ever."""
    # NULL-inclusive in the anon scope — auto-created cards (scan job) carry
    # user_id NULL and must be counted here exactly as the dashboard counts them.
    from app.services.inbox_service import scope_filter

    rows = (
        await db.execute(
            select(FinancialAccount).where(scope_filter(FinancialAccount.user_id, user_id))
        )
    ).scalars().all()
    grouped: dict[str, dict] = {}
    for a in rows:
        cur = (a.currency or "?").upper()
        g = grouped.setdefault(cur, {"currency": cur, "total": Decimal(0), "accounts": 0})
        g["total"] += Decimal(a.balance or 0)
        g["accounts"] += 1
    return [
        {"currency": g["currency"], "total": float(g["total"]), "accounts": g["accounts"]}
        for g in sorted(grouped.values(), key=lambda g: -g["total"])
    ]


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
    available, plan_id, currency = await _available_budget(db, user_id)

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
                    f"{amount} از موجودی قابل‌دسترس {available}"
                    + (f" {currency}" if currency else "")
                    + " بیشتر است."
                ),
                title="هشدار بودجه",
            )
            notified = True
        except Exception:  # never let a notification failure block the answer
            notified = False

    return {
        "affordable": affordable,
        "available_budget": float(available),
        "currency": currency,
        "requested": float(amount),
        "priority": priority,
        "budget_plan_id": plan_id,
        "notified": notified,
        "label": label,
    }
