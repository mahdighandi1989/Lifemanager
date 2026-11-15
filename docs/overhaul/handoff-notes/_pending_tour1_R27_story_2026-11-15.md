# Tour 1 round 27 — fixer «story» (R5 🎯 + R6; C53, C30, C57, C75–C79) — handoff note (2026-11-15)

Numbering on this branch: WORKLOG 138 / PROGRESS 135 / HANDBOOK §12 row 84 (the handbook gate refuses gaps) — renumber to **142 / 139** at merge, as FIX27 assigns.

## Functions changed (keep your edits out of these, or re-run `tests/test_tour1_r27_story*.js`)

| File | Function / block | What it now guarantees |
|---|---|---|
| `a41_practice.js` | new `probOf27`, `fc27`, `fcOf27` (`PR.probOf27`, `PR.fc27`, `PR.predFc`) | one forecast = one 🎯: an undated 🎯 (`pred.fc0`) is created at once when a confidence is stated; a later date lands on the SAME record (`fc27`) |
| `a41_practice.js` | `PR.bookPred` (C77 same-claim update; `x.prob`; `fc0` creation; `dupFcast` branch sets the due on an undated dup) | `pred.fc` still means «dated or judged 🎯»; `pred.fc0` = undated 🎯 |
| `a41_practice.js` | `bookItem26` pred branch (uses `fc27`) | confirming a date never makes a second 🎯 |
| `a41_practice.js` | new `multi27`, `ENUM27`, `past27`, `claimN27`; `PR.predExplicit` (calls `multi27` first; strips «کارِ دیگری» span — C75; past confidence is no forecast) | several confidences ⇒ several 🎯, no counter, no intro |
| `a41_practice.js` | `CONFX26` (two more shapes: «مطمئنم، نود درصد»، «احتمالِ … رو ۲۰ درصد می‌دونم») | shared with `confPct26` — dates/prior: do not shorten it |
| `a41_practice.js` | `PR.predVerdict` (ask-answer ignores «حل/تموم/ثبت شد» of another act; unanswered ask falls through to `outcome27`; after a «کدام؟» answer the same message can settle the other one) | |
| `a41_practice.js` | new `outcome27` (+ `act27`, `FV27`/`fv27`, `cmp27`, `PAST27`, `GPAST27`, `FUT27`, `DONEW27`, `nums27`, `probHit27`); `PR.outcome27` | a clear past report matching exactly one open 🎯 settles it; two ⇒ «کدام؟»; another number than «حدودِ N» ⇒ «شد یا نشد؟» |
| `a41_practice.js` | `predApply26`, `PR.predMark`, `PR.reverdict26`, lp/lp37 branches use `fc0` too | |
| `a45_story.js` | `frames26` (new `subj` frames: head before «:», «X رو/را», a short message «حالا X»), `run26` (subj branch; strong frame with `me > mx` ⇒ stay; `me === mx` ⇒ ask), new `GEN27` | C30: a short name binds the same message; only unique TITLE words, never time/general words |
| `a45_story.js` | new `ST.otherWork27`, `ST.otherOwns27`, `WHO27`, `OTHER27`, `MINE27`; `onState` (`allOther27`, item `other`); `EV_T.other`/`EV_K.other` (`cother`); `logEv` lines for `other` | C57 |
| `a27_tour.js` | `AS.DO.coach_state`: ONE line after the `rTx19` check — a result inside another person's span is removed from `said` | no stage move, no «اجرا +» from someone else's result |
| `a40_dossier.js` | new `predFc27`, `predEv27`; `addSessEvents` (forecasts of the problem in its own 📜); `A.dossierSess` wrapper filter (`own27`) | A27-12 / D27-14 |
| `a31_tools.js` | the 🎯 list line | «بی موعد» instead of an empty date |

## Contracts the other fixers must respect
1. **dates (a41/a40):** a chat forecast can now have `fc0` (undated 🎯) and no `fc`. Every place that asks «has this forecast a 🎯?» must use `PR.predFc(x)`; every place that creates a 🎯 for a pred must use `PR.fc27(s0, x, due)` (it reuses `fc0`). `!y.fc` checks for the date ask (pends26, plan loop) are intentionally unchanged — they mean «not yet dated».
2. **arith (a46):** `ST.otherWork27(ut)` returns `{who, from, to, text}`; checks inside that span are another person's — show ✓/✗, but never her slip (bank #229). Not wired into a46 by story.
3. **classify:** `WHO27` uses relation words only (برادرم، همکارم، معلمِ …), never first names (C22/C38).
4. **correction/prior:** `ST.otherOwns27(ut, quote)` — a ledger step or a correction quoted from the other span is not hers.
5. **AS.SYS untouched** (no prompt text added).

## Not done (with reasons)
Move/undo of a misfiled 📜 line (owner bank 42, C78; bank #234/#235/#250) — a new capability; ✓/✗/؟ beside her line in 📜 (A27-4, #230); practice-plan and facet filing (D27-17, C27-19; #224/#236/#244); 📜 window start (aB2, #223); one event per ✏️ (A27-14, #231); «برنامه» + «طرح» dedup (D26-2, #232); chronology of a backfilled line (#233); restated A (#243); look-back birth (#238); session count incl. practice dossier (#239); vague forecast without the word «پیش‌بینی» (#200, C37); A27-5 (stage after reopening), A27-22 third problem in oA1 (bank #222 green in the story harness, the oA1 replay was not rebuilt); D27-9/D27-10; D27-17. No real-model run.
