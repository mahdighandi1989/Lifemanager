## Round 19, group D (s30–s38): every written criterion passes, but none of the 9 scenarios is zero-defect

All 9 scenarios pass all their written criteria. Every one still has at least one defect: 2 are S2 (s30, s37) and the rest are S3.

| Scenario | Result | Defects |
|---|---|---|
| s30 | PASS on criteria; FAIL zero-defect | 1 S2 |
| s31 | PASS on criteria; FAIL zero-defect | 3 S3 |
| s32 | PASS on criteria; FAIL zero-defect | 1 S3 |
| s33 | PASS on criteria; FAIL zero-defect | 1 S3 |
| s34 | PASS on criteria; FAIL zero-defect | 2 S3 |
| s35 | PASS on criteria; FAIL zero-defect | 1 S3 |
| s36 | PASS on criteria; FAIL zero-defect | 1 S3 |
| s37 | PASS on criteria; FAIL zero-defect | 1 S2 + 1 S3 |
| s38 | PASS on criteria; FAIL zero-defect | 1 S3 |

Every scenario has `findings.md` (starting with «## خلاصه برای مالک», with «## نقشهٔ نیاز» and «## ارتقای لازم») and `DONE`. All 9 e-mails were sent in the RUNNER16 structure, subject «🧭 پولیا · دورِ ۱۹ · …», with the group-D storyboard link https://claude.ai/artifact/89Rq3mP3Vs2CYfJqZPZ75L. I deleted my browser profiles, none of my harness processes is still running, and I did not touch any other runner's processes.

**Build check:** `build.py --check` says in sync, and the apps dist (13:52) is newer than 6fbd0377 (13:36). The harness loads the apps dist. I did not use frontend/dist.

## Remaining defects

**1. S2, class b, regression (s30): the guess kit disappears from the understanding card.**
- Cause: a guess she states in chat (validated `coach_state.guess`, RM4c) is written to `solve.g[1]` with `conf:null`, `test:""`, `ifRef:""` (a27_tour.js:2794–2797, `guessToProblem`). The understanding card shows the guess kit only when `!s.g[1]` (a38_live.js:638 `fresh`; kit at 763–790).
- Effect: the confidence, refuting-test, if-refuted, want-it-true and rival-guess fields never appear for the first problem. Look-back later marks the guess «نادرست بود» with no confidence, so its calibration is lost.
- Repro: replay s30 to c8–c9. The round-18 version of c9 filled `lpGuess` / `lpConf` (70) etc.; now it reports `NO lpGuess | NO lpConf | NO lpTest | NO lpIfRef | NO lpGWant`.

**2. S2, class b, regression of RM2b (s37): the formula tokenizer pulls a number out of the Persian clause.**
- Her message «… ۳۵y بر ۸ ⇒ y=۲ (۳۵۲). بر ۳: x+۳+۵+۲ بر ۳ ⇒ x=۲، ۵ یا ۸» is split into isolates «۸ ⇒ y=۲ (۳۵۲)» and «۳ ⇒ x=۲».
- In the RTL line, «بر» then sits next to «(۳۵۲)», and «بر ۳ ⇒ x=۲» reads as «بر ۲ = x ⇒ ۳» (out/s25.png). Her own solution reads wrongly in her own bubble.
- In round 18 this message was plain, readable text. The cause is the run logic in a39_math.js: a lone number right after a Persian word starts the run.

**3. S3, class b (s32 p7, s36 p2): the RM5d «# درخواستِ عقب‌افتاده (نامزد)» line fires falsely.** Source: `deferCand`, a27_tour.js:3026–3035.
- s32: it looks only at the last assistant message, which was a system form-fill reply. The reply that actually answered her (r4, which carried a `coach_state`) is ignored, and the "request" it flags is really a guess («پس شاید تبلیغ فقط یه کم اضافه کرده؟»).
- s36: «می‌شه بدون x حلش کرد؟» was already answered in r1 («لازم نیست حتماً x باشد…»). The ≥½ token-overlap test misses an answer that uses different words.
- The true positive works: in s31 the request was stored as pr1, reminded on every turn, and closed as honoured.

**4. S3, class b (s31): the round-18 D4 is not fixed — RM6f does not fire.**
- a27_tour.js:2033 excludes messages with «؟» (`!/[؟?]/`), which drops the very «بعدی؟» case its own comment names.
- So p12 «هنوز نمی‌دونم کدوم نوع رو بیشتر دوست دارم. بعدی؟» becomes a new problem statement.
- p13 then gets «مرحلهٔ محتمل: فهمِ مسئله» with the suggestion «مجهول … چیست؟», although the session is bound to the closed problem.

**5. S3, class b, regression (s31): the q-split cuts one question into two options.**
- a38_live.js:2849 (RM4b) turns «چطور می‌آزمایی‌اش؟ با کدام وارسی یا حالتِ خاص؟» into an orphan option «با کدام وارسی یا حالتِ خاص؟», listed first, plus «چطور می‌آزمایی‌اش؟ (حدسِ تو: …)».
- Round 18 showed this as one option.

**6. S3, class b (s31): math notation gaps.** «n≈3.7» and «n·ln(10/n)» are not recognised (`APP.MATH.has` returns false), while «(10/n)^n» in the same message renders.

**7. S3, class b (s38 p4): her own complete derivation no longer moves the phase (RM6c side effect).**
- «پس حجم = ۲ × (…) = a²b/6!» now gets «مرحلهٔ محتمل: طرح‌ریزی» with the planning suggestion «پیش‌تر همین را … دیده‌ای؟». Only a conditional `said:result` line hints otherwise. In round 18 this turn got a look-back check question.
- Location: a27_tour.js:2038–2040 and the weak-result line at 3052.
- Under the new rules I rewrote r4 as the literal model would (first execution question).

**8. S3, class b (s34): the prompt asks for `plan.same:"plN"` but never shows the plan ids.**
- The «# پیگیریِ برنامهٔ خودش» block shows only the plan text, so the model has to guess the id.
- My guess `pl1` was accepted, and deduplication then worked.

**9. S3, class b (s35): the plan lifecycle ignores the live tunnel.**
- «هر هفته یکی رو عوض می‌کنیم» (pl2) is a recorded live step with a recorded outcome, and the problem is solved.
- Even so, p7 asks «انجام شد؟», and Today shows «📌 … — انجام شد؟».
- Cause: `plansDue` and the INF4 Today line read only `s.plans` (a27_tour.js:3009–3018, 3074–3080).

**10. S3, class b: the mind card says things its data does not support.**
- **s33 (also present in round 18, not reported then):** a black spot «بیش‌اطمینانی… ۱ بار از ۱ رخ داد… ۶۴٪» comes from a single correct prediction, so the 64% is driven by the ½ prior (a29_mind.js:157).
- **s37:** «فهمِ مسئله» is named weakest (58%). Her own restatement (`said:["c"]`) earns no success, while the same turn's `stuck` counts as an understanding failure.
- **s34:** a validated `plan_done:true` (her small step done) counts as no evidence, yet one partial step makes «اجرای طرح» the weakest stage (67%).

## Round-18 group-D defects re-checked
- **D1 (formula line by view):** fixed. No «# فرمول» in s30/s32/s33/s34/s35; s38 p7 «(n−۲)×۱۸۰» now gets it.
- **D2 (past-date follow-ups, duplicate plans):** fixed.
- **D3 (s31 check window):** fixed. The verdict is `verified` with `chkBy: msgs`.
- **D4:** not fixed (defect 4 above).
- **D5 (`(10/n)^(n/2)`):** fixed.
- **D6 (mind card counts only failures):** fixed; successes now appear and stages without data are not ranked.
- **D7 (raw TeX in look-back options):** fixed. Options are plain text, and «پیامِ کامل» shows the rendered message.
- **D8 (Persian digits):** fixed.

## Other round-19 behaviour checked
- **guess.q:** the note lands on the right option (s30, s31).
- **plan_done and expiry:** work (s34, s35).
- **Today plan line (INF4):** «📌 برنامهٔ خودت … — انجام شد؟» appears when the date has passed (probe with the clock moved to 15 Aban).
- **Formula preview and «∑ فرمول» bar:** they work in the live step field with Persian-letter variables (s36 s8_page.png) and in the chat input (s31 s7/s10, s38 s4/s14). Symbols insert at the caret (⇒, ²).
- **No false conversions:** no stray plot or board appeared, and prices, «؟۴۸۷؟», dates and prose were not converted.
- **Prompt scans:** struct and strict found 0, and the developer-note scan found 0.

## How I ran it
- **Replay:** the round-18 scripts through the copied tools, with new model replies only where the round-19 rules require them:
  - guess.q: s30 r2, s31 r5, s32 r3/r4;
  - defer: s31 r5, closed with `promise_done` in s31 r13;
  - `plan.same`: s34 r4; `plan_done`: s34 r5;
  - the «انجام شد؟» sentence: s35 r4 and r7;
  - s38 r4 rewritten.
- **coach_state omitted:** in at least one turn per scenario.
- **Inserted formula demos:** typed input in s31, s36 and s38 so the shots show the preview and the symbol bar.

## «ارتقای لازم»
1. The guess kit should prefill a guess stated in chat; the person should only need to add confidence and a test. Need: calibration of every guess, wherever it is said.
2. Formula alphabet: add ≈, ·, ln/log/sin, and treat a number after a Persian word as part of the sentence. Need: students' real notation, without changing its meaning.
3. Show plans with their ids (pl1: «…») in the prompt. Need: correct `same` / `plan_done` reports without guessing.
4. Link plans to live steps (one act, one state). Need: no redundant «انجام شد؟», and a truthful Today.
5. Set a minimum number of events before any calibration black spot or stage label. Need: no labels driven by the prior.
6. Count her own restatement (`said u/c`) as evidence for understanding. Need: the mind card sees the key moment.

Everything is in `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round19D/` (one subfolder per scenario: `findings.md`, `DONE`, `out/` shots, `post.json`, `ai/`).