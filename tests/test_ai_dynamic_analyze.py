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


def test_ai_model_config_has_prompt_template_column():
    """AC 6: AIModelConfig.prompt_template column exists."""
    from app.models.ai_model_config import AIModelConfig

    assert hasattr(AIModelConfig, "prompt_template")
