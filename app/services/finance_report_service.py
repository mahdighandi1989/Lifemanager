"""Reusable finance aggregation — the single code path behind BOTH the monthly
report route and the periodic analysis job.

Buckets income / expense / net per month PER CURRENCY (never across currencies —
audit #20), grouping expenses by category. Prefers a transaction's OWN
``occurred_on`` / ``currency`` (an ingested receipt carries its own date +
currency) and falls back to the parent account's timestamp / currency. Pure
Python aggregation so SQLite tests and Postgres prod share one path.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


def _account_scope(user_id: int):
    from app.models.finance import FinancialAccount

    if user_id == 0:
        return (FinancialAccount.user_id == 0) | (FinancialAccount.user_id.is_(None))
    return FinancialAccount.user_id == user_id


async def build_report(db: AsyncSession, *, user_id: int = 0, months: int = 6) -> List[Dict[str, Any]]:
    """Return ``[{month, currencies:[{currency, income, expense, net, by_category}]}]``
    newest-last, for the last ``months`` months."""
    from app.models.finance import FinancialAccount, Transaction

    months = max(1, min(int(months), 24))
    now_utc = datetime.now(timezone.utc)
    y, m = now_utc.year, now_utc.month
    total = (y * 12 + (m - 1)) - (months - 1)
    since_year, since_month = total // 12, total % 12 + 1

    accounts = {
        a.id: a
        for a in (await db.execute(select(FinancialAccount).where(_account_scope(user_id)))).scalars().all()
    }
    if not accounts:
        return []
    rows = (
        await db.execute(
            select(Transaction)
            .where(Transaction.account_id.in_(list(accounts.keys())))
            .order_by(Transaction.timestamp.asc())
        )
    ).scalars().all()

    monthly: dict = defaultdict(lambda: defaultdict(lambda: {
        "income": 0.0, "expense": 0.0, "by_category": defaultdict(float),
    }))
    # Synthetic balance-delta rows are bookkeeping, not real movements: the
    # scan writes one whenever a card's total shifts AND the statement's own
    # lines separately — summing both double-counted every month
    # (2026-07-30). New rows are tagged category='_balance_delta'; legacy
    # deltas are recognised by their fixed auto-update description.
    _AUTO_DELTA_DESCRIPTIONS = {
        "به‌روزرسانیِ خودکار از فایل",
        "به‌روزرسانیِ خودکار از ایمیل",
    }
    for t in rows:
        desc = t.description or ""
        if (
            t.category == "_balance_delta"
            or desc in _AUTO_DELTA_DESCRIPTIONS
            or desc.startswith("auto-update from ")
        ):
            continue
        d = t.occurred_on or (t.timestamp.date() if t.timestamp else None)
        if d is None:
            continue
        if (d.year, d.month) < (since_year, since_month):
            continue
        month_key = f"{d.year:04d}-{d.month:02d}"
        currency = (t.currency or accounts[t.account_id].currency or "?").upper()
        cell = monthly[month_key][currency]
        amount = float(t.amount or 0)
        if t.transaction_type == "income":
            cell["income"] += amount
        else:
            cell["expense"] += amount
            cell["by_category"][t.category or "بدون دسته"] += amount

    out: List[Dict[str, Any]] = []
    for month_key in sorted(monthly.keys()):
        currencies = []
        for currency, cell in sorted(monthly[month_key].items()):
            currencies.append({
                "currency": currency,
                "income": round(cell["income"], 2),
                "expense": round(cell["expense"], 2),
                "net": round(cell["income"] - cell["expense"], 2),
                "by_category": [
                    {"category": c, "amount": round(v, 2)}
                    for c, v in sorted(cell["by_category"].items(), key=lambda kv: -kv[1])
                ],
            })
        out.append({"month": month_key, "currencies": currencies})
    return out


def summarize_current_month(report: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Reduce the report to the CURRENT month's per-currency totals + a Persian
    one-liner for the notification. Returns {month, lines:[...], signature}."""
    if not report:
        return {"month": None, "lines": [], "signature": ""}
    latest = report[-1]
    lines: List[str] = []
    sig_parts: List[str] = []
    for c in latest.get("currencies", []):
        net = c["net"]
        verdict = "سود" if net >= 0 else "زیان"
        lines.append(
            f"{c['currency']}: درآمد {c['income']:,.0f}، هزینه {c['expense']:,.0f}، {verdict} {abs(net):,.0f}"
        )
        sig_parts.append(f"{c['currency']}:{c['income']:.0f}:{c['expense']:.0f}")
    return {"month": latest.get("month"), "lines": lines, "signature": "|".join(sig_parts)}
