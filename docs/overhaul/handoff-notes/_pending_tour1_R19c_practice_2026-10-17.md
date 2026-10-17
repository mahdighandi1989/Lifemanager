# Tour 1 (Pólya), round 19c: practice handoff (2026-10-17)

Scope (DECISIONS_R19c «Fixers / practice»): LT2 (open practice case), LT3 (stability from dated evidence), LT5 (one record per act),
LT6 (links back), LT7 (running lists). Base: `claude/life-program-flow-diagram-q37jvr` at 60d94930 (round 19b merged, incl. `a40_dossier.js`).

Files changed:
- New `apps/learning-architecture/src/app/a41_practice.js` (`APP.PR`, view `practice`, technique tab «🧪 پرونده‌ها», lists, assistant action `start_practice`).
- One-line hooks: `a3_views.js` (tab `prc` → `A.practiceTab`), `a16_knots.js` (`ex.knot = k.id` on the knot worksheet, both create spots),
  `a25_graph.js` (type `practice`, edges to `tech` and to the subject), `build.py` (file list: `"a40_dossier.js", "a41_practice.js", "a42_sched.js"` — each only if present).
- Tests: new `tests/test_tour1_r19c_practice.js`, byte copy of the bank at `tests/variants/VARIANTS_R19c.json`, `tests/test_graph.js` covers `practice`.
- Docs: WORKLOG (78), PROGRESS row 94, HANDBOOK §4 section «🧪 پروندهٔ تمرینِ باز» + §10 row.
- Not touched: a29, a38, a27, a40_dossier (wrapped `A.dossier` from a41), the sched module.

## Numbering / gate note
WORKLOG (78) and PROGRESS 94 were assigned by the coordinator; (77)/93 belong to the sched builder. `build.py --check` requires 1..N without gaps,
so this branch alone fails the docs gate until the sched branch (77/93) is merged first. The committed bundle was built with a temporary
77/93 numbering (to run the suite); **after merging sched then this branch, run `python apps/learning-architecture/build.py` once and commit the bundle.**

## Contract with the sched module (a42_sched.js)
- a41 calls, at every case save: `A.SCHED.register({ kind: "practice", id, due, until, reason, policy: { tid, shape, cite }, open: ["practice", caseId], txt, sub })`
  and for ids it registered earlier and no longer has: `A.SCHED.unregister({ kind: "practice", id })` (object form). List items use ids `caseId:itemId` / `caseId:ev`.
- Only when `A.SCHED.due` is absent does a41 add its own «🧪» lines to `A.dueList` (checked at call time, so a later-loaded a42 takes over with no double lines).
  If a42 wants to render the line itself it can use `txt`/`sub`/`open`. `APP.PR.due(day)` returns the same entries for cross-checking.
- T41's 1/3/7 steps are NOT registered by a41 (the P3 `sched` records carry them and a42 wraps P3); a41 registers the post-stable check-in and a re-anchored cycle after decay.
- T9 / T24 dates live on the `fcast` records (a42 registers fcasts); a41 adds nothing for them (no two lines).

## Contract with the mind card (LT4, a29)
Read `practice` records: `state`, `stable {d, crit, ev[], next, checks}`, `withdrawn[]`, `sessions[] {d, at, ok, meas, self, ex[]}`, `hist[]`. Same-day work is already one session.
Records with `sample` are tours/samples — skip them. `APP.PR.calib()` lists every calibration act once (fcast incl. live steps and linked T24 rows, legacy unlinked T24 rows, card confidence «مرور کارت»).

## Items
| Item | What changed |
|---|---|
| LT2 | `practice` record per (technique × subject), created/continued from `A.onExDone`, page buttons, workshop «ادامهٔ پرونده‌ی باز», `A.newEx` on a topic with an open case, course, `start_practice` (consent-validated). Same day = one session; draft ≠ session; viewing writes nothing. Pause/resume/close/claim. |
| LT3 | `PR.POLICY` (45 techniques, verbatim cites), `PR.eval` replay (on-time / early / late with days / fail), criteria steps/knot/exp/calib/transfer/cards/verdict/recur, check-in + withdrawal with date. `A.mastery` counts days; count-only path quarantined as `A.masteryCountOnly` (record in REMOVAL_CANDIDATES when merging). |
| LT5 | T24⇄fcast (two-way outcome, 🎯 duplicate guard), T9⇒est fcast + `PR.t9Score`, T21⇒kexp on knots and live steps listed from the step, T22⇒epistemic case (revdate, outcome, prcHist once), T41⇒P3 (one cycle; `A.start137` refuses a second), T42 card grades ⇒ sessions. |
| LT6 | `PR.guessTest` writes `g[1].prcTests/refuted/testRes`; dossier events; `PR.knotSuggest`; links by id. |
| LT7 | lists assumptions/models/mistakes/beliefs/ambiguities/pareto/claims with cadence from the technique text; claims only with the user's own date. |

## Bank (VARIANTS_R19c) — all green
LT2.case 18/18 · LT3.stable 19/19 · LT5.one 16/16 · LT6.link 17/17 · LT7.list 18/18. Red on the base build (no `APP.PR`).

## Not done / open
- The base build turns the bank red by absence; behavioural red per entry was not re-derived on a partial build.
- T2 «پس از هر ۳–۵ جلسه» and per-session habits (T5, T33, T45) have no due (session-count cues not built).
- Mind-card reading of practice records is LT4 (mind builder).
