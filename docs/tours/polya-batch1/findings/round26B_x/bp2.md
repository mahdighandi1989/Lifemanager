# bp2 — باغدارِ ۴۸ساله، آبِ باران و دو پیش‌نیازِ واحد (متر/میلی‌متر، مترمکعب/لیتر) — round 26 (group B)

## خلاصه برای مالک
باغداری که «یه متر صد میلی‌متره» یادش مانده بود، با سنجیدنِ «۱٫۵ متر باران» با واقعیت خودش دید اشتباه است؛ صفحه این بار خطای واحد را خودش گرفت (ایرادِ دورِ پیش رفع شد)، دو پیش‌نیاز (متر↔میلی‌متر و مترمکعب↔لیتر) همان‌جا و فقط به اندازهٔ همین گام آموخته شد، و «فکر کردم سنم رفته بالا و ریاضیم ضعیفه» با «این کم‌هوشی نیست…» پاسخ گرفت. نتیجهٔ میانی دیگر کلِ مسئله را به بازنگری نمی‌برد و پرسش‌های صفحه تکرار نمی‌شوند. دو ایرادِ کوچک: نوارِ مسیر در پایان هنوز می‌گوید «اکنون: پیش‌نیازِ تبدیلِ مترمکعب به لیتر» در حالی که آموخته شده، و قرارِ «هفته‌ی بعد، جمعه» بی «درست است؟» در برنامه نشست.

## Run setup
See ../SETUP.md. 35 steps replayed; 12 model calls, reused (one plan date shifted to this run's calendar by my driver).

## Criteria
- [PASS] p1–p3 whole first, unknown and data from her words; u1 not re-asked («[در گفت‌وگو پاسخ گرفته — دوباره نپرس]»).
- [PASS] p4 «# حسابِ صفحه»: «✗ واحد (تبدیلِ متر به میلی متر): «هر متر» را «صد میلی متر» نوشته» + «✓ ۵۰ × ۱.۵ = ۷۵» (arithmetic right, unit wrong; no «درست» beside ✗) — B25·D14 (bp2 part) FIXED.
- [PASS] p5 reality check «۱٫۵ متر باران»; p6 prerequisite named exactly (concept + step), taught only as far as needed; «✓ ۱۵۰ میلی متر = ۰.۱۵ … ۵۰ × ۰.۱۵ = ۷.۵»; second prerequisite (m³ → L) the same; exact return each time.
- [PASS] p5–p7 stage «اجرا» after the intermediate m³ (no look-back jump) — B25·D9 (bp2) FIXED.
- [PASS] c19 correction 50 ⇒ 60: «نتیجهٔ «۷.۵ متر مکعب میشه ۷۵۰۰ لیتر» دیگر برقرار نیست — بر «۵۰» بنا بود»; ✏️ 150 ⇒ 140 applied; her 9 m³ / 8.4 m³ recomputations not flagged (both exact).
- [PASS] p9–p12 the page's look-back question changes each turn — B25·D21 (bp2) FIXED.
- [PASS] p12 «ریاضیم ضعیفه» ⇒ «🧩 این کم‌هوشی نیست: … کمبودِ یک پیش‌نیازِ مشخص، نه توانِ تو؛ که همین‌جا آموختی (پیشرفت)»; mind card «علتِ هر گیر: پیش‌نیاز ۳» and «پیش‌نیازهای آموخته (پیشرفت، نه ضعف)».
- [FAIL] final route strip still «اکنون: پیش‌نیازِ «تبدیلِ مترمکعب به لیتر»» (B25·D28 STILL, S3).
- [FAIL] «هفته‌ی بعد، جمعه، … می‌خرمش» booked «موعد: ۲۵ آبان ۱۴۰۵» without her yes and without reading «جمعه» (B26x·D7, S3).
- [PASS] routing 12/12; strict scan clean; no prior block on mid-solve steps (B25·D13 bp2 FIXED).

## نقشهٔ نیاز
- Arithmetic/unit check: caught the slip, never leaked 1000 to her — met. Prerequisite layer: exact concept, diagnostic, mastery, return — met. 🧭: strip not refreshed after the last mastery — poorly met. Dates: model's date booked without her yes.
- Person (48, ashamed of «سنم رفته بالا»): needed the gap named, not ability — met; reached 8 400 L and a 10 000 L tank with an 80% prediction.

## پیش‌نیاز
Two prerequisites (m↔mm, m³↔L), both detected from her words, checked with a diagnostic question, taught to this step, re-checked, return exact; booked as progress; the self-label answered with the named gap.

## آزمودنِ اصلاح
| turns back | path | should change | did | must stay | stayed | assistant vs page |
|---|---|---|---|---|---|---|
| ~8 | chat (50⇒60) | statement, the 7.5 m³ result set aside | ✓ | rainfall | ✓ | ✓ |
| ~2 | ✏️ (150⇒140) | statement, datum | ✓ | area 60 | ✓ | ✓ |

## سن
48; replayed replies use «شما», page lines «تو» (e.g. «✓ تاریخِ تولدت ثبت شد») — one register per sentence; age handled.

## Round-25 defects in this scenario
- B25·D9 (bp2): FIXED. B25·D14 (bp2 mm→m): FIXED. B25·D21 (bp2): FIXED. B25·D28: STILL. B25·D13 (bp2): FIXED.

## Arithmetic (P2)
| what she wrote | exact | page | verdict |
|---|---|---|---|
| 50 × 150 = 7500 | 7500 | silent (her own doubt about units) | PASS |
| «یه متر صد میلی‌متره» ⇒ 1.5 m | 0.15 m | ✗ unit | PASS |
| 50 × 1.5 = 75 | 75 | ✓ (arithmetic) | PASS |
| 150 mm = 0.15; 50 × 0.15 = 7.5 | ✓ | ✓ ✓ | PASS |
| 60 × 0.15 = 9; 60 × 0.14 = 8.4 | ✓ | not flagged | PASS |

## ارتقای لازم
- Refresh the 🧭 strip on each mastery event.

## ایده‌ها
- «اگر سالِ پرباران‌تر بیاید، مخزن سرریز می‌کند؟» — her 80% prediction could be judged automatically from a rainfall entry.

## Defects
- B25·D28 (S3), B26x·D7 (S3).

RESULT: FAIL — 2 S3
