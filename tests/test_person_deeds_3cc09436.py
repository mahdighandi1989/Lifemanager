"""Good/bad deeds + decay scoring, tone, reminders, suggestions (audit task 3cc09436).

Closes the Steps 4/5/7/8/9/10 the canonical 6 ACs flattened: record good/bad
deeds ("کارهای بد و خوبش ثبت بشه"), time-decayed valence scoring (Step 5), tone
analysis of notes feeding the score (Step 10), reminders ("فراموش نکنم", Step 8),
and actionable suggestions (Step 9).
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest


def test_score_from_deeds_good_vs_bad_and_decay():
    from app.services.ai.person_behavior import score_from_deeds

    now = datetime.now(timezone.utc)
    good = [{"valence": 1, "at": now.isoformat()} for _ in range(3)]
    bad = [{"valence": -1, "at": now.isoformat()} for _ in range(3)]
    assert score_from_deeds(good, now=now)["ai_score"] > score_from_deeds(bad, now=now)["ai_score"]

    # an OLD good deed decays — a recent bad deed dominates the relationship
    mixed = [
        {"valence": 1, "at": (now - timedelta(days=200)).isoformat()},
        {"valence": -1, "at": now.isoformat()},
    ]
    s = score_from_deeds(mixed, now=now)
    assert s["ai_score"] < 50  # recent bad outweighs the long-faded good


def _make_person(api_client, name="Ali"):
    return api_client.post("/api/persons", json={"name": name}).json()["id"]


def test_record_good_then_bad_deed_moves_score(api_client):
    pid = _make_person(api_client)
    after_good = api_client.post(f"/api/people/{pid}/profile/deed", json={"kind": "good", "note": "کمکم کرد"}).json()
    assert after_good["ai_score"] > 50
    after_bad = api_client.post(f"/api/people/{pid}/profile/deed", json={"kind": "bad", "note": "بدقولی کرد"}).json()
    assert after_bad["ai_score"] < after_good["ai_score"]
    # the deeds are recorded in the behaviour log
    deeds = [e for e in after_bad["behavior_log"] if e.get("type") == "deed"]
    assert len(deeds) == 2


def test_note_tone_feeds_log(api_client):
    pid = _make_person(api_client)
    body = api_client.post(
        f"/api/people/{pid}/profile/note", json={"user_notes": "خیلی ناراحت و عصبانی هستم از او"}
    ).json()
    note_entries = [e for e in body["behavior_log"] if e.get("type") == "note"]
    assert note_entries and note_entries[-1]["valence"] <= 0  # negative tone detected


def test_reminders_and_suggestions(api_client):
    pid = _make_person(api_client)
    api_client.post(f"/api/people/{pid}/profile/deed", json={"kind": "good", "note": "قرض داد", "important": True})
    rem = api_client.get(f"/api/people/{pid}/profile/reminders").json()
    assert rem["reminders"] and rem["reminders"][0]["important"] is True

    sug = api_client.get(f"/api/people/{pid}/profile/suggestions").json()
    assert sug["suggestions"] and isinstance(sug["suggestions"], list)


def test_deed_missing_person_404(api_client):
    assert api_client.post("/api/people/999999/profile/deed", json={"kind": "good"}).status_code == 404
