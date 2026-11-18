# FIX30 — dates fixer hand-back (round 30)

Branch `worktree-agent-a5e93703fb247d84e` on BASE30 5c7ce364. WORKLOG 164 / PROGRESS 161 (assigned 169/166; the gate rejects a gap, so the first free numbers were taken — coordinator renumbers at merge).

## Root causes (file:function)
- D30-4 regression (S2): a41 `herDays27` put the bare piece «شنبه نه» into `R.bareD` before negation was read, so `PR.dateAnswer` booked the negated Saturday; `R.negC` counted the reason clause «شنبه مسجد مراسم داره» as «another act», so Sunday was not asked (C181).
- A30-3: a41 `PR.dateAnswer` alt-day branch (C72) moved the bank row to the day she gave for ANOTHER act («زنگِ بنگاه همون پنجشنبه‌ست») ⇒ `otherAct30`; her restated day for the bank («فقط بانک شنبه‌ست») is now read against the ask's source sentence (`srcAct30`); a multi-day «آره» never confirms a row carrying a day she negated (`s0.dateNo`). Still-pending older asks answer as in C145 (F6-058, r29 bank #143).
- C182 (A30-6, D30-16, B30·D21): a41 `cands29` and `PR.dlDoneFromHer` closed any open plan with the same verb/object ⇒ `pastActs30`/`notThis30`/`past30`; `pastLog30` writes one EVLOG `pastact` event «کارِ گذشته — <day>» + a page line.
- D30-15 (S2): a27 `plansDueR18` sets `expired` after an unanswered chat «انجام شد؟» and `dueList` dropped it ⇒ `dueExp30` (only 📌 booked by her «آره», `dateBy: her-yes`).
- N6 #1 (A30-4, B30·D20 partly, C30-10, D30-13): a41 `PR.herDates` made two independent rows ⇒ one amb item `dis30` («کدام یکی؟»), also converting the model-reported plan's ask of the same act.
- Two acts per idiom (A30-5, B30·D25, D30-12, F6-102): a41 `PR.datePend` gate `(z.amb && it.amb)` dropped the second ambiguous ask; `herDates` did not split «X رو … و Y رو هم …» / two first-person verbs.
- «فردا بانک.» alone (B30·D19, C30-14, F6-037): verbless rule only for multi-clause lists ⇒ one-clause rule (and colon intro is frame).
- A25-21: a27 retract parse kept the model's `fix` «تا ۲۰ آذره» whole ⇒ trimmed to the changed core (calendar day only).
- A26-30: a27 `plan18` turned a past habit into «📌 قولِ بی‌تاریخ» ⇒ `PR.pastHabit30`.
- D26-1: a41 `clauseOk26` treated «<thing> فقط <weekday>‌ست» as her act ⇒ `ev30` (answers an open ask only). F6-080: third-person verb clause ⇒ not her act.
- D29-24: a41 `recheckOf` used `parseWhen` defaults for «ماهِ دیگه» ⇒ vague time words get no recheck day.
- D26-47 (S2): a41 `caseOfAction` returned null for an unknown/stale `prc` and saw only due/session cases; `PR.promptBlock` listed only due cases of other sessions.
- D26-42: rhythm said in the opening message was not stored (`start_practice` needed the model's `a.rhythm`); `practice_log` likewise.
- D27-29 (C187): `PR.promptBlock` line had no ladder ⇒ `ladder30`.

## Tests
- `tests/test_tour1_r30_dates.js` — seven weekdays, frozen clock, look-alike per case; red-first on BASE30 (C181 4/9, C182 3/7 on base); final green (41 cases).
- `tests/test_tour1_r30_dates_replay.js` — page-level replay of the runners' own runs (A s01/s09, B dB3, C aC3, D s35/tD4/aD2/s32, D tD2 + the regression scenarios aC1, s12, tB1): BASE30 4/24, final 24/24.
- Old assertions changed per DECISIONS_R30 (comments in place): r18 coach #8, r19 coach #15 (D30-15).

## Not done / back to the coordinator
- F6-053 (dB3 p24 «… افتاد سه‌شنبه‌ی هفته‌ی بعد، ۲۶ آذر»): `clauseOk26` reads «افتاد» as a past report, so only the written date is asked; reading «X افتاد <day>» as a rescheduled future act needs a ruling (past report vs rescheduling).
- F6-040 / F6-046 (🎯 confirm «پنجشنبه درسته» spawning a new 🎯 confirm): forecast's `PR.bookPred` path, not touched.
- Needs ruling (left as in the corpus): F6-031, F6-050, F6-063, F6-119.
- D30-17: not a page defect (lab ask kept after ✏️; replay tD4 step 17; it lapsed on 5 Azar because its day passed — C49/C69).
- The model-deadline `link` in `AS.DO.deadline` still links by same date only (the `bookItem26` link now checks the act).
