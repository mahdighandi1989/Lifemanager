"""Interest + taste infrastructure (audit task 14e65214, Steps 1 & 2).

Covers ACs 1-12: the user_interests table, the /api/interests CRUD contract,
the UserInterest/UserTaste models, the AI data-access retrieval, the
identification service + its 202 endpoint, and the per-user interests read.
"""
from __future__ import annotations

import pytest

from app.database import Base


# ── AC1 / AC6: schema ───────────────────────────────────────────────


def test_user_interest_table_exists_with_columns():
    cols = {c.name for c in Base.metadata.tables["user_interests"].columns}
    assert {
        "id", "user_id", "interest_type", "value", "source",
        "confidence_score", "created_at", "updated_at",
    } <= cols


def test_user_interest_and_taste_models_have_step2_fields():
    from app.models.user_interest import UserInterest
    from app.models.user_taste import UserTaste

    for model in (UserInterest, UserTaste):
        cols = {c.name for c in model.__table__.columns}
        assert {"user_id", "category", "value", "confidence_score", "is_verified"} <= cols


# ── AC2-4: CRUD contract ────────────────────────────────────────────


def test_create_interest_returns_201(api_client):
    r = api_client.post("/api/interests", json={"interest_type": "hobby", "value": "reading"})
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["id"] and body["value"] == "reading"
    assert "user_id" in body and body["interest_type"] == "hobby"


def test_list_interests_returns_created(api_client):
    api_client.post("/api/interests", json={"interest_type": "topic", "value": "ai"})
    r = api_client.get("/api/interests")
    assert r.status_code == 200
    values = [i["value"] for i in r.json()]
    assert "ai" in values


def test_delete_interest_204(api_client):
    created = api_client.post("/api/interests", json={"value": "chess"}).json()
    r = api_client.delete(f"/api/interests/{created['id']}")
    assert r.status_code == 204
    # gone now
    assert "chess" not in [i["value"] for i in api_client.get("/api/interests").json()]


def test_delete_missing_interest_404(api_client):
    r = api_client.delete("/api/interests/999999")
    assert r.status_code == 404


# ── AC5: AI data-access retrieval ───────────────────────────────────


@pytest.mark.asyncio
async def test_ai_data_access_get_user_interests(db_session):
    from app.models.user_interest import UserInterest
    from app.services.ai.ai_data_access_service import get_user_interests

    db_session.add(UserInterest(user_id=7, value="photography", category="art"))
    await db_session.commit()
    rows = await get_user_interests(db_session, user_id=7)
    assert [r.value for r in rows] == ["photography"]


# ── AC8/AC9: identification service + endpoint ──────────────────────


@pytest.mark.asyncio
async def test_identify_and_verify_interests_marks_recurring(db_session):
    from app.models.task import Task
    from app.services.ai.interest_identification_service import (
        InterestIdentificationService,
    )

    # "guitar" recurs 3× → should be verified; "umbrella" once → not.
    for title in ("practice guitar", "buy guitar strings", "guitar lesson", "find umbrella"):
        db_session.add(Task(user_id=0, title=title))
    await db_session.commit()

    result = await InterestIdentificationService(db_session).identify_and_verify_interests(0)
    assert result["identified"] >= 1
    assert result["verified"] >= 1

    from sqlalchemy import select
    from app.models.user_interest import UserInterest

    rows = (await db_session.execute(select(UserInterest).where(UserInterest.user_id == 0))).scalars().all()
    by_value = {r.value: r for r in rows}
    assert "guitar" in by_value and by_value["guitar"].is_verified is True


def test_identify_interests_endpoint_202(api_client):
    api_client.post("/api/interests", json={"value": "running"})
    r = api_client.post("/api/ai/identify_interests")
    assert r.status_code == 202, r.text
    assert "message" in r.json()


# ── AC10: per-user interests read ───────────────────────────────────


def test_get_user_interests_endpoint_returns_both(api_client):
    api_client.post("/api/interests", json={"value": "hiking", "category": "sport"})
    r = api_client.get("/api/users/0/interests")
    assert r.status_code == 200, r.text
    body = r.json()
    assert "interests" in body and "tastes" in body
    assert "hiking" in [i["value"] for i in body["interests"]]
