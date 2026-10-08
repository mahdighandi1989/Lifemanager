"""«صفحه‌های افزوده»: an owner's HTML attachment becomes a page as DATA —
installed by API, served as inert text, never committed as code."""
import pytest

from tests.test_inspection import SUP, _create, _supervisor_token  # noqa: F401  (autouse)

HTML = "<!DOCTYPE html><html><head><title>لب</title></head><body><script>var x=1</script></body></html>"


def _attach(c, name="lab.html", data=HTML.encode(), mime="text/html"):
    rid = _create(c)["id"]
    r = c.post(f"/api/inspection/{rid}/files", files={"file": (name, data, mime)})
    assert r.status_code == 200, r.text
    return r.json()["file"]


@pytest.mark.asyncio
async def test_supervisor_installs_an_html_attachment_as_a_page(api_client):
    f = _attach(api_client)
    r = api_client.post("/api/mini-apps", headers=SUP, json={
        "file_id": f["id"], "title": "آزمایشگاه", "slug": "neuro-focus", "icon": "🔬", "after": "/import"})
    assert r.status_code == 200, r.text
    app = r.json()["app"]
    assert app["path"] == "/apps/neuro-focus" and app["created_by"] == "supervisor" and app["report_number"] == 1
    assert [a["slug"] for a in api_client.get("/api/mini-apps").json()["apps"]] == ["neuro-focus"]
    src = api_client.get("/api/mini-apps/neuro-focus/source")
    assert src.status_code == 200 and src.text == HTML, "the owner's file, byte for byte"
    assert src.headers["content-type"].startswith("text/plain"), "never rendered on the app's origin"
    assert src.headers["content-security-policy"] == "sandbox"


@pytest.mark.asyncio
async def test_only_html_and_only_the_owner_retires(api_client):
    pdf = _attach(api_client, "x.pdf", b"%PDF", "application/pdf")
    assert api_client.post("/api/mini-apps", headers=SUP,
                           json={"file_id": pdf["id"], "title": "x"}).status_code == 422
    f = _attach(api_client)
    api_client.post("/api/mini-apps", headers=SUP, json={"file_id": f["id"], "title": "x", "slug": "lab"})
    assert api_client.post("/api/mini-apps", json={"file_id": f["id"], "title": "x", "slug": "Bad Slug"}).status_code == 422
    assert api_client.delete("/api/mini-apps/lab", headers=SUP).status_code == 403
    assert api_client.delete("/api/mini-apps/lab").status_code == 200
    assert api_client.get("/api/mini-apps").json()["apps"] == []
    assert api_client.get("/api/mini-apps/lab/source").status_code == 404
    # quarantined, not deleted: reinstalling brings it back
    assert api_client.post("/api/mini-apps", json={"file_id": f["id"], "title": "x", "slug": "lab"}).status_code == 200
