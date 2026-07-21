"""Orchestrate attachment ingest for an email, and the master backfill.

Per email: fetch its attachments, decrypt with any stored password for the
sender, extract → propose a review candidate. A locked file with no known
password raises a «فایلِ رمزدار» request (Telegram + inbox) instead of being
dropped. Idempotent + fail-open.
"""
from __future__ import annotations

import logging
import os
from typing import Any, Dict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ingest import credentials
from app.services.ingest.attachments import fetch_email_attachments
from app.services.ingest.universal_ingest import extract_from_file

logger = logging.getLogger(__name__)


async def _propose_password_request(db, *, sender: str, filename: str, source_ref: str, user_id: int) -> None:
    """Surface a «رمز لازم است» item + push it to Telegram, once per source_ref."""
    from app.models.inbox_item import InboxItem

    src_key = credentials.source_key_for(sender)
    existing = (
        await db.execute(
            select(InboxItem).where(
                InboxItem.status == "pending", InboxItem.suggested_type == "password_request"
            )
        )
    ).scalars().all()
    if any((r.suggestion or {}).get("source_ref") == source_ref for r in existing):
        return
    db.add(
        InboxItem(
            user_id=user_id,
            content=f"🔒 فایلِ رمزدار «{filename}» از {src_key} — برای بازکردنش رمز لازم است.",
            source="attachment",
            status="pending",
            suggested_type="password_request",
            suggestion={"source_ref": source_ref, "filename": filename, "source_key": src_key},
            ai_model=None,
        )
    )
    try:
        from app.services.notification_service import notify_event

        uid = int(os.environ.get("TELEGRAM_TASK_USER_ID", "0") or 0)
        await notify_event(
            "attention_alert",
            user_id=uid,
            db=db,
            title="🔒 فایلِ رمزدار",
            message=f"فایلِ «{filename}» رمز دارد. در داشبورد → صندوق ورودی رمزش را وارد کن تا باز شود.",
            priority="high",
        )
    except Exception as exc:
        logger.debug("password request notify failed: %r", exc)


async def ingest_email_attachments(db: AsyncSession, email, *, user_id: int = 0) -> Dict[str, int]:
    """Fetch + extract this email's attachments. Never raises."""
    mid = getattr(email, "id", None)
    if not mid:
        return {"proposed": 0, "needs_password": 0}
    try:
        atts = await fetch_email_attachments(db, mid)
    except Exception as exc:
        logger.debug("attachment fetch failed (%s): %r", mid, exc)
        return {"proposed": 0, "needs_password": 0}

    sender = getattr(email, "from_addr", "") or ""
    src_key = credentials.source_key_for(sender)
    pw = await credentials.get_password(db, source_key=src_key)

    proposed = 0
    needs = 0
    for att in atts:
        source_ref = f"gmail:{mid}:{att['filename']}"
        res = await extract_from_file(
            db,
            filename=att["filename"],
            mimetype=att.get("mimetype"),
            data=att["data"],
            source_ref=source_ref,
            user_id=user_id,
            password=pw,
        )
        st = res.get("status")
        if st in ("proposed", "unreadable"):
            proposed += 1
        elif st == "needs_password":
            needs += 1
            await _propose_password_request(
                db, sender=sender, filename=att["filename"], source_ref=source_ref, user_id=user_id
            )
    return {"proposed": proposed, "needs_password": needs}


async def retry_source_ref(db: AsyncSession, *, source_ref: str, user_id: int = 0) -> Dict[str, Any]:
    """Re-open a file now that its password is stored (source_ref = gmail:mid:name)."""
    from app.models.personal_sync import PersonalEmail

    try:
        _, mid, filename = source_ref.split(":", 2)
    except ValueError:
        return {"status": "bad_ref"}
    atts = await fetch_email_attachments(db, mid)
    em = await db.get(PersonalEmail, mid)
    sender = getattr(em, "from_addr", "") if em else ""
    pw = await credentials.get_password(db, source_key=credentials.source_key_for(sender))
    for att in atts:
        if att["filename"] == filename:
            res = await extract_from_file(
                db, filename=filename, mimetype=att.get("mimetype"), data=att["data"],
                source_ref=source_ref, user_id=user_id, password=pw,
            )
            await db.commit()
            return res
    return {"status": "not_found"}


async def backfill_attachments(db: AsyncSession, *, user_id: int = 0, limit: int = 400) -> Dict[str, Any]:
    """Run attachment ingest over already-synced emails (catch-up for the
    backlog). Bounded by ``limit`` since each email may hit the network."""
    from app.models.personal_sync import PersonalEmail

    rows = (
        await db.execute(
            select(PersonalEmail).order_by(PersonalEmail.received_at.desc().nullslast()).limit(limit)
        )
    ).scalars().all()
    proposed = 0
    needs = 0
    scanned = 0
    for em in rows:
        scanned += 1
        r = await ingest_email_attachments(db, em, user_id=user_id)
        proposed += r["proposed"]
        needs += r["needs_password"]
    await db.commit()
    return {"scanned": scanned, "proposed": proposed, "needs_password": needs}
