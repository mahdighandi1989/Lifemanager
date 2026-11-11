# Round-25 fixer «arith» (P2) — hand-back (2026-11-11)
Branch worktree-agent-aaeb0130088f6cc06, final commit aacd23b0 (base eeb11d1f). Docs on its branch carry WORKLOG 121 / PROGRESS 120
(gate refuses gaps) — renumber at merge to 124/123; HANDBOOK §12 row 70.
Root cause: a45_story.js arithChk (round 24) = one regex «expression = ONE number», floats with 1e-9 slack. The right-hand side was never
an expression (D25-12 S1, B25·D5); running sums, «۲ و خرده‌ای», leading «−» misread; units only length/mass/time; «درست» printed beside ✗.
Fix: new src/app/a46_arith.js (loaded after a45; replaces A.STORY.arithChk; old one quarantined as arithChkR24, REMOVAL_CANDIDATES):
both sides of every «=» parsed and evaluated, chains link by link, running sums only when the previous number sits right before them,
exact BigInt rationals, tolerance = C9 only, her own rounded number reused later in the same message is an interval, ✗ only when no natural
reading holds (ambiguous ⇒ silent), units (energy, power, volume, area, speed, stated factors, bare products whose operands carry units),
unreadable unit ⇒ «واحدش را صفحه نسنجیده» (C10), no «درست» beside ✗, later messages get a page-built prompt block «# حسابِ صفحه روی همین پیام».
a45 touched only in priorOf (three lines).
Tests: tests/test_tour1_r25_arith.js (56 errors on base ⇒ 0); bank P2 58/58 (#62, #63 running sums with words between numbers: only
«never flagged» asserted; #87 on 🔭 only; #107 part 2 is the prior ledger's). One round-24 assertion changed with a comment
(test_tour1_r24_story.js #160). Suite: 134/135 before the last four guard fixes (test_epi rerun green); after the final rebuild only a
subset was rerun — the merge gate covers the rest.
Not done: later-message check reaches the coach prompt only (writing into the prior ledger is «prior»'s merge); number words and
expressions with units between the numbers are not read, by design; no real-model run of the new block.
New experience: experiences/exact-arithmetic-check-of-a-persons-written-work.md.
