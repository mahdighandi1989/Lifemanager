# aB2 — نوجوانِ ۱۶ ساله و استقرا (بازنگری) — ROUND 24 (runner B)

## خلاصه برای مالک
نوجوان پس از اثباتِ استقرایی دید «چرا» مربع درمی‌آید و آن را روی اعدادِ زوج تعمیم داد. کارت: «۳۰ اسفند ۸۸» با جملهٔ «آن سال کبیسه نبود» رد شد (درست)، «۱۷ اسفند» سالش را خواست ولی وقتی فقط «88» نوشت نپذیرفت؛ «1388/12/17» درست ثبت شد. ایراد: حدس‌هایی که آزمود هنوز «آزموده نشده» نشان داده می‌شوند.

## Run setup
Build main eee4ff0f (`build.py --check` in sync; dist 18 Oct 21:21, after the merge). Harness harness5.js, one throw-away profile per scenario (deleted at the end). Replay of round23B/<sid>/ctl with round24B/tools/drv.py: each AI call matched to its round-23 twin by her turn text; the round-23 reply reused only where the round-24 prompt asks nothing new; new replies (as the literal average model) for new turns, rewrite requests, the r24 contracts (birth date as said, gap.step, sys_done) — see drv.log «manual akey». Clock: page Date shift (inject.js __adv). Turn ids pN = ai/pN.json; defect ids B24·Dn = round24B/defects.md. Strict prompt scan (tools/strict.py) over every prompt of all 20 dirs: clean.

## Criteria
- [PASS] look-back: why, generalisation, test by cases + induction, lesson (reuse).
- [PASS] invalid leap day message; 1388/12/17 ⇒ 2010-03-08 = ICU; teen block clean (B23·D8 FIXED).
- [FAIL] year-only follow-up and Finglish refused (B24·D1).
- [FAIL] guesses «آزموده نشده» (B24·D14); route order/duplicates (B24·D18).
- [PASS] routing 11/11.

## نقشهٔ نیاز
Parts: route (FOR seeing his tested guesses) — wrong outcomes. Person: met.

## پیش‌نیاز
None.

## آزمودنِ اصلاح
n/a

## سن
ICU ✓; teen ✓; mind no-norm line ✓.

## Round-23 defects in this scenario
D8 FIXED · D23 STILL

## Routing
### aB2 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. دیروز تکلیفمون رو حل کردم: با استقرا ثابت کردم مجموع n…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «خب تو گام استقرا نوشتم: 1+3+…+(2n−1)+(2n+1) = n² + (2n+1) = …» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «کشیدم! ۱ یه خونه‌ست. ۳ تا خونه دورش یه L درست می‌کنن، میشه م…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «تو پایه‌ی استقرا n=1، عدد فرد اول 2×1−1 = 1. و تو گام، عدد ف…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «مثلاً مجموع n عدد زوج اول: 2+4+…+2n. اگه خونه بچینم، ۲ تا، ب…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «n=1: ۲ = 1×2 ✓. n=2: ۲+۴=۶ = 2×3 ✓. n=3: ۱۲ = 3×4 ✓. شکلشم ک…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «درسم اینه: بعد از اینکه با استقرا ثابت کردم، یه شکل بکشم که …» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «همون که گفتی اعداد فرد رو با خونه‌ها بچینم. اونجا تازه دیدم …» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «اون شکله خیلی باحال بود! ولی خوندن استقرای معلم سخته، حوصله‌…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «سلام! امروز تو کتاب یه سؤال بود: 1+3+5+…+99 چنده؟ سریع گفتم:…» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «چون nامین فرد 2n−1 ـه: 2n−1 = 99 پس n = 50. پس ۵۰ تا فرده و …» | lla_coach | lla_coach | ✓ |

## ارتقای لازم
- Card keeps the day typed in the card when asking only the year.

## ایده‌ها
- A picture-proof gallery of his own shapes.

RESULT: FAIL — 1 S2 (D1), 2 S3 (D14, D18) + D6.
