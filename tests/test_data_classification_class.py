"""DataClassificationService class wrapper + Drive service stub
(audit task 7367c6f0)."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest


def test_data_classification_service_class_exists():
    """AC 19-20 — the class wrapper carries both helpers."""
    from app.services.data_classification_service import DataClassificationService

    svc = DataClassificationService()
    task = SimpleNamespace(
        status="pending",
        deadline=datetime.now(timezone.utc) + timedelta(days=3),
    )
    assert svc.classify_task_essentiality(task) == "essential"

    item = SimpleNamespace(
        is_completed=False,
        due_date=datetime.now(timezone.utc) + timedelta(days=1),
    )
    assert svc.classify_todo_item_essentiality(item) == "essential"


def test_data_classification_service_accepts_custom_rules():
    from app.services.data_classification_service import DataClassificationService

    svc = DataClassificationService(rules={"essential_window_days": 1})
    task = SimpleNamespace(
        status="pending",
        deadline=datetime.now(timezone.utc) + timedelta(days=3),
    )
    # 3 days > 1-day window → deferred.
    assert svc.classify_task_essentiality(task) == "deferred"


def test_google_drive_service_module_imports():
    """AC 14 — file exists with the two named functions."""
    from app.services.google_drive_service import (
        APP_ROOT_FOLDER_NAME,
        DEFAULT_SUBFOLDERS,
        get_or_create_app_root_folder,
        get_or_create_subfolders,
    )

    assert APP_ROOT_FOLDER_NAME == "Lifemanager Data"
    assert DEFAULT_SUBFOLDERS == ("audio", "images", "documents", "migrated_data")
    assert callable(get_or_create_app_root_folder)
    assert callable(get_or_create_subfolders)


@pytest.mark.asyncio
async def test_drive_helpers_require_credentials():
    """AC 14-15 — without a refresh_token, the helpers raise so a
    misroute can't silently fall back to a no-op."""
    from app.services.google_drive_service import (
        get_or_create_app_root_folder,
        get_or_create_subfolders,
    )

    with pytest.raises(RuntimeError, match="refresh_token"):
        await get_or_create_app_root_folder(refresh_token=None)
    with pytest.raises(RuntimeError, match="refresh_token"):
        await get_or_create_subfolders(refresh_token=None, root_folder_id="x")


@pytest.mark.asyncio
async def test_drive_helpers_use_stub_client():
    """AC 15 — with a (stub) client + refresh_token, the helpers create
    the root folder + subfolders."""
    from app.services.google_drive_service import (
        DEFAULT_SUBFOLDERS,
        get_or_create_app_root_folder,
        get_or_create_subfolders,
    )

    class StubClient:
        async def get_or_create_folder(self, name, parent=None):
            return f"id-{name}"

    client = StubClient()
    root_id = await get_or_create_app_root_folder(
        refresh_token="rt", client=client
    )
    assert root_id == "id-Lifemanager Data"

    subs = await get_or_create_subfolders(
        refresh_token="rt", root_folder_id=root_id, client=client
    )
    assert set(subs.keys()) == set(DEFAULT_SUBFOLDERS)


def test_todo_item_content_schema_uses_config_max_length():
    """AC 25-27 — TodoItemCreate / TodoItemUpdate respect
    MAX_TODO_ITEM_CONTENT_LENGTH from config."""
    from app.config import MAX_TODO_ITEM_CONTENT_LENGTH
    from app.schemas.todo_item_schema import TodoItemCreate, TodoItemUpdate

    create_max = TodoItemCreate.model_fields["content"].metadata
    update_max = TodoItemUpdate.model_fields["content"].metadata
    # The MaxLen metadata entry on the FieldInfo carries the cap.
    create_caps = [getattr(m, "max_length", None) for m in create_max]
    update_caps = [getattr(m, "max_length", None) for m in update_max]
    assert MAX_TODO_ITEM_CONTENT_LENGTH in create_caps
    assert MAX_TODO_ITEM_CONTENT_LENGTH in update_caps


def test_todo_item_post_rejects_too_long_content(api_client):
    """AC 27 — POST /api/todo-items with content > cap returns 422."""
    from app.config import MAX_TODO_ITEM_CONTENT_LENGTH

    huge = "x" * (MAX_TODO_ITEM_CONTENT_LENGTH + 1)
    resp = api_client.post("/api/todo-items", json={"content": huge})
    assert resp.status_code in (400, 422), resp.text
