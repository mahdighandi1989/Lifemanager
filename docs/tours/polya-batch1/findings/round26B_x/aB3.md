# aB3 — بازنشستهٔ ۶۷ساله، پس‌انداز و سپرده (تورم، اصلاحِ حقوق، وارسیِ شش‌ماهه) — round 26 (group B)

## خلاصه برای مالک
مردِ بازنشسته‌ای خودش در گفت‌وگو حساب کرد پس‌اندازش تا کی می‌ماند: تورمِ خرج و حقوق را افزود، از دفترچه‌اش خرجِ درمان را برآورد کرد، حدسِ «هیچ‌وقت تمام نمی‌شود» را با سالِ دوم رد کرد و برنامهٔ «۲۵۰ سپرده، ۵۰ دمِ دست، وارسی هر شش ماه» گذاشت. صفحه تاریخِ «۱ اردیبهشت» را از حرفِ خودش خواند، با «درست است؟» پرسید و با «آری» ِ او ثبت کرد؛ لحن همه‌جا «شما» بود. ایرادها: مرحله پس از یک نتیجهٔ میانی زود «بازنگری» شد؛ برای یک قرار دو موعد ساخته شد و پس از انجامش یکی هنوز «انجام شد؟» می‌پرسد؛ پیش‌بینیِ ۷۰ درصدی‌اش هرگز در «🎯» ننشست؛ و یک پاسخِ تمام‌«شما» را صفحه به‌اشتباه «دو ضمیر» خواند.

## Run setup
See ../SETUP.md. 24 round-25 steps; 15 fresh replies (one post-check rewrite). First attempt stopped once (page did not return within the driver's wait after a rewrite); the whole scenario was re-run from scratch with the same answers and completed — the result here is that clean re-run.

## Criteria
- [PASS] c2 card «1337/12/31» ⇒ ««اسفند» ۳۰ روز دارد»; c3 «بعداً»; p2 her chat sentence «۱۲ اردیبهشت ۱۳۳۸» ⇒ «✓ تاریخِ تولدتان ثبت شد: ۱۲ اردیبهشت ۱۳۳۸» (= 1959-05-03 ICU), once, Jalali, «شما».
- [PASS] «# مخاطب» elder block; page questions in «شما» («به مجهول نگاه کنید»، «بنویسید»).
- [PASS] p1–p5 understanding: unknown, inflation found by him, health costs estimated from his notebook.
- [FAIL] p6 stage «بازنگری» after the sub-result (B25·D9 STILL, S2).
- [PASS] p7–p8 his guess «اصلاً تموم نمیشه؟» tested with year two and refuted by himself; «✓ ۲۱ × ۱.۳ = ۲۷.۳»، «✓ ۱۸ × ۱.۲ = ۲۱.۶».
- [PASS] p9–p10 C12: his date read by the page «📅 از حرفِ خودتان: «اولیش ۱ اردیبهشت» — چهارشنبه ۱ اردیبهشت ۱۴۰۶ — … درست است؟» ⇒ booked only after his «آره، ثبتش کن» («✓ به گفتهٔ خودتان ثبت شد…»).
- [FAIL] two deadline records for the one commitment; Today after his report still asks «انجام شد؟» for the second (B26x·D21, S3).
- [FAIL] his «۷۰ درصد مطمئنم» never became a 🎯, and «پیش‌بینیم درست درومد» was judged nowhere (B26x·D22, S3).
- [PASS] c14 correction 18 ⇒ 19: statement changed, pinned asked; [FAIL] chat results 21.6 / 5.7 not marked (B26x·D14, S3 here); his recomputation ✓ «۱۹ × ۱.۲ = ۲۲.۸»، «۲۷.۳ − ۲۲.۸ = ۴.۵».
- [FAIL] p14 post-check «دو ضمیر» on an all-«شما» reply (B26x·D20, S3).
- [PASS] +test clock: Today shows the overdue check on the right date; routing 15/15; strict scan clean.

## نقشهٔ نیاز
- Assistant/coach: his own calculation, honest test of his guess, elder register — met.
- Date reader (FOR: his own dates only after his yes): met. Today (FOR: one line per act, leaves when done): not met (duplicate, stays).
- 🎯 (FOR: every stated prediction judged, calibration): not met.
- Person: needed to know when the money runs out and a habit of checking — reached («از سالِ سوم کم می‌آید», six-monthly check done, prediction came true).

## پیش‌نیاز
None missing.

## آزمودنِ اصلاح
| turns back | path | should change | did | must stay | stayed | assistant vs page |
|---|---|---|---|---|---|---|
| 13 | chat (18 ⇒ 19) | statement, pinned, chat results 21.6/5.7 | statement ✓, pinned asked ✓, results ✗ | expenses 21, inflation 30/20 | ✓ | ✓ |

## سن
67 (60+): Jalali, «شما» everywhere (page lines too), no condescension; one false «two pronouns» rewrite.

## Round-25 defects in this scenario
- B25·D20 («# وضعِ کنونی» vs live): n/a this run (no live problem was opened — he did not ask; the chat stage and the prompt agreed). B25·D24 («پس سالی حدود ۳۰ میلیون» as data): no data import in this run (no live forms). B24·D12 (aB3 p13 two questions): FIXED (single page questions). B25·D16 (📜 two arrow forms): not reproduced (no live problem).

## Arithmetic (P2)
| what he wrote | exact | page | verdict |
|---|---|---|---|
| ۲۵۰ ضربدر ۲۳ درصد میشه ۵۷.۵ … تقسیم بر ۱۲ ≈ ۴.۸ | 57.5; 4.79 | unread (words) | PASS |
| ۲۱ × ۱.۳ = ۲۷.۳; ۱۸ × ۱.۲ = ۲۱.۶; «کسری ۵.۷» | ✓ | ✓ ✓ / silent | PASS |
| ۱۹ × ۱.۲ = ۲۲.۸; ۲۷.۳ − ۲۲.۸ = ۴.۵ | ✓ | ✓ ✓ | PASS |
| «پس سالی حدود ۳۰ میلیون» (40, 25) | 32.5 (rough) | silent | PASS |

## ارتقای لازم
- One commitment ⇒ one deadline: when the page books her yes, ignore a same-date model deadline for the same message.
- Read «N درصد مطمئنم» as a 🎯 with its date and judge it from «پیش‌بینیم درست درومد».

## ایده‌ها
- «هر شش ماه که حساب می‌کنم، نمودارِ کسری و سود را کنارِ هم می‌بینم؟» — his numbers form a two-column series the mini-plot could draw.

## Defects
B25·D9 (S2), B26x·D20, D21, D22, D14 (S3).

RESULT: FAIL — 1 S2 + 4 S3
