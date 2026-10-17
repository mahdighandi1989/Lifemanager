## Round 20 · runner A (s01–s10): 3 of 10 pass, and correcting a weekday in a plan fails on both paths (S1)

**Result: 3 PASS (s05, s09, s10), 7 FAIL.** Every written criterion passed in all ten scenarios; the seven failures are on the zero-defect rule.

**Restart:** My first s01 and s02 runs died when the machine restarted (about 22:42). Both were re-run from scratch, not patched.

**How it ran**
- Each scenario replayed round 19's control sequence and old model replies, adding new fields only where round-20 rules required them:
  - `guess_res` in s01 p9; the page refused it because «خرید بهتره» was never a stored guess.
  - s03's replies were rewritten in «شما» because the page now demands it (that is defect A12).
- Every scenario ends with `{"exit":true}`, so the `view_post_*` shots exist. `findings.md`, `RESULT.txt` and `DONE` are written for all ten. All 10 e-mails were sent in the RUNNER16 structure with subject «🧭 پولیا · دورِ ۲۰ · …» and the group-A storyboard link.
- I used my own copy of the harness, `harness6.js`. It is harness5 plus two commands: a `shot` command (named full-page screenshots) and a `reload` command (re-injects the stubs). The test clock was moved with `APP.clock` in dev mode (`tools/clk.sh`); the «⏱ ساعتِ آزمایشی» flag showed and `check()` said ok.
- Prompt scan: 75 prompts, 0 unmarked second-question directives, 0 developer notes.
- My browser profiles are deleted and none of my processes remain.
- I did not flag records as test data: every record was made through the UI inside an isolated test profile. Flagging them (`sample`/`test`) would hide them from the mind card and the dossier, which are the parts under test.

| Scenario | Result | Defects |
|---|---|---|
| s01 | FAIL | A6 |
| s02 | FAIL | A7, A17 |
| s03 | FAIL | A12, A6, A8, A9 (S2); A4, A5, A10, A11, A16 (S3) |
| s04 | FAIL | A1 (S1); A2, A3, A6 (S2); A4, A7, A14 (S3) |
| s05 | PASS | — |
| s06 | FAIL | A13 |
| s07 | FAIL | A15 |
| s08 | FAIL | A7 |
| s09 | PASS | — |
| s10 | PASS | — |

**Round-19 defects re-checked**
- D1 fixed: «۶۷ میشه» is no longer read as a request.
- D2 partly fixed: the option order is right, but «ردش» is still split from the guess question (now A17).
- D3 and D4 fixed: plot ticks are in Persian digits, and the assistant's echo gets no duplicate plot.

### Correction trials (item 1)
**s03, math** (triangle with 10 points):
- 1 turn later, in chat (9→10): the problem statement and the chat statement changed, with «اصلاح شد ⇐» history, and the assistant said what changed. ✅
- 3 turns later, with ✏️ (plan Wednesday→Thursday): the plan and its due date moved, and on Thursday Today showed «… — اول حدس را بیازما». ✅ But the plan's mind-card event was withdrawn (A5) and a "maybe a correction" block was added to the ✏️ turn (A4).
- 6 turns later, in chat (guess √3/2→1): the guess changed with history, but the new text is garbled (A16).
- Negatives (a real-world «اشتباه کردم», and quoting the teacher's «اشتباه گفتی»): nothing changed. ✅
- The dossier shows both problem corrections but not the plan or its correction (A6).

**s04, life decision** (father's house):
- 3 turns later, in chat (8→11 billion): only the coach's logs changed. The problem's data list still says «۸ میلیارد», yet the page said «✓ اصلاح شد» (A2).
- 1 turn later, in chat (Thursday→Saturday): refused (A1).
- The same correction with ✏️: the page said «هیچ رکوردی ساخته نشده بود», although plan pl1 came from that message. On Thursday, Today asked whether the Thursday meeting happened (A1).
- 7 turns later, with ✏️ («امسال» → «تا آخرِ سالِ بعد»): only one mind-card event was withdrawn. The problem's datum and its condition 4, the very condition that made the problem contradictory, stayed unchanged (A2). The editor text is white on white (A3).
- Negatives (a real action, quoting the sister): nothing changed. ✅
- The dossier shows none of the three corrections.

### Defects (repro and screenshots are in each `findings.md`)
- **A1 · S1 · b.** A weekday correction is refused because «شنبه» is a substring of «پنجشنبه».
  - a27_tour.js:3405, `hasFrag(frag, fix)`: it tests the fix against the whole fragment instead of comparing old with fix at word boundaries.
  - The ✏️ path goes through the same check via `AS.retractApply` (a40_dossier.js ~216).
  - The refusal is not told to the model or to her, so the model's «درست شد» stands.
  - The correcting message is booked as a second planning success.
- **A2 · S2 · b.** A datum correction, in chat or with ✏️, does not reach the problem's own data and conditions that she typed on the page. «✓ اصلاح شد» is shown anyway, with no offer to update the problem card. `liveRetract` returns `pids:[]`.
- **A3 · S2 · c.** The ✏️ editor textarea `.as-edtx` is white on white (a40_dossier.js:233, plus style).
- **A4 · S3 · b.** The ✏️ «[اصلاحِ پیامِ قبلی]» turn also gets «# اصلاحِ پیامِ پیشین (شاید)», which invites a second retract and lists unrelated candidates (a27 fallback).
- **A5 · S3 · b.** A ✏️ date fix withdraws the mind-card event of a plan that still stands (a27 `retractApply`, a29).
- **A6 · S2 · b.** The dossier omits chat plans (pl…), their lifecycle and corrections, and corrections recorded only in chat. Seen in s01, s03 and s04 (a40_dossier.js).
- **A7 · S3 · b.** The dossier orders events by last-save time:
  - s02 shows the plan after the step it produced;
  - s08 shows «حل شد» after the look-back;
  - s04 lists two identical «نسخهٔ پیشین» entries.
- **A8 · S2 · b.** After a late, failed day-7 retrieval:
  - the day-1 and day-3 lines of the 1-3-7 cycle stay on Today indefinitely (still there two weeks later);
  - the case reads «موعدی ندارد»;
  - the cycle does not restart. This is in a41 (`PR.eval` re-anchor) and a42 (its wrapper around the P3 cycle).
- **A9 · S2 · b.** «🏋 کارِ تکنیک‌ها» splits one T41 case into two rows. The worksheet row says «اندازه‌ای نیست», losing the measured 80%, so the drop from 80% to 45% is not visible (a29 `techWork`).
- **A10 · S3 · b.** On a proven problem, the 🧪 section still says the guess is «هنوز آزموده نشده» (a41 `PR.guessStatus`).
- **A11 · S3 · b.** a41_practice.js:24 `nowISO()` uses `new Date()`, not `A.now`, so under the test clock the dossier puts practice sessions on the wrong day.
- **A12 · S2 · b, regression from round 19.** The register is taken from the quoted textbook statement «سؤال: ثابت کنید…», so a 17-year-old is addressed with «شما» and page questions read «بنویسید». It flips back to «تو» later (a27_tour.js:2651–2665, `fbSigns`/`regIn`).
- **A13 · S3 · b.** A false deferred-request candidate: «می‌خوام کل این نظریه‌ی تحلیل رو بندازم دور…» is a first-person intent, and the previous reply had already addressed it (s06 p5, a27 `deferCand`).
- **A14 · S3 · b.** After a failed step, the turn question alternated for six turns between e5 (restate — she had just saved a restatement) and e4 (gap vs. prediction — already answered in the outcome form). Seen in s04 p6–p12 (a38 `liveCoach`).
- **A15 · S3 · c.** «➕ افزودنِ نقطه» on one plot also opens the add form of another plot in the panel (a39).
- **A16 · S3 · b.** A guess fix given as a full sentence produces a garbled guess (a38 `liveFixVal` / a27 `repFrag`).
- **A17 · S3 · b.** «کدام حالتِ خاص … ردش کند؟» is still a separate option from the guess question (a38 `qSplit`).

**My own mistakes (class d, not defects):**
- s03: u0 was asked four times because I reported only `said:["u"]`; and in p14 my reply asked two questions.
- s07 and s09: the clock jump went backwards, so their after-time Today shots are not judged.
- s01: the round-19 script had marked her guess as refuted.

### Time trials (item 4)
- **s01, +20 days:** Today brought back the spaced reviews and her own invented problem by itself. After a full recall, the next review came at +3 days, as scheduled.
- **s02 / s05 / s06 / s08 / s10, +7 to +10 days:** reviews and transfer problems came back, plus the «میانهٔ راه» card where a problem was still open.
- **s03:**
  - The plan correctly showed «اول حدس را بیازما» on its date.
  - The T41 case was started from the problem page; session 1 scored 80%.
  - She skipped days 1 and 3; Today stacked the overdue lines.
  - The late day-7 session at 45% was recorded correctly as late and failed.
  - Rescheduling then broke (A8, A9).
  - No «تثبیت شد» was declared without evidence (correct).
- **s04:** Today showed the plan on the wrong day because of A1.

### Mind card
Before and after are plausible in all ten:
- «هنوز تمایزی دیده نشده» and «هنوز داده‌ای نیست» appear where they should;
- a self-correction counts +1 under look-back;
- every «از کجا؟» entry links to 📜.

### PARTS.md
Key verdicts:
- Unique role: the 🔭 tunnel, the assistant, the dossier, the mind card, Today/A.SCHED, the math tools and the dev clock.
- **Merge:** the 🔭 spaced review and the 1-3-7 cycle of the practice case schedule the same problem twice.
- **Merge:** the T41 worksheet and the P3 cycle are two records for one act.
- **Inside the 🔭 path:** the practice view works best through the 🧪 section on the problem page.
- **Unused this round:** the running lists (their first round, so no quarantine yet).

### «ارتقای لازم»
1. A correction should find every copy of the same fact (understanding card, condition, plan). When the copy is one she typed herself, ask «این‌جا هم عوض شود؟».
2. One retrieval schedule per problem: merge the spaced review and the practice case.
3. A late but successful recall should earn a longer interval and count as a retention sign on the mind card.
4. Prefill the technique worksheet's topic with the live problem's name.
5. Overlay the rival laws (linear vs. saturation) on the s07 plot.
6. Batch-2 tools: a geometry canvas (s03), a 3-D box sketch (s02), role-play for hard conversations (s04, s05), an hourglass simulator (s08), a units-aware calculator (s09), a seating checker (s10), and a two-request timeline (s06).

Everything is in /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20A/:
- `PARTS.md`
- `<sid>/findings.md`, `<sid>/RESULT.txt`, `<sid>/DONE`
- `<sid>/out/`: `part_*.png`, `dossier_full_*.png`, `corr_*.png`, `view_pre_*`/`view_post_*`
- `s03/corr_*.txt` and `s04/corr_*.txt`: the record dumps for the correction trials
- `tools/`: `harness6.js`, `loop.sh`, `on.sh`, `clk.sh`, `dump.js`, `finish.sh`