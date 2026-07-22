"""Reusable encrypted identity facts (card_last3, dob, national_id, …).

Asked once, stored encrypted, reused forever to derive locked-file passwords.
Mirror of credentials.py but with label/kind metadata and a canonical key
vocabulary. Values NEVER leave the server in plaintext — the API exposes only
``label`` + ``has_value``.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

# Canonical fact keys + a Persian label + a kind hint. The recipe extractor maps
# freeform instructions onto these; anything else is stored as custom_<slug>.
CANONICAL: Dict[str, Dict[str, str]] = {
    "card_last3": {"label": "سه رقمِ آخرِ کارت", "kind": "digits"},
    "card_last4": {"label": "چهار رقمِ آخرِ کارت", "kind": "digits"},
    "account_last4": {"label": "چهار رقمِ آخرِ حساب", "kind": "digits"},
    "dob": {"label": "تاریخِ تولد", "kind": "date"},
    "dob_year": {"label": "سالِ تولد", "kind": "digits"},
    "national_id": {"label": "کدِ ملی / شمارهٔ شناسایی", "kind": "digits"},
    "passport_last4": {"label": "چهار رقمِ آخرِ پاسپورت", "kind": "digits"},
    "postal_code": {"label": "کدِ پستی", "kind": "digits"},
    "phone_last4": {"label": "چهار رقمِ آخرِ تلفن", "kind": "digits"},
    "mother_name": {"label": "نامِ مادر", "kind": "text"},
    "customer_id": {"label": "شمارهٔ مشتری", "kind": "digits"},
}


def _scope(col, uid: int):
    return or_(col == uid, col.is_(None)) if uid == 0 else (col == uid)


def label_for(fact_key: str) -> str:
    return CANONICAL.get(fact_key, {}).get("label") or fact_key


def kind_for(fact_key: str) -> str:
    return CANONICAL.get(fact_key, {}).get("kind") or "text"


async def set_fact(
    db: AsyncSession,
    *,
    fact_key: str,
    value: str,
    user_id: int = 0,
    label: Optional[str] = None,
    kind: Optional[str] = None,
) -> None:
    """Upsert one encrypted fact. Never returns the plaintext."""
    from app.models.identity_fact import IdentityFact
    from app.services.crypt_service import encrypt_data

    fact_key = (fact_key or "").strip()[:64]
    if not fact_key or value in (None, ""):
        return
    enc = encrypt_data(str(value).strip())
    row = (
        await db.execute(
            select(IdentityFact).where(_scope(IdentityFact.user_id, user_id), IdentityFact.fact_key == fact_key)
        )
    ).scalars().first()
    if row is None:
        db.add(
            IdentityFact(
                user_id=user_id,
                fact_key=fact_key,
                label=label or label_for(fact_key),
                value_enc=enc,
                kind=kind or kind_for(fact_key),
            )
        )
    else:
        row.value_enc = enc
        if label:
            row.label = label
    await db.commit()


async def get_fact(db: AsyncSession, *, fact_key: str, user_id: int = 0) -> Optional[str]:
    """Decrypted value or None. Stamps last_used_at. Never raises."""
    try:
        from app.models.identity_fact import IdentityFact
        from app.services.crypt_service import decrypt_data

        row = (
            await db.execute(
                select(IdentityFact).where(_scope(IdentityFact.user_id, user_id), IdentityFact.fact_key == fact_key)
            )
        ).scalars().first()
        if row is None or not row.value_enc:
            return None
        row.last_used_at = datetime.now(timezone.utc)
        return decrypt_data(row.value_enc)
    except Exception as exc:
        logger.debug("identity fact read failed (%s): %r", fact_key, exc)
        return None


async def get_many(db: AsyncSession, *, keys: List[str], user_id: int = 0) -> Dict[str, str]:
    """{fact_key: value} for the keys that exist (missing keys omitted)."""
    out: Dict[str, str] = {}
    for k in keys:
        v = await get_fact(db, fact_key=k, user_id=user_id)
        if v:
            out[k] = v
    return out


async def list_facts(db: AsyncSession, *, user_id: int = 0) -> List[Dict[str, Any]]:
    """Masked listing — label + has_value only, NEVER the plaintext."""
    from app.models.identity_fact import IdentityFact

    rows = (
        await db.execute(select(IdentityFact).where(_scope(IdentityFact.user_id, user_id)))
    ).scalars().all()
    return [
        {"fact_key": r.fact_key, "label": r.label or label_for(r.fact_key), "kind": r.kind, "has_value": bool(r.value_enc)}
        for r in rows
    ]
