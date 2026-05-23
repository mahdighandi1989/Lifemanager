from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List, Dict, Any

from app.models.ai_model_config import AIModelConfig
from app.schemas.ai_schema import (
    AIModelConfigCreate,
    AIModelConfigUpdate,
    AIModelConfigOut,
    AIQueryRequest,
    AIQueryResponse,
)

# Default provider config
DEFAULT_PROVIDER = "openai"
DEFAULT_MODEL = "gpt-3.5-turbo"


class AIService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_configs(self, user_id: int) -> List[AIModelConfig]:
        result = await self.db.execute(select(AIModelConfig))
        return list(result.scalars().all())

    async def create_config(self, config_data: AIModelConfigCreate, user_id: int) -> AIModelConfig:
        db_config = AIModelConfig(
            name=config_data.name,
            provider=config_data.provider,
            model_name=config_data.model_name,
            api_key_env_var=config_data.api_key_env_var,
            parameters=config_data.parameters or {},
            is_active=config_data.is_active,
        )
        self.db.add(db_config)
        await self.db.commit()
        await self.db.refresh(db_config)
        return db_config

    async def update_config(
        self, config_id: int, config_data: AIModelConfigUpdate, user_id: int
    ) -> Optional[AIModelConfig]:
        result = await self.db.execute(
            select(AIModelConfig).where(AIModelConfig.id == config_id)
        )
        config = result.scalar_one_or_none()
        if not config:
            return None
        update_data = config_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(config, key, value)
        await self.db.commit()
        await self.db.refresh(config)
        return config

    async def delete_config(self, config_id: int, user_id: int) -> bool:
        result = await self.db.execute(
            select(AIModelConfig).where(AIModelConfig.id == config_id)
        )
        config = result.scalar_one_or_none()
        if not config:
            return False
        await self.db.delete(config)
        await self.db.commit()
        return True

    async def query(self, query_data: AIQueryRequest, user_id: int) -> AIQueryResponse:
        """Send a query to the AI model."""
        return AIQueryResponse(
            response="AI query endpoint is configured. Set up your AI provider API key to enable responses.",
            model_used=DEFAULT_MODEL,
            tokens_used=0,
        )


# Legacy function-based API (kept for backward compatibility)
async def get_active_config(db: AsyncSession) -> Optional[AIModelConfig]:
    result = await db.execute(
        select(AIModelConfig).where(AIModelConfig.is_active == True).limit(1)
    )
    return result.scalar_one_or_none()