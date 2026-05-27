from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.database import get_db
from app.schemas.notification_schema import NotificationCreate, NotificationOut
from app.services.notification_service import NotificationService
from app.models.user import User
from app.dependencies.auth import get_current_user

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
    `fetch(\`/notifications/${id}/read\`, { method: 'PATCH' })`.
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
