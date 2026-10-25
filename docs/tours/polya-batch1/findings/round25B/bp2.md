# bp2 — آقای کریمی و مخزنِ باران (پیش‌نیاز: میلی‌متر و لیتر) — ROUND 25 (runner B)

## خلاصه برای مالک
آقای کریمی دو دانستهٔ مدرسه‌ای (۱ متر = ۱۰۰۰ میلی‌متر، ۱ مترمکعب = ۱۰۰۰ لیتر) را همان‌جا یاد گرفت و مخزنِ ۱۰ هزار لیتری را برگزید؛ «علتِ هر گیر» این بار یک سطر با «در ۳ نوبت» است. ولی صفحه پس از نتیجهٔ میانیِ «۷۵ مترمکعب» او را به بازنگری برد، یک پرسشِ صفحه پنج نوبت تکرار شد، و لغزشِ واحدِ «یه متر صد میلی‌متره» را خودِ صفحه نسنجید.

## Run setup (common, runner B round 25)
Page main 64dc0667 (`build.py --check` in sync; dist 2026-10-25 12:20 after the 12:19 merge). Harness harness5.js (+ round25B/tools/harness5s.js = same harness with the page URL from env, only for the territory scratch pages). Driver round25B/tools/drv25b.py replays round24B/<sid>/ctl and reuses each round-24 reply matched by HER turn text (not by number); new replies were written as the literal average model only where the round-25 prompt asked for something new: `coach_state.prior` whenever the new «# کارِ پیشینِ تو … پیامش کارِ پیشینِ خودش را دارد» block appeared and the message really held her own steps (s11 p1–p2, s12 p8, s13 p7, s14 p3/p6/p7, s15 p2, s18 p5/p8, s20 p3, aB1 p5, aB2 p3–p6/p10–p11, bp1 p6–p8, bp2 p4/p6, bp3 p5/p7–p11), rewrite requests (s12 p10, aB4 p9/p11), changed follow-ups (oB1 p7), the territory arms and every turn of the new scenarios (pwB1, pwB2, oB1 p15–p23, tB1 p9, tB1y p9) — see drv.log «manual akey» / «+patch». Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept). Shots: out/s<N>.png per ctl, view_pre/post_*, post-run part_*.png + post.txt (tools/post21.js). Strict prompt scan: clean in all 26 runs. Throw-away browser profiles (deleted at the end). Defect ids: round25B/defects.md (B25·Dn) and round24B/defects.md (B24·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] B24·D20 FIXED: «… · در ۳ نوبت» one line.
- [FAIL] p5, p7 «مرحلهٔ محتمل: بازنگری» after intermediate m³ (R2 sub-result, B25·D9, S2).
- [FAIL] p8–p12 same page question «تقریبت بس بود…» five turns incl. ✏️ p10 and self-label p12 (B25·D21, S3).
- [FAIL] p4 prior: page unit check silent on «یه متر صد میلی‌متره … ۱.۵ متر»; step 2 «حسابِ عددی‌اش … درست — پس نادرستیِ این گام (اگر هست) از جای دیگری است» (B25·D14, S3); p7 ledger replaced by p6 batch (B25·D4).
- [FAIL] final strip «۱ پیش‌نیازِ باز تا برگشت به خط» while mind lists it learned (B25·D28, S3).
- [PASS] corrections c-area 50⇒60 and ✏️ 150⇒140 (reuse); routing 12/12.

## نقشهٔ نیاز
Parts: assistant (FOR one honest question per turn, never the answer) — met in content; 🔭/route/📜 (FOR one story from chat to forms) — see criteria. Person: wanted to reach the result herself — met.

## پیش‌نیاز
Two prerequisites (mm⇄m, m³⇄L) detected and learned; «علتِ هر گیر» one grouped line (D20 fixed); final strip still lists one open (D28).

## آزمودنِ اصلاح
Roof 50⇒60 (chat) and ✏️ 150⇒140/دو⇒سه/۲۲۰⇒۲۰۰ (reuse): applied; same page question then repeated (D21).

## سن
Adult; birth confirmation now one line, Jalali only (B24·D6 fixed).

## Round-24 defects in this scenario
- D20: FIXED
- D12 (bp2 p10/p12): CHANGED (now one repeated unfit question)

## Routing
### bp2 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. پشت‌بوم انبارم ۵۰ متر مربعه. می‌خوام آب بارون رو جمع ک…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «بارش سالانه‌ی اینجا حدود ۱۵۰ میلی‌متره. می‌خوام بدونم در سال…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «خب حجم میشه سطح ضرب در ارتفاع بارون دیگه: ۵۰ × ۱۵۰ = ۷۵۰۰. و…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «یعنی ۱۵۰ میلی‌متر رو متر کنم؟ یه متر صد میلی‌متره دیگه، پس م…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «نه بابا، ۱.۵ متر یعنی تا سینه‌ی آدم! اینجا خشکه. پس اشتباه ک…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «آهان، صد ضرب در ده، میشه هزار میلی‌متر. پس ۱۵۰ میلی‌متر میشه…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «ده تا در طول، ده تا در عرض، ده تا در ارتفاع... هزارتا! پس هر…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «یه اصلاح: اولِ کار که گفتم پشت‌بوم ۵۰ متر مربعه اشتباه بود؛ …» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «با ۶۰: ۶۰ × ۰.۱۵ = ۹ متر مکعب، یعنی ۹۰۰۰ لیتر در سال.…» | lla_coach | lla_coach | ✓ |
| p10 | ✏️ edit turn | «[اصلاحِ پیامِ قبلی] «۱۵۰» ⇐ «۱۴۰»، «دو» ⇐ «سه»، «۲۲۰» ⇐ «۲۰۰…» | lla_assistant | lla_assistant | ✓ |
| p11 | coaching (problem talk) | «با ۱۴۰ میلی‌متر: ۶۰ × ۰.۱۴ = ۸.۴ متر مکعب، یعنی ۸۴۰۰ لیتر. ت…» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «هشتاد درصد مطمئنم. راستش اولش که میلی‌متر و متر رو قاطی کردم…» | lla_coach | lla_coach | ✓ |


## ارتقای لازم
- (none beyond the defect fixes)

## ایده‌ها
- (none new)

## Defects (catalogue round25B/defects.md)
- B25·D9 (S2)
- B25·D4 (S2)
- B25·D21, D14, D28 (S3)

RESULT: FAIL — 2 S2 + 3 S3
