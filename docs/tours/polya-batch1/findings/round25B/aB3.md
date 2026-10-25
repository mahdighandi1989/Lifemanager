# aB3 — آقای ملکی، ۶۷ ساله، پس‌انداز و سپرده — ROUND 25 (runner B)

## خلاصه برای مالک
آقای ملکی در گفت‌وگو حساب کرد پس‌اندازش تا کی می‌ماند و بعد آن را مسئلهٔ صفحه کرد؛ این بار مجهولش دوباره پرسیده نشد و پیامِ اصلاحِ «۱۹ نه ۱۸» دیگر داده حساب نشد. ولی پرسشِ صفحه در یک نوبت هنوز دو پرسش است و یک داده هنوز تکه‌تکه وارد شده است. در بازوی جدا، تاریخِ تولدی که مدل اشتباه به میلادی برگرداند صفحه را عوض نکرد، ولی متنِ اشتباهِ مدل («۲ مهٔ ۱۹۵۹») بی هیچ تذکری جلوی او ماند.

## Run setup (common, runner B round 25)
Page main 64dc0667 (`build.py --check` in sync; dist 2026-10-25 12:20 after the 12:19 merge). Harness harness5.js (+ round25B/tools/harness5s.js = same harness with the page URL from env, only for the territory scratch pages). Driver round25B/tools/drv25b.py replays round24B/<sid>/ctl and reuses each round-24 reply matched by HER turn text (not by number); new replies were written as the literal average model only where the round-25 prompt asked for something new: `coach_state.prior` whenever the new «# کارِ پیشینِ تو … پیامش کارِ پیشینِ خودش را دارد» block appeared and the message really held her own steps (s11 p1–p2, s12 p8, s13 p7, s14 p3/p6/p7, s15 p2, s18 p5/p8, s20 p3, aB1 p5, aB2 p3–p6/p10–p11, bp1 p6–p8, bp2 p4/p6, bp3 p5/p7–p11), rewrite requests (s12 p10, aB4 p9/p11), changed follow-ups (oB1 p7), the territory arms and every turn of the new scenarios (pwB1, pwB2, oB1 p15–p23, tB1 p9, tB1y p9) — see drv.log «manual akey» / «+patch». Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept). Shots: out/s<N>.png per ctl, view_pre/post_*, post-run part_*.png + post.txt (tools/post21.js). Strict prompt scan: clean in all 26 runs. Throw-away browser profiles (deleted at the end). Defect ids: round25B/defects.md (B25·Dn) and round24B/defects.md (B24·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] card «1337/12/31» ⇒ «اسفند ۳۰ روز دارد»; chat birth ⇒ 1959-05-03 = ICU, one confirmation.
- [PASS] p11/p12 no unknown re-ask; live block stage «اجرا روی واقعیت» (B24·D2 CHANGED).
- [FAIL] «# وضعِ کنونی» «مرحله: فهمِ مسئله» vs live block «اجرا» in the same prompts p11–p14 (B25·D20, S3).
- [FAIL] p13 page question two questions (B24·D12 STILL, S3).
- [FAIL] import: correction message no longer data ✓, but «سال قبلش ۲۵ میلیون», «پس سالی حدود ۳۰ میلیون» fragments/inference as data (B24·D22 CHANGED; B25·D24, S3); 📜 mixes two arrow forms (B24·D16 STILL).
- [PASS] aB3x: model ISO 1959-05-02 ignored, stored 05-03 (B24·D7 FIXED); [FAIL] reply text «برابر است با ۲ مهٔ ۱۹۵۹» left without a page note (B25·D17, S3).
- [PASS] routing 14/14 + 2/2.

## نقشهٔ نیاز
Parts: assistant (FOR one honest question per turn, never the answer) — met in content; 🔭/route/📜 (FOR one story from chat to forms) — see criteria. Person: wanted to reach the result herself — met.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
«۱۸ نه ۱۹» salary: statement/draft/datum follow; correction message not imported as data (D22 changed); fragments remain.

## سن
67, elder: «1337/12/31» error ✓; chat Jalali ⇒ ICU ✓; model ISO ignored (aB3x) ✓; page lines «شما».

## Round-24 defects in this scenario
- D2 (aB3): CHANGED
- D7: FIXED (aB3x)
- D12 (aB3 p13): STILL
- D22: CHANGED
- D16 arrows: STILL

## Routing
### aB3 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. من بازنشسته‌ام. ۳۰۰ میلیون تومن پس‌انداز دارم. حقوق با…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «یعنی: با این پس‌انداز و این حقوق، کِی پولم تموم میشه و چیکار…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «آره، تورم! خرج‌مون هر سال حدود ۳۰ درصد زیاد میشه، ولی حقوقم …» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «فکر کنم سود بانک هم مهمه، و اینکه یه وقتی مریض بشیم خرج یهوی…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «دفترچه‌م رو نگاه کردم: پارسال حدود ۴۰ میلیون خرج دندون و دکت…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «خانمم میگه همیشه باید حداقل ۵۰ میلیون دم دست باشه. پس ۲۵۰ تا…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «۲۵۰ میلیون ضربدر ۲۳ درصد میشه ۵۷.۵ میلیون در سال، تقسیم بر ۱…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «خرج میشه ۲۱ ضربدر ۱.۳ = ۲۷.۳، حقوق ۱۸ ضربدر ۱.۲ = ۲۱.۶. کسری…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «۲۵۰ رو می‌ذارم سپرده‌ی یک‌ساله، ۵۰ دم دست. و هر شش ماه یه با…» | lla_coach | lla_coach | ✓ |
| p10 | action-only | «آره، ثبتش کن.…» | lla_assistant | lla_assistant | ✓ |
| p11 | coaching (problem talk) | «ببخشید، یه اشتباه کردم: حقوقم ماهی ۱۸ نیست، ۱۹ میلیونه؛ فیشم…» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «با ۱۹: حقوق سال دوم ۱۹ ضربدر ۱.۲ = ۲۲.۸، کسری ۲۷.۳ منهای ۲۲.…» | lla_coach | lla_coach | ✓ |
| p13 | coaching (problem talk) | «سالانه بسه، ولی خرج درمان رو جدا می‌نویسم چون یهویی میاد.…» | lla_coach | lla_coach | ✓ |
| p14 | coaching (problem talk) | «سلام، اول اردیبهشته. همون حساب رو کردم: الان کسری ماهانه حدو…» | lla_coach | lla_coach | ✓ |


## ارتقای لازم
- (none beyond the defect fixes)

## ایده‌ها
- (none new)

## Defects (catalogue round25B/defects.md)
- B25·D20, D24, D17 (S3)
- B24·D12, D16 (S3)

RESULT: FAIL — 5 S3
