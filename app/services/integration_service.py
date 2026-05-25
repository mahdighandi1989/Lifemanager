from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List, Optional
from datetime import datetime

from app.models.integration import Integration
from app.schemas.integration_schema import IntegrationCreate, IntegrationUpdate


class IntegrationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_integrations(self, user_id: int) -> List[Integration]:
        result = await self.db.execute(
            select(Integration).where(Integration.user_id == user_id)
        )
        return list(result.scalars().all())

    async def create_integration(
        self, integration_data: IntegrationCreate, user_id: int
    ) -> Integration:
        db_integration = Integration(
            name=integration_data.name,
            service_type=integration_data.service_type,
            api_key=integration_data.api_key,
            base_url=integration_data.base_url,
            config=integration_data.config or {},
            is_active=integration_data.is_active,
            user_id=user_id,
        )
        self.db.add(db_integration)
        await self.db.commit()
        await self.db.refresh(db_integration)
        return db_integration

    async def update_integration(
        self,
        integration_id: int,
        integration_data: IntegrationUpdate,
        user_id: int,
    ) -> Optional[Integration]:
        result = await self.db.execute(
            select(Integration).where(
                Integration.id == integration_id,
                Integration.user_id == user_id,
            )
        )
        integration = result.scalar_one_or_none()
        if not integration:
            return None
        update_data = integration_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(integration, key, value)
        integration.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(integration)
        return integration

    async def delete_integration(self, integration_id: int, user_id: int) -> bool:
        result = await self.db.execute(
            delete(Integration).where(
                Integration.id == integration_id,
                Integration.user_id == user_id,
            )
        )
        await self.db.commit()
        return result.rowcount > 0