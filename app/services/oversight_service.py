"""OversightService — cross-project oversight analytics.

Audit task d2146781, AC5: ``analyze_time_allocation`` summarises how much
scheduled sync time the user's external projects consume, so the oversight
dashboard can flag projects that are over/under-weighted.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.external_project import ExternalProject, ExternalProjectConnection
from app.models.oversight_task import OversightTask

# A connection unsynced for longer than this is "neglected" (the memo's
# "مغفول مونده رو بگه"). Tunable per call.
NEGLECT_THRESHOLD_DAYS = 14


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
        items: list = []
        # When the connection carries a base_url + key, run it through the
        # generic adapter to pull real project items; degrades to [] offline.
        if conn.base_url and conn.api_key_encrypted:
            try:
                from app.services.crypt_service import decrypt_data
                from app.services.integrations.external_project_interface import (
                    ExternalProjectConfig,
                )
                from app.services.integrations.generic_http_adapter import (
                    GenericHttpAdapter,
                )

                cfg = ExternalProjectConfig(
                    base_url=conn.base_url, api_key=decrypt_data(conn.api_key_encrypted)
                )
                infos = await GenericHttpAdapter().list_projects(cfg)
                items = [{"external_id": i.external_id, "name": i.name, "url": i.url} for i in infos]
            except Exception:
                items = []  # upstream unreachable / bad creds — best-effort
        conn.last_sync_at = datetime.now(timezone.utc)
        await self.db.commit()
        return {"fetched": True, "connection_id": connection_id, "items": items}

    async def set_time_budget(self, connection_id: int, *, minutes: int) -> Optional[ExternalProjectConnection]:
        conn = await self.db.get(ExternalProjectConnection, connection_id)
        if conn is None:
            return None
        conn.time_budget_minutes = minutes
        await self.db.commit()
        await self.db.refresh(conn)
        return conn

    async def detect_neglected_items(
        self, user_id: int, *, threshold_days: int = NEGLECT_THRESHOLD_DAYS
    ) -> list[dict]:
        """Connections never synced or untouched beyond ``threshold_days`` — the
        memo's "مغفول مونده رو بگه". Returns one entry per neglected connection
        with the days since last sync."""
        conns = await self.list_connections(user_id=user_id, active_only=True)
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(days=threshold_days)
        out: list[dict] = []
        for c in conns:
            last = c.last_sync_at
            if last is not None and last.tzinfo is None:
                last = last.replace(tzinfo=timezone.utc)
            if last is None or last < cutoff:
                days = None if last is None else (now - last).days
                out.append({
                    "connection_id": c.id, "name": c.name,
                    "days_since_sync": days, "reason": "never synced" if last is None else "stale",
                })
        return out

    async def detect_problems(self, user_id: int) -> list[dict]:
        """Surface problems across the user's oversight tasks — overdue ones
        (the memo's "اینجا فلان مشکل هست"). Joins OversightTask → connection."""
        conn_ids = [c.id for c in await self.list_connections(user_id=user_id, active_only=False)]
        if not conn_ids:
            return []
        rows = (
            await self.db.execute(
                select(OversightTask).where(OversightTask.external_project_id.in_(conn_ids))
            )
        ).scalars().all()
        now = datetime.now(timezone.utc)
        problems: list[dict] = []
        for t in rows:
            due = t.due_date
            if due is not None and due.tzinfo is None:
                due = due.replace(tzinfo=timezone.utc)
            if due is not None and due < now and t.status not in ("done", "completed", "cancelled"):
                problems.append({"task_id": t.id, "task_type": t.task_type, "status": t.status, "issue": "overdue"})
        return problems

    async def list_oversight_tasks(self, user_id: int) -> list[OversightTask]:
        conn_ids = [c.id for c in await self.list_connections(user_id=user_id, active_only=False)]
        if not conn_ids:
            return []
        return list(
            (await self.db.execute(
                select(OversightTask).where(OversightTask.external_project_id.in_(conn_ids))
            )).scalars().all()
        )

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

        # Per-connection time budget (the "زمانی که باید برای هر کدومشون بذاره"
        # ask) + a neglected flag, so the dashboard shows allocated time and
        # what's been ignored — not just a count proxy.
        conns = await self.list_connections(user_id=user_id, active_only=True)
        now = datetime.now(timezone.utc)
        budget_total = 0
        connection_budgets = []
        for c in conns:
            mins = c.time_budget_minutes or 0
            budget_total += mins
            last = c.last_sync_at
            if last is not None and last.tzinfo is None:
                last = last.replace(tzinfo=timezone.utc)
            neglected = last is None or last < now - timedelta(days=NEGLECT_THRESHOLD_DAYS)
            connection_budgets.append({
                "connection_id": c.id, "name": c.name,
                "time_budget_minutes": mins, "neglected": neglected,
            })
        return {
            "user_id": user_id,
            "external_project_count": total,
            "by_provider": breakdown,
            "total_budget_minutes": budget_total,
            "connections": connection_budgets,
        }
