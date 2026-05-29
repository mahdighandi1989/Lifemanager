"""/api/files/{id} — fetch a stored file, resolving Drive-tiered blobs.

Audit task 7367c6f0 AC5. When a file has been cold-tiered out
(storage_location='drive'), this returns the Drive download/preview link (the
client follows it) and refreshes ``last_accessed_at`` so the cold-tiering
policy sees the access. Local files return their own metadata. Reading a file
"warms" it — which is exactly what should reset the 30-day cold clock.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.drive_file import DriveFile

router = APIRouter()


@router.get("/api/files/{file_id}", tags=["drive", "files"])
@handle_errors
async def get_file(
    file_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Return a file's access info. For Drive-tiered files the response carries
    the ``drive_link`` to download/preview from Google Drive (AC5); for local
    files it carries the stored metadata. Touches ``last_accessed_at`` so the
    read resets the cold-tiering clock."""
    row = (
        await db.execute(
            select(DriveFile).where(
                DriveFile.id == file_id, DriveFile.user_id == user_id
            )
        )
    ).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="File not found")

    row.last_accessed_at = datetime.now(timezone.utc)
    await db.commit()

    return {
        "id": row.id,
        "filename": row.filename,
        "storage_location": row.storage_location,
        "drive_file_id": row.drive_file_id,
        "drive_link": row.drive_link,
        # The URL the client should hit to obtain the bytes. For a Drive-tiered
        # file that's the Drive link; local files are served from the app.
        "download_url": row.drive_link if row.storage_location == "drive" else f"/api/files/{row.id}/raw",
        "extracted_text": row.extracted_text,
    }
