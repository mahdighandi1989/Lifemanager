"""/api/local-files — user-uploaded file metadata + extracted content
(audit task 217909d2).

Browsers can't scan a user's filesystem; this is where the user (or
a future desktop agent) hands content over. POST creates an entry
and triggers an NLP enrichment pass; GET lists entries for the
current user.
"""
from typing import List

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
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[dict]:
    entries = await local_file_service.list_entries(db, user_id=user_id)
    return [local_file_service.serialize(e) for e in entries]
