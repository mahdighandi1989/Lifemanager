## Round-24 «today» fixer (R7): finished

All of R7 is fixed at the root. The new test and the R7 bank pass, and the whole page suite passed one test at a time on the merged branch (130 files, 0 failures). The one red gate is the documentation numbering: the five sibling numbers are not merged yet, so you need to renumber.

**Commits** (worktree branch only, nothing pushed, no mode-120000 entry staged):
- `809b7a02` fix(learning-architecture): Pólya round 24 «today» (R7)
- `1152e313` merge of the loop fixer `54f9ebeb`
- `2e5cfb92` merge of the classify fixer `046d813d`

In those merges, only docs and generated bundles conflicted. I kept both sides in the order loop (107/116), classify (108/117), today (110/119), then rebuilt.

**Coordinator note on the a26 cap:** I added nothing to the a26 system prompt. The only a26 change is the text of the automatic follow-up turn, which is a «[سامانه: …]» user message.

### Root causes and fixes (file: function)
1. **B24·D13**, `a41` `PR.dlDoneFromHer`: negation was checked over the whole message, so «… سر جلسه قفل نکردم» blocked «… ۱۴ گرفتم». It now checks clause by clause. If no deadline shares a word but the clause names an exam and exactly one open exam deadline is due, it uses that one.
2. **B24·D14 and D24-11**, `a41` `PR.guessOwnTest`: only a later message containing every guess expression counted. It now also accepts, each with her own sentence stored in `resFrom`:
   - a refutation later in the guess message itself (aB4 «… = ۱۰۰. زیاد شد»);
   - for a guess with no number, a test in the very next message (tB1 «امتحان کردم … از معیارم بیشتره»), or «ولی … گرفتم»;
   - her own reasoning, «چون … پس/میشه/=» ⇒ confirmed (aB2);
   - a number word before «تا», plus a «پس … پنج تا» conclusion with a refute marker (aD4).
3. **B24·D20**, `a29` `causesSection`: each stuck event got its own line. The list now groups the same pid, phase, prerequisite, step and quote into one line «… در n نوبت». The stuck count does not change, because the R22/R23 prereq tests depend on it.
4. **B24·D21**, `a27` `plan18`:
   - An approval question («… بخونم. خوبه؟») is no longer stored as a plan.
   - A future model `when` with no time words in her plan, this message or her two previous ones becomes «next-session». «روزی/روزانه» count as time words. Past dates are still rejected.
5. **B24·D9**, `a41` `PR.herLater(s, acts)`: a write action in the same turn now means the request was fulfilled, so no promise. «پاسخ به …» is shown only when her message is a reply (آره/نه/باشه…).
6. **D24-14**, `a41` 🎯 form and `bookPred`:
   - The form now recognises an open chat prediction worded differently (`PR.chatFcastOf`) and fills that record's missing confidence or date instead of creating a second one.
   - `bookPred` reads her «۸۰ درصد مطمئنم» from the same message.
7. **A23-32**, `a45` `importChat`: the live problem's window now starts at the message that stated it. The earlier problem's guess «۱۰۰», its steps, its unknown and its prerequisite stack are no longer imported.
8. **D24-4**, `a38` `inventGate`: there were two decisions — the reply pre-check said «ثبت نمی‌شود» while the round-23 wrapper kept the problem. The gate now returns `backpend` itself through `A.PR.backPendOk/backPendAdd` in `a41`, so both agree.
9. **C24-5**, `a38` `inventGate`: a conjecture she makes and tests herself becomes the live problem.
   - If the same look-back already has a dormant child problem, that child is woken and bound, and no second record is made. Round 4's E7 test is unchanged and green.
   - If the child is only a look-back note, it is promoted.
   - Otherwise it is created with `live_new`.
10. **C24-17**, `a44`: during look-back the remaining-work line no longer says «طرح هنوز نیست · ۰ مرحله از ۴»; it now says «فقط بازنگریِ خودت — حل به نتیجه رسید».
11. **A24-16**, `a26`: the automatic follow-up after opening a view with no fields no longer says «فیلدها را پر کن».
12. **Bank #151**, `a33` `AS.herDay24`: when her message has exactly one relative day («تا شنبه‌ی بعد»، «فردا»…), the page computes the date and overrides a different model date.

### Tests and bank
- New `tests/test_tour1_r24_today.js`: 17 checks built from the runners' sentences. 16 are red on base `3685102d`; the 17th is the negative guard «فردا صبح … زنگ می‌زنم» and is green on both.
- Expected dates are computed from the frozen page clock, not written in.
- Bank `tests/variants/VARIANTS_R24.json` (copied from the scratchpad, identical), R7 entries #142–#160: 19/19 pass. 16 were red on base; the negatives #155, #156 and #159 were green on both.

### Suite and gates
- The full page suite passed one test at a time three times: on my commit, after the follow-up fixes, and after merging loop and classify.
- During the first run five tests failed, all caused by my early changes and all fixed:
  - `r18_coach` and `r19b_coach`: the model-date rule.
  - `r22_prereq` and `r23_prereq`: the first version removed stuck entries instead of grouping the display.
  - `r4_coach` E7: it now wakes the existing child problem.
- `pytest test_learning_architecture_handbook.py test_supervisor_ownership.py`: 14 passed when I temporarily set my entries to 105/114. With the assigned 110/119 the only failure is the numbering gap — the build reports «PROGRESS row 116 should be 114» and that WORKLOG numbers must run 1..N.

### Docs
- `WORKLOG (110)` and `PROGRESS 119` (after loop 107/116 and classify 108/117).
- HANDBOOK: one §10 row, §12 row 67, a 🧪 bullet, and the «به‌روزرسانی» date set to 2026-10-25.
- `docs/overhaul/AUDIT_LOG.md` entry.
- `experiences/model-reports-state-page-validates.md`: added «Update 2026-10-25 (round 24, today)».
- Handoff with the contracts for the other fixers: `docs/overhaul/handoff-notes/_pending_tour1_R24_today_2026-10-25.md`.

### Not done
- The second half of B24·D21 (the s15 teacher strip still shows «اکنون: فهمِ مسئله · مقصد: چیکار کنم؟» three weeks later) is the story fixer's stage work (R2).
- A23-32 has a second root outside R7: the chat problem key did not change when the new problem arrived mid-chat. That belongs to story/classify; the import cut makes the dossier and 🧭 correct either way.
- «Fulfilled» is read from the turn's action list, not each action's result. A write action the page refused still counts as fulfilling the request.
- The story, correction and age fixers were not merged; none was named yet.