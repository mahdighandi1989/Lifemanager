"""موتور نهادینه‌سازی — Directive + DirectiveCheckin.

The owner's scattered lists, writings and aspirations were static text to
re-read. This subsystem turns them into *living directives*: recurring
practices/commitments the app surfaces a few of each day, follows up on, and
tracks toward internalization — until a directive is "dissolved" (a stable
habit) and steps aside for the next. (owner vision 2026-07-21: «به من دستور
داده بشه و پیگیری بشه تا در من حل و نهادینه بشه… بدون اینکه دونه‌دونه
بخوانمشان»؛ لحن: مربیِ جدی، کانال: وب + تلگرام.)

  * ``Directive``        — one living command extracted from a source
    (todo item / personal writing / self-improvement list / a typed
    aspiration). Carries its domain, cadence, an internalization
    ``strength`` (0–100) and ``streak`` that rise on completion and fall on a
    miss, and a lifecycle ``status`` (proposed → active → graduated/archived).
  * ``DirectiveCheckin``  — one row per (directive, local date): the day the
    directive was *surfaced* as a command, and whether it was ``done`` (the
    follow-up answer). The daily command set is persisted here (lazy, unique
    per day) so the web brief, the page and the Telegram loop all agree on
    "today's commands" and the evening tick can mark the unanswered ones
    missed.

Both are scoped per user the same way the rest of the app is (a row written
under the anon scope stores ``user_id IS NULL``; ``_scope`` matches it when
``uid == 0``). Kept as plain VARCHAR status columns (not Enum) so a new state
never needs a cross-dialect migration.
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
from sqlalchemy.sql import func

from app.database import Base


# ── lifecycle status (Directive.status) ──────────────────────────────────────
DIRECTIVE_PROPOSED = "proposed"    # AI/heuristic proposed it; awaiting approval
DIRECTIVE_ACTIVE = "active"        # in the daily pool
DIRECTIVE_GRADUATED = "graduated"  # internalized ("در من حل شد") — no longer nagged
DIRECTIVE_ARCHIVED = "archived"    # set aside by the owner (recoverable, never deleted)

# ── cadence (how often a directive should be practiced) ──────────────────────
CADENCE_DAILY = "daily"
CADENCE_FEW_PER_WEEK = "few_per_week"  # ~3×/week
CADENCE_WEEKLY = "weekly"
CADENCE_ONCE = "once"  # a goal with a next step, not a recurring habit

# ── kind ─────────────────────────────────────────────────────────────────────
KIND_PRACTICE = "practice"  # recurring habit/practice
KIND_GOAL = "goal"          # a goal with a concrete next_step

# Domains the daily picker balances across (free-form Persian labels; the
# extractor tags each directive with one). Kept as data, not an enum.
DEFAULT_DOMAINS = (
    "معنوی", "خودسازی", "دانش", "سلامت", "مالی", "روابط", "آرزو", "کار",
)


class Directive(Base):
    __tablename__ = "directives"

    id = Column(Integer, primary_key=True, index=True)
    # Anon/legacy scope stores NULL; a real owner stores their id. FK SET NULL
    # mirrors todo_items.owner_id so the anon scope + tests-without-users work.
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    title = Column(Text, nullable=False)          # the command itself (Persian)
    detail = Column(Text, nullable=True)          # optional elaboration / the "why"
    domain = Column(String(32), nullable=False, server_default="خودسازی", default="خودسازی")
    # خداشهر (2026-07-22): persistent sahat assignment; NULL = derived from
    # ``domain`` (or the classifier) at read time; a stored value always wins.
    sahat = Column(String(16), nullable=True)
    cadence = Column(String(24), nullable=False, server_default=CADENCE_DAILY, default=CADENCE_DAILY)
    kind = Column(String(16), nullable=False, server_default=KIND_PRACTICE, default=KIND_PRACTICE)
    status = Column(String(16), nullable=False, server_default=DIRECTIVE_PROPOSED, default=DIRECTIVE_PROPOSED, index=True)

    # Internalization signal: rises on completion, falls on a miss. When it
    # holds high with a long streak the directive graduates ("dissolved").
    strength = Column(Integer, nullable=False, server_default="0", default=0)
    streak = Column(Integer, nullable=False, server_default="0", default=0)
    best_streak = Column(Integer, nullable=False, server_default="0", default=0)
    times_done = Column(Integer, nullable=False, server_default="0", default=0)
    times_missed = Column(Integer, nullable=False, server_default="0", default=0)
    # Owner-set importance; the picker weights it. 1..5, default 3.
    weight = Column(Integer, nullable=False, server_default="3", default=3)

    # For KIND_GOAL: the concrete next action to take.
    next_step = Column(Text, nullable=True)
    # Step-by-step guidance (layer 2, 2026-07-21): an ordered list of concrete
    # sub-steps / prerequisites, each ``{"text": str, "done": bool}``. The daily
    # command surfaces the FIRST undone step ("current step") so the owner is
    # told the exact next move, not just «فلان کن». NULL = not broken down yet.
    steps = Column(JSON, nullable=True)
    # Scheduling (layer 3, 2026-07-21): WHEN/WHERE the owner should do this.
    # ``preferred_time`` is a window key ("morning"/"afternoon"/"evening"/
    # "night") or "HH:MM"; the daily commands are ordered by it and a
    # once-a-day reminder fires when its window arrives. ``preferred_context``
    # is a free-text cue ("بعد از نماز صبح", "در دستشویی").
    preferred_time = Column(String(16), nullable=True)
    preferred_context = Column(Text, nullable=True)

    # Provenance so the owner can see WHERE a command came from (traceable,
    # never invented from nothing). e.g. source_type="todo_item", source_ref="42".
    source_type = Column(String(32), nullable=True)
    source_ref = Column(String(64), nullable=True)

    last_surfaced_at = Column(DateTime(timezone=True), nullable=True)
    last_done_at = Column(DateTime(timezone=True), nullable=True)
    graduated_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<Directive(id={self.id}, status={self.status!r}, "
            f"strength={self.strength}, streak={self.streak}, "
            f"title={self.title[:30]!r})>"
        )


class DirectiveCheckin(Base):
    """One (directive, local date) command surfacing + its follow-up answer."""

    __tablename__ = "directive_checkins"

    id = Column(Integer, primary_key=True, index=True)
    directive_id = Column(
        Integer, ForeignKey("directives.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    checkin_date = Column(Date, nullable=False, index=True)
    # The directive was shown as one of today's commands.
    surfaced = Column(Boolean, nullable=False, server_default="1", default=True)
    # Follow-up answer: NULL = not answered yet, True = done, False = missed.
    done = Column(Boolean, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint(
            "directive_id", "checkin_date", name="uq_directive_checkins_directive_date"
        ),
    )

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<DirectiveCheckin(directive_id={self.directive_id}, "
            f"date={self.checkin_date}, done={self.done})>"
        )
