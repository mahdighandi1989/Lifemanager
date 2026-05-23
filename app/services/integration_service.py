from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional, Dict, Any
import httpx
from datetime import datetime

from app.models.integration import Integration
from app.schemas.integration import IntegrationCreate, IntegrationUpdate, IntegrationSyncResult

# ── CRUD for Integration configurations ──

async def create_integration(db: AsyncSession, integration_data: IntegrationCreate, user_id: int) -> Integration:
    db_integration = Integration(
        **integration_data.dict(),
        user_id=user_id
    )
    db.add(db_integration)
    await db.commit()
    await db.refresh(db_integration)
    return db_integration

async def get_integration(db: AsyncSession, integration_id: int, user_id: int) -> Optional[Integration]:
    result = await db.execute(
        select(Integration).where(
            Integration.id == integration_id,
            Integration.user_id == user_id
        )
    )
    return result.scalar_one_or_none()

async def get_user_integrations(db: AsyncSession, user_id: int) -> List[Integration]:
    result = await db.execute(
        select(Integration).where(Integration.user_id == user_id)
    )
    return list(result.scalars().all())

async def update_integration(
    db: AsyncSession,
    integration_id: int,
    integration_data: IntegrationUpdate,
    user_id: int
) -> Optional[Integration]:
    integration = await get_integration(db, integration_id, user_id)
    if not integration:
        return None
    for field, value in integration_data.dict(exclude_unset=True).items():
        setattr(integration, field, value)
    integration.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(integration)
    return integration

async def delete_integration(db: AsyncSession, integration_id: int, user_id: int) -> bool:
    result = await db.execute(
        delete(Integration).where(
            Integration.id == integration_id,
            Integration.user_id == user_id
        )
    )
    await db.commit()
    return result.rowcount > 0

# ── Sync / External service communication ──

async def sync_with_external_service(
    db: AsyncSession,
    integration_id: int,
    user_id: int,
    endpoint: str = "/sync",
    payload: Optional[Dict[str, Any]] = None
) -> IntegrationSyncResult:
    """
    Sync data with an external service using the integration's stored credentials.
    """
    integration = await get_integration(db, integration_id, user_id)
    if not integration:
        raise ValueError(f"Integration {integration_id} not found")
    
    if not integration.is_active:
        raise ValueError("Integration is not active")
    
    base_url = integration.base_url.rstrip("/")
    url = f"{base_url}{endpoint}"
    
    headers = {
        "Authorization": f"Bearer {integration.api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload or {}, headers=headers)
            response.raise_for_status()
            data = response.json()
        
        integration.last_sync_at = datetime.utcnow()
        await db.commit()
        
        return IntegrationSyncResult(
            success=True,
            status_code=response.status_code,
            data=data,
            message="Sync completed successfully"
        )
    except httpx.HTTPStatusError as e:
        return IntegrationSyncResult(
            success=False,
            status_code=e.response.status_code,
            data=None,
            message=f"HTTP error: {e.response.text}"
        )
    except httpx.RequestError as e:
        return IntegrationSyncResult(
            success=False,
            status_code=None,
            data=None,
            message=f"Connection error: {str(e)}"
        )

async def test_connection(db: AsyncSession, integration_id: int, user_id: int) -> bool:
    """Test if the external service is reachable with current credentials."""
    integration = await get_integration(db, integration_id, user_id)
    if not integration:
        raise ValueError(f"Integration {integration_id} not found")
    
    base_url = integration.base_url.rstrip("/")
    url = f"{base_url}/health"
    
    headers = {"Authorization": f"Bearer {integration.api_key}"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
        return response.status_code < 500
    except httpx.RequestError:
        return False
