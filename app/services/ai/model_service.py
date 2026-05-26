"""AI model config CRUD service.

Split out of the legacy app/services/ai_service.py so each concern
(model config CRUD vs. text generation vs. provider wiring) lives in
its own < 250 line module. The legacy module re-exports `AIService`
for callers that still import from app.services.ai_service.
"""
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_model_config import AIModelConfig
from app.schemas.ai_schema import (
    AIModelConfigCreate,
    AIModelConfigUpdate,
    AIQueryRequest,
    AIQueryResponse,
)

# Defaults shared with nlp_service. Kept here so callers that need just
# the model name don't have to import the NLP module too.
DEFAULT_PROVIDER = "openai"
DEFAULT_MODEL = "gpt-3.5-turbo"


class AIService:
    """CRUD façade over the ai_model_configs table.

    Dependency injection: the session is passed in by the route layer
    (``Depends(get_db)``) so tests can swap a fake session without
    monkeypatching module globals.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_configs(self, user_id: int) -> List[AIModelConfig]:
        result = await self.db.execute(select(AIModelConfig))
        return list(result.scalars().all())

    async def create_config(
        self, config_data: AIModelConfigCreate, user_id: int
    ) -> AIModelConfig:
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

    async def query(
        self, query_data: AIQueryRequest, user_id: int
    ) -> AIQueryResponse:
        """Acknowledge an AI query without touching upstream providers.

        The real text-generation path lives in
        ``app.services.ai.nlp_service.generate_text`` — this method is
        kept as a thin acknowledgement for routes that just want a 200
        with the canonical response shape.
        """
        return AIQueryResponse(
            response=(
                "AI query endpoint is configured. "
                "Set up your AI provider API key to enable responses."
            ),
            model_used=DEFAULT_MODEL,
            tokens_used=0,
        )


async def get_active_config(db: AsyncSession) -> Optional[AIModelConfig]:
    """Return the single is_active=True config row, if any."""
    result = await db.execute(
        select(AIModelConfig).where(AIModelConfig.is_active.is_(True)).limit(1)
    )
    return result.scalar_one_or_none()
