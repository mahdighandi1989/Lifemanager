"""AIService.analyze_person_behavior — relationship scoring (task 3cc09436, AC3)."""
from types import SimpleNamespace

import pytest

from app.services.ai.model_service import AIService


def _interaction(kind):
    return SimpleNamespace(type=kind)


@pytest.mark.asyncio
async def test_close_relationship_for_frequent_high_value_interactions(db_session):
    svc = AIService(db_session)
    out = await svc.analyze_person_behavior(
        "Ali", [_interaction("meeting"), _interaction("meeting"), _interaction("call")]
    )
    assert out["person_name"] == "Ali"
    assert out["ai_score"] >= 60
    assert out["relationship_type"] == "close"
    assert out["interaction_count"] == 3


@pytest.mark.asyncio
async def test_distant_relationship_for_sparse_interactions(db_session):
    svc = AIService(db_session)
    out = await svc.analyze_person_behavior("Sara", [_interaction("message")])
    assert out["relationship_type"] == "distant"
    assert "ai_score" in out and "relationship_type" in out  # AC6 payload shape


@pytest.mark.asyncio
async def test_empty_history_is_safe(db_session):
    svc = AIService(db_session)
    out = await svc.analyze_person_behavior("Nobody", [])
    assert out["ai_score"] == 0
    assert out["relationship_type"] == "distant"
    assert out["interaction_count"] == 0
