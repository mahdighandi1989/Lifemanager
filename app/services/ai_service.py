from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List, Dict, Any
import httpx

from app.models.ai_model_config import AIModelConfig
from app.schemas.ai import AICompletionRequest, AICompletionResponse

# Default provider config — should be overridden by DB config
DEFAULT_PROVIDER = "openai"
DEFAULT_MODEL = "gpt-3.5-turbo"
DEFAULT_API_URL = "https://api.openai.com/v1/chat/completions"

async def get_active_config(db: AsyncSession) -> Optional[AIModelConfig]:
    """Get the currently active AI model configuration from DB."""
    result = await db.execute(
        select(AIModelConfig).where(AIModelConfig.is_active == True).limit(1)
    )
    return result.scalar_one_or_none()

async def get_completion(
    db: AsyncSession,
    request: AICompletionRequest,
    api_key: Optional[str] = None
) -> AICompletionResponse:
    """
    Send a completion request to the configured AI model.
    Falls back to default config if no active config in DB.
    """
    config = await get_active_config(db)
    
    provider = config.provider if config else DEFAULT_PROVIDER
    model = config.model_name if config else DEFAULT_MODEL
    api_url = config.api_url if config else DEFAULT_API_URL
    api_key = api_key or (config.api_key if config else None)
    
    if not api_key:
        raise ValueError("API key is required for AI service")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model,
        "messages": [{"role": msg.role, "content": msg.content} for msg in request.messages],
        "temperature": request.temperature or 0.7,
        "max_tokens": request.max_tokens or 1000
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(api_url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
    
    return AICompletionResponse(
        content=data["choices"][0]["message"]["content"],
        model=data.get("model", model),
        usage=data.get("usage", {})
    )

async def list_available_models(db: AsyncSession) -> List[Dict[str, Any]]:
    """List all configured AI models."""
    result = await db.execute(select(AIModelConfig))
    configs = result.scalars().all()
    return [
        {
            "id": c.id,
            "provider": c.provider,
            "model_name": c.model_name,
            "is_active": c.is_active
        }
        for c in configs
    ]

async def set_active_model(db: AsyncSession, config_id: int) -> AIModelConfig:
    """Set a specific model config as active (deactivate others)."""
    # Deactivate all
    all_configs = await db.execute(select(AIModelConfig))
    for cfg in all_configs.scalars().all():
        cfg.is_active = False
    
    # Activate the selected one
    result = await db.execute(select(AIModelConfig).where(AIModelConfig.id == config_id))
    config = result.scalar_one_or_none()
    if not config:
        raise ValueError(f"Model config with id {config_id} not found")
    config.is_active = True
    await db.commit()
    await db.refresh(config)
    return config
