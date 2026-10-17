## Round 19, runner C (s21–s29)

**Result: 1 of 9 scenarios passed with zero defects (s28). The other 8 are PARTIAL.** Every written criterion passed except four, each caused by one of the defects below (s22 X7, s23 X4, s24 X4, s25 X5).

### Run notes
- **Build was fresh.** `build.py --check` is in sync, and the dist (13:52) is newer than 6fbd0377. The repo HEAD past 313b64b8 only touches docs. I did not edit the repo.
- **How I replayed.** I reran the round-18 scripts (`round19C/src/<sid>/ctl`) with the round-18 replies, using harness5. I added only the coach_state fields that round 19 calls for:
  - `guess.q` when the reply's question tests her guess;
  - `step` (s22 p5, s23 p4) and `plan.on_guess` (s22 p1);
  - a new reply in s22 r2 («اول حدس را بیازما») and in s22 r7 (the one-time «انجام شد؟» ask).
- coach_state is omitted in at least one turn per scenario. Every scenario ends with `{"exit":true}`.
- **Extra shots for the new tools** (all checked by eye):
  - field preview plus the «∑ فرمول» bar in s24, s25 (Persian digits), s26, s28 and s29; the chat-input preview in the same five;
  - the s21 FEN board (correct: a1 dark, f8♚ f6♔ a1♖ d1♕, «نوبتِ سفید»);
  - non-math controls: dates, phone numbers, prices, percentages, a FEN and snake_case.
  - No plot appeared on any message, which is correct.
- **Prompt scan:** no prompt has a second unmarked question directive. The new lines (`# درخواستِ عقب‌افتاده`, `# برنامهٔ خودش که موعدش رسید`, the on_guess line) are all marked as context.
- **Round-18 defects:**
  - Fixed, checked end to end: W1 («…» inside a run), W2 (Persian-digit math), W3 (mind card: planning evidence counted, empty stages read «هنوز داده‌ای نیست», step outcome taken from chat), W5 (on_guess plan gets «اول حدس را بیازما»), W6 (guess stored on the live problem). The `# فرمول` line no longer fires on a FEN.
  - Two new defects are variants of fixed ones: X4 (W3) and X5 (W1).
- **Wrap-up done:** findings.md (starting with «خلاصه برای مالک», with «نقشهٔ نیاز» and «ارتقای لازم») and DONE for all 9; 9 e-mails sent in the RUNNER16 structure with the group-C storyboard link (✅ s28, ⚠️ the rest). My harnesses and drivers are stopped and my browser profiles deleted; scratch is 95 MB.

### Results

| Scenario | Result | Defects |
|---|---|---|
| s21 | PARTIAL | X1 |
| s22 | PARTIAL | X7, X2, X1 |
| s23 | PARTIAL | X4, X2, X3, X1 |
| s24 | PARTIAL | X4, X1 |
| s25 | PARTIAL | X5 |
| s26 | PARTIAL | X6 |
| s27 | PARTIAL | X1 |
| s28 | PASS | none |
| s29 | PARTIAL | X4, X1 |

### Defects

- **X1 — S2, class c (RM5d deferred-request candidate).**
  - Repro: s21 p6, s22 p5, s23 p4, s24 p4, s27 p6, s29 p4 and s29 p7.
  - What goes wrong: `deferCand` takes the last AI message, which after any page action is the reply to a «[سامانه: …]» turn and never carries coach_state. It pairs that reply with the user's earlier real message. So the prompt falsely says «گزارشِ وضعِ آن نوبت نیامد», although the actual reply to that message did carry coach_state.
  - The candidates are:
    - the problem's own question («همه چی رو چند برابر کنم؟», «به چند روش… ۳۰ پله…؟», «آیا مدل‌ها… برآورده می‌کنن؟», «بزرگ‌ترین باغچه چه شکلیه؟»);
    - requests already honoured («جوابو نگو», «بیا ثبتش کنیم»);
    - a promise already closed (s29 p7, pr1).
  - Risk: a literal model defers the main problem question, and the page then follows up a "promise to answer" it.
  - Location: apps/learning-architecture/src/app/a27_tour.js:3025–3036. The promise check uses `x.at === m.at`, so it compares against the wrong reply too.

- **X2 — S2, class c (side effect of RM1d in the prompt).**
  - Repro: s22 p5 «گامِ شهودیِ ثابت‌نشدهٔ «فردا ساعت ۱۰ با سرایدار…» — مسئلهٔ کمکی حل شد ≠ مسئلهٔ اصلی حل شد»; s23 p4 the same wording for her cake step.
  - What goes wrong: `gateItems` now returns a `k:"step"` item for every open step. The coach line labels every non-aux item «گامِ شهودیِ ثابت‌نشده» and always appends «مسئلهٔ کمکی حل شد ≠ مسئلهٔ اصلی حل شد». It appears in every turn with an open real step, not only when closing. Both examples are practical problems with no auxiliary problem and no intuitive step.
  - Location: a38_live.js:3667.

- **X3 — S3, class b.**
  - Repro: s23 p5 still says «گامِ واقعیِ باز … نتیجه را خودش در صفحه ثبت می‌کند».
  - What goes wrong: her chat step report was accepted (`chatRep`), but the live block ignores it. The model then asks her to record on the page a result the page already has.
  - Location: a38_live.js:3668.

- **X4 — S2, class b (mind card, RM1c incomplete).**
  - What goes wrong: a "weakest" stage is still named when no stage has any failure, or when stages tie exactly. The name just follows table order.
  - Cases:
    - s23: und 2/2, plan 1/1, exec 1/1, back 1/1 (three at 28%) ⇒ «طرح‌ریزی».
    - s24: plan and back both 1/1 at 32% ⇒ «طرح‌ریزی».
    - s29: 3/3, 4/4, 4/4, 2/2 ⇒ «بازنگری 38%», for someone who solved both problems without error.
  - The same ranking goes into the coach prompt line.
  - Location: a29_mind.js:396 (`weakest` whenever `rows.length >= 2`) and :414.

- **X5 — S2, class c (formula tool).**
  - Repro: s25 c20 «خودم الگوی ۱/(1·2·3) + ۱/(2·3·4) + … رو ساختم» shows left-to-right as «… ۱/(1·2·3) + ۱/(2·3·4) +». The same happens in the system note «✓ همین مسئلهٔ تازه پیش‌تر ثبت شده بود».
  - What goes wrong: when «…» ends a run before Persian text, it is stripped as trailing punctuation and lands on the other side, leaving a dangling «+». `segments` returns «۱/(1·2·3) + ۱/(2·3·4) + ».
  - Location: a39_math.js:263 (the `trail` class includes «…»).

- **X6 — S3, class c (non-math converted).**
  - Repro: s26 chat-input preview of «… کد رزرو TR-2026/10» shows «TR − 2026/10», with 2026 over 10 as a fraction. «۱۴:۳۰» and «۱۲۰٬۰۰۰ تومان» stay text, correctly.
  - Location: the a39_math.js trigger (`asciiSegs`, around :247–251).

- **X7 — S2, class b (plan lifecycle, RM5c incomplete).**
  - Repro: s22. «می‌خوام همین امروز باهاش برخورد کنم» stays `state:"open"` after the guess was refuted and the caretaker cleared:
    - the p7 prompt tells the model to ask «انجام شد یا نه»;
    - Today shows «📌 برنامهٔ خودت: «می‌خوام همین امروز باهاش برخورد کنم» … — انجام شد؟».
  - What goes wrong: nothing links `onGuess` to the refutation of that guess.
  - Location: a27_tour.js:3009–3020 (`plansDue`) and the Today line (`A.dueList`).

Observations, not defects: the raw formula fields are `dir="rtl"`, so the typed text scrambles (only the preview is right); s28's «P(دوپسر | …)» keeps the Persian part as text, which is acceptable.

### ارتقای لازم
- **s21:** an interactive chess board from the FEN, to move pieces and try lines "from the end".
- **s22:** a suspect × evidence table, and a plan ⇄ guess link so a plan closes or is reviewed with its guess.
- **s23:** a units-aware recipe-scaling calculator (area, thickness, time).
- **s24:** an isomorphism mapping table checked on small cases (batch 2).
- **s25:** left-to-right typing direction in fields whose content is math.
- **s26:** a counter of unknowns, equations, and condition parts used.
- **s27:** an argument map (premises → definition → conclusion).
- **s28:** a probability case tree / enumeration table (batch 2).
- **s29:** a geometry canvas for bisectors and tangent circles (batch 2).

Everything is in /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round19C/:
- per-scenario findings: `<sid>/findings.md`
- shared defect definitions: /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round19C/defects.md
- tools: `tools/` (new: `gq.py`, `ex.py`, `mk.py`, `pend.sh`)