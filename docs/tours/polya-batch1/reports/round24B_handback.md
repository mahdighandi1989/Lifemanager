## Runner B, round 24: report

**Results**
- No scenario passed: 0 of 19. Under the zero-defect rule, every scenario has at least one defect. The defect common to all of them is B24·D6: the birth-date confirmation shows a raw Gregorian date such as «(2010-03-08 میلادی)» to the person.
- I sent 19 e-mails with Gmail. Subjects are «🧭 پولیا · دورِ ۲۴ · …», and each links to the B storyboard.

**What ran**
- Build: main eee4ff0f. `build.py --check` says in sync, and the dist file is newer than the merge.
- Everything is in `tour1_polya/round24B/`. There are 20 runs:
  - Replays of the round-23 group B scenarios: s11–s20, bp1–bp3, aB1–aB3, tB1, oB1. I used the round-23 controls and answers, with my driver adapted for round 24.
  - aB4 (new): an 82-year-old with the chickens-and-rabbits puzzle. This covers the 80+ age band, which group B did not have.
  - tB1x: the "found another way myself" arm of the territory scenario.
- I wrote new replies as the literal average model wherever round 24 changed the rules: birth date given as she said it, `gap.step`, `sys_done`, rewrite requests, and all new turns.
- Every scenario ends with `{"exit":true}`. Post-run shots were taken, all `ai/` folders are kept, and browser profiles are deleted.
- Files in `round24B/`:
  - per scenario: `<sid>/findings.md`, `routing.md`, `mail.html`, `mail.json`, `DONE`, and `better/rN.txt` for failed turns
  - `defects.md`: B24·D1–D22, plus the round-23 table
  - `PARTS.md`, with a «نسبت به دورِ ۲۳» column
  - `notes.md`
- One line is added to `STORYBOARD_LINKS.md`. The report is in `reports/round24B_handback.md`.

**S2 defects**
- **D1 — birth-date card refuses common forms.**
  - aB1 c3: «96/2/30» (two-digit year) gets «تاریخ را نشناختم».
  - aB2: after «۱۷ اسفند» the card asks for the year, but the year alone «88» is refused.
  - aB2: «17 Esfand 1388» is refused.
- **D2 — chat → live problem still re-asks and does not advance.**
  - aB3: the 🔭 form now shows every chat item as «از گفت‌وگو: … درست است؟», which is good. But the page's turn question re-asks the unknown at p11, p12 and tB1 p11.
  - The stage stays «فهمِ مسئله» to the end, six simulated months in aB3.
  - aB4: `chat_solved` imports only the statement.
- **D3 — one message cut into fake plan steps.** tB1 p7 was split at the commas into eight «گامِ … طرح» points, so the route map and «مانده: ۰ از ۸» are wrong. Her step-3 sentence was imported as «کل در یک جمله».
- **D4 — s18 p11: the page dropped its own re-check question after the corrected datum.** It called the question stale, although her new result −0.37 is wrong. The re-check now comes only from the model, which is a regression.
- **D5 — s19 c81: wrong copy ask on a deadline correction.** After «۱۸ هفته … ۱۵ اسفند», the page offers to change «۱۶» to «۱۵» (16 weeks becoming the day of the month) in the u0 and d1 fields.

**S3 defects**
- **D6:** raw ISO date in every birth confirmation, a bidi split, and a duplicate confirmation when the page and the model both save.
- **D7:** in aB3's first run, the model's ISO date silently overwrote the page's correct parse (05-03 → 05-02). The evidence is in `aB3_first/`.
- **D8:** «از تاریخِ تولدِ ثبت‌شده» appears when only «۸۲ سالمه» was said (aB4 p1).
- **D9:** false deferred promises from requests that were already fulfilled in the same turn (s13 p7, aB4 p9–p10). The promise text is garbled.
- **D10:** the quote post-check flags the assistant's own phrase in «» as if quoting her (s11 p4, bp1 p3).
- **D11:** the post-check forces «تو» on the 82-year-old after six «شما» turns (aB4 p8).
- **D12:** turn questions that don't fit the moment:
  - the page question still holds two questions (s13 p7, aB3, s19, bp2)
  - a stale check question after he had already verified (aB4 p9–p10)
  - «خودت فکر می‌کنی چرا؟» on a question about the system (oB1 p8)
  - contradictory lines (s18 p17) and a reference to a question that isn't there (s18 p4)
- **D13:** s14's Today screen still asks about the exam after he reported «۱۴ گرفتم».
- **D14:** chat guesses still show «آزموده نشده» after they were tested.
- **D15:** her own reported check is read as a guess (bp1 p12).
- **D16:** correction lines: the reason is shown with emptied quotes (s17 p6), duplicate lines, and arrows pointing opposite ways.
- **D17:** numbers derived from a corrected value stay stale with no mark (s11 «۸×۸ (۱۰۰ خانه)»).
- **D18:** route and dossier ordering problems, duplicate points, and «حل شد» contradicting the closure.
- **D19:** territory loop details:
  - the mismatch counted `whole` from the sheet's own text as "built"
  - `sys_done` writes no page line and leaves no note on the sheet
- **D20:** bp2 mind card lists the same stuck point three times.
- **D21:** s15: her question «خوبه؟» was stored as her plan, with a date she never gave.
- **D22:** aB3: the import listed her correction message itself as data.

**Round-23 defect table**

| Verdict | Defects |
|---|---|
| FIXED | D1, D7, D8, D9, D10, D13, D14, D16, D17, D18, D19, D20, D21 |
| CHANGED | D2, D3, D4, D5, D6, D12, D22 |
| STILL | D11, D15, D23 |

Evidence for each is in `defects.md`.

**Age verdicts**
- Jalali dates now work through the card and through chat. All stored dates match ICU:

| Scenario | Date given | Stored |
|---|---|---|
| s12 | «۱۳۳۸/۰۳/۱۲» | 1959-06-03 |
| aB1 | «1396/2/30» | 2017-05-20 |
| aB2 | «1388/12/17» | 2010-03-08 |
| aB3 | chat «۱۲ اردیبهشت ۱۳۳۸» | 1959-05-03 |
| aB4 | «1323/5/10» | 1944-08-01 |
| oB1 | «۱۷ اسفند ۱۳۶۷» | 1989-03-08 |

- Invalid days are refused with human error lines: «مهر ۳۰ روز دارد», «اسفندِ ۱۳۸۸ ۲۹ روز دارد (کبیسه نبود)», «اسفند ۳۰ روز دارد».
- Bands are applied correctly, and the teen block is no longer garbled. The mind card shows the 30–39 comparison with its source for oB1, and the honest «هنجارِ معتبر در دست نیست» for ages 9, 16, 67 and 82.
- Gaps: D1, D6, D7, D8, D11.

**Territory loop (tB1, tB1x)**
- **How I simulated the build:**
  - Unrelated reply: a routine note on sheet #101 that names the `mind` view.
  - Real build: a scratch copy of the dist page with a real new area `pr_prior_art` added to `SYS_TERR` s_problem, plus a routine reply «پاسخ به برگهٔ دستیار #۱۰۱ — حوزهٔ تازهٔ `pr_prior_art` …». I restarted the harness on the scratch page with the same profile and did not poke page internals.
- **Waiting marker:** visible in chat, on 🔭 (s11.png), in 🧭 (s12) and in 📜.
- **Negative arm 1 (unrelated reply):** PASS. The page recorded the mismatch, wrote a note under the sheet, reopened it, and the step kept waiting.
- **Positive arm:** PASS. The page saw the arrival and put «🛎 ابزارِ لازم آمد» in Today. It asked the exact step again at p9, the state became `resumed`, and she finished the problem.
- **Negative arm 2 (tB1x «خودم یه راه دیگه پیدا کردم»):** PASS. `sys_done` set the state to `other`.

**Chat ⇄ page (aB3, aB4, tB1)**
- Imports with «از گفت‌وگو … درست است؟» work.
- Re-asking, the frozen stage and the bogus plan split fail (D2, D3).
- Route shots at three moments: aB4 MID / AFTER-LIVE / FINAL, and tB1 WAIT / resume / FINAL.

**Owner question bank #5–#8 (oB1)**

| # | Answer | Where | Evidence |
|---|---|---|---|
| 5 | هست | practice case with real dates | p6 |
| 6 | هست — compares only within the same age band | 📐 سنجشِ استاندارد | p12 |
| 6 | هست — exact birth date stored | birth date in settings | p12 |
| 6 | نیست — data from two people in one browser get mixed | gap sheet #101 (user profiles) | p12–p13 |
| 7 | هست | prerequisite layer, 🧩 view, 🧭 detours, mind card «علتِ هر گیر» | p8 |
| 8 | هست | 🧭 route map, opened by the model (B23·D17 fixed) | p6–p7 |

**New owner-like questions** for the bank:
- «هر چیزی که این‌جا گفتم کجا رفت؟» — one page listing every record made from his words.
- «اگر داده‌های خوابم را از ساعت‌مچی بدهم؟»
- «ابزاری که تازه ساخته شد هنوز آزموده نیست — به من می‌گویی؟»

**Correction trials vs round 23**

| Trial | Round 23 → 24 |
|---|---|
| s11 | PARTIAL → PASS (D16/D17 remain as S3) |
| s17 ✏️ | FAIL → PASS |
| s17 chat | FAIL → PASS |
| s19 plot | PASS → PASS |
| s19 ✏️ plan | PASS → PASS |
| s19 step | PARTIAL → PASS |
| s19 deadline | FAIL → FAIL (changed: no garble, but D5) |
| s18 (4 trials) | PASS → PASS |
| aB3 | PASS → PASS |

**Routing:** all 208 user turns went to the correct task. The 3 internal second-opinion calls are excluded. The strict prompt scan is clean in all 20 runs.

**PARTS vs round 23**
- Much better: birth card.
- New and working end to end: territory loop.
- Better: route map at both ends, chat import, corrections, prerequisite layer, running lists.
- Same: Today, dossier, practice.
- Worse: promises (new false positives).

**«ارتقای لازم» (main items)**
- Accept two-digit years, and keep the day typed in the card when asking only for the year.
- Show only the Jalali date to the person.
- Never let a model ISO date override the page's own parse.
- Advance the 🔭 stage from validated chat events, and drop page questions that an imported item already answers.
- Tell a number's role apart (weeks vs day of month).
- Mark derived values as stale after a correction.
- Create a promise only when the turn left the request unfulfilled.
- Keep «شما» for people aged 60+ unless they ask otherwise.
- Add a dated findings record for prior-art results.
- On `sys_done`, write a page line and a note on the sheet.
- Support user profiles within one browser.
- Do not keep a minor's school name verbatim in the dossier.

**Limits**
- I did not re-run the round-23 test sentences (`test_tour1_r23_*.js`) one by one in the live page. The regressions were judged through the 20 replays.
- I did not re-inspect the bp2 ✏️ multi-number trial or the s19 Today after the ✏️ plan beyond the chat lines.