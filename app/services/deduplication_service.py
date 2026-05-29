"""DeduplicationService — the chaos-reduction facade (audit task fbd9bd36).

The user's voice memo asked to consolidate similar lists/tasks/pages "without
any summarization, without any deletion" so the app escapes its current chaos.
This service is the AC-named surface for that:

  * ``scan_for_duplicates`` groups similar Task / Project / List entities.
  * ``merge`` folds a *source* into a *target* — moving the source's content to
    the target and SOFT-DELETING the source (Task.merged_into_id /
    Project.is_active=False / TodoList.is_archived=True). Nothing is summarized
    or hard-deleted; the source row and its data survive, just marked merged.

It reuses the existing ``similarity_service`` (Jaccard grouping) and
``consolidation_service`` (task merge) instead of duplicating that logic.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Sequence

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.models.task import Task
from app.models.todo_list import TodoList, todo_list_items
from app.services import consolidation_service
from app.services.similarity_service import find_similar_entities

_ENTITY_TYPES = ("task", "project", "list")


@dataclass
class _Adapter:
    """Uniform (id, title, description) view so find_similar_entities works
    across Task (title) and Project/List (name)."""

    id: int
    title: str
    description: str


class DeduplicationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _active_rows(self, entity_type: str, user_id: int) -> list:
        if entity_type == "task":
            stmt = select(Task).where(
                Task.user_id == user_id, Task.merged_into_id.is_(None)
            )
        elif entity_type == "project":
            stmt = select(Project).where(
                Project.user_id == user_id, Project.is_active.is_(True)
            )
        elif entity_type == "list":
            stmt = select(TodoList).where(
                TodoList.user_id == user_id, TodoList.is_archived.is_(False)
            )
        else:
            return []
        return list((await self.db.execute(stmt)).scalars().all())

    @staticmethod
    def _adapt(row) -> _Adapter:
        title = getattr(row, "title", None) or getattr(row, "name", None) or ""
        return _Adapter(
            id=row.id, title=title, description=getattr(row, "description", "") or ""
        )

    @staticmethod
    def _label(row) -> str:
        return getattr(row, "title", None) or getattr(row, "name", None) or f"#{row.id}"

    async def scan_for_duplicates(
        self,
        *,
        user_id: int = 0,
        entity_types: Optional[Sequence[str]] = None,
        threshold: float = 0.5,
    ) -> List[dict]:
        """Return similar-entity groups across Task / Project / List (AC1).

        Each group: ``{entity_type, entity_ids, items:[{id,label}]}``. Only
        groups with 2+ members (an actual duplicate) are returned.
        """
        groups_out: List[dict] = []
        for et in (entity_types or _ENTITY_TYPES):
            rows = await self._active_rows(et, user_id)
            by_id = {r.id: r for r in rows}
            adapters = [self._adapt(r) for r in rows]
            for group in find_similar_entities(adapters, threshold=threshold):
                groups_out.append(
                    {
                        "entity_type": et,
                        "entity_ids": group,
                        "items": [
                            {"id": i, "label": self._label(by_id[i])}
                            for i in group
                            if i in by_id
                        ],
                    }
                )
        return groups_out

    async def merge(
        self, *, source_id: int, target_id: int, entity_type: str = "task"
    ) -> dict:
        """Move the source entity's content into the target and soft-delete the
        source (AC3). Returns ``{ok, ...}`` — never hard-deletes."""
        if source_id == target_id:
            return {"ok": False, "error": "source and target are the same"}

        if entity_type == "task":
            result = await consolidation_service.merge_tasks(
                self.db, target_id, [source_id]
            )
            if result is None:
                return {"ok": False, "error": "target task not found"}
            return {
                "ok": True,
                "entity_type": "task",
                "source_id": source_id,
                "target_id": target_id,
                "moved": result.get("merge_count", 0),
            }

        if entity_type == "project":
            src = await self.db.get(Project, source_id)
            tgt = await self.db.get(Project, target_id)
            if src is None or tgt is None:
                return {"ok": False, "error": "project not found"}
            res = await self.db.execute(
                update(Task)
                .where(Task.project_id == source_id)
                .values(project_id=target_id)
            )
            src.is_active = False
            await self.db.commit()
            return {
                "ok": True,
                "entity_type": "project",
                "source_id": source_id,
                "target_id": target_id,
                "moved": res.rowcount or 0,
            }

        if entity_type == "list":
            src = await self.db.get(TodoList, source_id)
            tgt = await self.db.get(TodoList, target_id)
            if src is None or tgt is None:
                return {"ok": False, "error": "list not found"}
            existing = set(
                (
                    await self.db.execute(
                        select(todo_list_items.c.todo_item_id).where(
                            todo_list_items.c.todo_list_id == target_id
                        )
                    )
                ).scalars().all()
            )
            src_items = (
                await self.db.execute(
                    select(todo_list_items.c.todo_item_id).where(
                        todo_list_items.c.todo_list_id == source_id
                    )
                )
            ).scalars().all()
            moved = 0
            for item_id in src_items:
                if item_id in existing:
                    continue
                await self.db.execute(
                    update(todo_list_items)
                    .where(
                        todo_list_items.c.todo_list_id == source_id,
                        todo_list_items.c.todo_item_id == item_id,
                    )
                    .values(todo_list_id=target_id)
                )
                moved += 1
            src.is_archived = True
            await self.db.commit()
            return {
                "ok": True,
                "entity_type": "list",
                "source_id": source_id,
                "target_id": target_id,
                "moved": moved,
            }

        return {"ok": False, "error": f"unsupported entity_type {entity_type}"}
