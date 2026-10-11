"""«رکوردهای برنامه» — the per-user record store of in-repo single-page apps.

The first tenant is «معماری یادگیری عمیق و کارخانه معرفت‌شناسی»
(`/apps/learning-architecture`): its records (workshops, cases, farm nodes,
backtest runs…) are JSON documents with a string id and a type. The previous
version of that page ran as an installed mini-app inside a sandboxed iframe
whose only storage was a 20 KB localStorage shim — far too small — so its data
did not survive. This table is that app's real storage, scoped by user.
"""
from sqlalchemy import Column, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.sql import func

from app.database import Base


class AppRecord(Base):
    __tablename__ = "app_records"
    __table_args__ = (UniqueConstraint("user_id", "app", "rec_id", name="uq_app_records_user_app_rec"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, index=True, nullable=True)
    #: which in-repo app owns the record (e.g. "learning-architecture")
    app = Column(String(64), index=True, nullable=False)
    rec_id = Column(String(128), nullable=False)
    rtype = Column(String(40), default="")
    #: the record itself, as JSON text (the app's own document)
    data = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
