from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_db
from app.schemas.integration_schema import IntegrationCreate, IntegrationUpdate, IntegrationOut
from app.services.integration_service import IntegrationService
from app.models.user import User
from app.dependencies.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[IntegrationOut])
async def list_integrations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    integration_service = IntegrationService(db)
    integrations = await integration_service.get_user_integrations(current_user.id)
    return integrations


@router.post("/", response_model=IntegrationOut, status_code=status.HTTP_201_CREATED)
async def create_integration(
    integration_data: IntegrationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    integration_service = IntegrationService(db)
    integration = await integration_service.create_integration(integration_data, current_user.id)
    return integration


@router.patch("/{integration_id}", response_model=IntegrationOut)
async def update_integration(
    integration_id: int,
    integration_data: IntegrationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Partial-update an integration row.

    Audit-clarification: no frontend consumer today — the integrations
    settings UI is on the roadmap but not built. The endpoint is part
    of the integrations CRUD set (list / create / patch / delete) and
    is exercised by tests/test_integrations.py::test_update_integration*.
    Kept to keep CRUD complete for when the UI lands.
    """
    integration_service = IntegrationService(db)
    integration = await integration_service.update_integration(
        integration_id, integration_data, current_user.id
    )
    if not integration:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")
    return integration


@router.delete("/{integration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_integration(
    integration_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    integration_service = IntegrationService(db)
    success = await integration_service.delete_integration(integration_id, current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Integration not found")