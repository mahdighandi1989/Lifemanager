# bp2 — آقا رضا و آبِ بارانِ پشت‌بام (دو تبدیلِ واحد) — ROUND 26 (runner B)

## خلاصه برای مالک
آقا رضا (۵۸ ساله) می‌خواست بداند از بامِ ۵۰ مترمربعی چقدر آب جمع می‌شود. «یه متر صد میلی‌متره» نوشت و به ۷۵ مترمکعب رسید؛ صفحه این بار لغزشِ واحد را گرفت و حسابِ درستش را درست خواند. با دو پیش‌نیاز (متر⇄میلی‌متر، مترمکعب⇄لیتر) به ۷۵۰۰ لیتر رسید، بعد مساحت و بارش را اصلاح کرد و نتیجهٔ قبلی درست «کنار رفت». ایرادِ اصلی: گفت «هفتهٔ بعد، جمعه» می‌خرم و صفحه بی‌پرسش آن را برای جمعهٔ همین هفته ثبت کرد.

## Run setup (common, runner B round 26)
Page main 1f93c333 (round-25 fixes; `build.py --check` in sync). Harness round26B/tools/harness26bm.js (harness5 + page URL from env for the territory scratch pages; own browser profile per scenario dir, PIDs in round26B/pids.txt). Driver tools/drv26bm.py replays round25B/<sid>/ctl; replies: round-25 replies rebuilt from docs/tours/dataset (s11–s20, bp1–bp3) are reused when HER turn text matches; every other reply (all of aB*, tB*, oB1, pwB*, and every new round-26 turn) was written this round as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Strict prompt scan (tools/strict.py): see below. Defect ids: round26B/defects.md (B26·Dn), round25B/defects.md (B25·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1–p3 unknown and data in his words; «۷۵۰۰ چی؟» ⇒ units as the stuck point; «شما» register for a 58-year-old who uses it.
- [PASS] p4 page arithmetic: «✗ واحد (تبدیلِ متر به میلی متر): «هر متر» را «صد میلی متر» نوشته» for the coach, and «۵۰ × ۱.۵ = ۷۵ می‌خواند»; the correct factor is NOT shown in any view of his (post.txt has no «۱۰۰۰ میلی‌متر» before he finds it) — B25·D14 FIXED.
- [PASS] p5–p7 prerequisite 1 (m ⇄ mm) from his own «تا سینهٔ آدم!» sanity check, diagnostic, taught, mastery; prerequisite 2 (m³ ⇄ litre) by the 10×10×10 picture; both «آموخته شد (پیشرفت، نه ضعف)» with exact return.
- [PASS] p5–p7 stage «اجرا روی واقعیت», look-back only after the full answer at p8 — B25·D9 FIXED here; p8–p12 five different page questions — B25·D21 FIXED here.
- [PASS] p8 correction «۶۰ متر مربعه» ⇒ statement changed; «نتیجهٔ «۷.۵ متر مکعب میشه ۷۵۰۰ لیتر» دیگر برقرار نیست — بر «۵۰» بنا بود» (chat result chain reached); ✏️ ۱۵۰ ⇒ ۱۴۰ one application.
- [FAIL] p11 «هفته‌ی بعد، جمعه، از بازار کرمان می‌خرمش» said on Monday ۴ آبان ⇒ plan booked «موعد: ۸ آبان ۱۴۰۵» (Friday of the SAME week) from the model's `when`, with no «… درست است؟» from the page (no «# تاریخِ خودش» block, no sys line); his sentence means ۱۵ آبان (B26·D11, S2; C12, RUNNER26 §6).
- [FAIL] p9, p11 his later computations «۶۰ × ۰.۱۵ = ۹ متر مکعب، یعنی ۹۰۰۰ لیتر» and «۶۰ × ۰.۱۴ = ۸.۴ … ۸۴۰۰ لیتر» get no «# حسابِ صفحه» block once the chat is bound to the live problem (blocks only at p4, p6) (B26·D10, S3).
- [FAIL] p12 «میلی‌متر و متر رو قاطی کردم … ریاضیم ضعیفه» ⇒ page line names the OTHER gap: «گیر از نبودنِ «تبدیلِ مترمکعب به لیتر…» در گامِ «نوشتنِ ۷٫۵ مترمکعب … به لیتر»» (B26·D12, S3).
- [FAIL] post.txt final strip «اکنون: پیش‌نیازِ «تبدیلِ مترمکعب به لیتر (۱ مترمکعب = ۱۰۰۰ لیتر)» · مانده: فقط بازنگری…» although that prerequisite is learned and the mind card lists it so (B25·D28 STILL, S3).
- [PASS] routing 12/12.

## نقشهٔ نیاز
Parts: page arithmetic and unit check — met at p4/p6 (the round-25 S2 gone), absent after the live problem is bound (D10); prerequisite layer — met, but the «not low ability» line picks the latest gap instead of the one he named (D12); date reader (FOR his own stated dates, with his yes) — took a wrong model date silently (D11); strip — stale «اکنون» (D28). Person (58, «مدرسه خیلی وقت پیش بود»): needed the unit slip found by his own sanity check and no hint that age is the cause — met; verified result 8400 l and a 10 000 l tank.

## پیش‌نیاز
Two prerequisites (m ⇄ mm, m³ ⇄ litre), each detected from his words, checked, taught to the step, mastery re-checked, exact return; mind card causes «پیش‌نیاز», learning = progress. The self-label line names the second gap though he spoke of the first (D12).

## آزمودنِ اصلاح
| # | path | should change | did | must stay | vs round 25 |
|---|---|---|---|---|---|
| 1 | chat «۶۰ متر مربعه» (many turns back) | statement; result 7.5 m³/7500 l set aside | ✓ both, with the reason | rainfall | same PASS, clearer line |
| 2 | ✏️ «۱۵۰ ⇒ ۱۴۰» | bubble, statement copy | ✓ once | rest | same |

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| p3 «۵۰ × ۱۵۰ = ۷۵۰۰» | 7500 (units mixed) | nothing | unread; he doubts the unit himself |
| p4 «یه متر صد میلی‌متره … ۱.۵ متر» | 1 m = 1000 mm; 150 mm = 0.15 m | ✗ واحد: «هر متر» را «صد میلی متر» نوشته | correct ✗ (unit slip caught) |
| p4 «۵۰ × ۱.۵ = ۷۵» | 75 | ✓ می‌خواند | correct |
| p6 «۱۵۰ میلی‌متر میشه ۰.۱۵ متر» | 0.15 | ✓ | correct (unit conversion read) |
| p6 «۵۰ × ۰.۱۵ = ۷.۵» | 7.5 | ✓ | correct |
| p9 «۶۰ × ۰.۱۵ = ۹ … ۹۰۰۰ لیتر» | 9; 9000 | no block | unread (D10) |
| p11 «۶۰ × ۰.۱۴ = ۸.۴ … ۸۴۰۰ لیتر» | 8.4; 8400 | no block | unread (D10) |

## سن
58: «شما» kept from his own usage; no age remark from the system.

## Round-25 defects in this scenario (FIXED | STILL | CHANGED)
- B25·D9 (look-back after a sub-result p5/p7): FIXED.
- B25·D21 (same page question p8–p12): FIXED.
- B25·D14 (mm⇒m slip passes; «درست» beside ✗): FIXED.
- B25·D4 (ledger replaced): no ledger now (mid-session work) — moot.
- B25·D28 (strip «پیش‌نیازِ باز»): STILL in a new wording («اکنون: پیش‌نیازِ …»).

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
- When a plan sentence has a weekday, show the resolved date under his message with «درست است؟» before it reaches «امروز».

## ایده‌ها
- (none new)

## Defects (catalogue round26B/defects.md)
- B26·D11 (S2, b) p11 plan date from the model accepted without his yes; a week early.
- B26·D10 (S3, b) no page arithmetic once bound to a live problem.
- B26·D12 (S3, b) p12 self-label line names the wrong prerequisite.
- B25·D28 (S3) STILL.

RESULT: FAIL — 1 S2 + 3 S3
