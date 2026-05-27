from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.orm import validates
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    # Profile fields. Sanitised at the route layer with bleach.clean
    # (see app/routes/users.py::_sanitize_html) AND scrubbed again at
    # the ORM boundary by the @validates hooks below — defense in
    # depth so even a future route that forgets to sanitise can't
    # land an XSS payload in the column.
    bio = Column(Text, nullable=True)
    display_name = Column(String(120), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    @validates("bio", "display_name")
    def _scrub_html(self, key, value):
        """Strip HTML/JS payloads from user-controlled profile text.

        Belt-and-suspenders to the route-layer sanitiser. Runs every
        time `bio` or `display_name` is assigned (insert OR update),
        regardless of which code path produced the value. We import
        `_sanitize_html` lazily to avoid a model→route import cycle.
        """
        if value is None:
            return None
        from app.routes.users import _sanitize_html
        return _sanitize_html(value)