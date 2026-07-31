---
title: Resolve a captured signal's identity at ingest, and translate legacy identifiers at render — never store the raw handle as the label
tags:
  - ingest
  - identity
  - observability
  - android-notifications
  - data-quality
topic_canonical: resolve-source-identity-before-storing-a-signal
source:
  type: claude-code-task
  origin: claude-code
  imported_at: "2026-07-31T00:00:00Z"
created_at: "2026-07-31"
updated_at: "2026-07-31"
merged_from: []
---

# Resolve identity at ingest; translate legacy identifiers at render

## 🎯 چالش / Challenge

A capture pipeline stored thousands of events whose *content* was fine but whose
*origin* was unusable. The owner's report: "many recorded notifications don't say
which app or which sender they came from — it only extracted the content."

Two independent defects hid behind one symptom:

1. **The origin was stored as a machine handle.** `org.telegram.messenger`,
   `com.android.systemui` — technically correct, humanly meaningless. It renders
   as "unknown" to anyone who isn't a programmer, and worse for OEM packages.
2. **Only one candidate field was read for "who".** The code read the single
   obvious field (`android.title`) and stopped. But the platform scatters
   identity across many optional extras, and the *most* reliable one is not the
   obvious one: messaging apps put the contact name in the `MessagingStyle`
   message bundle (`android.messages` → `sender` / `sender_person`), group chats
   in `conversationTitle`, brands in `subText`, and — crucially — leave `title`
   empty or set to a *count* ("3 new messages"). Promotional notifications often
   set no title at all.

The same read-one-field mistake also cost content: the full body lives in
`bigText` / `textLines`, while `text` is frequently the collapsed summary. So the
pipeline was throwing away both who sent it and most of what they said.

## 💡 راه‌حل / Solution

**1. Capture every identity-bearing field, then resolve with an explicit
precedence chain that cannot return empty.**

```
sender = messaging_style_sender     # most specific: the app named the human
      or conversation_title
      or title                     # skipped if it's a count, e.g. "3 new messages"
      or sub_text                   # where brands put their name
      or pretty(app_package)        # last resort — never blank
```

Making the fallback the app's own human name means the field is *always*
answerable. "Digikala" is a worse answer than "Ali", but it is infinitely better
than blank — blank is what made the owner distrust the whole log.

**2. A `pretty(handle)` function with a small known-table plus a generic rule.**
The table covers the apps that matter; the generic rule (drop TLD-ish and filler
segments — `com/org/android/mobile/app/lite` — take the first meaningful token,
split camelCase, title-case) keeps unknown handles readable instead of raw. A
prettifier that only works for a hardcoded list is a prettifier that fails on the
long tail, which is most of the traffic.

**3. Reject "countish" candidates explicitly.** `^\d+\s*(new\s+)?(messages?|…)$`
is not a sender. Without this check the precedence chain confidently returns
"3 new messages" as the person who wrote to you.

**4. Translate legacy rows at *render* time, not by migrating data.** Rows
already stored hold raw handles. A backfill migration is irreversible and risks
the historical record. Instead, put the translation in the single serialization
function, and also return the raw value under a `*_raw` key. Every historical row
becomes readable instantly, the stored data is untouched, and search/debug still
sees the original. This is the cheapest possible fix for "my old data looks
wrong" and it is fully reversible.

**5. Use the source's own declared type before asking a model to guess it.** The
platform lets the sender label its own event (`Notification.CATEGORY_PROMO`,
`_MSG`, `_EVENT`, `_TRANSPORT`…). That declaration is more reliable than any
keyword heuristic *and* free — yet it was being discarded while an LLM was asked
"is this an advert?". Feed it in as a hint that outranks keyword guesses but
never outranks a hard money match or a one-time-password detection, since a
mislabeled app must not be able to redirect a financial signal.

**6. De-noise repeats at the edge.** Ongoing/service events (media player,
download progress, navigation) re-post every second. A 60-second identical
`(source|title|body)` echo filter on the device stops the log from being 95%
one music player — without dropping any distinct event.

## ⚠️ دام‌ها / Pitfalls

- **Changing what a field *means* breaks downstream matchers.** Here `sender`
  went from "package name" to "human name", which silently broke mirror-app
  detection that had been doing `sender.startswith("com.google.android.gm")`.
  When you upgrade a field's semantics, pass the old value through as its own
  explicit parameter rather than leaving consumers to guess.
- **Every new field must be optional.** Clients in the field update on their own
  schedule; an already-installed old client must keep working byte-for-byte.
  Server-side resolution should degrade to exactly the previous behavior when the
  new fields are absent — and that deserves its own test.
- **Platform APIs that only exist above your minimum version** (`android.app.Person`
  is API 28+, minSdk 26) must sit behind a version guard. A typed cast loads the
  class at runtime and throws `NoClassDefFoundError` — an `Error`, which a
  `catch (Exception)` does **not** catch.
- **Don't hide the raw value.** Prettifying the only copy makes debugging and
  exact-match search impossible.

## 🔁 How to Apply Elsewhere

Any pipeline ingesting events that carry an origin (webhooks, email, chat bots,
log shippers, IoT):

1. List every field the source *could* put identity in — not the one you first
   noticed. Read them all; storage is cheap, re-capture is impossible.
2. Write one `resolve_identity()` with an explicit, commented precedence chain
   whose last link is a value that always exists. Never let it return empty.
3. Write one `pretty(handle)`: known-table first, generic normalization second,
   raw third.
4. Reject degenerate candidates (counts, placeholders, the handle itself
   masquerading as a label).
5. Put legacy translation in the serializer and expose the raw value alongside —
   fix history without touching history.
6. Prefer the source's self-declared type over inference, but never let it
   override a high-stakes deterministic detection.
7. Test the old-client payload shape explicitly, forever.
