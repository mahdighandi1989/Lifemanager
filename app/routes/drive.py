"""/api/drive — DriveFile listing + upload metadata (audit task 7367c6f0, AC4/AC5).

The actual blob push to Google Drive is gated on operator OAuth credentials
(app/services/google_drive_service); until those are configured the upload
endpoint records the metadata row (drive_file_id stays null) so the file is
tracked and a later credentialed sync can fill in the Drive id/link.
"""
import logging
from typing import List, Optional

from fastapi import APIRouter, Body, Depends, File, Form, HTTPException, Request, UploadFile, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.models.drive_file import DriveFile

logger = logging.getLogger(__name__)

router = APIRouter()


async def _require_drive_operator(request: Request, db: AsyncSession) -> None:
    """Gate the Drive *management* mutations (connect/disconnect/sync/test).

    Admins always pass. In a pure single-tenant deployment (no ADMIN_EMAILS and
    auth not enforced) the sole operator passes too, so the personal app's Drive
    panel works without a Google sign-in first. Mirrors the same helper in
    auth_google.py."""
    from app.config import settings
    from app.dependencies.auth import _extract_token, _resolve_token_to_user, is_admin

    tok = _extract_token(request)
    user = await _resolve_token_to_user(tok, db) if tok else None
    if user is not None and is_admin(user):
        return
    if not settings.admin_emails_list and not settings.REQUIRE_AUTH:
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Drive connection management requires an admin account",
    )


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
    """AC5/AC9: list the user's Drive files. ``?q=`` searches BOTH the filename
    AND the extracted text (so an audio transcript / image caption is findable),
    not filename-only."""
    from sqlalchemy import or_

    stmt = select(DriveFile).where(DriveFile.user_id == user_id)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(
            or_(DriveFile.filename.ilike(like), DriveFile.extracted_text.ilike(like))
        )
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

    # Log the file to the central LifeManagerIndex sheet (audit task 7367c6f0
    # Step 4 — "توی شیت باید همه چیزا ثبت بشه"). Best-effort: a no-op without
    # Sheets credentials, so the upload never fails on the ledger write.
    try:
        from app.services.sheets_service import record_index_entry

        await record_index_entry(
            {
                "RecordID": str(row.id), "DataType": payload.mime_type or "file",
                "DriveFileID": row.drive_file_id or "", "DriveLink": row.drive_link or "",
                "ExtractedText": (row.extracted_text or "")[:200],
            }
        )
    except Exception:
        pass
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


# ── Drive connection management (the frontend Settings → Drive panel) ────────


@router.get("/api/drive/status", tags=["drive"])
@handle_errors
async def drive_connection_status(db: AsyncSession = Depends(get_db)) -> dict:
    """Connection status for the management panel: whether the OAuth client is
    configured, whether a refresh_token is on file (connected), the linked
    account, and the app folder layout. Public-read so the UI always renders."""
    from app.services import drive_settings_service as dss

    return await dss.get_status(db)


@router.post("/api/drive/disconnect", tags=["drive"])
@handle_errors
async def drive_disconnect(request: Request, db: AsyncSession = Depends(get_db)) -> dict:
    """Forget the stored Drive connection (operator only)."""
    await _require_drive_operator(request, db)
    from app.services import drive_settings_service as dss

    await dss.disconnect(db)
    return {"ok": True, "success": True, "connected": False}


@router.post("/api/drive/test", tags=["drive"])
@handle_errors
async def drive_test_connection(request: Request, db: AsyncSession = Depends(get_db)) -> dict:
    """Verify the live connection by building a client and ensuring the app
    folder tree exists. Returns the root folder id on success (operator only)."""
    await _require_drive_operator(request, db)
    from app.config import settings as app_settings
    from app.services import drive_settings_service as dss
    from app.services.google_api_client import (
        build_drive_client,
        ensure_app_folders,
        refresh_access_token_details,
    )

    # Diagnose step-by-step so «بررسی اتصال» tells the owner exactly what to
    # fix — the previous single collapsed message hid the most common cause
    # (Google revoking the stored refresh_token → only a reconnect helps),
    # while the status panel kept saying «متصل» because a token WAS on file.
    if not (app_settings.GOOGLE_CLIENT_ID and app_settings.GOOGLE_CLIENT_SECRET):
        return {
            "ok": False, "success": False, "connected": False,
            "reason": "oauth_not_configured",
            "detail": "متغیرهای محیطی GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET روی سرور تنظیم نیستند.",
        }
    refresh_token = await dss.resolve_refresh_token(db)
    if not refresh_token:
        return {
            "ok": False, "success": False, "connected": False,
            "reason": "no_refresh_token",
            "detail": "توکنی ذخیره نشده است — دکمهٔ «اتصال به گوگل درایو» را بزن.",
        }
    access_token, token_error = await refresh_access_token_details(refresh_token)
    if not access_token:
        return {
            "ok": False, "success": False, "connected": False,
            "reason": "refresh_rejected",
            "google_error": token_error,
            "detail": (
                "گوگل توکن ذخیره‌شده را نپذیرفت (معمولاً یعنی توکن باطل/منقضی شده). "
                "«قطع اتصال» و سپس اتصال دوباره مشکل را حل می‌کند."
            ),
        }

    drive_client = await build_drive_client(db)
    if drive_client is None:
        return {
            "ok": False, "success": False, "connected": False,
            "reason": "client_build_failed",
            "detail": "کتابخانه‌های گوگل روی سرور در دسترس نیستند (ساخت کلاینت ناموفق بود).",
        }
    root_id, subfolders = await ensure_app_folders(db, drive_client)
    return {
        "ok": True,
        "success": True,
        "connected": True,
        "root_folder_id": root_id,
        "subfolders": subfolders,
    }


@router.post("/api/drive/sync", tags=["drive"])
@handle_errors
async def drive_sync_now(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Push any local-only DriveFile rows up to Google Drive now (operator only).

    For each row not yet on Drive, upload its content (the extracted text — the
    only payload a metadata row carries) under ``LifeManagerData/<type>/`` and
    fill in drive_file_id / drive_link / storage_location='drive'. A clean no-op
    (uploaded=0) when Drive isn't connected."""
    await _require_drive_operator(request, db)
    from app.services import drive_settings_service as dss
    from app.services import google_drive_service
    from app.services.google_api_client import build_drive_client, ensure_app_folders

    drive_client = await build_drive_client(db)
    if drive_client is None:
        # ok stays true (a clean no-op, the documented contract) but the
        # payload must SAY nothing happened — the panel previously rendered
        # this as «همگام‌سازی انجام شد» while zero files moved.
        return {
            "ok": True, "success": True, "uploaded": 0, "connected": False,
            "detail": "درایو متصل نیست — چیزی همگام‌سازی نشد. «بررسی اتصال» را بزن تا علت دقیق را ببینی.",
        }

    # Make sure the folder tree exists (and the root id is cached).
    await ensure_app_folders(db, drive_client)
    refresh_token = await dss.resolve_refresh_token(db)

    pending = (
        await db.execute(
            select(DriveFile).where(
                DriveFile.user_id == user_id,
                DriveFile.drive_file_id.is_(None),
            )
        )
    ).scalars().all()

    uploaded = 0
    for row in pending:
        try:
            info = await google_drive_service.upload_file(
                refresh_token=refresh_token,
                file_name=row.filename,
                data_type=(row.mime_type or "documents"),
                media=(row.extracted_text or "").encode("utf-8"),
                client=drive_client,
            )
            row.drive_file_id = info["drive_file_id"]
            row.drive_link = info["drive_link"]
            row.storage_location = "drive"
            uploaded += 1
        except Exception as exc:  # one bad file shouldn't drop the batch
            logger.warning("drive sync: failed to upload file %s: %r", row.id, exc)
    if uploaded:
        await db.commit()
    return {"ok": True, "success": True, "uploaded": uploaded, "connected": True}


@router.post(
    "/api/drive/upload-file",
    response_model=DriveFileResponse,
    status_code=201,
    tags=["drive"],
)
@handle_errors
async def upload_real_drive_file(
    file: UploadFile = File(...),
    data_type: str = Form("documents"),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> DriveFile:
    """Upload an ACTUAL file. The bytes are pushed to Google Drive when
    connected (filling drive_file_id / drive_link / storage_location='drive');
    otherwise the metadata row is stored locally so nothing is lost and a later
    sync migrates it. Extracted text is computed up front so it's searchable."""
    from app.services.transcription_service import extract_text

    data = await file.read()
    extracted = extract_text(file.filename, mime_type=file.content_type)
    row = DriveFile(
        user_id=user_id,
        filename=file.filename,
        mime_type=file.content_type,
        storage_location="local",
        storage_tier="hot",
        extracted_text=extracted,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)

    # Push to Drive when connected (best-effort: failure keeps the local row).
    try:
        from app.services import drive_settings_service as dss
        from app.services import google_drive_service
        from app.services.google_api_client import build_drive_client

        drive_client = await build_drive_client(db)
        if drive_client is not None:
            refresh_token = await dss.resolve_refresh_token(db)
            info = await google_drive_service.upload_file(
                refresh_token=refresh_token,
                file_name=file.filename,
                data_type=data_type,
                media=data,
                client=drive_client,
            )
            row.drive_file_id = info["drive_file_id"]
            row.drive_link = info["drive_link"]
            row.storage_location = "drive"
            await db.commit()
            await db.refresh(row)
    except Exception as exc:
        logger.warning("drive upload-file: Drive push failed (kept local): %r", exc)

    # Best-effort central-sheet ledger write (no-op without Sheets creds).
    try:
        from app.services.sheets_service import record_index_entry

        await record_index_entry(
            {
                "RecordID": str(row.id),
                "DataType": file.content_type or "file",
                "DriveFileID": row.drive_file_id or "",
                "DriveLink": row.drive_link or "",
                "ExtractedText": (row.extracted_text or "")[:200],
            }
        )
    except Exception:
        pass
    return row
