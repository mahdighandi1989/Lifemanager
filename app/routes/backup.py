"""/api/backup — پشتیبان‌گیری خودکار (nightly full-DB export to Drive).

Thin shells over ``app/services/backup_service``:

* ``GET  /api/backup/status`` — last attempt/success stamps + is_stale + drive_configured
* ``POST /api/backup/run``    — run a backup NOW (Drive first, local fallback)
* ``GET  /api/backup/export`` — download the raw uncompressed JSON export

Auth (2026-07-20 review — critical): the export contains EVERY table, so it
is gated by ``enforce_auth_when_required`` — flipping ``REQUIRE_AUTH=true``
(the owner-actions remediation) genuinely closes it, and an invalid token is
always rejected. The manual HTTP download additionally redacts credential
columns (password hashes / encrypted keys) so a pre-lockdown anonymous fetch
can't harvest them; the automated Drive backup (private to the owner) keeps
everything for a real restore.
"""
import io
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import enforce_auth_when_required, get_optional_user_id
from app.middleware import handle_errors
from app.rate_limit import limiter
from app.services import backup_service as svc

router = APIRouter()


@router.get("/api/backup/status", tags=["backup"])
@handle_errors
async def backup_status(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    status = await svc.get_status(db)
    return {"ok": True, "success": True, "status": status}


@router.post("/api/backup/run", tags=["backup"])
@limiter.limit("6/hour")
@handle_errors
async def backup_run(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    # run_backup never raises — its dict already carries ok/success/detail_fa.
    return await svc.run_backup(db)


@router.get("/api/backup/export", tags=["backup"])
@handle_errors
async def backup_export(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
):
    """Stream a freshly-built, uncompressed JSON export as a download —
    the manual «نسخهٔ پشتیبان را همین حالا بگیر و نگه دار» escape hatch.
    Credential columns are redacted here (the automated Drive backup keeps
    them for a true restore)."""
    export = await svc.export_all_tables(db, redact_secrets=True)
    payload = json.dumps(export, ensure_ascii=False).encode("utf-8")
    file_name = f"lifemanager-backup-{datetime.now(timezone.utc):%Y%m%d-%H%M%S}.json"
    return StreamingResponse(
        io.BytesIO(payload),
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{file_name}"'},
    )
