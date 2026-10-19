# Round-24 decisions — ROOT MECHANISMS (main session; binding)

Round 24 ran on main eee4ff0f (the five round-23 fixers). Each group re-ran every round-23 scenario and added one new age scenario
(A aA4 81, B aB4 82, C aC4 81, D aD4 81). The territory loop was tested with three arms (positive, a reply that does not answer the step,
«I found another way»), and the owner question bank was split A 1–4, B 5–8, C 9–12, D 13–15.

Zero-defect scenarios: A 0/19 · B 0/19 · C 2/18 (s26, s27) · D 0/19 → 2 of 75 (round 23: 5 of 69).
- S1: one, D24-1. The negative arm of the territory loop. The same defect is A24-4 and C24-14 (S2 there).
- Most scenarios fail only on S3 lines shared by every run, e.g. the birth confirmation (B24·D6, D24-5, A24-20).

Why fewer zero-defect scenarios although much improved: round 24 tested new mechanisms end to end for the first time (the territory
loop with three arms, the chat ⇄ forms story, Jalali input in three forms). Every first full test of a mechanism exposed its edges.

## Better than round 23 (evidence in the reports)
- Routing:
  - A 218/218 (round 23: 2 wrong).
  - B 208/208.
  - C 232/233. Its one miss is C24-1, a self-introduction opening.
  - D 194/195. Its one miss is D24-13, a regression.
- Jalali birth dates:
  - In every group, every stored date equals ICU's Persian calendar. This covers the card, chat, Latin digits, two-digit years in chat,
    leap years and the leap-year 30 Esfand.
  - Days that do not exist get a human error line.
  - Bands, the «# مخاطب» block and minors' safety are correct in all groups. The teen garble is gone.
- Territory loop:
  - Built and working end to end in its positive arm (B, C, D; in A it resumes but with the wrong tool).
  - The waiting marker shows on 🔭, 🧭 and 📜.
  - The sys_done arm works in all four groups.
- Chat ⇄ forms: «از گفت‌وگو: … درست است؟» appears in every group, and the forms are no longer re-asked.
- Corrections: most round-23 trials now pass (B: 3 FAIL → PASS; D: 6 of 7; A: pinned goal, result, statement).
- Owner question bank: questions 1–3, 5–12 and 14–15 got evidenced answers. «نیست» with a sheet:
  - #4: whether the method was measured across models;
  - #6: two users' data in one browser;
  - #13: the companion book.
- Round-23 FIXED counts:
  - A: 20.
  - B: 13 of 23.
  - C: 12 fully, plus partial fixes.
  - D: 30.

## Root mechanisms (for the round-24 fixers — NOT launched; owner's pause, see STATE)
R1 — TERRITORY LOOP MATCHING (S1).
  - Read only the routine's REPLY notes, never the sheet's own filing text, the assistant's note or its `whole`
    (D24-1, A24-4, C24-14, B24·D19).
  - Exclude areas the differential diagnosis ruled out.
  - Make the match negation-aware: words inside «نه/نیست/بدون» clauses never count.
  - Ignore generic words (مسئله، تغییر، ابزار، هیچ، واقع، نمودار…). Score every candidate and take the best one, not the first that reaches
    two words (A24-5).
  - When the score is not clear, ask the person «این ابزارِ تازه همان است که برای گامِ … لازم بود؟» before resuming.
  - A sheet about the system itself (kind fix, self-knowledge, companion book, model benchmark) never marks a step of her problem as
    waiting. Only a gap with `gap.step` or a step naming «#n» does (D24-2, A24-6, C24-13).
  - On sys_done, write a page line and leave a note on the sheet for the routine (B24·D19).
  - 📜 shows the outcome after arrival or sys_done (D24-8) and names the right waiting step (A24-15).
  - Order the 📜 and route events by time (B24·D18).
R2 — ONE STORY, STAGE AND TURN QUESTION (S2, every group).
  - The live-problem prompt stage comes from `A.liveStoryPhase`, not from the form's phase (A23-35, B24·D2, C24-8).
  - Chat answers given before live_new are imported, including the unknown/claim («مجهول» field, A24-18 chips).
  - No u1 «مجهول/حکم چیست؟» once she stated it (A23-35, D24-15, C24-8). A stale suggestion never appears.
  - A sub-problem's result never moves the whole problem to look-back (D24-3).
  - Plan steps come only from a message she marks as a plan («طرحم این است…», a numbered or bulleted list) or from the model's validated
    `plan`. Never cut a message at commas or sentences (B24·D3, D24-9).
  - The importer never takes her rejected attempts or her correction message as data (A24-7, B24·D22), never puts a sentence in the wrong
    field (D24-12), and never swallows a meta-question (C24-11).
  - A page re-check question after a corrected datum is never dropped as stale (B24·D4, C24-9).
R3 — CORRECTIONS SPREAD AND NUMBER BOUNDARIES (S2).
  - A ✏️ number replacement is number-boundary-aware: «۱.۷۵» is never touched by a «۵» pair (C24-12).
  - Number roles: weeks are not a day of the month (B24·D5).
  - The unit is kept when the corrected number is written into the statement (A24-3).
  - The typed form row is changed or asked (A22-17).
  - A correction flows into the «از گفت‌وگو» drafts and the 🧭 destination (C24-11).
  - Values derived from a corrected number are marked «کهنه پس از اصلاح» or recomputed (B24·D17, C23-5, D23-5).
  - The «why» line never shows emptied quotes (A24-9, B24·D16, C24-6). No duplicate change lines, and arrows point one way.
R4 — OPENING AND CLASSIFICATION.
  - One chat-problem detector, the same stripping «پروندهٔ تازه» uses, for the coach context, «# پیش‌نیاز» and routing.
    - Self-introduction openings are problems from turn one (C24-1, C24-2).
    - No correction block on an opening (C24-3).
  - A stuck message that mentions «به کار بردم» is a stuck, not a use report (A24-1).
  - A silent «...» keeps the coach block (A24-2, regression).
  - A practice report with a new solution routes to lla_coach (D24-13, regression).
  - «بعدش چی کار کنم؟» is not naming the unknown (C24-7).
  - «پیر شدم، مغزم … کار نمی‌کنه» is a self-label (D24-7).
  - Her own reported check is not a guess (B24·D15, A24-14).
  - A confidence is booked only when she gives one (A24-8).
R5 — AGE AND REGISTER SURFACES (S3, every scenario).
  - One birth confirmation per date. It shows only the Jalali date in the person's register (B24·D6, D24-5, A24-20, C).
  - Never ISO to a person, anywhere (D24-6 «موعد ۲۰۲۶-۱۰-۲۱»).
  - The page's parse is never overridden by a model ISO date (B24·D7).
  - The birth card accepts two-digit years, keeps the day already typed when asking for the year, and accepts Finglish month names
    (B24·D1).
  - The mind-card date field shows its error (A24-13).
  - Age in words («هشتاد و یک سالمه») is read (A24-10).
  - «از تاریخِ تولدِ ثبت‌شده» appears only when a date was stored (B24·D8, C s21).
  - Elders (60+) and «شما» users get «شما» in every page line: card, system lines, turn questions.
    - The register post-check never forces «تو» on them (B24·D11, A23-14).
    - Register signs come from verbs only: not «ببینم» (C24-10), not the noun «روتین» (C24-15), not an imperative to the machine
      («ثبتش کن»).
  - Under 18:
    - no adult-normed puzzle (C24-18; the a29 path is still open);
    - the honest no-norm line in the mind card (D24-10).
  - A minor's school name is not kept verbatim in the dossier (B).
R6 — POST-CHECK CALIBRATION.
  - The page's own two-sentence or composite question counts as one (A23-20, B24·D12, C24-4).
  - The assistant's own «…» phrase is not a quote of her (B24·D10).
  - A natural return to the waiting step is accepted without the heavy template, especially for a child (C24-16).
  - No «خودت فکر می‌کنی چرا؟» on a question about the system (B24·D12).
R7 — TODAY, DOSSIER, MIND CARD, PROMISES.
  - deadline_done from «۱۴ گرفتم» (B24·D13 = B23·D15).
  - Chat guesses tested or refuted in her words get their outcome (B24·D14, D24-11).
  - The same stuck is not listed three times (B24·D20).
  - A question «خوبه؟» is never stored as a plan, and a model `when` needs her words (B24·D21).
  - A promise is created only when the turn left the request unfulfilled. Its text is her request, not the assistant's question (B24·D9).
  - One prediction makes one 🎯 (D24-14).
  - The route map binds every session event to its own problem (A23-32).
  - «مانده: طرح هنوز نیست» never appears after a solve (C24-17).
  - The look-back conjecture she is testing becomes a live problem (C24-5).
  - The assistant's «ثبت نشده» never contradicts a page «🔭 نگه داشتم» (D24-4).
  - A follow-up never asks her to fill the fields of a view that has none (A24-16).

Still open from round 23 (verbatim in each group's table):
  - A: A23-10, -14, -19, -24, -25, -26; A22-11, A21-11; the tA1 p5 re-asked check; the pA1 stack wording.
  - B: D11, D15, D23.
  - C: C22-2, C22-11, C23-5.
  - D: D23-5 (worse), 10, 11, 18, 30, 34, 38.
Each binds as written in its findings.

## Fixer split (when the owner says continue)
- loop (R1): a44 sys*, a26 gap contract.
- story (R2): a45, a38 import/stage, a27 turn question.
- correction (R3): a38/a27 retract and copies.
- classify (R4 + R6): a27/a26 classification and post-check.
- age (R5): a43, a34, a29 norm line, register.
- today (R7): a41/a40/a42/a33.
- Docs numbering: WORKLOG 101–106, PROGRESS 114–119, in the order above. WORKLOG 100 is the freeze status entry (99 went to a backtest routine).
- Independent bank VARIANTS_R24 written in parallel from the four reports.
- Merge order: correction ⇐ story ⇐ loop ⇐ classify ⇐ age ⇐ today.

## New owner-like questions (for docs/tours/owner-question-bank.md)
- From A:
  - «وقتی وسطِ یه مسئله یکی دیگه آوردم، از کجا بفهمم نقشه و پرونده و کارنامه هر کدوم مالِ کدومه؟»
  - «برگه‌ای که ثبت کردی کی جواب می‌گیره و از کجا می‌فهمم؟»
  - «اگه پیش‌بینیم غلط درومد، کارنامه کجا نشون می‌ده اطمینانم زیاد بوده؟»
- From B:
  - «هر چیزی که این‌جا گفتم کجا رفت؟»
  - «اگر داده‌های خوابم را از ساعت‌مچی بدهم؟»
  - «ابزاری که تازه ساخته شد هنوز آزموده نیست — به من می‌گویی؟»
- From C:
  - an unfit tool still declared «arrived»?
  - does a self-introduction opening still count as my problem?
  - does a number fixed days later change every draft and map?
  - can an invented pattern in the look-back become a real problem?
  - does a child only see age-appropriate puzzles?
- From D:
  - how do I know the system did not continue wrongly after an unrelated reply?
  - does the system know what is planned but not built (the book)?
  - is my grandchild's mind card separate from mine?
  - does a twice-booked prediction count twice in my calibration?

## E-mails
- B sent its 19 e-mails and C its 18.
- A's sends were refused by the permission classifier («Excess Sensitive Detail»), and so were D's («Real-World Transactions»). Their mail.html files wait in
  each scenario folder.
- Not sent on their behalf. The owner decides whether he wants them (open question, see STATE).
