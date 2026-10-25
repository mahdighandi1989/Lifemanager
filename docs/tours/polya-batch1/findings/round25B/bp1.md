# bp1 — نسیم و n²−1 بر ۸ (پیش‌نیاز: تفاضلِ مربع‌ها) — ROUND 25 (runner B)

## خلاصه برای مالک
نسیم تجزیهٔ تفاضلِ دو مربع را همان‌جا یاد گرفت و برهان را تمام کرد؛ گام‌هایش حکمِ «✓ درست» گرفت. ولی وقتی نوشت «x²−9 = (x−3)(x+3). درسته؟ با ضرب هم چک کردم» صفحه هنوز از او خواست «ثابتش کن یا با مثالِ نقض ردش کن» — آن ضرب خودش همان وارسی بود.

## Run setup (common, runner B round 25)
Page main 64dc0667 (`build.py --check` in sync; dist 2026-10-25 12:20 after the 12:19 merge). Harness harness5.js (+ round25B/tools/harness5s.js = same harness with the page URL from env, only for the territory scratch pages). Driver round25B/tools/drv25b.py replays round24B/<sid>/ctl and reuses each round-24 reply matched by HER turn text (not by number); new replies were written as the literal average model only where the round-25 prompt asked for something new: `coach_state.prior` whenever the new «# کارِ پیشینِ تو … پیامش کارِ پیشینِ خودش را دارد» block appeared and the message really held her own steps (s11 p1–p2, s12 p8, s13 p7, s14 p3/p6/p7, s15 p2, s18 p5/p8, s20 p3, aB1 p5, aB2 p3–p6/p10–p11, bp1 p6–p8, bp2 p4/p6, bp3 p5/p7–p11), rewrite requests (s12 p10, aB4 p9/p11), changed follow-ups (oB1 p7), the territory arms and every turn of the new scenarios (pwB1, pwB2, oB1 p15–p23, tB1 p9, tB1y p9) — see drv.log «manual akey» / «+patch». Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept). Shots: out/s<N>.png per ctl, view_pre/post_*, post-run part_*.png + post.txt (tools/post21.js). Strict prompt scan: clean in all 26 runs. Throw-away browser profiles (deleted at the end). Defect ids: round25B/defects.md (B25·Dn) and round24B/defects.md (B24·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] prerequisite detour, mastery check, exact return, ability line after closure (reuse).
- [PASS] p3 no quote rewrite (B24·D10 FIXED).
- [PASS] p6–p8 prior (new block, mid-solve) all ✓.
- [FAIL] p11 «… درسته؟ با ضرب هم چک کردم» ⇒ «**همین پیام چنین ادعایی است.** … «ثابتش می‌کنی یا با مثالِ نقض ردش می‌کنی؟»» (B24·D15 CHANGED, S3).
- [PASS] routing 12/12.

## نقشهٔ نیاز
Parts: assistant (FOR one honest question per turn, never the answer) — met in content; 🔭/route/📜 (FOR one story from chat to forms) — see criteria. Person: wanted to reach the result herself — met.

## پیش‌نیاز
Missing prerequisite (difference of squares) detected, taught, mastery checked, exact return (reuse); mind card: prerequisite cause.

## آزمودنِ اصلاح
No correction trial in this scenario (round-24 trials, where present, replayed with the same result).

## سن
Adult; birth confirmation now one line, Jalali only (B24·D6 fixed).

## Round-24 defects in this scenario
- D10: FIXED (p3)
- D15: CHANGED (p11)

## Routing
### bp1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. معلممون یه تمرین داده: «ثابت کنید برای هر عدد فرد n، ع…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «نه، ندیدم. فقط می‌دونم n فرده. با n²−1 نمی‌دونم چیکار کنم، ف…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «شکل دیگه؟ یعنی چی؟ ما تو کلاس فقط ضرب کردن پرانتزها رو خوندی…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «(x−1)(x+1) = x² + x − x − 1 = x² − 1. خب این ضربه، ولی من می…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «x² − 49 = (x − 7)(x + 7). با ضرب هم چک کردم: x² + 7x − 7x − …» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «پس n²−1 = (n−1)(n+1). حالا n فرده، پس n−1 و n+1 هر دو زوجن. …» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «آهان! ۴، ۴، ۸ — همیشه یکی‌شون بر ۴ بخش‌پذیره! چون زوج‌ها یکی…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «چون زوج‌ها دوتا دوتا جلو میرن: ۲، ۴، ۶، ۸، ... و مضرب‌های ۴ …» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «همون که گفتی (x−1)(x+1) رو ضرب کنم؛ از اونجا دیدم برعکسش هم …» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «اینکه خودم الگو رو پیدا کردم خیلی حال داد. ولی اولش که هیچی …» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «سلام! امروز تو تمرین‌های کتاب x²−9 بود، همون روش دیروز رو زد…» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «x=۵: ۲۵−۹=۱۶، و (۵−۳)(۵+۳) = ۲×۸ = ۱۶. یکیه!…» | lla_coach | lla_coach | ✓ |


## ارتقای لازم
- (none beyond the defect fixes)

## ایده‌ها
- (none new)

## Defects (catalogue round25B/defects.md)
- B24·D15 (S3)
- B25·D13 (S3)

RESULT: FAIL — 2 S3
