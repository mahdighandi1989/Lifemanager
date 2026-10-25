## Pólya round 25, group A (runner A): done
**Build:** main 64dc0667, and `build.py --check` was in sync.
**Repo:** I did not edit it. `git status` is clean, and HEAD is e1bca7f1, the round-25 launch commit.
**Browser profiles:** only my own were removed; no other runner's process was touched.

All outputs are under /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A/:
- `<sid>/` contains findings.md (with خلاصه برای مالک, نقشهٔ نیاز, ارتقای لازم, ایده‌ها), RESULT.txt, DONE, mail.html, mail.subject.txt, route_table.md and the ai/ folders (kept).
- `defects.md` and `PARTS.md` (with «نسبت به دورِ ۲۴»).
- `notes.md`.
- better replies in `pwA1/better/` (r1, r5, r10), `pwA2/better/` (r3), `s03/better/` (r3, r4) and `pA1/better/` (r2, r3).
- `tA1_build/learning-architecture.html` is the scratch page used for the territory test.

The link line «دورِ ۲۵ A» was added to tour1_polya/STORYBOARD_LINKS.md.

**E-mails:** all 21 were sent this round to the owner's address. The subject is «🧭 پولیا · دورِ ۲۵ · <sid> · … · ⚠️» and each mail carries storyboard link A, https://claude.ai/artifact/91WEMispzw9gyGiD4L1n4c.

### RESULT per scenario
21 scenarios (19 re-runs plus pwA1 and pwA2). All are FAIL. There is no S1 defect anywhere.

| sid | RESULT |
|---|---|
| s01 | FAIL (A25-5 S3; the rest is FIXED) |
| s02 | FAIL (A25-9 S2; A25-5, A25-20 S3) |
| s03 | FAIL (A25-2 S2, A25-9 S2; A23-26 S3) |
| s04 | FAIL (A25-9 S2; A23-6, A25-5 S3) |
| s05 | FAIL (A22-11, A21-11 S3) |
| s06 | FAIL (A23-25 S3) |
| s07 | FAIL (A25-9, A23-24, A25-5 S3) |
| s08 | FAIL (A25-5 S3) |
| s09 | FAIL (A25-21, A25-5 S3) |
| s10 | FAIL (A23-35 S2; A23-8 S3) |
| pA1 | FAIL (A25-4 S2; A23-14 S3) |
| pA2 | FAIL (A23-8, A25-5 S3) |
| pA3 | FAIL (A23-8, A25-5 S3) |
| aA1 | FAIL (A23-19, A25-5, A25-20 S3) |
| aA2 | FAIL (A23-10, A25-5 S3) |
| aA3 | FAIL (A23-14, A25-5 S3) |
| aA4 | FAIL (A25-7, A25-8, A23-35 S2; A23-14, A24-10 S3) |
| tA1 | FAIL (A25-17, A24-14, A25-19, A25-22, A25-5 S3) |
| oA1 | FAIL (A25-14, A25-16 S2; A23-32, A25-15, A25-17 S3) |
| pwA1 | FAIL (A25-1, A25-3, A25-6, A25-7, A25-10 S2; A25-11, A25-12-b, A23-8 S3) |
| pwA2 | FAIL (A25-1, A25-2, A25-3, A25-6, A25-12 S2; A25-8-b, A25-13 S3) |

### New defects (class b = the page), with turns
**S2**
- **A25-1:** when someone opens with their prior work, the page's question is "the whole in one sentence" or "how do you test it", not the resume point. The prior block says the opposite in the same prompt. Seen at pwA1 p1 and pwA2 p1.
- **A25-2:** the resume question stays after she fixes or concedes the step, and the stage jumps to «اجرا». Seen at s03 p3–4, pwA2 p2 and aA4 p6.
- **A25-3:** a new prior report replaces the whole ledger instead of merging into it.
  - pwA1 p4→p5: six steps became "1 step, resume from step 1".
  - pwA2 p2→p3: the ledger became "all correct" and moved to review while step 4 was still wrong.
- **A25-4:** tested cases become an all-✓ prior ledger. The stale question «همهٔ گام‌های پیشینت درست درآمد — گامِ بعدی؟» is asked 8 times while she is stuck (pA1 p2–p9).
- **A25-6:** the mind card records nothing from prior work — no credit for correct steps, no cause for wrong ones (pwA1, pwA2).
- **A25-7:** dispute handling.
  - pwA1 p4: the guess rule muzzles the re-check, and the re-check result never lands on the page.
  - aA4 p7–p10: «نه، بس نیست!» is read as a dispute, so the page asks four times "why did you reject the verdict?".
- **A25-8:** the arithmetic check reads «۲ و خرده‌ای، یعنی ۲٫۵۷» as «۲» and marks the step ✗ (aA4 p6).
- **A25-9:** bogus "stale numbers after a correction" cards.
  - s02: «۰٫۵ ⇒ ۴۶٫۸۷۵».
  - s04 p7: a list index «۲ ⇒ ۲٫۷۵».
  - s03 p9: the distance bound «۱ ⇒ ۰».
  - s07 p8: raw data 4 and 13 (S3).
- **A25-10:** a proof that follows a test is classified as a guess (pwA1 p9–p10).
- **A25-12:** the child's own attempt and «پس ۲ روز» are imported as «داده», while the real data is missing (pwA2).
- **A25-14:** one prediction gets two 🎯. Judging it through practice_log creates a new 🎯, the original still asks in Today, and the 70% prediction already judged is still due (oA1 p24).
- **A25-16:** the new job decision inherits the earlier problem's stage, «اجرا», and card e4 before any action (oA1 p6–p18).

**S3**
- **A25-5:** the prior-request block fires on mid-conversation turns. Seen at s02 p7, s04 p4, s08 p4, pA2 p3, pA3 p3, aA1 p5, aA2 p3, aA3 p3, aA4 p5, tA1 p5–6 and pwA2 p2.
- **A25-8-b:** decimal framing «۲٫۸» for a child's remainder (pwA2 p1).
- **A25-11:** «n!» is shown as «!n» (pwA1).
- **A25-12-b:** the whole-first draft is cut off at «n!» and «حکم» is left empty (pwA1).
- **A25-13:** the destination is «درسته؟» and «حل به نتیجه رسید» appears before the solve (pwA2).
- **A25-15:** a «تا جمعه» due date is set to the day it was written (oA1).
- **A25-17:** post-check false positives — a hypothetical «می‌گویی «…»» (tA1 p9) and a plural «دارید» read as «شما» (oA1 p25).
- **A25-19:** one prompt says both «فهم» and «اجرا» (tA1 p13).
- **A25-20:** the prior block does not follow a correction or closure (s02 p9, aA1).
- **A25-21:** the deadline-correction "why" is the old value (s09 p17).
- **A25-22:** a sub-problem brought after closure gets sheet #103 but no waiting entry, so the "unclear ⇒ ask her" arm could not be exercised (tA1 p18).
- **pwA1 p8:** an already-answered check question is repeated.

**d (my own runner errors)**
- pwA1: I clicked the wrong ✗ button (step 6 instead of step 4) because the buttons re-index after each click; I then corrected it.
- pwA1 p10: bash ate `$a_i` and garbled the formula.
- Replayed round-24 complaints that no longer held:
  - tA1 c27: replaced with an override before it was sent.
  - tA1 c34 and s01 p10 / oA1 p12: already sent, and answered honestly.

### ارتقای لازم (priority order)
1. The prior-work contract:
   - (a) On a prior-work opening, the turn question must be the resume point.
   - (b) The resume question must give way once she fixes or concedes the step.
   - (c) A new report must merge into the ledger, not replace it.
   - (d) Tested cases are not a prior ledger.
   - (e) Only fire the prior request on the opening long message.
   - (f) Book credit for correct prior steps and a cause for wrong ones in the mind card.
   - (g) A rejected verdict means a re-check, not the guess rule, and the re-check result must land on the page.
2. The arithmetic check must parse «۲ و خرده‌ای، یعنی ۲٫۵۷».
3. Stale-number card: only show numbers that were actually derived from the corrected value.
4. «tested + proof ⇒ proof question».
5. Imports from chat: attempts are not data.
6. One prediction, one 🎯; a judged prediction leaves Today; «تا جمعه» means the next Friday.
7. A new problem starts from its own stage.
8. Smaller items: the post-check pronoun and quote heuristics, a waiting entry for a sub-problem after closure, and wrapping «n!» in bdi.

### Round-24 defect table
- **FIXED:**
  - A24-1 (s02 p6), A24-2 (s08 p3), A24-3 (s02), A24-4 (tA1 negative arm), A24-5 (tA1 positive arm, best fit).
  - A24-6 (oA1), A24-8 (s01 p7), A24-9 (s03 p13, s04 p7, s07 p8), A24-13 (aA4, pwA2), A24-15 (tA1 📜), A24-16 (pwA1 p14, oA1 p9/p11), A24-20 (aA2).
  - A23-20 (s01 p5, s02 p4/p6), A22-17 (s07), A23-7-b (aA1), A23-15-b (aA4 p8), pA1-stack (p6).
  - oA1 p7 "why" (now quotes his own words).
- **CHANGED:**
  - A24-7: the rejected attempt is no longer data in aA3, but pwA2 shows A25-12.
  - A24-10: the age in words now parses, but the introduction is still in the title (aA4).
  - A24-14: tA1 p13 still reads a step-level «حل کردم» as problem-level.
  - A24-18: pwA1 ticks come from the chat.
  - A23-35: fixed in s03, s09, tA1 and oA1; still in s10 p5 and aA4 p5.
  - A23-32: one foreign point remains (oA1).
  - A23-24: s07 p7 has two half-done lines.
- **STILL:**
  - A23-6 (s04 p9), A23-8 (s10, pA2, pA3, aA2, aA3, pwA1), A23-10 (aA2 p5).
  - A23-14 (aA3; aA4 p1/p7; pA1 «شما» to a teen), A23-19 (aA1 p1), A23-25 (s06), A23-26 (bundle).
  - A22-11 (s05 p6), A21-11 (s05), tA1 p5.

### Territory loop (tA1, five arms)
| arm | result |
|---|---|
| positive (two new areas arrive together) | PASS. It picked sp_prior_art_search, the best fit for step «۶-ب», added a Today line and resumed. |
| mismatch (the round-24 "farm" reply) | PASS. Marked as a mismatch, and the sheet was reopened. |
| sys_done («خودم یه راه دیگه پیدا کردم») | PASS. State "other", a page line «از راهِ دیگری برداشته شد» and a note on the sheet. |
| ruled-out area (dc_risk_uncertainty) | PASS. Treated as a mismatch, a note under the sheet, and the sheet was reopened. |
| generic words only | PASS. «چیزی برای این گام نساخت». |

The extra checks:
- Best fit wins when two areas arrive: PASS.
- The page asks her when the fit is unclear: not exercisable (A25-22).
- A sheet about the system itself never marks a step as waiting: PASS (oA1, sheet #103).

### Prior-work verdict table
| sid | verdict |
|---|---|
| pwA1 | Steps 1 and 2 ✓ (she confirmed them), step 3 ⚠️ incomplete (≤ n), step 4 ✗ circular. Resume point was step 3, correct. She disputed step 4; the re-check was honest but never landed on the page (A25-7). The ledger collapsed to one step (A25-3). Step 3 she made strict herself. The later proof was read as a guess (A25-10). |
| pwA2 | Step 1 ✓ (24). Step 2 ✗ — the page's arithmetic check caught 12+24≠34 without leaking the answer. Step 3 ✓ but dependent. Step 4 ✗, the dropped remainder, with decimal framing (A25-8-b). After the fix: «همه درست» while step 4 was still wrong (A25-3). He reached «۳ روز» himself. |
| s03, s07, s09, oA1 | Correct verdicts in the right place. s03's resume question persisted (A25-2), and oA1's verdict pushed the job decision's stage forward (A25-16). |
| s02, s04, s08, pA2, pA3, aA1, aA2, aA4, tA1 | The request fired mid-conversation (A25-5). The verdicts themselves were correct, except aA4, where «۲٫۵۷» was wrongly marked ✗ (A25-8). |
| pA1 | Tested cases became «همه درست» (A25-4). |
| aA3 | Correct, addressed with «شما». |
| s01, s05, s06, s10 | No prior block. |

### Chat ⇄ page
**Agree:**
- Corrections land everywhere: s02 unit, s07 form row, s05, s09, s10, oA1.
- Prerequisite return (pA1–pA3, aA1).
- Territory lines (tA1).
- Practice T24 (oA1).

**Disagree:**
- pwA1: the model re-checked but the page still says "rejected — will be re-checked".
- aA4: the model says "you saw it yourself"; the page says "you rejected the verdict".
- pwA2 / pA1: the model asks the next step; the page says «همه درست».
- oA1: the model judged the prediction; the page asks again in Today.

### Owner bank (group A)
| # | answer | evidence |
|---|---|---|
| 1 | Exists | oA1 p6–7 |
| 2 | Exists | oA1 p8–9 |
| 3 | Exists | oA1 p12–14 |
| 4 | Missing — sheet filed, no waiting mark | oA1 p15–16 |
| 5 | Exists — practice T24, but two 🎯 | oA1 p21–24 |
| 6 | Missing — one browser holds one profile; sheet #103 | oA1 p25–27 |
| 7 | Exists | pwA1 p7 |
| 8 | Exists — route map | pwA1 p13, oA1 p10 |

### Routing
243 of 243 turns went to the correct task (lla_coach / lla_assistant / learning_architecture). The table is in `<sid>/route_table.md`.

### ONE STORY in ≥3 scenarios
Met in aA1, aA3 and aA4 (chat import ✓), in pwA1 (the prior card shows in the form, route map and dossier) and in tA1. pwA2 broke it with A25-12.

### Corrections, age/register, post-check, Today/dossier
- **Ages:** every stored date matches ICU, including pwA2's 10 Mehr 1397 = 2018-10-02. The age in words parses.
- **Register:** gaps remain (A23-14).
- **Post-check:** correct on my own two-question reply (pwA1 p2); two false positives (A25-17).
- **Today:** one line per task, except the double 🎯.
- **Dossier:** the tA1 waiting step and its outcome are named.

### PARTS.md: «نسبت به دورِ ۲۴»
- **Better:** the stuck ladder (s02, s08), the territory loop (much better), the dossier, the correction engine (unit, form row, why), sheets (no false waiting), and ages.
- **New but incomplete:**
  - «کارِ پیشینِ تو»: verdicts are correct, but there are seven S2 contract gaps.
  - The stale-number card.
- **Worse:** a prediction is counted in two 🎯.
- **Same:** understand/stage (A23-35 changed), the post-check (in a new form), the mind card, and the route map.

### New owner-like questions
- «اگه یکی از حکم‌های تو رو رد کنم، کجا می‌بینم که دوباره سنجیدی و چی شد؟» (now: in chat only)
- «وقتی بچه‌ام کارش رو نوشته، صفحه بهش می‌گه کدوم گامش درست بود؟» (yes, though the mind card records nothing)
- «تکه‌ای که بعد از بستنِ مسئله آوردم کجا منتظر می‌مونه؟» (nowhere — A25-22)
- «اگه یه پیش‌بینی رو دو جا داوری کنم، کالیبراسیونم دو بار می‌شمره؟» (yes — A25-14)
- «وقتی برگه جواب گرفت ولی به کارم نمی‌اومد، کجا می‌بینم چرا؟» (chat line and sheet note; not in Today)

### Token and time use
About 0.9M tokens of context were used this session, across several compactions. Wall time isn't visible to me.