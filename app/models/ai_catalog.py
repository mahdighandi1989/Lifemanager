"""AI catalog — global provider / model / task-route registry.

This is the "complete AI settings" surface ported from the ALLIN1 design: a
curated **catalog** of providers (Anthropic, OpenAI, Gemini, DeepSeek, …), the
**models** each offers (tagged with capabilities), and per-application **task
routes** that pin a model to a feature (chat, planning, document_extraction, …).

It sits ALONGSIDE the pre-existing per-user ``AIProvider`` / ``AIModelConfig``
tables (CLAUDE.md rule 2/3 — never delete a capability): those keep powering the
legacy Settings UI and the analysis pipeline, while this catalog powers the new
AISettings page and the unified resolver (``app/services/ai/manager.py``).

Distinct table names (``ai_catalog_*``) avoid colliding with the legacy
``ai_providers`` / ``ai_model_configs`` tables.

API keys are stored ENCRYPTED-at-rest (``app/services/crypt_service.encrypt_data``)
and never returned to the client — ``to_dict`` exposes ``has_api_key`` + a masked
hint only (CLAUDE.md "Secrets" convention).
"""
from __future__ import annotations

from typing import Any, Dict, Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.sql import func
from sqlalchemy.types import JSON

from app.database import Base


def _mask_secret(value: Optional[str]) -> Optional[str]:
    """Return a masked hint (``••••`` + last 4 chars) — never the full secret."""
    if not value:
        return None
    tail = value[-4:] if len(value) >= 4 else value
    return "•" * 4 + tail


class AICatalogProvider(Base):
    """One AI vendor in the catalog. ``key`` is a stable slug ("anthropic")."""

    __tablename__ = "ai_catalog_providers"

    key = Column(String(40), primary_key=True)
    display_name = Column(String(120), nullable=False)
    enabled = Column(Boolean, nullable=False, default=False)
    # "api_key" (x-api-key / Bearer normal key) or "oauth_bearer" (subscription token).
    auth_scheme = Column(String(20), nullable=False, default="api_key")
    # Encrypted-at-rest secret (API key or OAuth token). NULL ⇒ rely on env_key.
    api_key_encrypted = Column(Text, nullable=True)
    base_url = Column(String(255), nullable=True)
    # Env var the resolver reads when api_key_encrypted is blank (ANTHROPIC_API_KEY…).
    env_key = Column(String(64), nullable=True)
    recommended = Column(Boolean, nullable=False, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self, *, env_configured: bool = False) -> Dict[str, Any]:
        masked = None
        if self.api_key_encrypted:
            try:
                from app.services.crypt_service import decrypt_data

                masked = _mask_secret(decrypt_data(self.api_key_encrypted))
            except Exception:
                masked = "•" * 4  # key present but undecryptable hint
        return {
            "key": self.key,
            "display_name": self.display_name,
            "enabled": bool(self.enabled),
            "auth_scheme": self.auth_scheme,
            "has_api_key": bool(self.api_key_encrypted),
            "api_key_masked": masked,
            "base_url": self.base_url,
            "env_key": self.env_key,
            "recommended": bool(self.recommended),
            # configured = secret in DB OR available via env var.
            "configured": bool(self.api_key_encrypted) or bool(env_configured),
            "notes": self.notes,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class AICatalogModel(Base):
    """One model offered by a catalog provider, tagged with capabilities."""

    __tablename__ = "ai_catalog_models"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_key = Column(String(120), unique=True, index=True, nullable=False)
    # Actual id sent to the provider; defaults to model_key when NULL.
    api_model_id = Column(String(120), nullable=True)
    provider_key = Column(
        String(40), ForeignKey("ai_catalog_providers.key"), index=True, nullable=False
    )
    display_name = Column(String(120), nullable=False)
    enabled = Column(Boolean, nullable=False, default=True)
    capabilities = Column(JSON, nullable=False, default=list)
    max_output_tokens = Column(Integer, nullable=True)
    context_window = Column(Integer, nullable=True)
    temperature = Column(Float, nullable=True)
    # Lower = preferred when auto-selecting a model for a task.
    priority = Column(Integer, nullable=False, default=5)
    input_cost_per_1m = Column(Float, nullable=True)
    output_cost_per_1m = Column(Float, nullable=True)
    # "catalog" (seeded), "discovered" (synced live), or "custom" (admin-added).
    source = Column(String(12), nullable=False, default="catalog")
    is_custom = Column(Boolean, nullable=False, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    @property
    def api_id(self) -> str:
        return self.api_model_id or self.model_key

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "model_key": self.model_key,
            "api_model_id": self.api_id,
            "provider_key": self.provider_key,
            "display_name": self.display_name,
            "enabled": bool(self.enabled),
            "capabilities": list(self.capabilities or []),
            "max_output_tokens": self.max_output_tokens,
            "context_window": self.context_window,
            "temperature": self.temperature,
            "priority": self.priority,
            "input_cost_per_1m": self.input_cost_per_1m,
            "output_cost_per_1m": self.output_cost_per_1m,
            "source": self.source,
            "is_custom": bool(self.is_custom),
            "notes": self.notes,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class AITaskRoute(Base):
    """Pins an application task ("chat") to a specific model, or NULL = auto-pick."""

    __tablename__ = "ai_task_routes"

    task = Column(String(60), primary_key=True)
    model_id = Column(
        Integer,
        ForeignKey("ai_catalog_models.id", ondelete="SET NULL"),
        nullable=True,
    )
    enabled = Column(Boolean, nullable=False, default=True)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task": self.task,
            "model_id": self.model_id,
            "enabled": bool(self.enabled),
            "notes": self.notes,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
