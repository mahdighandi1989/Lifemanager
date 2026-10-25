# aB2 — پریا، ۱۶ ساله، و مجموعِ فردها (بازنگری) — ROUND 25 (runner B)

## خلاصه برای مالک
پریا با شکلِ L و استقرا ثابت کرد مجموعِ n فردِ اول n² است و همان روش را برای زوج‌ها به کار برد. کارتِ تولد «۱۷ اسفند» را نگه داشت و «88» را پذیرفت؛ «17 Esfand 1388» هم (در بازوی جدا) پذیرفته شد؛ حدسِ «۲۵۰۰» در پرونده «تأیید شد». تنها ایراد: نقشهٔ مسیر «نتیجه» و «بازنگری» را چند بار تکرار کرد و فرمِ فهم را پس از نتیجه‌ها نشاند.

## Run setup (common, runner B round 25)
Page main 64dc0667 (`build.py --check` in sync; dist 2026-10-25 12:20 after the 12:19 merge). Harness harness5.js (+ round25B/tools/harness5s.js = same harness with the page URL from env, only for the territory scratch pages). Driver round25B/tools/drv25b.py replays round24B/<sid>/ctl and reuses each round-24 reply matched by HER turn text (not by number); new replies were written as the literal average model only where the round-25 prompt asked for something new: `coach_state.prior` whenever the new «# کارِ پیشینِ تو … پیامش کارِ پیشینِ خودش را دارد» block appeared and the message really held her own steps (s11 p1–p2, s12 p8, s13 p7, s14 p3/p6/p7, s15 p2, s18 p5/p8, s20 p3, aB1 p5, aB2 p3–p6/p10–p11, bp1 p6–p8, bp2 p4/p6, bp3 p5/p7–p11), rewrite requests (s12 p10, aB4 p9/p11), changed follow-ups (oB1 p7), the territory arms and every turn of the new scenarios (pwB1, pwB2, oB1 p15–p23, tB1 p9, tB1y p9) — see drv.log «manual akey» / «+patch». Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept). Shots: out/s<N>.png per ctl, view_pre/post_*, post-run part_*.png + post.txt (tools/post21.js). Strict prompt scan: clean in all 26 runs. Throw-away browser profiles (deleted at the end). Defect ids: round25B/defects.md (B25·Dn) and round24B/defects.md (B24·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] «۳۰ اسفند ۸۸» ⇒ «اسفندِ ۱۳۸۸ ۲۹ روز دارد»; «۱۷ اسفند» + «88» ⇒ 2010-03-08 teen; aB2f «17 Esfand 1388» ⇒ 2010-03-08 (B24·D1 FIXED).
- [PASS] guess «۲۵۰۰» ⇒ «سرانجام: تأیید شد» (B24·D14 FIXED).
- [PASS] p3–p6, p10–p11 prior ✓ (mid-solve over-trigger is B25·D13, no harm here); routing 11/11 + aB2f 2/2.
- [FAIL] route FINAL repeats «نتیجه/بازنگری (از گفت‌وگو)» ×3 and «فرمِ فهم» after the results (B24·D18 STILL, S3).

## نقشهٔ نیاز
Parts: assistant (FOR one honest question per turn, never the answer) — met in content; 🔭/route/📜 (FOR one story from chat to forms) — see criteria. Person: wanted to reach the result herself — met.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No correction trial in this scenario (round-24 trials, where present, replayed with the same result).

## سن
16, teen: card day memory «۱۷ اسفند» + «88» ✓; Finglish «17 Esfand 1388» ✓ (aB2f); leap error ✓.

## Round-24 defects in this scenario
- D1: FIXED
- D14: FIXED
- D18 (aB2 route): STILL — FINAL repeats «نتیجه/بازنگری (از گفت‌وگو)» and puts «فرمِ فهم» after the results

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
- (none beyond the defect fixes)

## ایده‌ها
- (none new)

## Defects (catalogue round25B/defects.md)
- B24·D18 (S3)

RESULT: FAIL — 1 S3
