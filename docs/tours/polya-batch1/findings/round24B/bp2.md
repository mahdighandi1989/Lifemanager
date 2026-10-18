# bp2 — آب‌انبارِ باغ (دو پیش‌نیاز: میلی‌متر و لیتر) — ROUND 24 (runner B)

## خلاصه برای مالک
مردی ۴۸ ساله تبدیلِ واحد یادش نبود؛ صفحه دو پیش‌نیاز را یکی‌یکی یاد داد و او حساب را تمام کرد. این بار بازنویسیِ اجباری نبود و هر دو پیش‌نیازِ آموخته در کارنامه آمد؛ ولی یک گیر سه بار تکراری در کارنامه نوشته شده.

## Run setup
Build main eee4ff0f (`build.py --check` in sync; dist 18 Oct 21:21, after the merge). Harness harness5.js, one throw-away profile per scenario (deleted at the end). Replay of round23B/<sid>/ctl with round24B/tools/drv.py: each AI call matched to its round-23 twin by her turn text; the round-23 reply reused only where the round-24 prompt asks nothing new; new replies (as the literal average model) for new turns, rewrite requests, the r24 contracts (birth date as said, gap.step, sys_done) — see drv.log «manual akey». Clock: page Date shift (inject.js __adv). Turn ids pN = ai/pN.json; defect ids B24·Dn = round24B/defects.md. Strict prompt scan (tools/strict.py) over every prompt of all 20 dirs: clean.

## Criteria
- [PASS] two prerequisites in order, diagnostics, mastery, exact return, solve (reuse; no forced restatement — B23·D10 FIXED).
- [PASS] both learned prerequisites listed (B23·D22 part FIXED).
- [FAIL] same stuck line ×3 (B24·D20).
- [FAIL] page question two-in-one p10/p12 (B24·D12).
- [PASS] routing 12/12.

## نقشهٔ نیاز
Parts: mind causes — duplicated. Person: met.

## پیش‌نیاز
Two prerequisites (mm→m, m³→L) booked as prerequisite, learned = progress.

## آزمودنِ اصلاح
Composite statement and ✏️ multi-number trials replayed (reuse); not re-inspected beyond the chat lines.

## سن
Card ⇒ 48 adult. Birth confirmation shows the ISO date (B24·D6).

## Round-23 defects in this scenario
D22 CHANGED · D10 FIXED

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
- Deduplicate stuck events by (concept, step, message).

## ایده‌ها
- A units table that remembers which conversions she already learned.

RESULT: FAIL — 2 S3 (D12, D20) + D6.
