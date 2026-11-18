"""A browser opening an SPA page whose path collides with an API prefix
(e.g. /notifications) gets the SPA shell, not a 307 → 401 JSON
(OPEN_ITEMS #4; reproduced on production 2026-11-18). API clients keep
the trailing-slash redirect."""
import re
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture(scope="module")
def client():
    from app.main import app
    return TestClient(app)


def _dist_exists():
    return (ROOT / "frontend" / "dist" / "index.html").exists()


@pytest.mark.skipif(not _dist_exists(), reason="frontend/dist not built")
def test_browser_navigation_to_notifications_serves_spa(client):
    r = client.get("/notifications", headers={"Accept": "text/html,application/xhtml+xml,*/*;q=0.8"},
                   follow_redirects=False)
    assert r.status_code == 200
    assert "text/html" in r.headers["content-type"]
    assert "<div id=\"root\"" in r.text or "<html" in r.text.lower()


@pytest.mark.skipif(not _dist_exists(), reason="frontend/dist not built")
def test_api_style_request_still_redirects_to_router(client):
    r = client.get("/notifications", headers={"Accept": "application/json"}, follow_redirects=False)
    assert r.status_code == 307
    assert r.headers["location"].endswith("/notifications/")


def test_every_spa_route_under_an_api_prefix_is_listed():
    """routesMeta.js is the one registry of SPA pages; any top-level page whose
    first segment is an API prefix must be in _SPA_PATHS_UNDER_API_PREFIX."""
    main = (ROOT / "app" / "main.py").read_text(encoding="utf-8")
    prefixes = re.search(r"_API_PREFIXES = \((.*?)\)\n", main, re.S).group(1)
    prefixes = set(re.findall(r'"([^"]+)"', prefixes))
    listed = set(re.findall(r'"([^"]+)"', re.search(r"_SPA_PATHS_UNDER_API_PREFIX = \((.*?)\)", main, re.S).group(1)))
    meta = (ROOT / "frontend" / "src" / "lib" / "routesMeta.js").read_text(encoding="utf-8")
    paths = re.findall(r"path:\s*'(/[^']*)'", meta)
    colliding = {p.strip("/") for p in paths if p.strip("/").split("/")[0] in prefixes and ":" not in p}
    assert colliding <= listed, f"add to _SPA_PATHS_UNDER_API_PREFIX: {sorted(colliding - listed)}"
