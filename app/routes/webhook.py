"""/webhook — incoming webhook handler.

Behaviour:
- POST /webhook expects an X-Webhook-Signature header carrying the SHA-256
  HMAC of the raw request body, keyed with WEBHOOK_SECRET (from env). A
  missing or wrong signature returns 401.
- Verified events are persisted to webhook_events for an audit trail.
- GET /webhook/health stays as a liveness probe for upstream checks.
"""
import json
import logging
import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.webhook_event import WebhookEvent
from app.services.integration_service import verify_signature

logger = logging.getLogger(__name__)

router = APIRouter()


def _webhook_secret() -> str:
    """Looked up at request time so tests can monkeypatch the env var."""
    return os.environ.get("WEBHOOK_SECRET", "")


@router.get("/webhook/health")
async def health():
    return {"status": "ok", "service": "webhook"}


@router.post("/webhook")
async def handle_webhook(
    request: Request,
    x_webhook_signature: Optional[str] = Header(default=None, alias="X-Webhook-Signature"),
    db: AsyncSession = Depends(get_db),
):
    """Verify the HMAC signature, then record the event.

    We sign the raw request body (not the parsed JSON) — re-serialising
    the JSON would risk a key-order mismatch with the sender.
    """
    secret = _webhook_secret()
    raw_body = await request.body()

    if not secret or not verify_signature(raw_body, x_webhook_signature or "", secret):
        logger.warning(
            "rejected webhook with invalid signature at %s",
            datetime.now(timezone.utc).isoformat(),
        )
        # Surface the signature failure as a verify_failed notification to the
        # owner (audit task 92fa5ea15e2b — the wiring deferred "until the
        # per-event rate-limit lands"; it now has). The per-(user,event)
        # rate-limit in notify_event caps a forged-request flood so this can't
        # be used to spam the notification table. Best-effort, never blocks 401.
        try:
            from app.services.notification_service import notify_event

            await notify_event(
                "verify_failed",
                user_id=0,
                db=db,
                title="تأیید امضای وب‌هوک ناموفق",
                message="یک درخواست وب‌هوک با امضای نامعتبر رد شد.",
                priority="high",
            )
        except Exception as exc:  # notification must never block the 401
            logger.debug("verify_failed notify on bad webhook skipped: %r", exc)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid signature")

    try:
        payload = json.loads(raw_body or b"{}")
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="invalid JSON"
        ) from exc

    event_name = str(payload.get("event", "unknown"))
    timestamp = datetime.now(timezone.utc).isoformat()

    record = WebhookEvent(
        event=event_name,
        payload=json.dumps(payload, default=str)[:8000],
        signature=x_webhook_signature,
    )
    try:
        db.add(record)
        await db.commit()
        await db.refresh(record)
    except Exception:
        await db.rollback()
        logger.exception("webhook persistence failed for event=%s", event_name)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="failed to persist webhook event",
        )

    logger.info("stored webhook event=%s id=%s at %s", event_name, record.id, timestamp)
    return {
        "status": "received",
        "event": event_name,
        "id": record.id,
        "received_at": timestamp,
    }
