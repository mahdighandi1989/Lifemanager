# aB4 — مادربزرگِ ۸۲ ساله و معمای مرغ و خرگوش — ROUND 27 (runner B)

## خلاصه برای مالک
معلمِ بازنشستهٔ ۸۲ ساله معمای نوه‌اش را خودش حل کرد: حدس زد، دید ۱۰۰ پا زیاد است، با «هر خرگوش که مرغ شود دو پا کم می‌شود» به ۲۳ و ۱۲ رسید، وارسی کرد و از راهِ دیگری («همه مرغ باشند») هم رسید؛ فردا همان را به نوه‌اش یاد داد. این دور زنجیرهٔ حسابش خوانده شد، مجهولِ فرم درست آمد و هیچ بازنویسیِ بی‌جای «دو ضمیر» نبود؛ نامِ نوه‌ها هم در هیچ عنوانی ننشست. ولی در خطِ تاریخی که صفحه پرسید، جملهٔ خودِ او «جواب رو نگو» به «جواب رو نگویید» تغییر داده شده و یک «» » اضافه سرِ آن آمده.

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1 «جواب رو نگو» respected; whole-first in «شما»; birth by card «۱۰ مرداد ۱۳۲۳» (82).
- [PASS] p1/s1 «فردا برای نوه‌م توضیح بدم» (her own future action) asked «سه‌شنبه ۵ آبان … درست است؟»; unanswered ⇒ «بی‌جواب ماند و چیزی ثبت نشد».
- [FAIL] s1/s3 and Today: the quoted sentence reads «» جواب رو نگویید، می‌خوام خودم حل کنم …» — her «نگو» rewritten to «نگویید» inside a quote of HER words, plus a stray «». B27·D4 instance (S3 here: meaning kept, quote altered).
- [PASS] p3 «۲۰×۲ + ۱۵×۴ = ۴۰ + ۶۰ = ۱۰۰» ✓ ✓ (round 26 B26·D35: unread); p4 «۱۰۰ − ۹۴ = ۶» ✓; p5 check ✓ ✓ ✓; p6 «۳۵×۲ = ۷۰», «۹۴ − ۷۰ = ۲۴», «۲۴ ÷ ۲ = ۱۲» ✓.
- [PASS] p7 «ثبتش کن» ⇒ registered «حل شد»; 📜 «مجهول (از گفت‌وگو): تعداد مرغ‌ها و تعداد خرگوش‌ها» (round 26 B26·D38: her data sentence).
- [PASS] no «دو ضمیر» rewrite on any turn (round 26 B26·D37).
- [PASS] p8 (+1 d) grandchild's variant «۵۰ سر و ۱۴۰ پا»: «۵۰×۲ = ۱۰۰» ✓…; p9 lesson; page questions in «شما» («جای‌گذاری کنید») (round 26 B26·D36).
- [PASS] p10 (added, classify «Not done»: bare first names) «اسمِ نوه‌م ساراست؛ داداشش علی …»: no title, label, Today line or strip carries «سارا»/«علی»; the names stay only in her own chat words (C38). The fixer's open item was not triggered because nothing wrote a label from this sentence.

## نقشهٔ نیاز
Parts: arithmetic reader — met in every shape; register layer — keeps «شما» but rewrites her own quoted words; date reader — asked correctly. Person: an elder who felt embarrassed wanted to solve it herself and explain it — met.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| «۲۰×۲ + ۱۵×۴ = ۴۰ + ۶۰ = ۱۰۰» | 100 | ✓ ✓ | ✓ |
| «۱۰۰ منهای ۹۴ میشه ۶» | 6 | ✓ | ✓ |
| «۲۳ + ۱۲ = ۳۵», «۲۳×۲ = ۴۶», «۱۲×۴ = ۴۸» | 35, 46, 48 | ✓ | ✓ |
| «۳۵×۲ = ۷۰», «۹۴ − ۷۰ = ۲۴», «۲۴ ÷ ۲ = ۱۲» | 70, 24, 12 | ✓ | ✓ |
| «۵۰×۲ = ۱۰۰» … | 100 | ✓ | ✓ |

## سن
82; «شما» everywhere in what the page writes.

## Arms (RUNNER27 T1–T12) in this scenario
- none of T1–T12 is hosted here

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
- no prior-work opening here; no prior block fired where it should not

## Chat ⇄ page
—

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- B26·D35 (aB4 chain unread): FIXED — p3.
- B26·D36 / U53 (page question «… به دست آوری» in a «شما» talk): FIXED — page questions in «شما».
- B26·D37 / U55 (false «دو ضمیر» rewrite): FIXED — none.
- B26·D38 / U54 («مجهول» = data sentence): FIXED.
- B24·D18 remainder (📜 order): not seen in this run's 📜 (closed via chat; order statement → work → closure).
- U19 / Bx D23 («باشه» not read): not exercised here (her next message answered the problem, not the date) — exercised in pwB2.

## Routing (10/10 correct)
### aB4 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. من ۸۲ سالمه، معلم بازنشستهٔ جغرافیا. نوه‌م یه معما ازم…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «مجهول: تعداد مرغ‌ها و تعداد خرگوش‌ها. داده‌ها: ۳۵ تا سر و ۹۴…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «یه حدس بزنم: تقریباً نصف نصف، مثلاً ۲۰ مرغ و ۱۵ خرگوش. پاها …» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «اگه یه خرگوش رو بکنم مرغ، سرها همون ۳۵ می‌مونه ولی پاها ۲ تا…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «وارسی کردم: ۲۳ + ۱۲ = ۳۵ سر. پاها: ۲۳×۲ = ۴۶ و ۱۲×۴ = ۴۸، رو…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «از یه راه دیگه... اگه همه مرغ بودن: ۳۵×۲ = ۷۰ پا. ۹۴ − ۷۰ = …» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «اینو یه جا ثبتش کن که فردا وقتی نوه‌م اومد، از روی همون براش…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «سلام. نوه‌م اومد. با همون راهِ «همه مرغ باشن» براش گفتم، خود…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «درسم این بود: وقتی حدس زدم و زیاد شد، نگاه کردم هر تغییرِ کو…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «راستی اسمِ نوه‌م ساراست؛ داداشش علی هم هفته‌ی بعد میاد. همین…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- Quotes «از حرفِ خودتان: «…»» must be byte-exact; register conversion only outside guillemets.

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- B27·D4 instance (S3, b) s1/Today: her quoted «جواب رو نگو» rendered «نگویید» with a stray «».

RESULT: FAIL — 1 S3
