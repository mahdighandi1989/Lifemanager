"""Auto-ingestion pipeline for AI analysis (audit task 1a08ded2, AC 64-68).

The user's voice memo asked for newly added data to reach the models for
analysis "quickly". This exercises the pipeline end to end at the unit level:

    write (TodoItem) -> publish_data_change_event -> process_ai_ingestion_event
        -> ai_ingestion_service.ingest_entity -> nlp_service.analyze_content
"""
from __future__ import annotations

import pytest

from app.services import ai_ingestion_service, event_publisher
from app.services.ai import nlp_service


# ── analyze_content (AC 68) ─────────────────────────────────────────

def test_analyze_content_returns_summary_and_keywords():
    out = nlp_service.analyze_content(
        "Buy milk. Then write the quarterly report about the budget."
    )
    assert set(out.keys()) == {"summary", "keywords"}
    assert out["summary"].startswith("Buy milk")
    assert isinstance(out["keywords"], list)


def test_analyze_content_empty_text():
    assert nlp_service.analyze_content("") == {"summary": "", "keywords": []}
    assert nlp_service.analyze_content(None) == {"summary": "", "keywords": []}


def test_analyze_content_orders_keywords_by_frequency():
    out = nlp_service.analyze_content("budget budget budget report report plan")
    assert out["keywords"][0] == "budget"
    assert "report" in out["keywords"]


def test_analyze_content_handles_persian():
    out = nlp_service.analyze_content("بودجه بودجه گزارش برنامه‌ریزی مالی")
    assert out["summary"]
    assert "بودجه" in out["keywords"]


# ── ai_ingestion_service.ingest_entity (AC 67) ──────────────────────

@pytest.mark.asyncio
async def test_ingest_entity_todo_item(db_session):
    from app.models.todo_item import TodoItem

    item = TodoItem(
        content="Plan the quarterly budget review meeting",
        description="compare the budget numbers against last quarter",
    )
    db_session.add(item)
    await db_session.commit()
    await db_session.refresh(item)

    out = await ai_ingestion_service.ingest_entity(
        db_session, entity_type="todo_item", entity_id=item.id, action="created"
    )
    assert out["ingested"] is True
    assert out["entity_id"] == item.id
    assert out["action"] == "created"
    assert "summary" in out["analysis"] and "keywords" in out["analysis"]
    assert out["analysis"]["keywords"]  # non-empty for real content


@pytest.mark.asyncio
async def test_ingest_entity_missing_row(db_session):
    out = await ai_ingestion_service.ingest_entity(
        db_session, entity_type="todo_item", entity_id=999_999
    )
    assert out["ingested"] is False
    assert out["reason"] == "not_found_or_unsupported"


@pytest.mark.asyncio
async def test_ingest_entity_unsupported_type(db_session):
    out = await ai_ingestion_service.ingest_entity(
        db_session, entity_type="banana", entity_id=1
    )
    assert out["ingested"] is False


# ── event_publisher.publish_data_change_event (AC 64) ───────────────

def test_publish_data_change_event_enqueues(monkeypatch):
    captured: dict = {}

    class _FakeTask:
        def apply_async(self, *, kwargs, retry=None):
            captured.update(kwargs)
            captured["_retry"] = retry

    monkeypatch.setattr("app.tasks.process_ai_ingestion_event", _FakeTask())
    ok = event_publisher.publish_data_change_event("todo_item", 7, "created")
    assert ok is True
    assert captured == {
        "entity_type": "todo_item",
        "entity_id": 7,
        "action": "created",
        "_retry": False,
    }


def test_publish_data_change_event_swallows_broker_failure(monkeypatch):
    class _BoomTask:
        def apply_async(self, *, kwargs, retry=None):
            raise RuntimeError("broker unreachable")

    monkeypatch.setattr("app.tasks.process_ai_ingestion_event", _BoomTask())
    # Must never raise into the caller's write path; returns False instead.
    assert event_publisher.publish_data_change_event("todo_item", 1, "created") is False


# ── Celery task registration (AC 65) ────────────────────────────────

def test_process_ai_ingestion_event_task_registered():
    from app.celery_app import celery_app

    assert "app.tasks.process_ai_ingestion_event" in celery_app.tasks


# ── Route wiring: TodoItem create publishes the event (AC 66) ───────

def test_create_todo_item_publishes_ingestion_event(api_client, monkeypatch):
    calls: list = []
    import app.services.event_publisher as ep

    monkeypatch.setattr(
        ep, "publish_data_change_event", lambda *a, **k: calls.append((a, k)) or True
    )

    resp = api_client.post(
        "/api/todo-items", json={"content": "Draft the budget report"}
    )
    assert resp.status_code == 201, resp.text
    item_id = resp.json()["id"]
    assert calls == [(("todo_item", item_id, "created"), {})]
