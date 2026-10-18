# bp3 — نوجوان و نردبان (سه پیش‌نیاز، یکی تودرتو) — ROUND 24 (runner B)

## خلاصه برای مالک
نوجوانِ ۱۴ ساله فیثاغورس، جذر و مساحتِ مثلث را نمی‌دانست؛ صفحه هر سه را به ترتیب، با بازگشتِ دقیق به جای منتظر، یاد داد و او مسئله را حل کرد. ایرادهای دورِ پیش (عنوانِ خام، گیرِ «نامعلوم»، گزارشِ تمرین به‌عنوانِ مسئله، اشارهٔ بی‌جای اصلاح) همه رفع شده‌اند.

## Run setup
Build main eee4ff0f (`build.py --check` in sync; dist 18 Oct 21:21, after the merge). Harness harness5.js, one throw-away profile per scenario (deleted at the end). Replay of round23B/<sid>/ctl with round24B/tools/drv.py: each AI call matched to its round-23 twin by her turn text; the round-23 reply reused only where the round-24 prompt asks nothing new; new replies (as the literal average model) for new turns, rewrite requests, the r24 contracts (birth date as said, gap.step, sys_done) — see drv.log «manual akey». Clock: page Date shift (inject.js __adv). Turn ids pN = ai/pN.json; defect ids B24·Dn = round24B/defects.md. Strict prompt scan (tools/strict.py) over every prompt of all 20 dirs: clean.

## Criteria
- [PASS] three prerequisites incl. nested (جذر inside فیثاغورس), exact returns, solve (reuse).
- [PASS] B23·D10 title, D18 first stuck = prerequisite, D13 practice not a subject, D14 no correction hint — all FIXED.
- [FAIL] page question two-in-one where it appears (B24·D12) — minor.
- [PASS] routing 14/14.

## نقشهٔ نیاز
Parts: prerequisite stack, route, mind causes — met. Person: met.

## پیش‌نیاز
Three learned prerequisites listed; both stucks cause = prerequisite.

## آزمودنِ اصلاح
n/a

## سن
Card ⇒ 14 teen ✓. Birth confirmation shows the ISO date (B24·D6).

## Round-23 defects in this scenario
D10, D13, D14, D18 FIXED

## Routing
### bp3 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام! یه سؤال از کتاب: «نردبانی به طول ۵ متر به دیوار تکیه د…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «یه نردبون کج به دیوار تکیه داده، می‌خوایم بدونیم سرش تا کجای…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «نمی‌دونم... شاید چون نردبون کجه؟ اگه صاف بود ۵ میشد. ولی کج …» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «اسمشو شنیدم ولی نمی‌دونم چی میگه. یه چیزی با مربع ضلع‌ها بود…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «۹×۹ = ۸۱، ۱۲×۱۲ = ۱۴۴، جمعشون ۲۲۵. پس وتر ۲۲۵ متره؟ یه کم زی…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «۸؟ چون ۱۶ تقسیم بر ۲ میشه ۸.…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «۶! چون ۶ × ۶ میشه ۳۶. پس جذر ۳۶ میشه ۶.…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «۲۲۵ بود، جذرش... ۱۵ × ۱۵ = ۲۲۵. پس وتر ۱۵!…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «۵ × ۵ = ۲۵، ۳ × ۳ = ۹. دیوار یکی از اون دو ضلعه، پس ۲۵ منهای…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «کشیدم. قطر مستطیل رو دقیقاً نصف می‌کنه! پس مثلث نصف مستطیله:…» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «روی کاغذ شطرنجی یه مثلث ۳ و ۴ کشیدم و ضلع کجش رو با خط‌کش ان…» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «همون پرسش تشخیصی که گفتی مربعِ ۱۶ خونه‌ای ضلعش چنده؛ اونجا ف…» | lla_coach | lla_coach | ✓ |
| p13 | coaching (problem talk) | «شمردن خونه‌ها و ساختن مساحت از مستطیل رو دوست داشتم. اینکه ا…» | lla_coach | lla_coach | ✓ |
| p14 | coaching (problem talk) | «سلام! امروز برگه‌ی سفید رو از حافظه نوشتم: فیثاغورس و مساحت …» | lla_coach | lla_coach | ✓ |

## ارتقای لازم
- none new

## ایده‌ها
- A short nested-prerequisite recap for the next week.

RESULT: FAIL — D6 (+D12 minor).
