from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Text
from sqlalchemy.sql import func
from app.database import Base


class AIModelConfig(Base):
    __tablename__ = "ai_model_configs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    provider = Column(String(100), nullable=False)
    model_name = Column(String(255), nullable=False)
    api_key_env_var = Column(String(255), nullable=True)
    parameters = Column(JSON, nullable=True, default=dict)
    # Optional per-config template (audit task e606cca6). Stored as TEXT
    # so a long system prompt + placeholder tokens fit without a
    # VARCHAR cap. The route layer fills the placeholders before
    # sending the rendered prompt upstream.
    prompt_template = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    # Dynamic-context controls (audit task e606cca6 AC1): how much app context
    # the model receives (context_type), whether it reasons dynamically vs a
    # fixed template (dynamic_response), and an optional token cap
    # (token_limit; NULL/0 = "no limit", per the user's "no token restriction").
    context_type = Column(String(32), nullable=False, server_default="tasks", default="tasks")
    dynamic_response = Column(Boolean, nullable=False, server_default="1", default=True)
    token_limit = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())