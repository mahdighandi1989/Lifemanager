"""CRUD service for the ExternalProject model (audit task d2146781)."""
from __future__ import annotations

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.external_project import ExternalProject
from app.schemas.external_project_schema import ExternalProjectCreate


def _encrypt_api_key(plaintext: Optional[str]) -> Optional[str]:
    """Encrypt an external-project API token before it is persisted
    (audit task d2146781 AC10 / task 1a08ded2 AC5). Uses Fernet symmetric
    encryption via crypt_service so the raw token never sits in the DB in
    plaintext."""
    if plaintext is None:
        return None
    from app.config import settings
    from app.services.crypt_service import encrypt_data

    # Key the Fernet cipher off the app SECRET_KEY so encrypt/decrypt are
    # deterministic across calls (the no-secret path derives a random key
    # each time, which can't round-trip).
    return encrypt_data(plaintext, secret=settings.SECRET_KEY)


def decrypt_api_key(stored: Optional[str]) -> Optional[str]:
    """Inverse of :func:`_encrypt_api_key`. Falls back to returning the value
    unchanged if it isn't valid ciphertext (e.g. a legacy unencrypted row),
    so retrieval never hard-fails on historical data."""
    if stored is None:
        return None
    from app.config import settings
    from app.services.crypt_service import decrypt_data

    try:
        return decrypt_data(stored, secret=settings.SECRET_KEY)
    except Exception:
        return stored


async def create_external_project(
    db: AsyncSession,
    *,
    user_id: int,
    payload: ExternalProjectCreate,
) -> ExternalProject:
    row = ExternalProject(
        user_id=user_id,
        name=payload.name,
        provider=payload.provider,
        external_id=payload.external_id,
        base_url=payload.base_url,
        api_key=_encrypt_api_key(payload.api_key),
        workspace_id=payload.workspace_id,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


async def list_external_projects(
    db: AsyncSession, *, user_id: int
) -> List[ExternalProject]:
    result = await db.execute(
        select(ExternalProject).where(ExternalProject.user_id == user_id)
    )
    return list(result.scalars().all())


class ExternalProjectService:
    """Class wrapper exposing the sync behaviour (audit task d2146781, AC4).

    ``sync_project_data`` pulls the latest payload from an external project's
    API. The HTTP fetch is injectable (``fetcher``) so tests exercise the sync
    against a mock project without a live upstream; the default fetcher does a
    real timeout-bounded httpx GET. It never raises on an upstream failure so a
    scheduled sync loop can keep going for the user's other projects.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def sync_project_data(self, project, fetcher=None) -> dict:
        base_url = getattr(project, "base_url", None)
        if not base_url:
            return {"ok": False, "error": "missing base_url", "project_id": getattr(project, "id", None)}
        if fetcher is None:
            fetcher = self._default_fetch
        try:
            data = await fetcher(base_url, decrypt_api_key(getattr(project, "api_key", None)))
        except Exception as exc:  # noqa: BLE001 — sync must not crash the loop
            return {"ok": False, "error": str(exc), "project_id": getattr(project, "id", None)}
        synced = len(data) if hasattr(data, "__len__") else 1
        return {"ok": True, "project_id": getattr(project, "id", None), "synced_items": synced, "data": data}

    async def _default_fetch(self, base_url: str, api_key: Optional[str]):
        import httpx

        from app.config import settings

        headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
        timeout = getattr(settings, "EXTERNAL_API_TIMEOUT", 30.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(base_url, headers=headers)
            resp.raise_for_status()
            return resp.json()
