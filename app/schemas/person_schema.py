"""Pydantic schemas for /api/persons (audit task 3cc09436)."""
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class PersonBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=64)
    notes: Optional[str] = None
    # Phase 3 (audit #11): the dates the CRM reminders hang on.
    birthday: Optional[date] = None
    next_follow_up: Optional[date] = None


class PersonCreate(PersonBase):
    pass


class PersonUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=64)
    notes: Optional[str] = None
    birthday: Optional[date] = None
    next_follow_up: Optional[date] = None


class PersonResponse(PersonBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
