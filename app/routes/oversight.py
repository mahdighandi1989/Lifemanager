"""/api/v1/oversight/* — manage connections to external PM projects.

Audit task d2146781 (AC 4, 5). The oversight layer connects to other projects
(Jira/Linear/...) so this app can manage/time-allocate across them. Tokens are
encrypted at rest via crypt_service before persistence.
"""
from typing import List, Optional

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.services.oversight_service import OversightService

router = APIRouter()


class ConnectionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    connection_type: str = Field(default="generic", max_length=64)
    sync_frequency: str = Field(default="manual", max_length=32)


class ConnectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    base_url: Optional[str]
    connection_type: str
    sync_frequency: str
    is_active: bool


def _encrypt_token(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    try:
        from app.config import settings
        from app.services.crypt_service import encrypt_data

        return encrypt_data(raw, secret=settings.SECRET_KEY)
    except Exception:
        # crypt unavailable on a stripped image — store raw rather than lose it.
        return raw


@router.post(
    "/api/v1/oversight/connections",
    response_model=ConnectionResponse,
    status_code=201,
    tags=["oversight"],
)
@handle_errors
async def create_connection(
    payload: ConnectionCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    svc = OversightService(db)
    conn = await svc.connect_to_external_project(
        user_id=user_id,
        name=payload.name,
        base_url=payload.base_url,
        api_key_encrypted=_encrypt_token(payload.api_key),
        connection_type=payload.connection_type,
        sync_frequency=payload.sync_frequency,
    )
    return conn


@router.get(
    "/api/v1/oversight/connections",
    response_model=List[ConnectionResponse],
    tags=["oversight"],
)
@handle_errors
async def list_connections(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    svc = OversightService(db)
    return await svc.list_connections(user_id=user_id, active_only=True)
