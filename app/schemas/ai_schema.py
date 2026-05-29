"""Pydantic schemas for the AI endpoints.

Prompt validation rules (AC for the AI-validate task):
- AIQueryRequest.prompt is constrained to 1..1000 characters; longer
  prompts are rejected with 422.
- A field validator rejects prompts that look like a SQL injection probe
  ("1=1", "; DROP", "UNION SELECT" idioms — not meaningful instructions
  to an LLM and almost always indicate abuse).
- The validator only triggers on those well-known sentinel patterns, so
  legitimate non-English / RTL prompts (Persian, Arabic, ...) pass
  through unchanged.
- AIQueryResponse is the schema the AI route validates against before
  returning to the client — only the declared fields ship in the wire
  payload.
"""
import re
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field, field_validator


# Patterns that almost never appear in legitimate AI prompts but are
# classic SQL injection probes. Case-insensitive substring match.
_SQLI_PATTERNS = [
    re.compile(r"\b1\s*=\s*1\b", re.IGNORECASE),
    re.compile(r"'\s*or\s+'?1'?\s*=\s*'?1", re.IGNORECASE),
    re.compile(r";\s*drop\s+table\b", re.IGNORECASE),
    re.compile(r"\bunion\s+select\b", re.IGNORECASE),
    re.compile(r";\s*delete\s+from\b", re.IGNORECASE),
    re.compile(r"--\s*$", re.MULTILINE),
]


class AIModelConfigCreate(BaseModel):
    name: str
    provider: str
    model_name: str
    api_key_env_var: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    is_active: bool = True


class AIModelConfigUpdate(BaseModel):
    name: Optional[str] = None
    provider: Optional[str] = None
    model_name: Optional[str] = None
    api_key_env_var: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class AIModelConfigOut(BaseModel):
    id: int
    name: str
    provider: str
    model_name: str
    api_key_env_var: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AIQueryRequest(BaseModel):
    # Prompts exceeding 1000 chars are rejected (max_length); empty
    # prompts are rejected (min_length=1).
    prompt: str = Field(..., min_length=1, max_length=1000)
    model_config_id: Optional[int] = None
    max_tokens: Optional[int] = Field(default=1000, ge=1, le=8192)
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=2.0)

    @field_validator("prompt")
    @classmethod
    def reject_sql_injection_patterns(cls, value: str) -> str:
        for pattern in _SQLI_PATTERNS:
            if pattern.search(value):
                raise ValueError(
                    "prompt contains a disallowed pattern (SQL-injection probe)"
                )
        return value


# Generate-style request used by /ai/generate.
class AIGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    max_tokens: Optional[int] = Field(default=512, ge=1, le=8192)
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=2.0)
    # Optional structured wrapping for the analysis flow (audit
    # task e606cca6). `system_role_prompt` becomes the system message;
    # `task_context` is concatenated to the user message ahead of
    # `prompt` so the model sees both.
    system_role_prompt: Optional[str] = Field(default=None, max_length=4000)
    task_context: Optional[str] = Field(default=None, max_length=10_000)
    # AC 23 — UserActivityContext piggybacks here optionally; when the
    # caller doesn't provide it the route falls back to assembling a
    # fresh one via get_user_activity_context.
    user_context: Optional["UserActivityContext"] = None

    @field_validator("prompt")
    @classmethod
    def reject_sql_injection_patterns(cls, value: str) -> str:
        for pattern in _SQLI_PATTERNS:
            if pattern.search(value):
                raise ValueError(
                    "prompt contains a disallowed pattern (SQL-injection probe)"
                )
        return value


class UserActivityContext(BaseModel):
    """Audit task e606cca6 AC 22 — snapshot of a user's open work, used
    by the AI flow to ground its responses in the caller's actual
    surface (open tasks, recent completions, active projects)."""

    open_tasks: list = Field(default_factory=list)
    recently_completed_tasks: list = Field(default_factory=list)
    active_projects: list = Field(default_factory=list)


class DynamicAnalysisRequest(BaseModel):
    """Payload for POST /ai/dynamic-analyze (audit task e606cca6)."""

    prompt: str = Field(..., min_length=1, max_length=10_000)
    system_role_prompt: Optional[str] = None
    task_context: Optional[str] = None
    user_context: Optional[UserActivityContext] = None


class DynamicAnalysisResponse(BaseModel):
    insights: str
    model_used: Optional[str] = None


# ── AI analysis context + orchestration (audit task 1a08ded2 AC 32, 34) ──
class AIContextItem(BaseModel):
    """One piece of user-scoped context handed to the model for analysis."""

    kind: str  # "task" | "project" | "todo_item" | "notification"
    id: int
    text: str


class AIContextResponse(BaseModel):
    """Structured view of a user's data context (AC 32)."""

    items: list[AIContextItem] = []
    count: int = 0


class AIAnalysisRequest(BaseModel):
    """Payload for POST /ai/analyze (AC 34): analyse the caller's page data
    according to the editable global prompt + this request prompt."""

    prompt: str = Field(..., min_length=1, max_length=10_000)
    model_id: Optional[str] = None


class AIAnalysisResult(BaseModel):
    """Result of orchestrate_analysis (AC 34/35)."""

    insights: str
    model_used: Optional[str] = None
    context_items_count: int = 0


class AIQueryResponse(BaseModel):
    response: str
    model_used: Optional[str] = None
    tokens_used: Optional[int] = None


class AIGenerateResponse(BaseModel):
    """Shape returned by POST /ai/generate.

    The route validates the AI output against this schema before sending
    it back to the client — extra fields from upstream providers are
    stripped so a malformed provider response can't reach end users.
    """
    generated_text: str
    model_used: Optional[str] = None
    tokens_used: Optional[int] = None


# Resolve the forward reference now that UserActivityContext is defined
# below AIGenerateRequest's class body.
AIGenerateRequest.model_rebuild()
