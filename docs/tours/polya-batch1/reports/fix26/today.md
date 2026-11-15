**Fixer «today», round 26 (resumed after the pause): finished and committed.** Branch `worktree-agent-a851b9b394bbbe548` in worktree `/home/user/Lifemanager/.claude/worktrees/agent-a851b9b394bbbe548`. Nothing was pushed and main was not touched.

**Gate result:** the whole page suite passed, one test at a time. Both pytest files pass (14/14) once you close up the numbering at merge. The four failures in the first pass were fixed and rerun green on the final build, together with 18 other date tests; the r8_live crash, caused by my running tests and a rebuild alongside the suite, passed on rerun.

**Commits**
- `f56da378`: the earlier WIP snapshot. It held docs only; I reviewed it and kept it unchanged (not amended).
- `4e247522` fix(lla): C32, C33, C34, C37.
- `802fb17c` fix(lla): last-weekday bug, `test_polya_fix5` M3 date, C33 answers in old tests, docs.

**What changed for the clarifications (DECISIONS_R26 C23–C39, re-read)**
- **C32/C33 (`a41_practice.js` `PR.whenInfo`).** An ambiguous day now carries its two candidate dates (`opts: [a, b]`). Before, the only alternative was hard-wired as "today or the same day next week".
  - «جمعهٔ بعد» said on a day other than Friday is asked with both Fridays. On Friday itself it stays +7 and is not asked.
  - «آخرِ هفته / آخرِ همین هفته / آخرِ هفتهٔ بعد» is asked as Thursday or Friday.
  - «آخرِ هفته‌ها» is a habit and gets no question.
  - The question text, the reading of her answer (a date she says, a weekday name, «اولی/دومی», «همین/بعد») and the buttons on the 📅 row in «امروز» all use the same two dates. New helpers: `ambO26`, `ambLab26`, `ambPick26`, `ambHint26`.
  - The two dates travel with the date to every place that later asks about it: `herDates`, `predDue`, `planWhen26`, and in a27 `plan18` one new field, `whenAskO`.
- **C34.** «تا بیستم باید تحویل بدهم» is now read as the next 20th of the Jalali calendar (new `ordDay26`, `jParts26`, `monthDay26`, plus an ordinal span in `dateSpan26`). It is read only right after a deadline word (تا, مهلت, موعد, …) and then goes through the C19 and C12 checks. «مهلتِ برادرم بیستمه» gets no question, and «جلسه دوم» is not read as a day.
- **C35.** This already held; it now has a test with its positive look-alike.
- **C37.**
  - «پنجاه‌پنجاه» / «فیفتی‌فیفتی» now count as 50 % (`wpct`).
  - A new forecast with a vague word and no number gets one line «… چند درصد مطمئنی؟» (`PR.bookPred`).
  - A short «۷۰ درصد» in her next message sets that forecast's confidence (`PR.predExplicit`).
  - «آخرِ ماه» was already correct.
- **Bug found in the full-suite run.** «سه‌شنبه‌ی پیش/قبل/گذشته» was read as the coming Tuesday. That turned a past-dated plan the model reported into a date question (R18 RM5 bank #13). It was already red before the pause. Fixed in `PR.whenInfo`; compounds like «پیش‌نویس» and «پیش‌بینی» are excluded.

**Coordinator item: `test_polya_fix5.js` M3.** The page was correct. The test hard-coded «۲۵ آبان», and today (24 Aban) that equals the page's "tomorrow". The test now builds the date from the clock: today + 10 days, written as «D month». It passes.

**Tests**
- `test_tour1_r26_today.js`: new section `clar` with 16 checks, each positive with its look-alike negative. Total 63/63 runner checks and 52/52 bank entries.
- Before the change, a probe showed C32, C33, C34 and C37 failing.
- Old assertions changed because C33 replaced them, each with a comment in place:
  - Bank **#134** and **#203**: answered «جمعه» instead of «آره», because a plain yes picks neither day. The bank entries themselves were not edited.
  - `test_tour1_r17_coach` (rc1plan «آخر هفته»).
  - `test_tour1_r18_coach` (RM5 #8 and case 7b).

**Docs**
- WORKLOG (134) and PROGRESS row 131 were extended, plus HANDBOOK §12 row 78, an AUDIT_LOG entry, and an update to `experiences/model-reports-state-page-validates.md`.
- The handoff note `docs/overhaul/handoff-notes/_pending_tour1_R26_today_2026-11-12.md` has a new "Resume" section. It covers the `opts` contract on pending date items, every function changed, and the bank changes.
- The handbook gate is red on this branch alone only because of the numbering gap FIX26 prescribes. With 134→130 and 131→127 (including the row's «WORKLOG (n)» link) both pytest files pass 14/14. I checked that and restored the prescribed numbers.

**Not done**
- «آخرِ سال», «عید» and «سرِ برج» are still not read.
- B26·D31 (a corrected datum should make a 🎯 verdict stale) belongs to the correction fixer, through `PR.reverdict26`.
- Linking a forecast to its problem record (Q3) is not done.
- The new prompt blocks and the `fcast_verdict` action have not been run against a real model.
- U40 is untouched.
- A26-46 is still not reproduced; it stays in the test as a guard.
- Token and time usage were not visible to me.
