"""Cold-tiering policy for DriveFile rows (audit task 7367c6f0 AC4).

Files untouched for more than ``COLD_THRESHOLD_DAYS`` (30) are "cold" and get
migrated out to Google Drive to keep the hot DB small. The policy + the DB
sweep are pure and deterministic (``now`` injectable); the actual Drive push is
an injectable ``mover`` coroutine so a key-less deploy still flips the
bookkeeping (storage_location='drive', migrated_at) and a credentialed sync can
fill in the real Drive id/link later.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Awaitable, Callable, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.drive_file import DriveFile

COLD_THRESHOLD_DAYS = 30


def _aware(dt: datetime) -> datetime:
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


def is_cold(file_row: DriveFile, *, now: Optional[datetime] = None) -> bool:
    """True when the row hasn't been accessed within COLD_THRESHOLD_DAYS and is
    still stored locally (already-migrated rows aren't re-tiered)."""
    if getattr(file_row, "storage_location", "local") == "drive":
        return False
    last = getattr(file_row, "last_accessed_at", None) or getattr(file_row, "created_at", None)
    if last is None:
        return False
    now = now or datetime.now(timezone.utc)
    return _aware(last) < now - timedelta(days=COLD_THRESHOLD_DAYS)


async def find_cold_files(
    db: AsyncSession, *, user_id: Optional[int] = None, now: Optional[datetime] = None
) -> List[DriveFile]:
    stmt = select(DriveFile)
    if user_id is not None:
        stmt = stmt.where(DriveFile.user_id == user_id)
    rows = (await db.execute(stmt)).scalars().all()
    return [r for r in rows if is_cold(r, now=now)]


async def tier_cold_files(
    db: AsyncSession,
    *,
    user_id: Optional[int] = None,
    mover: Optional[Callable[[DriveFile], Awaitable[dict]]] = None,
    ledger: Optional[Callable[[DriveFile], Awaitable[None]]] = None,
    now: Optional[datetime] = None,
) -> dict:
    """Migrate every cold DriveFile out to Drive. For each cold row, optionally
    call ``mover(row)`` (real Drive upload) for {drive_file_id, drive_link},
    then flip storage_location='drive' + stamp migrated_at. After the migration
    commits, optionally record each migrated row via ``ledger(row)`` — the seam
    the central LifeManagerIndex sheet write hangs off, so "توی شیت باید همه
    چیزا ثبت بشه" holds for the migration path too, not just upload (audit task
    7367c6f0 AC2+AC4). The ledger write is best-effort: a sheet failure never
    aborts an otherwise-successful migration. Returns ``{migrated, file_ids}``."""
    cold = await find_cold_files(db, user_id=user_id, now=now)
    stamp = now or datetime.now(timezone.utc)
    migrated = 0
    for row in cold:
        if mover is not None:
            info = await mover(row)
            if info:
                row.drive_file_id = info.get("drive_file_id", row.drive_file_id)
                row.drive_link = info.get("drive_link", row.drive_link)
        row.storage_location = "drive"
        row.storage_tier = "cold"
        row.migrated_at = stamp
        migrated += 1
    if migrated:
        await db.commit()
    if ledger is not None:
        for row in cold:
            try:
                await ledger(row)
            except Exception:
                # The ledger is an audit trail, not a gate — never undo a
                # committed migration because the sheet append failed.
                pass
    return {"migrated": migrated, "file_ids": [r.id for r in cold]}


def sheet_row_for(row: DriveFile) -> dict:
    """Project a migrated DriveFile onto the LifeManagerIndex record shape
    consumed by ``sheets_service.record_index_entry`` (audit task 7367c6f0).
    Centralises the field mapping so the cold-tiering ledger and the upload
    ledger stay in sync on column names."""
    return {
        "RecordID": str(getattr(row, "id", "") or ""),
        "DataType": getattr(row, "mime_type", None) or "file",
        "OriginalLocation": "render",
        "DriveFileID": getattr(row, "drive_file_id", None) or "",
        "DriveLink": getattr(row, "drive_link", None) or "",
        "ExtractedText": (getattr(row, "extracted_text", None) or "")[:200],
        "LastAccessedAt": str(getattr(row, "migrated_at", "") or ""),
    }
