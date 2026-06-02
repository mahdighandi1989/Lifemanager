"""AnalysisPrompt — the admin-managed global analysis prompt (AC 24-28).

Distinct from ``GlobalAnalysisPrompt`` (app/models/ai_provider.py): that row
backs the per-user, login-bypass-friendly editor under ``/ai/global-prompt``.
This table backs the **admin-gated** ``/ai/analysis_prompt`` endpoints, where a
non-admin caller gets 403 and only the admin can mutate the prompt. One row
holds the single active prompt; the GET endpoint serves an empty default when
none exists yet.
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.sql import func

from app.database import Base


class AnalysisPrompt(Base):
    __tablename__ = "analysis_prompts"

    id = Column(Integer, primary_key=True, index=True)
    prompt_text = Column(Text, nullable=False, default="")
    edited_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    last_edited_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
