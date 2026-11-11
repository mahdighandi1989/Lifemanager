# pwB2 — پدری میانِ کارِ شیراز و ماندن در تهران (کارِ پیشین با معیارِ جاافتاده) — round 26 (group B)

## خلاصه برای مالک
پدری که خودش معیار نوشته، وزن داده و جمعِ وزنی گرفته بود، شنید که «مراقبت از مادر» را که خودش در همان پیام گفته بود از قلم انداخته و وزن‌هایش ۱۱۰٪ است. اعتراض کرد («مادرم معیار نیست»)، با شاهدِ حرفِ خودش دوباره سنجیده شد، پذیرفت، وزن‌ها را درست کرد، با همسر و مادرش حرف زد و با وارسیِ حساسیت به تصمیمِ مشروط رسید. صفحه این بار جمع‌های زنجیره‌ای‌اش را درست خواند (ایرادِ دورِ پیش رفع شد). ولی در حسابِ پولش، «۳۵ × ۱٫۴ = ۴۹ میلیون» و «۲۵ − ۱۸ = ۷ میلیون» را که درست‌اند «نمی‌خواند» زد — فقط به خاطرِ واژهٔ «میلیون» — و دستیار همان را به او گفت تا خودش اعتراض کرد؛ صفحه راهی ندارد که نشان دهد خطا از خودش بوده.

## Run setup
See ../SETUP.md. 26 steps: 22 round-25 steps + 2 new turns («نه، بس نیست!»، an arithmetic battery) + 1 follow-up (his protest at the page's ✗). 10 fresh replies (coach_state omitted once, p6, by design).

## Criteria (prior work, P1)
- [PASS] p1 verdicts: 1 ⚠️ incomplete (mother care, from his own words), 2 ✗ (110%), 3 ✓, 4 ✗ dep 2 (arithmetic right), 5 ✗ dep 1/2/4; turn question = resume point (B25·D2 FIXED).
- [PASS] p1 «# حسابِ صفحه»: chained «a×b + … = 3.6 + 2.4 + … = 8.7» read link by link ✓✓✓ (B25·D5 FIXED).
- [FAIL] p2 dispute by meaning without «نه» ⇒ page gives A073 «خودت فکر می‌کنی چرا؟» (B25·D3 pwB2 STILL, S2); the re-check reached the ledger only from the model («دوباره سنجیده شد: …»).
- [PASS] p3 his own fixes of steps 1–2 applied «به دستِ خودش … تأییدِ تو ✓»; resume moved to 4.
- [FAIL] p4 his correct fix of step 4 (page ✓ on all sums) not applied until the second report; p7 page question re-asks step 4 (B26x·D18, S3).
- [PASS] p5 «نه، بس نیست! …» not read as a dispute (A25-7 shape) — new note kept, nothing reset.
- [PASS] p6 her (his) dated sentence «فردا با مادرم حرف می‌زنم» ⇒ page «📅 … پنجشنبه ۲۱ آبان ۱۴۰۵ — در «امروز» بیاید؛ درست است؟» (C12 when the model did not report; he never answered, so nothing was booked — correct).
- [PASS] p7 second report merged («به‌روز شد»), step 4 applied, resume 5; p8 sensitivity check ✓, conditional decision as step 5 ✓, lesson.
- [FAIL] p9 arithmetic battery: correct «۳۵ × ۱٫۴ = ۴۹ میلیون» and «۲۵ − ۱۸ = ۷ میلیون» marked ✗ (B26x·D19, S1); wrong «۲۱ × ۱۲ = ۲۴۲» caught (252); «۴۹ ÷ ۱۸ ≈ ۲٫۷۲» ✓ (C9); «۴۹ − ۳۵ = ۱۴» ✓; running sum «با ۷ … میشه ۲۱» unread (correct, silent); fraction sum «۱ = ۱/۲ + ۱/۳ + ۱/۶» unread (correct, silent); date «۱۴۰۵/۱/۱۵» and score «۱۸/۲۰» ignored (correct).
- [FAIL] p10 his protest «از کجا بفهمم اشتباه از حسابِ منه یا از صفحه؟» ⇒ page turn question «این گام جواب نداد…»; no page-side re-check line (owner #36 «نیست»).
- [PASS] mind card credits correct prior steps and his own fixes (B25·D11 FIXED); [FAIL] also credits the money message with the page-✗ product (B26x·D16, S3).
- [FAIL] data import «داده: وزن‌ها هم جمعشون ۱۱۰ بود», «داده: درستش می‌کنم: حقوق ۳۰», «داده: تهران همون ۶٫۳» (B25·D24 STILL, S3).
- [PASS] no «عددِ درست را لو نده» in 🧭/📜 (B25·D6 FIXED); routing 10/10 lla_coach; strict scan clean.

## Prior-work verdict table
| step | his text | verdict (opening) | final | page |
|---|---|---|---|---|
| 1 criteria | حقوق، مسکن، مدرسه، رفت‌وآمد | ⚠️ incomplete (mother) | ✓ (added) | dispute ⇒ A073 (S2) |
| 2 weights | ۴۰/۳۰/۲۵/۱۵ (۱۱۰) | ✗ | ✓ (۳۰/۲۰/۲۰/۱۰/۲۰) | fix applied |
| 3 scores | ۹/۸/۶/۸ — ۶/۴/۸/۳ | ✓ | ✓ | credited |
| 4 sums | 8.7 / 6.05 | ✗ dep 2 | ✓ (6.7/6.3 → 7.7/6.3) | first fix ignored (S3) |
| 5 decision | شیراز، با اختلافِ زیاد | ✗ dep | ✓ conditional | — |

## نقشهٔ نیاز
- Prior ledger: honest verdicts, merge, credit — met; one fix not applied; dispute-by-meaning only via the model.
- Arithmetic check (FOR: catch his slips, never flag his correct work): failed on «… = ۴۹ میلیون» (S1).
- Person: needed a decision that counts his mother and his money honestly — reached a conditional yes with a sensitivity check; sticking point: the trial period with his mother; the yearly figure (he must redo 21 × 12).

## پیش‌نیاز
None missing.

## آزمودنِ اصلاح
His fixes of steps 1, 2, 4 are prior-ledger self-fixes (above). No chat retraction in this run.

## سن
44; «تو».

## Round-25 defects in this scenario
D2 FIXED · D3 STILL (page side) · D4 FIXED (merge) · D5 FIXED · D6 FIXED · D11 FIXED · D15 FIXED (p3) · D24 STILL.

## Arithmetic (P2)
| what he wrote | exact | page | verdict |
|---|---|---|---|
| 0.4×9 + … = 3.6 + 2.4 + 1.5 + 1.2 = 8.7 | 8.7 | ✓ ✓ | PASS |
| 2.4 + 1.2 + 2 + 0.45 = 6.05 | 6.05 | ✓ | PASS |
| 0.3×9 + … = … = 6.7; Tehran 6.3; 7.7; 7.5; 6.6 | ✓ | ✓ | PASS |
| ۳۵ × ۱٫۴ = ۴۹ میلیون | 49 | ✗ | FAIL (S1) |
| ۲۵ − ۱۸ = ۷ میلیون (Unicode minus) | 7 | ✗ | FAIL (S1) |
| ۴۹ − ۳۵ = ۱۴ | 14 | ✓ | PASS |
| … با ۷ میلیون میشه ۲۱ (running sum) | 21 | silent | PASS |
| ۲۱ × ۱۲ = ۲۴۲ | 252 | ✗ | PASS |
| ۲ و خرده‌ای، ۴۹ ÷ ۱۸ ≈ ۲٫۷۲ | 2.7222 | ✓ (C9) | PASS |
| ۱ = ۱/۲ + ۱/۳ + ۱/۶ | 1 | silent | PASS (unread) |
| ۱۴۰۵/۱/۱۵ (date), ۱۸/۲۰ (score) | — | ignored | PASS |

## Routing
10/10 (routing.md).

## ارتقای لازم
- Read «عدد + یکای واژه‌ای (میلیون، هزار، تومان)» on the right-hand side as the number times its scale, or as «نسنجیده» (C10), never ✗.
- When he contests a page ✗ with the computation, the page should re-run its check and say «خطا از خواندنِ صفحه بود» where its own value equals his.

## ایده‌ها
- «کنارِ هر ✗ ِ صفحه، حسابِ خودِ صفحه را هم ببینم تا بدانم خطا از کیست؟» (owner #36) — a per-line «چرا ✗؟» opening the page's parse.

## Defects
B26x·D19 (S1), B25·D3 (S2), B26x·D18, B26x·D16, B25·D24 (S3).

RESULT: FAIL — 1 S1 + 1 S2 + 3 S3
