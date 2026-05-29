"""OversightService — cross-project oversight analytics.

Audit task d2146781, AC5: ``analyze_time_allocation`` summarises how much
scheduled sync time the user's external projects consume, so the oversight
dashboard can flag projects that are over/under-weighted.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.external_project import ExternalProject, ExternalProjectConnection


class OversightService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def connect_to_external_project(
        self,
        *,
        user_id: int,
        name: str,
        base_url: Optional[str] = None,
        api_key_encrypted: Optional[str] = None,
        connection_type: str = "generic",
        sync_frequency: str = "manual",
    ) -> ExternalProjectConnection:
        """Create a new connection to an external PM system (audit task
        d2146781 AC 3). The token is stored as-is in ``api_key_encrypted`` —
        the route layer encrypts before calling (crypt_service.encrypt_data).
        """
        conn = ExternalProjectConnection(
            user_id=user_id,
            name=name,
            base_url=base_url,
            api_key_encrypted=api_key_encrypted,
            connection_type=connection_type,
            sync_frequency=sync_frequency,
            is_active=True,
        )
        self.db.add(conn)
        await self.db.commit()
        await self.db.refresh(conn)
        return conn

    async def list_connections(
        self, *, user_id: int, active_only: bool = True
    ) -> list[ExternalProjectConnection]:
        stmt = select(ExternalProjectConnection).where(
            ExternalProjectConnection.user_id == user_id
        )
        if active_only:
            stmt = stmt.where(ExternalProjectConnection.is_active.is_(True))
        return list((await self.db.execute(stmt)).scalars().all())

    async def fetch_project_data(self, connection_id: int) -> dict:
        """Pull the latest data for a connection (audit task d2146781 AC 6).

        Called by the ``sync_external_project`` Celery task. With no live
        upstream credentials wired, this stamps ``last_sync_at`` and returns an
        empty envelope — the plumbing is in place so a real adapter
        (ExternalProjectInterface) lights it up. Returns ``{"fetched": bool}``.
        """
        conn = await self.db.get(ExternalProjectConnection, connection_id)
        if conn is None:
            return {"fetched": False, "reason": "connection_not_found"}
        conn.last_sync_at = datetime.now(timezone.utc)
        await self.db.commit()
        return {
            "fetched": True,
            "connection_id": connection_id,
            "items": [],  # populated once a concrete adapter is registered
        }

    async def analyze_time_allocation(self, user_id: int) -> dict:
        """Summarise how the user's attention is spread across external
        projects, grouped by provider. (No per-project time-tracking column
        exists yet, so the project-count distribution per provider is the
        available proxy for allocation; the shape stays stable for a future
        time-weighted upgrade.)"""
        rows = (
            await self.db.execute(
                select(ExternalProject).where(ExternalProject.user_id == user_id)
            )
        ).scalars().all()

        by_provider: dict[str, int] = {}
        for p in rows:
            provider = getattr(p, "provider", None) or "unknown"
            by_provider[provider] = by_provider.get(provider, 0) + 1

        total = len(rows)
        breakdown = [
            {
                "provider": provider,
                "count": count,
                "share": round(count / total, 3) if total else 0.0,
            }
            for provider, count in sorted(by_provider.items())
        ]
        return {
            "user_id": user_id,
            "external_project_count": total,
            "by_provider": breakdown,
        }
