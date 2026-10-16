# Tour 1 (Pólya), round 8: «live» fixer handoff (2026-10-16)

Scope: I-live 1–10 of `DECISIONS_R8.md` (DECISIONS_R2–R7 still bind). Files: `apps/learning-architecture/src/app/a38_live.js`, plus one small reported edit in `a27_tour.js` (coach-owned). Not done here: docs (WORKLOG, PROGRESS, HANDBOOK, AUDIT_LOG), push, merge.

## Commits (base e52aae7)
- `8940338`: I-live 1–10 code (first pass).
- `77395e6`: fixes a name clash. The new number tokenizer is `numTok`; the first pass had redefined the existing `numsOf` (approx/limit checks). Card escalation no longer drops back to the card's general verdict. Adds the new test.
- This note is the last commit.

## Test
`tests/test_tour1_r8_live.js` has sections `L1-name`, `L2-refuse`, `L3-cardmore`, `L4-chatdata`, `L5-goalgate`, `L6-overcol`, `L7-systurn`, `L8-tags`, `L9-best` and `L10-lifeplan` (`ONLY=<prefix>`). Each section drives the real forms and the real assistant panel (stub model) and reads the turn question from the prompt that was sent.
Red baseline: `LLA_FILE=<e52aae7 dist html> node tests/test_tour1_r8_live.js` exits 1 with 15 failing checks, and every section is red. The fixed build prints «NO ERRORS».

## What changed (a38 unless noted)
1. **Stuck-name (s02).** The «دادهٔ «X» را کجا به کار برده‌ای؟» rung now names only a datum the user has not used anywhere.
   - A datum counts as used (`unSeen` / `datumSeen`) when a number that belongs only to it, or at least half of its distinctive words, appears in the user's own texts.
   - "Distinctive" means the word is not in the other data, the unknown or the title.
   - The user's texts (`userTexts`) are: their messages in this problem's sessions, the current message, and the plan, draft and steps.
   - Excluded: «[سامانه…» turns, and the message that only brought the statement (it shares at least 60% of the statement's words).
   - If no such datum remains, the rung is skipped and the next one (backwards) applies.
   - Chat use still does not count as "used" for the page (R3 rule unchanged); it only decides which datum is named.
2. **Stale refusal (s19).**
   - The step form stamps `refD` (the day) on every refusal: goal gate, «از طرحت نمی‌آید», induction base.
   - `specCards` marks a refusal `fresh` only on that day.
   - In a chat turn, a stale refusal is context: the page card stays, but it is not the turn question, so the due mid-course card or the stage question gets the turn.
   - On a later day, the user's next message is their answer.
   - Calls without a turn (the Today page) are unchanged.
3. **Card escalation (s26).**
   - On a consecutive stuck turn where the previous turn question was a specific card, the card escalates within itself (`cardEsc`).
   - Equations card: «بخشِ «X» از شرط هنوز در هیچ معادله‌ای نیامده — همین بخش را با نمادها بنویس…». With no unused part: «کدام مجهول هنوز در هیچ معادله‌ای به بقیه بسته نشده…».
   - Cards without a finer rung give way to the stuck sequence.
   - After the escalation, the next stuck turn moves on and does not return to the card's general verdict.
4. **Chat-only stuck with unused data (s18).**
   - New `A.liveChatStuckQ(stmt, userTexts, lastAi)`.
   - Data are the statement's numbers with the words beside them. Numbers inside the user's own formula (next to an operator) are left out.
   - A datum counts as used when its number appears in a later user message.
   - If a datum is unused, it returns «همهٔ داده‌ها را به کار برده‌ای؟». If the last assistant message already asked that, it returns the unused datum by name.
   - **a27 edit (coach-owned, minimal):** when the 🎯 goal would be the suggestion, the turn is stuck (`sig.stuck || stuckNow`) and `liveChatStuckQ` returns a question, that question is `sug`. `coachLines` then prints the 🎯 line as «زمینه (نه پرسشِ دوم)» (`o.goalCtx`).
5. **Goal gate (s35).**
   - A rotation step counts as goal-directed (`stepToCause`) when its own words address a recorded datum or cause: at least two meaningful shared words, or one shared word with a datum it ticked.
   - A tick alone is not evidence. In s35 the prize step also ticked «۴۰۰ خانوار», and the user said afterwards that the prize addresses neither cause, so the prize step stays gated.
6. **OVERCOL_RE (s17)** adds «باید دقیق‌تر بشه/باشه/کنم» and «… رو هم دربیارم/پیدا کنم/حساب کنم/بسنجم/به دست بیارم».
7. **System turns (s34).**
   - A «[سامانه: …]» turn gives no turn key: it neither advances the stuck count nor sets the mid-course hold.
   - If the hold is already set, a system turn does not re-ask the card.
   - The user's next real message gets the hold.
8. **Tag leak (s24).** The child-problem mapping line no longer carries «H2 دورِ ۷، s24». A scan of the a38, a26 and a29 prompt strings found no other leak; the test checks the whole prompt.
9. **lpBBest heads (s25/s29).**
   - `HEADQ_RE` treats a head with a question word but no «؟» («مجهول دقیقاً چیست —») as part of the question.
   - `TAILREF_RE` keeps a tail that starts with «و آن/این…» attached to its head.
10. **Life-pod plan hint (s05).** For a life-pod problem it reads «طرح از پیوندِ آنچه در دست داری با فرضیه‌ای که می‌آزمایی درمی‌آید…» (class `lp-planhint`).

## Verification
- `python apps/learning-architecture/build.py`
- All page node tests through the pytest browser wrapper: 82 passed (default jobs). With `LLA_BROWSER_JOBS=8 -x`, `test_course.js` failed once under load; it passes alone and in the default-jobs run.
- `pytest tests/ -k "learning_architecture and not graph_browser"`: 8 passed.

## For the coach
- s19: once a stale refusal is context, the mid-course card is the live turn question, which matches the coach's mid-course line. Coach I-7 (suppressing the coach line when the live question is a fresh card or refusal) still applies to fresh ones.
- s18: the 🎯 goal text itself (`Cg.unkBy`) is coach data. With `coach_state` omitted in the tour's test path, it can still quote the statement's question sentence.
