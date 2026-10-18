# aB3 — آقای بازنشسته (۶۷) و پس‌انداز · گفت‌وگو ⇒ صفحه — ROUND 24 (runner B)

## خلاصه برای مالک
آقای ۶۷ ساله با تورم و خرجِ درمان حساب کرد، ۲۵۰ را سپرده گذاشت و شش ماه بعد پیش‌بینی‌اش درست درآمد. تاریخِ تولدِ شمسی‌اش را صفحه خودش درست ثبت کرد. وقتی گفت‌وگو را به صفحهٔ مسئله برد، همهٔ کارِ گفت‌وگو با «از گفت‌وگو: … درست است؟» آمد؛ ولی صفحه باز «مجهول چیست؟» پرسید و مرحله تا آخر «فهمِ مسئله» ماند.

## Run setup
Build main eee4ff0f (`build.py --check` in sync; dist 18 Oct 21:21, after the merge). Harness harness5.js, one throw-away profile per scenario (deleted at the end). Replay of round23B/<sid>/ctl with round24B/tools/drv.py: each AI call matched to its round-23 twin by her turn text; the round-23 reply reused only where the round-24 prompt asks nothing new; new replies (as the literal average model) for new turns, rewrite requests, the r24 contracts (birth date as said, gap.step, sys_done) — see drv.log «manual akey». Clock: page Date shift (inject.js __adv). Turn ids pN = ai/pN.json; defect ids B24·Dn = round24B/defects.md. Strict prompt scan (tools/strict.py) over every prompt of all 20 dirs: clean.

## Criteria
- [PASS] whole, data incl. inflation and health costs, deposit decision, 6-month review with a 70% forecast (reuse).
- [PASS] card «1337/12/31» refused («اسفند ۳۰ روز دارد»); chat «۱۲ اردیبهشت ۱۳۳۸» saved by the page = ICU 1959-05-03.
- [FAIL] first run: model ISO overrode the page's date (B24·D7).
- [PASS] form import «از گفت‌وگو» with ✓/✏️; u0 not re-asked.
- [FAIL] unknown re-asked p11/p12, stage frozen (B24·D2 S2); correction message imported as data (B24·D22).
- [PASS] correction ۱۸⇒۱۹ (3 back) ⇒ statement with history.
- [PASS] routing 14/14.

## نقشهٔ نیاز
Parts: 🔭 import (FOR one story) — imported but re-asks and never advances. Person (67): must not answer twice — not met.

## پیش‌نیاز
None.

## آزمودنِ اصلاح
| ۱۸⇒۱۹ | 3 · chat | statement | ✓ | other numbers | ✓ | PASS |

## سن
Elder ✓; ICU ✓; mind no-norm ✓. Birth confirmation shows the ISO date (B24·D6).

## Round-23 defects in this scenario
D5 CHANGED (B24·D2)

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
- Advance the 🔭 stage from validated chat events; drop page questions answered by an imported item.

## ایده‌ها
- A yearly review card that re-runs his own calculation with new numbers.

RESULT: FAIL — 1 S2 (D2), 3 S3 (D6, D7, D22).
