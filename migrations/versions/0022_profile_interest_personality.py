"""Interest / taste / personality profiling + holistic assessment fields.

Audit task 14e65214 (Steps 1-8). Adds the profiling tables and widens the
existing profile/recommendation/assessment tables:

  * NEW tables: user_interests, user_tastes, personality_assessments,
    personality_traits
  * users                      += interests, personality_traits, mood_patterns
  * user_contexts              += personality_traits, mood_history,
                                  career_interests, general_interests
  * contextual_recommendations += type, source_context
  * ai_assessments             += user_id, assessment_type, the Big-Five
                                  dimensions, sentiment_score, dominant_emotion,
                                  mood_timestamp (and person_id relaxed to NULL)

Every step is inspector-guarded so a DB already grown by startup create_all
upgrades cleanly and idempotently (matches the 0019/0021 pattern). SQLite-safe.

Revision ID: 0022_profile_interest_personality
Revises: 0021_ai_config_context_fields
Create Date: 2026-05-29
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0022_profile_interest_personality"
down_revision: Union[str, None] = "0021_ai_config_context_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_table(bind, name: str) -> bool:
    return name in sa.inspect(bind).get_table_names()


def _has_column(bind, table: str, col: str) -> bool:
    if not _has_table(bind, table):
        return False
    return col in {c["name"] for c in sa.inspect(bind).get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()

    if not _has_table(bind, "user_interests"):
        op.create_table(
            "user_interests",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
            sa.Column("interest_type", sa.String(64), nullable=True, index=True),
            sa.Column("value", sa.String(), nullable=False),
            sa.Column("source", sa.String(64), nullable=True),
            sa.Column("confidence_score", sa.Float(), nullable=True),
            sa.Column("category", sa.String(64), nullable=True, index=True),
            sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )

    if not _has_table(bind, "user_tastes"):
        op.create_table(
            "user_tastes",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
            sa.Column("category", sa.String(64), nullable=True, index=True),
            sa.Column("value", sa.String(), nullable=False),
            sa.Column("source", sa.String(64), nullable=True),
            sa.Column("confidence_score", sa.Float(), nullable=True),
            sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )

    if not _has_table(bind, "personality_assessments"):
        op.create_table(
            "personality_assessments",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
            sa.Column("summary", sa.Text(), nullable=True),
            sa.Column("traits", sa.JSON(), nullable=True),
            sa.Column("model_used", sa.String(120), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    if not _has_table(bind, "personality_traits"):
        op.create_table(
            "personality_traits",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, index=True),
            sa.Column(
                "assessment_id",
                sa.Integer(),
                sa.ForeignKey("personality_assessments.id", ondelete="CASCADE"),
                nullable=True,
                index=True,
            ),
            sa.Column("name", sa.String(64), nullable=False),
            sa.Column("score", sa.Float(), nullable=True),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # users — analyzed-profile cache columns. The op.add_column calls below are
    # the dialect-agnostic equivalent of this raw DDL (audit task 14e65214 AC14):
    #   ALTER TABLE users ADD COLUMN interests JSON;
    #   ALTER TABLE users ADD COLUMN personality_traits JSON;
    #   ALTER TABLE users ADD COLUMN mood_patterns JSON;
    for col, type_ in (
        ("interests", sa.JSON()),
        ("personality_traits", sa.JSON()),
        ("mood_patterns", sa.JSON()),
    ):
        if not _has_column(bind, "users", col):
            op.add_column("users", sa.Column(col, type_, nullable=True))

    # user_contexts — psychological + interest profiling columns.
    for col in ("personality_traits", "mood_history", "career_interests", "general_interests"):
        if not _has_column(bind, "user_contexts", col):
            op.add_column("user_contexts", sa.Column(col, sa.JSON(), nullable=True))

    # contextual_recommendations — broad type + source context.
    if not _has_column(bind, "contextual_recommendations", "type"):
        op.add_column("contextual_recommendations", sa.Column("type", sa.String(64), nullable=True))
    if not _has_column(bind, "contextual_recommendations", "source_context"):
        op.add_column("contextual_recommendations", sa.Column("source_context", sa.JSON(), nullable=True))

    # ai_assessments — user-scoped holistic profile fields.
    if not _has_column(bind, "ai_assessments", "user_id"):
        op.add_column("ai_assessments", sa.Column("user_id", sa.Integer(), nullable=True))
    if not _has_column(bind, "ai_assessments", "assessment_type"):
        op.add_column("ai_assessments", sa.Column("assessment_type", sa.String(64), nullable=True))
    for col in ("openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism", "sentiment_score"):
        if not _has_column(bind, "ai_assessments", col):
            op.add_column("ai_assessments", sa.Column(col, sa.Float(), nullable=True))
    if not _has_column(bind, "ai_assessments", "dominant_emotion"):
        op.add_column("ai_assessments", sa.Column("dominant_emotion", sa.String(64), nullable=True))
    if not _has_column(bind, "ai_assessments", "mood_timestamp"):
        op.add_column("ai_assessments", sa.Column("mood_timestamp", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    for col in (
        "mood_timestamp", "dominant_emotion", "sentiment_score", "neuroticism",
        "agreeableness", "extraversion", "conscientiousness", "openness",
        "assessment_type", "user_id",
    ):
        op.drop_column("ai_assessments", col)
    for col in ("source_context", "type"):
        op.drop_column("contextual_recommendations", col)
    for col in ("general_interests", "career_interests", "mood_history", "personality_traits"):
        op.drop_column("user_contexts", col)
    for col in ("mood_patterns", "personality_traits", "interests"):
        op.drop_column("users", col)
    for name in ("personality_traits", "personality_assessments", "user_tastes", "user_interests"):
        op.drop_table(name)
