# aB1 — آوا (۹ ساله) و اتوبوس‌های اردو · سن — ROUND 24 (runner B)

## خلاصه برای مالک
آوا خودش فهمید باقی‌مانده هم مهم است و ۵ اتوبوس لازم است. تاریخ تولد: «۳۱ مهر ۹۶» با جملهٔ انسانی رد شد؛ «96/2/30» — رایج‌ترین شکل — شناخته نشد؛ «1396/2/30» درست ثبت شد؛ جملهٔ «من ۳۰ اردیبهشت ۹۶ به دنیا اومدم» هم دیده شد. ایراد: در پیام برای یک کودک «2017-05-20» نوشته شد.

## Run setup
Build main eee4ff0f (`build.py --check` in sync; dist 18 Oct 21:21, after the merge). Harness harness5.js, one throw-away profile per scenario (deleted at the end). Replay of round23B/<sid>/ctl with round24B/tools/drv.py: each AI call matched to its round-23 twin by her turn text; the round-23 reply reused only where the round-24 prompt asks nothing new; new replies (as the literal average model) for new turns, rewrite requests, the r24 contracts (birth date as said, gap.step, sys_done) — see drv.log «manual akey». Clock: page Date shift (inject.js __adv). Turn ids pN = ai/pN.json; defect ids B24·Dn = round24B/defects.md. Strict prompt scan (tools/strict.py) over every prompt of all 20 dirs: clean.

## Criteria
- [PASS] remainder logic, check by multiplication, lesson in her words, bestQ/taste (reuse).
- [PASS] invalid day ⇒ ««مهر» ۳۰ روز دارد»; Latin 4-digit Jalali ⇒ 2017-05-20 = ICU; band child; Today shows no adult puzzle (D23-27 class FIXED).
- [FAIL] «96/2/30» refused (B24·D1 S2).
- [FAIL] ISO date shown to a child; duplicate confirmation (B24·D6).
- [PASS] p2–p6 subject without greeting/name (B23·D10/D13 FIXED).
- [PASS] routing 9/9.

## نقشهٔ نیاز
Parts: birth card (FOR a parent typing the date the usual way) — refuses the usual way. Person: met.

## پیش‌نیاز
None (division with remainder known).

## آزمودنِ اصلاح
n/a

## سن
ICU 1396/2/30 = 2017-05-20 ✓; «# مخاطب» child lines + minors' safety ✓; mind «سن: ۹ … هنجارِ معتبر در دست نیست» ✓.

## Round-23 defects in this scenario
D10/D13 FIXED

## Routing
### aB1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. من آوام. معلممون یه مسئله داده: «یه اتوبوس ۴۲ تا صندلی…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «اینکه چند تا اتوبوس لازمه که همه‌ی بچه‌ها سوار شن. من ۱۷۸ رو…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «۱۰ تا! ۴۲ ضربدر ۴ میشه ۱۶۸، ۱۷۸ منهای ۱۶۸ میشه ۱۰. خب اون ده…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «هیچ جا! پس یه اتوبوس دیگه لازمه. ۵ تا اتوبوس! ولی اتوبوس پنج…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «۴۲ ضربدر ۵ … ۲۱۰! ۲۱۰ از ۱۷۸ بیشتره، پس همه جا میشن. پس جواب…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «یاد گرفتم وقتی تقسیم می‌کنم و یه چیزی باقی می‌مونه، اون باقی…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «اونجا که پرسیدی اون ده تا بچه کجا می‌شینن!…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «دوست داشتم که خودم فهمیدم! ضربدر ۴۲ سخت بود، با انگشتام نمی‌…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «مامانم گفت اینم بگم: من ۳۰ اردیبهشت ۹۶ به دنیا اومدم.…» | lla_coach | lla_coach | ✓ |

## ارتقای لازم
- Accept yy/m/d with a two-digit year.
- Do not keep a minor's school name verbatim in the dossier.

## ایده‌ها
- A parent view of the child's work without personal details.

RESULT: FAIL — 1 S2 (D1), 1 S3 (D6).
