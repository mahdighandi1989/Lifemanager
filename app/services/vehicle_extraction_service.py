"""Extract UAE vehicle-document fields from card text (task 32ade384).

Two independent extractors, one per card, so the ownership/insurance side
(#36) and the technical-specs side (#37) never bleed into each other:

* :func:`extract_vehicle_license` → :class:`VehicleLicenseUAE`
* :func:`extract_vehicle_info`    → :class:`VehicleTechnicalInfo`

Each accepts a structured mapping (validated directly) or the pipe /
newline delimited OCR string from the task prompt. Arabic insurer / colour
text is preserved verbatim. Only the standard-library ``re`` is used.
"""
from __future__ import annotations

import re
from typing import Mapping, Union

from app.schemas.vehicle import VehicleLicenseUAE, VehicleTechnicalInfo


def _grab(text: str, pattern: str) -> str | None:
    m = re.search(pattern, text)
    return m.group(1).strip() if m else None


def extract_vehicle_license(
    source: Union[str, Mapping[str, object]],
) -> VehicleLicenseUAE:
    """Map the ownership/insurance card (#36) to ``VehicleLicenseUAE``."""
    if isinstance(source, Mapping):
        return VehicleLicenseUAE.model_validate(dict(source))

    text = str(source)
    return VehicleLicenseUAE(
        traffic_plate_no=_grab(text, r"Traffic Plate No\.?:\s*([^|]+)") or "",
        place_of_issue=_grab(text, r"Place of Issue:\s*([^|]+)") or "",
        tc_no=_grab(text, r"T\.C\. No\.?:\s*([0-9]+)") or "",
        owner_name=_grab(text, r"Owner:\s*([^|]+)") or "",
        nationality=_grab(text, r"Nationality:\s*([^|]+)") or "",
        registration_date=_grab(text, r"Reg\. Date:\s*(\d{4}-\d{2}-\d{2})") or "",
        expiry_date=_grab(text, r"Exp\. Date:\s*(\d{4}-\d{2}-\d{2})") or "",
        insurance_expiry_date=_grab(text, r"Ins\. Exp\.?:\s*(\d{4}-\d{2}-\d{2})") or "",
        insurer_name=_grab(text, r"مؤمنة لدى:\s*([^|]+)") or "",
        policy_no=_grab(text, r"Policy No\.?:\s*(\S+)") or "",
        insurance_type=_grab(text, r"نوع التأمين:\s*([^|]+)") or "",
    )


def extract_vehicle_info(
    source: Union[str, Mapping[str, object]],
) -> VehicleTechnicalInfo:
    """Map the technical-specs card (#37) to ``VehicleTechnicalInfo``."""
    if isinstance(source, Mapping):
        return VehicleTechnicalInfo.model_validate(dict(source))

    text = str(source)
    return VehicleTechnicalInfo(
        model_year=int(_grab(text, r"Model:\s*(\d{4})") or 0),
        num_passengers=int(_grab(text, r"Num\. of Pass\.?:\s*(\d+)") or 0),
        origin=_grab(text, r"Origin:\s*([^|]+)") or "",
        color=_grab(text, r"لون المركبة:\s*([^|]+)") or "",
        vehicle_type=_grab(text, r"Veh\. Type:\s*([^|]+)") or "",
        gross_vehicle_weight=int(_grab(text, r"G\.V\.W\.?:\s*(\d+)") or 0),
        empty_weight=int(_grab(text, r"Empty Weight:\s*(\d+)") or 0),
        engine_number=_grab(text, r"Eng\. No\.?:\s*(\S+)") or "",
        chassis_number=_grab(text, r"Chassis No\.?:\s*(\S+)") or "",
        plate_number=_grab(text, r"Plate number:\s*([^|]+)") or "",
        expiry_date=_grab(text, r"Expiry date:\s*(\d{4}-\d{2}-\d{2})") or "",
    )
