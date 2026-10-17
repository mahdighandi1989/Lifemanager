---
title: "One clock, one scheduler — making spaced/longitudinal features testable over simulated days"
tags: ["scheduling", "spaced-repetition", "testing", "playwright", "clock", "reminders"]
topic_canonical: "one-clock-one-scheduler-for-multi-day-tests"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-17T12:00:00Z"
created_at: "2026-10-17T12:00:00Z"
updated_at: "2026-10-17T12:00:00Z"
merged_from: []
---

# One clock, one scheduler for multi-day features

## 🎯 چالش / Challenge
A client-side app grew a dozen features that each "come back in N days" (flashcards, review cycles, follow-ups, reminders). Each kept its own
copy of the interval table and its own `new Date()`. Results: the code drifted from the method it implements (a 3-day step where the method
says 6), reminders went stale after the user acted, a "retired" flag was read but never settable, and nothing could be tested over weeks
without real waiting. Patching only the app's `today()` in tests produced mixed state (records still stamped with the real clock).

## 💡 راه‌حل / Solution
1. **One clock:** `app.now()` (+ `nowMs`, `nowISO`) that every "now" goes through — the date helper, record timestamps, private module
   helpers, throttles. With no offset it is exactly `new Date()` (behaviour unchanged).
2. **Two ways to move time:** (a) the test browser's global fake clock (Playwright `page.clock.install` / `setSystemTime` + reload) — moves
   `Date`, timers and every helper together; (b) an in-page day offset for human-style runners, enabled only in an explicit dev mode, persisted
   across reloads, accumulating, visibly flagged, and tagging records created under it so they never enter the real user's views.
3. **One scheduler registry:** every dated thing registers a *source* (`list(day) → entries`) with a unique key `kind:id[:track]`; the
   registry gives `all/due/next`, "today" lines, and reminder sync (send once per key+due, cancel when the entry disappears).
   Old schedulers are wrapped as sources instead of rewritten; their duplicated constants are routed to one copy and quarantined.
4. **Policies quoted from the method's own text:** each interval policy stores the exact sentence it implements; a test asserts the quote
   exists in the source text, so code and method cannot drift silently. Methods without a stated interval get no policy (never the generic ladder).
5. **Reminder capture stub** replacing the host's `remind()` so tests assert payloads without sending anything.

## 🧪 نمونه کد (Anonymized)
```js
var CLK = app.clock = { off: 0 };
app.now = function () { var d = new Date(); if (CLK.off) d.setDate(d.getDate() + CLK.off); return d; };
app.today = function () { var d = app.now(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
sched.register({ kind: "fcast", today: true, remind: true, types: ["fcast"],
  list: () => store.all("fcast", x => x.due && !x.outcome).map(x => ({ id: x.id, due: x.due, txt: x.q })) });
// test: install fake clock → act → flush → setSystemTime(+n days) → reload → assert today lines + captured payloads
```

## ⚠️ نکات حیاتی / Pitfalls
- Never fake time by patching only `today()`; created/updated stamps stay real and comparisons mix clocks. Provide a check that detects it.
- After a backward jump, in-memory throttles are stale — always reload; flag "stale" when time goes backwards without reload.
- A fake host object for capturing reminders can flip the app into "host mode" if installed before data load; install it after load.
- Overdue reminders: keep the original due date. Bumping it to "today" re-arms the server reminder every day the app is opened.
- Timezone: compute local days (not UTC slices) and test the midnight edge with a timezone-pinned browser context.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] Grep for `new Date()` / `Date.now()` used as calendar time; route them through one `now()`.
- [ ] Add a dev-only offset (URL + persisted), a visible flag, and tagging of records created under it.
- [ ] Create a registry with unique keys; wrap existing schedulers as sources before rewriting anything.
- [ ] Store the method's own sentence with each interval policy and test that it appears in the method text.
- [ ] Stub the reminder transport in tests; assert one payload per (key, due) and a cancel on close.
- [ ] Write multi-day tests: fake clock → act → flush → jump → reload → assert, including late returns, pauses and timezone edges.

## 🔗 References
- مرتبط: two-sided-needs-judging-for-scenario-tours
