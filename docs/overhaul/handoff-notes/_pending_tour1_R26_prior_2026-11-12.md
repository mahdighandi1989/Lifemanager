# Tour 1 (Pólya), round 26: fixer «prior» handoff (2026-11-12)

Scope (DECISIONS_R26 «Fixer split / prior»): **Q4 — prior-work reply reading** (the P1 ledger, roadmap §21). Base: `BASE26` = `23e351f6`.
FIX26 assigns WORKLOG 133 / PROGRESS 130. **On this branch the entries carry 130 / 127** (the next free numbers on BASE26): the docs gate refuses
gaps, so a branch with 133/130 and no 130–132 can neither build nor pass. **Coordinator: renumber to 133 / 130 at merge** (WORKLOG heading, PROGRESS row
number and its `WORKLOG (n)` cell, the AUDIT_LOG line). HANDBOOK §10 row (2026-11-12, «prior») + §12 row 74 (renumber if a sibling took 74).

Tests: new `apps/learning-architecture/tests/test_tour1_r26_prior.js`; byte copy of the bank `tests/variants/VARIANTS_R26.json`; fixture
`tests/variants/R26_prior_runs.json` (the runners' own turns — user text + recorded model reply — of pwB2, pwB1, pwA1, pwA2, pwD1, pwD2, s02, s04, pwC1, pA2,
dp1, s38, aC3, pC3, s25; replayed on the page). No older assertion was changed.

## Functions I changed or added (keep your edits out of these, or tell the coordinator)
`a45_story.js` (prior block only)
- replaced: `CALLS25` (round-25 pattern kept as `CALLS25_R25`), `calcs` (round-25 reader kept as `calcsR25`), `readReply`, `priorOpenAt`.
- changed inside: `relink` (set-aside steps), `priorOf` (only the `badC` key: `kNorm`), `applyFix` (kind, `reHist`), `tryFix` (the engine judges),
  `priorMerge` (the two branches for a re-reported step with a different quote), `priorReply` (take-back, drop, dispute of ✓), `pageFix` (two additions),
  `stepLine`, `priorQ`, `ST.priorTurn` (ids `undo`, `which`; no all-✓ question beside a page ✗), `priorAsk` (third party), `priorTurn25` (the model-step
  path only + `open`), the «کارِ پیشینِ تو» prompt hook (one line: `again|undo|which`), `paintPrior` (`set` only).
- new: `kNorm`, `reDep`, `stepSegs`, `noQuote`, `openNo`, `pageRe`, regexes `EXR26`, `NOOBJ26`, `SAYR26`, `EXA26`, `SAYW26`, `SAYWN26`, `PASTN26`, `DROP26`,
  `OTHER26`, `UNDO26`, `STEPW26`, `ASKS26`.
- NOT touched: `onState`, `logEv`, `importChat`, `feed`, stage functions (story), `arithChk`/`evalChain`/`tolOf` and everything in `a46_arith.js` (arith).
  I only CALL `ST.arithChk`, `ST.arithNote`, `ST.arithSaid`.
`a27_tour.js`: one line in `turnMoments` — the `prior` moment also wins for ids `undo` and `which`.
Nothing else: `a38_live.js`, `a29_mind.js`, `a44_route.js`, `a26` are untouched.

## Contract (for arith / story / correction / today / classify)
- **arith:** C8 is now judged by YOUR engine alone: `tryFix` asks `ST.arithChk(newText)`; if it returns at least one entry, its verdict decides and my light reader
  `calcs` is not consulted for the verdict (it only matches «the same calculation with a new number» and is the fallback when your reader returns nothing).
  So a wrong ✗ of yours on a correct fix refuses the fix (line «حسابِ متنِ تازه‌ات («…») با حسابِ صفحه نمی‌خواند (…)»), and your C15/C18 fixes land here with
  no change of mine. I rely on entries `{expr, said, val, ok}` with a strict reading: `ok === false` refuses a fix, `ok === true` is «the page read it». An entry
  you add for «نسنجیده» (C17) must carry an `ok` that is neither `true` nor `false` (`null`/absent): then it neither confirms nor refuses — the fix falls back
  to my light reader and to the model's verdict, and `pageRe` (re-check of a disputed ✓) does not claim «حسابِ صفحه همان را می‌خواند».
  The page re-check of a disputed ✓ step quotes `c.expr` and `c.said` of your entries.
- **correction:** unchanged from round 25 (a `retract` is offered to the ledger in `priorTurn25`). New step fields you may meet: `say`, `drop`, `rerouted`, `reHist`,
  `fixed.kind` (`rework` | `restate`), `retry.page`.
- **story:** the stage item `k: "prior"` is pushed as before; new change kinds in its text: «بازنویسی شد», «بازنویسی شد — هنوز «درست» نیست», «حرفِ تازه‌ات ثبت شد — حکم ماند»,
  «کنار گذاشته شد (به گفتهٔ خودت)». `pr.sum` can now end «· n گام کنار گذاشته شد · بقیه درست» instead of «· همه درست».
  `priorOpenAt` counts the chat messages of the window that later became the live problem (`ST.livedPk`) — a problem registered mid-chat is not «newly opened».
- **today / classify:** on a take-back of a dispute or a «which step?» turn the moment `prior` wins in `turnMoments` (ids `undo`, `which`), like `dispute`;
  `guess`, `A073`, `A073w`, `A191` are not added. The prior request no longer fires while a prerequisite is open (`A.PRE.stack(A.PRE.scope(s))`), after an earlier
  problem of the session when the message asks nothing, or for a third party's work.

## Not done (reported, with reasons)
- **D25-15** (pwD2 p7/p8: a second live problem born from her own sentence still opens with «کلِ مسئله را … در یک جمله …»): reproduced in the replay; the gate is the
  form's «اول کل» card in `a38_live.js` (lines 488, 708 — `wholeIssues`/`coachCore`) and the `u0` item of `liveList` in a27. `a38` belongs to correction and story this
  round; left for story (Q6 «stage follows the page»).
- s06 p7, s31 p15, s30 p10, s38 p18 (prior request after a practice/test report): the recorded prompts show the request, my replay of the same turns on BASE26 does
  not (the state came from clicks the fixture does not carry). The rule that closes pA2 p6 and dp1 p8 (reproduced, red on BASE26) covers their shape — a message
  after an earlier problem that asks nothing — but those four turns themselves are «not reproduced».
- C26-8 at pwC1 p3 («انرژیِ روزانه = ۲۴۷۰ × ۸ ≈ ۱۹٫۸ کیلووات‌ساعت»): the refusal there is the engine's ✗ on the scale (Q1/C15, arith); with my change the line now
  says so («با حسابِ صفحه نمی‌خواند») instead of «یا حکم». It lands once a46 reads it.
- No real-model run of the two new turn lines (`undo`, `which`); the tests use the recorded and scripted replies.
