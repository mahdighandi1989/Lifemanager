"""UserLocation — a single geolocation ping (audit task 2165524b).

The browser hands over lat/lng via the Geolocation API and the
frontend POSTs them here. Each row is a point-in-time observation;
the history endpoint serves them back per-user.
"""
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.sql import func

from app.database import Base


class UserLocation(Base):
    __tablename__ = "user_locations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracy_m = Column(Float, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
