"""Best-effort activity logging (لاگ فعالیت‌ها).

``record_activity`` writes one ActivityLog row and **never raises** — a
logging failure must never break (or roll back) the request that
triggered it. Call it *after* the underlying operation has committed.

Session strategy (same trade-off as the notification/event seams):

* When the caller passes its request-scoped ``db``, the row is written
  through it — this honours dependency overrides, so tests that swap
  ``get_db`` for an in-memory engine see the entry. Route hooks should
  always pass ``db=db``.
* Without ``db`` a private short-lived session keeps background writes
  (Celery jobs, Telegram handlers) independent of any caller state.

No FastAPI imports beyond the optional ``Request`` used for the client
IP — this module stays importable from services and tasks.
"""
from __future__ import annotations

import json
import logging
from typing import Optional

from fastapi import Request

from app.database import SessionLocal
from app.models.activity_log import ActivityLog

logger = logging.getLogger(__name__)


def _client_ip(request: Optional[Request]) -> Optional[str]:
    if request is None:
        return None
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else None


async def record_activity(
    *,
    action: str,
    entity_type: Optional[str] = None,
    entity_id=None,
    entity_label: Optional[str] = None,
    context_type: Optional[str] = None,
    context_id=None,
    detail: Optional[str] = None,
    payload_before=None,
    user_id: Optional[int] = None,
    request: Optional[Request] = None,
    db=None,
) -> None:
    """Persist a single activity entry (never raises).

    ``entity_type``/``entity_id`` name the acted-on record;
    ``context_type``/``context_id`` name the owning profile/section
    (todo item → its list, deed/note → its person, transaction → its
    account) so the entry also surfaces under that section's log panel
    and the global page can deep-link it.
    """
    try:
        entry = ActivityLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id) if entity_id is not None else None,
            entity_label=(str(entity_label)[:255] or None) if entity_label is not None else None,
            context_type=context_type,
            context_id=str(context_id) if context_id is not None else None,
            detail=detail,
            payload_before=(
                payload_before
                if isinstance(payload_before, (str, type(None)))
                else json.dumps(payload_before, ensure_ascii=False, default=str)
            ),
            ip_address=_client_ip(request),
        )
        if db is not None:
            db.add(entry)
            await db.commit()
        else:
            async with SessionLocal() as session:
                session.add(entry)
                await session.commit()
    except Exception as exc:  # pragma: no cover — logging must never break a request
        logger.warning("Activity log write failed (%s %s): %s", action, entity_type, exc)
