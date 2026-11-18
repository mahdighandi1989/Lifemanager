# Handoff — tour 1 round 30, fixer «dates» (2026-11-18)

Contracts the other round-30 fixers must respect (functions changed, by file).

## a41_practice.js (dates owns the date-ask functions; forecast owns `PR.bookPred` and the 🎯 functions — untouched)
- `herDays27`: `R.bareD` / `R.bareS` drop every day negated in the same message (C181). `R.negC` drops clauses that only describe the negated day without a first-person verb or a request («… شنبه مسجد مراسم داره»); a request clause («… جمعهٔ بعد بذار») stays.
- `PR.dateAnswer`: a multi-day «آره، فردا و پس‌فردا» answers only the open ask of that turn (C181; the round-29 `!first … yesDates.length > 1` branch is gone). The alternative day of «X نه، Y» / C72 must be this act's day (`PR.otherAct30`). `mineFor(it, P0)` also reads her restated day against the ask's source sentence (`srcAct30`).
- `bookItem26`: a reminder links to the only same-day plan only when it is the same act (`ovD27 ≥ 1 && sameAct28`).
- C182: `pastActs30(t, td)` (sentences with a past calendar day and a first-person past verb), `notThis30` in `cands29`, `past30` in `PR.dlDoneFromHer`: a past act never closes a plan/reminder dated after that day. `pastLog30` writes one EVLOG event `k: "pastact"`, `title: "کارِ گذشته — <day>"`, id `past30_<at>_<i>` on the session, plus one page line «📜 کارِ گذشته — …». Story/surface: render it as a normal session event; do not add a second line for the same message.
- `PR.herDates`: (1) two comma-separated bare day clauses that disagree («سه‌شنبه‌ی هفته‌ی بعد، ۱۲ آذر») ⇒ ONE amb item with `opts` and `dis30: true`; `itemLine26` and the datePend ask render it as «… — روزِ هفته و تاریخ با هم نمی‌خوانند: X یا Y — کدام یکی؟». (2) a one-clause verbless «فردا بانک.» is asked. (3) «X رو … و Y رو هم ⟨فعل⟩» is two acts (shared day when Y has none). (4) `clauseOk26` returns `{ev30: true}` for «<thing> <weekday>‌ست» with no first-person verb or commitment noun — such items never open a new ask (they still answer an open ask through `mine`).
- `PR.datePend` own-items gate: a second ambiguous idiom ask in the same message is kept when it is another act (was: any second amb dropped).
- `recheckOf`: a vague time word (`whenInfo` free/amb) never gets a recheck day.
- Practice: `caseOfAction` falls back to the unique open case of any session; `PR.promptBlock` lists other open cases (due or not) under the «other sessions» line; each case line carries `ladder30(c)` (the case's own steps + checkin interval — C187); `practice_log` stores her own rhythm sentence of the same message (`PR.rhythm`). New exports: `PR.pastActs30`, `PR.otherAct30`, `PR.pastHabit30`, `PR.ladder30`.

## a27_tour.js
- `dueList` / `planTap`: a dated 📌 whose chat «انجام شد؟» expired (`state: "expired"`) stays in «امروز» with the same three buttons (`AS.dueExp30`). «expired» means only «the chat stops asking».
- `plan18`: no plan from a past-habit text (`A.PR.pastHabit30`).
- Retract parse (the function that returns `{src, srcId, n, frag, what, key, fix, old, …}`): the model's `fix` is trimmed to the changed core when it repeats the words before `old` in her message or adds a copula after a date («تا ۲۰ آذره» for old «۱۵ آذر» in «باید تا ۱۵ آذر …» ⇒ «۲۰ آذر») — correction fixer: this is the only change in your path; it touches no proposal logic.

## Tests
`apps/learning-architecture/tests/test_tour1_r30_dates.js` (seven weekdays, frozen clock), fixtures `tests/fixtures/r30_dates/` (round-30 A s01/s09/aA4, B dB3/dB1/s12/tB1, C aC3/aC1, D s35/tD4/aD2/s37/s32 + the corpus scenarios), corpus `tests/variants/CORPUS_R30_F6.json`. `test_tour1_r29_dates_bank.js` #143 changed per C181 (comment in place).
