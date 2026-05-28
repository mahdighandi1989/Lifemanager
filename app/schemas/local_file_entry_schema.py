"""Pydantic schemas for /api/local-files (audit task 217909d2)."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class LocalFileEntryCreate(BaseModel):
    """Payload for POST /api/local-files.

    The client supplies the file metadata + extracted text; the
    backend runs an NLP pass to produce ``summary`` / ``keywords``.
    """

    source_path: str = Field(..., min_length=1, max_length=1024)
    mime_type: Optional[str] = Field(default=None, max_length=128)
    size_bytes: Optional[int] = Field(default=None, ge=0)
    extracted_text: Optional[str] = None


class LocalFileEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    source_path: str
    mime_type: Optional[str] = None
    size_bytes: Optional[int] = None
    summary: Optional[str] = None
    keywords: Optional[List[str]] = None
    created_at: Optional[datetime] = None


class ListSyncSummary(BaseModel):
    """Response shape for POST /api/lists/sync-from-file."""

    message: str
    list_id: Optional[int] = None
    created_items: int = 0
    updated_items: int = 0
    deleted_items: int = 0
