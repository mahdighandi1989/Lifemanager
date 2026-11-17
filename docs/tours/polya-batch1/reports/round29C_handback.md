# Round 29 · group C — final report

All 21 group-C runs were replayed on main e0e26045 (build in sync, dist newer). New round-29 segments ran in s23, s25, s29, aC1, aC3, pwC1, pwC2 and oC1, plus move probes in s23, pwC1 and pwC2. Each run has a UTF-8-checked `findings.md`, a `DONE` file and a sent e-mail (21 e-mails, subjects «🧭 پولیا · دورِ ۲۹ · <sid> · …»). `STORYBOARD_LINKS.md` has a «دورِ ۲۹ C» line.

**Result: 2 PASS (s24, oC1) · 11 PARTIAL · 8 FAIL. Three new S1, all arithmetic, all told to the coach: C29-1 (aC1 p21), C29-2 (aC3 p34), C29-3 (aC3 p36).** In every run the person reached a verified result or the exact sticking point.

Housekeeping: the repo was not edited and nothing was committed. I killed only PIDs I had started and none is left alive. My browser profiles are deleted; the `ai/` folders are kept. The owner's address is in no file. The harness opens no port, so the range 9400–9449 was not used.

## Results per scenario
| sid | result | defects: turn · severity · family | ارتقای لازم |
|---|---|---|---|
| s21 | PARTIAL | C26-1 p2 · S3 · F11 repeat | count problems, not messages, in the session dossier |
| s22 | PARTIAL | C22-5 p7 · S3 · new<br>C26-3 p16/p17 · S3 · F14 repeat<br>C28-1 p22 · S3 · F6 repeat | one voice per date-correction turn |
| s23 | FAIL | C29-14 p14 · S2 · F8 repeat<br>C29-13 p18 · S2 · new<br>C29-16 probe · S2 · F10 repeat<br>C25-8 p4 · S2 · F8 repeat<br>C25-15 p9 · S2 · F8 repeat<br>C26-37 p6/p14 · S3 · F8 repeat<br>C29-24 p17 · S3 · new<br>C29-25 📜 · S3 · F8 repeat | read «X نمیشه، Y میشه» as a correction; build proposals from every current correction |
| s24 | PASS | — | — |
| s25 | FAIL | C29-15 p25 · S2 · F8 repeat<br>C28-4 p23 · S3 · new<br>C28-3 p21 · S3 · new<br>C28-5 p24 · S3 · new<br>C26-14 p3/p16 · S3 · new<br>C26-3 p14 · S3 · F14 repeat | replace a range («از a تا b») as one unit, or ask |
| s26 | PARTIAL | C22-11 📜 · S3 · new | merge the chat guess with the form guess |
| s27 | PARTIAL | C26-39 p4 · S3 · new | — |
| s28 | FAIL | C25-7′ p4 · S2 · F11 repeat<br>C26-40 p4 · S3 · new<br>C27-3 p4 · S3 · new | prior-work block at a second problem's opening |
| s29 | PARTIAL | C28-4 p14 · S3 · new<br>C29-18 p15 · S3 · new<br>C26-14 p11 · S3 · new | compute «a√b» (C107 allows it) |
| pC1 | FAIL | C26-33 forms · S2 · new<br>C26-18 p6 · S3 · new | keep form text across a refused save |
| pC2 | PARTIAL | C27-6 p13 · S3 · F13 repeat | — |
| pC3 | PARTIAL | C28-7 p16 · S3 · new<br>C28-20 🧭 · S3 · new<br>C28-21 p10 · S3 · F14 repeat<br>C28-22 step card · S3 · F14 repeat | name prerequisite items by the problem title |
| aC1 | FAIL | **C29-1 p21 · S1 · F2 repeat**<br>C28-8 p15/p27 · S2 · F9 repeat<br>C29-4 p29 · S2 · F9 repeat<br>C29-5 p25 · S2 · F11 repeat<br>C28-3 p20 · S3 · new<br>C28-21 · S3 · F14 repeat | read «= N، M تا می‌مونه» as two statements; the «X گفت» span ends at «پس» |
| aC2 | PARTIAL | C26-23 p1 · S3 · new<br>C26-24 p2 · S3 · new | tell a method word from a problem term |
| aC3 | FAIL | **C29-2 p34 · S1 · new**<br>**C29-3 p36 · S1 · F1 repeat**<br>C29-6 p42 · S2 · F6 repeat<br>C29-19 p32 · S3 · F1 repeat<br>C29-20 p35 · S3 · F1 repeat<br>C29-21 p44 · S3 · F5 repeat<br>C29-18 p35 · S3 · new | «درصد» as the result's unit; more than 5 compound amounts; a day answers only its own act |
| aC4 | PARTIAL | C26-30 p7 · S3 · new | keep a lesson said in chat |
| oC1 | PASS | — | — |
| pwC1 | FAIL | C28-14 p27 · S2 · F8 repeat<br>C29-10 p27/p31 · S2 · F7 repeat<br>C29-11 p33 · S2 · F7 repeat<br>C29-12 p32 · S2 · F8 repeat<br>C29-9 p13–p14 · S2 · F4 repeat<br>C29-16 probe · S2 · F10 repeat<br>C27-24 p21 · S3 · new<br>C28-5 p34 · S3 · new | proposals from recorded dependency with the current value of every datum; identify which «5» was corrected; ask C124 from `dep` |
| pwC2 | FAIL | C29-7 p32/p37/p41/p45 · S2 · F4 repeat<br>C29-8 p28 · S2 · F4 repeat (regression)<br>C25-15 p22 · S2 · F8 repeat<br>C27-19 📜 · S2 · F11 repeat<br>C28-19 p37 · S3 · F4 repeat<br>C29-22 p48 · S3 · F4 repeat<br>C29-23 p50 · S3 · new<br>C29-26 · S3 · F4 repeat | read the forecast before the date reader, so a weekday becomes the 🎯 due date; judge numeric outcomes |
| tC1 | PARTIAL | C26-18 p6 · S3 · new<br>C28-21 p9 · S3 · F14 repeat | — |
| tC1t | PARTIAL | C26-18 p6 · S3 · new<br>C28-21 · S3 · F14 repeat | — |

## New defects (full rows in `round29C/defects.md`)

**S1**
- **C29-1 (aC1 p21):** correct «۱۸ − ۱۵ = ۳، ۳ تا می‌مونه» goes to the coach as «✗ «۱۵ − ۳» را «۳» نوشته — ۱۲». This is F2: the remainder clause glued to the line, here after a subtraction.
- **C29-2 (aC3 p34):** correct «۲ و ۵ دهم × ۴ = ۱۰ درصد» goes to the coach as «✗ … ۱۰۰۰٪».
- **C29-3 (aC3 p36):** a correct six-term «N میلیون و M» sum (= ۸ میلیون) goes to the coach as «✗ ۶٫۰۰۲ میلیون». This is the fixer's «more than 5 compounds» item that was not done.

**S2**
- **C29-4:** «X گفت …، پس … = N» is filed as «کارِ دیگری» although the conclusion after «پس» is hers.
- **C29-5:** «یه مسئله: …», which has its own unknown, gets no record of its own.
- **C29-6:** «پسفردا … بیمه» books its day on the open pharmacy ask, and the insurance plan is lost.
- **C29-7:** a weekday inside a forecast makes a 📅 plan ask, and the 🎯 stays «بی موعد» (against C132).
- **C29-8:** the marbles forecast is recorded twice. Its outcome now asks «کدام؟» and nothing is settled, where round 28 settled it.
- **C29-9:** «راندمانِ ۵۵٪» becomes a 🎯.
- **C29-10:** the panel price «۵» is taken for «۵ میلی‌متر», so a correct acceptance is refused.
- **C29-11:** a proposal whose base was corrected twice is accepted.
- **C29-12:** the third area correction does not reach the ledger.
- **C29-13:** «X نمیشه، Y میشه» is not read as a correction.
- **C29-14:** a proposal is built on a value she had already corrected.
- **C29-15:** a range correction garbles the statement.
- **C29-16:** a ledger step with dependants moves with no C124 ask.

**S3:** C29-18 to C29-26 (C29-17 was not used).

**Class d (my own errors):**
- Round 28's «C27-7 STILL» was a misreading on my part.
- The quote for pwC1 step 1 comes from my replayed reply.
- The pwC2 move probe did not open the destination chat problem.
- In s23 p17 my reply reported `result` for a sub-result.

## Round-28 defect table
| id | verdict | turn |
|---|---|---|
| C28-1 | STILL | s22 p22 |
| C28-2 | FIXED | s25 p10 |
| C28-3 | STILL | s25 p21, aC1 p20 |
| C28-4 | STILL; also a new shape | s25 p23; s29 p14 («دوباره حساب کردم») |
| C28-5 | STILL | s25 p24, pwC1 p34, pwC2 c45 |
| C28-6 | FIXED | s27 p4, aC4 |
| C28-7 | STILL | pC3 p16 |
| C28-8 | STILL | aC1 p15, p27 |
| C28-9 | FIXED | aC3 p21, p22 |
| C28-10 | FIXED (asks per C93) | aC3 p28 |
| C28-11 | FIXED (C102: ✓ with no ask) | aC3 p29 |
| C28-12 | FIXED | aC3 p29 |
| C28-13 (S1) | FIXED | aC3 p30 |
| C28-14 | STILL | pwC1 p27 |
| C28-15 | FIXED (🎯 made; but see C29-7) | pwC2 p32 |
| C28-16 | FIXED | pwC2 p35 |
| C28-17 | FIXED | pwC2 p36 |
| C28-18 | FIXED | pwC2 c10 |
| C28-19 | STILL | pwC2 p37 |
| C28-20 | STILL | pC3 s19–s24 |
| C28-21 | STILL | pC3 p10, tC1 p9, tC1t, aC1 |
| C28-22 | STILL | pC3 s30/s33 |
| C28-23 | FIXED | s24 c55–c59 |
| C28-24 | CHANGED: texts present and «کدام؟» right; still filed under the disease problem (= C28-19) | pwC2 p37–p39 |
| C28-25 | FIXED | pwC2 p33–p34 |
| C27-7 | FIXED: the Today line exists (round 28 «STILL» was my error) | pC2 p13 |
| C27-6 (C half) | STILL: a chat problem is made from the after-closure sentence | pC2 p13 |
| C27-21 | FIXED | pwC1 p3 |
| C27-24 | STILL | pwC1 p21 |
| C27-19 | STILL | pwC2 📜 |
| C27-3 | STILL | s28 p4 |
| C26-1 | STILL | s21 p2 |
| C26-3 | STILL | s22 p16/p17, s25 p14 |
| C26-14 | STILL | s25 p3/p16, s29 p11 |
| C26-18 | STILL | pC1 p6, tC1 p6, tC1t p6 |
| C26-23, C26-24 | STILL | aC2 p1, p2 |
| C26-30 | STILL | aC4 p7 |
| C26-33 | STILL | pC1 forms c13–c15 |
| C26-37 | STILL | s23 p6, again p14 |
| C26-39 | STILL | s27 p4 |
| C26-40 | STILL | s28 p4 |
| C25-7′ | STILL | s28 p4 |
| C25-8 | STILL | s23 p4 |
| C25-15 | STILL | s23 p9, pwC2 p22 |
| C22-5 | STILL | s22 p7 |
| C22-11 | STILL | s26 |

## ARMS TABLE T1–T27
| arm | scenario · turn | verdict |
|---|---|---|
| T1 | tC1t p17 | PASS |
| T2 | pC2 p13 | PASS: own waiting entry plus a Today line. S3: C27-6 |
| T3 | pwC1 p21–p22 | PASS |
| T4 | pwC1 p20 | PASS |
| T5 | pwC1 p19 | PASS |
| T6 | pwC2 p18–p21; oC1 | PASS |
| T7 | oC1 p20 | PASS |
| T7 | pwC1 p27 | FAIL (C28-14) |
| T8 | pwC2 p37–p39 | PASS: «کدام؟» names only the two quizzes |
| T9 | s23 p6 | PASS |
| T10 | s25 | PASS |
| T11 | pwC1 p23 | PASS |
| T12 | pC1 p1, s25 p24 | PASS on an opening |
| T12 | aC3 p30, p36 | PASS mid-session: no prior block |
| T12 | s28 p4 | FAIL (C25-7′) |
| T13 | s24 c55–c59 | PASS |
| T14 main arm | **oC1 p21** | PASS: «آره، همون ۱۰۴ درسته» ⇒ «✓ پیشنهادِ صفحه را پذیرفتی — «۱۳۰ ⇒ ۱۰۴» … ثبت شد», with history |
| T14 negation | pwC1 p29 | PASS |
| T14 wrong value | pwC1 p30 | PASS: nothing rewritten |
| T14 in pwC1 | pwC1 p28 | NOT RUN: there was no exact proposal (120 was offered, not 150) |
| T15 | s29 p11–p15 | PASS. «a√b» stays نسنجیده, which C107 allows |
| T15 | aC3 p29–p30 | PASS |
| T16 | aC3 p17–p28, p37–p39 | PASS |
| T17 | aC3 p17–p23 | PASS (F5 fixed) |
| T18 | pwC2 p31–p39 | PASS, apart from C28-19 filing and the C29-7 date ask |
| T19 | aC1 p13–p16 | PARTIAL (C28-8) |
| T20 | s25 p21–p22; aC1 p19–p20 | PASS with S3 C28-3 |
| T21 everyday sum | aC3 p31 | PASS: ✓ with no question |
| T21 units-only | aC3 p32 | ✓ naming the reading, but S3 C29-19 |
| T21 none fits | aC3 p32 | PASS: ✗ with both values |
| T21 «تومن» | aC3 p33 | PASS |
| T21 «N هزار و M» | aC3 p33 | PASS |
| T21 m2 answer | — | NOT RUN: the page never asked m2 (C102 removes the ask) |
| T21 extra shapes | aC3 p34, p36 | S1 C29-2, C29-3 |
| T22 after a sum | aC1 p22 | PASS |
| T22 after a division | aC1 p23 | PASS («۶ و باقی‌ماندهٔ ۱» ✓, «۲۹ ÷ ۴ = ۶، ۳» ✗ «۷ با باقی‌ماندهٔ ۱») |
| T22 after a subtraction | aC1 p21 | FAIL S1 (C29-1) |
| T22 «کم میاد» | aC1 p24 | not judged, no false mark |
| T23 statement line | s24 | PASS |
| T23 🎯 | pwC2 probe | PASS: moved with history on the page clock. Undo not reached (class d) |
| T23 ledger step with dependants | s23 c182, pwC1 c106 | FAIL: no all / only / none ask (C29-16); undo PASS |
| T24 «فروشنده گفت ۱۲ درصد» | aC1 p25 | PASS |
| T24 «حساب کرد» | aC1 p26 | PASS |
| T24 «یه حسابِ دیگه هم کرد:» | aC1 p27 | FAIL (C28-8) |
| T24 «مامانم کمکم کرد» | aC1 p28 | PASS |
| T24 «X گفت … پس …» | aC1 p29 | FAIL (C29-4) |
| T25 two corrections | s23 p14 | FAIL (C29-14) |
| T25 two corrections | s23 p18 | FAIL (C29-13) |
| T25 two corrections | pwC1 p27, p32 | FAIL (C28-14, C29-12) |
| T25 stale-base acceptance | pwC1 p33 | FAIL (C29-11) |
| T25 chat-only acceptance | s23 p17 | NOT RUN as designed: no proposal value was shown |
| T25 chat-only acceptance | s29 p10 | accepted |
| T25 chat-only acceptance | pwC1 p31 | correct value refused (C29-10) |
| T25 «X نیست، Y» | s23 p14 | PARTIAL: statement and title changed; the guess quote kept «۲۰» |
| T26 ✏️ to a past day | aC3 p39, p28 | PASS |
| T26 «زنگ زدم» | aC3 p41 | PASS |
| T26 plan done at birth | aC3 p42 | FAIL (C29-6) |
| T26 «X درسته» | aC3 p38 | PASS |
| T26 «ماهِ دیگه» | aC3 p43 | PASS |
| T26 «حدودِ ۱۵ دی» | aC3 p44 | FAIL S3 (C29-21) |
| T27 weekday in a forecast | pwC2 p41 | FAIL (C29-7) |
| T27 «حدودِ N» | pwC2 p47 | PASS |
| T27 «مطمئنم» | pwC2 p43 | PASS |
| T27 bare «۶۰» | pwC2 p44 | PASS |
| T27 «باز / داوری‌شده» lists | pwC2 c121/c133 | PASS |

## 📜 line-match tables (multi-problem scenarios)
| scenario | per-problem match | marks | mismatch |
|---|---|---|---|
| s21 | ✓ | — | session list shows the problem twice (C26-1) |
| s23 | cake ✓; birthday-cake chat problem separate ✓ | ✓ ✓ beside 24, 3 | heading keeps 12 (C29-25) |
| s24 | ✓; statement moved and returned with history | — | — |
| s25 | three problems ✓; the correction goes to problem 3 ✓ | ✓/✗ on the ellipsis sums | garbled statement (C29-15); «اعتراضِ خودتان» (C28-4) |
| s29 | ✓ | ✓ ✗ ✓ roots | «اعتراضِ خودت» event (C28-4) |
| aC1 | the «بسته‌های تیله» lines go to «سه تا دفتر» (C29-5) | ✓ کارِ دیگری 5×12; ✗ as hers 6×12 | C28-8, C29-4 |
| pwC1 | irrigation ✓; brother's tank own record ✓ | ✓/✗; stale marks | not re-marked after 3 ha (C29-12) |
| pwC2 | course 🎯 under disease (C28-19); facet plan under disease (C27-19) | ✓ | duplicate marbles 🎯 (C29-8) |
| pC2 | heater ✓; waiting piece ✓; extra chat problem (C27-6) | ✓ | — |

## Prior-work verdict table
| scenario | outcome |
|---|---|
| pC1 | 3 steps; resume at step 3 ✓ |
| s23 p15 | separate chat ledger, 2 ✓; the 12 ⇒ 15 correction marks steps 1–2 stale ✓; no numeric proposals (allowed by C11) |
| pwC1 | 8 steps. 2 ⇒ 2.5 ha ✓. 5 ⇒ 6 mm wrong (C28-14). 2.5 ⇒ 3 ha not propagated (C29-12). Brother's tank: own ledger, 1 ✓ |
| pwC2 | 4 steps; C25-15 still |
| s25 | quote kept after 10 ⇒ 8 ✓; the problem-3 opening's single step ✓ |
| s28 p4 | no block (C25-7′) |
| aC3 p30, p36; aC1 p21–p24 | no block, correctly (mid-session, small talk) |

## Arithmetic (every value checked exactly)
| she wrote | exact | page | verdict |
|---|---|---|---|
| ۱۸ − ۱۵ = ۳، ۳ تا می‌مونه | 3 | ✓ + ✗ «۱۵ − ۳ = ۱۲» | **S1** |
| ۸ + ۶ = ۱۴ و ۲ تا می‌مونه | 14 | ✓ | right |
| ۲۵ ÷ ۴ = ۶، ۱ تا | 6 r 1 | ✓ | right |
| ۲۹ ÷ ۴ = ۶، ۳ تا | 7 r 1 | ✗ | right |
| ۴ × ۸ = ۳۲ … ۲ تا کم میاد | 32; short by 2 | ✓ / — | right |
| (brother) ۵ × ۱۲ = ۶۰ | 60 | ✓ کارِ دیگری | right |
| (brother) ۶ × ۱۲ = ۷۰ | 72 | ✗ as hers | S2 attribution |
| ۳ × ۱۲ = ۳۶ (with mum) | 36 | ✓ hers | right |
| بابام گفت … پس ۴ × ۱۲ = ۴۸ | 48 | ✓ as the father's | S2 attribution |
| ۴ میلیون و ۲۰۰ + ۱ میلیون و ۵۰۰ = ۵ میلیون و ۷۰۰ | 5.7 M | ✓ | right |
| ۳ میلیون و ۶۰۰ + ۲ میلیون و ۷۰۰ = ۵ میلیون و ۳۰۰ | 6.3 M | ✗ with both values | right |
| ۵ میلیون و ۸۰۰ − ۸۰۰ = ۵ میلیون | 5 M (thousands) | ✓ «units only» | S3 |
| ۱ میلیون و ۸۰۰ تومن − ۸۰۰ تومن = ۱ میلیون تومن | units reading per C105 | ✓ | right by C105 |
| ۸۰ هزار و ۵۰۰ × ۲ = ۱۶۱ هزار | 161,000 | ✓ | right |
| ۲ و ۵ دهم × ۴ = ۱۰ درصد | 10 | ✗ «۱۰۰۰٪» | **S1** |
| ۱ و ۵ دهم × ۳ = ۴ و ۸ دهم | 4.5 | ✗ | right |
| ۱۰ میلیون ÷ ۳ ≈ ۳ میلیون و ۳۳۳ هزار | 3,333,333 | ✓ | right |
| ۱۰ میلیون ÷ ۷ ≈ ۱ میلیون و ۵۰۰ هزار | 1,428,571 | ✗ «≈ ۱٫۴» | right; S3 (no scale) |
| six compounds = ۸ میلیون | 8.0 M | ✗ «۶٫۰۰۲ میلیون» | **S1** |
| ۲ میلیون و ۸۰۰ × ۱۲ = ۳۳ میلیون و ۶۰۰ ; ÷ ۲ = ۱ میلیون و ۴۰۰ | right | ✓ ✓ | right |
| ۶ میلیون و ۵۰۰ × ۱۰ = ۶۰ میلیون | 65 M | ✗ with both values | right |
| ۱ میلیون و ۲۰۰ + ۸۰۰ هزار = ۲ میلیون ; ۵ میلیون و ۵۰۰ × ۲ = ۱۱ میلیون | right | ✓ ✓ | right |
| ۲ × ۳ = ۶ (eggs, bread) | 6 | ✓, no prior work | right |
| √(۱۵² + ۸²) ≈ ۱۷ | 17 | ✓ | right |
| √(۱۲² + ۹²) ≈ ۱۶ | 15 | ✗ | right |
| √(۱۴² + ۸²) ≈ ۱۶٫۱ | 16.12 | ✓ | right |
| ۲√۳ ≈ ۳٫۴۶ | 3.464 | نسنجیده | allowed |
| ۳√۲ ≈ ۴٫۶ | 4.243 | نسنجیده | allowed; the error goes unseen |
| √۵۰ ≈ ۷٫۰۷ ; sqrt(۲) ≈ ۱٫۴۱ ; ۴٫۵ × ۴ = ۱۸ | right | ✓ ✓ ✓ | right; S3 «=» in the coach line |
| ۱۲ × ۲ = ۲۴ ; ۲۴ ÷ ۸ = ۳ | right | ✓ ✓ | right |
| ۲ × ۸۰ = ۱۶۰ | 160 | ✓ | right |
| (page proposals) ۱۰۰ ⇒ ۱۲۰ ; ۱۵ ⇒ ۱۸ | 150 ; not proportional | — | S2 |
| (page proposals) ۱۷۵ ⇒ ≈ ۱٫۵۹۰۹ | 30/22 ≈ 1.364 | — | S2 |
| (page proposals) ۱۰ ⇒ ۱۱, ۲۰ ⇒ ۲۲, ۱۰۰ ⇒ ۱۲۱ ; ۱۳۰ ⇒ ۱۰۴ | exact | — | right |
| s25 ellipsis and fraction lines | as round 28 | as round 28 | right |

## 🎯 table (pwC2 unless noted)
| forecast | conf. | 🎯 made? | outcome | settled |
|---|---|---|---|---|
| answer ≈ 50% | 80% | yes (text keeps lead words, C29-26) | 9.2% | نشد ✓ |
| two red ≈ 30% | 60% | **twice** (C29-8) | «۳۰٪ درست درومد» | asks «کدام؟», not settled |
| dice ≈ 10 sevens | 70% | yes | 11 | «شد یا نشد؟», lapsed |
| final > 17 | 70% ⇒ 80% | one, updated with history ✓ | 18 | شد ✓ |
| «فکر کنم ۷۰ درصد» Bayes exercises by Friday | 70% | yes ✓ | — | plus a 📅 date ask (C29-7) |
| «تقریباً مطمئنم» next chapter not hard | 80% (given) | yes ✓ | — | — |
| past 90% / coach's 70% | — | no ✓ | — | — |
| quiz ch. 3 / ch. 4 | 60/50 | yes, with text; filed under disease (C28-19) | «کامل جواب دادم» | «کدام؟» between the two ✓ |
| Friday review class | 40% | yes, «بی موعد», plus a 📅 ask (C29-7) | تشکیل شد | شد ✓ |
| ~10 study hours | 70% | yes | 9 | «این حدودِ ۱۰ حساب می‌شود؟» ✓ |
| midterm («مطمئنم» ⇒ «۶۰») | 60% | yes ✓ | — | — |
| ch. 5 exercises by Thursday | 75% | yes, plus a 📅 ask | — | — |
| ch. 5 quiz, 1 wrong | 60% | yes | «۱ بود، شد ۳» | «شد یا نشد؟» (C29-22) |
| pwC1: «با ۵۵٪ …» | 55% | **yes, wrongly** (C29-9) | — | asks |

## Date-ask table (aC3 unless noted)
| ask | her answer | booked |
|---|---|---|
| «بعد از عید» ⇒ «از ۱ فروردین ۱۴۰۶ به بعد — کدام روز؟» | — | nothing ✓ |
| «وسطِ ماه» ⇒ «کدام روز؟» | — | nothing ✓ |
| ✏️ «۲۰ آبان رفتم» ⇒ «این روز گذشته — کدام روز؟» | — | kept |
| «دوشنبه … داروخونه» ⇒ «۹ آذر — درست است؟» | «دوشنبه درسته» | 📌 9 Azar ✓ |
| ✏️ «۲ آذر» ⇒ «گذشته — کدام روز؟ (نه ۹ آذر)» | — | kept |
| two call plans ⇒ «۶ آذر · ۷ آذر — درست است؟» | «زنگ زدم» | «کدام؟» ✓, nothing closed |
| pharmacy «کدام روز؟» (still open) | «پسفردا … بیمه» | **📌 pharmacy 7 Azar** (C29-6) |
| «ماهِ دیگه» ⇒ «کدام روز؟» | — | nothing ✓ |
| «حدودِ ۱۵ دی» ⇒ «کدام روز؟» + «۱۵ دی — درست است؟» | — | lapsed (C29-21) |
| pwC2: Friday / Thursday forecasts ⇒ 📅 asks | — | lapsed; should not exist (C132) |
| s22: «تا شنبه‌ست» ⇒ «شنبه ۲ آبان … ؟» + «چیزی برای عوض کردن نبود» | — | — (C28-1) |

## Chat ⇄ page
- A separate problem in chat gets its own record and ledger: s23 p15, pwC1 p34. It does not for «یه مسئله:» in aC1 (C29-5).
- Prerequisite layer: as in round 28 (C28-7, C28-20).
- Forms: pC1's plan text is still lost (C26-33); pC3 works.
- 📜 now offers «↪» on every line, the statement, 🎯 and ledger steps. Move history uses the page date.
- The forecast book has «باز» and «داوری‌شده» lists and agrees with the settled states.

## Owner bank (C share)
| # | answer | where |
|---|---|---|
| 21 | نیست — sheet #102 | pwC1 |
| 22 | هست | pwC1, tC1 |
| 23 | هست | pwC2 p16 |
| 24 | نیمه — 2.5 ha propagates; 6 mm and 3 ha do not | pwC1 p10 / p27 / p32 |
| 25 | هست | s25 |
| 26 | هست | aC1 |
| 27 | هست | pwC1 |
| 28 | نیست — sheet #103 | pwC1 p24 |
| 29 | نیست | aC3, pwC2 |
| 30 | نیمه — an update no longer makes a second 🎯 (p36), but the marbles forecast is recorded twice (C29-8) | pwC2 |
| 31 | نیمه — s28 p4 | — |
| 48 | هست | s28 p6 |
| 49 | هست | pwC2 p18–p21 |
| 50 | نیمه — exact in s29 p9 and oC1; wrong in pwC1 p27 and s23 p14 | — |
| 60 | نیمه — s25 problem 3 has its own dossier and the correction reaches it; aC1 p25 has none (C29-5) | — |
| 61 | نیمه — «حساب کرد» ✓; «یه حسابِ دیگه هم کرد:» still filed as hers; «X گفت … پس» over-filed | aC1 p26–p30 |
| 68 | نیمه — «شد ۳» is not misread as «my forecast came true», but the page does not judge the numbers and asks «شد یا نشد؟» | pwC2 p48 |
| 69 | هست — a ✏️ to a past day no longer goes to next year; it asks «این روز گذشته — کدام روز؟» and keeps the booking | aC3 p39, p28 |

## Unit-only claims (round-28 fixers)
| claim | scenario · turn | result |
|---|---|---|
| A28-36 (no internal label on an undated 🎯) | pwC2 fcast view | held |
| C27-6 (C half) | pC2 p13 | **failed** (a chat problem is made) |
| C123 (statement «↪») | s24 c55 | held |
| C124 (step with dependants asks) | s23 c182, pwC1 c106 | **failed** |
| 🎯 move | pwC2 probe | held (destination and undo not reached) |
| ledger-step move | s23, pwC1 | held for move and undo |
| A28-13 (correction lands in the side problem) | s25 p25 | held for the address; the text is garbled (C29-15) |
| C118 | pwC2 p45 | held |
| C119 | pwC2 p43 | held |
| C120 | pwC2 p47 | held |
| C121 | pwC2 p37 | **failed** (C28-19) |
| C122 | pwC2 p44 | held |
| C105 | aC3 p33 | held |
| C106 (m2 reader) | — | not reachable (no m2 ask) |
| C108 | aC1 p23 | held after a division; **failed** after a subtraction (p21, S1) |
| «A و N دهم» | aC3 p34 | held for plain numbers; **failed** with «درصد» (S1) |
| narrower «≈» (C9) | s29 p15, aC3 p35 | held |
| C117 | aC3 p41 | held |
| C89 with two corrections | s23 p14, pwC1 p27/p33 | **failed** |
| C28-14 | pwC1 p27 | **failed** |
| D28-14 | — | not reachable (group-D shape) |
| C134 «what + weekday» | — | not run |

## Fixers' «Not done» lists
| fixer | item | result |
|---|---|---|
| arith | «M تا کم میاد» | not judged (aC1 p24) |
| arith | «a√b» | still نسنجیده (s29 p14) |
| arith | more than 5 compounds | **S1** (aC3 p36) |
| arith | m2 in the ledger | not reached |
| correction | C28-14 | still |
| dates | «حدودِ ۱۵ دی» | asks extra (C29-21) |
| dates | «وسطِ ماه کارگر میاد» | correctly no plan (aC3 p45) |
| forecast | C28-19 | confirmed |
| forecast | C28-22 | confirmed (pC3 s30) |
| story | «OTHER regex» | confirmed in the coach line (aC1 p15, p27) |
| story | moved 🎯 does not rewrite `x.prob` | not checked |
| prior | #226, #229, #235 | not run |
| surface | C27-6 | reproduced |

## Routing
- 386 AI calls: lla_coach 346, lla_assistant 26, learning_architecture 14.
- None was on the wrong task (`round29C/routing.md`).

## PARTS.md «نسبت به دورِ ۲۸»
| part | trend |
|---|---|
| حسابِ صفحه | better on «میلیون و M» (C28-11/12/13 fixed); worse: 3 new S1 shapes |
| موتورِ اصلاح | same: C28-2 fixed, C28-14 still, 5 new S2 |
| پذیرشِ پیشنهاد | better: it now acts (oC1, s29), but with 2 S2 |
| کارِ پیشین | better |
| تاریخ / امروز | better (F5 fixed, C93, C117), 1 new S2 |
| 🎯 دفترِ پیش‌بینی | much better (6 round-28 ids fixed), 3 new S2 |
| کارِ دیگری | same |
| جابه‌جایی | better (C28-23 fixed), C124 fails |
| مسئله‌های جدا | same |
| 📜 | same |
| پیش‌نیاز / 🧭 | same |
| فرم‌ها | same |
| لحن | better |
| پیگیری‌ها | same |

## Screenshots
- Round-29 arm shots: 4 of the 13 were opened as images (pwC2 forecast book, s23 and pwC1 ledger moves, aC3 dossier). The other 9 were checked only through the page text their eval returned.
- pC3: 7 of its 25 four-up sheets were opened (c00, c05, c07, c10, c15, c20, c24).
- Seen in them:
  - C28-20: the repeated prerequisite node;
  - C28-21: «««…»»» in the back buttons;
  - C28-22: «2026-10-18» in the step card;
  - C28-7: the prerequisite map titled by her raw message;
  - C29-25: the s23 heading still says 12.
- **Not every shot of the other runs was opened.** There are about 2,900 shots in all.

## New owner-like questions
- If I correct one number and then another, is the page's proposal built on both corrections, and does it tell me which one is stale?
- When two different «5»s are in my problem (a price and a millimetre), does the page know which one I corrected?
- If I say «امروز صبح فرمش رو پر کردم» about a plan, is the plan still kept for the day I named?
- If I write «۲ و ۵ دهم درصد × ۴ = ۱۰ درصد», does the page understand that «درصد» is the unit on both sides?
- When I move a step that other steps depend on, will the page ask before leaving them behind?
- Does a weekday in my forecast become its due date, or a reminder I never asked for?
- My dad told me a fact and I worked out the rest — whose work is it on my record?

## Question for the coordinator
C93 asks «کدام روز؟» even when the ✏️ text is a past-tense report («۲۰ آبان رفتم بانک»). From her side the act is done. I followed the ruling and did not book it as a defect.

## Time
- 07:30–10:25 UTC (about 2 h 55 min).
- Tokens: not visible to me.

## Files
All under `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round29C/`:
- `defects.md`
- `PARTS.md`
- `routing.md`
- `<sid>/findings.md`, `<sid>/ai/`, `<sid>/better/`
- `seg29/` (the round-29 segments and probes)
- `pC3/cs4/` (the screenshot review sheets)
