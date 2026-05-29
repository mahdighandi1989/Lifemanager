"""GlobalSetting — a simple key/value store for app-wide settings.

Audit task 1a08ded2 (AC 56). Backs admin-managed singletons like the global
analysis prompt (key='global_analysis_prompt'); ``key`` is UNIQUE so each
setting has exactly one row.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class GlobalSetting(Base):
    __tablename__ = "global_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(128), nullable=False, unique=True, index=True)
    value = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
