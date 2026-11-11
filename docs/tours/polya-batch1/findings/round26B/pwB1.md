# pwB1 — نگار و پمپِ خورشیدی (کارِ پیشینِ من · مهندسی، عمیق) + حسابِ صفحه — ROUND 26 (runner B)

## خلاصه برای مالک
نگار، مهندسِ تأسیسات، پنج گامِ حسابِ خودش را آورد. صفحه و دستیار هر گام را حکم دادند: لغزشِ واحدِ گامِ ۲ (کیلوژول به کیلووات‌ساعت) این بار گرفته شد، گام‌های وابسته درست علامت خوردند، ردِ حکم با شاهد دوباره سنجیده شد، اصلاحِ خودش در دفتر نشست و نقطهٔ ازسرگیری جلو رفت؛ معیارِ کم‌شده (توانِ لحظه‌ای) را خودش پیدا کرد و به طرحِ وارسی‌شده رسید (پمپِ ۱۲۰ وات، پنلِ ۱۵۰ وات، ۱۰۲ دقیقه). گزارشِ دومش در دفتر ادغام شد (۵ ⇒ ۱۲ گام) و کارنامه گام‌های درستش را مثبت نوشت. سه ایرادِ مهم: صفحه جمعِ غلطِ «۱ = ۱/۲ + ۱/۳ + ۱/۴» را «می‌خواند» اعلام کرد؛ گزارشِ سومش (گام‌های ۱۳ تا ۱۹) اصلاً واردِ دفتر نشد؛ و وقتی ارتفاع را از ۱۵ به ۱۸ متر اصلاح کرد، صفحه گامِ کابلِ «۱۵ متری» را کهنه کرد و گام‌هایی را که واقعاً با ارتفاع حساب شده بودند نه.

## Run setup (common, runner B round 26)
Page main 1f93c333 (round-25 fixes; `build.py --check` in sync). Harness round26B/tools/harness26bm.js (harness5 + page URL from env for the territory scratch pages; own browser profile per scenario dir, PIDs in round26B/pids.txt). Driver tools/drv26bm.py replays round25B/<sid>/ctl; replies: round-25 replies rebuilt from docs/tours/dataset (s11–s20, bp1–bp3) are reused when HER turn text matches; every other reply (all of aB*, tB*, oB1, pwB*, and every new round-26 turn) was written this round as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Strict prompt scan (tools/strict.py): see below. Defect ids: round26B/defects.md (B26·Dn), round25B/defects.md (B25·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1 prior-work opening: report request + page arithmetic block; turn question = resume point («نخستین گامِ … که هنوز درست نیست»), not whole-first, not the guess test (B25·D2 FIXED).
- [PASS] p1 page arithmetic: 2000 × 9.81 × 15 = 294300 ✓; «۲۹۴۳۰۰ ژول = ۲۹۴.۳» ✓; «✗ واحد (تبدیلِ کیلوژول به کیلووات ساعت)» with the correct 0.08175 kept for the coach only; «۰.۲۹ / ۰.۵ = ۰.۵۹» accepted (C13 interval); 294300 / 1200 = 245 ✓ (B25·D14 FIXED).
- [PASS] p3 ledger after the verdicts: 5 steps — 2 ✓, 1 ناقص, 2 ✗, resume at step 2; step 4 NOT marked dependent (B25·D7 FIXED); step 3 line says the page's arithmetic «می‌خواند؛ ایرادِ این گام در خودِ این حساب نیست» (no «درست» beside ✗).
- [PASS] p3 dispute «نه، گامِ ۲ درسته … چرا میگی غلطه؟» ⇒ turn question «با شاهد دوباره بسنج — نه کوتاه آمدنِ بی‌دلیل، نه پافشاریِ بی‌دلیل» (B25·D3 FIXED); p4 the re-check lands on the ledger «دوباره سنجیده شد (مربی): حکم ماند — …» and is not asked again (C6).
- [PASS] p4–p5 her own fix (0.082, 0.164): page check «می‌خواند» ⇒ steps 2 and 3 «✓ درست (اصلاح شد ⇐ …، به دستِ خودش)», step 5 «وابسته به گامِ ۳ که اصلاح شد — با عددِ تازه دوباره حساب شود», resume moves to step 5 (B25·D15 FIXED; C8).
- [PASS] p4–p6 stage stays «اجرا» after sub-results (B25·D9 FIXED); p6 «یادم رفته بود» no longer drops the turn — the step-5 fix, the refuted guess and the result are all booked (B25·D8 FIXED).
- [PASS] p7 live_new on her request: 🔭 shows «کارِ پیشینِ تو — حکمِ هر گام» with all five steps, history and per-step «درست است؟ ✓ / ✗ نه — دوباره بسنج» (s13); «# وضعِ کنونی» and the live block both «اجرا» (B25·D20 FIXED); breadcrumb without the greeting (B25·D25 FIXED); 🧭 main line carries the prior points (s15).
- [PASS] no coach-facing check text in 🧭 tip, 📜 or 🔭 (no «۰٫۰۸۱۷۵», no «لو نده») (B25·D6 FIXED).
- [PASS] p8 (+2 d) vendor report: page arithmetic on a live-bound message — 120 × 0.5 = 60, 294300 / 48 = 6131, «۶۱۳۱ ثانیه = ۱۰۲», «۴۸ × ۶۱۳۱ = ۲۹۴ هزار» all «می‌خواند».
- [PASS] p10 SECOND report («ادامه‌ی کارِ خودمه که دیشب … نوشتم»): request fires, seven new steps merge (ledger «۱۲ گام — ۱۲ درست»), the first five stay with their history (B25·D4 FIXED); correct shapes read: Unicode minus, «۱ و خرده‌ای، یعنی ۱٫۷», chain a = b = c with a unit, C9 rounding 0.425 ⇒ 0.43.
- [PASS] p11 wrong shapes: six of seven caught for the coach (180/12, running sum «۱۲ با ۳», sign of 12 − 12.6, 102/60, Wh ⇒ kWh, 102/240 = 0.45); look-alikes (date ۱۴۰۵/۸/۲۰, score ۳–۲, 17 ≡ 2 (mod 5), 2x + 3 = 11) not touched.
- [FAIL] p11 «۱ = ۱/۲ + ۱/۳ + ۱/۴» ⇒ «✓ «۱/۲ + ۱/۳ + ۱/۴ = ۱» می‌خواند» (exact 13/12) with the order not to call it wrong; reply r11 tells her «گامِ ۱۶ (سهم‌ها) می‌خواند» (B26·D20, S1).
- [FAIL] p11 the third report («… اینم کارِ خودمه، ببین: گامِ ۱۳ … ۱۹») fires no report request; nothing merges, ledger stays 12 steps, no page line (B26·D18, S2). Her mixed reply at p12 (accepts 13–14, rejects 15 by meaning, doubts 16) therefore has no ledger steps to act on.
- [FAIL] p13/s22 correction «ارتفاع ۱۸ متره نه ۱۵»: «گامِ ۷ کهنه شد» (cable length) and «نتیجهٔ «۱۸۰ ÷ ۱۲ = ۱۵ آمپر و کابل هم ۱۵ متر» دیگر برقرار نیست — بر «۱۵ متره» بنا بود»; steps 2–5 and 10–12 that rest on the height are untouched; final ledger «ازسرگیری از گامِ ۷» (B26·D19, S2).
- [FAIL] p6/📜 «متنِ تازه‌ات (…۳۶ وات) هنوز با حسابِ صفحه یا حکم نمی‌خواند — گام همان می‌ماند» (B26·D17, S3); s22 correction line with two identical clipped strings (B26·D21, S3); mind card «undefined: ۱۲ از ۱۵» (B26·D6) and «ناقص» step 5 booked «درست نبود» (B26·D7).
- [PASS] post.txt mind card: «+ گامِ درستِ کارِ پیشینِ خودش (گامِ n)» for steps 1, 4, 6–12, «+ گامِ کارِ پیشین که خودش درست کرد» ×3, «−» for the original 2, 3, 5 (B25·D11 FIXED).
- [PASS] arrival: verified design (120 W pump, 150 W panel, 102 min with friction; 48 × 6131 ≈ 294 kJ) and the exact sticking point (real noon output of the panel; now also the 18 m head to recompute). Routing 13/13.

## نقشهٔ نیاز
Parts: prior ledger (FOR one verdict per step, resume at the first non-✓, merge, her own fix, re-check on dispute, visible in 🔭/🧭/📜) — met for the opening and the second report; a third report in other words is missed (D18); corrected datum reaches the wrong steps (D19); a recomputed incomplete step is worded misleadingly (D17). Page arithmetic (FOR guaranteeing numbers and units, never the answer to her) — unit slips, running sums, chains, signs, rounding all right; one false fraction identity declared right (D20). Mind card — credits her correct steps; raw label and wording (D6, D7). Person (an engineer about to buy): needed her slip found with evidence and no flattery, her correct work credited, the missing criterion surfaced by herself — met; needed to trust the ledger after her later reports and corrections — not met.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
| # | path | should change | did | must stay | vs round 25 |
|---|---|---|---|---|---|
| 1 | chat · her own fix of judged steps 2, 3 (p4) | ledger steps 2, 3; dependants marked | ✓ (page check agreed) | steps 1, 4 | round 25 refused it |
| 2 | chat · datum «۱۸ متره نه ۱۵» (12+ turns back) | datum; steps 2–5, 10–12 and their chat results stale | datum ✓; result 204 Wh ✓; step 7 and «۱۵ آمپر / ۱۵ متر» ✗ false stale; steps 2–5, 10, 12 ✗ missed | cable and current | new trial — FAIL (D19) |

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what she wrote | exact value | what the page said | verdict |
|---|---|---|---|
| p1 «2000 × 9.81 × 15 = 294300 ژول» | 294300 | ✓ (unit unchecked) | correct |
| p1 «294300 ژول = ۲۹۴٫۳ کیلوژول» | 294.3 kJ | ✓ | correct |
| p1 «۲۹۴٫۳ کیلوژول، یعنی حدودِ ۰٫۲۹ کیلووات‌ساعت» | 294.3/3600 = 0.08175 kWh | ✗ واحد … با تبدیل ۰٫۰۸۱۷۵ (coach only) | correct ✗ |
| p1 «۰٫۲۹ ÷ ۰٫۵ = ۰٫۵۹» | 0.58 (0.5886 from 0.2943) | ✓ (C13 interval) | correct by C13 |
| p1 «294300 ÷ 1200 = 245» | 245.25 | ✓ | correct (C9) |
| p1 «۰٫۵۹ کیلووات‌ساعت ÷ ۴٫۵ ساعت = ۱۳۱ وات» | 0.1311 kW | not listed | unread, silent |
| p4 «294300 ÷ 3600000 = 0.082» | 0.08175 | ✓ | correct (C9) |
| p4 «۰٫۰۸۲ ÷ ۰٫۵ = ۰٫۱۶۴» | 0.164 | ✓ | correct |
| p5 «۰٫۱۶۴ ÷ ۴٫۵ = ۰٫۰۳۶ کیلووات، یعنی ۳۶ وات» | 0.03644; 36 W | ✓ ✓ (unit) | correct |
| p6 «294300 ÷ 50 = 5886 ثانیه، حدودِ ۹۸ دقیقه» | 5886; 98.1 | ✓ ✓ | correct |
| p8 «۱۲۰ × ۰٫۵ = ۶۰»، «294300 ÷ 48 = 6131»، «≈ ۱۰۲ دقیقه»، «۴۸ × ۶۱۳۱ ≈ ۲۹۴ هزار» | 60; 6131.25; 102.2; 294288 | ✓ ×4 | correct |
| p10 «۱۲ − ۱۲٫۶ = −۰٫۶» (Unicode minus) | −0.6 | ✓ | correct |
| p10 «۱۰۲ ÷ ۶۰ میشه ۱ و خرده‌ای، یعنی ۱٫۷» | 1.7 | ✓ | correct |
| p10 «۱۲۰ × ۱٫۷ = ۲۰۴ وات‌ساعت = ۰٫۲۰۴ کیلووات‌ساعت» (chain) | 204; 0.204 | ✓ ✓ | correct |
| p10 «۱۰۲ ÷ ۲۴۰ = ۰٫۴۳» (rounded) | 0.425 | ✓ | correct (C9) |
| p10 «۱ = ۱/۲ + ۱/۳ + ۱/۶» (fraction sum on the right) | 1 | not listed | unread, not flagged |
| p10 «۸ متر … با ۴ … میشه ۱۲، با ۳ … میشه ۱۵» (running sum, words between) | 12; 15 | not listed | unread, not flagged |
| p10 «۱۲۰ وات ÷ ۱۲ ولت = ۱۰ آمپر» | 10 | not listed (units between numbers) | unread |
| p11 «۱۸۰ ÷ ۱۲ = ۱۶» | 15 | ✗ … حسابِ صفحه: ۱۵ | correct ✗ |
| p11 «۸ متر، با ۴ میشه ۱۲، با ۳ میشه ۱۶» | 15 | ✗ «۱۲ با ۳» … ۱۵ | correct ✗ |
| p11 «۱۲ − ۱۲٫۶ = ۰٫۶» | −0.6 | ✗ … −۰٫۶ | correct ✗ |
| p11 «۱ = ۱/۲ + ۱/۳ + ۱/۴» | 13/12 | ✓ می‌خواند | WRONG WORK PASSED (D20) |
| p11 «۱۰۲ ÷ ۶۰ … یعنی ۱٫۵» | 1.7 | ✗ … «۱ با باقی‌ماندهٔ ۴۲» | correct ✗ |
| p11 «۱۸۰ × ۱٫۷ = ۳۰۶ وات‌ساعت = ۳٫۰۶ کیلووات‌ساعت» | 306; 0.306 | ✓ 306; ✗ واحد … ۰٫۳۰۶ | correct |
| p11 «۱۰۲ ÷ ۲۴۰ = ۰٫۴۵» | 0.425 | ✗ … ۰٫۴۲۵ | correct ✗ (C9) |
| p11 look-alikes: «۱۴۰۵/۸/۲۰»، «۳–۲»، «۱۷ ≡ ۲ (mod ۵)»، «۲x + ۳ = ۱۱ که x = ۴» | — | nothing | correct (not arithmetic) |
| p12 «۱۸۰ ÷ ۱۲ = ۱۵» | 15 | ✓ | correct |

## سن
31: card «۱۴ مهر ۱۳۷۴» ⇒ one Jalali confirmation.

## Round-25 defects in this scenario (FIXED | STILL | CHANGED)
- B25·D2 (opening ⇒ guess test): FIXED p1.
- B25·D3 (dispute ⇒ A073): FIXED p3.
- B25·D4 (ledger replaced by each report): FIXED p10 (merge 5 ⇒ 12) — but a report in other words is not taken at all (B26·D18).
- B25·D6 (chkM leak): FIXED (🧭 s4/s15, 📜 post.txt, 🔭 s13).
- B25·D7 (dependency by number): FIXED p3 — the same coincidence now appears in the stale marking after a correction (B26·D19).
- B25·D8 (RECALL22 drops the turn): FIXED p6–p7.
- B25·D9 (sub-result ⇒ look-back): FIXED p4–p6.
- B25·D11 (mind card credit): FIXED (post.txt), with the raw «undefined» label (B26·D6).
- B25·D13 (prior on mid-solve text): FIXED. B25·D14 (unit slip passes / «درست» beside ✗): FIXED.
- B25·D15 (self-fix refused): FIXED p4–p5. B25·D20 (two stages): FIXED p8. B25·D25 (greeting in breadcrumb): FIXED.

## Routing (13/13 correct)
### pwB1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. من نگارم، مهندس تأسیساتم. برای باغِ پدرم تو روستا می‌خ…» | lla_coach | lla_coach | ✓ |
| p2 | rewrite (post-check) | «سلام. من نگارم، مهندس تأسیساتم. برای باغِ پدرم تو روستا می‌خ…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «نه، گامِ ۲ درسته. کیلو یعنی هزار؛ ۲۹۴٫۳ کیلوژول میشه ۰٫۲۹ کی…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «آهان، کیلووات‌ساعت یعنی ۱۰۰۰ وات ضربدر ۳۶۰۰ ثانیه. پس 294300…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «پس پنل: ۰٫۱۶۴ ÷ ۴٫۵ = ۰٫۰۳۶ کیلووات، یعنی ۳۶ وات! پس حتی یه …» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «آخ… پمپ موقعِ کار ۴۹۰ وات می‌کشه ولی پنلِ ۵۰ واتی ظهر نهایتا…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «اینو به‌عنوانِ مسئله‌ی خودم ثبت کن که بعد از حرف زدن با فروش…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «سلام، با فروشنده حرف زدم: پمپِ ۱۲ ولتِ ۱۲۰ واتی دارن و پنلِ …» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «درسم: واحد رو تا آخر با خودم ببرم و کنارِ انرژی، توانِ لحظه‌…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «این هم ادامه‌ی کارِ خودمه که دیشب برای سیم‌کشی و هزینه نوشتم…» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «برای حالتی که پمپِ ۱۸۰ واتی بگیرم هم همین کار رو کردم، اینم …» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «گامِ ۱۳ و ۱۴ رو قبول دارم، عجله‌ای نوشته بودم: ۱۸۰ ÷ ۱۲ = ۱۵…» | lla_coach | lla_coach | ✓ |
| p13 | coaching (problem talk) | «با مخرجِ ۱۲: ۶ و ۴ و ۳ میشه ۱۳ دوازدهم، نه یک. پس گامِ ۱۶ غل…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- Recognise «گامِ N:» numbered lists of hers as a report whatever the lead-in sentence.
- After a datum correction, show on 🔭 which ledger steps contain the old value in their own expression (step 2: «… × 15») and ask her to recompute them one by one.
- Exact rational identities (only fractions and integers) should be compared exactly, with no rounding.

## ایده‌ها
- «کدام عددهای من به این گام بسته‌اند؟» — the ledger shows «وابسته به گامِ n» but not the chain forward; she would want a dependency view.
- «اگر صفحه حسابِ درستِ مرا غلط یا حسابِ غلطم را درست خواند، کجا بگویم؟» — no way today to contest the page's own check (owner question 36).

## کارِ پیشینِ تو — حکم‌ها (prior-work verdict table)
| step (her words) | truth | verdict on the page | later |
|---|---|---|---|
| ۱ «۲ متر مکعب = ۲۰۰۰ کیلوگرم» | ✓ | ✓, never re-asked | credited |
| ۲ «… = ۲۹۴٫۳ کیلوژول، یعنی حدودِ ۰٫۲۹ کیلووات‌ساعت» | ✗ unit | ✗ (page unit check agrees) | disputed ⇒ re-check «حکم ماند»; her fix 0.082 applied ⇒ ✓ |
| ۳ «۰٫۲۹ ÷ ۰٫۵ = ۰٫۵۹» | ✗ dependent | ✗ · وابسته به گامِ ۲ | her fix 0.164 ⇒ ✓ |
| ۴ «294300 ÷ 1200 = 245 … ۴۹۰ وات» | ✓ independent | ✓, no false dependency | credited |
| ۵ «۰٫۵۹ ÷ ۴٫۵ = ۱۳۱ وات؛ … ۱۵۰ واتی کافیه» | incomplete (energy only) + dependent | ⚠️ ناقص · وابسته به گامِ ۳ | recomputed 36 W (still ناقص, worded D17); she finds instantaneous power ⇒ ✓ |
| ۶–۱۲ (second report) | all ✓ | ✓ ×7 merged | credited |
| ۱۳–۱۹ (third report) | 13, 14, 15, 16, 17, 19 wrong; 18 unit wrong | never entered the ledger (D18); coach told by the arithmetic block, 16 mis-read (D20) | 13–14 fixed by her in chat; 15 disputed, re-checked in chat; 16 found by her own doubt |
Resume point: 2 ⇒ 5 ⇒ «پس از آخرین گام» — correct; after the height correction ⇒ step 7 (wrong, D19).

## Defects (catalogue round26B/defects.md)
- B26·D20 (S1) · B26·D18 (S2) · B26·D19 (S2) · B26·D17 (S3) · B26·D21 (S3) · B26·D6 (S3) · B26·D7 (S3).

RESULT: FAIL — 1 S1 + 2 S2 + 4 S3
