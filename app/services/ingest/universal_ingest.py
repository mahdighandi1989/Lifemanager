"""Universal ingest — read ANY file (attachment / Drive doc / scan) with a
vision model, classify what it is, and drop a review candidate into the inbox.

Deliberately general (owner: «صورتحساب فقط مثال بود، منظورم همه‌چیز است»): a
bank/broker statement, an ID card, a subscription receipt, a contact card, a
to-do photo — all flow through the same extract → propose → approve → file
loop. Nothing is written blindly; the owner approves each candidate, and
approving CREATES the destination (account/document/…) if it doesn't exist.

Fail-open + credential-aware: an encrypted file with no known password returns
``needs_password`` (the credential-request flow handles it); when the AI can't
read a file, a raw «سندِ خوانده‌نشده» candidate is still surfaced so nothing is
silently dropped.
"""
from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ingest.attachments import prepare_bytes

logger = logging.getLogger(__name__)

# AI kind → inbox suggested_type (the destination the filer knows how to build).
_KIND_MAP = {
    "finance_account": "finance_account",
    "bank": "finance_account",
    "broker": "finance_account",
    "exchange": "finance_account",
    "subscription": "subscription",
    "receipt": "transaction",
    "invoice": "transaction",
    "expense": "transaction",
    "purchase": "transaction",
    "document": "document",
    "id": "document",
    "identity": "document",
    "contact": "person",
    "person": "person",
    "task": "task",
    "note": "note",
    "other": "note",
}

_EXTRACT_PROMPT = """این یک فایل از زندگیِ کاربر است (صورتحساب، سند، رسید، کارت، عکس، …).
محتوا را بخوان و فقط یک شیء JSON برگردان، بدون هیچ توضیحِ اضافه:

{
  "kind": "finance_account | subscription | receipt | document | contact | task | note | other",
  "title": "یک عنوانِ کوتاهِ فارسی برای این مورد",
  "summary": "یک جملهٔ فارسی که بگوید این چیست",
  "fields": {
    "provider": "نامِ بانک/بروکر/صرافی/سرویس اگر بود، وگرنه حذف",
    "balance": "موجودی اگر بود (عدد)",
    "currency": "ارز اگر بود (مثل AED/USD)",
    "account_no": "شمارهٔ حساب/کارتِ ماسک‌شده اگر بود",
    "expiry": "تاریخِ انقضا اگر بود",
    "name": "نامِ شخص اگر kind=contact",
    "email": "ایمیل اگر بود",
    "phone": "تلفن اگر بود",
    "amount": "مبلغ اگر رسید بود",
    "date": "تاریخِ مهم اگر بود"
  }
}
فقط فیلدهایی را بگذار که واقعاً در فایل دیدی. فقط JSON."""


def _parse_json(text: Optional[str]) -> Optional[Dict[str, Any]]:
    if not text:
        return None
    cleaned = re.sub(r"```(?:json)?", "", text).strip()
    m = re.search(r"\{.*\}", cleaned, re.S)
    if not m:
        return None
    try:
        obj = json.loads(m.group(0))
        return obj if isinstance(obj, dict) else None
    except Exception:
        return None


async def _already_ingested(db: AsyncSession, source_ref: str) -> bool:
    """True when this exact file (by source_ref) was ALREADY turned into a
    candidate — in ANY status. Checking filed/dismissed too (not just pending)
    keeps Drive re-scans and the backfill idempotent: a file the owner already
    filed or intentionally dismissed is never re-proposed."""
    from app.models.inbox_item import InboxItem

    rows = (
        await db.execute(
            select(InboxItem).where(
                InboxItem.suggested_type.in_(
                    ["finance_account", "document", "subscription", "person", "task", "note"]
                ),
            )
        )
    ).scalars().all()
    return any((r.suggestion or {}).get("source_ref") == source_ref for r in rows)


async def _propose(
    db: AsyncSession,
    *,
    suggested_type: str,
    title: str,
    summary: str,
    fields: Dict[str, Any],
    source_ref: str,
    filename: str,
    user_id: int,
    ai_model: Optional[str],
) -> None:
    from app.models.inbox_item import InboxItem

    fa = {k: v for k, v in (fields or {}).items() if v not in (None, "", [])}
    content = title or filename
    if summary:
        content = f"{content} — {summary}"
    db.add(
        InboxItem(
            user_id=user_id,
            content=content[:2000],
            source="attachment",
            status="pending",
            suggested_type=suggested_type,
            suggestion={
                **fa,
                "title": title or filename,
                "summary": summary,
                "source_ref": source_ref,
                "filename": filename,
                "reason": f"از فایلِ «{filename}» استخراج شد — تأیید کن تا ثبت/به‌روزرسانی شود.",
            },
            ai_model=ai_model,
        )
    )


async def extract_from_file(
    db: AsyncSession,
    *,
    filename: str,
    mimetype: Optional[str],
    data: bytes,
    source_ref: str,
    user_id: int = 0,
    password: Optional[str] = None,
) -> Dict[str, Any]:
    """Read one file → propose a review candidate. Returns a status dict:
    ``{status: proposed|needs_password|duplicate|unreadable, ...}``. Never raises.
    """
    try:
        if await _already_ingested(db, source_ref):
            return {"status": "duplicate"}

        ready, needs_pw = prepare_bytes(data, mimetype, password=password)
        if needs_pw:
            return {"status": "needs_password", "filename": filename, "source_ref": source_ref}

        from app.services.ai.inference_gateway import complete_multimodal

        res = await complete_multimodal(
            db,
            _EXTRACT_PROMPT,
            [{"filename": filename, "mimetype": mimetype or "application/octet-stream", "data": ready}],
            task="document_extraction",
        )
        parsed = _parse_json(res.get("text")) if res.get("ok") else None
        if not parsed:
            # graceful fallback: surface the file so it is never silently lost
            await _propose(
                db, suggested_type="note", title=filename,
                summary="این فایل خودکار خوانده نشد — دستی بررسی کن.",
                fields={}, source_ref=source_ref, filename=filename,
                user_id=user_id, ai_model=None,
            )
            return {"status": "unreadable", "reason": res.get("error") if not res.get("ok") else "unparsed"}

        suggested = _KIND_MAP.get(str(parsed.get("kind") or "other").lower(), "note")
        await _propose(
            db,
            suggested_type=suggested,
            title=str(parsed.get("title") or filename)[:200],
            summary=str(parsed.get("summary") or "")[:500],
            fields=parsed.get("fields") or {},
            source_ref=source_ref,
            filename=filename,
            user_id=user_id,
            ai_model=res.get("model"),
        )
        return {"status": "proposed", "kind": suggested}
    except Exception as exc:
        logger.debug("universal extract skipped (%s): %r", source_ref, exc)
        return {"status": "error"}
