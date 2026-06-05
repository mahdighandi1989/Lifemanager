"""Backwards-compat shim — re-exports the split AI service modules.

The real code now lives in app/services/ai/:

  * model_service.py — AIService class (CRUD) + DEFAULT_MODEL / DEFAULT_PROVIDER
  * nlp_service.py   — generate_text orchestrator with placeholder fallback
  * provider_service.py — actual httpx POST to the upstream provider

Routes and other callers can keep importing from app.services.ai_service:

    from app.services.ai_service import AIService, generate_text

…and stay agnostic of the split.
"""
from app.services.ai import (  # noqa: F401  re-export
    AIImageService,
    AIService,
    DEFAULT_MODEL,
    DEFAULT_PROVIDER,
    ai_feedback_logger,
    ai_performance_tracker,
    ai_response_processor,
    analyze_image,
    call_openai_chat,
    generate_text,
    get_active_config,
    has_openai_key,
)

__all__ = [
    "AIImageService",
    "AIService",
    "DEFAULT_MODEL",
    "DEFAULT_PROVIDER",
    "ai_feedback_logger",
    "ai_performance_tracker",
    "ai_response_processor",
    "analyze_image",
    "call_openai_chat",
    "generate_text",
    "get_active_config",
    "has_openai_key",
]
