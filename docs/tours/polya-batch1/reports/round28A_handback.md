# Round 28 — Group A runner: final report

All 21 group-A scenarios were re-run on main 33f7de9f (`build.py --check` in sync, dist newer than the merge). Round-27 replies were replayed, and new turns were added for arms T13–T20 and story bank #78/#92.

**Result: 2 PASS (s06, pA2), 19 FAIL.**
- **2 S1** this round (round 27 had none in A): A28-5 (s01 📜) and A28-40 (pwA2 p10).
- 21 S2 ids are new; 19 S3 ids are new.

**Round-27 defects:** 21 of 22 A27 ids are FIXED (A27-14 and A27-19 only partly). A27-22 is STILL.

**Housekeeping**
- **Output:** `T/round28A/`. Each scenario has `findings.md` (UTF-8 checked), `RESULT.txt`, `DONE`, `route_table.md`, `ai/`, `out/` (shots), dossier/mind/Today/route texts and `better/` where a turn failed. The round folder also has `defects.md`, `PARTS.md`, `mail_log.txt` and `pids.txt`.
- **E-mails:** 21 of 21 sent through Gmail to the owner's address. The address is in no file. `STORYBOARD_LINKS.md` has a round-28 A line.
- **Isolation:**
  - The page runs from file://, so no port was used.
  - Only my own PIDs were killed. Two of them were a leftover s01 harness from my first, aborted attempt; I killed them and re-ran s01 clean.
  - All my browser profiles are deleted.
  - The repo is untouched (`git status` is clean).
- **Not deleted:** nothing outside my own folders.

## 1. Result per scenario
| Scenario | Result | Defects (turn) |
|---|---|---|
| s01 | FAIL | **A28-5 S1** (📜); A28-1 S2 (p23, p24, p31), A28-2 S2 (p27), A28-3 S2 (p29), A28-4 S2 (p32–p35); A28-6 S3 |
| s02 | FAIL | S3: A26-8 (p11), A28-7 (p10), A28-8 (p17), A28-9 (p17), A28-10 (p17), A28-11 (p19), A28-12 (📜) |
| s03 | FAIL | A28-13 S2 (📜); A26-9 (p4), A26-10 (p14) S3 |
| s04 | FAIL | A28-14 S2 (p14), A28-16 S2 (p19); A28-15 S3 (p17) |
| s05 | FAIL | A28-18 (p22), A28-20 (p24), A28-21 (p25), A28-22 (p26), A28-25 (p29), A28-26 (p30) S2; A28-17, -19 (p23), -23 (p27), -24 (p28) S3 |
| s06 | **PASS** | — |
| s07 | FAIL | S3: A23-24 (p7), A27-14 CHANGED (📜) |
| s08 | FAIL | S3: A28-12, A28-27 (📜) |
| s09 | FAIL | S3: A25-21 (p17), A28-12 (📜) |
| s10 | FAIL | S3: A23-8 (🧭) |
| pA1 | FAIL | S3: A26-9 (p3) |
| pA2 | **PASS** | — |
| pA3 | FAIL | S3: A26-19 (mind) |
| aA1 | FAIL | A28-29 S2 (📜); A23-19 (p1), A28-30 (p10) S3 |
| aA2 | FAIL | S3: A26-25 (mind) |
| aA3 | FAIL | A27-19 CHANGED S2 (p8); A28-31 S3 (p8) |
| aA4 | FAIL | A26-29 S2 (p6); A26-30 S3 (Today) |
| tA1 | FAIL | S3: A25-17 (p9), A26-39 (📜), A28-32 (T1) |
| oA1 | FAIL | A27-22 STILL, A28-33 (T13), A28-34 (p33), A28-35 (fcast) S2; A28-17, A28-36 S3 |
| pwA1 | FAIL | A28-37 S2 (p19) |
| pwA2 | FAIL | **A28-40 S1** (p10); A28-38 S2 (p7), A28-16 S2 (p8); A28-39 S3 (p7) |

## 2. New defects (full list with quotes in `round28A/defects.md`)

**S1**
- **A28-5 (s01 📜):** she fixed her own line to «۱۸ میلیون × ۱۲ = ۲۱۶ میلیون». It is correct, but in her dossier it still carries «✗ … نمی‌خواند». The mark is stale from before her fix.
- **A28-40 (pwA2 p10):** an eight-year-old wrote «۵ و ۵ و ۵ میشه ۱۵، ۳ تا می‌مونه، پس ۴ روز». The page told the coach ✗ «۵ و ۵ و ۵ را «۱۵ و باقی‌ماندهٔ ۳» نوشته — حسابِ صفحه: ۱۵». The «… تا می‌مونه» clause was glued onto the sum's result. A literal coach then told the child the sum was wrong. It was fixed only after the child disputed it at p11, and the earlier ✗ was never withdrawn. The correct reply is in `pwA2/better/r10.txt`.

**S2**
- **A28-1:** a negated or new day in a new message rewrites the pending ask of another act.
  - p23: «بانک؛ پنجشنبه نه، شنبه» moved the agency-call ask to Saturday.
  - p24: her «فقط بانک شنبه‌ست» put both acts on the negated Thursday.
  - p31: «عید» moved the «آخرِ سال» ask.
- **A28-2:** a ✏️ that moves a booked day to «دیروز» changes the plan text, but the 15 Azar booking stays and nothing is asked.
- **A28-3:** her next message, with no yes («قبضِ آب رو هم اولِ ماه می‌دم»), booked the pending «سرِ برج» ask.
- **A28-4:** «بعد از عید», «وسطِ ماه» and «آخرِ سالِ تحصیلی» each got «امروز خودش جمعه است: همین امروز یا جمعهٔ بعد (۱۸ آذر)؟». The page clock says Wednesday.
- **A28-13:** the main problem's plan correction also appears in the side problem's 📜.
- **A28-14:** the correction «۴ ⇒ ۵ نفر» replaced the whole datum sentence with «۵».
- **A28-16:** «آره، همون ۲٫۲/۲۰ درسته» to a stale proposal does nothing. This held in a live/chat problem (s04) and also in the prior ledger (pwA2), where the fixer claimed it was built.
- **A28-18:** «فکر کنم ۷۰ درصد …» makes no 🎯.
- **A28-20:** a past confidence («پارسال ۹۰ درصد … نشد») triggers «شد یا نشد؟» on an unrelated 🎯.
- **A28-21:** a new number for the same forecast makes a second 🎯 (C77 says update with history).
- **A28-22:** «…؛ ۷۰ درصد. …؛ ۹۰ درصد.» makes no 🎯.
- **A28-25:** bank #92 — «امتحان رو ۱۸ شدم، همون‌طور که با ۹۰ درصد گفته بودم» is not settled.
- **A28-26:** «یکی از ۷۰ درصدی‌هام درست شد» with four open 🎯 gets no page «کدام؟».
- **A28-29:** the child's own sentence «مامانم کمکم کرد تاریخ رو نوشت. تولدم …» is filed in 📜 as «کارِ دیگری — از زبانِ مامانم».
- **A28-33 (T13):** no «↪ این سطر مالِ مسئلهٔ … است» button appears on any misfiled line in oA1 (0 `.lp-dmv` in the DOM; the model has one button only, on «newprobs»). 🎯 and ledger steps have no move control either.
- **A28-34:** her complaint quoting a line from «امروز» became a new date ask.
- **A28-35:** a 🎯 the page settled «⇐ شد» is still open (شد/نشد buttons) in «🎯 دفترِ پیش‌بینی».
- **A28-37:** «۷ × ۸ = ۵۶ بود دیگه؟» at an opening fires the prior-work block (C56).
- **A28-38:** a stale proposal «۳ ⇒ ۲٫۵» came from equal digits. That «۱۲» was the pages remaining, not day 1; the true value is 4 days (C47/C66).
- **A27-19 CHANGED (aA3):** the drift to the next day is gone, but after «زنگ زدم» Today still asks «انجام شد؟». The fixer's simple «done» stem does not read «زنگ زدم».

**S3**
- A28-6: two ✏️ are merged into one 📜 event (s01).
- A28-7: «sqrt(…)» is not checked (s02).
- A28-8: «۲√۳ ≈ ۳٫۴۶» gets no line (s02).
- A28-9: the correct «۲ میلیون و ۸۰۰ + ۲۰۰ هزار انعام = ۳ میلیون» gets no line (s02).
- A28-10: the ✗ on «N میلیون و M» shows one value only, as raw digits «۱۰۰۰۴۰۰» (s02).
- A28-11: her answer to «کدام خوانش؟» is not read (s02).
- A28-12: calculations the model did not report are missing from 📜 (s02, s08, s09).
- A28-15: «این اصلاح انجام نشد» for a message that was no correction (s04).
- A28-17: 🎯 text keeps «(۷۰٪)» and a lead word (s05, oA1).
- A28-19: «تقریباً مطمئنم» is not asked for a number (s05).
- A28-23: the exam 🎯 took another sentence's due date (s05).
- A28-24: bank #78 «شد ۳ تا» gets «شد یا نشد؟» instead of «نشد» (s05).
- A28-27: the invented puzzle's result also sits under its parent problem (s08).
- A28-30: the brother's arithmetic is neither in 📜 nor labelled for the coach (aA1).
- A28-31: «موعدِ … در موعدهای باز نیست» is shown to her (aA3).
- A28-32: the tie ❓ shows two identical candidate names (tA1).
- A28-36: «(دورِ ۲۷، C53)» is visible in her view (oA1).
- A28-39: «maybe» appears in a page line (pwA2).
- The displayed expression drops the second factor's unit (s01).

## 3. «ارتقای لازم»
- **Arithmetic reader:**
  - a «… تا می‌مونه» clause is its own sentence;
  - read «sqrt(…)» like «√»;
  - «a√b ≈ c» is «نسنجیده»;
  - add a reader for the `m2` answer;
  - a ✗ shows both readings, in her own scale.
- **📜:** take the ✓/✗ from the line's current text, not its first version.
- **Date engine:**
  - one ask per act; «X نه، Y» touches only its own act;
  - book only on a yes;
  - vague idioms are asked with no number and never with «امروز جمعه است»;
  - a ✏️ into the past is asked about;
  - «زنگ زدم / خریدم» closes the act.
- **Corrections:**
  - replace the smallest fragment;
  - C68 «آره، همون X» everywhere;
  - proposals only from recorded dependency.
- **🎯:**
  - one reader for «number + درصد / مطمئن / احتمال / فکر کنم» anywhere in the sentence;
  - a new number updates the same 🎯 with history;
  - comparison outcomes settle («شد ۳ تا» against 4; «۱۸» against «بالای ۱۷»);
  - the page asks «کدام؟» when several could match;
  - the fcast view agrees with the settled state.
- **Move control (C78):** on every misfiled chat line (including «کارِ تو»), on 🎯 and on ledger steps. A third problem raised mid-way gets its own record.

## 4. Round-27 defect table
| id | status | turn |
|---|---|---|
| A27-1 | FIXED | s01 p16, aA3 p7 |
| A27-2 | FIXED | s01 p18 |
| A27-3 | FIXED | s01 p16 |
| A27-4 | FIXED | s02 📜 |
| A27-5 | FIXED | s02 p10–p12 |
| A27-6 | FIXED | s03 p17 |
| A27-7 | FIXED (the ask quote now holds the corrected day) | s04 p8–p11 |
| A27-8 | FIXED | s04 p12 |
| A27-9 | FIXED | s04 p16–p17 |
| A27-10 | FIXED | s05 p8, s10 p7 |
| A27-11 | FIXED | s05 p17 |
| A27-12 | FIXED | s05 📜 |
| A27-13 | FIXED | s06 p8, pA2 p8 |
| A27-14 | CHANGED: one event now; the stale history is still garbled | s07 📜 |
| A27-15 | FIXED | s09 p5–p8 |
| A27-16 | FIXED | s09 p15 |
| A27-17 | FIXED | s10 p9–p11 |
| A27-18 | FIXED | aA1 p4 |
| A27-19 | FIXED in aA4 and oA1; CHANGED in aA3 | aA3 p8 |
| A27-20 | FIXED | aA3 Today |
| A27-21 | FIXED | pwA1 p17 |
| A27-22 | STILL | oA1 📜 |
| A26-8 | STILL | s02 p11 |
| A26-9 | STILL | s03 p4, pA1 p3 |
| A26-10 | STILL | s03 p14 |
| A26-15 | FIXED | s04 p14 |
| A26-19 | STILL | pA3 |
| A26-20 | FIXED | pA3 p12 |
| A26-25 | STILL | aA2 |
| A26-29 | STILL | aA4 p6 |
| A26-30 | STILL | aA4 |
| A26-39 | STILL | tA1 |
| A25-17 | STILL | tA1 p9 |
| A25-21 | STILL | s09 p17 |
| A23-8 | STILL in s10; FIXED in pwA1 | s10 🧭 |
| A23-19 | STILL | aA1 p1 |
| A23-24 | STILL | s07 p7 |

The three round-27 S1 shapes were checked where group A has the same shape:
- **D27-18** (sum/product «و»): T19 «۳ × ۴۰۰» is ✓, and the multiplication words in aA1 p4 are read as products ✓.
- **D27-1** («گرد کردم» bound to another person's line): no such binding was seen (s02 p14 binds to her own line).
- **D27-2** (hypothetical read as dispute): pwA1 p18 PASS.

The new S1 A28-40 is a sibling of D27-18: a «و» sum misread.

## 5. ARMS TABLE
| Arm | Scenario · turn | Verdict |
|---|---|---|
| T1 tie | tA1 c67 | PASS (asks, no declaration); S3 A28-32 (identical names) |
| T2 piece after closure | tA1 c92 | PASS |
| T3 «= N unit» | s01 p16; s08 p10 | PASS (✓ «۳ متر در ۴ متر», ✗ «۳ در ۳ = ۱۲», ✗ «۷ + ۱۱ = ۱۷», ؟ «۶۱۳۱», ✓ «۱۰۲ دقیقه») |
| T4 third prior report | pwA1 p17 | PASS (merged, step 6 added) |
| T5 take back own dispute | pwA1 p10–p11 (replay) | PASS |
| T6 «جمعهٔ بعد» / «باشه» | s10 p11; s01 p16, p18 | PASS |
| T7 correction ۵⇒۴ | s04 p14, p17; pwA2 p7; s07 p7 | PASS (exact), except pwA2 «۳ ⇒ ۲٫۵» (A28-38) |
| T8 two open predictions | s05 p15–p19 | PASS |
| T9 coincidental number | s04 p14; s07 p9–p10 | PASS; pwA2 p7 FAIL (A28-38) |
| T10 division three ways | s02 p13 | PASS |
| T11 correction + question | s04 p16 | PASS |
| T12 mid-session / one-step opening | s02 p10, s06 p7, pA2 p6; s06 p8, pA2 p8 | PASS both |
| T13 move a misfiled 📜 line | oA1 (dossier of «دست‌دادن‌ها») | FAIL: no button shown (A28-33); 🎯 / ledger move: not possible (no control) |
| T14 accept proposal | s04 p19 (chat/live); pwA2 p8 (ledger); negation s04 p20 | FAIL in both (A28-16); negation PASS (mark stays) |
| T15 scale and roots | s02 p15–p19 | √ correct ✓ / wrong ✗ PASS; one reading ✓ PASS; both readings ⇒ asks ✓ PASS; none fits ⇒ ✗ with one raw value (S3 A28-10); «۲√۳» silent (S3 A28-8); m2 answer unread (S3 A28-11) |
| T16 date asks | s01 p20–p27 | two asks + yes ⇒ newest only PASS; ✏️ of a booked day ⇒ one history line, one ask PASS; ✏️ into the past FAIL (A28-2); «پنجشنبه نه، شنبه» FAIL (A28-1) |
| T17 idiom dates | s01 p28–p35 | سرِ برج / اولِ ماه / آخرِ سال / عید ⇒ 1 Dey / 1 Dey / 29 Esfand / 1 Farvardin (ICU-verified) PASS; بعد از عید / وسطِ ماه / آخرِ سالِ تحصیلی FAIL (A28-4); a yes to «آخرِ سالِ تحصیلی» booked nothing PASS; side effects A28-1 and A28-3 |
| T18 confidence phrasings | s05 p20–p30 | «N درصد مطمئنم» ✓; «احتمالش N درصده» ✓; «فکر کنم N درصد» ✗; «تقریباً مطمئنم» ✗ (no ask); past / other ✓ (no 🎯) but A28-20; new number ✗; two in one ✗ («؛ N درصد») / ✓ («N درصد مطمئنم»); one-match outcome asks instead of settling (#78); #92 ✗; «کدام؟» ✗ |
| T19 someone else's work | aA1 p10–p11 | partial: not booked as hers, not in the mind card; not filed as «کارِ دیگری» (A28-30); adoption ⇒ nothing; her own sentence misfiled as the mother's (A28-29) |
| T20 hypothetical / bare question | pwA1 p18, p19 | conditional ≠ dispute PASS; the later fact in the same message is applied PASS; «۷ × ۸ = ۵۶ بود دیگه؟» opens prior work FAIL (A28-37); a one-step opening fires PASS (s06, pA2) |

**Story bank:** #78 partial (s05 p28: binds to the right 🎯, other untouched, but asks «شد یا نشد؟»); #92 FAIL (s05 p29).

## 6. 📜 line match (multi-problem scenarios, with page marks)
| Scenario | Problem | Own lines (marks) | Wrong / missing |
|---|---|---|---|
| s01 | contract session | prior ✓✓; «۳ در ۴ = ۱۲» ✓; «۳ در ۳ = ۱۲» ✗; ودیعه ✓ ✓; «۲۱۶ میلیون» **✗ (stale)**; 🎯; 12 plan lines | A28-5; A28-6 |
| s01 | «هفت سال دیگر…» / «خرید یا اجاره» | own only | none |
| s02 | «لوله در بارِ وانت» | ✓ ×4; ✗ «۰٫۷» with unit ✗; ✓ «۰٫۰۷»; ✓ «۱۳/۱۲ = ۱٫۰۸» | missing p13, p15–p18 (A28-12) |
| s03 | main problem / «اگر ۴ نقطه…» / «شش نقطه» / square + practice | ✓ «۵۵»; practice lines | plan correction duplicated under «اگر ۴ نقطه» (A28-13) |
| s05 | «ترفیع و مدیر» / «گفت‌وگوی پرسشی» | all 🎯 with outcomes; practice sessions | none (text noise A28-17) |
| s06 | «پرداختِ دوباره» / new chat | ✓ «۰٫۲۵٪»; prior ✓ | none |
| s08 | «۷ و ۱۱» / «۵ و ۹» | ✓ «۹ − ۵ = ۴، ۹ + ۴ = ۱۳» | duplicated under the parent (A28-27); p10 missing (A28-12) |
| s09 | three cake problems | ✗ «۲۴ میلیون» + re-check; ✓ «۸۰۰ هزار» | p15 missing (A28-12) |
| pA2 | «حراجِ کفش» / new chat | ✓ «۱۸۷٫۵»; prior ✓ | none |
| aA1 | «تقسیمِ شیرینی‌ها» | own | false «کارِ دیگری» (A28-29); brother missing (A28-30) |
| oA1 | handshakes / stay-or-go / 45-minute meeting | handshakes ✓ (54, 66, «۱ + … + ۱۱ = ۶۶» ✓) | decision lines and meeting arithmetic under handshakes; the meeting has no record (A27-22) |

## 7. Prior-work verdicts
| Scenario | Outcome |
|---|---|
| s01 p15 | two-step opening, both ✓ |
| s06 p8, pA2 p8 | one-step opening fires (A27-13 FIXED) |
| s02 p10, s03 p19, pA2 p6 | mid-session: no block ✓ (including small talk «۲ × ۳ = ۶ تا تخم‌مرغ») |
| pwA1 | per-step verdicts, mixed reply, re-check, take-back, second and third report merged ✓; hypothetical ✓; bare question ✗ (A28-37) |
| pwA2 | per-step verdicts, own fixes, mind «کارِ پیشین ۶ از ۶» ✓; correction marks stale ✓; one wrong proposal (A28-38); accept ✗ (A28-16); S1 A28-40 |

## 8. Arithmetic (exact values checked)
| She wrote | Exact | Page | Verdict |
|---|---|---|---|
| ۱۸ × ۱٫۲۲ = ۲۱٫۹۶ ؛ ۲۱٫۹۶/۶۰ = ۰٫۳۷ (s01) | 21.96 ; 0.366 | ✓ ✓ | right |
| ۳ متر در ۴ متر = ۱۲ ؛ ۳ در ۳ = ۱۲ | 12 ; 9 | ✓ ; ✗ | right |
| ۲۰۰ میلیون / ۴۸ = ۴٫۱۷ ؛ ۲۰٪ × ۳۰۰ = ۶۰ ؛ ۱۸ میلیون × ۱۲ = ۲۱۶ هزار | 4.167 ; 60 ; 216 million | ✓ ✓ ✗ | right |
| ۱۸ میلیون × ۱۲ = ۲۱۶ میلیون (after her fix, in 📜) | 216 million | ✗ | **S1 A28-5** |
| ۳٫۲² … = ۱۵٫۷۳ ؛ sqrt(۱۵٫۷۳) ≈ ۳٫۹۷ (s02) | 15.73 ; 3.966 | ✓ ; — | S3 (A28-7) |
| ۳٫۹۷ − ۳٫۹ = ۰٫۷ ؛ ۰٫۷ متر = ۷ سانت | 0.07 ; 70 | ✗ ✗ | right |
| ۴/۳ = ۱٫۳۳ ؛ ۸ ÷ ۳ = ۳ ؛ ۱۳/۱۲ = ۱ ; ۱٫۰۸ | 1.333 ; 2.667 ; 1.083 | ✓ ؟ ✗ ✓ | right |
| √(۱۵² + ۸²) ≈ ۱۷ ؛ ≈ ۱۶ | 17 | ✓ ✗ | right |
| ۲√۳ ≈ ۳٫۴۶ | 3.4641 | none | S3 (A28-8) |
| ۲ میلیون و ۸۰۰ + ۲۰۰ هزار = ۳ میلیون | 3,000,000 | none | S3 (A28-9) |
| ۲ میلیون و ۸۰۰ ÷ ۲ = ۱ میلیون و ۴۰۰ / ۵۰۰ | 1,400,000 or 1,000,400 | ✓ / ✗ (one raw value) | right / S3 |
| ۲ میلیون و ۸۰۰ × ۲ = ۵ میلیون و ۶۰۰ ؛ ÷ ۲ = ۱۴۰۰ | 5.6 million ; 1400 thousand | ✓ ; ؟ (asks which reading) | right |
| ۱ + … + ۲۰ = ۲۱۰ ؛ ۱ + … + ۱۰ = ۵۰ ؛ ۱ + ۳ + … + ۱۹ = ۱۰۰ ؛ ۱ + … + ۱۰۰ = ۵۰۵۰ (s03) | 210 ; 55 ; 100 ; 5050 | ✓ ✗ ✓ ✓ | right |
| π × ۲² = ۱۲٫۵۶ ؛ ۱/۲ + ۱/۳ = ۵/۶ ؛ ۱۷ ≡ ۲ (mod ۵) ؛ 2x + 3 = 11 ؛ «۱۷ از ۲۰» | — | ✓ ✓ silent silent silent | right |
| ۲ × ۳ = ۶ تا تخم‌مرغ (small talk) | 6 | ✓, not prior work | right |
| ۱۱ میلیارد / ۴ = ۲٫۷۵ ؛ ۲۷۵۰ میلیون / ۱۰ = ۲۷۵ ؛ ۱۱ / ۵ = ۲٫۲ ؛ ۲٫۷۵ میلیارد / ۱۰ = ۲۷۵ میلیون (s04) | exact | ✓ ×4 | right |
| ۳ / ۱۲۰۰ = ۰٫۲۵٪ ؛ ۲۰۰ × ۳۶۰۰ = ۷۲۰۰۰۰ (s06) | exact | ✓ ✓ | right |
| ۷ + ۱۱ = ۱۷ ؛ ۲۹۴۳۰۰ ÷ ۴۸ = ۶۱۳۱ ؛ ≈ ۱۰۲ دقیقه (s08) | 18 ; 6131.25 ; 102.18 | ✗ ؟ ✓ | right |
| (۹۰۰ − ۳۸۰) × ۳۲ = ۱۶ میلیون و ۶۴۰ ؛ ۳۲ × ۸۰۰ هزار = ۲۴ میلیون (s09) | 16,640 thousand ; 25.6 million | ✓ ; ✗ (re-check kept) | right |
| pA2: (۲۰۰+۱۵۰+۲۵۰)/۳ = ۲۰۰ ؛ ۱ = ۱/۲ + ۱/۳ + ۱/۶ ؛ ۲۰۰/۱۰۷۵ = ۰٫۱۹ ؛ ۱۲۵۰ × ۰٫۸۵ = ۱۰۶۲٫۵ ؛ ۱۰۶۲٫۵ − ۸۷۵ = ۱۷۸٫۵ ؛ ۴۰ میلیون × ۱٫۲ = ۴۸ | … ; 187.5 ; 48 | ✓×5 ✗ ✓ | right |
| pA3: ۷٫۲ متر مربع = ۷۲۰۰۰ ؛ ۸/۱٫۵ = ۵٫۳۳ ؛ ۵ ذرع = ۵٫۲ | 72000 ; 5.333 ; — | ✓ ✓ «نسنجیده» | right |
| aA1: ۳ تا ۸ تا = ۲۴ ؛ ۲۴ − ۵ = ۱۹ ؛ ۳ تا ۶ تا = ۱۸ ؛ (brother) ۳ × ۴۰۰ = ۱۲۰۰ هزار | exact | ✓ ✓ ✓ ✓ | right |
| pwA2: ۱۲ + ۲۴ = ۳۴ ؛ ۱۰ × ۲ = ۲۰ ؛ ۱۰ + ۲۰ = ۳۰ ؛ ۴۸ − ۳۰ = ۱۸ | 36 ; … | ✗ ✓ ✓ ✓ | right |
| pwA2: ۵ و ۵ و ۵ میشه ۱۵، ۳ تا می‌مونه | 15 | ✗ | **S1 A28-40** |
| pwA2 page proposal «۳ ⇒ ۲٫۵» | 4 days | proposed | S2 A28-38 |

## 9. 🎯 table
| Forecast | Confidence | 🎯? | Outcome | Settled where |
|---|---|---|---|---|
| مدیرم تا جمعه تأیید می‌کنه | ۷۰ | ✓ | «مدیرم امروز تأیید کرد» | شد — chat line + 📜 (p17) |
| رضا تا جمعه ثبت‌نام می‌کنه | ۴۰ | ✓ | «اون یکی درست درنیومد» | نشد (p18) |
| گزارش تا آخرِ هفتهٔ بعد | ۷۰ ⇒ ۸۰ | ✓ + duplicate ✗ | — | open |
| دوره تا آخرِ دی | «احتمالش ۷۰» | ✓ | — | open |
| مدیر مرا انتخاب کند | «فکر کنم ۷۰» | ✗ | — | — |
| رضا دوره را می‌رود | «تقریباً مطمئنم» | ✗ (no ask) | — | — |
| ۴ قفسه تا آخرِ هفته | ۷۰ (only with «مطمئنم») | ✓ | «شد ۳ تا» | asked «شد یا نشد؟» (p28) |
| امتحان بالای ۱۷ | ۹۰ | ✓ (due wrong) | «۱۸ شدم» | not settled (p29) |
| «یکی از ۷۰ درصدی‌ها درست شد» | — | — | — | no «کدام؟» (p30) |
| oA1 «مدیرم … پیشنهادِ ترفیع» | ۴۰ | ✓ | settled «⇐ شد» via practice_log | fcast view still open (A28-35) |
| aA3 «داروساز می‌گوید اشکالی ندارد» | ۷۰ | ✓ | «پیش‌بینی‌ام درست بود» | replay ✓ |

## 10. Date-ask table
| Ask | Her answer | Booked |
|---|---|---|
| s01 «تا جمعه امضاش» ۱۳ آذر | «باشه، جمعه پیگیری کن» | 📌 ۱۳ آذر ✓ |
| s01 same ⇒ «جمعهٔ بعد» | — | asks ۲۰ آذر ✓ |
| s01 agency ۱۲ / keys ۱۳ آذر | «آره» | keys only ✓ |
| s01 bank «پنجشنبه نه، شنبه» | «فقط بانک شنبه‌ست» | both on Thursday ✗ |
| s01 ✏️ keys ⇒ یکشنبه | «آره، یکشنبه» | 📌 ۱۵ آذر ✓ (one ask) |
| s01 ✏️ ⇒ دیروز | — | ۱۵ آذر kept ✗ |
| s01 سرِ برج ۱ دی | next message, no yes | 📌 ۱ دی ✗ |
| s01 اولِ ماه ۱ دی / آخرِ سال ۲۹ اسفند / عید ۱ فروردین | — | asked ✓ (one shifted ✗) |
| s01 بعد از عید / وسطِ ماه / آخرِ سالِ تحصیلی | «آره» (to the last) | nothing booked ✓; wrong «امروز جمعه است» ask ✗ |
| s04 پنجشنبه ⇒ شنبه ۹ آبان | — | asked, lapsed ✓ |
| s05 ✏️ فردا ⇒ پنجشنبه ۷ آبان | — | re-asked ✓ |
| s05 two 🎯 جمعه ۶ آذر | «آره درسته، هر دو جمعه» | both ✓ |
| s09 تا ۱۵ آذر ⇒ ۲۰ آذر | — | asked ✓ («تا تا» text) |
| s10 ✏️ جمعه ⇒ پنجشنبه | — | asked ✓ |
| s10 «تا جمعه» on a Friday | «جمعهٔ بعد.» | 📌 ۱۵ آبان ✓ |
| aA3 «فردا صبح زنگ می‌زنم» ۲۵ مهر | «بله، لطفاً فردا یادم بیندازید» | 📌 ۲۵ مهر ✓ (stays after «زنگ زدم» ✗) |
| oA1 quoted Today line | — | spurious ask ✗ (A28-34) |

## 11. Chat ⇄ page
- **Agree:**
  - corrections in s04, s07, s09 and oA1;
  - the re-check in s09;
  - the territory loop in tA1;
  - prior-work merges in pwA1;
  - the 🎯 settlements in s05 (p17–p18).
- **Disagree:**
  - s01: the coach says the ✏️ «دیروز» was corrected, while the booking stays.
  - s01: her fixed line shows ✗ in 📜.
  - s02: the coach accepted her m2 answer; the page did not read it.
  - s04 and pwA2: the coach accepted «آره، همون X»; the page did nothing.
  - s05: the coach accepted the exam result; the 🎯 stays open.
  - pwA2: the page told the coach ✗ for correct work.
  - oA1: «⇐ شد» in chat, open in fcast.

## 12. Owner bank (A: 1–10, 42–44, 54–56)
| # | Verdict | Evidence |
|---|---|---|
| 1 | partial | s04 p17, s07 p7, s09 p17 ✓; A28-14, A28-16 ✗ |
| 2 | exists | 📜 / 📚; filing A27-22 |
| 3 | exists | «از کجا؟» (oA1 replay) |
| 4 | missing | sheet #101 (built by routine, noted) |
| 5 | exists | aA2 1-3-7 cycle |
| 6 | partial | ages ✓; one browser = one profile (sheet #102, replay) |
| 7 | exists | pA1–pA3 |
| 8 | exists | 🧭 (pwA1 ✓; s10 stale destination A23-8) |
| 9 | exists | tA1, all arms |
| 10 | exists | «خودِ سامانه» map |
| 42 | partial | move control exists in code but was not offered on oA1's misfiled lines (A28-33; shot t13_no_move_button) |
| 43 | exists | «از کجا؟» |
| 44 | partial | «کدام پیش‌بینی؟» and quote-settles work (s05 p17–p19); comparison outcomes and «یکی از …» fail (A28-24/25/26) |
| 54 | partial | when a yes books, the line names the item (s01 p22 «✓ … 📌 «پس‌فردا…»»); when a yes binds nothing, the page is silent (oA1 p35) |
| 55 | exists / partial | «🎯 دفترِ پیش‌بینی» lists them (shot bank55_fcast); a settled 🎯 is shown open (A28-35) |
| 56 | partial | tA1 tie ❓ works, but both names are identical (A28-32); naming one by its distinct part was not testable |

## 13. Routing
All 341 judged turns went to the right task:
- coaching ⇒ `lla_coach`;
- ✏️ and pure commands ⇒ `lla_assistant`;
- sheet routines ⇒ `learning_architecture`.

There is a `route_table.md` in each scenario.

## 14. PARTS — «نسبت به دورِ ۲۷» (`round28A/PARTS.md`)
- **Better:**
  - the arithmetic reader (six A27 ids fixed), but one new S1;
  - prior work (one-step opening, third-report merge, hypothetical);
  - corrections («X نه Y» with a question, second-order stale);
  - dates in the round-27 shapes («باشه», «جمعهٔ بعد», ✏️ re-ask, no drift, today's weekday);
  - 🎯 basic settle and 🎯 in 📜;
  - 📜 marks and one event per ✏️.
- **Same:**
  - territory loop;
  - prerequisites;
  - mind card (A26-19, A26-25);
  - practice.
- **Worse or new families:**
  - date asks across several acts (A28-1/3/4);
  - stale ✓/✗ after her own fix (S1);
  - the «… تا می‌مونه» sum misread (S1);
  - T18 phrasings;
  - C68 not effective;
  - move control not offered.

## 15. Fixers' «Not done» claims, as tested
| Claim | Result |
|---|---|
| `m2` «کدام؟» has no reader | confirmed (s02 p19) |
| C68 in a chat-only problem not built | confirmed (s04 p19); also failed in the ledger (pwA2 p8) |
| ✏️ moving a booked day into the past asks nothing | confirmed (s01 p27) |
| «done» detection uses a simple stem | «زنگ زدم» not read (aA3) |
| D27-29 second half | the practice schedule IS in the prompt (aA2 p13) |
| 🎯 and ledger steps cannot be moved | confirmed |
| C27-6 (no new chat problem after closure) | the after-closure piece got its own waiting row (tA1 T2); I did not check for a stray chat problem — not verified |

NOT RUN:
- #233 (needs a multi-day ✏️ backfill; no scenario of that shape in A);
- #236 facet «خبرِ خواب» (group C shape);
- s28 p4 / C25-7′ (group C shape);
- D27-16 (group D).

## 16. New owner-like questions
- If I fix my own number, why does the dossier still show the old ✗ next to the new line?
- When I say «X نه، Y» about one task, how do I know the page did not move another task's date?
- When I say «آره» to the page's corrected number, where can I see that it was accepted?
- Which forecasts did the page not record because of how I phrased the confidence?
- If the page says «امروز جمعه است» and it is not, where do I report it?

## 17. Use
- **Wall clock:** about 09:13 to 12:50 UTC (about 3 h 37 min), in one context.
- **Prompts:** 341 model prompts were answered. Most were replayed from round 27; about 60 were fresh or edited.
- **E-mails:** 21 sent.
- **Tokens:** not visible to me.

## 18. My own mistakes (d)
- **s01 first run:**
  - I copied round-27's `ovr/` folder, which holds round-26 numbering.
  - The first harness was not killed (`start.sh` recorded the subshell PID), so two harnesses shared s01's ctl.
  - I killed both, fixed `start.sh` to record the node PID, and re-ran s01 clean. All s01 evidence comes from the clean run.
- **s01 p34:** I gave a shortened plan text containing «...».
- **s02 p15:** my reply did not follow the turn question.
