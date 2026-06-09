"""/api/* vehicle-document extraction (task 32ade384, steps 10/11).

Two stateless extraction endpoints, one per card:

* ``POST /api/documents/vehicle-license/extract`` → ownership + insurance
  side (#36), returns :class:`VehicleLicenseUAE`.
* ``POST /api/vehicles/extract`` → technical-specs side (#37), returns
  :class:`VehicleTechnicalInfo`.

Each accepts the structured fields or ``{"text": "..."}`` with the
verbatim card text. They only parse-and-return (no storage): the value is
the structured, validated, Unicode-safe extraction.
"""
from typing import Union

from fastapi import APIRouter, Body, Depends

from app.dependencies.auth import get_required_user_id
from app.middleware import handle_errors
from app.schemas.vehicle import VehicleLicenseUAE, VehicleTechnicalInfo
from app.services.vehicle_extraction_service import (
    extract_vehicle_info,
    extract_vehicle_license,
)


router = APIRouter()


def _source(payload: Union[dict, str]) -> Union[str, dict]:
    if isinstance(payload, dict) and "text" in payload and len(payload) == 1:
        return payload["text"]
    return payload


@router.post(
    "/api/documents/vehicle-license/extract",
    response_model=VehicleLicenseUAE,
    status_code=200,
)
@handle_errors
async def extract_vehicle_license_endpoint(
    payload: Union[dict, str] = Body(...),
    user_id: int = Depends(get_required_user_id),
):
    return extract_vehicle_license(_source(payload))


@router.post(
    "/api/vehicles/extract",
    response_model=VehicleTechnicalInfo,
    status_code=200,
)
@handle_errors
async def extract_vehicle_info_endpoint(
    payload: Union[dict, str] = Body(...),
    user_id: int = Depends(get_required_user_id),
):
    return extract_vehicle_info(_source(payload))
