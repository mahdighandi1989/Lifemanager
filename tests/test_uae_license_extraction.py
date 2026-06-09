"""Coverage for UAE driving-licence extraction (task 32ade384, steps 8/9).

Page 1 (#34) parses the licence face with correct date objects; page 2
(#35) enriches the same record with the traffic code and the bilingual
permitted-vehicle class, whose Arabic must survive round-tripping.
"""
from __future__ import annotations

from datetime import date

from app.services.uae_license_extraction_service import extract_uae_license


PAGE1 = (
    "License No. 1608806 | Name: MOHAMMAD MEHDI MAHMOUD GHANDI / محمد مهدی محمود قندی "
    "| Nationality: Iran | Date of Birth: 1989-03-08 | Issue Date: 2010-08-11 "
    "| Expiry Date: 2030-08-22 | Place of Issue: Dubai | RTA — Licensing Authority"
)

PAGE2 = (
    "Traffic Code No.: 11875829 — الرمز المروري "
    "| Permitted Vehicles: مركبة خفيفة أوتوماتيك / Light Vehicle Automatic "
    "| License Number: 1608806 | Expiry date: 2030-08-22"
)


def test_service_parses_dates_to_date_objects():
    lic = extract_uae_license(PAGE1)
    assert lic.license_no == "1608806"
    assert lic.name_en == "MOHAMMAD MEHDI MAHMOUD GHANDI"
    assert lic.name_ar == "محمد مهدی محمود قندی"
    assert lic.nationality == "Iran"
    assert lic.date_of_birth == date(1989, 3, 8)
    assert lic.issue_date == date(2010, 8, 11)
    assert lic.expiry_date == date(2030, 8, 22)
    assert lic.place_of_issue == "Dubai"


def test_endpoint_stores_face_then_enriches_with_page2(api_client):
    r1 = api_client.post("/api/documents/uae-license/extract", json={"text": PAGE1})
    assert r1.status_code == 200, r1.text
    b1 = r1.json()
    assert b1["license_no"] == "1608806"
    assert b1["expiry_date"] == "2030-08-22"
    rec_id = b1["id"]

    # Page 2 enriches the same licence row (idempotent on licence number).
    r2 = api_client.post("/api/documents/uae-license/extract", json={"text": PAGE2})
    assert r2.status_code == 200, r2.text
    b2 = r2.json()
    assert b2["id"] == rec_id
    assert b2["traffic_code_no"] == "11875829"
    # Arabic permitted-vehicle class preserved without mojibake.
    assert "مركبة خفيفة أوتوماتيك" in b2["permitted_vehicles"]

    listing = api_client.get("/api/documents/uae-license").json()
    rows = [r for r in listing if r["license_no"] == "1608806"]
    assert len(rows) == 1
