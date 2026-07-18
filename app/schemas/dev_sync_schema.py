"""Pydantic schemas for the dev-center (/api/dev/*) routes.

NOTE: no ``from __future__ import annotations`` here — string annotations
break Body(...) TypeAdapters under pydantic v2 (see experiences/
pluggable-ai-provider-catalog-and-router.md).
"""
import re
from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class DevTokenUpdate(BaseModel):
    """PUT /api/dev/integrations/{provider} — empty string clears the key."""

    api_key: Optional[str] = Field(default=None, max_length=4096)
    is_enabled: Optional[bool] = None

    @field_validator("api_key")
    @classmethod
    def _no_inner_whitespace(cls, value: Optional[str]) -> Optional[str]:
        # A key with interior whitespace can never form a valid HTTP header —
        # h11 would reject it with an error message that EMBEDS the raw value
        # (token-leak risk). Refuse it at the door instead.
        if value is None:
            return value
        value = value.strip()
        if value and re.search(r"\s", value):
            raise ValueError("api_key must not contain whitespace")
        return value


class DevProjectPatch(BaseModel):
    linked_project_id: Optional[int] = None
    unlink: bool = False  # explicit — None means "not provided" above
    is_active: Optional[bool] = None


class DevServicePatch(BaseModel):
    auto_fetch_logs: Optional[bool] = None


class DevTaskCreate(BaseModel):
    """POST /api/dev/projects/{id}/create-task — a LIFE task about the
    project (رسیدگی/پیگیری), not an engineering ticket."""

    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=4000)
    priority: Optional[str] = Field(default=None, pattern="^(low|medium|high|critical)$")
    due_date: Optional[date] = None


class DevErrorPatch(BaseModel):
    """PATCH /api/dev/errors/{id} — manual status override."""

    status: str = Field(pattern="^(open|resolved|muted)$")


class DevLogsFetchRequest(BaseModel):
    service_ids: Optional[List[str]] = None
    limit: Optional[int] = Field(default=None, ge=1, le=500)


class DevSummaryGenerateRequest(BaseModel):
    summary_date: Optional[date] = None
    service_id: Optional[str] = None


class DevSettingsUpdate(BaseModel):
    enabled: Optional[bool] = None
    tz_offset_minutes: Optional[int] = Field(default=None, ge=-720, le=840)
    repo_sync_interval_minutes: Optional[int] = Field(default=None, ge=5, le=1440)
    service_sync_interval_minutes: Optional[int] = Field(default=None, ge=5, le=1440)
    log_poll_seconds: Optional[int] = Field(default=None, ge=15, le=3600)
    log_fetch_limit: Optional[int] = Field(default=None, ge=10, le=500)
    retention_hours: Optional[int] = Field(default=None, ge=6, le=720)
    cleanup_interval_minutes: Optional[int] = Field(default=None, ge=30, le=1440)
    summary_enabled: Optional[bool] = None
    summary_hour: Optional[int] = Field(default=None, ge=0, le=23)
    error_attention_threshold: Optional[int] = Field(default=None, ge=1, le=1000)
    error_resolve_hours: Optional[int] = Field(default=None, ge=1, le=720)
    stale_repo_days: Optional[int] = Field(default=None, ge=1, le=365)
