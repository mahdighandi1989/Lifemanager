# Tour 1 (Pólya), round 26: «today» handoff (Q5 dates and «امروز» + Q8 forecast ledger 🎯, 2026-11-12)

Scope (DECISIONS_R26 Q5, Q8; clarifications C12 «on both paths», C19, and C1 of round 25): the date reader, which sentence gets a date
question, every date reaching «امروز» only through the page's «… درست است؟» and her yes (her words, the model's `plan.when`, the model's
`deadline` action, a 🎯 due date), «باشه», a pending question that is never dropped silently, one prediction one 🎯, outcomes reported in
chat, verdict take-back with history, a lesson is not a guess, a verbatim guess is not refused.
Base: BASE26 = 23e351f6. Docs: WORKLOG (134), PROGRESS 131, HANDBOOK §10 row and §12 row 78. The numbers assume the siblings are merged
first (the handbook gate reports the numbering gap on this branch alone).

## Functions changed (per file)
- `a41_practice.js`
  - Dates: `PR.whenInfo` (rewritten), `PR.herDates` (rewritten; helper `clauseOk26`), `PR.datePend` (rewritten: now only the «new dates of
    this turn» half), `dlBook25`, `covered25`, the date prompt hook; **new** `PR.planWhen26`, `PR.dateAnswer`, `PR.dateResolve`,
    `PR.datePends`, `PR.planDlSync`, a wrapper around `AS.DO.deadline`, one `AS.promptFilters` entry (follow-up blocks), one more prompt
    hook («# تاریخ در همین پیام»), the a41 after-turn hook (+ `planDlSync`), and the LAST `A.dueList` layer (📅 question rows; the 📌 row of
    a plan whose day is being asked is hidden).
  - Forecasts: `t24Judge` (stated confidence filter; revision of a judged 🎯 keeps history), `PR.predVerdictIn` (more forms),
    `PR.predFor` (confidence filter), `predDue`, `PR.bookPred` (confidence = the percent beside «مطمئنم/احتمال/اطمینان»; her-sentence date
    is asked first), `PR.predExplicit` (rewritten), `PR.predVerdict` (rewritten); **new** `PR.predRefIn`, `PR.reverdict26`,
    `AS.DO.fcast_verdict` and its prompt hook («# 🎯 داوری‌های این گفت‌وگو»).
- `a27_tour.js`: `plan18` (date source only — the lines that compute `when`; + field `whenPend`), `opinionGuess` (one guard: «وقتی/هر وقت
  فکر می‌کنم …» is not a guess), the MT1 after-state block (one guard before `C.ask20 = {k:"guess"}`), `CORR19b` (three more shapes; the
  correction block itself is untouched).
- `a40_dossier.js`: the chat-prediction event inside `A.dossierSess` (`hist`, and «پیش‌تر: …» in `out`).
- `a29_mind.js`, `a33_dates.js`, `a36_solve.js`: **not touched** (the cross-word weekday bug of `A.willWhen` is bypassed inside `PR.whenInfo`).
- `AS.SYS`: nothing added. New model-facing text lives in page-built user-prompt blocks only.

## Contracts for the other fixers
- **One gate for every date.** No writer puts a future date into a record that «امروز» shows unless her yes was read by `PR.dateAnswer`
  (or by a 📅 button in «امروز»). Exceptions, by design: the day is today itself («امروز/امشب»); a correction of an already booked record
  (`retractApply`, correction family — unchanged); page forms outside the chat (`AS.DO.deadline` with no `AS._turnSession` is the old path).
- **`PR.whenInfo(text, from)`** ⇒ `{date, src, wd?, amb?}` or null. `src`: `jalali | date | rel | weekday | weekday-next | nextweek | monthend`.
  Weekdays are word-bounded («جلسه شنبه» is Saturday). «X ِ بعد» = the first X after today (no `amb`, also on that weekday);
  «X ِ هفتهٔ بعد» / «هفتهٔ بعد، X» = X in the Sat–Fri week after today's; «آخرِ هفتهٔ بعد» = that week's Friday; «آخرِ ماه» / «آخرِ آبان» =
  last day of the Jalali month; «از امشب تا جمعه» = the end of the range; «۲۰ آبانه» is read. A duration is not a date («۸ ماهه»,
  «دو هفته تمرین می‌کنم», «یه روز دیگه») unless «N … دیگه/بعد», «تا/ظرفِ N …» or «N … وقت دارم». The name of the Today view in guillemets
  («امروز») is not a date word. `PR.parseWhen` is unchanged.
- **`PR.herDates(text, session?)`** ⇒ `[{what, date, amb, wd, first}]` with `.neg = [dates she negated]`. A clause is asked only if the
  date's own clause is her future action or event (C19): first-person present/subjunctive verb, a commitment noun (مهلت، امتحان، جلسه،
  قرار، …) or «X ⟨date⟩ه». Not asked: past tense, reported speech («گفت/گفته/میگه»), a third party with no first-person verb, a negated
  day, a weekday that is in the problem statement, elapsed time, a birth sentence, a question, a condition, a habit, a prediction sentence.
- **Pending questions.** `s.datePend = {at, msg, d0, state: open|waiting|booked|dropped, seen, answeredAt, told, items:[…]}`; older
  unanswered ones move to `s.dateWait[]` (state `waiting`). Item: `{what, date, amb?, wd?, plan?: planId, dl?: {what, time}, pred?: msgAt,
  pk?: predKey, src?: "her"}`. `PR.datePends(s)` lists the open ones. `s.dateNo[]` = days she declined or negated (never offered back
  unless she says them in a first-person commitment). Transient: `s._dq26`, `s._re26`, `s._dpAt26`.
  - The next message answers an `open` question: a plain yes («آره/بله/درسته/باشه/چشم/…» with nothing else in its first sentence),
    «نه», the same day repeated, «همین امروز / جمعهٔ بعد» for an ambiguous day, or another day («باشه ولی شنبه نه، یکشنبه» ⇒ Saturday is
    dropped and Sunday is asked for the same item). Anything else ⇒ `waiting` + one line; it stays answerable by «تاریخ(ش) درسته»,
    «تاریخ نه», the day itself, or the buttons of its 📅 row in «امروز» (`PR.dateResolve(sessionId, pendIndex, itemIndex, "yes"|"no"|date)`).
  - «باشه» IS a yes to the page's open question (round-25 rule replaced by DECISIONS_R26 Q5).
- **Plans (`plan18`).** `q.when` is a date only for today or after her yes; otherwise `"next-session"` with `q.whenPend = {date, src:"her"}`
  (or `q.whenAsk` for an ambiguous weekday). `q.dateAsk = true` once the page asked; `q.dateBy = "her-yes"` once she confirmed. The page's
  reading of her own plan text wins over the model's `when`; when the plan text carries several days the model's `when` picks one of
  them; a model date that is not in her words is ignored (no ask, `"next-session"`). Code that needs «the plan's day» must read `q.when`
  and treat `"next-session"` as «no day yet» — never `q.whenPend`.
- **`deadline` action inside a chat turn.** Returns `""` and asks when the date is in her own words (this or her two previous messages);
  returns a refusal string («یادآور ثبت نشد: تاریخِ … در حرفِ خودش نیست …») when it is not; books at once only (a) for a day of a plan she
  confirmed, (b) for the same deadline re-sent, (c) on her «باشه/آره» to the assistant's own offer that carried that day — each with a
  visible «✓ ثبت شد …» line. A deadline for a plan whose day the page is asking joins that question (`item.dl`) and is booked with the
  plan on her yes, linked by `deadline.plan = {sess, id}`; `PR.planDlSync` closes a linked (or «پیگیری…»-named, same day) deadline when
  the plan is reported done. Deadlines booked by her yes carry `by: "her-yes"|"her-words"`, `src`, `quote`, `src20` (the commitment's
  own message, not the «آره» message).
- **Follow-up prompt blocks.** «# پیگیریِ برنامهٔ خودش» is dropped for a plan with `dateAsk` (the page's question is the offer); the
  backup variant («پشتیبان، شاید») no longer tells the model to offer a follow-up or to send `deadline`.
- **Predictions.** `coach.preds[]` gains `duePend` (a day read from her own sentence, waiting for her yes — no 🎯 record yet) and
  `outHist[]`. Confidence is the percent beside «مطمئنم / احتمال میدم / اطمینان / به احتمالِ …», digits or words — never the first
  percent of the claim. A sentence with stated confidence is a prediction even without the word «پیش‌بینی» and without a date; a message
  that is only a confidence belongs to the prediction of her previous message. `PR.predVerdictIn(text)` ⇒ `{ok, sent, weak?}` now also
  reads «غلط درومده», «درست همان که پیش‌بینی کرده بودم», «برخلافِ پیش‌بینیم», and (weak) «…، همون‌طور که گفته بودم»; `PR.predRefIn(text)`
  ⇒ `{sent}` for a reference with no verdict («از پیش‌بینیم خیلی بیشتر»). `PR.predVerdict`: a stated confidence names the forecast and
  never lands on an open forecast with another confidence; if it belongs to a judged forecast the verdict changes with history; several
  open forecasts and no sign ⇒ one «🎯 کدام پیش‌بینی؟» line (`s.predAsk = {kind:"which"|"res", msg, pred?, out?, sent, state}`), a
  reference ⇒ one «شد یا نشد؟» line; «اشتباه گفتم، در واقع شد» right after a verdict reverses it.
  `PR.reverdict26(fc, out, quote, session, kind)` is the only place that changes a booked verdict: `fc.verdictHist[] = {was, wasAt, at,
  why, sess}`; `out = ""` reopens. Model action `{"do":"fcast_verdict","id","res":"open|شد|نشد","quote"}` (quote must be in her current
  message) is advertised by a page-built block only when her message speaks of a wrong verdict.
- **Story (Q3).** Predictions are still per session, not per problem. With two problems in one chat a verdict finds its forecast by the
  stated confidence or shared words, or the page asks; binding a forecast to a problem record is not done here.
- **Correction (Q2).** A corrected datum does not yet mark a 🎯 verdict or its practice session stale (B26·D31); `PR.reverdict26` is the
  entry point to use. `retractApply` still writes a corrected plan day straight into `q.when` (her own correction).
- **Classify (Q9).** New page lines are written in «تو» with words the register converter (`AS.toShoma`) already knows; the 📅 rows of
  «امروز» use no second-person form.

## Tests — `apps/learning-architecture/tests/test_tour1_r26_today.js`
- Runner sentences: 47 checks (42 red on BASE26; green on both: the reader half of A26-6, three look-alike negatives, and A26-46).
- Bank `tests/variants/VARIANTS_R26.json`: Q5 #130–#162 (33) and Q8 #203–#221 (19): 52/52.
- Old assertions changed (each with a «دورِ ۲۶ (DECISIONS_R26 Q5 …)» comment): see the WORKLOG entry (134).
- All dates in expectations are computed from the frozen page clock; model input dates are relative («+N»).

## Not reproduced
- **A26-46** (oA1 p16→p23: the 70 % 🎯 stays open after «پس پیش‌بینیم غلط بود»): with the runner's own messages, day and actions the 🎯
  is judged «نشد» and leaves «امروز» on BASE26 as well. Kept as a regression check. The runner's own note says the id it sent may not
  have been read.

## Not done / notes
- Bank entries are satisfied with one added turn where the decisions require her yes (#205, #206–#208, #211, #212: «آره» after the
  page's date question); no entry was edited or skipped.
- A 🎯 whose forecast is corrected through a datum correction (B26·D31) and the practice-session text «(درست)» — correction family.
- A forecast is not bound to a problem record (Q3).
- «آخرِ سال», «عید», «سرِ برج» are not read; nothing is asked for them.
- A confirmed date that later passes unanswered stays as a 📅 row saying it passed; it books nothing.
- The new prompt blocks («# تاریخ در همین پیام», «# 🎯 داوری‌های این گفت‌وگو») and `fcast_verdict` were not run against a real model.
- U40 / R25 #224 second half (a child's message three times in the dossier) — still not touched.

## Resume after the pause (2026-11-15): DECISIONS_R26 C32–C37
The WIP snapshot (f56da378) held only docs; it was reviewed and kept. C23–C39 were re-read; C32, C33, C34, C35, C37 touch this family:
- **C32** «جمعهٔ بعد» on another weekday ⇒ `PR.whenInfo` returns `{date: first, amb: true, wd, opts: [first, first+7], src: "weekday-next"}`
  and the page asks «کدام روز: جمعه … یا جمعه …؟». On that weekday itself it stays +7 and is not ambiguous (bank #131/#132 unchanged).
- **C33** «آخرِ هفته / آخرِ همین هفته» ⇒ `{amb, opts: [Thursday, Friday] of this week, src: "weekend"}` (only Friday left on a Friday ⇒ not
  ambiguous); «آخرِ هفتهٔ بعد» ⇒ `opts` = Thursday/Friday of the next Sat–Fri week (`src: "nextweek"`). «آخرِ هفته‌ها» is a habit, no ask.
  `date` stays Friday for compatibility; an `amb` item is never booked without her pick.
- **C34** an ordinal day without a month («تا بیستم باید تحویل بدهم», «مهلتِ … بیستمه») is read only right after «تا/مهلت/موعد/سررسید/تحویل/
  تاریخ/ددلاین/قبل از/پیش از» (or before «همین/این ماه») as the next such day of the Jalali calendar (`src: "monthday"`) and then goes
  through C19 (a third party's deadline gets no ask) and C12. «جلسه دوم» is not a day.
- **C35** already held (a condition clause is never asked); now covered by a test with its positive look-alike.
- **C37** «پنجاه‌پنجاه» / «فیفتی‌فیفتی» = 50 %. A new prediction with a vague word («احتمالاً», «فکر کنم», …) and no number gets ONE line
  «… چند درصد مطمئنی؟» (`pred.pAsk = true`); a short «۷۰ درصد» in the next message sets that prediction's confidence (and its 🎯's).
  «آخرِ ماه» = last day of the current Jalali month through «… درست است؟» (already so).

**Generalised ambiguous item (contract for everyone who reads `datePend`).** An `amb` item may carry `opts: [dateA, dateB]`; without it
the two options are still «the same day / the same weekday next week» (C1). Helpers in a41: `ambO26(item, d0)` (the two dates),
`ambLab26`, `ambPick26` (her answer ⇒ 0/1/−1: a date she says, a weekday name when the two differ, «اولی/دومی», else «همین/بعد»),
`ambHint26`. Carriers: `herDates` items, `predDue().amb.opts` ⇒ `pred.dueAmb.opts`, `planWhen26().ambO` ⇒ `q.whenAskO = {date, opts}`
(a27 `plan18`, one field added). The 📅 row of «امروز» shows one button per option.

Functions changed in this resume: a41 `PR.whenInfo` (C32/C33/C34 branches), new `ordDay26`, `jParts26`, `monthDay26`, `dateSpan26`
(ordinal span), `PR.herDates` (opts), `predDue`, `PR.planWhen26`, `itemLine26` + new `ambO26/ambLab26/ambPick26/ambHint26`,
`PR.dateAnswer` (amb branch, hint), `PR.datePend` (plan/pred amb items, ask line), the date prompt hook (`say`), the 📅 row buttons,
`wpct` (C37 words), `PR.bookPred` (number ask), `PR.predExplicit` (short percent answer). a27: `plan18` (field `whenAskO`).

Bank entries that the clarifications changed (the entry is not edited; the check follows the clarification, with a comment):
- **#134** «آخرِ هفتهٔ بعد میرم شهرستان سراغش» + «آره»: by C33 the page asks Thursday or Friday, so a plain «آره» books nothing (one
  line says which to write); «جمعه» then books D0+12 — inside the entry's D0+11…D0+12 range.
- **#203** «هفتاد درصد مطمئنم تا آخرِ همین هفته …» + «آره»: same reason; answered «جمعه», the 🎯 is 70 % due Friday as the entry asks.
Tests: `test_tour1_r26_today.js` section `clar` (16 checks, every positive with its look-alike); 63/63 runner checks, bank 52/52.

Found while running the whole suite after the resume:
- `PR.whenInfo` read «سه‌شنبه‌ی پیش/قبل/گذشته» as the coming Tuesday, so a past-dated model plan («… دوباره می‌رم», R18 RM5 bank #13)
  got a date question. A weekday followed by «پیش/قبل/گذشته» is now dropped as a past day (compounds such as «پیش‌نویس», «پیش‌بینی» are
  not «پیش»). This was already red before the resume (the WIP snapshot had not run the suite).
- `tests/test_polya_fix5.js` M3 hard-coded «۲۵ آبان», which on 2026-11-15 equals the page's next-day review date; the page was right.
  The test now uses today + 10 days written as «D month» (no hard-coded calendar date, FIX26).
- Old assertions changed by C33, with a comment: `test_tour1_r17_coach` (rc1plan «آخر هفته …» answered «جمعه»; the ask may be «کدام روز»),
  `test_tour1_r18_coach` (RM5 #8 and 7b answered «جمعه»).
