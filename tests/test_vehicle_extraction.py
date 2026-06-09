"""Coverage for vehicle technical-info extraction (task 32ade384, step 11).

Attachment #37 is the technical-specs side: engine/chassis/weights. It
must NOT carry ownership or insurance data (that is step 10 / #36).
"""
from __future__ import annotations

from datetime import date

from app.schemas.vehicle import VehicleTechnicalInfo
from app.services.vehicle_extraction_service import extract_vehicle_info


SAMPLE = (
    "Model: 2008 | Num. of Pass.: 8 | Origin: Indonesia | لون المركبة: ذهبي "
    "| Veh. Type: TOYOTA FORTUNER | G.V.W.: 2600 | Empty Weight: 1800 "
    "| Eng. No.: 2TR6430116 | Chassis No.: MHFZX69G187002434 "
    "| Plate number: DUBAI — 88659 | Expiry date: 2027-05-08"
)


def test_service_extracts_engine_chassis_and_type():
    info = extract_vehicle_info(SAMPLE)
    assert info.model_year == 2008
    assert info.num_passengers == 8
    assert info.origin == "Indonesia"
    assert info.color == "ذهبي"
    assert info.vehicle_type == "TOYOTA FORTUNER"
    assert info.gross_vehicle_weight == 2600
    assert info.empty_weight == 1800
    assert info.engine_number == "2TR6430116"
    assert info.chassis_number == "MHFZX69G187002434"
    assert info.expiry_date == date(2027, 5, 8)


def test_schema_has_no_ownership_fields():
    fields = set(VehicleTechnicalInfo.model_fields.keys())
    assert "owner_name" not in fields
    assert "policy_no" not in fields
    assert "insurer_name" not in fields


def test_endpoint_returns_engine_chassis_expiry(api_client):
    resp = api_client.post("/api/vehicles/extract", json={"text": SAMPLE})
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["engine_number"] == "2TR6430116"
    assert body["chassis_number"] == "MHFZX69G187002434"
    assert body["expiry_date"] == "2027-05-08"
