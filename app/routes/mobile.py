"""/api/mobile/* — نسخهٔ همراهِ رصدگر (2026-07-30).

The owner's ask: «یه نسخهٔ همیشه‌زنده و رصدکننده از همین پروژه روی موبایل» —
his phones should feed the program: every bank SMS, every notification, every
day of app usage lands HERE and updates the same accounts, activity log and
pulse the web app shows. These endpoints are the receiving half; the sending
half is the Android companion app in ``mobile/companion-android/`` (SMS
reading is an Android capability — iPhones forbid it, they can still install
the PWA and share screenshots/files into the inbox).

Security: every ingest call must carry the device token in ``X-Device-Token``.
The token lives in global_settings (``mobile_device_token``), is generated on
first request by the OWNER from inside the app (auth-gated), and is compared
constant-time. Wrong/absent token → 401, nothing logged.

Bank SMS are the most truthful balance source there is — they flow through
the SAME hardened engine as everything else (`apply_bank_message`: deduped by
content hash, currency-mismatch refused, synthetic delta marked).
"""
import hmac
import logging
import secrets
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import enforce_write_auth, get_optional_user_id, get_required_user_id
from app.middleware import handle_errors
from app.models.global_setting import GlobalSetting
from app.services.activity_log_service import record_activity

logger = logging.getLogger(__name__)

router = APIRouter()

_TOKEN_KEY = "mobile_device_token"


async def _get_token(db: AsyncSession) -> Optional[str]:
    row = (
        await db.execute(select(GlobalSetting).where(GlobalSetting.key == _TOKEN_KEY))
    ).scalar_one_or_none()
    return row.value if row and row.value else None


async def _require_device(db: AsyncSession, header_token: Optional[str]) -> None:
    token = await _get_token(db)
    if not token or not header_token or not hmac.compare_digest(token, header_token):
        raise HTTPException(status_code=401, detail="device token invalid")


@router.get("/api/mobile/token", tags=["mobile"])
@handle_errors
async def get_device_token(
    rotate: bool = False,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """The pairing token the companion app must send. Owner-only (auth-gated).
    ``?rotate=true`` mints a new one (old devices stop reporting until
    re-paired)."""
    token = await _get_token(db)
    if token is None or rotate:
        token = secrets.token_urlsafe(24)
        row = (
            await db.execute(select(GlobalSetting).where(GlobalSetting.key == _TOKEN_KEY))
        ).scalar_one_or_none()
        if row is None:
            db.add(GlobalSetting(key=_TOKEN_KEY, value=token))
        else:
            row.value = token
        await db.commit()
    return {"ok": True, "success": True, "token": token}


class SmsPayload(BaseModel):
    sender: str
    body: str
    received_at: Optional[str] = None  # ISO
    device: Optional[str] = None


@router.post("/api/mobile/sms", tags=["mobile"])
@handle_errors
async def ingest_sms(
    payload: SmsPayload,
    x_device_token: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """One SMS from the phone → activity log, and (when it smells like a bank
    message) the finance engine. Idempotent end to end: apply_bank_message
    hashes the content, so a re-sent SMS is a no-op."""
    await _require_device(db, x_device_token)
    body = (payload.body or "").strip()
    if not body:
        raise ValueError("empty sms body")

    await record_activity(
        action="mobile_sms", entity_type="sms", entity_id=None,
        entity_label=payload.sender[:255],
        detail=body[:500],
        context_type="device", context_id=(payload.device or "phone")[:64],
        user_id=user_id, db=db,
    )

    finance: dict = {"matched": False, "balances_updated": 0}
    try:
        from app.services.finance_email_scan_service import _FIN_HINT
        from app.services.finance_ingest_service import apply_bank_message

        if _FIN_HINT.search(f"{payload.sender}\n{body}"):
            finance = await apply_bank_message(
                db, user_id=user_id, channel="sms", body=body, sender=payload.sender,
            )
    except Exception as exc:  # a weird SMS must never fail the ingest
        logger.debug("mobile sms finance apply skipped: %r", exc)

    return {"ok": True, "success": True, "finance": finance}


class NotificationPayload(BaseModel):
    app: str
    title: Optional[str] = None
    text: Optional[str] = None
    posted_at: Optional[str] = None
    device: Optional[str] = None


@router.post("/api/mobile/notification", tags=["mobile"])
@handle_errors
async def ingest_notification(
    payload: NotificationPayload,
    x_device_token: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """A phone notification → activity log; bank-app notifications also feed
    the finance engine (same guards as SMS/email — nothing blind)."""
    await _require_device(db, x_device_token)
    text = " ".join(v for v in (payload.title, payload.text) if v).strip()
    if not text:
        raise ValueError("empty notification")

    await record_activity(
        action="mobile_notification", entity_type="notification", entity_id=None,
        entity_label=payload.app[:255],
        detail=text[:500],
        context_type="device", context_id=(payload.device or "phone")[:64],
        user_id=user_id, db=db,
    )

    finance: dict = {"matched": False, "balances_updated": 0}
    try:
        from app.services.finance_email_scan_service import _FIN_HINT
        from app.services.finance_ingest_service import apply_bank_message

        if _FIN_HINT.search(f"{payload.app}\n{text}"):
            finance = await apply_bank_message(
                db, user_id=user_id, channel="notification", body=text, sender=payload.app,
            )
    except Exception as exc:
        logger.debug("mobile notification finance apply skipped: %r", exc)

    return {"ok": True, "success": True, "finance": finance}


class UsagePayload(BaseModel):
    day: str  # YYYY-MM-DD
    apps: list  # [{app, minutes}]
    device: Optional[str] = None


@router.post("/api/mobile/usage", tags=["mobile"])
@handle_errors
async def ingest_usage(
    payload: UsagePayload,
    x_device_token: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Daily app-usage summary → one activity row per day per device (the
    self-knowledge feed: «امروز چقدر کجا بودم»)."""
    await _require_device(db, x_device_token)
    import json as _json

    top = sorted(
        (a for a in payload.apps if isinstance(a, dict)),
        key=lambda a: -(a.get("minutes") or 0),
    )[:20]
    await record_activity(
        action="mobile_usage", entity_type="usage", entity_id=payload.day,
        entity_label=f"کارکرد موبایل {payload.day}",
        detail=_json.dumps(top, ensure_ascii=False)[:2000],
        context_type="device", context_id=(payload.device or "phone")[:64],
        user_id=user_id, db=db,
    )
    return {"ok": True, "success": True, "recorded": len(top)}


class HeartbeatPayload(BaseModel):
    device: str
    battery: Optional[int] = None
    app_version: Optional[str] = None


@router.post("/api/mobile/heartbeat", tags=["mobile"])
@handle_errors
async def heartbeat(
    payload: HeartbeatPayload,
    x_device_token: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """«زنده‌ام» — keeps the device visible on /api/mobile/status (and, through
    the pulse middleware, on the live system diagram's mobile router card)."""
    await _require_device(db, x_device_token)
    await record_activity(
        action="mobile_heartbeat", entity_type="device", entity_id=payload.device[:64],
        entity_label=payload.device[:255],
        detail=f"battery={payload.battery} v={payload.app_version}",
        context_type="device", context_id=payload.device[:64],
        user_id=user_id, db=db,
    )
    return {"ok": True, "success": True}


@router.get("/companion.apk", tags=["mobile"])
@router.get("/api/mobile/apk", tags=["mobile"])
async def download_companion_apk():
    """فایل نصبی اپ همراه — the CI-built APK, served from the app itself so
    the owner just opens «سایت/companion.apk» on the phone and taps install.
    (Built by .github/workflows/build-companion-apk.yml, committed to
    mobile/companion-android/release/.)"""
    from pathlib import Path

    from fastapi.responses import FileResponse, JSONResponse

    apk = (
        Path(__file__).resolve().parents[2]
        / "mobile" / "companion-android" / "release" / "companion.apk"
    )
    if not apk.exists():
        return JSONResponse(
            status_code=404,
            content={
                "ok": False,
                "detail": "companion.apk هنوز ساخته نشده — چند دقیقه بعد از هر تغییرِ اپ همراه، GitHub Actions آن را می‌سازد.",
            },
        )
    return FileResponse(
        str(apk),
        media_type="application/vnd.android.package-archive",
        filename="lifemanager-companion.apk",
    )


@router.get("/api/mobile/status", tags=["mobile"])
@handle_errors
async def mobile_status(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
) -> dict:
    """Last signal per device — is the watcher alive on each phone?"""
    from app.models.activity_log import ActivityLog

    rows = (
        await db.execute(
            select(ActivityLog)
            .where(ActivityLog.action.in_(
                ("mobile_heartbeat", "mobile_sms", "mobile_notification", "mobile_usage")
            ))
            .order_by(ActivityLog.created_at.desc(), ActivityLog.id.desc())
            .limit(200)
        )
    ).scalars().all()
    devices: dict = {}
    for r in rows:
        key = r.context_id or "phone"
        if key not in devices:
            devices[key] = {
                "device": key,
                "last_action": r.action,
                "last_at": r.created_at.isoformat() if r.created_at else None,
            }
    return {"ok": True, "success": True, "devices": list(devices.values())}
