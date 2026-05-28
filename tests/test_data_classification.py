"""Coverage for app/services/data_classification_service.py (task 7367c6f0)."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from app.services import data_classification_service as dcs


def _task(*, status="pending", deadline=None):
    return SimpleNamespace(status=status, deadline=deadline)


def test_pending_task_with_near_deadline_is_essential():
    task = _task(
        status="pending",
        deadline=datetime.now(timezone.utc) + timedelta(days=3),
    )
    assert dcs.classify_task_essentiality(task) == "essential"


def test_completed_task_is_non_essential():
    task = _task(
        status="completed",
        deadline=datetime.now(timezone.utc) - timedelta(days=1),
    )
    assert dcs.classify_task_essentiality(task) == "non-essential"


def test_pending_task_without_deadline_is_deferred():
    assert dcs.classify_task_essentiality(_task(status="pending", deadline=None)) == "deferred"


def test_pending_task_with_far_deadline_is_deferred():
    task = _task(
        status="pending",
        deadline=datetime.now(timezone.utc) + timedelta(days=30),
    )
    assert dcs.classify_task_essentiality(task) == "deferred"


def test_completed_todo_item_is_non_essential():
    item = SimpleNamespace(is_completed=True, due_date=None)
    assert dcs.classify_todo_item_essentiality(item) == "non-essential"


def test_todo_item_due_soon_is_essential():
    item = SimpleNamespace(
        is_completed=False,
        due_date=datetime.now(timezone.utc) + timedelta(days=2),
    )
    assert dcs.classify_todo_item_essentiality(item) == "essential"


def test_data_classification_rules_defined_in_config():
    from app.config import DATA_CLASSIFICATION_RULES

    assert "essential_window_days" in DATA_CLASSIFICATION_RULES


def test_max_todo_item_content_length_defined():
    from app.config import MAX_TODO_ITEM_CONTENT_LENGTH

    assert isinstance(MAX_TODO_ITEM_CONTENT_LENGTH, int)
    assert MAX_TODO_ITEM_CONTENT_LENGTH > 0
