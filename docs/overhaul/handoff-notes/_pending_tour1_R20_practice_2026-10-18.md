# Tour 1 (Pólya), round 20: practice + sched handoff (2026-10-18)

Scope (DECISIONS_R20 «Fixers / practice+sched»): RO7 (one act, one record, one Today line), RO9 (⏱ test-clock badge vs «↩ برگرد»), D·7 (T24 two-stage).
Base: `claude/life-program-flow-diagram-q37jvr` at 3f86edaa. Not touched: a27, a29, a38, a40, backend.

## Files
- `apps/learning-architecture/src/app/a41_practice.js` — main work (p3Sync, late-success interval, calib due, guessStatus, stableOff, T24 draft path,
  retrieval case owns 🔭/cards, plan ⇄ step ⇄ 🌱, consent, practice_log, promptBlock, events, worksheet topic prefill).
- `a1_base.js` `A.cardInToday`; `a3_views.js` (Today: sample cards, P2/P4/P5/P9 only after first run, `hold` sched skipped, `sid` on sched lines);
  `a42_sched.js` (card source uses `A.cardInToday`, proto source skips never-run routines, sched source skips `hold`); `a36_solve.js` `grade` (late correct ⇒ longer interval);
  `a2_ws.js` (`f.whenFn` in `A.wsShown`); `style.css` (clock flag `pointer-events:none`, `.backfab` raised while the flag exists).
- Tests: new `tests/test_tour1_r20_practice.js`; byte copy of the bank `tests/variants/VARIANTS_R20.json`. `tests/test_tour1_r19c_practice.js`: helper reads
  `c.stableOff || c.withdrawn`; the two `start_practice` calls carry `consent` (DECISIONS_R20 RO7 replaces the keyword rule).
- Docs: WORKLOG (82), PROGRESS 98, HANDBOOK §4 (practice section bullet), §10 row, §12 row 49. **Numbering gate:** (80)/96 coach and (81)/97 live must be merged first;
  this branch alone fails `build.py --check` docs numbering — after merging coach, live, then this branch, run `python apps/learning-architecture/build.py` once and commit the bundle.

## Contracts for the other fixers
- **coach (a27/a29):**
  - `APP.PR.promptBlock(subject, session)` → the «# پرونده‌های تمرینِ باز» block (cases of `subject` — `{k,id,t}` or a live pid string — plus the session's cases and any due case)
    or `""`. a41 already adds it through its own prompt hook; if the coach layer places it itself, set `APP.ASSIST._prcBlockDone = true` for that turn (otherwise it appears twice).
    The keyword gate is gone (quarantined as `PR.R19C_QUARANTINE.promptHook`).
  - `start_practice` now needs `consent: {quote, kind: "yes"|"request"}` (string = quote). Validation: quote in her last non-system message (normalized); `yes` only if the
    previous assistant message asked (has ؟/?). Success returns `"✓ پروندهٔ تمرین باز شد: …"` (page result → next turn, RO3); refusal returns the reason.
  - New action `practice_log`: `{"do":"practice_log","prc":id | "tid"+"pid"/"topic","what","pct"?,"ok"?,"quote"}` — quote must be in her message; one open case must match.
  - Mind card (#126/#132): practice records no longer carry `withdrawn` (that key means "record withdrawn" everywhere). Withdrawals of «تثبیت شد» are `stableOff[]`
    (`{d, was, why}`); the key `withdrawn` is deleted on the next save. a29 `techWork` already counts the case after this; the one-row-per-case display with measured values is a29's.
  - Plans: a41 sets `q.step = {pid, id}` (existing a27 field, read by `planSync`) and new `q.will = {pid, id}`, `q.notSame = [itemId]`, `q.linkAt`, `q.linkBy`; the live step / 🌱 step get
    `.plan = {sess, id}`. Linked plans' «📌» Today line is dropped; `AS.planTap` is used to carry the 🌱 outcome to the plan.
- **live + dossier (a38/a40):** no event-log contract note from the live fixer had appeared when this was written. Until it does, `APP.PR.events(subject)` returns
  `[{k:"practice", kind:"prc:session"|"prc:start"|"prc:state"|"prc:withdraw"|"prc:pause"|"prc:resume"|"prc:close"|"prc:reopen", at (event time: session day under A.now), d, title, lines[], out, prc, src:{kind:"practice", id, sess?}}]`
  sorted by `at`; a41's `A.dossier` wrapper already pushes these (minus `prc:start`, replaced by the case summary line). When the log exists, register `APP.PR.events` as a source or call it.
- **routing:** nothing.

## Behaviour notes
- T41 case ⇄ P3: three records kept (R19c LT5 #80), but only the current step is open-and-visible; later steps `hold: caseId`; passed/superseded steps `done` with `closedBy:"practice"`,
  `why`, and `superseded:true` when no session reached them. Paused case ⇒ all open records `hold`. The case entry is `dupOf: "sched:<id>"` of the current record.
- A retrieval case (policy shape `steps`) on a live problem owns that problem's 🔭 review phases and `pb` cards: a session with a known result grades the due ones (`hist[].prc`);
  `A.solveDue` and `A.cardInToday` hide them while the case is open (not paused/closed).
- T24: drafts create the case (no session) and one 🎯 per complete row (statement + confidence + readable due) at write time; rows without a readable due make no 🎯 and the worksheet
  asks for the date. Reflections (selfguess/pattern/rule) appear after the first outcome. Calibration case due = the day after the last open due (or last act).

## Bank VARIANTS_R20 (RO7 + RO9 badge) — tests/test_tour1_r20_practice.js
RO7 #121–#138: 18/18 green. RO9 #159 #164 #168: green. Red on the base build: 15 (exceptions/behaviour); #134 #135 #168 are negatives that also pass on base.
#126 is verified from the case side (one dated series 60/70/80/85/40 with the withdrawal, record counted by `APP.MIND.techWork`); the row's rendering is a29's.

## Not done / open
- T32/T33 (other calibration worksheets) are still one-stage.
- Event-log integration waits for the live fixer's contract.
