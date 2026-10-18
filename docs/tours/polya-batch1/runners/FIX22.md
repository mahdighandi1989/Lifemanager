# Round-22 fixer brief (common)
Repo /home/user/Lifemanager, you are in a git worktree. FIRST: `git merge e3fcb898` (the integ-age head: round-21 fixes + age package).
Commit on your worktree branch only; never push; never touch main.
Read: CLAUDE.md; apps/learning-architecture/AGENTS.md (edit only src/, then `python apps/learning-architecture/build.py`; tests load
apps/learning-architecture/dist/learning-architecture.html, so ALWAYS rebuild before a test); experiences/ (model-reports-state-page-validates,
two-sided-needs-judging…, one-clock-one-scheduler…, age-aware-norms…); the binding tour1_polya/DECISIONS_R22.md (your mechanisms are named in
your launch line); the reports tour1_polya/reports/round22{A,B,C,D}_handback.md and the per-scenario findings they cite;
docs/decisions/2026-10-15-sources-roadmap.md §14–§16; handoff notes docs/overhaul/handoff-notes/_pending_tour1_R21_*.md and _pending_age_*.md.
Root causes only. Proof: red-first node tests tests/test_tour1_r22_<yourname>*.js built from the runners' own sentences, PLUS every entry for
your mechanisms in the independent bank tour1_polya/VARIANTS_R22.json (it is being written in parallel; poll between steps, no foreground
sleep; copy it to tests/variants/). All existing tests and banks R17–R21 stay green. An old assertion changes only where DECISIONS_R22
replaces it, with a comment. Quarantine, never delete (REMOVAL_CANDIDATES). No conventional numbers. Age-aware wording (the «# مخاطب» block) stays intact.
Whole page suite green (temporary node_modules symlink to /home/user/Lifemanager/apps/learning-architecture/node_modules, never committed);
`python -m pytest tests/test_learning_architecture_handbook.py tests/test_supervisor_ownership.py -q`. Docs: your WORKLOG/PROGRESS numbers
from DECISIONS_R22, HANDBOOK rows, AUDIT_LOG, handoff note docs/overhaul/handoff-notes/_pending_tour1_R22_<yourname>_2026-10-18.md
(contracts for the other fixers). Before the final commit, merge the latest finished sibling fixer branch the coordinator names, rebuild,
rerun. Commit trailers exactly:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01LTrqtGrkuTiy1ttSUpLVCd
Final reply: commits, root causes (file:line), tests, bank results with reasons, suite result, not-done.
