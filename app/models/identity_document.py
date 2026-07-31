"""IdentityDocument — official identity document details (task 32ade384).

Backs the "Document Details" surface extracted from the Emirates ID
Document-Information table (attachment #28) and the Emirates ID card
front (attachment #29). One row per document; owned by a single user.

``accompanied_by`` is nullable on purpose: in the source screenshot
that field was cut off at the bottom of the image, so it may be unknown
even when every other field is present.
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class IdentityDocument(Base):
    __tablename__ = "identity_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)

    emirates_id_number = Column(String(32), nullable=True)   # 784198991846589
    file_number = Column(String(64), nullable=True)          # 201/2008/2626430
    passport_number = Column(String(32), nullable=True)      # I96955239
    full_name = Column(String(255), nullable=True)           # MOHAMMAD MEHDI MAHMOUD GHANDI
    profession = Column(String(128), nullable=True)          # OFFICE CLERK
    sponsor = Column(String(255), nullable=True)             # BANK SADERAT IRAN (MAIN BRANCH)
    issue_date = Column(String(32), nullable=True)           # "15 Aug 2025" (as shown)
    expiry_date = Column(String(32), nullable=True)          # "14 Aug 2027" (as shown)
    issue_place = Column(String(64), nullable=True)          # DUBAI
    # Cut off at the bottom of the source image → may be unknown.
    accompanied_by = Column(String(255), nullable=True)
    # (۲۰۲۶-۰۷-۳۱) این سه فیلد را اسکیما از اول می‌گرفت و مسیر ثبت **دور
    # می‌ریخت** — یعنی تاریخ تولدِ واردشدهٔ مالک هرگز ذخیره نمی‌شد و هیچ‌جای
    # برنامه سن را نمی‌دانست. verbatim ذخیره می‌شوند (همان قاعدهٔ issue_date).
    date_of_birth = Column(String(32), nullable=True)        # "08 Mar 1989" (as shown)
    sex = Column(String(16), nullable=True)                  # M / F
    nationality = Column(String(64), nullable=True)          # IRAN

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
