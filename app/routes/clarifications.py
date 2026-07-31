"""/api/clarifications — پرسش‌های رفعِ ابهام، از داخلِ خودِ برنامه.

تلگرام مسیرِ اصلی است (خواستهٔ مالک)، ولی هر پرسشی باید در برنامه هم دیده و
جواب داده شود؛ وگرنه اگر تلگرام قطع باشد یا پیام گم شود، همان «مغفول‌ماندن»
برمی‌گردد که این قابلیت برای حذفش ساخته شد.

توجه (درسِ system_map): این ماژول **نباید** ``from __future__ import
annotations`` داشته باشد — دکوراتورِ @handle_errors annotationها را در فضای
نامِ app/middleware.py حل می‌کند و آنجا Request/AsyncSession تعریف نیستند،
پس FastAPI پارامترها را query می‌گیرد و همه‌چیز ۴۲۲ می‌شود.
"""
import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id, get_required_user_id
from app.middleware import handle_errors
from app.services import clarification_service as clar

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/api/clarifications", tags=["clarifications"])
@handle_errors
async def list_clarifications(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """پرسش‌های باز (و بایگانی‌شده‌ها) — همان‌هایی که در تلگرام پرسیده می‌شوند."""
    rows = await clar.open_forms(db, limit=max(1, min(int(limit), 100)))
    return {
        "ok": True, "success": True,
        "items": [clar.to_dict(c) for c in rows],
        "open": sum(1 for c in rows if c.status in ("open", "partial")),
    }


@router.post("/api/clarifications/{clarification_id}/answer", tags=["clarifications"])
@handle_errors
async def answer_clarification(
    clarification_id: int,
    payload: Dict[str, Any] = Body(default={}),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """جواب از داخل برنامه.

    دو شکلِ ورودی — هر دو مجاز، چون تجربهٔ کاربر در وب با تلگرام فرق دارد:
      * ``{"answers": {"<key>": "<value>"}}`` — فرمِ فیلد به فیلد
      * ``{"text": "..."}``                    — یک متنِ آزاد، مثل تلگرام
    فیلدِ خالی «بی‌جواب» می‌ماند و بعداً دوباره پرسیده می‌شود.
    """
    from app.models.clarification import Clarification

    c = await db.get(Clarification, int(clarification_id))
    if c is None:
        raise HTTPException(status_code=404, detail="clarification not found")

    answers = payload.get("answers")
    text = str(payload.get("text") or "")
    if isinstance(answers, dict) and answers:
        valid = {q.get("key") for q in (c.questions or [])}
        mapped = {k: str(v) for k, v in answers.items() if k in valid and str(v or "").strip()}
    else:
        mapped = await clar.parse_reply(db, c, text)

    outcome = await clar.record_answers(db, c, mapped, raw=text or "(فرم برنامه)", via="app")
    filed = await clar.file_answers(db, c) if outcome["filled"] else []
    await db.commit()
    return {"ok": True, "success": True, **outcome, "filed": filed,
            "item": clar.to_dict(c), "feedback": clar.feedback_text(c, outcome, filed)}


@router.post("/api/clarifications/{clarification_id}/skip", tags=["clarifications"])
@handle_errors
async def skip_clarification(
    clarification_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """«مربوط نیست» — از چرخهٔ پرسش بیرون، ولی حذف نمی‌شود (قاعدهٔ قرنطینه)."""
    ok = await clar.skip(db, clarification_id)
    if not ok:
        raise HTTPException(status_code=404, detail="clarification not found")
    return {"ok": True, "success": True, "skipped": True}


@router.post("/api/clarifications/{clarification_id}/snooze", tags=["clarifications"])
@handle_errors
async def snooze_clarification(
    clarification_id: int,
    hours: int = 24,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    ok = await clar.snooze(db, clarification_id, hours=hours)
    if not ok:
        raise HTTPException(status_code=404, detail="clarification not found")
    return {"ok": True, "success": True, "snoozed_hours": hours}


@router.post("/api/clarifications/resend", tags=["clarifications"])
@handle_errors
async def resend_clarifications(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """همه را دوباره در تلگرام بفرست — وقتی پیام‌ها بالا رفته‌اند."""
    return {"ok": True, "success": True, **await clar.resend_all(db)}


@router.post("/api/clarifications/ask", tags=["clarifications"])
@handle_errors
async def ask_clarification(
    payload: Dict[str, Any] = Body(default={}),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """ساختِ دستیِ یک پرسش (برای آزمون و برای سرویس‌هایی که HTTP صدا می‌زنند)."""
    topic = str(payload.get("topic") or "").strip()
    if not topic:
        raise ValueError("topic is required")
    c = await clar.ask(
        db, topic=topic, context=str(payload.get("context") or ""),
        source=str(payload.get("source") or "manual"),
        source_ref=payload.get("source_ref"),
        target=payload.get("target"),
        questions=payload.get("questions"),
        priority=int(payload.get("priority") or 0),
        user_id=user_id,
    )
    await db.commit()
    if c is None:
        return {"ok": True, "success": True, "created": False, "reason": "no_ambiguity"}
    return {"ok": True, "success": True, "created": True, "item": clar.to_dict(c)}
