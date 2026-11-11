# Tour 1 (Pólya), round 25: «today» handoff (P7 + C1/C12, 2026-11-11)

Scope (DECISIONS_R25 P7 and Clarifications C1, C12): one prediction one 🎯 (also through practice_log), judged predictions leave Today,
her own dates reach Today through the page, «تا جمعه», chat-guess outcomes, a child's school name in 📜, the child's puzzle line,
route duplicates, the deadline-correction why. Still-open items in these files: A23-8 (guess outcome, same-named points), A23-25, A21-11, A23-26.
Base: eeb11d1f. Docs: WORKLOG (127), PROGRESS 126, HANDBOOK §10 row and §12 row 67. The numbers assume the six siblings are merged first
(the handbook gate reports the numbering gap on this branch alone).

## Functions changed (per file)
- `a41_practice.js`: `t24Judge`; `PR.bookPred`, `PR.predExplicit` (rewritten); new `PR.predVerdictIn`, `PR.predVerdict`, `PR.predFor`,
  `PR.predMark`, `PR.pctOf25`, `PR.whenInfo`, `PR.herDates`, `PR.datePend`; `PR.guessOwnTest` (new shapes); the a41 after-turn hook; one new
  prompt hook (page-built block, NOT `AS.SYS`).
- `a27_tour.js`: `plan18` (date source only), `coachEv` (one guard + `AS.pureCmd25`), `retractApply` (the why of the two session-record pushes).
- `a38_live.js`: `retractSess` — only the `why` of the deadline `fixHist` entry.
- `a40_dossier.js`: `addSessEvents` (guess line), `A.dossierSess` inner (prediction events).
- `a44_route.js`: `A.ROUTE.model` (dedup + `short` for chat points) and the list line of the view. No `sys*` function touched.
- `a43_age.js`: `G.privText` (+ `priv25`, `nameCut25`), a privacy wrapper on `A.dossierSess`.
- `a34_psy.js`: the last lines of the mind-card psy section. `a29_mind.js`: `M.techWork` (`R.calN/calK`) and the measure cell. `a21_orient.js`: one word.

## Contracts for the other fixers
- **Predictions.** A session prediction is `coach.preds[] = {text, at, key, due, p, fc, out:{res,at,quote}, dueAmb}`. `PR.bookPred(s, text, at, key, by)`
  reads the date from her own sentence that contains `text` (`PR.whenInfo`); a plan's day is used only if the plan is from the same message
  (`q.at === at`) or shares ≥ 2 content words. A key ending in `#n` is one of several predictions of one message.
  `PR.predVerdictIn(text)` ⇒ `{ok, sent}` for a judgment sentence («پیش‌بینیم غلط بود»، «… درست درومد»); such a sentence is never booked as a
  prediction. `PR.predVerdict(s)` judges the matching open prediction (stated percent, else unique word overlap, else the only open one);
  no confidence ⇒ no 🎯, only `out`. `t24Judge` also searches open chat 🎯 (`by:"chat"`, no `prc`) and binds the judged one to the case (`fc.prc`).
- **Dates.** `PR.whenInfo(text, from)` ⇒ `{date, amb?, wd?, src}`: «X ِ هفتهٔ بعد» = that weekday in the Sat–Fri week after today's; the
  same weekday said on that weekday ⇒ `amb:true` (nothing is booked; `PR.datePend` asks once). `PR.parseWhen` is unchanged.
  `s.datePend = {at, msg, d0, state: open|booked|dropped, items:[{what, date, amb, wd, pred?, plan?}]}`. The answer is read from the NEXT user
  message only, matched by message identity (`msg`), never by time order. A yes («آره/بله/درسته/همینه/دقیقاً» — not «باشه/چشم», which accept the assistant's words) books a `deadline` record `{by:"her-words", src, quote}`.
  The page asks only when no deadline / plan / 🎯 of this session already carries that date.
- **Plans (`plan18`).** No model date ⇒ `PR.whenInfo(plan text)`; else `planDate18` only when the text has `PLAN_WHEN` words or
  «امروز/امشب/آخرِ هفته»; else `"next-session"`. An ambiguous weekday ⇒ `"next-session"` + `q.whenAsk` (set to a date by her answer).
  The +7 fallback of `planDate` is no longer reachable from `plan18` (`planOf` still uses it: there the text says «هر هفته/هفتهٔ بعد»).
- **Chat guesses.** `PR.guessOwnTest` adds: (1b) same message, examples with «✓» after the guess; (5) a value guess derived from her own test in the
  same message; (6) a later sentence negating the guess's own predicate (≥ 2 shared words); (7) a fraction guess and her own test with another
  fraction; (8) «حدسم درسته / غلط بود» for the latest guess before that message; (9) a one-number guess and her own action with a result.
  `g.ground = {from, key}` = her reason in the guess message when there is no test; `g.res` stays empty and 📜 says
  «هنوز آزموده نشده — دلیلِ خودت در همان پیام: «…»». It still never touches `res`, `withdrawn`, `resRecheck` of a resolved guess.
- **Correction why (correction / story touching a27, a38).** In `retractApply` the changes of SESSION records (deadline, measure, card —
  the `liveRetractSessApply` branch and the coach deadline line) carry the turn's why («به گفتهٔ خودش: «…»»; ✏️ ⇒ «با ✏️ ِ خودش روی همان پیام»)
  instead of an empty why or the mechanical «اصلاح شد ⇐ «old»». Live-problem changes (`liveRes20`) are untouched: their «اصلاح شد ⇐» line is
  asserted by the round-19b test. The deadline `fixHist.why` in a38 `retractSess` follows the same rule.
- **Stuck (classify).** `coachEv(s, ph, "chat", text, false)` returns without booking when `AS.pureCmd25(text)` (a bare yes / «ثبتش کن» /
  «ادامه بده», ≤ 6 words).
- **Route (loop).** Chat points (`cres, clb, cdata, cunk, ccond, cwhole, cstep, ctried`) carry `short` = «kind: first line»; a second event of the
  same kind with the same first line (and a second `guess` with the same text) is skipped in `A.ROUTE.model`. `sys*` points are untouched —
  duplicate waiting rows stay with loop.
- **Privacy (age / classify).** `A.dossierSess` is now wrapped by `G.privDossier` as `A.dossier` was. `G.privText` also masks «اسم(ِ) مدرسه‌مون [هم] X»,
  «مدرسه‌مون اسمش X» and drops a class label after the grade («کلاسِ دوم ج» ⇒ «کلاسِ دوم»; «و» is never a label). Adults are not touched.
- **Mind card.** A row with judged predictions shows «k از n پیش‌بینیِ داوری‌شده درست درآمد» in the measure cell (`R.calN`, `R.calK`).

## Tests — `apps/learning-architecture/tests/test_tour1_r25_today.js`
- Runner sentences: 19 checks (18 red on base eeb11d1f; «نه» to the page's date question green on both).
- Bank `tests/variants/VARIANTS_R25.json`, P7 #216–#241: 26/26 (+ #228b); 21 red on base, the negatives #231, #233–#237 green on both.
- All dates in expectations are computed from the frozen page clock.

## Not done / notes
- #224 second half and U40 («her message is not repeated three times in the dossier») — not touched.
- s24 (C22-11): she gave a reason, not a test; the page shows the reason and keeps «هنوز آزموده نشده».
- A dated commitment for which the model already booked a plan / deadline is booked without her yes (only unrecorded ones are asked).
- «آخرِ ماه» is not read by `A.willWhen`.
- A22-11 (s05 p6) is a coach turn-question item, not in these files.
