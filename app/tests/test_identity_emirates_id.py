"""Unit coverage for the Emirates ID card extraction (task 32ade384).

Pure-schema tests (no DB) for the parser + EmiratesIdExtraction model
against the verbatim data on the user's card (attachment #29).
"""
from __future__ import annotations

from datetime import date

from app.schemas.identity import EmiratesIdExtraction, parse_card_date


def test_date_parser():
    """The card prints dates as 'DD Mon YYYY' — parse to real date objects."""
    assert parse_card_date("08 Mar 1989") == date(1989, 3, 8)
    assert parse_card_date("14 Aug 2027") == date(2027, 8, 14)
    # Tolerates surrounding whitespace.
    assert parse_card_date("  15 Aug 2025 ") == date(2025, 8, 15)
    # Passthrough for None / already-parsed date.
    assert parse_card_date(None) is None
    assert parse_card_date(date(2030, 8, 22)) == date(2030, 8, 22)


def test_parse_user_sample():
    """The verbatim card data parses into the expected structured fields."""
    extraction = EmiratesIdExtraction(
        full_name="Mohammad Mehdi Mahmoud Ghandi",
        id_number="784198991846589",
        nationality="Iran Islamic Republic of",
        sex="M",
        date_of_birth="08 Mar 1989",
        expiry_date="14 Aug 2027",
        issued_by=(
            "Federal Authority for Identity, Citizenship, "
            "Customs & Port Security"
        ),
        requested_at="21 Aug 2025 • 12:08 PM GST",
    )
    assert extraction.id_number == "784198991846589"
    assert extraction.date_of_birth == date(1989, 3, 8)
    assert extraction.expiry_date == date(2027, 8, 14)
    assert extraction.sex == "M"
