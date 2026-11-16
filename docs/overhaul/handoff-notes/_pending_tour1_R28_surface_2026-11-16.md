# Handoff — Pólya tour round 28, fixer «surface» (R7), 2026-11-16

Contracts the other round-28 fixers must respect (and the functions this fixer changed):

- `a27_tour.js` — NEW `AS.sysQ28(sentence)` / `AS.onlySysQ28(message)`: a question about the system itself (C99). `AS.notProblem` now returns true
  for a message that is only such questions. «خبرم کن / یادم بنداز» (imperative) is NOT a system question (C127) — a plan/reminder; dates
  fixers may book it. Changed: `statesProblem` (+`PLAN28` life-plan opening; +yes/no «جا میشه / کافیه / می‌رسه» with ≥2 numbers),
  `regSigns` (+`noCal28`: Jalali month names never count as a register sign), `PAST_ST` (+«آمد»). Export added: `AS.noCal28`.
- `a45_story.js` — only `ST.metaQ27` (now also `AS.sysQ28`), `qSentence` (calls `ST.metaQ27`) and the filter in `goalSentence26`. Story/prior:
  a 🧭 destination is never a system question.
- `a44_route.js` — NEW `tieLabels28`, `dupTie28`, `MERGE28`, `PRE.sysTieLabels`; `askFit`, `tieDrop`, the `e.ask` reset after a pick, the
  Today ❓ row, `sysCard` buttons and the coach block use `e.ask.faL` (display name) and display names in `e.ask.alt`. **Shape change:**
  `e.ask.alt` holds DISPLAY names (with «(اولی)/(دومی)» when names collide); ids stay in `e.ask.alts`; `e.ask.fa` stays the raw name.
  `tieAnswer`: «یکی‌اند / تکراری‌اند» with identical candidates picks the first (C129).
- `a26_assist.js` `AS.run` — an action may return `{note, quiet:true}`: the note reaches the model (`res.notes`, the correction turn) but is
  not shown in her bubble (`res.quiet`). Use it for model-protocol misses only.
- `a33_dates.js` `AS.DO.deadline_done` — its two misses return `{note, quiet:true}` (text unchanged).
- `a38_live.js` — NEW `chkVerdFa28` / `A.liveChkVerdFa28`; the two «حکمِ وارسی» change lines use it (no raw «maybe/verified»).
- `a31_tools.js` — «بی موعد — داوری با گزارشِ خودت» (no «(دورِ ۲۷، C53)»); forecast owns the rest of the 🎯 list.
- `a21_orient.js` / `a25_graph.js` — «و جای تو در آن کجاست» (was «و تو کجای آنی»).
- Tests: `tests/test_tour1_r28_surface.js`, `tests/test_tour1_r28_surface_replay.js` (+ `tests/tour1_r28_replay.js`, a persistent-host copy
  of `tour1_r26_replay.js` with `uptoC`, and `tests/fixtures/r28_surface/`). The bank copy `tests/variants/VARIANTS_R28.{json,md}` is added here.
