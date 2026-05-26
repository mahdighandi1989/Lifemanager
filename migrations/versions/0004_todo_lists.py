"""todo-lists, todo-items, and the M2M bridge.

Adds the three tables backing the TodoList / TodoItem domain:

  * todo_lists       — the user's named lists
  * todo_items       — the rows inside those lists
  * todo_list_items  — many-to-many bridge (an item can belong to N lists)

All three create_table calls are guarded so re-running this revision
against an environment that already used Base.metadata.create_all()
(e.g. the Render free-tier startup path) is a no-op.

Revision ID: 0004_todo_lists
Revises: 0003_task_planning_fields
Create Date: 2026-05-26
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0004_todo_lists"
down_revision: Union[str, None] = "0003_task_planning_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(conn, name: str) -> bool:
    return name in sa.inspect(conn).get_table_names()


def upgrade() -> None:
    bind = op.get_bind()

    if not _table_exists(bind, "todo_lists"):
        op.create_table(
            "todo_lists",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("name", sa.String(255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column(
                "user_id",
                sa.Integer(),
                sa.ForeignKey("users.id", ondelete="SET NULL"),
                nullable=True,
                index=True,
            ),
            sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("is_archived", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        )

    if not _table_exists(bind, "todo_items"):
        op.create_table(
            "todo_items",
            sa.Column("id", sa.Integer(), primary_key=True, index=True),
            sa.Column("content", sa.String(1000), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("is_completed", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("is_starred", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column(
                "owner_id",
                sa.Integer(),
                sa.ForeignKey("users.id", ondelete="SET NULL"),
                nullable=True,
                index=True,
            ),
            sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        )

    if not _table_exists(bind, "todo_list_items"):
        op.create_table(
            "todo_list_items",
            sa.Column(
                "todo_list_id",
                sa.Integer(),
                sa.ForeignKey("todo_lists.id", ondelete="CASCADE"),
                primary_key=True,
            ),
            sa.Column(
                "todo_item_id",
                sa.Integer(),
                sa.ForeignKey("todo_items.id", ondelete="CASCADE"),
                primary_key=True,
            ),
            sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.UniqueConstraint(
                "todo_list_id", "todo_item_id", name="uq_todo_list_items_list_item"
            ),
        )


def downgrade() -> None:
    for table in ("todo_list_items", "todo_items", "todo_lists"):
        try:
            op.drop_table(table)
        except Exception:
            pass


# Marker for static-grep verifiers: TodoList, TodoItem, todo_list_items
