# Tour 1 (Pólya), round 26: fixer «correction» (Q2 + C11) — handoff (2026-11-12, finished 2026-11-15 after the owner's pause)

Scope: Q2 of `DECISIONS_R26.md` («A CORRECTION REACHES EVERYTHING BUILT ON IT, AND NOTHING ELSE») and C11. Docs: WORKLOG 130 / PROGRESS 127 on this
branch (assigned 131 / 128 — the coordinator renumbers at merge), HANDBOOK §10 row (2026-11-15) + §12 row 74, AUDIT_LOG.
Tests: `apps/learning-architecture/tests/test_tour1_r26_correction.js` (group B) + `test_tour1_r26_correction_acd.js` (groups A, C, D), both built on the
replay library `tests/tour1_r26_replay.js` (the runner's own control steps and recorded model replies, page clock frozen on the run's day;
fixtures `tests/fixtures/r26_correction/*.json`; cases + checks `tests/tour1_r26_correction_cases.js`), and `test_tour1_r26_correction_bank.js`
(VARIANTS_R26 Q2; bank copy `tests/variants/VARIANTS_R26.json` — **other fixers: use it, do not re-add it**). Other fixers may reuse the replay library.

## Functions changed (exact)
- `a38_live.js`: `staleRecs` (her messages and the first text of a fixed prior step as context records), `ann25`, `pairs25` (now `(D, RC, clause)`:
  a unitless pair takes its unit from her clause), `annText25`, `staleCore25` (inner `rootOf`, `staleSent`, `push`, `givenCtx`, `dimOk`, `unc`, `implicit`,
  `ROLE`, new `rk26`, `curV`/`newV` in the root's own unit, rate-role twins, written-result chains, ctx-zone rule), `A.liveRestsOn`, `A.liveRuns25`, `staleScan`,
  `staleMark`, `staleCard`, `copyVal24`, `A.retractMsg`, `asResult`, `A.liveRetract`, `dlVal`, `ptFix`, `ucanon` (unit table: `ha`), `multCopy`,
  `numCopy23` (rate clash), `fieldKey`, `copyCands` (inner `cand`, `pageSrc`; guess skipped on `guessRateOff26`), `copyField`, `A.liveCopyAnswer`,
  `A.liveSessCopies`, the `res.changes` line builder in the live-retract result. New: `rate26`, `rateClash26`, `RATE26`, `guessRateOff26`, `fullCopy26`,
  `sameDatum26`, `msgInWin26`, `storyFollow26`, `A.livePriorStale`, `A.liveSessStale`, `A.liveCorrStale`, `A.liveStaleRecs`.
- `a27_tour.js`: `retractCheck` (correction + question; ZWNJ words whole), `fixQ22`, `planR17`, `chLine20` (diff window for long single runs), inside
  `retractApply`: `put` (window for long texts), rebook stale judged on the final text, `hasN26`, `inWin`, `hasRes21`; `AS.DO.coach_state` wrapper.
- `a45_story.js`: `priorTurn25` (the stale step comes from `A.livePriorStale`), `AS.DO.coach_state` wrapper (the ledger line enters the model's result block).
- `a44_route.js`: the «مانده» of `A.ROUTE.model` (reads `A.liveCorrStale`). `a39_math.js`: `decorate` (no series chart on `.sys` messages).

## Contracts for the other fixers
1. **Dependency, not digits.** Never mark or rewrite a number because it equals the old value. Ask the engine: `APP.liveRestsOn(span, {o, n}, {src, ctx,
   clause, results})` ⇒ `yes | no | unknown | ask`; `unknown`/`ask` ⇒ the page asks, never states a value (C11).
2. **One voice.** Whatever the page tells her went stale (ledger step, result, copy) is in the result block the model reads (`coach.retNote.res.changed`).
   If you add a record type that holds her computed numbers, add it to `staleRecs` with a zone — do not re-derive.
3. **Strip (story/today):** `APP.liveCorrStale({pid, sess})` ⇒ `{o, n, why}` when the reached result was built on a corrected value; show «نتیجه با عددِ
   پیشین به دست آمده بود», never a plain «حل به نتیجه رسید».
4. **today (bank R26 #48, not built here):** the 🎯 forecast row, the practice session «(درست)» and the look-back check must set themselves aside when
   `APP.liveRestsOn(<their text>, D, …) === 'yes'` or when `liveCorrStale` is set; the correction engine only sets the guess outcome aside.
5. **Units:** `هکتار` is a unit now (`ha`, area, ×10,000). A time-rate word in the clause («روزی», «دقیقه‌ای», «در ماه», «هر هفته») is part of the quantity.

## Not done (reported)
- A26-15 s07: the fixture has no ✏️ turn for the heights (the round-26 control did not record it) — not reproducible by replay; mechanism green in bank #47.
- C25-15 pwC2: unwritten percent-of-population chain; partial marking would print a wrong exact value for «۹۸٫۱» (C11).
- «ρgQH» with «(۱۲٫۵/۳۶۰۰)» and the two-step rounded «۳ وات‌ساعت» are not read (neither marked nor asked).
