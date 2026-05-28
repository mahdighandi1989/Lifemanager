"""Rules-based essentiality classification (audit task 7367c6f0).

Drives the dashboard's "what's essential" view without invoking the
AI. The thresholds live in ``DATA_CLASSIFICATION_RULES`` so an
operator can dial them without redeploying the model.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any


# Default rules — overridden by config.DATA_CLASSIFICATION_RULES at
# import time of the consumer, but exposed here as the fall-back so a
# unit test against this module alone still has deterministic values.
DEFAULT_RULES = {
    "essential_window_days": 7,
}


def classify_task_essentiality(task: Any, rules: dict | None = None) -> str:
    """Return ``"essential"`` if the task is pending and its deadline
    is inside the essential window; ``"non-essential"`` if completed;
    ``"deferred"`` otherwise.

    Accepts duck-typed objects so the helper can run against the ORM
    row OR a Pydantic schema OR a SimpleNamespace test fixture.
    """
    if rules is None:
        rules = DEFAULT_RULES
    status = getattr(task, "status", None)
    if status == "completed":
        return "non-essential"
    deadline = getattr(task, "deadline", None)
    if deadline is None:
        return "deferred"
    window = timedelta(days=int(rules.get("essential_window_days", 7)))
    # Compare in UTC-aware terms so a naive deadline doesn't crash.
    if deadline.tzinfo is None:
        deadline_aware = deadline.replace(tzinfo=timezone.utc)
    else:
        deadline_aware = deadline
    now = datetime.now(timezone.utc)
    if status == "pending" and now <= deadline_aware <= now + window:
        return "essential"
    return "deferred"


def classify_todo_item_essentiality(item: Any, rules: dict | None = None) -> str:
    """TodoItem variant — same window rule against ``due_date``."""
    if rules is None:
        rules = DEFAULT_RULES
    if getattr(item, "is_completed", False):
        return "non-essential"
    due_date = getattr(item, "due_date", None)
    if due_date is None:
        return "deferred"
    window = timedelta(days=int(rules.get("essential_window_days", 7)))
    if hasattr(due_date, "tzinfo"):
        if due_date.tzinfo is None:
            due_aware = due_date.replace(tzinfo=timezone.utc)
        else:
            due_aware = due_date
    else:
        # plain date → treat as start-of-day UTC
        due_aware = datetime(due_date.year, due_date.month, due_date.day, tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    if now <= due_aware <= now + window:
        return "essential"
    return "deferred"


class DataClassificationService:
    """Class wrapper around the module-level classifier helpers
    (audit task 7367c6f0 ACs 19-20). Some callers prefer the OO
    surface (``svc.classify_task_essentiality(task)``) for easier
    DI in tests."""

    def __init__(self, rules: dict | None = None):
        self.rules = rules or DEFAULT_RULES

    def classify_task_essentiality(self, task) -> str:
        return classify_task_essentiality(task, self.rules)

    def classify_todo_item_essentiality(self, item) -> str:
        return classify_todo_item_essentiality(item, self.rules)
