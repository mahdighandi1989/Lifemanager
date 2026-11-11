# bp1 — مهسا و n²−1 (پیش‌نیاز: تجزیهٔ تفاضلِ دو مربع) — ROUND 26 (runner B)

## خلاصه برای مالک
مهسا برای اثباتِ «n²−1 بر ۸ بخش‌پذیر است» گیر کرد چون «مربع منهای مربع» را بلد نبود. سامانه همین یک ابزار را نام برد (نه «جبر بلد نیستی»)، با یک پرسشِ کوتاه سنجید، همان‌قدر که لازم بود یاد داد، دوباره آزمود و درست به همان گامِ مسئله برگشت؛ او برهان را خودش تمام کرد و فردا روش را جای تازه به کار برد. کارنامه علتِ گیر را «پیش‌نیاز» ثبت کرد، نه ضعف. یک ایرادِ مانده: فردا که نوشت «با ضربِ پرانتز هم چک کردم»، صفحه باز از دستیار خواست بپرسد «ثابتش می‌کنی یا ردش می‌کنی؟».

## Run setup (common, runner B round 26)
Page main 1f93c333 (round-25 fixes; `build.py --check` in sync). Harness round26B/tools/harness26bm.js (harness5 + page URL from env for the territory scratch pages; own browser profile per scenario dir, PIDs in round26B/pids.txt). Driver tools/drv26bm.py replays round25B/<sid>/ctl; replies: round-25 replies rebuilt from docs/tours/dataset (s11–s20, bp1–bp3) are reused when HER turn text matches; every other reply (all of aB*, tB*, oB1, pwB*, and every new round-26 turn) was written this round as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Strict prompt scan (tools/strict.py): see below. Defect ids: round26B/defects.md (B26·Dn), round25B/defects.md (B25·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1 tested cases (3, 5, 7) are not a prior ledger; «نمونه‌ها برهان نیستند» + one question.
- [PASS] p2–p3 stuck ⇒ prerequisite named exactly with its step («نوشتنِ n²−1 به شکلِ ضرب»), not blamed on ability; diagnostic question first.
- [PASS] p4–p6 taught only as far as the step needs (expand (x−1)(x+1), read it backwards), mastery re-check with x²−49; page line «🧩 … آموخته شد (پیشرفت، نه ضعف) — برگشت به مسئلهٔ اصلی … گامِ «نوشتنِ n²−1 به شکلِ ضرب»» (s10).
- [PASS] p7–p9 back on the main line: (n−1)(n+1), two evens, «۸ از کجا میاد؟» found by herself; proof closed with her own reason; lesson, best question, taste stored.
- [PASS] p10 «فکر کردم خنگم» ⇒ the named gap, no label; mind card «علتِ هر گیر: پیش‌نیاز ۲ · گره ۰ · مهارت ۰» and «پیش‌نیازهای آموخته (پیشرفت، نه ضعف)» (post.txt).
- [PASS] p6–p8 no prior block on mid-solve steps (round 25 fired it) — B25·D13 FIXED here.
- [FAIL] p11 (+1 d) «x²−9 = (x−3)(x+3). درسته؟ با ضرب پرانتز هم چک کردم» ⇒ page turn question «**همین پیام چنین ادعایی است.** … «ثابتش می‌کنی یا با مثالِ نقض ردش می‌کنی — کدام را اول امتحان می‌کنی؟»» although her expansion is the proof (B24·D15 STILL, S3).
- [PASS] routing 12/12.

## نقشهٔ نیاز
Parts: prerequisite layer (FOR telling a missing tool apart from a knot or ability, teaching just enough, returning to the exact step) — met; 🧩 map / mind card cause — met; turn-question chooser (FOR fitting the moment) — p11 asks for a proof she has just given. Person (15, «فقط عدد می‌گذارم»): needed the one missing tool without being made to feel slow — met; proof verified by her own argument.

## پیش‌نیاز
One prerequisite (difference of squares), detected at p2–p3 from her own words («مربع منهای مربع رو نمی‌دونم چطوری میشه یه جور دیگه نوشت»), diagnostic ✓, taught to the step ✓, mastery ✓ (x²−49), exact return ✓, cause booked «پیش‌نیاز» ✓, learning booked as progress ✓, self-label «خنگم» answered with the named gap ✓. Same verdict as round 25.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| p1 «۳ و ۵ و ۷ … ۸، ۲۴، ۴۸» | 3²−1 = 8, 5²−1 = 24, 7²−1 = 48 ✓ | nothing (tested cases) | fine |
| p5 «(x−1)(x+1) = x² + x − x − 1 = x² − 1» | identity ✓ | nothing (unknown) | look-alike not flagged ✓ |
| p12 «۲۵−۹=۱۶، و (۵−۳)(۵+۳) = ۲×۸ = ۱۶» | 16 = 16 ✓ | nothing | unread, harmless |

## سن
15 (teen): «تو» throughout.

## Round-25 defects in this scenario (FIXED | STILL | CHANGED)
- B25·D13 (prior block on mid-solve steps p6–p8): FIXED.
- B24·D15 (p11 asks her to prove a check she already did): STILL.

## Routing (12/12 correct)
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

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- (none beyond the defect fixes)

## ایده‌ها
- (none new)

## Defects (catalogue round26B/defects.md)
- B24·D15 (S3) p11 STILL.

RESULT: FAIL — 1 S3
