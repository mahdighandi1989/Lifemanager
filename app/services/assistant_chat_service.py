"""دستیار گفت‌وگومحور سراسری (phase 4, audit #4).

One question in («وضعیت مالی‌ام چطوره؟», «این هفته چی عقب افتاده؟») —
one grounded Persian answer out, built from the app's LIVE data:
``get_user_data_context`` (tasks/projects/todos/notifications/accounts)
plus the command-center buckets (finance per-currency, calendar, people,
growth). Model routing goes through the catalog gateway with the
``chat`` task the owner can pin in AISettings.

Consumers: POST /api/ai/chat (web) and the Telegram ``/ask`` command —
the same brain answering on both surfaces.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

_MAX_CONTEXT_CHARS = 9000

_SYSTEM_FA = (
    "تو دستیار شخصی فارسی‌زبان مالک این برنامهٔ مدیریت زندگی هستی. "
    "با اتکا به دادهٔ زندهٔ زیر پاسخ بده — دقیق، کوتاه و کاربردی. "
    "اعداد مالی را همیشه با ارزشان بگو و ارزهای مختلف را با هم جمع نزن. "
    "اگر داده برای پاسخ کافی نیست، صادقانه بگو چه چیزی ثبت نشده است. "
    "پاسخ فقط فارسی."
)


def _trim(obj: Any, limit: int) -> str:
    text = json.dumps(obj, ensure_ascii=False, default=str)
    return text if len(text) <= limit else text[:limit] + "…[بریده شد]"


async def _live_context(db: AsyncSession, user_id: int) -> Dict[str, Any]:
    """Assemble a compact cross-domain snapshot. Every block fail-opens."""
    ctx: Dict[str, Any] = {}
    try:
        from app.services.ai.ai_data_access_service import get_user_data_context

        raw = await get_user_data_context(db, user_id=user_id)
        # Cap list sizes so one huge module can't crowd out the rest.
        for key, value in raw.items():
            ctx[key] = value[:25] if isinstance(value, list) else value
    except Exception as exc:
        logger.debug("chat context: data access skipped: %r", exc)
    try:
        from app.services.command_center_service import build_today

        today = await build_today(db, user_id)
        ctx["today"] = {
            "date": today.get("today"),
            "tasks": today.get("tasks", {}),
            "todo": today.get("todo", {}),
            "finance": today.get("finance", {}),
            "calendar": today.get("calendar", {}),
            "people": today.get("people", {}),
            "growth": today.get("growth", {}),
            "inbox_pending": (today.get("inbox") or {}).get("pending_count"),
        }
    except Exception as exc:
        logger.debug("chat context: build_today skipped: %r", exc)
    return ctx


async def answer_question(
    db: AsyncSession,
    *,
    user_id: int,
    question: str,
    history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """Answer one free-form question over the owner's live data.

    Returns ``{ok, text, model}``; with no usable model returns ``ok:
    False`` plus a honest Persian fallback in ``text`` (never raises).
    """
    question = (question or "").strip()
    if not question:
        return {"ok": False, "text": "سؤالی ننوشتی.", "model": None}
    context = await _live_context(db, user_id)
    convo = ""
    for turn in (history or [])[-6:]:
        role = "کاربر" if turn.get("role") == "user" else "دستیار"
        convo += f"\n{role}: {str(turn.get('content') or '')[:400]}"
    prompt = (
        "دادهٔ زندهٔ برنامه (JSON):\n"
        + _trim(context, _MAX_CONTEXT_CHARS)
        + (f"\n\nگفت‌وگوی قبلی:{convo}" if convo else "")
        + f"\n\nسؤال مالک: {question[:1000]}\n\nپاسخ فارسی:"
    )
    try:
        from app.services.ai.inference_gateway import complete

        res = await complete(
            db, prompt, task="chat", system=_SYSTEM_FA, max_tokens=800
        )
        if res.get("ok") and (res.get("text") or "").strip():
            return {"ok": True, "text": res["text"].strip(), "model": res.get("model")}
        reason = res.get("error") or "no_model"
    except Exception as exc:
        logger.debug("assistant chat inference failed: %r", exc)
        reason = str(exc)
    return {
        "ok": False,
        "model": None,
        "text": (
            "فعلاً مدل هوش مصنوعی در دسترس نیست (تنظیمات → هوش مصنوعی را "
            "بررسی کن). خلاصهٔ خام داده‌ها: "
            + _trim(context.get("today", {}), 700)
        ),
        "reason": reason,
    }
