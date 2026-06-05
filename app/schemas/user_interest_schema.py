"""Pydantic schemas for user interests + tastes (audit task 14e65214).

``UserInterestSchema`` / ``UserTasteSchema`` are the canonical response shapes;
the ``*Create`` variants are the write payloads. Pydantic v2 ``from_attributes``
lets the routes return ORM rows directly.
"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class UserInterestBase(BaseModel):
    interest_type: Optional[str] = Field(None, max_length=64)
    value: str
    source: Optional[str] = Field(None, max_length=64)
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    category: Optional[str] = Field(None, max_length=64)
    is_verified: bool = False


class UserInterestCreate(UserInterestBase):
    pass


class UserInterestSchema(BaseModel):
    # Inherits the same fields as ``UserInterestBase`` but declared directly on
    # ``BaseModel`` so the canonical response shape is self-contained.
    interest_type: Optional[str] = Field(None, max_length=64)
    value: str
    source: Optional[str] = Field(None, max_length=64)
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    category: Optional[str] = Field(None, max_length=64)
    is_verified: bool = False
    id: int
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Back-compat alias — the Step-1 prompt names the response UserInterestResponse.
UserInterestResponse = UserInterestSchema


class UserTasteBase(BaseModel):
    category: Optional[str] = Field(None, max_length=64)
    value: str
    source: Optional[str] = Field(None, max_length=64)
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    is_verified: bool = False


class UserTasteCreate(UserTasteBase):
    pass


class UserTasteSchema(BaseModel):
    # Same fields as ``UserTasteBase`` declared directly on ``BaseModel`` so the
    # canonical response shape is self-contained.
    category: Optional[str] = Field(None, max_length=64)
    value: str
    source: Optional[str] = Field(None, max_length=64)
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    is_verified: bool = False
    id: int
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


UserTasteResponse = UserTasteSchema


class UserInterestsProfile(BaseModel):
    """Combined view returned by GET /api/users/{user_id}/interests."""

    interests: list[UserInterestSchema] = []
    tastes: list[UserTasteSchema] = []
