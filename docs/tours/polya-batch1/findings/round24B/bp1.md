# bp1 — نوجوان و n²−1 بر ۸ (یک پیش‌نیاز) — ROUND 24 (runner B)

## خلاصه برای مالک
نوجوانِ ۱۵ ساله تجزیهٔ تفاضلِ دو مربع را بلد نبود؛ صفحه آن را دقیق نام برد، کوتاه یاد داد و او مسئله را ثابت کرد. این بار وقتی پس از حل گفت «فکر کردم خنگم»، قاعدهٔ صفحه هم بود. ایرادها: یک بازنویسیِ بی‌جا برای گیومه، و این‌که وقتی خودش وارسی‌اش را گزارش کرد، صفحه باز آن را «حدس» خواند.

## Run setup
Build main eee4ff0f (`build.py --check` in sync; dist 18 Oct 21:21, after the merge). Harness harness5.js, one throw-away profile per scenario (deleted at the end). Replay of round23B/<sid>/ctl with round24B/tools/drv.py: each AI call matched to its round-23 twin by her turn text; the round-23 reply reused only where the round-24 prompt asks nothing new; new replies (as the literal average model) for new turns, rewrite requests, the r24 contracts (birth date as said, gap.step, sys_done) — see drv.log «manual akey». Clock: page Date shift (inject.js __adv). Turn ids pN = ai/pN.json; defect ids B24·Dn = round24B/defects.md. Strict prompt scan (tools/strict.py) over every prompt of all 20 dirs: clean.

## Criteria
- [PASS] prerequisite named (a²−b²) at the step, diagnostic, minimal teaching, mastery, exact return, solve (reuse).
- [PASS] p11 ability line after closure (B23·D1 FIXED).
- [FAIL] p12 her own check read as a guess (B24·D15).
- [FAIL] p3 quote false positive (B24·D10; better/r3).
- [PASS] routing 13/13.

## نقشهٔ نیاز
Parts: prerequisite layer — met; guess detector — misreads. Person: met.

## پیش‌نیاز
Stuck = prerequisite (a²−b²), learned = progress, never ability; «خنگم» answered with the named gap.

## آزمودنِ اصلاح
n/a

## سن
Card ⇒ 15 teen ✓ teen block clean. Birth confirmation shows the ISO date (B24·D6).

## Round-23 defects in this scenario
D1 FIXED · D11 STILL · D10 FIXED

## Routing
### bp1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. معلممون یه تمرین داده: «ثابت کنید برای هر عدد فرد n، ع…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «نه، ندیدم. فقط می‌دونم n فرده. با n²−1 نمی‌دونم چیکار کنم، ف…» | lla_coach | lla_coach | ✓ |
| p3 | rewrite (post-check) | «نه، ندیدم. فقط می‌دونم n فرده. با n²−1 نمی‌دونم چیکار کنم، ف…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «شکل دیگه؟ یعنی چی؟ ما تو کلاس فقط ضرب کردن پرانتزها رو خوندی…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «(x−1)(x+1) = x² + x − x − 1 = x² − 1. خب این ضربه، ولی من می…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «x² − 49 = (x − 7)(x + 7). با ضرب هم چک کردم: x² + 7x − 7x − …» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «پس n²−1 = (n−1)(n+1). حالا n فرده، پس n−1 و n+1 هر دو زوجن. …» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «آهان! ۴، ۴، ۸ — همیشه یکی‌شون بر ۴ بخش‌پذیره! چون زوج‌ها یکی…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «چون زوج‌ها دوتا دوتا جلو میرن: ۲، ۴، ۶، ۸، ... و مضرب‌های ۴ …» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «همون که گفتی (x−1)(x+1) رو ضرب کنم؛ از اونجا دیدم برعکسش هم …» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «اینکه خودم الگو رو پیدا کردم خیلی حال داد. ولی اولش که هیچی …» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «سلام! امروز تو تمرین‌های کتاب x²−9 بود، همون روش دیروز رو زد…» | lla_coach | lla_coach | ✓ |
| p13 | coaching (problem talk) | «x=۵: ۲۵−۹=۱۶، و (۵−۳)(۵+۳) = ۲×۸ = ۱۶. یکیه!…» | lla_coach | lla_coach | ✓ |

## ارتقای لازم
- none new

## ایده‌ها
- After a learned prerequisite, offer one spaced recall the next week.

RESULT: FAIL — 2 S3 (D10, D15) + D6.
