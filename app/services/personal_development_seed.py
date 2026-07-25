"""Seed the owner's personal-development Excel archive into the live system.

Content source: app/services/_personal_development_seed_data.py — GENERATED
from the 7-sheet workbook by scripts/generate_pd_seed.py with a machine-checked
completeness gate (every non-empty cell consumed). Two destinations:

  • PD_LISTS  → TodoList + TodoItem rows («توسعه فردی - …» lists: اهداف،
    عادت‌ها، مبارزه با هوای نفس، طرح‌های برنامه‌ریزی، نکات مدیریت زمان، ابزارها…)
  • PD_TRANSACTIONS → the finance section: one archive FinancialAccount
    («هزینه‌های نقدی — آرشیو اکسل», AED) + a Transaction per expense row.

Idempotent the same way the self-improvement seed is: a list that already
exists WITH items is skipped; the finance account is created once. Safe to run
every boot (Render free tier) — repeats are no-ops.
"""
from __future__ import annotations

import json
import logging
from datetime import date, datetime, timezone

from sqlalchemy import func, insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.finance import FinancialAccount, Transaction
from app.models.todo_item import TodoItem
from app.models.todo_list import TodoList, todo_list_items
from app.services._personal_development_seed_data import (
    PD_ACCOUNT_CURRENCY,
    PD_ACCOUNT_NAME,
    PD_LISTS,
    PD_TRANSACTIONS,
)

logger = logging.getLogger(__name__)


async def _seed_lists(db: AsyncSession) -> dict:
    lists_added = 0
    items_added = 0
    for spec in PD_LISTS:
        existing = (await db.execute(
            select(TodoList).where(TodoList.name == spec["name"])
        )).scalars().first()
        if existing is not None:
            n_items = (await db.execute(
                select(func.count()).select_from(todo_list_items).where(
                    todo_list_items.c.todo_list_id == existing.id
                )
            )).scalar() or 0
            if n_items:
                continue  # already seeded (or user-populated) — leave untouched
            lst = existing
        else:
            lst = TodoList(name=spec["name"], description=spec.get("description") or None)
            db.add(lst)
            await db.flush()
            lists_added += 1
        for position, item in enumerate(spec["items"]):
            row = TodoItem(
                content=item["content"],
                description=item.get("description") or None,
                type="task",
            )
            db.add(row)
            await db.flush()
            await db.execute(insert(todo_list_items).values(
                todo_list_id=lst.id, todo_item_id=row.id, position=position
            ))
            items_added += 1
    return {"lists_added": lists_added, "items_added": items_added}


def _archive_extra() -> str:
    """This card is HISTORY, not a live account (owner, 2026-07-25: «اون فایل
    اکسل برای زمانی بود که من این سیستم رو نداشتم»). The rows stay — they are
    his real 2024 spending — but the card is flagged so «مالی» files it under
    «آرشیو» instead of showing a 0.00 account above the live ones."""
    return json.dumps(
        {"archived": True, "source": "excel_archive", "inferred": False},
        ensure_ascii=False,
    )


async def _seed_finance(db: AsyncSession) -> dict:
    existing = (await db.execute(
        select(FinancialAccount).where(FinancialAccount.name == PD_ACCOUNT_NAME)
    )).scalars().first()
    if existing is not None:
        # Idempotent back-fill for a card seeded before the flag existed.
        try:
            extra = json.loads(existing.extra) if existing.extra else {}
        except Exception:
            extra = {}
        if not extra.get("archived"):
            extra.update({"archived": True, "source": "excel_archive"})
            existing.extra = json.dumps(extra, ensure_ascii=False)
            return {"account_added": 0, "transactions_added": 0, "archived_marked": 1}
        return {"account_added": 0, "transactions_added": 0}

    account = FinancialAccount(
        name=PD_ACCOUNT_NAME, kind="bank", institution="آرشیو اکسل توسعه فردی",
        currency=PD_ACCOUNT_CURRENCY, balance=0, extra=_archive_extra(),
    )
    db.add(account)
    await db.flush()
    for tx in PD_TRANSACTIONS:
        d = date.fromisoformat(tx["date"])
        db.add(Transaction(
            account_id=account.id,
            amount=tx["amount"],
            transaction_type="expense",
            description=tx["description"][:255],
            timestamp=datetime(d.year, d.month, d.day, tzinfo=timezone.utc),
        ))
    return {"account_added": 1, "transactions_added": len(PD_TRANSACTIONS)}


async def ensure_personal_development_seeded(db: AsyncSession) -> dict:
    """Seed lists + finance archive; commit once. Returns counts (all zeros on
    an already-seeded database)."""
    result = await _seed_lists(db)
    result.update(await _seed_finance(db))
    await db.commit()
    if any(result.values()):
        logger.info("personal-development seed: %s", result)
    return result
