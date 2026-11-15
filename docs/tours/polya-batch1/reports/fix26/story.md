The round-26 «story» fixer is finished. The pause snapshot is reviewed and completed, and C30/C31 are implemented and tested. Everything is green except one page test, `test_polya_fix5.js` M3. It fails the same way on the BASE26 build, so this work did not cause it.

Worktree: /home/user/Lifemanager/.claude/worktrees/agent-aedf370a6f4851d9f, branch worktree-agent-aedf370a6f4851d9f. Nothing was pushed, and main was not touched.

**New commits (on top of WIP 1 18393f57, WIP 2 0836b47d and the pause snapshot 524546ed):**
- **3442408c** — finishes the snapshot and adds C30/C31.
- **1ef0617c** — fixes a regression I found in the snapshot (R1) and adds the docs.
- **69c98f94** — reformats the WORKLOG signature line so the handbook gate accepts it.

**What the pause snapshot needed:**
- **Kept:** the `nw26` change in `a27_tour.js` `AS.DO.coach_state`. A judged result that is not the whole answer no longer moves the stage to look-back, but it keeps its «res» credit.
- **Kept:** the snapshot reverts my WIP-2 «ladder finished» change in `a38_live.js`. That change was for C26-40, which I could not reproduce, so a38 now matches BASE26 exactly.
- **Kept:** the C26-2 test changed in `test_tour1_r22_prereq.js`, with a comment.
- **Fixed (test):** the new aC2 C26-25 test block in `test_tour1_r26_story.js` sat before the C26-2 check and wiped the problem that check reads, which made the test crash. I moved it after the check.
- **Fixed (code):** `a27_tour.js` coachPhase, about line 2259. The «closed problem shows no stage card» rule also fired on a new guess after closure, which broke `test_tour1_r2_assist` R1. The cause was that `guessNow` misses «حالا یه حدس دارم: …». The rule now uses the same guess/claim words as the RM6f exception above it.

**C31 (`a45_story.js` `frames26` / `named26FromList`):**
- Root cause: «… مثلِ همون مسئلهٔ قفسه‌هاست …» matched an ordinary naming frame, so the turn moved to that problem and the plan was filed under it.
- Now a comparison frame («مثلِ/شبیهِ/عینِ/مانندِ … X») is kept separate, and any other frame inside it is dropped. A comparison never moves the turn.
- If the same message, outside the comparison clause, carries a number or result that the text does not assign to either problem, the page asks which one (current + named) and records nothing.

**C30:** after a return by naming, later unnamed messages stay with the named problem. This already held for an open live problem, a chat problem and a closed problem; tests now pin all three.

**C36:** belongs to Q7 (loop), not my family.

**Tests:**
- Six new checks in `apps/learning-architecture/tests/test_tour1_r26_story_bank.js`: C30_live, C30_chat, C30_closed, C31_plan, C31_only, C31_datum. The three C31 checks were red before the change; the C30 checks already passed.
- **Independent bank** (`T/VARIANTS_R26.json`, unchanged since my copy): 47 entries for Q3 + Q6, 45 green.
  - #78 and #92 are not satisfied. The story part holds (the other forecast is untouched), but a41's outcome reader needs the word «پیش‌بینی». That reading belongs to Q8 «today».
  - The bank has no entries for C30/C31 (bank ambiguities 8 and 9).
- `test_tour1_r26_story.js` and `test_tour1_r26_story_bank.js` (53 checks: 51 green plus the 2 above) both report NO ERRORS.
- **Whole page suite, one test at a time:** 142 green, 1 red. The red one is `test_polya_fix5.js` M3 («… ۲۵ آبان» date line). It fails identically on the BASE26 build, so it predates this work and depends on the calendar date (dates are «today»'s area).
  - My first base check of this test was invalid because the test ignores `LLA_FILE`. I re-ran it on a temporary copy pointed at the BASE26 build.
- `python -m pytest tests/test_learning_architecture_handbook.py tests/test_supervisor_ownership.py -q`: 14 passed.

**Docs:**
- WORKLOG entry and PROGRESS row are numbered **130 / 127** on this branch, because the handbook gate refuses gaps. Renumber to **132 / 129** at merge.
- Also updated: the HANDBOOK §10 row and §12 open items, a dated entry in `docs/overhaul/AUDIT_LOG.md`, and the addendum in `experiences/model-reports-state-page-validates.md`.
- The handoff note `docs/overhaul/handoff-notes/_pending_tour1_R26_story_2026-11-12.md` now lists the a27 condition and the changed `frames26` / `named26FromList` functions.
- Quarantined code is listed in `docs/overhaul/REMOVAL_CANDIDATES.md` (`APP.STORY.R26_QUARANTINE`).

**Not done:**
- C26-40 was not reproduced.
- C26-18: the three group-C instances were not rebuilt as tests.
- Still open: C25-10 remainder, B24·D15, B24·D18, D25-16.
- Bank #78/#92 and the second half of B26·D32 belong to Q8.
- A chat correction is not shown after a return by naming in a multi-problem session; this is Q2.
- No real-model run of the «چند مسئله» / «کدام؟» blocks.
- No merge of a sibling fixer branch: none was named.
- Tokens and time are not visible to me.