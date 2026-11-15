The «classify» fixer is finished on branch `worktree-agent-adf0d166929d4c347`. Head is **82370720**, committed and not pushed; main was not touched.

**What I did after the pause**
- **WIP snapshot (7f6a721c):** I reviewed every hunk, kept it, and finished it in a new commit (no amend). It holds three changes:
  - The `oneQ25` split is reverted, so the round-25 one-page-question contract stays.
  - `regDom26` no longer re-reads text it wrote itself (`__r26`), so the change observer cannot loop.
  - `HON26`/`HONSTOP26` in `a43_age.js` no longer read «استادِ دانشگاه» as «استاد + name».
- **C23–C39:** only C38 and C39 are classify's, and both were already built in. The bank copy in the repo is identical to `T/VARIANTS_R26.json`, and the bank result did not change.
- **One regression of mine, found by the whole suite and fixed:** `plural26` in `apps/learning-architecture/src/app/a27_tour.js` (around line 4691).
  - It treated an explicit «شما … دارید» as a group address whenever she had written «داریم» ("دو شیر داریم"). That broke R21 bank #152 in `test_tour1_r21_coach`.
  - Now an explicit «شما» with no group word stays a «شما» sign.
  - I added the look-alike case to the `post` section of `test_tour1_r26_classify.js`.
- **One old assertion widened, with a comment:** `test_tour1_r25_prior` A25-10 now also accepts «برهانتان را خودتان». It previously required «برهانت را», which is the mixed register DECISIONS_R26 Q9 / D26-40 forbids.

**Test results**
- **Bank Q9/Q10 (#222–#257):** 34 of 36 green (8 green on BASE26). Two are reported with their reasons:
  - **#231, second half** ("one question, not two glued with a comma") is not met. The page question's text is its identity in the registry, and a two-sentence book question is one page question under R12 L5, R16 L1d, R22 #106 and R25 P6. Splitting it was built and reverted because it broke R22 A22-3 and R12 L5. The first half (one register inside the sentence) is green.
  - **#257** (two people in one browser) is not built this round and stays an open sheet.
- **Whole page suite, one test at a time:** all green except two, neither caused by this branch:
  - `fixtures_mind_seed.js` is a fixture meant to run inside the browser, not a test.
  - `test_polya_fix5` M3 fails only because the test hard-codes «۲۵ آبان», which is tomorrow on 2026-11-15. The check "shows her date, not tomorrow's" cannot pass on any build today.
  - After the fix I re-ran all 11 register and post-check tests (r20–r26), and all are green.
- **pytest:** `tests/test_learning_architecture_handbook.py` and `tests/test_supervisor_ownership.py` give 14 passed.

**Root causes**
They are already in the earlier commits (c6f04e59, 5dd6f7ad, 6b3c2c5c, 6db10830, 78813cc1) and listed in the handoff note:
- C22/C38: third-party names are cleaned when a title is written (`privStore26`, `G.privLabel`/`titleOf`).
- Page questions are recognised from the view registry, not treated as problems.
- Register comes from the page's own vocabulary (`POSS26`/`NOTPOSS26`), and static view text now passes `regDom26`.
- Post-check false positives are fixed with verb-stem signs.
- Mind-card labels: prior-work source label, an incomplete step is not a failure, no credit for a message the page marked ✗.
- `AS.HOLDS26` follow-up, `movedSess26`, and C39 (`extGap` capped while the technique's sequence is incomplete).
- AS.SYS is untouched.

**Not reproduced:** C26-33 passes on BASE26 as well.

**Docs**
- WORKLOG and PROGRESS use the next free numbers on BASE26, which are 130 and 127, not 136 and 133 from the launch line. The build gate rejects gaps, so the coordinator renumbers at merge.
- Also updated: HANDBOOK §10/§12 (row 74), `docs/overhaul/AUDIT_LOG.md` (a 2026-11-15 resume entry added), `docs/overhaul/REMOVAL_CANDIDATES.md` (round-26 quarantine), and the two experiences.
- The handoff note, with exact functions and contracts, is `/home/user/Lifemanager/.claude/worktrees/agent-adf0d166929d4c347/docs/overhaul/handoff-notes/_pending_tour1_R26_classify_2026-11-12.md`. It now has a resume section and the explicit-«شما» contract.

**Not done (HANDBOOK §12 row 74)**
- Bare first names with no marker (e.g. «داداشم علی»).
- Names of two words or more after an honorific.
- `a40` session-list titles do not yet call `G.titleOf`.
- Child wording beyond the understanding phase.
- Text inside SVG.
- Bank #231 second half and #257, as above.

**Notes for the coordinator**
- No sibling branch was named to merge, so none was merged.
- The `apps/learning-architecture/node_modules` symlink is untracked and not committed.
- I could not see token or time figures.