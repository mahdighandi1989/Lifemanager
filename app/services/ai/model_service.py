"""AI model config CRUD service.

Split out of the legacy app/services/ai_service.py so each concern
(model config CRUD vs. text generation vs. provider wiring) lives in
its own < 250 line module. The legacy module re-exports `AIService`
for callers that still import from app.services.ai_service.
"""
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

# Defaults shared with nlp_service. Kept here so callers that need just
# the model name don't have to import the NLP module too.
DEFAULT_PROVIDER = "openai"
DEFAULT_MODEL = "gpt-3.5-turbo"


class AIService:
    """CRUD façade over the ai_model_configs table.

    Dependency injection: both the db session and the upstream provider
    API key are passed in by the route layer. Tests can swap a fake
    session or a stub api_key without monkeypatching module globals.
    The api_key defaults to ``os.environ["OPENAI_API_KEY"]`` so callers
    that don't care can keep the previous one-arg constructor signature.
    """

    def __init__(
        self,
        db: AsyncSession,
        api_key: Optional[str] = None,
    ):
        self.db = db
        # Read once at construction so a test can inject a deterministic
        # value without touching os.environ. The env lookup happens lazily
        # only when no explicit key is passed.
        self.api_key: Optional[str] = (
            api_key if api_key is not None else os.environ.get("OPENAI_API_KEY")
        )

    async def generate_text(
        self,
        prompt: str,
        *,
        max_tokens: int = 512,
        temperature: float = 0.7,
    ) -> dict:
        """Per audit task 97867b277c1b AC 6, the /ai/generate route now
        calls this instance method instead of the module-level
        ``generate_text`` helper. Delegates to the same nlp_service
        implementation so the metrics + placeholder branches stay
        consistent — the route just no longer needs the bare-function
        import."""
        from app.services.ai.nlp_service import generate_text as _generate_text

        return await _generate_text(
            prompt, max_tokens=max_tokens, temperature=temperature
        )

    async def orchestrate_analysis(
        self,
        *,
        prompt: str,
        user_id: int = 0,
        model: Optional[str] = None,
    ) -> dict:
        """Compose the editable global analysis prompt + the caller's data
        context + this request prompt, then run the model (audit task
        1a08ded2 AC 35). This is the user's core ask — "analyze the data on my
        pages according to my editable prompt." Returns the AIAnalysisResult
        shape: insights / model_used / context_items_count.
        """
        import json

        from app.models.ai_provider import GlobalAnalysisPrompt
        from app.services.ai.ai_data_access_service import get_user_data_context

        # 1. The editable global analysis prompt (empty on first run).
        global_prompt = ""
        try:
            res = await self.db.execute(select(GlobalAnalysisPrompt))
            gp = res.scalars().first()
            if gp is not None:
                global_prompt = gp.prompt_text or ""
        except Exception:  # table not migrated yet / no row — analyse anyway
            pass

        # 2. The caller's user-scoped data context (pages/data).
        context = await get_user_data_context(self.db, user_id=user_id)
        context_items_count = sum(
            len(v) for v in context.values() if isinstance(v, list)
        )

        # 3. Merge into one prompt the model sees in full (no truncation).
        merged = "\n\n".join(
            part
            for part in (
                global_prompt,
                "DATA CONTEXT:\n" + json.dumps(context, ensure_ascii=False),
                "REQUEST:\n" + prompt,
            )
            if part
        )

        out = await self.generate_text(prompt=merged)
        return {
            "insights": out.get("generated_text", ""),
            "model_used": model or out.get("model_used"),
            "context_items_count": context_items_count,
        }

    async def get_task_context(self, user_id: int) -> dict:
        """Full task context for the AI (audit task e606cca6 AC2): counts of
        ``total / completed / pending / overdue`` tasks for the user. The
        caller sends this whole context to the model — no token cap."""
        from datetime import date

        from app.models.task import Task

        rows = (
            await self.db.execute(
                select(Task).where(
                    Task.user_id == user_id, Task.merged_into_id.is_(None)
                )
            )
        ).scalars().all()

        def _status(t) -> str:
            return str(getattr(t.status, "value", t.status) or "")

        today = date.today()
        total = len(rows)
        completed = sum(1 for t in rows if _status(t) == "done")
        pending = sum(1 for t in rows if _status(t) not in ("done", "cancelled"))
        overdue = sum(
            1
            for t in rows
            if t.due_date
            and t.due_date < today
            and _status(t) not in ("done", "cancelled")
        )
        return {
            "total": total,
            "completed": completed,
            "pending": pending,
            "overdue": overdue,
        }

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

    async def analyze_person_behavior(self, person_name: str, interactions: list) -> dict:
        """Score a relationship from a person's interaction history (audit
        task 3cc09436, AC3). Deterministic + rule-based so it runs without an
        upstream model and stays testable: each interaction is weighted by
        type (a meeting counts more than a message), the weighted sum maps to
        an ai_score (0-100), and the score buckets into a relationship_type.
        This is the payload the POST /people-profiles/{id}/analyze route
        (ai_score + relationship_type) surfaces."""
        items = list(interactions or [])
        type_weights = {"meeting": 3, "call": 2, "email": 1, "message": 1, "other": 1}
        weighted = 0
        for it in items:
            raw = getattr(it, "type", None)
            kind = getattr(raw, "value", None) or (str(raw).lower() if raw is not None else "other")
            weighted += type_weights.get(kind, 1)
        ai_score = min(100, weighted * 10)
        if ai_score >= 60:
            relationship_type = "close"
        elif ai_score >= 20:
            relationship_type = "regular"
        else:
            relationship_type = "distant"
        return {
            "person_name": person_name,
            "ai_score": ai_score,
            "relationship_type": relationship_type,
            "interaction_count": len(items),
            "summary": f"{len(items)} interaction(s); weighted engagement {weighted}.",
        }


async def get_active_config(db: AsyncSession) -> Optional[AIModelConfig]:
    """Return the single is_active=True config row, if any."""
    result = await db.execute(
        select(AIModelConfig).where(AIModelConfig.is_active.is_(True)).limit(1)
    )
    return result.scalar_one_or_none()


async def get_user_activity_context(db, *, user_id: int):
    """Audit task e606cca6 AC 24 — assemble the caller's UserActivityContext
    from app/models/task.py, app/models/project.py and app/models/todo_item.py.
    Returns a fully populated schema instance (open tasks, recently
    completed tasks, active projects)."""
    from app.schemas.ai_schema import UserActivityContext
    from app.services.ai.ai_data_access_service import (
        get_user_data_context,
    )

    raw = await get_user_data_context(db, user_id=user_id)
    open_tasks = [t for t in raw["tasks"] if t.get("status") != "completed"]
    recent_completed = [t for t in raw["tasks"] if t.get("status") == "completed"][:5]
    return UserActivityContext(
        open_tasks=open_tasks,
        recently_completed_tasks=recent_completed,
        active_projects=raw["projects"],
    )
