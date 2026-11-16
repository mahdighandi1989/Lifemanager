# Fixer «dates», round 28 — hand-back (branch worktree-agent-a6c44ed9e5b7ddbcf, head d392faaa)

Base BASE28 4001c4cf. Branch numbers 148/145 (renumbered to 153/150 at merge). F5 and F6 proven (a+b+c); C117 unit-only.
Suite: 166/166 on the final build (second full run); pytest 14 passed.

## Root causes (a41 unless noted)
- **F5 (all four groups):** `PR.whenInfo` / `idiom27` mark the idiom `free`, but every path that put an ambiguous day on a model-reported
  plan (`PR.planWhen26` from a27 `plan18`, `rebook27`, the ✏️ re-read in `PR.datePend`) kept only `wd`/`opts` and defaulted the weekday
  to «جمعه»; `datePend` then built the ask without `free` ⇒ the «امروز خودش {wd} است» template (~3298). `askO28` carries
  `free`/`fq`/`opts`; `free28` allows «امروز خودش X» only when today is X. An explicit day in the same sentence wins; ordinal day words
  read; «ماهِ دیگه» is a free row.
- **F6 binding:** `PR.dateAnswer`, `negBooked27`, `negBookedDl27` linked acts by one shared token; `negBound28` (the negation's own
  sentence) and `sameAct28` (present-tense verb stems). A free row is answered only by a day for that act or a day-only reply. «X درسته»
  (`R.ok`) books the asked day; a past option is never booked. C73 link needs reminder wording (`REM28`, incl. «خبرم کن»).
- **F6 ✏️:** a27 `retractApply` built the day from the edit day; `rebook27` reads it from the day said; `pastDay28` asks «این روز (…)
  گذشته — کدام روز؟» and keeps the booking until answered; ✏️ text is never a done report.
- **Done reports:** `didIt27` took any past verb («بود») — quarantined as `PR.R28_QUARANTINE.didIt27`; `did28`/`didIt28` and hook
  `PR.doneFromHer28` close only on the act's own verb + object (also booked 📌/⏰); bare «زنگ زدم» with two call plans asks «کدام؟».
- **D28-7:** a27 `planDone18` — a plan is never closed in the turn it was born. Smaller: D28-16/C113, A28-34 (quoted day), bank #30
  forecast sentence in `herDates`, `THIRD26` «نوه‌م», a27 `NOTPOSS26` «نیست|بیست».

## Tests
`test_tour1_r28_dates.js` 34/34 (24 red on BASE28), `test_tour1_r28_dates_bank.js` 47/48 (12 red; #30 printed KNOWN — ruled by C132),
`test_tour1_r28_dates_replay.js` + `tests/fixtures/r28_dates/` 19/19 (all red on BASE28; B_dB1, C_aC3, D_tD2, A_s01, D_arD2, B_pwB2,
D_aD2, A_aA3, A_oA1, D_tD1). Three suite clashes fixed (r20_coach #68, r27_dates_bank #111, r26_classify register guard).

## Not done
«حدودِ ۱۵ دی» (ruled by C133: book with her words); «وسطِ ماه کارگر میاد» (someone else's act, C19); acts with no present verb use the
old overlap rule (minus «بود»); forecast-owned D28-3, D28-24. Handoff note `_pending_tour1_R28_dates_2026-11-16.md`.
