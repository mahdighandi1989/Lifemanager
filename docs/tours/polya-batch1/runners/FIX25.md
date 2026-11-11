# Round-25 fixer brief (common)
Repo /home/user/Lifemanager, you are in a git worktree. FIRST: `git merge BASE25` (the coordinator gives the hash in your launch line; it is
main + this brief). Commit on your worktree branch only; never push; never touch main.
Environment (new container): `export PATH=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/venv/bin:$PATH` before any python/pytest. Playwright for node is global
(`require('playwright')` works from any directory; Chromium is preinstalled — never run "playwright install", never npm-install playwright).
The tour's working tree was restored from git: T = /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya (briefs, decisions, reports, round25X/<sid>/findings.md, defects.md,
PARTS.md, ans_*.json, round25X/tools and ctl). Screenshots, ai/pN.json and better/ of round 25 were NOT kept; the findings quote the turns.
NEVER commit a tool link: temporary node_modules symlinks stay untracked. Before every commit run `git status` and make sure no mode-120000
entry is staged.
Read: CLAUDE.md; apps/learning-architecture/AGENTS.md (edit only src/, then `python apps/learning-architecture/build.py`; tests load
apps/learning-architecture/dist/learning-architecture.html, so ALWAYS rebuild before a test); experiences/ (model-reports-state-page-validates,
two-sided-needs-judging-for-scenario-tours incl. all its updates, one-clock-one-scheduler…, age-aware-norms…); the binding
T/DECISIONS_R25.md (your mechanisms are named in your launch line; read the WHOLE file, the other mechanisms are your neighbours' contracts);
the reports T/reports/round25{A,B,C,D,B_s}_handback.md, T/round25{A,B,C,D,B_s}/defects.md and the per-scenario findings they cite
(T/round25X/<sid>/findings.md, ans_*.json); T/COMPARE25_result.md (the U-table: verified defects); docs/decisions/2026-10-15-sources-roadmap.md
§9 and §14–§21; handoff notes docs/overhaul/handoff-notes/_pending_tour1_R24_*.md.
Root causes only, never a patch for one sentence. Judge by the two need maps (roadmap §9): what the part must deliver by its own design, and
what the person needs at that moment. Proof: red-first node tests apps/learning-architecture/tests/test_tour1_r25_<yourname>*.js built from the
runners' own sentences, PLUS every entry for your mechanisms in the independent bank T/VARIANTS_R25.json (it is being written in parallel;
poll between steps, no foreground sleep; copy it to apps/learning-architecture/tests/variants/). An entry you cannot satisfy is reported with
its reason, never silently skipped, never edited. Never hard-code a calendar date in a test expectation that will pass with time: compute it
from today or freeze the page clock. All existing tests and banks R17–R24 stay green. An old assertion changes only where DECISIONS_R25
replaces it, with a comment. Quarantine, never delete (docs/overhaul/REMOVAL_CANDIDATES.md). No conventional numbers (only what follows from
the axioms / existing theorems / cited data). The «# مخاطب» block stays intact.
The a26 system prompt AS.SYS is at 19,988 of 20,000 characters: add NOTHING to it; new contracts go in page-built user-prompt blocks.
Whole page suite green (run tests ONE AT A TIME, never all at once — other fixers share the machine); then
`python -m pytest tests/test_learning_architecture_handbook.py tests/test_supervisor_ownership.py -q`.
Docs (AGENTS.md of the page): WORKLOG entry + PROGRESS row with the numbers below, HANDBOOK §10/§12 rows, docs/overhaul/AUDIT_LOG.md entry,
handoff note docs/overhaul/handoff-notes/_pending_tour1_R25_<yourname>_2026-11-11.md (contracts the other fixers must respect).
Numbering (next free on BASE25; the coordinator renumbers at merge if a routine took one): correction WORKLOG 121 / PROGRESS 120,
story 122/121, prior 123/122, arith 124/123, loop 125/124, classify 126/125, today 127/126.
Shared files: a45 is touched by prior, arith and story; a27 by prior, story and classify; a29 by prior and today; a38 by correction and story.
Keep your edits local to your mechanism's functions and say in the handoff note exactly which functions you changed.
Before the final commit, merge the latest finished sibling fixer branch the coordinator names (if any), rebuild, rerun.
Save progress often: commit after every mechanism that is green (a session may stop at any moment; a half-done fixer is re-run from its last commit).
Commit trailers exactly:
Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LTrqtGrkuTiy1ttSUpLVCd
Final reply: commits, root causes (file:line), tests, bank results with reasons, suite result, not-done.

## Launch lines
- correction: P4 (stale-number mechanism) — a38 liveStale and retract.
- story: P5 (one stage, one problem) + the «still open» remainders it names — a45, a38 stage, a27.
- prior: P1 (prior-work ledger contract; roadmap §21) — a45 prior ledger, a27 turn question, a29 credit.
- arith: P2 (page arithmetic check; S1 D25-12 first) — a45 arithChk.
- loop: P3 (territory loop, unclear fit; S1 B25·D1 = D25-21 first) — a44 sys*.
- classify: P6 (opening, classification, post-check, register) — a27, a26 post-check (NOT AS.SYS), a43 register.
- today: P7 (Today, dossier, mind card, predictions) — a41, a40, a29.
Each also owns the «still open from earlier rounds» items of DECISIONS_R25 that fall in its files.
