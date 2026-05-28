"""Shared serialisation helpers for TodoItem / TodoList route handlers.

Both ``app/routes/lists.py`` and ``app/routes/todo_items.py`` used to
carry near-identical local ``_serialize_item`` / ``_serialize``
functions. The bodies drifted apart over time — one of them grew a
``subitem_ids`` field, the other gained a ``list_ids=`` override
parameter — and the duplication kept inviting the next divergence.

This module is the single source of truth. The route layer now
imports ``serialize_item`` / ``serialize_list`` directly so a future
schema change touches exactly one place.

Design notes:
  * ``serialize_item`` accepts an optional ``list_ids`` override so
    callers that already have the IDs in hand (e.g. ``lists.py``,
    which is JOINing through the membership table anyway) can skip
    the lazy load. When omitted, falls back to iterating
    ``obj.lists`` — which triggers a SELECT.
  * ``subitem_ids`` is computed defensively: touching
    ``obj.subitems`` triggers a lazy load that can fail if the
    session is detached. We swallow that case to an empty list so a
    half-fetched item still serializes.
  * Both helpers always return plain JSON-safe primitives so the
    FastAPI ``response_model`` does no extra coercion work.
"""
from __future__ import annotations

from typing import Iterable, Optional


def serialize_list(obj, item_count: int = 0) -> dict:
    """Shape a TodoList ORM row for the wire."""
    return {
        "id": obj.id,
        "name": obj.name,
        "description": obj.description,
        "user_id": obj.user_id,
        "sort_order": obj.sort_order,
        "is_archived": bool(obj.is_archived),
        "item_count": item_count,
        "created_at": obj.created_at.isoformat() if obj.created_at else None,
        "updated_at": obj.updated_at.isoformat() if obj.updated_at else None,
    }


def serialize_item(obj, list_ids: Optional[Iterable[int]] = None) -> dict:
    """Shape a TodoItem ORM row for the wire.

    ``list_ids`` lets the caller skip the lazy load on ``obj.lists``
    when it already knows the IDs (the common case in
    ``GET /api/lists/{id}``). When None, the relationship is walked.
    """
    try:
        subitem_ids = [child.id for child in (obj.subitems or [])]
    except Exception:
        # Detached session / unloaded relationship — return empty
        # list so the response still serialises cleanly.
        subitem_ids = []

    resolved_list_ids = (
        list(list_ids) if list_ids is not None
        else [lst.id for lst in obj.lists]
    )

    return {
        "id": obj.id,
        "content": obj.content,
        "description": obj.description,
        "is_completed": bool(obj.is_completed),
        "is_starred": bool(obj.is_starred),
        "type": getattr(obj, "type", None) or "task",
        "parent_id": obj.parent_id,
        "due_date": obj.due_date.isoformat() if obj.due_date else None,
        "owner_id": obj.owner_id,
        "list_ids": resolved_list_ids,
        "subitem_ids": subitem_ids,
        "completed_at": obj.completed_at.isoformat() if obj.completed_at else None,
        "created_at": obj.created_at.isoformat() if obj.created_at else None,
        "updated_at": obj.updated_at.isoformat() if obj.updated_at else None,
    }


__all__ = ["serialize_item", "serialize_list"]
