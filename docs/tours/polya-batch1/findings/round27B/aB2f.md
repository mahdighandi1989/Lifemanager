# aB2f — نوجوانی که جمعِ فردها را خودش می‌خواهد حل کند — ROUND 27 (runner B)

## خلاصه برای مالک
نوجوانِ ۱۶ ساله پرسید جمعِ عددهای فرد از ۱ تا ۹۹ چند می‌شود و گفت «خودم می‌خوام حلش کنم». سامانه جواب را نگفت، فقط پرسشِ «کل را در یک جمله» داد و تاریخِ تولدش را از کارت درست ثبت کرد. صفحه در برگه‌های ثابتش «تو» نوشت که با سنِ او جور است.

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [PASS] p1 no answer given («خودم می‌خوام حلش کنم» respected); one question (A191 whole-first); u1 marked «در گفت‌وگو پاسخ گرفته» (her question names the unknown).
- [PASS] birth card: «۱۷ اسفند ۱۳۸۸» stored, one confirming line «✓ تاریخِ تولدت ثبت شد»; teen ⇒ «تو».
- [PASS] no arithmetic of hers yet (outside the reader), no prior block (T12 negative).

## نقشهٔ نیاز
Parts: coach (FOR not stealing the solve) — met; birth card (FOR age band) — met. Person: a teen who wants to solve it himself needed one entry question, not the sum — met.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
No arithmetic of hers for the page to check in this run.

## سن
16; Jalali «۱۷ اسفند ۱۳۸۸» stored; register «تو» (teen, no «شما» used by him).

## Arms (RUNNER27 T1–T12) in this scenario
- none of T1–T12 is hosted here

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
- no prior-work opening here; no prior block fired where it should not

## Chat ⇄ page
—

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- (none in round 26; PASS kept)

## Routing (1/1 correct)
### aB2f routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام، یه سؤال دارم: جمعِ عددهای فرد از ۱ تا ۹۹ چند میشه؟ خود…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- (none beyond defect fixes)

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- (none)

RESULT: PASS
