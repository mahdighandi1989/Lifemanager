"""seed 33 default todo lists from the user's profile PDFs.

The user uploaded their existing TodoList profile as 33 PDFs and
asked us to materialise the same list names in the system. This
migration inserts those names (preserving order) with user_id=NULL
so any authenticated user sees them as starter lists until they
claim or delete them.

The seed is idempotent: each name is checked for existence first,
so re-running the migration (or running it against an env that
already used the bulk_create_default_lists helper) is a no-op.

Revision ID: 0005_seed_default_todo_lists
Revises: 0004_todo_lists
Create Date: 2026-05-26
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "0005_seed_default_todo_lists"
down_revision: Union[str, None] = "0004_todo_lists"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Order matches the PDF filename order the user provided. Persian
# list names are stored as-is — the DB column is utf8 (or sqlite's
# native unicode) so they round-trip cleanly.
DEFAULT_LIST_NAMES: tuple[str, ...] = (
    "Important",
    "Tasks",
    "انجام تمرینات تقویت هوش",
    "ایده ها",
    "برنامه نویسی",
    "پرونده های مختومه",
    "پرونده های موقتا مختومه",
    "تاریخ انبیا",
    "تاریخ شفاهی فامیل",
    "تاریخ معاصر",
    "تجارت",
    "تحلیل سیاسی",
    "تفریح و سرگرمی",
    "حفظ قرآن",
    "خریدهای لازم",
    "خودسازی",
    "خودهیپنوتیزم",
    "خوشنویسی",
    "دروس حقوق",
    "ریاضی و فیزیک",
    "زبان",
    "شعر گفتن",
    "علوم و معارف اسلامی",
    "کارهای اصلی این هفته - 05-05-2025",
    "کارهای زیر 2 دقیقه",
    "کسب در آمد",
    "مداحی",
    "مهارت نفوذ",
    "مهارت های فردی",
    "موضوعات برای تفکر",
    "نویسندگی",
    "ورزش",
    "وقتی بیکارم یا نمیدونم چی کار کنم",
)


def upgrade() -> None:
    bind = op.get_bind()
    # Reflect the todo_lists table so we don't depend on importing
    # the SQLAlchemy model here (migrations should be self-contained).
    todo_lists = sa.Table(
        "todo_lists",
        sa.MetaData(),
        autoload_with=bind,
    )

    existing = {
        row[0]
        for row in bind.execute(sa.select(todo_lists.c.name)).all()
    }

    rows = [
        {"name": name, "sort_order": idx, "is_archived": False}
        for idx, name in enumerate(DEFAULT_LIST_NAMES)
        if name not in existing
    ]
    if rows:
        bind.execute(todo_lists.insert(), rows)


def downgrade() -> None:
    bind = op.get_bind()
    todo_lists = sa.Table(
        "todo_lists",
        sa.MetaData(),
        autoload_with=bind,
    )
    bind.execute(todo_lists.delete().where(todo_lists.c.name.in_(DEFAULT_LIST_NAMES)))
