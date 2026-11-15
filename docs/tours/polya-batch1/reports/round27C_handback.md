# Round 27 · group C — final report

All 20 group-C scenarios were re-run on main 253b357a (build in sync, dist rebuilt after the merge), plus one branch run, tC1t, for the tie arm. Each scenario has `findings.md` (UTF-8 checked), `DONE` and a sent e-mail.

**Result: 3 PASS (s24, s29, oC1) · 5 PARTIAL (s21, s26, s27, aC2, aC4) · 12 FAIL.**
- Every FAIL comes from at least one S2.
- No S1 this round: correct work was never shown ✗, and wrong work was never shown ✓.
- In every scenario the person reached a verified result or the exact sticking point.

## Housekeeping
- The repo was not edited.
- I only started and killed processes recorded in `round27C/pids.txt`; none are left running.
- All browser profiles are deleted; the `ai/` folders are kept.
- The owner's address is not written in any file.
- All 21 e-mails were sent with the Gmail tool: one per scenario, plus a correction for s24.
- `STORYBOARD_LINKS.md` has a «دورِ ۲۷ C» line.

## What I did not run or could not judge
- **«C12 on a wrong sentence» and the session-pin items D25-17 / B25·D17:** not run. They belong to groups D and B.
- **T5 in pwC2:** not run there; T5 was run in pwC1.
- **Screenshots:** all taken, but not reviewed one by one. Verdicts rest on page text, state and prompts.
- **Prompt scan:** the scanner flags style-rule and list lines. My spot checks found no second turn question, but I did not re-read every flagged line.
- **Replayed round-26 replies:** where a turn's prompt had changed, some old replies no longer fit (s22 p14, pwC1 p13, pwC2 p22, tC1 p20). I booked these as my own error (class d), not as page defects. Where the arithmetic or prior-work block changed, I wrote new replies (aC2 p4, aC3 p5, pwC1 p3/p14/p15, and others).
- **Re-runs after my own harness errors:**
  - s23 was re-run after I remapped stale practice ids.
  - pC3 was re-run because my plan-form controls had run on the route view.
- **s24:** first sent as ⚠️ with C26-4. On re-reading Q6, «بازنگری» after a full result in chat is the intended design, so s24 is PASS. A correction e-mail was sent.

## Results per scenario
| sid | result | defects (turn) | ارتقای لازم |
|---|---|---|---|
| s21 | PARTIAL | C26-1 (p2: the restated problem counted as «مسئلهٔ ۲ از ۲») | count problems, not messages |
| s22 | FAIL | C27-1 S2 (p22), C27-2 S3 (p22), C26-3 (p16, p17), C22-5 (p7) | the answer to a date ask comes only from the message that answers it |
| s23 | FAIL | C27-14 S2 (p6; T9 FAIL), C25-8 S2 (p4), C26-37 (p6), C25-15 (p9) | keep the source of every computed number |
| s24 | PASS | — | (suggestion) 🧭 could add «only said in chat» |
| s25 | FAIL | C27-13 (p20), C26-14 (p3, p16), C26-3 (p14), C26-1 (p15: practice report counted as a problem) | read ellipsis sums |
| s26 | PARTIAL | C22-11 (chat guess still «آزموده نشده») | merge the chat guess with the form guess |
| s27 | PARTIAL | C26-39 («✓ ثابتش کردید» on an unjudgeable step) | — |
| s28 | FAIL | C25-7′ S2 (p4), C26-40 (p4), C27-3 (p4) | the prior block also on the 2nd problem's opening |
| s29 | PASS | — (sketch turn run with a new image; T9 PASS) | (suggestion) read «a(b+c)» |
| pC1 | FAIL | C26-33 S2 confirmed (plan forms), C25-7 S2 (p1; T12 FAIL), C26-32 S2 second follow-up (p13), C26-18 (p6) | keep form text after a refused gate |
| pC2 | FAIL | C26-32 S2 second follow-up (p12), C27-6 (p13), C27-7 (p13); T2 PARTIAL | an «امروز» line for a piece after closure |
| pC3 | FAIL | C26-32 S2 second follow-up (p16); plan forms and look-back now fully run ✓ | — |
| aC1 | FAIL | C27-4 S2 (p12 «علی» in title, 🧭 and «امروز»), C26-29 (birth sentence counted as a chat problem) | placeholder for bare first names |
| aC2 | PARTIAL | C26-23 (p1), C26-24 (p2) | tell a Pólya-method word apart from a problem term |
| aC3 | FAIL | C27-11 S2 (p8, p11: next-year date), «سرِ برج/عید/آخرِ سال» not read (p14) | expire due asks; read festive dates |
| aC4 | PARTIAL | C26-30 (p7), C27-5 (p8) | close the date ask when the plan is done |
| oC1 | PASS | — (T6 «جمعهٔ بعد» PASS, T7 PASS) | — |
| pwC1 | FAIL | C27-26 S2 (p23; T11 FAIL), C27-25 S2 (p22), C27-23 S2 (p10), C25-15 (p10), C27-21 (p3), C27-22 (p14), C27-24 (p20) | read «a متر در b متر»; correction plus question |
| pwC2 | FAIL | C27-20 S2 (p27–p29; T8 FAIL), C27-18 S2 (p28), C27-19 S2 (📜), C25-15 S2 (p22), C27-17 (p21) | 🎯 from «N درصد مطمئنم»; bind by short name |
| tC1 (+tC1t) | FAIL | C27-28 S2 (tC1t p17: tie answer by naming not read), C26-18 (p6), C27-27 (p3) | read a tie answer given by part of the name |

## New defects (details in `round27C/defects.md`)

**S2**
- **C27-1:** a negated day is taken as the answer to another date question.
- **C27-4:** a bare first name appears in titles, 🧭 and «امروز».
- **C27-11:** an unconfirmed date ask is re-asked with next year's date when its day arrives.
- **C27-14:** a correction marks a number stale because the digits are equal, not because it was built from the corrected value. The number that really depended on it is missed (T9).
- **C27-18:** a result for «مهره‌ها» is filed under the dice problem.
- **C27-19:** a plan from another facet is filed in this problem's 📜.
- **C27-20:** predictions with stated confidence create no 🎯 (T8).
- **C27-23:** a wrong stale-number proposal («۱۰ ⇒ ۱۲٫۵»), and step 2 is not marked stale.
- **C27-25:** wrong «۳ متر در ۵ متر = ۱۸ مترمربع» gets no verdict.
- **C27-26:** a correction plus a question is refused as «پرسش بود» (T11).
- **C27-28:** after a tie question, her answer naming one tool is ignored (T1, second half).

**S3**
- **C27-2:** a corrected deadline day does not update its open date ask.
- **C27-3:** «فکر کنم درسته» after her own enumeration is stored as a guess.
- **C27-5:** a date ask stays in «امروز» after the plan is done.
- **C27-6:** the 🧭 destination is a meta sentence.
- **C27-7:** a piece waiting after closure has no «امروز» line.
- **C27-13:** ellipsis sums are not read.
- **C27-17:** one act creates both a 📌 plan and a ⏰ follow-up.
- **C27-21:** a fixed step keeps its old reason in the turn question.
- **C27-22:** a running sum with a unit is not read.
- **C27-24:** the resume question asks for a piece she already reported.
- **C27-27:** a conditional sentence is booked as a dateless plan.

## Round-26 defect table
| id | verdict | turn / where |
|---|---|---|
| C26-1 | CHANGED | fixed in s22, s26, s27, s28, s29, aC4, pC1–pC3, oC1, pwC2, tC1. Still in s21 p2 and s25 p15. In aC1 a birth sentence is counted as a problem. |
| C26-2 | FIXED | pC1 (🧭 «بازنگری — هنوز بسته نشده»), pC3, aC2 |
| C26-3 | STILL | s22 p16/p17, s25 p14 |
| C26-4 | FIXED in s22 p20 and oC1 p19; CHANGED in s24 and s28 | in s24 and s28 «بازنگری» after a full chat result is the Q6 design |
| C26-5 | FIXED | s22, oC1, aC3, pwC2 (every date asked) |
| C26-6 | FIXED | pwC1 (no rewrite) |
| C26-7 | FIXED | pwC1 p16 (and a third report at p20) |
| C26-8 | FIXED | pwC1 p2/p3, pwC2 p4, pC2 p7 |
| C26-9 | FIXED | pwC1 p3 |
| C26-10 | FIXED | pwC1 p14, aC3 p5 |
| C26-11 | FIXED | pwC1 p15 |
| C26-12 | FIXED | pwC2 p23–p25 |
| C26-13 | FIXED | pwC2 |
| C26-14 | STILL | s25 p3, p16 |
| C26-15 | FIXED | s25 p7 |
| C26-16 | FIXED | s25, s29 p10 |
| C26-17 | not re-seen | — |
| C26-18 | STILL | pC1 p6, tC1 p6 |
| C26-19 | FIXED | tC1 p12 (asks Thu 7 / Fri 8 Aban) |
| C26-20 | FIXED | tC1, day 6 |
| C26-21 | FIXED | aC1 p10 |
| C26-22 | FIXED | aC1 p10 |
| C26-23 | STILL | aC2 p1 |
| C26-24 | STILL | aC2 p2 |
| C26-25 | FIXED | aC2 p2–p3 |
| C26-26 | FIXED | aC2 p4 |
| C26-27 | FIXED | aC2 p11 |
| C26-28 | FIXED | aC3 p2 |
| C26-29 | FIXED in aC4; seen in aC1 | — |
| C26-30 | STILL | aC4 p7 |
| C26-31 | CHANGED | pC1 p1: no ✗ any more, but nothing is read either (C25-7) |
| C26-32 | CHANGED | the first follow-up is fixed («همان را باز کن»); the second still says «پر کن … بساز» (pC1 p13, pC2 p12, pC3 p16) |
| C26-33 | STILL (confirmed) | pC1 forms: the typed plan is lost at a refused «ثبتِ طرح». It survives adding a move. Not reproduced in pC3. |
| C26-34 | FIXED | pC3 |
| C26-35 | CHANGED | s23: now built on a wrong dependency (C27-14) |
| C26-36 | FIXED | s23 p10–p12 |
| C26-37 | STILL | s23 p6 |
| C26-38 | FIXED | s23 |
| C26-39 | STILL | s27 |
| C26-40 | STILL | s28 p4 |
| C26-41 | FIXED | s28 p4 |
| C26-42 | FIXED | s29 p7 («۷ روز … ۱ از ۳») |
| C25-4 | CHANGED | pwC1 p10: the ledger is marked stale, but the step-2 link is missing |
| C25-7 | STILL in pC1 p1 and s28 p4; FIXED in pC2 | — |
| C25-8 | STILL | s23 p4 |
| C25-9 | FIXED | s25 p8/p16, aC3 p4, pC3 p3 |
| C25-10 | FIXED in pC3 p4; CHANGED in pC2 | in pC2 «اجرا» comes after her plan, which is legitimate |
| C25-15 | STILL | pwC1 p10, pwC2 p22, s23 p9 |
| C25-16 | not re-seen | — |
| C22-5 | STILL | s22 p7 |
| C22-11 | STILL | s26 |

## ARMS TABLE
| arm | scenario · turn | verdict |
|---|---|---|
| T1 real tie | tC1t p17 | PARTIAL: it asks naming both, does not declare, and adds a «❓» line in «امروز» ✓. Her answer «کارگاهی» is then not read (C27-28). |
| T2 piece after closure | pC2 p13 | PARTIAL: sheet #101 and its own wait ✓; the closed problem stays solved ✓. No «امروز» line (C27-7); meta destination (C27-6); a wait event also lands in the closed problem's 📜. |
| T3 «= N unit» | pwC1 p20–p22 | PARTIAL: «۴۰ + ۱۲ = ۵۲ متر» ✓, «۲ × (۳ + ۴) = ۱۴ متر» ✓, «۶۱۳۱ ثانیه = ۱۰۲ دقیقه» ✓, «÷ ۴۸ = ۶۱۳۱» «؟» ✓, wrong «= ۱۸ متر» ✗ ✓. Both «۳ متر در ۴/۵ متر = … مترمربع» lines are unread; the wrong one is silent (C27-25). |
| T4 third prior-work report | pwC1 p20 | PASS: ledger reaches 8 steps; waiting step 4 stays |
| T5 take-back of a dispute | pwC1 p19 | PASS: «خودش مخالفتش را پس گرفت» |
| T6 «جمعهٔ بعد» / «باشه» | pwC2 p18–p21, oC1 p16 | PASS: on a Friday «جمعهٔ بعد» ⇒ 8 Aban; «باشه» ⇒ 2 Aban; on a non-Friday it asks Fri 1 or Fri 8. Duplicate record (C27-17). |
| T7 correction 5 ⇒ 4 | oC1 p20 | PASS: «۱۳۰ ⇒ ۱۰۴» only; «اپ ۴ ساعت» untouched |
| T8 two open predictions | pwC2 p27–p29 | FAIL: no 🎯, outcomes recorded nowhere (C27-20); marbles result filed under dice (C27-18) |
| T9 coincidental number | s29 p8–p10, s23 p6 | PASS in s29 (the «۴۰ متر از در» of the pond is untouched). FAIL in s23 («۱٫۷۵» marked stale from «۳۵ دقیقه», C27-14). |
| T10 division three ways | s25 p19 | PASS: ÷ ✓; «تقسیم بر ۷ = ۱۴» «؟ گرد کرده؟»; «۱۳/۱۲ = ۱» ✗. The coach was told the same. |
| T11 correction + question | pwC1 p23 | FAIL: «پرسش بود، نه اصلاح» (C27-26) |
| T12 mid-session must not / opening with steps must | aC3 p4, s25 p8/p16, pC3 p3; pC1 p1, s28 p4 | mid-session PASS; opening FAIL in pC1 p1 and s28 p4 (C25-7). It fires correctly on other openings (pwC1, pwC2, pC2, s25, s29). |

## 📜 line-match tables (multi-problem scenarios)
| scenario | per-problem match | mismatch |
|---|---|---|
| s21 | match puzzle ✓ · problem invented in the look-back ✓ | the session dossier counts message 2 as «۲)» (C26-1) |
| s24 | match stairs ✓ · tiling ✓ | — |
| s25 | match n/(n+1) ✓ · own pattern ✓ | the practice report counts as «۲)» (C26-1) |
| s26 | match the three ✓ · the four (from look-back) ✓ | chat guess outcome «آزموده نشده» vs form «رد شد» (C22-11) |
| s28 | match two children ✓ · Tuesday ✓ | the Tuesday 📜 has a guess that was not a guess (C27-3) |
| s29 | match garden ✓ · pond ✓ · two look-back problems ✓ | «۲ از ۲» correct |
| s23 | cake: the 2.8 guess outcome is set aside by an unrelated egg correction (C25-8) | 24-cm problem ✓ |
| pC2 | heater: the post-closure piece's wait is also listed here | kettle ✓; meter piece has its own strip |
| aC1 | marbles ✓ · «علی» ✓ (title aside) | birth sentence counts as «۲)» (C26-29) |
| pwC2 | disease problem holds a plan of the sleep-news facet (C27-19) | dice holds the marbles result (C27-18); marbles has nothing; predictions recorded nowhere (C27-20). Session dossier lists 3 problems ✓ |
| tC1 | one problem; every sheet event appears as its own line ✓ | — |

## Prior-work verdict table
| scenario | block | outcome |
|---|---|---|
| pwC1 | yes | 8 steps over 3 reports. Fixes same turn. Dispute, «نه، بس نیست» and take-back each read correctly. Step 4 waits on #101. Correction reaches steps 1 and 3 but not step 2 (C27-23). |
| pwC2 | yes | dispute re-checked once; fix same turn; verified 9.2%. The 1%⇒2% correction does not reach the ledger (C25-15). |
| pC2 | yes | the unit error is separated from the arithmetic; fix ✓ at p7/p8 |
| s29 | yes | the guess is unchecked; the example is read «نسنجیده» to the coach |
| s25 | yes | opening claim and checks read ✓ |
| pC1 | no (C25-7) | — |
| s28 p4 | no (C25-7′) | — |
| aC3 p4, s25 p8/p16, pC3 p3 | none, correctly (mid-session or mastery) | — |

## Arithmetic (she wrote · exact · page · verdict)
| scenario | she wrote | exact | page said | verdict |
|---|---|---|---|---|
| pwC1 | ۲۴۷۰ × ۸ ≈ ۱۹٫۸ کیلووات‌ساعت | 19.76 | ✓ | right (C26-9 fixed) |
| pwC1 | ۱۲ × ۴٫۵ = ۵۴ میلیون | 54 | ✓ | right |
| pwC1 | … با پمپ ۳۸ میلیون میشه ۹۲، با … ۲۳ میشه ۱۱۵ | 92; 115 | unread | silent (C27-22) |
| pwC1 | ۴٫۲ × ۱۲ = ۵۲٫۴ ; ۱۱۵ ÷ ۵۲٫۴ ≈ ۲٫۳ ; ۱۷۰۰ ÷ ۰٫۵ = ۳۰۹۱ | 50.4; 2.19; 3400 | ✗ ✗ ✗ | right (C26-11 fixed) |
| pwC1 | ۱۴۰۵/۸/۱۵ ; ۴/۵ (score) | look-alikes | not judged | right |
| pwC1 | ۴۰ + ۱۲ = ۵۲ متر ; ۲۵۰ ÷ ۱۵٫۶ ≈ ۱۶ ساعت | 52; 16.03 | ✓ ✓ | right |
| pwC1 | ۳ متر در ۴ متر = ۱۲ مترمربع | 12 | unread | silent |
| pwC1 | ۲ × (۳ + ۴) = ۱۴ متر | 14 | ✓ | right |
| pwC1 | ۲۹۴۳۰۰ ÷ ۴۸ = ۶۱۳۱ ثانیه، حدودِ ۱۰۲ دقیقه | 6131.25; 102.19 | «؟» / ✓ | right (C25) |
| pwC1 | ۳ متر در ۵ متر = ۱۸ مترمربع | 15 | silent | **wrong line not judged (C27-25)** |
| pwC1 | ۲ × (۳ + ۵) = ۱۸ متر | 16 | ✗ | right |
| s25 | ۲۶ ÷ ۴ = ۶٫۵ ; ۱۰۰ تقسیم بر ۷ = ۱۴ ; ۱۳/۱۲ = ۱ | 6.5; 14.29; 13/12 | ✓ ; ؟ ; ✗ | right |
| s25 | ۱ + ۲ + … + ۲۰ = ۲۱۰ ; ۱ + ۲ + … + ۱۰ = ۵۰ | 210; 55 | — ; — | unread (C27-13) |
| s25 | ۲۰ درصدِ ۳۰۰ = ۶۰ / = ۶۶ ; π × ۲² ≈ ۱۲٫۵۷ | 60; 12.566 | ✓ / ✗ ; ✓ | right |
| s25 | ۱/۶ + ۱/۱۲ = ۱/۳ ; با ۱/۲۰ میشه ۲/۵ | 1/4; 3/10 | ✗ ; — two readings | right / unread |
| s25 | ۷ ≡ ۲ (mod ۵) ; ۳x + ۲ = ۱۱ ⇒ x = ۳ | look-alikes | not judged | right |
| s25 | ۱/۴ − ۱/۶۰ = ۷/۳۰ ; ۱/۶ + ۱/۲۴ = ۵/۲۴ … ۷/۳۰ | same | ✓ | right |
| aC2 | با n = 4 میشه 1+3+5+7 = 16 = 4² | 16 | ✓ ✓ | right (C26-26 fixed) |
| aC2 | 2+4+6 = 12 = 3×4 ; ۱۰ = 4×5/2 | 12; 10 | ✓ | right |
| aC3 | … = ۲۲.۵۲ میلیون ; ۱۸۰ − ۶۰ − ۲۲.۵ = حدود ۹۷.۵ میلیون | 22.52; 97.5 | ✓ ✓ | right (C26-10 fixed) |
| aC3 | ۶ میلیون × ۱۰ = ۶۰ میلیون ; ۲ میلیون × ۳ = ۶ میلیون ; ۲۰ درصدِ ۳۰۰ هزار = ۶۰ هزار | same | ✓ ✓ ✓ | right |
| aC3 | ۲ میلیون × ۳ = ۶ هزار (she called it a mistake herself) | 6 million | silent | acceptable; the C23 arm is not cleanly run |
| pC1 | x=4 و y=1 میشه 16−1=15 ; 64−49=15 | 15 | unread (no block) | silent (C25-7) |
| pC1 | ۴ × ۱۶ = ۶۴ ; ۱۰۰ − ۳۶ = ۶۴ ; (۱۰ − ۶)(۱۰ + ۶) = ۴ × ۱۶ | 64 | ✓ ✓ — | right |
| pC2 | ۲ کیلووات × ۳ = ۶ ; ۹۰۰۰ × ۳۰ = ۲۷۰ هزار | 6; 270000 | ✓ ✓ | right |
| pC3 | twelve claims (۸ × ۵ = ۴۰ … ۶۰ ÷ ۱۰ = ۶) | same | all ✓ | right |
| pwC2 | ۹ + ۸۹٫۱ = ۹۸٫۱ ; ۹ ÷ ۹۸٫۱ ≈ ۹٫۲٪ ; ۶/۳۶ = ۱/۶ ; ۳/۵ × ۲/۴ = ۶/۲۰ = ۳/۱۰ | same | ✓ | right |
| oC1 | ۵ × ۲۶ = ۱۳۰ | 130 | ✓ | right |
| s29 | ۲(۱+۱۹) = ۴۰ | 40 | — (C17) | acceptable |

No correct work was shown ✗ and no wrong work was shown ✓. Wrong lines left silent: «۳ متر در ۵ متر = ۱۸ مترمربع» and «۱ + ۲ + … + ۱۰ = ۵۰» (the second was told to the coach as «—»).

## Chat ⇄ page
- **Stage follows the story:** a full chat result opens at «✅ حل شد» (aC2, s28, s24).
- **«حل شد»** appears only after the look-back is saved (C26-2 fixed).
- **Prerequisite layer:** chat ⇄ 🧩 ⇄ 🧠 is right in aC1, aC3, aC4, pC1, pC2, pC3 and tC1.
- **One problem, one record** is much better (C26-1, C26-12 fixed widely). It still fails in pwC2: cross-filing (C27-18, C27-19) and no 🎯 (C27-20).
- **Forms in pC3:** plan, step, outcome and look-back all work.
- **Forms in pC1:** the typed plan is lost (C26-33).
- **Practice dossier ⇄ «امروز»:** right over 23 days in s23 and s29.

## Owner bank (C share: 21–31, 48–50)
| # | answer | where |
|---|---|---|
| 21 | نیست — sheet #102 | pwC1 p7 |
| 22 | هست | pwC1 p9; tC1 days 3/4/6 |
| 23 | هست (introduction stripped from the list) | pwC2 |
| 24 | نیمه — statement, title and forms ✓; ledger chains partly (C25-15, C27-23) | pwC1 p10–p11, pwC2 p22 |
| 25 | هست | s25 p18 |
| 26 | هست — no puzzle for a 9-year-old; «برای این سن هنجار در دست نیست» | aC1 p11 |
| 27 | هست | pwC1 day 3; tC1 days 3/4 |
| 28 | نیست — sheet #103 | pwC1 p24 |
| 29 | نیست — sheet #101 | aC3 p15 (and pwC2) |
| 30 | نیمه — answered honestly, but chat predictions are not counted at all (C27-20) | pwC2 |
| 31 | نیمه — ledger excellent in pwC1/pwC2/pC2; openings in pC1/s28 missed (C25-7) | — |
| 48 | هست — «سه‌شنبه» in the problem's wording is no appointment; no date asked | s28 p4/p6 |
| 49 | هست — «جمعهٔ بعد» ⇒ 8 Aban, «باشه» ⇒ 2 Aban, both in «امروز» (duplicate record C27-17) | pwC2 p26 |
| 50 | نیمه — in s29 the proposed form text holds only the datum, and derived numbers are recomputed separately (۱۰⇒۱۱، ۲۰⇒۲۲، ۱۰۰⇒۱۲۱). In s23 the proposal «۱٫۷۵ ⇒ ۲» rests on a wrong dependency (C27-14); in pwC1 «۱۰ ⇒ ۱۲٫۵» is not exact (C27-23). | s29 p10, s23, pwC1 |

## Routing
- **Turns:** 290 AI calls: lla_coach 256, lla_assistant 20, learning_architecture 14 (the second-opinion consultant). None on the wrong task (`round27C/routing.md`).
- **Prompt scan:** no second unmarked turn question found in spot checks.

## PARTS.md «نسبت به دورِ ۲۶»
| part | trend |
|---|---|
| کارِ پیشینِ تو | better (C26-7, C26-8 fixed) |
| حسابِ صفحه | better (no false ✗; new unread shapes) |
| موتورِ اصلاح | same or worse (C27-14, C27-23, C27-26; C25-15 open) |
| حلقهٔ قلمرو | better (C26-20 fixed; tie answer unread) |
| 🔭 forms | same (pC3 ✓, pC1 C26-33) |
| پیش‌نیاز | better (C26-34 fixed) |
| 🧭 | better (C26-2 fixed) |
| 📜 | better (C26-1 mostly fixed; pwC2 cross-filing) |
| تاریخ / امروز | same (old items fixed; C27-1, C27-11 new) |
| 🎯 | worse / first exercised in C (C27-20) |
| دستیار / پس‌وارسی | better (C26-6 fixed; C26-32 half) |
| سن / دادهٔ شخصی | better (C26-22, C26-28 fixed; C27-4 new) |
| تمرین | better (C26-42 fixed) |
| پیوست | the sketch turn now runs |

## New owner-like questions
- When two tools come and I name one, does the page take my word, or keep waiting?
- If I correct one fact and ask a question in the same message, is the correction kept?
- When I give a percentage of confidence in chat, where is that prediction kept, and where does its result go?
- If I say «پنجشنبه نه، شنبه», can that «پنجشنبه» end up somewhere else?
- If a date I didn't confirm comes round, why is it offered for next year?
- When I name a problem by a short word («مهره‌ها»), does my message go to that problem?

## Token / time use
- Not visible to me.
- Harness wall-clock was about 2 h 45 min (15:13–17:55 on the session clock).

## Files
Everything is in `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27C/`:
- `defects.md`
- `PARTS.md`
- `routing.md`
- `<sid>/findings.md`, `<sid>/ai/`
