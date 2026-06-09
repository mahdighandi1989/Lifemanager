"""Extract UAE (RTA) driving-licence fields from card text (task 32ade384).

The licence may be presented as already-structured fields (a ``dict``) or
as a pipe / newline delimited OCR string such as the verbatim sample in
the task prompt. :func:`extract_uae_license` accepts either and returns a
validated :class:`~app.schemas.uae_license.UAEDrivingLicense`.

There is no OCR dependency: callers OCR upstream and hand us text/fields,
mirroring the lazy-import convention used elsewhere in the project so a
stripped image still boots.
"""
from __future__ import annotations

import re
from typing import Mapping, Union

from app.schemas.uae_license import UAEDrivingLicense


def _grab(text: str, pattern: str) -> str | None:
    m = re.search(pattern, text)
    return m.group(1).strip() if m else None


def _split_bilingual_name(raw: str | None) -> tuple[str | None, str | None]:
    """Split a ``LATIN / عربی`` name into (english, arabic)."""
    if not raw:
        return None, None
    parts = [p.strip() for p in raw.split("/", 1)]
    if len(parts) == 2:
        return parts[0] or None, parts[1] or None
    return parts[0] or None, None


def extract_uae_license(
    source: Union[str, Mapping[str, object]],
) -> UAEDrivingLicense:
    """Map licence card text / fields to ``UAEDrivingLicense``.

    A mapping is validated directly. A string is parsed with regexes that
    tolerate the ``Field: value | Field: value`` layout of the prompt
    sample (page 1), and the page-2 ``Traffic Code No.`` / ``Permitted
    Vehicles`` fields when present.
    """
    if isinstance(source, Mapping):
        return UAEDrivingLicense.model_validate(dict(source))

    text = str(source)
    name_en, name_ar = _split_bilingual_name(_grab(text, r"Name:\s*([^|]+)"))

    return UAEDrivingLicense(
        # Matches both "License No. 1608806" (face) and "License Number: 1608806" (back).
        license_no=_grab(text, r"Licen[cs]e N(?:o\b\.?|umber:?)\s*([0-9]+)") or "",
        name_en=name_en or "",
        name_ar=name_ar,
        nationality=_grab(text, r"Nationality:\s*([^|]+)"),
        date_of_birth=_grab(text, r"Date of Birth:\s*(\d{4}-\d{2}-\d{2})"),
        issue_date=_grab(text, r"Issue Date:\s*(\d{4}-\d{2}-\d{2})"),
        # Face prints "Expiry Date:", the back prints "Expiry date:".
        expiry_date=_grab(text, r"Expiry [Dd]ate:\s*(\d{4}-\d{2}-\d{2})"),
        place_of_issue=_grab(text, r"Place of Issue:\s*([^|]+)"),
        traffic_code_no=_grab(text, r"Traffic Code No\.?:\s*([0-9]+)"),
        permitted_vehicles=_grab(text, r"Permitted Vehicles:\s*([^|]+)"),
    )
