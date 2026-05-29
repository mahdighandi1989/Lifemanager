"""Consolidation service (audit task fbd9bd36, AC2).

``merge_tasks`` folds duplicate tasks into a primary: each duplicate gets its
``merged_into_id`` set to the primary (the "no longer active" signal — the
Task model has no is_active column, so merged_into_id is the equivalent marker
list endpoints can filter on), and the primary records a merge_history entry.
"""
from __future__ import annotations

import json
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task


async def merge_tasks(
    db: AsyncSession, primary_id: int, duplicate_ids: List[int]
) -> Optional[dict]:
    """Merge ``duplicate_ids`` into ``primary_id``. Returns a summary or None
    if the primary doesn't exist."""
    primary = await db.get(Task, primary_id)
    if primary is None:
        return None

    merged: List[int] = []
    for dup_id in duplicate_ids:
        if dup_id == primary_id:
            continue
        dup = await db.get(Task, dup_id)
        if dup is None or getattr(dup, "merged_into_id", None) is not None:
            continue
        dup.merged_into_id = primary_id
        merged.append(dup_id)

    # Append to the primary's merge history (stored as a JSON string).
    try:
        history = json.loads(primary.merge_history) if primary.merge_history else []
    except (TypeError, ValueError):
        history = []
    if merged:
        history.append({"merged_ids": merged})
        primary.merge_history = json.dumps(history, ensure_ascii=False)

    await db.commit()
    return {"primary_id": primary_id, "merged_ids": merged, "merge_count": len(merged)}
