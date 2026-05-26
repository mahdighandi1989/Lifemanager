"""Pydantic schemas for the Self-Improvement (خودسازی) module.

Split into three logical groups:

  * **Check-in I/O** — DailyUpdate (incoming PATCH/POST body), and
    SelfImprovementCheckInOut (the persisted row).
  * **Dashboard payload** — SelfImprovementOverviewOut groups the
    four lists + per-category stats so the frontend can render in
    one round-trip.
  * **Profile analytics** — UserProfileAnalyticsOut wraps the cached
    AI narrative + chart payload for the profile page.
"""
from __future__ import annotations

from datetime import date, datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


# --- Check-in I/O ----------------------------------------------------------

class SelfImprovementDailyUpdate(BaseModel):
    """One item's tick state for a specific date.

    ``checkin_date`` defaults to today on the server when omitted so
    the frontend can send a minimal `{item_id, status}` payload for
    the common case of "tick this right now".
    """

    item_id: int
    status: str = Field(
        ...,
        # Matches the constants in models.self_improvement; kept as a
        # string here so adding a new state doesn't need a schema bump.
        description="One of: pending, done, skipped, auto_done, auto_suggested",
    )
    checkin_date: Optional[date] = None
    note: Optional[str] = Field(default=None, max_length=2000)


class SelfImprovementBulkDailyUpdate(BaseModel):
    """Tick multiple items in one round-trip.

    The user said: "برخی کارها هم جوریه که ممکن تیک چند تارو بزنه" —
    sometimes one observed behaviour ticks several habit rows at once.
    The route applies them as a single transaction.
    """

    updates: List[SelfImprovementDailyUpdate] = Field(..., min_length=1)


class SelfImprovementCheckInOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    item_id: int
    checkin_date: date
    status: str
    ai_reason: Optional[str] = None
    ai_model: Optional[str] = None
    note: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


# --- Dashboard payload -----------------------------------------------------

class SelfImprovementItemStatus(BaseModel):
    """A single habit item enriched with today's check-in state.

    The frontend renders this directly as a row in the check-in
    table — content + checkbox + AI badge when status == auto_done.
    """

    item_id: int
    content: str
    description: Optional[str] = None
    status: str = "pending"
    is_auto: bool = False
    ai_reason: Optional[str] = None
    note: Optional[str] = None
    position: int = 0


class SelfImprovementCategorySection(BaseModel):
    """Grouped view: one category (e.g. willpower) with its items."""

    category: str  # 'willpower' | 'love_god' | 'fears' | 'muhasebe'
    label_fa: str
    list_id: int
    list_name: str
    items: List[SelfImprovementItemStatus] = Field(default_factory=list)
    # Quick stat: completed_today / total — convenient for the sidebar
    # progress badge without re-iterating items on the client.
    completed_today: int = 0
    total: int = 0


class SelfImprovementOverviewOut(BaseModel):
    """Single payload powering the Self-Improvement dashboard."""

    as_of: date
    sections: List[SelfImprovementCategorySection] = Field(default_factory=list)
    # Aggregate across all categories so the header card can show
    # "today: 12/80 done" without summing on the client.
    completed_today_total: int = 0
    items_total: int = 0


# --- Profile analytics -----------------------------------------------------

class WeeklyCompletionPoint(BaseModel):
    """One bar in the weekly-completion chart.

    ``date`` is exposed as a string (ISO format) because the value
    lives inside a JSON column on UserProfileAnalytics.payload —
    the JSON serializer rejects datetime.date and storing it as a
    string keeps both write and read paths simple.
    """

    date: str
    completed: int
    total: int
    pct: float


class CategoryStats(BaseModel):
    """Per-category roll-up: streak + 30-day completion rate."""

    category: str
    label_fa: str
    completed_last_30_days: int = 0
    total_opportunities_last_30_days: int = 0
    completion_pct_30d: float = 0.0
    current_streak_days: int = 0
    longest_streak_days: int = 0


class ProfileAnalyticsPayload(BaseModel):
    """Schema for the structured ``payload`` JSON on UserProfileAnalytics.

    Pydantic validates the shape we *write* here; reads tolerate
    missing keys because old rows may predate later additions.
    """

    per_category: List[CategoryStats] = Field(default_factory=list)
    weekly_completion: List[WeeklyCompletionPoint] = Field(default_factory=list)
    ai_recommendations: List[str] = Field(default_factory=list)


class UserProfileAnalyticsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    summary: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None
    last_refreshed_at: Optional[datetime] = None
    ai_model: Optional[str] = None
