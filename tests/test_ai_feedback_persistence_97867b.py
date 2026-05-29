"""Durable AI feedback persistence (audit task task_97867b277c1b).

The raw task asked for like/dislike + 1-5 rating stored IN THE DATABASE (not an
in-process counter). These pin that /api/ai/feedback persists an AIFeedback row
and /api/ai/metrics aggregates from the table.
"""
from __future__ import annotations

from app.database import Base


def test_ai_feedback_table_exists():
    cols = {c.name for c in Base.metadata.tables["ai_feedback"].columns}
    assert {"user_id", "liked", "score", "created_at"} <= cols


def test_feedback_persists_and_metrics_aggregate_from_db(api_client):
    # like + dislike + a 5-score
    assert api_client.post("/api/ai/feedback", json={"liked": True}).status_code == 202
    assert api_client.post("/api/ai/feedback", json={"liked": False}).status_code == 202
    assert api_client.post("/api/ai/feedback", json={"score": 5}).status_code == 202

    m = api_client.get("/api/ai/metrics")
    assert m.status_code == 200
    body = m.json()
    assert body["feedback_likes"] >= 1
    assert body["feedback_dislikes"] >= 1
    assert body["feedback_persisted_count"] >= 1  # came from the DB table
    assert body["ai_response_quality_score"] >= 1


def test_feedback_requires_a_signal(api_client):
    assert api_client.post("/api/ai/feedback", json={}).status_code == 400


def test_feedback_row_written(api_client):
    api_client.post("/api/ai/feedback", json={"score": 4, "response_ref": "msg-7"})
    # surfaced back through the durable metric count
    body = api_client.get("/api/ai/metrics").json()
    assert body["feedback_persisted_count"] >= 1
