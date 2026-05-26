"""Self-Improvement (خودسازی) tracking models.

The user's request: track daily completion of a curated set of
habits across three categories — willpower, love-of-God, fears —
plus a master "Mid- and End-of-Week Calculation List" (محاسبه).
The habit *content* lives in the existing TodoList/TodoItem
infrastructure (so the user can edit, re-order, share with other
lists, etc. using the same UI). What's new here is the *daily
status layer* on top of that content:

  * ``SelfImprovementCheckIn`` — one row per (user, todo_item, date)
    recording today's tick state. The reason we don't just flip
    ``TodoItem.is_completed`` is that these are recurring habits:
    "did Quran today" should reset to unchecked each morning, but
    we still want the long-term history (a 30-day streak, an AI
    analysis of which weeks went well).

  * ``UserProfileAnalytics`` — aggregated, AI-generated narrative
    + a ``payload`` JSON blob with chart-ready stats (per-category
    streaks, completion percentages, weekly trends). Refreshed by
    the Celery analytics task; cached so the frontend dashboard can
    render without re-running the analysis on every page load.

Both models are scoped per-user. The check-in row is unique per
(user, item, date) so accidental double-submits are no-ops at the
DB layer.
"""
from __future__ import annotations

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


# Status values stored in SelfImprovementCheckIn.status. Kept as a
# plain VARCHAR (not Enum) so adding a new state later doesn't need
# a DB migration on every dialect.
CHECKIN_STATUS_PENDING = "pending"
CHECKIN_STATUS_DONE = "done"
CHECKIN_STATUS_SKIPPED = "skipped"
CHECKIN_STATUS_AUTO_DONE = "auto_done"  # ticked by the AI on the user's behalf
CHECKIN_STATUS_AUTO_SUGGESTED = "auto_suggested"  # AI suggested but not committed


class SelfImprovementCheckIn(Base):
    """A single user's tick state for one habit on one specific date.

    Created lazily: the daily Celery refresh task can pre-create
    rows in the ``pending`` state for every active habit, or rows
    can be created on demand the first time the user (or the AI)
    interacts with the item that day. The UNIQUE constraint on
    (user, item, date) makes both paths safe.
    """

    __tablename__ = "self_improvement_checkins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # The TodoItem that this check-in is for. We deliberately don't
    # store the category here — the item's containing TodoList(s)
    # already encode that, and the service layer derives the category
    # from CATEGORY_BY_LIST_NAME at query time.
    item_id = Column(
        Integer,
        ForeignKey("todo_items.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # The day this check-in applies to. Stored as a plain Date so
    # "yesterday's check-in" is unambiguous across timezones — the
    # service layer normalises to the user's local date before
    # writing.
    checkin_date = Column(Date, nullable=False, index=True)
    status = Column(
        String(32),
        nullable=False,
        server_default=CHECKIN_STATUS_PENDING,
        default=CHECKIN_STATUS_PENDING,
    )
    # When the AI ticked this on the user's behalf, ``ai_reason``
    # explains why so the user can audit it (e.g. "ticked because
    # the user logged 30 min of Quran reading via the planner").
    ai_reason = Column(Text, nullable=True)
    # The model that wrote this check-in (for auditing AI changes).
    # NULL when the user clicked the box themselves.
    ai_model = Column(String(128), nullable=True)
    note = Column(Text, nullable=True)  # optional user-supplied note
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint(
            "user_id", "item_id", "checkin_date",
            name="uq_self_improvement_checkins_user_item_date",
        ),
    )

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<SelfImprovementCheckIn(user_id={self.user_id}, "
            f"item_id={self.item_id}, date={self.checkin_date}, "
            f"status={self.status!r})>"
        )


class UserProfileAnalytics(Base):
    """AI-generated narrative + chart-ready stats for one user.

    There's exactly one row per user (enforced by UNIQUE on user_id).
    Refreshed by the periodic Celery task ``run_self_improvement_analytics``.
    The frontend reads this row directly — we don't recompute on
    request because the AI call is expensive and the data is by
    nature lagging (yesterday's history doesn't change between page
    loads).

    ``payload`` is a JSON blob with whatever the analytics task
    produces; we keep it schemaless because the chart definitions
    will evolve faster than the DB.
    """

    __tablename__ = "user_profile_analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    # AI-written summary of the user's recent progress (Persian).
    summary = Column(Text, nullable=True)
    # Free-form bag of analytics. Expected keys (best-effort, not
    # validated): ``per_category`` (dict[category -> stats]),
    # ``weekly_completion`` (list[date,pct]), ``streaks`` (dict),
    # ``ai_recommendations`` (list[str]).
    payload = Column(JSON, nullable=True)
    last_refreshed_at = Column(DateTime(timezone=True), nullable=True)
    # The AI model that produced the most recent ``summary`` —
    # exposed in the UI so the user knows what wrote it.
    ai_model = Column(String(128), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<UserProfileAnalytics(user_id={self.user_id}, "
            f"last_refreshed_at={self.last_refreshed_at})>"
        )
