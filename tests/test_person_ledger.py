"""افراد — «همه چیز ثبت بشه که فراموشی اتفاق نیفته».

The owner's rule for this page (2026-07-25): a recent kindness must never
erase a long record, in either direction. ``score_from_deeds`` decays on
purpose (that is the *mood*); ``ledger_from_deeds`` is the permanent record
next to it. Plus: the owner's own verdict on the relationship beats the
computed one, and افراد has its place in the خداشهر map.
"""
from __future__ import annotations

import datetime as dt
from datetime import timedelta, timezone

import pytest


# ── the permanent ledger ────────────────────────────────────────────────────

def test_ledger_keeps_what_the_score_forgets():
    from app.services.ai.person_behavior import ledger_from_deeds, score_from_deeds

    now = dt.datetime.now(timezone.utc)
    deeds = [
        {"valence": -1, "at": (now - timedelta(days=300)).isoformat(), "note": "بدقولی"},
        {"valence": -1, "at": (now - timedelta(days=280)).isoformat(), "note": "بدقولی دوم"},
        {"valence": -1, "at": (now - timedelta(days=260)).isoformat(), "note": "بدقولی سوم"},
        {"valence": 1, "at": now.isoformat(), "note": "یک لطفِ تازه"},
    ]
    # the decayed score forgets the three old bad deeds — that is its job
    assert score_from_deeds(deeds, now=now)["ai_score"] > 50
    # the ledger does NOT: three bad, one good, all-time
    led = ledger_from_deeds(deeds, now=now)
    assert led["good"] == 1 and led["bad"] == 3
    assert led["balance"] == -2 and led["total"] == 4
    assert led["first_at"] and led["last_at"] and led["first_at"] < led["last_at"]


def test_ledger_surfaces_flagged_entries_newest_first():
    from app.services.ai.person_behavior import ledger_from_deeds

    now = dt.datetime.now(timezone.utc)
    led = ledger_from_deeds([
        {"valence": 1, "at": (now - timedelta(days=90)).isoformat(),
         "note": "قرض داد", "important": True},
        {"valence": -1, "at": now.isoformat(), "note": "زیرش زد", "important": True},
        {"valence": 1, "at": now.isoformat(), "note": "سلام کرد"},  # not flagged
    ], now=now)
    assert [e["note"] for e in led["flagged"]] == ["زیرش زد", "قرض داد"]
    assert led["flagged_good"] == 1 and led["flagged_bad"] == 1


def _person(api_client, name="علی"):
    return api_client.post("/api/persons", json={"name": name}).json()["id"]


def test_profile_endpoint_carries_name_ledger_and_persian_relationship(api_client):
    pid = _person(api_client, "مرتضی")
    api_client.post(f"/api/people/{pid}/profile/deed",
                    json={"kind": "good", "note": "کمکم کرد", "important": True})
    api_client.post(f"/api/people/{pid}/profile/deed", json={"kind": "bad", "note": "بدقولی"})

    body = api_client.get(f"/api/people/{pid}/profile").json()
    assert body["person_name"] == "مرتضی"          # header stopped saying «پروفایل فرد»
    assert body["ledger"]["good"] == 1 and body["ledger"]["bad"] == 1
    assert len(body["ledger"]["flagged"]) == 1
    assert body["relationship_fa"]                  # Persian, not the raw English key
    # the original contract is untouched
    assert "ai_score" in body and "behavior_log" in body and "relationship_type" in body


def test_owner_verdict_beats_the_scorer_and_can_be_cleared(api_client):
    pid = _person(api_client, "رضا")
    # three bad deeds ⇒ the scorer says strained/distant
    for i in range(3):
        api_client.post(f"/api/people/{pid}/profile/deed", json={"kind": "bad", "note": f"م{i}"})
    computed = api_client.get(f"/api/people/{pid}/profile").json()["relationship_type"]
    assert computed in ("strained", "distant")

    r = api_client.put(f"/api/people/{pid}/profile/relationship", json={"relationship": "close"})
    assert r.status_code == 200
    body = r.json()
    assert body["relationship"] == "close" and body["relationship_fa"] == "نزدیک"
    assert body["relationship_override"] == "close"
    # the computed value is kept underneath — nothing is destroyed
    assert body["relationship_type"] == computed
    # …and it survives a re-read
    assert api_client.get(f"/api/people/{pid}/profile").json()["relationship"] == "close"

    # clearing hands the call back to the scorer
    cleared = api_client.put(f"/api/people/{pid}/profile/relationship", json={"relationship": ""}).json()
    assert cleared["relationship_override"] is None
    assert cleared["relationship"] == computed


def test_unknown_relationship_is_refused(api_client):
    pid = _person(api_client, "نادر")
    r = api_client.put(f"/api/people/{pid}/profile/relationship", json={"relationship": "دشمن"})
    assert r.status_code == 400
    assert api_client.put("/api/people/999999/profile/relationship",
                          json={"relationship": "close"}).status_code == 404


def test_summary_row_carries_ledger_and_dates_in_one_request(api_client):
    created = api_client.post("/api/persons", json={"name": "سمیه", "birthday": "1990-03-04"}).json()
    pid = created["id"]
    api_client.post(f"/api/people/{pid}/profile/deed", json={"kind": "good", "note": "خوبی"})

    row = [r for r in api_client.get("/api/people-profiles/summary").json() if r["id"] == pid][0]
    assert row["ledger"]["good"] == 1
    assert row["birthday"] == "1990-03-04"       # no second /persons request needed
    assert row["relationship_fa"]


def test_suggestions_read_the_all_time_ledger_not_the_mood(api_client):
    """Three old bad deeds + one fresh good one: the decayed score is high, but
    the suggestions must still speak from the whole record."""
    pid = _person(api_client, "کاظم")
    for i in range(3):
        api_client.post(f"/api/people/{pid}/profile/deed", json={"kind": "bad", "note": f"بد{i}"})
    api_client.post(f"/api/people/{pid}/profile/deed", json={"kind": "good", "note": "خوبِ تازه"})
    text = " ".join(api_client.get(f"/api/people/{pid}/profile/suggestions").json()["suggestions"])
    assert "3 مورد منفی" in text


# ── افراد's place in the city ───────────────────────────────────────────────

@pytest.mark.asyncio
async def test_people_ledger_appears_in_the_digaran_district(db_session):
    from app.models.person import Person
    from app.services import person_profile_service as pps
    from app.services import sahat_service as ss

    p = Person(user_id=0, name="حسین")
    db_session.add(p)
    await db_session.flush()
    await pps.record_deed(db_session, person_id=p.id, kind="good", note="قرض داد", important=True)
    await pps.record_deed(db_session, person_id=p.id, kind="bad", note="دیر پس داد")

    district = await ss.build_sahat_district(db_session, 0, "digaran")
    detail = district["sahats"][0]["detail"]
    row = [r for r in detail["people"] if r["id"] == p.id][0]
    assert row["name"] == "حسین" and row["good"] == 1 and row["bad"] == 1
    assert row["flagged"] == 1 and detail["people_flagged"] == 1
    # a calm standing reminder, not a nag per person
    labels = [a["label"] for a in district["sahats"][0]["attention"]]
    assert any("یادم بماند" in ln for ln in labels)
