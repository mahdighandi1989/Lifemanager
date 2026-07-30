---
title: "Self-feeding account cards: turn already-synced email into live records (create, don't just update)"
tags: ["ingest", "email", "finance", "idempotent", "extraction", "auto-populate"]
topic_canonical: "self-feeding-account-cards-from-synced-email"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-22T00:00:00Z"
created_at: "2026-07-22T00:00:00Z"
updated_at: "2026-07-30"
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

## Update 2026-07-30

The self-feeding pipeline above SHIPPED and then failed the owner in production
(«تشخیص حساب‌ها و موجودی فوق‌العاده خطا دارد»). A 27-defect audit found the
recurring causes; the reusable lessons:

1. **Normalise digits at the SAME layer that regexes run.** One half of the
   pipeline translated Persian/Arabic-Indic digits, the other didn't —
   «۱۲٬۵۰۰٬۰۰۰» parsed as `12.0` and even booked a fake 12,499,988 delta.
   The translate table must live in (or before) the parser itself.
2. **Not every "balance" is THE balance.** Classify the qualifier word:
   previous/opening/outstanding/rewards/points figures are DISQUALIFIED;
   available/current/closing outrank a bare «balance». A prose number with no
   currency and no separators ("work-life balance 10 tips") is not money.
3. **No currency ⇒ no new record, and never relabel without converting.**
   A `currency or "USD"` default mints dollar cards out of truncated Rial
   snippets; a stray `$` must not flip an AED card to USD while keeping the
   number. Cross-currency writes are refused, not converted implicitly.
4. **Zero and negative are notices, not balances.** Both are refused on
   update; the owner types a true zero himself.
5. **Identity = ref AND institution together.** A last-4 alone collapses two
   banks' cards into one; an institution alone with several cards is
   AMBIGUOUS and must be refused, not guessed (`(account, ambiguous)` return
   shape). Sender-domain brand = LAST non-generic subdomain segment — an
   any-segment free-mail test makes every `mail.<brand>.com` bank invisible,
   and max-by-length picks «notification» over a short brand.
6. **Owner delete needs a tombstone.** A self-heal that rebuilds deleted
   records from source files re-creates exactly the wrong cards the owner
   deleted. Record the deleted identity (institution+ref+iban) in a KV
   tombstone list; auto-creation checks it; an explicit owner action
   (`trusted=True`) and an explicit «بازگردانی» (clear tombstone) both
   override it. Deletion ≠ dead end AND deletion ≠ boomerang.
7. **An owner allow-list beats cleverer heuristics.** When the owner declares
   «حساب‌های من» (institution/ref/IBAN entries), creation is restricted to
   matches; empty list = old behaviour, so it's opt-in and behaviour-preserving.
8. **Synthetic bookkeeping must be marked as such.** Balance-delta rows share
   the transactions table with real statement lines; tag them (category
   `_balance_delta`) and exclude from spending reports, or every month
   double-counts. Every machine write needs a `source_ref` for idempotency —
   the one path without it (message webhook) duplicated rows forever.
9. **Dedup memory must be ORDERED.** `list(set(...))[-200:]` evicts random
   refs (sets are unordered) — an evicted ref re-posts its delta on the next
   scan. Order-preserving dedupe, newest-tail cap.
10. **Content-hash line dedup needs an occurrence index** (`hash#2` for the
    second identical same-day purchase) or genuine repeated movements are
    silently dropped — while re-parses of the same file stay idempotent
    because order (hence indices) is deterministic.
11. **Soft vs hard refusal words.** «Tax Invoice» and unsubscribe footers
    appear INSIDE real bank statements; such words may only refuse when the
    text shows no account evidence. Persian keywords need explicit
    boundaries (`وام` fires inside «عوامل» without them).
