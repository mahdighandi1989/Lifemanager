# Tour 1 (Pólya), round 19: coach fixer handoff (2026-10-17)

Scope (DECISIONS_R19 «Fixers / coach»): RN1, RN2 d e, RN3 a b c, RN6 a b c d, INF10. Base: `313b64b8`.

Files changed:
- `apps/learning-architecture/src/app/a27_tour.js` (coach), `a29_mind.js` (mind card), `a3_views.js` (only: Today due rows render a generic `acts` button row, `data-own`), rebuilt bundle.
- Tests: new `tests/test_tour1_r19_coach.js` + `tests/tour1_variants_r19_coach.js` (the coach mechanisms of VARIANTS_R19.json: RN1.defer, RN2.link, RN3.label, RN6.edge — 76 entries).
- Docs: `docs/overhaul/REMOVAL_CANDIDATES.md` (quarantine entry), `apps/learning-architecture/docs/WORKLOG.md` (72), `PROGRESS.md` row 88.

Not touched: a38, a39. Not done here: HANDBOOK, AUDIT_LOG, experiences, push, merge to main.

## Items

| Item | What changed |
|---|---|
| RN1 | `deferCand(s, mt)`: the previous real user message is paired with THE reply to it (first `ai` after it, before the next user message; replies to «[سامانه: …]» turns are skipped). Candidate only if that reply had no `coach_state`. A candidate is a request addressed to the assistant: imperative (`ب`+stem, «توضیح/یاد/نشون… بده/کن/بزنید»), «لطفاً», «یادم بنداز», «میشه/می‌شه … ؟» with an addressed verb/pronoun («بهم بدی؟», «بگی…»), or a wh-question («چرا/چطور/از کجا/به چه درد…؟», ≥3 tokens). Never: copula «میشه», yes/no «میشه … حلش کرد؟», trial words, guesses («شاید/فکر کنم…؟»), echo of the assistant's own question, the bound live problem's statement (or the chat statement when it came from an earlier message), manner constraints with a negated imperative («جوابو نگو، فقط راهنمایی کن»), page acts the system turn reports done («بیا ثبتش کنیم» ⇐ «… ثبت شد»), existing or closed promises. A wh-question answered with the same words and NOT deferred is covered; a reply that quotes it while deferring («بگذار برای وقتی…») keeps it a candidate (s14o). `sentsOf` no longer splits at a decimal point. Still ask-only. |
| RN2d | Plans link to live steps: `coach_state.plan.step` (1-based number / id / text), or `plan.same` with a step ref, or a plan text verbatim equal to a step of the bound problem. `planSync` derives the plan state from the step's outcome (a38 data read: `st.out` not auto, or `st.chatRep`). `plan_done` on a linked plan reports the step via `A.liveStepReport`. Guesses get session ids (`s.coach.guesses`, g1…); new field `guess_res {id|text, res: refuted|confirmed}` (validated: known guess, her real message). An `on_guess` plan whose guess is refuted/confirmed (by `guess_res` or a38's `solve.g`/`guessHist`/step `out.guess.rel`) becomes `state: "review"` — never «انجام شد؟», no Today line. A due on_guess plan with an untested guess gets «اول حدس را بیازما» once (with plan and guess ids), not «انجام شد؟». |
| RN2e | Events carry an act id: a turn with a validated step report gives its execution/fail events `act: "lstep:<pid>:<stepId>"` (step found as the one touched by `A.liveStepReport`); plan_done events too. a29 skips an event whose act is a live step already counted by its outcome, and collapses duplicate act events. |
| RN3a | `APP.MIND.weakestOf(rows)`: a stage is named weakest only if it has ≥1 failure and its observed k/n is strictly lower than every other stage with data; otherwise none. Card: «هنوز تمایزی دیده نشده …»; coach line (`weakPhaseLine`) says the same and lists counts without ranking. |
| RN3b | Over-confidence black spots need ≥1 event of that kind: an answer with conf > ½ that was wrong; a directional forecast whose more-likely side did not happen. Forecast text now says «… N بار از M رخ نداد (K بار رخ داد)». |
| RN3c | Her own restatement (validated `said` u/c, not pasted, ≥2 tokens) ⇒ understanding success; validated `plan_done:true` ⇒ execution success; plan + result in one turn ⇒ planning AND execution success, also in live-bound sessions. A pattern-only «حل نشد/اشتباه بود» (no coach_state) about a guess or trial (guess in the message, a «…؟» trial before it, or a validated guess in her previous message) is stored `pend: true` and not counted; other pattern failures and an explicit «گیر کردم» still count (r4 E1). |
| RN6a | After closure, a short message ending with a meta question («بعدی؟», «خب؟», «ادامه؟», «… بعدی؟») is not a new problem (the `؟` filter ignores the trailing meta question). |
| RN6b | New `coach_state.result` = verbatim result text. If present in her message, `said:["result"]` is kept even when the pattern saw only a weak result (s38 «… = a²b/6»); if absent from her message, result is rejected. |
| RN6c | `regIn` (no model register) counts only the USER's register evidence (`fbSigns`: the structural signs of `regSigns` after removing reported speech «گفتم شما برید…», first-person verbs «بکشم/بذارم» and bare «تو» (mostly the preposition); an explicit «شما» next to a colloquial imperative «شما که ماشینی، بگو» reads «شما», next to «خودت»/«می…ی» it does not — r16 n4 stays green); assistant forms never count. Old tests updated: `test_tour1_r17_coach` rc1reg+ (the R17 clause «no «شما» from the pattern before the report» is replaced by RN6c), `test_tour1_assist` 6b (tie ⇒ «هنوز تمایزی دیده نشده»). |
| RN6d | Prompt block «# برنامه‌های بازِ خودش (شناسه‌ها)» lists every open plan as «plN: «…»»; every plan follow-up line carries its id. |
| INF10 | Today «📌 برنامهٔ خودت (plN)» line has «انجام دادم / انجام ندادم / هنوز نه» (`AS.planTap`; `.plan-done/.plan-notdone/.plan-notyet`, inside `[data-own]`, class `dopt`). «هنوز نه» keeps the plan open, clears the ask, hides it until tomorrow, and is offered only once. |
| docs | `# گزارشِ وضع` documents `plan.step`, `result`, `guess_res`. |

Quarantined (reachable via `APP.ASSIST.R18_QUARANTINE`: `deferCand`, `sentsOf`, `regIn`, `planDone`, `plansDue`, `weakPhase`; and `APP.MIND.weakestR18`).

## Contract for the live fixer (a38)
- No a38 edit. a27 reads `solve.live.steps[].out|chatRep`, `solve.g[1]`, `solve.live.guessHist` and step `out.guess.rel`. If RN2a applies chat step outcomes at once (`st.out`), RN2e dedupe and the plan link work unchanged (both `out` and `chatRep` are read).
- The guess-note register wording (RN6c, «(حدسِ شما: …)») is the live fixer's; `APP.ASSIST.convRegister(s, mt, pids)` now reads only the user's forms when the model gave none.

## Variant bank results (VARIANTS_R19, coach mechanisms) — red on 313b64b8, green on the fix
- RN1.defer 21/21 · RN2.link 16/16 · RN3.label 19/19 · RN6.edge 20/20 (two recorded deviations, below; two entries are the live fixer's guess-note wording).
- Base 313b64b8: rn1 12 fail, rn2 9 fail, rn3 15 fail, rn6 9 fail.

## Deviations
- RN6.edge «U: جواب ۱۲ (no coach_state) ⇒ phase does not move»: not changed. RN6b says «only unvalidated patterns lost that power in R18»; in R18 that was RESULT_WEAK only, and RESULT_STRONG («جواب ۱۲۰», «رسیدم به …») is relied on by rounds 4–18. Followed DECISIONS as implemented; recorded in the test (`info.rn6.dev`).
- RN6.edge «model register "sh"; user once wrote «نگو» ⇒ model wins (شما)»: contradicts RM6a (a report is rejected when her message carries the other register's evidence). Followed DECISIONS.
- RN1: DECISIONS lists imperative / «میشه…؟» / «بگو…» as candidate forms; wh-questions addressed to the assistant are kept as candidates too, because the R18 bank (must stay green) and runner B's s14o miss require them. Yes/no questions and questions without a question word are not candidates.
