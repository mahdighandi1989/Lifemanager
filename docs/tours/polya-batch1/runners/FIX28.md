# Round-28 fixer brief (common)
Repo /home/user/Lifemanager, you are in a git worktree. FIRST: `git merge BASE28` (the coordinator gives the hash in your launch line; it is
main + this brief). Commit on your worktree branch only; never push; never touch main.
Environment (new container): `export PATH=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/venv/bin:$PATH` before any python/pytest. Playwright for node is global
(`require('playwright')` works from any directory; Chromium is preinstalled — never run "playwright install", never npm-install playwright).
The tour's working tree was restored from git: T = /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya (briefs, decisions, reports, round28X/<sid>/findings.md, defects.md,
PARTS.md, round28X/tools and ctl). For round 28 the primary evidence IS there: round28X/<sid>/ai/pN.json (prompts), rN.txt (replies), out/, post.txt, screenshots.
There was no control run in round 28. Read-only: never write under T/round2*.
Two old tests (test_tour1_r11_coach.js, r12_coach.js) load playwright through tests/prompt_tap.js from apps/learning-architecture/node_modules:
create the untracked link `ln -sfn /usr/local/lib/node_modules_global apps/learning-architecture/node_modules` in your worktree (never commit it).
NEVER commit a tool link: temporary node_modules symlinks stay untracked. Before every commit run `git status` and make sure no mode-120000
entry is staged.
Read: CLAUDE.md; apps/learning-architecture/AGENTS.md (edit only src/, then `python apps/learning-architecture/build.py`; tests load
apps/learning-architecture/dist/learning-architecture.html, so ALWAYS rebuild before a test); experiences/ (model-reports-state-page-validates,
two-sided-needs-judging-for-scenario-tours incl. all its updates, one-clock-one-scheduler…, age-aware-norms…); the binding
T/DECISIONS_R28.md (your families are named in your launch line; read the WHOLE file incl. «Progress metrics», the 14 families, C84–C101, the other
families are your neighbours' contracts), T/DECISIONS_R27.md (C40–C83 still binding), T/DECISIONS_R26.md (C15–C39) and T/DECISIONS_R25.md (C1–C14);
the reports T/reports/round28{A,B,C,D}_handback.md, T/round28{A,B,C,D}/defects.md and PARTS.md and the per-scenario findings they cite;
T/COMPARE26_judge.md (the U-table that B's U-ids refer to); your namesake's round-26 report
docs/tours/polya-batch1/reports/fix27/<yourname>.md and reports/fix27b/*.md («forecast» reads fix27/story.md, «surface» reads fix27/loop.md and classify.md) (functions it changed, its «not done» list); docs/decisions/2026-10-15-sources-roadmap.md
§9 and §14–§22; handoff notes docs/overhaul/handoff-notes/_pending_tour1_R27*_*.md.
Root causes only, never a patch for one sentence. Judge by the two need maps (roadmap §9): what the part must deliver by its own design, and
what the person needs at that moment. Proof: red-first node tests apps/learning-architecture/tests/test_tour1_r27_<yourname>*.js built from the
runners' own sentences, PLUS every entry for your mechanisms in the independent bank T/VARIANTS_R28.json (it is being written in parallel;
poll between steps, no foreground sleep; copy it to apps/learning-architecture/tests/variants/). An entry you cannot satisfy is reported with
its reason, never silently skipped, never edited. Never hard-code a calendar date in a test expectation that will pass with time: compute it
from today or freeze the page clock. All existing tests and banks R17–R27 stay green. An old assertion changes only where DECISIONS_R28
replaces it, with a comment. Quarantine, never delete (docs/overhaul/REMOVAL_CANDIDATES.md). No conventional numbers (only what follows from
the axioms / existing theorems / cited data). The «# مخاطب» block stays intact.
The a26 system prompt AS.SYS is at 19,988 of 20,000 characters: add NOTHING to it; new contracts go in page-built user-prompt blocks.
Whole page suite green (run tests ONE AT A TIME, never all at once — other fixers share the machine); then
`python -m pytest tests/test_learning_architecture_handbook.py tests/test_supervisor_ownership.py -q`.
Docs (AGENTS.md of the page): WORKLOG entry + PROGRESS row with the numbers below, HANDBOOK §10/§12 rows, docs/overhaul/AUDIT_LOG.md entry,
handoff note docs/overhaul/handoff-notes/_pending_tour1_R28_<yourname>_2026-11-16.md (contracts the other fixers must respect).
Numbering (next free on BASE28; the coordinator renumbers at merge if a routine took one): arith WORKLOG 148 / PROGRESS 145,
correction 149/146, prior 150/147, dates 151/148, forecast 152/149, story 153/150, surface 154/151.
Shared files: a45 is touched by story and prior; a46 by arith only (correction and prior CALL its exports); a27 by prior, story, dates
and surface; a41 by dates and forecast (🎯 lives in a41 `PR.bookPred` and friends — forecast owns those functions, dates owns the date-ask
functions); a40 by story and forecast; a38 by correction and story. Keep your edits local to your mechanism's functions and say in the handoff note exactly which functions you changed.
Before the final commit, merge the latest finished sibling fixer branch the coordinator names (if any), rebuild, rerun.
Save progress often: commit after every mechanism that is green (a session may stop at any moment; a half-done fixer is re-run from its last commit).
Commit trailers exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LTrqtGrkuTiy1ttSUpLVCd
Final reply: commits, root causes (file:line), tests, bank results with reasons, suite result, not-done.

## Round-28 additions (binding)
- **C101 is the bar.** A fix is proven by (a) a red-first test from the runner's own turn, (b) every bank entry for your mechanism, AND
  (c) a page-level replay through the runner's real harness (T/round28X/tools, ctl, the recorded ai/ replies) of at least one scenario per
  family where the defect was seen, checking the DOM or view the runner saw. Report each item as «proven (a+b+c)» or «unit-only» — the
  coordinator counts only the first as done. Ten of round 28's fourteen families were round-27 items reported done on unit proof only.
- **Take the sentences of EVERY group** that showed your family (the families table in DECISIONS_R28 names the groups).
- **Neither over-fix:** each positive has its look-alike negative (C84: «۲ میلیون و ۸۰۰ ÷ ۲ = ۱ میلیون و ۴۰۰» where both readings fit
  still asks; C88: an equal number elsewhere is untouched; C90: a past or someone else's confidence still makes no 🎯; C96: «داداشم گفت»
  about a datum is a datum with a source, not «کارِ دیگری»).
- When a rule cannot decide, the page ASKS or says «نسنجیده»; it never guesses and never stays silent on a line it was asked to judge.
- Never change the length of a text whose offsets another part reads (WORKLOG 137); name every shared export whose shape you touch.

## Launch lines
- arith: R1 (S1 B28·D1 = C28-13 and A28-40 first; C84, C85; `m2` reader) — a46_arith (+ a38 `runs25` lexer if the S1 passes through it).
- correction: R2 (C87, C88, C89; F7, F8) — a38 stale engine, a27 retract.
- prior: R6 (C98; D28-6 regression; B28·D9; C27-21; with story: C97 on the ledger side) — a45 prior ledger.
- dates: R3 (C92, C93, C94; F5 from a41 ~3298 `amb` without `free`; F6) — a41 date-ask functions, a40 date asks, a29.
- forecast: R4 (C90, C91; F4; A28-35 view) — a41 🎯 functions (`PR.bookPred`, `fc27`, `multi27`, `outcome27`, `predFc`), a31 🎯 list,
  a40 🎯 lines.
- story: R5 (C86, C95, C96, C97; F3, F9, F10, F11; A28-12, A28-13, A28-27) — a45 story, a40 dossier, a31.
- surface: R7 (C99, C100; D28-19, A28-32, D28-29/C28-6, B27·D16) — a44 sys*, a26 post-check (NOT AS.SYS), a27 routing, a43, a29 labels.
