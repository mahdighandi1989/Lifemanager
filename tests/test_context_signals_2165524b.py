"""Wearable / voice / accept-reject context signals (audit task 2165524b).

Closes the raw-memo gaps the canonical ACs flattened: a wearable heart-rate
feed (Steps 6-7), voice→mood (Step 10), and persisted accept/reject (AC5, was
client-only).
"""
from __future__ import annotations

import pytest


def test_physiological_ingest_updates_context_and_recommends(api_client):
    r = api_client.post("/api/context/physiological", json={"heart_rate": 120})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["physical_state"] == "elevated"
    # an elevated heart-rate yields a physiological recommendation
    assert any(rec.get("recommendation_type") == "physiological" for rec in body["recommendations"])


def test_voice_ingest_infers_mood(api_client):
    r = api_client.post(
        "/api/context/voice", json={"transcript": "من خیلی خسته و ناامید و نگران هستم"}
    )
    assert r.status_code == 200, r.text
    assert r.json()["mood"]  # a mood label was inferred
    assert r.json()["sentiment_score"] <= 0  # negative lexicon


def test_classify_physical_state():
    from app.services.context_engine.wearable_service import classify_physical_state

    assert classify_physical_state(120) == "elevated"
    assert classify_physical_state(50) == "resting"
    assert classify_physical_state(70) == "stable"
    assert classify_physical_state(None) == "unknown"


@pytest.mark.asyncio
async def test_mark_recommendation_read(db_session):
    from app.models.recommendation import ContextualRecommendation
    from app.routes.context import mark_recommendation_read

    rec = ContextualRecommendation(user_id=0, recommendation_type="behavioral", text="x")
    db_session.add(rec)
    await db_session.commit()
    await db_session.refresh(rec)

    out = await mark_recommendation_read(rec_id=rec.id, db=db_session, user_id=0)
    assert out["is_read"] is True
    await db_session.refresh(rec)
    assert rec.is_read is True


@pytest.mark.asyncio
async def test_mark_missing_recommendation_404(db_session):
    from fastapi import HTTPException

    from app.routes.context import mark_recommendation_read

    with pytest.raises(HTTPException) as exc:
        await mark_recommendation_read(rec_id=999999, db=db_session, user_id=0)
    assert exc.value.status_code == 404
