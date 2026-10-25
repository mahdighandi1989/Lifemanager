# Round-25 decisions — ROOT MECHANISMS (main session; binding)

Round 25 ran on main 64dc0667 (the six round-24 fixers). Four Opus runners re-ran every round-24 scenario and added two «کارِ پیشینِ من»
scenarios per group (roadmap §21), two new territory negative arms, and the 31-question owner bank. A fifth run, B_s on Sonnet, ran group B
for the model comparison.

## Results
| Group | Zero-defect |
|---|---|
| A | 0/21 |
| B | 4/26 |
| C | 3/20 |
| D | 6/25 |
| **Total** | **13/92** (round 24: 2/75) |

S1: two.
- The territory loop on an unclear fit: B25·D1 = D25-21. The fit was accepted on frame or generic words, and her «نه» was ignored after «رسید».
- The prior-work arithmetic check reads correct fraction sums as wrong: D25-12.

## Model comparison
Result file: `decisions/COMPARE25_result.md`. Opus stays as the runner.
- Sonnet missed two S2 defects (U10, U13) that were in its own byte-identical prompts.
- It gave five wrong PASS verdicts and reported two false defects.
- Its «ارتقای لازم» was copied across scenarios, and its better/ files were copies of the original replies.
- S3 coverage was a tie.
- The verdict is not borderline on S1/S2. A repeat in round 26 is optional.

## Better than round 24 (evidence in the reports)
- Routing: A 243/243, B 248/248, C 246/246, D 0 wrong.
- Round-24 FIXED counts: most of every table. The round-24 S1 (sheet's own text) is fixed in all groups.
- Territory loop:
  - positive, unrelated, ruled-out, generic-only, best-of-two/three and sys_done all pass;
  - system-self sheets never mark a step waiting.
- One story:
  - the stage now follows the chat;
  - plan steps come only from real plans;
  - «از گفت‌وگو … درست است؟» works.
- Corrections: unit kept, form row asked, why with real quotes.
- Age:
  - one Jalali confirmation, never ISO;
  - two-digit years and age in words are read;
  - the no-norm line shows;
  - no adult puzzle for a child.
- Prior work (new):
  - every step gets a correct verdict with its reason;
  - correct steps are not re-asked;
  - dependants are marked;
  - nothing is rewritten without her yes;
  - people reached a verified result or the exact sticking point in every prior-work scenario.

## Root mechanisms (for the round-25 fixers — NOT launched; owner's pause after point 2, see STATE)
P1 — PRIOR-WORK LEDGER CONTRACT (S2 in every group: A25-1/2/3/4/6/7/10/20, B25·D2/3/4/6/7/8/11/13/15, C25-7/9/12/13/14/15/16/18,
D25-1/2/3/4/6/7/24, B_s D2–D5).
  - Fire the prior block only on the opening long message or a message she calls her prior work. Mid-session calculations never fire it
    (A25-5, C25-9, D25-24, B25·D13).
  - On a prior-work opening, the turn question is the resume point: the first step that is not ✓. Not A191 (whole-first), not the guess
    test (A25-1, C25-12, B25·D2, D25-6).
  - A later report MERGES into the ledger. It never replaces it, and a waiting step stays in it (A25-3, B25·D4, C25-9, D25-4).
  - A mixed reply gives each step its own state: she accepts one verdict and rejects another (D25-1).
  - Her own fix of a judged step is applied from the model's validated step or result, and the resume point moves (C25-14, D25-2, B25·D15,
    A25-2).
  - A dispute is read by meaning, not only by a leading «نه» (C25-13, B25·D3).
  - «نه، بس نیست!» is not a dispute (A25-7).
  - A dispute triggers a re-check with evidence, and its result lands on the page (A25-7).
  - Tested cases are not a prior ledger (A25-4). A test followed by a proof gets the proof question (A25-10).
  - Dependencies need more than a shared number (B25·D7).
  - The coach-facing check line («عددِ درست را لو نده», chkM) never appears in 🧭, 📜 or the person's view (B25·D6, D25-3, B_s D1).
  - RECALL22 never drops the turn's story (B25·D8).
  - The mind card credits correct prior steps and books a cause for wrong ones (A25-6, B25·D11, C25-18, B_s D5).
  - A correction of a number earlier steps used reaches the ledger and the chat result chain (C25-15).
  - 🧭 builds its main line from the prior steps (C25-16).
  - Closing a chat-solved problem never re-asks frame fields she already gave (D25-7).
P2 — PAGE ARITHMETIC CHECK (S1 D25-12; S2 C25-1, A25-8, B25·D5/D14, B_s D1).
  - Evaluate the whole right-hand side: fraction sums such as 4/2 = 1/1 + 1/2 + 1/2 and 7/1460 = 1/210 + 1/30660.
  - Read running sums («با ۱/۲۰ میشه ۴/۵») and chained «a = b = c».
  - Read «۲ و خرده‌ای، یعنی ۲٫۵۷» and the Unicode minus.
  - Check unit factors (mm→m, kJ→kWh).
  - Never show «درست» next to a ✗ step.
  - Also recheck arithmetic in later chat messages of a prior-work problem (B_s).
P3 — TERRITORY LOOP, UNCLEAR FIT (S1 B25·D1 = D25-21; S3 B25·D18/19, C25-19, B_s D14/D15, A25-22).
  - Words from the sheet's own framing count as generic: view names («💡 جایگاهِ ایده») and sheet-title words.
  - Token fragments («آر») are dropped.
  - Generic words carry low weight.
  - A match resting on such words ⇒ ask her, never «رسید».
  - Her «نه / همون نیست» after an arrival or an ask puts the step back to waiting, reopens the sheet with a note and restores the Today line
    (sys_fit false).
  - The page never asks and declares at the same moment (tie case).
  - The lag line wording for generic replies is fixed.
  - A sub-problem brought after closure gets its own waiting entry (A25-22).
  - No duplicate waiting rows.
P4 — STALE-NUMBER MECHANISM (S2 A25-9, C25-4, C25-8, D25-18, D25-19, B25·D10).
  - Mark only numbers actually derived from the changed value.
  - Never mark her goals, measured results, data percentages, deadline times, list indices or distance bounds.
  - Derived numbers that really follow (10 and 100 → 11 and 121) must be caught.
  - A ✏️ on numbers a guess or verdict never used must not set that guess or verdict aside.
  - Also cover chat results and the prior ledger (with P1).
P5 — ONE STAGE, ONE PROBLEM (S2 B25·D9 = U10, B25·D12 = U13, A25-16; S3 C25-5/6/10, A25-19, B25·D20, D24-9, A23-35 remainders).
  - One stage source: «# وضعِ کنونی», the prompt and the live problem always agree.
  - A sub-result never moves the problem to look-back (bp2 still).
  - A new problem raised mid-chat gets its own record, stage, route and dossier. It is never data of the first (oA1, oB1).
  - A woken problem never asks u0.
  - The stage never jumps to «اجرا» before a plan.
P6 — OPENING, CLASSIFICATION, POST-CHECK, REGISTER.
  - S2: the follow-up after navigation never forbids the tab she needs (C25-2).
  - S3:
    - long self-introductions and ages in words are stripped from statements (C25-11, A24-10);
    - teens get «تو» unless they use «شما» (A23-14);
    - one register per sentence (D25-23, C25-3);
    - post-check false positives: hypothetical «می‌گویی «…»» and the plural «دارید» (A25-17); a TeX quote of her formula is valid (D25-14);
    - an explicit «پیگیری کنم مثلِ یه مسئلهٔ واقعی» ⇒ chat_invent (D25-13);
    - the page's own two-question turn questions (s13, s19, aB3);
    - s19 «این گام جواب نداد؟» repeated (B_s);
    - «n!» wrapped in bdi (A25-11, A25-12-b).
P7 — TODAY, DOSSIER, MIND CARD, PREDICTIONS.
  - S2: one prediction gives one 🎯, also when judged through practice_log. A judged prediction leaves Today (A25-14).
  - S3:
    - «تا جمعه» means the next Friday (A25-15);
    - guesses refuted in chat get their outcome on the route (C22-11 STILL);
    - a child's school name is not kept in 📜 (D25-22);
    - the child's mind card line «معمای امروز را جواب داده‌ای» with no puzzle (C25-17);
    - route duplicates (B24·D18);
    - the deadline-correction why (A25-21);
    - «امروز» shows her own stated dates, not an invented plan date (B_s D7).

Still open from earlier rounds (verbatim in each group's table):
- A: A23-6, -8, -10, -14, -19, -25, -26; A22-11, A21-11.
- C: C22-5, C22-11.
- D: D23-10, -11, -12, -30, -35, -38.
Each binds as written.

## Fixer split (when the owner says continue)
| Fixer | Mechanisms | Files |
|---|---|---|
| prior | P1 | a45 prior ledger, a27 turn question, a29 credit |
| arith | P2 | a45 arithChk |
| loop | P3 | a44 sys* |
| correction | P4 | a38 liveStale and retract |
| story | P5 | a45, a38 stage, a27 |
| classify | P6 | a27, a26 post-check, a43 register |
| today | P7 | a41, a40, a29 |

- Docs numbering: take the next free WORKLOG and PROGRESS numbers on main at launch, in the order above.
- The a26 system prompt is at the 20,000-character cap. Keep new contracts in page-built user-prompt blocks.
- Independent bank VARIANTS_R25 from the four reports.
- Merge order: correction ⇐ story ⇐ prior ⇐ arith ⇐ loop ⇐ classify ⇐ today.

## New owner-like questions (for docs/tours/owner-question-bank.md)
- From A:
  - where do I see the re-check of a verdict I rejected?
  - does my child see which of their steps were right?
  - where does a piece brought after closure wait?
  - does a prediction judged twice count twice?
  - where do I see why a built tool did not fit?
- From B:
  - does the map split when I bring two problems?
  - where are the sheets filed for me and when do they get an answer?
  - if I reject a verdict, does the page compute the evidence itself?
  - if a tool that arrived does not help me, how do I know it is waiting again?
- From C:
  - did the new tool get tested on my data?
  - did my correction reach my own prior steps?
  - which of your verdicts have I confirmed?
- From D:
  - if I accept part of an answer and reject part, does the page keep each separately?
  - where do my earlier verdicts go when I report again?
  - when the page reads my correct arithmetic as wrong, how do I know the error is the page's?
- From B_s:
  - which of my numbers depend on this step?
  - which of my correct steps did the system credit?
  - how do I take back a mistaken «نه»?
  - where do my own stated dates appear in Today?

## E-mails
All runners sent their own e-mails this round: A 21, B 24, C 20, D 25, B_s 25. None was refused.
