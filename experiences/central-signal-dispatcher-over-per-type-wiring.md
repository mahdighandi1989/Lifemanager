---
title: A central classify-then-route dispatcher beats per-type hand-wiring for ingest
tags:
  - ingest
  - routing
  - architecture
  - extensibility
  - inbox-triage
topic_canonical: central-signal-dispatcher-over-per-type-wiring
source:
  type: claude-code-task
  origin: claude-code
  imported_at: "2026-07-31T00:00:00Z"
created_at: "2026-07-31"
updated_at: "2026-07-31"
merged_from: []
---

# Central classify-then-route dispatcher over per-type hand-wiring

## 🎯 چالش / Challenge

A stream of heterogeneous signals arrives from one source (a phone: SMS,
notifications, calls, screen text — and tomorrow a dozen more kinds). The first
instinct is to hand-wire each type where it enters: "if it's a bank SMS call
the finance service; if it's a call link it to a person." That does not scale —
the owner's exact objection: *"you only wired calls; a thousand other data
types will arrive, each must go to its own place and be analyzed — how?"* Worse
failure modes appear: (a) unrecognized-but-meaningful data silently rots in a
log (wasted), or (b) everything is dumped into one queue and floods it (noise).

## 💡 راه‌حل / Solution

One **dispatcher** every signal passes through, with two moving parts:

1. `classify(sender, text) -> category` — an ordered rule list; first match
   wins (noise categories first so an OTP that mentions "balance" is caught as
   OTP, not finance). Categories include explicit **noise** labels
   (otp/promo/mirror-of-another-source) that are recognized precisely so they
   can be *dropped from routing*.
2. `dispatch(signal) -> {category, routed_to}` — a registry
   `{category: async router}`. Each router HANDS OFF to the existing domain
   service (finance engine, person interactions, the universal inbox); it never
   re-implements a domain. Adding a new routed type = add a classifier branch +
   one registry line.

The load-bearing idea: the **catch-all router is the existing AI-triage inbox**.
Anything actionable the dispatcher can't confidently place becomes an inbox
item, and the inbox's own AI decides task/todo/calendar/note. So the system is
extensible to unknown future types *without new code* — and nothing is wasted.

Anti-flood rule: only *actionable/known* categories route to a domain or the
inbox. Neutral chatter and noise are NOT routed — they still live in the raw
activity log (+ aggregate insights + archive), so they're analyzable in bulk
but never clutter a domain. "Captured everywhere, routed only when it means
something."

## 🧪 نمونه کد (Anonymized)

```python
_ROUTERS = {                      # add a type → add a line
    "finance": route_finance,
    "appointment": route_inbox,
    "task": route_inbox,
}
_NOISE = {"mirrored", "otp", "promo"}

async def dispatch(db, uid, *, sender, text, occurred_at, ref):
    category = classify(sender, text)          # first-match-wins rules
    if category in _NOISE:
        return {"category": category, "routed_to": None}   # logged, not routed
    out = {"category": category, "routed_to": None}
    if category in ("message", "appointment", "task"):
        pm = await route_person_if_known(db, uid, sender, text, ref)  # contact → profile
        out.update(pm)
    router = _ROUTERS.get(category)
    if router:
        res = await router(db, uid, sender, text, occurred_at, ref)
        out["routed_to"] = res.get("routed_to") or out["routed_to"]
    return out                                  # never raises
```

## ⚠️ نکات حیاتی / Pitfalls

- **Order the classifier by specificity, noise first.** An OTP SMS often
  contains "balance"/"account"; if the finance rule runs first it hijacks it.
- **Dedup needs a stable `source_ref` per signal** (hash of sender+text+time),
  checked in EVERY router (finance hash, inbox `suggestion.source_ref`,
  interaction `dedup_note`) — the same phone re-syncs its whole history.
- **Commit discipline:** if a shared `record_activity` commits the request
  session before the router's own writes, those writes are only flushed and
  vanish on session close — commit inside the router (or after it).
- **Don't flood the catch-all.** Routing *every* message to the inbox turns the
  triage queue into noise; gate on actionable categories, keep chatter
  log-only. The owner asked for "goes to its place," not "everything in one box."
- **Keep the full raw record regardless of routing** — routing is about
  *action*, not *capture*. The activity log (+ archive + aggregate insights) is
  the complete memory; the dispatcher only decides what additionally deserves a
  domain.
- **Noise is data too:** recognize otp/promo/mirror explicitly and keep them in
  the log for aggregate analysis — just never route them.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. Put ONE dispatcher between any heterogeneous ingest source and your domains.
   Never classify-and-act inline at the entry point per type.
2. Model categories as an ordered rule list returning a single label; include
   explicit *noise* labels so you can drop them from routing deliberately.
3. Make routers thin adapters over existing domain services; a registry maps
   category→router so growth is additive (one line), not scattered edits.
4. Use your existing review/triage queue (with AI if you have it) as the
   catch-all for meaningful-but-unclassified items — that is what makes the
   design open-ended without code per future type.
5. Separate CAPTURE (log everything, always) from ROUTE (act only when
   confident) so nothing is lost and nothing floods.
6. Every router dedups on a stable per-signal id; watch commit boundaries when
   a shared logger commits the session first.

## 🔗 References

- The universal-capture inbox pattern (AI triage as the catch-all filer).
- generic-activity-log-with-entity-linking (the raw complete record the
  dispatcher observes but does not replace).

## Update 2026-07-31 — generalizing the dispatcher to non-mobile sources

Once a second and third source (calendar sync, chat bot, file attachments) were
pushed through the same dispatcher, three gaps appeared that a single-source
design never exposes. All three are general.

**1. Per-source suppression must be a parameter, not a branch.** A calendar event
classified as `appointment` should *not* be copied into the inbox — the event
already is the appointment; the copy is pure noise. But an SMS classified
`appointment` absolutely should be. The fix is a `skip_categories=(...)` argument
supplied by the caller, rather than teaching the classifier about its callers.
Same for the interaction type a source implies: a calendar hit is a `meeting`, an
SMS is a `message` — pass `interaction_type` in, don't infer it inside.

**2. Suppression must not suppress identity.** The subtle ordering bug: with
`skip_categories` checked first, «جلسه با علی» (a meeting with a known contact)
was dropped whole — no inbox copy (correct) *and* no interaction on Ali's profile
(wrong). Person/entity resolution is not one of the domain routes; it is a
cross-cutting enrichment that must run **before** any per-source suppression:

```
if category in NOISE: return
route_to_person(...)          # always — identity is not a destination
if category in skip_categories: return
route_to_domain(...)
```

**3. Match entities by every identifier the source can carry.** The dispatcher
originally matched contacts by phone-number tail, which is all an SMS has. A
messenger notification's title is a **display name**, and a calendar summary is
free text — so name matching (longest match wins, to stop "Ali" swallowing
"Ali Rezaei") had to be added. Rule: the entity resolver takes the whole signal,
not the field one source happens to populate.

**4. A source with its own mini-brain still needs the shared one.** The chat bot
had grown a private 2-destination router and never handed media to the file
extractor. The correct shape is: shared dispatcher first, source-specific flow
only for what the dispatcher declined to route.

**5. Enrichment merges, it never overwrites.** Attachment extraction produces
high-confidence structured fields; the AI triage pass produces additional ones
(due date, list, section, person). Merge field-by-field into empty slots only,
and allow type upgrades in one direction only (`note → task`), so a guess can
never overwrite a determination.
