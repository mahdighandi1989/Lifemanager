"""AI-driven financial analysis (audit task 4ae4b3ca, AC 13).

The memo: "این باید توسط مدل‌های هوش مصنوعی داخلی هم آنالیز بشه" — the user's
finances should also be analysed by the app's internal AI models, surfacing
budget-aware purchase suggestions.

``analyze_finances`` gathers the user's accounts, budget plan, incomes, assets
and the purchases they parked in their task list (Task.estimated_cost), builds a
compact Persian summary, and asks ``ai_service.generate_text`` to return advice
plus an affordability verdict per planned purchase. ``generate_text`` always
returns a 200-shaped dict (a deterministic placeholder when no provider key is
configured), so the endpoint behind this is testable without a live upstream.
"""
from __future__ import annotations

from decimal import Decimal
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.finance import Asset, BudgetPlan, FinancialAccount, Income
from app.models.task import Task

_DONE = {"done", "completed"}


def _to_decimal(value) -> Decimal:
    if value is None:
        return Decimal(0)
    return Decimal(str(value))


async def _gather(db: AsyncSession, user_id: int) -> dict:
    """Collect the raw financial figures used to build the AI prompt."""
    # NULL-inclusive scope: the auto-created cards carry user_id=NULL in the
    # anon deployment; the strict filter made insights blind to them.
    from app.services.inbox_service import scope_filter

    accounts = (
        await db.execute(
            select(FinancialAccount).where(scope_filter(FinancialAccount.user_id, user_id))
        )
    ).scalars().all()
    incomes = (
        await db.execute(select(Income).where(Income.user_id == user_id))
    ).scalars().all()
    assets = (
        await db.execute(select(Asset).where(Asset.user_id == user_id))
    ).scalars().all()
    plan = (
        await db.execute(
            select(BudgetPlan)
            .where(BudgetPlan.user_id == user_id)
            .order_by(BudgetPlan.id.desc())
        )
    ).scalars().first()
    tasks = (
        await db.execute(
            select(Task).where(
                Task.user_id == user_id, Task.estimated_cost.isnot(None)
            )
        )
    ).scalars().all()

    # 12,500,000 IRR + 15,636 AED is NOT one number — totals only make sense
    # per currency (2026-07-30). The cross-currency sum is kept for backward
    # compatibility of the response shape but the prompt uses the breakdown.
    balances_by_currency: dict = {}
    for a in accounts:
        cur = (a.currency or "?").upper()
        balances_by_currency[cur] = balances_by_currency.get(cur, Decimal(0)) + (
            _to_decimal(a.balance) or Decimal(0)
        )
    total_balance = sum((_to_decimal(a.balance) for a in accounts), Decimal(0))
    total_assets = sum((_to_decimal(a.value) for a in assets), Decimal(0))
    total_income = sum((_to_decimal(i.amount) for i in incomes), Decimal(0))
    available = _to_decimal(plan.remaining_budget) if plan is not None else total_balance

    planned: List[dict] = []
    for task in tasks:
        status = getattr(getattr(task, "status", None), "value", None) or str(
            getattr(task, "status", "")
        )
        if status in _DONE:
            continue
        cost = _to_decimal(task.estimated_cost)
        planned.append(
            {
                "task_id": task.id,
                "title": task.title,
                "estimated_cost": float(cost),
                "affordable": cost <= available,
            }
        )

    return {
        "account_count": len(accounts),
        "balances_by_currency": {k: float(v) for k, v in sorted(balances_by_currency.items())},
        "total_balance": float(total_balance),
        "total_assets": float(total_assets),
        "total_income": float(total_income),
        "available_budget": float(available),
        "budget_period": plan.period if plan is not None else None,
        "planned_purchases": planned,
    }


def _build_prompt(summary: dict) -> str:
    lines = [
        "شما یک مشاور مالی هستید. وضعیت مالی کاربر را تحلیل کنید و پیشنهادهای",
        "خرید بر اساس بودجهٔ موجود ارائه دهید. کوتاه و کاربردی پاسخ دهید.",
        "",
        f"- تعداد حساب‌ها: {summary['account_count']}",
        "- موجودی به تفکیک ارز: "
        + (
            "، ".join(
                f"{amount} {cur}"
                for cur, amount in (summary.get("balances_by_currency") or {}).items()
            )
            or str(summary["total_balance"])
        ),
        f"- مجموع دارایی‌ها: {summary['total_assets']}",
        f"- مجموع درآمدها: {summary['total_income']}",
        f"- بودجهٔ قابل‌دسترس: {summary['available_budget']}"
        + (f" ({summary['budget_period']})" if summary["budget_period"] else ""),
    ]
    if summary["planned_purchases"]:
        lines.append("- خریدهای برنامه‌ریزی‌شده:")
        for p in summary["planned_purchases"]:
            verdict = "در بودجه" if p["affordable"] else "خارج از بودجه"
            lines.append(
                f"  • {p['title']} — برآورد {p['estimated_cost']} ({verdict})"
            )
    else:
        lines.append("- خریدی برنامه‌ریزی نشده است.")
    lines.append("")
    lines.append("پیشنهادهای خرید و نکات پس‌انداز را فهرست کنید:")
    return "\n".join(lines)


async def analyze_finances(db: AsyncSession, user_id: int) -> dict:
    """Return an AI analysis of the user's finances plus structured figures.

    Shape::

        {
          "summary": {... raw figures ...},
          "suggestions": [{"task_id", "title", "estimated_cost", "affordable",
                           "recommendation"} ...],
          "analysis": str,        # the AI's free-text advice
          "model_used": str,
        }
    """
    summary = await _gather(db, user_id)
    prompt = _build_prompt(summary)

    from app.services.ai_service import generate_text

    result = await generate_text(prompt, max_tokens=400, temperature=0.4)

    suggestions = [
        {
            **p,
            "recommendation": (
                "اکنون مقرون‌به‌صرفه است" if p["affordable"]
                else "بهتر است صبر کنید یا بودجه را افزایش دهید"
            ),
        }
        for p in summary["planned_purchases"]
    ]

    return {
        "summary": summary,
        "suggestions": suggestions,
        "analysis": result.get("generated_text", ""),
        "model_used": result.get("model_used", ""),
    }
