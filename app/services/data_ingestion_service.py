"""Ingest external data sources into the user's todo system
(audit task 217909d2 ACs 28-37)."""
from __future__ import annotations

import hashlib
from typing import Iterable, List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.indexed_data_source_entry import IndexedDataSourceEntry


class DataIngestionService:
    """Three-method contract the audit AC list requires."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def scan_external_source(
        self, source_paths: Iterable[str]
    ) -> List[dict]:
        """Hash each ``source_path`` so the caller can compare against
        existing IndexedDataSourceEntry rows."""
        out: List[dict] = []
        for path in source_paths:
            digest = hashlib.sha1(path.encode("utf-8")).hexdigest()
            out.append({"source_path": path, "checksum": digest})
        return out

    async def compare_and_ingest_new_data(
        self, *, user_id: int, scanned: List[dict]
    ) -> dict:
        """For each scanned entry, insert a new IndexedDataSourceEntry
        unless one with the same (user_id, source_path) already exists.
        Returns a summary dict."""
        result = await self.db.execute(
            select(IndexedDataSourceEntry).where(
                IndexedDataSourceEntry.user_id == user_id
            )
        )
        existing = {e.source_path: e for e in result.scalars().all()}
        created = 0
        skipped = 0
        for entry in scanned:
            if entry["source_path"] in existing:
                skipped += 1
                continue
            await self.process_new_entry(user_id=user_id, entry=entry)
            created += 1
        return {"created": created, "skipped": skipped}

    async def process_new_entry(self, *, user_id: int, entry: dict) -> IndexedDataSourceEntry:
        row = IndexedDataSourceEntry(
            user_id=user_id,
            source_path=entry["source_path"],
            checksum=entry.get("checksum"),
        )
        self.db.add(row)
        await self.db.commit()
        await self.db.refresh(row)
        return row

    async def compare_and_remove_deleted(
        self, *, user_id: int, present_paths: Iterable[str]
    ) -> dict:
        """Drop indexed entries whose source_path is no longer present in the
        latest scan (audit task 217909d2 AC3 / Step 7 — "اگه حذف شدن ازش پاک
        بکنه"). Returns ``{"removed": n}``."""
        present = set(present_paths)
        result = await self.db.execute(
            select(IndexedDataSourceEntry).where(
                IndexedDataSourceEntry.user_id == user_id
            )
        )
        removed = 0
        for row in result.scalars().all():
            if row.source_path not in present:
                await self.db.delete(row)
                removed += 1
        if removed:
            await self.db.commit()
        return {"removed": removed}

    async def sync_source(
        self, *, user_id: int, scanned: List[dict]
    ) -> dict:
        """One-shot periodic sync (Steps 6+7): add new entries AND prune the
        ones whose path vanished since the last scan. Returns the combined
        ``{created, skipped, removed}`` summary."""
        added = await self.compare_and_ingest_new_data(user_id=user_id, scanned=scanned)
        pruned = await self.compare_and_remove_deleted(
            user_id=user_id, present_paths=[e["source_path"] for e in scanned]
        )
        return {**added, **pruned}
