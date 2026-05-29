"""OversightTask — an oversight action against an external project connection.

Audit task d2146781 (AC 2). Rows capture the cross-project management work the
oversight layer schedules/produces: time-allocation reviews, neglected-project
flags, etc., optionally carrying an ``analysis_result`` payload.
"""
from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.sql import func

from app.database import Base


class OversightTask(Base):
    __tablename__ = "oversight_tasks"

    id = Column(Integer, primary_key=True, index=True)
    external_project_id = Column(
        Integer,
        ForeignKey("external_project_connections.id", ondelete="CASCADE"),
        index=True,
        nullable=True,
    )
    task_type = Column(String(64), nullable=False, default="review")
    status = Column(String(32), nullable=False, default="pending")
    priority = Column(String(16), nullable=False, default="normal")
    due_date = Column(DateTime(timezone=True), nullable=True)
    analysis_result = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
