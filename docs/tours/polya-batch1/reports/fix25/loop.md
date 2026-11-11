# Round-25 fixer «loop» (P3) — hand-back (2026-11-11)
Branch worktree-agent-ad1aba092c419f271, final commit 1211afac (base eeb11d1f). Docs WORKLOG 125 / PROGRESS 124 (the three handbook-gate
failures on its branch are only the number gap until 121–124 merge).
Root causes (all in src/app/a44_route.js):
1. S1 first half — flat scoring in rank: every shared word counted the same (sheet-title and view-name words, stem fragment «آر»). Now
   three weights (zero: generic list, «دستیار», dfWide, fragments; low: words spread across the systems and words of a cited view/area name,
   with the C2 exception; full: the rest). «رسید» needs a full-weight word from her own step, at least two full words, no tie, and a score
   above anything she already rejected; less ⇒ ask; zero overlap ⇒ mismatch.
2. S1 second half — her «نه» after an arrival was ignored (PRE.sysFit handled only a pending ask). Now herNo: back to waiting, the note
   that reopens the sheet, Today line «⏸ گامِ … دوباره منتظرِ برگهٔ #n است»; the page reads the rejection itself (noFitSpan); C5 takeBack.
3. Ask and verdict in the same pass: a pending ask blocks every other outcome; a tie names the rival in the question.
4. Lag line only when the reply names a build not in this version and not ruled out (C4). 5. ⚠️ line now carries its reason.
6. Duplicate waiting rows: evHome moves events, one entry per sheet. 7. Piece brought after closure gets a `late` entry (lateScope/sysScope).
Tests: tests/test_tour1_r25_loop.js (bank 12/31 + 25 errors on base ⇒ 31/31, 0); negative arms of the waiting loop included; r24 loop 27/27
and r23 prereq 37/37 unchanged. Bank P3 31/31 (#113 only through the model's sys_fit report; #124 with the sheet title from #108's context).
Suite 135/135 one at a time on the final build.
Open: kept the existing R6 two-word rule on top of the step-specific word (C3 deviation — see C14); a late piece without gap.step gets no
entry (asking «برای کدام گام؟» not built); the spread measure counts the six systems' areas only, not the epistemology territory; swN ids
not unique across two chat problems in one session's event log (predates the round).
