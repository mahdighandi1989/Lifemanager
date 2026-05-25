"""User schemas.

UserPublic   — safe to send to clients (NEVER includes hashed_password).
UserOut     — alias of UserPublic kept for existing imports.
UserUpdate  — partial-update payload.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, computed_field


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(default=None, min_length=1, max_length=64)
    full_name: Optional[str] = Field(default=None, max_length=120)


class UserPublic(BaseModel):
    """The shape exposed by /api/users/* endpoints.

    Explicitly does NOT include hashed_password — the security test in
    tests/test_user_schema.py asserts the field cannot appear in responses
    that use this schema.
    """
    id: int
    email: EmailStr
    username: str
    is_active: bool = True
    is_superuser: bool = False
    created_at: Optional[datetime] = None

    @computed_field  # type: ignore[prop-decorator]
    @property
    def name(self) -> str:
        """Stable alias for `username` so the frontend's expected `name`
        field is always populated (the User model only has `username`)."""
        return self.username

    class Config:
        from_attributes = True


# Existing route imports use `UserOut`; keep it as an alias for UserPublic so
# every consumer that previously expected a user-without-password keeps that
# guarantee for free.
UserOut = UserPublic
