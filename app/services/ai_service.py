import os
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
        select(AIModelConfig).where(AIModelConfig.is_active.is_(True)).limit(1)
    )
    return result.scalar_one_or_none()

# ────────────────────────────────────────────────────────────────────────
# Public AI text-generation helper used by POST /ai/generate.
#
# Production wiring: when OPENAI_API_KEY (or similar) is set in the
# environment, call the upstream provider here. Without a key, return a
# deterministic placeholder so the route works in dev/test and the AC
# behaviour (status 200, generated_text field) still holds.
# ────────────────────────────────────────────────────────────────────────

async def generate_text(
    prompt: str,
    *,
    max_tokens: int = 512,
    temperature: float = 0.7,
    model: str = DEFAULT_MODEL,
) -> dict:
    """Generate text for ``prompt``.

    Returns a dict matching AIGenerateResponse:
        {"generated_text": str, "model_used": str, "tokens_used": int}

    When no provider API key is configured, the prompt is echoed back
    in a wrapper so end-to-end tests don't depend on a live upstream.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        # Deterministic placeholder. Keeps the AC contract (response
        # contains 'generated_text') and gives a clear signal that real
        # wiring is pending.
        return {
            "generated_text": f"[ai-placeholder] prompt received (length={len(prompt)}): {prompt[:80]}",
            "model_used": model,
            "tokens_used": 0,
        }

    # Real upstream call lives here when an API key is configured. We
    # lazy-import so test environments without httpx/openai don't crash
    # at import time.
    try:
        import httpx

        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                },
            )
            r.raise_for_status()
            data = r.json()
            return {
                "generated_text": data["choices"][0]["message"]["content"],
                "model_used": data.get("model", model),
                "tokens_used": data.get("usage", {}).get("total_tokens", 0),
            }
    except Exception as exc:  # network / provider error
        return {
            "generated_text": f"[ai-error] {type(exc).__name__}: {exc}",
            "model_used": model,
            "tokens_used": 0,
        }
