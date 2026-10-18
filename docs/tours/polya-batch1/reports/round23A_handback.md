Round 23, runner A (group A): finished. 18 scenarios run: s01–s10 and pA1–pA3 replayed from round 22, plus aA1–aA3 (age), tA1 (territory) and oA1 (owner-like). Every scenario failed the zero-defect standard. There are no S1 defects; the S2 defects are listed below.

The repo was not edited. Each scenario dir has findings.md, RESULT.txt, route_table.md, better/r<N>.txt where a turn failed, DONE and mail23.txt; the ai/ folders are kept. All 18 e-mails went out via Gmail (subject «🧭 پولیا · دورِ ۲۳ · <sid> · … · ⚠️», storyboard link included). All my browser profiles are deleted and none of my harnesses are still running.

All files are under /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A/ — main ones: defects.md (full catalogue A23-1…A23-38, each with turn, class, severity, repro and file:line) and PARTS.md.

**Per-scenario RESULT**
| sid | RESULT |
|---|---|
| s01 | FAIL (A23-20 S2) |
| s02 | FAIL (A23-21 S2; A23-24 S3) |
| s03 | FAIL (A23-20 S2; A23-9, A23-8 S3) |
| s04 | FAIL (A23-6, A23-16 S3) |
| s05 | FAIL (A23-6, A22-11, A21-11 S3) |
| s06 | FAIL (A23-25 S3) |
| s07 | FAIL (A23-21 S2; A23-24, A23-17 S3) |
| s08 | FAIL (A23-9 S3) |
| s09 | FAIL (A23-5→A23-35 S2; A23-26, A23-27 S3) |
| s10 | FAIL (A23-4 S2) |
| pA1 | FAIL (A23-22 S2; A22-12, A23-8, A23-9 S3) |
| pA2 | FAIL (A23-7 S3 only; P1 and P2 both PASS) |
| pA3 | FAIL (A23-23, A23-22 S2; A23-8, A23-7 S3) |
| aA1 | FAIL (A23-1, A23-2 S2; A23-7, A23-8, A23-18, A23-19 S3) |
| aA2 (look-back family) | FAIL (A23-3, A23-1 S2; A23-8–A23-13 S3) |
| aA3 | FAIL (A23-1, A23-2 S2; A23-11, A23-14, A23-15 S3) |
| tA1 (territory) | FAIL (A23-36, A23-37, A23-35 S2; A23-8 S3) |
| oA1 (owner-like) | FAIL (A23-28, A23-30, A23-32, A23-35, A23-38 S2; A23-29, A23-31, A23-34, A23-8 S3) |

**Main S2 defects (all class b, page)**
- **A23-1** — the birth card rejects Jalali dates and shows a technical message (`a43_age.js:39-46`, `:59`).
  - Repro: type «۲۰ اردیبهشت ۱۳۳۸» in the card.
  - In aA2 and aA3 the date was saved only because the model converted it.
- **A23-2** — opening problem messages from the child (aA1 p1) and the elder (aA3 p1) are routed `lla_assistant` (`a26_assist.js:615`).
- **A23-3** — aA2 p1: «I proved it, why?» is staged «طرح‌ریزی», not look-back (`a27_tour.js:1499`).
- **A23-4** — s10 p4: the correction-backup block fires on a non-correction after an omitted coach_state (`a27_tour.js:4118`).
- **A23-35** (extends A23-5 / A22-27) — the live problem's stage never advances from chat.
  - The whole-first turn question repeats: oA1 7 times, tA1 p7/p10/p11, s09.
  - Cause: Q_WHOLE stays until the page card is saved (`a38_live.js:1583-1586`).
- **A23-20** (= A22-1) — the post-check counts the page's own two-sentence question as two questions: s01 p5, s03 p1/p6/p14 (`a27_tour.js:4247`).
- **A23-21** (regression) — copies of a corrected fact are neither changed nor asked: s02 form datum, s07 live statement and form rows. Round 22 asked (`a27_tour.js:3765`).
- **A23-30** — oA1 p7–p8: after 10⇒12 the pinned goal and the result 45 were neither changed nor asked; the result line shows only a fragment.
- **A23-22** — stucks inside an open prerequisite detour are booked «طرح‌ریزی −» with cause «نامعلوم», and planning is named weakest (pA1 50%, pA3 73%). This breaks P1 (`a44_route.js:132-139`).
- **A23-23** — pA3 nested order broken:
  - Parent marked mastered while its child was still open; the rewrite forced a return to the main step.
  - Later the return target was the already-learned parent (`a44_route.js:199-212`).
- **A23-28** — oA1 p2 (bank #6): the prompt never tells the model what age is used for (adult band has no block; system map has no age line).
- **A23-32** — oA1: the route map and dossier of problem 2 show problem 1's guess and correction (`a44_route.js:401-437`). Sheet #101 filed.
- **A23-36** — tA1: the waiting sub-problem is not marked with its sheet id on 🔭, the map or the dossier.
- **A23-37** — tA1: the resume loop (sheet closed ⇒ sub-problem reopens) does not exist.
- **A23-38** — oA1 p16: the system map has no evidence on offline use, data storage or model independence. Sheet #102 filed.

**S3 defects (also b)**
- A23-6 e4/e5 at wrong moments; A23-7 raw greeting used as problem name (includes the child's name).
- A23-8 route-map labels: «۳ مرحله از ۴», «آزموده نشده» for tested guesses, empty hover tips, truncated prerequisite labels, fragment destinations.
- A23-9 garbled teen line «… فقط پرسشِ همین پاسخ کن» (`a43_age.js:111` + `a27_tour.js:4488`).
- A23-10 wrong technique suggested; A23-11 duplicate Today lines; A23-12 inconsistent practice window; A23-13 practice report becomes the chat problem.
- A23-14 page lines say «تو» to a «شما» user; A23-15 a prediction re-read as a new guess; A23-16 duplicate result block; A23-17 «(شاید)» block on non-corrections.
- A23-18 dossier books a prerequisite stuck as «طرح‌ریزی −»; A23-19 opening guess gets the whole-first question; A23-24 duplicate correction lines; A23-25 «stuck» booked from a pure command.
- A23-26 typo «تا تا ریشه» (`a21_orient.js:75`); A23-27 unlinked list item not asked after a correction.
- A23-29 two confirmation lines for one creation; A23-31 «not recorded» shown for a guess that was recorded; A23-34 no guess ids in the prompt, due prediction missing from Today.

**My own model errors (class d)** — each has a better/r<N>.txt: aA2 p8 quote with «…»; aA3 p4 invented quote; pA2 p5 `\times` became a tab; s07 p7 replayed round-22 reply claimed a question the page no longer asks; oA1 p2/p4/p6/p20.

**«ارتقای لازم» (top)**
1. Advance the live-problem stage from coach_state, and drop whole-first once the user has said the whole in chat.
2. Bind every session event to its own problem (route map, dossier).
3. Add the pinned goal, numeric results, live statement and form rows to the copy candidates after a correction.
4. Prerequisite stack: no mastery close while a child is open; return to the nearest open waiting step; book stucks inside a detour as `cause: prereq`.
5. Birth card: accept Jalali and give a human error message; system-line pronoun follows the conversation's register; fix the teen line.
6. Mark 🔭 sub-problems «waiting #sheet» and build the resume loop.
7. Give the system map a self-knowledge line: what age is for, storage/offline, model independence.
8. Post-check: count the page's own turn question as one.
9. Route to `lla_coach` for opening problem messages.

**Age verdicts**
- Bands are correct for all ages seen (9, 14, 16, 17, 22–45, 67). Reply tone fit each age and minors' safety lines held.
- The mind card shows «سن: N». The no-norm line appeared for 9, 16 and 67; adults are compared only with their own age band.
- Real arrival at the result in all three age scenarios.
- Failures: A23-1 (card), A23-9 (teen line), A23-14 (pronoun in page lines), A23-28 (model cannot say what age is used for).

**Prerequisite verdicts**
| sid | P1 | P2 | Notes |
|---|---|---|---|
| pA1 | partial (A23-22) | ✓ | concept, diagnostic, teaching, mastery, exact return, 🧩 all ✓ |
| pA2 | ✓ | ✓ | the ability line «این کم‌هوشی نیست» appeared |
| pA3 | partial (A23-22) | ✗ (A23-23) | — |
| aA1 | ✓ | ✓ | child's name used in 🧩 titles (A23-7) |
- Route map shots: before / inside nested / after return plus hover were taken for pA3 and aA1. pA1 lacks the "before" shot and pA2 has only the end shot (my execution gap).

**Correction table vs round 22**
- **Fixed:** A22-2, A22-3, A22-4, A22-5, A22-6, A22-7, A22-8, A22-10, A22-14, A22-15, A22-19, A22-20, A22-21, A22-23, A22-24 (S1 — prerequisite layer now works), A22-26 (route map exists), A22-28 (chat list_add path), A22-29, A22-30.
- **Still open:** A22-1, A22-11, A22-12, A22-17, A22-27 (now wider), A21-11.
- **Regression:** copy asks (A23-21 in s02 and s07; A23-30 in oA1).
- s02: statement, verdict and «حل شد» set aside ✓; form datum not asked ✗.
- s07 ✏️: plot and chat statement ✓; live statement and form rows ✗.
- s03, s04, s05, s09, s10 behaved as in round 22 or better.

**Routing** — 18 scenarios, 2 wrong: aA1 p1 and aA3 p1. Everything else correct, including ✏️, follow-ups, consultant turns, and s07 p1 / oA1 p1.

**Owner-like scenario (oA1)** — 8 bank questions asked: #2, #3 and #9 PASS; #11 PASS for honesty plus a filed sheet (the page itself still lacks the knowledge); #6 and #10 PARTIAL; #1 and #8 FAIL.

**Territory scenario (tA1)** — sheets #101 (safety) and #102 (prior art) were both filed per contract with the consultant's second opinion. The resume loop is missing, recorded as S2 per the addendum.

**PARTS.md, «نسبت به دورِ ۲۲»**
- **Much better:** the prerequisite layer.
- **Better:** route map (new), question after a result, stuck ladder, practice and T24, dossier, running lists from chat.
- **New and mostly good:** age card and audience block; gap sheets with consultant.
- **Worse:** correction copy asks (regression), Today duplicates.
- **Same:** post-check counting the page's own question as two (A22-1), whole-first repeat (now wider, A23-35).