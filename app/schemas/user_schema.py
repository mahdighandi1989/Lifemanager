"""User schemas.

UserPublic        — safe to send to clients (NEVER includes hashed_password).
UserOut           — alias of UserPublic kept for existing imports.
UserUpdate        — partial-update payload.
UserProfileUpdate — bio + display_name payload for POST /api/users/profile.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, computed_field


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(default=None, min_length=1, max_length=64)
    full_name: Optional[str] = Field(default=None, max_length=120)
    bio: Optional[str] = Field(default=None, max_length=2000)
    display_name: Optional[str] = Field(default=None, max_length=120)


class UserProfileUpdate(BaseModel):
    """Profile update payload sent to POST /api/users/profile.

    Both fields are user-controlled free text. app/routes/users.py runs
    bleach.clean(strip=True) over them before persisting / echoing so
    `<script>` tags can't survive the round trip.

    Constraints intentionally generous — sanitisation is the security
    boundary, not length. display_name caps at 120 (matches the user
    table) and bio caps at 2000 (a reasonable single-paragraph limit).
    """

    bio: Optional[str] = Field(default=None, max_length=2000)
    display_name: Optional[str] = Field(default=None, max_length=120)


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
