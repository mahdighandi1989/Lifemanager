"""todo_items.parent_id + due_date — subitem hierarchy & dates

Microsoft To Do exports use nested subitems (e.g. "ارسال جنس به
ایران" has 17 children) and Overdue date stamps. We extend TodoItem
with a self-referential parent_id and a due_date column.

Idempotent: each ADD COLUMN runs through inspector guards so a
re-run against a DB that already has the columns is a no-op.

Revision ID: 0006_todo_item_parent_and_due
Revises: 0005_seed_default_todo_lists
Create Date: 2026-05-26
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0006_todo_item_parent_and_due"
down_revision: Union[str, None] = "0005_seed_default_todo_lists"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(conn, table: str, col: str) -> bool:
    insp = sa.inspect(conn)
    if table not in insp.get_table_names():
        return False
    return col in {c["name"] for c in insp.get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()

    if not _has_column(bind, "todo_items", "parent_id"):
        if bind.dialect.name == "sqlite":
            # SQLite raises "No support for ALTER of constraints" when an
            # ADD COLUMN carries an inline FOREIGN KEY. Add the plain column;
            # the self-referential parent link is enforced at the app layer
            # (and SQLite is the test rig, not production).
            op.add_column(
                "todo_items",
                sa.Column("parent_id", sa.Integer(), nullable=True, index=True),
            )
        else:
            op.add_column(
                "todo_items",
                sa.Column(
                    "parent_id",
                    sa.Integer(),
                    sa.ForeignKey("todo_items.id", ondelete="CASCADE"),
                    nullable=True,
                    index=True,
                ),
            )

    if not _has_column(bind, "todo_items", "due_date"):
        op.add_column(
            "todo_items",
            sa.Column("due_date", sa.Date(), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    if _has_column(bind, "todo_items", "due_date"):
        op.drop_column("todo_items", "due_date")
    if _has_column(bind, "todo_items", "parent_id"):
        op.drop_column("todo_items", "parent_id")
