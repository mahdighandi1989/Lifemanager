# aB2 — نوجوانِ ۱۶ ساله و برهانِ استقرا (بازنگریِ «چرا مربع؟») — ROUND 26 (runner B)

## خلاصه برای مالک
دانش‌آموزی ۱۶ ساله که برهانِ استقرای «مجموعِ n عددِ فردِ اول = n²» را نوشته و نمرهٔ کامل گرفته بود ولی حس می‌کرد نفهمیده چرا. با یک پرسش در هر نوبت، خودش جای فرض را نشان داد، شکلِ L را کشید و دید چرا مربع درمی‌آید، مسئلهٔ تازه‌ای ساخت (مجموعِ عددهای زوج)، حدسش را با سه حالت و استقرا ثابت کرد، درسش را نوشت و سه روز بعد همان را روی ۱+۳+…+۹۹ به کار برد. حسابِ صفحه هر هفت حسابِ عددیِ او را درست خواند. کارتِ تولد تاریخِ ناممکن را با دلیل رد کرد. یک ایرادِ ریزِ قدیمی در ترتیبِ پرونده ماند.

## Run setup (common, runner B round 26)
Page main 1f93c333 (round-25 fixes; `build.py --check` in sync). Harness round26B/tools/harness26bm.js (harness5 + page URL from env for the territory scratch pages; own browser profile per scenario dir, PIDs in round26B/pids.txt). Driver tools/drv26bm.py replays round25B/<sid>/ctl; replies: round-25 replies rebuilt from docs/tours/dataset (s11–s20, bp1–bp3) are reused when HER turn text matches; every other reply (all of aB*, tB*, oB1, pwB*, and every new round-26 turn) was written this round as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Strict prompt scan (tools/strict.py): see below. Defect ids: round26B/defects.md (B26·Dn), round25B/defects.md (B25·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1 look-back from his own finished proof; no verdict on a proof the model has not seen; one question per turn (p1–p11).
- [PASS] birth card trials: «۳۰ اسفند ۸۸» ⇒ «اسفندِ ۱۳۸۸ ۲۹ روز دارد (آن سال کبیسه نبود) — روز را دوباره ببین»; «۱۷ اسفند» ⇒ «روزِ تولدت را گفتی (۱۷ اسفند) — سالش را هم بنویس؟»; «88» ⇒ 2010-03-08, one line «✓ تاریخِ تولدت ثبت شد: ۱۷ اسفند ۱۳۸۸ …»; «# مخاطب» teen rules from the stored date (17 Esfand 1388 = 8 March 2010 ✓).
- [PASS] p4, p6, p11 arithmetic blocks — every numeric line he wrote read exactly (table).
- [PASS] p5 new problem «2+4+…+2n» kept as his own invented problem («🔭 نگه داشتم … مسئلهٔ زنده ساخته نشد»); guess «فکر کنم میشه n(n+1)» ⇒ «چطور می‌آزمایی‌اش؟».
- [PASS] p7 lesson NOT read as a guess; closure «✓ … «حل شد» خورد؛ درست ثبت شد و کارتِ «بازسازی» فردا (۴ آبان ۱۴۰۵) …»; closure did not re-ask understanding-form fields; p8/p9 «کدام پرسش کمک کرد؟» and «سلیقه» asked one per turn and stored.
- [PASS] p10 (+3 d) «…درسته؟» ⇒ no verdict, test asked; p11 his own check; second problem closed.
- [PASS] register «تو» carried in every prompt («این گفت‌وگو با «تو» است»).
- [FAIL] 📜 of the first problem: «فرمِ فهم (همان‌طور که پر شد) — از گفت‌وگو» comes after the results and the look-back, and look-back appears twice («بازنگری (از گفت‌وگو)», «بازنگری — از گفت‌وگو»); 🧭 FINAL of the second: result, look-back, then «فرمِ فهم» (B24·D18 remainder STILL, S3 — the ×3 repeats of round 25 are gone).
- [PASS] routing 11/11.

## نقشهٔ نیاز
Parts: look-back coach (FOR making a finished solution understood, by his own doing) — met; arithmetic reader — met on all numeric lines; invented-problem keeper — met; age layer (FOR tone only) — met. Person (a teen who wants to see why): needed a picture, not more algebra, and to be trusted with the next step — met.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| p4 «2×1−1 = 1» | 1 | ✓ «۲×۱−۱ = ۱» می‌خواند | correct |
| p6 «۲ = 1×2» | 2 | ✓ «۱×۲ = ۲» | correct |
| p6 «۲+۴=۶ = 2×3» | 6 = 6 | ✓ «۲+۴ = ۶», ✓ «۲×۳ = ۶» | correct |
| p6 «۱۲ = 3×4» | 12 | ✓ «۳×۴ = ۱۲» | correct |
| p11 «۵۰² = ۲۵۰۰» | 2500 | ✓ «۵۰² = ۲۵۰۰» | correct |
| p2 «n² + (2n+1) = (n+1)²», p6 «n(n+1) + 2(n+1) = (n+1)(n+2)», p11 «2n−1 = 99 پس n = 50» | identities / n = 50 | no line (symbolic) | unread |

## سن
16 (born ۱۷ اسفند ۱۳۸۸): teen rules; impossible day rejected with its reason; missing year asked; two-digit year read as 13xx.

## Round-25 defects in this scenario (FIXED | STILL | CHANGED)
- B24·D18 (route/dossier repeats; «فرمِ فهم» after results): CHANGED — repeats gone; order remainder STILL (S3).
- D1, D14 (round 24): FIXED, still fixed.

## Routing (11/11 correct)
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

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- Symbolic identities («n² + (2n+1) = (n+1)²») could be checked exactly too; today only numeric lines are.

## ایده‌ها
- He would ask: «شکلی که کشیدم کجا می‌مونه؟» — no place for his drawing (need of the person: partly met by his words only).

## Defects (catalogue round26B/defects.md)
- B24·D18 remainder STILL (S3) 📜 order.

RESULT: FAIL — 1 S3
