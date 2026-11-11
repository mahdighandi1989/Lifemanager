# Round-25 fixer «story» (P5) — hand-back (2026-11-11)
Branch worktree-agent-a13da105822b71cc2, final commit 54bdf348 (base eeb11d1f). Used WORKLOG 121 / PROGRESS 120 on its branch (the handbook
gate refuses gaps); renumber to 122/121 at merge after «correction».
Root causes (apps/learning-architecture/src/app/):
1. Sub-result ⇒ look-back (U10): a27 coach_state set ph="b" for every said:["result"]; coachPhase0 too. Now one judgement in a45
   (ST.subRes / ST.finOf): intermediate when she names a remainder, the prior ledger has a non-✓ step, or plan steps remain.
2. «اجرا» before a plan: a45 phaseOfItems; now needs a plan or a validated step (ST.planIdea). Old rule quarantined as ST.phaseOfItemsR24.
3. Second problem became data of the first (U13, owner bank #16): first prompt hook in a45 unbinds on «یه مسئلهٔ دیگه…»; own pk, stage, 🧭,
   📜; «# دو مسئله در این گفت‌وگو» block; return only by her naming; ST.keepSplit in a27 liveCtx + page-link hook and the a38 live-block hook.
4. New problem took the old one's result and stage: importChat cuts at the first sentence of the new problem (not25); ST.owns 4th arg;
   a40 own23 passes it.
5. Two stage sources in one prompt: a27 «# وضعِ کنونی» now reads A.liveTurnPhase.
6. Woken self-made problem asked u0: a38 coachCore.
7. A23-35 remainders (s10 p5 re-opened understanding; aA4 p5 whole result). 8. D24-9 remainder: a deadline promise with no «what» is not a plan item.
Tests: tests/test_tour1_r25_story.js (30 errors on base ⇒ 0); bank P5 24/24 (six with a note that part belongs to P1/P4/P6/register);
suite 135/135 one at a time; handbook + ownership pytest 14 passed.
Not done: no real-model run of the two-problems block; >2 problems in one conversation returns to the last split only; after her own fix of a
wrong prior step the stage moves one turn late unless «prior» marks the step fixed/ok the same turn; A23-6/-8/-10/-19/-25/-26, A22-11, A21-11
untouched (not named by P5); B_s D20 not examined.
