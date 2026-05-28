"""/api/external-projects (audit task d2146781)."""
from typing import List

from fastapi import APIRouter, Body, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_optional_user_id
from app.middleware import handle_errors
from app.schemas.external_project_schema import (
    ExternalProjectCreate,
    ExternalProjectResponse,
)
from app.services import external_project_service


router = APIRouter()


@router.post(
    "/api/external-projects",
    response_model=ExternalProjectResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["external-projects"],
)
@handle_errors
async def create_external_project(
    payload: ExternalProjectCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    return await external_project_service.create_external_project(
        db, user_id=user_id, payload=payload
    )


@router.get(
    "/api/external-projects",
    response_model=List[ExternalProjectResponse],
    tags=["external-projects"],
)
@handle_errors
async def list_external_projects(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_optional_user_id),
):
    return await external_project_service.list_external_projects(
        db, user_id=user_id
    )
