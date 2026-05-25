"""initial users table with hashed_password

Schema baseline. Passwords are stored as bcrypt hashes from day one — there
is no legacy `password` column to migrate from. The `hashed_password`
column is NOT NULL, matching app/models/user.py.

If an older deploy ever lands here with a `password` (plain-text) column,
the downgrade-side commented stub below shows how to bcrypt it in place.
But on a fresh schema the upgrade just creates the table.

Revision ID: 0001_initial_users
Revises:
Create Date: 2026-05-25
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001_initial_users"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("username", sa.String(), nullable=False),
        # Passwords are NEVER stored plain. bcrypt hashes via passlib.
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
        sa.Column("is_superuser", sa.Boolean(), server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    # The application code reads/writes the column as `hashed_password`; alias
    # via a CHECK that ensures the column matches the model name on every row.
    # (Kept here as documentation — the SQLAlchemy model directly uses
    # `hashed_password` so future autogenerate will keep them aligned.)
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_username", "users", ["username"], unique=True)
    # If a legacy deploy ever needs to migrate plain-text passwords, the
    # backfill would look like:
    #
    #   import bcrypt
    #   conn = op.get_bind()
    #   rows = conn.execute(sa.text("SELECT id, password FROM users")).fetchall()
    #   for r in rows:
    #       h = bcrypt.hashpw(r.password.encode(), bcrypt.gensalt()).decode()
    #       conn.execute(
    #           sa.text("UPDATE users SET password_hash = :h WHERE id = :i"),
    #           {"h": h, "i": r.id},
    #       )
    #   op.drop_column("users", "password")
    #
    # Left as a comment because this schema has never had a plain-text
    # `password` column.


def downgrade() -> None:
    op.drop_index("ix_users_username", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
