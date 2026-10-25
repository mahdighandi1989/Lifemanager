# Tour 1 (Pólya), round 24: fixer «story» handoff (2026-10-25)

Scope (DECISIONS_R24 «Fixer split / story»): R2 (one story, stage and turn question) + R8 («کارِ پیشینِ من», roadmap §21). Base: `3685102d`.
WORKLOG (106), PROGRESS 115, HANDBOOK §10 row (2026-10-25) + §12 row 63. Numbering follows FIX24; the correction fixer (105/114, its §12 row 62) is merged in.

Files: `src/app/a45_story.js` (most of it), `a38_live.js` (`storyPh`, `A.liveTurnPhase`, prompt block stage, prior turn question in `coachCore`),
`a27_tour.js` (`storyAns24`, `qParts`, `coachPhase0` story merge, `compactLive` stage, `unfit23` re-check exemption, prior suggestion in `coachLines`),
`a44_route.js` (`MAIN_K.cprior`, «حکم» in `PRE.gotSoFar`). Tests: new `tests/test_tour1_r24_story.js`, byte copy `tests/variants/VARIANTS_R24.json`;
two turns of `tests/test_tour1_r23_story.js` now give `plan.steps` (commented).

## Contract: the turn stage (for classify / correction / today)
- `A.liveTurnPhase(pid)` = form stage, or `A.liveStoryPhase(pid)` when the validated chat story is ahead (never `done`; look-back only from the form or a whole-problem result).
  `coachCore` (so `A.liveCoach(...).ph`, the live prompt block «مرحله:», `compactLive` and a27's coach header via `coachPhase0`) all use it.
  `A.livePhase` is unchanged (form readers). **classify:** your single turn-question source should read `co.ph` / `A.liveTurnPhase`, not `A.livePhase`.
- Story result items carry `fin` (true = answers the whole problem: «جوابش … شد», «پس کلاً …», «حل شد», or after the last plan step). `phaseOfItems`: `fin:false` ⇒ «اجرا».
  Legacy items without `fin` still count as before.
- `AS.storyAns24(s, q, mt)` — a u/d/c question already answered by the story of the current chat pk, by her own first-person question in this problem's window
  («چند تا تخته بخرم؟»; method questions «چطوری پیدا کنم؟» excluded; «بعدش چی کار کنم؟» excluded), or by `unfit23`'s own «مجهول را خودش گفت» clause.
- `unfit23` no longer demotes a page question that is a post-correction re-check (contains «اصلاح‌شده / دوباره وارسی / پس از اصلاح / مقدارِ تازه»); parentheses are ignored.

## Contract: import filters (for correction)
- A message with `coach_state.retract` or her own correction marker (`A.STORY.corrMsg(t)`: «اشتباه کردم/گفتم»، «ببخشید یه …»، «۱۶ نه، ۱۵») never yields story items
  `whole/u/c/d`. The correction engine stays the only writer of the corrected value.
- `dataOf(t, fail)`: sentences with attempt markers (`امتحان کردم`, `حدس زدم`, `فرض کردم`, `فکر کردم`) and negated/conditional clauses are not data; with `fail:true` everything
  after the first attempt marker is the attempt. Rejected attempts become story items `tried` (EVLOG `ctried`, «امتحانِ ردشده (از گفت‌وگو)»).

## Contract: plan steps (for today / route)
- Plan pieces only from her own numbered/bulleted list (`LIST24`) or the model's `coach_state.plan.steps` (each quote validated in her message; invented ones dropped).
  A plan sentence «اول …، بعد …» without steps is ONE plan entry (bank R24 #31). A message ending with «خوبه؟/درسته؟…» is never a plan.
  The prompt gets one context line asking for `plan.steps` when her message carries plan verbs.

## Contract: «کارِ پیشینِ تو» (R8) — for classify (multi-facet), today (dossier/mind), loop (territory step)
- Model: `coach_state.prior = [{step, quote, verdict: ok|incomplete|wrong|unchecked, why, fix?, dep?:[n], cause?: prereq|knot|skill|unknown}]`.
- Page object (story ledger `s.coach.story[key].prior`, and `L.prior` on the live problem): `{at, mid, steps:[{n, step, quote, verdict, why, fix, chk (her-facing, never the
  right number), chkM (coach-facing, with the value), dep, depWrong, said, cause, her: ""|ok|no, herWhy?, fixed?: {t, was, at}}], resume, ph, fin, rej, st: ask|ok|no, sum}`.
  `A.STORY.priorFor(s, pid)`, `A.STORY.priorTurnQ(s, pid)` (resume question until new plan/step/result after it), `A.STORY.arithChk(text)`, `A.STORY.workMsg(text)`.
- EVLOG event `cprior` («کارِ پیشینِ تو (از گفت‌وگو)», one line per step with verdict and «وابسته به گامِ n») ⇒ 📜 and 🧭 main line.
- Mind card: `AS.coachEvent(s, "c", "prior", quote, ok, {prior: n, cause})` per judged step. **today (a29/a42):** if the mind card groups events, `src:"prior"` with `ok:true` is her own
  correct step (never a «گیر»); `ok:false` has `cause`.
- **classify:** the multi-facet tour from a prior text (self-label, factual claim) is only a prompt line («اگر چند وجه دارد … ترتیبشان را بپرس»); building facets from `prior` is open
  (HANDBOOK §12 row 63 b). **loop:** a prior step that needs a missing tool should go through your `gap.step` (bank R24 #166 is NC here).

## Not done
- No real-model run of `prior` / `plan.steps` (AGENTS rule for AI-path changes) — HANDBOOK §12 row 63 (a).
- Symbolic numeric checks (π, parentheses, equation roots) and electrical unit dimensions (W/V = A) are the model's.
- No sibling fixer branch was named by the coordinator before this commit.
