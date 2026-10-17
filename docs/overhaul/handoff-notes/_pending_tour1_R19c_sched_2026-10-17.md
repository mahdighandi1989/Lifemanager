# Tour 1 (Pólya), round 19c: sched handoff (2026-10-17)

Scope (DECISIONS_R19c «Fixers / sched»): LT1 (one scheduler) and LT8 (one clock for tests). Base: `bf2574a5` + round-19b merged
(`worktree-agent-ac3b6c9a31d715445`, then `claude/life-program-flow-diagram-q37jvr` at 60d94930+).

Files changed:
- New `apps/learning-architecture/src/app/a42_sched.js` (`A.SCHED`). `a40` is taken by `a40_dossier.js`; `build.py` loads `a42_sched.js` right after `a1_base.js`,
  so `A.SCHED.ladder()` and `A.SCHED.POLICY` exist before every other module.
- `a1_base.js`: `A.now/nowMs/nowISO`, `A.today` through it, `S.put` stamps, `simClock` tag, `S.all` hides simClock records when no offset is active,
  `APP.clock` (advance/set/reset/check), `A.srsGrade` uses T42's [1, 6] then ×EF, `A.cardSuspend`.
- Wrapped schedulers (ladder copies replaced by `A.SCHED.ladder(...)`): a11, a13, a17, a19, a27, a36; `A.start137` (a4) reads `POLICY.T41`.
- a3 (base `A.dueList` appends `A.SCHED.todayLines`; overdue card text), a31 (🎯/⛓ lines now from A.SCHED; the old wrapper is the fallback),
  a33 (card reminder re-sync after grade/suspend; overdue keeps its own due; unremind when no active card), a4 (retire button in «همه کارت‌ها»).
- Private clocks moved to `A.now*`: a16, a17, a18, a19, a20, a22, a26, a27, a30, a31, a32, a33, a34, a35, a36, a38, a4, a6. **Not touched: a29 (mind builder).**
- Tests: new `tests/test_tour1_r19c_sched.js`. Docs: WORKLOG (77), PROGRESS 93, HANDBOOK §4 «⏱ زمان‌بندِ واحد», a §10 row, a §12 open item.
- Quarantine: `APP.SCHED_QUARANTINE` + `docs/overhaul/REMOVAL_CANDIDATES.md`.

## The A.SCHED contract (for practice / a41, mind / a29 and anyone else)
- **Register a source** (preferred for durable records; the state lives in YOUR record, A.SCHED only reads it):
  `APP.SCHED.register({ kind, label, list(day) → [entry], today: true|false, remind: true|false, types: [recordType], line?(entries, day) → item|[items] })`.
  `today:true` ⇒ its due entries appear in «امروز» through `A.SCHED.todayLines` (appended by the base `A.dueList`) — do NOT add your own `A.dueList` wrapper.
  `remind:true` ⇒ `A.SCHED.syncReminders()` sends `A.HOST.remind({key, due_date, tz, hour, title, body, link})` once per (key, due) and `unremind`s keys that
  disappear (closed / paused / outcome). It runs automatically 400 ms after any `S.put` of a record whose type is in `types`, and on render (≤ every 10 min).
- **Entry:** `{ id, track?, due:"YYYY-MM-DD", until?, txt, sub?, go?: fn, acts?, remindKey?, dupOf?, tid?, policy? }`. Key = `kind:id[:track]`, one entry per key.
  `dupOf: <other key>` hides the entry when that key exists (one Today line per act). `until` = window end; «عقب‌افتاده» only after `until || due`.
- **One-off entry** (in memory only): `APP.SCHED.register({ kind, id, due, ... })`; `APP.SCHED.unregister(key | kind)`.
- **Policy-driven practice cases — use `APP.SCHED.planSource`:**
  `APP.SCHED.planSource({ kind: "practice", label, types: ["practice"], records: () => APP.S.all("practice"), policyOf: r => "T" + r.tid, txt: (r, p) => …, sub?, go: (r, p) => fn })`.
  Record shape it reads: `{ id, tid, start:"YYYY-MM-DD", state:"open|stabilising|stable|paused|closed", resumed?:"YYYY-MM-DD", sessions:[{ d:"YYYY-MM-DD", track? }],
  due?, dues?:{ <track>: due }, counts?:{ resolved:n }, countAt?:{ resolved:"YYYY-MM-DD" } }`.
  - Same-day sessions count once; a session on the start day is the starting work, not a step.
  - `paused` / `closed` / `stable` ⇒ no entries (and reminders are cancelled). Resume ⇒ set `state:"open"` and `resumed:<day>`: steps restart from that day.
  - «stable» check-ins (LT3 decay check) are yours: keep the case `stable` and give it `due` via a `user` track, or register a one-off entry.
- **Policies** (`APP.SCHED.POLICY`, each with `src` = the exact quote from the technique's `dose`; `APP.SCHED.policyEvidence()` checks the quote is in the text):
  T42 sm2 [1, 6]; T41 cycle [1,3,7] + weekly 7; T31 window [2,7]; T3, T9, T14 every 30; T22 weekly 7 + `obs` (user); T37 weekly 7; T23 retest after:1 of "quiz"
  + trend every 3 "retest"; T28 [1,7]; T26 [1]; T4 [3,7]; T21 user due, cap 2 (`APP.SCHED.openFor(21)` counts T21 cases + planned knot `kexp`);
  T24 count {50 resolved} then every 30. A technique without a policy has none — never fall back to `A.SCHED.LADDER` for a technique with its own text.
  Track names are the `sessions[].track` values your record must use (e.g. T41 "cycle"/"weekly", T23 "quiz"/"retest"/"trend", T22 "weekly"/"obs").
  Single-track policies accept sessions without `track`.
- **Read:** `APP.SCHED.all(day)`, `due(day, {kind})`, `next(record)` (card ⇒ its due, retired ⇒ null), `plan(policy, rec, day)`, `dueText(entry, day)`, `sources()`.
- **Mind card (a29):** read dates through `A.now()` / `A.today()`; records with `simClock` are already hidden by `S.all` when the test clock is off.

## Clock for tests (LT8)
- Playwright (preferred): `newContext({ timezoneId: 'Asia/Tehran' })` ⇒ `page.clock.install({ time })` ⇒ act ⇒ `APP.S.flushNow()` ⇒ `page.clock.setSystemTime(next)` ⇒
  `reload()` ⇒ assert Today and `APP.SCHED.captured` (call `APP.SCHED.captureRemind()` after every load). Always reload after a jump.
- Runners without Playwright, dev mode only: `?dev=1&clock=YYYY-MM-DD` or `APP.clock.advance(n)` / `set(day)` / `reset()` + reload; `?remind=capture` installs the
  capture stub after data load. Without `dev=1` (or `localStorage["lla.dev"]="1"` / `window.LLA_DEV`) nothing is offset. `APP.clock.check()` ⇒ `{ok, mixed, stale}`.
- Server delivery: `deliver_due(db, now=…, senders=…)` — covered by `tests/test_app_reminders.py`.

## Bank VARIANTS_R19c (LT1.sched 20, LT8.clock 17)
All 37 green. #131 is the server test (pytest). Entries needing the real practice case (#1, #4, #5, #6, #7, #10, #13–#16, #18, #19, #133) are proven at the
A.SCHED contract level with a record of the contract shape («tprac»); the technique-page path (start the cycle from T41, the «آزمون‌های باز» view for #5,
the stability count for #133) belongs to the practice builder.
Deviation from the bank (DECISIONS wins): #125 needs `dev=1` together with `?clock=` because #134 forbids an offset outside dev mode.

## After merging the practice branch (worktree-agent-a4b67a4f540f07581)
- `A.SCHED.unregister` also takes the object form `{kind, id, track?}` (practice's call); string key / kind forms kept.
- Entries with `open: false` drop out; an `open: [view, arg, sub]` array becomes the Today line's `go`; practice lines carry `prc: <id>`.
- a42 registers a record-backed `practice` source that reads `A.PR.all()` + `A.PR.entries(c)`, so practice lines and reminders survive a reload
  (practice's own `register` calls are in-memory). For a kind with a record-backed source, in-memory one-off entries of that kind are ignored
  (they go stale when records are deleted/changed without a re-register).
- build.py: a42 is loaded once, right after a1 (the practice branch had also appended it at the end — a double load wiped the registry;
  a42 now also refuses a second load).
- Both `test_tour1_r19c_sched.js` and `test_tour1_r19c_practice.js` green on the merged build.
