# Round-27 fixer brief (common)
Repo /home/user/Lifemanager, you are in a git worktree. FIRST: `git merge BASE27` (the coordinator gives the hash in your launch line; it is
main + this brief). Commit on your worktree branch only; never push; never touch main.
Environment (new container): `export PATH=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/venv/bin:$PATH` before any python/pytest. Playwright for node is global
(`require('playwright')` works from any directory; Chromium is preinstalled — never run "playwright install", never npm-install playwright).
The tour's working tree was restored from git: T = /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya (briefs, decisions, reports, round27X/<sid>/findings.md, defects.md,
PARTS.md, round27X/tools and ctl). For round 27 the primary evidence IS there: round27X/<sid>/ai/pN.json (prompts), rN.txt (replies), out/, post.txt, screenshots.
There was no control run in round 27. Read-only: never write under T/round27*.
Two old tests (test_tour1_r11_coach.js, r12_coach.js) load playwright through tests/prompt_tap.js from apps/learning-architecture/node_modules:
create the untracked link `ln -sfn /usr/local/lib/node_modules_global apps/learning-architecture/node_modules` in your worktree (never commit it).
NEVER commit a tool link: temporary node_modules symlinks stay untracked. Before every commit run `git status` and make sure no mode-120000
entry is staged.
Read: CLAUDE.md; apps/learning-architecture/AGENTS.md (edit only src/, then `python apps/learning-architecture/build.py`; tests load
apps/learning-architecture/dist/learning-architecture.html, so ALWAYS rebuild before a test); experiences/ (model-reports-state-page-validates,
two-sided-needs-judging-for-scenario-tours incl. all its updates, one-clock-one-scheduler…, age-aware-norms…); the binding
T/DECISIONS_R27.md (your families are named in your launch line; read the WHOLE file incl. «Severity made uniform» and C40–C58, the other
families are your neighbours' contracts), T/DECISIONS_R26.md (C15–C39 still binding) and T/DECISIONS_R25.md (C1–C14 still binding);
the reports T/reports/round27{A,B,C,D}_handback.md, T/round27{A,B,C,D}/defects.md and PARTS.md and the per-scenario findings they cite;
T/COMPARE26_judge.md (the U-table that B's U-ids refer to); your namesake's round-26 report
docs/tours/polya-batch1/reports/fix26/<yourname>.md («dates» reads fix26/today.md) (functions it changed, its «not done» list); docs/decisions/2026-10-15-sources-roadmap.md
§9 and §14–§21; handoff notes docs/overhaul/handoff-notes/_pending_tour1_R26_*.md.
Root causes only, never a patch for one sentence. Judge by the two need maps (roadmap §9): what the part must deliver by its own design, and
what the person needs at that moment. Proof: red-first node tests apps/learning-architecture/tests/test_tour1_r27_<yourname>*.js built from the
runners' own sentences, PLUS every entry for your mechanisms in the independent bank T/VARIANTS_R27.json (it is being written in parallel;
poll between steps, no foreground sleep; copy it to apps/learning-architecture/tests/variants/). An entry you cannot satisfy is reported with
its reason, never silently skipped, never edited. Never hard-code a calendar date in a test expectation that will pass with time: compute it
from today or freeze the page clock. All existing tests and banks R17–R26 stay green. An old assertion changes only where DECISIONS_R27
replaces it, with a comment. Quarantine, never delete (docs/overhaul/REMOVAL_CANDIDATES.md). No conventional numbers (only what follows from
the axioms / existing theorems / cited data). The «# مخاطب» block stays intact.
The a26 system prompt AS.SYS is at 19,988 of 20,000 characters: add NOTHING to it; new contracts go in page-built user-prompt blocks.
Whole page suite green (run tests ONE AT A TIME, never all at once — other fixers share the machine); then
`python -m pytest tests/test_learning_architecture_handbook.py tests/test_supervisor_ownership.py -q`.
Docs (AGENTS.md of the page): WORKLOG entry + PROGRESS row with the numbers below, HANDBOOK §10/§12 rows, docs/overhaul/AUDIT_LOG.md entry,
handoff note docs/overhaul/handoff-notes/_pending_tour1_R27_<yourname>_2026-11-15.md (contracts the other fixers must respect).
Numbering (next free on BASE27; the coordinator renumbers at merge if a routine took one): arith WORKLOG 138 / PROGRESS 135,
prior 139/136, correction 140/137, dates 141/138, story 142/139, loop 143/140, classify 144/141.
Shared files: a45 is touched by prior and story; a46 by arith only (prior and correction CALL its exports `ST.arithChk` / `arithNote` / `arithSaid` — never a local copy);
a27 by prior, story, dates and classify; a29 by prior, dates and classify; a38 by correction and story; a40/a41 by dates and story (🎯).
Keep your edits local to your mechanism's functions and say in the handoff note exactly which functions you changed.
Before the final commit, merge the latest finished sibling fixer branch the coordinator names (if any), rebuild, rerun.
Save progress often: commit after every mechanism that is green (a session may stop at any moment; a half-done fixer is re-run from its last commit).
Commit trailers exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LTrqtGrkuTiy1ttSUpLVCd
Final reply: commits, root causes (file:line), tests, bank results with reasons, suite result, not-done.

## Round-27 additions (binding)
- **Reproduce first.** No defect of round 27 was independently verified. For every defect you take, write the failing test from the
  runner's own turn (the prompt is in ai/pN.json); if it does not fail on BASE27, report it «not reproduced» with what you saw — do not fix
  what you cannot show, do not drop it silently. Several families were seen in more than one group (e.g. «A متر در B متر» in A, B, C, D; the
  stale date ask in A, B, C, D): take the sentences of EVERY group into your test, not one.
- **S1 first:** arith takes D27-18 and D27-1, prior takes D27-2, before anything else.
- **Neither over-fix:** every positive fix needs its look-alike negative in the same test (C40: a sum that fits stays a sum; C47: an equal
  but unrelated number stays untouched; C49: a real yes to the newest date ask still books it; C53: a vague «فکر کنم» still makes no 🎯;
  C55: page-authored text is still converted to the register).
- When a rule cannot decide, the page ASKS or says «نسنجیده»; it never guesses and never stays silent on a line it was asked to judge.
- The round-26 merge showed that a change of text length or of a shared normal form breaks other fixers silently (WORKLOG 137,
  experiences/exact-arithmetic-check-of-a-persons-written-work.md «Update 2026-11-15»): never change the length of the text whose offsets
  another part reads; say in the handoff note every shared export whose shape you touched.
- Your namesake's round-26 «not done» items that DECISIONS_R27 lists are yours now.
- Report tokens/time if you can see them.

## Launch lines
- arith: R1 (S1 D27-18, D27-1 first; C40–C45) — a46_arith.
- prior: R4 (S1 D27-2 first; C46, C56) — a45 prior ledger, a27 turn question.
- correction: R2 (C47, C48; derived-of-derived; proposals by exact recomputation only) — the stale engine in a38 and retract.
- dates: R3 (C49–C52, C58; C19/C35 restated; idiom dates) — a41, a40 (date asks), a29.
- story: R5 + R6 (🎯 C53; per-problem 📜 window, binding without lag C30, «کارِ دیگری» C57, marks in 📜, move/undo of a misfiled line) — a45 story,
  a38 stage, a40 forecast ledger, a27.
- loop: R7 (C54, C20 restated, sheet close on take-back, after-closure «امروز» line) — a44 sys*.
- classify: R8 (C55 byte-exact quotes first, C22/C38 bare first names, small mechanisms) — a27, a26 post-check (NOT AS.SYS), a43, a29 labels.
