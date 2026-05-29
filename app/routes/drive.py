"""/api/drive — DriveFile listing + upload metadata (audit task 7367c6f0, AC4/AC5).

The actual blob push to Google Drive is gated on operator OAuth credentials
(app/services/google_drive_service); until those are configured the upload
endpoint records the metadata row (drive_file_id stays null) so the file is
tracked and a later credentialed sync can fill in the Drive id/link.
"""
from typing import List, Optional

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.drive_file import DriveFile

router = APIRouter()


class DriveFileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    mime_type: Optional[str] = None
    drive_file_id: Optional[str] = None
    drive_link: Optional[str] = None
    storage_location: str = "local"
    storage_tier: str
    extracted_text: Optional[str] = None


class DriveUploadRequest(BaseModel):
    filename: str
    mime_type: Optional[str] = None


@router.get("/api/drive/files", response_model=List[DriveFileResponse], tags=["drive"])
@handle_errors
async def list_drive_files(
    q: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> List[DriveFile]:
    """AC5: list the user's Drive files, optionally filtered by ?q= (filename
    substring search)."""
    stmt = select(DriveFile).where(DriveFile.user_id == user_id)
    if q:
        stmt = stmt.where(DriveFile.filename.ilike(f"%{q}%"))
    return list((await db.execute(stmt)).scalars().all())


@router.post(
    "/api/drive/upload",
    response_model=DriveFileResponse,
    status_code=201,
    tags=["drive"],
)
@handle_errors
async def upload_drive_file(
    payload: DriveUploadRequest = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> DriveFile:
    """AC4/AC6: receive a file's metadata and persist a DriveFile row. The push
    to Google Drive happens once operator credentials exist; the metadata is
    stored now regardless so nothing is lost. For audio/image files we extract
    text up front (AC6) so it's searchable even before the blob migrates."""
    from app.services.transcription_service import extract_text

    extracted = extract_text(payload.filename, mime_type=payload.mime_type)
    row = DriveFile(
        user_id=user_id,
        filename=payload.filename,
        mime_type=payload.mime_type,
        storage_location="local",
        storage_tier="hot",
        extracted_text=extracted,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


@router.get("/api/drive/folders", tags=["drive"])
@handle_errors
async def drive_folder_layout() -> dict:
    """AC7: the Drive folder layout — a single app root with per-data-type
    subfolders that every migrated file lands under."""
    from app.services.google_drive_service import (
        APP_ROOT_FOLDER_NAME,
        DEFAULT_SUBFOLDERS,
    )

    return {
        "root_folder": APP_ROOT_FOLDER_NAME,
        "subfolders": list(DEFAULT_SUBFOLDERS),
    }
