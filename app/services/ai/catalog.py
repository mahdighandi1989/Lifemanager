"""Static AI catalog — curated providers, models, capabilities, and task types.

Seeded idempotently into the ``ai_catalog_*`` tables on startup
(:func:`seed_ai_catalog`). The owner then enables a provider + pastes a key in
the new AISettings page; the resolver (``app/services/ai/manager.py``) routes
each application task to a configured model.

Model ids are kept current; pricing is intentionally left ``None`` (the owner
can sync live or edit per-model) so nothing is fabricated. Use the "Sync from
provider" action to pull the live model list.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

# --- Capabilities ------------------------------------------------------------
CAPABILITIES: List[Dict[str, str]] = [
    {"id": "text", "label": "متن / Text"},
    {"id": "vision", "label": "تصویر / Vision"},
    {"id": "reasoning", "label": "استدلال / Reasoning"},
    {"id": "long_context", "label": "زمینه‌ی بلند / Long context"},
    {"id": "fast", "label": "سریع / Fast"},
    {"id": "code", "label": "کد / Code"},
    {"id": "structured_output", "label": "خروجی ساختاریافته / Structured"},
    {"id": "documents", "label": "اسناد / PDF"},
    {"id": "audio", "label": "صوت / Audio"},
    {"id": "web_search", "label": "جست‌وجوی وب / Web search"},
]
CAPABILITY_IDS = {c["id"] for c in CAPABILITIES}

# --- Application tasks (Lifemanager domain) ----------------------------------
TASK_TYPES: List[Dict[str, str]] = [
    {"id": "general", "label": "عمومی", "description": "مدل پیش‌فرض هر قابلیت AI بدون مسیر اختصاصی.", "preferred": "reasoning"},
    {"id": "chat", "label": "گفت‌وگو / دستیار", "description": "پرسش‌وپاسخ محاوره‌ای دستیار هوشمند.", "preferred": "reasoning"},
    {"id": "planning", "label": "برنامه‌ریزی", "description": "برنامه‌ریزی روز/پروژه و اولویت‌بندی کارها.", "preferred": "reasoning"},
    {"id": "task_analysis", "label": "تحلیل کارها", "description": "تحلیل و پیشنهاد روی تسک‌ها و لیست‌ها.", "preferred": "reasoning"},
    {"id": "summarization", "label": "خلاصه‌سازی", "description": "خلاصه‌کردن متن‌ها و یادداشت‌ها.", "preferred": "fast"},
    {"id": "classification", "label": "دسته‌بندی", "description": "دسته‌بندی و برچسب‌زدن داده‌ها.", "preferred": "fast"},
    {"id": "sentiment", "label": "تحلیل احساسات", "description": "تشخیص احساس/حال‌وهوا از متن.", "preferred": "fast"},
    {"id": "personality", "label": "پروفایل شخصیت", "description": "استخراج ویژگی‌های شخصیتی.", "preferred": "reasoning"},
    {"id": "career", "label": "مسیر شغلی", "description": "ترسیم آینده و پیشنهاد مسیر شغلی.", "preferred": "reasoning"},
    {"id": "recommendation", "label": "پیشنهادها", "description": "پیشنهادهای زمینه‌محور.", "preferred": "reasoning"},
    {"id": "document_extraction", "label": "استخراج از سند", "description": "خواندن PDF/تصویر و استخراج داده.", "preferred": "documents"},
    {"id": "translation", "label": "ترجمه", "description": "ترجمه‌ی متن بین زبان‌ها.", "preferred": "fast"},
]

DEFAULT_PROVIDER_KEY = "anthropic"
DEFAULT_MODEL_KEY = "claude-opus-4-8"

# Claude Code OAuth (subscription) requests must lead with this system block so
# Anthropic honours a subscription token. Mirrors the ALLIN1 design.
CLAUDE_CODE_SYSTEM = "You are Claude Code, Anthropic's official CLI for Claude."

# --- Provider catalog --------------------------------------------------------
# Each provider: display_name, base_url, env_key, auth_scheme, recommended,
# notes, models[]. Each model: model_key, [api_model_id], display_name,
# capabilities[], [max_output_tokens], [context_window], priority.
PROVIDER_CATALOG: Dict[str, Dict[str, Any]] = {
    "anthropic": {
        "display_name": "Anthropic (Claude · API key)",
        "base_url": "https://api.anthropic.com",
        "env_key": "ANTHROPIC_API_KEY",
        "auth_scheme": "api_key",
        "recommended": True,
        "notes": "کلید API کلود — استدلال قوی، دید تصویر، و خواندن PDF.",
        "models": [
            {"model_key": "claude-opus-4-8", "display_name": "Claude Opus 4.8", "capabilities": ["text", "vision", "reasoning", "long_context", "code", "structured_output", "documents"], "max_output_tokens": 64000, "context_window": 200000, "priority": 1},
            {"model_key": "claude-sonnet-4-6", "display_name": "Claude Sonnet 4.6", "capabilities": ["text", "vision", "reasoning", "long_context", "code", "structured_output", "documents", "fast"], "max_output_tokens": 64000, "context_window": 200000, "priority": 2},
            {"model_key": "claude-haiku-4-5-20251001", "display_name": "Claude Haiku 4.5", "capabilities": ["text", "vision", "fast", "code", "structured_output"], "max_output_tokens": 32000, "context_window": 200000, "priority": 3},
        ],
    },
    "claude_subscription": {
        "display_name": "Claude (اشتراک · OAuth token)",
        "base_url": "https://api.anthropic.com",
        "env_key": "CLAUDE_CODE_OAUTH_TOKEN",
        "auth_scheme": "oauth_bearer",
        "recommended": True,
        "notes": "اگر اشتراک Claude داری: توکن OAuth را اینجا بگذار (به‌جای کلید API).",
        "models": [
            {"model_key": "claude-opus-4-8-sub", "api_model_id": "claude-opus-4-8", "display_name": "Claude Opus 4.8 (اشتراک)", "capabilities": ["text", "vision", "reasoning", "long_context", "code", "structured_output", "documents"], "max_output_tokens": 64000, "context_window": 200000, "priority": 1},
        ],
    },
    "openai": {
        "display_name": "OpenAI (GPT)",
        "base_url": "https://api.openai.com/v1",
        "env_key": "OPENAI_API_KEY",
        "auth_scheme": "api_key",
        "recommended": False,
        "notes": "کلید OpenAI. سازگار با endpointهای chat/completions.",
        "models": [
            {"model_key": "gpt-4o", "display_name": "GPT-4o", "capabilities": ["text", "vision", "reasoning", "code", "structured_output", "fast"], "max_output_tokens": 16384, "context_window": 128000, "priority": 2},
            {"model_key": "gpt-4o-mini", "display_name": "GPT-4o mini", "capabilities": ["text", "vision", "fast", "code", "structured_output"], "max_output_tokens": 16384, "context_window": 128000, "priority": 3},
        ],
    },
    "gemini": {
        "display_name": "Google Gemini",
        "base_url": "https://generativelanguage.googleapis.com",
        "env_key": "GEMINI_API_KEY",
        "auth_scheme": "api_key",
        "recommended": False,
        "notes": "کلید Google AI Studio. دید تصویر، صوت/ویدئو، و زمینه‌ی بسیار بلند.",
        "models": [
            {"model_key": "gemini-2.0-flash", "display_name": "Gemini 2.0 Flash", "capabilities": ["text", "vision", "audio", "fast", "long_context", "code", "documents"], "max_output_tokens": 8192, "context_window": 1000000, "priority": 2},
            {"model_key": "gemini-1.5-pro", "display_name": "Gemini 1.5 Pro", "capabilities": ["text", "vision", "audio", "reasoning", "long_context", "code", "documents"], "max_output_tokens": 8192, "context_window": 2000000, "priority": 3},
        ],
    },
    "deepseek": {
        "display_name": "DeepSeek",
        "base_url": "https://api.deepseek.com/v1",
        "env_key": "DEEPSEEK_API_KEY",
        "auth_scheme": "api_key",
        "recommended": False,
        "notes": "سازگار با OpenAI. مدل‌های reasoning مقرون‌به‌صرفه.",
        "models": [
            {"model_key": "deepseek-chat", "display_name": "DeepSeek Chat", "capabilities": ["text", "code", "fast"], "max_output_tokens": 8192, "context_window": 64000, "priority": 4},
            {"model_key": "deepseek-reasoner", "display_name": "DeepSeek Reasoner", "capabilities": ["text", "reasoning", "code"], "max_output_tokens": 8192, "context_window": 64000, "priority": 4},
        ],
    },
    "openrouter": {
        "display_name": "OpenRouter",
        "base_url": "https://openrouter.ai/api/v1",
        "env_key": "OPENROUTER_API_KEY",
        "auth_scheme": "api_key",
        "recommended": False,
        "notes": "دروازه‌ی چندمدلی سازگار با OpenAI. مدل دلخواه را به‌صورت custom اضافه کن.",
        "models": [],
    },
    "perplexity": {
        "display_name": "Perplexity",
        "base_url": "https://api.perplexity.ai",
        "env_key": "PERPLEXITY_API_KEY",
        "auth_scheme": "api_key",
        "recommended": False,
        "notes": "سازگار با OpenAI، با جست‌وجوی وب درون‌خط.",
        "models": [
            {"model_key": "sonar", "display_name": "Sonar", "capabilities": ["text", "web_search", "fast"], "context_window": 128000, "priority": 5},
        ],
    },
    "xai": {
        "display_name": "xAI (Grok)",
        "base_url": "https://api.x.ai/v1",
        "env_key": "XAI_API_KEY",
        "auth_scheme": "api_key",
        "recommended": False,
        "notes": "سازگار با OpenAI.",
        "models": [
            {"model_key": "grok-2", "display_name": "Grok 2", "capabilities": ["text", "reasoning", "code"], "context_window": 131072, "priority": 5},
        ],
    },
}


def iter_catalog_models():
    """Yield ``(provider_key, model_def)`` for every catalog model."""
    for provider_key, pdef in PROVIDER_CATALOG.items():
        for mdef in pdef.get("models", []):
            yield provider_key, mdef


def task_preferred_capability(task: str) -> Optional[str]:
    for t in TASK_TYPES:
        if t["id"] == task:
            return t.get("preferred")
    return None


async def seed_ai_catalog(db) -> Dict[str, int]:
    """Idempotently sync the static catalog into the DB. Safe to call every boot.

    - Creates missing providers (disabled, waiting for a key); refreshes their
      catalog metadata WITHOUT clobbering enabled/api_key.
    - Creates missing catalog models; refreshes metadata for ``source='catalog'``
      rows; never touches ``is_custom`` rows.
    - Ensures a (null = auto) route row exists for every task type.
    Returns a small counts summary.
    """
    from sqlalchemy import select

    from app.models.ai_catalog import AICatalogModel, AICatalogProvider, AITaskRoute

    counts = {"providers_added": 0, "models_added": 0, "routes_added": 0}

    # Providers --------------------------------------------------------------
    existing_providers = {
        p.key: p for p in (await db.execute(select(AICatalogProvider))).scalars().all()
    }
    for key, pdef in PROVIDER_CATALOG.items():
        prov = existing_providers.get(key)
        if prov is None:
            prov = AICatalogProvider(
                key=key,
                display_name=pdef["display_name"],
                enabled=False,
                auth_scheme=pdef.get("auth_scheme", "api_key"),
                base_url=pdef.get("base_url"),
                env_key=pdef.get("env_key"),
                recommended=bool(pdef.get("recommended")),
                notes=pdef.get("notes"),
            )
            db.add(prov)
            counts["providers_added"] += 1
        else:
            # Refresh catalog metadata only (keep enabled + api_key untouched).
            prov.display_name = pdef["display_name"]
            prov.auth_scheme = pdef.get("auth_scheme", "api_key")
            prov.base_url = pdef.get("base_url")
            prov.env_key = pdef.get("env_key")
            prov.recommended = bool(pdef.get("recommended"))
            prov.notes = pdef.get("notes")

    # Models -----------------------------------------------------------------
    existing_models = {
        m.model_key: m for m in (await db.execute(select(AICatalogModel))).scalars().all()
    }
    for provider_key, mdef in iter_catalog_models():
        model = existing_models.get(mdef["model_key"])
        if model is None:
            db.add(
                AICatalogModel(
                    model_key=mdef["model_key"],
                    api_model_id=mdef.get("api_model_id"),
                    provider_key=provider_key,
                    display_name=mdef.get("display_name", mdef["model_key"]),
                    enabled=True,
                    capabilities=list(mdef.get("capabilities", [])),
                    max_output_tokens=mdef.get("max_output_tokens"),
                    context_window=mdef.get("context_window"),
                    temperature=mdef.get("temperature"),
                    priority=int(mdef.get("priority", 5)),
                    input_cost_per_1m=mdef.get("input_cost_per_1m"),
                    output_cost_per_1m=mdef.get("output_cost_per_1m"),
                    source="catalog",
                    is_custom=False,
                )
            )
            counts["models_added"] += 1
        elif not model.is_custom:
            # Refresh metadata for catalog/discovered rows; keep ``enabled``.
            model.api_model_id = mdef.get("api_model_id")
            model.provider_key = provider_key
            model.display_name = mdef.get("display_name", model.display_name)
            model.capabilities = list(mdef.get("capabilities", []))
            model.max_output_tokens = mdef.get("max_output_tokens")
            model.context_window = mdef.get("context_window")
            if model.source == "discovered":
                model.source = "catalog"

    # Task routes ------------------------------------------------------------
    existing_routes = {
        r.task for r in (await db.execute(select(AITaskRoute))).scalars().all()
    }
    for t in TASK_TYPES:
        if t["id"] not in existing_routes:
            db.add(AITaskRoute(task=t["id"], model_id=None, enabled=True))
            counts["routes_added"] += 1

    await db.commit()
    return counts
