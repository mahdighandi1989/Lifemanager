# Tour 1 (Pólya), round 28: «dates» handoff (R3 date-ask engine, 2026-11-16)

Scope: DECISIONS_R28 R3 — C92, C93, C94; clarifications C113, C114, C115, C116, C117, C127, C131; families F5 and F6.
Base: BASE28 = 4001c4cf. Docs: WORKLOG (148), PROGRESS 145, HANDBOOK §10 row (2026-11-16 «پرسشِ تاریخ برای هر کار جدا…») and §12 row 93.
The reserved numbers were WORKLOG 151 / PROGRESS 148; the gate rejects gaps, so the first free numbers were used — renumber at merge.

## Functions changed (only date-ask functions; nothing in AS.SYS)
- `a41_practice.js`
  - **new:** `askO28`, `free28` (`PR.askO28`, `PR.free28`); `pastDay28` (`PR.pastDay28`); `verbs28`, `STEM28`, `LIGHT28` (`PR.verbs28`); `pres28`, `sameAct28`
    (`PR.sameAct28`); `negBound28` (`PR.negBound28`); `did28` (`PR.did28`), `didIt28` (`PR.didIt28`); `PR.doneFromHer28` (after-turn hook, next to
    `PR.dlDoneFromHer`); regex `REM28`.
  - **edited:** `PR.whenInfo` (explicit day beats a free idiom; ordinal day words before a month name), `idiom27` («ماهِ دیگه/بعد/آینده» ⇒ free row),
    `PR.planWhen26` (`ambO` carries `free/fq`), `rebook27` (✏️: day-said base, past day ⇒ free «این روز گذشته — کدام روز؟» item with `past`, `keep`, `old`
    or `plan`; the record is NOT closed; `x.pastAsk28` stops the second path from asking again), `herDays27` (`R.negC`, `R.ok`; «ثبتش کن» with a named object
    is not a yes), `PR.dateAnswer` (`R.ok` books any pending ask with that day; free rows only from a day for the same act; `negBound28` on negation; an
    ambiguous option in the past is never booked; `altFor(it, true)` today-named weekday ⇒ next week; `sameAct28` on the short-pos / alt / `mineFor`
    branches; `s0._ans28`), `lapse27` (`didIt28`; never on a ✏️ turn), `negBooked27` / `negBookedDl27` (`negBound28`), `bookItem26` (C73 link only
    with `REM28`; `it.old` closes the old booking as «replaced»; `it.past` writes `whenHist`), `PR.datePend` (`free28` before rendering; plan rows carry
    `free/fq`; same-day asks dropped only for the same act; past item on a ✏️ of a pending ask; the plan the model reported from her answer to a free row
    is not a second plan), `PR.herDates` (a percent sentence with احتمال/مطمئن/اطمینان/شانس is a forecast; a quoted day after a quoting verb is not read),
    `THIRD26` («نوه‌م»).
  - **quarantined:** `didIt27` ⇒ `PR.R28_QUARANTINE.didIt27` (REMOVAL_CANDIDATES 2026-11-16).
- `a27_tour.js`: `planDone18` — a plan born in this same turn is not closed by `plan_done`; `retractApply` — `rb27.past` / `rbD.past` lines
  («آن روز گذشته است؛ ثبتِ … می‌ماند تا روزِ تازه را بگویی»). Nothing else.

## Contracts for the other fixers
- **Pending item shape** may carry `past: <ISO>` (the past day she edited to), `keep: true` (the booking stays until she answers), `old: <deadline id>`
  (closed as «replaced» only when she gives the new day). `rebook27` may now return `{ it, past: true }` without `moved` — callers must not say the old
  booking was removed (a27 does this; a38 `retractSess` still says «روزِ تازه پرسیده شد», which is true).
- **Plan `whenAskO`** may carry `free` and `fq`; anyone building an ask from `q.whenAsk` must read them (never default the weekday to «جمعه»).
- **«Same act»** for date answers is `ovD27 ≥ 1` AND `sameAct28` (present verb stems; light verbs only alongside a verbless act). Do not bind a date answer
  to an act by one shared word.
- **Done reports:** `PR.did28(text, actText)` ⇒ 0/1/2. Plans and her own deadlines (within a week) close from her sentence after the turn
  (`PR.doneFromHer28`, `doneBy.kind = "her-words"`); a bare verb with two open acts asks «کدام؟». forecast: a 🎯 is never closed by this.
- **forecast (R4):** bank R28 R3 #30 is reported, not fixed: a forecast with a weekday still gets a «… درست است؟» from `PR.bookPred` (`duePend`) — C12 /
  bank R26 #203 asks for it, bank R28 #30 forbids it; the ruling and the change belong to `PR.bookPred`.
- **story (R5):** `PR.doneFromHer28` sets `q.state = "done"` on plans from her words; 📜 should show it as «سرانجام: انجام شد» with her quote
  (`q.doneBy.quote`).

## Proof (C101)
- (a) `tests/test_tour1_r28_dates.js` — 34 entries from the runners' own sentences (A, B, C, D), each positive with its negative; 24 red on BASE28; 34/34.
- (b) `tests/test_tour1_r28_dates_bank.js` — VARIANTS_R28 R3, 48 entries: 47 green (12 red on BASE28), #30 reported (above).
- (c) `tests/test_tour1_r28_dates_replay.js` — replays of B_dB1, C_aC3, D_tD2, A_s01, D_arD2, B_pwB2, D_aD2, A_aA3, A_oA1, D_tD1 through
  `tour1_r26_replay.js` with each group's own ctl steps, clock shim and recorded model replies (fixtures `tests/fixtures/r28_dates/`); 19 checks on the
  page's lines, the «امروز» DOM and the 📜 DOM; all red on BASE28, 19/19.
