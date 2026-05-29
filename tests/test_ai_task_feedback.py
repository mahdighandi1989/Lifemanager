"""Dynamic task context / feedback + stream (audit task e606cca6)."""
from __future__ import annotations

from datetime import date, timedelta

import pytest


# ── AC1: AIModelConfig context fields ────────────────────────────────

def test_ai_model_config_has_context_fields():
    from app.models.ai_model_config import AIModelConfig

    cols = set(AIModelConfig.__table__.columns.keys())
    assert {"context_type", "dynamic_response", "token_limit"} <= cols

    from app.schemas.ai_schema import AIModelConfigCreate, AIModelConfigOut

    assert "context_type" in AIModelConfigCreate.model_fields
    assert "dynamic_response" in AIModelConfigCreate.model_fields
    assert "token_limit" in AIModelConfigOut.model_fields


# ── AC2: get_task_context ────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_task_context_counts(db_session):
    from app.models.task import Task
    from app.services.ai_service import AIService

    today = date.today()
    db_session.add_all(
        [
            Task(user_id=0, title="done one", status="done"),
            Task(user_id=0, title="pending one", status="todo"),
            Task(
                user_id=0,
                title="overdue one",
                status="todo",
                due_date=today - timedelta(days=2),
            ),
        ]
    )
    await db_session.commit()

    ctx = await AIService(db_session).get_task_context(0)
    assert ctx["total"] == 3
    assert ctx["completed"] == 1
    assert ctx["pending"] == 2
    assert ctx["overdue"] == 1


# ── AC6: analyze_user_tasks ──────────────────────────────────────────

@pytest.mark.asyncio
async def test_analyze_user_tasks_groups(db_session):
    from app.models.task import Task
    from app.services.task_analysis import analyze_user_tasks

    db_session.add_all(
        [
            Task(user_id=0, title="a", status="todo", priority="high"),
            Task(user_id=0, title="b", status="done", priority="low"),
        ]
    )
    await db_session.commit()

    out = await analyze_user_tasks(db_session, user_id=0)
    assert out["total"] == 2
    assert out["groups"]["by_status"].get("todo") == 1
    assert out["groups"]["by_status"].get("done") == 1
    assert isinstance(out["patterns"], list)


# ── AC5: send_ai_feedback persists a notification ────────────────────

@pytest.mark.asyncio
async def test_send_ai_feedback_persists_notification(db_session):
    from sqlalchemy import select

    from app.models.notification import Notification
    from app.services.notification_service import send_ai_feedback

    await send_ai_feedback(db_session, user_id=0, feedback="کارت خوب بود")
    rows = (await db_session.execute(select(Notification))).scalars().all()
    assert any("کارت خوب بود" in (n.message or "") for n in rows)


# ── AC4: POST /api/ai/analyze-tasks ──────────────────────────────────

def test_analyze_tasks_endpoint(api_client):
    api_client.post("/api/tasks", json={"title": "task one"})
    r = api_client.post("/api/ai/analyze-tasks", json={"task_id": None})
    assert r.status_code == 200, r.text
    body = r.json()
    assert "feedback" in body and body["feedback"]
    assert set(body["context"]) == {"total", "completed", "pending", "overdue"}


# ── AC7: WebSocket /ws/ai-stream ─────────────────────────────────────

def test_ai_stream_websocket(api_client):
    with api_client.websocket_connect("/ws/ai-stream") as ws:
        ws.send_json({"user_id": 0})
        seen_done = False
        for _ in range(12):
            msg = ws.receive_json()
            assert msg["type"] in ("feedback", "done")
            if msg["type"] == "done":
                assert "context" in msg
                seen_done = True
                break
        assert seen_done
