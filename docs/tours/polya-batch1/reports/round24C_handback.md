## Runner C, round 24: report

**Overall:** all 18 scenarios ran to `{"exit":true}`, each with findings.md and DONE. All 18 e-mails were sent to <owner-email> through Gmail (`mail.html` and `mail.sent` sit in each scenario folder). The «دورِ ۲۴ C» line was added to STORYBOARD_LINKS.md. Browser profiles were deleted, the tC1 scratch page was removed, and the ai/ folders were kept. The repo was not touched.

Folder: `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24C/` (`defects.md`, `PARTS.md`, `routing.md`, `NOTES.txt`, `<sid>/findings.md`, `<sid>/better/`).

### Results per scenario
- **PASS (2):** s26, s27.
- **PARTIAL (6):**
  - s24 (C22-11)
  - s28 (C24-7, C22-2, C22-11)
  - s29 (all S3)
  - pC1 (C24-2, C24-4, C24-17)
  - pC2 (C24-4)
  - pC3 (C24-16, C23-13)
- **FAIL (10):**
  - s21 (C24-1)
  - s22 (C22-5)
  - s23 (C24-12)
  - s25 (C24-5)
  - aC1 (C24-1)
  - aC2 (C23-11)
  - aC3 (C24-8)
  - aC4 (C24-8)
  - tC1 (C24-14, C24-8)
  - oC1 (C24-8, C24-11)
- **Against round 23:** round 23 had 1 PASS / 6 PARTIAL / 10 FAIL out of 17. This round has 2 PASS / 6 PARTIAL / 10 FAIL out of 18.

### New defects (round 24)
Files are under `apps/learning-architecture/src/app/`.

**S2:**
- **C24-1 (a, S2)** — an opening that starts with a self-introduction gets «هنوز مسئله… نیست» and no «# پیش‌نیاز». s21 is also routed to lla_assistant. The «پروندهٔ تازه» line in the same prompt already has the correct statement.
  - Evidence: s21 p1, aC1 p1.
  - Location: a27_tour.js (chat-problem detector), a44_route.js PRE.scope.
- **C24-5 (a, S2)** — a new conjecture made during the look-back becomes only a 🔭 note («مسئلهٔ زنده ساخته نشد»). After that the coach says there is no problem in play. The typo fix she sends does not reach the note's statement.
  - Evidence: s25 p8–p10.
  - Location: backPend in a38_live.js.
- **C24-8 (a, S2)** — the turn question stays the stale u1 «به مجهول نگاه کن…» after answers, a plan or a result. Chat answers given before live_new are not imported, and the live stage stays «فهم».
  - Evidence: oC1 p6/p7, aC3 p6/p9, aC4 p7, tC1 p10/p12.
  - Location: a27_tour.js:1383, a38_live.js.
- **C24-11 (a, S2)** — after the «۱۵⇐۱۲» correction, the «از گفت‌وگو» drafts and the 🧭 destination still show 15. The draft also swallows his meta-question.
  - Evidence: oC1 p2/p10.
  - Location: a38_live.js, a44_route.js.
- **C24-12 (a, S2)** — a two-pair ✏️ corrupted the guess «۱.۷۵» into «۱.۵.۷۵» and then «۱۲۰».
  - Evidence: s23 p15.
  - Location: a38_live.js:4595.
- **C24-14 (a, S2)** — territory negative arm. A routine reply that does not answer the step was declared «🛎 ابزارِ لازم آمد». The cause:
  - namedItems scans the assistant's own filing note, so it picked up the ruled-out pr_hypothesis_testing;
  - fits takes shared words from the gap's own negated text («اقناع، تعهد»).
  - Evidence: tC1 #102, #103.
  - Location: sysSheet/fits in a44_route.js / a26_assist.js.

**S3:**

| Id | Class | Defect | Evidence | Location |
|---|---|---|---|---|
| C24-2 | a | «سارام کلاس دهم…» stays in the chat statement | pC1 p1 | a27:2107 |
| C24-3 | b | correction backup block on an opening turn | aC1 p1 | a27 |
| C24-4 | b | the page's own composite question is flagged «دو پرسش» | pC1 p3, pC2 p3 | a27 post-check |
| C24-6 | c | correction `why` has empty quotes | s22 p9, s23 p8/p15, oC1 p8 | a38 |
| C24-7 | b | «بعدش چی کار کنم؟» is read as naming the unknown, so no turn question | s28 p7 | a27 |
| C24-9 | b | re-check after a correction is dropped as «فرمِ فهم کهنه است» | s22 p12, s23 p12 | a27 |
| C24-10 | b | «ببینم» is read as a «تو» sign | aC4 p5 | a27 SIGN_TO18 |
| C24-13 | a | a kind=fix sheet about the page becomes a waiting step of his problem | oC1 p11 | sysOpen in a44 |
| C24-15 | b | the noun «روتین» is read as a «شما» sign | tC1 p17 | a27 SIGN_SH |
| C24-16 | b | the return post-check rejects a correct natural return and demands a heavy template, even for a child | aC1 p5, pC3 p10 | a27 |
| C24-17 | c | 🧭 shows «مانده: طرح هنوز نیست · ۰ از ۴» after the problem is solved | pC1 | a44_route.js |
| C24-18 | a/c | the adult-normed MaRs-IB «🧩 معمای امروز» is offered to a 9-year-old with «پاسخت… مقایسهٔ منصفانه با آن‌ها» | aC1 | psy_item / a29 |

**Minor S3 in a43_age.js:**
- two birth confirmation lines («تاریخِ تولدت…» and «تاریخِ تولد…»);
- an ISO Latin date in a child's chat;
- the first line to an 81-year-old uses «تو»;
- s21 says «از تاریخِ ثبت‌شده» when only an age was given.

**My own errors (class d):**
- **Reruns:**
  - pC1: a new soft gate blocked the plan-form replay, so I reran it;
  - tC1: my reused TRIZ reply had no gap.step, so I reran it.
- **Correctly caught by the page's post-check:**
  - s22 p25 and pC1 p6 had two «؟» in my reply;
  - aC4 p1 and tC1 p2 had a wrong quote.
- **Other:**
  - tC1: I did not send plan_done, so «امروز» still asks about the done plan;
  - s29 p10: I booked a practice failure as ph b with fail:true.

### Upgrades needed (ارتقای لازم)
1. Use one chat-problem detector, the same stripping «پروندهٔ تازه» already uses, for the coach context, the prerequisite block and routing.
2. Advance the live stage from said/result/plan, and import chat answers given before live_new into the answered ledger.
3. Push corrections into the «از گفت‌وگو» drafts and the route destination.
4. Make ✏️ replacement number-boundary-aware.
5. In the territory loop:
   - read only the routine's reply;
   - make the match negation-aware;
   - exclude areas the diagnosis ruled out.
6. Calibrate the post-check:
   - count the page's own composite question as one question;
   - detect register signs from verbs only;
   - accept a natural return to the waiting step.
7. In the look-back, turn a conjecture she is actively testing into a live problem.
8. For under-18s, give the puzzle a «فقط روندِ خودت» line, or use a child item.

### Round-23 defect table
| Id | Status | Evidence |
|---|---|---|
| C22-2 | STILL | s21 p6, s29 p7; new occurrence s28 p5 |
| C22-5 | CHANGED | fixed: s23 p12, s29 p12; still: s22 p9, s25 p11 |
| C22-11 | STILL | s21, s24, s28; fixed in s26 |
| C23-1 | CHANGED | bold A191 line gone; coach block still suggests u1/b1 (s29 p9, s23 p10); fixed for the model-use report (s25 p17) |
| C23-2 | FIXED (partly) | pC1–pC3, tC1 (sys 4); still for stucks before diagnosis (aC1) |
| C23-3 | FIXED / CHANGED | pC1–pC3 p1 fixed; self-intro openings → C24-1 |
| C23-4 | CHANGED | → C24-12 |
| C23-5 | STILL | s25 p12 |
| C23-6 | FIXED (not seen) | |
| C23-7 | CHANGED | item quote accepted; consent quote from the previous message refused (s22 p21) |
| C23-8 | FIXED | aC1–aC4 |
| C23-9 | FIXED | |
| C23-10 | FIXED | aC2 p2 |
| C23-11 | CHANGED (partly) | 🧭 and forms fixed: oC1 p9, pC1, aC2–aC4, tC1; turn question → C24-8; aC2 look-back form still re-asks |
| C23-12 | CHANGED | aC1 is stripped; «سارام» → C24-2 |
| C23-13 | CHANGED | labels are full, but each prerequisite repeats three times and labels overlap |
| C23-14 | FIXED | |
| C23-15 | FIXED | |
| C23-16 | CHANGED | fixed for the chat statement (oC1 p8); still for the live record (oC1 p16) |
| C23-17 | CHANGED | fixed when the check is in the same message; still when it was one turn earlier (aC4 p9, aC3 p12, tC1 p13) |
| C23-18 | CHANGED | built: positive ✓, sys_done ✓, mismatch ✗ (C24-14) |
| C23-19 | CHANGED | aC2 ✓; s21 → C24-1 |
| C23-20 | FIXED | s25 p17 |
| C23-21 | FIXED | tC1 p3, aC4 p2 |
| C23-22 | FIXED | oC1 p18 |
| C23-23 | FIXED | |

### Age verdicts (Jalali checks)
Every stored date matches the ICU Persian calendar (checked with node Intl).

| Scenario | Age / band | Invalid day | Valid entry | Chat entry | Problems |
|---|---|---|---|---|---|
| aC1 | 9, child | «۴۱ فروردین ۹۶» → «۳۱ روز دارد» | «۱۴ فروردین ۹۶» → 2017-04-03 | «1396/01/14» idempotent (p10) | C24-1, C24-18, duplicate lines |
| aC2 | 16, teen | «۳۱ بهمن ۱۳۸۸» rejected | «1388/11/02» → 2010-01-22 | «۲ بهمن» (p9) ✓ | — |
| aC3 | 67, elder | «۳۱ اسفند ۱۳۳۷» → «۳۰ روز» (leap year) | — | p2 «۲۵ اسفند ۱۳۳۷» saved before the reply → 1959-03-16; «1337/12/25» idempotent | C23-8 FIXED |
| aC4 (new) | 81, elder | «۱۳۲۴/۰۷/۳۱» → «مهر ۳۰ روز» | «1324/05/10» → 1945-08-01 | two-digit «۱۰ مرداد ۲۴» ✓ | first confirmation line in «تو» |

- «# مخاطب» appeared in every prompt.
- The mind card shows «سن: N سال», with no comparison where no valid norm exists.

### Territory loop (tC1)
- **Positive arm: PASS** (#104, day 6).
  - The «ابزار آمد» syscard and «🛎 ابزارِ لازم آمد» in Today both appeared.
  - The resume turn ran and she took the step.
- **Arm where the reply does not answer the step: FAIL, 0/2** (#102 hypothesis-testing, #103 persuasion; C24-14).
- **sys_done arm: PASS** (#101 «از راهِ دیگری برداشته شد ✓»).
- **Shots:** w101–w104, other101, mis102, mis103, arr/res103, today_arrived, tool_area, and route_* with hover, across 🔭/🧭/📜.
- **How the build was simulated:**
  - a scratch dist copy with area `dc_customer_validation` added to SYS_TERR s_decision;
  - the harness switched to it with `__setPage` / page.path;
  - the routine's reply was put in `sheets/sh104.json`;
  - #102/#103 replies named only `sc_persuasion`.

### Chat⇄page
«از گفت‌وگو: … — درست است؟ ✓ درست است ✏️ ویرایش» appeared in oC1 (p9), pC1, aC2, aC3, aC4 and tC1.
- **Route map at three or more moments:** oC1, tC1 (18 shots), pC3, aC1–aC4.
- **Stage advanced from chat:** oC1 and tC1 («اکنون: اجرای طرح», plan steps «(از گفت‌وگو)»).
- **«Nothing asked twice»: FAIL.** The turn question re-asks u1 (C24-8) and the aC2 look-back form re-asks answered items.

### Owner bank (questions 9–12)
| Question | Verdict | Where / how |
|---|---|---|
| 9 | هست | tC1 p8–p21: filed → waiting → built → noticed → resumed; explained at oC1 p14. Caveat: C24-14 |
| 10 | هست | oC1 p10: the method is page-side and independent of the model; the page checks every reply; whether models were benchmarked is «در اطلاعاتِ من نیست» |
| 11 | هست / نیست | oC1 p14: the page works offline («خودِ سامانه»); local-model work is not in the assistant's information |
| 12 | هست | tC1 p22 and oC1 p17: an honest yes, naming the gaps |

### Routing and prompt scan
- **Routing:** 232/233 correct; the only miss is s21 p1 (C24-1). Consultant turns go to learning_architecture.
- **Strict prompt scan:** 0 prompts with more than one question directive.

### PARTS summary
- **Much better:**
  - the prerequisite layer;
  - stuck causes on the mind card;
  - Jalali age handling;
  - forms and 🧭 filled from chat;
  - the territory loop now exists.
- **Regressions:**
  - self-intro openings (C24-1);
  - conjecture during the look-back (C24-5);
  - four post-check false positives (C24-4/10/15/16).
- **Still open:**
  - the turn-question stage (C24-8);
  - spreading corrections (C24-11/12, C23-5);
  - C22-2 and C22-11.

### Dataset
- Every findings line carries p<N>.
- `better/` files (first line `# author: runner-simulated`) exist in s21, s22, s23, s25, s28, pC1, pC2, aC1, aC4, tC1 and oC1.
- **Look-back / multi-day scenarios:** aC2 (day 3), aC3 (Aban and Azar), aC4 (1 Azar), oC1 (one week), s25, pC1.

### New owner-like questions for the bank
1. If a tool the system built doesn't actually fit my need, will it notice — or tell me «it arrived» anyway?
2. When I introduce myself in my first message («من آرینم، کلاس سومم…»), does the system still treat what follows as my problem from turn one?
3. If I fix a number days later, does every draft, form and map destination that came from that message change, or only the title?
4. If I invent a new pattern while reviewing a solved problem, can I keep working on it as a real problem right away?
5. Does a child see only age-appropriate puzzles, and never a comparison with adults?
