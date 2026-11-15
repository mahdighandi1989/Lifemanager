# aB3x — بازنشسته و پس‌انداز — تاریخِ تولد در گفت‌وگو (اجرای ۱) — ROUND 27 (runner B)

## خلاصه برای مالک
بازنشستهٔ ۶۷ ساله کارتِ تولد را «بعداً» زد و تاریخش را در گفت‌وگو گفت «۱۲ اردیبهشت ۱۳۳۸، میلادیش رو بلد نیستم». صفحه درست ثبت کرد (۳ مهٔ ۱۹۵۹) و یک خطِ «شما» داد؛ این دور برگه‌های ثابتِ صفحه هم برای او «شما» شد. در این اجرا پاسخِ دستیار تبدیل را به صفحه واگذاشت، پس بازوی «تبدیلِ نادرست در متنِ پاسخ» این‌جا آزموده نشد (در aB3y آزموده شد).

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1 whole-first in «شما»; no decision made for him.
- [PASS] c2 card typed «1337/12/31» ⇒ «اسفند ۳۰ روز دارد — روز را دوباره ببین» (1337 is a leap year: 30 days, message exact).
- [PASS] p2 birth sentence saved by the page: «✓ تاریخِ تولدتان ثبت شد: ۱۲ اردیبهشت ۱۳۳۸»; stored 1959-05-03 = ICU conversion; «# مخاطب» ۶۷ ساله.
- [PASS] post.txt static strings now in «شما» («↩ برگردید», «جمع کنید», «ببینید و بدانید») — round 26 «تو» (U37 family).
- [PASS] strip destination = his goal sentence, not «خواستهٔ مسئله».

## نقشهٔ نیاز
Parts: birth parser (FOR an exact age from his own words) — met; register (FOR «شما» to an elder everywhere) — met. Person: needed not to convert dates himself — met.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
No arithmetic of hers for the page to check in this run.

## سن
67; Jalali in chat; invalid day on the card checked; register «شما» in chat and static strings.

## Arms (RUNNER27 T1–T12) in this scenario
- (no T-arm hosted)

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
- no prior-work opening here; no prior block fired where it should not

## Chat ⇄ page
—

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- U37 (static «امروز»/page lines in «تو» for a «شما» elder): FIXED here (post.txt strings «برگردید/ببینید»).
- B25·D17 / U52 (wrong Gregorian text in the reply left standing): NOT EXERCISED in this run (reply left conversion to the page); see aB3y = STILL.

## Routing (2/2 correct)
### aB3x routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. من بازنشسته‌ام. ۳۰۰ میلیون تومن پس‌انداز دارم. حقوق با…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «یعنی: با این پس‌انداز و این حقوق، کِی پولم تموم میشه و چیکار…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- (none beyond defect fixes)

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- (none observed in this run)

RESULT: PASS
