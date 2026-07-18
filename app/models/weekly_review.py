"""WeeklyReview — «مرور هفتگی» stored reports (phase 4 of the daily-flow roadmap).

One row per generated weekly review: the 7-day window it covers,
``stats`` (JSON — activity counts per entity/action, tasks
created/completed, current overdue list, inbox funnel, writings, …),
the AI ``narrative`` (Persian; fail-open — when no text model is
configured the narrative is a deterministic stats summary and
``ai_model`` stays NULL, the same provenance rule the brain dashboard
and the inbox triage follow), and delivery bookkeeping.

New table ⇒ created by ``Base.metadata.create_all()`` at startup (model
registered in app/models/__init__.py) + alembic 0037 for the production
path. No startup ALTER needed.
"""
from sqlalchemy import JSON, Column, Date, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class WeeklyReview(Base):
    __tablename__ = "weekly_reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    week_start = Column(Date, nullable=False, index=True)
    week_end = Column(Date, nullable=False)
    stats = Column(JSON, nullable=True)
    narrative = Column(Text, nullable=True)
    ai_model = Column(String(120), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    def __repr__(self) -> str:
        return f"<WeeklyReview(id={self.id}, week={self.week_start}..{self.week_end})>"
