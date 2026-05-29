"""Context engine + contextual recommendations (audit task 2165524b).

Covers the backend the smart-assistant needs: UserContext +
ContextualRecommendation models (AC 1-2), POST /api/context/location (AC 3),
GET /api/recommendations (AC 4), recommendation_engine fusion (AC 7), and the
google_maps_service key-gated stub (AC 8).
"""
from __future__ import annotations

import pytest


# ── Models (AC 1, 2) ─────────────────────────────────────────────────

def test_user_context_model_fields():
    from app.models.context import UserContext

    cols = set(UserContext.__table__.columns.keys())
    assert {
        "user_id", "current_location", "last_activity_time",
        "heart_rate", "activity_status", "mood",
    } <= cols


def test_contextual_recommendation_model_fields():
    from app.models.recommendation import ContextualRecommendation

    cols = set(ContextualRecommendation.__table__.columns.keys())
    assert {
        "user_id", "task_id", "recommendation_type",
        "context_snapshot", "generated_at", "is_read",
    } <= cols


# ── Endpoints (AC 3, 4) ──────────────────────────────────────────────

def test_post_context_location_saves(api_client):
    resp = api_client.post("/api/context/location", json={"lat": 35.7, "lng": 51.4})
    assert resp.status_code == 200, resp.text
    assert resp.json()["current_location"] == {"lat": 35.7, "lng": 51.4}


def test_get_recommendations_returns_list(api_client):
    resp = api_client.get("/api/recommendations")
    assert resp.status_code == 200, resp.text
    assert isinstance(resp.json(), list)


def test_api_notifications_list_anon(api_client):
    # NotificationBell endpoint (AC 9): anon-friendly list under login-bypass.
    resp = api_client.get("/api/notifications")
    assert resp.status_code == 200, resp.text
    assert isinstance(resp.json(), list)


def test_post_location_then_recommendations_roundtrip(api_client):
    assert api_client.post(
        "/api/context/location", json={"lat": 1.0, "lng": 2.0}
    ).status_code == 200
    resp = api_client.get("/api/recommendations")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)  # no Maps key -> no location recs, still 200


# ── recommendation_engine fusion (AC 7) ──────────────────────────────

@pytest.mark.asyncio
async def test_generate_recommendations_behavioral_idle(db_session):
    from app.services.recommendation_engine import generate_contextual_recommendations

    recs = await generate_contextual_recommendations(
        db_session, user_id=0, context={"activity_status": "idle"}
    )
    assert any(r["recommendation_type"] == "behavioral" for r in recs)


@pytest.mark.asyncio
async def test_generate_recommendations_physiological_high_hr(db_session):
    from app.services.recommendation_engine import generate_contextual_recommendations

    recs = await generate_contextual_recommendations(
        db_session, user_id=0, context={"heart_rate": 120}
    )
    assert any(r["recommendation_type"] == "physiological" for r in recs)


@pytest.mark.asyncio
async def test_generate_recommendations_persists_rows(db_session):
    from sqlalchemy import select

    from app.models.recommendation import ContextualRecommendation
    from app.services.recommendation_engine import generate_contextual_recommendations

    await generate_contextual_recommendations(
        db_session, user_id=0, context={"activity_status": "idle", "heart_rate": 60}
    )
    rows = (
        await db_session.execute(
            select(ContextualRecommendation).where(
                ContextualRecommendation.user_id == 0
            )
        )
    ).scalars().all()
    assert len(rows) >= 2  # behavioral + physiological


@pytest.mark.asyncio
async def test_generate_recommendations_empty_context(db_session):
    from app.services.recommendation_engine import generate_contextual_recommendations

    recs = await generate_contextual_recommendations(db_session, user_id=0, context={})
    assert recs == []


# ── google_maps_service key gating (AC 8) ────────────────────────────

@pytest.mark.asyncio
async def test_google_maps_no_key_degrades(monkeypatch):
    from app.services import google_maps_service

    monkeypatch.setattr(google_maps_service, "_maps_key", lambda: "")
    assert await google_maps_service.geocode_address("Tehran") is None
    assert await google_maps_service.find_nearby_places(35.7, 51.4) == []


def test_google_maps_service_exposes_documented_functions():
    from app.services import google_maps_service

    assert callable(google_maps_service.geocode_address)
    assert callable(google_maps_service.find_nearby_places)
