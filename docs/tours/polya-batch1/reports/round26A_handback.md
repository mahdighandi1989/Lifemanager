# Round 26 — Group A runner: final report

All 21 scenarios of group A were run to completion on main 1f93c333 (dist in sync) and all 21 e-mails were sent. Under the strict rule every scenario is a FAIL: 3 hit an S1, 13 have S2 as their worst defect, 5 have only S3.

- **Output:** `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A/` — per scenario `findings.md`, `RESULT.txt`, `DONE`, `route_table.md`, `ai/`, `out/`; plus `PARTS.md`, `defects.md`, `mail_log.txt`, `pids.txt`.
- **Isolation:** only my own recorded PIDs were killed, none are still running, and my profiles are deleted. The repo was not edited (`git status` clean).
- **E-mails:** 21/21 sent through Gmail to the owner, none refused. `mail.html` exists only for s01 and s02; the rest were sent directly. The owner's address is in no file.
- **Old replies:** only s01–s10 and pA1–pA3 had recoverable round-25 replies to replay. aA1–aA4, tA1, oA1, pwA1 and pwA2 were answered fresh by me as a literal average model.
- **`better/` files:** these exist only for pwA2 (r3), tA1 (r11) and oA1 (r26, r32), not for every failed turn.

## 1. Result per scenario

| Scenario | Result | Worst defects (prompt number) |
|---|---|---|
| s01 | FAIL | A26-1 S1 (p15); A26-2, A26-3 S2 (p16–17); A26-4 S3 |
| s02 | FAIL | A26-5 (p11), A26-6 (p11→12) S2; A26-7 (p10), A26-8 S3 |
| s03 | FAIL | S3 only: A26-9 (p4), A26-10 (p14), A26-11 |
| s04 | FAIL | A26-1 S1 (p14); A25-9 STILL (p7); A26-12 (p8→9), A26-13 and A26-14 (p12), A26-15 (p13) S2 |
| s05 | FAIL | S3 only: A26-16 (p11→12); A22-11 CHANGED |
| s06 | FAIL | S3 only: A26-7 (p7) |
| s07 | FAIL | A26-15 S2; A23-24 STILL (p7) |
| s08 | FAIL | S3 only: A26-17 (p8) |
| s09 | FAIL | A26-1 S1 (p4); A25-21 STILL (p17) |
| s10 | FAIL | A23-35 STILL S2 (p5); A26-18, A23-8 STILL S3 |
| pA1 | FAIL | S3 only: A26-9 (p3) |
| pA2 | FAIL | S3 only: A26-7 (p6) |
| pA3 | FAIL | S3 only: A26-19, A26-20, A26-7 (p12) |
| aA1 | FAIL | A26-21 S2; A23-19 STILL, A26-22 S3 |
| aA2 | FAIL | A26-26 S2; A26-23/24/25, A23-10 STILL S3 |
| aA3 | FAIL | A26-28 S2; A26-27 S3 |
| aA4 | FAIL | A26-28, A26-29 S2; A26-27, A26-30, A26-20 S3 |
| tA1 | FAIL | A26-34 S2 (p8→p11); A26-35 (p16/p19), A26-36 (p13), A26-37 (p6), A26-38, A26-39 S3 |
| oA1 | FAIL | A26-51 (p31–32), A26-46 (p17→23), A26-49 (p26), A26-50 (p30), A26-41 (p7) S2; A26-40, -42, -45, -47, -48, -52 S3 |
| pwA1 | FAIL | A26-31 S2; A26-32, A26-33, A23-8 STILL S3 |
| pwA2 | FAIL | A26-14 (p3→4), A26-21 (p4→5) S2 |

## 2. New defects (full list in `round26A/defects.md`)

**S1**
- **A26-1 (arithmetic):** a correct calculation is marked ✗ when a scale word (میلیون / میلیارد / هزار) sits only beside the result.
  - s01 p15 «۱۸ × ۱٫۲۲ = ۲۱٫۹۶ میلیون»; s04 p14 «۱۱ / ۵ = ۲٫۲ میلیارد»; s09 p4 «۳۰۰ + ۲۰ میلیون تقسیم بر ۴۰ = ۸۰۰ هزار» (page computed 500300).
  - Confirmed by probing `APP.STORY.arithChk` directly.

**S2**
- **A26-2 / A26-3:** her correct dispute of a ✗ never lands; the page stays silent, chat disagrees with 🧭/📜, and the mind card books a failure for a correct step (s01).
- **A26-5:** the turn question says «همهٔ گام‌های پیشینت درست درآمد» while the same message carries a ✗ (s02 p11).
- **A26-6:** the page's date ask is dropped silently when she answers the assistant instead (s02).
- **A26-12 / -13 / -21 / -49 — date asks on things that are not her future plan:**
  - a retracted day or someone else's schedule (s04);
  - a teacher's words to a child, with the teacher/school name (aA1, pwA2);
  - a past-tense done action: «پنج‌شنبه هم رسماً جواب دادم» ⇒ asks about next Thursday (oA1 p26).
- **A26-14:** an intermediate or unrelated reported result becomes the "own fix" of the resume step, with «تأییدِ تو ✓» (s04 p12, pwA2).
- **A26-15:** genuinely derived numbers are not marked stale after a correction (s04 p13, s07).
- **A26-26:** «۱×۲ می‌شه ۲×۳» is flagged ✗ (aA2).
- **A26-28:** a prediction whose confidence is in words («هفتاد درصد») never becomes a 🎯 (aA3, aA4).
- **A26-29:** the first wrong result moves the stage to look-back and shows a "solved" card (aA4).
- **A26-31:** the resume question lands on a step she herself made obsolete (pwA1).
- **A26-34:** a measured correction («۱٫۶ شد، نه ۲») is refused with «این پیام پرسش بود، نه اصلاح» because the same message ends with a question; dependent numbers stay unmarked (tA1).
- **A26-41:** her question sentences about another problem become «داده» of the live decision (oA1 route).
- **A26-46:** the 🎯 stays "due — happened or not?" after she reported the outcome in chat (oA1). Caveat: the page never gave the model an id for the 🎯, so the id I sent may simply not have matched.
- **A26-50:** a routine reply to a step-less system sheet gives her no notice at all, neither in chat nor in Today (oA1).
- **A26-51 (return by naming):** «برگردیم به مسئلهٔ «دست‌دادن‌های مهمانی»» does not switch problems.
  - The new unknown and its prerequisite were filed under the job decision.
  - The page said «برگشت به مسئلهٔ اصلی «بمانم یا بروم…»، گامِ «شمردنِ گروه‌های سه‌نفره»».
  - The decision's route destination was overwritten by the handshake sentence.

**S3:** A26-4, -7, -8, -9, -10, -11, -16, -17, -18, -19, -20, -22…-25, -27, -30, -32, -33, -35…-40, -42, -45, -47, -48, -52 — each with its turn in `defects.md`.

## 3. «ارتقای لازم» (collected from the findings)

- **Arithmetic:** read a scale word beside the result as a unit, not as a factor. A correct dispute must clear the ✗ everywhere, including the mind card.
- **Corrections:** a message with both a correction and a question must record the correction (or ask). Derived numbers must be marked stale. A proposed value must be the true recomputation.
- **Problem switching:** naming another problem's title must switch to it or ask; nothing may be filed under an unrelated live problem. Data items must not be built from question sentences.
- **Date asks:** only for her own future actions — never past tense, another person's words, or a retracted day. An ask must not be dropped silently.
- **Predictions:** confidence in words must create a 🎯. An outcome reported in chat must settle that 🎯, or the page asks once.
- **Territory loop:** after a taken-back «نه», close the sheet and note it. `sys_done` on a declined sheet needs a visible line. Step-less sheets need a notice when answered.
- **Prior work:** an intermediate result must not become "her fix". Do not resume on an obsolete step. Do not fire on mid-solution arithmetic.

## 4. Round-25 defects

| Id | Status | Evidence |
|---|---|---|
| A25-1, -2, -4, -6, -7, -8, -8-b, -10, -11, -12, -12-b/13 | FIXED | pwA1, pwA2, pA1, pA2, aA4 |
| A25-3 | CHANGED ⇒ A26-14 | pwA2 p3→4 (merge itself works in pwA1) |
| A25-5 | FIXED mostly; CHANGED ⇒ A26-7 | s02 p10, s06 p7, pA2 p6, pA3 p12 |
| A25-9 | STILL | s04 p7 «۲ ⇒ ۲٫۷۵»; fixed in s02 |
| A25-14 | FIXED | oA1 p25: one 🎯, judged through the practice case |
| A25-15 | FIXED | oA1: «تا جمعه» ⇒ due Friday |
| A25-16 | FIXED | oA1 p6 |
| A25-17 | STILL (S3) | tA1 p8→9: a parenthetical with a question mark counted as a second question |
| A25-19 | FIXED | tA1 p13 |
| A25-20 | FIXED / CHANGED | s02 |
| A25-21 | STILL | s09 p17 |
| A25-22 | FIXED | tA1 p19: piece after closure gets its own waiting row (#103) |

Earlier rounds:
- **FIXED:** A21-11, A23-25, A24-10.
- **CHANGED:** A22-11, A23-6, A23-14 (chat and Today now «شما», 🔭 texts still «تو»).
- **STILL:** A23-8, A23-10, A23-19, A23-24 (all S3) and A23-35 (S2, s10 p5).

## 5. Territory arms (tA1)

No false «رسید» occurred in any arm. Scratch builds: `tA1_build` (two new areas) and `tA1_build3` (two identically worded areas for the tie).

| Arm | What came | Page did | Verdict |
|---|---|---|---|
| Declined without building (new) | under #101: «covered by dc_risk_uncertainty; nothing built» | «⛔ بسته شد بی ساختن — گام باز می‌ماند» + Today line | ✓ (did not mention that the sheet itself had ruled that area out) |
| (a) ruled-out area | «pr_analogy_transfer به‌روز شد» | «… خودِ برگه از اول کنار گذاشته بود — دوباره باز شد» | ✓ |
| (b) generic words | «چند ابزار و چند مسئله تغییر کرد» | «هیچ نما یا حوزه‌ای … نام نبرد — دوباره باز شد» | ✓ |
| Round-24 negative (farm) | «نمای farm به‌روز شد» | same generic rejection | ✓, CHANGED: no longer names what came |
| View-name only | «نمای «قلمروِ سامانه‌ها» (sterr) به‌روز شد» | rejected and reopened; did not ask | ✓ never «رسید»; the required ASK was not seen |
| Sheet-frame words only | «ساخته شد — یک حوزهٔ تازه در قلمروِ سامانه‌ها…» | rejected and reopened; did not ask | ✓ never «رسید»; the required ASK was not seen |
| sys_done | «خودم یه راه دیگه پیدا کردم» on the declined sheet | Today line removed; no confirming line or note | ~ (A26-36) |
| Positive, two new areas | scratch build + note | «🛎 ابزارِ لازم آمد: «جست‌وجوی سابقه و ثبتِ اختراع»» — picked the right one | ✓ |
| «نه، همون نیست» after arrival | her words (p14) | page itself reverted: waiting again, sheet reopened with note, Today line | ✓ |
| Tie | two identical candidates | «❓ … هم‌امتیاز با «…» آمد … از تو می‌پرسم» + Today line; no declaration | ✓ |
| «نه» to the ask | «نه، اینم نیست» | asked separately about the second candidate | ✓ |
| Mistaken «نه» taken back | «اشتباه گفتم … همون بود» | «🛎 … گفتی همان است؛ از سر می‌گیریم» | ✓ (sheet stays open — A26-35) |
| Piece after closure | «باتری تو سرما…» | sheet #103 with its own waiting row | ✓ |

No duplicate waiting rows appeared.

## 6. Prior-work verdicts

| Scenario | Outcome |
|---|---|
| pwA1 | Opening question, mixed reply, dispute by meaning, re-check asked once, second report merged, mind card credit — all ✓. Open: A26-31, A26-32, A26-33. |
| pwA2 | Opening and resume ✓, child's attempt no longer «داده» ✓. Open: A26-14. |
| pA2 | Own fix applied (C8); mind card credits prior steps. |
| s04 | An unrelated result was booked as her fix (A26-14). The ledger in this run was also contaminated by a replayed unsolicited `prior` — my error. |
| s02, s06, pA2, pA3 | Prior block fires on mid- or post-closure arithmetic (A26-7). |
| s08 p8 | Her own invented problem with worked steps got neither a prior block nor an arithmetic block (A26-17). |

## 7. Arithmetic (checked against exact arithmetic)

- **Correct and read correctly:**
  - chains, a right-hand fraction sum and rounded 0.19 (pA2);
  - six calculations in s02;
  - «۱۰ × ۹ ÷ ۲ = ۴۵», «۴ × ۳ ÷ ۲ = ۶», «۱۲ × ۱۱ × ۱۰ ÷ ۶ = ۲۲۰» (oA1);
  - «۱۲ × ۲ = ۲۴», «۱۰ × ۰٫۲۵ = ۲٫۵» (tA1).
- **Wrong and caught:** pA2; oA1 p20 «۴۵ − ۳۰ = ۲۵» ⇒ ✗ (page: 15), number not leaked, her fix read ✓.
- **Look-alike not mis-flagged:** «(۱۰ × ۱۰) برای ۳ نفر می‌شه ۹» (oA1 p3).
- **Correct but flagged ✗:** the three A26-1 cases, and «۱×۲ می‌شه ۲×۳» (A26-26).
- **Silent:**
  - unit «ذرع» (A26-20);
  - «۱ + ۲ + … + ۱۱ = ۶۶» (ellipsis);
  - sentences without «=»;
  - block missing for «۱۲ × ۱۱ ÷ ۲ = ۶۶» at oA1 p18 although the checker reads it correctly (A26-45).

## 8. Chat ⇄ page

- **Agree:**
  - correction «۱۲ نفر» (oA1 p7);
  - practice session and 🎯 (oA1 p25);
  - arrival and rejection in the territory loop (tA1);
  - Friday ask (oA1 p26);
  - prerequisite lines.
- **Disagree:**
  - s01 dispute (chat vs 🧭/📜);
  - s03 🧭 day after ✏️;
  - oA1 🎯 still due after her report;
  - oA1 decision route carrying another problem's data and destination;
  - tA1 sheet still open after take-back;
  - tA1 correction refused while the assistant had treated it as made.

## 9. Owner bank 1–10

| # | Question | Answer the page supports | Where |
|---|---|---|---|
| 1 | Late correction propagates? | Exists, partly: statement and dependent result follow; derived numbers and the correction-plus-question case do not | oA1 p7; s04, s07, tA1 |
| 2 | One place for all steps? | Exists («📜 پروندهٔ کامل» / «📚 همهٔ کارها»); view is mislabelled «🧗 مسئله‌های بزرگ ›» | oA1 p8–9 |
| 3 | Mind card aggregate with sources? | Exists; wrong entries in s01, pwA1, aA2 | oA1 p12–13 |
| 4 | Weak model measured? | «نیست» — sheet #101 filed | oA1 p14 |
| 5 | Technique open over weeks with real time? | Exists (practice case T24, session logged, next date set) | oA1 p22–25 |
| 6 | Age / no mixing between users? | Age exact and used only for manner; two users in one browser do mix — sheet #102 filed | oA1 p2, p28; aA1 |
| 7 | Prerequisite vs knot vs ability? | Exists | oA1 p31–32; pA1–pA3 |
| 8 | Live route map? | Exists; contamination and stale destination remain | oA1 p10–11; pwA1 |
| 9 | Missing ⇒ filed, built, noticed, resumed? | Step-tied sheets: full loop works in all arms. Step-less system sheets: filed only, no notice | tA1; oA1 p30 |
| 10 | Tied to one model? | Method, records and card independent of the model; works offline; only chat needs a model | oA1 p14 |

## 10. Routing

266 of 266 turns went to the right task (`lla_coach`, `lla_assistant`, `learning_architecture`); `route_table.md` in each scenario.

## 11. PARTS — «نسبت به دورِ ۲۵»

- **Much better:** «کارِ پیشینِ تو».
- **Better:**
  - territory loop;
  - practice / 🎯;
  - mind card credit;
  - age and register;
  - stage hand-over between problems;
  - Friday handling.
- **Same, good:** look-back, gap sheets with consultant, dossier, routing.
- **Slightly better:** correction engine, route map.
- **New problem families:**
  - arithmetic with scale words (S1);
  - disputing a ✗;
  - misplaced date asks;
  - switching problems by name (first time tested, fails).

Full five-way table in `round26A/PARTS.md`.

## 12. New owner-like questions that came up

- When a routine closes my sheet by pointing at an area the sheet itself had ruled out, who catches that?
- If I say the outcome of a prediction in chat, why does Today still ask me?
- Can I see which model wrote each reply?
- When I name an older problem, how do I know which problem my next sentence lands in?
- Why does the dossier list five identical "routine reply didn't answer" lines without saying what came?

## 13. Not exercised, and my own errors

- **Not exercised:**
  - aA2 forgetting/regression (hard-coded practice ids in the old ctl);
  - the «must ASK» behaviour for frame/view-name-only replies (the page rejects instead);
  - C12 «… درست است؟» — seen once only, for a wrong sentence (oA1 p26).
- **Deadline observation:** the ⏰ deadline in oA1 reached Today straight from the model's date with no page confirmation line.
- **Runner errors (in `defects.md` section d):**
  - soft-accept let stale questions through at pA1 p2–3;
  - s04 ledger contamination;
  - two evals sent while a prompt was pending (pA3, oA1 p20; no lasting effect);
  - the first arm-A note in tA1 was worded as a decline;
  - oA1 p14 reported a possibility as a dateless plan.

## 14. Use

I did not measure tokens or wall-clock time. From `mail_log.txt` and `pids.txt`, the first harness started at 19:58 and the last e-mail went out well after 23:16, across two context windows. 266 model prompts were answered: 13 scenarios replayed from round-25 replies with overrides, 8 written fresh.