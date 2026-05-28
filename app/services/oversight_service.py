"""OversightService — cross-project oversight analytics.

Audit task d2146781, AC5: ``analyze_time_allocation`` summarises how much
scheduled sync time the user's external projects consume, so the oversight
dashboard can flag projects that are over/under-weighted.
"""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.external_project import ExternalProject


class OversightService:
    def __init__(self, db: AsyncSession):
        self.db = db

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
