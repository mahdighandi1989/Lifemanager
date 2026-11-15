# pwB3 — قابِ عکس — آغاز با یک گامِ حل‌شده (بازوی T12) — ROUND 27 (runner B)

## خلاصه برای مالک
مادری برای قابِ عکسِ دخترش ۳۶ سانت چوب دارد و طول باید دو برابرِ عرض باشد؛ از همان پیامِ اول گفت «گامِ اول رو خودم رفتم: طول + عرض = ۱۸». صفحه این گامِ خودش را «کارِ پیشین» نشناخت و مربی دوباره «کل را در یک جمله بگو» پرسید. بعد خودش به عرض ۶ و طول ۱۲ رسید و وارسی کرد؛ حسابِ وارسی درست خوانده شد، ولی نوار و مرحله تا آخر «فهمِ مسئله» ماند.

## Run setup (common, runner B round 27)
Page main 253b357a (round-26 fixes; `build.py --check` in sync, dist rebuilt 15:13 after the merge). Harness round27B/tools/harness26bm.js (harness5 + page URL from env for territory scratch pages; own browser profile per scenario dir, every PID in round27B/pids.txt; no remote port used). Driver tools/drv27.py replays round26B/<sid>/ctl and reuses the round-26 model replies (round26B/<sid>/ai, then round26B_x/<sid>/ai) when HER turn text matches; every turn whose prompt asked for something new, every page rewrite request and every added round-27 turn was answered fresh as the literal average model from the prompt alone (drv.log «manual akey»). Clock: the page's own Date shift (inject.js __adv), scenario calendar identical to round 26. Turn ids pN = ai/pN.json (kept), sN = out/sN.json/.png. After exit tools/post21.js shot part_*.png and wrote post.txt. Defect ids: round27B/defects.md (B27·Dn), round26B/defects.md (B26·Dn), COMPARE26_judge.md (Un).

## Criteria (p<N> = ai/pN.json, s<N> = out/s<N>)
- [FAIL] p1 T12 positive half (C7): an opening with ONE worked step («گامِ اول رو خودم رفتم: نصفِ محیط میشه طول + عرض = ۱۸ سانت») fires no «# کارِ پیشینِ تو» block; turn question is the generic whole-first. Round 26 B_x pwB1o fired on a numeric step («E = 2000 × 9.81 × 15 = 294300»); a step written as a relation is not recognised. New B27·D3 (S3).
- [PASS] p2 T12 negative half: the mid-session calculation «۳ × عرض = ۱۸، یعنی عرض = ۶» opens no prior block; equation with an unknown gets no arithmetic verdict (look-alike, correct).
- [PASS] p3 «۲ × (۱۲ + ۶) = ۳۶» ⇒ «✓ … می‌خواند» (exact 36).
- [FAIL] p2–p3 / post strip: after her result (booked in 📜 «نتیجه (از گفت‌وگو)») and her own check, the prompt stage and the strip stay «فهمِ مسئله»; the page's suggestion at p3 is still «چه داری — دانسته‌ها …» (u2) after she solved and verified. New B27·D2 (S3).

## نقشهٔ نیاز
Parts: prior-work reader (FOR crediting what she already did and resuming after it) — unmet for a relation-step; story/stage (FOR the strip telling where she is) — unmet (stuck at understanding). Person: wanted her first step acknowledged and the next step — she got a generic first question; reached a verified answer by herself.

## پیش‌نیاز
No prerequisite gap of hers in this run; no stuck was attributed to a knot or ability.

## آزمودنِ اصلاح
No new correction trial here (round-25 trials, where present, replayed — see criteria).

## حسابِ صفحه (arithmetic table: what she wrote · exact value · what the page said · verdict)
| what she wrote | exact | page said | verdict |
|---|---|---|---|
| «طول + عرض = ۱۸» | relation with unknowns | silent | ✓ correct (look-alike) |
| «۳ × عرض = ۱۸، یعنی عرض = ۶» | equation with unknown | silent | ✓ correct |
| «۲ × (۱۲ + ۶) = ۳۶» | 36 | ✓ می‌خواند | ✓ |

## سن
—

## Arms (RUNNER27 T1–T12) in this scenario
- T12 positive (one worked step must fire): p1 — FAIL (B27·D3).
- T12 negative (mid-session calc must not fire): p2 — PASS.

## 📜 line match (multi-problem only)
- single problem — not applicable

## Prior work
| step | her text | page verdict | expected |
|---|---|---|---|
| 1 | «نصفِ محیط میشه طول + عرض = ۱۸ سانت» | not recognised (no ledger) | ✓ step, resume at step 2 |

## Chat ⇄ page
—

## Round-26 defects and blind-table U-ids in this scenario (FIXED | STILL | CHANGED)
- new scenario this round (C7 arm); compare round26B_x pwB1o (numeric one-step fired).

## Routing (3/3 correct)
### pwB3 routing
| turn | kind | her message | task sent | expected | correct? |
|---|---|---|---|---|---|
| p1 | coaching (problem talk) | «سلام. یه قاب عکسِ مستطیلی می‌خوام برای اتاقِ دخترم بسازم و ف…» | lla_coach | lla_coach | ✓ |
| p2 | coaching (problem talk) | «خب، طول دو برابرِ عرضه، پس ۳ × عرض = ۱۸، یعنی عرض = ۶ سانت و…» | lla_coach | lla_coach | ✓ |
| p3 | coaching (problem talk) | «وارسی کردم: ۲ × (۱۲ + ۶) = ۳۶. با چوبی که دارم جور درمیاد.…» | lla_coach | lla_coach | ✓ |

Strict prompt scan: clean (no second unmarked question directive in any prompt)

## ارتقای لازم
- Prior-work detector: «گامِ اول رو خودم رفتم» / «خودم حساب کردم» + any relation counts as one step, numeric or not.

## ایده‌ها
- (none new)

## Defects (catalogue round27B/defects.md)
- B27·D3 (S3, b, C7) p1: one worked step stated as a relation does not fire the prior-work block.
- B27·D2 (S3, b, Q6/R2) p2–p3, post strip: stage and strip stay «فهمِ مسئله» after her booked result and her own check.

RESULT: FAIL — 2 S3
