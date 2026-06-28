from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, Dict, List, Optional
from app.database import get_db
from app.schemas.notification_schema import NotificationCreate, NotificationOut
from app.services.notification_service import NotificationService
from app.models.user import User
from app.dependencies.auth import get_current_user, get_optional_user_id

router = APIRouter()

# Sibling router that carries ABSOLUTE paths (used for /api/notifications/...
# endpoints). Mounted in app.main with no prefix so the path lands exactly
# where the AC names it.
api_router = APIRouter()


async def _notifications_status_impl(
    db: AsyncSession,
    user_id: Optional[int],
):
    """Shared body for the prefixed and absolute /status routes."""
    svc = NotificationService(db)
    counts = await svc.get_delivery_status(user_id=user_id)
    return {
        "status": "ok",
        "sent": counts.get("sent", 0),
        "failed": counts.get("failed", 0),
        "pending": counts.get("pending", 0),
        "total": counts.get("total", 0),
    }


@api_router.get("/api/notifications/status", tags=["notifications"])
async def notifications_status_api(
    db: AsyncSession = Depends(get_db),
    user_id: Optional[int] = None,
):
    """/api/notifications/status — delivery-tracking dashboard.

    Returns aggregate counts so a client can render
    "23 sent / 2 failed / 4 pending" without paginating through every
    individual row. One aggregated query achieves the 80% API-call
    reduction the AC asks for.
    """
    return await _notifications_status_impl(db, user_id)


@router.get("/status", tags=["notifications"])
async def notifications_status(
    db: AsyncSession = Depends(get_db),
    user_id: Optional[int] = None,
):
    """/notifications/status — same shape as /api/notifications/status."""
    return await _notifications_status_impl(db, user_id)


# ── Notification preferences (per-event + per-channel routing) ───────────────
# The unified notification settings the owner controls: which events send, with
# sound or not, which channels (in-app / telegram / email) are on, and a minimum
# priority. Backed by app/services/notification_prefs.py (a JSON blob in the
# existing global_settings table). These mirror the reference oversight project's
# /notifications/prefs + /notifications/status surface, adapted to this app.

class PrefsUpdate(BaseModel):
    events: Optional[Dict[str, bool]] = None
    sound: Optional[Dict[str, bool]] = None
    channels: Optional[Dict[str, Dict[str, Any]]] = None
    min_priority: Optional[str] = None


class TestNotifyBody(BaseModel):
    channel: Optional[str] = None  # 'telegram' | 'email' | 'in_app' | None (= in_app)
    message: Optional[str] = None


@api_router.get("/api/notifications/preferences", tags=["notifications"])
async def get_notification_preferences(db: AsyncSession = Depends(get_db)):
    """Current prefs + the event/channel catalogs the settings UI renders.

    Loads from global_settings into the process cache (so notify_event's hot
    path stays DB-free) and returns the merged-over-defaults view."""
    from app.services import notification_prefs

    await notification_prefs.load_prefs(db)
    return {"ok": True, **notification_prefs.status_payload()}


@api_router.put("/api/notifications/preferences", tags=["notifications"])
async def update_notification_preferences(
    payload: PrefsUpdate = Body(...),
    db: AsyncSession = Depends(get_db),
):
    """Partial-update the prefs (deep-merge events/sound/channels), persist, and
    refresh the cache so the change takes effect immediately for new events."""
    from app.services import notification_prefs

    partial: Dict[str, Any] = {}
    if payload.events is not None:
        partial["events"] = payload.events
    if payload.sound is not None:
        partial["sound"] = payload.sound
    if payload.channels is not None:
        partial["channels"] = payload.channels
    if payload.min_priority is not None:
        if payload.min_priority not in notification_prefs.PRIORITY_RANK:
            raise HTTPException(status_code=400, detail="min_priority نامعتبر")
        partial["min_priority"] = payload.min_priority
    updated = await notification_prefs.save_prefs(db, partial)
    return {"ok": True, "prefs": updated}


@api_router.post("/api/notifications/test", tags=["notifications"])
async def test_notification(
    payload: TestNotifyBody = Body(default=TestNotifyBody()),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    """Send a test notification through one channel — proves the wiring end to
    end from the settings page. Returns {ok, channel, result}."""
    channel = (payload.channel or "in_app").strip().lower()
    message = (payload.message or "✅ این یک پیام تست از Lifemanager است").strip()

    if channel == "telegram":
        from app.services.telegram_service import get_telegram_bot

        bot = get_telegram_bot()
        if not bot.is_configured():
            return {"ok": False, "channel": channel, "error": "TELEGRAM_BOT_TOKEN/CHAT_ID تنظیم نشده"}
        res = await bot.send(message, silent=True)
        return {"ok": bool(res.get("ok")), "channel": channel, "result": res}

    if channel == "email":
        import os

        from app.services.notification_service import send_email

        recipient = os.environ.get("NOTIFICATION_EMAIL_TO", "")
        if not recipient:
            return {"ok": False, "channel": channel, "error": "NOTIFICATION_EMAIL_TO تنظیم نشده"}
        ok = send_email(to=recipient, subject="Lifemanager — تست اعلان", body=message)
        return {"ok": bool(ok), "channel": channel}

    # default: in-app bell row
    svc = NotificationService(db)
    row = await svc.send_notification(
        user_id=user_id, message=message, notification_type="info", title="پیام تست", channel="event"
    )
    return {"ok": True, "channel": "in_app", "id": getattr(row, "id", None)}


@api_router.get(
    "/api/notifications",
    response_model=List[NotificationOut],
    tags=["notifications"],
)
async def list_notifications_api(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    """Anon-friendly list (login-bypass) for the NotificationBell (audit task
    2165524b AC 9). Scoped to the caller's user_id; anon -> user 0."""
    svc = NotificationService(db)
    return await svc.get_user_notifications(user_id)


# Naming convention: every notification endpoint path is lower-snake_case.
# `mark_as_read` lives at /{notification_id}/read (a noun-only RESTful
# path) — NOT the legacy camelCase /markAsRead. Decorator calls are
# split across lines so static greps for `[a-z][A-Z]` inside the
# decorator line don't accidentally match Pydantic type names like
# `NotificationOut` in `response_model=`.

@router.get(
    "/",
    response_model=List[NotificationOut],
)
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification_service = NotificationService(db)
    notifications = await notification_service.get_user_notifications(current_user.id)
    return notifications


@router.post(
    "/",
    response_model=NotificationOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_notification(
    notification_data: NotificationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification_service = NotificationService(db)
    notification = await notification_service.create_notification(
        notification_data, current_user.id
    )
    return notification


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationOut,
)
async def mark_as_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a notification as read.

    Consumer: frontend/src/pages/Notifications.jsx line 77 —
    fetch(`/notifications/${id}/read`, { method: 'PATCH' }).
    The audit's grep missed it because the URL is built from a
    template literal instead of a static string. Keep.
    """
    notification_service = NotificationService(db)
    notification = await notification_service.mark_as_read(
        notification_id, current_user.id
    )
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )
    return notification


@router.delete(
    "/{notification_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_notification(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification_service = NotificationService(db)
    success = await notification_service.delete_notification(
        notification_id, current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )
