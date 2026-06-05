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
    # Dynamic-context controls (audit task e606cca6 AC1).
    context_type: str = "tasks"
    dynamic_response: bool = True
    token_limit: Optional[int] = None


class AIModelConfigUpdate(BaseModel):
    name: Optional[str] = None
    provider: Optional[str] = None
    model_name: Optional[str] = None
    api_key_env_var: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    context_type: Optional[str] = None
    dynamic_response: Optional[bool] = None
    token_limit: Optional[int] = None


class AIModelConfigOut(BaseModel):
    id: int
    name: str
    provider: str
    model_name: str
    api_key_env_var: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    is_active: bool
    context_type: Optional[str] = "tasks"
    dynamic_response: Optional[bool] = True
    token_limit: Optional[int] = None
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


class AnalyzeTasksRequest(BaseModel):
    """Payload for POST /ai/analyze-tasks (audit task e606cca6 AC4)."""

    task_id: Optional[int] = None
    user_id: Optional[int] = None


class AIQueryResponse(BaseModel):
    response: str
    model_used: Optional[str] = None
    tokens_used: Optional[int] = None


class HallucinationAssessment(BaseModel):
    """Hallucination-guard metadata attached to a generated answer (audit
    task 32145cd6). ``flagged`` means the answer was queued for human review
    because its confidence fell below the configured threshold or it
    contradicted itself; the client can warn the user accordingly."""

    confidence: float = 1.0
    grounding_ratio: Optional[float] = None
    contradictions: list[str] = Field(default_factory=list)
    flagged: bool = False
    reasons: list[str] = Field(default_factory=list)


class AIGenerateResponse(BaseModel):
    """Shape returned by POST /ai/generate.

    The route validates the AI output against this schema before sending
    it back to the client — extra fields from upstream providers are
    stripped so a malformed provider response can't reach end users.
    """
    generated_text: str
    model_used: Optional[str] = None
    tokens_used: Optional[int] = None
    # Hallucination-guard block (audit task 32145cd6). Optional so older
    # callers / detection-disabled deploys still validate.
    hallucination: Optional[HallucinationAssessment] = None


# Resolve the forward reference now that UserActivityContext is defined
# below AIGenerateRequest's class body.
AIGenerateRequest.model_rebuild()


# ── Post-generation validation (audit task 652ed219) ────────────────────
#
# Coherence fix: `AIGenerateResponse` (above) is the canonical contract for
# the AI text-generation pipeline, but until now it was only enforced at the
# /ai/generate *route* boundary (`AIGenerateResponse(**result)`). Every other
# consumer of `nlp_service.generate_text` — orchestrate_analysis, the planner,
# finance advice, file summaries, task feedback — received the raw provider
# dict with no structural guarantee. A provider returning a null `content`,
# a non-string body, or a missing key would leak straight through to those
# callers (and only blow up later, far from the source).
#
# `validate_ai_generation` is the single post-generation validation/parsing
# entry point. The service layer runs every generation result through it so
# the same schema that guards the wire response also guards the in-process
# data flow. `AIAnalysisResultSchema` is exposed as the task-named alias for
# the structured-output schema callers validate analysis results against.
AIAnalysisResultSchema = AIAnalysisResult


def validate_ai_generation(raw: Any, *, default_model: Optional[str] = None) -> dict:
    """Validate & normalise a raw AI generation payload against
    :class:`AIGenerateResponse`.

    Returns a dict with the three contract keys guaranteed present and
    well-typed: ``generated_text`` (str), ``model_used`` (str | None,
    filled from ``default_model`` when the provider omitted it) and
    ``tokens_used`` (int, never None — downstream metrics do arithmetic
    on it). Extra keys an upstream provider may have tacked on are
    stripped (Pydantic ignores undeclared fields), so a malformed or
    over-broad provider response can't reach end users.

    Raises :class:`pydantic.ValidationError` when the payload is
    structurally invalid — e.g. not a mapping, ``generated_text`` missing
    or null, or a field carrying the wrong type. Callers catch this to
    flag the response for human review / fall back to a safe placeholder
    rather than propagating garbage downstream.
    """
    validated = AIGenerateResponse.model_validate(raw)
    # The hallucination guard block is attached later by the pipeline
    # (hallucination_service.annotate_result), never by the provider — exclude
    # it here so this stays the pure 3-key contract validator (task 652ed219).
    data = validated.model_dump(exclude={"hallucination"})
    if data.get("model_used") is None and default_model is not None:
        data["model_used"] = default_model
    if data.get("tokens_used") is None:
        data["tokens_used"] = 0
    return data


# ── Profiling: interests / sentiment / personality / career (task 14e65214) ──


class IdentifyInterestsResponse(BaseModel):
    """202 payload for POST /ai/identify_interests (Step 2)."""

    message: str
    identified: int = 0
    verified: int = 0


class PersonalizedRecommendation(BaseModel):
    """One personalized suggestion (Step 3 AC16) — id/content/type/score."""

    id: int
    content: str
    type: str
    score: float = 0.0
    reason: Optional[str] = None


class SentimentAnalysisRequestSchema(BaseModel):
    """Input for POST /ai/sentiment/analyze (Step 5). Any one signal suffices."""

    text: Optional[str] = Field(default=None, max_length=10_000)
    audio_url: Optional[str] = Field(default=None, max_length=1000)
    behavior_type: Optional[str] = Field(default=None, max_length=64)
    user_id: Optional[int] = None


class UserSentimentProfileSchema(BaseModel):
    """Latest mood/sentiment snapshot (Step 5)."""

    user_id: Optional[int] = None
    sentiment_score: Optional[float] = None  # -1.0 .. 1.0
    dominant_emotion: Optional[str] = None
    mood_timestamp: Optional[datetime] = None
    summary: Optional[str] = None

    class Config:
        from_attributes = True


class PersonalityAnalyzeRequest(BaseModel):
    """Optional knobs for POST /ai/personality/analyze (Step 6)."""

    text: Optional[str] = Field(default=None, max_length=10_000)
    user_id: Optional[int] = None


class PersonalityProfileResponse(BaseModel):
    """Big-Five profile returned by GET /ai/personality/profile (Step 6)."""

    user_id: Optional[int] = None
    openness: Optional[float] = None
    conscientiousness: Optional[float] = None
    extraversion: Optional[float] = None
    agreeableness: Optional[float] = None
    neuroticism: Optional[float] = None
    summary: Optional[str] = None
    traits: list[dict] = Field(default_factory=list)

    class Config:
        from_attributes = True


class HolisticAssessmentCreate(BaseModel):
    """Write payload for POST /ai/assessments/holistic_profile (Step 7)."""

    user_id: int
    assessment_type: str = "holistic_profile"
    openness: Optional[float] = None
    conscientiousness: Optional[float] = None
    extraversion: Optional[float] = None
    agreeableness: Optional[float] = None
    neuroticism: Optional[float] = None
    sentiment_score: Optional[float] = None
    dominant_emotion: Optional[str] = None
    mood_timestamp: Optional[datetime] = None


class HolisticAssessmentResponse(HolisticAssessmentCreate):
    id: int

    class Config:
        from_attributes = True


class CareerPathRequest(BaseModel):
    """Input for POST /ai/career_paths (Step 8). All optional — the engine
    leans on the stored profile when the caller passes nothing."""

    focus: Optional[str] = Field(default=None, max_length=120)
    horizon_years: Optional[int] = Field(default=5, ge=1, le=40)
    user_id: Optional[int] = None


class CareerPath(BaseModel):
    title: str
    rationale: str
    fit_score: float = 0.0  # 0.0 – 1.0, how well it matches the profile
    first_steps: list[str] = Field(default_factory=list)
    success_potential: Optional[str] = None


class CareerPathResponse(BaseModel):
    paths: list[CareerPath] = Field(default_factory=list)
    based_on: dict = Field(default_factory=dict)  # profile signals used
