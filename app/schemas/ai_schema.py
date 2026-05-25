from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class AIModelConfigCreate(BaseModel):
    name: str
    provider: str
    model_name: str
    api_key_env_var: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    is_active: bool = True


class AIModelConfigUpdate(BaseModel):
    name: Optional[str] = None
    provider: Optional[str] = None
    model_name: Optional[str] = None
    api_key_env_var: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class AIModelConfigOut(BaseModel):
    id: int
    name: str
    provider: str
    model_name: str
    api_key_env_var: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AIQueryRequest(BaseModel):
    prompt: str
    model_config_id: Optional[int] = None
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7


class AIQueryResponse(BaseModel):
    response: str
    model_used: Optional[str] = None
    tokens_used: Optional[int] = None