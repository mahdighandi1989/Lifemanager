from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
