# aB4 — آقای رحمانی، ۸۲ ساله، و معمای مرغ و خرگوش — ROUND 26 (runner B)

## خلاصه برای مالک
معلمِ بازنشستهٔ ۸۲ ساله‌ای که نمی‌خواست جواب را بشنود. مجهول، داده و شرط را جدا نوشت، حدس زد، از خطای حدس راه را پیدا کرد (۲۳ مرغ و ۱۲ خرگوش)، وارسی کرد، از راهِ دوم («اگر همه مرغ بودند») به همان رسید، خواست ثبت شود، و فردا آن را به نوه‌اش یاد داد و نوه مسئلهٔ تازه ساخت. در همهٔ گفت‌وگو «شما» ماند و پس از بستن و دوباره باز کردنِ صفحه هم «شما» ماند. حساب‌های وارسی و راهِ دوم همه درست خوانده شد. پنج ایرادِ ریز دیده شد: حسابِ حدسِ اول خوانده نشد، یک پرسشِ خودِ صفحه «شما» و «تو» را قاطی کرد، وارسیِ ضمیر یک بار بی‌جا بازنویسی خواست، فرمِ فهم جملهٔ داده‌ها را جای «مجهول» پیشنهاد کرد، و ترتیبِ نقشه هنوز درهم است.

## Run setup (common, runner B round 26)
Page main 1f93c333 (round-25 fixes; `build.py --check` in sync). Harness round26B/tools/harness26bm.js (harness5 + page URL from env for the territory scratch pages; own browser profile per scenario dir, PIDs in round26B/pids.txt). Driver tools/drv26bm.py replays round25B/<sid>/ctl; replies: round-25 replies rebuilt from docs/tours/dataset (s11–s20, bp1–bp3) are reused when HER turn text matches; every other reply (all of aB*, tB*, oB1, pwB*, and every new round-26 turn) was written this round as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Strict prompt scan (tools/strict.py): see below. Defect ids: round26B/defects.md (B26·Dn), round25B/defects.md (B25·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1 «جواب رو نگو» respected in all ten replies; one question per turn; «شما» throughout.
- [PASS] «# مخاطب» «(سالمند؛ از سنی که خودش گفت …)» then, after the card, «(… از تاریخِ تولدِ ثبت‌شده)»; birth «۱۰ مرداد ۱۳۲۳» ⇒ 1944-08-01 ✓, one line «✓ تاریخِ تولدتان ثبت شد: ۱۰ مرداد ۱۳۲۳ …».
- [PASS] s4 date from his words asked, not booked: «📅 از حرفِ خودتان: «فردا برای نوه‌م توضیح بدم» — دوشنبه ۴ آبان ۱۴۰۵ — در «امروز» بیاید؛ درست است؟» (correct day); he did not answer and nothing was booked (C12).
- [FAIL] p3 his chain «۲۰×۲ + ۱۵×۴ = ۴۰ + ۶۰ = ۱۰۰» and p4 «۱۰۰ منهای ۹۴ میشه ۶» get no arithmetic block (B26·D35, S3).
- [PASS] p5, p6, p9 arithmetic blocks all exact (table); guess «۲۰ مرغ و ۱۵ خرگوش» ends «رد شد» by his own test.
- [FAIL] p7 page's own stage question mixes registers: «می‌توانید نتیجه را از راهِ دیگری به دست آوری …» (B26·D36, S3).
- [FAIL] p8 pre-check asked a rewrite for «دو ضمیر» on a reply with only «شما» forms (B26·D37, S3).
- [PASS] p8 «ثبتش کن» ⇒ «✓ «معمای مرغ و خرگوش» در «🔭 مسئله‌های من» ثبت شد و «حل شد» خورد؛ بازنگری هنوز نیست — صفحه‌اش (۴) بازنگری را از خودتان می‌پرسد»; the chat did not re-ask the understanding fields after closure.
- [FAIL] s13 the form's proposal for «مجهول» is his data sentence «داده‌ها: ۳۵ تا سر و ۹۴ تا پا» (B26·D38, S3).
- [PASS] reload before p10 (browser closed and reopened on the same profile): «این گفت‌وگو با «شما» است» and the birth-based audience line are still there (register stored — P6).
- [PASS] p9 (+1 d) page question fits the grandchild's new result; p10 lesson stored, same problem updated («همان مسئله، به‌روز شد»), a new riddle given without its answer.
- [FAIL] 🧭 FINAL: result ×3, look-back ×2, «فرمِ فهم» after them, then another result, «حکمِ وارسی», «بازنگری» after «حل شد» (B24·D18 remainder STILL, S3).
- [PASS] routing 10/10.
- note (not counted): the first trial guess being too high was reported as «fail» by my model reply and the prerequisite view keeps one «علت هنوز روشن نیست» entry for it, though he was never stuck.

## نقشهٔ نیاز
Parts: coach (FOR one patient question, never the answer) — met; arithmetic reader — met in execution/look-back, silent in the plan stage (D35); register keeper — met and stored, with two slips of the page's own (D36, D37); chat-solved import (FOR carrying his own unknown, data, condition) — one field mis-assigned (D38). Person (an elder who felt a little ashamed): needed dignity, his own pace, and something to show his grandchild tomorrow — met.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| p3 «۲۰×۲ + ۱۵×۴ = ۴۰ + ۶۰ = ۱۰۰» | 100 | no block | unread (D35) |
| p4 «۱۰۰ منهای ۹۴ میشه ۶» | 6 | no block | unread |
| p5 «۲۳ + ۱۲ = ۳۵» | 35 | ✓ می‌خواند | correct |
| p5 «۲۳×۲ = ۴۶», «۱۲×۴ = ۴۸» | 46, 48 | ✓, ✓ | correct |
| p6 «۳۵×۲ = ۷۰», «۹۴ − ۷۰ = ۲۴», «۲۴ ÷ ۲ = ۱۲» | 70, 24, 12 | ✓ «۳۵×۲ = ۷۰», ✓ «۹۴ − ۷۰ = ۲۴», ✓ «۲۴ / ۲ = ۱۲» | correct |
| p9 «۵۰×۲ = ۱۰۰» | 100 | ✓ | correct |

## سن
82 (said in his first message; then born ۱۰ مرداد ۱۳۲۳ on the card): elder rules, «شما» kept and stored across a reload.

## Round-25 defects in this scenario (FIXED | STILL | CHANGED)
- B24·D2 aB4 part (chat_solved imports only the statement): CHANGED — unknown/condition now carried as proposals, but the unknown proposal is the data sentence (B26·D38).
- B24·D18 (route repeats): STILL (order/repeats).
- B24·D8, D9, D11, D14: FIXED, still fixed.
- B24·D12 (aB4 p9–p10): still fits the new result.

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
| p8 | rewrite (post-check) | «اینو یه جا ثبتش کن که فردا وقتی نوه‌م اومد، از روی همون براش…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «سلام. نوه‌م اومد. با همون راهِ «همه مرغ باشن» براش گفتم، خود…» | lla_coach | lla_coach | ✓ |
| p10 | coaching (problem talk) | «درسم این بود: وقتی حدس زدم و زیاد شد، نگاه کردم هر تغییرِ کو…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- Arithmetic reading in every stage, including chained equalities and «منهای/میشه».
- A printable one-page «برای نوه» sheet from the saved solution.

## ایده‌ها
- He would ask: «از روی کدام صفحه برای نوه‌ام بخوانم؟» — the saved problem page has his words but in pieces.

## Defects (catalogue round26B/defects.md)
- B26·D35 (S3) p3–p4 · B26·D36 (S3) p7 · B26·D37 (S3) p8 · B26·D38 (S3) s13 · B24·D18 remainder STILL (S3) 🧭.

RESULT: FAIL — 5 S3
