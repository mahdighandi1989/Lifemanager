"""Publish data-change events into the AI ingestion pipeline.

Audit task 1a08ded2 (AC 64): when an entity (TodoItem, Task, ...) is created
or updated, the write path calls :func:`publish_data_change_event` so the new
content is picked up for AI analysis "quickly" — the user's voice memo asked
for newly added data to be available to the models without a manual re-index.

Best-effort by design: a broker outage is logged, never raised, so the
originating write (e.g. ``POST /api/todo-items``) never fails just because
Celery/Redis is down.
"""
from __future__ import annotations

import logging
import threading

logger = logging.getLogger(__name__)

# How long the request will wait for the broker publish before giving up and
# moving on. A reachable broker returns in milliseconds; an unreachable one
# would otherwise spin through kombu's connection-establishment retry loop for
# ~20s (which `retry=False` does NOT short-circuit) and block the POST hot
# path. We cap the wait instead.
_PUBLISH_WAIT_SECONDS = 0.5


def publish_data_change_event(entity_type: str, entity_id: int, action: str) -> bool:
    """Enqueue a ``process_ai_ingestion_event`` task for one entity change.

    Args:
        entity_type: e.g. ``"todo_item"``, ``"task"``, ``"project"``.
        entity_id:   the row id that changed.
        action:      ``"created"`` | ``"updated"`` | ``"deleted"``.

    Returns:
        True if the task was handed to the broker within the wait window;
        False if the broker was unreachable/slow (logged and swallowed so the
        caller's write still succeeds).

    The actual ``apply_async`` runs in a short-lived daemon thread so a down
    broker can never block the originating request for more than
    ``_PUBLISH_WAIT_SECONDS``. The thread is abandoned (daemon) if it exceeds
    that — best-effort delivery, never a hot-path stall.
    """
    outcome = {"ok": False}

    def _enqueue() -> None:
        try:
            from app.tasks import process_ai_ingestion_event

            # retry=False keeps the publish-retry loop off; critical tasks
            # (email/notification) keep their own default retry semantics.
            process_ai_ingestion_event.apply_async(
                kwargs={
                    "entity_type": entity_type,
                    "entity_id": entity_id,
                    "action": action,
                },
                retry=False,
            )
            outcome["ok"] = True
        except Exception as exc:  # broker down / misconfigured / eager error
            logger.warning(
                "publish_data_change_event(%s, %s, %s) enqueue failed: %r",
                entity_type,
                entity_id,
                action,
                exc,
            )

    worker = threading.Thread(
        target=_enqueue, name="ai-ingest-publish", daemon=True
    )
    worker.start()
    worker.join(timeout=_PUBLISH_WAIT_SECONDS)
    if worker.is_alive():
        logger.warning(
            "publish_data_change_event(%s, %s, %s): broker slow/down, continuing",
            entity_type,
            entity_id,
            action,
        )
        return False
    if outcome["ok"]:
        logger.info(
            "published data-change event entity_type=%s id=%s action=%s",
            entity_type,
            entity_id,
            action,
        )
    return outcome["ok"]
