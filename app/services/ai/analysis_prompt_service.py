"""Admin-managed global analysis prompt service (audit task 1a08ded2 AC 24-28).

Wraps the single :class:`app.models.analysis_prompt.AnalysisPrompt` row behind
``get_analysis_prompt`` / ``set_analysis_prompt`` so the route layer
(``/ai/analysis_prompt``) and any AI pipeline that wants the active prompt share
one access path. ``get_analysis_prompt`` never raises on an empty table — it
returns ``None`` and the caller renders the empty default — so the first GET
before anyone has saved a prompt still answers 200.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analysis_prompt import AnalysisPrompt


async def get_analysis_prompt(db: AsyncSession) -> Optional[AnalysisPrompt]:
    """Return the single AnalysisPrompt row, or ``None`` if none saved yet."""
    result = await db.execute(select(AnalysisPrompt))
    return result.scalars().first()


async def set_analysis_prompt(
    db: AsyncSession, *, prompt_text: str, user_id: Optional[int] = None
) -> AnalysisPrompt:
    """Upsert the single AnalysisPrompt row and return the persisted instance.

    ``last_edited_at`` is maintained by the model's ``onupdate``/server default,
    and ``edited_by_user_id`` records who last touched it.
    """
    prompt = await get_analysis_prompt(db)
    if prompt is None:
        prompt = AnalysisPrompt(prompt_text=prompt_text, edited_by_user_id=user_id)
        db.add(prompt)
    else:
        prompt.prompt_text = prompt_text
        prompt.edited_by_user_id = user_id
    await db.commit()
    await db.refresh(prompt)
    return prompt
