"""Asset scan endpoint + scan-status WebSocket (audit task 217909d2, AC2/AC3)."""
import os

from app.services.asset_scan_service import classify, scan_directory


def test_classify_by_extension():
    assert classify("Inception.mp4") == "movie"
    assert classify("book.pdf") == "book"
    assert classify("notes.txt") == "document"
    assert classify("weird.xyz") == "file"


def test_scan_directory_walks_files(tmp_path):
    (tmp_path / "a.mp4").write_text("x")
    (tmp_path / "b.pdf").write_text("x")
    sub = tmp_path / "sub"
    sub.mkdir()
    (sub / "c.txt").write_text("x")
    found = scan_directory(str(tmp_path))
    names = {f["name"] for f in found}
    assert names == {"a.mp4", "b.pdf", "c.txt"}
    assert scan_directory("/no/such/path") == []


def test_scan_endpoint_records_assets(api_client, tmp_path):
    (tmp_path / "movie.mkv").write_text("x")
    (tmp_path / "doc.txt").write_text("x")
    resp = api_client.post("/api/assets/scan", json={"path": str(tmp_path)})
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["status"] == "completed"
    assert body["scanned"] == 2
    assert body["inserted"] == 2

    # re-scan is idempotent (deduped by path)
    again = api_client.post("/api/assets/scan", json={"path": str(tmp_path)})
    assert again.json()["inserted"] == 0


def test_scan_status_websocket_streams_progress(api_client, tmp_path):
    (tmp_path / "one.mp4").write_text("x")
    (tmp_path / "two.pdf").write_text("x")
    with api_client.websocket_connect("/api/assets/scan-status") as ws:
        ws.send_json({"path": str(tmp_path)})
        first = ws.receive_json()
        assert first["total"] == 2 and first["current"] == 1
        second = ws.receive_json()
        assert second["current"] == 2
        done = ws.receive_json()
        assert done["status"] == "completed"
