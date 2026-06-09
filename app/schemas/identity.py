"""Pydantic schemas for identity-document extraction (task 32ade384).

Covers the Emirates ID card extraction (attachment #29). The card shows
a precise date of birth (``08 Mar 1989``), sex (``M``) and nationality
(``Iran``) that the Document-Details table (#28) did not.

The card prints dates in ``DD Mon YYYY`` form (e.g. ``08 Mar 1989``,
``14 Aug 2027``); :func:`parse_card_date` normalises that to a
``datetime.date``.
"""
from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# Format used on the Emirates ID card face, e.g. "08 Mar 1989".
_CARD_DATE_FORMAT = "%d %b %Y"


def parse_card_date(value: str | date | None) -> Optional[date]:
    """Parse an Emirates-ID-style ``DD Mon YYYY`` string into a ``date``.

    Accepts an already-parsed ``date``/``datetime`` (returned as a date),
    a ``None`` (returned as ``None``), or a string such as ``"08 Mar 1989"``
    / ``"14 Aug 2027"``. Whitespace is tolerated. Raises ``ValueError`` on
    an unparseable non-empty string so bad input surfaces loudly.
    """
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return datetime.strptime(str(value).strip(), _CARD_DATE_FORMAT).date()


class EmiratesIdExtraction(BaseModel):
    """Structured fields pulled from an Emirates ID card face."""

    model_config = ConfigDict(from_attributes=True)

    full_name: str = Field(..., min_length=1, max_length=255)
    id_number: str = Field(..., min_length=1, max_length=32)
    nationality: Optional[str] = Field(default=None, max_length=128)
    sex: Optional[str] = Field(default=None, max_length=8)
    date_of_birth: Optional[date] = None
    expiry_date: Optional[date] = None
    issued_by: Optional[str] = Field(default=None, max_length=255)
    requested_at: Optional[str] = Field(default=None, max_length=64)

    @field_validator("date_of_birth", "expiry_date", mode="before")
    @classmethod
    def _coerce_card_date(cls, v):
        # Allow callers to pass the verbatim "08 Mar 1989" card strings.
        if isinstance(v, str):
            return parse_card_date(v)
        return v
