from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum
from sqlalchemy.sql import func
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    PENDING = "pending"
    APPROVED = "approved"

class UserPermission(str, enum.Enum):
    READ_ONLY = "read-only"
    EDITOR = "editor"
    ADMIN = "admin"

class OAuthUser(Base):
    __tablename__ = "oauth_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    role = Column(SAEnum(UserRole), default=UserRole.PENDING, nullable=False)
    permissions = Column(SAEnum(UserPermission), default=UserPermission.READ_ONLY, nullable=False)
    status = Column(String, default="pending", nullable=False)  # pending, approved
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())