"""/api/files/{id} — fetch a stored file, resolving Drive-tiered blobs.

Audit task 7367c6f0 AC5. When a file has been cold-tiered out
(storage_location='drive'), this returns the Drive download/preview link (the
client follows it) and refreshes ``last_accessed_at`` so the cold-tiering
policy sees the access. Local files return their own metadata. Reading a file
"warms" it — which is exactly what should reset the 30-day cold clock.
"""
import io
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse, RedirectResponse, StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.drive_file import DriveFile

logger = logging.getLogger(__name__)

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


@router.get("/api/files/{file_id}/raw", tags=["drive", "files"])
@handle_errors
async def get_file_raw(
    file_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Return the file's content representation (audit task 7367c6f0 AC5/Step7).

    This app stores metadata + extracted TEXT only (never raw bytes — AC8: "نه
    اینکه فایل رو دانلود بکنه ... به صورت متنی"). So for a Drive-tiered file we
    hand back the Drive link to fetch the blob; for a local file we return the
    extracted text (the textual form). Touches last_accessed_at."""
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
    if row.storage_location == "drive" and row.drive_link:
        return {"id": row.id, "kind": "drive_link", "drive_link": row.drive_link}
    return {"id": row.id, "kind": "text", "content": row.extracted_text or ""}


@router.get("/api/files/{file_id}/download", tags=["drive", "files"])
@handle_errors
async def download_file(
    file_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    """Actually fetch a file's bytes and return them THROUGH the app (audit task
    7367c6f0 AC5 — "باید بتونم فراخوانیش کنم و ببینمش").

    Resolution order for a Drive-tiered file:
      1. Drive connected → stream the real bytes from Google Drive
         (``google_drive_service.download_file`` over the live client).
      2. Drive not connected but a share link exists → 302 to the Drive link so
         the capability still works (degrade-gracefully).
    A local file has no raw bytes stored — only the extracted text — so it is
    returned as a text/plain body. Touches ``last_accessed_at`` (warms the row)."""
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

    if row.storage_location == "drive" and row.drive_file_id:
        try:
            from app.services import drive_settings_service as dss
            from app.services import google_drive_service
            from app.services.google_api_client import build_drive_client

            drive_client = await build_drive_client(db)
            if drive_client is not None:
                refresh_token = await dss.resolve_refresh_token(db)
                data = await google_drive_service.download_file(
                    refresh_token=refresh_token,
                    drive_file_id=row.drive_file_id,
                    client=drive_client,
                )
                if isinstance(data, (bytes, bytearray)):
                    stream = io.BytesIO(bytes(data))
                else:
                    stream = data  # already a file-like / stream
                return StreamingResponse(
                    stream,
                    media_type=row.mime_type or "application/octet-stream",
                    headers={
                        "Content-Disposition": f'attachment; filename="{row.filename}"'
                    },
                )
        except Exception as exc:
            logger.warning("drive download failed for file %s (falling back to link): %r", row.id, exc)
        # Not connected (or the live fetch failed) → hand off to the share link.
        if row.drive_link:
            return RedirectResponse(url=row.drive_link, status_code=302)
        raise HTTPException(status_code=502, detail="Drive file is unavailable")

    # Local file: only the extracted text is stored — return it as the body.
    return PlainTextResponse(row.extracted_text or "")
