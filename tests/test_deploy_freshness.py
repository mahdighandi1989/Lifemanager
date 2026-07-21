"""Deploy freshness — the "I pushed changes but see the old app" fix.

The SPA shell (index.html) must be served uncacheable so a new deploy (which
changes the hashed asset filenames the shell references) is picked up on the
next load instead of the browser/edge pinning the old bundle. And /api/version
lets the owner verify from the browser WHICH commit is live.
"""


def test_version_endpoint_reports_commit(api_client):
    r = api_client.get("/api/version")
    assert r.status_code == 200
    body = r.json()
    assert "commit" in body and "short" in body
    # Locally there's no RENDER_GIT_COMMIT, so it falls back to "dev".
    assert body["commit"]


def test_spa_shell_is_uncacheable(api_client):
    """When the built SPA is present (dev / CI-with-build), the shell carries a
    no-store Cache-Control so deploys aren't masked by a cached index.html.
    Skipped implicitly when frontend/dist isn't built (catch-all not mounted)."""
    r = api_client.get("/")
    ctype = r.headers.get("content-type", "")
    if r.status_code == 200 and "text/html" in ctype:
        assert "no-store" in r.headers.get("cache-control", "").lower()
