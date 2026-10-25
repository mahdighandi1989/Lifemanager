# aB1 — سارا، ۹ ساله، و اتوبوس‌های اردو — ROUND 25 (runner B)

## خلاصه برای مالک
سارای ۹ ساله با ۱۷۸ ÷ ۴۲ و «باقی‌مانده را فراموش کردم» به ۵ اتوبوس رسید. تاریخِ تولدِ دورقمیِ «96/2/30» این بار پذیرفته شد، تأییدش فقط شمسی بود، یک بار، و نامِ مدرسه‌اش در پرونده پنهان شد. کارنامه برای ۹ ساله صادقانه می‌گوید هنجارِ معتبر نیست.

## Run setup (common, runner B round 25)
Page main 64dc0667 (`build.py --check` in sync; dist 2026-10-25 12:20 after the 12:19 merge). Harness harness5.js (+ round25B/tools/harness5s.js = same harness with the page URL from env, only for the territory scratch pages). Driver round25B/tools/drv25b.py replays round24B/<sid>/ctl and reuses each round-24 reply matched by HER turn text (not by number); new replies were written as the literal average model only where the round-25 prompt asked for something new: `coach_state.prior` whenever the new «# کارِ پیشینِ تو … پیامش کارِ پیشینِ خودش را دارد» block appeared and the message really held her own steps (s11 p1–p2, s12 p8, s13 p7, s14 p3/p6/p7, s15 p2, s18 p5/p8, s20 p3, aB1 p5, aB2 p3–p6/p10–p11, bp1 p6–p8, bp2 p4/p6, bp3 p5/p7–p11), rewrite requests (s12 p10, aB4 p9/p11), changed follow-ups (oB1 p7), the territory arms and every turn of the new scenarios (pwB1, pwB2, oB1 p15–p23, tB1 p9, tB1y p9) — see drv.log «manual akey» / «+patch». Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept). Shots: out/s<N>.png per ctl, view_pre/post_*, post-run part_*.png + post.txt (tools/post21.js). Strict prompt scan: clean in all 26 runs. Throw-away browser profiles (deleted at the end). Defect ids: round25B/defects.md (B25·Dn) and round24B/defects.md (B24·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] card «۳۱ مهر ۹۶» ⇒ «مهر ۳۰ روز دارد»; «96/2/30» ⇒ 2017-05-20 = ICU, band child (B24·D1 FIXED).
- [PASS] one confirmation, Jalali only (B24·D6 FIXED).
- [PASS] school name «دبستان [نامِ مدرسه]» in 📜 (round-24 upgrade built).
- [PASS] p5 prior ✓ ×3; routing 9/9; mind no-norm line for 9.

## نقشهٔ نیاز
Parts: assistant (FOR one honest question per turn, never the answer) — met in content; 🔭/route/📜 (FOR one story from chat to forms) — see criteria. Person: wanted to reach the result herself — met.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No correction trial in this scenario (round-24 trials, where present, replayed with the same result).

## سن
9, child: «96/2/30» ✓ (D1 fixed), Jalali-only confirmation ✓, no-norm line ✓, school name redacted ✓.

## Round-24 defects in this scenario
- D1: FIXED
- D6: FIXED

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
- (none beyond the defect fixes)

## ایده‌ها
- (none new)

## Defects (catalogue round25B/defects.md)
- none

RESULT: PASS
