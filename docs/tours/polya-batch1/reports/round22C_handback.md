## Round 22, runner C (s21–s29 + new prerequisite scenarios pC1–pC3): report

None of the 12 scenarios is defect-free. s21, s24, s26 and s28 are PARTIAL (only S3s, plus C22-1 in s21). s22, s23, s25, s27, s29 and pC1–pC3 FAIL.

The round-21 fixes mostly hold:
- **Routing:** 136 of 136 turns went to the right tier.
- **Practice:** a case can now be started from chat.
- **Corrections:** records built from two of her messages, and verdicts that rest on a corrected datum, now follow the correction.
- **Stability:** «تثبیت شد» no longer appears after a regression.
- **Today:** one line per act, with a lateness label.
- **Session dossier:** fixed.

What is new or still open:
- **Prerequisites:** a missing prerequisite is never diagnosed. The mind card books it as a weakness of a stage. «🧩 نقشهٔ پیش‌نیازها» is never offered.
- **Copies with other wording:** copies she typed with different words or units are still not asked «این‌جا هم عوض شود؟».
- **Multi-number ✏️ edit:** it garbles the statement.
- **Two regressions:**
  - The question after a step jumps to «گامِ بعدیِ تو چیست» (s21, s27).
  - s25's «۱۰ ⇒ ۸» correction no longer reaches the statement.

**How it ran**
- Build: main b70c1fe8, dist from 10:23; `build.py --check` was in sync.
- Harness: my round-21 harness6c.js. Prompts were mapped to round-21 replies by turn text, and I wrote a new reply wherever the prompt or the round-22 rules changed it.
- Clock: the in-page dev clock (`APP.clock.set`), with the same dates as round 21.
- The container restarted mid-round, so every scenario without a complete run (s22, s23, s25, s29, pC1–pC3) was rerun from scratch. s21, s24, s26, s27 and s28 had complete runs before the restart.
- My own mistakes (class d, not defects):
  - Some saved replies carried stale problem/case ids from an earlier attempt; those runs were redone.
  - A hung harness sometimes kept running after an exit and did not restart; drive.py now kills it and restarts.
- All 12 scenarios end with `{"exit":true}`, have findings.md and DONE, and their e-mails were sent (subject «🧭 پولیا · دورِ ۲۲ · …», storyboard link C). Profiles are deleted and none of my processes are running.

**Results**
| sid | result | defects |
|---|---|---|
| s21 | PARTIAL | C22-1, C22-2, C22-11 |
| s22 | FAIL | C22-5, C22-7, C22-13, C22-14, C22-15 |
| s23 | FAIL | C22-4, C22-5, C22-8, C22-9, C22-10 |
| s24 | PARTIAL | C22-11 |
| s25 | FAIL | C22-5, C22-6, C22-12, C22-16 |
| s26 | PARTIAL | C22-2, C22-11 |
| s27 | FAIL | C22-1 |
| s28 | PARTIAL | C22-2, C22-11 |
| s29 | FAIL | C22-2, C22-4, C22-5, C22-9 |
| pC1 (math, 1 prerequisite) | FAIL | C22-P1, P2, P3, C22-4 |
| pC2 (science/life, 1 prerequisite) | FAIL | C22-P1, P2, P3 |
| pC3 (several nested prerequisites) | FAIL | C22-P1, P2, P3, P4, C22-11 |

**Defects** (repro and file:line in round22C/defects.md)
- **C22-1 (S2, b, regression):** after recorded or proven steps, the page asks «گامِ بعدیِ تو چیست — …».
  - In s21 p7 her message already gave the next move and her prediction.
  - In s27 p6 she asked «به نظرت درسته؟» about her three steps; round 21 asked «هر گام را وارسی کن».
  - Where: a38/a27, the turn question after a step outcome (the A21-2 change).
- **C22-2 (S3, b):** the said:result compensation says «پیامش نشانِ نتیجه دارد» and quotes the problem statement. Seen in s21 p6, s26 p2, s28 p2 and s29 p7.
- **C22-3 (S3, b), prompt scan:** the line «- بازنگری: … پیشنهاد بده («می‌خواهی تمرینش کنیم؟»)» is a question directive not marked as context. Where: a41 promptBlock.
- **C22-4 (S2, b):** three kinds of message are misread, and the turn question becomes «کلِ مسئله را در یک جمله…» or «چطور می‌آزمایی‌اش؟». Where: a26 statesProblem / chatFocus and the a27 guess detector.
  - A practice request, or a «keep what I learned» request, is taken as a new chat problem (s23 p7, s29 p8, pC1–pC3 p11).
  - A practice self-rating («فکر کنم خوب گفتم», «شاید ۴۰٪») is taken as a guess (s23 p9, s29 p10).
- **C22-5 (S2, b; C21-3 persists):** copies she typed with different wording or units are not asked. Where: a38 sameFact and the copy candidates.
  - s23: her step outcome «کیک با ۸ تخم‌مرغ», and lpPrMeasure «۲۵ سانتی‌متر × ۳۵ سانتی‌متر».
  - s22 ✏️: her outcome «دفترِ نگهبانی تأیید کرد».
  - s25 ✏️: her look-back text lpBOther.
  - s29: d1 «محیط ۴۰ متر», lpOne, the condition and lpAuxT.
- **C22-6 (S2, c, regression):** s25 C3 «۱۰ تاشو چک کردم ⇒ ۸» does not change the statement. The page says «از آن بخش چیزی ثبت نشده بود».
- **C22-7 (S3, c):** the result JSON keeps the note «از آن تکه رکوردی ساخته نشده بود» even when changed[] is not empty, and once has an empty item {rec:«کارنامه»} (s22, s29).
- **C22-8 (S2, c):** a ✏️ edit changing two numbers in one message (s23 N5) breaks in three ways. Where: a38 multi-fragment substitution, copyAsk, and a27 result agreement.
  - The statement becomes «۱.۵.۵ پیمونه شکر».
  - The copy-ask for data 3 shows old = new (پیمانه/پیمونه not substituted).
  - The ✏️ header and «# اصلاحی که صفحه انجام داد» contradict each other in the same prompt.
- **C22-9 (S3, b):** a corrected datum sets aside verdicts it cannot affect: «مربع بهترین است» is set aside although it holds for any perimeter (s29); the guess «۱.۷۵» is set aside although it is wrong for both pan sizes (s23).
- **C22-10 (S3, b):** in s23 the title does not follow the pan-size correction.
- **C22-11 (S3, b):** chat guesses never get an outcome. In s21, s24, s26, s28 and pC3 the session dossier still says «هنوز آزموده نشده» after she refuted, proved or tested them.
- **C22-12 (S3, b):** the C145 question «برهانش؟» fires on a quoted or past «ثابت شد» after the proof exists (s25 p15/p16).
- **C22-13 (S3):** the post-check asks for a rewrite for «two questions» when the reply asked the page's own turn question, which itself has two «؟» (s22 p23).
- **C22-14 (S3):** deadlines are not among the retract candidates and have no dN id in the prompt. A passed deadline gets no «تحویل دادی؟» on Today.
- **C22-15 (S2, b):** in the running-list views, «ابهام‌های باز» cannot hold her hypotheses with probabilities (it shows «—»). Assumptions cannot be marked «باربر» or linked to the problem.
- **C22-16 (S3):** a models-shelf use in a new problem can only be logged through the old problem's box, so the record names the wrong problem. List items have no link to the problem or session, and there is no chat action to add to a list.
- **C22-P1 (S2, a/b):** a missing prerequisite is never diagnosed.
  - The coach answers with the generic stuck ladder; in pC3 it asked «حدست را بیازما» after she said she does not know how triangle area is computed.
  - There is no diagnostic question and the exact concept is never named.
  - At the end of the ladder the key idea is handed over without checking she knows it.
  - Where: no prerequisite branch in a27/a38.
- **C22-P2 (S2, b):** the mind card books the gaps as stage failures and names that stage weakest: «طرح‌ریزی ۱/۶ — ضعیف‌ترین ۸۸٪» (pC3), «فهمِ مسئله ۲/۶ — ۷۷٪» (pC2). Learning the prerequisite is not counted as progress. err_stage has no "prerequisite" cause. Where: a29.
- **C22-P3 (S2, b):** «🧩 نقشهٔ پیش‌نیازها» is an island: 0 maps across the three prerequisite scenarios, and nothing offers it.
- **C22-P4 (S2, gap):** «🧭 نقشهٔ مسیرِ مسئله» does not exist. pC3's nested detours (isosceles midpoint ⇒ Pythagoras ⇒ triangle area) and the returns are visible nowhere.

**Correction trials, round 21 ⇒ round 22**
| Scenario | Trial | Turns back / path | Round 21 ⇒ 22 |
|---|---|---|---|
| s22 | C1 receipt date | 1, chat, two facts, verdict | ✓ ⇒ ✓ |
| s22 | C2 guard log | 3, ✏️ | Partial ⇒ Partial (C22-5, C22-7) |
| s22 | C3 «امروز ⇒ شنبه» | 7, chat | ✓ ⇒ ✓ |
| s22 | C4 «صبح ⇒ ظهر» | 9, chat, composed record + her copy | Partial ⇒ ✓ (statement, set-asides, copy-ask, her «نه» kept) |
| s22 (new) | Deadline built from two messages | 7, chat | ✓ (date moved, title kept) |
| s23 | C1 eggs | 1, chat | Partial ⇒ Partial |
| s23 | C2 «۳۵ ⇒ ۴۰ دقیقه» | 3, ✏️ | ✓ ⇒ ✓ |
| s23 | C3 pan size | 9, chat, verdict | ✗ ⇒ nearly ✓ (unit copy, title, over-reach missed) |
| s23 (new) | ✏️ two numbers | 14, ✏️ | ✗ (C22-8) |
| s25 | C1 typo | 1, chat | ✓ ⇒ ✓ |
| s25 | C2 telescoping | 3, ✏️ | Partial ⇒ Partial |
| s25 | C3 «۱۰ ⇒ ۸» | 9, chat | ✓ ⇒ ✗ (C22-6) |
| s29 (new) | «۴۰ ⇒ ۴۴», copy with other wording + verdict-independent result | 11, chat, other problem | Statement and title ✓; copies ✗; verdict wrongly set aside |
| all | 9 non-corrections | — | 9/9 changed nothing |

The assistant never claimed a change before the page result.

**Routing:** 136/136 correct. Every opening problem turn went to lla_coach; ✏️ turns, «[سامانه]» follow-ups and «آره، بازش/ثبتش کن» went to lla_assistant; rewrites kept their tier. Table: round22C/routing.md.

**Practice from chat**
- **s23 (T28) and s29 (T41):** started from chat by start_practice with her quoted request. Days 1, 3/5, 7, a late session, a regression and day 21+ were run; sessions were logged both from chat (practice_log) and from the page.
- **Stability, against each technique's own text:** T41 «چرخه روز ۱، ۳ و ۷»: after the 40% session on 11 Aban the cycle restarted and a single success left the case «در حالِ تثبیت» (correct). T28 «۱ روز و ۱ هفته بعد»: after the regression, still «در حالِ تثبیت» (correct). C21-11 is fixed.
- **Today:** one case line per day with «عقب‌افتاده», and no duplicate lesson-card line (C21-12 and C21-17 fixed).
- **pC1–pC3:** a case opened after «آره، بازش کن».
- **Against:** C22-4.

**Running lists**
- **Life (s22):**
  - Assumptions: monthly review due ✓, but no «باربر» and no link to the problem.
  - Signal/noise: her recheck date returns on Today ✓.
  - Ambiguities: probability «—», her three hypotheses are lost (C22-15).
- **Math (s25):**
  - Models shelf: real uses counted by day, 2 of 3 days, «نامزد», weekly review on Today ✓; the use in a new problem is mislogged (C22-16).
  - Mistakes folder: monthly due ✓, no link.
- **Not covered:** Pareto had no natural use in group C.
- **How she reached the lists:** only through the assistant's view list (model behaviour); no prompt rule routes her need to them.

**Prerequisites (roadmap §15–§16)**
- All three people reached the solution (8 solutions, 270 هزار, 6 bags), but through their own work and generic Pólya questions.
- The system:
  - never told a missing prerequisite apart from a knot or low ability;
  - asked no diagnostic question and did not check mastery;
  - kept no detour order;
  - did not connect 🧩;
  - booked the gaps as the weakest stage.
- What did work: the tunnel kept her place in the main problem, and she returned to it.
- «🧭 نقشهٔ مسیرِ مسئله» is absent (S2 gap).
- Rechecking the earlier scenarios with this lens: their stuck points were knots or overconfidence, not prerequisites. None was labelled «weakest», but stuck points are booked «−» with no cause recorded.

**Upgrades needed**
- A prerequisite branch: coach_state reports {prereq: concept, step, quote}; the page asks one diagnostic question, teaches only as far as this step needs, re-checks mastery, returns to the exact step, and logs it to 🧩 and a topic. The mind card records a cause for every stuck point, and learning a prerequisite counts as progress.
- «🧭 نقشهٔ مسیرِ مسئله».
- «Same fact» by meaning, including units and other wording; the model can name field:<id>.
- ✏️ substitution applied once to the original text.
- Dependencies from the model's stated basis for a verdict, not "all data".
- Chat guesses resolved by later verdicts.
- Running-list views that hold hypotheses with probabilities, «باربر», and a problem link; a chat action to add to a list.
- A «تحویل دادی؟» check after a deadline passes.

**PARTS.md («نسبت به دورِ ۲۱»)**
- **Better:** routing (136/136), practice case from chat, Today, session dossier, chat correction (composed records, verdict set-asides), «این‌جا هم عوض شود؟» for same-wording data.
- **Worse:** the tunnel's question after a step (C22-1); multi-number ✏️ (newly tested).
- **New evidence:** five running lists (assumptions, signal/noise, ambiguities, models, mistakes) and deadlines.
- **Islands or missing:** 🧩 prerequisite map (island), route map (missing).
- **Same:** problem dossier, chess board and formulas.

Everything is in `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22C/`:
- `defects.md`
- `routing.md`
- `PARTS.md`
- `NOTES.txt`
- `<sid>/findings.md`, `mail.html`, `DONE`
- `<sid>/out/` (fin_*, part_list_*, part_practice_*, n5_*, pc_*, view_pre/post_*)

I also added a round-22 C line to `tour1_polya/STORYBOARD_LINKS.md`.