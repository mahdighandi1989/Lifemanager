## Round-24 fixer «loop» (R1): finished, with one known merge-gate item

**Status:** R1 is fixed. My test passes, its bank section passes, and the whole page suite (128 tests, run one at a time) is green. The one thing still red is `test_learning_architecture_handbook.py` (and one `test_supervisor_ownership.py` check). It fails only because WORKLOG goes 104 → 107 and PROGRESS goes 113 → 116. Those gaps are the numbers the brief reserved for correction and story (105/106, 114/115). They fill when those branches merge, or when you renumber. I checked this: with my entries temporarily renumbered to 105/114, all 14 tests of both pytest files passed. I then restored 107/116.

**Commit:** `54f9ebeb` on `worktree-agent-a691d9d3ad04f4265`. It is based on a merge of `3685102d`. Nothing was pushed, `main` is untouched, and I checked that no symlink (mode 120000) is staged. You named no sibling branch, so I merged none.

### Root causes
All in `apps/learning-architecture/src/app/a44_route.js` unless noted.

1. **The page read the sheet's own text (D24-1 S1, A24-4, C24-14, B24·D19).** `sysSheet` (was ~line 928) joined every note of the sheet into one text. That included the filing text with «کجا افزوده شود», the assistant's differential and `whole`. So `namedItems` picked up area ids the routine never named, e.g. `pr_representation`, `pr_hypothesis_testing` and `whole`.
2. **The first weak match won (A24-5, C24-14).** `fits`/`shared` (was ~873–876) took the first candidate sharing two words. It counted words inside negated clauses («… حوزهٔ اقناع … جواب نمی‌دهد») and generic words («سنجش، مرز»).
3. **Any sheet could mark a step waiting (D24-2, A24-6, C24-13, A24-15).** `sysOpen` (was ~963) fell back to the «now» step when a gap had no `gap.step`. So companion-book, self-knowledge and kind=fix sheets put her step on hold, and the wrong step name stuck in 📜.
4. **Stale events and no reply on sys_done (D24-8, B24·D18, B24·D19).** The ⏸ event was written once with outcome «منتظر» and never updated. Event times came from a page clock that could run behind. `PRE.sysDone` wrote no page line and no note under the sheet.

### What changed
- **Only the routine's reply is read now** (`replyNotes`).
- **Matching:**
  - Need text drops negated clauses (`negFree`), except the gap sentence «حوزه‌ای برای X نیست».
  - Generic words are dropped (`generic`): the DECISIONS_R24 list, the loop's own words (حوزه، قلمرو، برگه…), «پیش/قبل/میان/بین», plus `dfWide`.
  - Areas the differential ruled out are excluded (`ruledOf`).
  - Every candidate is scored and the best wins (`rank`).
- **When it counts as arrived:** at least two shared words, at least one of them from the step or sheet title, and no tie.
- **When it is half-clear:** if a shared word is in the step or title but the match is not clear, the page asks her first («این ابزارِ تازه همان است که برای گامِ … لازم بود؟»). That also shows in Today and as a `sysask` event. Her answer is read from a plain yes/no at the start of her next message, or from the new `coach_state.sys_fit`.
- **Otherwise it is a mismatch:** a page line «⚠️ … جواب نداد», a note under the sheet, and the step keeps waiting.
- **Which step waits:** kind=fix never marks one. Otherwise it is `gap.step`, or «گامِ #k» in the gap text, or a step in the assistant's list that names «#n». Anything else goes to `sysPend` and waits for a step to name the sheet.
- **sys_done:** the page rejects a question or tiredness as a report. On a real report it writes a page line in her register and a note under the sheet.
- **📜 / 🔭:** the ⏸ event is rewritten with the current outcome and step name, and event times only move forward. 🔭 stops showing the fixed waiting text once nothing waits.
- **Old code kept:** the R23 matching is quarantined as `APP.PRE.R24_QUARANTINE` and listed in REMOVAL_CANDIDATES.

**`a26_assist.js` gap contract:** I could not add the `step` rules to the a26 system prompt. It sits at about 19,988 of the server's 20,000-character limit, and my first try broke 10 tests on that cap alone. So the `gap.step` / system-itself / `sys_fit` contract lives in the «# پیش‌نیاز» RULE line in a44, which goes in the user prompt. In a26, `AS.triage` now drops `step` from kind=fix gaps. The other fixers should know there is almost no room left in that system prompt; this is in the handoff note.

### Tests
- **New `tests/test_tour1_r24_loop.js`.** It is built from the runners' own sheets and sentences (oD1n, tA1 #101/#102, tC1 #102/#103, tB1/tB1x, oD1, oA1, oC1). No calendar date is fixed; the page clock is moved with `APP.clock.off`.
  - **Red first:** on the build before my change it got 1/17 bank entries right with 28 errors.
  - **After:** no errors.
- **Bank `VARIANTS_R24.json`:** all 27 R1 entries pass (copied to `tests/variants/`).
  - Model-only entries are guarded on the page side: tiredness (#25) and a question (#26) are refused as sys_done reports.
  - #20 and #17 end as a mismatch or are excluded as ruled out; the bank accepts either "ask" or "mismatch" for these.
- **One old assertion changed:** in `test_tour1_r23_prereq.js`, G102 now carries `gap.step`, because R1 removes the «now» fallback. It is commented in the test. R23 bank Q2/Q6: 37/37.

### Docs
WORKLOG (107), PROGRESS 116, HANDBOOK (§2 bullet, §10 row, update date), AGENTS.md (round-24 paragraph on what routines should put in a reply), AUDIT_LOG, REMOVAL_CANDIDATES, and `docs/overhaul/handoff-notes/_pending_tour1_R24_loop_2026-10-25.md` (contracts for the other fixers, the new event ids, the Today line, the SYS-limit warning).

### Not done
- No real-model run of the new `sys_fit` contract.
- R2–R8 are out of my scope.