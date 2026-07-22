from sqlalchemy import (
    Column,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    JSON,
    Numeric,
    String,
    Text,
)
from sqlalchemy.sql import func
from app.database import Base
import enum


class TaskStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    CANCELLED = "cancelled"


class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(SAEnum(TaskStatus), default=TaskStatus.TODO, nullable=False)
    priority = Column(SAEnum(TaskPriority), default=TaskPriority.MEDIUM, nullable=False)
    # nullable: anonymous task creation is allowed today; routes populate
    # this from the authenticated principal once auth is wired in.
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    # Date (not DateTime) — matches TaskCreate.due_date: date in
    # app/schemas/task_schema.py. Legacy deploys that already have a
    # TIMESTAMP column are migrated to DATE at startup (see app/main.py).
    due_date = Column(Date, nullable=True)
    # خداشهر (2026-07-22): the owner's persistent sahat assignment (khoda /
    # khod_ravan / khod_aql / khod_jesm / digaran / mohit). NULL = untouched;
    # the deterministic classifier supplies a default at read time, but a
    # stored value ALWAYS wins — the owner's correction is final.
    sahat = Column(String(16), nullable=True)

    # Planning fields (added for the database-evolution composite).
    # estimated_duration is stored as integer minutes so the column type
    # is portable across Postgres (would use INTERVAL) and SQLite (no
    # INTERVAL type). Callers convert to/from timedelta as needed.
    estimated_duration = Column(Integer, nullable=True)
    # estimated_cost — money a task needs (audit task 4ae4b3ca, AC5). When the
    # user's total account balance covers it, the budget notifier flags the
    # task as affordable.
    estimated_cost = Column(Numeric(18, 2), nullable=True)
    # Context-engine triggers (audit task 2165524b, AC2): a task can be gated
    # on where you are, your heart rate, an activity, or a mood — the engine
    # surfaces it when the ambient context matches.
    location_lat = Column(Numeric(10, 6), nullable=True)
    location_lng = Column(Numeric(10, 6), nullable=True)
    heart_rate_threshold = Column(Integer, nullable=True)
    activity_required = Column(String(64), nullable=True)
    mood_tag = Column(String(64), nullable=True)
    # Consolidation (audit task fbd9bd36): merged_into_id is a soft self-
    # reference to the primary task this duplicate was folded into (plain
    # Integer — no DB FK so the SQLite ALTER stays simple); merge_history is a
    # JSON log kept on the primary. A task with merged_into_id set is treated
    # as merged-away (the equivalent of is_active=False).
    merged_into_id = Column(Integer, nullable=True)
    merge_history = Column(Text, nullable=True)
    # deadline is a full timestamp — distinct from due_date which is the
    # calendar date a task is scheduled for. Use deadline for the hard
    # cutoff (when it stops mattering); due_date for the planning bucket.
    deadline = Column(DateTime(timezone=True), nullable=True)
    # recurrence stores an RFC-5545-ish dict ({"freq": "weekly",
    # "interval": 1, "byweekday": ["MO", "WE"]}) so the planner can
    # expand recurring tasks without a separate recurrence table.
    recurrence = Column(JSON, nullable=True)
    # مرحله‌بندی (2026-07-22): an ordered list of concrete steps, each
    # ``{"text": str, "done": bool}`` — the «نخِ تسبیح» done right: any input
    # can be broken into trackable stages and its progress followed, calmly,
    # without turning it into a preachy daily command. NULL = not staged yet.
    steps = Column(JSON, nullable=True)
    # attachment is a storage key resolved by app/services/__init__.py's
    # get_storage_backend() — opaque to the database. Production deploys
    # set STORAGE_BACKEND=s3 to route reads/writes through S3Storage.
    attachment = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status.value}' if self.status else None)>"
