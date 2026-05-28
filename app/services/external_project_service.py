"""CRUD service for the ExternalProject model (audit task d2146781)."""
from __future__ import annotations

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.external_project import ExternalProject
from app.schemas.external_project_schema import ExternalProjectCreate


def _encrypt_api_key(plaintext: Optional[str]) -> Optional[str]:
    """AC 10 — opaque hook for the future crypt_service. For now we
    prefix the stored value with a marker so the encryption upgrade
    path is testable without immediately breaking unencrypted rows
    written before the helper landed."""
    if plaintext is None:
        return None
    # Placeholder marker — when crypt_service.encrypt lands, replace
    # this with the real ciphertext-wrap call.
    return f"enc::{plaintext}"


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
