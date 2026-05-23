from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    project_id: Optional[int] = None


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "active"


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None