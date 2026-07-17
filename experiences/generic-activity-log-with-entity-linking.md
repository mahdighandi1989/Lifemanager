---
title: "Generic activity log with two-level entity linking"
tags: ["audit-log", "activity-log", "fastapi", "sqlalchemy", "frontend", "rtl"]
topic_canonical: "generic-activity-log-with-entity-linking"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-17T00:00:00Z"
created_at: "2026-07-17T00:00:00Z"
updated_at: "2026-07-17T00:00:00Z"
merged_from: []
---

# Generic activity log with two-level entity linking

## 🎯 چالش / Challenge

An app needs a runtime «who did what, when» trail with two synchronized views:
a **global log page** where every row deep-links to the profile/section it
belongs to, and a **per-profile/per-section panel** showing only that record's
history. A reference implementation existed in a single-profile-type app
(everything hangs off one customer account number). The target app has MANY
section types (tasks, lists+items, people+deeds, accounts+transactions, …), so
the single-owner-key design doesn't transfer directly. Extra constraints:
logging must never break or slow the underlying request, rows must stay
meaningful after the entity is renamed/deleted, and the trail must be testable
under per-test in-memory databases.

## 💡 راه‌حل / Solution

1. **One append-only table** with indexed string references, **no FKs** (the
   log must survive its entity's deletion): `user_id`, `action`,
   `entity_type` + `entity_id` (the acted-on record), `detail`, `ip_address`,
   `created_at`.
2. **Generalize the owner key into a context pair.** The reference app's
   `account_no` (one owning profile) becomes `context_type` + `context_id`:
   a child event (todo item, deed/note, transaction) carries its owning
   container (list, person, account). The per-entity endpoint then matches
   `(entity == X) OR (context == X)` — so a container's panel automatically
   includes its children's events, and the global page can deep-link child
   rows to the container's page.
3. **Snapshot a human label at write time** (`entity_label` = title/name).
   The reference app resolved display names server-side per page (reverse
   lookup by owner key); with many entity types that becomes N lookups —
   a write-time snapshot is O(0) at read time and survives deletes/renames.
4. **Best-effort writer, called AFTER the commit**: keyword-only
   `record_activity(...)` that never raises; writes through the **caller's
   session** when given (critical: tests that override the DB dependency see
   the row; background jobs without a session get a private short-lived one).
5. **Read surface**: global list (filters: action, entity_type — accept a
   comma-list so a hub page can show one domain spanning several types,
   search, date range with bare-end-date-extends-to-end-of-day, pagination),
   per-entity list (OR-pair rule), CSV export (UTF-8 **BOM** for Excel),
   plus a POST for client-side-only events (print/export) so the trail stays
   complete.
6. **One shared frontend helper module** (entity→label map, action→verb map,
   action→chip-color map, `what(e)` summary, `link(e)` deep-link switch,
   locale date formatter) consumed by BOTH the global page and a reusable
   collapsible `ActivityLogPanel` — the two views can't drift apart.
7. Embed the panel per section: detail pages pass `entityType + entityId`
   (per-record trail); list/hub pages pass only `entityType` (whole-section
   trail via the global endpoint's type filter).

## 🧪 نمونه کد (Anonymized)

```python
async def record_activity(*, action, entity_type=None, entity_id=None,
                          entity_label=None, context_type=None, context_id=None,
                          detail=None, user_id=None, request=None, db=None):
    """Never raises; call AFTER the underlying commit."""
    try:
        entry = ActivityLog(..., entity_id=str(entity_id) if entity_id is not None else None)
        if db is not None:          # honours dependency overrides → visible in tests
            db.add(entry); await db.commit()
        else:                       # background writers stay independent
            async with SessionLocal() as s:
                s.add(entry); await s.commit()
    except Exception as exc:
        logger.warning("activity log write failed: %s", exc)
```

```python
# Per-entity endpoint: entity OR owning-context match.
pair = or_(
    (Log.entity_type == etype) & (Log.entity_id == eid),
    (Log.context_type == etype) & (Log.context_id == eid),
)
```

```js
// One deep-link switch shared by the global page and every panel.
export function activityLink(e) {
  switch (e.entity_type) {
    case 'container':  return `/containers/${e.entity_id}`;
    case 'child_item': return e.context_id ? `/containers/${e.context_id}` : '/containers';
    default:           return '';   // '' ⇒ row renders unlinked
  }
}
```

## ⚠️ نکات حیاتی / Pitfalls

- **Write the log AFTER the commit, through the caller's session.** Passing
  `db` and committing before the operation's own commit flushes half-done
  state; using a private session in tests writes to the *real* engine and the
  assertion sees nothing. Both bugs are silent.
- **Order by `(created_at DESC, id DESC)`.** Same-second timestamps (SQLite in
  tests, bursts in prod) make `created_at` alone non-deterministic — the id
  tiebreak keeps "newest first" true and tests stable.
- **Capture the label before destructive operations** (`title = row.title`
  *then* delete) — afterwards the ORM object may be expired.
- **`entity_id` as string, converted with `str(...)` at the seam** — int PKs,
  uuid hexes and synthetic ids (`bulk:3`) all fit; but then remember the API
  returns strings (`entity_id == str(task_id)` in assertions/links).
- CSV for Excel needs the **UTF-8 BOM** (`"﻿"` prefix) or Persian/Arabic
  text renders as mojibake.
- A "docs must list every page/route" inventory test is a gift: run the full
  suite after adding the page, not just your new tests — it catches the
  missing inventory entry immediately.
- RTL: make the panel component set `dir="rtl"` on its own root so it renders
  correctly even when a host page forgot the attribute; mixed
  Persian/Latin strings need an explicit RTL ancestor (a green build never
  catches scrambled bidi — check visually).
- Don't reuse an event-bus/broker seam for the audit trail if it's best-effort
  and lossy — the trail should not silently drop rows when a broker is down;
  inline same-session writes are simpler and transactionally adjacent.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. Create the append-only table: actor, action, `entity_type/entity_id`,
   `entity_label`, `context_type/context_id`, detail, ip, created_at — index
   every lookup column, no FKs. Register it wherever your metadata/migration
   story requires (model registry + one linear migration).
2. Write the never-raising `record_activity` service with the
   caller-session-first strategy; grep your routers for `commit()` and hook
   the call **after** each successful mutation, passing `db`, the label, and
   the owning context for child records.
3. Expose: global list (action/type/search/date filters + pagination),
   per-entity list with the OR-pair rule, BOM'd CSV export, and a POST for
   client-only events.
4. Build ONE frontend helper module (label maps, color map, link switch, date
   formatter) and consume it from both the global page and a reusable panel;
   embed the panel on every detail page (type+id) and hub/list page (type
   only, comma-list for multi-type domains).
5. Add tests per hooked domain plus: context linking (container trail includes
   child events), pagination/newest-first, filters, CSV BOM, cross-tenant
   scoping (plant a foreign-user row and assert it's invisible).
6. Verify against your pre-change failure baseline (diff the FAILED lists) so
   "suite green" means "zero NEW failures", not "same old red".

## 🔗 References

- Source: Claude Code task — porting a proven single-profile audit-log design
  (banking-ops app) into a multi-section personal-management app (2026-07-17).
- Related experiences: `registry-driven-import-engine` (structured result
  shapes), `notification-channel-event-preferences` (behaviour-preserving
  additive server features).
