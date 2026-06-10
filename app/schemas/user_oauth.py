from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OAuthUserCreate(BaseModel):
    email: str
    name: Optional[str] = None

class OAuthUserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    role: str
    permissions: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class OAuthUserUpdate(BaseModel):
    role: Optional[str] = None
    permissions: Optional[str] = None
    status: Optional[str] = None

class OAuthUserAdminUpdate(BaseModel):
    """Admin-supplied user changes. All optional — only provided fields are
    applied. The service layer validates values and protects super-admins.

      * ``role``        — "admin" (full admin) or "user" (ordinary account)
      * ``permissions`` — access level: "read-only" / "editor" / "admin"
      * ``status``      — "approved" / "pending" / "rejected"
    """
    role: Optional[str] = None
    permissions: Optional[str] = None
    status: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: OAuthUserResponse