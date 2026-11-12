# Round-26 fixer brief (common)
Repo /home/user/Lifemanager, you are in a git worktree. FIRST: `git merge BASE26` (the coordinator gives the hash in your launch line; it is
main + this brief). Commit on your worktree branch only; never push; never touch main.
Environment (new container): `export PATH=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/venv/bin:$PATH` before any python/pytest. Playwright for node is global
(`require('playwright')` works from any directory; Chromium is preinstalled — never run "playwright install", never npm-install playwright).
The tour's working tree was restored from git: T = /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya (briefs, decisions, reports, round26X/<sid>/findings.md, defects.md,
PARTS.md, round26X/tools and ctl). For round 26 the primary evidence IS there: round26X/<sid>/ai/pN.json (prompts), rN.txt (replies), out/, post.txt, screenshots.
The control run of group B is T/round26B_x/. Read-only: never write under T/round26*.
Two old tests (test_tour1_r11_coach.js, r12_coach.js) load playwright through tests/prompt_tap.js from apps/learning-architecture/node_modules:
create the untracked link `ln -sfn /usr/local/lib/node_modules_global apps/learning-architecture/node_modules` in your worktree (never commit it).
NEVER commit a tool link: temporary node_modules symlinks stay untracked. Before every commit run `git status` and make sure no mode-120000
entry is staged.
Read: CLAUDE.md; apps/learning-architecture/AGENTS.md (edit only src/, then `python apps/learning-architecture/build.py`; tests load
apps/learning-architecture/dist/learning-architecture.html, so ALWAYS rebuild before a test); experiences/ (model-reports-state-page-validates,
two-sided-needs-judging-for-scenario-tours incl. all its updates, one-clock-one-scheduler…, age-aware-norms…); the binding
T/DECISIONS_R26.md (your families are named in your launch line; read the WHOLE file incl. «Severity made uniform» and C15–C22, the other
families are your neighbours' contracts) and T/DECISIONS_R25.md with its Clarifications C1–C14 (still binding);
the reports T/reports/round26{A,B,B_x,C,D}_handback.md, T/round26{A,B,B_x,C,D}/defects.md and the per-scenario findings they cite;
T/COMPARE26_judge.md (the U-table: group B's defects verified by the blind judge) and T/COMPARE26_result.md; your namesake's round-25 report
docs/tours/polya-batch1/reports/fix25/<yourname>.md (functions it changed, its «not done» list); docs/decisions/2026-10-15-sources-roadmap.md
§9 and §14–§21; handoff notes docs/overhaul/handoff-notes/_pending_tour1_R25_*.md.
Root causes only, never a patch for one sentence. Judge by the two need maps (roadmap §9): what the part must deliver by its own design, and
what the person needs at that moment. Proof: red-first node tests apps/learning-architecture/tests/test_tour1_r26_<yourname>*.js built from the
runners' own sentences, PLUS every entry for your mechanisms in the independent bank T/VARIANTS_R26.json (it is being written in parallel;
poll between steps, no foreground sleep; copy it to apps/learning-architecture/tests/variants/). An entry you cannot satisfy is reported with
its reason, never silently skipped, never edited. Never hard-code a calendar date in a test expectation that will pass with time: compute it
from today or freeze the page clock. All existing tests and banks R17–R25 stay green. An old assertion changes only where DECISIONS_R26
replaces it, with a comment. Quarantine, never delete (docs/overhaul/REMOVAL_CANDIDATES.md). No conventional numbers (only what follows from
the axioms / existing theorems / cited data). The «# مخاطب» block stays intact.
The a26 system prompt AS.SYS is at 19,988 of 20,000 characters: add NOTHING to it; new contracts go in page-built user-prompt blocks.
Whole page suite green (run tests ONE AT A TIME, never all at once — other fixers share the machine); then
`python -m pytest tests/test_learning_architecture_handbook.py tests/test_supervisor_ownership.py -q`.
Docs (AGENTS.md of the page): WORKLOG entry + PROGRESS row with the numbers below, HANDBOOK §10/§12 rows, docs/overhaul/AUDIT_LOG.md entry,
handoff note docs/overhaul/handoff-notes/_pending_tour1_R26_<yourname>_2026-11-12.md (contracts the other fixers must respect).
Numbering (next free on BASE26; the coordinator renumbers at merge if a routine took one): arith WORKLOG 130 / PROGRESS 127,
correction 131/128, story 132/129, prior 133/130, today 134/131, loop 135/132, classify 136/133.
Shared files: a45 is touched by prior and story; a46 by arith only (prior and correction CALL its exports `ST.arithChk` / `arithNote` / `arithSaid` — never a local copy);
a27 by prior, story, today and classify; a29 by prior, today and classify; a38 by correction and story; a41 by today.
Keep your edits local to your mechanism's functions and say in the handoff note exactly which functions you changed.
Before the final commit, merge the latest finished sibling fixer branch the coordinator names (if any), rebuild, rerun.
Save progress often: commit after every mechanism that is green (a session may stop at any moment; a half-done fixer is re-run from its last commit).
Commit trailers exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LTrqtGrkuTiy1ttSUpLVCd
Final reply: commits, root causes (file:line), tests, bank results with reasons, suite result, not-done.

## Round-26 additions (binding)
- **Reproduce first.** Only group B's defects were independently verified (U-table). For every defect of A, C, D you take: write the failing
  test from the runner's own turn (the prompt is in ai/pN.json); if it does not fail on BASE26, report it «not reproduced» with what you
  saw — do not fix what you cannot show, do not drop it silently.
- **Severity is uniform** (DECISIONS_R26): correct work shown ✗ to the coach, and wrong work shown ✓ to the coach, are S1 and come first.
- **Neither over-fix:** every positive fix needs its look-alike negative in the same test (e.g. a scale word must not hide a real slip;
  a dependency marker must not mark an equal but unrelated number; a date reader must still read her real plan).
- When a rule cannot decide, the page ASKS or says «نسنجیده»; it never guesses and never stays silent on a line it was asked to judge.
- Your namesake's round-25 «not done» items that DECISIONS_R26 lists are yours now.
- Report tokens/time if you can see them.

## Launch lines
- arith: Q1 (both S1 families first; C15–C18; contest of the page's ✗ = owner bank 36) — a46_arith.
- correction: Q2 (a correction reaches everything built on it and nothing else; C11) — the stale engine in a38 and retract.
- story: Q3 + Q6 (one problem one record, return by naming C21; stage and closure follow the page) — a45 story, a38 stage, a27.
- prior: Q4 (prior-work reply reading) — a45 prior ledger, a27 turn question.
- today: Q5 + Q8 (dates and «امروز», C19, C12 on both paths; forecast ledger 🎯) — a41, a40, a29.
- loop: Q7 (territory loop polish, C20) — a44 sys*.
- classify: Q9 + Q10 (personal data C22 first, register, titles, post-check, mind-card labels; small mechanisms) — a27, a26 post-check (NOT AS.SYS), a43, a29 labels.
