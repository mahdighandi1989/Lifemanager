"""Ingest a changed entity's text into the AI analysis layer.

Audit task 1a08ded2 (AC 67): the Celery task ``process_ai_ingestion_event``
hands ``(entity_type, entity_id, action)`` here; we load the row, pull its
text, and run :func:`app.services.ai.nlp_service.analyze_content` so the
result (summary + keywords) is available to the AI flow. ``TodoItem`` is the
first supported type (AC 66-67); the dispatch is open for ``Task`` and other
entities.
"""
from __future__ import annotations

import logging
from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ai import nlp_service

logger = logging.getLogger(__name__)


async def ingest_entity(
    db: AsyncSession,
    *,
    entity_type: str,
    entity_id: int,
    action: str = "created",
) -> dict[str, Any]:
    """Load one entity, analyse its text, and return the analysis envelope.

    Returns ``{"ingested": bool, ...}``. Never raises on a missing row or an
    unsupported type — the caller (a Celery task) treats this as best-effort.
    """
    text = await _extract_text(db, entity_type=entity_type, entity_id=entity_id)
    if text is None:
        return {
            "ingested": False,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "reason": "not_found_or_unsupported",
        }
    analysis = nlp_service.analyze_content(text, entity_type=entity_type)
    logger.info(
        "ai_ingestion entity_type=%s id=%s action=%s keywords=%d",
        entity_type,
        entity_id,
        action,
        len(analysis.get("keywords", [])),
    )
    return {
        "ingested": True,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "action": action,
        "analysis": analysis,
    }


async def _extract_text(
    db: AsyncSession, *, entity_type: str, entity_id: int
) -> Optional[str]:
    """Return the analysable text for an entity, or None if unknown/missing."""
    if entity_type == "todo_item":
        from app.models.todo_item import TodoItem

        item = await db.get(TodoItem, entity_id)
        if item is None:
            return None
        return " ".join(p for p in (item.content, item.description) if p)

    if entity_type == "task":
        from app.models.task import Task

        task = await db.get(Task, entity_id)
        if task is None:
            return None
        parts = (getattr(task, "title", None), getattr(task, "description", None))
        return " ".join(p for p in parts if p)

    return None
