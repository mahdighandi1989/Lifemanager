"""/api/self-improvement endpoints — daily habits + profile analytics.

Routes:
  * GET    /api/self-improvement/overview
      Bundle of the four خودسازی sub-lists with today's per-item
      check-in state. Powers the dashboard page in one round-trip.

  * POST   /api/self-improvement/daily-update
      Tick (or untick) one or many items for a given date. The body
      may carry either a single ``SelfImprovementDailyUpdate`` or a
      ``SelfImprovementBulkDailyUpdate`` envelope — the route handles
      both shapes to match the user's "sometimes one observation
      ticks multiple rows" requirement.

  * GET    /api/self-improvement/profile-analytics
      Return the cached ``UserProfileAnalytics`` row for the user;
      auto-generates the first version on demand if it doesn't exist
      yet (deterministic stats only — the AI narrative is filled by
      the Celery task).

  * POST   /api/self-improvement/profile-analytics/refresh
      Force-rebuild the analytics row (stats + AI narrative). Useful
      for the "refresh" button on the profile page.

Auth: every endpoint requires a valid bearer token via
``get_current_user``. The route reads ``user.id`` and never trusts
a user_id from the request body.
"""
from __future__ import annotations

import logging
from typing import Any, Dict, Union

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.middleware import handle_errors
from app.models.user import User
from app.schemas.self_improvement_schema import (
    SelfImprovementBulkDailyUpdate,
    SelfImprovementCheckInOut,
    SelfImprovementDailyUpdate,
    SelfImprovementOverviewOut,
    UserProfileAnalyticsOut,
)
from app.services import self_improvement_service

logger = logging.getLogger(__name__)

router = APIRouter()


def _serialize_checkin(row) -> dict:
    return {
        "id": row.id,
        "user_id": row.user_id,
        "item_id": row.item_id,
        "checkin_date": row.checkin_date.isoformat(),
        "status": row.status,
        "ai_reason": row.ai_reason,
        "ai_model": row.ai_model,
        "note": row.note,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


# --- GET overview ----------------------------------------------------------

@router.get(
    "/api/self-improvement/overview",
    tags=["self-improvement"],
    response_model=SelfImprovementOverviewOut,
)
@handle_errors
async def get_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Dashboard payload — four sections + aggregate totals.

    Lazily backfills today's pending rows on the first read so the
    user never sees an empty table after midnight even if the Celery
    refresh hasn't run yet.
    """
    await self_improvement_service.refresh_daily_pending_rows(
        db, user_id=current_user.id
    )
    return await self_improvement_service.build_overview(
        db, user_id=current_user.id
    )


# --- POST daily-update -----------------------------------------------------

@router.post(
    "/api/self-improvement/daily-update",
    status_code=status.HTTP_200_OK,
    tags=["self-improvement"],
)
@handle_errors
async def post_daily_update(
    payload: Union[SelfImprovementBulkDailyUpdate, SelfImprovementDailyUpdate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Tick / untick one or many items.

    Accepts either a single update or a `{updates: [...]}` envelope.
    Returns the persisted check-in rows + a count for convenience.
    """
    if isinstance(payload, SelfImprovementBulkDailyUpdate):
        updates = [u.model_dump() for u in payload.updates]
    else:
        updates = [payload.model_dump()]

    rows = await self_improvement_service.bulk_upsert_checkins(
        db, user_id=current_user.id, updates=updates,
    )
    return {
        "applied": len(rows),
        "checkins": [_serialize_checkin(r) for r in rows],
    }


# --- GET profile-analytics --------------------------------------------------

@router.get(
    "/api/self-improvement/profile-analytics",
    tags=["self-improvement"],
    response_model=UserProfileAnalyticsOut,
)
@handle_errors
async def get_profile_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Return cached analytics; compute deterministic part on first read.

    The AI narrative is left blank on first read — the user (or the
    nightly Celery task) calls ``/refresh`` to populate it.
    """
    row = await self_improvement_service.get_profile_analytics(
        db, user_id=current_user.id
    )
    if row is None:
        # Materialise an empty-state row so the frontend always gets
        # a 200 with a real shape (chart-ready stats, no summary yet).
        payload = await self_improvement_service.compute_basic_analytics(
            db, user_id=current_user.id,
        )
        row = await self_improvement_service.upsert_profile_analytics(
            db,
            user_id=current_user.id,
            summary=None,
            payload=payload,
            ai_model=None,
        )
    return {
        "user_id": row.user_id,
        "summary": row.summary,
        "payload": row.payload,
        "last_refreshed_at": row.last_refreshed_at.isoformat() if row.last_refreshed_at else None,
        "ai_model": row.ai_model,
    }


@router.post(
    "/api/self-improvement/profile-analytics/refresh",
    status_code=status.HTTP_200_OK,
    tags=["self-improvement"],
    response_model=UserProfileAnalyticsOut,
)
@handle_errors
async def refresh_profile_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Force-rebuild stats + AI narrative."""
    row = await self_improvement_service.regenerate_ai_narrative(
        db, user_id=current_user.id,
    )
    return {
        "user_id": row.user_id,
        "summary": row.summary,
        "payload": row.payload,
        "last_refreshed_at": row.last_refreshed_at.isoformat() if row.last_refreshed_at else None,
        "ai_model": row.ai_model,
    }
