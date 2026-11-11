# aB2f — نوجوان — تاریخِ تولدِ شمسی با حروفِ لاتین — ROUND 26 (runner B)

## خلاصه برای مالک
بازوی کوتاهِ همان نوجوان: تاریخِ تولد را به شمسی ولی با حروفِ لاتین نوشت («17 Esfand 1388»). کارت آن را درست فهمید (۱۷ اسفند ۱۳۸۸)، یک خطِ تأییدِ شمسی داد و دیگر نپرسید. نخستین پاسخِ دستیار هم اول «کل» را پرسید و جواب نداد. ایرادی دیده نشد.

## Run setup (common, runner B round 26)
Page main 1f93c333 (round-25 fixes; `build.py --check` in sync). Harness round26B/tools/harness26bm.js (harness5 + page URL from env for the territory scratch pages; own browser profile per scenario dir, PIDs in round26B/pids.txt). Driver tools/drv26bm.py replays round25B/<sid>/ctl; replies: round-25 replies rebuilt from docs/tours/dataset (s11–s20, bp1–bp3) are reused when HER turn text matches; every other reply (all of aB*, tB*, oB1, pwB*, and every new round-26 turn) was written this round as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Strict prompt scan (tools/strict.py): see below. Defect ids: round26B/defects.md (B26·Dn), round25B/defects.md (B25·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1 «خودم می‌خوام حلش کنم» ⇒ whole-first question, no answer.
- [PASS] card: «17 Esfand 1388» ⇒ age 16, birth 2010-03-08 (exact: 17 Esfand 1388 = 8 March 2010 ✓), one line «✓ تاریخِ تولدت ثبت شد: ۱۷ اسفند ۱۳۸۸ — سن هر بار از همین تاریخ حساب می‌شود»; the card does not come back (s3, s4 NOCARD).
- [PASS] routing 1/1.

## نقشهٔ نیاز
Part (age card): FOR taking the date the way a person writes it, once — met. Person: needed not to be asked twice — met.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what he wrote | exact | page said | verdict |
|---|---|---|---|
| «17 Esfand 1388» | 2010-03-08 | birth=2010-03-08, «۱۷ اسفند ۱۳۸۸» | correct |

## سن
16; Latin-script Jalali accepted.

## Round-25 defects in this scenario (FIXED | STILL | CHANGED)
- round-25 aB2f (Latin Jalali): still correct.

## Routing (1/1 correct)
### aB2f routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام، یه سؤال دارم: جمعِ عددهای فرد از ۱ تا ۹۹ چند میشه؟ خود…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- none.

## ایده‌ها
- none.

## Defects (catalogue round26B/defects.md)
- none.

RESULT: PASS
