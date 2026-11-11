# bp3 — کیان و نردبان (سه پیش‌نیاز، یکی تودرتو) — ROUND 26 (runner B)

## خلاصه برای مالک
کیان برای «نردبانِ ۵ متری» سه چیز را بلد نبود: فیثاغورس، جذر (که وسطِ یاد گرفتنِ فیثاغورس پیدا شد) و مساحتِ مثلث. سامانه هر کدام را به نامِ دقیق و در همان گامی که لازم بود تشخیص داد، با یک پرسشِ کوتاه سنجید، فقط به اندازهٔ همان گام یاد داد و هر بار درست به همان‌جا برگشت؛ او به ۴ متر و ۶ مترمربع رسید و با کاغذِ شطرنجی وارسی کرد. حساب‌های درستش همه «می‌خواند» خوانده شد. فردا تمرینِ برگهٔ سفید را گزارش داد. تنها ایراد: نامِ گفت‌وگوی روزِ دوم با «سلام!» شروع می‌شود.

## Run setup (common, runner B round 26)
Page main 1f93c333 (round-25 fixes; `build.py --check` in sync). Harness round26B/tools/harness26bm.js (harness5 + page URL from env for the territory scratch pages; own browser profile per scenario dir, PIDs in round26B/pids.txt). Driver tools/drv26bm.py replays round25B/<sid>/ctl; replies: round-25 replies rebuilt from docs/tours/dataset (s11–s20, bp1–bp3) are reused when HER turn text matches; every other reply (all of aB*, tB*, oB1, pwB*, and every new round-26 turn) was written this round as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Strict prompt scan (tools/strict.py): see below. Defect ids: round26B/defects.md (B26·Dn), round25B/defects.md (B25·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p2–p4 «۵ منهای ۳ چرا نمیشه؟» not answered for him; Pythagoras named with its step, diagnostic first, taught from zero only as far as the step.
- [PASS] p5–p8 nested gap (square root) detected inside the first detour from «وتر ۲۲۵ متره؟», diagnostic «مربعِ ۱۶ خانه‌ای ضلعش چند است؟», his wrong «۸» not blamed, mastery with 36 then 225; page lines «🧩 … آموخته شد (پیشرفت، نه ضعف) — برگشت به پیش‌نیازِ «قضیهٔ فیثاغورس…»» then «… برگشت به مسئلهٔ اصلی» (s11, s12).
- [PASS] p9–p10 third gap (triangle area) at its own step; rectangle-and-diagonal discovery is his; return to the step; result 4 m and 6 m², checked on squared paper.
- [PASS] page arithmetic p5, p7, p8, p9, p10: nine of his computations read «می‌خواند», none flagged (table); the line «درست» beside ✗ of round 25 is gone.
- [PASS] closure, best question, taste; «شاید خنگم» ⇒ «🧩 این کم‌هوشی نیست: گیر از نبودنِ … بود»; mind card causes = prerequisite, learned = progress; 🧭 final map with three detours and rejoin points (s25).
- [PASS] practice case T41 from chat on his request; p14 (+1 d) session «دوتا از سه تا» booked, next due day 3.
- [FAIL] s28 breadcrumb «↩ برگرد به «سلام! امروز برگه‌ی سفید رو از حافظه نوشتم: فیثاغورس و مساحت…»» — the day-2 session is named by his raw message with the greeting (the reply carried no title; the page's fallback does not strip it) (B26·D9, S3).
- [PASS] routing 14/14.

## نقشهٔ نیاز
Parts: prerequisite layer with a stack (FOR several and nested gaps, exact return) — met; page arithmetic — met; 🧭 — met; practice case — met; session naming (FOR a human title, never a greeting) — fallback fails (D9). Person (13, missed the lesson): needed each missing tool named without shame and to finish the book problem himself — met, verified.

## پیش‌نیاز
Three prerequisites, one nested (square root inside Pythagoras): all detected from his own words, ordered by what blocked the step first, each with a diagnostic, taught to the step, mastery re-checked, exact return each time; causes booked «پیش‌نیاز», learning as progress; «خنگم» answered with the named gap. Same PASS as round 25.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| p5 «۹×۹ = ۸۱، ۱۲×۱۲ = ۱۴۴، جمعشون ۲۲۵» | 81, 144, 225 | ✓ ✓ (the sum in words unread) | correct |
| p7 «۶ × ۶ میشه ۳۶» | 36 | ✓ | correct |
| p8 «۱۵ × ۱۵ = ۲۲۵» | 225 | ✓ | correct |
| p9 «۵ × ۵ = ۲۵، ۳ × ۳ = ۹ … ۲۵ منهای ۹ = ۱۶ … ۳ × ۴ = ۱۲» | 25, 9, 16, 12 | ✓ ×4 + «این سنجش فقط حساب … است، نه درستیِ خودِ گام» | correct (3×4 is right arithmetic for the wrong idea; the coach handles the idea) |
| p10 «۱۲ تقسیم بر ۲ میشه ۶» | 6 | ✓ «۱۲ / ۲ = ۶» | correct |
| p6 «۱۶ تقسیم بر ۲ میشه ۸» | 8 (arithmetic right, not a square root) | unread | harmless |

## سن
13 (early teen): «تو», plain words, no childishness.

## Round-25 defects in this scenario (FIXED | STILL | CHANGED)
- B25·D14 (bp3 p9 «حسابِ عددی‌اش را صفحه سنجید: درست …» beside ✗): FIXED — no such line; the arithmetic block only says «می‌خواند» with its scope.
- B25·D13 (prior block mid-solve p5–p11): FIXED.

## Routing (14/14 correct)
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

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- (none beyond the defect fixes)

## ایده‌ها
- (none new)

## Defects (catalogue round26B/defects.md)
- B26·D9 (S3, b) s28: session title fallback keeps the greeting «سلام!».

RESULT: FAIL — 1 S3
