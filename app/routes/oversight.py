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


@router.post("/api/v1/oversight/connections/{connection_id}/sync", tags=["oversight"])
@handle_errors
async def sync_connection(
    connection_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """Pull the latest data for one connection (audit task d2146781 AC6) — runs
    the generic adapter when base_url+key are set, else stamps last_sync_at."""
    return await OversightService(db).fetch_project_data(connection_id)


@router.get("/api/v1/oversight/tasks", tags=["oversight"])
@handle_errors
async def list_oversight_tasks(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> list:
    rows = await OversightService(db).list_oversight_tasks(user_id)
    return [
        {"id": t.id, "external_project_id": t.external_project_id, "task_type": t.task_type,
         "status": t.status, "priority": t.priority,
         "due_date": t.due_date.isoformat() if t.due_date else None}
        for t in rows
    ]


@router.get("/api/v1/oversight/time-allocation", tags=["oversight"])
@handle_errors
async def time_allocation(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    return await OversightService(db).analyze_time_allocation(user_id)


@router.get("/api/v1/oversight/neglected", tags=["oversight"])
@handle_errors
async def neglected_items(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    """The memo's "مغفول مونده رو بگه" + "فلان مشکل هست": stale connections +
    overdue oversight tasks."""
    svc = OversightService(db)
    return {
        "neglected": await svc.detect_neglected_items(user_id),
        "problems": await svc.detect_problems(user_id),
    }


class TimeBudgetIn(BaseModel):
    minutes: int = Field(..., ge=0, le=100_000)


@router.patch("/api/v1/oversight/connections/{connection_id}/time-budget", tags=["oversight"])
@handle_errors
async def set_time_budget(
    connection_id: int,
    payload: TimeBudgetIn = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
) -> dict:
    conn = await OversightService(db).set_time_budget(connection_id, minutes=payload.minutes)
    if conn is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Connection not found")
    return {"connection_id": connection_id, "time_budget_minutes": payload.minutes}
