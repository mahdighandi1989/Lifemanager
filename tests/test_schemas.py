"""Unit tests for Pydantic schemas (no DB, no HTTP).

These exercise the validation rules pinned by the AC:
- TaskCreate.priority only accepts 0..5
- UserCreate.email is an EmailStr (rejects bad addresses)
- UserCreate.password requires min_length=8
- TaskCreate.due_date accepts an ISO date
"""
import pytest
from pydantic import ValidationError

from app.schemas.auth import UserCreate
from app.schemas.project_schema import ProjectCreate
from app.schemas.task_schema import TaskCreate
from app.schemas.user_schema import UserPublic


# --- TaskCreate -------------------------------------------------------------

def test_task_title_required_min_length():
    with pytest.raises(ValidationError):
        TaskCreate(title="")


def test_task_title_max_length_200():
    TaskCreate(title="x" * 200)
    with pytest.raises(ValidationError):
        TaskCreate(title="x" * 201)


def test_task_description_max_length_1000():
    TaskCreate(title="ok", description="x" * 1000)
    with pytest.raises(ValidationError):
        TaskCreate(title="ok", description="x" * 1001)


def test_task_priority_must_be_between_0_and_5():
    for p in range(0, 6):
        TaskCreate(title="ok", priority=p)
    with pytest.raises(ValidationError):
        TaskCreate(title="ok", priority=-1)
    with pytest.raises(ValidationError):
        TaskCreate(title="ok", priority=6)


def test_task_due_date_accepts_iso_date():
    t = TaskCreate(title="ok", due_date="2025-03-15")
    assert str(t.due_date) == "2025-03-15"


def test_task_status_pattern_enforced():
    TaskCreate(title="ok", status="todo")
    with pytest.raises(ValidationError):
        TaskCreate(title="ok", status="bogus")


# --- ProjectCreate ----------------------------------------------------------

def test_project_name_required_min_length():
    with pytest.raises(ValidationError):
        ProjectCreate(name="")


def test_project_name_max_length_200():
    ProjectCreate(name="x" * 200)
    with pytest.raises(ValidationError):
        ProjectCreate(name="x" * 201)


def test_project_description_max_length_1000():
    ProjectCreate(name="ok", description="x" * 1000)
    with pytest.raises(ValidationError):
        ProjectCreate(name="ok", description="x" * 1001)


def test_project_status_pattern_enforced():
    ProjectCreate(name="ok", status="active")
    ProjectCreate(name="ok", status="archived")
    with pytest.raises(ValidationError):
        ProjectCreate(name="ok", status="bogus")


# --- UserCreate (lives in app.schemas.auth) ---------------------------------

def test_user_email_must_be_valid():
    UserCreate(email="x@y.com", username="u", password="longenough")
    with pytest.raises(ValidationError):
        UserCreate(email="not-an-email", username="u", password="longenough")


def test_user_password_min_length_8():
    UserCreate(email="x@y.com", username="u", password="12345678")
    with pytest.raises(ValidationError):
        UserCreate(email="x@y.com", username="u", password="short")


# --- UserPublic -------------------------------------------------------------

def test_user_public_has_name_alias_for_username():
    u = UserPublic(id=1, email="x@y.com", username="alice")
    assert u.name == "alice"


def test_user_public_dump_includes_name_field():
    u = UserPublic(id=1, email="x@y.com", username="alice")
    dumped = u.model_dump()
    assert dumped["name"] == "alice"
    assert "id" in dumped and "email" in dumped


def test_user_public_never_includes_hashed_password():
    u = UserPublic(id=1, email="x@y.com", username="alice")
    assert "hashed_password" not in u.model_dump()
    assert "password" not in u.model_dump()
