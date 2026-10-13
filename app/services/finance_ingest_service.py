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


# Chat/utility apps are never a bank, whatever their text says (2026-10-11):
# 318 of 400 «finance» notifications were the owner's TRADING BOT's Telegram
# status reports («موجودی: $860.86»), and they were aimed at a bank card.
_NOT_A_BANK = ("telegram", "whatsapp", "signal", "messenger", "instagram", "clock", "gmail", "outlook")
# A wrapper sender (the SMS app's notification) carries the bank in the text.
_WRAPPERS = ("messages", "sms", "google messages", "samsung messages")
_CREDIT_RE = re.compile(r"(?i)(credit\s*card|کارت\s*اعتباری|combined\s*available|credit\s*limit)")


def _mark_credit_if_needed(account, body: str) -> bool:
    """A MACHINE card whose bank calls it a credit card becomes kind=credit, so
    its number (available credit) leaves every balance total (2026-10-11)."""
    import json as _json

    if account is None or account.kind == "credit" or not _CREDIT_RE.search(body or ""):
        return False
    try:
        extra = _json.loads(account.extra or "{}")
    except Exception:
        extra = {}
    if not (extra.get("inferred") or extra.get("source") in ("email", "sms")):
        return False  # an owner-made card keeps the kind the owner chose
    account.kind = "credit"
    return True


_REF_RE = re.compile(r"(?i)(?:ending(?:\s*with)?|card|account|a/c|xx+|\*{2,})\s*[x*]*\s*(\d{3,4})\b")


def _is_wallet(label) -> bool:
    from app.services.finance_account_identity import is_wallet

    return is_wallet(label)


def bank_of(sender: Optional[str], body: str) -> Optional[str]:
    """The bank a message comes from — or None when it is not a bank at all."""
    who = (sender or "").strip()
    if who.lower() in _NOT_A_BANK:
        return None
    if who.lower() in _WRAPPERS or not who:
        head = re.split(r"\s*[|:\n]\s*", (body or "").strip(), maxsplit=1)[0].strip()
        who = head if 2 <= len(head) <= 40 else ""
    if not who or who.lower() in _NOT_A_BANK or who.isdigit():
        return None
    return who


async def _identity_card(db, *, user_id, institution, body, currency):
    """The card this bank SMS identifies by ACCOUNT NUMBER (2026-10-13, sheet 6):
    «BSIUAE … a/c 4006» is the Bank Saderat card whose IBAN ends in 4006 — not a
    new «BSIUAE ••4006» card. Same bank (alias-aware) + same currency + a unique
    card; never by balance. None ⇒ fall back to the name-based pick."""
    from app.services.finance_account_identity import find_card
    from app.services.inbox_service import scope_filter

    m = _REF_RE.search(body or "")
    if not m or not institution:
        return None
    accounts = (await db.execute(select(FinancialAccount).where(
        scope_filter(FinancialAccount.user_id, user_id)))).scalars().all()
    return find_card(accounts, ref=m.group(1), institution=institution, currency=currency)


async def _create_from_sms(db, *, user_id, institution, body, balance, currency, occurred_iso):
    """A bank seen ONLY by SMS gets its card (2026-10-11). Before, only e-mail
    created cards — banks that never e-mail a statement (Mashreq, BSI, FAB…)
    had their every SMS refused with «no confident account match»."""
    import json as _json

    m = _REF_RE.search(body or "")
    ref = m.group(1) if m else ""
    acc = FinancialAccount(
        user_id=(user_id or None), name=f"{institution} ••{ref}" if ref else institution,
        # Salik/Nol/… are prepaid balances, not banks (owner 2026-10-13)
        kind=("wallet" if _is_wallet(institution) else "credit" if _CREDIT_RE.search(body or "") else "bank"),
        institution=institution.lower(), currency=currency, balance=Decimal(str(balance)),
        extra=_json.dumps({"source": "sms", "inferred": True, "ref": ref,
                           "balance_evidence": f"پیامکِ {institution}",
                           **({"last_message_at": str(occurred_iso)} if occurred_iso else {})},
                          ensure_ascii=False),
    )
    db.add(acc)
    await db.flush()
    return acc


async def _pick_account(
    db: AsyncSession,
    *,
    user_id: int,
    account_id: Optional[int],
    sender_hint: Optional[str] = None,
    strict: bool = False,
) -> Optional[FinancialAccount]:
    """Resolve WHICH account a bank message belongs to.

    2026-07-20 audit #6: the old ``.first()`` grabbed an arbitrary account
    and overwrote its balance. Now: explicit account_id wins; else try to
    match the sender/bank hint against account name/institution; else fall
    back to ``.first()`` ONLY when the user has exactly one account —
    with several accounts and no confident match we refuse (None) rather
    than corrupt the wrong balance.
    """
    # NULL-owner rows are the ones the email auto-feed mints (it stores
    # user_id=None for the anon scope), so a bare ``user_id == uid`` made every
    # machine-created card invisible to the SMS path — every bank SMS was
    # silently refused with «no confident account match» (2026-07-31 audit).
    # Same NULL-aware helper every other reader of this table uses.
    from app.services.inbox_service import scope_filter

    stmt = select(FinancialAccount).where(scope_filter(FinancialAccount.user_id, user_id))
    if account_id is not None:
        stmt = stmt.where(FinancialAccount.id == account_id)
        return (await db.execute(stmt)).scalars().first()
    accounts = (await db.execute(stmt)).scalars().all()
    if not accounts:
        return None
    if sender_hint:
        hint = sender_hint.lower()
        # Generic banking words match every message («بانک», "bank"…), so an
        # account NAMED with one would grab every alert (2026-07-30) — the
        # stop-list guards the account's own fields too, not just the tokens.
        _STOP = {"bank", "بانک", "account", "حساب", "card", "کارت",
                 "balance", "موجودی", "aed", "usd", "irr", "the", "your"}
        for acc in accounts:
            for field in (acc.institution, acc.name):
                if (
                    field and len(field) >= 3
                    and field.lower() not in _STOP
                    and field.lower() in hint
                ):
                    return acc
        # Token overlap — but only DISTINCTIVE tokens: stop-worded, and a
        # match only counts if EXACTLY ONE account contains the token. Bare
        # digit runs shorter than 4 are reference-number noise, not an
        # account identity — they matched the wrong card (2026-07-30).
        tokens = [
            t for t in re.split(r"[^a-z0-9؀-ۿ]+", hint)
            if len(t) >= 3 and t not in _STOP and not (t.isdigit() and len(t) < 4)
        ]
        for t in tokens:
            matched = [
                acc for acc in accounts
                if t in f"{acc.institution or ''} {acc.name or ''}".lower()
            ]
            if len(matched) == 1:
                return matched[0]
    # «the only card» is a guess — never for a message whose bank we KNOW: an
    # SMS from Rakbank landed on the lone BSI card (2026-10-11). With strict,
    # an unmatched bank gets its own card instead (`_create_from_sms`).
    if len(accounts) == 1 and not strict:
        return accounts[0]
    return None


async def explain_bank_message(
    db: AsyncSession,
    *,
    user_id: int,
    channel: str,
    body: str,
    sender: Optional[str] = None,
    occurred_iso: Optional[str] = None,
) -> dict:
    """DRY RUN of :func:`apply_bank_message` — the same checks in the same order,
    and NOTHING written. For the supervisor's read-only finance audit: why did
    this SMS/email move (or not move) a balance? (2026-10-11, sheet 2.)"""
    import hashlib as _hashlib
    import json as _json

    if channel == "sms":
        from app.services.sms_listener_service import parse_sms

        parsed = parse_sms(body)
    else:
        from app.services.email_parser_service import parse_balance

        parsed = parse_balance(body)
    out = {"parsed_balance": getattr(parsed, "balance", None),
           "parsed_currency": getattr(parsed, "currency", None),
           "raw_match": getattr(parsed, "raw_match", None)}
    if out["parsed_balance"] is None:
        return {**out, "would_apply": False, "reason": "no balance in text"}
    institution = bank_of(sender, body) if channel == "sms" else (sender or "")
    if channel == "sms" and institution is None:
        return {**out, "would_apply": False, "reason": "not a bank (chat/utility app)"}
    msg_ref = "msg:" + _hashlib.sha1(f"{channel}|{sender or ''}|{body}".encode("utf-8")).hexdigest()[:20]
    seen = (await db.execute(select(Transaction).where(Transaction.source_ref == msg_ref))).scalars().first()
    account = None
    if channel == "sms" and institution:
        account = await _identity_card(db, user_id=user_id, institution=institution, body=body,
                                       currency=out["parsed_currency"])
    if account is None:
        account = await _pick_account(db, user_id=user_id, account_id=None,
                                      sender_hint=f"{sender or ''} {body[:300]}",
                                      strict=(channel == "sms" and bool(institution)))
    if account is not None:
        out.update(account_id=account.id, account_name=account.name, account_currency=account.currency,
                   account_balance=float(account.balance or 0))
    if seen is not None:
        return {**out, "would_apply": False, "reason": "already applied (duplicate message)",
                "applied_to_account_id": seen.account_id}
    if account is None:
        if channel == "sms" and institution and out["parsed_currency"] and out["parsed_balance"] > 0:
            return {**out, "would_apply": True, "reason": "", "would_create": institution}
        return {**out, "would_apply": False, "reason": "no confident account match"}
    try:
        extra = _json.loads(account.extra or "{}")
    except Exception:
        extra = {}
    cur = out["parsed_currency"]
    if cur and account.currency and cur.upper() != str(account.currency).upper():
        machine = (extra.get("source") == "email" or extra.get("inferred")) and not extra.get("owner_balance_at")
        if not machine:
            return {**out, "would_apply": False, "reason": f"currency mismatch ({cur} ≠ {account.currency})"}
        out["would_relabel"] = f"{account.currency} → {cur}"
    last_at = extra.get("last_message_at")
    if occurred_iso and last_at and str(occurred_iso) < str(last_at):
        return {**out, "would_apply": False, "reason": "older than the last applied message"}
    owner_at = extra.get("owner_balance_at")
    if owner_at and (not occurred_iso or str(occurred_iso) <= str(owner_at)):
        return {**out, "would_apply": False, "reason": "owner-pinned balance is newer"}
    if Decimal(str(out["parsed_balance"])) <= 0:
        return {**out, "would_apply": False, "reason": "non-positive balance refused"}
    return {**out, "would_apply": True, "reason": ""}


async def apply_bank_message(
    db: AsyncSession,
    *,
    user_id: int,
    channel: str,
    body: str,
    account_id: Optional[int] = None,
    sender: Optional[str] = None,
    occurred_iso: Optional[str] = None,
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
    institution = bank_of(sender, body) if channel == "sms" else (sender or "")
    if channel == "sms" and institution is None:
        return {"matched": False, "balances_updated": 0, "reason": "not a bank (chat/utility app)"}

    # Idempotency (2026-07-30): an IMAP redelivery / re-POST of the SAME
    # message used to add a phantom income/expense row forever. The message's
    # content hash is its identity; a seen hash is a clean no-op.
    import hashlib as _hashlib

    msg_ref = "msg:" + _hashlib.sha1(
        f"{channel}|{sender or ''}|{body}".encode("utf-8")
    ).hexdigest()[:20]
    already = (
        await db.execute(select(Transaction).where(Transaction.source_ref == msg_ref))
    ).scalars().first()
    if already is not None:
        return {"matched": True, "balances_updated": 0, "reason": "duplicate message"}

    account = None
    if account_id is None and channel == "sms" and institution:
        account = await _identity_card(db, user_id=user_id, institution=institution, body=body,
                                       currency=getattr(parsed, "currency", None))
    if account is None:
        account = await _pick_account(
            db, user_id=user_id, account_id=account_id,
            sender_hint=f"{sender or ''} {body[:300]}",
            strict=(channel == "sms" and bool(institution)),
        )
    if account is None:
        cur = getattr(parsed, "currency", None)
        if channel == "sms" and institution and cur and Decimal(str(new_balance)) > 0:
            acc = await _create_from_sms(db, user_id=user_id, institution=institution, body=body,
                                         balance=new_balance, currency=cur, occurred_iso=occurred_iso)
            db.add(Transaction(account_id=acc.id, amount=Decimal(0), transaction_type="income",
                               description="card opened from sms", currency=cur, source="message",
                               source_ref=msg_ref, category="_balance_delta"))
            await db.commit()
            return {"matched": True, "balances_updated": 1, "account_id": acc.id, "created": True,
                    "balance": float(new_balance), "delta": 0.0}
        return {"matched": True, "balances_updated": 0, "reason": "no confident account match"}

    _mark_credit_if_needed(account, body)

    import json as _json

    try:
        extra = _json.loads(account.extra or "{}")
    except Exception:
        extra = {}

    # A figure in another currency is another measure — never write it onto
    # this card, and never relabel the card without converting (2026-07-30).
    # EXCEPT (2026-10-11, owner): a card the MACHINE guessed (from an e-mail
    # snippet, never typed by the owner) whose bank now sends a full balance in
    # a stated currency — the bank's own SMS is the truth for both the number
    # and the currency, so the card takes both (it is a replacement, not a
    # conversion). A Rial account wrongly opened as dollars used to reject every
    # Rial SMS forever and keep showing millions of «USD».
    msg_currency = getattr(parsed, "currency", None)
    relabel = None
    if msg_currency and account.currency and msg_currency.upper() != str(account.currency).upper():
        machine_guess = (extra.get("source") == "email" or extra.get("inferred")) and not extra.get("owner_balance_at")
        if not machine_guess:
            return {
                "matched": True, "balances_updated": 0,
                "reason": f"currency mismatch ({msg_currency} ≠ {account.currency})",
            }
        relabel = (str(account.currency), msg_currency.upper())

    # NEWEST BALANCE WINS (2026-10-11, owner): every bank SMS carries the full
    # balance, so the last message decides — but a phone that re-sends a batch
    # out of order must not let an older SMS overwrite a newer balance.
    last_at = extra.get("last_message_at")
    if occurred_iso and last_at and str(occurred_iso) < str(last_at):
        return {"matched": True, "balances_updated": 0, "reason": "older than the last applied message"}

    new = Decimal(str(new_balance))

    # اولویتِ حرفِ مالک (۲۰۲۶-۰۷-۳۱): همان قاعده‌ای که مسیرِ ایمیل دارد و اینجا
    # نداشت — موجودی‌ای که خودِ مالک وارد کرده (یا با پاسخ به پرسشِ رفعِ ابهام
    # تثبیت شده) حقیقتِ نهایی است؛ فقط سیگنالی با تاریخِ **جدیدتر** می‌تواند
    # حرکتش دهد. بدون این، یک پیامکِ قدیمی عددِ دستیِ مالک را پاک می‌کرد و
    # برچسبِ «تنظیم دستی مالک» هم سرِ جایش می‌ماند، یعنی برچسب دروغ می‌گفت.
    owner_at = extra.get("owner_balance_at")
    if owner_at and (not occurred_iso or str(occurred_iso) <= str(owner_at)):
        return {
            "matched": True, "balances_updated": 0,
            "reason": "owner-pinned balance is newer",
        }
    # کارت با موجودیِ صفر/منفی باز نمی‌شود و حرکت هم نمی‌کند — عددِ منفیِ
    # یک صورت‌حسابِ کارگزاری «موجودی» نیست (همان قاعدهٔ مسیرِ ایمیل).
    if new <= 0:
        return {"matched": True, "balances_updated": 0, "reason": "non-positive balance refused"}

    old = Decimal(str(account.balance or 0))
    delta = new - old
    account.balance = new
    if relabel:
        # a different unit: the old number is not comparable — no delta row
        account.currency = relabel[1]
        extra["currency_corrected"] = f"{relabel[0]} → {relabel[1]} (پیامِ بانک)"
        delta = Decimal(0)
    if msg_currency and not account.currency:
        account.currency = msg_currency
    # برچسبِ منشأ باید با واقعیت بخواند، وگرنه عددِ ماشینی «دستیِ مالک» دیده می‌شود.
    extra["balance_evidence"] = f"پیام {channel}" + (f" از {sender}" if sender else "")
    if occurred_iso:
        extra["last_message_at"] = str(occurred_iso)
    account.extra = _json.dumps(extra, ensure_ascii=False)

    # Record the movement so the change is auditable, not silent — deduped on
    # the message hash, marked synthetic so reports don't double-count it.
    db.add(
        Transaction(
            account_id=account.id,
            amount=abs(delta),
            transaction_type="income" if delta >= 0 else "expense",
            description=f"auto-update from {channel}",
            currency=account.currency,
            source="message",
            source_ref=msg_ref,
            category="_balance_delta",
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



async def replay_recent_sms(db: AsyncSession, *, days: int = 60, limit: int = 2000) -> dict:
    """Apply every finance SMS/notification of the last ``days`` that has not
    been applied yet, OLDEST FIRST — so the newest balance ends on each card.
    Idempotent (message hash) and order-safe («older than the last applied»).
    Bank SMS that arrived before the 2026-10-11 fixes were dropped for good;
    this gives them their effect without the owner pressing anything."""
    from datetime import datetime, timedelta, timezone

    from app.models.activity_log import ActivityLog

    since = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (await db.execute(
        select(ActivityLog).where(ActivityLog.action.in_(("mobile_sms", "mobile_notification")),
                                  ActivityLog.created_at >= since)
        .order_by(ActivityLog.id.desc()).limit(limit))).scalars().all()
    applied = created = 0
    for lg in reversed(rows):
        d = lg.detail or ""
        if not d.startswith("[finance"):
            continue
        body = d.split("] ", 1)[1] if "] " in d else d
        if body.startswith("(") and ") " in body:
            body = body.split(") ", 1)[1]
        sender = (lg.entity_label or "").split(" · ")[-1]
        when = getattr(lg, "occurred_at", None) or lg.created_at
        if _CREDIT_RE.search(body) and bank_of(sender, body):
            acc = await _pick_account(db, user_id=int(lg.user_id or 0), account_id=None,
                                      sender_hint=f"{sender} {body[:300]}", strict=True)
            if _mark_credit_if_needed(acc, body):
                await db.commit()
        try:
            res = await apply_bank_message(db, user_id=int(lg.user_id or 0), channel="sms", body=body,
                                           sender=sender, occurred_iso=when.isoformat() if when else None)
        except Exception:  # noqa: BLE001 — one bad row must not stop the rest
            await db.rollback()
            continue
        applied += int(res.get("balances_updated") or 0)
        created += int(bool(res.get("created")))
    return {"scanned": len(rows), "applied": applied, "cards_created": created}
