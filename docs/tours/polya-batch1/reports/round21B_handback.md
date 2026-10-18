## Round 21, runner B (s11–s20): summary

**None of the 10 scenarios is defect-free, so batch 1 does not end.**

- **What improved since round 20:**
  - The correction engine passed all six s18 trials. The ✏️ edit that moves a plan's day also passed in s19.
  - 12 of the round-20 defects are fixed end to end.
- **What is new and fails:**
  - **Routing:** 19 coaching turns were sent as the fast task (lla_assistant).
  - **Practice from chat:** a practice case cannot be started from chat.
  - **Corrections:** some corrections report "nothing changed" although a record exists, so the page never asks whether her own typed copy should change.

**Run setup:**
- **Build:** branch at ef3c1c67 (plus the aa8f1e06 docs commit); `build.py --check` in sync; dist built 02:41, after the merge.
- **Replay:** round20B ctl replayed with harness5 and a new driver, `round21B/tools/drv.py`. It matches each AI call to its round-20 twin by her turn text, so the page's new rewrite requests and follow-ups did not shift the answers.
- **New replies:** written wherever the round-21 rules required:
  - correction result blocks, and «فرستادم» instead of a premature claim;
  - retract `key`/`old`, `practice_log`, rewrite requests;
  - the A191 turn question in s20, and the navigation follow-ups.
- **Every scenario:**
  - ends with `{"exit":true}`;
  - has findings.md and DONE;
  - has a dossier read and shot from `post21.js` at the scenario's final simulated day;
  - has a routing.md table.
- **Scans:** the strict prompt scan (now covering both lla_assistant and lla_coach prompts) and the developer-note scan are clean.
- **E-mails:** 10 sent («🧭 پولیا · دورِ ۲۱ · …», RUNNER16 structure, link to storyboard B).
- **Cleanup:** my browser profiles are deleted and none of my processes are running.
- **Test data:** I seeded no records; everything was made through the UI or the assistant in throw-away profiles.

All paths below are under `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21B/`.

## Results
| Scenario | Result | Defects |
|---|---|---|
| s11 | FAIL | S2: D1 |
| s12 | FAIL | S2: D1, D5 · S3: D9 |
| s13 | FAIL | S2: D1 |
| s14 | FAIL | S2: D2, D5 · S3: D10 (practice over 20 days passes) |
| s15 | FAIL | S2: D1 (all 6 turns), D5 |
| s16 | FAIL | S2: D1, D5 |
| s17 (new correction trials) | FAIL | S2: D3, D4, D5 · S3: D9, D10 |
| s18 (correction trials, math) | FAIL | S2: D1, D5 · S3: D7, D8, D12, D14 (all 6 trials pass) |
| s19 (correction trials, life; calibration over time) | FAIL | S2: D2, D3, D5, D6 · S3: D9, D11, D12, D13, D15 |
| s20 | FAIL | S2: D5 · S3: D9 (round-20 D13 fixed) |

## Defects (full text in CATALOGUE.md and in every findings.md)

**S2**
- **D1 (class b) — routing by keyword.**
  - What happens: a coaching turn with no problem, stuck, failure or life keyword goes to lla_assistant, even when the page itself shows «مسئلهٔ گفت‌وگو … مرحله». Later turns then stay on lla_assistant too.
  - Where: s15 p1–p6, s12 p1–p4, s13 p1–p3, s18 p1–p3, s16 p1–p2, s11 p1.
  - Location: a26_assist.js `AS.chatTask` (~line 560, the `sig` gate).
- **D2 (class b) — no start_practice when no case is open.**
  - What happens: `PR.promptBlock` returns "" and no other prompt part names the action. Her explicit request («یه پرونده‌ی تمرین براش باز کن», s14; «برای سنجیدنِ پیش‌بینی‌هام یه پرونده‌ی تمرین باز کن», s19) can only be answered with navigation.
  - In s14 she needed 4 page hops, and the assistant pointed to a button that is not on the technique page.
  - Consequence: the round-20 consent fix cannot be reached from chat.
  - Location: a41_practice.js `PR.promptBlock` (~line 1153).
- **D3 (class b) — a correction reports "nothing derived" although a record exists, and «این‌جا هم عوض شود؟» never appeared.**
  - s19 «۷۴٫۵ نه ۷۴»: the week-8 result record keeps the old value.
  - s19 «نیم کیلو نه یک کیلو» with key step:1: the step-1 chat report keeps «یه کیلو», and her own page outcome «یک کیلو اضافه شد» is not asked about.
  - s17 «بام ۱۸۰ نه ۲۰۰»: her typed d1 «سطحِ بامِ انبار ۲۰۰ مترمربع» and the measure line are not asked about. The chat fragment was «200 m^2» against the form's «۲۰۰ مترمربع».
  - Location: a38 `retractOne`/`sameFact`, a27 `AS.retractApply`.
  - Repro: the s17/s19 sequences in seq.json.
- **D4 (class b) — a ✏️ edit that changes several numbers becomes one coarse fragment.**
  - What happens: the plan pl1 «مخزن بتنی ۲۰ مترمکعبی» did not follow; its `src` is the bare message id "u4" with no span. Today still shows ۲۰ (s17).
  - Location: a40 `AS.retractEdit` diff; a27 plan `src`.
- **D5 (class b) — dossier still incomplete.**
  - Missing for chat-closed problems: the chat work (s12 guesses; s18 similar triangles and the derivative).
  - Missing corrections: the ones that "changed nothing" (s19, s17) and the s18 lesson correction.
  - Missing practice evidence: the T24 page judgements (s19).
  - Session dossiers are thin or only mind events: s15, s16, s20, s12 day 2.
  - Location: a40_dossier.js.
- **D6 (class b) — one act, two records in calibration (s19).**
  - The chat `practice_log` does not judge the dated 🎯 of the same prediction; Today showed it overdue for 2 days.
  - The plan and the 🎯 for the same gym visit are both lines in Today.
  - The mind row reads «۱ نشست · اندازه‌ای نیست» although 3 predictions were judged.
  - Location: a41 `practice_log`/`t24Sync`.

**S3**
- **D7 (b):** the change summary clips old and new text before the difference, so both look identical (s18).
- **D8 (b):** the mind card keeps «نتیجه سالم ماند» after the verdict was set aside (s18).
- **D9 (b):** raw ids are shown — «chatok|u|…» and «chat|…» in session dossiers (s12, s20), and «rebook:u5»/«rebook:u10» in the mind card «از کجا؟» (s17, s19).
- **D10 (c):** post-check false positives cost an extra model call.
  - «کجاها عوض شد» was read as a premature claim (s17).
  - «می‌گوید» was read as «شما» (s14).
  - Location: a27 CLAIM20 ~line 3931, SIGN_SH ~line 2862.
- **D11 (b):** before any prediction is judged, the calibration criterion shows invented numbers «۰٪ … ۵۰٪ ± ۲۹» (s19; a41 `calibCrit`).
- **D12 (b):** turn-question misfit — the taste question on the datum-correction turn (s18 p7); s19 p6 re-asks the p5 question.
- **D13 (b):** after a chat correction the bubble is unmarked and its plot unchanged (round-20 D6, s19).
- **D14 (b):** the s18 lesson correction books no self-correction event, while the other two corrections did.
- **D15 (b):** a one-night 🌱 («امشب شامِ سبک») is still asked about in Today 2 months later (s19).

**Status of round-20 defects**
- **Fixed, verified end to end:** D1, D2, D3, D4, D5, D9, D10 (T41), D12, D13, D16, D17.
- **Partial:** D7 (now new D5), D11 (now new D2), D14 (now new D12).
- **Persists:** D6 (now new D13).
- **Not exercised:** D15 (variants not run).

## Correction trials
| Scenario | # | Turns back / path | What should change | What did | Must stay — did it | Assistant vs page | vs round 20 |
|---|---|---|---|---|---|---|---|
| s18 | 1 | 6 back · chat · datum ۵→۶ (verdict-affecting) | statement and form; verdict set aside | ✓ all three, with reason and history | other data — ✓ | «فرستادم», then the page result ✓ | FAIL → PASS (S3: D7, D8, D12) |
| s18 | 2 | 1 back · ✏️ · −0.37→−0.12 | bubble and history | ✓; editor visible; no fallback block; lla_assistant | ✓ | = page block | PARTIAL → PASS |
| s18 | 3 | 3 back · chat · two-clause lesson, only clause 1 | clause 1 only | ✓ | clause 2, verdict, events — ✓ | ✓ | FAIL → PASS (S3: D5, D14) |
| s18 | 4–6 | negatives: real-world «اشتباه کردم», teacher's quote, «اگه نرخ ۷ بود؟» | nothing | nothing | ✓ | — | PASS |
| s19 | 1 | 1 back · chat · ۷۴→۷۴٫۵ in a five-weight sentence | week-8 result | nothing («رکوردی ساخته نشده بود») | other weights — ✓ | consistent with page | FAIL (over-withdrawal) → FAIL (D3) |
| s19 | 2 | 3 back · ✏️ · plan day شنبه→یکشنبه | plan text and due; Today | ✓; 28→29 آذر; Today on Sunday | ✓ | = page | FAIL → PASS |
| s19 | 3 | 6 back · chat · step amount; she also typed it on the page | step report; copy ask | nothing; no ask | step failure — ✓ | consistent | FAIL → FAIL (D3) |
| s19 | 4–5 | negatives: cake «اشتباه کردم», coach's quote | nothing | nothing | ✓ | — | PASS |
| s17 (new) | 1 | 1 back · ✏️ · three numbers | result and plan pl1 | result rebooked; plan and Today keep ۲۰ | wall / area — ✓ | page result omits the plan | FAIL (D4) |
| s17 (new) | 2 | 2 back · chat · two facts, one changes; also typed on the form | copy ask for d1 and the measure line | nothing; no ask | rainfall — ✓ | «فرستادم» after a forced rewrite | FAIL (D3) |
| s17 (new) | 3 | negative · question «اگه بارش ۱۵۰ بود؟» | nothing | nothing | ✓ | — | PASS |

## Routing (per-turn tables in `<sid>/routing.md`)
| Scenario | Correct | Wrong | Wrong turns |
|---|---|---|---|
| s11 | 4 | 1 | p1 |
| s12 | 5 | 4 | p1–p4 |
| s13 | 2 | 3 | p1–p3 |
| s14 | 15 | 0 | — |
| s15 | 0 | 6 | all |
| s16 | 5 | 2 | p1–p2 |
| s17 | 8 | 0 | — |
| s18 | 10 | 3 | p1–p3 |
| s19 | 14 | 0 | — |
| s20 | 5 | 0 | — |

- Correct as lla_assistant: every automatic «[سامانه: …]» follow-up, every ✏️ turn, and the action-only «آره، ثبتش کن.».
- Correct: rewrite calls keep the task of the turn they rewrite.
- No wrong lla_coach was seen.

## Time and practice
- **s14 (T41 case, page worksheet → 20 simulated days):**
  - day 1/3/7 cycle, one Today line per day;
  - a forgotten day, then a late session that re-anchors the cycle;
  - «تثبیت شد» on 21 آبان from 60/70/80% on separate days;
  - Today brought the check-in by itself;
  - on the chat report «۴۰٪» the `practice_log` was validated against her quote, «تثبیت» was withdrawn with its reason, and the next window was set;
  - the mind card «🏋» shows one row per case with all 7 dated sessions.
  - Only the chat start failed (D2).
- **s19 (T24 case, opened from the problem page, 25 آذر → 30 دی):**
  - two-stage 🎯 dated when written;
  - chat `practice_log` «(درست)»;
  - page judgements, including one late and one regression;
  - overdue shown after 13 days;
  - stability correctly not declared;
  - fails on D2, D6, D11, D15.

## ارتقای لازم
- Reopen execution when a datum of a solved problem is corrected (s18).
- Field-level keys on the understanding form, so a chat correction can find her own typed copy (s17).
- A weight log kept as a record, so the plot can follow a correction (s19).
- Link 🎯 ⇄ plan ⇄ case session at creation (s19).
- A `start_practice` action available whenever she asks.
- A T21 experiment case and a results table (s20).
- Carried over from earlier rounds: a «use it elsewhere» case after look-back (s11), a letter grid (s12), a rehearsal space (s13), a formula-choice drill (s14), a wall card and multi-student role-play (s15), a parents' card (s16), a units calculator (s17), a related-rates slider (s18).

## PARTS.md summary («نسبت به دورِ ۲۰»)
Every part touched is «یکتا»; the practice section on the problem page belongs «درونِ مسیرِ 🔭».

| Part | vs round 20 | Evidence / remaining |
|---|---|---|
| 🔭 understanding stage | better | source = opening message |
| 🔭 look-back stage | better | clause-level lesson fix |
| 🔭 plan / execution stages | same | — |
| practice section on the problem | better | refuted guess shown correctly |
| assistant | better | A191 back, register/claim post-checks; worse on D2 |
| routing (new part) | — | D1 |
| ✏️ / retract engine | better | positive trials 0/6 → 4/8; remaining D3, D4, D7, D13 |
| dossier | better | corrections, plans and practice now present; still D5, D9 |
| mind card stages | better | plausible after corrections; D8, D9 |
| mind card «🏋» | better | — |
| practice case | better | practice_log works; D2, D6, D11 |
| scheduler / Today | better | one line per act for T41, no never-started routine; D6, D15 |
| formulas / plot | same | D13 |
| running lists, maps | not exercised | — |

Files are in `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21B/`:
- PARTS.md
- CATALOGUE.md
- s11/findings.md … s20/findings.md (each with routing.md, DONE, out/part_*.png, post.txt)
- seq.json per scenario
- tools/