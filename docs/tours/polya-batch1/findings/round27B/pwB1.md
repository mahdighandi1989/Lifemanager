# pwB1 — مهندسِ ۳۱ ساله و پمپِ خورشیدیِ باغِ پدر (کارِ پیشینِ سه‌گزارشه) — ROUND 27 (runner B)

## خلاصه برای مالک
نگار، مهندسِ تأسیسات، حسابِ پمپِ خورشیدی را با پنج گامِ خودش آورد؛ صفحه لغزشِ کیلوژول ⇐ کیلووات‌ساعت را گرفت، اعتراضش را یک بار دوباره سنجید و «حکم ماند» نشان داد، اصلاح‌های او همان نوبت نشست؛ گزارشِ دوم (۷ گام) و این دور گزارشِ سوم (۷ گامِ دیگر) هم در دفترِ کارِ پیشین ادغام شد. اتحادِ نادرستِ «۱ = ۱/۲ + ۱/۳ + ۱/۴» این دور ✗ خورد (دورِ ۲۶ همین ✓ خورده بود — S1). اصلاحِ ارتفاع ۱۵ ⇐ ۱۸ همهٔ عددهای ساخته‌شده از ارتفاع را با مقدارِ دقیق نام برد و کابلِ ۱۵ متری و ۱۵ آمپر را دست نزد. ولی «۲ تکه‌ی ۷ متری = ۱۵ متر» (درستش ۱۴) نه ✗ خورد نه «نسنجیده»، و مقدارِ دقیقی که صفحه برای «۳۵۳ هزار ژول» به مربی گفت «۳۵۳۱۶۰ هزار» بود (هزار برابر بیشتر).

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1 prior block: steps 1 ✓, 2 ✗ (kJ ⇒ kWh), 3 and 5 dependent, 4 ✓; resume at step 2; coach-facing check text never in her view.
- [PASS] p2–p3 her dispute «گامِ ۲ درسته … چرا میگی غلطه؟» ⇒ one re-check, s-line «🧮 بازسنجیِ حسابِ صفحه (به درخواستِ خودت) … نمی‌خواند — یک بار دوباره سنجیده شد و حکم ماند» (owner bank 36: exists).
- [PASS] p4–p6 her fixes of steps 2, 3 land the same turn «به دستِ خودش … حسابِ عددیِ متنِ تازه را صفحه سنجید: درست»; step 5 repaired by meaning (instant power).
- [PASS] p8 (+2 d) «294300 ÷ 48 = 6131» ⇒ «؟ … دقیقاً ۶۱۳۱٫۲۵ … جویا شو گرد کرده» (C25); «۴۸ × ۶۱۳۱ ≈ ۲۹۴ هزار» ✓ (C15 scale read); «۶۱۳۱ ثانیه = ۱۰۲» ✓.
- [PASS] T4 p10–p12: second report (steps 6–12) merged «۱۲ گام — ۱۲ درست»; THIRD report («اینم کارِ خودمه، ببین: گامِ ۱۳ … ۱۹») merged «۱۹ گام — ۱۲ درست، ۷ نادرست · ازسرگیری از گامِ ۱۳» (round 26 U3/B26·D18: never entered).
- [PASS] p11 S1 closed: «۱ = ۱/۲ + ۱/۳ + ۱/۴» ⇒ «✗ … را «۱» نوشته — حسابِ صفحه: ۱۳/۱۲» (round 26 U1/B26·D20: ✓). Same block: «۱۸۰ / ۱۲ = ۱۶» ✗ 15, «۱۲ با ۳ = ۱۶» ✗ 15, «۱۲ − ۱۲.۶ = ۰.۶» ✗ −0.6, «۱۰۲ / ۶۰ … ۱.۵» ✗ 1.7, «۳۰۶ وات ساعت = ۳.۰۶» ✗ unit (0.306), «۱۰۲ / ۲۴۰ = ۰.۴۵» ✗ 0.425; look-alikes «۱۴۰۵/۸/۲۰», «۳–۲», «۱۷ ≡ ۲ (mod ۵)», «۲x + ۳ = ۱۱» — no arithmetic line (correct).
- [PASS] p12–p13 her fixes of steps 13–14 applied; her own 13/12 check «۶ و ۴ و ۳ = ۱۳» ✓.
- [PASS] T9 s22 height 15 ⇒ 18: «عددهای حساب‌شده از «۱۵ متره»: ۲۹۴٫۳ … ۹۸ … (۲۹۴٫۳ ⇒ ۳۵۳٫۱۶ … ۶۱۳۱ ⇒ ۷۳۵۸ … ۱۰۲ ⇒ ۱۲۳ … ۵۸۸۶ ⇒ ۷۰۶۳٫۲ …)» — all checked exact (353160/48 = 7357.5; ×18/15 chains); «۴۹۰، ۳٫۰۶» asked; ledger «گام‌های ۲، ۳، ۴، ۱۰، ۱۱، ۱۲ کهنه شدند»; the coincidental cable «۱۵ متر» and «۱۵ آمپر» NOT marked (round 26 U5/B26·D19). The verbal step 5 (instant power) is rightly not stale.
- [FAIL] T3 p14 (added) «لوله‌ی رانش ۴ تکه‌ی ۳ متری = ۱۲ متر» (correct) not read; «کابلِ برق ۲ تکه‌ی ۷ متری = ۱۵ متر» (exact 14, WRONG) not read — no ✗, no «نسنجیده». B27·D9 instance (S2: wrong work left silent).
- [FAIL] p14 «۲۰۰۰ × ۹٫۸۱ × ۱۸ = ۳۵۳ هزار ژول» ⇒ «؟ «۲۰۰۰ × ۹.۸۱ × ۱۸» دقیقاً ۳۵۳۱۶۰ هزار می‌شود و «۳۵۳ هزار» نوشته شده … مقدارِ دقیق را بگو» — the page states a value 1000× too large and tells the coach to say it (exact 353 160 = ۳۵۳٫۱۶ هزار). C15/C23. New B27·D13 (S2).
- [PASS] p14 «۳۵۳۱۶۰ ÷ ۴۸ = ۷۳۵۸» ⇒ «؟ دقیقاً ۷۳۵۷٫۵» (C25); «حدودِ ۱۲۳ دقیقه» ✓.
- [PASS] post 📜 data rows are her data only (round 26 B25·D24 «داده: آخ…» gone); mind card label «گامِ کارِ پیشین».
- [FAIL] post 📜 history lines «اصلاح شد ⇐ «…» → «…»» mix two arrow forms (found by the cross-scenario scan for compensation b). B24·D16 STILL (S3).

## نقشهٔ نیاز
Parts: prior ledger (FOR every report she calls her own, her fixes, her dispute) — met; arithmetic reader — met for ×, ÷, fractions, units, scale with «≈»; fails on «N تکه‌ی M متری = K متر» and misstates the scale on «= ۳۵۳ هزار»; correction engine — met (dependency, not equal digits). Person: an engineer about to buy a pump needed every wrong number caught — the 15-metre cable slip passed.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
| turns back | path | change | did | must stay | ✓ |
|---|---|---|---|---|---|
| 21 (p13) | chat | 15 ⇒ 18 m and every number built on it | statement, datum, draft, ledger steps, 19 numbers with exact values | cable 15 m, 15 A, step 5 | ✓ (T9) |

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| «294300 ÷ 48 = 6131» | 6131.25 | ؟ ask | ✓ (C25) |
| «۴۸ × ۶۱۳۱ ≈ ۲۹۴ هزار» | 294 288 | ✓ | ✓ |
| «۱ = ۱/۲ + ۱/۳ + ۱/۴» | 13/12 | ✗ | ✓ (S1 fixed) |
| «۱/۲ + ۱/۳ + ۱/۶ = ۱» | 1 | ✓ | ✓ |
| «۱۸۰ ÷ ۱۲ = ۱۶» | 15 | ✗ | ✓ |
| «۱۲ − ۱۲٫۶ = ۰٫۶» | −0.6 | ✗ | ✓ |
| «۱۰۲ ÷ ۶۰ … ۱٫۷» / «… ۱٫۵» | 1.7 | ✓ / ✗ | ✓ |
| «۱۰۲ ÷ ۲۴۰ = ۰٫۴۳» / «= ۰٫۴۵» | 0.425 | ✓ / ✗ | ✓ (C9) |
| «۳۰۶ وات‌ساعت = ۳٫۰۶ کیلووات‌ساعت» | 0.306 | ✗ unit | ✓ |
| «۴ تکه‌ی ۳ متری = ۱۲ متر» | 12 | silent | S3 (unread) |
| «۲ تکه‌ی ۷ متری = ۱۵ متر» | 14 | silent | S2 (wrong silent) |
| «۲۰۰۰ × ۹٫۸۱ × ۱۸ = ۳۵۳ هزار» | 353 160 | ؟ «۳۵۳۱۶۰ هزار» | S2 (wrong scale stated) |
| «۳۵۳۱۶۰ ÷ ۴۸ = ۷۳۵۸» | 7357.5 | ؟ | ✓ |
| date/score/congruence/equation | — | silent | ✓ |

## سن
31; «تو».

## Arms (RUNNER27 T1–T12) in this scenario
- T3 («= N unit» correct and wrong): p14 — FAIL (B27·D9: both silent).
- T4 (third prior-work report): p11–p12 — PASS.
- T9 (coincidental 15 beside the corrected 15): s22 — PASS.

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
| report | steps | merged? | verdicts | her fixes |
|---|---|---|---|---|
| opening | 1–5 | ✓ | 1 ✓, 2 ✗, 3 dep, 4 ✓, 5 ⚠️ | 2, 3 numeric same turn; 5 by meaning |
| second (p10) | 6–12 | ✓ (12 گام) | all ✓ | — |
| third (p11) | 13–19 | ✓ (19 گام) | 13 ✗, 14 ✗, 15 ✗, 16 ✗ (13/12), 17 ✗, 18 ✗ unit, 19 ✗ | 13, 14 applied (p12) |
| height 15⇒18 (p13) | 2,3,4,10,11,12 | stale-marked | — | — |

## Chat ⇄ page
—

## Owner bank (this scenario)
—

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- B26·D20 / U1 (S1: false fraction identity ✓): FIXED — p11 ✗ 13/12.
- B26·D18 / U3 (third report never enters the ledger): FIXED — 19 steps.
- B26·D19 / U5 (correction marks by coincidental 15): FIXED.
- U4 (correction does not reach the ledger / chat results): FIXED — ledger steps and results marked.
- B26·D17 / U43 (misleading «متنِ تازه‌ات … هنوز نمی‌خواند»): FIXED — «به دستِ خودش … درست».
- B26·D21 / U45 (identical clipped before/after in the correction line): FIXED — «… ۱۸ متر، …» ⇐ «… ۱۵ متره، …».
- U44 (step ✓ beside a stale dispute reason): CHANGED — the dispute is shown as «بازسنجی شد ⇒ حکم ماند» on the old text; the fixed step shows only its fix.
- U28 (Bx: division slip labelled a unit error): not reproduced — «۳۰۶ وات ساعت = ۳.۰۶» is a real unit slip and is labelled so; divisions get plain ✗.
- B26·D6 / B25·D24: FIXED here.
- B24·D16 (two arrow forms): STILL (booked here by compensation b).

## Routing (14/14 correct)
### pwB1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. من نگارم، مهندس تأسیساتم. برای باغِ پدرم تو روستا می‌خ…» | lla_coach | lla_coach | ✓ |
| p2 | rewrite (post-check) | «سلام. من نگارم، مهندس تأسیساتم. برای باغِ پدرم تو روستا می‌خ…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «نه، گامِ ۲ درسته. کیلو یعنی هزار؛ ۲۹۴٫۳ کیلوژول میشه ۰٫۲۹ کی…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «آهان، کیلووات‌ساعت یعنی ۱۰۰۰ وات ضربدر ۳۶۰۰ ثانیه. پس 294300…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «پس پنل: ۰٫۱۶۴ ÷ ۴٫۵ = ۰٫۰۳۶ کیلووات، یعنی ۳۶ وات! پس حتی یه …» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «آخ… پمپ موقعِ کار ۴۹۰ وات می‌کشه ولی پنلِ ۵۰ واتی ظهر نهایتا…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «اینو به‌عنوانِ مسئله‌ی خودم ثبت کن که بعد از حرف زدن با فروش…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «سلام، با فروشنده حرف زدم: پمپِ ۱۲ ولتِ ۱۲۰ واتی دارن و پنلِ …» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «درسم: واحد رو تا آخر با خودم ببرم و کنارِ انرژی، توانِ لحظه‌…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «این هم ادامه‌ی کارِ خودمه که دیشب برای سیم‌کشی و هزینه نوشتم…» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «برای حالتی که پمپِ ۱۸۰ واتی بگیرم هم همین کار رو کردم، اینم …» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «گامِ ۱۳ و ۱۴ رو قبول دارم، عجله‌ای نوشته بودم: ۱۸۰ ÷ ۱۲ = ۱۵…» | lla_coach | lla_coach | ✓ |
| p13 | coaching (problem talk) | «با مخرجِ ۱۲: ۶ و ۴ و ۳ میشه ۱۳ دوازدهم، نه یک. پس گامِ ۱۶ غل…» | lla_coach | lla_coach | ✓ |
| p14 | coaching (problem talk) | «دو سه تا حسابِ دیگه هم کردم: لوله‌ی رانش ۴ تکه‌ی ۳ متری = ۱۲…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- Products written «N تکهٔ M متری» and «A در B» read as ×; the page's own exact values printed in her unit and scale.

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- B27·D9 instance (S2, b) p14: «۲ تکه‌ی ۷ متری = ۱۵ متر» wrong, silent; «۴ تکه‌ی ۳ متری = ۱۲ متر» unread.
- B27·D13 (S2, b, C15/C23) p14: page tells the coach the exact value is «۳۵۳۱۶۰ هزار».
- B24·D16 STILL (S3, c) post 📜: two arrow forms in one history line.

RESULT: FAIL — 2 S2 + 1 S3
