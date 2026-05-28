from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class IntegrationCreate(BaseModel):
    name: str
    service_type: str
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: bool = True


class IntegrationUpdate(BaseModel):
    name: Optional[str] = None
    service_type: Optional[str] = None
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class IntegrationOut(BaseModel):
    id: int
    name: str
    service_type: str
    base_url: Optional[str] = None
    is_active: bool
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# AC 3 of audit task d2146781 — re-export the adapter dataclasses so
# downstream schemas can refer to them without reaching into the
# services/ tree.
from app.services.integrations.external_project_interface import (  # noqa: E402
    ExternalProjectConfig,
    ExternalProjectInfo,
)

__all__ = [
    "ExternalProjectConfig",
    "ExternalProjectInfo",
]
