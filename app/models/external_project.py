"""ExternalProject — one tracked external PM-system project (audit task d2146781).

Each row represents a project the user is mirroring from a third-party
PM tool (Jira, Linear, Asana, GitHub Projects, ...). The ``api_key``
column holds an encrypted token (encryption is the route layer's job
when the crypt_service lands; the column accepts the raw blob now so
the schema is migration-ready).
"""
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
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


class ExternalProjectConnection(Base):
    """A configured connection to an external PM system (audit task d2146781
    AC 1). The oversight layer manages these — one per external system the
    user wants this app to reach into and oversee.
    """

    __tablename__ = "external_project_connections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    name = Column(String(255), nullable=False)
    base_url = Column(String(512), nullable=True)
    api_key_encrypted = Column(Text, nullable=True)
    connection_type = Column(String(64), nullable=False, default="generic")
    sync_frequency = Column(String(32), nullable=False, default="manual")
    is_active = Column(Boolean, nullable=False, default=True)
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
