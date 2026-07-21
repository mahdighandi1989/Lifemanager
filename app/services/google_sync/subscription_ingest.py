"""Auto-ingest: turn synced subscription-provider emails into review-queue
candidates (audit «کمتر ولی زنده», move 1 — the auto-feed pipeline).

The Gmail sync already lands every message in ``PersonalEmail`` and
``triage_service.analyze_new_emails`` already classifies each one. This module
hooks that same pass: when an email is FROM a recognised subscription provider
(Netflix, Spotify, …), it drops an ``InboxItem`` candidate (``suggested_type =
"subscription"``) into the universal inbox — the review queue that already
exists — instead of writing a ``SubscriptionAccount`` directly. The owner then
files it with one tap (``inbox_service._file_as_subscription``), which creates
the real row → which the already-wired ``attention_service.subscription_renewal``
turns into a renewal reminder, and which fills the «اشتراک‌ها» card.

Design guarantees:
  * **Opt-in** — gated by the ``auto_ingest_subscriptions`` GlobalSetting flag
    (default ON: the owner explicitly consented; a toggle can turn it off).
  * **Precise, low-noise** — only RECOGNISED providers create a candidate; a
    generic "receipt" never does, so the inbox doesn't fill with one-off
    purchases.
  * **Idempotent** — no candidate when a SubscriptionAccount for that provider
    already exists, nor when a pending candidate for it is already queued.
  * **Never raises** — a broken parse must never break the email sync.
"""
from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

_FLAG_KEY = "auto_ingest_subscriptions"

# provider canonical-name → sender/subject match. Order matters only for
# readability; the first hit wins. Kept to well-known recurring services so a
# candidate is high-precision (the owner reviews these, so noise is costly).
_PROVIDERS: List[Tuple[str, re.Pattern]] = [
    ("netflix", re.compile(r"netflix", re.I)),
    ("spotify", re.compile(r"spotify", re.I)),
    ("youtube", re.compile(r"youtube\s*premium|youtube\.com|youtubepremium", re.I)),
    ("apple", re.compile(r"apple\.com|itunes|icloud|apple\s*music|apple\s*tv", re.I)),
    ("google", re.compile(r"google\s*one|googleone|google\s*storage", re.I)),
    ("amazon-prime", re.compile(r"amazon\s*prime|primevideo|prime\s*video", re.I)),
    ("disney-plus", re.compile(r"disney\s*\+|disneyplus", re.I)),
    ("shahid", re.compile(r"shahid", re.I)),
    ("anghami", re.compile(r"anghami", re.I)),
    ("osn", re.compile(r"\bosn\b|osnplus", re.I)),
    ("starzplay", re.compile(r"starzplay|starz\s*play", re.I)),
    ("adobe", re.compile(r"adobe", re.I)),
    ("microsoft-365", re.compile(r"microsoft\s*365|office\s*365|m365", re.I)),
    ("openai", re.compile(r"openai|chatgpt\s*plus", re.I)),
    ("notion", re.compile(r"notion\.so|notion\s+", re.I)),
    ("linkedin", re.compile(r"linkedin\s*premium", re.I)),
    ("canva", re.compile(r"canva", re.I)),
]

# Only treat a provider hit as a subscription event when the mail also reads
# like a billing/renewal message — avoids flagging a marketing blast from
# Netflix as a subscription to add.
_RE_BILLING = re.compile(
    r"\b(receipt|invoice|payment|renew|subscription|billed|charged|your plan|"
    r"membership|فاکتور|رسید|پرداخت|تمدید|اشتراک|صورتحساب)\b",
    re.I,
)

# amount: "AED 44.99" / "$9.99" / "9.99 USD"
_RE_AMOUNT_PREFIX = re.compile(
    r"(AED|USD|EUR|GBP|\$|€|£|درهم|دلار|ریال|تومان)\s*([0-9][0-9,]*\.?[0-9]{0,2})", re.I
)
_RE_AMOUNT_SUFFIX = re.compile(
    r"([0-9][0-9,]*\.?[0-9]{0,2})\s*(AED|USD|EUR|GBP|درهم|دلار)", re.I
)
# a shown next-payment date, best-effort: "renews on June 25, 2026" / "next
# payment June 25, 2026" / "on 25 Jun 2026"
_RE_NEXT_DATE = re.compile(
    r"(?:renews?(?:\s+on)?|next\s+payment|next\s+billing|due|تمدید(?:\s+در)?)\s*[:\-]?\s*"
    r"([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}|\d{4}-\d{2}-\d{2})",
    re.I,
)


def _detect_provider(email) -> Optional[str]:
    hay = f"{email.from_addr or ''} {email.subject or ''} {email.snippet or ''}"
    for name, pat in _PROVIDERS:
        if pat.search(hay):
            return name
    return None


def _extract_fields(email) -> Dict[str, Any]:
    text = f"{email.subject or ''}\n{email.snippet or ''}"
    amount: Optional[str] = None
    m = _RE_AMOUNT_PREFIX.search(text) or _RE_AMOUNT_SUFFIX.search(text)
    if m:
        amount = m.group(0).strip()
    next_date: Optional[str] = None
    d = _RE_NEXT_DATE.search(text)
    if d:
        next_date = d.group(1).strip()
    return {"amount": amount, "next_payment_date": next_date}


async def is_enabled(db: AsyncSession) -> bool:
    """Opt-in flag; default ON (owner consented). Never raises."""
    try:
        from app.models.global_setting import GlobalSetting

        row = (
            await db.execute(select(GlobalSetting).where(GlobalSetting.key == _FLAG_KEY))
        ).scalar_one_or_none()
        if row is None or row.value is None:
            return True
        return str(row.value).strip() not in ("0", "false", "off", '"0"')
    except Exception:
        return True


async def set_enabled(db: AsyncSession, enabled: bool) -> bool:
    from app.models.global_setting import GlobalSetting

    value = "1" if enabled else "0"
    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == _FLAG_KEY))
    ).scalar_one_or_none()
    if row is None:
        db.add(GlobalSetting(key=_FLAG_KEY, value=value))
    else:
        row.value = value
    await db.commit()
    return enabled


async def _already_known(db: AsyncSession, provider: str, user_id: int) -> bool:
    """True when there's already a SubscriptionAccount for this provider OR a
    pending inbox candidate for it — so re-syncs don't pile up duplicates."""
    from app.models.inbox_item import InboxItem
    from app.models.subscription_account import SubscriptionAccount

    existing = (
        await db.execute(
            select(SubscriptionAccount.id).where(
                SubscriptionAccount.provider.ilike(f"%{provider}%")
            )
        )
    ).first()
    if existing:
        return True
    pending = (
        (
            await db.execute(
                select(InboxItem).where(
                    InboxItem.status == "pending",
                    InboxItem.suggested_type == "subscription",
                )
            )
        )
        .scalars()
        .all()
    )
    for row in pending:
        if (row.suggestion or {}).get("provider") == provider:
            return True
    return False


async def route_subscription_email(db: AsyncSession, email, *, user_id: int = 0) -> bool:
    """If ``email`` is a recognised subscription billing message and the flag
    is on, queue a review candidate. Returns True when one was created. Never
    raises (best-effort, called inside the email-triage loop)."""
    try:
        if not await is_enabled(db):
            return False
        provider = _detect_provider(email)
        if not provider:
            return False
        text = f"{email.subject or ''} {email.snippet or ''}"
        if not _RE_BILLING.search(text):
            return False
        if await _already_known(db, provider, user_id):
            return False

        fields = _extract_fields(email)
        from app.models.inbox_item import InboxItem

        label = provider.replace("-", " ").title()
        summary_bits = [f"اشتراکِ {label}"]
        if fields.get("amount"):
            summary_bits.append(fields["amount"])
        if fields.get("next_payment_date"):
            summary_bits.append(f"تمدید: {fields['next_payment_date']}")
        content = " — ".join(summary_bits)

        candidate = InboxItem(
            user_id=user_id,
            content=content,
            source="gmail",
            status="pending",
            suggested_type="subscription",
            suggestion={
                "provider": provider,
                "account_email": email.from_addr,
                "amount": fields.get("amount"),
                "next_payment_date": fields.get("next_payment_date"),
                "reason": f"از ایمیلِ {label} تشخیص داده شد — تأیید کن تا به اشتراک‌ها اضافه شود.",
            },
            ai_model=None,
        )
        db.add(candidate)
        # committed by the caller's batch commit (analyze_new_emails)
        return True
    except Exception as exc:
        logger.debug("subscription ingest skipped (%s): %r", getattr(email, "id", "?"), exc)
        return False
