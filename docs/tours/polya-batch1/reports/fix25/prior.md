# Round-25 fixer «prior» (P1) — hand-back (2026-11-11)
Branch worktree-agent-afe46fbc7edd4085f, final commit bf7f7c89 (base eeb11d1f). Docs on its branch 121/120 — renumber to 123/122 at merge.
Root causes (file:line on BASE25):
- Ledger replaced on every report — a45_story.js:241, :245. Now one ledger per problem, merged by step number or the same quote.
- Report request fired on mid-solve calculations and missed single-step openings — a45:618–631. Now only on the problem's opening with her
  own worked step (C7) or a message she calls her prior work; tested cases make no ledger.
- Opening turn question lost to A191 / guess / A073w — a27_tour.js:1430, :1449–1450, :1512, :1562; A.STORY.priorTurn reads the message
  before the reply and a `prior` moment outranks those.
- Replies read only as bare «آره» or leading «نه» — a45:332–348; readReply reads each clause (mixed replies, dispute without «نه»,
  «نه، بس نیست!» is not a dispute, a mistaken «نه» is withdrawn with history — C5).
- Dispute question never expired (reAt never set): a re-check lands on the ledger and the page; asked once (C6).
- Her own fix never reached the ledger: now from a prior:[{n}] report, the model's validated step/result, a retract, or her own «X، نه Y»,
  only if the page's check agrees (C8); a corrected datum marks the step and its dependants stale.
- Dependency by any shared number — now only the step's page-wrong number with the same counted noun.
- Coach-facing check line shown to the person; mind card ignored prior events (a29:385); RECALL22 dropped the whole turn; 🧭 «طرح هنوز نیست»
  despite numbered prior steps (a44:581); chat-solved problem re-asked the frame (new card «در گفت‌وگو به نتیجه رسیدی — ✅ حل شد — بازنگری»);
  tested-then-proved read as a guess; closed problem still showed a resume point.
Tests: tests/test_tour1_r25_prior.js (52 errors on base ⇒ 0); bank P1 49/49, 18 with a note for the part that belongs to another
mechanism or the model's reply (#0, #2, #3, #12 arith; #20, #42 correction; #1, #17, #27, #29, #34 other layers; #15, #19, #48 the model;
#5, #16, #44 equivalent shape; #41 weak: only «no negative event» asserted). Suite 136 files one at a time, all 0.
Not done: chat result chain after a datum correction (second half of C25-15, P4's); B25·D26 and B25·D24 (importChat, story's); the form's
own «جملهٔ کل = رونوشتِ صورت» gate in a38 unchanged; page-side reading of operands with words between (arith's); positive mind-card credit
for «مثالِ نقض زدم» (#41) not built; no real-model run of the prior:[{n}] contract.
Touched in shared files: onState (four spots), logEv, a38 coachCore (prior block only), a44 planLeft + one block in ROUTE.model, a29
source filter, a27 turnMoments/coachLines/notGuessMsg. NO24 quarantined.
