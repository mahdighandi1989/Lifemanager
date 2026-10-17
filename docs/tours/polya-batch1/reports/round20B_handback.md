Round 20, runner B (s11–s20): none of the 10 scenarios is defect-free, so the batch cannot end. The correction path fails in both trials (s18 math, s19 life). Two new parts are also broken: practice-case work never reaches the mind card, and the dossier is incomplete. There is one regression: s20 lost the «اول کل را ببین» turn question.

All 10 scenarios (and their variants s11d/o, s14o, s16o, s19o, s20o/t/x) ran on main a94614ae (dist 18:58, `build.py --check` in sync).
- Every run ended with {"exit":true}; each dir has findings.md and a DONE file.
- Every findings.md has «خلاصه برای مالک», «نقشهٔ نیاز», «آزمودنِ اصلاح», «پروندهٔ کامل», «ارتقای لازم» and the defect catalogue.
- All 10 e-mails were sent («🧭 پولیا · دورِ ۲۰ · …», RUNNER16 structure, storyboard link B).
- PARTS.md is written.
- Strict prompt scan and developer-note scan: clean.
- All my profiles are deleted and none of my processes are running.
- I seeded no records. Everything was made through the UI or assistant in throw-away profiles. I did not flag them as test data, because a «test» flag hides records from the dossier I had to judge.

Base dir: /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20B/

## Results
| Scenario | Result | Defects | Notes |
|---|---|---|---|
| s11 | FAIL | S2 D7; S3 D11, D12, D16 | R19 criteria still pass |
| s12 | FAIL | S2 D1, D7; S3 D16 | R19 D3, D4, D5 fixed |
| s13 | FAIL | S2 D7; S3 D16 | |
| s14 (+ s14o) | FAIL | S2 D1, D7, D8, D9, D10; S3 D11, D15, D16 | Practice stability logic itself correct |
| s15 | FAIL | S3 D11, D16 | |
| s16 (+ s16o) | FAIL | S3 D16 | R19 D7 (register fallback) fixed |
| s17 | FAIL | S2 D7; S3 D16 | |
| s18 | FAIL | S2 D1, D2, D4, D7, D17; S3 D5, D14, D16 | Correction trial (math) |
| s19 (+ s19o) | FAIL | S2 D2, D3, D7, D17; S3 D5, D6, D14, D16 | Correction trial (life); R19 D1, D2, D8 fixed |
| s20 (+ o/t/x) | FAIL | S2 D13 (regression); S3 D15, D16 | |

Mind card plausibility: implausible in s14 (D9), s18 and s19 (D2); plausible elsewhere.

## Defects
**S2**
- **D1 (class b) — chat-closed records point to the wrong message.** Records made at chat closure (statement, understanding form, check) have no source message, so the page attributes them to the closing message.
  - s18: correcting the opening datum ۵→۶ changed neither the statement nor the form, and «حل شد — وارسی شد» stayed although the stored result used ۵.
  - The dossiers of s12, s14 and s18 show the form «از پیامِ گفت‌وگو: <closing message>».
  - Location: a38_live.js liveSrcMsg fallback (from:"chat" + at → last user message); a27 chat_solved creation stores no src.mid.
  - Repro: s18 replay c1–c6, then «تو پیام اولم اشتباه نوشتم — نرخ خروج ۶ … نه ۵» with coach_state.retract.
- **D2 (class b) — a correction withdraws everything derived from the whole message, not only the corrected part.**
  - s18: fixing only the lesson sentence turned the untouched check «verified → unverified» and withdrew «حل شد». The lesson itself (b1.use, lessons[], card) did not change; only an «ans» record was rewritten.
  - s19: ۷۴→۷۴٫۵ withdrew the week-8 success; the ✏️ day fix withdrew her mid-course answer; «نیم کیلو نه یک کیلو» withdrew the step's failure.
  - Location: a27 retract reversal (withdraws by message id); a38 liveRetract verdict rule.
- **D3 (class c) — the ✏️ path loses punctuation, so plans do not follow.** The ✏️ diff fragment drops punctuation (it has «می‌رم اولین»; the original has «می‌رم، اولین»), so AS.retractApply cannot find it.
  - Plan pl1 kept «شنبه» and 2026-12-19, and Today asked on Saturday with the old text.
  - The next prompt said «صفحه همین حالا انجام داد», so the assistant told her it had changed.
  - Location: a40_dossier.js AS.retractEdit → retractApply.
  - Repro: s19, plan message, then ✏️ «شنبه» → «یکشنبه».
- **D4 (class c) — a coach guess rewrite corrupts the text.** s18 g1 became «… تقسیم بر ۶ سانتی‌متر مکعب در ثانیه ثانیه»: the bare «۵» was replaced by the whole fix phrase. Location: a27 retract → APP.liveFixVal.
- **D7 (class b) — the dossier is incomplete and contradicts itself.**
  - Missing: all corrections, coach plans and their outcomes, the chat work of chat-closed problems, and everything after the first session (s18 day 2; s19 weeks 8–9).
  - Contradictions: «وضع: در جریان — ۳) اجرای طرح» next to «۳) اجرای طرح — هنوز نرسیده» (s13, s17); «وارسی نشد» next to «نتیجه سالم ماند» (s18).
  - Location: a40_dossier.js A.dossier.
- **D8 (class b) — start_practice consent is a keyword detector.**
  - «یه پرونده‌ی تمرین براش باز کن» and «… آره، بازش کن دیگه» were refused; only a bare «آره.» passed.
  - The assistant had already said «باز کردم».
  - Location: a41_practice.js ~951: YES is anchored at the start; ASKV lacks «باز کن».
- **D9 (class c) — the mind card never counts a practice case.**
  - PR.save sets c.withdrawn = [] (truthy), and a29 wdx(rec) skips the record.
  - s14: 7 dated sessions, «تثبیت شد» and its withdrawal, yet «🏋 کارِ تکنیک‌ها: هنوز کارِ تکنیکیِ کامل‌شده‌ای نیست».
  - Location: a41_practice.js:349 and a29_mind.js:491/538.
- **D10 (class b) — one act, two records (LT5).**
  - Case quick-form sessions do not complete the linked P3 records, so Today shows «برگه سفید روز ۱/۳/۷» from day 1 to day 20, even after «تثبیت شد».
  - The case page says «موعدی ندارد» while listing those dated records.
- **D13 (class b, regression) — s20 lost the A191 question.**
  - s20 p1 (a flood of parameters) no longer gets the A191 turn question «کلِ مسئله را در یک جمله…». It only suggests «مجهول چیست؟». R19 had it for the same message.
  - Location: a27_tour.js ~1435/1568 (o.intro is false). I could not find the root cause in the diff since 313b64b8.
- **D17 (class c) — the ✏️ editor text is invisible.**
  - The textarea inside the green user bubble shows nothing although its value holds the message and the typed text. «اصلاح شد ⇐» is faint.
  - Shot: s19/out/part_correction_edit_typed.png.
  - Location: a40 AS.msgTools plus style.css.

**S3 (all class b)**
- **D5:** on the ✏️ «[اصلاحِ پیامِ قبلی]» turn the prompt also carries the fallback «# اصلاحِ پیامِ پیشین (شاید)», inviting a second retract.
- **D6:** a chat correction leaves the bubble unmarked and its plot unchanged (s19 plot still ends at ۷۴).
- **D11:** the practice prompt block is gated by keywords.
  - False triggers: «می‌چرخه» (s11), «از تمرین‌ها» (s14), «بیا تمرین کنیم» (s15).
  - Missing on the s14 return turn that reports «۴۰٪».
  - There is no chat action to log a session, and only tid 41 is given, as an example.
  - Location: a41 ~970.
- **D12:** the practice section on a problem page says the guess is «هنوز آزموده نشده» on s11, where the guess was refuted and the problem proved impossible. PR.guessStatus at a41:585 reads only prcTests.
- **D14:** turn questions misfit after corrections.
  - s18: a corrected datum gets the whole-first question; a re-solved result gets the taste question.
  - s19: «… شکست می‌خورم ولی نخوردم» gets «این گام جواب نداد؟».
- **D15:** the deferred-request detector still loses «اثبات‌ها به چه درد من می‌خوره؟» in s14o (R18 B·D7 still open). It now proposes a non-request in s20o p3 (the advisor's words).
- **D16:** Today shows «بازیابی پیش از نگاه به پاسخ · عقب‌افتاده از ۲۵ مهر» to every new user, for a routine they never started. Location: a42_sched.js built-in routine registration.

## Correction trials
- **s18 (math), FAIL:**
  - 6 turns back, chat, a datum: FAIL (D1, D4).
  - 1 turn back, ✏️, a result: PARTIAL. The bubble, its history and the «what changed» line work; but D17 and D5.
  - 4 turns back, chat, a lesson: FAIL (D2).
  - Two non-corrections (a real-world «اشتباه کردم», a quoted teacher): PASS, nothing changed.
- **s19 (life), FAIL:**
  - 1 turn back, chat, ۷۴→۷۴٫۵: FAIL (D2, D6).
  - 3 turns back, ✏️, plan day: FAIL (D3, D17, D5).
  - 6 turns back, chat, step amount: FAIL (D2).
  - Three non-corrections: PASS.
- In both trials nothing was deleted (history is in textHist and the retract logs), but none of it is visible in the dossier.

## Time item
- **s14:** the T41 case over 20 simulated days is correct on the case page.
  - Lateness re-anchored the cycle («۳ روز دیرتر»).
  - «تثبیت شد» on 20 Aban from dated 60/70/80% sessions.
  - Today brought the check-in by itself, and it was withdrawn at 40% with the reason.
  - Around it D8, D9, D10 and D11 failed.
- **s19:** a chat-stated plan shows on its date and clears on plan_done. After a ✏️ fix it shows on the wrong day (D3).

## ارتقای لازم
- A chat action to log a practice session, and the case block in the prompt whenever an open case exists.
- «Reopen on corrected datum»: a fixed datum of a solved problem reopens execution.
- A dossier lane for corrections, plans and chat work.
- Close a page guess from a chat result (s17: guess 14 m³ against actual 24 m³).
- A T21 experiment case for s20's multi-week simulations.
- A «use it elsewhere» case offered from a closed look-back (s11).
- Carried over from R19: a letter grid (s12), a rehearsal space (s13), a formula-choice generator (s14), a wall card and role-play mode (s15), a parent card (s16), a units calculator (s17), a related-rates slider (s18), a weight log inside the problem (s19), a results table (s20).

## PARTS.md summary
Every part touched is judged «یکتا»; the practice section and the factory belong «درونِ مسیرِ 🔭».

| Part | Verdict | Defects |
|---|---|---|
| Live-problem tunnel (all four stages) | Works | Only D1 attribution |
| Assistant | Works on day-1 moments | D11, D13, D14, D15 |
| ✏️ / retract | Partly works | D1–D6, D17 |
| Dossier | Incomplete | D7 |
| All-work index | Works | — |
| Mind card stages + «از کجا؟» | Works | Implausible after corrections (D2) |
| Mind card 🏋 | Broken | D9 |
| Practice case | Logic correct | D8, D10 |
| Scheduler / Today | Brings items by itself | D3, D10, D16 |
| Formulas / plot | Correct | D6 |
| Running lists, maps | Not exercised | — |

Files are in /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round20B/:
- PARTS.md
- s11/findings.md … s20/findings.md (each with a DONE file)
- s18/corr_*.txt, s19/corr_*.txt
- <sid>/out/part_*.png
- <sid>/post.txt