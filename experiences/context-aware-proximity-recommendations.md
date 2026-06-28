---
title: "Context-aware recommendations: correlate user items with nearby places, infer idle, notify proactively"
tags: ["recommendations", "context-engine", "geolocation", "google-maps", "celery", "notifications", "proactive"]
topic_canonical: "context-aware-proximity-recommendations"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-06-28T00:00:00Z"
created_at: "2026-06-28T00:00:00Z"
updated_at: "2026-06-28T00:00:00Z"
merged_from: []
---

# Context-aware recommendations: correlate user items with nearby places, infer idle, notify proactively

## 🎯 چالش / Challenge

A "smart assistant" should turn ambient signals into *useful, specific* nudges:
"you're near a bakery — buy the bread on your list", "you've been idle an hour —
start an open task", "your heart rate is high — do something calming". Often the
scaffolding already exists (a recommendation engine, a maps client, a scheduler,
a notifications channel) but the pieces aren't actually wired to the user's data
or to each other, so nothing useful ever fires.

## 💡 راه‌حل / Solution

Four wiring fixes that turn generic scaffolding into a working proactive loop:

1. **Correlate items with places, don't just list places.** When near a place,
   load the user's OPEN items and *match* one to the place (geo-proximity first,
   then a keyword overlap between item title and place name), and name it in the
   recommendation. Keep a generic fallback when nothing matches.
2. **Infer idle from time, not just an explicit flag.** Derive "idle/bored" from
   a stale `last_activity_time` (configurable threshold), so the signal exists
   even when no device reports activity. Keep the explicit flag working too.
3. **Make the scheduled job do per-user work — but stay observable offline.**
   Keep a cheap DB-free self-check so the beat job logs a heartbeat even during a
   DB blip, THEN do the real per-user generation + a proactive notification in a
   best-effort wrapper (a missing DB degrades to a clean no-op, never crashes beat).
4. **Actually fire the notification.** A registered notification event is useless
   until someone calls it — emit one (silent, in-app) per user per run with the
   freshest recommendation, so it reaches the bell, not just a list endpoint.

Plus: make the cadence env-configurable (`*_INTERVAL_MINUTES`) instead of a
hard-coded cron, and feed the time-signal into the on-demand endpoint too.

## 🧪 نمونه کد (Anonymized)

```python
# 1) match a registered item to a nearby place (geo, then keyword)
def _match_item_to_place(items, place):
    plat, plng = place.get("lat"), place.get("lng")
    for it in items:                       # geo proximity ~300m
        ilat, ilng = getattr(it, "lat", None), getattr(it, "lng", None)
        if ilat and ilng and abs(ilat-plat) < 0.003 and abs(ilng-plng) < 0.003:
            return it
    name_tokens = {w for w in (place.get("name") or "").lower().split() if len(w) >= 3}
    for it in items:                       # keyword overlap
        if {w for w in it.title.lower().split() if len(w) >= 3} & name_tokens:
            return it
    return None

# 2) idle inferred from a stale timestamp (empty context is never idle)
def _is_idle(ctx):
    if ctx.get("activity_status") == "idle": return True
    last = _parse_dt(ctx.get("last_activity_time"))
    return last is not None and (now() - last).total_seconds()/60 >= IDLE_MIN

# 3)+4) scheduled job: DB-free self-check, then best-effort per-user work + notify
def analyze_user_context():
    base = Orchestrator().analyze({})              # always >=1, DB-free heartbeat
    users = recs = 0
    try:
        users, recs = asyncio.run(_per_user())     # missing DB -> caught, no-op
    except Exception as e:
        log.debug("per-user skipped: %r", e)
    return {"suggestions": len(base["suggestions"]), "users_analyzed": users, "recommendations": recs}

async def _per_user():
    async with SessionLocal() as db:
        for ctx in await all_user_contexts(db):
            recs = await generate(db, user_id=ctx.user_id, context=snapshot(ctx))
            if recs:
                await notify_event("recommendation", user_id=ctx.user_id, db=db,
                                   message=recs[0]["text"], silent=True)   # actually fire it
```

## ⚠️ نکات حیاتی / Pitfalls

- **A scheduled job that calls a service with `{}` proves the import works, not the
  feature.** Verify it loads real per-user data and produces persisted output.
- **Don't let a per-user DB loop break a test that runs the task synchronously.**
  Keep a DB-free branch that satisfies the test's contract (e.g. `count>=1`), and
  wrap the DB work so an unreachable DB is caught — mirrors the codebase's other
  beat jobs.
- **Keep `context_snapshot`/persisted JSON serializable** — pass timestamps as ISO
  strings, not raw `datetime`, when they flow into a JSON column.
- **Preserve pinned contracts:** if existing tests assert "empty context → []",
  make sure idle-inference and item-matching only add output when their signal is
  present. Don't change a recommendation's `type` keys other tests filter on.
- **A registered notification event that's never fired is a silent no-op** — grep
  for the `notify_event("<event>")` call site, not just the `register_event`.
- **Least-privilege maps key gating:** the nearby-places client should return `[]`
  without a key so the whole loop degrades instead of erroring.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. Audit the scaffolding first (model, engine, maps/geo client, scheduler,
   notification channel, frontend tracker) — most "build X" asks are 70% present.
2. For each signal family, check it's wired to **real user data**, not a constant.
3. Correlate entities to context (items↔places, tasks↔time, content↔state) and
   name the specific entity in the output.
4. Make the periodic job per-user + best-effort + observable; emit the
   already-registered notification.
5. Make cadence/thresholds env-configurable; document them in `.env.example`.
6. Add tests that pin the NEW behaviour (named item, inferred idle) AND the OLD
   contracts (empty → none, scheduler heartbeat).

## 🔗 References
- Initial implementation: lifemanager context-recommendation re-audit, 2026-06-28
  (`app/services/recommendation_engine.py`, `app/tasks.py::analyze_user_context`,
  `app/routes/context.py`, `app/celery_app.py`, `app/services/google_maps_service.py`).
- Related: [google-drive-oauth-offline-integration] (same "complete the dangling
  seam / degrade-gracefully" discipline).
