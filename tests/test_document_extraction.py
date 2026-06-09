"""Coverage for EducationDocumentExtraction (task 32ade384, step 5).

Attachment #31 is the only source carrying a partial address plus the
Cairo legalization stamp and three official document numbers. The schema
must preserve all of that verbatim (Arabic included) when built with its
defaults, and must document the out-of-scope contact/financial fields.
"""
from __future__ import annotations

from app.schemas.document_extraction import EducationDocumentExtraction


def test_defaults_capture_attachment_31_verbatim():
    doc = EducationDocumentExtraction()

    # The address is the unique payload of this attachment.
    assert doc.address is not None
    assert "3,Mirzapour Pass" in doc.address
    assert "Aghdasieh-Artesh Highway" in doc.address
    assert "Niavak" in doc.address

    # Three official document numbers (Latin + Persian-digit) preserved.
    assert doc.official_document_numbers == ["J.S.275", "202828", "۴۲۲۶۰۲"]

    # Three dates across Gregorian + Jalali calendars.
    assert "August 2, 2022" in doc.dates
    assert "09 AUG 2022" in doc.dates
    assert "۱۳۹۲/۱۱/۳۰" in doc.dates

    # Stamps / officer preserved.
    assert "HASAN YOSEFI" in doc.translation_certification
    assert doc.legalization_office == "LEGALIZATION OF CAIRO"
    assert doc.consular_fee.startswith("مبلغ")


def test_out_of_scope_fields_documented():
    doc = EducationDocumentExtraction()
    assert "contact_info" in doc.excluded_fields
    assert "financial_info" in doc.excluded_fields


def test_overrides_are_accepted():
    doc = EducationDocumentExtraction(address="elsewhere", dates=["2020-01-01"])
    assert doc.address == "elsewhere"
    assert doc.dates == ["2020-01-01"]
