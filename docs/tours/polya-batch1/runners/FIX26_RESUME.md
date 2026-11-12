# Round-26 fixers — resume brief (after the 2026-11-12 pause)
You are a round-26 fixer resumed after a pause. Read FIX26.md (common brief) — it still binds in full — and then this page.
1. Your work so far is on your own branch (the coordinator names it in your launch line; restored from
   docs/tours/polya-batch1/fix26_pause/<name>.bundle if the container is new). Check it out in your worktree; do NOT start from BASE26 again.
2. Read your own commits (`git log BASE26..HEAD`, `git show --stat`) and any handoff note / WORKLOG entry you already wrote. A commit named
   «wip(fix26-<name>): snapshot at the owner's pause» is UNVERIFIED: review every hunk, finish or revert it in a new commit — never amend.
3. Re-read DECISIONS_R26.md «Clarifications after the independent bank» C23–C39: they were added while you worked. Re-run the whole
   independent bank T/VARIANTS_R26.json for your family against them; an entry that now disagrees with your earlier choice is fixed or
   reported with its reason.
4. Then exactly as FIX26.md: whole page suite one test at a time, the two pytest files, docs + handoff note, final reply.
5. The runner model changed (owner's decision): commits now end with the trailers in FIX26.md (Opus).
