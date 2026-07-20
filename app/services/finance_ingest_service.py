"""Apply an incoming bank/exchange message to the user's balances.

Audit task 4ae4b3ca: the raw memo wanted bank/exchange email + SMS to be parsed
and the balances updated automatically "تا نیاز نباشه دستی وارد بکنم". The
parsers existed but nothing applied their output. This service is the apply-half
— it runs the right parser, updates the matching FinancialAccount balance,
records a Transaction for the delta, and fires the affordable-tasks reminder.

It's reachable two ways: the POST /api/finance/ingest-message webhook (an
operator's IMAP poller / SMS gateway forwards messages here) and the
process_finance_updates Celery task. Live mailbox/SMS credentials are the only
external piece (see TO-DO/) — the parse→apply path itself is fully in-repo.
"""
from __future__ import annotations

import re
from decimal import Decimal
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.finance import FinancialAccount, Transaction


async def _pick_account(
    db: AsyncSession,
    *,
    user_id: int,
    account_id: Optional[int],
    sender_hint: Optional[str] = None,
) -> Optional[FinancialAccount]:
    """Resolve WHICH account a bank message belongs to.

    2026-07-20 audit #6: the old ``.first()`` grabbed an arbitrary account
    and overwrote its balance. Now: explicit account_id wins; else try to
    match the sender/bank hint against account name/institution; else fall
    back to ``.first()`` ONLY when the user has exactly one account —
    with several accounts and no confident match we refuse (None) rather
    than corrupt the wrong balance.
    """
    stmt = select(FinancialAccount).where(FinancialAccount.user_id == user_id)
    if account_id is not None:
        stmt = stmt.where(FinancialAccount.id == account_id)
        return (await db.execute(stmt)).scalars().first()
    accounts = (await db.execute(stmt)).scalars().all()
    if not accounts:
        return None
    if sender_hint:
        hint = sender_hint.lower()
        for acc in accounts:
            for field in (acc.institution, acc.name):
                if field and len(field) >= 3 and field.lower() in hint:
                    return acc
        # try token overlap the other way (hint token appears in the field)
        tokens = [t for t in re.split(r"[^a-z0-9؀-ۿ]+", hint) if len(t) >= 3]
        for acc in accounts:
            joined = f"{acc.institution or ''} {acc.name or ''}".lower()
            for t in tokens:
                if t in joined:
                    return acc
    if len(accounts) == 1:
        return accounts[0]
    return None


async def apply_bank_message(
    db: AsyncSession,
    *,
    user_id: int,
    channel: str,
    body: str,
    account_id: Optional[int] = None,
    sender: Optional[str] = None,
) -> dict:
    """Parse ``body`` (channel ``email``|``sms``), update the matching account's
    balance, record the delta as a Transaction, and trigger the affordable-tasks
    reminder. Returns a summary dict. No match / no account → a benign no-op."""
    if channel == "sms":
        from app.services.sms_listener_service import parse_sms

        parsed = parse_sms(body)
    else:
        from app.services.email_parser_service import parse_balance

        parsed = parse_balance(body)

    new_balance = getattr(parsed, "balance", None)
    if new_balance is None:
        return {"matched": False, "balances_updated": 0}

    account = await _pick_account(
        db, user_id=user_id, account_id=account_id,
        sender_hint=f"{sender or ''} {body[:300]}",
    )
    if account is None:
        return {"matched": True, "balances_updated": 0, "reason": "no confident account match"}

    old = Decimal(str(account.balance or 0))
    new = Decimal(str(new_balance))
    delta = new - old
    account.balance = new
    if getattr(parsed, "currency", None):
        account.currency = parsed.currency or account.currency

    # Record the movement so the change is auditable, not silent.
    db.add(
        Transaction(
            account_id=account.id,
            amount=abs(delta),
            transaction_type="income" if delta >= 0 else "expense",
            description=f"auto-update from {channel}",
        )
    )
    await db.commit()

    # Reminder loop: a balance change may newly afford a planned purchase.
    affordable: list = []
    try:
        from app.services.budget_notification_service import notify_affordable_tasks

        affordable = await notify_affordable_tasks(db, user_id)
    except Exception:
        affordable = []

    return {
        "matched": True,
        "balances_updated": 1,
        "account_id": account.id,
        "balance": float(new),
        "delta": float(delta),
        "affordable_task_ids": affordable,
    }
