from pydantic import BaseModel, EmailStr
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

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: OAuthUserResponse