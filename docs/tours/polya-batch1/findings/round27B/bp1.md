# bp1 — ۱۵ ساله و n²−1 بخش‌پذیر بر ۸ (پیش‌نیازِ تفاضلِ دو مربع) — ROUND 27 (runner B)

## خلاصه برای مالک
نوجوانِ ۱۵ ساله برای n فرد ثابت کرد n²−1 بر ۸ بخش‌پذیر است. سامانه پیش‌نیازِ کمبود (تجزیهٔ تفاضلِ دو مربع) را دقیق نام برد، با یک پرسشِ تشخیصی سنجید، فقط تا همان‌جا یاد داد و با «آموخته شد (پیشرفت، نه ضعف)» به گامِ اصلی برگرداند؛ او خودش اثبات را تمام کرد و بازنگری ثبت شد. یک ایرادِ قدیمی ماند: روزِ بعد که گفت «درسته؟ با ضرب پرانتز هم چک کردم»، صفحه آن را ادعای آزموده‌نشده خواند و گفت «ثابتش کن یا ردش کن».

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1–p3 tested cases are a sign, not a proof; the stuck point named exactly (rewriting n²−1), no ability blame.
- [PASS] p4–p5 prerequisite «تجزیهٔ تفاضلِ دو مربع» diagnosed, taught only as far as the step, mastery check (x² − 49), s10 «🧩 … آموخته شد (پیشرفت، نه ضعف) — برگشت به مسئلهٔ اصلی … گامِ …».
- [PASS] p6–p8 she finds why one factor is a multiple of 4; proof complete; s15 registered + «حل شد»; s16–s17 look-back «پرسشی که کمک کرد», «سلیقه».
- [PASS] p9 «فکر کردم خنگم» answered with the named gap, not ability.
- [FAIL] p11 (+1 d) «x²−9 = (x−3)(x+3). درسته؟ با ضرب پرانتز هم چک کردم، x² + 3x − 3x − 9 میشه» ⇒ turn question «**همین پیام چنین ادعایی است.** … ثابتش می‌کنی یا با مثالِ نقض ردش می‌کنی؟» — her expansion already proves it. B24·D15 STILL (S3).
- [PASS] p12 «۲۵−۹=۱۶» ✓, «۲×۸ = ۱۶» ✓ (exact).
- [PASS] strip destination now her statement (round 26 «درسته؟»).

## نقشهٔ نیاز
Parts: prerequisite layer (FOR telling a missing tool from a knot) — met; coach turn question (FOR the right next move) — misses that her own check is a proof. Person: needed credit for the check she did — unmet on day 2.

## پیش‌نیاز
One prerequisite (difference of squares): named exactly, diagnostic, taught to the step, mastery x²−49, exact return; 🧩 learned = progress. Met.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| «x² − 49 = (x − 7)(x + 7)» | identity | silent | ✓ (symbolic, outside) |
| «۲۵−۹=۱۶» | 16 | ✓ | ✓ |
| «(۵−۳)(۵+۳) = ۲×۸ = ۱۶» | 16 | ✓ «۲×۸ = ۱۶» | ✓ |
| «۸، ۲۴، ۴۸» (cases) | 8,24,48 | silent | ✓ (no operator) |

## سن
15; «تو»; birth via card.

## Arms (RUNNER27 T1–T12) in this scenario
- none of T1–T12 is hosted here

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
- no prior-work opening here; no prior block fired where it should not

## Chat ⇄ page
—

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- B24·D15 / U40 (her own check read as an untested claim): STILL — p11.
- strip destination «درسته؟»: FIXED (now the statement).

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
- When «درسته؟» follows her own expansion/check in the same message, the turn question should name her check and ask only about generality.

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- B24·D15 STILL (S3, b) p11.

RESULT: FAIL — 1 S3
