## Round 22, runner B (s11–s20 + new bp1–bp3): report

**Result: none of the 13 scenarios passes, so batch 1 does not end.** No S1 defects. Two scenarios came close:
- **s16** failed only on the cross-cutting prerequisite lens. Everything it exercised itself passed.
- **s15** has one S3 only.

**Owner e-mails were not sent.** The Gmail send was refused by the auto-mode permission check ("unrequested commit in a connected app"). I wrote `mail.json` (to, subject «🧭 پولیا · دورِ ۲۲ · …», RTL HTML) and `mail.html` into each scenario folder. They link to storyboard B (https://claude.ai/artifact/5vnriuMia1ma8oLZMZfVja). They are simpler than the RUNNER16 structure: Persian summary, then the passed and failed criteria lines, which are partly English. They need your permission or the main session to send them.

**Container restart:** bp1–bp3 had no DONE file, so I deleted all stale profiles and re-ran all three from scratch with the same user turns and replies. The results match the first run.
- My driver first carried an old practice-case id in one reply, so bp3's chat practice log was refused. I fixed the id re-mapping and re-ran bp3 a second time from scratch.
- s11–s20 were already complete with DONE and were not re-run.
- No harness or driver processes of mine are running and all my profiles are deleted.

**Setup:**
- **Build:** main b70c1fe8, `build.py --check` in sync, dist built 10:23.
- **Replay:** round21B ctl replayed with the round-21 driver. It now also reuses round-21 rewrite replies and re-maps ids. New replies were written as the literal model wherever round 22 asked for something new.
- **Every scenario:** ends with `{"exit":true}`, has a dossier read and shot at its final simulated day, a routing table, findings.md and DONE.
- **Clock:** the page's own date shift (inject.js), not Playwright's page.clock.
- **Test data:** no seeded records.

## Results
| Scenario | Result | Defects |
|---|---|---|
| s11 | FAIL | S2: D2, D3, D4 · S3: D9, D14 |
| s12 | FAIL | S2: D1 · S3: D11, D17 |
| s13 (running lists, life) | FAIL | S2: D8 · S3: D12, D20 |
| s14 (practice from chat) | FAIL | S2: D6 (lens) · S3: D9, D18 |
| s15 | FAIL | S3: D17 |
| s16 (new datum trial) | FAIL | lens D6 only |
| s17 | FAIL | S2: D2 · S3: D9, D10, D12, D15 |
| s18 (running lists, math) | FAIL | S2: D8 · S3: D9, D15, D21 |
| s19 (practice from chat + deadline trial) | FAIL | S2: D2, D4, D5 · S3: D10, D11, D12, D16, D19, D22 |
| s20 | FAIL | S3: D11 |
| bp1 (one prerequisite, math) | FAIL | S2: D6 · S3: D11, D13 |
| bp2 (one prerequisite, science/life) | FAIL | S2: D1, D2, D4, D6 · S3: D12, D15 |
| bp3 (several prerequisites, one nested) | FAIL | S2: D6, D7 · S3: D12, D14, D17 |

## Defects (full text, repro and location in `CATALOGUE.md`)
**S2**
- **D1 (b) Routing:** two opening problem turns still went to lla_assistant although the coaching block was in the prompt.
  - s12 p1: «…نیم ساعته موندم… بگو».
  - bp2 p1: a goal stated without a question mark.
  - Location: a26 `AS.statesProblem` / `AS.chatTask`.
- **D2 (b) Copy ask never fires:** «این‌جا هم عوض شود؟» appeared in no trial; same-fact matching misses her own typed copies. Persists from round 21.
  - s17: «۲۰۰ مترمربع» on the form vs «200 m^2» in chat.
  - s11: «۱۰×۱۰» in her typed statement, data and plan.
  - bp2: measure line «۵۰ مترمربع» (same digits and unit), «پنجاه متر مربع», «۱۵ سانتی‌متر».
  - s19: her page outcome «یک کیلو», and the weight «۷۴».
  - Location: a38 `retractOne` / `sameFact`.
- **D3 (b) Verdict of an earlier solved problem not set aside:**
  - s11: after 8×8 replaced 10×10, «ناممکن (اثبات شد)» stayed and the page asked for no re-check.
  - The correction was filed in the dossier of the other problem.
  - Location: a38 `liveSetAsideDeps` only acts on the session's current problem.
- **D4 (c) Substitution garbles her statement:** the old token is replaced by the model's whole fix phrase instead of the minimal span.
  - bp2: «۶۰ متر مربعه متر مربعه».
  - s19: «عروسی ۱۵ اسفنده تا عروسی برادرم مونده».
  - s11: «یه صفحه» dropped.
- **D5 (b) Over-withdrawal on a deadline correction (s19):** a refuted guess and the sufficiency judgement were set aside although neither used the date.
- **D6 (a/b) Missing prerequisite not told apart from a knot or low ability (§15):**
  - The coach prompt has no prerequisite move, and «نامِ قضیه … را لو نده» blocks naming the missing concept. bp3 asked for the theorem's name twice; it was withheld until the end-of-ladder rule.
  - The page asks no diagnostic question, and the 🧩 prerequisite map is never offered or linked to the problem.
  - The mind card books every prerequisite stuck as a stage failure and names it weakest, with no cause:
    - bp1: «طرح‌ریزی» weakest.
    - bp2: «اجرای طرح» weakest.
    - bp3: «فهم ۱ از ۴».
  - When the people said «خنگم» or «ریاضیم ضعیفه», only the model's own wording answered; the page requires nothing.
- **D7 (b) «🧭 نقشهٔ مسیرِ مسئله» does not exist:** recorded as the S2 gap in bp3.
- **D8 (b) Running lists are islands:**
  - No assistant action can add, update or close an item.
  - On the page an item cannot be resolved or closed, and an ambiguity's probability cannot be updated.
  - Items have no link to their problem and appear in neither dossier nor mind card.
  - Shown in s13 and s18.

**S3**
- **D9 (c):** post-check false positives — a «مثلاً…؟» elaboration, a cheat-sheet bullet, and the page's own two-sentence question.
- **D10 (b):** some page turn questions are themselves two or three questions.
- **D11 (b):** the practice offer line «می‌خواهی تمرینش کنیم؟» is unmarked beside the turn question; «این را بپرس» appears inside a «زمینه» line.
- **D12 (b):** turn question and phase misfits:
  - a re-check re-asked after she had just done it (bp2);
  - look-back while a second unknown was still open (bp3);
  - phase «بازنگری» after a failed step (bp2);
  - the related-problem question instead of a re-check after a datum correction (s17).
- **D13 (b):** «درسته؟ با ضرب پرانتز هم چک کردم» still treated as an untested guess.
- **D14 (b):** the correction detector missed «یه اصلاح: …» and fired on «غلطه» about her recall.
- **D15 (b):** the correction result block contradicts the page lines in the same prompt on ✏️ turns; the change line still clips old and new to the same text.
- **D16 (b):** s19 «۷۴٫۵» — she is told "nothing recorded" while the bubble is marked as corrected.
- **D17 (b):** practice subjects titled from raw text, and a practice report taken as a chat problem.
- **D18 (b):** s14 a plan and its practice case are two Today lines for one act.
- **D19 (b):** ZWNJ stripped from her plan text («هفته ای»).
- **D20 (b):** the practice view is labelled «۴۵ تکنیک ›» in follow-ups.
- **D21 (b):** «نتیجه سالم ماند» still counted as a success after the verdict was set aside (round-21 D8 persists).
- **D22 (b):** s19 the calibration case counts 1 session while 3 predictions were judged.

**Fixed since round 21, verified end to end:**
- Routing (139/141 correct; s15 went from 0/6 to 6/6).
- Practice from chat (D2).
- ✏️ edit changing several numbers (D4).
- Dossier chat work and no raw ids (D5, D9).
- The chat practice log judges the 🎯 (D6).
- Change lines in chat corrections show the differing part (D7).
- The self-correction event is booked (D14).
- Partly fixed: corrections now reach step records (D3).

## Correction trials vs round 21
| Scenario | Trial | Round 21 → 22 |
|---|---|---|
| s18 | 1–6 (verdict-affecting datum, ✏️, lesson clause, three non-corrections) | PASS → PASS (S3: D15, D21) |
| s17 | 1: ✏️ three numbers | FAIL → PASS |
| s17 | 2: typed copy in different notation | FAIL → FAIL (D2) |
| s17 | 3: question, not a correction | PASS → PASS |
| s19 | 1: weight «۷۴٫۵» | FAIL → FAIL |
| s19 | 2: ✏️ plan day | PASS → PASS |
| s19 | 3: step amount | FAIL → PARTIAL (step follows, page copy not asked) |
| s19 | non-corrections | PASS → PASS |
| s19 | new: deadline ≥9 messages back | FAIL: date and reminder moved, but D4 and D5 |
| s11 | new: datum a verdict depends on + typed copy | FAIL (D2, D3, D4) |
| bp2 | new: record composed from two messages | FAIL: only the right clause changed, but D4 and no copy ask |
| bp2 | new: ✏️ several numbers | PARTIAL: all three numbers landed; copy not asked |
| s16 | new: datum of a chat-only problem | PASS for the record that exists |

## Practice from chat
- **s14 (T41):** consent «یه پرونده‌ی تمرین براش باز کن» quoted. 20 days on the 1-3-7 cycle; «تثبیت شد» on ۲۱ آبان, then withdrawn on the chat regression «۴۰٪». The page quotes the technique's rule «چرخه روز ۱، ۳ و ۷».
- **s19 (T24):** case opened on the live problem; her chat report judged «🎯 … (۷۰٪) ⇐ شد». Stability correctly not declared under the page's rule «پیش‌بینی‌ها در دست‌کم ۳ روزِ جدا» and then «۷۰٪ درونِ بازهٔ ۴۰٪ ± ۲۰». The case shows overdue (13 days). Remaining issue: D22.
- **bp3 (T41):** the day-2 session was logged from chat.

## Running lists
- **s13 (life):** ambiguities list (T35, weekly) and assumptions list (T15, monthly). Today brought each review on the technique's own rhythm, including an overdue label. A resolved or refuted item cannot be closed.
- **s18 (math):** mistakes folder (monthly review on day 30) and the models shelf, where «کاربستِ مدل» on the problem page counted one linked use («نامزد»).
- **Verdict:** keep the lists; do not quarantine them. They should appear inside the live-problem flow (D8). Pareto and signal/noise were not exercised.

## Routing
139/141 correct. Wrong only s12 p1 and bp2 p1. Per-turn tables are in each `<sid>/routing.md`.

## PARTS.md («نسبت به دورِ ۲۱»)
- **Better:** routing; practice case (start from chat); dossier; the ✏️ / deadline paths of the correction engine.
- **Same:** copies and the mind card's stage rows.
- **First judged:**
  - the running lists: rhythm works, lifecycle missing;
  - the 🧩 prerequisite map: an island;
  - the 🧭 route map: missing.

## ارتقای لازم
- A prerequisite move in the coach: name the exact concept and step, one diagnostic question, teach to the needed depth, keep the waiting step and return to it; book the stuck with its cause and the later learning as progress; link the 🧩 map item to the problem.
- The 🧭 problem route map (roadmap §16), built from the event log.
- Running-list item lifecycle (resolve, refute, probability update), an assistant action with her quote, and a link to the problem and dossier.
- Unit- and number-word-aware same-fact matching for copy candidates.
- A correction to a solved problem should reach that problem even after the session has moved on.
- A plan that is the practice act should link to the case.

## Self-attributed (class d, not defects)
- bp1: I set register «شما» once without evidence.
- s13: I omitted guess_res for the refuted «شریک جرم» guess, and stored the HR plan date as 10-30 instead of 10-26.

Files are in `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22B/`: `CATALOGUE.md`, `PARTS.md`, and per scenario `<sid>/findings.md`, `routing.md`, `DONE`, `post.txt`, `mail.json`, `mail.html`, `out/`. The prerequisite scenarios are in the `bp1`, `bp2`, `bp3` folders.