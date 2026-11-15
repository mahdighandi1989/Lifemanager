Fixer «correction» (round 26, Q2 + C11): done. It is on branch worktree-agent-a0da2d97bc6efec79 in /home/user/Lifemanager/.claude/worktrees/agent-a0da2d97bc6efec79. Nothing was pushed and main was not touched.

**Suite result:** 140 page tests run one at a time, 139 green. `test_polya_fix5.js` fails only today: it hard-codes «۲۵ آبان» and today is ۲۴ آبان, so "tomorrow" is that exact date. That is a calendar coincidence in the test, and I did not touch it. The two pytest files are green (14 passed).

**Commits after the WIP snapshot** (the snapshot 15a5c425 was reviewed and finished in new commits, not amended):
- 033ee07e — checkpoint 5: finishes the snapshot.
- 180a4bb1 — checkpoint 6.
- fd966755 — docs.
- 304e4e6c — fixes for four regressions the first suite run found.
- ceb70c00 — docs for the suite result.

All use the Opus trailers. No tool symlink was staged.

**Root causes and fixes, by file**
- **`a38_live.js` (the stale-number engine `staleCore25`)**
  - Equal digits were treated as dependency. Now it follows only what she wrote: expressions, unit conversions, roundings, named difference lists, and chains of results she wrote in the same message.
  - A number in a clause with another time rate is never the corrected datum (`rate26`, `rateClash26`, `guessRateOff26`; «روزی» ≠ «دقیقه‌ای», A26-34).
  - A root written in another unit is now read in its own unit (`rk26` in `curV`/`newV`). «هکتار» is a unit now. A unitless pair takes its unit from her clause (`pairs25(D, RC, clause)`).
  - New rule: the first number of a sentence that is one operation on two results she wrote in the previous sentence (aB3: «کسری ۵٫۷» ⇒ ۴٫۵).
  - New ctx rule: the stale value combined with a result she stated earlier, with her own rounding after «حدودِ» (tA1: ۱۳ ⇒ ۱۷).
  - The dimension guard now also applies at tier 3, but only for two physical kinds (pwC1 no longer invents «۴ ⇒ ۳٫۲»).
  - `storyFollow26` change lines show only the changed fragment.
- **`a27_tour.js`**
  - `retractCheck`: a word with a ZWNJ stays one word in the fix check («دقیقه‌ای»).
  - `fixQ22`: a clause starting with «فرض کن» is a hypothetical, not a correction.
  - Inside `retractApply`: a result re-recorded after ✏️ is judged on its final text (U6). `put` and `chLine20` show the changed window for long texts instead of two identical openings (pwC1).
- **`a45_story.js` `priorTurn25`:** later ledger steps that use a stale step's result are linked as dependants again (C25-15).
- **`a39_math.js` `decorate`:** the page's own notices get no data chart. A stale list was getting a chart, which hid the «بله» button the runner pressed.

The full function list and contracts for the other fixers are in `/home/user/Lifemanager/.claude/worktrees/agent-a0da2d97bc6efec79/docs/overhaul/handoff-notes/_pending_tour1_R26_correction_2026-11-12.md`.

**Tests**
- They replay the runners' own turns against the built page (`tests/tour1_r26_replay.js`, fixtures in `tests/fixtures/r26_correction/`).
- Each positive check has a negative look-alike in the same case. Example: in tA1 the «۲ لیتر» per shrub per day is never marked, rewritten or asked.
- Group B (`test_tour1_r26_correction.js`): 7 of 7 green.
- Groups A/C/D (`test_tour1_r26_correction_acd.js`): 10 green, 2 reported as not done (below).
- The independent bank (`test_tour1_r26_correction_bank.js`, VARIANTS_R26 Q2): 29 of 30. #48 is reported, not fixed: the 🎯 forecast row, the practice session and the look-back check belong to fixer «today». The contract they should use is in the handoff note.
- I re-read C23–C39. None of them changes a Q2 entry, and the bank was re-run against them.

**Not done (reported with reasons)**
- **A26-15 s07:** the fixture has no ✏️ turn for the heights, so the defect cannot be reproduced by replay. The mechanism is covered by bank #47.
- **C25-15 pwC2:** the percent-of-population chain is never written out. «۸۹٫۱» depends on «۹۹۰», which is outside the ledger. Marking part of the chain would print a wrong "exact" value for «۹۸٫۱» (C11), so the page cannot handle it without a multi-step population model.
- Two smaller gaps, neither marked nor asked: «ρgQH» with «(۱۲٫۵/۳۶۰۰)», and «۳ وات‌ساعت», which is computed from the rounded «۱۳ دقیقه» in two steps.

**Docs**
- WORKLOG 130 and PROGRESS 127 on this branch. You assigned 131 and 128, but the gate rejects gaps, so I took the next free numbers; renumber at merge.
- HANDBOOK §10 row (2026-11-15) and §12 row 74, an AUDIT_LOG entry, the handoff note, and a dated update in `experiences/model-reports-state-page-validates.md`.

No sibling branch was named, so nothing was merged in. I could not see token counts or time.
