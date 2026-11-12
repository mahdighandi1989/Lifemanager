# Round-26 decisions — ROOT MECHANISMS (main session; binding)

Round 26 ran on main 1f93c333 (the seven round-25 fixers). Four runners on Fable 5.2 re-ran every round-25 scenario and added the
arithmetic arms, the new territory arms (frame-only, tie, take-back, piece after closure), the prior-work reply arms, and the
41-question owner bank. A fifth run, B_x on Opus, ran group B for the blind model comparison.

**Status of the evidence.** Group B's defects were verified one by one by the blind judge (`COMPARE26_judge.md`, U1…U68). The defects
of groups A, C and D are runner-reported and NOT independently verified. Every fixer therefore reproduces a defect as a failing test
before touching code; a defect that does not reproduce is recorded as «not reproduced» in the fixer's report, not silently dropped.

## Results
| Group | Scenarios | Zero-defect (strict) | S1 | Runner's own verdicts |
|---|---|---|---|---|
| A | 21 | 0 | 3 scenarios (one family) | 21 FAIL |
| B | 26 | 4 | 1 | 4 PASS, 22 FAIL |
| C | 20 | 0 | 0 as reported; 6 false ✗ re-rated S1 below | 11 PARTIAL, 9 FAIL |
| D | 29 | 0 (its 18 «PASS» all list S3) | 1 | 18 PASS, 10 PARTIAL, 1 FAIL |
| **Total** | **96** | **4/96** (round 25: 13/92) | two families | |

The strict count fell. Two things explain it and neither is hidden: the round added harder arms (every scenario now carries arithmetic,
dates and multi-problem turns), and the new exact-arithmetic reader (a46) has two S1 families of its own. Routing was right on every
turn in all groups (A 266/266, B 282/282, C 259/259, D 0 wrong).

## Severity made uniform (runners rated the same defect differently)
- **S1-a — correct work shown ✗ and told to the coach.** A26-1 (s01 p15, s04 p14, s09 p4), B_x D19 = U2 (pwB2 p9), D26-16 (arD1 p6),
  C26-9, C26-10 (pwC1, aC3), C26-26, C26-31 (aC2, pC1), A26-26 (aA2), D26-52 (aD3 p7). All S1, whatever the runner wrote.
- **S1-b — wrong work shown ✓ and told to the coach.** B26·D20 = U1 (pwB1 p11), D26-18 (arD1 p7: «۱/۲+۱/۳+۱/۴ = ۱», «یعنی ۲٫۷۵»).
  All S1.
- A wrong line that the page leaves silent (C26-11, B_x D6/D8, D26-24 incl. the real slip 79.7 vs 79.4) stays S2: the page did not
  mislead, it failed to help.

## Model comparison
Result: `COMPARE26_result.md`. Fable found 13 real S2 and missed one (U13); Opus found 8, missed none, and never exercised six. By the
letter of the pre-set rule Fable fails; the rule did not count «not exercised», which was my design error. Decision: Fable stays as
the runner, stated openly as a deviation, reversible by the owner, with three compensations binding from RUNNER27:
1. in every multi-problem scenario each problem's 📜 is matched line by line against that problem's own events;
2. a defect is booked in every scenario whose evidence shows it, not only in the first;
3. the arms Fable skipped (real tie, piece after closure, «= N unit» shape) are named explicitly in the brief.

## Better than round 25 (evidence in the reports)
- Both round-25 S1 are closed in every group that exercised them: the territory fit on frame/generic words and her «نه» after «رسید»
  (B, D, A, C arms), and the fraction-sum misread (D25-12).
- Territory loop: unrelated, ruled-out, generic, best-of-two/three, «نه» after arrival, take-back of «نه», sys_done, no duplicate
  rows — pass in all four groups.
- Prior work: the opening block, per-step verdicts with reasons, dependants, the resume question, the second report merge (in A, B, D),
  the explicit dispute with one re-check, credit on the mind card.
- Stale lists are right for the direct datum (s23, s29); 📜 duplicates gone; guesses in 📜 (3 of 4); register stored across reload;
  «تا جمعه» on a Friday is asked (A, D); one prediction → one 🎯 through the practice case (A).
- People reached a verified result or the exact sticking point in every scenario of group C and in every prior-work scenario.

## Root mechanisms (for the round-26 fixers)

**Q1 — ARITHMETIC READER (a46). Two S1 families.**
Defects: A26-1, A26-26, A26-45, A26-20, B26·D20, B26·D8, B26·D10, B26·D35, B_x D6, D8, D15, D19, C26-9, C26-10, C26-11, C26-26,
C26-31, D26-16, D26-18, D26-24, D26-52, U26, U27, U28.
- A scale or unit word beside the result is not a factor of the result. Compare the numbers; never ✗ on the word (C15).
- «با/اگر x = a … میشه ⟨expr⟩ = ⟨value⟩»: the claim is the expression against the value after the last «=» / «میشه». A number that
  belongs to a condition is not the claimed value (C18).
- The rounding allowance (C9) never turns a false exact identity into ✓ (C16).
- «≈ −۰٫۶۹٪» against −0.685٪ is ✓ by C9; the page's value is shown in her form (percent, decimal), never as «-۱/۱۴۶».
- A line with an explicit operator and a result that the reader cannot parse is reported «نسنجیده» — never silence, never ✓ (C17).
  This covers π and named constants, «میشه» results, running sums with a unit, «A از B میشه N٪», powers, ellipsis sums.
- The arithmetic block also runs when the chat is bound to a live problem that has no ledger (B26·D10, s17, bp2).
- A slip in a division is not labelled a unit error (B_x D15).
- Owner bank 36: she can contest the page's ✗. The page re-runs the check, shows both computations, and if she is right the ✗ is
  cleared everywhere — ledger, 🧭, 📜, mind card (A26-2, A26-3).

**Q2 — CORRECTION REACHES EVERYTHING BUILT ON IT, AND NOTHING ELSE (P4 engine).**
Defects: U4, U5, U6, U7, U14, U16, U33, U34, U38, A26-15, A26-34, A25-9, B26·D2, B26·D31, C25-15, C25-4 (pwC1), C26-35, C26-36,
C26-37, D26-8, D26-38, D26-46, D25-19, s16 strip (U31).
- A corrected datum marks every record derived from it as «با عددِ پیشین»: ledger steps, chat-recorded results, plan, forecast row,
  practice session, look-back check, the strip state «حل به نتیجه رسید».
- Marking follows dependency, not equal digits. A coincidental equal number («۱۵ متر» cable, a coefficient 0.7, a measured 3.5) is
  never marked (extends C11).
- A message that carries both a correction and a question records the correction (or asks once); it is never refused as «پرسش بود».
- «چیزی برای عوض کردن نبود» is said only when no record holds the old value.
- A proposed replacement inside text is the page's exact recomputation of the whole expression (C11), or the page asks.
- ✏️ of a message refreshes the chat-recorded result built from it.
- The page says the same thing to her and to the model about what went stale (D26-8).
- The re-check question stays until she answers it (C26-36).

**Q3 — ONE PROBLEM, ONE RECORD (story, a45).**
Defects: U12, U13, U15, A26-41, A26-51, B26·D30, B26·D32, B_x D33, C26-1, C26-12, D26-6, D25-11, D25-16.
- Naming another problem binds the turn to it, or the page asks which; nothing is filed under the problem that was merely live (C21).
- Plan, result, guess, forecast verdict, prerequisite and route destination belong to the problem they were said about. No copies
  into another problem's 📜 or 🧭.
- With two open forecasts a reported outcome names its forecast, or the page asks.
- Question sentences about another problem never become «داده» of the live one.
- A second and a third problem each get their own record (round 25 handled only the last split).
- The session dossier counts problems, not messages («۲ از ۲» for one problem is wrong).

**Q4 — PRIOR-WORK REPLY READING (P1 ledger).**
Defects: U3, U8, U9, U18, U43, U44, A26-5, A26-7, A26-14, A26-31, A26-32, A26-33, B26·D22, B26·D23, C26-7, C26-8, D26-3, D26-9,
D26-11, D25-5, D25-15, C25-9, D25-24.
- Any later report she calls her own work merges, the third as well as the second.
- Her fix lands the same turn when the page's check agrees (C8), whether it is one computation, a chain (each link judged), or a
  non-numeric repair that the model's validated step confirms.
- A dispute by meaning is heard like an explicit one; a take-back of a dispute restores the earlier state with history (C5 applied to
  verdicts).
- «X را قبول کردم و Y را نه» gives each step its own state.
- An intermediate or unrelated result is never booked as «her fix» of the resume step.
- The resume question never lands on a step she made obsolete; the turn question never says «همه درست» beside a ✗.
- The prior block does not fire on mid-solution or post-closure arithmetic, nor on a mastery answer.
- A fixed step drops its old dispute reason.

**Q5 — DATES AND «امروز» (P7).**
Defects: U10, U19, U20, U21, U22, A26-6, A26-12, A26-13, A26-21, A26-49, B26·D1, D3, D11, D14, D24, D25, C26-5, C26-19, C26-28,
C26-41, D26-37, D26-41, D26-51, D23-10.
- A date ask is made only for her own future action (C19).
- Every date that reaches «امروز» — from her, or from the model's report — passes «… درست است؟» and her yes (C12 on both paths).
- «جمعهٔ بعد», «هفتهٔ بعد، جمعه», «آخرِ هفتهٔ بعد» are read; «باشه» is a yes to the page's pending question.
- A pending ask is never dropped silently; her typed answer gets one confirming line.
- A day she negated is never offered back.

**Q6 — STAGE AND CLOSURE FOLLOW THE PAGE (story).**
Defects: U11, A26-29, C26-2, C26-4, C26-25, C26-40, C26-16, C26-18, C25-10, B24·D15, B24·D18, D25-25, U32.
- A sub-result or a first wrong result does not move the stage to «بازنگری» or show «حل شد».
- «حل شد / بسته شد» in 🧭, 📜 and the ledger comes only from the page's own closure.
- A problem proved in chat and registered afterwards opens with the «✅ حل شد» card, not at «فهم».
- The strip destination is the problem, not a meta sentence («چیکار کنم؟»).
- An answered question does not return as the bold question; a closed problem suggests nothing.

**Q7 — TERRITORY LOOP POLISH (P3).**
Defects: U58, U59, U61, U62, U63, A26-35, A26-36, A26-50, C26-20, D26-19, D26-20, D26-21, D26-22, D26-54.
- A real tie is asked naming both, in the chat and in «امروز» (D26-20 declared one); answering by naming one is the answer (C20).
- A clear single best fit arrives; it is not asked (C26-20).
- After a take-back the sheet is closed with a note; 📜 keeps every arrival and rejection as its own event.
- The «❓» line in «امروز» opens a row that can be answered there.
- A step-less system sheet that gets a reply gives her one notice; a piece waiting after closure has its «امروز» line.
- No waiting point is attached to an unrelated closed problem.

**Q8 — FORECAST LEDGER 🎯.**
Defects: U49, U50, A26-28, A26-46, D26-14, D26-23, B26·D32 (undo), B26·D22 (lesson read as guess).
- Confidence said in words («هفتاد درصد») makes a 🎯.
- One prediction is one 🎯 and one deadline.
- An outcome she reports in chat settles that 🎯, or the page asks once; a booked verdict can be taken back with history.
- A lesson is not read as a guess; a guess she repeats verbatim is accepted.

**Q9 — WHO SHE IS: PERSONAL DATA, REGISTER, TITLES, MIND CARD.**
Defects: U23, U24, U29, U30, U37, U46, U53, U54, U55, C26-6, C26-13, C26-17, C26-21, C26-22, C26-29, D26-33, D26-40, D26-53,
D24-15, A23-14.
- A child's or a third party's school, teacher or personal name never becomes a title or a visible label (C22). C26-22 is treated as
  the most urgent item of this family.
- Greetings, self-introductions and birth sentences are not problem titles; a question about the page is not a problem.
- Static page strings follow the stored register («شما» for an elder everywhere).
- The post-check does not fire on guillemets, on «ندید», or on a verb that merely contains «شو».
- The mind card shows a readable label (never «undefined»), does not book «ناقص» or a refuted assumption as a failure, and does not
  credit a message the page marked ✗.

**Q10 — SMALL MECHANISMS (one fixer may take them with its own family).**
- After «go», when the destination already holds the item, the follow-up says «open it», never «build» (C26-32).
- A prerequisite diagnosed before registration is one point on 🧭 (C26-34).
- C26-33 (typed plan lost after a refused «ثبتِ طرح»): reproduce first; it is not yet confirmed.
- After a failed retrieval, one success does not schedule 21 days out while the line says «۱ از ۳» (C26-42).
- Two people in one browser (owner bank 6; sheets #101/#102 of A and D): not built this round; stays an open sheet.

## Clarifications (binding; continue the numbering of DECISIONS_R25)
- **C15.** A word of scale or unit after the result («هزار», «میلیون», «میلیارد», «تومن», «کیلووات‌ساعت») is compared as a unit. If the
  numbers agree under one consistent reading, ✓. If the scale cannot be read, «نسنجیده». Never ✗ because of the word.
- **C16.** C9's rounding applies where she wrote decimal digits or an approximation word (≈، حدود، تقریباً). An «=» between exact
  rationals — a fraction identity, or an integer result of fractions — is exact: 13/12 is not 1. An integer written for a
  non-integer quotient with no approximation word is neither ✓ nor ✗: the page says the exact value and asks whether she rounded.
- **C17.** A line with an operator and a result that the reader cannot parse is «نسنجیده» to the coach. Sentence arithmetic with no
  operator stays outside the reader, as before.
- **C18.** The claimed value is what follows the last «=» or «میشه» of an expression. Numbers in a condition («با n = 4») are not it.
- **C19.** No date ask for: past tense, another person's words or schedule, a retracted day, a weekday or date inside the problem's
  wording, elapsed time («۸ ماهه»), a birth sentence.
- **C20.** When a candidate area exists and only frame or view words overlap, ask (C2). When the reply names no area at all, reject
  and reopen — there is nothing to ask about. Both behaviours seen in round 26 are right for their own case.
- **C21.** Return by naming: bind or ask; never file under the merely-live problem.
- **C22.** Third-party personal names are shown as a placeholder («[نامِ مدرسه]») wherever the page writes a title or label.

## Owner bank 1–41 (round 26)
| # | verdict | # | verdict | # | verdict |
|---|---|---|---|---|---|
| 1 | نیمه (derived numbers, correction+question) | 15 | نیست (فقط در تور) | 29 | نیست (برگه) |
| 2 | هست | 16 | نیمه (D30, D32, U13) | 30 | هست (صادقانه) |
| 3 | هست (ثبتِ نادرست در s01, pwA1, aA2) | 17 | نیمه (بی تاریخ) | 31 | نیمه (C26-7, C26-8) |
| 4 | نیست (برگه) | 18 | هست | 32 | هست |
| 5 | هست | 19 | نیمه (فهرستِ واحد نیست) | 33 | هست |
| 6 | نیمه (دو نفر در یک مرورگر قاطی می‌شوند) | 20 | نیست (برگه؛ گامش منتظر ماند) | 34 | نیمه (D26-9) |
| 7 | هست | 21 | نیست (برگه) | 35 | هست |
| 8 | هست (مقصدِ کهنه می‌ماند) | 22 | هست | 36 | نیست (برگه) ⇒ Q1 |
| 9 | نیمه (برگهٔ بی‌گام خبر نمی‌دهد) | 23 | هست | 37 | هست (برچسبِ خام) |
| 10 | هست | 24 | نیمه (C25-15) | 38 | نیمه (قلمرو هست، حکم نیست) |
| 11 | نیمه (مدلِ محلی نیست) | 25 | هست | 39 | نیست (برگه) |
| 12 | هست، با شکاف‌های نام‌برده | 26 | هست | 40 | نیمه (D26-8) |
| 13 | نیست (برگه) | 27 | هست | 41 | هست («امروز» ندارد: U63) |
| 14 | نیمه (کارِ خودش هست، بخش‌های سامانه نیست) | 28 | نیست (برگه) | | |

هست ۱۹ · نیمه ۱۳ · نیست ۹. Each «نیست» has its sheet; each «نیمه» names the defect that holds it back.

New owner-like questions for the bank (42–53), taken from the runners' lists:
42. اگر صفحه چیزی را اشتباه ثبت کرد، خودم از کجا برش گردانم؟
43. کدام عددِ کارنامه از کدام جمله‌ام آمده؟
44. وقتی دو پیش‌بینیِ باز دارم، از کجا بفهمم نتیجه روی کدام نشست؟
45. ابزاری که ساخته شد روی دادهٔ خودِ من هم آزموده شده، یا فقط با واژه‌ها؟
46. وقتی مسئلهٔ قبلی را نام می‌برم، جملهٔ بعدی‌ام در کدام مسئله می‌نشیند؟
47. «حل شد» روی نقشه، در پرونده و در صفحهٔ مسئله یک معنا دارد؟
48. اگر روزِ هفته جزوِ صورتِ مسئله‌ام باشد، قرار می‌شود؟
49. نوشتم «جمعهٔ بعد» یا گفتم «باشه»؛ ثبت شد یا نه؟
50. وقتی صفحه می‌پرسد «این‌جا هم عوض شود؟»، عددهای داخلِ متنِ پیشنهادی را هم از نو حساب می‌کند؟
51. بعد از یک بار فراموشی، چرا یادآورِ بعدی‌ام سه هفته بعد است؟
52. نوه‌ام که آمد، چطور بگویم این منم یا او؟
53. برگه‌ای که گامی را منتظر نگذاشته، وقتی جواب گرفت خبرم می‌کنی؟

## Not exercised in round 26 (carried into RUNNER27 as explicit arms)
- B: exact tie and piece after closure (run by the control and by A and D). C: both, plus the s29 sketch turn (round-25 image absent)
  and pC3's plan forms.
- D25-17, B25·D17 (session pin / wrong Gregorian text): one run each, not settled.
- C12 was seen once only on a correct sentence (A); C2 half tested (D).
- aA2 forgetting/regression (hard-coded practice ids in the old control file).
- Four findings files of group A carry broken UTF-8 bytes (oA1, s01, s04, s06); the text around them is readable.

## Fixer split (seven, one concern each; same isolation rules as FIX25)
| Fixer | Family |
|---|---|
| arith | Q1 (both S1 first) |
| correction | Q2 |
| story | Q3 + Q6 |
| prior | Q4 |
| today | Q5 + Q8 |
| loop | Q7 |
| classify | Q9 + Q10 |

Each fixer works where its round-25 namesake worked (`reports/fix25/<name>.md` lists the functions).

Order of merge: arith first (its two S1 change what every other family's tests see), then the rest in any order. Round 27 starts
only after `GATE_DONE fail=0`.
