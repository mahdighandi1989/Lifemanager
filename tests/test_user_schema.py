"""Security tests for the User response shape.

AC: `endpoint /api/users/:id hashed_password را برنگرداند`. We exercise
this at the schema layer (which is what /api/users/* serializes through)
because the route requires auth, and the schema itself is the
single point of truth that decides what fields leak.
"""
from app.schemas.user_schema import UserOut, UserPublic


def test_response_no_hashed_password():
    """The AC node `tests/test_user_schema.py::test_response_no_hashed_password`.

    UserPublic / UserOut serialise to a dict that MUST NOT contain
    `hashed_password` or `password` under any name.
    """
    u = UserPublic(
        id=1,
        email="me@example.com",
        username="me",
        is_active=True,
        is_superuser=False,
    )
    dumped = u.model_dump()
    forbidden = {"hashed_password", "password", "password_hash"}
    leaked = forbidden & set(dumped)
    assert leaked == set(), f"leaked password fields: {leaked}"


def test_user_out_is_alias_of_user_public():
    assert UserOut is UserPublic


def test_user_public_includes_name_for_frontend():
    u = UserPublic(id=1, email="me@example.com", username="me")
    assert "name" in u.model_dump()
    assert u.model_dump()["name"] == "me"


def test_user_public_rejects_unknown_input_fields_silently():
    """Passing extra fields at construction time must not stick around in
    the serialised output (Pydantic v2 default is `extra='ignore'`).
    """
    u = UserPublic(
        id=1,
        email="me@example.com",
        username="me",
        hashed_password="this-should-not-be-here",
    )
    assert "hashed_password" not in u.model_dump()
