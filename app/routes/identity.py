"""/api/identity/* — Emirates ID card extraction (task 32ade384).

Accepts the structured fields read off an Emirates ID card face
(attachment #29) and persists them into the shared ``identity_documents``
table (the card and the Document-Details table describe the same
physical document, so they share storage).

Feature flag: ``FEATURE_IDENTITY_DOCS_ENABLED`` (default false, see
.env.example / app.config) documents the rollout state of this surface.
The route stays mounted so the contract is testable; the flag is exposed
for callers/operators that want to gate it in their own UI.
"""
from datetime import date
from typing import Optional

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies.auth import get_required_user_id
from app.middleware import handle_errors
from app.models.identity_document import IdentityDocument
from app.schemas.identity import EmiratesIdExtraction, parse_card_date


router = APIRouter()


class EmiratesIdResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    id_number: str
    full_name: str
    nationality: Optional[str] = None
    sex: Optional[str] = None
    date_of_birth: Optional[date] = None
    expiry_date: Optional[date] = None
    issued_by: Optional[str] = None
    requested_at: Optional[str] = None
    feature_enabled: bool = False


@router.post(
    "/api/identity/emirates-id",
    response_model=EmiratesIdResponse,
    status_code=201,
)
@handle_errors
async def create_emirates_id(
    payload: EmiratesIdExtraction = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    doc = IdentityDocument(
        user_id=user_id,
        emirates_id_number=payload.id_number,
        full_name=payload.full_name,
        # ملیت ستونِ خودش را دارد؛ issue_place دیگر دوپهلو نیست (قبلاً هم
        # «امارتِ صدور» و هم «ملیت» در همین ستون می‌نشست و مصرف‌کننده
        # نمی‌توانست تشخیص بدهد کدام است).
        nationality=payload.nationality,
        date_of_birth=payload.date_of_birth.isoformat() if payload.date_of_birth else None,
        sex=payload.sex,
        expiry_date=payload.expiry_date.isoformat() if payload.expiry_date else None,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return EmiratesIdResponse(
        id=doc.id,
        id_number=payload.id_number,
        full_name=payload.full_name,
        nationality=payload.nationality,
        sex=payload.sex,
        date_of_birth=payload.date_of_birth,
        expiry_date=payload.expiry_date,
        issued_by=payload.issued_by,
        requested_at=payload.requested_at,
        feature_enabled=getattr(settings, "FEATURE_IDENTITY_DOCS_ENABLED", False),
    )


__all__ = ["router", "parse_card_date"]
