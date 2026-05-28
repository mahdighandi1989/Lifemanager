"""POST /ai/dynamic-analyze gates on FEATURE_AI_ENABLED (task e606cca6)."""
from __future__ import annotations


def test_dynamic_analyze_403_when_feature_disabled(api_client, monkeypatch):
    """Default flag value is False — the endpoint must 403."""
    from app.routes import ai as ai_routes

    monkeypatch.setattr(ai_routes, "FEATURE_AI_ENABLED", False)
    resp = api_client.post(
        "/ai/dynamic-analyze",
        json={"prompt": "hello"},
    )
    assert resp.status_code == 403


def test_dynamic_analyze_200_when_feature_enabled(api_client, monkeypatch):
    from app.routes import ai as ai_routes

    monkeypatch.setattr(ai_routes, "FEATURE_AI_ENABLED", True)
    resp = api_client.post(
        "/ai/dynamic-analyze",
        json={
            "prompt": "summarise",
            "system_role_prompt": "you are a planner",
            "task_context": "user has 3 open tasks",
        },
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert "insights" in body


def test_ai_generate_accepts_system_role_and_task_context(api_client):
    """AC: AIGenerateRequest carries system_role_prompt + task_context."""
    resp = api_client.post(
        "/ai/generate",
        json={
            "prompt": "do the thing",
            "system_role_prompt": "you are a planner",
            "task_context": "user is on a tight deadline",
        },
    )
    assert resp.status_code == 200, resp.text


def test_dynamic_analyze_sends_full_prompt_not_truncated(api_client, monkeypatch):
    """AC2 (task e606cca6): the full merged request must reach the model — no
    1000-char truncation. Captures the prompt the AIService actually receives
    and asserts the long prompt + the framing system_role_prompt survive."""
    from app.routes import ai as ai_routes
    from app.services.ai_service import AIService

    monkeypatch.setattr(ai_routes, "FEATURE_AI_ENABLED", True)
    captured = {}

    async def fake_generate_text(self, prompt, **kwargs):
        captured["prompt"] = prompt
        return {"generated_text": "ok", "model_used": "test"}

    monkeypatch.setattr(AIService, "generate_text", fake_generate_text)

    long_prompt = "x" * 3000
    resp = api_client.post(
        "/ai/dynamic-analyze",
        json={"prompt": long_prompt, "system_role_prompt": "FRAMEWORK"},
    )
    assert resp.status_code == 200, resp.text
    # Pre-fix this clipped to 1000 chars; the full merged prompt must arrive.
    assert len(captured["prompt"]) >= 3000
    assert "FRAMEWORK" in captured["prompt"]


def test_ai_model_config_has_prompt_template_column():
    """AC 6: AIModelConfig.prompt_template column exists."""
    from app.models.ai_model_config import AIModelConfig

    assert hasattr(AIModelConfig, "prompt_template")
