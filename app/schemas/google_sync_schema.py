"""Pydantic schemas for /api/google/* (personal Gmail/Calendar sync).

No ``from __future__ import annotations`` here (pydantic v2 Body pitfall —
see experiences/pluggable-ai-provider-catalog-and-router.md).
"""
from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class GoogleTaskCreate(BaseModel):
    """Create a life task from an email/event — title defaults to the
    triage suggestion / event summary."""

    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=4000)
    priority: Optional[str] = Field(default=None, pattern="^(low|medium|high|critical)$")
    due_date: Optional[date] = None


class GoogleSettingsUpdate(BaseModel):
    enabled: Optional[bool] = None
    tz_offset_minutes: Optional[int] = Field(default=None, ge=-720, le=840)
    gmail_poll_minutes: Optional[int] = Field(default=None, ge=5, le=1440)
    gmail_fetch_limit: Optional[int] = Field(default=None, ge=5, le=100)
    calendar_poll_minutes: Optional[int] = Field(default=None, ge=5, le=1440)
    calendar_window_days: Optional[int] = Field(default=None, ge=1, le=60)
    triage_batch: Optional[int] = Field(default=None, ge=1, le=50)
    digest_enabled: Optional[bool] = None
    digest_hour: Optional[int] = Field(default=None, ge=0, le=23)
    digest_email_enabled: Optional[bool] = None
    event_remind_hours: Optional[int] = Field(default=None, ge=1, le=168)
    email_action_days: Optional[int] = Field(default=None, ge=1, le=60)
