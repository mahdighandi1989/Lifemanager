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
    filed or intentionally dismissed is never re-proposed. Dedup by source_ref
    across ALL content types (incl. transaction — omitting it re-proposed every
    receipt on each re-scan)."""
    from app.models.inbox_item import InboxItem

    rows = (
        await db.execute(
            select(InboxItem).where(
                InboxItem.suggested_type.in_(
                    ["finance_account", "transaction", "document", "subscription",
                     "person", "task", "note"]
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
):
    from app.models.inbox_item import InboxItem

    fa = {k: v for k, v in (fields or {}).items() if v not in (None, "", [])}
    content = title or filename
    if summary:
        content = f"{content} — {summary}"
    item = InboxItem(
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
    db.add(item)
    await db.flush()
    return item


async def _classify_text(db: AsyncSession, text: str, filename: str) -> Optional[Dict[str, Any]]:
    """Rich classification of already-extracted TEXT via a text LLM (cheaper +
    more reliable than vision on a statement). Returns a parsed dict or None —
    the deterministic path is the floor, so None just means 'no richer info'."""
    try:
        from app.services.ai.inference_gateway import complete

        res = await complete(
            db, _EXTRACT_PROMPT + "\n\nمتنِ فایل:\n" + text[:8000],
            task="document_extraction", max_tokens=500,
        )
        if res.get("ok"):
            parsed = _parse_json(res.get("text"))
            if parsed:
                parsed["_model"] = res.get("model")
                return parsed
    except Exception as exc:
        logger.debug("text classify skipped: %r", exc)
    return None


async def _feed_finance(
    db: AsyncSession, *, fields: Dict[str, Any], sender: Optional[str],
    filename: str, source_ref: str, user_id: int, det: Optional[Dict[str, Any]],
    occurred_iso: Optional[str] = None, text: Optional[str] = None,
) -> int:
    """A statement/finance file also flows straight into «مالی» — create/update
    the account card, deduped, without waiting for a manual «file» click. Uses
    the SAME identity engine as the email scan so the two never double-up.

    Returns how many per-transaction statement lines were recorded (0 when the
    file carries none). «از این حساب چه چیزی در فلان تاریخ کم شد» is answered
    here: the closing balance alone was never enough.
    """
    try:
        from app.services import finance_email_scan_service as fs

        # «مالی است» ≠ «حسابِ من است»: a credit-bureau report, a loan schedule,
        # a tax notice or a broker DEMO account is refused outright. Checked on
        # the file's own text (2026-07-25 — «سامانه اعتبارسنجی» had become a
        # ۲٫۳ میلیارد ریالی card).
        haystack = " ".join(
            str(v) for v in (text, filename, fields.get("provider"), fields.get("title"))
            if v
        )
        if fs.is_not_an_account(haystack):
            logger.info("attachment→finance refused (not an account): %s", filename)
            return 0

        provider = fields.get("provider") or fields.get("institution")
        institution = fs._institution(sender, provider or filename) or (
            re.sub(r"[^A-Za-z0-9آ-ی]+", "", str(provider))[:60] if provider else None
        )
        # DETERMINISTIC WINS for the card's IDENTITY too (2026-07-30): the
        # model could still overrule account_no/iban and mint a second card
        # for the same account off a hallucinated number. The regex read the
        # number off the page; the model may only FILL a gap.
        ref = (det or {}).get("account_no") or fields.get("account_no")
        iban = (det or {}).get("iban") or fields.get("iban")
        # DETERMINISTIC WINS for the money. The caller merges `{**det, **ai}`,
        # which let the model's number override a regex that had actually found
        # «موجودی» in the text — that is how a broker statement's floating P/L
        # (−998.64) became the card's balance. The model may FILL a gap; it may
        # not overrule what was literally read off the page.
        balance = (det or {}).get("balance")
        if balance is None:
            balance = fields.get("balance")
        currency = (det or {}).get("currency") or fields.get("currency")
        kind = str(fields.get("account_kind") or fields.get("kind") or "bank")
        if institution is None and not ref and not iban:
            return 0
        # «خرید، هزینه است نه حساب» — on the AUTO path too (2026-07-30; the
        # guard existed only on the manual «تأیید» filer, so a gift-card or
        # delivery receipt reading «Remaining balance: AED 50» minted an
        # "account"). A receipt/invoice with no account signal never becomes a
        # card here — it stays a review item for the owner to file.
        from decimal import Decimal as _D

        try:
            _bal_d = _D(str(balance)) if balance is not None else None
        except Exception:
            _bal_d = None
        has_account_signal = bool(iban or ref or (_bal_d is not None and _bal_d > 0))
        doc_kind = str(fields.get("kind") or "").lower()
        amount_like = fields.get("amount") or fields.get("total")
        if not has_account_signal and (
            amount_like is not None
            or doc_kind in ("receipt", "invoice", "purchase", "expense")
        ):
            logger.info("attachment→finance refused (a purchase, not an account): %s", filename)
            return 0
        # occurred_iso = the source email's date, so the «only a newer signal
        # moves the balance» guard actually arms (parse_finance_fields carries
        # no date; without this an OLDER statement could overwrite a newer one).
        res = await fs.apply_account_signal(
            db, user_id, institution=institution, account_ref=ref, iban=iban,
            balance=balance, currency=currency, kind=kind, source="attachment",
            source_ref=source_ref, occurred_iso=(occurred_iso or (det or {}).get("date") or fields.get("date")),
            provider_name=provider,
            evidence=(det or {}).get("evidence"),
        )
        # ریزِ گردش: the per-transaction lines, attached to the card the signal
        # resolved to. Only ever recorded against a REAL card — parsed lines
        # with nowhere to live are dropped rather than orphaned.
        account_id = res.get("account_id")
        if not account_id or not text:
            return 0
        from app.models.finance import FinancialAccount
        from app.services.ingest.statement_lines import parse_statement_lines

        rows = parse_statement_lines(text, currency=currency)
        if not rows:
            return 0
        acc = await db.get(FinancialAccount, account_id)
        if acc is None:
            return 0
        stats = await fs.record_statement_lines(db, acc, rows, source="attachment")
        if stats["added"]:
            logger.info(
                "statement lines recorded: %s added, %s already known (%s)",
                stats["added"], stats["skipped"], source_ref,
            )
        return int(stats["added"])
    except Exception as exc:
        logger.debug("attachment→finance feed skipped (%s): %r", source_ref, exc)
        return 0


async def extract_from_file(
    db: AsyncSession,
    *,
    filename: str,
    mimetype: Optional[str],
    data: bytes,
    source_ref: str,
    user_id: int = 0,
    password: Optional[str] = None,
    sender: Optional[str] = None,
    occurred_iso: Optional[str] = None,
) -> Dict[str, Any]:
    """Read one file → propose a review candidate (and auto-feed «مالی» for a
    statement). Returns ``{status: proposed|needs_password|duplicate|unreadable}``.
    Deterministic-first: text-bearing files (PDF/XLSX/CSV/DOCX/TXT) are read with
    NO model, so an attachment is never a dead note just because a vision model
    isn't configured. Images still go to the vision model. Never raises.
    """
    try:
        if await _already_ingested(db, source_ref):
            # Self-healing (2026-07-25): «کارت‌ها را پاک کردم، دوباره سوییپ زدم،
            # هیچی نیاورد». The review-item dedup is right — the owner should
            # never be re-asked about a file he already handled — but the
            # FINANCE side must not hide behind it: the card's own dedup
            # memory (source_refs / applied_refs / content-hashed lines) lived
            # on the deleted row and died with it. So a duplicate still gets a
            # deterministic-only re-read (no AI, no new inbox item) and its
            # finance signal re-applied: a deleted card is rebuilt from the
            # same files; an intact card is a no-op end to end.
            refreshed = 0
            try:
                ready_dup, locked = prepare_bytes(data, mimetype, password=password)
                if not locked:
                    from app.services.ingest import text_extract as _tx

                    dup_text = _tx.extract_text(ready_dup, mimetype, filename)
                    dup_det = _tx.parse_finance_fields(dup_text) if dup_text else None
                    if dup_det:
                        await _feed_finance(
                            db, fields=dict(dup_det), sender=sender, filename=filename,
                            source_ref=source_ref, user_id=user_id, det=dup_det,
                            occurred_iso=occurred_iso, text=dup_text,
                        )
                        refreshed = 1
            except Exception as exc:
                logger.debug("duplicate finance recheck skipped (%s): %r", source_ref, exc)
            return {"status": "duplicate", "finance_recheck": refreshed}

        ready, needs_pw = prepare_bytes(data, mimetype, password=password)
        if needs_pw:
            return {"status": "needs_password", "filename": filename, "source_ref": source_ref}

        from app.services.ingest import text_extract

        text = text_extract.extract_text(ready, mimetype, filename)
        det_finance = text_extract.parse_finance_fields(text) if text else None

        parsed: Optional[Dict[str, Any]] = None
        ai_model: Optional[str] = None
        if text:
            # deterministic text present → prefer a TEXT model for a rich read;
            # fall back to a deterministic classification so it works keyless.
            rich = await _classify_text(db, text, filename)
            if rich:
                parsed = rich
                ai_model = rich.get("_model")
            elif det_finance:
                parsed = {
                    "kind": det_finance["kind"], "title": filename,
                    "summary": "صورتحساب/سندِ مالی — خودکار خوانده شد.",
                    "fields": {k: v for k, v in det_finance.items() if v not in (None, "")},
                }
            else:
                parsed = {
                    "kind": "document", "title": filename,
                    "summary": "سند — متنش خوانده شد؛ برای جزئیات بازش کن.",
                    "fields": {},
                }
        else:
            # no deterministic text (image/scan) → the vision model path.
            from app.services.ai.inference_gateway import complete_multimodal

            res = await complete_multimodal(
                db, _EXTRACT_PROMPT,
                [{"filename": filename, "mimetype": mimetype or "application/octet-stream", "data": ready}],
                task="document_extraction",
            )
            parsed = _parse_json(res.get("text")) if res.get("ok") else None
            ai_model = res.get("model") if res.get("ok") else None
            if not parsed:
                await _propose(
                    db, suggested_type="note", title=filename,
                    summary="این فایل خودکار خوانده نشد — دستی بررسی کن.",
                    fields={}, source_ref=source_ref, filename=filename,
                    user_id=user_id, ai_model=None,
                )
                return {"status": "unreadable", "reason": res.get("error") if not res.get("ok") else "unparsed"}

        suggested = _KIND_MAP.get(str(parsed.get("kind") or "other").lower(), "note")
        fields = parsed.get("fields") or {}
        item = await _propose(
            db, suggested_type=suggested,
            title=str(parsed.get("title") or filename)[:200],
            summary=str(parsed.get("summary") or "")[:500],
            fields=fields, source_ref=source_ref, filename=filename,
            user_id=user_id, ai_model=ai_model,
        )
        # ── تریاژِ کاملِ صندوق برای فایل‌های غیرِ ساختاریافته (2026-07-31) ──
        # مورد استخراج‌شده از فایل تا امروز هرگز از تریاژِ خودِ صندوق رد
        # نمی‌شد: یک «کار»ِ برآمده از فایل نه موعد داشت، نه اولویت، نه لیستِ
        # مقصد. حالا برای انواعِ عمومی (کار/یادداشت) تریاژ اجرا و نتیجه‌اش
        # با فیلدهای استخراج‌شده ADGAM (نه بازنویسی) می‌شود — پس هیچ فیلدِ
        # مالی/مدرکیِ ساختاریافته‌ای از دست نمی‌رود.
        if suggested in ("task", "note") and item is not None:
            try:
                from app.services import inbox_service

                triage = await inbox_service.classify_content(
                    db, item.content, user_id=user_id
                )
                extra = triage.get("suggestion") or {}
                merged = dict(item.suggestion or {})
                for key in ("due_date", "priority", "list_name", "category", "section", "person_name"):
                    if extra.get(key) and not merged.get(key):
                        merged[key] = extra[key]
                item.suggestion = merged
                # فقط وقتی نوعِ دقیق‌تری پیشنهاد شد، ارتقا بده (note → todo/task).
                new_kind = triage.get("suggested_type")
                if suggested == "note" and new_kind in ("task", "todo", "person"):
                    item.suggested_type = new_kind
            except Exception as exc:
                logger.debug("attachment triage enrich skipped (%s): %r", source_ref, exc)
        # a statement also self-feeds «مالی» (no manual click needed).
        lines_added = 0
        if suggested == "finance_account" or det_finance:
            merged = {**(det_finance or {}), **fields}
            lines_added = await _feed_finance(
                db, fields=merged, sender=sender, filename=filename,
                source_ref=source_ref, user_id=user_id, det=det_finance,
                occurred_iso=occurred_iso, text=text,
            )
        out = {"status": "proposed", "kind": suggested}
        if lines_added:
            out["statement_lines"] = lines_added
        return out
    except Exception as exc:
        logger.debug("universal extract skipped (%s): %r", source_ref, exc)
        return {"status": "error"}
