"""PersonProfile service (audit task 3cc09436).

CRUD + AI analysis for a person's behavioural profile. ``analyze_person``
reuses ``AIService.analyze_person_behavior`` (the relationship scorer) over the
person's interaction history, then persists the score / relationship_type and
appends an analysis snapshot to the behaviour log.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.interaction import Interaction
from app.models.person_profile import PersonProfile


async def get_or_create_profile(db: AsyncSession, *, person_id: int) -> PersonProfile:
    row = (
        await db.execute(
            select(PersonProfile).where(PersonProfile.person_id == person_id)
        )
    ).scalar_one_or_none()
    if row is None:
        row = PersonProfile(person_id=person_id)
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return row


async def set_note(db: AsyncSession, *, person_id: int, note: str) -> PersonProfile:
    """Persist a user note (AC6)."""
    profile = await get_or_create_profile(db, person_id=person_id)
    profile.user_notes = note
    await db.commit()
    await db.refresh(profile)
    return profile


async def analyze_person(db: AsyncSession, *, person_id: int, person_name: str = "") -> PersonProfile:
    """Run the AI relationship scorer over the person's interactions and persist
    the result (AC3). Appends a timestamped snapshot to ``behavior_log``."""
    from app.services.ai.model_service import AIService

    interactions = (
        await db.execute(select(Interaction).where(Interaction.person_id == person_id))
    ).scalars().all()
    result = await AIService(db).analyze_person_behavior(person_name, list(interactions))

    profile = await get_or_create_profile(db, person_id=person_id)
    profile.ai_score = float(result.get("ai_score", 0))
    profile.relationship_type = result.get("relationship_type", "neutral")
    profile.last_analyzed_at = datetime.now(timezone.utc)
    log = list(profile.behavior_log or [])
    log.append(
        {
            "type": "ai_analysis",
            "note": result.get("summary", ""),
            "ai_score": profile.ai_score,
            "relationship_type": profile.relationship_type,
            "at": profile.last_analyzed_at.isoformat(),
        }
    )
    profile.behavior_log = log[-50:]
    await db.commit()
    await db.refresh(profile)
    return profile


def serialize(profile: PersonProfile) -> dict:
    return {
        "id": profile.id,
        "person_id": profile.person_id,
        "ai_score": profile.ai_score,
        "user_notes": profile.user_notes,
        "behavior_log": profile.behavior_log or [],
        "relationship_type": profile.relationship_type,
        "last_analyzed_at": profile.last_analyzed_at.isoformat() if profile.last_analyzed_at else None,
    }
