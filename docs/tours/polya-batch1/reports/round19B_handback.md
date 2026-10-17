Round 19, runner B (s11–s20): 4 of 10 scenarios have zero defects (s11, s15, s17, s20). The other 6 fail on 2 S2 and several S3 defects, all class b. Every round-18 defect in my set is fixed except R18 B·D7 (a deferred request lost when coach_state is omitted), which is still open. The batch cannot end.

Every scenario dir has findings.md (starting with «## خلاصه برای مالک», with «## نقشهٔ نیاز» and «## ارتقای لازم») and a DONE file. All 10 e-mails were sent to the owner (RUNNER16 structure, subject «🧭 پولیا · دورِ ۱۹ · …», storyboard link B). Every run ended with {"exit":true}, so the before/after shots exist. strict.py found no prompt with more than one unmarked question directive. No developer notes reached a prompt. The formula line fired only on real math: not on «۵۰-۱۰۰ هزار تومن», «۵ حرفی» or the weight series. All browser profiles are deleted and none of my processes are running.

Base directory: /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round19B/

**What I changed in the replay** (each change is in that scenario's `apatch/` or `ovr/`; the method note is in each findings.md):
- coach_state fields were added only where her message carried them:
  - guess.q in s11, s11d, s12, s13, s14, s16 and s20 (and their variants). Where my reply had no question testing the guess, I gave no q.
  - plan "next-session" in s14/s14o p7.
  - step in s19 p3 («مهمونی بود، یه کیلو هم اضافه کردم»).
- s11 p2 was rewritten, because the phase card is now correct.
- s12 p4 coach_state was corrected to ph:e, said:[plan,result]. My round-18 answer there was wrong.
- s19 c28 now carries her weight log, to exercise the new plot.
- New probe s20t: s20 with a two-column results table at c4.

**Results**
- s11: **PASS**, zero defects. R18 D1 is fixed: the formula inside a claim stays in «فهمِ مسئله». Previews show under every field. Guess notes sit on the q option (s11d too).
- s12: **FAIL**. 1 S2 (D3) and 2 S3 (D4, D5). R18 D2 (note on the wrong option) is fixed.
- s13: **FAIL**. 2 S3 (D4, D5). The R18 latent register issue is fixed.
- s14 (with s14o): **FAIL**, 1 S3 (D4, in s14o only); the main path has zero defects. R18 D4 (window start) and D11 (bold) are fixed. The next-session plan is stored and shows in Today.
- s15: **PASS**, zero defects.
- s16 (with s16o): **FAIL**, 1 S3 (D7, in s16o only). R18 D6 is fixed on the main path.
- s17: **PASS**, zero defects.
- s18: **FAIL**, 1 S3 (D4). R18 D2, D3 and D10 are fixed, and the mind card is now plausible.
- s19 (with s19o): **FAIL**. 2 S2 (D1, D3) and 2 S3 (D2, D8). The weight-log plot is correct.
- s20 (with s20o, s20x, s20t): **PASS**, zero defects. R18 D1–D3 are fixed (g_EE, g_PV-E, τ_I, mind card). The table plot is correct.

**Defects**

D1. S2, class b (s19, s19o). An open real step is labelled an «unproved intuitive step» in the live prompt.
- The p3 prompt says «پیش از «حل شد» باز مانده: گامِ شهودیِ ثابت‌نشدهٔ «این هفته و … شامِ سبک…» — مسئلهٔ کمکی حل شد ≠ مسئلهٔ اصلی حل شد.» She was about to quit a diet step; there is no auxiliary problem and nobody said «حل شد».
- Cause: the new open-step gate items (a38_live.js:2290) go through a mapping that only knows aux and intuitive (a38_live.js:3667).
- Repro: s19 c1–c18, then read ai/p3.json.

D2. S3, class b (s19). A step outcome reported in chat is accepted but invisible.
- The model's step report at p3 was accepted («✓ … از گفت‌وگو نگه داشته شد»). It is stored only as `st.chatRep` (a38_live.js:2201–2206) and applied only at «✅ حل شد» (:2174).
- At c19 the execution form asks for the same step with empty fields. She has to report the setback twice, and both versions are kept.

D3. S2, class b (s19, s12). The mind card books events to the wrong stage or not at all.
- s19: the one party setback is counted twice (chat fail plus step outcome). Her week-8 milestone is not counted, because chat results are skipped in live-bound sessions (a27_tour.js:2419). The card names execution weakest at 67%.
- s12: a refuted anagram guess in a turn without coach_state is booked as an understanding failure. A plan+result turn leaves no event. The card shows «طرح‌ریزی: هنوز داده‌ای نیست» and names understanding weakest at 67%.
- Location: a27_tour.js:2390–2421.

D4. S3, class b (s12, s13, s18, s14o). The deferred-request candidate line (deferCand, a27_tour.js:3021–3037) fires on non-requests and misses the real one.
- False candidates:
  - s18: «… V با سرعت ۵ کم می‌شه.» — «می‌شه» ("becomes") is read as the polite «میشه…؟».
  - s12: «رمهب‌ستان؟», her own trial.
  - s13: her answer to the assistant's question, which the reply had already covered.
- Missed (s14o): «اثبات‌ها به چه درد من می‌خوره؟» is treated as covered because the reply quoted it while deferring it. The line shows «دقیقه‌ی اول؟» instead.

D5. S3, class b (s12, s13). The guess note is hard-coded as «(حدسِ تو: …)» even in a conversation held in «شما» (a38_live.js:2876, 2941).

D7. S3, class b (s16o). Without a register report from the model, the fallback flips to «شما».
- regIn counts only the assistant's own forms. REG_TO_AI does not count «تو» imperatives (نگو، بپرس، صبر کن), and her own «باورت» is not read.
- One «می‌پرسید» from the assistant flips the p5 prompt to «شما» (a27_tour.js:2600–2608).

D8. S3, class b (s19). The plot's order-index axis uses Latin «1»/«5» while the y labels are Persian (a39_math.js:585, `String(v)`).

**«ارتقای لازم»** (tools the person or the part needed and the system lacks)
- Render formulas in saved views too: the step list, the statement header, saved plan text. (s11)
- A crossword/anagram letter grid with crossing letters filled. (s12)
- A rehearsal space for the hard conversation she decided to have. (s13)
- A «which formula when» practice generator built from his own handout. (s14)
- A printable wall card of the question ladder, and a multi-student role-play mode. (s15)
- A short parent card for the next homework night. (s16)
- A units-aware calculator in the plan and step fields, and local rainfall data. (s17)
- A «vary the quantity» simulator for related rates. (s18)
- A weight log kept inside the life problem, with a trend line against the backward-chain milestones; the second plan as a first-class alternative. (s19)
- A kept simulation-results table with sort/threshold views, and axis names taken from her header. (s20)

**Mind-card plausibility (before/after)**
- Plausible: s11, s13, s14, s15, s16, s17, s18, s20.
- Implausible: s12 and s19, both because of D3.

**Harness notes (not defects)**
- The page.evaluate errors in s11, s13 and s19 are my own probes, the same as in round 18.
- I accidentally re-launched one harness on the finished s16 dir. It was killed, and nothing was written: the ctl count stayed at 7.