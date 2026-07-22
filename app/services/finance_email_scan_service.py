"""مالیِ خودتغذیه — turn the synced Gmail into live financial accounts.

Owner's ask (2026-07-22): «صفحهٔ مالی خودش از ایمیل‌ها حساب‌ها و موجودی و
صورتحساب‌ها و شماره‌ها رو شناسایی کنه، با هر ایمیلِ تازه به‌روز کنه، و برای هر
کیف یک کارت بسازه.» The pieces existed but nothing joined them: a balance
parser (``email_parser_service``) and an apply-to-EXISTING-account path
(``finance_ingest_service``), but no one read the mirrored ``personal_emails``
and NOBODY ever created a card for a newly-seen account.

This service is that missing join. It is:
  * **Deterministic + keyless** — regex extraction over ``subject + snippet``
    (Gmail bodies aren't stored at rest, so we work with what we have).
  * **Conservative** — a card is only CREATED when we have both an institution
    and a real signal (a balance or an account reference). No blind rows.
  * **Idempotent** — accounts are keyed by (institution, account-ref) so a
    re-scan UPDATES instead of duplicating; a per-email delta transaction is
    deduped by ``source_ref = email.id``.
  * **Owner-correctable** — created cards carry ``extra.source='email'`` +
    ``inferred=true`` so the UI shows «از ایمیل — بررسی کن»; the owner edits or
    deletes exactly like a manual account. Never a silent source of truth.
"""
from __future__ import annotations

import json
import logging
import re
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, List, Optional

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.finance import FinancialAccount, Transaction
from app.services.email_parser_service import parse_balance

logger = logging.getLogger(__name__)

# A message is worth looking at when it smells financial. The balance/ref
# extraction is the real gate — this just avoids parsing every newsletter.
_FIN_HINT = re.compile(
    r"(bank|بانک|broker|بروکر|forex|فارکس|exchange|صراف|balance|موجودی|بالانس|"
    r"statement|صورت\s*حساب|transaction|تراکنش|deposit|واریز|withdraw|برداشت|"
    r"iban|account|حساب|card|کارت|payment|پرداخت|invoice|فاکتور|wallet|کیف\s*پول|"
    r"neteller|paypal|wise|revolut|salary|حقوق|رسید|receipt)",
    re.I,
)
_BROKER_HINT = re.compile(r"(broker|بروکر|forex|فارکس|margin|mt4|mt5|trading|xm|exness|fbs)", re.I)
_EXCHANGE_HINT = re.compile(r"(exchange|صراف|crypto|صرافی|binance|coinbase|kraken)", re.I)

_IBAN = re.compile(r"\b([A-Z]{2}\d{2}[A-Z0-9]{11,30})\b")
_ACCT = re.compile(
    r"(?:a/?c|acct|account|حساب|card|کارت)\s*(?:no\.?|number|شماره|:|#|ending(?:\s*in)?|منتهی\s*به)?\s*"
    r"([*xX••\d][*xX••\d\- ]{2,18}\d)",
    re.I,
)
_LAST4 = re.compile(r"(?:ending(?:\s*in)?|منتهی\s*به|last\s*4|چهار\s*رقم)\D{0,4}(\d{3,4})", re.I)

# Automated no-reply / marketing senders are still fine here (a bank alert IS a
# no-reply), so we do NOT reuse the person filter — we WANT the machine mail.
_TLD = re.compile(r"\.(com|net|org|co|ae|ir|io|me|info|uk|de)(\.[a-z]{2})?$", re.I)


def _addr_domain(from_addr: Optional[str]) -> Optional[str]:
    m = re.search(r"@([A-Za-z0-9.\-]+)", from_addr or "")
    if not m:
        return None
    return m.group(1).lower()


def _institution(from_addr: Optional[str], subject: Optional[str]) -> Optional[str]:
    """A short, stable institution label from the sender domain (its most
    distinctive segment), else None."""
    dom = _addr_domain(from_addr)
    if not dom:
        return None
    dom = _TLD.sub("", dom)
    parts = [p for p in dom.split(".") if p and p not in ("mail", "email", "e", "notifications", "alerts", "no-reply", "noreply", "info")]
    if not parts:
        return None
    # the last remaining segment is usually the brand (mbankuae, bsi, xm…)
    label = max(parts, key=len)
    return label[:60]


def _account_ref(text: str) -> Optional[str]:
    """A stable reference for the account: IBAN → last-4 → masked acct string."""
    m = _IBAN.search(text)
    if m:
        return m.group(1).upper()
    m = _LAST4.search(text)
    if m:
        return f"••{m.group(1)}"
    m = _ACCT.search(text)
    if m:
        ref = re.sub(r"\s+", "", m.group(1))
        digits = re.sub(r"\D", "", ref)
        if len(digits) >= 3:
            return f"••{digits[-4:]}" if len(digits) >= 4 else ref[:20]
    return None


def _kind(text: str) -> str:
    if _BROKER_HINT.search(text):
        return "broker"
    if _EXCHANGE_HINT.search(text):
        return "exchange"
    return "bank"


def _extra(acc: FinancialAccount) -> Dict[str, Any]:
    try:
        return json.loads(acc.extra or "{}")
    except Exception:
        return {}


def _scope(col, uid: int):
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


async def _match_account(
    db: AsyncSession, uid: int, institution: Optional[str], ref: Optional[str]
) -> Optional[FinancialAccount]:
    """Find the account this email belongs to — by stored account-ref first
    (exact, the strongest key), then by institution name/label."""
    accounts = (
        await db.execute(select(FinancialAccount).where(_scope(FinancialAccount.user_id, uid)))
    ).scalars().all()
    if ref:
        for a in accounts:
            if _extra(a).get("account_ref") == ref:
                return a
    if institution:
        inst = institution.lower()
        for a in accounts:
            blob = f"{a.institution or ''} {a.name or ''}".lower()
            if inst and inst in blob:
                return a
    return None


def _to_decimal(value: Any) -> Optional[Decimal]:
    if value is None:
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        return None


async def scan_finance_emails(db: AsyncSession, uid: int = 0) -> Dict[str, Any]:
    """Read the synced Gmail, create/update a card per detected account, and
    record per-email balance deltas. Returns a summary. Never raises on a bad
    row — one weird email must not abort the whole scan."""
    try:
        from app.models.personal_sync import PersonalEmail
    except Exception:
        return {"scanned": 0, "financial": 0, "created": 0, "updated": 0}

    emails = (
        await db.execute(
            select(PersonalEmail).order_by(PersonalEmail.received_at.asc().nullsfirst())
        )
    ).scalars().all()

    created = updated = financial = 0
    for e in emails:
        try:
            text = f"{e.subject or ''}\n{e.snippet or ''}".strip()
            if not text:
                continue
            if not _FIN_HINT.search(text) and (e.ai_category or "") != "receipt":
                continue
            financial += 1

            parsed = parse_balance(text)
            balance = _to_decimal(getattr(parsed, "balance", None))
            currency = getattr(parsed, "currency", None)
            institution = _institution(e.from_addr, e.subject)
            ref = _account_ref(text)

            # A card needs a name (institution) AND a real signal (balance or ref).
            if institution is None or (balance is None and ref is None):
                continue

            acc = await _match_account(db, uid, institution, ref)
            recv_iso = e.received_at.isoformat() if e.received_at else None

            if acc is None:
                extra = {
                    "source": "email", "inferred": True,
                    "account_ref": ref, "last_email_id": e.id, "last_email_at": recv_iso,
                }
                iban = _IBAN.search(text)
                if iban:
                    extra["iban"] = iban.group(1).upper()
                name = institution if not ref else f"{institution} {ref}"
                acc = FinancialAccount(
                    user_id=None if uid == 0 else uid,
                    name=name[:255], kind=_kind(text),
                    institution=institution, currency=(currency or "USD"),
                    balance=(balance if balance is not None else Decimal(0)),
                    extra=json.dumps(extra, ensure_ascii=False),
                )
                db.add(acc)
                await db.flush()
                created += 1
                if balance is not None:
                    _record_txn(db, acc, Decimal(0), balance, e.id, recv_iso, currency)
            else:
                extra = _extra(acc)
                last_at = extra.get("last_email_at")
                # only a NEWER email may move the balance (avoid an old mail
                # clobbering a fresher one on re-scan)
                is_newer = recv_iso is None or last_at is None or recv_iso >= last_at
                if balance is not None and is_newer:
                    old = _to_decimal(acc.balance) or Decimal(0)
                    if _record_txn(db, acc, old, balance, e.id, recv_iso, currency):
                        acc.balance = balance
                        if currency:
                            acc.currency = currency
                        # re-read: _record_txn just wrote applied_emails into
                        # acc.extra — reload so we don't clobber it below.
                        extra = _extra(acc)
                        extra.update({"source": extra.get("source", "email"),
                                      "last_email_id": e.id, "last_email_at": recv_iso})
                        if ref and not extra.get("account_ref"):
                            extra["account_ref"] = ref
                        acc.extra = json.dumps(extra, ensure_ascii=False)
                        updated += 1
        except Exception as exc:  # one bad email never aborts the scan
            logger.debug("finance email scan skipped a row: %r", exc)
            continue

    await db.commit()
    return {"scanned": len(emails), "financial": financial, "created": created, "updated": updated}


def _record_txn(
    db: AsyncSession, acc: FinancialAccount, old: Decimal, new: Decimal,
    email_id: str, occurred_iso: Optional[str], currency: Optional[str],
) -> bool:
    """Record the balance delta as a Transaction, idempotent on the email id.
    Returns False when this email was already applied (so the caller skips the
    balance write too)."""
    from datetime import date as _date

    source_ref = f"email:{email_id}"
    # dedup: a synchronous existence check via the identity map is unreliable
    # mid-flush, so we tag the account's extra with applied ids as a backstop.
    extra = _extra(acc)
    applied = set(extra.get("applied_emails") or [])
    if email_id in applied:
        return False
    delta = new - old
    txn = Transaction(
        account_id=acc.id,
        amount=abs(delta),
        transaction_type=("income" if delta >= 0 else "expense"),
        description="به‌روزرسانیِ خودکار از ایمیل",
        currency=(currency or acc.currency),
        source="email",
        source_ref=source_ref,
    )
    try:
        d = _date.fromisoformat(occurred_iso[:10]) if occurred_iso else None
        if d:
            txn.occurred_on = d
    except Exception:
        pass
    db.add(txn)
    applied.add(email_id)
    # keep the applied set bounded
    extra["applied_emails"] = list(applied)[-200:]
    acc.extra = json.dumps(extra, ensure_ascii=False)
    return True


def account_public_extra(acc: FinancialAccount) -> Dict[str, Any]:
    """The safe, display-only slice of ``extra`` for the wire (no applied-ids)."""
    e = _extra(acc)
    return {
        "source": e.get("source"),           # None for a manual account
        "inferred": e.get("inferred"),        # None for manual, True for email
        "account_ref": e.get("account_ref"),
        "iban": e.get("iban"),
        "last_email_at": e.get("last_email_at"),
    }
