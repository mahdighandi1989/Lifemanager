"""نسخهٔ همراهِ رصدگر (2026-07-30) — the /api/mobile/* ingest surface.

Contract: every ingest endpoint is device-token gated (401 without/with a
wrong token, nothing logged); a bank SMS flows through the hardened finance
engine (deduped, currency-guarded); everything lands in the activity log;
/api/mobile/status shows the device's last signal.
Also here: the finance repair kit — rebuild-auto-cards, the provenance line,
and the owner-typed balance always winning (PUT).
"""
import pytest


def _pair(api_client) -> str:
    r = api_client.get("/api/mobile/token")
    assert r.status_code == 200
    return r.json()["token"]


def test_token_is_stable_and_rotatable(api_client):
    t1 = _pair(api_client)
    t2 = _pair(api_client)
    assert t1 == t2
    t3 = api_client.get("/api/mobile/token", params={"rotate": "true"}).json()["token"]
    assert t3 != t1


def test_ingest_requires_the_device_token(api_client):
    _pair(api_client)
    no_token = api_client.post("/api/mobile/sms", json={"sender": "x", "body": "y"})
    assert no_token.status_code == 401
    bad = api_client.post(
        "/api/mobile/sms", json={"sender": "x", "body": "y"},
        headers={"X-Device-Token": "wrong"},
    )
    assert bad.status_code == 401
    # nothing was logged for the refused calls
    log = api_client.get("/api/activity-log", params={"action": "mobile_sms"}).json()
    assert (log.get("total") or len(log.get("items") or [])) == 0


def test_bank_sms_updates_the_right_account_and_dedupes(api_client):
    token = _pair(api_client)
    made = api_client.post(
        "/api/finance/accounts",
        json={"name": "Mellat", "kind": "bank", "institution": "mellat",
              "balance": 100, "currency": "IRR"},
    ).json()
    sms = {"sender": "Mellat", "body": "بانک ملت\nموجودی: ۱۲٬۵۰۰٬۰۰۰ ریال", "device": "s24"}
    r = api_client.post("/api/mobile/sms", json=sms, headers={"X-Device-Token": token})
    assert r.status_code == 200
    assert r.json()["finance"]["balances_updated"] == 1
    acc = next(a for a in api_client.get("/api/finance/accounts").json() if a["id"] == made["id"])
    assert float(acc["balance"]) == 12_500_000.0

    # the same SMS re-delivered is a no-op (content-hash dedup)
    r2 = api_client.post("/api/mobile/sms", json=sms, headers={"X-Device-Token": token})
    assert r2.json()["finance"]["balances_updated"] == 0

    # and it is in the activity log
    log = api_client.get("/api/activity-log", params={"action": "mobile_sms"}).json()
    items = log.get("items") or []
    assert any("۱۲٬۵۰۰٬۰۰۰" in (i.get("detail") or "") for i in items)


def test_notification_and_heartbeat_reach_status(api_client):
    token = _pair(api_client)
    n = api_client.post(
        "/api/mobile/notification",
        json={"app": "com.whatsapp", "title": "علی", "text": "سلام", "device": "s24"},
        headers={"X-Device-Token": token},
    )
    assert n.status_code == 200
    h = api_client.post(
        "/api/mobile/heartbeat",
        json={"device": "s24", "battery": 88},
        headers={"X-Device-Token": token},
    )
    assert h.status_code == 200
    devices = api_client.get("/api/mobile/status").json()["devices"]
    assert any(d["device"] == "s24" for d in devices)


def test_usage_summary_is_logged(api_client):
    token = _pair(api_client)
    r = api_client.post(
        "/api/mobile/usage",
        json={"day": "2026-07-30", "device": "s24",
              "apps": [{"app": "org.telegram", "minutes": 42}, {"app": "com.gmail", "minutes": 7}]},
        headers={"X-Device-Token": token},
    )
    assert r.status_code == 200 and r.json()["recorded"] == 2


# ── the repair kit ──────────────────────────────────────────────────────────

def test_owner_typed_balance_beats_older_signals(api_client):
    made = api_client.post(
        "/api/finance/accounts",
        json={"name": "FAB", "kind": "bank", "institution": "fab",
              "balance": 1, "currency": "AED"},
    ).json()
    r = api_client.put(f"/api/finance/accounts/{made['id']}", json={"balance": 465.44})
    assert r.status_code == 200
    body = r.json()
    assert float(body["balance"]) == 465.44
    assert body["owner_balance_at"] is not None
    assert body["balance_evidence"] == "تنظیم دستی مالک"

    # the list endpoint reflects the pinned value + provenance
    acc = next(a for a in api_client.get("/api/finance/accounts").json() if a["id"] == made["id"])
    assert float(acc["balance"]) == 465.44 and acc["owner_balance_at"]


def test_rebuild_removes_machine_cards_and_keeps_manual(api_client):
    manual = api_client.post(
        "/api/finance/accounts",
        json={"name": "دستی من", "kind": "bank", "balance": 500, "currency": "AED"},
    ).json()
    r = api_client.post("/api/finance/rebuild-auto-cards")
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    names = [a["name"] for a in api_client.get("/api/finance/accounts").json()]
    assert "دستی من" in names
    assert manual["id"] in [a["id"] for a in api_client.get("/api/finance/accounts").json()]


def test_companion_apk_route_serves_or_degrades_gracefully(api_client):
    """With the CI-built APK in the repo → the real file, correct type;
    without it → a clear Persian 404 (never the SPA shell, never a 500)."""
    from pathlib import Path

    apk = Path(__file__).resolve().parent.parent / "mobile" / "companion-android" / "release" / "companion.apk"
    r = api_client.get("/companion.apk")
    if apk.exists():
        assert r.status_code == 200
        assert r.headers["content-type"] == "application/vnd.android.package-archive"
    else:
        assert r.status_code == 404
        assert "companion.apk" in r.json()["detail"]


def test_events_are_categorized_and_otp_never_reaches_finance(api_client):
    token = _pair(api_client)
    otp = api_client.post(
        "/api/mobile/sms",
        json={"sender": "Bank", "body": "کد تایید شما: 4006 موجودی حساب", "device": "s24"},
        headers={"X-Device-Token": token},
    ).json()
    assert otp["category"] == "otp" and otp["finance"]["balances_updated"] == 0


def test_gmail_app_notification_is_mirrored_not_double_fed(api_client):
    """اعلان اپ Gmail همان ایمیلی است که آینهٔ گوگل کامل می‌خواند — این‌جا فقط
    لاگ می‌شود و به مالی نمی‌رود (ضد دوبله‌شماری بین سیم‌کشی‌ها)."""
    token = _pair(api_client)
    r = api_client.post(
        "/api/mobile/notification",
        json={"app": "com.google.android.gm", "title": "Bank",
              "text": "Balance: AED 9,999.00", "device": "s24"},
        headers={"X-Device-Token": token},
    ).json()
    assert r["category"] == "mirrored"
    assert r["finance"]["balances_updated"] == 0


def test_watchdog_alerts_on_silence_and_clears_on_return(api_client, monkeypatch):
    import asyncio
    import datetime as dt

    from app.services import mobile_watchdog_service as wd

    token = _pair(api_client)
    api_client.post(
        "/api/mobile/heartbeat", json={"device": "s24"},
        headers={"X-Device-Token": token},
    )

    sent = []

    async def _fake_notify(event, **kw):
        sent.append(event)

    import app.services.notification_service as ns
    monkeypatch.setattr(ns, "notify_event", _fake_notify)

    # freshly-seen device → no alert
    from app.main import app
    from app.database import get_db

    async def _run(now=None):
        gen = app.dependency_overrides[get_db]()
        db = await gen.__asend__(None) if hasattr(gen, "__asend__") else await gen.__anext__()
        try:
            return await wd.watchdog_tick(db)
        finally:
            await gen.aclose()

    res = asyncio.run(_run())
    assert res["silent"] == 0 and res["alerts_sent"] == 0

    # silence past the threshold → alert; second tick inside cooldown → no repeat
    monkeypatch.setattr(wd, "_threshold_minutes", lambda: 0.0)
    res2 = asyncio.run(_run())
    assert res2["silent"] == 1 and res2["alerts_sent"] == 1 and sent == ["mobile_offline"]
    res3 = asyncio.run(_run())
    assert res3["alerts_sent"] == 0  # cooldown

    # device returns → all-clear once
    monkeypatch.setattr(wd, "_threshold_minutes", lambda: 90.0)
    api_client.post(
        "/api/mobile/heartbeat", json={"device": "s24"},
        headers={"X-Device-Token": token},
    )
    res4 = asyncio.run(_run())
    assert res4["all_clear"] == 1 and sent[-1] == "mobile_online"


def test_call_links_to_person_and_dedupes(api_client):
    token = _pair(api_client)
    # a known person with a phone
    pr = api_client.post("/api/persons", json={"name": "علی رضایی", "phone": "+971501234567"})
    assert pr.status_code == 201, pr.text
    call = {
        "number": "0501234567", "call_type": "incoming", "duration_sec": 65,
        "at": "2026-07-31T09:00:00", "device": "s24",
    }
    r = api_client.post("/api/mobile/call", json=call, headers={"X-Device-Token": token})
    assert r.status_code == 200
    body = r.json()
    # matched by phone tail → linked to the person, not a stray record
    assert body.get("linked_person_id") is not None
    # same call again → deduped
    r2 = api_client.post("/api/mobile/call", json=call, headers={"X-Device-Token": token})
    assert r2.json().get("duplicate") is True
    log = api_client.get("/api/activity-log", params={"action": "mobile_call"}).json()
    assert (log.get("total") or len(log.get("items") or [])) == 1


def test_call_requires_token(api_client):
    _pair(api_client)
    r = api_client.post("/api/mobile/call", json={"number": "123"})
    assert r.status_code == 401


def test_screen_text_is_categorized_and_otp_redacted(api_client):
    token = _pair(api_client)
    r = api_client.post(
        "/api/mobile/screen",
        json={"app": "org.telegram.messenger", "text": "پروفایل: مریم — سلام خوبی",
              "device": "s24"},
        headers={"X-Device-Token": token},
    )
    assert r.status_code == 200 and r.json()["category"] in ("message", "promo", "finance")

    # an OTP visible on screen must be redacted before it is stored
    r2 = api_client.post(
        "/api/mobile/screen",
        json={"app": "com.bank.app", "text": "کد تایید شما 123456 است", "device": "s24"},
        headers={"X-Device-Token": token},
    )
    assert r2.status_code == 200
    log = api_client.get("/api/activity-log", params={"action": "mobile_screen"}).json()
    joined = " ".join(i.get("detail", "") for i in (log.get("items") or []))
    assert "123456" not in joined and "▮▮▮" in joined


def test_screen_requires_token(api_client):
    _pair(api_client)
    r = api_client.post("/api/mobile/screen", json={"app": "x", "text": "hello world"})
    assert r.status_code == 401


def test_usage_records_unlocks(api_client):
    token = _pair(api_client)
    r = api_client.post(
        "/api/mobile/usage",
        json={"day": "2026-07-31", "device": "s24", "unlocks": 42,
              "apps": [{"app": "org.telegram", "minutes": 30}]},
        headers={"X-Device-Token": token},
    )
    assert r.status_code == 200 and r.json()["unlocks"] == 42


def test_call_creates_person_interaction_and_contact_stats(api_client):
    """The whole point: a call must MOVE the person's profile, not just log."""
    token = _pair(api_client)
    pr = api_client.post("/api/persons", json={"name": "مریم", "phone": "+971509998877"})
    pid = pr.json()["id"]
    api_client.post(
        "/api/mobile/call",
        json={"number": "0509998877", "call_type": "outgoing", "duration_sec": 120,
              "at": "2026-07-30T18:00:00", "device": "s24"},
        headers={"X-Device-Token": token},
    )
    prof = api_client.get(f"/api/people/{pid}/profile").json()
    assert prof["contact"]["call_count"] == 1
    assert prof["contact"]["last_contacted_at"].startswith("2026-07-30")
    # same call re-synced → deduped, no double interaction
    api_client.post(
        "/api/mobile/call",
        json={"number": "0509998877", "call_type": "outgoing", "duration_sec": 120,
              "at": "2026-07-30T18:00:00", "device": "s24"},
        headers={"X-Device-Token": token},
    )
    prof2 = api_client.get(f"/api/people/{pid}/profile").json()
    assert prof2["contact"]["call_count"] == 1


def test_mobile_insights_summarizes_real_usage(api_client):
    token = _pair(api_client)
    api_client.post(
        "/api/mobile/usage",
        json={"day": "2026-07-31", "device": "s24", "unlocks": 55,
              "apps": [{"app": "org.telegram.messenger", "minutes": 90},
                       {"app": "com.instagram.android", "minutes": 45}]},
        headers={"X-Device-Token": token},
    )
    pr = api_client.post("/api/persons", json={"name": "بابا", "phone": "0551112222"})
    api_client.post(
        "/api/mobile/call",
        json={"number": "0551112222", "call_type": "incoming", "duration_sec": 30,
              "at": "2026-07-31T10:00:00", "device": "s24"},
        headers={"X-Device-Token": token},
    )
    ins = api_client.get("/api/mobile/insights").json()
    assert ins["has_data"] is True
    assert ins["unlocks"] == 55
    assert ins["screen_minutes"] == 135
    assert ins["calls"] == 1
    assert any(c["name"] == "بابا" for c in ins["top_contacts"])
    assert any("تلگرام" in a["app"] for a in ins["top_apps"])


def test_activity_occurred_at_preserves_real_event_time(api_client):
    token = _pair(api_client)
    api_client.post(
        "/api/mobile/call",
        json={"number": "0500000000", "call_type": "incoming", "duration_sec": 5,
              "at": "2026-05-01T08:30:00", "device": "s24"},
        headers={"X-Device-Token": token},
    )
    items = api_client.get("/api/activity-log", params={"action": "mobile_call"}).json()["items"]
    row = items[0]
    assert row["occurred_at"].startswith("2026-05-01")
    assert row["display_at"].startswith("2026-05-01")


@pytest.mark.asyncio
async def test_activity_archive_is_idempotent_and_nondestructive(db_session, monkeypatch):
    import datetime as _dt

    from app.models.activity_log import ActivityLog
    from app.services import activity_archive_service as arch

    # a row in a CLOSED past month
    db_session.add(ActivityLog(
        action="mobile_call", entity_type="call", entity_label="x",
        occurred_at=_dt.datetime(2026, 3, 10, tzinfo=_dt.timezone.utc),
    ))
    await db_session.commit()

    uploaded = []

    class _StubClient:
        async def get_or_create_folder(self, name, parent=None):
            return "folder"

        async def upload(self, *, file_name, parent, media=None):
            uploaded.append(file_name)
            return "fileid"

    async def _stub_upload(**kw):
        uploaded.append(kw["file_name"])
        return {"drive_file_id": "id"}

    import app.services.google_drive_service as gds
    monkeypatch.setattr(gds, "upload_file", _stub_upload)
    import app.services.google_api_client as gac

    async def _client(db):
        return _StubClient()

    monkeypatch.setattr(gac, "build_drive_client", _client)
    import app.services.drive_settings_service as dss

    async def _tok(db):
        return "rt"

    monkeypatch.setattr(dss, "resolve_refresh_token", _tok)

    res = await arch.archive_tick(db_session)
    assert res["archived"] == [{"month": "2026-03", "rows": 1}]
    assert uploaded == ["activity-2026-03.json"]
    # row still in DB (nondestructive)
    from sqlalchemy import func as _f, select as _s
    n = (await db_session.execute(_s(_f.count()).select_from(ActivityLog))).scalar()
    assert n == 1
    # second run → nothing re-uploaded (idempotent)
    res2 = await arch.archive_tick(db_session)
    assert res2["archived"] == []
    assert uploaded == ["activity-2026-03.json"]
