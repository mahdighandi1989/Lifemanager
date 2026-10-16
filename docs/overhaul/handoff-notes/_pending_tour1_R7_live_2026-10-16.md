# Tour 1 (Pólya), round 7: «live» fixer handoff (2026-10-16)

Scope: H2 and H3 of `DECISIONS_R7.md` (DECISIONS_R2–R6 still bind). Files: `apps/learning-architecture/src/app/a38_live.js`, plus small reported edits in `a27_tour.js` (coach-owned). Not done here: docs (WORKLOG, PROGRESS, HANDBOOK, AUDIT_LOG), push, merge.

## Commits (base 3c2846b)
- `8dec9fb` — H2/H3 code (first pass).
- `f950767` — turn text from the hook context, session-scoped stuck run, life-pod `lpSeen` wording; new test `tests/test_tour1_r7_live.js`.
- `e0510b6` — coordinator follow-ups: boolean `turn.abandon` honoured; a38 refuted-guess line only on the refutation day; coach header on new-guess / refutation turns.
- `8d21089` — refuted-guess line = first turn after the refutation AND same day (keeps R6 G2); `lpBBest` list match without a question word needs «بیش از نیم» overlap from both sides (`sameQBoth`); test isolation.
- (this note) — the last commit of the branch.

## Test
`tests/test_tour1_r7_live.js` — sections `H2-seq`, `H2-aside`, `H2-cards`, `H2-checkin`, `H2-refuse`, `H2-overcollect`, `H2-execstuck`, `H2-twoq`, `H2-abandonbool`, `H3-reffresh`, `H3-headnew`, `H3-proverb`, `H3-law`, `H3-lifepod`, `H3-best`, `H3-refhist`, `H3-header`, `H3-present` (`ONLY=<prefix>`); 39 checks. Every chat check drives the real assistant panel (stub model) and reads the turn question from the prompt that was sent.
Red baseline: `LLA_FILE=<3c2846b dist html> node tests/test_tour1_r7_live.js` exits 1 with 25 failing lines (every section red; `H3-headnew`'s chat part is green there too, its `AS.coachLines` check is the red one); the fixed build prints «NO ERRORS».

## H2 — turn-question priority (`coachCore`)
- **Turn identity.** A turn is one user message in a chat session: `turnKey()` = session id + number of user messages + message key, read from `AS._hookCtx` (set by a26 while hooks run). Several `liveCoach` calls in one turn (coach hook, live hook) are one turn; a direct call without hook context keys on the text. If the coach's `turn` carries no `text`, the current user message from the hook context is used (not a «[سامانه…» message).
- **Stuck sequence (s02).** `L.stk` (persisted in the problem record) counts consecutive stuck turns in the same session; a new session restarts. The sequence, general→specific, advanced by that count and never repeating the previous turn's question: set-aside datum (only if a guess was refuted or every other datum is used) → restate after a failed real step (exec) → «همهٔ داده‌ها؟» → the unused datum by name («دادهٔ «X» را کجا به کار برده‌ای؟…», or the unused condition part in objective exec) → exec + induction: `Q_BASE` → «از خواسته/حکم به عقب» → related problem (if one is linked) → auxiliary («فقط بخشی از شرط / حالتِ خاص»). New `src` values: `stuck-name`, `stuck-exec`, `stuck-related`, `stuck-aux`. `liveCoach` returns `stuckN`.
- **Set-aside datum (s30).** With another datum unused, stuck ⇒ `stuck-alldata`, not `stuck-aside`.
- **Card order (s36).** `specCards`: unresolved page refusal (`refuse`: goal gate `lpGoalW`, «از طرحت نمی‌آید» switch, induction base) → equivalence / multi / presupposition / aside → equations → incubation → mid-course.
- **Mid-course (s01/s04/s36).** `checkDue` counts from the first step's day (no step ⇒ creation, as before). As turn question: once only (`L.ckHold = {due, k}`), and never on a turn whose message carries the user's own «؟».
- **Goal gate (s35).** Fires only once a rotation is under way (at least one earlier step); the first step is the plan's own action.
- **Practical over-collecting (s01).** `OVERCOL_RE` on a practical problem ⇒ «کجا خط می‌کشی؟…» (`turn-line`); the all-data question is suppressed that turn.
- **Exec stuck, no step, data all used (s25)** ⇒ `Q_BASE` (induction) or backwards; never the generic «هر گام را وارسی کن».
- **One question per block.** a38 child-problem mapping line is context («زمینه (نه پرسشِ دوم)»). a27 C145 line becomes context when `o.guess` (edit below).

- **Coordinator follow-ups.** (1) `T.abandon` boolean from the coach is used as is; `ABANDON_L` on the text only when it is absent (negated «ولش نمی‌کنم», incubation «کنار بذارم» no longer give `turn-abandon` once the coach passes `false`). (2) a38's «حدسی که خودش با آزمون رد کرد … بپرس از ردش چه آموخت» line: first turn after the refutation AND the refutation day (date of the refuting step's outcome). (3) see H3 header.

## H3 — wording and flags
- Coach header (a27 `coachLines`, `phHead`): phase «بازنگری» shown as «فهم» when a problem was closed (`o.closed`) and this message is a new guess (`o.guess` or «حدسم/حدس می‌زنم/فکر کنم»), and as «طرح‌ریزی» on a refutation turn (`o.refuted` or `GUESS_REF_RE`). Only the header word; the question list is still the coach's (s25, s12 p5).
- Prove proverb in chat uses `qp` (a27 edit below) (s03).
- `lpBLaw` only for a practical problem whose statement/unknown is not a choice (`CHOICE_RE`: انتخاب/گزینه/تصمیم/بهترین/«Xم یا Y») (s01).
- Life pod (`goalWord` = «فرضیه»): plan/exec question lists (`phaseQs` → `podWord`), related card heading and proverb, `lpSeen`, `lpClear` say «فرضیه», never «مجهول» (s05).
- `lpBBest`: a chat sentence that matches a known list question (or the all-data question) is kept without an interrogative word; answered questions are always kept, the old last-8 window applies only to unanswered ones (s02).
- `A.livePlausible`: `refuted` now = refuted consequences + `live.guessHist` (refuted guesses replaced via «ثبت به‌عنوانِ حدس»); `refutedNow` = only the current guess (the cap still uses it); `refutedG` lists the texts. So a27's «دوباره پیشنهاد نکن» stays (s01).
- Coach header: practical/life exec reads «اجرا روی واقعیت» (a27 edit below) (s22).
- Proof look-back + «چطوری بگم/توضیح بدم؟» (`PRESENT_RE`) ⇒ the direct-proof item (`turn-present`) (s10).

## Edits outside a38 (coach-owned a27, minimal)
1. `nextQFor`: the ALLDATA override is skipped when `nq.coach.stuckN > 1` (otherwise it re-imposes «همهٔ داده‌ها؟» on every stuck turn).
2. C145 line: context when `o.guess` (turn question is the guess test).
3. `proverbs()` maps `qp` → `askp`; the proverb line uses it when `cls === "prove"`.
5. `coachLines`: `phHead` (header phase on new-guess / refutation turns, above).
4. `coachLines`: `phF()` names the exec phase «اجرا روی واقعیت» for `pract`/`life` in the header, the «صفحه هنوز» note and the live-list line.

## Older tests changed
- `test_tour1_r5_live.js` F7: the new guess's tally is `refutedNow === 0`; `refuted === 1` (R7 H3 keeps the refuted guess).
- `test_tour1_r6_live.js` G6-goal: a first rotation step is saved before the prize step (gate now needs a rotation under way); expects 1 step.

## Verification
- `python apps/learning-architecture/build.py` (and `--check`: in sync).
- All page node tests via the pytest browser wrapper: 80 passed.
- `pytest tests/ -k "learning_architecture and not graph_browser"`: 8 passed.

## Not done / for the coach
- Header (s25/s12): only the header word moves; the coach's question list on those turns is still the look-back list — the coach's phase inference (H1) should start the new problem's list from understanding.
- The coach hook line «سکوت، «نمی‌دونم» … ⇒ همان پرسش را با تغییرِ کوچک تکرار کن» now disagrees with the stuck sequence (the live block gives the next, more specific question); the coach may want to word it as «همان پرسشِ نوبت (بالا)».
