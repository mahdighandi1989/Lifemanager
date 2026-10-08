"""inspection_* — «نظارت و سرکشی»: the owner's sheets, their shots, files, binders.

Five new tables, nothing altered. Render's free tier also builds them with
create_all() at startup, so every table is guarded — alembic may arrive second.

Revision ID: 0062_inspection
Revises: 0061_trip_explanation
"""
import sqlalchemy as sa
from alembic import op

revision = "0062_inspection"
down_revision = "0061_trip_explanation"
branch_labels = None
depends_on = None

_TZ = sa.DateTime(timezone=True)


def upgrade() -> None:
    bind = op.get_bind()
    have = set(sa.inspect(bind).get_table_names())

    if "inspection_reports" not in have:
        op.create_table(
            "inspection_reports",
            sa.Column("id", sa.String(length=40), primary_key=True),
            sa.Column("number", sa.Integer(), nullable=False),
            sa.Column("created_at", _TZ, server_default=sa.func.now()),
            sa.Column("updated_at", _TZ, server_default=sa.func.now()),
            sa.Column("status", sa.String(length=12), nullable=False),
            sa.Column("title", sa.String(length=200), nullable=True),
            sa.Column("created_by", sa.String(length=80), nullable=True),
            sa.Column("page", sa.String(length=200), nullable=True),
            sa.Column("page_label", sa.String(length=200), nullable=True),
            sa.Column("section_id", sa.String(length=120), nullable=True),
            sa.Column("section_label", sa.String(length=200), nullable=True),
            sa.Column("reopen", sa.String(length=400), nullable=True),
            sa.Column("dom_path", sa.String(length=400), nullable=True),
            sa.Column("covered_text", sa.Text(), nullable=True),
            sa.Column("rect_json", sa.Text(), nullable=True),
            sa.Column("viewport_json", sa.Text(), nullable=True),
            sa.Column("geometry_json", sa.Text(), nullable=True),
            sa.Column("notes_json", sa.Text(), nullable=True),
            sa.Column("deps_json", sa.Text(), nullable=True),
            sa.Column("urgent_at", _TZ, nullable=True),
            sa.Column("urgent_claimed_at", _TZ, nullable=True),
            sa.Column("urgent_claimed_by", sa.String(length=80), nullable=True),
            sa.Column("urgent_done_at", _TZ, nullable=True),
            sa.Column("binder_id", sa.String(length=40), nullable=True),
            sa.Column("binder_number", sa.Integer(), nullable=True),
            sa.Column("binder_page", sa.Integer(), nullable=True),
            sa.Column("filed_at", _TZ, nullable=True),
        )
        for col in ("number", "status", "page", "reopen", "urgent_at"):
            op.create_index(f"ix_inspection_reports_{col}", "inspection_reports", [col])

    if "inspection_shots" not in have:
        op.create_table(
            "inspection_shots",
            sa.Column("id", sa.String(length=40), primary_key=True),
            sa.Column("report_id", sa.String(length=40), nullable=False),
            sa.Column("note_id", sa.String(length=40), nullable=True),
            sa.Column("kind", sa.String(length=10), nullable=True),
            sa.Column("mime", sa.String(length=40), nullable=True),
            sa.Column("data", sa.Text(), nullable=True),
            sa.Column("byte_size", sa.Integer(), nullable=True),
            sa.Column("created_at", _TZ, server_default=sa.func.now()),
        )
        op.create_index("ix_inspection_shots_report_id", "inspection_shots", ["report_id"])
        op.create_index("ix_inspection_shots_note_id", "inspection_shots", ["note_id"])

    if "inspection_files" not in have:
        op.create_table(
            "inspection_files",
            sa.Column("id", sa.String(length=40), primary_key=True),
            sa.Column("report_id", sa.String(length=40), nullable=False),
            sa.Column("note_id", sa.String(length=40), nullable=True),
            sa.Column("uploaded_by", sa.String(length=80), nullable=True),
            sa.Column("created_at", _TZ, server_default=sa.func.now()),
            sa.Column("filename", sa.String(length=260), nullable=True),
            sa.Column("mime", sa.String(length=120), nullable=True),
            sa.Column("byte_size", sa.Integer(), nullable=True),
            sa.Column("sha256", sa.String(length=64), nullable=True),
            sa.Column("caption", sa.Text(), nullable=True),
            sa.Column("store", sa.String(length=12), nullable=True),
            sa.Column("drive_id", sa.String(length=120), nullable=True),
            sa.Column("drive_link", sa.String(length=400), nullable=True),
            sa.Column("local_path", sa.String(length=400), nullable=True),
            sa.Column("store_note", sa.Text(), nullable=True),
            sa.Column("extract_status", sa.String(length=12), nullable=True),
            sa.Column("extract_note", sa.Text(), nullable=True),
            sa.Column("text", sa.Text(), nullable=True),
            sa.Column("text_chars", sa.Integer(), nullable=True),
            sa.Column("page_count", sa.Integer(), nullable=True),
            sa.Column("text_truncated", sa.Boolean(), nullable=True),
            sa.Column("read_chars", sa.Integer(), nullable=True),
            sa.Column("read_at", _TZ, nullable=True),
            sa.Column("read_by", sa.String(length=80), nullable=True),
            sa.Column("viewed_at", _TZ, nullable=True),
        )
        op.create_index("ix_inspection_files_report_id", "inspection_files", ["report_id"])
        op.create_index("ix_inspection_files_note_id", "inspection_files", ["note_id"])

    if "inspection_file_chunks" not in have:
        op.create_table(
            "inspection_file_chunks",
            sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column("file_id", sa.String(length=40), nullable=False),
            sa.Column("seq", sa.Integer(), nullable=False),
            sa.Column("data", sa.LargeBinary(), nullable=False),
        )
        op.create_index("ix_inspection_file_chunks_file_id", "inspection_file_chunks", ["file_id"])

    if "inspection_binders" not in have:
        op.create_table(
            "inspection_binders",
            sa.Column("id", sa.String(length=40), primary_key=True),
            sa.Column("number", sa.Integer(), nullable=False),
            sa.Column("label", sa.String(length=120), nullable=True),
            sa.Column("subtitle", sa.String(length=240), nullable=True),
            sa.Column("opened_at", _TZ, server_default=sa.func.now()),
            sa.Column("closed_at", _TZ, nullable=True),
            sa.Column("report_ids_json", sa.Text(), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    have = set(sa.inspect(bind).get_table_names())
    for table in ("inspection_binders", "inspection_file_chunks", "inspection_files",
                  "inspection_shots", "inspection_reports"):
        if table in have:
            op.drop_table(table)
