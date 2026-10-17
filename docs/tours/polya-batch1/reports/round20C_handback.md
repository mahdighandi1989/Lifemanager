## Round 20, runner C (s21–s29): report

All nine scenarios were replayed from the round-19 controls with harness5. I used a copy of it, `round20C/tools/harness5c.js`, which adds a full-page `shot` command. The build was main a94614ae, and `build.py --check` was in sync.

Two things differ from a plain replay:
- The old `APP.today=` patches were replaced with the real clock (`APP.clock`, dev mode). Each new day is entered with exit, reload and restore.
- In s25 I put one deliberate typo («۱/(2·3·5)») into the session-3 message, so a later correction would have something real to fix.

Every scenario ends with `{"exit":true}` and has `DONE` and `findings.md`. Nine e-mails were sent («🧭 پولیا · دورِ ۲۰ · …», with storyboard link C). Profiles are deleted and no harness of mine is still running.

**Results**
| Scenario | Result | Defects |
|---|---|---|
| s21 | PARTIAL | C20-11, C20-14 |
| s22 | FAIL | correction trial and dossier: C20-1, 4, 5, 6, 7, 8, 10, 14, 15 |
| s23 | PARTIAL | C20-11, 12, 14 |
| s24 | PARTIAL | C20-11 |
| s25 | FAIL | correction trial: C20-1, 2, 3, 6, 7, 8, 9 |
| s26 | PARTIAL | C20-11, 14 |
| s27 | PARTIAL | C20-14 only, which is cosmetic and appears only in test-clock mode |
| s28 | PARTIAL | C20-10, 11, 14 |
| s29 | PARTIAL | C20-11, 12, 13, 14 |

None of the nine is zero-defect.

**Round-19 defects, checked end to end**
- **Fixed:** X2, X3, X4, X5, X6 and X7.
- **X1 mostly fixed.** One case remains (C20-15): s22 p5 still offers «بیا توی سامانه ثبتش کنیم.» as a deferred request, although the reply to it had already done it with a `go` action.

**Defects (full repro and locations in `round20C/defects.md`)**
- **C20-1 (S2, b):** correcting one fragment withdraws every mind-card event of that message. Correcting only the plan date in s22 withdrew the understanding success from the same message. Location: a27_tour.js ~3447–3452.
- **C20-2 (S2, b):** a problem created or filled from the wrong message does not follow the correction.
  - s25: the chat_invent statement keeps «۲·۳·۵», and a duplicate of an existing problem remains.
  - s25: the statement «۱۰ تاشو» stays after «۸ تا».
  - The page answers «از آن پیام چیزی در صفحه ثبت نشده بود». No source-message id is stored on these records (a27 chat_invent and assistant fill; a38 ~3963).
- **C20-3 (S2, c):** the coach's own-unknown is wrong. The turn question became «🎯 مجهول هنوز «سه تاشو چک کردم» است…», and the change line reads «مجهول به حرفِ خودت: «۸ تا بود»» (a27 ~3436–3441).
- **C20-4 (S2, b):** a guess confirmed by the corrected message stays confirmed (s22 g2 `res=confirmed`).
- **C20-5 (S2, b):** in s22, an edit with «✏️ اصلاح» to the step report leaves the step outcome (prefilled from that message) and the refutation of g1 unchanged. Two contradictory notices appear.
- **C20-6 (S2, c):** the «✏️ اصلاح» editor's text is invisible. The value is there but the box looks empty (a40_dossier.js:235; `parts/part_correction_edit_1.png`).
- **C20-7 (S3, c):** the correction-signal pattern fires falsely on «طرحمو نوشتم ولی گیر کردم», and also on the system turn that a «✏️ اصلاح» edit sends (a27:3318).
- **C20-8 (S3, c):** the "which one do I correct?" candidates show raw ids and placeholders («lpNewS», «مثلاً پیشنهادِ…») and miss the relevant records.
- **C20-9 (S3, c):** the «✏️ اصلاح» text substitution leaves a stray «از», and a closing message is treated as the chat problem statement.
- **C20-10 (S2, b):** the dossier omits chat-side acts and the corrections log. In s22 it labels the current guess «رد شد» with a calibration minus, though it was never refuted.
- **C20-11 (S2, b):** the practice box on the problem page says «هنوز آزموده نشده» for guesses already refuted in the guess kit. Seen in six scenarios (a41_practice.js:585, `guessStatus` reads only `prcTests`).
- **C20-12 (S2, b):** the mind card's «🏋 کارِ تکنیک‌ها» ignores the practice-case sessions. The s23 T28 and s29 T41 rows show only the first worksheet (a29 ~537).
- **C20-13 (S2, b/c):** for T41 in s29, Today keeps the old «برگه سفید روز ۱/۳/۷» lines five weeks later with no overdue label, even after sessions. The case itself says «موعدی ندارد».
- **C20-14 (S3, c):** the «⏱ ساعتِ آزمایشی» badge covers the «↩ برگرد» button (a42:366).
- **C20-15 (S3, c):** the X1 residue above.

**Correction trials**
- **s22 (life decision), one of three corrections fully followed:**
  - 1 message back, in chat (receipt date): partial. The mind event was withdrawn, but the guess stayed confirmed.
  - 3 back, «✏️ اصلاح» (step report): failed.
  - 7 back, in chat (plan «امروز» changed to «شنبه»): correct. Date became 2026-10-24 with history kept, except C20-1.
- **s25 (math):**
  - 1 back, in chat (the term typo): failed.
  - 3 back, «✏️ اصلاح»: partial.
  - 9 back, in chat («۱۰» changed to «۸»): failed.
- **Common to both:** nothing was deleted, bubbles show «اصلاح شد ⇐», the assistant said in one line what changed, and the two negative messages in each changed nothing (correct).

**Dossier**
- Opened for all nine scenarios.
- **Complete and in order** for page-side work in s21, s24, s26, s27, s29 and s28's first problem.
- **Missing** chat acts and corrections in s22, s25 and s28's second problem.

**Time trials (`APP.clock`)**
- **s23, T28 case started from the problem, days 1 to 21:**
  - Today brought the case back by itself, with a window and «عقب‌افتاده (n روز)».
  - It also brought back the new problem she created in look-back.
  - A regression kept the case open, with no false «تثبیت شد».
- **s29, T41 case:** the day-1 turn came back by itself. The late failed session was logged as «۴ روز دیرتر از موعد», but then C20-13.

**Mind card:** plausible before and after in all nine. X4 is fixed (no "weakest" without a failure), apart from C20-1.

**Needed upgrades («ارتقای لازم»)**
- Every record built or prefilled from a chat message should carry its source message id.
- A conflict prompt when a source message changes after the person filled a record by hand.
- A corrections section in the dossier.
- Practice cases and their sessions shown inside the problem's dossier.
- A "quick session" button on Today's practice line.
- Mathematical (not textual) equivalence when checking whether a problem was already registered.
- One source of truth for T41 turns, plus a recall-versus-interval chart.
- Recorded earlier for batch 2: interactive chess board, unknowns/equations counter, state-count table.

**PARTS.md summary**
- 19 parts judged, with shots in `round20C/parts/part_*.png`.
- **Distinct place:** tunnel stages, assistant, dossier, mind card, Today/scheduler, practice case, formula tools, chess board.
- **The correction path:** «✏️ اصلاح» and chat retract should be merged into one engine. Distinct but incomplete today.
- **Inside the tunnel's path:** guess kit, factory claims.
- **No evidence in group C:** running lists.

**My own mistakes (class d, not defects):** several T28/T41 worksheets did not save because I left required fields empty. The page warned correctly. The probe-created «مسئلهٔ دوم آزمایشی» records and «… ≤ ۱۰۰» drafts came from replaying round-19 probes and are not marked as test data.

Files are in `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20C/`:
- `defects.md`
- `PARTS.md`
- `s2*/findings.md`
- `parts/`
- `s2*/out/` (shots: `c0_*`–`c4_*` before/after each correction, `t*_today`, `part_*`, `view_pre_*`/`view_post_*`)