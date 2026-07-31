---
title: A capture channel that can be revoked must expose its own liveness, or absence reads as "nothing happened"
tags:
  - observability
  - ingest
  - mobile
  - android-permissions
  - diagnostics
topic_canonical: silent-capture-channel-needs-a-liveness-surface
source:
  type: claude-code-task
  origin: claude-code
  imported_at: "2026-07-31T00:00:00Z"
created_at: "2026-07-31"
updated_at: "2026-07-31"
merged_from: []
---

# Silent capture channels need a liveness surface

## 🎯 چالش / Challenge

A system ingests events from several capture channels (phone SMS, notification
listener, call log, screen reader, usage stats, heartbeat). The owner opened the
activity log expecting to find a messenger notification and found **nothing** —
and reasonably concluded *"then it's probably missing lots of other things too."*

The server path was in fact healthy and covered by tests. The event had never
arrived. The OS had revoked the notification-listener grant (Android drops
`BIND_NOTIFICATION_LISTENER_SERVICE` whenever the app is reinstalled, or
re-signed with a different key), and the service died quietly.

The real defect was not the revoked permission — permissions get revoked, that's
normal. The defect was that a dead channel and an idle channel produce the
**identical observation**: an empty list. Absence of data is indistinguishable
from absence of events, so the failure is invisible until a human happens to go
looking for something they *know* occurred. Every ingest channel that depends on
a grant the OS/user/provider can withdraw (OS permissions, OAuth refresh tokens,
webhooks, API keys, polling cursors) has this property.

## 💡 راه‌حل / Solution

Make each channel report its own liveness, on **both** sides of the wire, and put
that report on the page where the user notices the absence.

1. **A per-channel diagnostics endpoint** (server side). For every channel emit
   `{count_24h, count_7d, last_at, status, hint}` where status is a three-way
   value — not a boolean:
   - `never` — the channel has produced zero events *ever* → likely never
     granted / never configured.
   - `silent` — it has produced events before but nothing within its expected
     window → likely **revoked**, and this is the state that used to be invisible.
   - `ok` — recent data.
   The three-way split is the whole trick: `never` and `silent` have completely
   different causes and different fixes, and collapsing them into "empty" is what
   hides the bug. Derive the counts from the log you already write — no new table.
2. **A `hint` string per channel, in the user's language**, describing the fix for
   *that* channel ("notification access is revoked on every reinstall — re-enable
   it in Settings → Notification access"). The diagnosis belongs next to the
   symptom, not in the docs.
3. **Surface it on the page where absence is observed** — the activity log — as a
   compact collapsible strip of ✅/❌ per channel, not on a separate admin page.
   A diagnostics page nobody visits fixes nothing.
4. **Show live grant status on the device too**, read from the OS rather than
   assumed from install state (on Android, notification access must be read from
   `Settings.Secure.enabled_notification_listeners`; holding a manifest
   permission proves nothing about a *listener* binding). Refresh in `onResume`
   so returning from the settings screen updates the indicator.
5. **A round-trip test button** on the device that emits one synthetic event
   through the whole chain. It converts "is anything working?" into a yes/no the
   user can answer in five seconds, and it distinguishes a dead capture channel
   from a dead network/auth path.

## ⚠️ دام‌ها / Pitfalls

- **Reinstall revokes special grants.** Notification listener / accessibility /
  usage-stats bindings are dropped on reinstall and on signature change. If CI
  signs each build with a throwaway key, every update silently disarms the app.
  Ship a stable signing key, and warn that a one-time uninstall/reinstall is
  needed when the key changes.
- **Liveness must be measured with the server-receive time, not the event's own
  timestamp.** These are different clocks and picking the wrong one inverts the
  answer. A channel whose worker is healthy but ships week-old records (a call
  log, a backfill) looks dead if you rank by event time; the receive time
  correctly says "this channel is reporting". Show the event time to the user,
  but compute `silent` from when you heard from it.
- **Three-way status is not optional — it is the whole feature.** A first
  version here graded `ok` whenever the lifetime count was above zero, which
  meant a channel that worked and then died stayed green forever: it could not
  detect the exact failure it was built for. Grade against a *window*, per
  channel, with a period matched to that channel's natural rhythm.
- **A dead device must not be reported as five dead channels.** If the agent
  itself has stopped reporting, per-channel verdicts are noise. Add an
  `unknown` state gated on the agent's own liveness and say so plainly.
- **A grant report beats any inference.** Once the device sends its actual
  permission state, `off` replaces guesswork entirely — keep the inferred
  `silent` only as the fallback for clients too old to report.
- **Don't alert on a channel that legitimately idles.** Pick the silence window
  per channel (a heartbeat every 15 min ≠ a call log that can be empty for days),
  and only alert on `silent`, never on `never`.
- **Empty state must say something.** "No records" is the message that caused the
  confusion; "no records — notification channel ❌ disconnected" is the fix.

## 🔁 How to Apply Elsewhere

Any project ingesting from a revocable source:

1. Enumerate your capture channels. For each, ask: *if this stopped right now,
   what would I see?* If the answer is "an empty list", it needs a liveness
   surface.
2. Add `GET /diagnostics` (or extend an existing status endpoint) returning per
   channel: last-seen timestamp, counts over two windows, three-way status
   (`ok|silent|never`), and a human fix hint. Compute it from data you already
   store.
3. Render it where the user first notices the gap, and in the empty state of the
   list itself.
4. If a device/agent holds the grant, have it report the grant's *current* value
   read from the platform, not a cached "we asked for it once" flag.
5. Add a synthetic end-to-end test event the user can trigger on demand.
6. Wire `silent` into whatever already alerts (digest email, push), with a
   cooldown and an explicit all-clear when it recovers.

The general principle: **a pipeline that can go quiet must be able to say that it
has gone quiet.** Correctness tests on the server prove the code works; only a
liveness surface proves the data is arriving.
