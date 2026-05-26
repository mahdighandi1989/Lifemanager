"""AI service package — split out of the legacy app.services.ai_service module.

Sub-modules:

  * model_service — AIService class (CRUD over ai_model_configs)
  * nlp_service   — generate_text orchestrator with placeholder fallback
  * provider_service — actual httpx POST to OpenAI

The top-level app.services.ai_service module is kept as a thin re-export
shim so existing imports (`from app.services.ai_service import AIService`,
`from app.services.ai_service import generate_text`) keep working.
"""
from .model_service import (
    DEFAULT_MODEL,
    DEFAULT_PROVIDER,
    AIService,
    get_active_config,
)
from .nlp_service import generate_text
from .provider_service import call_openai_chat, has_openai_key

__all__ = [
    "AIService",
    "DEFAULT_MODEL",
    "DEFAULT_PROVIDER",
    "call_openai_chat",
    "generate_text",
    "get_active_config",
    "has_openai_key",
]
