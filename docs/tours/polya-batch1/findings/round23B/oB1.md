# oB1 — بیداریِ ۶ صبح (پرسشگرِ مالک‌وار) — ROUND 23 (runner B)

## خلاصه برای مالک
کاربری بسیار کنجکاو (۳۷ ساله) مسئلهٔ واقعی‌اش را آورد — هفته‌ای فقط دو صبح زود بیدار می‌شود — و پشتِ هر پاسخ پرسشی داشت. هفت پرسش از بانکِ پرسش‌های مالک را در دلِ کار پرسید و هر کدام پاسخِ مشخص گرفت: اصلاح دنبال می‌شود (و یک اصلاحِ واقعی کرد که نشست)، همه‌چیز در «📜 پرونده» جمع است، کارنامه «از کجا؟» دارد، تمرین تا تثبیت باز می‌ماند (با این اعترافِ صادقانه که تکنیکِ «عادت‌سازی» در ۴۵ تکنیک نیست)، نقشهٔ مسیر هست، کمبود ثبت می‌شود ولی «پس از ساخته شدن خبر نمی‌دهد»، و عوض شدنِ مدل داده‌ها را از بین نمی‌برد. با آزمونِ یک‌هفته‌ای فرضِ «اراده» را کنار گذاشت و ۵ از ۷ رسید. ایرادها: دستیار نتوانست نقشهٔ مسیرِ همین گفت‌وگو را باز کند (شناسه ندارد)، مقصدِ نقشه یکی از جمله‌های فرعیِ او بود، و صفحه پیش‌بینی‌ای را که داده بود دوباره می‌خواست.

## Run setup
Build main 574f4a30 (round-22 fixes + age package); `build.py --check` in sync; dist 16:02 (after the merge). Harness `harness5.js`, one browser profile per scenario (deleted at the end). Replays: round-22 ctl of the same scenario (round22B/<sid>/ctl) re-driven by round23B/tools/drv.py; each AI call matched to its round-22 twin by her turn text and the round-22 reply reused ONLY where the round-23 prompt asked nothing new; new replies (`ai/rN.txt` via akey) written as the literal average model wherever round 23 requires something new (birth date, prerequisite layer, list_add/list_update, rewrite requests, new user turns). Every scenario sets the birth date the way a real user would (the birth-date card after her first message, or her own words to the assistant) and ends with {"exit":true}; `tools/post21.js` then shot dossier / tunnel / mind / practice / Today (`out/part_*.png`, text in `post.txt`). Clock: the page's own Date shift (inject.js `__adv`). Turn ids «pN» = `ai/pN.json`. Defect ids B23·Dn = round23B/CATALOGUE.md.

Birth / age: ۳۷ (کارت، 1989-03-08) — بزرگسال

## Criteria (written criteria + round-23 requirements)
- [PASS] Bank Q1 (correction) p1: answered with the mechanism; then a real correction p4 «سه روز» ⇒ «✓ اصلاح شد: صورتِ مسئلهٔ گفت‌وگو: «سه» (اصلاح شد ⇐ «دو»)»; route shows the back-jump.
- [PASS] Bank Q2 (one place) p2: «📜 پروندهٔ کامل» / «📚 همهٔ کارها» / «📜 پروندهٔ این گفت‌وگو» — exists (post.txt DOSSIER-SESS).
- [PASS] Bank Q3 (mind traceable) p4: «از کجا؟» per row; stages without data read «هنوز داده‌ای نیست».
- [PASS] Bank Q5 (technique open until stable, real dates) p5: start_practice T21 with his quoted consent ⇒ «✓ پروندهٔ تمرین باز شد: ۲۱ · آزمون فرضیه…»; week-later practice_log ⇒ «✓ جلسهٔ ۳ آبان … (درست)»; honest «تکنیکِ ساختنِ عادت در ۴۵ تکنیک نیست» (territory dc_habits 3, dc_implementation_intentions 0).
- [FAIL] Bank Q8 (route) p6: the model cannot open the chat route (no session id in the prompt) ⇒ «🧗 مسئله‌های بزرگ ›» opened; he had to use the panel button (B23·D17); the strip's destination is his side sentence «و یه سؤال دیگه: همه‌ی…» (B23·D2).
- [PASS] Bank Q9 (missing ⇒ filed/built/resumed) p8: exact «هست / نیست» answer; no sheet filed because manual logging exists; the resume loop honestly reported missing (B23·D7).
- [PASS] Bank Q10 (model change) p10: records and method live in the page; quality may change; the page validates reports.
- [PASS] Rejected generic answers (none given); changed direction mid-way (Q8/Q9) and came back; returned after 7 days with seven wake-up times; hypothesis «اراده» refuted by his own data, «خواب» kept.
- [FAIL] Turn-question misfits p6/p8/p9 «پیش از این گام: فکر می‌کنی چه می‌شود…» after he had predicted and even on the outcome (B23·D12); strict scan: «شناسه را بپرس» in «# منبع‌ها و پوشش» (B23·D8).
- [PASS] Routing 11/11.

## نقشهٔ نیاز
**Parts:** assistant self-knowledge (FOR: answer «is X there?» with «هست، این‌جا، این‌طور» or an honest «نیست») — met for 7/7 questions; practice case — met; route — reachable only by button; dossier — met.
**Person:** a demanding owner-like user needed evidence, not reassurance — met; needed the route opened when he asked — not met.

## پیش‌نیاز
No prerequisite; the «اراده» attribution was tested and refuted by his data (a would-be «ability» label replaced by a concrete cause — the same spirit as §15).

## آزمودنِ اصلاح
| # | turns back / path | should change | what did | must stay | assistant vs page | vs round 22 |
|---|---|---|---|---|---|---|
| 1 (new) | 3 · chat · datum in first message (two facts in the sentence) | «دو» ⇒ «سه» only | ✓ «سه» ⇐ «دو» | «پنج روز از هفت» goal ✓ | «فرستادم» then page ✓ | new — PASS |

## سن (RUNNER23 §1)
Adult ✓.

## Routing
### oB1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. می‌خوام روش پولیا رو روی زندگی خودم امتحان کنم، با یه …» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «هفته‌ای پنج روز از هفت روز صبح زود بیدار شم و یه ساعت مطالعه…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «دو روز موفق، شب قبلش ساعت ۱۱ خوابیده بودم و گوشی رو گذاشته ب…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «نه، اون دو روز راحت بیدار شدم! پس شاید اراده نیست، خواب و گو…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «آزمونش: از امشب یک هفته گوشی ساعت ۱۰:۳۰ میره آشپزخونه و ۱۱ م…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «اگه کمتر شد یعنی خواب و گوشی تنها علت نیست و باید دنبال یه چ…» | lla_coach | lla_coach | ✓ |
| p7 | automatic follow-up | «[سامانه: «🧗 مسئله‌های بزرگ ›» باز شد. حالا از روی همین گفت‌و…» | lla_assistant | lla_assistant | ✓ |
| p8 | coaching (problem talk) | «دیدمش، اون پرش اصلاح هم توشه. حالا اگه یه چیزی که لازم دارم …» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «سلام، یه هفته گذشت. ساعت بیداری این هفت روز: ۶:۰۵، ۶:۱۰، ۷:۳…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «مهمونی آخرش یعنی دیر خوابیدن، پس همون خوابه، علت تازه نیست. …» | lla_coach | lla_coach | ✓ |
| p11 | coaching (problem talk) | «درسم: وقتی فکر می‌کنم مشکل «اراده»ست، اول روزای موفق و ناموف…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: see CATALOGUE B23·D8 (only oB1 «# منبع‌ها و پوشش» flagged); no other unmarked second question directive.

## ارتقای لازم
- Session id (or a `route` action meaning «this conversation») so the assistant can open «🧭» for a chat problem.
- A habit-formation technique / implementation-intention tool (territory 0) — need: the most common life problem.

## ایده‌ها
- «پرسش‌هایی که از سامانه پرسیدی» page: each bank question with its current honest answer and evidence link (part: assistant self-knowledge; person: an owner who re-asks to verify). Both needs: met only in chat now.
- Weekly sleep table → mini plot under the message (times like 6:05 are not plotted) — part: inline plot; person: see the week at a glance.

RESULT: FAIL
