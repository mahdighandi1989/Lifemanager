"""GET /api/assets — list scanned UserAssets (audit task 217909d2)."""


def test_list_assets_returns_200_list(api_client):
    """The asset dashboard reads this; it must return a JSON list (empty is
    fine) rather than erroring, so the page renders cleanly."""
    resp = api_client.get("/api/assets")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
