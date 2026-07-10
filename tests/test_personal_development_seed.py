"""Personal-development Excel archive seed — completeness + idempotency.

The seed data module is GENERATED from the owner's 7-sheet workbook with a
machine-checked full-coverage gate; these tests pin the expected totals so a
regressed regeneration (fewer lists/items/transactions) fails loudly, and prove
the runtime seeder writes everything once and only once.
"""
from __future__ import annotations

import pytest
from sqlalchemy import func, select

from app.services import _personal_development_seed_data as pd
from app.services.personal_development_seed import ensure_personal_development_seeded


def test_seed_data_totals_are_pinned():
    # Pinned from the generation run over the owner's workbook. If the file is
    # regenerated these MUST be updated deliberately — never silently shrink.
    assert pd.PD_EXPECTED_LIST_COUNT == 22 == len(pd.PD_LISTS)
    assert pd.PD_EXPECTED_ITEM_COUNT == 820 == sum(len(x["items"]) for x in pd.PD_LISTS)
    assert pd.PD_EXPECTED_TX_COUNT == 194 == len(pd.PD_TRANSACTIONS)


def test_seed_data_integrity():
    names = [x["name"] for x in pd.PD_LISTS]
    assert len(names) == len(set(names))                      # unique list names
    assert all(n.startswith("توسعه فردی - ") for n in names)  # grouped prefix
    assert all(i["content"].strip() for x in pd.PD_LISTS for i in x["items"])
    assert all(t["amount"] > 0 and t["date"] for t in pd.PD_TRANSACTIONS)
    # spot-check known content survived verbatim
    goals = next(x for x in pd.PD_LISTS if "اهداف و آرزوها" in x["name"])
    assert any("راز زمان" in i["content"] for i in goals["items"])
    habits = next(x for x in pd.PD_LISTS if "عادت‌های روزانه" in x["name"])
    assert len(habits["items"]) == 86


@pytest.mark.asyncio
async def test_seeder_writes_everything_once(db_session):
    from app.models.finance import FinancialAccount, Transaction
    from app.models.todo_item import TodoItem
    from app.models.todo_list import TodoList

    r1 = await ensure_personal_development_seeded(db_session)
    assert r1["lists_added"] == pd.PD_EXPECTED_LIST_COUNT
    assert r1["items_added"] == pd.PD_EXPECTED_ITEM_COUNT
    assert r1["account_added"] == 1
    assert r1["transactions_added"] == pd.PD_EXPECTED_TX_COUNT

    n_lists = (await db_session.execute(select(func.count(TodoList.id)))).scalar()
    n_items = (await db_session.execute(select(func.count(TodoItem.id)))).scalar()
    n_tx = (await db_session.execute(select(func.count(Transaction.id)))).scalar()
    assert n_lists == pd.PD_EXPECTED_LIST_COUNT
    assert n_items == pd.PD_EXPECTED_ITEM_COUNT
    assert n_tx == pd.PD_EXPECTED_TX_COUNT
    account = (await db_session.execute(select(FinancialAccount))).scalars().one()
    assert account.currency == "AED"

    # second run: pure no-op (idempotent)
    r2 = await ensure_personal_development_seeded(db_session)
    assert all(v == 0 for v in r2.values())
    assert (await db_session.execute(select(func.count(TodoItem.id)))).scalar() == n_items


@pytest.mark.asyncio
async def test_seeded_items_preserve_order_and_long_text(db_session):
    from app.models.todo_item import TodoItem
    from app.models.todo_list import TodoList, todo_list_items

    await ensure_personal_development_seeded(db_session)
    tools = (await db_session.execute(
        select(TodoList).where(TodoList.name.like("%ابزارهای هوش مصنوعی%"))
    )).scalars().one()
    rows = (await db_session.execute(
        select(TodoItem.content, TodoItem.description, todo_list_items.c.position)
        .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
        .where(todo_list_items.c.todo_list_id == tools.id)
        .order_by(todo_list_items.c.position)
    )).all()
    assert [r[2] for r in rows] == list(range(len(rows)))     # positions intact
    heur = next(r for r in rows if r[0].startswith("Heuristica"))
    assert len(heur[1]) > 3000                                # long review not truncated
