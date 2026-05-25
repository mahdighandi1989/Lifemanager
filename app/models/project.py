from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    # nullable: anonymous project creation is allowed today; routes populate
    # this from the authenticated principal once auth is wired in.
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    # NOTE: 'status' is intentionally NOT a column. The ProjectCreate schema
    # validates the value, the route stores it on the instance after
    # construction (route uses setattr(); see _serialize for the default), and
    # the response carries it through. Persisting it as a column would
    # break deploys whose existing 'projects' table predates this field
    # (Base.metadata.create_all does NOT add columns to existing tables).
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())