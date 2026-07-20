"""Authentication-related Pydantic schemas.

UserCreate enforces:
    email     EmailStr (RFC-style validation)
    password  min_length=8 (AC)
    username  min_length=1

Privilege fields (``role`` / ``permissions`` / ``is_superuser`` / ``status``)
are deliberately ABSENT from ``UserCreate`` and rejected outright via
``extra="forbid"`` — the role/permission a local account gets is decided
server-side in ``app.services.auth_service.register`` (least-privilege by
default; bootstrap admins only via the operator's ``ADMIN_EMAILS`` list),
never from the request body. This mirrors the OAuth side, where
``app.services.google_auth.get_or_create_user`` is the sole authority on the
``OAuthUser`` role/permissions. Audit task a75e183c — "Enforce Default Role
for Local User Registration": stop privilege escalation via self-asserted
fields. A body carrying e.g. ``{"role": "admin"}`` or
``{"is_superuser": true}`` now fails validation with 422 instead of being
silently dropped.
"""
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    # extra="forbid": reject any field not declared below. Without this,
    # pydantic silently DROPS unknown keys — so a client posting
    # ``is_superuser`` / ``role`` would pass validation (the field is ignored,
    # not flagged), which is fragile defense-in-depth at best. Forbidding
    # extras makes the "no self-assigned privileges" contract explicit and
    # loud: the boundary refuses the request rather than trusting downstream
    # code to never read the smuggled value.
    model_config = ConfigDict(extra="forbid")

    email: EmailStr
    password: str = Field(..., min_length=8)
    username: str = Field(..., min_length=1, max_length=64)
    # Optional invite code — enforced by /register only when the
    # operator sets REGISTER_INVITE_CODE (data-safety phase 0).
    invite_code: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
