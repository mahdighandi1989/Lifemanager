# aB1 — آوا، ۹ ساله، و اتوبوس‌های اردو (سن: کودک) — ROUND 26 (runner B)

## خلاصه برای مالک
آوای ۹ ساله نوشته بود «۴ اتوبوس» و معلم گفته بود غلط است. با زبانِ ساده و گام‌های کوچک خودش باقی‌مانده را پیدا کرد (۱۰ بچه)، فهمید یک اتوبوسِ دیگر لازم است، با ۴۲×۵=۲۱۰ وارسی کرد و درسش را به قلمِ خودش نوشت. کارتِ تولد روزِ ناممکن («۳۱ مهر») را با پیامِ انسانی رد کرد و «96/2/30» را درست خواند؛ نامِ مدرسه در پرونده پنهان شد و کارنامه برای این سن صادقانه گفت هنجار ندارد. تنها ایرادِ ریز: وقتی تاریخِ تولد را دوباره در گفت‌وگو گفت، صفحه هیچ خطی ننوشت.

## Run setup (common, runner B round 26)
Page main 1f93c333 (round-25 fixes; `build.py --check` in sync). Harness round26B/tools/harness26bm.js (harness5 + page URL from env for the territory scratch pages; own browser profile per scenario dir, PIDs in round26B/pids.txt). Driver tools/drv26bm.py replays round25B/<sid>/ctl; replies: round-25 replies rebuilt from docs/tours/dataset (s11–s20, bp1–bp3) are reused when HER turn text matches; every other reply (all of aB*, tB*, oB1, pwB*, and every new round-26 turn) was written this round as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv). Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Strict prompt scan (tools/strict.py): see below. Defect ids: round26B/defects.md (B26·Dn), round25B/defects.md (B25·Dn).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] s2 card «۳۱ مهر ۹۶» ⇒ «مهر ۳۰ روز دارد — روز را دوباره ببین» (no date stored); s3 «96/2/30» (Latin digits, two-digit year) ⇒ 2017-05-20 = ICU for ۳۰ اردیبهشت ۱۳۹۶, band child; one confirmation line, Jalali only.
- [PASS] p2–p9 «# مخاطب» block for a 9-year-old (plain words, small steps, no praise inflation, minors' safety lines); every reply written in that register; her school name is never asked for and not echoed.
- [PASS] p1 answer not given; p2 remainder asked; p3 «اون ده تا بچه کجا می‌شینن؟»; p4 check asked; p5 her check 42×5 = 210 accepted with her own slip named by herself; p6–p8 lesson, best question, taste stored (chat_solved + two chat_lookback), «بازسازی» card for tomorrow.
- [PASS] opening «من نوشتم ۴ … گفت غلطه» is a result, not a worked step — no prior ledger; p2/p3 mid-session computations fire no ledger.
- [PASS] post.txt 📜 shows «مدرسه‌ی ما اسمش [نامِ مدرسه]، کلاس سوم» (school name and class letter masked); mind card «برای این سن هنجارِ معتبر در دست نیست — معمایی پیشنهاد نمی‌شود», no puzzle line, no IQ.
- [PASS] s14 Today next day: one review card + «📌 برنامهٔ خودت: «دفعه‌ی بعد آخرش ضرب می‌کنم…»» (dateless self-commitment), one line each.
- [FAIL] p9 «من ۳۰ اردیبهشت ۹۶ به دنیا اومدم» (same date as the card) ⇒ `birth` action sent, the reply says the page will tell her, the page shows no line (B26·D16, S3).
- [PASS] routing 9/9.

## نقشهٔ نیاز
Parts: birth card (FOR an exact date typed the Iranian way, with a human error line) — met; audience block (FOR age-fit wording, same logic) — met; assistant — met; closure — met; privacy filter — met; mind card (FOR honesty about norms) — met; birth action (FOR telling her what happened) — silent on a repeat (D16). Person (9): needed to find herself why 4 is wrong, in her own words, without feeling wrong — met; verified answer 5.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| p3 «۴۲ ضربدر ۴ میشه ۱۶۸، ۱۷۸ منهای ۱۶۸ میشه ۱۰» | 168; 10 | no block (operators in words) | unread, harmless |
| p5 «۴۲ ضربدر ۵ … ۲۱۰! ۲۱۰ از ۱۷۸ بیشتره» | 210 > 178 | no block | unread, harmless |

## سن
9 (child 6–11). Birth: invalid day refused with the month's length; two-digit year + Latin digits accepted; stored date = ICU; one Jalali confirmation, never ISO. Tone: short sentences, concrete, «تو», no childish flattery. Safety: school not requested, masked in 📜. Mind card: honest no-norm line. Pólya logic unchanged (unknown → remainder → check → look-back).

## Round-25 defects in this scenario (FIXED | STILL | CHANGED)
- (round 25 PASS.) B24·D1 / D6 stay fixed; the school-name mask stays.

## Routing (9/9 correct)
### aB1 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. من آوام. معلممون یه مسئله داده: «یه اتوبوس ۴۲ تا صندلی…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «اینکه چند تا اتوبوس لازمه که همه‌ی بچه‌ها سوار شن. من ۱۷۸ رو…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «۱۰ تا! ۴۲ ضربدر ۴ میشه ۱۶۸، ۱۷۸ منهای ۱۶۸ میشه ۱۰. خب اون ده…» | lla_coach | lla_coach | ✓ |
| p4 | coaching (problem talk) | «هیچ جا! پس یه اتوبوس دیگه لازمه. ۵ تا اتوبوس! ولی اتوبوس پنج…» | lla_coach | lla_coach | ✓ |
| p5 | coaching (problem talk) | «۴۲ ضربدر ۵ … ۲۱۰! ۲۱۰ از ۱۷۸ بیشتره، پس همه جا میشن. پس جواب…» | lla_coach | lla_coach | ✓ |
| p6 | coaching (problem talk) | «یاد گرفتم وقتی تقسیم می‌کنم و یه چیزی باقی می‌مونه، اون باقی…» | lla_coach | lla_coach | ✓ |
| p7 | coaching (problem talk) | «اونجا که پرسیدی اون ده تا بچه کجا می‌شینن!…» | lla_coach | lla_coach | ✓ |
| p8 | coaching (problem talk) | «دوست داشتم که خودم فهمیدم! ضربدر ۴۲ سخت بود، با انگشتام نمی‌…» | lla_coach | lla_coach | ✓ |
| p9 | coaching (problem talk) | «مامانم گفت اینم بگم: من ۳۰ اردیبهشت ۹۶ به دنیا اومدم.…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- For a child, show the remainder as a picture (rows of seats) when she writes a division with «باقی موند».

## ایده‌ها
- (none new)

## Defects (catalogue round26B/defects.md)
- B26·D16 (S3, b) p9 repeated birth statement gets no page line.

RESULT: FAIL — 1 S3
