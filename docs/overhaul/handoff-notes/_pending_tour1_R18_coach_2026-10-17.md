# Tour 1 (Pólya), round 18: coach fixer handoff (2026-10-17)

Scope (DECISIONS_R18 «Fixers / coach»): RM1 a b c e, RM4 b (coach_state side) c, RM5 a–e, RM6 a c f g, RM2 d, INF4, INF5. Base: `204585c1`.

Files changed:
- `apps/learning-architecture/src/app/a27_tour.js` (coach), `a29_mind.js` (mind card), `a26_assist.js` (only the bubble renderer: `richNodes` for «**…**»), rebuilt bundle.
- Tests: new `tests/test_tour1_r18_coach.js` + `tests/tour1_variants_r18_coach.js` (the coach mechanisms of VARIANTS_R18.json, 124 entries; named `_coach` so it cannot collide with the other fixers' bank files); `tests/test_tour1_mind_factory.js` updated to RM1c (old assertion «no data ⇒ ½ and ¼ for each phase» contradicted DECISIONS_R18).
- `docs/overhaul/REMOVAL_CANDIDATES.md` (quarantine entry), `apps/learning-architecture/docs/WORKLOG.md` (70), `PROGRESS.md` row 87.

Not touched: a38, a39. Not done here: HANDBOOK, AUDIT_LOG, experiences, push, merge to main.

## Items

| Item | What changed |
|---|---|
| RM1a | `coachEv(s, ph, src, mt, ok, extra)` writes successes (`src: "chatok"`, `ok: true`): validated `coach_state.ans` (stage from the id prefix u/p/e/b), a phase passed with own evidence (u→p ⇒ understanding, said plan ⇒ planning, said result ⇒ execution), `chat_solved` (execution, same key as a same-turn result ⇒ counted once). A fail reported right after a result retracts that result's success (one event). Stuck/fail never yields a success. a29 reads `chatok`. A chat look-back counts when the lesson is hers OR the check was verified from her messages (`chkBy: "msgs"`). |
| RM1b | a29 reads the live tunnel's own records (no a38 edit): each saved plan (`L.plan` + `L.planHist`) = planning success; auxiliary problem crossed = success / unused = failure; `L.wins` «datum» (data first used in a step) = planning success. Steps and look-back were already counted. Source label `lplan`. |
| RM1c | `M.phases()` marks `none` rows; `pWeak` and `weakest` are computed only among rows with data, and `weakest` is null unless ≥ 2 rows have data. Card/phasesText/coach line show «هنوز داده‌ای نیست» and never rank empty stages. |
| RM1e | The card has no stage→construct mapping, so it says so in words under the table (`.mind-phradar`, `M.PH_RADAR`); no invented mapping. |
| RM4b | `coach_state.guess {text, q}`: `q` kept on `m.guess` only if it is verbatim (whitespace/ZWNJ-normalised) in that assistant message (`AS.guessQInMsg`); otherwise `m.guess = {text}` without q. The live fixer attaches the note only to the option built from q. |
| RM4c | A validated guess while the session is bound to an open live problem ⇒ `solve.g[1]` of that problem (same `guessToProblem` as the chat_invent path; an existing page guess is never overwritten). |
| RM5a | Plan states open/done/notdone/expired. A past model date is rejected. The follow-up offer (`planSeen`) needs an open plan reported today with a date ≥ today. A plan whose date passed (or a «next-session» commitment, in a later session) gets ONE context line «… جویا شو انجام شد یا نه» with `plan_done {id, done}`; asked and unanswered ⇒ expired, never asked again. |
| RM5b | `plan.same:<id>` ⇒ no new plan; same validated text the same day ⇒ refused (within the session: containment either way; across sessions: identical text). |
| RM5c | `plan.on_guess:true` ⇒ «اول حدس را بیازما» instead of the follow-up; guess + plan in one message without on_guess ⇒ the same, conditionally. |
| RM5d | When the last assistant reply carried no coach_state, a candidate request (imperative from the verb-stem list, «میشه/لطفاً/می‌خوام بدونم/یادم بنداز», or a question; not rhetorical «آخه…», not «just the answer», not already covered by the reply's words) gets «# درخواستِ عقب‌افتاده (نامزد، شاید)» with «اگر هنوز پاسخش نداده‌ای…». Never stores. |
| RM5e / INF4 | `when: "next-session"`; Today (`A.dueList`) gets one «📌 برنامهٔ خودت» line per open plan that is due (or next-session); text through `APP.MATH.toPlain` when present. |
| RM6a | `regSigns` = old closed list (quarantined as `regSignsR17`) OR structural evidence: 2sg verb (incl. «میگی» without ZWNJ), «…ی؟», clitic «ـت» before «میشه/چیه…», imperative from `STEMS`, compound imperative («ثبتش کن»، «کمک کن»); «شما»: -ید/-ین incl. unprefixed «کنید/کنین». The model's register is accepted when her own message carries that evidence; without any evidence the current register stays (see deviation below). |
| RM6c | `coachPhase` and `turnSig` no longer move to look-back on RESULT_WEAK alone, nor on someone else's answer (`OTHER18_RE`: teacher/book/statement said …). In plan/execution a weak-only result adds a context line asking the model to report `said:["result"]`. |
| RM6f | After a chat closure (session bound to a done problem) a short, non-question, non-guess message is not a new problem: no `C.stmt`, header «مرحله: — (…بسته شد…)», no stage list / «پیشنهادِ این نوبت». A real new problem still gets «فهم». |
| RM6g | «(دورِ ۱۷، RC3: …)» removed from `LIVE_FALLBACK`; structural scan in the test over SYS + every page-authored block (user content in «…» and the conversation blocks excluded; «# نقشهٔ سامانه» excluded — it is the registry-derived ownership map required by the AGENTS sheet contract). |
| RM2d | a26 `richNodes`: «**…**» in assistant bubbles ⇒ `<strong>` (math/bidi inside each piece); user text untouched. |
| docs | `# گزارشِ وضع` documents `when:"next-session"`, `same`, `on_guess`, `plan_done`, `guess.q` as context. |

Quarantined (reachable via `APP.ASSIST.R17_QUARANTINE`): `planSeen`, `plan`, `regSigns`, `guessMsg`, `chkWindow`.

## Live fixer's contract (after merging bfc81b98)
- `m.guess = {text, q}` — done (RM4b).
- `coach_state.step {step, done, what?, match?}` ⇒ `APP.liveStepReport(pid, {…, msg: <1-based index of her current message unless given>}, s.id)`; pid = the session's bound live problem (or `s.lprob`). Documented in «# گزارشِ وضع». Test `step`.
- RM6e (a27 side): `chkWindow` starts at the first user message that quotes the problem's statement; failing that, the last restatement by distinct tokens; failing that, the record's creation time in this session (a first-match on loose token overlap was rejected: it let another problem's statement open the window — r17 rc4 «other problem»); `sameStmt` counts distinct tokens. Test `rm6e` (s31 shape: a later message with repeated variants no longer pushes the window past her check messages).
- INF7 for `#lpRBest`: «پیامِ کامل» button + `.lp-rfull` box, source `APP.liveChatQItems(pid)[i].src`. Test `inf7`.
- a38's toPlain on chatItems/stored bestQ and the math fixer's `lbOpts` toPlain kept as merged.
- Old tests updated to RM6c: `test_tour1_r5_coach.js` (F1 s18 bare «پس v = …», s37), `test_tour1_r6_coach.js` (G3 s38 phase, G4 «پس فقط ۳», G4 head «پس ۵۵ دقیقه») — each now expects «no phase jump; offer line or the model's report».
- Docs renumbered after the merge: WORKLOG (70), PROGRESS row 87.

## Variant bank results (VARIANTS_R18, coach mechanisms) — all pass on the fix, red on 204585c1
- RM1.evidence 19/19 · RM4.guess 16/16 (coach side) · RM5.plan 20/20 · RM5.defer 17/17 · RM6.register 19/19 · RM6.result 16/16 · RM6.leak 17/17 (scanner self-test).
- Base (204585c1): rm1ev 16 fail, rm4g 9 fail, rm5plan crashed (no lifecycle API), rm5def 9 fail, rm6reg 6 fail, rm6res 3 fail.

## Deviations / notes
- RM6a: DECISIONS says «accept unless the user's text carries evidence of the other register». The R17 bank (still green) and R18 bank («مرسی» ⇒ none) reject a report with no evidence at all; so the rule is «accept with own evidence; no evidence ⇒ register unchanged». The real failures (s06 «ثبت کن», s16 «باورت/میگی/مطمئنی») are fixed by the structural evidence.
- RM6c: only RESULT_WEAK (and someone-else's answer) lost the power to move the phase; RESULT_STRONG («رسیدم به …», «جواب ۱۲۰») still moves it, as DECISIONS names RESULT_WEAK and earlier rounds rely on strong. Bank RM6.result pos entries are checked through the model-report path.
- RM1a «a phase passed»: one success for the stage just completed, not for every intermediate stage of a jump.
