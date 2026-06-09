"""Pydantic schemas for UAE vehicle documents (task 32ade384).

Two distinct cards, kept as two schemas on purpose:

* :class:`VehicleLicenseUAE` — step 10 (attachment #36): the *ownership /
  insurance* side (رخصة مركبة). Carries Arabic insurer text that must
  survive round-tripping, and three dates that are parsed to ``date``.
* :class:`VehicleTechnicalInfo` — step 11 (attachment #37): the
  *technical specs* side (engine / chassis / weights). Deliberately holds
  no ownership or insurance data.

Both face dates are already ISO (``2027-05-08``); a validator also accepts
``date`` instances.
"""
from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


def _coerce_iso_date(value: str | date | None) -> Optional[date]:
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return datetime.strptime(str(value).strip(), "%Y-%m-%d").date()


class VehicleLicenseUAE(BaseModel):
    """Ownership + insurance side of the UAE vehicle licence (#36)."""

    model_config = ConfigDict(from_attributes=True)

    traffic_plate_no: str = Field(..., max_length=64, examples=["88659 — I"])
    place_of_issue: str = Field(..., max_length=128, examples=["Dubai"])
    tc_no: str = Field(..., max_length=32, examples=["11875829"])
    owner_name: str = Field(..., max_length=255, examples=["MOHAMMAD MEHDI MAHMOUD GHANDI"])
    nationality: str = Field(..., max_length=128, examples=["Iran"])
    registration_date: date = Field(..., examples=["2007-10-25"])
    expiry_date: date = Field(..., examples=["2027-05-08"])
    insurance_expiry_date: date = Field(..., examples=["2027-06-08"])
    insurer_name: str = Field(..., max_length=255, examples=["سكون تكافل (مساهمة عامة)"])
    policy_no: str = Field(..., max_length=64, examples=["06TP782104"])
    insurance_type: str = Field(..., max_length=128, examples=["ضد الغير"])

    @field_validator(
        "registration_date", "expiry_date", "insurance_expiry_date", mode="before"
    )
    @classmethod
    def _parse_iso(cls, v):
        if isinstance(v, str):
            return _coerce_iso_date(v)
        return v


class VehicleTechnicalInfo(BaseModel):
    """Technical-specs side of the vehicle card (#37). No ownership data."""

    model_config = ConfigDict(from_attributes=True)

    model_year: int = Field(..., examples=[2008])
    num_passengers: int = Field(..., examples=[8])
    origin: str = Field(..., max_length=128, examples=["Indonesia"])
    color: str = Field(..., max_length=64, examples=["ذهبي"])
    vehicle_type: str = Field(..., max_length=128, examples=["TOYOTA FORTUNER"])
    gross_vehicle_weight: int = Field(..., examples=[2600])
    empty_weight: int = Field(..., examples=[1800])
    engine_number: str = Field(..., max_length=64, examples=["2TR6430116"])
    chassis_number: str = Field(..., max_length=64, examples=["MHFZX69G187002434"])
    plate_number: str = Field(..., max_length=64, examples=["DUBAI — 88659"])
    expiry_date: date = Field(..., examples=["2027-05-08"])

    @field_validator("expiry_date", mode="before")
    @classmethod
    def _parse_iso(cls, v):
        if isinstance(v, str):
            return _coerce_iso_date(v)
        return v
