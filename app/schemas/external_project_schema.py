"""Pydantic schemas for /api/external-projects (audit task d2146781).

Imports ``ExternalProjectConfig`` and ``ExternalProjectInfo`` from the
shared interface module (AC 3) so the integration surface stays
single-source-of-truth.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ExternalProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    provider: str = Field(..., min_length=1, max_length=64)
    external_id: Optional[str] = Field(default=None, max_length=255)
    base_url: Optional[str] = Field(default=None, max_length=512)
    api_key: Optional[str] = None
    workspace_id: Optional[str] = Field(default=None, max_length=255)


class ExternalProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    name: str
    provider: str
    external_id: Optional[str] = None
    base_url: Optional[str] = None
    workspace_id: Optional[str] = None
    created_at: Optional[datetime] = None
    # NB: api_key intentionally omitted from the response shape so a
    # GET never echoes the secret back.
