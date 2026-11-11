# aB3x — بازنشسته — تاریخِ ناممکن در کارت، «بعداً»، و گفتنِ تولد در گفت‌وگو — ROUND 26 (runner B)

## خلاصه برای مالک
بازوی کوتاهِ همان بازنشسته: در کارتِ تولد «1337/12/31» نوشت و کارت با دلیل نپذیرفت؛ «بعداً» زد و کارت کنار رفت؛ سپس در گفت‌وگو گفت «۱۲ اردیبهشت ۱۳۳۸، میلادیش رو بلد نیستم» و صفحه خودش تبدیل و یک بار با «شما» تأیید کرد. ایرادی دیده نشد.

## Run setup (common, runner B round 26)
Page main 1f93c333 (round-25 fixes; `build.py --check` in sync). Harness round26B/tools/harness26bm.js (harness5 + page URL from env for the territory scratch pages; own browser profile per scenario dir, PIDs in round26B/pids.txt). Driver tools/drv26bm.py replays round25B/<sid>/ctl; replies: round-25 replies rebuilt from docs/tours/dataset (s11–s20, bp1–bp3) are reused when HER turn text matches; every other reply (all of aB*, tB*, oB1, pwB*, and every new round-26 turn) was written this round as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Strict prompt scan (tools/strict.py): see below. Defect ids: round26B/defects.md (B26·Dn), round25B/defects.md (B25·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] card «1337/12/31» ⇒ «اسفند ۳۰ روز دارد — روز را دوباره ببین» (exact: Esfand 1337, a leap year, has 30 days; day 31 does not exist ✓); nothing stored.
- [PASS] «بعداً» ⇒ card leaves, age still unknown, no nagging in the next turn.
- [PASS] p2 «من ۱۲ اردیبهشت ۱۳۳۸ به دنیا اومدم، میلادیش رو بلد نیستم» ⇒ the model sends the date as written; the page converts: birth 1959-05-03 ✓, one line «✓ تاریخِ تولدتان ثبت شد: ۱۲ اردیبهشت ۱۳۳۸ — سن هر بار از همین تاریخ حساب می‌شود»; «# مخاطب» «(سالمند؛ از تاریخِ تولدِ ثبت‌شده)».
- [PASS] routing 2/2.

## نقشهٔ نیاز
Part (age card and birth action): FOR refusing an impossible date with its reason, respecting «بعداً», and taking the date later in his own calendar — met. Person: needed not to convert anything himself — met.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| «1337/12/31» | invalid (Esfand 1337 has 30 days) | «اسفند ۳۰ روز دارد — روز را دوباره ببین» | correct |
| «۱۲ اردیبهشت ۱۳۳۸» | 1959-05-03 | birth=1959-05-03 | correct |

## سن
67; elder; «شما» in the confirmation line.

## Round-25 defects in this scenario (FIXED | STILL | CHANGED)
- B24·D7 (aB3x): FIXED, still fixed.

## Routing (2/2 correct)
### aB3x routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. من بازنشسته‌ام. ۳۰۰ میلیون تومن پس‌انداز دارم. حقوق با…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «یعنی: با این پس‌انداز و این حقوق، کِی پولم تموم میشه و چیکار…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- none.

## ایده‌ها
- The card's own question («تاریخِ دقیقِ تولدت را بنویس؟») is in «تو» before the age is known; a neutral form would suit everyone.

## Defects (catalogue round26B/defects.md)
- none.

RESULT: PASS
