"""AIUsageLog — حسابداری مصرف AI (phase 1, 2026-07-20).

One row per inference call through the catalog gateway. The audit's
completeness critic flagged that automations ride the owner's PERSONAL
Claude subscription with zero usage visibility, no daily view, no brake.
This table is the ledger; ``/api/settings/ai-usage`` aggregates it.

Char counts (not provider token counts) — providers report tokens
inconsistently across vendors, chars/4 is a stable comparable estimate.
New table ⇒ registered in app/models/__init__.py (create_all) + alembic
0042 for the production path.
"""
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class AIUsageLog(Base):
    __tablename__ = "ai_usage_logs"

    id = Column(Integer, primary_key=True, index=True)
    task = Column(String(64), nullable=False, index=True)
    model = Column(String(160), nullable=True)
    provider = Column(String(64), nullable=True)
    ok = Column(Boolean, nullable=False, default=True, server_default="1")
    error = Column(String(300), nullable=True)
    prompt_chars = Column(Integer, nullable=False, default=0, server_default="0")
    output_chars = Column(Integer, nullable=False, default=0, server_default="0")
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
