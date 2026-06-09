"""/api/documents/uae-license/* — UAE driving licence (task 32ade384, 8/9).

``POST /api/documents/uae-license/extract`` accepts either the structured
licence fields or the verbatim card text, runs
:func:`extract_uae_license`, persists the result, and returns it. Posting
the page-2 payload (traffic code / permitted vehicles) for a licence whose
face was already stored enriches the same row (idempotent on licence
number) so both pages live together. Arabic permitted-vehicle text is
stored in a ``Text`` column and round-trips unchanged.
"""
from datetime import date
from typing import List, Optional, Union

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies.auth import get_required_user_id
from app.middleware import handle_errors
from app.models.uae_license import UAEDrivingLicenseRecord
from app.schemas.uae_license import UAEDrivingLicense
from app.services.uae_license_extraction_service import extract_uae_license


router = APIRouter()


class UAELicenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    license_no: str
    name_en: Optional[str] = None
    name_ar: Optional[str] = None
    nationality: Optional[str] = None
    date_of_birth: Optional[date] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    place_of_issue: Optional[str] = None
    issuing_authority: Optional[str] = None
    traffic_code_no: Optional[str] = None
    permitted_vehicles: Optional[str] = None


@router.post(
    "/api/documents/uae-license/extract",
    response_model=UAELicenseResponse,
    status_code=200,
)
@handle_errors
async def extract_and_store_uae_license(
    # Either structured fields or {"text": "License No. 1608806 | ..."}.
    payload: Union[dict, str] = Body(...),
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    source: Union[str, dict]
    if isinstance(payload, dict) and "text" in payload and len(payload) == 1:
        source = payload["text"]
    else:
        source = payload
    parsed: UAEDrivingLicense = extract_uae_license(source)

    existing = (
        await db.execute(
            select(UAEDrivingLicenseRecord).where(
                (UAEDrivingLicenseRecord.user_id == user_id)
                & (UAEDrivingLicenseRecord.license_no == parsed.license_no)
            )
        )
    ).scalar_one_or_none()

    if existing is not None:
        record = existing
        record.name_en = parsed.name_en or record.name_en
        record.name_ar = parsed.name_ar or record.name_ar
        record.nationality = parsed.nationality or record.nationality
        record.date_of_birth = parsed.date_of_birth or record.date_of_birth
        record.issue_date = parsed.issue_date or record.issue_date
        record.expiry_date = parsed.expiry_date or record.expiry_date
        record.place_of_issue = parsed.place_of_issue or record.place_of_issue
        record.issuing_authority = parsed.issuing_authority or record.issuing_authority
        record.traffic_code_no = parsed.traffic_code_no or record.traffic_code_no
        record.permitted_vehicles = (
            parsed.permitted_vehicles or record.permitted_vehicles
        )
    else:
        record = UAEDrivingLicenseRecord(
            user_id=user_id,
            license_no=parsed.license_no,
            name_en=parsed.name_en,
            name_ar=parsed.name_ar,
            nationality=parsed.nationality,
            date_of_birth=parsed.date_of_birth,
            issue_date=parsed.issue_date,
            expiry_date=parsed.expiry_date,
            place_of_issue=parsed.place_of_issue,
            issuing_authority=parsed.issuing_authority,
            traffic_code_no=parsed.traffic_code_no,
            permitted_vehicles=parsed.permitted_vehicles,
        )
        db.add(record)

    await db.commit()
    await db.refresh(record)
    return record


@router.get(
    "/api/documents/uae-license",
    response_model=List[UAELicenseResponse],
)
@handle_errors
async def list_uae_licenses(
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_required_user_id),
):
    result = await db.execute(
        select(UAEDrivingLicenseRecord).where(
            UAEDrivingLicenseRecord.user_id == user_id
        )
    )
    return list(result.scalars().all())
