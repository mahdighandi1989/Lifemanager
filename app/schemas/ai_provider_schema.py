"""Pydantic schemas for /api/ai/providers (audit task 1a08ded2)."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AIProviderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = None
    is_enabled: bool = True
    # Routing config (audit task 1a08ded2 AC5/7). api_key is write-only — it's
    # encrypted at rest and never returned; the response exposes has_api_key.
    base_url: Optional[str] = Field(default=None, max_length=512)
    api_key: Optional[str] = Field(default=None, max_length=512)
    default_model: Optional[str] = Field(default=None, max_length=120)


class AIProviderUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = None
    is_enabled: Optional[bool] = None
    base_url: Optional[str] = Field(default=None, max_length=512)
    api_key: Optional[str] = Field(default=None, max_length=512)
    default_model: Optional[str] = Field(default=None, max_length=120)


class AIProviderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    is_enabled: bool
    base_url: Optional[str] = None
    default_model: Optional[str] = None
    # Never expose the raw/encrypted key — only whether one is set.
    has_api_key: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class GlobalAnalysisPromptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    prompt_text: str
    edited_by_user_id: Optional[int] = None
    last_edited_at: Optional[datetime] = None


class GlobalAnalysisPromptUpdate(BaseModel):
    prompt_text: str = Field(..., max_length=10_000)
