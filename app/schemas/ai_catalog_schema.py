"""Pydantic request bodies for the AI catalog endpoints (ALLIN1 port).

NB: no ``from __future__ import annotations`` here — FastAPI builds a pydantic
TypeAdapter for each Body model, and stringised (forward-ref) annotations make
it "not fully defined" at request time. Real annotation objects keep it eager.
"""
from typing import List, Optional

from pydantic import BaseModel, Field


class CatalogProviderUpdate(BaseModel):
    enabled: Optional[bool] = None
    # "" clears the stored key; any value (re)encrypts it. None = leave as-is.
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    notes: Optional[str] = None


class CatalogModelCreate(BaseModel):
    model_key: str = Field(..., min_length=1, max_length=120)
    provider_key: str = Field(..., min_length=1, max_length=40)
    display_name: Optional[str] = None
    api_model_id: Optional[str] = None
    capabilities: List[str] = Field(default_factory=list)
    max_output_tokens: Optional[int] = None
    context_window: Optional[int] = None
    temperature: Optional[float] = None
    priority: int = 6
    notes: Optional[str] = None


class CatalogModelUpdate(BaseModel):
    display_name: Optional[str] = None
    enabled: Optional[bool] = None
    capabilities: Optional[List[str]] = None
    max_output_tokens: Optional[int] = None
    context_window: Optional[int] = None
    temperature: Optional[float] = None
    priority: Optional[int] = None
    notes: Optional[str] = None


class CatalogTaskRouteUpdate(BaseModel):
    model_id: Optional[int] = None
    enabled: Optional[bool] = None
    notes: Optional[str] = None
