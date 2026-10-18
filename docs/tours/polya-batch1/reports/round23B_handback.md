## Runner B, round 23 — report

**What ran.** Page main 574f4a30 (`build.py --check` in sync, dist 16:02). I ran 18 scenarios in `tour1_polya/round23B/<sid>/`:
- **Replays:** s11–s20 and bp1–bp3, using the round-22 ctl.
- **Three new age scenarios:** aB1 (age 9), aB2 (age 16; also counts as the look-back-family scenario), aB3 (age 67).
- **Missing-territory scenario:** tB1.
- **Owner-like persona:** oB1.

Every scenario sets a birth date the way a real user would: through the card, or in chat in Jalali, which the model then converts. Every scenario ends with `{"exit":true}`.

The bp2 replay was redone with new prerequisite replies. The aborted first attempt is in `bp2_first/`; its ai/ folder is kept.

I wrote new replies as the literal average model wherever round 23 required something new. These were mainly for the prerequisite layer, `list_add`/`list_update`, birth dates, rewrite requests, and the new user turns.

**Outputs, all in `round23B/`:**
- per scenario: `findings.md` (owner summary, criteria, need maps, prerequisites, correction table, age section, routing, «ارتقای لازم», «ایده‌ها»), `routing.md`, `mail.html`/`mail.json`, `DONE`, `better/rN.txt` for failed turns
- `CATALOGUE.md` (defects B23·D1–D23) and `PARTS.md` (with a «نسبت به دورِ ۲۲» column)
- all `ai/` folders kept; browser profiles deleted
- one STORYBOARD_LINKS.md line added

**E-mails:** all 18 were sent with Gmail (subjects «🧭 پولیا · دورِ ۲۳ · …», with the B storyboard link).

### RESULT per scenario
- **PASS (3):** s15, s16, s20.
- **FAIL (15):**
  - with only S3 issues: s13, s18, aB1, aB2
  - with S2 issues: s11, s12, s14, s17, s19, bp1, bp2, bp3, aB3, tB1, oB1

### Defects (class, severity)
**S2**
- **D1 (b) — no page rule for «خنگم» after the problem is closed.** The whole «# پیش‌نیاز» block, including the ability line, disappears once a chat problem is closed (bp1 p10, bp3 p14). The named-gap answer came from the model only. When the problem is still open (bp2 p14), the line is present. Location: a44_route.js `PRE.block`/`PRE.scope`.
- **D2 (b) — route map wrong for chat problems.**
  - Origin shows «پروندهٔ این گفت‌وگو (بی مسئلهٔ زنده)» instead of the statement.
  - Destination is generic, or one of her own side sentences (bp3 «ولی خب، ۵ منهای ۳ چرا نمیشه», oB1, s14).
  - The main-line steps never appear as points.
  - After chat_solved the map flattens: no concepts, nested depth lost, no returns (bp1/bp3 FINAL).
  - Location: a44 `A.ROUTE.model`.
- **D3 (b) — "same fact by meaning" copies: misses plus a new false positive.**
  - Misses: s17 «۱۸۰ نه ۲۰۰» reaches nothing (her data line says «۲۰۰ مترمربع»; her original message wrote «200 m^2»). s11 her lpOne, d1 and plan are not asked. bp2's ✏️ edit never asks about d2 «۱۵ سانتی‌متر».
  - False positive: s17's ✏️ change «۲۰ ⇒ ۱۷» (tank size) offers to rewrite an unrelated range bound «۱۰ تا ۲۰ مترمکعب». Clicking «بله» corrupts her approximation.
  - Silent change: s19 her page-typed step outcome is changed without asking.
  - Location: a38 `liveNumCopy`/`corrCands`.
- **D4 (c) — deadline correction still garbles the statement.** s19 now reads «عروسی ۱۵ اسفنده برادرم مونده». bp2, s11 and s18 statements are now clean.
- **D5 (b) — chat work not imported into a live problem made later from the same chat.** aB3: `live_new` after 9 turns restarts at «فهمِ مسئله» and asks the whole-first u0 question again (p11–p12). On his review day the strip says «طرح هنوز نیست». This reproduces A22-27.
- **D6 (b, gap) — birth date accepts Gregorian only.** s12 (67) typed «۱۳۳۸/۰۳/۱۲» in the card and was rejected. Jalali dates in chat work only because the model converts them; the page neither converts nor checks.
- **D7 (b, gap; ADDENDUM 2) — no waiting record and no resume loop after a gap sheet.** The sheet itself was filed correctly (tB1 #101), but the waiting sub-problem is only text in the assistant's steps. Nothing notices when the tool is built and resumes the step.

**S3**
- **D8:** the one-question pass garbles the teen audience line («تو فقط پرسشِ همین پاسخ کن»). The strict scan also flags «شناسه را بپرس» in «# منبع‌ها و پوشش» (oB1).
- **D9:** the birth card says «تو» to a 67-year-old addressed as «شما».
- **D10:** the prerequisite stack names the problem by her raw first message («سلام. معلممون…»). The rewrite also demands the return restatement after she has already taken the step (bp3 p11, bp2 p7/p9).
- **D11:** the guess detector misses her own check (bp1 p11, persists from B22·D13) and reads a data remark as a guess (aB3 p4).
- **D12:** the page's suggested turn question does not fit the moment (s13 p6, oB1 p6/p8/p9, aB1, aB2, aB3). One page question still holds three questions (s13 p7).
- **D13:** a practice report or a greeting becomes the «مسئلهٔ گفت‌وگو» subject.
- **D14:** the correction hint fires on «غلطه» about her own recall.
- **D15:** Today asks «تحویل دادی؟» about an exam she already reported taking (s14). better/r12 adds `deadline_done`.
- **D16:** the territory list in the prompt is truncated; s_comm and s_self are missing.
- **D17:** the model cannot open the route map of a chat problem, because the prompt has no session id. The route view is also labelled «🧗 مسئله‌های بزرگ ›».
- **D18:** in bp3 the first stuck stays «نامعلوم» after the missing prerequisite was diagnosed.
- **D19:** s11's title does not follow the corrected statement.
- **D20:** post-check false positive on a cheat-sheet reply (s14 p8).
- **D21:** the models shelf holds the same model twice (s18).
- **D22:** bp2 mind card shows one cause twice and omits the second learned prerequisite. The live-map detours have no concept, and two corrections draw 5 back-jumps.
- **D23:** chat guesses stay «آزموده نشده» after she tested them (aB2).

**Fixed since round 22 (verified):**
- B22·D1 routing: 182/182 turns correct; s12 p1 and bp2 p1 now lla_coach.
- B22·D3: s11's earlier verdict is set aside with the reason.
- B22·D5: no over-withdrawal on the deadline correction.
- B22·D6: prerequisite layer now works end to end.
- B22·D7: route map exists.
- B22·D8: running lists can be added and closed from chat, linked to the problem, and resolved items leave Today.
- B22·D11, D16, D20.
- Partly: B22·D2 (bp2 copy asks now work, including number words such as «پنجاه») and B22·D9.

### «ارتقای لازم» (main items)
- Jalali date input for the birth date.
- Ability rule kept active after a problem is closed.
- Route map origin and destination taken from the statement and the unknown; nested depth and returns preserved after chat_solved.
- A session id (or a route action) the model can use for chat problems.
- Copy matching that distinguishes the role of a number, and covers every typed field of a problem.
- Importing chat work into a live problem created later.
- A waiting-sub-problem record tied to its gap sheet, plus the resume loop.
- The full territory list in the prompt.
- A teacher-role prerequisite note and a teacher practice case.
- A habit-formation technique (the territory row for implementation intentions is at step 0).

### Age verdicts
- **Bands apply correctly:** child (aB1), teen (bp1, bp3, aB2), elder (s12, aB3); adults, including the 18-year-old in s18, get no block.
- **Tone and safety:** tone fits each band. Minors' safety held: aB1 volunteered her school name, and it was neither asked for nor repeated.
- **Results:** every age scenario reached a real result.
- **Mind card:** after answering the daily puzzle, ages 9, 14 and 67 show «برای این سن هنجارِ معتبر در دست نیست (منبع…، گروه‌های سنیِ معتبرش…)». Age 39 is compared only with the 30–39 band.
- **Gaps:** D6 (Gregorian only), D8 (teen line garble), D9 (card register).

### Prerequisite verdicts (P1/P2)
- **bp1 (one prerequisite):** detection, exact concept and step named, diagnostic question, minimal teaching, mastery check, exact return and solve all work. The 🧩 item is linked to the session. The mind card books the stuck as «پیش‌نیاز», never weakest, and the learning as progress.
- **bp2 (two in sequence):** works the same way, apart from D22 and the forced restatement in D10.
- **bp3 (three, one nested):** works the same way, including the nested stack and the return to its parent.
- **Route map:** shot at three moments in bp1 and bp3; it works during the detours but has the D2 defects.
- **Still failing:** «خنگم» after the problem is closed (D1).

### Correction trials vs round 22
| Trial | Round 22 → 23 | Note |
|---|---|---|
| s11 | FAIL → PARTIAL | statement and verdict now follow; her form copies don't |
| s17 ✏️ | PASS → FAIL | new false copy ask |
| s17 chat | FAIL → FAIL | |
| s19 plot | FAIL → PASS | |
| s19 ✏️ plan | PASS → PASS | |
| s19 step | PARTIAL → PARTIAL | her copy changed without asking |
| s19 deadline | FAIL → FAIL | garble only; over-withdrawal fixed |
| s18 (4 trials) | PASS → PASS | |
| bp2 composite statement | FAIL → PASS | |
| bp2 ✏️ multi-number | PARTIAL → PARTIAL | |
| aB3, oB1 | new → PASS | |

### Routing
182/182 turns correct. tB1 p4 is the page's internal second-opinion call, not a user turn.

### PARTS.md summary (vs round 22)
- **Much better:** prerequisite layer, running lists, mind-card causes.
- **New:** birth card and audience block, same-band comparison, route map, gap sheet.
- **Better:** routing, correction engine, assistant.
- **Same:** Today, dossier, practice case.

### Owner-like persona (oB1)
He asked 7 questions from the owner question bank: #1, 2, 3, 5, 8, 9, 10. Each got a «هست / نیست» answer with evidence. The honest «نیست» answers were: no resume loop after a gap sheet, and no habit-formation technique among the 45. On #8 the model could not open the route map itself (D17); he opened it with the panel button.

### Missing territory (tB1)
- **Worked:** differential diagnosis, second opinion, and complete sheet #101.
- **Not built (S2):** the resume loop (D7).
