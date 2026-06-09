"""/api/documents/* — IdentityDocument CRUD (task 32ade384).

Stores official identity-document details extracted from the Emirates ID
Document-Information table (attachment #28). ``accompanied_by`` is
optional because it was cut off in the source image.
"""
from typing import List, Optional

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_required_user_id
from app.middleware import handle_errors
from app.models.identity_document import IdentityDocument


router = APIRouter()


class IdentityDocumentCreate(BaseModel):
    emirates_id_number: Optional[str] = Field(default=None, max_length=32)
    file_number: Optional[str] = Field(default=None, max_length=64)
    passport_number: Optional[str] = Field(default=None, max_length=32)
    full_name: Optional[str] = Field(default=None, max_length=255)
    profession: Optional[str] = Field(default=None, max_length=128)
    sponsor: Optional[str] = Field(default=None, max_length=255)
    issue_date: Optional[str] = Field(default=None, max_length=32)
    expiry_date: Optional[str] = Field(default=None, max_length=32)
    issue_place: Optional[str] = Field(default=None, max_length=64)
    # Cut off in the source image → optional.
    accompanied_by: Optional[str] = Field(default=None, max_length=255)


class IdentityDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int]
    emirates_id_number: Optional[str]
    file_number: Optional[str]
    passport_number: Optional[str]
    full_name: Optional[str]
    profession: Optional[str]
    sponsor: Optional[str]
    issue_date: Optional[str]
    expiry_date: Optional[str]
    issue_place: Optional[str]
    accompanied_by: Optional[str]


@router.post(
    "/api/documents/identity",
    response_model=IdentityDocumentResponse,
    status_code=201,
)
@handle_errors
async def create_identity_document(
    payload: IdentityDocumentCreate = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    doc = IdentityDocument(
        user_id=user_id,
        emirates_id_number=payload.emirates_id_number,
        file_number=payload.file_number,
        passport_number=payload.passport_number,
        full_name=payload.full_name,
        profession=payload.profession,
        sponsor=payload.sponsor,
        issue_date=payload.issue_date,
        expiry_date=payload.expiry_date,
        issue_place=payload.issue_place,
        accompanied_by=payload.accompanied_by,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


@router.get(
    "/api/documents/identity",
    response_model=List[IdentityDocumentResponse],
)
@handle_errors
async def list_identity_documents(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    result = await db.execute(
        select(IdentityDocument).where(IdentityDocument.user_id == user_id)
    )
    return list(result.scalars().all())
