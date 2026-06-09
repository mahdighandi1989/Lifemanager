"""Coverage for UAE vehicle-licence extraction (task 32ade384, step 10).

Attachment #36 carries ownership + insurance in one card, including Arabic
insurer text and three dates. The technical specs (#37) must NOT appear.
"""
from __future__ import annotations

from datetime import date

from app.schemas.vehicle import VehicleLicenseUAE
from app.services.vehicle_extraction_service import extract_vehicle_license


SAMPLE = (
    "Traffic Plate No.: 88659 — I | Place of Issue: Dubai | T.C. No.: 11875829 "
    "| Owner: MOHAMMAD MEHDI MAHMOUD GHANDI | Nationality: Iran | Reg. Date: 2007-10-25 "
    "| Exp. Date: 2027-05-08 | Ins. Exp.: 2027-06-08 | مؤمنة لدى: سكون تكافل (مساهمة عامة) "
    "| Policy No.: 06TP782104 | نوع التأمين: ضد الغير"
)


def test_service_parses_owner_insurance_and_dates():
    lic = extract_vehicle_license(SAMPLE)
    assert lic.traffic_plate_no.startswith("88659")
    assert lic.place_of_issue == "Dubai"
    assert lic.tc_no == "11875829"
    assert lic.owner_name == "MOHAMMAD MEHDI MAHMOUD GHANDI"
    assert lic.policy_no == "06TP782104"
    # Dates parsed to date objects.
    assert lic.registration_date == date(2007, 10, 25)
    assert lic.expiry_date == date(2027, 5, 8)
    assert lic.insurance_expiry_date == date(2027, 6, 8)
    # Arabic insurer / insurance type preserved.
    assert "سكون تكافل" in lic.insurer_name
    assert "ضد الغير" in lic.insurance_type


def test_schema_has_no_technical_spec_fields():
    # Step-10 scope: ownership/insurance only — no engine/chassis here.
    fields = set(VehicleLicenseUAE.model_fields.keys())
    assert "engine_number" not in fields
    assert "chassis_number" not in fields


def test_endpoint_returns_structured_extraction(api_client):
    resp = api_client.post(
        "/api/documents/vehicle-license/extract", json={"text": SAMPLE}
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["tc_no"] == "11875829"
    assert body["policy_no"] == "06TP782104"
    assert "سكون تكافل" in body["insurer_name"]
