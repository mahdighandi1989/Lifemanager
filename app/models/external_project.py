"""ExternalProject — one tracked external PM-system project (audit task d2146781).

Each row represents a project the user is mirroring from a third-party
PM tool (Jira, Linear, Asana, GitHub Projects, ...). The ``api_key``
column holds an encrypted token (encryption is the route layer's job
when the crypt_service lands; the column accepts the raw blob now so
the schema is migration-ready).
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class ExternalProject(Base):
    __tablename__ = "external_projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    name = Column(String(255), nullable=False)
    provider = Column(String(64), nullable=False)  # jira / linear / asana / github
    external_id = Column(String(255), nullable=True)
    base_url = Column(String(512), nullable=True)
    api_key = Column(Text, nullable=True)  # encrypted at rest
    workspace_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
