---
title: "Activate empty pages by wiring existing pieces, not building new ones"
tags: ["product-audit", "auto-ingest", "review-queue", "integrations", "dead-code", "activation"]
topic_canonical: "activate-passive-pages-by-wiring-not-building"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-21T00:00:00Z"
created_at: "2026-07-21T00:00:00Z"
updated_at: "2026-07-21T00:00:00Z"
merged_from: []
---

# Activate empty pages by wiring existing pieces, not building new ones

## 🎯 چالش / Challenge

A mature app "feels empty and pointless" — page after page shows *nothing*, and
the owner concludes the whole thing is hollow. The instinct is to build more
features. That's almost always the wrong diagnosis. When you audit each surface
honestly (from the *user's* lived perspective, not "does the code compile"), the
real pattern is usually one of three, and only one of them is "missing
capability":

1. **passive-empty** — the page has a complete backend + extractor, but *no
   automatic feeder ever calls it*. It waits for a manual upload/curl that
   never comes. The capability exists; the *input* doesn't.
2. **duplicate / nav-clutter** — the same capability reachable many ways; two
   parallel menus; deep-link aliases. Adds felt clutter, zero capability.
3. **genuinely-dead** — infra for a product this isn't (multi-tenant admin,
   external-PM connectors on a single-user app).

The fix for (1) — the bulk — is not "build a feature." It's **wire an existing
signal source to the extractor that already exists, landing candidates in the
review queue that already exists**, so the page fills itself.

## 💡 راه‌حل / Solution

1. **Audit by lived state, adversarially.** For every surface answer "when the
   owner opens this, is there anything here, and does it *do* anything?" Fan out
   one reviewer per page-group, then run a completeness critic that catches the
   reviewers' own bias — the classic bias is judging "is there data *now*"
   (production DB is empty) instead of "is the capability *wired*", which
   mislabels working data-entry pages as dead.
2. **Before writing any new model, inventory what exists.** In a grown app the
   expensive parts are usually already there: a capture/review **inbox** (with
   triage + file-into-typed-row + dismiss), **extractors**, a **sync loop**
   pulling the external signal, and **downstream consumers** (reminders,
   dashboards) already reading the target table. The activation is a few dozen
   lines of glue, not a subsystem.
3. **Reuse the review queue instead of building one.** If an inbox model has a
   free-form `suggested_type` + a JSON `suggestion` payload, a new candidate
   kind (e.g. "subscription", "document") rides the *entire* existing
   review→file→undo flow and UI with only: add the type to the accepted set,
   add one `_file_as_X` handler, add a label to the frontend chip map.
4. **Hook the feeder into the loop that already runs.** The email-sync already
   classifies every message; add one best-effort call in that pass to detect
   your signal and drop a candidate. No new scheduler, no new API polling.
5. **Precision + idempotency + opt-in + fail-open**, in that order of
   importance, because these candidates are shown to a human:
   - precision: only recognised sources create a candidate (a generic receipt
     doesn't) — noise in a review queue is expensive.
   - idempotent: no candidate when the target row already exists, nor when an
     identical pending candidate is queued.
   - opt-in: gate on a flag (default per the owner's explicit consent) with a
     visible toggle — scanning someone's mailbox is a privacy decision.
   - fail-open: a parse error must never break the sync loop it rides in.

## 🧪 نمونه کد (Anonymized)

```python
# Feeder hooked into the existing per-item sync/triage pass:
for item in newly_synced:
    classify_and_store(item)              # existing behavior
    await route_candidate(db, item)       # <-- one added best-effort call

async def route_candidate(db, item):
    try:
        if not await flag_enabled(db):         return False   # opt-in
        source = detect_known_source(item)                     # precision
        if not source or not looks_like_signal(item): return False
        if await already_known(db, source):    return False   # idempotent
        db.add(ReviewItem(suggested_type="subscription",
                          suggestion={"source": source, **extract(item)}))
        return True
    except Exception:                          # fail-open
        return False

# Reuse the queue's file step — one handler + register it:
FILE_HANDLERS["subscription"] = _file_as_subscription   # -> creates the typed row
```

## ⚠️ نکات حیاتی / Pitfalls

- **Don't add a new table when the inbox already is a queue.** A parallel
  "candidates" table duplicates list/file/dismiss/undo and its whole UI.
- **A passive-empty page is not a dead page.** Deleting it destroys a wired
  capability; it just needs a feeder. Reserve removal for genuinely-dead infra,
  and even then quarantine (drop from nav), don't delete.
- **The feeder's value depends on the signal being connected.** Auto-ingest
  from Gmail is worthless if the mailbox isn't linked — confirm the integration
  is live (or that the owner will link it) before building, and say so.
- **Guard against re-ingest storms.** Without the "already known" check, every
  sync re-creates the same candidate.
- **Judging by current data understates coverage.** In a data-less staging/prod
  DB almost everything renders empty; that is not evidence a page is dead.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. Audit surfaces by lived state; bucket into alive / passive-empty /
   duplicate / dead. Expect passive-empty to dominate.
2. For each passive-empty page, find its extractor, a signal source (email,
   drive, webhook), a review queue, and the downstream consumer — usually all
   present.
3. Wire feeder → extractor → **existing** review queue (new candidate kind on
   the existing model) → existing file handler → existing downstream.
4. Make it precise, idempotent, opt-in, fail-open; put the candidates where the
   user already looks.
5. Only after real data flows, consider a uniqueness constraint / new UI. Build
   the *least* new surface that closes the loop.

## 🔗 References

- مرتبط: `soft-delete-tombstone-must-filter-every-read-path`,
  `universal-capture-inbox-with-ai-triage`,
  `holistic-island-audit-with-adversarial-verification`
