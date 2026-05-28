"""Recommendation engine driven by user-need intent + keywords
(audit task 217909d2 ACs 38-42)."""
from __future__ import annotations

import re
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.local_file_entry import LocalFileEntry
from app.models.task import Task
from app.models.todo_item import TodoItem
from app.models.todo_list import TodoList, todo_list_items


# Intent keyword map — a tiny stand-in for a real NLP pipeline.
INTENT_KEYWORDS = {
    "watch_movie": ["movie", "film", "watch", "فیلم", "تماشا"],
    "read_book": ["book", "read", "کتاب", "خواندن"],
    "shopping": ["buy", "shop", "خرید"],
}


def _normalise(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip().lower()


def extract_intent_and_keywords(query: str) -> dict:
    """AC 42 — extract intent + keywords from a free-form user query."""
    normalised = _normalise(query)
    detected_intent: str | None = None
    matched_keywords: List[str] = []
    for intent, kws in INTENT_KEYWORDS.items():
        for kw in kws:
            if kw.lower() in normalised:
                detected_intent = intent
                matched_keywords.append(kw)
    return {
        "intent": detected_intent,
        "keywords": list(dict.fromkeys(matched_keywords)),  # de-dup, preserve order
    }


async def get_recommendations(
    db: AsyncSession, *, user_id: int, query: str
) -> List[dict]:
    """Return a list of {id, title, type} recommendations for ``user_id``
    that match the intent/keywords pulled from ``query``."""
    parsed = extract_intent_and_keywords(query)
    keywords = parsed["keywords"]
    if not keywords:
        return []
    out: List[dict] = []

    # Tasks
    tasks = await db.execute(select(Task).where(Task.user_id == user_id))
    for t in tasks.scalars().all():
        if any(kw.lower() in _normalise(t.title) for kw in keywords):
            out.append({"id": t.id, "title": t.title, "type": "task"})

    # Todo items via the user's lists
    todos = await db.execute(
        select(TodoItem)
        .join(todo_list_items, todo_list_items.c.todo_item_id == TodoItem.id)
        .join(TodoList, TodoList.id == todo_list_items.c.todo_list_id)
        .where(TodoList.user_id == user_id)
    )
    for it in todos.scalars().all():
        if any(kw.lower() in _normalise(it.content) for kw in keywords):
            out.append({"id": it.id, "title": it.content, "type": "todo_item"})

    # Local files
    files = await db.execute(
        select(LocalFileEntry).where(LocalFileEntry.user_id == user_id)
    )
    for f in files.scalars().all():
        haystack = " ".join(filter(None, [f.source_path, f.summary, f.keywords]))
        if any(kw.lower() in _normalise(haystack) for kw in keywords):
            out.append({"id": f.id, "title": f.source_path, "type": "local_file"})

    return out
