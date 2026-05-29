"""AIProvider — one external AI vendor the user has registered.

Backs the per-user settings page (audit task 1a08ded2). One row per
(vendor, user). The vendor list (DeepSeek, GPT, Gemini, Claude,
Grok, Perplexity, etc.) is open: the user types whatever ``name``
their integration speaks to.
"""
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class AIProvider(Base):
    __tablename__ = "ai_providers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    name = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    is_enabled = Column(Boolean, default=True, nullable=False)
    # Routing config (audit task 1a08ded2 AC5/7). ``base_url`` points at any
    # OpenAI-compatible endpoint (DeepSeek/Grok/Perplexity/OpenRouter/local);
    # ``api_key_encrypted`` stores the per-provider key encrypted-at-rest via
    # app/services/crypt_service (never plaintext); ``default_model`` is used
    # when a request doesn't name a model.
    base_url = Column(String(512), nullable=True)
    api_key_encrypted = Column(Text, nullable=True)
    default_model = Column(String(120), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class GlobalAnalysisPrompt(Base):
    """The single editable prompt the user attaches to all AI analysis.

    The voice idea behind task 1a08ded2: "a prompt box in the settings
    page that I can edit any time, and the analysis follows whatever
    instructions I put there." One row per user — the GET endpoint
    serves an empty default when none exists yet.
    """

    __tablename__ = "global_analysis_prompts"

    id = Column(Integer, primary_key=True, index=True)
    prompt_text = Column(Text, nullable=False, default="")
    edited_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    last_edited_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
