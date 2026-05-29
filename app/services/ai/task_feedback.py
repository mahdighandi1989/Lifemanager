"""Dynamic, prompt-framed task feedback (audit task e606cca6 Steps 7-8).

The memo asked that the configured model react to the user's tasks *dynamically*
(non-hardcoded) and *within the editable prompt box* — see the full context, no
token cap, and give proactive feedback. The route previously emitted a fixed
Persian template. This helper assembles the user's editable global prompt + the
full task context + detected patterns and runs it through the configured
provider (resolve_provider_routing → AIService.generate_text). When a real model
answers it's used verbatim; offline / no-key it falls back to the deterministic
text, so the endpoint never breaks.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def _load_global_prompt(db: AsyncSession) -> str:
    """The user's editable analysis prompt box (empty until first set)."""
    try:
        from app.models.ai_provider import GlobalAnalysisPrompt

        gp = (await db.execute(select(GlobalAnalysisPrompt))).scalars().first()
        return (gp.prompt_text or "") if gp is not None else ""
    except Exception:
        return ""


def _is_model_output(text: str) -> bool:
    """A real provider answer (not the [ai-placeholder] / [ai-error] markers)."""
    return bool(text) and not text.startswith("[ai-")


async def generate_task_feedback(
    db: AsyncSession,
    *,
    user_id: int,
    context: dict,
    analysis: dict,
    fallback: str,
    task_id: Optional[int] = None,
) -> dict:
    """Return ``{feedback, model_generated}``. Sends the full context through the
    configured model within the editable prompt box; uses ``fallback`` when no
    real model is available (no token cap on the assembled prompt — AC8)."""
    global_prompt = await _load_global_prompt(db)
    parts = []
    if global_prompt:
        parts.append(global_prompt)
    parts.append(
        f"وضعیت تسک‌ها: کل={context.get('total', 0)}، انجام‌شده={context.get('completed', 0)}، "
        f"در انتظار={context.get('pending', 0)}، عقب‌افتاده={context.get('overdue', 0)}."
    )
    if analysis.get("patterns"):
        parts.append("الگوهای کاری: " + " | ".join(analysis["patterns"]))
    if task_id is not None:
        parts.append(f"تمرکز ویژه روی تسک #{task_id}.")
    parts.append("بر اساس موارد بالا، یک بازخورد کوتاه، دقیق و عملی به فارسی بده.")
    merged = "\n".join(parts)

    try:
        from app.services.ai.provider_service import resolve_provider_routing
        from app.services.ai_service import AIService

        model, api_key, base_url = await resolve_provider_routing(db, user_id=user_id)
        out = await AIService(db).generate_text(
            prompt=merged, model=model, api_key=api_key, base_url=base_url
        )
        text = out.get("generated_text", "")
    except Exception:
        text = ""

    if _is_model_output(text):
        return {"feedback": text, "model_generated": True}
    return {"feedback": fallback, "model_generated": False}
