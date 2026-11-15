# bp2 — کشاورزِ ۴۸ ساله و آبِ بارانِ پشت‌بام (پیش‌نیازِ تبدیلِ واحد) — ROUND 27 (runner B)

## خلاصه برای مالک
کشاورزی ۴۸ ساله آبِ بارانِ پشت‌بامش را حساب کرد؛ دو کمبود داشت (میلی‌متر به متر، مترمکعب به لیتر) که هر دو دقیق نام برده، آموزش داده و وارسی شد. صفحه این دور حسابِ او را بعد از ثبتِ مسئله هم سنجید و «هفته‌ی بعد، جمعه» را درست ۱۵ آبان خواند و پرسید. ولی نوارِ مسیر بعد از اصلاحِ ۵۰ ⇐ ۶۰ هنوز می‌گوید نتیجه با عددِ پیشین است، با این‌که خودش با ۶۰ (و بعد با ۱۴۰ میلی‌متر) دوباره حساب کرد؛ «هشتاد درصد مطمئنم» هم هیچ پیش‌بینی‌ای نساخت؛ و جملهٔ «کم‌هوشی نیست» باز کمبودِ دیگری را نام برد.

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p3 «۵۰ × ۱۵۰ = ۷۵۰۰» ✓ arithmetic; unit question left to him.
- [PASS] p4 «یه متر صد میلی‌متره … ۵۰ × ۱.۵ = ۷۵» ⇒ «✗ واحد (تبدیلِ متر به میلی متر): «هر متر» را «صد میلی متر» نوشته» — a real unit slip, named exactly.
- [PASS] p5–p7 two prerequisites (m⇄mm, m³⇄L) diagnosed, taught, mastery, exact return (s7, s9 «🧩 … آموخته شد (پیشرفت، نه ضعف)»); problem registered (s9).
- [PASS] p9 arithmetic block present on the live-bound chat: «۶۰ × ۰.۱۵ = ۹» ✓, «۹ متر مکعب = ۹۰۰۰» ✓ (round 26 B26·D10: no block once bound).
- [PASS] p8/s19 correction 50 ⇒ 60: statement changed with history and «نتیجهٔ «۷.۵ متر مکعب … ۷۵۰۰ لیتر» دیگر برقرار نیست — بر «۵۰» بنا بود».
- [PASS] p10 ✏️ three numbers (۱۵۰⇒۱۴۰، دو⇒سه، ۲۲۰⇒۲۰۰) applied, one result line to him.
- [PASS] p11/s28 «هفته‌ی بعد، جمعه، از بازار کرمان می‌خرمش» (said Monday ۴ آبان) ⇒ «📅 … جمعه ۱۵ آبان ۱۴۰۵ — در «امروز» بیاید؛ درست است؟» (round 26 booked ۸ آبان with no ask); his next message answers something else ⇒ «بی‌جواب ماند و چیزی ثبت نشد» (nothing booked silently — C12).
- [FAIL] post strip «مانده: نتیجه با عددِ پیشین به دست آمده بود («۵۰ متر مربعه» ⇐ «۶۰ متر مربعه») …» although he recomputed with 60 at p9 (✓ read) and again with 140 at p11 (✓). The stale mark is not cleared by his own redo. New B27·D6 (S3).
- [FAIL] p12 «هشتاد درصد مطمئنم» (that the 10 000-litre tank suffices) makes no 🎯 (Q8: confidence in words makes a forecast). U49 family (S3).
- [FAIL] p12/s29 «🧩 این کم‌هوشی نیست: گیر از نبودنِ «تبدیلِ مترمکعب به لیتر» …» — he spoke of mixing millimetres and metres («اولش که میلی‌متر و متر رو قاطی کردم»). B26·D12 STILL (S3).
- [PASS] strip no longer «اکنون: پیش‌نیاز …» (B25·D28).
- [FAIL] post 📜 history lines «اصلاح شد ⇐ «…» → «…»» mix two arrow forms (found by the cross-scenario scan for compensation b). B24·D16 STILL (S3).

## نقشهٔ نیاز
Parts: prerequisite layer — met; arithmetic reader on a live problem — met; correction engine (FOR marking stale AND clearing it once redone) — half met; forecast ledger (FOR his stated confidence) — unmet; self-label line — wrong gap. Person: a farmer ashamed of «سنم رفته بالا» needed the exact gap named (mm/m) — partly met.

## پیش‌نیاز
Two prerequisites (mm⇄m, m³⇄L), each diagnosed, taught to the step, checked; exact return; solved. Met. Self-label line names the second, not the one he named (D12).

## آزمودنِ اصلاح
| turns back | path | change | did | ✓ |
|---|---|---|---|---|
| 7 (p8) | chat | 50⇒60, result 7.5 m³ stale | statement + stale line | ✓ |
| 8 (p10) | ✏️ three numbers | 150⇒140, دو⇒سه, 220⇒200 | all three, one line | ✓ |
| after his redo (p9, p11) | — | stale mark cleared | still «با عددِ پیشین» | ✗ B27·D6 |

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| «۵۰ × ۱۵۰ = ۷۵۰۰» | 7500 | ✓ | ✓ |
| «یه متر صد میلی‌متره … ۱.۵ متر» | 1 m = 1000 mm | ✗ unit | ✓ (real slip) |
| «۵۰ × ۱.۵ = ۷۵» | 75 | ✓ arithmetic | ✓ |
| «۵۰ × ۰.۱۵ = ۷.۵» | 7.5 | ✓ | ✓ |
| «۷.۵ متر مکعب = ۷۵۰۰ لیتر» | 7500 | ✓ | ✓ |
| «۶۰ × ۰.۱۵ = ۹» | 9 | ✓ | ✓ |
| «۶۰ × ۰.۱۴ = ۸.۴» | 8.4 | ✓ | ✓ |
| «هفته‌ی بعد، جمعه» (Mon 4 Aban) | 15 Aban | asked 15 Aban | ✓ |

## سن
48; «تو» (he uses تو).

## Arms (RUNNER27 T1–T12) in this scenario
- none of T1–T12 is hosted here

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
- no prior-work opening here; no prior block fired where it should not

## Chat ⇄ page
—

## Owner bank (this scenario)
—

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- B26·D10 / U26 (no arithmetic block once bound to a live problem): FIXED — p9, p11 blocks.
- B26·D11 / U20 bp2 («هفته‌ی بعد، جمعه» booked a week early from the model): FIXED — asked «جمعه ۱۵ آبان»; nothing booked without his yes.
- B26·D12 / U67 («کم‌هوشی نیست» names another prerequisite): STILL — p12.
- B25·D28 / U39 (strip keeps a learned prerequisite open): FIXED — strip «اکنون: بازنگری».
- B24·D16 (two arrow forms): STILL (booked here by compensation b).

## Routing (12/12 correct)
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

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- «دوباره حساب شد» link: a recomputation whose numbers use the corrected value clears the stale mark and shows both results.

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- B27·D6 (S3, b) post strip: stale mark kept after his own recomputation with the corrected value.
- U49 family (S3, b) p12: «هشتاد درصد مطمئنم» makes no 🎯.
- B26·D12 STILL (S3, b) p12.
- B24·D16 STILL (S3, c) post 📜: two arrow forms in one history line.

RESULT: FAIL — 4 S3
