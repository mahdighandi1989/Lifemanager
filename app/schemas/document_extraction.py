"""Pydantic schemas for official-document extraction (task 32ade384).

Step 5 (attachment #31): the certified English translation of the law
degree carries data that no other attachment did — a partial **address**
in the footer, three official document numbers, the Cairo legalization
stamp, and a set of dates in mixed Gregorian / Jalali form.

These fields are captured verbatim (no normalisation) because their value
is forensic: they tie the translated degree to the physical stamps on the
page. Contact / financial fields are explicitly out of scope and are NOT
modelled here (see :pyattr:`EducationDocumentExtraction.excluded_fields`).
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class EducationDocumentExtraction(BaseModel):
    """Stamps / address / document numbers from attachment #31.

    Every field defaults to the verbatim value read off the document so an
    instance can be constructed with no arguments and still reproduce the
    extracted data (used by the verify test). Callers may override any
    field when extracting a different document.
    """

    model_config = ConfigDict(from_attributes=True)

    # The unique payload of this attachment — a partial address present in
    # the English translation's footer and nowhere else in the set.
    address: Optional[str] = Field(
        default=(
            "3,Mirzapour Pass, Unit 4th, On the Corner of 2nd Derband St. "
            "Aghdasieh-Artesh Highway, Niavak"
        ),
        max_length=512,
    )
    translation_certification: str = Field(
        default=(
            "True Translation Certified August 2, 2022. J.S.275. "
            "HASAN YOSEFI LEGALIZATION OFFICER"
        ),
        max_length=512,
    )
    legalization_office: str = Field(default="LEGALIZATION OF CAIRO", max_length=128)
    consular_fee: str = Field(
        default="مبلغ ۱۵۰،۰۰۰ ریال بابت تعرفه خدمات کنسولی", max_length=256
    )
    official_document_numbers: List[str] = Field(
        default_factory=lambda: ["J.S.275", "202828", "۴۲۲۶۰۲"]
    )
    dates: List[str] = Field(
        default_factory=lambda: ["August 2, 2022", "09 AUG 2022", "۱۳۹۲/۱۱/۳۰"]
    )

    # Documented scope boundary — contact / financial data is not extracted.
    excluded_fields: List[str] = Field(
        default_factory=lambda: ["contact_info", "financial_info"]
    )
