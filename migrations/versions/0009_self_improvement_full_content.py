"""Backfill the self-improvement module with the full content the user
   uploaded after the first cut.

Migration 0008 seeded four lists (muhasebe + willpower + love_god +
fears) with the items extracted from the first Google-Forms batch.
That batch was missing:

  * The 39-item "خودسازی - شخصیت مرد الهی" list (a brand-new form
    the user uploaded later — "شخصیت یک مرد الهی – مردِ خدا").
  * The long-form per-list descriptions the user wrote at the top of
    each form (938 chars for willpower, 2223 for fears, 1178 for the
    divine-man form, 833 for the muhasebe master).
  * The real "محاسبه میان و پایان هفته" item set — the original PDF
    couldn't be auto-OCR'd in the attachment pipeline so the
    placeholders we wrote were guesses. The re-uploaded PDF was
    tesseract-OCR'd and the 21 actual review items now live in
    _self_improvement_seed_data.MUHASEBE_ITEMS.

This migration applies all three fixes in one pass via the same
service-layer helper the runtime uses on Render's free tier (which
skips alembic). Idempotent — re-running is a no-op.

Revision ID: 0009_self_improvement_full_content
Revises: 0008_self_improvement_module
Create Date: 2026-05-26
"""
from typing import Sequence, Union

from alembic import op


revision: str = "0009_self_improvement_full_content"
down_revision: Union[str, None] = "0008_self_improvement_module"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Delegate the data fix to the runtime seeder.

    Reusing the runtime helper guarantees alembic-driven envs and
    free-tier startup-driven envs converge to the same state — and
    avoids duplicating the placeholder-detection logic in two places.
    The function is async; we drive it through a fresh AsyncSession
    against the alembic connection's URL.
    """
    import asyncio

    async def _apply() -> None:
        from app.database import SessionLocal
        from app.services.self_improvement_service import ensure_lists_seeded

        async with SessionLocal() as session:
            await ensure_lists_seeded(session)

    asyncio.run(_apply())


def downgrade() -> None:
    """No automatic rollback.

    The data we touch is shared TodoList/TodoItem rows that the user
    may have edited in-place. A hard reset is unsafe without manual
    intervention — drop the four خودسازی lists by name in psql if
    you genuinely want to undo this.
    """
    pass
