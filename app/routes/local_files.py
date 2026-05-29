"""/api/local-files — user-uploaded file metadata + extracted content
(audit task 217909d2).

Browsers can't scan a user's filesystem; this is where the user (or
a future desktop agent) hands content over. POST creates an entry
and triggers an NLP enrichment pass; GET lists entries for the
current user.
"""
from typing import List, Optional

from fastapi import APIRouter, Body, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.schemas.local_file_entry_schema import (
    LocalFileEntryCreate,
    LocalFileEntryResponse,
)
from app.services import local_file_service


router = APIRouter()


@router.post(
    "/api/local-files",
    response_model=LocalFileEntryResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["local-files"],
)
@handle_errors
async def create_local_file_entry(
    payload: LocalFileEntryCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    entry = await local_file_service.create_entry(
        db, user_id=user_id, payload=payload
    )
    return local_file_service.serialize(entry)


@router.get(
    "/api/local-files",
    response_model=List[LocalFileEntryResponse],
    tags=["local-files"],
)
@handle_errors
async def list_local_file_entries(
    q: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[dict]:
    """List the caller's files. ``?q=`` is a free-text search over path /
    summary / keywords / extracted_text (audit task 217909d2 AC7 — "فیلم ایرانی"
    style search), not just an exact filter."""
    entries = await local_file_service.list_entries(db, user_id=user_id)
    if q:
        needle = q.strip().lower()
        entries = [
            e for e in entries
            if needle in " ".join(
                str(x or "") for x in (e.source_path, e.summary, e.keywords, e.extracted_text)
            ).lower()
        ]
    return [local_file_service.serialize(e) for e in entries]
