"""Dynamic, model-framed task feedback (audit task e606cca6 Steps 7-8).

The memo wanted the configured model to react to tasks dynamically within the
editable prompt box — not a fixed template. These pin: when a provider answers,
its output is used; offline, the deterministic fallback is used (never breaks).
"""
from __future__ import annotations

import pytest


@pytest.mark.asyncio
async def test_feedback_uses_model_when_available(db_session, monkeypatch):
    import app.services.ai.task_feedback as tf

    # Stub the provider so a "real" model answer comes back.
    async def fake_generate(self, prompt, **kwargs):
        assert "وضعیت تسک‌ها" in prompt  # full context reached the model
        return {"generated_text": "بازخورد هوشمند مدل", "model_used": "x", "tokens_used": 5}

    from app.services.ai_service import AIService

    monkeypatch.setattr(AIService, "generate_text", fake_generate)
    out = await tf.generate_task_feedback(
        db_session, user_id=0,
        context={"total": 3, "completed": 1, "pending": 2, "overdue": 1},
        analysis={"patterns": ["یک الگو"]}, fallback="FALLBACK", task_id=7,
    )
    assert out["model_generated"] is True
    assert out["feedback"] == "بازخورد هوشمند مدل"


@pytest.mark.asyncio
async def test_feedback_falls_back_offline(db_session, monkeypatch):
    import app.services.ai.task_feedback as tf
    from app.services.ai_service import AIService

    # Simulate the no-key placeholder ([ai-...] prefix) → not a real model answer.
    async def placeholder(self, prompt, **kwargs):
        return {"generated_text": "[ai-placeholder] ...", "model_used": "x", "tokens_used": 0}

    monkeypatch.setattr(AIService, "generate_text", placeholder)
    out = await tf.generate_task_feedback(
        db_session, user_id=0,
        context={"total": 0, "completed": 0, "pending": 0, "overdue": 0},
        analysis={"patterns": []}, fallback="FALLBACK",
    )
    assert out["model_generated"] is False
    assert out["feedback"] == "FALLBACK"


def test_analyze_tasks_endpoint_returns_model_flag(api_client):
    r = api_client.post("/api/ai/analyze-tasks", json={})
    assert r.status_code == 200, r.text
    body = r.json()
    assert "feedback" in body and "model_generated" in body
    # offline (no key) → deterministic, model_generated False
    assert body["model_generated"] is False
