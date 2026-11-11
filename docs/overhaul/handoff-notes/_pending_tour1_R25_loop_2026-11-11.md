# Tour 1 (Pólya), round 25: fixer «loop» handoff (2026-11-11)

Scope (DECISIONS_R25 «Fixer split / loop»): P3 — territory loop, unclear fit (the round's S1 B25·D1 = D25-21; S3 B25·D18/19, C25-19, B_s D14/D15, A25-22) + clarifications
C2–C5. Base: `eeb11d1f`. **Only file touched in `src/`: `apps/learning-architecture/src/app/a44_route.js`** (no other fixer's file; the a26 system prompt untouched).

## Functions changed in a44 (all inside the «Q6 — حلقهٔ قلمرو» block unless noted)
- New: `rawW`, `tok1`, `areaIdx`, `labelToks`, `quotedIs`, `framing`, `Z_IN`, `ctxOf`, `evHome`, `unseenNames`, `ruledName`, `lateScope`, `sysScope`, `herNo`, `takeBack`,
  `backNow`, `noFitSpan`, `oOf`; regexes `W2_STOP`, `NOFIT`, `TAKE_BACK`.
- Rewritten: `toksOf`, `dfWide` (same meaning, index keyed by the registry's ids), `score`, `rank`, `fits`, `PRE.sysRank` (extra fields), `PRE.sysFit`.
- Edited: `generic` (+ «دستیار»), `swEv` (calls `evHome`), `waitEv` (outcome after her «نه»), `arrive` (keeps `tool.text`, `tool.sn`), `askFit` (`ask.sn`, `ask.alt`),
  `mismatch` (6th argument `herWhy`, `checks[].byHer`), `sysLocal`, `sysSheet`, `sysEntry` (`late`, `whyNot`, one entry per sheet), the `AS.fileGap` wrapper (late scope),
  `PRE.sysDone` (scope), `fitAnswer`, `sysLines` (6th argument `only`), the sys after-turn hook (scope), the `A.dueList` wrapper (one new line), `sysCard`.
- Outside the block: `DET_K` gains `sysundo`; the RULE line of «# پیش‌نیاز» (one clause on `sys_fit` after an arrival); `PRE.block` (the «not in scope» branch may now return
  a «# تکهٔ منتظرِ ابزار — مسئلهٔ «…» بسته است و بسته می‌ماند» block). Quarantine: `PRE.R24_QUARANTINE.rank24`.

## Contract: model reports, page validates
- `coach_state.sys_fit {sheet, fit, quote}` now also applies AFTER «🛎 ابزارِ لازم آمد»: `fit:false` with a quote from her message (not a question) puts an `arrived` or
  `resumed` entry back to `wait` (`herNo`). `fit:true` on an entry she had just rejected takes the «نه» back (`takeBack`, C5). `fit:true` on an arrived entry is a no-op.
- The page also reads it itself: on the message after an arrival, a non-question clause matching `NOFIT` («همون/همان/این/آن … نیست», «ربطی … نداره», «به کار/درد … نمیاد/نمی‌خوره»,
  «جواب … نمیده», «کمک … نمی‌کنه»); after a resume only if the message also names the tool. A bare «نه» is NOT a rejection of the tool. `TAKE_BACK` («اشتباه گفتم/کردم … همونه»,
  «نه، همون بود») reverses a rejection. Rejection «by meaning» with no such sign needs the model's `sys_fit`.

## Contract: data (`pre22.sys[]`) and API (`APP.PRE`)
- Entry gains: `late` (filed after the problem was closed — never set to `moot`), `whyNot`, `rejS` (full-word score of the best thing she rejected), `backBy {at, id, fa, q, was, key}`
  (set by her «نه», cleared by the next arrival/ask), `lastRej {it, sn}`, `tool.text`, `tool.sn`, `ask.sn`, `ask.alt[]`; `checks[]` items may carry `byHer` or `undo`.
- States are unchanged (`wait|arrived|resumed|declined|other|moot`). `resumed → wait` and `arrived → wait` are now possible (her «نه»).
- Events: new `sys23_<swN>_undoK` (`k: sysundo`); the `…_wait` event's `out` may be «منتظر — به گفتهٔ خودش «X» همان نبود؛ برگه دوباره باز شد». When an entry's stack moved from a
  chat problem to a live problem, its `sys23_<swN>_*` events are MOVED from `achat.evlog` to `eprog.solve.live.evlog` at the next write (`evHome`) — one row, one detour.
- `A.dueList()`: new item (kind `p`, `sys23`) «⏸ گامِ «…» دوباره منتظرِ برگهٔ #n است — «X» همان نبود» while `PRE.sysBackNow(e)`.
- New API: `PRE.sysToks(t)`, `PRE.sysFraming(e)`, `PRE.sysUnseen(text)`, `PRE.sysNoFit(msg)`, `PRE.sysBackNow(e)`, `PRE.sysScope(s)`; `PRE.sysRank(e, items, replyText)` →
  `{clear, best:{id,n,a,w,sn,sa,s}, all, full}` (`n/a/w` as in round 24 = all non-zero words; `sn/sa/s` = full-weight words / those in her step).
- Matching: zero = R24 generic list + «دستیار» + `dfWide` + stem fragments (a stem shorter than 3 letters is dropped; a whole two-letter word counts unless it is a particle);
  low = spread across the systems (among areas that existed at filing and are not candidates, no system holds more than half of the areas carrying the word) or a word of an
  existing view/area name cited in the sheet text (quoted names starting with a symbol or after «نمای» count even if no such view exists), except the candidate's own name and
  except (C2) a word of her step that the routine's reply also uses; full = the rest. Clear = ≥2 full words (R6) with ≥1 from HER STEP (title only when the step has no
  full-weight word of its own), no tie, more than `rejS`. Sheet path asks when any non-zero word is shared with the step/title or the overlap comes from the frame; registry path
  (no reply) asks only on a full-weight step word. A pending ask blocks every other outcome.
- Lag line «⏳» only when the reply names a build (id or `…`) that is not in this version and was not ruled out in why_not; otherwise mismatch with a her-facing reason.

## For the other fixers
- **story (P5):** a new problem raised mid-chat that gets its own record will simply be in scope — `lateScope` is used only when `PRE.scope` is null and the session's bound
  live problem is done, or when the scoped problem is closed at filing time. If you change what «closed» means, `closedProb` in a44 is the single check.
- **today (P7):** one more `sys23` Today row (kind `p`); keep `sys23` rows separate when you merge rows by content.
- **classify (P6):** loop lines take her register only via `shE(e)`/`shoma(s)` («گفتید/گفتی», «خودتان/خودت», «از شما/تو»); the new ⚠️ reasons are neutral. The fit question and
  the resume question stay ONE page question each; the resume question now ends with a parenthesised instruction to the coach (not a second question).
- **prior (P1):** C5 for the territory fit is done here (`takeBack`); the prior-work verdict reversal is yours — nothing shared.
- Docs numbers used: WORKLOG (125), PROGRESS 124, HANDBOOK §12 row 71. PROGRESS 120–123 are left for correction/story/prior/arith, so
  `tests/test_learning_architecture_handbook.py` reports a numbering gap on this branch alone until the merge.
