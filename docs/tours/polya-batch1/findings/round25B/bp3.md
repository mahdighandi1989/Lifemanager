# bp3 — کیان و نردبان (چند پیش‌نیازِ تودرتو) — ROUND 25 (runner B)

## خلاصه برای مالک
کیان فیثاغورس، جذر و مساحتِ مثلث را یکی‌یکی و فقط به اندازهٔ همین مسئله یاد گرفت و هر بار دقیقاً به همان گامِ منتظر برگشت؛ نقشهٔ مسیر انحراف‌های تودرتو و برگشت‌ها را درست کشید. کارِ پیشینش («پس وتر ۲۲۵ متره؟» نادرست، «۳ × ۴ = ۱۲ متر مربع؟» نادرست) حکمِ درست گرفت. تنها اشکال: کنارِ «۳×۴=۱۲» نوشته شد «حسابِ عددی‌اش درست — پس نادرستیِ این گام (اگر هست) از جای دیگری است» که برای نوجوان گیج‌کننده است.

## Run setup (common, runner B round 25)
Page main 64dc0667 (`build.py --check` in sync; dist 2026-10-25 12:20 after the 12:19 merge). Harness harness5.js (+ round25B/tools/harness5s.js = same harness with the page URL from env, only for the territory scratch pages). Driver round25B/tools/drv25b.py replays round24B/<sid>/ctl and reuses each round-24 reply matched by HER turn text (not by number); new replies were written as the literal average model only where the round-25 prompt asked for something new: `coach_state.prior` whenever the new «# کارِ پیشینِ تو … پیامش کارِ پیشینِ خودش را دارد» block appeared and the message really held her own steps (s11 p1–p2, s12 p8, s13 p7, s14 p3/p6/p7, s15 p2, s18 p5/p8, s20 p3, aB1 p5, aB2 p3–p6/p10–p11, bp1 p6–p8, bp2 p4/p6, bp3 p5/p7–p11), rewrite requests (s12 p10, aB4 p9/p11), changed follow-ups (oB1 p7), the territory arms and every turn of the new scenarios (pwB1, pwB2, oB1 p15–p23, tB1 p9, tB1y p9) — see drv.log «manual akey» / «+patch». Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept). Shots: out/s<N>.png per ctl, view_pre/post_*, post-run part_*.png + post.txt (tools/post21.js). Strict prompt scan: clean in all 26 runs. Throw-away browser profiles (deleted at the end). Defect ids: round25B/defects.md (B25·Dn) and round24B/defects.md (B24·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] nested prerequisites, diagnostic questions, mastery, exact return (🧭 INSIDE-NESTED / AFTER-RETURN / FINAL).
- [PASS] p5/p9 prior verdicts correct.
- [FAIL] p9 prior line «(حسابِ عددی‌اش را صفحه سنجید: درست — پس نادرستیِ این گام (اگر هست) از جای دیگری است)» beside ✗ (B25·D14, S3).
- [PASS] routing 14/14.

## نقشهٔ نیاز
Parts: assistant (FOR one honest question per turn, never the answer) — met in content; 🔭/route/📜 (FOR one story from chat to forms) — see criteria. Person: wanted to reach the result herself — met.

## پیش‌نیاز
Nested prerequisites (Pythagoras ⇒ square root; triangle area) each taught to mastery with exact returns; 🧭 detours drawn at INSIDE-NESTED, AFTER-RETURN, FINAL.

## آزمودنِ اصلاح
No correction trial in this scenario (round-24 trials, where present, replayed with the same result).

## سن
Adult; birth confirmation now one line, Jalali only (B24·D6 fixed).

## Round-24 defects in this scenario
- D10 (bp3 title): FIXED in r24, still fine
- D18 (bp3 first stuck): fine

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
- (none beyond the defect fixes)

## ایده‌ها
- (none new)

## Defects (catalogue round25B/defects.md)
- B25·D14 (S3)

RESULT: FAIL — 1 S3
