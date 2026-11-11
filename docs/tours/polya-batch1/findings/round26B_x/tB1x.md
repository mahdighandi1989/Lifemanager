# tB1x — side arm of tB1: she takes the waiting step herself (sys_done), round 26 (group B)

## خلاصه برای مالک
همان ایدهٔ جعبه‌قرص؛ گامِ «کسی قبلاً همینو ساخته؟» منتظرِ برگه ماند و او بی‌آنکه منتظر بماند خودش در پایگاهِ ثبتِ اختراع گشت و دو نمونه پیدا کرد. صفحه این را درست فهمید: گام از حالتِ منتظر درآمد، زیرِ برگه نوشت که این گام دیگر منتظر نیست و برگه را برای دیگران نگه داشت. ولی این مسئله (که در گفت‌وگو مانده و جداگانه ثبت نشده بود) نامِ و مقصدش از جملهٔ اولِ او («یه ایده دارم…» / «از کجا شروع کنم؟») گرفته شد، و پس از دو نتیجهٔ میانی صفحه آن را «بازنگری — حل به نتیجه رسید» خواند، در حالی که طرح هنوز تمام نشده است.

## Criteria
- [PASS] p3 gap filed + p4 second opinion ⇒ sheet #101, step «(۳) …» waiting.
- [PASS] p8 «راستش برای (۳) منتظر نموندم: خودم یه راه دیگه پیدا کردم — … Google Patents …» ⇒ model `sys_done` ⇒ sys entry state `other`; 🧭 detour «✓ گامِ «(۳) …» … از راهِ دیگر»; 📜 «برگهٔ #۱۰۱ دیگر منتظرِ این گام نیست (برگه برای دیگران سرِ جایش می‌ماند)»; sheet note «… گام از راهِ دیگر برداشته شد … هنوز لازم است؟».
- [FAIL S2] B25·D9 STILL (tB1x): after the sub-results of p6–p7 (two of three unknowns) p7 «# وضعِ کنونی … مرحله: بازنگری» and the 🧭 strip «اکنون: بازنگری · مانده: فقط بازنگریِ خودت — حل به نتیجه رسید» — the plan is not finished (independence untested, step 3 just found, no build plan). (tB1 p7 has the same «مرحله: بازنگری» in the prompt, but its registered live problem's strip says «طرحِ نقشه».)
- [FAIL S3] B25·D23 / B26x·D24 family: the chat problem's title is her opening «یه ایده دارم و می‌خوام از ایده برسم به …» and its destination «مقصد: از کجا شروع کنم؟» (her meta-question, not the unknown she stated at p2).
- [PASS] routing 8/8.

## نقشهٔ نیاز
- Territory loop (FOR: let her overtake the waiting step): met.
- 🧭 (FOR: where am I, what remains): unmet — says solved and «only review» (D9), destination is her greeting question.
- Person: she wants to continue from her own finding («which part of my idea is new?»); the model asked exactly that — the page's strip told her the opposite.

## پیش‌نیاز / آزمودنِ اصلاح / سن
None / sys_done path (round-25 fix) ✓ / 31, adult ✓.

## Round-25 defects
- B25·D9 STILL (tB1x p7).
- B25·D19 FIXED (sys_done line + sheet note).
- B25·D23 family STILL (destination = opening meta-sentence).

## Arithmetic
Same four as tB1 — all correct, page silent (unread).

## Routing
8/8 (routing.md).

## ارتقای لازم
- Stage «بازنگری» only after a result for the WHOLE unknown, not after sub-results (D9).
- Take a chat problem's destination from the unknown she states (p2), never from the opening greeting/meta question.

## ایده‌ها
None new.

## Defects
- S2 B25·D9 STILL. - S3 B25·D23 family.

RESULT: FAIL (1 S2, 1 S3)
