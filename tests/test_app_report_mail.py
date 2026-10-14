"""«📧 گزارشِ تور»: the page's HTML report (+ inline chart PNGs) to the owner; honest status; cap; owner-only.
And «🗺 قلمروِ سامانه‌ها»: the ledger never claims more than the map's evidence (the merge gate runs the checker)."""
import base64
import os
import subprocess
import sys

import pytest

PNG = base64.b64encode(b"\x89PNG\r\n\x1a\n" + b"0" * 64).decode()


@pytest.fixture(autouse=True)
def _owner_is_admin(monkeypatch):
    from app.config import settings
    monkeypatch.setattr(settings, "ADMIN_EMAILS", "rep@example.com")


def _signin(api_client, email="rep@example.com"):
    r = api_client.post("/auth/register", json={"email": email, "password": "hunter2-long", "username": email.split("@")[0]})
    api_client.headers.update({"Authorization": f"Bearer {r.json()['access_token']}"})


@pytest.mark.asyncio
async def test_send_report_images_cap_and_honest_status(db_session, monkeypatch):
    from app.services import app_report_mail as svc

    monkeypatch.setenv("NOTIFICATION_EMAIL_TO", "owner@example.com")
    svc._SENT.clear()
    got = []

    async def sender(to, subject, text, html, imgs):
        got.append((to, subject, html, imgs)); return {"ok": True}

    imgs = [{"cid": "mind_radar", "data": "data:image/png;base64," + PNG}, {"cid": "bad", "data": base64.b64encode(b"GIF89a").decode()},
            {"cid": "x" * 10, "data": "not base64 !!"}]
    r = await svc.send_report(db_session, user_id=1, app="learning-architecture", subject="🧭 تور", text="t", html="<p>h</p>", images=imgs, sender=sender)
    assert r["status"] == "sent" and r["images"] == 1, r          # only real PNGs travel
    assert got[0][0] == "owner@example.com" and got[0][3][0]["cid"] == "mind_radar"
    monkeypatch.setattr(svc, "DAILY_CAP", 1)
    r = await svc.send_report(db_session, user_id=1, app="learning-architecture", subject="s", text="t", html="", sender=sender)
    assert r["status"] == "capped"


@pytest.mark.asyncio
async def test_no_recipient_or_transport_is_never_reported_as_sent(db_session, monkeypatch):
    from app.services import app_report_mail as svc

    svc._SENT.clear()
    monkeypatch.delenv("NOTIFICATION_EMAIL_TO", raising=False)
    monkeypatch.delenv("SMTP_HOST", raising=False)

    async def no_account(db):
        return ""
    monkeypatch.setattr(svc, "recipient", no_account)
    r = await svc.send_report(db_session, user_id=1, app="learning-architecture", subject="s", text="t", html="")
    assert r["status"] == "skipped_unconfigured"


def test_gmail_inline_images_are_related_to_the_html_part(monkeypatch):
    import asyncio
    from app.services.google_sync import gmail_service as g

    sent = {}

    async def fetch(method, url, headers, body):
        sent["raw"] = base64.urlsafe_b64decode(body["raw"]); return {"id": "m1"}
    res = asyncio.get_event_loop().run_until_complete(g.send_email_gmail(None, "o@example.com", "s", "plain", fetcher=fetch, access_token="t",
                                                                       html='<img src="cid:mind_radar">',
                                                                       images=[{"cid": "mind_radar", "data": base64.b64decode(PNG), "subtype": "png"}]))
    assert res["ok"]
    raw = sent["raw"].decode("utf-8", "replace")
    assert "multipart/related" in raw and "Content-ID: <mind_radar>" in raw and "image/png" in raw


def test_endpoint_owner_only_and_validates(api_client, monkeypatch):
    from app.services import app_report_mail as svc

    svc._SENT.clear()

    async def fake(db, **kw):
        return {"status": "sent", "via": "test", "images": len(kw.get("images") or [])}
    monkeypatch.setattr(svc, "send_report", fake)
    _signin(api_client)
    base = "/api/app-records/learning-architecture/report-email"
    r = api_client.post(base, json={"subject": "🧭 تور", "text": "t", "html": "<p>x</p>", "images": [{"cid": "a", "data": PNG}]})
    assert r.status_code == 200 and r.json()["ok"] and r.json()["status"] == "sent"
    assert api_client.post(base, json={"subject": "x" * 300}).status_code == 422
    api_client.headers.pop("Authorization", None)
    _signin(api_client, "stranger-rep@example.com")
    assert api_client.post(base, json={"subject": "s"}).status_code == 403


def test_system_territory_ledger_matches_its_evidence():
    root = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "apps", "learning-architecture")
    r = subprocess.run([sys.executable, os.path.join(root, "tools", "sys_territory.py"), "check"], capture_output=True, text=True)
    assert r.returncode == 0, r.stdout + r.stderr
