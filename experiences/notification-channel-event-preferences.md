---
title: "Server-side notification preferences (per-event + per-channel routing)"
tags: ["notifications", "preferences", "channels", "fastapi", "settings"]
topic_canonical: "notification-channel-event-preferences"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-06-28T00:00:00Z"
created_at: "2026-06-28T00:00:00Z"
updated_at: "2026-06-28T00:00:00Z"
merged_from: []
---

# Server-side notification preferences (per-event + per-channel routing)

## 🎯 چالش / Challenge

A notification helper (`notify_event`) hard-codes its routing: every registered
event always sends, always "loud", to every channel it's registered for. The UI
*looks* like it has preference toggles, but they only write **localStorage** — so
flipping them changes nothing about what the backend actually sends. We want one
real, server-backed control surface: per-event "send or not" + "sound or not",
per-channel on/off (in-app / telegram / email), and a global minimum priority —
**without** changing behaviour for installs that never touch the settings.

## 💡 راه‌حل / Solution

A small **preferences module** the notification helper consults, with three
properties that make it safe to add to a live system:

1. **Defaults reproduce the old behaviour exactly.** Cold cache / unconfigured ⇒
   every event enabled, loud, telegram on. So adding the gate is behaviour-
   preserving; only an explicit user change alters anything.
2. **Hot path never hits the DB.** Prefs live in a process-wide cache, warmed
   once at startup and refreshed on every save. `notify_event` reads predicates
   (`event_enabled` / `priority_allowed` / `event_sound` / `channel_enabled`)
   that fall back to defaults when the cache is cold — so it works whether or not
   a DB session is in scope, and a prefs glitch can never block a notification.
3. **Stored where it survives.** A single JSON blob in an existing key/value
   settings table (not a file — ephemeral hosts wipe files on redeploy; not a new
   table — no migration).

Wire-in is four predicate checks inside the helper, all wrapped best-effort:

```
if not prefs.event_enabled(event):   return None          # "send or not"
if not prefs.priority_allowed(prio): return None          # min priority
if silent is None:                                         # "sound or not"
    silent = not prefs.event_sound(event)
... persist the in-app row (always — the bell is the system of record) ...
if not silent and prefs.channel_enabled("telegram") and "telegram" in reg.channels:
    fan_out_telegram(...)
if not silent and prefs.channel_enabled("email") and "email" in reg.channels and recipient:
    fan_out_email(...)
```

The settings UI is one GET (prefs + an event catalog + a channel catalog) and one
PUT (deep-merged partial). A "send test" POST per channel proves the wiring.

## 🧪 نمونه کد (Anonymized)

```python
DEFAULTS = {"events": {e: True for e in EVENTS}, "sound": {e: True for e in EVENTS},
            "channels": {"in_app": {"enabled": True}, "telegram": {"enabled": True},
                         "email": {"enabled": False}}, "min_priority": "low"}
_cache = None                          # process-global; None ⇒ not loaded yet

def get_prefs():                       # DB-free; safe in the hot path
    return _cache if _cache is not None else dict(DEFAULTS)

async def load_prefs(db):              # startup + GET endpoint
    global _cache
    row = await db.get_setting("notif_prefs")
    _cache = deep_merge(DEFAULTS, json.loads(row.value) if row else {})
    return _cache

async def save_prefs(db, partial):     # PUT endpoint
    global _cache
    merged = deep_merge(get_prefs(), partial)
    await db.upsert_setting("notif_prefs", json.dumps(merged))
    _cache = merged
    return merged

def event_enabled(e):  return get_prefs()["events"].get(e, True)     # unknown ⇒ on
def event_sound(e):    return get_prefs()["sound"].get(e, True)
def channel_enabled(c):return get_prefs()["channels"].get(c, {}).get("enabled", c == "in_app")
def priority_allowed(p): return RANK.get(p, 0) >= RANK.get(get_prefs()["min_priority"], 0)
```

## ⚠️ نکات حیاتی / Pitfalls

- **A process-global cache leaks across tests.** Reset it (`set_cache(None)`) in
  an autouse fixture before AND after each test, or one test's "disable
  verify_failed" silently fails an unrelated fan-out test later in the run.
- **Keep the in-app row always written** when the event is enabled — it's the
  bell's history/audit. Only gate the *external* channels by channel prefs, or
  callers expecting a returned row break.
- **`silent` default must become `None`, not `False`**, so "caller didn't say" is
  distinguishable from "caller wants loud" — only then can the sound pref decide.
  Existing callers that pass `silent=True/False` keep their exact behaviour.
- **Warm the cache at startup.** Without it, saved prefs don't take effect until
  the first GET — a confusing "my setting didn't apply after restart" bug.
- **Don't store prefs in a file on an ephemeral host** — it resets every deploy.
  A row in an existing settings table needs no migration and persists.
- **Unknown events default to enabled.** New event types must keep working before
  anyone adds them to the catalog.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. Pick a store that persists without a migration (an existing key/value/settings
   table) and a single JSON key.
2. Define `DEFAULTS` so that "cold cache" == "current behaviour" — this is what
   makes the change safe to ship.
3. Add `get_prefs` (cache-or-defaults, DB-free) + `load_prefs`/`save_prefs`
   (persist + refresh cache). Warm at startup.
4. Insert four predicate checks into the send helper; wrap them best-effort so a
   prefs failure degrades to "send anyway", never "crash the request".
5. Expose `GET`/`PUT /preferences` (return the prefs + an event catalog + a
   channel catalog the UI renders) and a `POST /test?channel=` per channel.
6. In the UI, unify all channels (in-app + every external transport) under one
   settings surface — embed each channel's own connection panel as a section, not
   a separate tab, so "where do I configure notifications?" has one answer.

## 🔗 References
- مرتبط: [bidirectional-telegram-bot-webhook] (the Telegram channel this routes to)
