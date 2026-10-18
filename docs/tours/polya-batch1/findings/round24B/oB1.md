# oB1 — کاربرِ مالک‌مانند و بیداریِ ساعت ۶ (بانکِ پرسش ۵–۸) — ROUND 24 (runner B)

## خلاصه برای مالک
مردی کنجکاو با مسئلهٔ واقعیِ بیداری، پشتِ هر جواب یک پرسش دربارهٔ خودِ سامانه داشت. این بار چهار پرسشِ بانک (۵ تا ۸) با جا و شاهد جواب گرفت: تمرینِ چندروزه تا تثبیت (هست)، سن و هم‌سن‌ها و تاریخِ دقیق (هست) — ولی «اگر همسرم با همین مرورگر کار کند داده‌ها قاطی می‌شود؟» صادقانه «نیست» و برگهٔ کمبود ثبت شد؛ پیش‌نیاز در برابرِ گره و توان (هست)؛ نقشهٔ مسیر (هست و خودِ دستیار بازش کرد). پیش‌بینیِ «۵ از ۷» درست درآمد و درسش را نوشت.

## Run setup
Build main eee4ff0f (`build.py --check` in sync; dist 18 Oct 21:21, after the merge). Harness harness5.js, one throw-away profile per scenario (deleted at the end). Replay of round23B/<sid>/ctl with round24B/tools/drv.py: each AI call matched to its round-23 twin by her turn text; the round-23 reply reused only where the round-24 prompt asks nothing new; new replies (as the literal average model) for new turns, rewrite requests, the r24 contracts (birth date as said, gap.step, sys_done) — see drv.log «manual akey». Clock: page Date shift (inject.js __adv). Turn ids pN = ai/pN.json; defect ids B24·Dn = round24B/defects.md. Strict prompt scan (tools/strict.py) over every prompt of all 20 dirs: clean.

## Criteria
- [PASS] wake-up problem: compare success/failure days, hypothesis, forecast 5/7 60%, week result, lesson (reuse).
- [PASS] card «۱۷ اسفند ۱۳۶۷» ⇒ 1989-03-08 = ICU; mind compares with 30–39 band (source named).
- [PASS] bank #5 (p6, practice case with real dates), #6 (p12 + gap sheet #101 for multi-user data), #7 (p8), #8 (p6–p7 route opened by the model — B23·D17 FIXED).
- [FAIL] p8 page turn question «خودت فکر می‌کنی چرا؟» on a system question (B24·D12).
- [PASS] strict scan clean (B23·D8 «شناسه را بپرس» gone).
- [PASS] routing 12/12 user turns (+ auto follow-up; p13 internal second opinion).

## نقشهٔ نیاز
Parts: assistant (FOR evidenced «هست/نیست») — met; gap sheet — met. Person: wanted depth and honesty — met.

## پیش‌نیاز
None.

## آزمودنِ اصلاح
Round-23 trials (two days ⇒ three days) replayed: stays as r23 (PASS).

## سن
Adult 37 ✓; ICU ✓. Birth confirmation shows the ISO date (B24·D6).

## Round-23 defects in this scenario
D17 FIXED · D8 FIXED

## پرسش‌های بانکِ مالک (۵–۸)
| # | question asked (his words) | answer | where | evidence |
|---|---|---|---|---|
| 5 | «اینو می‌خوام مثل یه تمرین ثبت کنی که تا واقعاً جا نیفتاده رها نشه — … با تاریخ واقعی؟» | هست | practice case T-hypothesis + Today | p6 (reuse), part_practice_1.png |
| 6 | «کارنامه‌ی ذهنم منو با کی مقایسه می‌کنه؟ … تاریخ تولدم رو دقیق داره؟ … خانمم … داده‌های ما قاطی نمیشه؟» | هست / هست / نیست — برگهٔ #۱۰۱ (نمایهٔ کاربر) | 📐 سنجشِ استاندارد; settings birth; «خودِ سامانه» localStorage | p12, p13, sheets/sh101.json, psy.txt |
| 7 | «سیستم فرق می‌ذاره بین اینکه یه پیش‌نیاز رو بلد نیستم، یا ذهنم گره خورده، یا کلاً توانش رو ندارم؟ … دقیقاً برمی‌گرده همین‌جا؟» | هست | prerequisite layer, 🧩, 🧭 detours, mind «علتِ هر گیر» | p8 |
| 8 | «یه نقشه هست که ببینم الان کجای این مسئله‌ام و چقدر مونده؟» | هست | 🧭 route (opened by the model) | p6–p7, s9 |

## Routing
### oB1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. می‌خوام روش پولیا رو روی زندگی خودم امتحان کنم، با یه …» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «هفته‌ای پنج روز از هفت روز صبح زود بیدار شم و یه ساعت مطالعه…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «دو روز موفق، شب قبلش ساعت ۱۱ خوابیده بودم و گوشی رو گذاشته ب…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «نه، اون دو روز راحت بیدار شدم! پس شاید اراده نیست، خواب و گو…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «آزمونش: از امشب یک هفته گوشی ساعت ۱۰:۳۰ میره آشپزخونه و ۱۱ م…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «اگه کمتر شد یعنی خواب و گوشی تنها علت نیست و باید دنبال یه چ…» | lla_coach | lla_coach | ✓ |
| p7 | automatic follow-up | «[سامانه: «🧭 نقشهٔ مسیرِ مسئله» باز شد. حالا از روی همین گفت‌…» | lla_assistant | lla_assistant | ✓ |
| p8 | coaching (problem talk) | «یه سؤالِ دیگه قبل از ادامه: فرض کن وسطِ همین کار گیر کنم چون…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «دیدمش، اون پرش اصلاح هم توشه. حالا اگه یه چیزی که لازم دارم …» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «سلام، یه هفته گذشت. ساعت بیداری این هفت روز: ۶:۰۵، ۶:۱۰، ۷:۳…» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «مهمونی آخرش یعنی دیر خوابیدن، پس همون خوابه، علت تازه نیست. …» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «یه چیز دیگه هم برام مهمه: کارنامه‌ی ذهنم منو با کی مقایسه می…» | lla_coach | lla_coach | ✓ |
| p13 | coaching (problem talk) | «نه
## خودِ سامانه (کاربرد، جا، آفلاین، مدل — پرسشِ «کجا نگهش…» | learning_architecture | lla_coach | ✗ |
| p14 | coaching (problem talk) | «درسم: وقتی فکر می‌کنم مشکل «اراده»ست، اول روزای موفق و ناموف…» | lla_coach | lla_coach | ✓ |

## ارتقای لازم
- User profiles in one browser (sheet #101 in this run).

## ایده‌ها
- «هر چیزی که این‌جا گفتم کجا رفت؟» — one page listing every record made from his own words (part: dossier; person: trust).
- «اگر ساعت خوابم را با ساعت‌مچی بدهم؟» — import of a sleep log (part: lists/plot).

RESULT: FAIL — 1 S3 (D12) + D6.
