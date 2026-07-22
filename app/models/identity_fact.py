"""IdentityFact — reusable, encrypted personal facts the system asks for ONCE
and reuses to derive locked-file passwords (owner: «سه رقمِ آخرِ کارت + رقمِ
تولد … را ازم بپرس، نگه دار، و همیشه فایل‌ها را باز کن»).

Values are Fernet-encrypted at rest (crypt_service — the same at-rest encryption
as API keys/credentials); the client only ever sees ``label`` + ``has_value``,
never the plaintext. ``fact_key`` is a canonical slug (card_last3 / dob /
national_id …). One row per (user_id, fact_key).
"""
from sqlalchemy import Column, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.sql import func

from app.database import Base


class IdentityFact(Base):
    __tablename__ = "identity_facts"
    __table_args__ = (
        UniqueConstraint("user_id", "fact_key", name="uq_identity_fact_user_key"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)
    fact_key = Column(String(64), nullable=False, index=True)  # card_last3 / dob / national_id …
    label = Column(String(255), nullable=True)                 # Persian label shown to the owner
    value_enc = Column(Text, nullable=False)                   # Fernet ciphertext (never returned raw)
    kind = Column(String(32), nullable=True)                   # digits | date | text
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
