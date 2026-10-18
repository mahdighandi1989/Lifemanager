**Round 23, group C: finished.** All 17 scenarios ran: s21–s29, pC1–pC3, the age scenarios aC1–aC3, the territory scenario tC1 and the owner-like scenario oC1. I did not edit the repo and made no commits.

Every scenario folder has `findings.md` (starting with «## خلاصه برای مالک» and ending with «## ایده‌ها»), a `DONE` file, a `mail.html`, and its `ai/` folder kept (pN.json + rN.txt). Every scenario ended with exit. I deleted only my own browser profiles, and none of my processes are still running. All 17 e-mails were sent with the Gmail tool, and the round-23 C line is in STORYBOARD_LINKS.md.

Output is in `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23C/`: `PARTS.md`, `defects.md`, `routing.md`, `NOTES.txt`, and one folder per scenario. Paths below are relative to that folder.

**Better replies (`<sid>/better/rN.txt`, first line `# author: runner-simulated`):** s23/r10, s25/r13, s25/r15, s25/r17, s29/r9, aC2/r2, tC1/r2.

## RESULT per scenario
Totals: 1 PASS, 6 PARTIAL, 10 FAIL. On the 12 scenarios replayed from round 22 the count went from 0 PASS / 4 PARTIAL / 8 FAIL to 1 PASS / 5 PARTIAL / 6 FAIL.

| Scenario | RESULT | Defects that decide it |
|---|---|---|
| s27 | PASS | none |
| s21 | PARTIAL | C22-2 S3, C22-11 S3 |
| s24 | PARTIAL | C22-11 S3 |
| s26 | PARTIAL | C22-11 S3 |
| s28 | PARTIAL | C22-11 S3 |
| pC1 | PARTIAL | C23-3 S3 (latent), C23-13 S3 |
| aC1 | PARTIAL | C23-12 S3, C23-13 S3 |
| s22 | FAIL | C22-5 S2; C23-7, C23-15 S3 |
| s23 | FAIL | C23-1, C23-4, C22-5 S2 |
| s25 | FAIL | C22-5, C23-1 S2; C23-5, C23-20, C23-23 S3 |
| s29 | FAIL | C23-1 S2; C22-2 S3 |
| pC2 | FAIL | C23-2, C23-3 S2; C23-13, C23-17 S3 |
| pC3 | FAIL | C23-2, C23-3 S2; C23-11, C23-13, C23-17 S3 |
| aC2 | FAIL | C23-11, C23-19 S2; C23-10, C23-14, C23-17 S3 |
| aC3 | FAIL | C23-8 S2; C23-9, C23-11 S3 |
| tC1 | FAIL | C23-2, C23-18 S2; C23-6, C23-11, C23-21 S3 |
| oC1 | FAIL | C23-11 S2; C23-6, C23-16, C23-22 S3 |

## New defects (files under `apps/learning-architecture/src/app/`)
Class: a = page logic, b = prompt/turn question, c = display, d = me.

**S2:**
- **C23-1** (b, regression): a practice self-report ("کامل یادم بود", "۸۰٪ یادم بود") or a report of using a model elsewhere is read as a new problem and gets the A191 question «کلِ مسئله را در یک جمله». Repro: s29 p9, s23 p10, s25 p17. Location: `a27_tour.js:1728` (AS.notProblem) and `:1156` (A191 gate).
- **C23-2** (a): the mind card books the wrong cause for stucks.
  - pC3: stucks during teaching turns inside the nested prerequisite stack are booked as skill, giving «طرح‌ریزی ضعیف‌ترین ۹۵٪».
  - pC2 p3: a stuck before the diagnosis is never re-attributed to the prerequisite (59%).
  - tC1: a stuck caused by a missing system tool is booked as her own «فهم» weakness (73%).
  - Location: `a44_route.js:136–143`, `a29_mind.js:389–390`.
- **C23-3** (a): the opening turn has no «# پیش‌نیاز» block, because PRE.scope needs chatFocus. Repro: pC2 p1, pC3 p1 («مستطیل رو بلدم… ولی این مثلثه»). Location: `a44_route.js:45–49`.
- **C23-4** (a): a ✏️ edit with two number pairs (sugar 1⇒1.5, butter 100⇒120) is not applied at all (changed:[]). Repro: s23 p15. Location: `a38_live.js:4595`.
- **C23-8** (a): the birth-date card and birth rule accept Gregorian dates only; the 67-year-old knows only her Jalali date. The model converted it correctly (1959-03-16). Repro: aC3 p2. Location: `a43_age.js:38/59/132`.
- **C23-11** (a, need map): chat and forms are disconnected.
  - The route map and geo strip ignore a plan given in chat ("اکنون: فهمِ مسئله").
  - The u-form and look-back forms re-ask questions already answered in chat.
  - Repro: oC1 p10/p12, aC2, aC3, tC1, pC3. Location: `a44_route.js:479`, the lpB gate.
- **C23-18** (a, missing piece): there is no loop "gap sheet built ⇒ system notices ⇒ checks it answers the step ⇒ resume", and no "waiting for tool" point on the route map or in the dossier. Repro: tC1 p11.
- **C23-19** (a): an opening coaching turn was routed to lla_assistant. Repro: aC2 p1.

**S3:**
- **C23-5:** a retract without rests sets aside every verdict, including a proof that does not depend on the corrected data. Repro: s25 p13/p15 (partly my fault: my reused reply omitted rests).
- **C23-6:** the post-check fires falsely («صفحه هنوز اصلاح را انجام نداده») on "ثبت شد / ثبت می‌شود" with no correction in play. Repro: tC1 p12, oC1 p14. Location: `a27_tour.js:4275`.
- **C23-7:** list_add refuses a quote composed from two consecutive messages. Repro: s22 p21. Location: `a41_practice.js:1866`.
- **C23-9:** a raw id «(pl1)» appears on Today. Repro: aC3.
- **C23-10:** a candidate meaning of a word is read as a guess. Repro: aC2 p2.
- **C23-12:** the chat-problem statement is the whole first message including the greeting, and the restatement quoted it to a 9-year-old. Repro: aC1 p5. Location: `a27_tour.js:2107`.
- **C23-13:** route-map point labels are clipped, say «پیش‌نیاز» twice, and show the concept only on hover. Repro: pC1–pC3, aC1. Location: `a44_route.js:506`.
- **C23-14:** the geo strip stays stale after the live problem is solved. Repro: aC2.
- **C23-15:** raw "refuted/confirmed" values appear in the session dossier. Repro: s22 p12. Location: `a40_dossier.js:90`.
- **C23-16:** the correction display shows old == new (clipped before the changed number) with an empty reason. Repro: oC1 p8.
- **C23-17:** the turn question re-asks a check she has just reported. Repro: pC2 p8, pC3 p15, aC2 p4.
- **C23-20:** list_add(models, use) with a name not literally in the message creates a duplicate item holding the whole sentence. Repro: s25 p17. Location: `a41_practice.js:1869`.
- **C23-21:** quotes «…» inside the reply text are not checked against her messages. My wrong quote in tC1 p2 went through.
- **C23-22:** typing «بله، دادهٔ ۲ رو هم عوض کن» in chat is not applied as an answer to «این‌جا هم عوض شود؟». Repro: oC1 p18.
- **C23-23:** a turn question unrelated to her list request. Repro: s25 p16.

**Round-22 defects still open:** C22-2 (s21 p6, s29 p7); C22-11 (s21, s24, s26, s28); C22-5 partly (s22 p9 lpOWhat, s25 p11 lpBOther, s23 p7 egg result).

## «ارتقای لازم»
1. Classify practice and model-use reports as "not a problem" before the A191 gate (C23-1).
2. Book cause = prerequisite for every stuck while a prerequisite stack is open, and re-attribute earlier unknown stucks in the same step. Book a stuck caused by a missing tool as "system" (C23-2).
3. Extend PRE.scope to the opening turn (C23-3).
4. Apply each pair of a multi-pair ✏️ edit (C23-4).
5. Accept Jalali dates in the age card and the birth action (C23-8).
6. Feed validated chat events (plan, u/b answers) into the route map, geo strip and forms; forms should show "from chat: … — correct?" (C23-11).
7. Build the gap-sheet resume loop and the "waiting for tool" point (C23-18).
8. When rests is missing, keep verdicts that do not consume the corrected data (C23-5).
9. Make the copy search work by meaning (C22-5).
10. Treat a chat «بله» as pressing the copy-ask button (C23-22).
11. Show chat-guess outcomes in the dossier (C22-11).
12. Strip greetings from the chat statement (C23-12).
13. Use the concept name as the route label (C23-13).

## Age verdicts
- **Birth date:** recorded in 17/17 scenarios; 16 through the page's own card, aC3 through the model's birth action.
- **Audience blocks:** correct for every band. Teens (s21 12, pC1 15, aC2 16) got the teen block with minors' safety lines. The child (aC1 9) got the child block with safety lines. Elders (s25 61, aC3 67) got the elder block. Adults got no block, which is correct.
- **Tone:** fitted every age, with no childishness for teens and no condescension for elders. Pólya logic was unchanged, and each person really reached the result.
- **Mind card:** after an anchored puzzle, aC1 showed the honest line «برای این سن هنجارِ معتبر در دست نیست (منبع Zorowitz…)؛ فقط روندِ خودت». In the other scenarios the norm column had no anchored data, so the age-band comparison was not tested there.
- **Defects found:** C23-8 (Gregorian-only date entry) and C23-12.
- **Question bank:** in oC1, Q6 ("compared with whom?") got an exact answer with sources.

## Prerequisite verdicts (P1 / P2)
- **Prerequisite flow (P1):** the full chain worked in pC1, pC2, pC3, aC1, aC3 and tC1:
  - exact concept and step taken from her words
  - diagnostic question, and teaching only as far as the step needs
  - mastery check, then exact return with the waiting step restated
  - the 🧩 item linked by pid
  - In pC3 the nested stack (√ under Pythagoras) opened and closed in the right order.
  - When the diagnosis said she already had it (aC1, aC3), no extra teaching was given.
- **Mind card:** correct in pC1. Wrong in pC2, pC3 and tC1 (C23-2).
- **Opening contract:** missing in the first turn (C23-3).
- **Route map (P2):**
  - pC3 was shot at three moments (in_detour, nested, after_return) with hover; the dotted detours and the nested offset are correct.
  - oC1 was shot at four moments and shows the correction arc.
  - pC1 and pC2 were shot only at the end; that coverage gap is mine.
  - Weak spots: C23-11, C23-13, C23-14.

## Correction table vs round 22

| Trial | Round 22 ⇒ 23 |
|---|---|
| s22 C1/C4 «صبح⇒ظهر» | ✓ ⇒ ✓ |
| s22 C2 ✏️ «دفترِ نگهبانی» | partial ⇒ partial (C22-7 fixed, C22-5 remains) |
| s22 C3 «امروز⇒شنبه» | ✓ ⇒ ✓ |
| s22 deadline «پنجشنبه⇒شنبه» | ✓ ⇒ ✓; deadline:dl_ key now in the prompt and «تحویل دادی؟» appears (C22-14 fixed) |
| s23 C1 eggs 8⇒9 | ✗ ⇒ ✗ (C22-5) |
| s23 C2 35⇒40 minutes | ✓ ⇒ ✓ |
| s23 C3 pan size | partial ⇒ ✓ (title, basis-only set-aside, copy with units asked) |
| s23 N5 ✏️ two numbers | broken ("۱.۵.۵") ⇒ not applied (C23-4) |
| s25 C1 typo | ✓ ⇒ ✓ |
| s25 C2 ✏️ telescoping | ✗ ⇒ ✗ |
| s25 C3 «۱۰⇒۸» | ✗ ⇒ statement ✓ but the proof verdict was over-withdrawn (C23-5) |
| s29 «۴۰⇒۴۴» | partial ⇒ nearly ✓ (verdict kept with rests; u.one and d1 asked) |
| oC1 «۱۵⇒۱۲» (new) | ✓, display clipped (C23-16) |
| oC1 «۱۲۰⇒۱۴۰» (new) | ✓, d2 asked |
| oC1 chat «بله» (new) | ✗ (C23-22) |
| Non-corrections | all ✓ |

## Routing
205 of 206 turns were routed correctly. The one miss is aC2 p1 (lla_assistant for a coaching opening). The consultant second-opinion call in tC1 went correctly to learning_architecture and is counted separately. Prompt scan: 0 of 205 prompts carry more than one question directive (C22-3 fixed).

## Running lists
- s22: assumptions ✓; the signal/claim with its recheck date and on-time return to Today ✓; ambiguities with percentages (C22-15 fixed).
- s25: models list with real use days ✓ and mistakes ✓.
- Problems: the two-message quote is refused (C23-7) and the model use creates a duplicate item (C23-20).

## New-scenario verdicts
- **Look-back family (aC2):** a full look-back that spawned two new problems, plus a day-3 return through Today.
- **Territory (tC1):** idea broken into known/unknown; the system territory map was checked first; the second opinion agreed; gap sheet #101 was filed with the full contract. The resume loop is absent and recorded as S2 (C23-18).
- **Owner-like (oC1):** asked Q1, Q2, Q3, Q4, Q6, Q8, Q9 and Q11; each got an answer with evidence or an honest "missing", with no show.

## PARTS summary («نسبت به دورِ ۲۲»)
- **Better:**
  - Turn question after a step (C22-1 fixed).
  - Corrections: C22-6, 7, 9 (when rests is reported), 10 and 14 fixed.
  - Running lists: C22-15 and C22-16 fixed.
  - The prerequisite layer, the 🧩 link and the route map now exist (C22-P1, P3, P4 fixed).
  - Today now asks «تحویل دادی؟» / «انجام شد؟».
- **Same:** C22-11 (dossier guess outcomes); C22-P2 for nested stacks.
- **Worse:** C23-1 (practice report ⇒ A191); C23-4 (multi-number ✏️ not applied); routing 136/136 ⇒ 205/206.
- **Newly seen through the new tests:** chat ≠ form (C23-11), the gap-sheet loop (C23-18), Jalali dates (C23-8).

## My own (class d) mistakes, disclosed
- The button remap bug forced reruns of s26 and s27, and auto-reuse in pC3 forced a rerun of pC3.
- s25 p13: my reused retract omitted rests (my share in C23-5).
- oC1: my replies carried no memory field until p16.
- aC2: my step automation recorded no steps, so the verdict was only "verified".
- tC1 p2: I quoted oC1's sentence as hers.
- pC1/pC2: route map shot only at the end.