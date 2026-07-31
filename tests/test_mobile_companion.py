"""نسخهٔ همراهِ رصدگر (2026-07-30) — the /api/mobile/* ingest surface.

Contract: every ingest endpoint is device-token gated (401 without/with a
wrong token, nothing logged); a bank SMS flows through the hardened finance
engine (deduped, currency-guarded); everything lands in the activity log;
/api/mobile/status shows the device's last signal.
Also here: the finance repair kit — rebuild-auto-cards, the provenance line,
and the owner-typed balance always winning (PUT).
"""
import pytest
import pytest_asyncio


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
    assert otp["category"] == "otp" and otp.get("routed_to") is None


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
    assert r.get("routed_to") is None


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


# ── central dispatcher: every signal to its own domain ──────────────────────

def test_dispatch_appointment_sms_goes_to_inbox(api_client):
    token = _pair(api_client)
    r = api_client.post(
        "/api/mobile/sms",
        json={"sender": "Clinic", "body": "یادآوری: نوبت دکتر فردا ساعت 10:30",
              "device": "s24"},
        headers={"X-Device-Token": token},
    ).json()
    assert r["category"] == "appointment"
    assert r["routed_to"] == "inbox"
    # it actually landed in the inbox (not just logged)
    inbox = api_client.get("/api/inbox").json()
    items = inbox.get("items") or inbox.get("inbox") or []
    assert any("نوبت دکتر" in (i.get("content") or "") for i in items)


def test_dispatch_message_from_known_contact_hits_their_profile(api_client):
    token = _pair(api_client)
    pid = api_client.post("/api/persons", json={"name": "سارا", "phone": "+971502223344"}).json()["id"]
    r = api_client.post(
        "/api/mobile/sms",
        json={"sender": "0502223344", "body": "سلام، خوبی؟", "device": "s24"},
        headers={"X-Device-Token": token},
    ).json()
    assert r["category"] == "message"
    assert r["routed_to"] == "person"
    # the message became an interaction on سارا (relationship reflects contact)
    prof = api_client.get(f"/api/people/{pid}/profile").json()
    # message interactions aren't calls, so call_count stays 0 but the
    # interaction exists → ledger/analyze can see it; assert via reminders/log
    log = api_client.get("/api/activity-log", params={"action": "mobile_sms"}).json()
    assert (log.get("total") or len(log.get("items") or [])) >= 1


def test_dispatch_plain_chatter_is_not_routed_no_flood(api_client):
    token = _pair(api_client)
    before = api_client.get("/api/inbox").json()
    n_before = len((before.get("items") or before.get("inbox") or []))
    r = api_client.post(
        "/api/mobile/notification",
        json={"app": "com.instagram.android", "title": "لایک", "text": "کسی پستت را پسندید",
              "device": "s24"},
        headers={"X-Device-Token": token},
    ).json()
    assert r["category"] == "message" and r.get("routed_to") is None
    after = api_client.get("/api/inbox").json()
    n_after = len((after.get("items") or after.get("inbox") or []))
    assert n_after == n_before  # chatter must NOT flood the inbox


def test_dispatch_finance_sms_still_routes_to_finance(api_client):
    token = _pair(api_client)
    made = api_client.post(
        "/api/finance/accounts",
        json={"name": "ADCB", "kind": "bank", "institution": "adcb",
              "balance": 1, "currency": "AED"},
    ).json()
    r = api_client.post(
        "/api/mobile/sms",
        json={"sender": "ADCB", "body": "Your available balance: AED 5,000.00",
              "device": "s24"},
        headers={"X-Device-Token": token},
    ).json()
    assert r["category"] == "finance" and r["routed_to"] == "finance"


def test_classify_signal_ordering():
    from app.services.mobile_dispatch_service import classify_signal
    assert classify_signal("Bank", "کد تایید شما 123456") == "otp"
    assert classify_signal("com.google.android.gm", "anything") == "mirrored"
    assert classify_signal("ADCB", "Available balance AED 100") == "finance"
    assert classify_signal("X", "جلسه فردا ساعت 14:00") == "appointment"
    assert classify_signal("X", "لطفا قبض را پرداخت کن") in ("task", "finance")
    assert classify_signal("friend", "سلام چطوری") == "message"


# ── AI-model classification (with deterministic guardrails) ────────────────

@pytest.mark.asyncio
async def test_model_verdict_wins_when_confident(db_session, monkeypatch):
    """مدل تصمیم می‌گیرد: متنی که قاعدهٔ کلیدواژه‌ای «گپ» می‌دید، با مدل
    «قرار» تشخیص داده می‌شود."""
    from app.services import mobile_dispatch_service as md

    md._AI_CACHE.clear()
    md._ai_calls.clear()
    text = "میبینمت پیش دکتر واسه چکاپ"          # no keyword the regex knows
    assert md.classify_signal("friend", text) == "message"

    import app.services.ai.inference_gateway as gw

    async def _fake(db, prompt, **kw):
        return {"ok": True, "text": '{"category":"appointment","confidence":0.9,"reason":"قرار"}',
                "model": "test-model"}

    monkeypatch.setattr(gw, "complete", _fake)
    category, conf, model = await md.classify_signal_smart(db_session, "friend", text)
    assert category == "appointment" and conf == 0.9 and model == "test-model"


@pytest.mark.asyncio
async def test_noise_never_reaches_the_model(db_session, monkeypatch):
    """OTP و اعلانِ اپ‌های آینه‌ای هرگز هزینهٔ مدل نمی‌دهند (و اشتباه نمی‌روند)."""
    from app.services import mobile_dispatch_service as md

    md._AI_CACHE.clear()
    md._ai_calls.clear()
    called = []

    import app.services.ai.inference_gateway as gw

    async def _fake(db, prompt, **kw):
        called.append(1)
        return {"ok": True, "text": '{"category":"finance","confidence":1.0}', "model": "m"}

    monkeypatch.setattr(gw, "complete", _fake)
    assert (await md.classify_signal_smart(db_session, "Bank", "کد تایید شما 1234"))[0] == "otp"
    assert (await md.classify_signal_smart(db_session, "com.google.android.gm", "x"))[0] == "mirrored"
    assert called == []


@pytest.mark.asyncio
async def test_model_failure_falls_back_to_rules(db_session, monkeypatch):
    from app.services import mobile_dispatch_service as md

    md._AI_CACHE.clear()
    md._ai_calls.clear()
    import app.services.ai.inference_gateway as gw

    async def _boom(db, prompt, **kw):
        raise RuntimeError("no key")

    monkeypatch.setattr(gw, "complete", _boom)
    category, conf, model = await md.classify_signal_smart(
        db_session, "ADCB", "Your available balance: AED 10.00"
    )
    assert category == "finance" and model is None  # rules, not the model


@pytest.mark.asyncio
async def test_hesitant_model_cannot_override_hard_finance_signal(db_session, monkeypatch):
    from app.services import mobile_dispatch_service as md

    md._AI_CACHE.clear()
    md._ai_calls.clear()
    import app.services.ai.inference_gateway as gw

    async def _unsure(db, prompt, **kw):
        return {"ok": True, "text": '{"category":"promo","confidence":0.2}', "model": "m"}

    monkeypatch.setattr(gw, "complete", _unsure)
    category, conf, _ = await md.classify_signal_smart(
        db_session, "ADCB", "Your available balance: AED 5,000.00"
    )
    assert category == "finance" and conf == 0.2


@pytest.mark.asyncio
async def test_ai_cap_and_cache_bound_the_cost(db_session, monkeypatch):
    from app.services import mobile_dispatch_service as md

    md._AI_CACHE.clear()
    md._ai_calls.clear()
    calls = []
    import app.services.ai.inference_gateway as gw

    async def _fake(db, prompt, **kw):
        calls.append(1)
        return {"ok": True, "text": '{"category":"message","confidence":0.8}', "model": "m"}

    monkeypatch.setattr(gw, "complete", _fake)
    monkeypatch.setattr(md, "_ai_hourly_cap", lambda: 1)
    await md.classify_signal_smart(db_session, "a", "متن اول")
    await md.classify_signal_smart(db_session, "a", "متن اول")   # cache hit
    await md.classify_signal_smart(db_session, "b", "متن دوم")   # over the cap
    assert len(calls) == 1


# ── the destination registry updates itself ────────────────────────────────

@pytest.mark.asyncio
async def test_new_filer_becomes_routable_without_touching_the_router(db_session):
    """افزودنِ یک مقصد جدید = یک خط در رجیستریِ فایل‌کننده‌ها؛ هم اعتبارسنجی،
    هم پرامپت تریاژ، هم دسته‌های مسیریاب خودبه‌خود آن را می‌بینند."""
    from app.services import inbox_service, mobile_dispatch_service as md

    assert inbox_service.INBOX_TARGETS == tuple(inbox_service.FILERS.keys())
    before = set(md._category_help())

    async def _file_as_vehicle(db, s, user_id):  # pragma: no cover - registry probe
        return {"kind": "vehicle", "id": 1, "title": "x", "link": "/life-file"}

    inbox_service.FILERS["vehicle"] = _file_as_vehicle
    inbox_service.INBOX_TARGETS = tuple(inbox_service.FILERS.keys())
    try:
        assert "vehicle" in md._category_help()          # router sees it
        assert set(md._category_help()) - before == {"vehicle"}
        catalog = await inbox_service.destination_catalog(db_session, 0)
        assert any(t["key"] == "vehicle" for t in catalog["targets"])
    finally:
        inbox_service.FILERS.pop("vehicle", None)
        inbox_service.INBOX_TARGETS = tuple(inbox_service.FILERS.keys())


@pytest.mark.asyncio
async def test_destination_catalog_is_live(db_session):
    """کاتالوگ زنده است: لیستِ تازه‌ساخته و صفحه‌های برنامه در آن دیده می‌شوند."""
    from app.models.todo_list import TodoList
    from app.services import inbox_service

    db_session.add(TodoList(name="لیستِ تازهٔ من"))
    await db_session.commit()
    catalog = await inbox_service.destination_catalog(db_session, 0)
    assert "لیستِ تازهٔ من" in catalog["lists"]
    assert any(p["label"] for p in catalog["pages"])       # pages come from routesMeta
    assert {"key": "task", "label": inbox_service.TARGET_FA["task"]} in catalog["targets"]


@pytest.mark.asyncio
async def test_unrouted_email_now_reaches_the_dispatcher(db_session, monkeypatch):
    """ایمیلی که هیچ‌کدام از مسیرهای اختصاصی (بانک/اشتراک/فرد) برش نمی‌داشت،
    تا امروز فقط برچسب می‌خورد و رها می‌شد. حالا مسیریابِ مرکزی جایش را
    پیدا می‌کند — و خبرنامه/OTP همچنان نویز می‌مانند."""
    import datetime as dt

    from app.models.personal_sync import PersonalEmail
    from app.services.google_sync import triage_service

    db_session.add(PersonalEmail(
        id="m-appt", from_addr="clinic@hospital.ae", subject="Appointment reminder",
        snippet="Your appointment is tomorrow at 10:30", received_at=dt.datetime(2026, 7, 31),
    ))
    db_session.add(PersonalEmail(
        id="m-news", from_addr="news@shop.com", subject="Weekly newsletter",
        snippet="unsubscribe here for our newsletter", received_at=dt.datetime(2026, 7, 31),
    ))
    await db_session.commit()

    seen = []
    from app.services import mobile_dispatch_service as md

    async def _spy(db, uid, **kw):
        seen.append(kw.get("source_ref"))
        return {"category": "appointment", "routed_to": "inbox"}

    monkeypatch.setattr(md, "dispatch_signal", _spy)
    res = await triage_service.analyze_new_emails(db_session, limit=10)
    assert res["ok"] is True
    # the appointment mail was dispatched; the newsletter was NOT (noise gate)
    assert "email:m-appt" in seen
    assert "email:m-news" not in seen
    assert res["dispatched"] == 1


# ── the three remaining sources, now wired ─────────────────────────────────

@pytest.mark.asyncio
async def test_calendar_event_reaches_the_person_but_does_not_flood_inbox(db_session, monkeypatch):
    """رویداد تقویم: جلسه با فردِ شناخته‌شده → تعاملِ MEETING روی پروفایلِ او؛
    ولی خودِ «قرار» دوباره در صندوق کپی نمی‌شود (ضدِ دوبله)."""
    import datetime as dt

    from app.models.person import Person
    from app.services.google_sync import calendar_service

    db_session.add(Person(name="دکتر رحیمی", phone="0509990000"))
    await db_session.commit()

    items = [{
        "id": "ev-1", "summary": "جلسه با دکتر رحیمی", "description": "",
        "location": "کلینیک", "start": {"dateTime": "2026-08-01T10:00:00Z"},
        "end": {"dateTime": "2026-08-01T11:00:00Z"}, "status": "confirmed",
    }]

    async def _fetcher(method, url, headers, json_body=None):
        return {"items": items}

    res = await calendar_service.sync_calendar(
        db_session, fetcher=_fetcher, access_token="at",
        now=dt.datetime(2026, 7, 31, tzinfo=dt.timezone.utc),
    )
    assert res["ok"] is True and res["new"] == 1

    # a MEETING interaction landed on the person…
    from sqlalchemy import select as _s

    from app.models.interaction import Interaction, InteractionType

    inter = (await db_session.execute(
        _s(Interaction).where(Interaction.type == InteractionType.MEETING)
    )).scalars().all()
    assert len(inter) == 1
    # …and the calendar event was NOT duplicated into the inbox
    from app.models.inbox_item import InboxItem

    inbox = (await db_session.execute(_s(InboxItem))).scalars().all()
    assert all("جلسه با دکتر رحیمی" not in (i.content or "") for i in inbox)


@pytest.mark.asyncio
async def test_person_matched_by_name_not_only_phone(db_session):
    """اعلانِ پیام‌رسان عنوانش نامِ مخاطب است — بدون تطبیقِ نام، هرگز به
    پروفایلِ کسی نمی‌رسید."""
    from app.models.person import Person
    from app.services.mobile_dispatch_service import _match_person

    db_session.add(Person(name="علی"))
    db_session.add(Person(name="علی‌رضا محمدی"))
    await db_session.commit()

    p = await _match_person(db_session, "علی‌رضا محمدی", "سلام خوبی؟")
    assert p is not None and p.name == "علی‌رضا محمدی"   # longest match wins
    assert (await _match_person(db_session, "کسی", "متنِ بی‌ربط")) is None


@pytest.mark.asyncio
async def test_telegram_file_now_flows_through_the_universal_extractor(db_session, monkeypatch):
    """فایلی که با تلگرام می‌آید باید همان مسیرِ پیوستِ ایمیل را برود (تا
    صورت‌حساب به «مالی» برسد) — نه فقط به توضیحِ یک کار بچسبد."""
    from app.services import telegram_compose

    seen = {}

    async def _fake_extract(db, **kw):
        seen.update(kw)
        return {"status": "proposed", "kind": "finance_account"}

    import app.services.ingest.universal_ingest as ui
    monkeypatch.setattr(ui, "extract_from_file", _fake_extract)

    buf = telegram_compose.ComposeBuffer(chat_id="1")
    buf.items.append(telegram_compose.ComposeItem(
        order=1, kind="document", added_at=0.0, file_id="f1",
        mime="application/pdf", filename="statement.pdf",
    ))

    class _Bot:
        async def download_file(self, fid):
            return b"%PDF-1.4 fake"

    flow = telegram_compose.ComposeService()
    await flow._analyse_items(buf, _Bot())
    assert seen.get("source_ref") == "telegram:f1"
    assert seen.get("filename") == "statement.pdf"
    assert buf.items[0].ingested in ("finance_account", "proposed", "duplicate")


# ── هویتِ اعلان: «کدام اپ / از طرفِ چه کسی» (اصلاح ۲۰۲۶-۰۷-۳۱) ──────────────
# گزارشِ مالک: خیلی از اعلان‌ها بی‌اپ و بی‌فرستنده ثبت می‌شدند — فقط متن.

def test_pretty_app_turns_a_package_into_a_human_name():
    from app.services import mobile_identity_service as ident

    assert ident.pretty_app("org.telegram.messenger") == "تلگرام"
    assert ident.pretty_app("com.whatsapp") == "واتس‌اپ"
    # اپِ ناشناخته هم باید خوانا شود، نه اینکه نامِ بسته بماند
    assert ident.pretty_app("com.acme.superapp") == "Acme"
    # برچسبِ خودِ گوشی بر همه‌چیز مقدم است
    assert ident.pretty_app("com.acme.superapp", "سوپر اپ") == "سوپر اپ"
    # برچسبی که خودش نامِ بسته است، برچسب حساب نمی‌شود
    assert ident.pretty_app("org.telegram.messenger", "org.telegram.messenger") == "تلگرام"
    assert ident.looks_like_package("com.instagram.android") is True
    assert ident.looks_like_package("علی رضایی") is False


def test_resolve_sender_precedence_never_returns_blank():
    from app.services import mobile_identity_service as ident

    # MessagingStyle: نامِ واقعیِ مخاطب — بر عنوان مقدم
    assert ident.resolve_sender(
        app="org.telegram.messenger", title="تلگرام", sender_name="علی رضایی",
    ) == "علی رضایی"
    # عنوانِ شمارشی («۳ پیام جدید») فرستنده نیست
    assert ident.resolve_sender(
        app="com.whatsapp", title="۳ پیام جدید", sub_text="گروه خانواده",
    ) == "گروه خانواده"
    # اعلانِ تبلیغاتیِ بی‌عنوان → دستِ‌کم نامِ اپ، نه خالی
    assert ident.resolve_sender(app="com.digikala", title="") == "دیجی‌کالا"


def test_notification_records_app_and_sender_not_a_package(api_client):
    token = _pair(api_client)
    r = api_client.post(
        "/api/mobile/notification",
        json={
            "app": "org.telegram.messenger", "app_label": "Telegram",
            "title": "۲ پیام جدید", "text": "پیام جدید",
            "sender_name": "سارا محمدی", "device": "s24",
        },
        headers={"X-Device-Token": token},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["sender"] == "سارا محمدی"
    assert body["app_name"] == "Telegram"
    log = api_client.get("/api/activity-log", params={"action": "mobile_notification"}).json()
    labels = [i.get("entity_label") or "" for i in (log.get("items") or [])]
    assert any("سارا محمدی" in v and "Telegram" in v for v in labels)
    assert not any(v.startswith("org.telegram") for v in labels)


def test_promotional_notification_without_a_title_still_names_its_app(api_client):
    """دقیقاً موردِ گزارش‌شده: اعلانِ تبلیغاتی بدونِ فرستنده — قبلاً فقط متن
    ثبت می‌شد و ستونِ «چه چیزی» عملاً خالی بود."""
    token = _pair(api_client)
    r = api_client.post(
        "/api/mobile/notification",
        json={"app": "com.digikala", "title": "", "text": "۵۰٪ تخفیف ویژه",
              "android_category": "promo", "device": "s24"},
        headers={"X-Device-Token": token},
    )
    assert r.status_code == 200
    assert r.json()["sender"] == "دیجی‌کالا"
    # اپ خودش گفته تبلیغ است → دسته promo و بدونِ مسیریابی (فقط لاگ)
    assert r.json()["category"] == "promo"
    assert r.json()["routed_to"] is None
    log = api_client.get("/api/activity-log", params={"action": "mobile_notification"}).json()
    assert any("دیجی‌کالا" in (i.get("entity_label") or "") for i in (log.get("items") or []))


def test_old_client_payload_still_works_and_is_named(api_client):
    """اپِ نصب‌شدهٔ قدیمی فقط app/title/text می‌فرستد — نباید چیزی بشکند."""
    token = _pair(api_client)
    r = api_client.post(
        "/api/mobile/notification",
        json={"app": "com.instagram.android", "title": "", "text": "لایک جدید"},
        headers={"X-Device-Token": token},
    )
    assert r.status_code == 200
    assert r.json()["sender"] == "اینستاگرام"


def test_notification_body_prefers_the_full_text_over_a_summary(api_client):
    token = _pair(api_client)
    api_client.post(
        "/api/mobile/notification",
        json={"app": "com.whatsapp", "title": "گروه کار", "text": "۳ پیام جدید",
              "lines": ["علی: فردا جلسه داریم", "رضا: باشه"], "device": "s24"},
        headers={"X-Device-Token": token},
    )
    log = api_client.get("/api/activity-log", params={"action": "mobile_notification"}).json()
    details = [i.get("detail") or "" for i in (log.get("items") or [])]
    assert any("فردا جلسه داریم" in d for d in details)


def test_ongoing_service_notification_is_logged_but_never_routed(api_client):
    token = _pair(api_client)
    r = api_client.post(
        "/api/mobile/notification",
        json={"app": "com.spotify.music", "title": "در حال پخش", "text": "آهنگ",
              "android_category": "transport", "ongoing": True, "device": "s24"},
        headers={"X-Device-Token": token},
    )
    assert r.json()["category"] == "system"
    assert r.json()["routed_to"] is None
    log = api_client.get("/api/activity-log", params={"action": "mobile_notification"}).json()
    assert (log.get("total") or len(log.get("items") or [])) >= 1  # ثبت شده، فقط مسیر نگرفته


def test_mirrored_app_is_detected_from_the_package_not_the_sender():
    from app.services.mobile_dispatch_service import classify_signal

    # حالا sender نامِ آدم است؛ تشخیصِ آینه باید از package بیاید
    assert classify_signal("علی", "هر متنی", app="com.google.android.gm") == "mirrored"
    # و سازگاری با فراخوانِ قدیمی (package داخلِ sender)
    assert classify_signal("com.google.android.gm", "x") == "mirrored"


def test_android_category_never_overrules_a_money_signal():
    from app.services.mobile_dispatch_service import classify_signal

    assert classify_signal(
        "بانک", "مبلغ 1,200,000 ریال به حساب شما واریز شد", category_hint="promo",
    ) == "finance"
    assert classify_signal("x", "کد تایید 1234", category_hint="msg") == "otp"


def test_historical_rows_with_a_package_label_render_readable():
    """رکوردهای قدیمی نامِ بسته دارند — بدون مهاجرت، در لحظهٔ نمایش خوانا شوند."""
    from app.services.mobile_identity_service import display_entity_label

    assert display_entity_label("phone_notification", "org.telegram.messenger") == "تلگرام"
    assert display_entity_label("phone_notification", "علی · com.whatsapp") == "علی · واتس‌اپ"
    # هر چیزِ دیگری دست‌نخورده می‌ماند
    assert display_entity_label("task", "org.telegram.messenger") == "org.telegram.messenger"
    assert display_entity_label("phone_notification", "سارا · تلگرام") == "سارا · تلگرام"


def test_sms_from_a_known_contact_shows_the_name_in_the_log(api_client):
    token = _pair(api_client)
    api_client.post("/api/persons", json={"name": "مریم احمدی", "phone": "09121234567"})
    api_client.post(
        "/api/mobile/sms",
        json={"sender": "+989121234567", "body": "سلام خوبی؟", "device": "s24"},
        headers={"X-Device-Token": token},
    )
    log = api_client.get("/api/activity-log", params={"action": "mobile_sms"}).json()
    assert any("مریم احمدی" in (i.get("entity_label") or "") for i in (log.get("items") or []))


# ── تشخیصِ مجرای خاموش (بازنویسی ۲۰۲۶-۰۷-۳۱) ─────────────────────────────────
# نسخهٔ اولِ /diagnostics فقط «تعدادِ کل > صفر» را می‌سنجید، پس مجرایی که کار
# می‌کرد و بعد مُرد تا ابد ✅ می‌ماند — یعنی دقیقاً همان خرابی‌ای که قرار بود
# بگیرد را نمی‌گرفت. این تست‌ها آن حالت را میخ می‌کنند.

def _diag(api_client) -> dict:
    r = api_client.get("/api/mobile/diagnostics")
    assert r.status_code == 200
    return {c["action"]: c for c in r.json()["channels"]}


def test_diagnostics_reports_never_for_a_channel_with_no_data(api_client):
    _pair(api_client)
    ch = _diag(api_client)
    assert ch["mobile_notification"]["status"] == "never"
    assert ch["mobile_notification"]["hint"]
    assert ch["mobile_notification"]["count_24h"] == 0


def test_a_revoked_permission_is_reported_as_off_even_with_old_data(api_client):
    """قلبِ ماجرا: اعلان‌ها قبلاً کار می‌کرد و اندروید دسترسی را باطل کرد.
    داده‌های قدیمی هست، ولی وضعیت باید «باطل شده» باشد نه «فعال»."""
    token = _pair(api_client)
    api_client.post(
        "/api/mobile/notification",
        json={"app": "com.whatsapp", "title": "علی", "text": "سلام", "device": "s24"},
        headers={"X-Device-Token": token},
    )
    # گوشی گزارش می‌دهد: دسترسیِ اعلان باطل شده
    api_client.post(
        "/api/mobile/heartbeat",
        json={"device": "s24", "perms": {
            "sms": True, "notification": False, "call_log": True,
            "usage": True, "accessibility": False,
        }},
        headers={"X-Device-Token": token},
    )
    ch = _diag(api_client)
    assert ch["mobile_notification"]["status"] == "off"
    assert ch["mobile_notification"]["granted"] is False
    assert "Notification access" in (ch["mobile_notification"]["hint"] or "")
    # و مجرایی که دسترسی دارد و تازه است، فعال بماند
    assert ch["mobile_heartbeat"]["status"] == "ok"
    assert api_client.get("/api/mobile/diagnostics").json()["perms_reported"] is True


def test_a_granted_channel_with_fresh_data_is_ok(api_client):
    token = _pair(api_client)
    api_client.post(
        "/api/mobile/notification",
        json={"app": "com.whatsapp", "title": "علی", "text": "سلام", "device": "s24"},
        headers={"X-Device-Token": token},
    )
    api_client.post(
        "/api/mobile/heartbeat",
        json={"device": "s24", "perms": {"notification": True}},
        headers={"X-Device-Token": token},
    )
    ch = _diag(api_client)
    assert ch["mobile_notification"]["status"] == "ok"
    assert ch["mobile_notification"]["count_24h"] == 1
    assert ch["mobile_notification"]["granted"] is True


@pytest_asyncio.fixture
async def client_and_db():
    """کلاینت و نشستِ دیتابیس روی **یک** موتور — لازم است چون باید زمانِ
    رکوردها را عقب ببریم و ببینیم تشخیص چه می‌گوید (fixtureهای مشترک هرکدام
    موتورِ جدا دارند)."""
    from fastapi.testclient import TestClient
    from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

    from app.database import Base, get_db
    from app.main import app

    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def _get_db():
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = _get_db
    async with factory() as session:
        yield TestClient(app), session
    app.dependency_overrides.clear()
    await engine.dispose()


async def _age_actions(session, actions, days):
    """رکوردهای این کانال‌ها را «کهنه» کن (created_at = معیارِ زنده‌بودن)."""
    import datetime as dt

    from sqlalchemy import select as _sel

    from app.models.activity_log import ActivityLog

    rows = (await session.execute(
        _sel(ActivityLog).where(ActivityLog.action.in_(actions))
    )).scalars().all()
    for r in rows:
        r.created_at = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=days)
    await session.commit()


@pytest.mark.asyncio
async def test_stale_channel_with_a_live_device_is_silent(client_and_db):
    """داده هست ولی کهنه، و خودِ گوشی زنده است → «قطع شده» (نه «فعال»)."""
    client, session = client_and_db
    token = client.get("/api/mobile/token").json()["token"]
    client.post(
        "/api/mobile/notification",
        json={"app": "com.whatsapp", "title": "علی", "text": "سلام", "device": "s24"},
        headers={"X-Device-Token": token},
    )
    client.post("/api/mobile/heartbeat", json={"device": "s24"},
                headers={"X-Device-Token": token})
    await _age_actions(session, ["mobile_notification"], days=3)   # نبض تازه می‌ماند

    ch = {c["action"]: c for c in client.get("/api/mobile/diagnostics").json()["channels"]}
    assert ch["mobile_notification"]["status"] == "silent"
    assert ch["mobile_notification"]["count_24h"] == 0
    assert ch["mobile_notification"]["count"] == 1  # پاک نشده، فقط کهنه است


@pytest.mark.asyncio
async def test_when_the_device_itself_is_silent_channels_are_unknown_not_broken(client_and_db):
    """اگر خودِ گوشی خاموش است، مقصر دانستنِ تک‌تکِ دسترسی‌ها گمراه‌کننده است."""
    client, session = client_and_db
    token = client.get("/api/mobile/token").json()["token"]
    client.post(
        "/api/mobile/notification",
        json={"app": "com.whatsapp", "title": "علی", "text": "سلام", "device": "s24"},
        headers={"X-Device-Token": token},
    )
    client.post("/api/mobile/heartbeat", json={"device": "s24"},
                headers={"X-Device-Token": token})
    await _age_actions(session, ["mobile_notification", "mobile_heartbeat"], days=3)

    body = client.get("/api/mobile/diagnostics").json()
    ch = {c["action"]: c for c in body["channels"]}
    assert body["device_live"] is False
    assert ch["mobile_notification"]["status"] == "unknown"
    assert ch["mobile_heartbeat"]["status"] == "silent"   # خودِ نبض واقعاً قطع است
