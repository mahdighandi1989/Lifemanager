# tB1z — جعبه‌قرص — سه ابزارِ تازه، بستن و تکه‌ای پس از بستن (T2، بانکِ ۴۵ و ۴۷) — ROUND 27 (runner B)

## خلاصه برای مالک
همان مخترع: سه حوزه با هم رسید؛ صفحه این دور «جستجوی پیشینهٔ اختراع» را با «نوشتنِ ادعاهای ثبتِ اختراع» هم‌امتیاز خواند و پرسید (دورِ ۲۶ بهترین را خودش رساند)، و وقتی او گفت «با همون جستجوی پیشینهٔ اختراع گشتم» صفحه آن را جواب نگرفت. بعد مسئله را بست؛ تکهٔ تازه‌ای که پس از بستن آورد (مجوزِ وسیلهٔ پزشکی) ورودیِ منتظرِ خودش و خطِ «امروز» گرفت و مسئلهٔ بسته دست نخورد. به پرسشِ «این ابزار روی دادهٔ خودم آزموده شد؟» پاسخِ صادقانه «نه، فقط با واژه‌ها» بود؛ و به «حل شد در نقشه، پرونده و صفحه یک معناست؟» صفحه و پرونده یکی بودند ولی کارنامه همین پرسش را «گذر از مرحله» شمرد.

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1–p8 preamble as tB1.
- [FAIL] arm three new areas at once (+1 d; «نوشتنِ ادعاهای ثبتِ اختراع», «بررسیِ بازار و رقیبان», «جستجوی پیشینهٔ اختراع»): s14 «❓ … «جستجوی پیشینهٔ اختراع» (هم‌امتیاز با «نوشتنِ ادعاهای ثبتِ اختراع» آمد …)» — prior-art fits the step («کسی پیش‌تر همین را ساخته یا ثبتِ اختراع کرده») far better than claim drafting; the page's word count calls it a tie. Q7/C26-20 «a clear single best fit arrives; it is not asked». Round 26: arrived. New B27·D19 (S3).
- [FAIL] p9 her report «با همون «جستجوی پیشینهٔ اختراع» گشتم …» names the tool, which the page's own TQ says is the answer («صفحه خودش از حرفش می‌خواند»), yet no «گفتی همان است» line, the entry stays ask/wait until closure (then «moot»). Folded into B27·D19.
- [PASS] bank 45 p10 (added) «این ابزار … روی داده‌ی خودِ من هم آزموده شد … یا فقط با واژه‌ها؟» — the page's own check is words only («واژهٔ مشترک با خودِ گام: «اختراع»، «ثبت»؛ با متنِ برگه: …»); the reply says so honestly. Verdict «نیست» (no test on her data); no sheet was filed in this run (runner reply did not file one — class d).
- [PASS] p11–p15 closure «همین بسه … ببندش» + look-back forms ⇒ «حل شد — وارسی: نتیجه سالم ماند»; the open waiting entry becomes «مسئله پیش از رسیدنِ ابزار بسته شد — دوباره باز نمی‌شود».
- [PASS] T2 p14 (Bx turn) piece after closure «مجوزِ وسیله‌ی پزشکی …» ⇒ «⏸ تکهٔ تازهٔ … منتظرِ برگهٔ #۱۰۲ ماند — مسئلهٔ «جعبه‌قرص…» بسته است و بسته می‌ماند …»; 📜 own entry; Today «⏸ تکهٔ «مجوزِ وسیلهٔ پزشکی …» منتظرِ برگهٔ #۱۰۲ است — پس از بستنِ مسئلهٔ … — مسئله بسته می‌ماند» (round 26 Bx U63: no Today line).
- [PASS/half] bank 47 p16 (added) «حل شد روی نقشه، پرونده و صفحه یه معنا داره؟» — 🔭 «حل شد — وارسی: نتیجه سالم ماند», 📜 «وضع: حل شد» agree here; but in tB1 c28–c29 the 🧭 FINAL tip says «حل به نتیجه رسید» while 🔭 says «در بازنگری — هنوز بسته نشده» — two meanings. Verdict «نیمه».
- [FAIL] post mind card «+ ۴ آبان · گذر از مرحله — «یه چیز دیگه: «حل شد» روی نقشه‌ی مسیر …»» — her question about the page is credited as a stage pass in «فهمِ مسئله». Q9. New B27·D18 (S3).

## نقشهٔ نیاز
Parts: territory loop (FOR a clear best fit arriving, a tie asked, her naming read) — over-asks and misses her naming; closure + after-closure piece — met; mind card — credits a meta question. Person: an inventor wanted the obvious tool accepted and to know honestly whether it was tested on her data — the second met, the first not.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
No arithmetic of hers for the page to check in this run.

## سن
—

## Arms (RUNNER27 T1–T12) in this scenario
| arm | expected | got | verdict |
|---|---|---|---|
| three areas, best fit named last | best fit arrives | tie ask with claim drafting | FAIL (B27·D19) |
| her naming of one | read as the answer | not read | FAIL (B27·D19) |
| T2 piece after closure | own waiting entry; closed problem untouched; Today line | ✓ | PASS |

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
- no prior-work opening here; no prior block fired where it should not

## Chat ⇄ page
—

## Owner bank (this scenario)
| # | question | verdict | evidence |
|---|---|---|---|
| 45 | ابزار روی دادهٔ خودم آزموده شد یا فقط با واژه‌ها؟ | نیست — page check is word overlap only; reply honest; no sheet filed (runner) | p10, s14 checks |
| 47 | «حل شد» روی نقشه، پرونده و صفحه یک معنا دارد؟ | نیمه — 🔭 and 📜 agree here; tB1 🧭 «حل به نتیجه رسید» vs 🔭 «در بازنگری» | p16; tB1 c28–c29 |

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- three-area best fit (PASS in round 26): REGRESSED — tie ask (B27·D19).
- U63 (Bx: piece after closure has no Today line): FIXED.

## Routing (16/16 correct)
### tB1z routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. یه ایده دارم و می‌خوام از ایده برسم به یه برنامه‌ی واق…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «یه جعبه‌قرص که خودش بفهمه مادرم قرصش رو برداشته یا نه و اگه …» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «اگه ماهی بیشتر از یه بار هشدار اشتباه بده مادرم کلافه میشه، …» | lla_coach | lla_coach | ✓ |
| p4 | internal second opinion (gap) | «(نظرِ دومِ برگه)…» | learning_architecture | learning_architecture | ✓ |
| p5 | coaching (problem talk) | «ترازوهای ارزونی که دیدم دقتشون ۰.۱ گرمه. پس ۰.۳ گرم یعنی ۳ ت…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «امتحان کردم: یه قرص رو ۲۰ بار گذاشتم و برداشتم. ۱۹ بار ۰.۲ ی…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «اگه مستقل باشن، هر دو اشتباه یعنی ۱/۲۰ × ۱/۲۰ = ۱/۴۰۰؛ ماهی …» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «این جعبه‌قرص رو به‌عنوانِ مسئله‌ی خودم ثبت کن که مرحله‌هاش و…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «دیدم نوشته ابزارش اومده. با همون «جستجوی پیشینهٔ اختراع» گشت…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «یه سؤال: این ابزاری که ساخته شد، روی داده‌ی خودِ من هم آزمود…» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «همین بسه — مسئله‌ی جعبه‌قرص برای من حل شد: می‌دونم ترازو کاف…» | lla_coach | lla_coach | ✓ |
| p12 | coaching (problem talk) | «یه تکه‌ی دیگه یادم اومد که مونده: باتریِ جعبه با ترازو و وای…» | lla_coach | lla_coach | ✓ |
| p13 | automatic follow-up | «[سامانه: «🗺 قلمروِ سامانه‌ها» باز شد. حالا از روی همین گفت‌و…» | lla_assistant | lla_assistant | ✓ |
| p14 | coaching (problem talk) | «یه تکه‌ی دیگه هم مونده که ابزارش رو نمی‌بینم: اگه بخوام این …» | lla_coach | lla_coach | ✓ |
| p15 | internal second opinion (gap) | «(نظرِ دومِ برگه)…» | learning_architecture | learning_architecture | ✓ |
| p16 | coaching (problem talk) | «یه چیز دیگه: «حل شد» روی نقشه‌ی مسیر، توی پرونده و توی صفحه‌…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- A «تست روی دادهٔ خودت» step after any arrival: run the new tool once on her own words/data and show the result before «رسید».

## ایده‌ها
- «ابزارِ تازه را روی همین مسئلهٔ من امتحان کن» button on every arrival (owner bank 45).

## Defects (catalogue round27B/defects.md)
- B27·D19 (S3, b, Q7/C26-20) s14, p9: clear best fit asked as a tie; her naming not read.
- B27·D18 (S3, b, Q9) post mind card: a meta question credited as «گذر از مرحله».

RESULT: FAIL — 2 S3
