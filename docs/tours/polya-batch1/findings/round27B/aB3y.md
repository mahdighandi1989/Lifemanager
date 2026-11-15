# aB3y — بازنشسته و پس‌انداز — تبدیلِ نادرست در متنِ پاسخ (اجرای ۲) — ROUND 27 (runner B)

## خلاصه برای مالک
همان بازنشسته، ولی این بار دستیار در متنِ پاسخ خودش تاریخ را به میلادی برگرداند و یک روز اشتباه گفت («۲ مهٔ ۱۹۵۹»). صفحه تاریخِ درست (۳ مه) را ثبت کرد، ولی جملهٔ نادرستِ دستیار بی هیچ اصلاح یا خطِ صفحه جلوی او ماند.

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] stored birth 1959-05-03 (ICU), page line «✓ تاریخِ تولدتان ثبت شد: ۱۲ اردیبهشت ۱۳۳۸».
- [FAIL] p2 reply (round26B_x model reply, replayed) «۱۲ اردیبهشت ۱۳۳۸ برابر است با ۲ مهٔ ۱۹۵۹» shown unchanged: no post-check rewrite request, no page line «میلادی‌اش ۳ مهٔ ۱۹۵۹ است». B25·D17 STILL (S3).

## نقشهٔ نیاز
Parts: post-check (FOR stopping a reply that contradicts what the page stored) — unmet for dates. Person: an elder who said he does not know the Gregorian date is given a wrong one — unmet.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
No arithmetic of hers for the page to check in this run.

## سن
67; same as aB3x.

## Arms (RUNNER27 T1–T12) in this scenario
- none of T1–T12 is hosted here

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
- no prior-work opening here; no prior block fired where it should not

## Chat ⇄ page
—

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- B25·D17 / U52 (wrong Gregorian conversion in the reply stays): STILL — p2 (run 2 of 2; run 1 aB3x did not exercise it).

## Routing (2/2 correct)
### aB3y routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. من بازنشسته‌ام. ۳۰۰ میلیون تومن پس‌انداز دارم. حقوق با…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «یعنی: با این پس‌انداز و این حقوق، کِی پولم تموم میشه و چیکار…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- Post-check: any Gregorian date in a reply that names her birth must equal the stored conversion, else one rewrite.

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- B25·D17 STILL (S3, b) p2: wrong Gregorian conversion in the assistant reply not caught (page stored the right date).

RESULT: FAIL — 1 S3
