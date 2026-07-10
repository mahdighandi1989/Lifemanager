"""Seed the owner's long-form personal writings (نوشته‌های من).

Data: app/services/_personal_writings_seed_data.py — generated from the Word
documents with a merge gate proving exact-duplicate-only dedup (see
scripts/generate_writings_seed.py). Idempotent per title: an existing writing
with the same title is never touched, so user edits survive redeploys.
"""
from __future__ import annotations

import logging
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.personal_writing import PersonalWriting
from app.services._personal_writings_seed_data import PW_WRITINGS

logger = logging.getLogger(__name__)


async def ensure_personal_writings_seeded(db: AsyncSession) -> dict:
    added = 0
    for spec in PW_WRITINGS:
        existing = (await db.execute(
            select(PersonalWriting).where(PersonalWriting.title == spec["title"])
        )).scalars().first()
        if existing is not None:
            continue
        db.add(PersonalWriting(
            title=spec["title"],
            category=spec.get("category"),
            body=spec["body"],
            source_note=spec.get("source_note"),
            written_at=date.fromisoformat(spec["written_at"]) if spec.get("written_at") else None,
            sort_order=spec.get("sort_order", 0),
        ))
        added += 1
    await db.commit()
    if added:
        logger.info("personal writings seeded: %d", added)
    return {"writings_added": added}
