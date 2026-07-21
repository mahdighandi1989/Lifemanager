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
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.background import BackgroundTask

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
    response: Response,  # slowapi injects X-RateLimit-* headers into this
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
    _gate: None = Depends(enforce_auth_when_required),
) -> dict:
    # run_backup never raises — its dict already carries ok/success/detail_fa.
    # ``response`` is REQUIRED even though we return a dict: with the
    # @limiter.limit rate-limiter active (production), slowapi injects the
    # X-RateLimit-* headers into it AFTER the endpoint returns — without a
    # Response parameter slowapi raises 500 ("parameter `response` must be an
    # instance of starlette.responses.Response"). Rate-limiting is disabled in
    # tests so the bug only ever surfaced in prod (2026-07-21).
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
    them for a true restore).

    Memory-safe (2026-07-21): the export streams row-by-row onto a temp file
    on disk, then ``FileResponse`` streams that file from disk and a
    background task deletes it — the whole DB is never held in RAM, and the
    request session is fully drained BEFORE the response starts streaming (so
    no dependency-lifecycle hazard)."""
    fd, tmp_name = tempfile.mkstemp(prefix="lm-export-", suffix=".json")
    os.close(fd)
    tmp_path = Path(tmp_name)
    try:
        with open(tmp_path, "wb") as fh:
            async for chunk in svc.iter_export_bytes(db, redact_secrets=True):
                fh.write(chunk)
    except Exception:
        try:
            tmp_path.unlink()
        except Exception:
            pass
        raise
    file_name = f"lifemanager-backup-{datetime.now(timezone.utc):%Y%m%d-%H%M%S}.json"

    def _cleanup() -> None:
        try:
            tmp_path.unlink()
        except Exception:
            pass

    return FileResponse(
        tmp_path,
        media_type="application/json",
        filename=file_name,
        background=BackgroundTask(_cleanup),
    )
