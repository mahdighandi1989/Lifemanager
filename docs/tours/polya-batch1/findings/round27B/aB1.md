# aB1 — آوا، ۹ ساله، و اتوبوس‌های اردو — ROUND 27 (runner B)

## خلاصه برای مالک
آوا (۹ ساله) جوابِ ۴ اتوبوس را نوشته بود و نمی‌دانست چرا غلط است. با پرسشِ «اون ده تا بچه کجا می‌شینن؟» خودش به ۵ رسید، با ضرب وارسی کرد، درسش را گفت و بازنگری با «پرسشی که کمک کرد» و «سلیقه» ثبت شد. این دور مرحله بعد از نتیجهٔ میانی جلوجلو «بازنگری» نشد. دو چیزِ کوچک ماند: وقتی مادرش تاریخِ تولد را دوباره گفت، صفحه هیچ نگفت؛ و حسابِ «۴۲ ضربدر ۵ … ۲۱۰» نه سنجیده شد نه «نسنجیده» گفته شد.

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1 child register («تو»), no answer given, the unknown asked; birth card «۳۰ اردیبهشت ۱۳۹۶» stored with one line.
- [PASS] p3 «۴۲ ضربدر ۴ میشه ۱۶۸» ✓ and «۱۷۸ منهای ۱۶۸ میشه ۱۰» ✓ (word operators read — round 26 «میشه» unread).
- [PASS] p3–p4 stage stays «فهمِ مسئله» after the sub-results «۱۰ تا» and «۵ تا اتوبوس» (round 26 U11 instance: «بازنگری» at p4); «بازنگری» only at p5 after her own check.
- [PASS] p6/s9 problem registered and «حل شد»; p7/s10 «پرسشی که بیشتر کمک کرد» and p8/s11 «سلیقه» booked.
- [PASS] school name stays only in her own chat text (C38); no title/label carries it.
- [FAIL] p5 «۴۲ ضربدر ۵ … ۲۱۰!» (exact 210, correct) gets no line at all — neither ✓ nor «نسنجیده» (C17). B26·D35/U26 family, S3.
- [FAIL] p9 «مامانم گفت اینم بگم: من ۳۰ اردیبهشت ۹۶ به دنیا اومدم» (already stored) ⇒ no page line; the reply says «خودِ صفحه می‌گه ثبت شد یا نه». B26·D16 STILL, S3.

## نقشهٔ نیاز
Parts: arithmetic reader (FOR telling the coach which of her numbers read) — met for «میشه», silent for «…»; birth parser (FOR one confirming line each time she gives a date) — silent on a repeat. Person: a 9-year-old needed to find the remainder's meaning herself — met.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| «۴۲ ضربدر ۴ میشه ۱۶۸» | 168 | ✓ | ✓ |
| «۱۷۸ منهای ۱۶۸ میشه ۱۰» | 10 | ✓ | ✓ |
| «۴۲ ضربدر ۵ … ۲۱۰» | 210 | silent | S3 (C17: «نسنجیده» expected) |
| «۱۷۸ رو تقسیم بر ۴۲ کردم، شد ۴ و یه چیزی باقی موند» | 4 r 10 | silent | ✓ (sentence, quotient with remainder, no claim to judge) |

## سن
9 (child band); «تو»; Jalali birth via card; repeat in chat (two-digit year «۹۶») — no line.

## Arms (RUNNER27 T1–T12) in this scenario
- none of T1–T12 is hosted here

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
- no prior-work opening here; no prior block fired where it should not

## Chat ⇄ page
—

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- B26·D16 / U48 (repeated birth date, no page line): STILL — p9.
- U11 aB1 instance (sub-result ⇒ «بازنگری» at p4): FIXED — p4 stage «فهمِ مسئله».
- B26·D35 / U26 family («میشه» unread): FIXED for «میشه» (p3); «…» separator still silent (p5).

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
- A child-sized check card: «ضرب کن ببین همه جا میشن؟» with her own numbers prefilled.

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- B26·D16 STILL (S3, b) p9.
- U26 family (S3, b, C17) p5: «۴۲ ضربدر ۵ … ۲۱۰» silent.

RESULT: FAIL — 2 S3
