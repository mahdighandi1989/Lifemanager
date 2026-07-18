"""Dev-sync — «مرکز توسعه»: GitHub repos + Render services/logs mirrored into
the life-management view.

Five tables, all NEW (⇒ created by ``Base.metadata.create_all()`` at startup
once registered in app/models/__init__.py, + alembic 0038 for the production
path; no startup ALTER needed):

* ``dev_integrations``   — one row per (provider, user): the encrypted API
  token (GitHub PAT / Render API key) + sync bookkeeping. Tokens are
  encrypted at rest via app/services/crypt_service and NEVER returned to the
  client (responses expose ``has_api_key`` + a masked hint only — the same
  contract as ``ai_providers.api_key_encrypted``). Env vars
  (``GITHUB_TOKEN``/``GH_TOKEN``, ``RENDER_API_KEY``) are the fallback when
  no DB token exists.
* ``dev_projects``       — one row per synced GitHub repo («پروژه توسعه»).
  ``linked_project_id`` is the soft bridge to the life «projects» table so a
  repo can surface inside the owner's life-project view; the sibling
  project-management app stays the system of record for engineering work —
  this table only mirrors state (no duplicate task management).
* ``dev_services``       — one row per Render service (id is Render's
  ``srv-…`` string). ``dev_project_id`` auto-links a service to its repo row
  when Render reports the connected GitHub repo.
* ``dev_logs``           — recent raw Render log lines (short retention —
  the AI daily summary is the long-term record, raw lines age out).
* ``dev_log_summaries``  — the Persian «امروز در این پروژه چه شد» daily
  digest per service/project (AI narrative with a deterministic fallback —
  same provenance rule as WeeklyReview: ``ai_model`` NULL ⇒ fallback text).
"""
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.sql import func

from app.database import Base


class DevIntegration(Base):
    __tablename__ = "dev_integrations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    provider = Column(String(32), nullable=False, index=True)  # github / render
    api_key_encrypted = Column(Text, nullable=True)
    is_enabled = Column(Boolean, nullable=False, default=True)
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    last_sync_ok = Column(Boolean, nullable=True)
    last_sync_error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class DevProject(Base):
    __tablename__ = "dev_projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    provider = Column(String(32), nullable=False, default="github")
    repo_full_name = Column(String(255), nullable=False, index=True)  # owner/name
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    html_url = Column(String(512), nullable=True)
    default_branch = Column(String(120), nullable=True)
    language = Column(String(80), nullable=True)
    is_private = Column(Boolean, nullable=False, default=False)
    is_archived = Column(Boolean, nullable=False, default=False)
    pushed_at = Column(DateTime(timezone=True), nullable=True)
    stars = Column(Integer, nullable=True)
    forks = Column(Integer, nullable=True)
    open_issues = Column(Integer, nullable=True)
    topics = Column(JSON, nullable=True)
    # Soft bridge to the life «projects» table (nullable — a repo may not be
    # part of any life project). Plain FK, no relationship(): mirrors
    # tasks.project_id.
    linked_project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    extra = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class DevService(Base):
    __tablename__ = "dev_services"

    # Render's own id ("srv-…") is the PK so log rows join without a lookup.
    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    name = Column(String(255), nullable=False)
    service_type = Column(String(64), nullable=True)  # web_service / worker / cron …
    status = Column(String(64), nullable=True)  # suspended flag / deploy state
    service_url = Column(String(512), nullable=True)
    dashboard_url = Column(String(512), nullable=True)
    repo_url = Column(String(512), nullable=True)  # connected GitHub repo (from Render)
    branch = Column(String(120), nullable=True)
    dev_project_id = Column(Integer, ForeignKey("dev_projects.id"), index=True, nullable=True)
    auto_fetch_logs = Column(Boolean, nullable=False, default=True)
    last_log_at = Column(DateTime(timezone=True), nullable=True)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    extra = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class DevLog(Base):
    __tablename__ = "dev_logs"

    # Render log id when present, else md5(service|timestamp|message) — the
    # PK doubles as the dedup key across poll cycles.
    id = Column(String(64), primary_key=True)
    service_id = Column(String(64), nullable=False, index=True)
    service_name = Column(String(255), nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    level = Column(String(16), nullable=False, default="info", index=True)
    message = Column(Text, nullable=False)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("ix_dev_logs_service_ts", "service_id", "timestamp"),
        Index("ix_dev_logs_level_ts", "level", "timestamp"),
    )


class DevErrorIssue(Base):
    """One PERSISTENT error signature per service («خطاها حذف نشن»).

    Raw dev_logs age out with retention, but every distinct error message
    (numbers/ids normalized away → ``fingerprint``) gets exactly one row here
    that lives forever: occurrences/first/last are updated while it keeps
    happening, the engine auto-resolves it once it has stopped for
    ``error_resolve_hours`` WHILE the service kept logging (a dead service
    proves nothing), and a recurrence re-opens it. The owner can also resolve
    or mute manually. Status: open | resolved | muted.
    """

    __tablename__ = "dev_error_issues"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    service_id = Column(String(64), nullable=False, index=True)
    service_name = Column(String(255), nullable=True)
    dev_project_id = Column(Integer, ForeignKey("dev_projects.id"), index=True, nullable=True)
    fingerprint = Column(String(64), nullable=False, unique=True, index=True)
    title = Column(String(300), nullable=False)  # normalized message
    sample_message = Column(Text, nullable=True)  # latest raw example
    level = Column(String(16), nullable=False, default="error")
    occurrences = Column(Integer, nullable=False, default=1)
    first_seen_at = Column(DateTime(timezone=True), nullable=False)
    last_seen_at = Column(DateTime(timezone=True), nullable=False, index=True)
    status = Column(String(16), nullable=False, default="open", index=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(String(16), nullable=True)  # auto | manual
    reopened_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class DevLogSummary(Base):
    __tablename__ = "dev_log_summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    dev_project_id = Column(Integer, ForeignKey("dev_projects.id"), index=True, nullable=True)
    service_id = Column(String(64), nullable=True, index=True)
    service_name = Column(String(255), nullable=True)
    summary_date = Column(Date, nullable=False, index=True)  # LOCAL date covered
    summary = Column(Text, nullable=False)  # Persian narrative
    stats = Column(JSON, nullable=True)  # counts by level, deploys, samples
    ai_model = Column(String(120), nullable=True)  # NULL ⇒ deterministic fallback
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        Index("ix_dev_log_summaries_service_date", "service_id", "summary_date"),
    )
