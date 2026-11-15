# aB2 — ۱۶ ساله، استقرا و «چرا» ی جمعِ فردها (بازنگری) — ROUND 27 (runner B)

## خلاصه برای مالک
نوجوانی که با استقرا نمرهٔ کامل گرفته بود ولی «چرا»یش را نمی‌فهمید، با شکلِ L-ها دید هر فرد یک قابِ تازه دورِ مربع است، همین را برای جمعِ زوج‌ها هم آزمود و درسش را گفت؛ سه روز بعد ۱+۳+…+۹۹ را خودش حل کرد. صفحه این دور اتحادِ کسریِ نادرستِ «۱/۲ + ۱/۳ + ۱/۴ = ۱» را درست ✗ زد (۱۳/۱۲)، درست‌ها را ✓، جمع‌های سه‌نقطه‌ای را «نسنجیده»، و سه شکلِ تقسیم را درست از هم جدا کرد. ولی پروندهٔ مسئلهٔ دوم (۱+۳+…+۹۹) نُه سطر از کارِ مسئلهٔ اول را در خودش دارد، و در پروندهٔ مسئلهٔ اول «فرمِ فهم» بعد از نتیجه‌ها آمده است.

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1–p6 the «why» behind an induction proof: picture of L-shapes; the induction step's use of the hypothesis seen; lesson in her words; new problem invented (even sums) and tested n = 1, 2, 3 + induction.
- [PASS] p7–p9 look-back: «پرسشی که کمک کرد», taste.
- [PASS] p10–p11 (+3 d) «1+3+…+99»: n from 2n−1 = 99 (equation with unknown, no arithmetic verdict — correct look-alike); 50² = 2500; registered, look-back asked on the page.
- [PASS] T3/Q1 p12 (added): «۱/۲ + ۱/۳ + ۱/۶ = ۱» ✓; «۱/۲ + ۱/۳ + ۱/۴ = ۱» ✗ «حسابِ صفحه: ۱۳/۱۲» (round 26 S1 U1 is fixed here); ellipsis sums «۱ + ۲ + … + ۲۰ = ۲۱۰» and «۱ + ۳ + … + ۱۹ = ۱۰۴» ⇒ «نسنجیده — نه ✓ و نه ✗» (C17 honest; fixer «Not done»: not expanded — confirmed; the false 104 is not passed).
- [PASS] T10 p13 (added): «۲۶ ÷ ۴ = ۶٫۵» ✓; «۲۰ تقسیم بر ۷ میشه ۲ و خرده‌ای، یعنی حدودِ ۲٫۸۶» ✓ (2.857); «۲۲ تقسیم بر ۷ … یعنی ۳٫۵» ✗ «≈ ۳٫۱۴»; glued fraction «۱۳/۱۲ … از ۱ بزرگ‌تره» no division verdict (a fraction, correct); the coach told the same three marks; her view shows none (no leak).
- [PASS] look-alikes p13: «۱۴۰۵/۹/۲۰» read as a date, not 1405 ÷ 9 ÷ 20 (date ask «جمعه ۲۰ آذر ۱۴۰۵ … درست است؟» with «آره، همین / نه» buttons in Today); «۱۸/۲۰» (score) and «۹۹ ≡ ۳ (mod ۴)» no arithmetic line.
- [FAIL] post 📜 of problem 2 «1+3+5+…+99»: the first nine entries are problem 1's chat work («سلام. دیروز تکلیفمون رو حل کردم…», the induction step, the L-picture, the base case, the even sums, the n = 1, 2, 3 check, her lesson, her «پرسشی که کمک کرد» and her taste), all dated before problem 2's own statement. Lines under the wrong problem (compensation a). New B27·D7 (S2, U13 family).
- [FAIL] post 📜 of problem 1: «فرمِ فهم (همان‌طور که پر شد) — از گفت‌وگو» listed after the results and the first look-back; her «پرسشی که کمک کرد»/taste answers are missing here (they sit in problem 2). B24·D18 remainder STILL (S3).

## نقشهٔ نیاز
Parts: arithmetic reader (FOR telling the coach which numbers read) — met in every shape tried; 📜 (FOR one problem's own journey) — unmet: problem 2 carries problem 1's session. Person: a teen who wants to understand «why» — met; reached a verified result twice.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| «۱/۲ + ۱/۳ + ۱/۶ = ۱» | 1 | ✓ | ✓ |
| «۱/۲ + ۱/۳ + ۱/۴ = ۱» | 13/12 | ✗ (۱۳/۱۲) | ✓ |
| «۱ + ۲ + … + ۲۰ = ۲۱۰» | 210 | نسنجیده | ✓ (C17; not expanded) |
| «۱ + ۳ + … + ۱۹ = ۱۰۴» | 100 | نسنجیده | ✓ not passed (C17) |
| «۲۶ ÷ ۴ = ۶٫۵» | 6.5 | ✓ | ✓ |
| «۲۰ تقسیم بر ۷ … حدودِ ۲٫۸۶» | 2.857… | ✓ | ✓ (C9) |
| «۲۲ تقسیم بر ۷ … یعنی ۳٫۵» | 3.142… | ✗ ≈ ۳٫۱۴ | ✓ |
| «۱۳/۱۲ … از ۱ بزرگ‌تره» | fraction | silent | ✓ |
| «۱۴۰۵/۹/۲۰», «۱۸/۲۰», «۹۹ ≡ ۳ (mod ۴)» | date/score/congruence | silent / date ask | ✓ |
| «2n−1 = 99 پس n = 50», «۵۰² = ۲۵۰۰» | n = 50, 2500 | silent | ✓ (unknown) |

## سن
16; «تو».

## Arms (RUNNER27 T1–T12) in this scenario
- T3 (fraction identity with «= N»): p12 PASS.
- T10 (÷ / تقسیم بر / glued fraction): p13 PASS.

## 📜 line match (multi-problem only)
| 📜 of | line | belongs to | verdict |
|---|---|---|---|
| problem 1 «مجموعِ عددهای فرد و n²» | 17 entries: statement, induction step, results, look-back, lesson, new problems | problem 1 | ✓ (order: «فرمِ فهم» after results ✗ B24·D18) |
| problem 1 | missing: «همون که گفتی اعداد فرد رو با خونه‌ها بچینم» (helped question), «اون شکله خیلی باحال بود» (taste) | problem 1 | ✗ missing (filed under problem 2) |
| problem 2 «1+3+5+…+99» | entries 1–9 «کارِ تو در گفت‌وگو» (15:50–15:51: greeting/induction/L-picture/base case/even sums/check/lesson/helped/taste) | problem 1 | ✗ wrong problem (B27·D7) |
| problem 2 | statement, «چون nامین فرد…», result 2500, «فرمِ فهم», «حل شد» | problem 2 | ✓ |
| problem 2 | «بازنگری (از گفت‌وگو)» = her solution message | problem 2 | ⚠ labelled look-back, it is the solving step (minor, folded into B27·D7) |
| session | added day-3 sums/divisions (p12–p13) | after closure, no problem | no 📜 line (acceptable) |

## Prior work
- no prior-work opening here; no prior block fired where it should not

## Chat ⇄ page
—

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- U1 / B26·D20 family (false fraction identity passed ✓): FIXED here (p12 ✗ 13/12).
- B24·D18 remainder (📜 order): STILL.
- U13 family (records of one problem in another's 📜): seen here as B27·D7.

## Routing (13/13 correct)
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
| p12 | coaching (problem talk) | «امروز چندتا جمعِ دیگه امتحان کردم: ۱ + ۲ + … + ۲۰ = ۲۱۰، با …» | lla_coach | lla_coach | ✓ |
| p13 | coaching (problem talk) | «تقسیم‌ها رو هم نوشتم: ۲۶ ÷ ۴ = ۶٫۵. ۲۰ تقسیم بر ۷ میشه ۲ و خ…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- 📜 window per problem from its own first statement, not from the session start.

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- B27·D7 (S2, b, Q3) post 📜 problem 2 carries problem 1's nine chat entries; problem 1 misses its own look-back answers.
- B24·D18 remainder STILL (S3, b) post 📜 problem 1 order.

RESULT: FAIL — 1 S2 + 1 S3
