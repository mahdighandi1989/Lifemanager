"""Pydantic schemas for the UAE (RTA) driving licence (task 32ade384).

Step 8 (attachment #34) is the licence *face* — identity + validity
dates. Step 9 (attachment #35) is the *back* — the traffic code and the
permitted-vehicle class (which carries Arabic text that must survive
round-tripping). Both pages describe one licence, so a single schema
models them with the page-2 fields optional.

The face prints dates already in ISO form (``1989-03-08``); a validator
still accepts ``date`` instances so the schema composes cleanly.
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


class UAEDrivingLicense(BaseModel):
    """Licence face (page 1) plus optional back-of-card (page 2) fields."""

    model_config = ConfigDict(from_attributes=True)

    # ── Page 1 — licence face ────────────────────────────────────────
    license_no: str = Field(..., max_length=32, examples=["1608806"])
    name_en: str = Field(..., max_length=255, examples=["MOHAMMAD MEHDI MAHMOUD GHANDI"])
    name_ar: Optional[str] = Field(default=None, max_length=255, examples=["محمد مهدی محمود قندی"])
    nationality: Optional[str] = Field(default=None, max_length=128, examples=["Iran"])
    # Optional so a page-2-only payload (back of card, attachment #35) can be
    # parsed for enrichment without re-supplying the face dates.
    date_of_birth: Optional[date] = Field(default=None, examples=["1989-03-08"])
    issue_date: Optional[date] = Field(default=None, examples=["2010-08-11"])
    expiry_date: Optional[date] = Field(default=None, examples=["2030-08-22"])
    place_of_issue: Optional[str] = Field(default=None, max_length=128, examples=["Dubai"])
    issuing_authority: str = Field(default="RTA", max_length=64)

    # ── Page 2 — back of card (optional; attachment #35) ─────────────
    traffic_code_no: Optional[str] = Field(default=None, max_length=32, examples=["11875829"])
    permitted_vehicles: Optional[str] = Field(
        default=None,
        max_length=255,
        examples=["مركبة خفيفة أوتوماتيك / Light Vehicle Automatic"],
    )

    @field_validator("date_of_birth", "issue_date", "expiry_date", mode="before")
    @classmethod
    def _parse_iso(cls, v):
        if isinstance(v, str):
            return _coerce_iso_date(v)
        return v
