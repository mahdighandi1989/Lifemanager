"""/api/drive endpoints + cold-tiering task (audit task 7367c6f0, AC4/AC5/AC8)."""


def test_drive_files_returns_list(api_client):
    resp = api_client.get("/api/drive/files")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_drive_upload_records_metadata_and_is_searchable(api_client):
    up = api_client.post(
        "/api/drive/upload", json={"filename": "report.pdf", "mime_type": "application/pdf"}
    )
    assert up.status_code == 201, up.text
    body = up.json()
    assert body["filename"] == "report.pdf"
    assert body["storage_tier"] == "hot"
    assert body["drive_file_id"] is None  # not pushed without creds

    listing = api_client.get("/api/drive/files").json()
    assert any(f["filename"] == "report.pdf" for f in listing)

    # AC5 search by filename substring
    hit = api_client.get("/api/drive/files?q=report").json()
    assert any(f["filename"] == "report.pdf" for f in hit)
    miss = api_client.get("/api/drive/files?q=zzz-no-match").json()
    assert all("report" not in f["filename"] for f in miss)


def test_tier_cold_data_scheduled_and_callable():
    """AC8/AC11: the cold-tiering job is registered to run daily and runs
    without raising (it degrades gracefully if the DB is unreachable)."""
    from app.celery_app import celery_app

    assert "tier-cold-data-daily" in celery_app.conf.beat_schedule
    assert (
        celery_app.conf.beat_schedule["tier-cold-data-daily"]["task"]
        == "app.tasks.tier_cold_data"
    )

    from app.tasks import tier_cold_data

    assert isinstance(tier_cold_data(), dict)
