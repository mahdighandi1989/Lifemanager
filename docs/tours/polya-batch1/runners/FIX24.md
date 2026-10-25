# Round-24 fixer brief (common)
Repo /home/user/Lifemanager, you are in a git worktree. FIRST: `git merge 3685102d` (branch head = main + backtest rounds 16–18 + round-24
records + the bank #87 date fix). Commit on your worktree branch only; never push; never touch main.
NEVER commit a tool link: the temporary node_modules symlinks (apps/learning-architecture/node_modules, frontend/node_modules) stay untracked.
Before every commit run `git status` and make sure no mode-120000 entry is staged (a fixer committed one in round 23 and it reached main).
Read: CLAUDE.md; apps/learning-architecture/AGENTS.md (edit only src/, then `python apps/learning-architecture/build.py`; tests load
apps/learning-architecture/dist/learning-architecture.html, so ALWAYS rebuild before a test); experiences/ (model-reports-state-page-validates,
two-sided-needs-judging… incl. its 2026-10-19 update on waiting loops, one-clock-one-scheduler…, age-aware-norms…); the binding
tour1_polya/DECISIONS_R24.md (your mechanisms are named in your launch line); the reports tour1_polya/reports/round24{A,B,C,D}_handback.md,
round24{A,B,C,D}/defects.md and the per-scenario findings they cite (round24X/<sid>/findings.md, better/rN.txt, ai/pN.json);
docs/decisions/2026-10-15-sources-roadmap.md §14–§21; handoff notes docs/overhaul/handoff-notes/_pending_tour1_R23_*.md.
Root causes only. Proof: red-first node tests tests/test_tour1_r24_<yourname>*.js built from the runners' own sentences, PLUS every entry for
your mechanisms in the independent bank tour1_polya/VARIANTS_R24.json (it is being written in parallel; poll between steps, no foreground
sleep; copy it to tests/variants/). Never hard-code a calendar date in a test expectation that will pass with time (bank #87 broke that way):
compute it from today or freeze the page clock. All existing tests and banks R17–R23 stay green. An old assertion changes only where
DECISIONS_R24 replaces it, with a comment. Quarantine, never delete (REMOVAL_CANDIDATES). No conventional numbers. The «# مخاطب» block stays intact.
Whole page suite green (run tests one at a time, never all at once); `python -m pytest tests/test_learning_architecture_handbook.py
tests/test_supervisor_ownership.py -q`. Docs: WORKLOG/PROGRESS numbers below, HANDBOOK rows, AUDIT_LOG, handoff note
docs/overhaul/handoff-notes/_pending_tour1_R24_<yourname>_2026-10-25.md (contracts for the other fixers). Numbering (next free on 3685102d;
routines may take numbers meanwhile — the coordinator renumbers at merge): correction WORKLOG 105 / PROGRESS 114, story 106/115, loop 107/116,
classify 108/117, age 109/118, today 110/119. Before the final commit, merge the latest finished sibling fixer branch the coordinator names,
rebuild, rerun. Commit trailers exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LTrqtGrkuTiy1ttSUpLVCd
Final reply: commits, root causes (file:line), tests, bank results with reasons, suite result, not-done.
