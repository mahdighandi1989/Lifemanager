# Round-29 fixer brief (common)
Repo /home/user/Lifemanager, you are in a git worktree. FIRST: `git merge BASE29` (the coordinator gives the hash in your launch line; it is
main + this brief). Commit on your worktree branch only; never push; never touch main.
Environment (new container): `export PATH=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/venv/bin:$PATH` before any python/pytest. Playwright for node is global
(`require('playwright')` works from any directory; Chromium is preinstalled — never run "playwright install", never npm-install playwright).
The tour's working tree was restored from git: T = /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya (briefs, decisions, reports, round29X/<sid>/findings.md, defects.md,
PARTS.md, round29X/tools and ctl). For round 29 the primary evidence IS there: round29X/<sid>/ai/pN.json (prompts), rN.txt (replies), out/, post.txt, screenshots.
There was no control run in round 29. Round-28 evidence (round28X/) is still there for comparison. Read-only: never write under T/round2*.
Two old tests (test_tour1_r11_coach.js, r12_coach.js) load playwright through tests/prompt_tap.js from apps/learning-architecture/node_modules:
create the untracked link `ln -sfn /usr/local/lib/node_modules_global apps/learning-architecture/node_modules` in your worktree (never commit it).
NEVER commit a tool link: temporary node_modules symlinks stay untracked. Before every commit run `git status` and make sure no mode-120000
entry is staged.
Read: CLAUDE.md; apps/learning-architecture/AGENTS.md (edit only src/, then `python apps/learning-architecture/build.py`; tests load
apps/learning-architecture/dist/learning-architecture.html, so ALWAYS rebuild before a test); experiences/ (model-reports-state-page-validates,
two-sided-needs-judging-for-scenario-tours incl. all its updates, one-clock-one-scheduler…, age-aware-norms…); the binding
T/DECISIONS_R29.md (your families are named in your launch line; read the WHOLE file incl. «Progress metrics», the families F1–F19, C136–C153, the other
families are your neighbours' contracts), T/DECISIONS_R28.md (C84–C135 still binding; C105 REVOKED by C135, C118 NARROWED by C148), T/DECISIONS_R27.md (C40–C83 still binding), T/DECISIONS_R26.md (C15–C39) and T/DECISIONS_R25.md (C1–C14);
the reports T/reports/round29{A,B,C,D}_handback.md, T/round29{A,B,C,D}/defects.md and PARTS.md and the per-scenario findings they cite;
T/COMPARE26_judge.md (the U-table that B's U-ids refer to); your namesake's round-26 report
docs/tours/polya-batch1/reports/fix28/<yourname>.md (and fix28/c134.md for dates) (functions it changed, its «not done» list); docs/decisions/2026-10-15-sources-roadmap.md
§9 and §14–§22; handoff notes docs/overhaul/handoff-notes/_pending_tour1_R28_*.md.
Root causes only, never a patch for one sentence. Judge by the two need maps (roadmap §9): what the part must deliver by its own design, and
what the person needs at that moment. Proof: red-first node tests apps/learning-architecture/tests/test_tour1_r29_<yourname>*.js built from the
runners' own sentences, PLUS every entry for your mechanisms in the independent bank T/VARIANTS_R29.json (it is being written in parallel;
poll between steps, no foreground sleep; copy it to apps/learning-architecture/tests/variants/). An entry you cannot satisfy is reported with
its reason, never silently skipped, never edited. Never hard-code a calendar date in a test expectation that will pass with time: compute it
from today or freeze the page clock. All existing tests and banks R17–R28 stay green. An old assertion changes only where DECISIONS_R29 (or C135/C148)
replaces it, with a comment. Quarantine, never delete (docs/overhaul/REMOVAL_CANDIDATES.md). No conventional numbers (only what follows from
the axioms / existing theorems / cited data). The «# مخاطب» block stays intact.
The a26 system prompt AS.SYS is at 19,988 of 20,000 characters: add NOTHING to it; new contracts go in page-built user-prompt blocks.
Whole page suite green (run tests ONE AT A TIME, never all at once — other fixers share the machine); then
`python -m pytest tests/test_learning_architecture_handbook.py tests/test_supervisor_ownership.py -q`.
Docs (AGENTS.md of the page): WORKLOG entry + PROGRESS row with the numbers below, HANDBOOK §10/§12 rows, docs/overhaul/AUDIT_LOG.md entry,
handoff note docs/overhaul/handoff-notes/_pending_tour1_R29_<yourname>_2026-11-17.md (contracts the other fixers must respect).
Numbering (next free on BASE29; the coordinator renumbers at merge if a routine took one): arith WORKLOG 156 / PROGRESS 153,
prior 157/154, correction 158/155, story 159/156, forecast 160/157, dates 161/158, surface 162/159.
Shared files: a45 is touched by story and prior; a46 by arith only (correction, prior and story CALL its exports — arith adds the per-clause verdict export of C138 and names its shape in its handoff note); a27 by prior, story, dates
and surface; a41 by dates and forecast (🎯 lives in a41 `PR.bookPred` and friends — forecast owns those functions, dates owns the date-ask
functions); a40 by story and forecast; a38 by correction and story. Keep your edits local to your mechanism's functions and say in the handoff note exactly which functions you changed.
Before the final commit, merge the latest finished sibling fixer branch the coordinator names (if any), rebuild, rerun.
Save progress often: commit after every mechanism that is green (a session may stop at any moment; a half-done fixer is re-run from its last commit).
Commit trailers exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LTrqtGrkuTiy1ttSUpLVCd
Final reply: commits, root causes (file:line), tests, bank results with reasons, suite result, not-done.

## Round-29 additions (binding)
- **C101 + C137 are the bar.** A fix is proven by (a) a red-first test from a runner's own turn, (b) every bank entry for your mechanism,
  AND (c) a page-level replay through the runners' real harness in EVERY group that showed your family (the families table names the
  groups; tools, ctl and recorded ai/ replies of all four groups are in T/round29X/). Report each item as «proven (a+b+c) in A,B,C,D» or
  «proven in X only» / «unit-only» — the coordinator counts only the first as done.
- **Look-alikes from the real transcripts (C136).** For every rule you implement, grep T/round28*/ and T/round29*/ (ctl, ai/, findings)
  for sentences of the same shape and run them: a sentence a runner judged correct must keep its verdict. Two of the coordinator's own
  rulings (C105, C118) broke this; C135 and C148 correct them.
- **One judge (C139).** Arithmetic is judged by the arith engine only; any other reader may add «نسنجیده», never contradict it.
- **Neither over-fix:** each positive has its look-alike negative (C148 both lists; C140 both lists; C141 «نسنجیده» when need/have is
  not in her text; C145 a single yes still binds only the newest ask).
- When a rule cannot decide, the page ASKS or says «نسنجیده»; it never guesses and never stays silent on a line it was asked to judge.
- Never change the length of a text whose offsets another part reads (WORKLOG 137); name every shared export whose shape you touch.
- Your «Not done» list goes into your hand-back verbatim; the coordinator turns each item into a named runner arm (C153).

## Launch lines
- arith: R1 (S1 C29-1, C29-2, C29-3 first; quarantine the C105 branch per C135 ⇒ D29-1/D29-2; C140, C141; any number of compound
  amounts; item names between amounts; a ✗ value in her scale; per-clause verdict export for C138) — a46_arith (+ a38 `runs25` lexer).
- prior: R3 (F17: S1 B29·D11 via C139 — `a45_story.js` `tryFix` ~797–803; D29-7 no invented text; B29·D25 unchanged reason intact;
  s28 p4 / C25-7′) — a45 prior ledger.
- correction: R2 (F8: C89 with one proposal function, ratio path quarantined; C142, C143; regressions D29-26, D29-23; C29-12 re-mark;
  D29-5) — a38 stale engine, a27 retract.
- story: R6 (F15 via C138 with arith's export; F18 C149; F9 C125; F10 C124 at page level in A, B, C; F11 with prior) — a45 story
  (`ST.ownCalc28`), a40 dossier, a31.
- forecast: R5 (F4: C148 narrowing C118; C152 forecast before dates; two 🎯 in one clause; no duplicates; outcome only for a 🎯;
  C119 in B's shape; C121; A29-24) — a41 🎯 functions, a31 🎯 list, a40 🎯 lines.
- dates: R4 (F6: C117 at page level in B and D; C144, C145, C146, C147; regression D29-25) — a41 date-ask functions, a40, a29.
- surface: R7 (F13, F14 + C151, F19 + C150, B27·D16 loop) — a44 sys*, a26 post-check and page-built prompt blocks (NOT AS.SYS), a27
  routing, a43, a29 labels.
