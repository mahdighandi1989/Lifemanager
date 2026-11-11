# Round-25 fixer «classify» (P6) — hand-back (2026-11-11)
Branch worktree-agent-a9e88cb9de6261b5c, final commit 67597c2a (base eeb11d1f). Docs on its branch 121/120 — renumber to 126/125 at merge.
Root causes and fixes:
1. C25-2 (S2) a26 follow-up in turn(): «چیزی پر نکن و دکمه‌ای نزن» banned every button on a field-less view; now her own action request
   (AS.wantsAct25) allows «همان یک دکمه»; the follow-up names the open tab (D23-35).
2. C25-11, A24-10 a27 stripIntro23 assumed one sentence shape; idPrefix25 reads a chain of identity clauses; an age that is data stays.
3. Register (A23-14, U33, C25-3, D25-23, D23-38) a27: the register was applied only at paint; regStore25 + S.put hook store what is shown
   (text0 = raw); page labels follow the register, her own words never; under 18 ⇒ «تو» unless she uses or asks for «شما».
4. Post-check (A25-17, D25-14): hypothetical quotes, TeX quotes of her formula, plural «دارید», new «two registers in one reply» rule.
5. D25-13 (S2) a38 liveReqSignals: a request by meaning («مثلِ یه مسئلهٔ واقعی پیگیری کنم») is req+now.
6. Two-question page questions and the repeated «این گام جواب نداد؟»: final gate AS.finalFilter25 (one «؟» per page turn question /
   suggestion line); ladder failure rung only after a failed step, once per outcome.
7. «n!» is factorial, not a sentence end (a26 bidiNodes, a45 split regexes). 8. D23-30, D23-35, A23-26.
AS.SYS untouched; previous rules quarantined (AS.R25_QUARANTINE, A.R25_QUARANTINE).
Tests: tests/test_tour1_r25_classify.js (bank 13/28 on base ⇒ green); bank P6 29/29; five old assertions changed with a DECISIONS_R25
comment (test_fixes_1015c, test_tour1_assist, test_tour1_r5_live, test_tour1_r5_coach, test_tour1_r6_coach — they expected the two-«؟»
wording). Full suite one at a time before three later small changes; after them 88 files rerun green — the merge gate covers the rest.
Contracts: never match a stored sys line by its «تو» wording; a test expecting a registry question verbatim compares with AS.oneQ25(q);
an exhausted ladder gives q = "".
Not done: A23-6 and A23-19 (turn-question/stage choices — prior/story); A23-10 (a41 practice); A25-11 second half (needs a39 display);
A23-14 «second birth line» not reproduced; register of fixed form texts in page views outside chat/«امروز» still «تو»; the one-question
gate joins book questions into one sentence; «۵!» with Persian digits not treated as factorial; D23-10/-11/-12, A23-8/-25, A22-11,
A21-11, C22-5, C22-11 not in P6 files.
New experience: experiences/display-transform-at-write-not-only-at-paint.md.
