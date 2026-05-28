"""LocalFileEntry persistence + NLP enrichment (audit task 217909d2).

Stores user-supplied file metadata, then asks
``app.services.ai.nlp_service.generate_text`` for a summary +
keyword extraction. Keeps the route layer thin and lets tests
patch the NLP boundary without going through HTTP.
"""
from __future__ import annotations

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.local_file_entry import LocalFileEntry
from app.schemas.local_file_entry_schema import LocalFileEntryCreate


def _csv_to_list(value: Optional[str]) -> Optional[List[str]]:
    if value is None:
        return None
    items = [p.strip() for p in value.split(",")]
    return [p for p in items if p]


def _list_to_csv(items: Optional[List[str]]) -> Optional[str]:
    if items is None:
        return None
    return ",".join(item.strip() for item in items if item.strip())


async def create_entry(
    db: AsyncSession,
    *,
    user_id: int,
    payload: LocalFileEntryCreate,
) -> LocalFileEntry:
    """Persist one file entry. If ``extracted_text`` is present, ask the
    NLP service for a summary + keyword list and store both."""
    summary: Optional[str] = None
    keywords_csv: Optional[str] = None

    if payload.extracted_text:
        from app.services.ai.nlp_service import generate_text

        nlp_out = await generate_text(
            f"Summarise and list 5 keywords for the following:\n{payload.extracted_text}",
            max_tokens=256,
        )
        summary = nlp_out.get("generated_text")
        # The placeholder generator doesn't emit a structured keyword
        # list; fall back to the first 5 distinct whitespace-separated
        # tokens from the source text as a baseline.
        words = [
            w.strip(",.;:?!()[]{}\"'") for w in payload.extracted_text.split()
        ]
        seen: List[str] = []
        for w in words:
            if w and w not in seen:
                seen.append(w)
            if len(seen) >= 5:
                break
        keywords_csv = _list_to_csv(seen) if seen else None

    entry = LocalFileEntry(
        user_id=user_id,
        source_path=payload.source_path,
        mime_type=payload.mime_type,
        size_bytes=payload.size_bytes,
        extracted_text=payload.extracted_text,
        summary=summary,
        keywords=keywords_csv,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


async def list_entries(db: AsyncSession, *, user_id: int) -> List[LocalFileEntry]:
    stmt = select(LocalFileEntry).where(LocalFileEntry.user_id == user_id)
    result = await db.execute(stmt)
    return list(result.scalars().all())


def serialize(entry: LocalFileEntry) -> dict:
    return {
        "id": entry.id,
        "user_id": entry.user_id,
        "source_path": entry.source_path,
        "mime_type": entry.mime_type,
        "size_bytes": entry.size_bytes,
        "summary": entry.summary,
        "keywords": _csv_to_list(entry.keywords),
        "created_at": entry.created_at,
    }
