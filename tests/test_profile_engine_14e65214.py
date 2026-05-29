"""Profile / sentiment / personality / career engine (audit task 14e65214).

Covers Steps 3-8 (ACs 13-46): the User/UserContext/Recommendation profile
fields, personalized recommendations, sentiment + personality services and
endpoints, the holistic assessment store, and the FEATURE_AI_ENABLED-gated
career-path engine.
"""
from __future__ import annotations

import pytest

from app.database import Base


# ── AC13/19/20/36: schema fields ────────────────────────────────────


def test_user_has_profile_fields():
    cols = {c.name for c in Base.metadata.tables["users"].columns}
    assert {"interests", "personality_traits", "mood_patterns"} <= cols


def test_usercontext_has_profiling_fields():
    cols = {c.name for c in Base.metadata.tables["user_contexts"].columns}
    assert {"personality_traits", "mood_history", "career_interests", "general_interests"} <= cols


def test_recommendation_has_type_and_source_context():
    cols = {c.name for c in Base.metadata.tables["contextual_recommendations"].columns}
    assert {"type", "source_context"} <= cols


def test_ai_assessment_has_bigfive_and_mood_fields():
    cols = {c.name for c in Base.metadata.tables["ai_assessments"].columns}
    assert {
        "openness", "conscientiousness", "extraversion", "agreeableness",
        "neuroticism", "sentiment_score", "dominant_emotion", "mood_timestamp",
    } <= cols


# ── AC30: personality models ────────────────────────────────────────


def test_personality_models_exist():
    from app.models.personality import PersonalityAssessment, PersonalityTrait

    assert "personality_traits" in Base.metadata.tables
    assert "personality_assessments" in Base.metadata.tables
    assert PersonalityTrait and PersonalityAssessment


# ── AC25: sentiment service surface ─────────────────────────────────


def test_sentiment_service_has_required_methods():
    from app.services.ai.sentiment_personality_service import (
        SentimentPersonalityService,
    )

    assert hasattr(SentimentPersonalityService, "analyze_and_save_sentiment")
    assert hasattr(SentimentPersonalityService, "get_latest_sentiment_profile")


# ── AC16/17 data shape: personalized recommendations ────────────────


def test_personalized_recommendations_200_with_fields(api_client):
    api_client.post("/api/interests", json={"value": "writing", "category": "reading"})
    r = api_client.get("/api/ai/personalized_recommendations")
    assert r.status_code == 200, r.text
    items = r.json()
    assert items, "expected at least one recommendation"
    for it in items:
        assert {"id", "content", "type", "score"} <= set(it.keys())


# ── AC23: /api/context/recommendations type filter ──────────────────


def test_context_recommendations_type_filter(api_client):
    api_client.post("/api/interests", json={"value": "music", "category": "art"})
    r = api_client.get("/api/context/recommendations", params={"type": "art"})
    assert r.status_code == 200, r.text
    items = r.json()
    assert items and all(i["type"] == "art" for i in items)
    assert all("type" in i for i in items)


# ── AC26/27: sentiment analyze + profile ────────────────────────────


def test_sentiment_analyze_then_profile(api_client):
    r = api_client.post(
        "/api/ai/sentiment/analyze",
        json={"text": "I feel great and happy and successful today"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["sentiment_score"] is not None and body["dominant_emotion"]
    assert body["sentiment_score"] > 0  # positive lexicon

    got = api_client.get("/api/ai/sentiment/profile")
    assert got.status_code == 200
    assert got.json()["dominant_emotion"] == body["dominant_emotion"]


# ── AC31/32: personality analyze + profile ──────────────────────────


def test_personality_analyze_202_and_profile(api_client):
    r = api_client.post("/api/ai/personality/analyze", json={})
    assert r.status_code == 202, r.text
    body = r.json()
    for dim in ("openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"):
        assert dim in body and body[dim] is not None

    got = api_client.get("/api/ai/personality/profile")
    assert got.status_code == 200
    assert got.json()["openness"] is not None


# ── AC37/38/39: holistic assessment ─────────────────────────────────


def test_holistic_profile_create_201_and_get_200(api_client):
    payload = {
        "user_id": 0,
        "openness": 0.8,
        "conscientiousness": 0.6,
        "sentiment_score": 0.3,
        "dominant_emotion": "joy",
    }
    r = api_client.post("/api/ai/assessments/holistic_profile", json=payload)
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["id"] and body["openness"] == 0.8

    got = api_client.get("/api/ai/assessments/holistic_profile/0")
    assert got.status_code == 200
    assert got.json()["dominant_emotion"] == "joy"


def test_holistic_profile_get_404_when_absent(api_client):
    r = api_client.get("/api/ai/assessments/holistic_profile/424242")
    assert r.status_code == 404


# ── AC42/45/46: career paths (gated + graceful) ─────────────────────


def test_career_paths_403_when_feature_disabled(api_client, monkeypatch):
    from app.routes import ai_profile as ai_profile_routes

    monkeypatch.setattr(ai_profile_routes, "FEATURE_AI_ENABLED", False)
    r = api_client.post("/api/ai/career_paths", json={})
    assert r.status_code == 403


def test_career_paths_200_personalized_and_keyless(api_client, monkeypatch):
    """AC42/43/46: enabled → 200; paths reference the user's real interest and
    work even with no OPENAI_API_KEY set (deterministic engine)."""
    from app.routes import ai_profile as ai_profile_routes

    monkeypatch.setattr(ai_profile_routes, "FEATURE_AI_ENABLED", True)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    api_client.post("/api/interests", json={"value": "python", "category": "technology", "is_verified": True, "confidence_score": 0.9})
    r = api_client.post("/api/ai/career_paths", json={})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["paths"], "expected at least one career path"
    # non-clichéd: the user's actual interest value shows up in a path.
    blob = " ".join(p["title"] + p["rationale"] for p in body["paths"])
    assert "python" in blob
    assert body["based_on"]["dominant_trait"]


# ── AC11/15/40: RecommendationService consumes the profile ──────────


@pytest.mark.asyncio
async def test_recommendation_service_uses_interests(db_session):
    from app.models.user_interest import UserInterest
    from app.services.ai.recommendation_service import RecommendationService

    db_session.add(
        UserInterest(user_id=3, value="astronomy", category="reading", confidence_score=0.9, is_verified=True)
    )
    await db_session.commit()
    recs = await RecommendationService(db_session).generate_personalized_recommendations(3)
    assert any("astronomy" in r["content"] for r in recs)


@pytest.mark.asyncio
async def test_generate_recommendations_uses_holistic_profile(db_session):
    from app.models.user_interest import UserInterest
    from app.schemas.ai_schema import HolisticAssessmentCreate
    from app.services.ai.holistic_profile_service import HolisticProfileService
    from app.services.ai.recommendation_service import RecommendationService

    db_session.add(UserInterest(user_id=5, value="design", category="art", confidence_score=0.8, is_verified=True))
    await db_session.commit()
    await HolisticProfileService(db_session).create_or_update_assessment(
        HolisticAssessmentCreate(user_id=5, openness=0.9, conscientiousness=0.7)
    )
    recs = await RecommendationService(db_session).generate_recommendations(
        type("U", (), {"id": 5})(), {}
    )
    assert recs and all("recommendation" in r for r in recs)
    assert any(r["type"] == "career_path" for r in recs)
