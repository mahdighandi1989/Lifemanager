# Fixer «surface», round 28 — hand-back (branch worktree-agent-ac134a98a6c967d59, head 34f4b40a)

Base BASE28 4001c4cf. Branch numbers WORKLOG 154 / PROGRESS 151 / HANDBOOK §12 row 93 (renumbered at merge).
C101 status: 7 items proven (a+b+c), 2 unit-only, 1 not a page defect.

## Items
- **C99 / D28-10 — proven.** `a45` `METAQ27` knew one phrasing only; new `AS.sysQ28` (a27) reads the grammar (second-person request to
  notify/remind/record, «where are my records», «why did you write», a named system part, passive «ثبت شد» about the system).
  Imperative «خبرم کن» excluded (C127). `AS.onlySysQ28` ⇒ `AS.notProblem` (no chat problem).
- **C27-6, group C half — not reproduced** (pC2 p13 replay: piece under the closed problem, no new chat problem).
- **D28-19 routing — proven.** a27 `statesProblem` `GOAL22` needed a number; new `PLAN28` (making a plan), and bank #289 yes/no
  «جا میشه / کافیه» with two numbers.
- **D28-29 — proven.** `SIGN_SH` matched «فروردین»; `noCal28` blanks Jalali month names before register reading.
- **C28-6 — proven.** labels in a21/a25 now «جای تو در آن کجاست»; «آمد» added to `PAST_ST`.
- **A28-32 + C129 — proven.** a44 `askFit` showed raw names; `tieLabels28` (distinct words + «اولی/دومی») everywhere the tie shows;
  `dupTie28` for identical candidates (asks to merge; «یکی‌اند»).
- **C100:** A28-31 proven (`AS.run` `{note, quiet:true}`; a33 `deadline_done`); A28-39 proven (`chkVerdFa28` in a38); A28-36
  unit-only (a31 no longer prints the label; oA1 replay did not recreate the undated 🎯).
- **B27·D16 — no change:** harness timing (c17 inside the 2-minute sweep throttle after a page swap); with time passing the page asks.

## Tests
`tests/test_tour1_r28_surface.js` (16 errors on BASE28, green now); `tests/test_tour1_r28_surface_replay.js` with
`tests/tour1_r28_replay.js` and `tests/fixtures/r28_surface/` (red on BASE28: oD1, tD2, s27, tA1, aA3, pwA2; green now, plus tB1).
Bank R7 (254–291): 29/38 pass, 0 fail; 9 out of scope (#261, #262, #272, #273, #287 — C28-20/21/22/7; #269, #284 — U59 host status;
#274, #288 — stage credit from the model's report). #268 judged by C20 (conflict with the bank's «asks», reported).
Suite: 165 runs green one at a time (four «Target crashed» during the disk-full spell, green when re-run). Pytest: only the numbering gap.

## Not done
C27-6 group C half and A28-36 (not reproduced at page level); the nine out-of-scope bank entries.
Shared shapes: `e.ask.alt` = display names (ids in `e.ask.alts`, new `e.ask.faL`); `AS.DO.deadline_done` misses return
`{note, quiet:true}`; new exports `AS.sysQ28`, `AS.onlySysQ28`, `AS.noCal28`, `PRE.sysTieLabels`, `A.liveChkVerdFa28`.
Handoff note: `docs/overhaul/handoff-notes/_pending_tour1_R28_surface_2026-11-16.md`.
