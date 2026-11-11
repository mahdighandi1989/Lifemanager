# Round 26 — group B runner: final report

All 26 group-B scenario runs are finished (each has `DONE`, `findings.md`, `routing.md`, `mail.html`, `mail.subject.txt`, kept `ai/`), and 27 e-mails went to the owner (26 scenarios + one correction for s12). Result: **4 PASS, 22 FAIL — 1 S1, 20 S2 instances, about 55 S3**. Page main 1f93c333; repo untouched.

Everything is under `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B/`:
- `defects.md` — full catalogue with p<N>/s<N> evidence and the round-25 table
- `PARTS.md` — 13 parts with «نسبت به دورِ ۲۵»
- `<sid>/findings.md` — per scenario (criteria, need maps, arithmetic table, r25 status, routing)
- `sent.txt` — mail ids; `pids.txt` — every process I started

Isolation held: ports 9350–9399, own profiles (now deleted), only recorded PIDs killed, none left running. `round26B_x/` was never read. The owner's address is in no file. `STORYBOARD_LINKS.md` has the round-26 B line.

## 1. Result per scenario

| sid | RESULT | defects (evidence) |
|---|---|---|
| s11 | FAIL 5 S3 | D5 stale list misses 98/49 (s49); D6 mind card «undefined: k از n»; D7 «ناقص» booked «درست نبود»; B24·D16 STILL; B25·D26 STILL |
| s12 | FAIL 1 S3 | D6 (correction e-mail sent after a premature ✅) |
| s13 | FAIL 1 S3 | D13 refuted assumption booked «−» on the mind card |
| s14 | FAIL 1 S3 | D3 model deadline booked with no «درست است؟» (p5) |
| s15 | FAIL 1 S3 | B24·D21 remainder: strip destination «چیکار کنم؟» |
| s16 | FAIL 1 S3 | D2 corrected datum leaves «حل به نتیجه رسید» (p6) |
| s17 | FAIL 1 S2 + 1 S3 | D4 corrected datum does not reach derived result/plan, result named «۰.۷» (p7, s36); B25·D27 STILL |
| s18 | FAIL 2 S3 | D8 π expressions unread, wrong value passes silently (p6, p10); B24·D12 STILL (p16) |
| s19 | FAIL 1 S2 + 1 S3 | B25·D10 remainder: measured «۳٫۵» marked stale «≈ ۳٫۴۴۴» (s81); D14 «جلسه شنبه» read as «سه‌شنبه» (s44) |
| s20 | FAIL 1 S3 | D1 «۸ ماهه…» read as a future date (p1) |
| bp1 | FAIL 1 S3 | B24·D15 STILL |
| bp2 | FAIL 1 S2 + 3 S3 | D11 «هفته‌ی بعد، جمعه» booked a week early (p11); D10 no arithmetic block once bound to a live problem; D12 self-label names wrong prerequisite (p12); B25·D28 STILL |
| bp3 | FAIL 1 S3 | D9 greeting kept as session title (s28) |
| aB1 | FAIL 1 S3 | D16 repeated birth statement gets no page line (p9) |
| aB2 | FAIL 1 S3 | B24·D18 remainder: «فرمِ فهم» after results, look-back twice |
| aB2f | PASS | — |
| aB3 | FAIL 2 S2 + 4 S3 | D4 class: old derived result unmarked after 18⇒19 (📜); D26 «بازنگری» while stating the plan (p9); D35 «میشه» arithmetic unread (p7); D39 guess row shows wrong sentence; B25·D24 STILL; B24·D16 STILL |
| aB3x | PASS | — |
| aB4 | FAIL 5 S3 | D35 chain unread (p3–p4); D36 page question «می‌توانید … به دست آوری» (p7); D37 pre-check false «دو ضمیر» (p8); D38 form proposes data sentence as «مجهول» (s13); B24·D18 remainder |
| tB1 | FAIL 1 S2 + 1 S3 | D26 «بازنگری» with a waiting step and nothing built (p7–p8); D27 📜 loses the first mistaken arrival |
| tB1x | PASS | — |
| tB1y | FAIL 1 S3 | D28 Today ❓ line opens a row with no way to answer |
| tB1z | PASS | — |
| oB1 | FAIL 3 S2 + 5 S3 | D30 return by naming not recognised (p29); D31 correction 5⇒4 does not reach 🎯/practice/look-back (s27); D32 result booked on the other problem's forecast before its date (s28, p34); D29 (p4–p5); B25·D22 STILL (p14); D33 (s35); D34 (s32); D3 instance (p6, p27) |
| pwB1 | FAIL 1 S1 + 2 S2 + 4 S3 | **D20 (S1)** p11; D18 third report not merged (p11); D19 correction marks by coincidental «۱۵» (p13, s22); D17, D21, D6, D7 |
| pwB2 | FAIL 5 S2 + 4 S3 | B25·D3 remainder (p2); D22 two-computation fix refused (p4–p5); D23 take-back read as new dispute (p7); D24 Friday booked today, «جمعه‌ی بعد» unread (p11–p13); D25 «باشه» unread, date lost (p13–p15); D3, B25·D24 STILL, D6, D17 |

**The S1 (B26·D20):** in pwB1 p11 her false identity «۱ = ۱/۲ + ۱/۳ + ۱/۴» (exactly 13/12) was reported to the coach as «✓ … می‌خواند», so the model told her the step reads correctly. The rounding tolerance (C9) is being applied to an exact rational identity.

## 2. «ارتقای لازم» (most useful first)
- Exact rational comparison with no rounding for identities; read π, «میشه», chained equalities, and every stage; say «نسنجیده» when unread.
- A result or correction must name its problem; with two open forecasts the page asks which; a «داوری را برگردان» for a forecast verdict.
- Return by naming binds the turn to the named problem.
- A corrected number marks every derived result, plan, forecast and practice session as «با عددِ پیشین» until redone.
- Prior work: merge any later numbered report; hear a dispute by meaning; take back a dispute with history; accept multi-computation fixes.
- Dates: read «جمعه‌ی بعد», «باشه», «هفته‌ی بعد، جمعه»; never read elapsed time or a past day as a date; never book a model date silently.
- Territory: «✓ همان است / ✗ نه» on the waiting row; keep every arrival/rejection as its own event; an expected-answer date on the ⏸ marker.

## 3. Round-25 defects (full table in `defects.md`)
- **FIXED:** B25·D1 (the S1, both halves), D2, D4 (merge), D5, D6, D8, D11, D13, D14, D16 (s12), D18, D19, D20, D21 (except strip), D25 (pwB1); B24·D12 in s13/s19/aB3.
- **FIXED with a remainder or new form:** D3 (explicit dispute fixed; dispute by meaning not), D7 (reappears in corrections as D19), D9 (fixed in pwB1/bp2; still in tB1/aB3 as D26), D10 (measured value still marked), D12 (second problem separate; new D30/D32), D15 (one-computation fix applied; D22), D23 (destination still wrong, D33).
- **STILL:** D22, D24, D26, D27, D28; B24·D15, B24·D16, B24·D12 (s18 p16), B24·D18 (order only).
- **Not exercised:** D17.

## 4. Territory loop arms
Builds were simulated by a routine reply under sheet #101 through the harness sheet store, and by scratch copies of the built page with real areas added to the problem-solving territory map; page internals were not touched.

| arm | expected | got | verdict |
|---|---|---|---|
| unrelated reply | mismatch, reopen, still waiting | ✓ with reason | PASS |
| area the sheet ruled out | mismatch «خودِ برگه کنار گذاشته بود» | ✓ | PASS |
| generic words | mismatch, no arrival | ✓ | PASS |
| frame / view-name words only (market scan) | ASK, never «رسید» | ❓ asked | PASS (was S1) |
| single shared word (tB1y) | ASK | ❓ asked; Today ❓ line | PASS (D28: no answer control on the 🔭 row) |
| her «نه» to an ask | rejected, sheet reopened with her words, Today line | ✓ | PASS |
| two new areas, unequal fit | best fit | patent-db arrived | PASS |
| three new areas, fitting one named last (tB1z) | best fit, not first named | «جستجوی پیشینهٔ اختراع» | PASS |
| her «نه» AFTER an arrival | waiting again, sheet note, Today line | all three | PASS (was S1) |
| take back a mistaken «نه» | restored with history | ✓ | PASS (📜 order: D27) |
| sys_done (tB1x) | step released, routine told, sheet stays | ✓ | PASS |
| build arrives after sys_done | no «از سر بگیر» | silent | PASS |
| duplicate waiting rows | one | one | PASS |
| exact tie | ask naming both | — | NOT RUN (my two areas were not equal by the page's measure) |
| piece brought after closure | own waiting entry | — | NOT RUN (problem could not be closed in my run) |
| system-self sheets (oB1 #101–#103, #105) | no waiting step | none | PASS |
| sheet for his own step (oB1 #104) | step waits | ⏸ marker in chat and Today | PASS |

## 5. Prior work (P1) — full step tables in `pwB1/findings.md`, `pwB2/findings.md`
- **pwB1:** opening recognised with correct verdicts and dependencies. The second report («این هم ادامه‌ی کارِ خودمه…») merged 5 ⇒ 12. The third («اینم کارِ خودمه، ببین: گامِ ۱۳…۱۹») was not recognised (D18). One-computation fixes of steps 2 and 3 were applied. The height correction 15⇒18 marked the coincidental «۱۵ متر»/«۱۵ آمپر» and missed the dependent steps (D19).
- **pwB2:** opening correct. «حکمِ گامِ ۵ رو قبول ندارم» was recorded and re-checked (visible in the ledger, 📜, and a Today «دوباره منتظر» line). Dispute by meaning unheard; correct two-chain fix of step 4 refused (D22); take-back read as a new dispute (D23).
- **s11, s12:** credit for correct prior steps now reaches the mind card, under the label «undefined» (D6).
- No prior block fired mid-session where it should not (s20, oB1).

## 6. Arithmetic (P2) — per-scenario tables in each `findings.md`
- **Read exactly and correctly:** every numeric line with «=» in aB2 (5), aB4 (7), aB3 (4), the pwB2 chains (round-25 chain misparse fixed), bp runs. Mind-card Brier 0.585 = (0.6² + 0.9²)/2 ✓. All four Jalali⇒Gregorian birth conversions verified.
- **Wrong and passed:** pwB1 p11 false fraction identity (S1); s18 wrong π value passes with no «نسنجیده».
- **Unread:** «میشه» results (aB3 p7, aB4 p4); a chain in the plan stage (aB4 p3); any line once the chat is bound to a live problem without a ledger (bp2, s17); symbolic identities (aB2).
- **Stale numbers (P4):** D4 (s17, aB3), D5 (s11), D19 (pwB1), D31 (oB1), B25·D10 remainder (s19).

## 7. Chat ⇄ page verdicts
- **Worked:** explicit dispute ⇒ re-check on the ledger; «نه» to the territory ask and after arrival; take-back of a territory «نه»; correction 18⇒19 reaching the statement, form datum and guess outcome with a re-check question; page asks before booking a date, and silence books nothing (aB4); register «شما» stored across a reload (aB4).
- **Did not work:** take-back of a verdict dispute (D23); no way to contest the page's arithmetic; a forecast verdict cannot be undone from chat (D32 — repair only through the ledger's own fields); «باشه»/«جمعه‌ی بعد» answers unread (D24, D25); lesson read as guess (oB1 p14).

## 8. Owner bank 11–20 (asked in oB1, inside his own problems; table in `oB1/findings.md`)
| # | answer | evidence |
|---|---|---|
| 11 offline / local model | page and records offline: هست; local model: نیست ⇒ sheet #101, no waiting step | oB1 p15–p16 |
| 12 invention to build plan | هست, with gaps named (prior-art, hardware safety) | oB1 p17; tB1 family |
| 13 companion book for all ages | نیست ⇒ #102 | p18–p19 |
| 14 before/after pictures of parts | own work هست; system parts نیست ⇒ #103 | p20–p21 |
| 15 e-mailed session report | نیست ⇒ #103 | p20 |
| 16 two problems kept apart | نیمه — separate record/🧭/📜 after his yes; return by naming fails (D30), a result crossed problems (D32) | p23–p24, s35, s28 |
| 17 when a sheet is answered | نیمه — no date; three places to find out; ⏸ marker seen | p27, Today |
| 18 over-confidence on the mind card | هست («احتمالِ بیش‌اطمینانی ۹۸٪», Brier 0.585) but only after manual repair | p31–p34, post.txt |
| 19 one page of every record | نیمه — 📜 per problem and per session; no single index | p35 |
| 20 wearable sleep data | نیست ⇒ #104, and exactly his step waits | p25–p26 |

Evidence gathered in other scenarios for later questions: 32 re-check visible (هست), 33 Today «دوباره منتظر» (هست), 34 per-step states (هست), 35 earlier verdicts kept (هست), 36 contesting page arithmetic (نیست), 37 mind-card credits (هست, raw label), 38 take-back (territory هست, verdict نیست), 39 new tool tested on his own data (نیست — words only).

## 9. Routing
Correct in every scenario: 282 of 282 calls (coaching turns, follow-ups, second opinions).

## 10. PARTS «نسبت به دورِ ۲۵» (`PARTS.md`)
- **Better:** territory loop (S1 fixed), prior-work block, stage agreement in prompts, register storage, 📜 duplicates.
- **Same:** prerequisite layer, self-knowledge and sheets, birth card.
- **Worse at one point:** arithmetic reader (D20, S1); forecast ledger (D32).
- **Mixed:** corrections; dates/plans; several problems in one chat.

## 11. New owner-like questions
- «این برگه‌ها را چه کسی می‌خواند و از کجا ببینم نوبتشان کجاست؟»
- «اگر صفحه چیزی را اشتباه ثبت کرد، خودم از کجا برش گردانم؟»
- «کدام عددِ کارنامه از کدام جمله‌ام آمده؟»
- «وقتی دو پیش‌بینیِ باز دارم، از کجا بفهمم نتیجه روی کدام نشست؟»
- «ابزاری که ساخته شد روی دادهٔ خودِ من هم آزموده شده؟»
- «شکلی که کشیدم کجا می‌ماند؟»

## 12. My own mistakes (class d, not counted; listed in `defects.md`)
- tB1 first reply omitted `gap.step` — fixed and rerun.
- tB1z result sent in the wrong shape — not booked.
- oB1 opened the dossier list instead of the session dossier.
- s12 first e-mail said ✅ — corrected by a second e-mail.
- The first three oB1 replies used wrong field shapes — fixed and rerun before any finding.

`better/` replies written for pwB1 r11, pwB2 r2, oB1 r31, tB1 r8.

## 13. Token / time
I cannot see exact figures. The run spanned two context windows and roughly 320 model replies authored or replayed.