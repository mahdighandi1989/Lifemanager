"""Profile-management model surface (audit task 3cc09436 ACs 1-6)."""
from __future__ import annotations


def test_all_profile_models_importable():
    """AC 1-5 — each model is reachable from its own module."""
    from app.models.person import Person  # noqa: F401
    from app.models.interaction import Interaction, InteractionType  # noqa: F401
    from app.models.ai_assessment import AIAssessment  # noqa: F401
    from app.models.user_comment import UserComment  # noqa: F401
    from app.models.behavior_log import BehaviorLog, BehaviorType  # noqa: F401


def test_all_profile_models_in_aggregate_init():
    """AC 6 — every new class appears in app.models.__all__."""
    import app.models as agg

    for name in (
        "Person",
        "Interaction",
        "InteractionType",
        "AIAssessment",
        "UserComment",
        "BehaviorLog",
        "BehaviorType",
    ):
        assert hasattr(agg, name), f"{name} missing from app.models"
        assert name in agg.__all__


def test_interaction_columns_match_ac():
    """AC 2 — interactions table carries the documented columns."""
    from app.models.interaction import Interaction

    cols = {c.name for c in Interaction.__table__.columns}
    for required in (
        "id",
        "person_id",
        "type",
        "date",
        "summary",
        "notes",
        "created_at",
        "updated_at",
    ):
        assert required in cols


def test_ai_assessment_columns_match_ac():
    """AC 3 — ai_assessments table carries the documented columns."""
    from app.models.ai_assessment import AIAssessment

    cols = {c.name for c in AIAssessment.__table__.columns}
    for required in (
        "id",
        "person_id",
        "interaction_id",
        "score",
        "sentiment",
        "analysis_text",
        "created_at",
    ):
        assert required in cols


def test_behavior_log_uses_enum():
    """AC 5 — behavior_type is an Enum column."""
    from app.models.behavior_log import BehaviorLog, BehaviorType
    import sqlalchemy as sa

    col = next(
        c for c in BehaviorLog.__table__.columns if c.name == "behavior_type"
    )
    assert isinstance(col.type, sa.Enum)
    # Enum members must match the documented values.
    assert {m.value for m in BehaviorType} == {"positive", "negative", "neutral"}


def test_user_comment_links_user_person_interaction():
    """AC 4 — user_comment links to all three parents."""
    from app.models.user_comment import UserComment

    fks = {fk.column.table.name for fk in UserComment.__table__.foreign_keys}
    assert "users" in fks
    assert "persons" in fks
    assert "interactions" in fks
