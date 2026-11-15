# Fixer «story», round 27 — hand-back (branch worktree-agent-a14d47b32c5a08287, head 93a672b2)

Commits on BASE27:
- 7b2795cc — WIP.
- 529c2114 — the main fix.
- 1c97b129 — C57 red-first test.
- b373dbb3 — docs.
- 93a672b2 — an undated 🎯 takes the verdict day (fixes R26 bank #205).

Suite: 164 tests run one at a time, green. Pytest handbook + ownership: 14 passed.
The branch uses WORKLOG 138 / PROGRESS 135 / §12 row 84; the coordinator renumbers them to 142/139 at merge.

## Root causes and fixes
- **No 🎯 without a date** (C27-20, U49, A27-12, D27-14), in `a41` `PR.bookPred`:
  - Any stated confidence now makes an undated 🎯 at once (`pred.fc0`, `fc27`).
  - It is filed under the problem the forecast is about (`probOf27`).
  - A later date lands on the same record.
- **Several forecasts glued into one** (D27-31): `multi27` splits per confidence and strips the counter.
  - Past confidence (`past27`) and someone else's confidence (C75) make no 🎯.
  - A new number updates the 🎯 with history (C77).
- **Clear outcomes not read** (A27-11): `outcome27` settles a 🎯 when a report matches exactly one open forecast. It reads:
  - the past tense of the predicted act;
  - comparisons;
  - the same numbers;
  - «درست درومد».

  Two candidates ⇒ the page asks «کدام؟».
- **«حل شد» closed an unrelated 🎯** (D27-13): it now counts only when the forecast is about that act.
- **📜 had no 🎯** (A27-12, D27-14): `a40` `predEv27`/`predFc27`; the session dossier groups 🎯 by their own problem.
- **Short name** (C27-18, C30): `a45` `frames26`/`run26` gain a `subj` frame that binds only on a word unique to one problem's title.
- **«برگردیم به X» jumped to the wrong problem** (B27·D15): a strong frame that fits the current problem stays put; a tie asks.
- **Someone else's work** (D27-8, C57/C75/C79): `ST.otherWork27`/`ST.otherOwns27` file it as «کارِ دیگری»; `coach_state` removes it
  from `said`.
- **`a31`:** the 🎯 list shows «بی موعد» instead of an empty date.

## Tests
- `tests/test_tour1_r27_story.js`: 26 sections, all green. On the BASE27 build, 18 of the original 24 were red.
- Old assertion changed: `test_tour1_r25_today.js` C1/A25-15 now expect an undated 🎯 (C53).
- Bank `test_tour1_r27_story_bank.js`: 69 R5+R6 entries — 54 green, 0 red, 15 not built, each with its reason:
  - 234, 235, 250: move/undo a misfiled 📜 line (C78);
  - 230: marks in 📜;
  - 224, 244: practice routing;
  - 236: facet;
  - 223: 📜 window start;
  - 231: one event per ✏️;
  - 232: «برنامه» + «طرح» duplicate;
  - 233: order;
  - 238: look-back birth;
  - 239: session count;
  - 243: restated problem;
  - 200: vague forecast.

## Not done
- The 📜 half of R6 listed above.
- A27-5, D27-9, D27-10, D27-17.
- The oA1 replay was not rebuilt.
- No real-model run.
- The red-first tests are synthetic, built from the runners' sentences.

## Contracts
- **dates:** `PR.predFc(x)` tells whether a forecast has a 🎯; `PR.fc27(...)` creates one; `pred.fc` still means «dated or judged».
- **arith:** `ST.otherWork27` gives the span of another person's work. It is not wired into a46.
- Functions changed: `docs/overhaul/handoff-notes/_pending_tour1_R27_story_2026-11-15.md`.
