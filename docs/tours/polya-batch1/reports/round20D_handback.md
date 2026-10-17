## Round 20, runner D (s30–s38): every written criterion passes; 3 scenarios are zero-defect, 6 are not

The correction trials (s38 math, s34 life) and the calibration trial over days (s31) found five S2 defects. The page was main a94614ae (later commits are docs only), and `build.py --check` says in sync.

| Scenario | Result | Defects |
|---|---|---|
| s30 | PASS on criteria; FAIL zero-defect | 1 S3 |
| s31 | PARTIAL | time trial failed: 2 S2 + 4 S3 |
| s32 | PASS, zero-defect | none (one «ارتقای لازم») |
| s33 | PASS, zero-defect | none |
| s34 | PARTIAL | correction trial: 2 S2 + 1 S2 (c) + 3 S3 |
| s35 | PASS on criteria; FAIL zero-defect | 2 S3 |
| s36 | PASS, zero-defect | none |
| s37 | PASS on criteria; FAIL zero-defect | 1 S3 |
| s38 | PARTIAL | correction trial: 3 S2 + 4 S3 |

### Defects
1. **S2 b — a correction withdraws every mind-card event of the corrected message and books nothing for the corrected text** (a27_tour.js ~3452).
   - s38: after the ✏️ edit, her self-found slicing plan is gone. The mind card ends with «طرح‌ریزی ۰ از ۴».
   - s34: the ✏️ edit removed her done-step success, so «اجرا» is again the likeliest weak stage (74%). The day-1 «گیر» event was withdrawn by a correction about a number.
2. **S2 b — correcting the look-back lesson does not change it, but the check verdict is downgraded** (s38, u9).
   - b[1].use stays «دو تکهٔ هم‌اندازه».
   - The verdict goes verified → unverified (chkSup), although the check message (b=a ⇒ a³/6) was not corrected.
3. **S2 b — a deadline created from her message is not reversible** (s38, u10 «۱۰ صبحه نه ۸»).
   - The retract is accepted ok with changes=[], and no «✓ اصلاح شد» line appears.
   - The reminder stays at 08:00, while the model (per the prompt's «صفحه همه را برمی‌گرداند») told her it was fixed.
4. **S2 b — correcting a datum of the first message changes only the chat statement** (s34; a27_tour.js:3432–3435).
   - The live problem's statement, which the assistant filled into the form from that message, and the dossier still read «سه ماهه».
   - The sys line says «✓ اصلاح شد».
5. **S2 c — dossier shows «بازگشت: [object Object]»** (s34; a40_dossier.js:76, L.incub.back is an object).
6. **S2 b — the dossier is incomplete.**
   - s38 (chat-closed problem): her derivation, the ✏️ edit and the bestQ are missing. The verdict reads «وارسی نشد» next to «نتیجه سالم ماند» with no «اصلاح شد ⇐». The understanding form cites the wrong message (u6 instead of u1).
   - s34: plans, corrections, the metro idea and the day-30 mid-course check-in are missing.
   - s35: chat plans are missing.
   - s32: a session with no live problem has no dossier at all.
7. **S2 b — the T24 calibration practice case drops out of Today** (s31; a41_practice.js:452, 705, 726).
   - Predictions stay a draft until «ثبت نهایی», which demands reflections that only make sense after outcomes. So the fcasts are created on the outcome day (D+5), dated after the result.
   - The case has no due after session 1: «در حالِ تثبیت · موعدی ندارد». It never returns to Today (checked D+6, D+8, D+21, D+30), even though the "3 separate days" criterion is still open.
8. **S3 b — calibration side issues** (s31).
   - From D+1, Today shows «جلسهٔ نخست … عقب‌افتاده» although she wrote her predictions.
   - The prediction due dates never reach Today.
   - The mind card's «🏋» row reads «— (اندازه‌ای نیست)», «+۰ −۰» despite 3 resolved predictions.
   - The worksheet shows «موضوع: بدون موضوع» for a case on a live problem.
   - The row-0 statement field id is «ex_preds» (the others are «ex_preds_N_st»).
9. **S3 b — the ✏️ turn is treated as a fresh user turn.**
   - The fallback block «# اصلاحِ پیامِ پیشین (شاید)» asks for a second retract (a27_tour.js:3511).
   - That turn's coach_state booked «اجرا +» with the «[اصلاحِ پیامِ قبلی]» quote.
   - A ✏️ edit books no self-correction look-back event; chat corrections do.
   - The next turn says «هیچ رکوردی ثبت نشده بود — نگو که چیزی را عوض کردی» (a27_tour.js:3505), contradicting the previous turn.
10. **S3 b — display problems in corrections.**
    - The plan text becomes «پس‌فردا صبح صبح ۲۰ دقیقه».
    - The sys line shows «pl1» and Latin ISO dates to the user.
    - frag/fix drop parentheses («۲ × ۱/۳ × ab/2 × a»).
    - The fallback candidates use the raw id «lpNewS» and placeholder text as labels, and miss the look-back lesson.
11. **S3 b — Today has two lines for one act** (s34 day 2): «📌 pl1» and «🌱».
12. **S3 b — R19 D·9 persists in s35.** A plan that later became a live step with an outcome still gets «انجام شد؟» in chat and in Today. The link is made only when the plan is spoken.
13. **S3 b — R19 D·4 only partly fixed.**
    - s31: «… بعدی؟» after closure still gets the «فهمِ مسئله» header with «مجهول … چیست؟». No problem is created now.
    - s38: post-closure headers don't match their lists («اجرای طرح» with a look-back suggestion; «طرح‌ریزی» for a lesson message).
14. **S3 b — a39 run boundary** (s37): «y=۲ (۳۵۲)» becomes one formula and renders «y = ۲(۳۵۲)».
15. **S3 b — dossier vs mind card disagree** (s30): the dossier shows «اجرا −» under a step outcome the mind card counts as «+».

Not a defect (class d): in s35, step 2 carries step 1's outcome because my c14 script re-sent the outcome after the gate.

### Correction-trial verdicts
- **Worked:**
  - s34 plan date, chat, 1 turn later: the due moved to 2026-10-19, Today was silent on day 1 and showed the plan on day 2, the 🌱 reminder moved, and history was kept.
  - Bubble edits keep «اصلاح شد ⇐» history.
  - Negatives changed nothing and raised no fallback: «اشتباه کردم که دیر/سه ماه صبر کردم», and quotes of a teacher or professor.
- **Partial or failed:**
  - s38 ✏️ on the derivation step, 1 turn later: the bubble and ansLog were fixed, but the mind events were wrongly withdrawn.
  - s38 lesson correction, chat, 3 turns later: wrong record changed.
  - s38 deadline correction, chat, 9 turns later: nothing changed while the assistant claimed it had.
  - s34 ✏️ on the step outcome, 3 turns later: the execution success was lost.
  - s34 fact correction, chat, 8 turns later: only the chat statement changed, not the problem form or the dossier.

### Fixed since round 19
- s30 guess kit, now prefilled «از گفت‌وگو».
- The s37 formula tokenizer, except item 14.
- s32 and s36 false «deferred request» lines.
- s31 q-split and the ≈ / · / ln notation.
- s33 black spot from a single correct prediction.
- Plan ids now shown in the prompt.
- Formulas in step lists and dossiers.

### «ارتقای لازم»
- Corrections applied per part of a message: each record knows which sentence it came from, and the corrected text is booked again.
- Deadlines, cards, the look-back lesson and page forms filled from chat become reversible.
- The assistant does not claim a correction until the page has reported what it changed.
- The T24 worksheet is two-stage: each row becomes a dated 🎯 when written, its due goes to Today, and reflections come after the outcomes.
- Calibration cases get their next turn from the open criterion.
- One record and one Today line per act (plan ⇄ 🌱 ⇄ live step), with a one-click "same plan?" link when a step is created.
- Dossiers for chat-closed problems and for sessions without a problem, including chat plans, corrections, set-aside/return and check-ins.
- The problem page should itself suggest a practice case at look-back time.

### PARTS.md
`/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20D/PARTS.md` has 15 parts on five axes.
- **Unique and working:** assistant, 🔭 tunnel (understanding/guess kit, plan/steps/gates, look-back), formula tool, 🌱 card, factory, mini plot.
- **New and incomplete:** ✏️ correction, 📜 dossier, 🧪 practice case + T24, the mind card's «🏋» row, and Today/scheduler (duplicate lines, uncorrected deadline, calibration case without a due date).
- **Overlap:** «📌 برنامهٔ خودت» and «🌱» record the same act.
- **No evidence:** 🗺 maps and the running lists — no scenario in this group entered them.
- Part shots are `out/part_*.png` in each scenario folder.

### Other checks
- **Scans:** struct 0, strict 0 (live list excluded as in the test), no developer notes in prompts, no misaligned replay.
- **coach_state:** omitted in at least one turn per scenario.
- **Time:** s34 (days 0–30) and s31 (D0 to D+30) used the in-page Date patch, which is equivalent to page.clock because A.now reads Date. Records made by the patched clock carry no simClock tag, but all data lives in this runner's own test profiles.

### Housekeeping
All 9 scenarios have `findings.md` and `DONE`. Nine e-mails were sent with the RUNNER16 structure, subject «🧭 پولیا · دورِ ۲۰ · …», and the group-D storyboard link. My profiles and base copies are deleted, none of my processes is running, and I did not touch other runners.

Everything is in `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20D/`: `<sid>/findings.md`, `<sid>/out/`, `<sid>.plan.json` and `<sid>.ovr/` for the replies I wrote. The new tools are `tools/drive20.py`, `rec.js`, `shot.js`, `ev.sh` and `mindtxt.sh`.