"""Email triage — «تحلیل کنی و در قسمت‌های مختلف ثبت کنی».

For each new (unanalyzed) synced email: classify into
action / important / receipt / newsletter / otp / other, produce a one-line
Persian summary and (for actionables) a suggested task title. AI first
(task ``email_triage``), deterministic heuristic fallback (``ai_model``
NULL ⇒ heuristic — same provenance rule as everywhere else). A batch
result is mirrored into the activity log so the trail shows «امروز چه
ایمیل‌هایی رسید و چه شد».
"""
from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.personal_sync import PersonalEmail

logger = logging.getLogger(__name__)

CATEGORIES = ("action", "important", "receipt", "newsletter", "otp", "other")

_RE_OTP = re.compile(r"\b(otp|verification code|security code|کد تایید|رمز یکبار)\b", re.I)
_RE_RECEIPT = re.compile(
    r"\b(receipt|invoice|payment|order confirm|فاکتور|رسید|پرداخت|صورتحساب)\b", re.I
)
_RE_NEWSLETTER = re.compile(r"\b(unsubscribe|newsletter|digest|weekly update)\b", re.I)
_RE_ACTIONISH = re.compile(
    r"\b(action required|reply|respond|deadline|due|expir|renew|confirm|invitation|"
    r"لطفا|پاسخ|مهلت|تمدید)\b",
    re.I,
)

# Bank-sender detection (phase 3, audit #6): the live Gmail sync had ZERO
# finance references while the IMAP poller waited for credentials that
# never came. Emails matching this pattern are ALSO routed through
# finance_ingest_service.apply_bank_message (best-effort, snippet-only).
_RE_BANK_SENDER = re.compile(
    r"(bankfab|fab\.ae|emiratesnbd|adcb|mashreq|rakbank|cbd\.ae|dib\.ae|"
    r"adib\.ae|hsbc|citibank|standardchartered|noor ?bank|neteller|"
    r"بانک|balance|available balance|موجودی)",
    re.I,
)


async def _route_bank_email(db: AsyncSession, email: PersonalEmail) -> bool:
    """Feed a bank-looking email through the finance apply path. Returns
    True when a balance was actually applied. Never raises."""
    try:
        blob = f"{email.from_addr or ''} {email.subject or ''}"
        if not _RE_BANK_SENDER.search(blob):
            return False
        from app.services.finance_ingest_service import apply_bank_message

        res = await apply_bank_message(
            db,
            user_id=0,
            channel="email",
            body=f"{email.subject or ''}\n{email.snippet or ''}",
            sender=email.from_addr,
        )
        return bool(res.get("balances_updated"))
    except Exception as exc:
        logger.debug("bank email routing skipped (%s): %r", email.id, exc)
        return False


def heuristic_triage(email: PersonalEmail) -> Dict[str, Any]:
    text = f"{email.subject or ''} {email.snippet or ''}"
    labels = set(email.labels or [])
    if _RE_OTP.search(text):
        return {"category": "otp", "needs_action": False, "summary": "کد تأیید/ورود — بی‌نیاز از اقدام"}
    if _RE_RECEIPT.search(text):
        return {"category": "receipt", "needs_action": False, "summary": "رسید/فاکتور پرداخت"}
    if _RE_NEWSLETTER.search(text) or "CATEGORY_PROMOTIONS" in labels:
        return {"category": "newsletter", "needs_action": False, "summary": "خبرنامه/تبلیغاتی"}
    if _RE_ACTIONISH.search(text) and email.is_unread:
        return {
            "category": "action",
            "needs_action": True,
            "summary": "به نظر می‌رسد نیاز به پاسخ/اقدام دارد",
            "suggested_task": f"رسیدگی به ایمیل: {(email.subject or 'بدون موضوع')[:200]}",
        }
    if "IMPORTANT" in labels and email.is_unread:
        return {"category": "important", "needs_action": False, "summary": "ایمیل مهم خوانده‌نشده"}
    return {"category": "other", "needs_action": False, "summary": None}


_TRIAGE_PROMPT = """تو دستیار فارسی‌زبان من هستی. این ایمیل را دسته‌بندی کن.
فقط یک JSON برگردان با کلیدهای:
- category: یکی از action | important | receipt | newsletter | otp | other
- needs_action: true/false (فقط وقتی واقعاً کاری از من می‌خواهد)
- summary: یک جملهٔ کوتاه فارسی که بگوید این ایمیل چیست
- suggested_task: اگر needs_action است، عنوان یک وظیفهٔ کوتاه فارسی؛ وگرنه null

ایمیل:
از: {from_addr}
موضوع: {subject}
پیش‌نمایش: {snippet}
برچسب‌ها: {labels}
"""


async def _ai_triage(db: AsyncSession, email: PersonalEmail) -> tuple[Optional[Dict], Optional[str]]:
    try:
        from app.services.ai.inference_gateway import complete

        prompt = _TRIAGE_PROMPT.format(
            from_addr=(email.from_addr or "")[:200],
            subject=(email.subject or "")[:300],
            snippet=(email.snippet or "")[:500],
            labels=", ".join((email.labels or [])[:8]),
        )
        res = await complete(db, prompt, task="email_triage", max_tokens=250)
        if not (res.get("ok") and res.get("text")):
            return None, None
        text = res["text"].strip()
        match = re.search(r"\{.*\}", text, re.S)
        if not match:
            return None, None
        data = json.loads(match.group(0))
        category = str(data.get("category") or "other").lower()
        if category not in CATEGORIES:
            category = "other"
        return (
            {
                "category": category,
                "needs_action": bool(data.get("needs_action")),
                "summary": (str(data.get("summary") or "")[:500] or None),
                "suggested_task": (str(data.get("suggested_task") or "")[:255] or None)
                if data.get("suggested_task")
                else None,
            },
            res.get("model"),
        )
    except Exception as exc:
        logger.debug("email AI triage skipped: %r", exc)
        return None, None


async def analyze_new_emails(
    db: AsyncSession, limit: int = 10, user_id: Optional[int] = None
) -> Dict[str, Any]:
    """Triage up to ``limit`` unanalyzed emails (oldest first). Never raises.
    Mirrors an aggregate line into the activity log when anything was
    analyzed."""
    try:
        rows = (
            (
                await db.execute(
                    select(PersonalEmail)
                    .where(PersonalEmail.analyzed_at.is_(None))
                    .order_by(PersonalEmail.received_at.asc().nullslast())
                    .limit(max(int(limit), 1))
                )
            )
            .scalars()
            .all()
        )
    except Exception as exc:
        logger.debug("email triage query failed: %r", exc)
        return {"ok": False, "analyzed": 0, "needs_action": 0}
    if not rows:
        return {"ok": True, "analyzed": 0, "needs_action": 0}

    now = datetime.now(timezone.utc)
    action_titles: List[str] = []
    finance_routed = 0
    for email in rows:
        result, model = await _ai_triage(db, email)
        if result is None:
            result, model = heuristic_triage(email), None
        email.ai_category = result.get("category")
        email.needs_action = bool(result.get("needs_action"))
        email.ai_summary = result.get("summary")
        email.suggested_task = result.get("suggested_task")
        email.ai_model = model
        email.analyzed_at = now
        if email.needs_action:
            action_titles.append((email.subject or email.ai_summary or "بدون موضوع")[:80])
        if await _route_bank_email(db, email):
            finance_routed += 1
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        return {"ok": False, "analyzed": 0, "needs_action": 0}

    try:
        from app.services.activity_log_service import record_activity

        detail = f"{len(rows)} ایمیل تحلیل شد"
        if action_titles:
            detail += f"؛ {len(action_titles)} مورد نیازمند اقدام: " + " | ".join(action_titles[:3])
        await record_activity(
            action="email_triage",
            entity_type="personal_email",
            entity_label="جیمیل",
            detail=detail,
            user_id=user_id,
            db=db,
        )
    except Exception as exc:
        logger.debug("email triage activity mirror skipped: %r", exc)
    return {"ok": True, "analyzed": len(rows), "needs_action": len(action_titles), "finance_routed": finance_routed}
