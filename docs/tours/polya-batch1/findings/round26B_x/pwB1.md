# pwB1 — نگار، مهندسِ تأسیسات، و پمپِ خورشیدی (کارِ پیشین با لغزشِ واحد در گامِ ۲) — round 26 (group B)

## خلاصه برای مالک
نگار در پیامِ اول پنج گامِ حسابِ خودش را آورد. صفحه و دستیار این بار درست از «نقطهٔ ازسرگیری» شروع کردند: گام‌های ۱ و ۴ درست، گامِ ۲ (تبدیلِ کیلوژول به کیلووات‌ساعت) نادرست، و ۳ و ۵ وابسته؛ لغزشِ واحد را صفحه خودش گرفت و عدد را لو نداد. وقتی گفت «نه، گامِ ۲ درسته»، دوباره با شاهد سنجیده شد و حکم ماند؛ خودش گام ۲، ۳ و ۵ را درست کرد و دفتر این بار ادغام شد، نه جایگزین، و کارنامه گام‌های درستش را به حسابش گذاشت. او معیارِ جاافتادهٔ «توانِ لحظه‌ای» را خودش یافت و با فروشنده به پمپِ ۱۲۰ وات و پنلِ ۱۵۰ وات رسید. ولی وقتی بعد گفت ارتفاع ۱۸ متر است نه ۱۵، دفترِ کارِ پیشین همچنان «همه درست» ماند و زمان‌های حساب‌شده کهنه علامت نخوردند؛ اعتراضِ «روشِ گامِ ۵ درسته» هم به‌اشتباه «اصلاحِ ناموفق» ثبت شد.

## Run setup
See ../SETUP.md. 30 steps: the 24 round-25 steps + 4 new turns (mixed reply / taking back, a datum correction days later, a wrong division). Every reply written fresh (13 calls, one post-check rewrite).

## Criteria (prior work, P1)
- [PASS] p1 every step recognised with a verdict and reason: 1 ✓, 2 ✗ (unit), 3 ✗ dep 2, 4 ✓, 5 ✗ dep 3; turn question = resume point (B25·D2 FIXED); step 4 not made dependent by a shared number (B25·D7 FIXED).
- [PASS] p1 «# حسابِ صفحه»: kJ ⇒ kWh slip caught «با تبدیل ۰٫۰۸۱۷۵ … (عددِ درست را لو نده)» (coach-facing only), correct products/divisions ✓ (B25·D14 pwB1 FIXED); no «درست» next to ✗ — the step-3 line reads «ایرادِ این گام در خودِ این حساب نیست (داوریِ مربی)».
- [PASS] p2 post-check caught my two-question reply and asked one rewrite (correct).
- [PASS] p3 dispute «نه، گامِ ۲ درسته … چرا میگی غلطه؟» ⇒ page turn question «نخست همان گام را با شاهد دوباره بسنج»; re-check result on the page «دوباره سنجیده شد (مربی): حکم ماند — …» (C6, owner #32) — B25·D3 FIXED.
- [PASS] p4 her own fix of steps 2 and 3 applied only with the page's own check «(حسابِ عددیِ متنِ تازه را صفحه سنجید: درست)», «به دستِ خودش», resume point moves to 5 (C8; B25·D15 FIXED).
- [FAIL] the fixed step 2 keeps the old dispute reason «… ≠ ۰٫۲۹» next to ✓ (B26x·D12, S3).
- [PARTIAL] p5 mixed reply: step 3 accepted «تأییدِ تو ✓» (own state ✓); step 5 dispute by meaning stored as a failed self-fix, the re-check reason not shown (B26x·D13, S3).
- [PASS] p6 taking back («نه، همون بود — اشتباه گفتم») ⇒ verdict stays, no change, «تأییدِ تو ✓» (C5 for a dispute).
- [PASS] p7 step 5 fixed by her ⇒ «۵ گام — ۵ درست · همه درست»; second report p10 merged, never replaced (B25·D4 FIXED; 📜 shows each «به‌روز شد» in order, owner #35).
- [PASS] p8 «یادم رفته بود: اصطکاک …» kept the turn's result and data (B25·D8 FIXED).
- [FAIL] p9 «# وضعِ کنونی … مرحله: بازنگری» after a sub-result with two options open (B25·D9 STILL, S2).
- [FAIL] c21 datum 15 ⇒ 18: ledger and chat results not marked (B26x·D14, S2); correction line shows identical truncated texts (B26x·D17, S3).
- [PASS] p13 wrong «۳۵۳۱۶۰ ÷ ۴۸ = ۷۲۵۷» caught (exact 7357.5), number not leaked; [FAIL] labelled «✗ واحد … بی تبدیل به ثانیه» (B26x·D15, S3).
- [PASS] 🧭 tip and 📜 never show «عددِ درست را لو نده» (B25·D6 FIXED); breadcrumb «↩ برگرد به «از اینجا شروع کن»» (B25·D25 FIXED).
- [PASS] mind card «از کجا؟» credits «گامِ درستِ کارِ پیشینِ خودش (گامِ ۱)»، «(گامِ ۴)» and «گامِ کارِ پیشین که خودش درست کرد» ×3 (B25·D11 FIXED, owner #37); [FAIL] it also credits the ✗ result «… = 7257 …» (B26x·D16, S3).
- [FAIL] 🧭/draft data «داده: آخ… پمپ موقعِ کار ۴۹۰ وات می‌کشه» (B25·D24 STILL, S3).
- [PASS] routing 13/13 lla_coach; strict scan clean.

## Prior-work verdict table
| step | her text | verdict (opening) | final | page |
|---|---|---|---|---|
| 1 | ۲ مترمکعب = ۲۰۰۰ کیلوگرم | ✓ | ✓ | credited |
| 2 | … = ۲۹۴٫۳ کیلوژول، یعنی ~۰٫۲۹ kWh | ✗ unit | ✓ (her fix 0.082) | re-check kept ✗ after dispute; fix applied with page check |
| 3 | ۰٫۲۹ ÷ ۰٫۵ = ۰٫۵۹ | ✗ dep 2 | ✓ (0.164) | accepted in mixed reply |
| 4 | 294300 ÷ 1200 = 245 W → 490 W | ✓ | ✓ | not made dependent |
| 5 | ۰٫۵۹ ÷ ۴٫۵ = ۱۳۱ W | ✗ dep 3 | ✓ (36 W) | dispute by meaning mis-stored; taken back |
| (all) | after «۱۸ متر» | — | should be stale | still «همه درست» ✗ |

## نقشهٔ نیاز
- Prior ledger (FOR: her own work checked, merged, credited, kept true when data change): merged and credited — met; does not follow a datum correction — not met.
- Arithmetic check: catches the unit slip and the wrong division, never leaks — met; wrong label once.
- Stage: chat stage jumps to look-back on a sub-result.
- Person: needed honest verdicts (no caving to «نه») and a working design — met (120 W pump, 150 W panel, ~102 min); sticking point after the re-measure: the times for 18 m (she was asked to redo 353160 ÷ 48).

## پیش‌نیاز
None missing (the kWh definition was a slip she fixed on the definition), not booked as weakness.

## آزمودنِ اصلاح
| turns back | path | should change | did | must stay | stayed | assistant vs page |
|---|---|---|---|---|---|---|
| 10 (+1 day) | chat (15 ⇒ 18 m) | statement, datum, draft, pinned ask, ledger steps 2–5 stale, chat results 5886/6131 s stale | first four ✓; ledger ✗; chat results ✗ | 2 m³, 20 min, 50%, 4.5 h | ✓ | assistant said only the page's changes ✓ |

## سن
31; Jalali birth line once.

## Round-25 defects in this scenario
D2 FIXED (p1) · D3 FIXED (p3) · D4 FIXED (p10 merge) · D6 FIXED (🧭/📜) · D7 FIXED · D8 FIXED (p8) · D9 STILL (p9) · D11 FIXED (mind card) · D13 n/a here (no mid-solve prior block: p8/p10 sent no new ledger) FIXED · D14 FIXED · D15 FIXED · D20 FIXED (p10+ «اجرا» both) · D24 STILL · D25 FIXED.

## Arithmetic (P2)
| what she wrote | exact | page | verdict |
|---|---|---|---|
| 2000 × 9.81 × 15 = 294300 | 294300 | ✓ (unit unchecked) | PASS |
| 294.3 kJ ≈ 0.29 kWh | 0.08175 | ✗ unit | PASS |
| 0.29 ÷ 0.5 = 0.59 | 0.58 (0.5886 from 0.2943) | ✓ (C13 interval) | PASS |
| 294300 ÷ 1200 = 245 | 245.25 | ✓ | PASS |
| 294300 ÷ 3600000 = 0.082 | 0.08175 | ✓ (C9) | PASS |
| 0.164 ÷ 4.5 = 0.036 kW = 36 W | 0.03644 | ✓ ✓ | PASS |
| 294300 ÷ 50 = 5886 s ≈ 98 min | 5886; 98.1 | ✓ ✓ | PASS |
| 294300 ÷ 48 = 6131; 48 × 6131 ≈ 294 هزار | 6131.25; 294288 | ✓ ✓ | PASS |
| 353160 ÷ 48 = 7257 | 7357.5 | ✗ (labelled unit) | PASS/label S3 |

## Routing
13/13 (routing.md).

## ارتقای لازم
- On a datum correction, re-run the prior ledger's quotes and the chat results through the same stale engine (C25-15).
- A step fixed by her should carry her new reason, not the dispute evidence.
- A dispute by meaning on a dependent step: store «dispute → re-check (method ✓, input stale)», not «fix did not match».

## ایده‌ها
- «اگر عددِ پایه را عوض کنم، کدام گام‌هایم دوباره باید حساب شوند؟» — a dependency view of the ledger (B_s question) that lights up after a correction.

## Defects
B26x·D14 (S2), B25·D9 (S2), B26x·D12, D13, D15, D16, D17, B25·D24 (S3).

RESULT: FAIL — 2 S2 + 6 S3
