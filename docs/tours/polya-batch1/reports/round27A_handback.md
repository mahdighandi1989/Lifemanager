# Round 27 — Group A runner: final report

All 21 group-A scenarios were re-run on main 253b357a (dist in sync, built after the merge), with the round-26 replies replayed and new turns added for the arms. Result: **2 PASS (s08, pwA2), 19 FAIL. No S1 anywhere** (round 26 had three). 11 scenarios have an S2 as their worst defect; 8 have only S3.

- Output: `T/round27A/` — per scenario `findings.md` (UTF-8 checked), `RESULT.txt`, `DONE`, `route_table.md`, `ai/`, `out/` (shots incl. dossiers, mind card, Today, route), plus `PARTS.md`, `defects.md`, `mail_log.txt`, `pids.txt`.
- E-mails: 21/21 sent through Gmail to the owner's address (no refusals). The address is in no file. `T/STORYBOARD_LINKS.md` has a round-27 A line.
- Isolation: own profiles only (all deleted), only my recorded PIDs killed (none left), repo untouched (`git status` clean). One browser at a time.
- Runner model: Opus (session model), as RUNNER27 says.

## 1. Result per scenario
| Scenario | Result | Defects (turn) |
|---|---|---|
| s01 | FAIL | A27-1 S2 (p16), A27-2 S2 (p18), A27-3 S2 (p16) |
| s02 | FAIL | S3 only: A26-8 (p11), A27-4 (📜), A27-5 (p10–p14) |
| s03 | FAIL | S3 only: A26-9 (p4), A26-10 (p14), A27-6 (p17) |
| s04 | FAIL | A27-8 S2 (p12), A27-9 S2 (p17), A26-15 CHANGED S2 (p14); A27-7 S3 (p8) |
| s05 | FAIL | A27-10 S2 (p8), A27-11 S2 (p17/p19); A27-12 S3 (📜) |
| s06 | FAIL | A27-13 S2 (p8) |
| s07 | FAIL | S3 only: A23-24 (p7), A27-14 (📜) |
| s08 | **PASS** | — |
| s09 | FAIL | A27-15 S2 (p6→p8); A25-21 (p17), A27-16 (p16) S3 |
| s10 | FAIL | A27-10 S2 (p7), A27-17 S2 (p9–p11); A23-8 S3 (🧭) |
| pA1 | FAIL | S3 only: A26-9 (p3) |
| pA2 | FAIL | A27-13 S2 (p8) |
| pA3 | FAIL | S3 only: A26-19 (mind), A26-20 CHANGED (p12) |
| aA1 | FAIL | S3 only: A23-19 (p1), A27-18 (p4) |
| aA2 | FAIL | S3 only: A26-25 (mind) |
| aA3 | FAIL | A27-1 S2 (p7), A27-19 S2 (Today); A27-20 S3 (Today) |
| aA4 | FAIL | A26-29 S2 (p5→p6), A27-19 S2 (Today); A26-30 S3 |
| tA1 | FAIL | S3 only: A25-17 (p8→p9), A26-39 (📜) |
| oA1 | FAIL | A27-22 S2 (📜), A27-19 S2 (Today) |
| pwA1 | FAIL | A27-21 S2 (p17); A23-8 S3 (🧭) |
| pwA2 | **PASS** | — |

## 2. New defects (full list with quotes in `round27A/defects.md`)
**S2**
- **A27-1** «باشه، جمعه پیگیری کن» (s01 p16) and «بله، لطفاً فردا یادم بیندازید» (aA3 p7) under a pending «📅 … درست است؟» are not read as yes; the page later says «پرسشِ تاریخ بی‌جواب ماند».
- **A27-2** s01 p18: «امضا رو جمعهٔ بعد بذار، این جمعه صاحبخونه نیست» — no ask, no booking; the Friday she negated stays in «امروز».
- **A27-3** s01 p16 (T3): «۳ متر در ۳ متر = ۱۲ مترمربع» (true 9) gets no arithmetic block and is booked as «داده»; the correct «۳ متر در ۴ متر» is unread too.
- **A27-8** s04 p12: ✏️ «پنجشنبه ⇐ شنبه» proposes rewriting her other sentence «نه پنجشنبه» into «نه شنبه».
- **A27-9** s04 p17 (T7 + T11): «۴ نفریم نه ۵ — سهمِ هر نفر چقدر میشه؟» is refused: «مقدارِ درست با مقدارِ پیشین فرقی نداشت». The old quote held both numbers; «۲٫۲» is not marked stale.
- **A27-10** s05 p8 and s10 p7: ✏️ of the day inside a message whose date ask is pending closes the ask («باشد — تاریخی ثبت نشد») and never asks the new day.
- **A27-11** s05 p17/p19 (T8): «مدیرم امروز درخواستم رو تأیید کرد» does not settle that 🎯 and asks nothing; Friday's «امروز» still asks «شد یا نشد؟». The ambiguous sentence did get «🎯 کدام پیش‌بینی؟» correctly.
- **A27-13** s06 p8 and pA2 p8 (T12): opening a new chat with ONE worked step («۲۰۰ پیام در ثانیه × ۳۶۰۰ = ۷۲۰۰۰۰…», «۴۰ میلیون × ۱٫۲ = ۴۸ میلیون») gives neither the prior-work block (C7) nor the arithmetic block (the reader itself returns ok:true).
- **A27-15** s09 p6→p8: a date ask on the problem statement («قیمتِ ماهِ بعد…» ⇒ ۲۷ آذر, C19), then booked from «آره ثبتش کن» that was about registering the problem.
- **A27-17** s10 p9–p11: «پنجشنبه‌ست. …» (today's weekday) gets «همین امروز یا پنجشنبهٔ بعد؟»; her later «جمعهٔ بعد.» answers both asks ⇒ deadline «⏰ پنجشنبه‌ست».
- **A27-19** aA3, aA4, oA1: a «فردا/تا یکشنبه/پنج‌شنبه …» ask re-anchors to the new day (۲۵ ⇒ ۲۶ مهر; ۳ آبان; ۷ آبان) and stays in «امروز» after she reported the action done.
- **A27-21** pwA1 p17 (T4): a third whole-proof report after closure replaces the ledger (new numbering, no history) instead of merging.
- **A27-22** oA1 📜 (compensation a): the job decision's «کل در یک جمله» and «کارِ تو», «نتیجه: مدیرم پیشنهادِ ترفیع داد», «برنامه: تا جمعه با همکارم…» and the third problem's arithmetic all sit in the handshake problem's dossier; the third problem has no record.

**S3:** A27-4 (📜 shows ✗/؟ results without the mark, s02), A27-5 (stage stays «بازنگری» after «اجرا دوباره باز», s02), A27-6 («۲۱۰ و ۱ + ۲ + …» fragment, s03), A27-7 (Saturday ask quotes «پنجشنبه», s04), A27-12 (🎯 of a problem session missing from that problem's 📜, s05), A27-14 (one ✏️ = three 📜 events, garbled stale history, s07), A27-16 («(۹۰۰ − ۳۸۰) × ۳۲ = ۱۶ میلیون و ۶۴۰» silent, s09), A27-18 («۳ تا ۸ تا میشه ۲۴» unread, aA1), A27-20 (conditional «اگر…» as «برنامهٔ خودتان», aA3).

## 3. «ارتقای لازم»
- Show the page's ✓/✗/؟ next to her own bubble and in 📜 (today it reaches her only through the assistant).
- Read «a واحد در b واحد = N واحدِ مربع», «N تا M تا میشه K», ellipsis sums, «N میلیون و M».
- One date-ask engine: «باشه/بله/حله» = yes; a negated day never offered; ✏️ of the day re-asks; anchor relative days to the day they were said; drop the ask when she reports the act done; no ask on today's weekday or the problem's wording.
- Corrections: read «X نه Y» as fix = X even when the old quote held both; mark second-order derived numbers; never replace a negated word in copy asks.
- Prior work: one worked step at an opening fires C7; any later report merges.
- Problem binding: every event of a second/third problem in its own record and 📜; an undo/move control for a 📜 line filed under the wrong problem.

## 4. Round-26 defects (details in `defects.md`)
- **FIXED (24):** A26-1, -5, -6, -7, -11, -12, -13, -14, -16, -18, -21, -26, -28, -31, -32, -33, -34, -36, -46, -49, -50, -51; A25-9; A23-35. A26-15 is FIXED in s07.
- **CHANGED:** A26-15 in s04 (first derivative marked, second not); A26-17 (now checked); A26-20 (block present, «ذرع» silent); A26-35 (asks «کدام‌یک؟» after take-back); A26-41 ⇒ A27-22.
- **STILL:** A26-8, -9, -10, -19, -25, -29, -30, -39; A25-17, A25-21; A23-8, A23-19, A23-24.
- **Not re-observed (blocks identical, no new evidence):** A26-22, -23, -24, -27, -37, -38, -40, -42, -45, -47, -48, -52.
- **No longer applicable:** A26-2, A26-3, A26-4 — there was no false ✗ left to dispute; the C29 dispute of a true ✗ was run and passes.

## 5. ARMS TABLE
| Arm | Scenario · turn | Verdict |
|---|---|---|
| T1 real tie | tA1 · build3 sweep (c67) | PASS — «❓ … (هم‌امتیاز با «…» — اگر این نیست و آن است، همان را بگو)», no declaration |
| T2 piece after closure | tA1 · c92 | PASS — #103 has its own waiting row and «امروز» line; closed problem stays closed (C36) |
| T3 «= N unit» | s01 p16; s08 p10 | FAIL s01 («۳ متر در ۴/۳ متر = ۱۲ مترمربع» unread); PASS s08 (✗ «۷ + ۱۱ = ۱۷ دقیقه», ؟ «۲۹۴۳۰۰ ÷ ۴۸ = ۶۱۳۱ ثانیه», ✓ «حدودِ ۱۰۲ دقیقه») |
| T4 third prior report | pwA1 p17 | FAIL (A27-21) |
| T5 take back own dispute | pwA1 p10–p11 | PASS — «رد ⇒ پس گرفته شد · تأییدِ تو ✓» |
| T6 «جمعهٔ بعد» / «باشه» | s10 p11; oA1 p28; s01 p16/p18; aA3 p7 | PASS s10 («جمعهٔ بعد» ⇒ ۱۵ آبان); PASS oA1 («باشه» to a two-option ask ⇒ clear re-ask); FAIL s01 («باشه» A27-1; free «جمعهٔ بعد» A27-2); FAIL aA3 («بله» A27-1) |
| T7 correction ۵ ⇒ ۴ | s04 p17; s07 p10 | FAIL s04 (A27-9); PASS s07 («۱۷ ⇒ ۱۶»; the only derived difference stays 1, nothing falsely marked) |
| T8 two open predictions | s05 p15–p19 | PARTIAL — two 🎯 ✓, «کدام پیش‌بینی؟» ✓, then «نشد» on the named one ✓; the clear outcome never settles (A27-11) |
| T9 coincidental number | s07 p9–p10 | PASS — «۱۷ درجه», «۱۷۰ میلی‌لیتر» untouched (s04 inconclusive: correction refused) |
| T10 division three ways | s02 p13 | PASS for the coach (✓ «۴ / ۳ = ۱.۳۳», ؟ «۸ / ۳ = ۳», ✗ «۱۳/۱۲ = ۱»); her view shows no mark |
| T11 correction + question | tA1 p9; s07 p10; s04 p17 | PASS tA1 (A26-34 fixed, «۱۳ ⇒ ۱۷»), PASS s07; s04 refused for another reason (A27-9) |
| T12 mid-session calc / one-step opening | s02 p10, s06 p7, pA2 p6, pA3 p12; s06 p8, pA2 p8 | mid-session PASS ×4; one-step opening FAIL ×2 (A27-13) |

## 6. 📜 line-match (multi-problem scenarios)
| Scenario | Problem | Own lines | Wrong / missing |
|---|---|---|---|
| s01 | chat «قراردادِ اجاره» · «هفت سال دیگر…» · «خرید یا اجاره» | all ✓ | none |
| s02 | «لوله در بارِ وانت» · «طناب مهار» | ✓ | A27-4 (marks missing) |
| s03 | four point problems | ✓ | «۵۵» of a side exercise under the main problem — my report (d) |
| s05 | «ترفیع و مدیر» · «گفت‌وگوی پرسشی» | ✓ | two new 🎯 missing (A27-12) |
| s08 | «۷ و ۱۱» · «۵ و ۹» | ✓ | none |
| s09 | three cake problems | ✓ | none |
| oA1 | handshakes · stay-or-go · 45-minute meeting | handshakes 33 ✓; decision 8 ✓ | 9 decision lines and 2 meeting lines under handshakes; meeting has no record (A27-22) |

## 7. Prior-work verdicts
| Scenario | Outcome |
|---|---|
| pwA2 | ✓ all: per-step verdicts, own fixes (C8), dependants, no early «fix», mind card 4/4 |
| pwA1 | ✓ opening, mixed reply, re-check, second report merged, T5; ✗ third report replaces (A27-21) |
| s01 p15 | ✓ two-step opening, both ✓ (A26-1 fixed) |
| s02, s06, pA2, pA3 | ✓ no prior block mid-session or after closure (A26-7 fixed) |
| s06 p8, pA2 p8 | ✗ one-step opening not detected (A27-13) |
| s08 p8 | own invented puzzle checked, no prior block (consistent with T12) |

## 8. Arithmetic (exact values checked)
| She wrote | Exact | Page | Verdict |
|---|---|---|---|
| ۱۸ × ۱٫۲۲ = ۲۱٫۹۶ میلیون (s01) | 21.96 | ✓ | right |
| ۲۱٫۹۶ / ۶۰ = ۰٫۳۷ | 0.366 | ✓ | right (rounded) |
| ۳ متر در ۴ متر = ۱۲ مترمربع / ۳ در ۳ = ۱۲ | 12 / 9 | silent | S2 (A27-3) |
| ۲۰۰ میلیون ÷ ۴۸ = ۴٫۱۷ میلیون | 4.1667 | ✓ | right |
| ۲۰ درصدِ ۳۰۰ میلیون = ۶۰ میلیون | 60 | ✓ | right |
| ۱۸ میلیون × ۱۲ = ۲۱۶ هزار | 216 million | ✗ | right (C23) |
| ۳٫۹۷ − ۳٫۹ = ۰٫۷ ؛ ۰٫۷ متر = ۷ سانت (s02) | 0.07 ; 70 | ✗ ✗ | right |
| sqrt(15.73) ≈ ۳٫۹۷ | 3.966 | — | acceptable (C17) |
| ۴ تقسیم بر ۳ = ۱٫۳۳ ؛ ۸ ÷ ۳ = ۳ ؛ ۱۳/۱۲ = ۱ ؛ ۱۳/۱۲ = ۱٫۰۸ | 1.333 ; 2.667 ; 1.083 ; 1.083 | ✓ ؛ ؟ ؛ ✗ ؛ ✓ | right (C25, C26) |
| ۱ + … + ۲۰ = ۲۱۰ ؛ ۱ + … + ۱۰ = ۵۰ (s03) | 210 ; 55 | — ; — | acceptable / no help (A27-6) |
| π × ۲² = ۱۲٫۵۶ ؛ ۱/۲ + ۱/۳ = ۵/۶ | 12.566 ; 5/6 | ✓ ✓ | right |
| ۱۷ ≡ ۲ (mod ۵) ؛ 2x + 3 = 11 ⇒ x = 4 ؛ n(n+1)/2 = ۵۰۵۰ | — | silent | right (look-alikes) |
| ۱۰ × ۱۱ / ۲ = ۵۵ | 55 | ✓ | right |
| ۱۱ میلیارد / ۴ = ۲٫۷۵ میلیارد ؛ ۲۷۵۰ میلیون / ۱۰ = ۲۷۵ میلیون ؛ ۱۱ / ۵ = ۲٫۲ میلیارد ؛ ۲٫۷۵ میلیارد ÷ ۱۰ = ۲۷۵ میلیون (s04) | exact | ✓ ×4 | right |
| ۳ / ۱۲۰۰ = ۰٫۲۵٪ (s06) | 0.25% | ✓ | right |
| ۲۰۰ پیام در ثانیه × ۳۶۰۰ = ۷۲۰۰۰۰ (s06 p8) | 720000 | not given to the coach | S2 (A27-13) |
| ۹−۵=۴ ؛ ۹+۴=۱۳ ؛ ۷ + ۱۱ = ۱۷ ؛ ۲۹۴۳۰۰ ÷ ۴۸ = ۶۱۳۱ ؛ ۶۱۳۱ ثانیه ≈ ۱۰۲ دقیقه (s08) | 4 ; 13 ; 18 ; 6131.25 ; 102.18 | ✓ ✓ ✗ ؟ ✓ | right |
| ۳۰۰ + ۲۰ میلیون تقسیم بر ۴۰ = ۸۰۰ هزار (s09) | 800 thousand | ✓ | right (C24) |
| (۹۰۰ − ۳۸۰) × ۳۲ = ۱۶ میلیون و ۶۴۰ | 16,640 thousand | silent | S3 (A27-16) |
| ۳۲ × ۸۰۰ هزار = ۲۴ میلیون; her contest | 25.6 million | ✗; re-checked once, ✗ kept | right (C29) |
| pA2: (۲۰۰+۱۵۰+۲۵۰)/۳ = ۶۰۰/۳ = ۲۰۰ ؛ ۱ = ۱/۲+۱/۳+۱/۶ ؛ ۲۰۰/۱۰۷۵ = ۰٫۱۹ ؛ ۱۲۵۰ × ۰٫۸۵ = ۱۰۶۲٫۵ ؛ ۱۰۶۲٫۵ − ۸۷۵ = ۱۷۸٫۵ | … ; 187.5 | ✓×5 ؛ ✗ | right |
| pA3: ۷٫۲ متر مربع = ۷۲۰۰۰ ؛ ۸ / ۱٫۵ = ۵٫۳۳ ؛ ۵ ذرع = ۵٫۲ متر | 72000 ; 5.333 ; — | ✓ ✓ silent | S3 (A26-20) |
| aA1: ۳ تا ۸ تا میشه ۲۴ ؛ … کم میکنم میشه ۱۹ ؛ ۳ و ۳ = ۶ | 24 ; 19 ; 6 | silent ; silent ; ✓ | S3 (A27-18) |
| aA2: ۱×۲ میشه ۲×۳ | (not arithmetic) | — | right (A26-26 fixed) |
| aA4: ۱۸۰ × ۲ = ۳۶۰ ؛ ۳۶۰ / ۱۴۰ = ۲٫۵۷ ؛ ۱۵۰+۱۰+۲۰+۱۵ = ۱۹۵ ؛ ۲٫۵۷ × ۱٫۹۵ ≈ ۵ | 360 ; 2.571 ; 195 ; 5.01 | ✓×4 | right |
| tA1: ۱۲ × ۲ = ۲۴ ؛ ۱۰ × ۰٫۲۵ = ۲٫۵ | exact | ✓ ✓ | right |

## 9. Chat ⇄ page
- **Agree:**
  - corrections where applied (s01, s07, tA1);
  - the C29 re-check (s09);
  - «کدام پیش‌بینی؟» (s05);
  - the territory arms (tA1);
  - return by naming (oA1);
  - the T5 take-back (pwA1).
- **Disagree:**
  - s04: the assistant reported the refusal faithfully, but the page refused a valid correction;
  - s05: the assistant reported the outcome while the 🎯 stayed open;
  - s02: the page says «اجرا دوباره باز» while the stage stays «بازنگری»;
  - aA3, aA4, oA1: chat reported the act as done while «امروز» still asks the date;
  - oA1: the chat bound turns correctly but 📜 filed them under the wrong problem.

## 10. Owner bank (A: 1–10, 42–44)
| # | Answer | Where (evidence) |
|---|---|---|
| 1 | partial | s07 p7/p10 and tA1 p11 ✓; s04 A26-15 (second order) and A27-9 ✗ |
| 2 | exists | 📜/📚; filing defect A27-22 |
| 3 | exists | «از کجا؟» (oA1 p34) |
| 4 | missing | sheet #101 (the build reply was simulated) |
| 5 | exists | aA2 1-3-7 cycle with lapse and regression |
| 6 | partial | ages right; two users in one browser — sheet #102 open |
| 7 | exists | pA1–pA3 |
| 8 | exists | stale destination A23-8 |
| 9 | exists | tA1, 11 arms; step-less sheet notice now (oA1 p30) |
| 10 | exists | «خودِ سامانه» map |
| 42 | partial | 📅 rows have «آره، همین / نه / هیچ‌کدام»; ✏️ for her own messages; no undo for a wrong data/📜 line (oA1 p33, shot bank42_today_no) |
| 43 | exists | «از کجا؟» with date, quote and 📜 link (oA1 p34, shot bank43_mind_from) |
| 44 | partial | «🎯 کدام پیش‌بینی؟» + «⇐ نشد — به گفتهٔ خودت» (s05 p18–19); a clear outcome does not settle (A27-11); the 🎯 is missing from the problem's 📜 (A27-12) |

## 11. Routing
316 of 316 turns went to the right task (`lla_coach` / `lla_assistant` / `learning_architecture`). There is a `route_table.md` in each scenario.

## 12. PARTS — «نسبت به دورِ ۲۶» (`round27A/PARTS.md`)
- **Better:**
  - arithmetic reader (no S1; every scale-word case right);
  - prior work (mid-session/closure, early fix, obsolete step, «همه درست» beside ✗ — all fixed);
  - territory loop (sys_done line, step-less notice);
  - age/child safety (no date asks on a teacher's words);
  - 🎯 from words;
  - practice cycle;
  - return by naming;
  - correction with a question.
- **Same:** prerequisites, mind card (two S3), routing.
- **New problem families:**
  - the date-ask engine («باشه/بله», ✏️ of a day, today's weekday, drift of «فردا», stale asks after done);
  - the correction engine refusing «X نه Y»;
  - 📜 per-problem filing in multi-problem sessions;
  - the one-step opening.

## 13. Fixers' «Not done» claims, as tested
- **arith:**
  - «۳ متر در ۴ متر» is not read (confirmed, s01);
  - ellipsis sums come back «نسنجیده» (confirmed, s03);
  - a re-check cannot overrule the reader: not exercised, because no misreading was found.
- **correction:**
  - A26-15 s07 now works through the replayed ✏️;
  - C25-15 pwC2 is not group A.
- **story:** bank #78/#92 NOT RUN in group A (not in A's scenarios).
- **prior:** D25-15 is not group A.
- **today:** «آخرِ سال / عید / سرِ برج» NOT RUN — I did not reach it; it should be run next round.
- **classify:**
  - bare first names NOT RUN;
  - two people in one browser: sheet #102 stays open (oA1).
- **Carried items:**
  - C12 on a wrong sentence — seen (s09 goal sentence, A27-15);
  - C2 — frame/view-name-only replies were rejected correctly when no candidate existed;
  - aA2 forgetting/regression — RUN (ids taken from the page).

## 14. New owner-like questions
- When I did something and said so, why does the date question come back the next day with another day?
- Where is the third problem I mentioned mid-way kept — where is its dossier?
- If a dossier line sits under the wrong problem, how do I move it?
- Why does «باشه» count for one question and not for another?
- If I say the result of a prediction before its day, why is it not settled?

## 15. Runner errors, and what was not run
Runner errors (d), as listed in `defects.md`:
- `said:["result"]` without text (s01, s02, s05);
- a side-exercise result reported under the main problem (s03);
- I did not ask the page's «کدام؟» (s05 p18);
- the oA1 routine note was applied after its original sweep point;
- I removed the deadline actions of replayed replies where the new rule forbids them (s09 p5, aA3 p7).

NOT RUN:
- «آخرِ سال / عید / سرِ برج»;
- bare first names;
- the D/B session-pin carry-overs (not group A).

## 16. Use
Wall clock: about 15:14 to 19:25 UTC (about 4 h 10 min), in one context. I can't see token counts.
- 316 model prompts were answered: most were replayed from round 26, about 70 were fresh or edited replies.
- 21 e-mails were sent.
