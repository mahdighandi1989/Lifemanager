## Round-24 fixer «classify» (R4 + R6): done, not merged with siblings yet

**Status:** one commit, **046d813d**, on my worktree branch (on top of 3685102d). Nothing pushed and main untouched. No symlink staged; the node_modules links are still untracked. You didn't name a finished sibling branch, so I couldn't do the "merge the sibling, rebuild, rerun" step before committing.

The doc numbers are as assigned (WORKLOG 108, PROGRESS 117, HANDBOOK §12 row 62). Because siblings 105–107 aren't merged yet, the handbook test and `test_assistant_reads_the_same_registry` currently fail on that number gap only. They should pass once the earlier fixers are merged in the decided order.

### Root causes and fixes (`src/app/a27_tour.js` unless noted)
- **C24-1** (introduction openings not treated as problems):
  - The round-23 stripper removed a lead-in that names the problem («مسئله: …», «معلممون این سؤال رو داده: …»), and the detector then only saw the stripped text.
  - `stmtIsProb` also checked only the stripped statement. Result: «هنوز مسئله… نیست», no «# پیش‌نیاز», and s21 went to `lla_assistant`.
  - Fix: `statesProblem` now counts such a lead-in as a problem signal (`LEADPROB24`). The raw opening is kept as `coach.stmtRaw24` and `stmtIsProb` checks it too. `SOUGHT21` also reads «می‌خواستم بدانم …» when it has numbers.
- **C24-2:** «سارام کلاس دهم» is now recognised as an introduction. It works after a greeting (`NAMEID24`) and without one if an ordinal grade follows (`INTROP24`); «خسته‌ام کلاس داشتم» is still not one.
- **C24-3:** the correction block no longer appears on a session's first message when that message states a problem (`opening24`).
- **A24-2 (regression):** `notProblem` treated anything the stripper reduced to nothing as greeting-only, including «...». Silence now keeps the coach block.
- **A24-1:** `metaMsg22` no longer returns "use" when the same message says she is stuck (`stuckSaid24`).
- **D24-13 (regression):** in `a26_assist.js`, `chatTask` now treats a use or self-rating report as a coach signal.
- **C24-7:** `unfit23` no longer reads «بعدش چی کار کنم؟» as naming the unknown (`NEXTASK24`).
- **A24-8:** a percent counts as confidence only when tied to a confidence word, or as a bare answer to «چقدر مطمئنی؟» (`CONFQ24`). `confOwn24` stores a chat guess's confidence only from her own words.
- **D24-7:** in `a44_route.js`, `ABILITY` now catches «مغز/ذهنم … کار/یاری نمی‌کنه». «پیر شدم» on its own does not count.
- **B24·D15 / A24-14:**
  - «درسته؟» after her own reported check, with no failure, is not a guess (`CHECKED24`).
  - «فکر کنم کل مسئله حل شد» is read as a result (`OPIN_BARE2`).
  - «ایمنی رو حل کردم» is a part solved, not the whole problem (`partSolved24`).
- **R6, A23-20 / C24-4 / B24·D12 ("two questions"):**
  - The real root: `inPage22` returned the *first* page question in the session log (`coach.pQs21`) that shared words. The page's own two-sentence question got split across an older entry and the current one.
  - It only shows in a multi-turn session. Replaying the real round-24 prompts on the old build reproduced it for s01, s02, pC1 and pC2.
  - Fix: `inPageAll24` treats two segments as one if any logged page question covers both.
- **B24·D10:**
  - A «…» after «مثلاً / به شکلِ / شبیهِ» is the assistant's own illustration, not a quote of her.
  - Short quotes attributed to her with «گفتی …» are now checked.
- **C24-16:** in `a44`, a natural return to the waiting step is accepted if the reply carries the step's or parent's own words and numbers (`backTo24`).
- **B24·D12, other parts:**
  - oB1: no «خودت فکر می‌کنی چرا؟» on a question about the system (`SYSQ24`).
  - aB4: a substitution check she reported earlier in the session makes «در شرط جای‌گذاری کن» stale (`SUBST24`).
- **Quarantine:** the replaced rules are reachable as `APP.ASSIST.R24_QUARANTINE.inPage22First`, `.conf23` and `.notProblemSilence23`, and are listed in REMOVAL_CANDIDATES.

### Tests
- **New test:** `apps/learning-architecture/tests/test_tour1_r24_classify.js`, built from the runners' own sentences plus the saved session logs.
  - Red on the old build: 8 bank failures and about 30 section failures.
  - Green now.
  - The page clock is frozen; no calendar date appears in any expectation.
- **Bank:** copied to `tests/variants/VARIANTS_R24.json` (unchanged since 07:54). Of the 35 R4/R6 entries, 32 are judged and all pass. Three are recorded with reasons:
  - #138 (register for older users) and #140 (ISO date shown to a person) belong to the age fixer.
  - #137 ("reply gives a child the full next step ⇒ caught"): R6 names no such check and none exists, so I didn't build it. It is recorded in HANDBOOK §12 row 62.
- **Whole page suite:** run one test at a time, 128 tests, all exit 0 with NO ERRORS or OK.

### Docs written
- WORKLOG (108), PROGRESS 117, HANDBOOK §10 decision row and §12 row 62, update date set to 2026-10-25.
- AUDIT_LOG entry and REMOVAL_CANDIDATES entry.
- `experiences/model-reports-state-page-validates.md`: new "Update 2026-10-25" section.
- Handoff note with contracts for the other fixers: `docs/overhaul/handoff-notes/_pending_tour1_R24_classify_2026-10-25.md`.

### Not done
- Bank #137, as above.
- Remaining parts of B24·D12 belong to story (R2): s18 p17 contradictory lines, s18 p4 pointer to a missing «پیشنهادِ این نوبت», and the tB1 p9 label.
- The page's own composite result question in `a38` (story's file) is unchanged. R6 now counts it as one question, as decided.
- No real-model run.
