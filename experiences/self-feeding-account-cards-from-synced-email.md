---
title: "Self-feeding account cards: turn already-synced email into live records (create, don't just update)"
tags: ["ingest", "email", "finance", "idempotent", "extraction", "auto-populate"]
topic_canonical: "self-feeding-account-cards-from-synced-email"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-22T00:00:00Z"
created_at: "2026-07-22T00:00:00Z"
updated_at: "2026-07-22T00:00:00Z"
merged_from: []
---

# Self-feeding records from already-synced email

## 🎯 چالش / Challenge

A page («مالی») sits empty while the raw material to fill it — the user's own
bank/wallet emails — is ALREADY mirrored in the DB by an earlier sync. The
owner expects it to fill itself «like drinking water»: every financial email →
detect the account, create a card for each one, update its balance on every new
message. The pieces often already exist (a balance parser, an apply-to-account
path) but are not joined, and — the crucial gap — the apply path only UPDATES
accounts that already exist; nobody ever CREATES a card for a newly-seen one.

## 💡 راه‌حل / Solution

Write the missing join as a conservative, idempotent scan over the synced rows:

1. **Read what's already synced, don't re-fetch.** The email mirror table is
   the source; the scanner is pure DB → DB. No new external credential.
2. **Create-or-update, keyed by a stable identity.** Derive an account key from
   the content (institution from the sender domain + an account ref: IBAN →
   last-4 → masked number). Match an existing card by that key; create only
   when none matches. This is what makes re-scans UPDATE instead of duplicate.
3. **Be conservative — no blind rows.** Create a card ONLY when you have both a
   name (institution) AND a real signal (a parsed balance or an account ref).
   A financial-smelling newsletter with neither creates nothing.
4. **Idempotent deltas.** Record each balance change as a transaction deduped
   on the message id (`source_ref = "email:<id>"`); keep a bounded
   `applied_emails` set in the account's `extra` so a re-run is a clean no-op.
5. **Newer-only balance writes.** Only a message newer than the last-applied one
   may move the balance, so re-processing an old mail can't clobber a fresh one.
6. **Auto but correctable, never a silent oracle.** Stamp created rows
   `extra.source='email', inferred=true`; the UI badges them «از ایمیل — بررسی
   کن» and the user edits/deletes them like any manual row. Expose the
   provenance as additive optional response fields (manual rows carry None).
7. **Two triggers.** A user-facing button (scoped to the caller, immediate
   feedback «N ساخته / M به‌روز») AND a periodic job (best-effort, env-tunable)
   so it keeps up without a click.

## ⚠️ نکات حیاتی / Pitfalls

- **Don't clobber the sub-writer's state.** If a helper (the txn recorder)
  writes into the same JSON `extra` you also update in the caller, RE-READ
  `extra` after the helper returns before merging your own keys — otherwise the
  caller's stale copy overwrites the helper's `applied_emails` and idempotency
  silently breaks (a re-scan keeps "updating" forever). Caught only by a
  third-run no-op assertion.
- **Return None, not False, for "not applicable" provenance.** A manual account
  has no `inferred` flag; returning `bool(None)=False` makes the field lie.
- **Bodies may not be stored.** Synced mirrors often keep only subject+snippet
  (privacy). Extract from those; don't assume a full body.
- **Additive response fields are safe; changed return types aren't.** Adding
  optional fields to a response model won't break consumers; switching a
  `List[Model]` return to hand-built dicts can — keep the model, build it
  explicitly.
- **Scope mismatch between job and UI.** A periodic job running as uid=0 and a
  UI list filtering by the real user id can create rows the page never shows.
  Scope the button to the caller (the reliable path) and treat the job as
  best-effort; document the seam.
- **Don't extract the unreliable.** Postal addresses out of bank mail are
  noise; stick to IBAN/last-4. Say so, rather than shipping garbage fields.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. Find the already-synced source table; write a DB→DB scanner over it.
2. Derive a stable identity key from content; match-or-create on it.
3. Gate creation on name + a real signal; never a blind row.
4. Dedup side effects on the message id; keep a bounded applied set.
5. Only newer messages move mutable state.
6. Mark auto rows `source/inferred` and badge them; keep them editable.
7. Expose one button (caller-scoped) + one periodic job.

## 🔗 References
- مرتبط: `multimodal-file-ingest-to-review-queue` (capture → review), `activate-
  passive-pages-by-wiring-not-building` (empty ≠ dead; wire the feeder),
  `ontology-lens-over-existing-system` (auto + owner-correctable pattern).
