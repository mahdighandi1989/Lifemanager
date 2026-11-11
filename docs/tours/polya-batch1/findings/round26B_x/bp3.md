# bp3 — نوجوانِ ۱۴ساله، نردبان و سه پیش‌نیازِ تودرتو (فیثاغورس ⇐ جذر، مساحتِ مثلث) — round 26 (group B)

## خلاصه برای مالک
نوجوانی که نمی‌فهمید چرا «۵ منهای ۳» جوابِ کتاب نیست، سه چیزِ نخوانده داشت: قضیهٔ فیثاغورس، جذر (که خودِ فیثاغورس به آن نیاز داشت) و مساحتِ مثلث. سامانه هر سه را جدا شناخت، با پرسشِ تشخیصیِ «مربعِ ۱۶ خانه‌ای ضلعش چنده؟» سنجید، هر کدام را فقط به اندازهٔ همان گام یاد داد و هر بار دقیقاً به همان‌جای مسئله برگشت؛ او به ۴ متر و ۶ مترمربع رسید و با خط‌کش هم وارسی کرد. «فکر می‌کردم خنگم» با نامِ دقیقِ کمبود پاسخ گرفت و فردا برگهٔ سفیدِ دو از سه ثبت شد. ایرادی ندیدم.

## Run setup
See ../SETUP.md. 29 steps replayed; 14 model calls, all reused.

## Criteria
- [PASS] p1–p3 whole first; «۵ − ۳» as her own question kept.
- [PASS] p3–p11 nested prerequisites (Pythagoras ⇒ square root; triangle area), each with the exact concept and step, diagnostic question, taught as far as needed, mastery by her own check, exact return («برگشت به پیش‌نیازِ «قضیهٔ فیثاغورس»…» then «برگشت به مسئلهٔ اصلی…»).
- [PASS] «# حسابِ صفحه» on every message with arithmetic: ✓ 9×9 = 81, 12×12 = 144, 6 × 6 = 36, 15 × 15 = 225, 5 × 5 = 25, 3 × 3 = 9, 25 − 9 = 16, 3 × 4 = 12, 12 / 2 = 6 — all exact; her conceptual slips («وتر ۲۲۵ متره؟», «جذرِ ۱۶ = ۸ چون ۱۶ ÷ ۲») were left to the coach (correct boundary: «این سنجش فقط حساب … است»).
- [PASS] no prior block on her mid-solve steps (B25·D13 bp3 FIXED); no «درست» beside ✗ (B25·D14 bp3 part FIXED).
- [PASS] closure, «کدام پرسش کمک کرد» = the diagnostic question; practice case 41 on her request; next-day session 2/3 booked, next due day 3.
- [PASS] «خنگم» ⇒ «🧩 این کم‌هوشی نیست: … کمبودِ یک پیش‌نیازِ مشخص»; mind card «علتِ هر گیر: پیش‌نیاز ۲ · گره ۰ · مهارت ۰», learned prerequisites as progress.
- [PASS] routing 14/14; strict scan clean.

## نقشهٔ نیاز
- Prerequisite layer (FOR: tell a missing concept from a knot or ability, teach only as needed, return exactly): fully met, nested order right.
- Arithmetic check: correct work read correct; never «درست» for a wrong concept beyond arithmetic — met.
- Practice case: opened from her request, 2/3 session booked — met.
- Person (14): needed to stop thinking «خنگم» and reach the book's answer — met.

## پیش‌نیاز
Three missing (one nested), all detected, ordered (Pythagoras needs root first), mastered and re-checked; the self-label answered with the named gap.

## آزمودنِ اصلاح
None in this scenario.

## سن
14 (teen band): «تو», no childishness; Jalali birth line once.

## Round-25 defects in this scenario
- B25·D13 (bp3 p5–p11): FIXED. B25·D14 (bp3 p9 «درست» beside ✗): FIXED.

## Arithmetic (P2)
| what she wrote | exact | page | verdict |
|---|---|---|---|
| 9×9 = 81, 12×12 = 144, «جمعشون ۲۲۵» | 81, 144, 225 | ✓ ✓, sum silent | PASS |
| «۱۶ تقسیم بر ۲ میشه ۸» (as a root) | 8 (arith.) | silent | PASS (concept for the coach) |
| 25 − 9 = 16; 3 × 4 = 12; 12 / 2 = 6; «۸ و ۵ … ۲۰» | ✓ | ✓ / silent | PASS |

## ارتقای لازم
None new.

## ایده‌ها
- «این سه چیزِ تازه‌ام در نقشهٔ پیش‌نیازها کجا وصل شده‌اند؟» — the 🧩 map already links them; a one-click «برگهٔ سفید» from there would serve her.

## Defects
None.

RESULT: PASS
