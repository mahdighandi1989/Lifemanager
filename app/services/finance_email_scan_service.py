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

# ── «مالی است» ≠ «حسابِ من است» (2026-07-25) ────────────────────────────────
# After the history sweep widened the input from 2 days to 24 months, the loose
# «smells financial» gate started opening cards for documents that are about
# money but are NOT the owner's account: a credit-bureau report («سامانه
# اعتبارسنجی» — its big number is a facility/。debt figure, not a balance), a
# loan schedule, a tax notice, an insurance policy, and — for a broker — a DEMO
# account. Each of these is refused outright: no card created, no balance moved.
_NOT_AN_ACCOUNT = re.compile(
    r"(?i)("
    r"credit\s*(report|score|bureau|inquiry)|اعتبارسنج|رتبهٔ?\s*اعتبار|گزارش\s*اعتبار|"
    r"استعلام|چک\s*برگشت|سفته|ضمانت\s*نامه|"
    r"loan\s*(schedule|statement|agreement)|تسهیلات|اقساط|وام|قسط\s*بندی|"
    r"tax\s*(invoice|notice|return)|مالیات|اظهارنامه|"
    r"insurance\s*(policy|premium)|بیمه\s*نامه|"
    r"demo\s*account|practice\s*account|حساب\s*(آزمایشی|دمو|تمرین)|"
    r"newsletter|unsubscribe|promotion"
    r")"
)


def is_not_an_account(text: Optional[str]) -> bool:
    """True when this document is about money but is not an account of the
    owner's — so it must never become (or update) a card."""
    return bool(text) and bool(_NOT_AN_ACCOUNT.search(text))
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


# A personal mailbox is NEVER a financial institution. The owner's finance page
# filled up with junk («جریدة الفجر» — a newspaper's invoice IBAN became a bank
# card) because any sender domain was accepted as an institution. Free-mail and
# obvious non-financial senders can never open an account card.
_FREE_MAIL = {
    "gmail", "googlemail", "yahoo", "ymail", "hotmail", "outlook", "live", "msn",
    "icloud", "me", "aol", "proton", "protonmail", "zoho", "mail", "gmx", "yandex",
}


def _institution(from_addr: Optional[str], subject: Optional[str]) -> Optional[str]:
    """A short, stable institution label from the sender domain (its most
    distinctive segment), else None. Returns None for personal/free mailboxes —
    a message from a gmail address is not a bank statement."""
    dom = _addr_domain(from_addr)
    if not dom:
        return None
    dom = _TLD.sub("", dom)
    if any(p in _FREE_MAIL for p in dom.split(".")):
        return None
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
    db: AsyncSession, uid: int, institution: Optional[str], ref: Optional[str],
    source_ref: Optional[str] = None,
) -> Optional[FinancialAccount]:
    """Find the account this signal belongs to. Priority: (1) same source file
    (source_ref already seen on the card) — this reconciles the attachment
    auto-feed and the later manual «تأیید» onto ONE card even when they derive
    the institution name differently; (2) exact account-ref; (3) institution
    name — BUT only when there's no ref, so two distinct accounts at the same
    bank (different refs) don't collapse into one card."""
    accounts = (
        await db.execute(select(FinancialAccount).where(_scope(FinancialAccount.user_id, uid)))
    ).scalars().all()
    if source_ref:
        for a in accounts:
            ex = _extra(a)
            if source_ref in set(ex.get("source_refs") or []) or source_ref in set(ex.get("applied_refs") or []):
                return a
    if ref:
        for a in accounts:
            if _extra(a).get("account_ref") == ref:
                return a
        # a real ref that matches no stored ref ⇒ a DISTINCT account; do not
        # fall through to the loose institution-substring match.
        return None
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


async def apply_account_signal(
    db: AsyncSession,
    uid: int,
    *,
    institution: Optional[str],
    account_ref: Optional[str] = None,
    iban: Optional[str] = None,
    balance: Any = None,
    currency: Optional[str] = None,
    kind: str = "bank",
    source: str = "email",
    source_ref: Optional[str] = None,
    occurred_iso: Optional[str] = None,
    provider_name: Optional[str] = None,
) -> Dict[str, Any]:
    """The ONE place a detected account becomes/updates a card — shared by the
    email-text scan AND the attachment extractor, so both reconcile onto the
    SAME identity (account_ref → institution). Creates a card when none matches,
    else updates the balance if this signal is newer, recording a deduped delta
    transaction. Returns {created, updated, account_id}. Caller commits."""
    bal = _to_decimal(balance)
    if institution is None and not account_ref and not provider_name:
        return {"created": 0, "updated": 0, "account_id": None}
    if bal is None and not account_ref and not iban:
        return {"created": 0, "updated": 0, "account_id": None}

    acc = await _match_account(db, uid, institution, account_ref, source_ref=source_ref)
    created = updated = 0
    if acc is None:
        # PRECISION over recall (the owner's finance page filled with junk):
        # opening a NEW card needs a real, non-zero BALANCE from a real
        # institution. An IBAN alone is not enough — an invoice from a
        # newspaper carries the SENDER's IBAN for payment, which is their
        # account, not the owner's. A bare masked ref («paid with card ending
        # 4321») is a purchase, not an account either.
        # A card needs a real, POSITIVE balance. A negative number pulled out of
        # a broker statement is a floating P/L or a closed-position figure, not
        # «موجودیِ حساب» — the owner's XM card opened at −998.64 USD that way
        # (2026-07-25). If an account really is negative, he types it himself.
        if bal is None or bal <= 0 or not institution:
            return {"created": 0, "updated": 0, "account_id": None}
        extra = {
            "source": source, "inferred": True, "account_ref": account_ref,
            "last_email_at": occurred_iso,
            "source_refs": [source_ref] if source_ref else [],
        }
        if iban:
            extra["iban"] = iban
        base = (provider_name or institution or (iban or account_ref) or "حساب")
        name = base if not account_ref else f"{base} {account_ref}"
        acc = FinancialAccount(
            user_id=None if uid == 0 else uid,
            name=name[:255], kind=(kind if kind in ("bank", "broker", "exchange") else "bank"),
            institution=institution or provider_name, currency=(currency or "USD"),
            balance=(bal if bal is not None else Decimal(0)),
            extra=json.dumps(extra, ensure_ascii=False),
        )
        db.add(acc)
        await db.flush()
        created = 1
        if bal is not None and source_ref:
            _record_txn(db, acc, Decimal(0), bal, source_ref, occurred_iso, currency, source)
    else:
        extra = _extra(acc)
        # Always remember this file/source touched this card — the reconciliation
        # key so a later manual «تأیید» of the same file lands on THIS card.
        if source_ref:
            srefs = set(extra.get("source_refs") or [])
            srefs.add(source_ref)
            extra["source_refs"] = list(srefs)[-200:]
            acc.extra = json.dumps(extra, ensure_ascii=False)
        last_at = extra.get("last_email_at")
        is_newer = occurred_iso is None or last_at is None or occurred_iso >= last_at
        # Same rule on UPDATE: a machine-parsed negative is a P/L, not a balance.
        # Never let one overwrite a real balance the owner can see.
        if bal is not None and bal < 0:
            bal = None
        if bal is not None and is_newer:
            old = _to_decimal(acc.balance) or Decimal(0)
            # With a source_ref, record a deduped delta txn — and if this ref was
            # already applied, skip BOTH (idempotent re-scan). Without one (a
            # manual re-file), just update the balance, no txn.
            apply = _record_txn(db, acc, old, bal, source_ref, occurred_iso, currency, source) \
                if source_ref else True
            if apply:
                acc.balance = bal
                if currency:
                    acc.currency = currency
                extra = _extra(acc)  # re-read: _record_txn may have written applied_refs
                extra.update({"source": extra.get("source", source), "last_email_at": occurred_iso})
                if account_ref and not extra.get("account_ref"):
                    extra["account_ref"] = account_ref
                if iban and not extra.get("iban"):
                    extra["iban"] = iban
                acc.extra = json.dumps(extra, ensure_ascii=False)
                updated = 1
    return {"created": created, "updated": updated, "account_id": acc.id}


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
            # Financial, but not an account of his (credit report, loan, demo…).
            if is_not_an_account(text):
                continue
            financial += 1

            parsed = parse_balance(text)
            institution = _institution(e.from_addr, e.subject)
            ref = _account_ref(text)
            iban_m = _IBAN.search(text)
            if institution is None or (getattr(parsed, "balance", None) is None and ref is None):
                continue
            res = await apply_account_signal(
                db, uid,
                institution=institution, account_ref=ref,
                iban=(iban_m.group(1).upper() if iban_m else None),
                balance=getattr(parsed, "balance", None),
                currency=getattr(parsed, "currency", None),
                kind=_kind(text), source="email",
                source_ref=f"email:{e.id}",
                occurred_iso=(e.received_at.isoformat() if e.received_at else None),
            )
            created += res["created"]
            updated += res["updated"]
        except Exception as exc:  # one bad email never aborts the scan
            logger.debug("finance email scan skipped a row: %r", exc)
            continue

    await db.commit()
    return {"scanned": len(emails), "financial": financial, "created": created, "updated": updated}


def _record_txn(
    db: AsyncSession, acc: FinancialAccount, old: Decimal, new: Decimal,
    ref: str, occurred_iso: Optional[str], currency: Optional[str], source: str = "email",
) -> bool:
    """Record the balance delta as a Transaction, idempotent on the signal ref
    (email:<id> or gmail:<mid>:<file>). Returns False when this ref was already
    applied (so the caller skips the balance write too)."""
    from datetime import date as _date

    extra = _extra(acc)
    # dedup: track applied refs on the account (backstop to the DB source_ref).
    # Legacy rows stored bare email ids in ``applied_emails`` — reconstruct the
    # new ``email:<id>`` ref form so a migrated card doesn't re-post its history.
    applied = set(extra.get("applied_refs") or []) | {
        f"email:{i}" for i in (extra.get("applied_emails") or [])
    }
    if ref in applied:
        return False
    delta = new - old
    txn = Transaction(
        account_id=acc.id,
        amount=abs(delta),
        transaction_type=("income" if delta >= 0 else "expense"),
        description=("به‌روزرسانیِ خودکار از فایل" if source == "attachment" else "به‌روزرسانیِ خودکار از ایمیل"),
        currency=(currency or acc.currency),
        source=source,
        source_ref=ref,
    )
    try:
        d = _date.fromisoformat(occurred_iso[:10]) if occurred_iso else None
        if d:
            txn.occurred_on = d
    except Exception:
        pass
    db.add(txn)
    applied.add(ref)
    extra["applied_refs"] = list(applied)[-200:]
    extra.pop("applied_emails", None)  # migrated to applied_refs
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
        # An archived card is history, not a live account (the imported Excel
        # sheet from before the system existed). Kept in full, filed apart.
        "archived": bool(e.get("archived")),
    }


async def record_statement_lines(
    db: AsyncSession,
    account: FinancialAccount,
    rows: List[Dict[str, Any]],
    *,
    source: str = "attachment",
) -> Dict[str, Any]:
    """ریزِ گردش — persist parsed statement movements as real Transactions.

    Deduped on the CONTENT hash (``statement_lines.line_ref``), not on the file:
    the same movement arriving again in an overlapping statement, or in a
    re-upload of the same PDF, is recognised and skipped. Returns
    {added, skipped}. The caller commits.
    """
    from datetime import date as _date

    from app.services.ingest.statement_lines import line_ref

    if not rows or account is None or account.id is None:
        return {"added": 0, "skipped": 0}

    refs = [line_ref(account.id, r) for r in rows]
    existing = set(
        (
            await db.execute(
                select(Transaction.source_ref).where(Transaction.source_ref.in_(refs))
            )
        ).scalars().all()
    )
    added = skipped = 0
    for row, ref in zip(rows, refs):
        if ref in existing:
            skipped += 1
            continue
        existing.add(ref)  # a statement may repeat an identical line twice
        txn = Transaction(
            account_id=account.id,
            amount=_to_decimal(row.get("amount")) or Decimal(0),
            transaction_type=("expense" if row.get("direction") == "out" else "income"),
            description=(row.get("description") or "تراکنش")[:255],
            currency=(row.get("currency") or account.currency),
            source=source,
            source_ref=ref,
        )
        try:
            d = row.get("date")
            if d:
                txn.occurred_on = _date.fromisoformat(str(d)[:10])
        except Exception:
            pass
        db.add(txn)
        added += 1
    return {"added": added, "skipped": skipped}


async def account_movements(
    db: AsyncSession, account_id: int, limit: int = 5
) -> List[Dict[str, Any]]:
    """The last few balance movements on a card — «از این حساب چه چیزی در فلان
    تاریخ کم شد». Reads the Transactions the scan already records, newest first."""
    rows = (
        await db.execute(
            select(Transaction)
            .where(Transaction.account_id == account_id)
            .order_by(Transaction.id.desc())
            .limit(limit)
        )
    ).scalars().all()
    out: List[Dict[str, Any]] = []
    for t in rows:
        out.append({
            "amount": float(t.amount or 0),
            "type": t.transaction_type,
            "currency": t.currency,
            "date": t.occurred_on.isoformat() if t.occurred_on else None,
            "description": t.description,
            "source": t.source,
        })
    return out


async def cleanup_inferred_junk(db: AsyncSession, uid: int = 0) -> Dict[str, Any]:
    """Remove the machine-created cards that were never real accounts.

    The aggressive first version opened a card for anything with an IBAN or a
    masked ref — a newspaper's invoice, a receipt's card tail — leaving a page
    full of «0.00» rows. This removes ONLY rows the machine itself created
    (``extra.inferred``) that carry NO balance and NO recorded movement. Rows the
    owner typed, or any card with a real balance/history, are never touched."""
    from sqlalchemy import func as _f

    removed: List[str] = []
    accounts = (
        await db.execute(select(FinancialAccount).where(_scope(FinancialAccount.user_id, uid)))
    ).scalars().all()
    for a in accounts:
        e = _extra(a)
        if not e.get("inferred"):
            continue  # owner-created — never touched
        if (_to_decimal(a.balance) or Decimal(0)) != 0:
            continue  # has a real balance — keep
        n_txn = (
            await db.execute(
                select(_f.count()).select_from(Transaction).where(Transaction.account_id == a.id)
            )
        ).scalar() or 0
        if n_txn:
            continue  # has history — keep
        removed.append(a.name)
        await db.delete(a)
    await db.commit()
    return {"removed": len(removed), "names": removed[:20]}
