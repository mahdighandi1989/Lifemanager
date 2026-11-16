# Fixer «forecast», round 28 — hand-back (branch worktree-agent-a1e94079899aac9ee, head baeebc37)

Base BASE28 4001c4cf. Branch numbers 148/145 (renumbered to 150/147 at merge). C90, C91, A28-35 proven (a+b+c); C118–C122 (a+b), C120 also (c).
Suite 162/162 one at a time on the final build; pytest 14 passed.

## Root causes (a41 unless noted)
1. Confidence read only in fixed shapes (`CONFX26`, cut at «،»): new `read28`/`apply28`/`CONF28`/`clean28` first in `PR.predExplicit` —
   one 🎯 per clause with her own confidence; text = the outcome only; past or someone else's confidence makes none; «(تقریباً) مطمئنم»
   asks the number once; a bare «N درصد.» / «۶۰» answers it.
2. A new number made a second 🎯 (`claimN27` needed identical text): `same28`; `PR.bookPred` 6th argument `o28` updates with history
   (C77); multi-forecast clauses take their due date from their own words (`predDue(…, own28)`, A28-23).
3. Settling picked one best match per message on generic words: `outcome28`/`score28`/`verdict28`/`val28`/`cmp28`/`approx28`/
   `ansRes28`/`ansWhich28` in `PR.predVerdict` (`outcome27` kept and exported). Per clause; corrections, «پارسال», «هنوز … نگرفتم» never
   settle or ask; numbers compared with numbers; «حدودِ N» per C120; «کدام؟» lists only candidates; a new plan is never an answer.
   `PV_NO`/`PV_OK` look 8 words ahead; «شد» before a number is not a verdict.
4. A28-35: `a31` `A.V.fcast` has «باز» and «داوری‌شده» lists; settled rows keep the select under «تغییرِ داوری:»; internal label removed.

## Tests
`test_tour1_r28_forecast.js` (2/12 ⇒ 12/12), `test_tour1_r28_forecast_bank.js` (#136–#177: 10/42 ⇒ 42/42),
`test_tour1_r28_forecast_replay.js` + `tests/fixtures/r28_forecast/` (A_oA1, D_oD1, B_nB1, C_pwC2, D_tD2: 0/5 ⇒ 5/5).
Bank #153 judged by C120 (asks instead of «نشد»); #138 only the 🎯 half. Old assertion: `test_tour1_r26_today.js` D26-14 accepts C120's
question (commented).

## Not done
C28-19 / C121 (no-problem forecasts in a multi-problem chat still file under the focused problem); C28-22 (a38 card); B28·D14 and
D28-16 (dates); bp2 B28·D15 not reproduced; «↪» on 🎯 is story's. Handoff note `_pending_tour1_R28_forecast_2026-11-16.md`.
Surface replay note: on the forecast merge, `test_tour1_r28_surface_replay.js` failed twice on different cases (tB1, then tA1) under machine load and passed on rerun, on the merge and on surface's own branch — timing-sensitive, not a merge clash.
Merge note: a31 conflicted with surface (both removed the internal label); forecast's version kept.
