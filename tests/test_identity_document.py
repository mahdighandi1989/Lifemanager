"""Coverage for /api/documents/identity (task 32ade384).

Stores and reads back the Emirates ID Document-Details data from
attachment #28, and confirms ``accompanied_by`` is optional (it was cut
off in the source image).
"""
from __future__ import annotations


EMIRATES_DOC_SAMPLE = {
    "emirates_id_number": "784198991846589",
    "file_number": "201/2008/2626430",
    "passport_number": "I96955239",
    "full_name": "MOHAMMAD MEHDI MAHMOUD GHANDI",
    "profession": "OFFICE CLERK",
    "sponsor": "BANK SADERAT IRAN (MAIN BRANCH)",
    "issue_date": "15 Aug 2025",
    "expiry_date": "14 Aug 2027",
    "issue_place": "DUBAI",
    # accompanied_by intentionally omitted — cut off in the image.
}


def test_create_and_read_identity_document(api_client):
    resp = api_client.post("/api/documents/identity", json=EMIRATES_DOC_SAMPLE)
    assert resp.status_code == 201, resp.text
    body = resp.json()
    assert "id" in body
    assert body["emirates_id_number"] == "784198991846589"
    assert body["full_name"] == "MOHAMMAD MEHDI MAHMOUD GHANDI"
    # Optional field defaults to null when not supplied.
    assert body["accompanied_by"] is None

    listing = api_client.get("/api/documents/identity").json()
    assert any(d["emirates_id_number"] == "784198991846589" for d in listing)


def test_accompanied_by_is_optional(api_client):
    payload = dict(EMIRATES_DOC_SAMPLE)
    payload["accompanied_by"] = "SOME SPONSOR"
    resp = api_client.post("/api/documents/identity", json=payload)
    assert resp.status_code == 201, resp.text
    assert resp.json()["accompanied_by"] == "SOME SPONSOR"
