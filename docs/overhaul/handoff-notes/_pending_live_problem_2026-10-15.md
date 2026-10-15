# Pending: «🔭 مسئلهٔ حل‌نشدهٔ خودم» — the solving tunnel on real unsolved problems (2026-10-15)

> Temporary note. It does not replace WORKLOG, PROGRESS, HANDBOOK, AUDIT_LOG or experiences. As the session asked, those files,
> `sources/*/coverage.json` and `epi_*` were left untouched. Whoever merges should use this note to write a WORKLOG section, a PROGRESS
> row ("forward"), HANDBOOK §2/§10 (and §6 for the test count) and an AUDIT_LOG entry.
> Area: `lla-page` (a6, a8, a9, a12, a19, a21, a25, a31, a36, the new a38, build.py, tests). No new record type was added.
> No new menu entry was added either: the new view `lprob` is a SUB_VIEW of `e_prob`.
> Nothing is named after Pólya.

## What changed
The gap (decision doc, "structural gap"): the step-by-step tunnel in a36 only ran on problems whose answer was already known. It now
also runs on the owner's real, unsolved problems. Reality is the judge, not a stored step.

- **A. Entry and record**
  - **Where to start:** a new tab in «مسئله‌های من», «🔭 مسئلهٔ حل‌نشدهٔ خودم». Its form is labelled and not data-own, so the assistant can fill it.
  - **Links to it:** a line in the list, a note in «افزودنِ مسئلهٔ تو», a button in the empty state, and a door on «از کجا شروع کنم» (a9).
  - **The record:** the same `eprob` type, with `status:"live"`, `mode:"live"` and `live:true`.
  - **Migration:** a fill-empty migration (`A.liveMigrate`) gives older records that have no `mode` the value `mode:"solved"`. It runs once, with `keepTime`, so their order does not change.
  - **Assistant action:** `{"do":"live_new","title","statement"}` creates a record from the user's own words only.
- **B. Understanding (a38 `uCard`, using a36's fields, typeSel, gradeBtns and the spaced ladder)**
  - The card asks for the whole problem in one sentence **first** (A107/A293), then "why do you want to solve it?" (required).
  - It then asks for the unknown, a **list** of data with an id for each item (`s.u[1].dl`), the condition, how the parts relate, sufficiency with its reason, and a figure or table even when the problem is not geometric.
  - On first encounter it asks for a guess with confidence and a test, plus the guess kit (analogy and rivals).
  - The answers go into `eprog.solve.u[1]` and `g[1]`, so "u" and "g" come back on the 1/3/7/21/60 ladder through the existing «مرورِ حلِ مسئله» line.
  - Type: find, prove or pod. There is no separate "decision" type, because find already covers a decision.
- **C. Plan**
  - **One question at a time:** from `A.solveAskList("p")`, general to specific, with the «چرا این پرسش» line, «پرسشِ بعد», and «این پرسش راهی باز کرد؟» (0/1/2).
  - **Related problems:** a code-only token-overlap search over your own live and solved problems, knot-solver cases, ideas and factory cases. It shows the top three with the shared words and a "link it" button.
  - «همین مجهول را دیده‌ای؟»: a "no" gets a follow-up, "then what *is* familiar?" (B148).
  - **Work backwards:** «فرض کن حل شده — از آخر به عقب» asks for the solved state, the step before it, the step before that, and what you already have. Its text says that analysis is the plan and synthesis is the reverse order.
  - **Auxiliary problem:** special, general, analogous or part of the condition, each with a required bridge back to the original.
  - **Moves:** chosen from the 27 moves, each with a one-line reason and a link to its page.
  - **Plan sentence and unused data:** the code tracks which data each answer or step uses (your ticks, plus the datum's words appearing in the plan, steps, work-backwards, auxiliary problems and move reasons). The plan cannot be saved until you answer, **by name**, «از «…» استفاده کردی؟ اگر نه، چرا؟» for each unused datum. Answering "I don't know where it fits" is flagged as a clue.
- **D. Executing against reality**
  - **Each real step needs:** a concrete step (`A.willConcrete`), «روشن می‌بینی که این گام درست است؟» (required), the datum or premise it relies on, a prediction, a confidence, a day (parsed by `A.willWhen`; time-only and past dates are refused) and data ticks.
  - **Forecast record:** the prediction becomes an `fcast` record with `dim:"s_problem"` and `live:{pid,step}`. This is the existing **event-forecast** data path: `P.answers().FC` gives `P.forecastEst`, and the mind card's `s_problem.cal` gets `fc:true`. It is not the answer-confidence path.
  - **On the due day:** «امروز» asks «انجامش دادی؟ چه شد؟». You judge the match yourself (data-own).
  - **How the forecast is closed:** a match closes it as شد, a miss as نشد, a partial match as تاحدی and a step not done as انجام نشد. The last two stay out of the binary calibration.
  - **After the outcome:**
    - A surprise offers the knot solver, prefilled with what you expected and what happened, and «دوباره فهمِ مسئله». Re-understanding keeps the earlier card in `uHist`.
    - No progress, or a step not done, shows the existing 🌱 card.
    - Being stuck opens the knot solver with the problem prefilled.
  - The generic forecast line in «امروز» (a31) skips `fcast.live`, so you are not asked twice.
- **E. Claims:** «فکر می‌کنم … درست است» goes to `A.newCase` in one click, with `src:{type:"lprob"}`. The case page gets a «← برگشت» button, and the claim shows its engine standing through `A.IDEA.assumptionGrade`. An unfinished case shows "doubt ½"; no AI is involved.
- **F. Look-back (solved or abandoned)**
  - **Solved fields:** check the result (how, and what it showed), another route, the whole in one glance, "what worked and how to repeat it" (A143), which question helped most (recorded in `bestQ`), the lesson in your own words, and the guess compared with what happened (`g.hit`, which feeds the existing META path).
  - **Shown for comparison:** the initial "why" is shown again.
  - **Unused data:** any datum still unused is asked about by name again.
  - **The lesson** becomes a review card through `A.newCard`, and the "b" review starts on the ladder.
  - **«مسئلهٔ تازه‌ای که از این ساختی»** becomes a new live problem, dormant until ladder rung 2 (+3 days). It then **returns** in «امروز» («🧩 … برگشت») to be solved.
  - **Abandoning** requires a reason and its source. It writes `will.drop`, the existing 🌱 conscious drop, which is re-asked on the ladder. Answering «نه — دوباره پیش می‌برمش» reopens the problem.
- **G. Making the questions your own (a36)**
  - **How each question climbs the ladder:** `A.qUses` and `A.qRung` work this out from the stored answers alone, with no new record. Each use where you judged the question's help (sim motive "led to the real move", or live "it opened a way") moves the question on the same `nextIv` ladder. Uses before the due date do not count.
  - **At rung ≥ 3** (`A.Q_OWN_RUNG`, meaning the question helped twice with spacing between): the ask-now card first asks «الان از خودت چه می‌پرسی؟», then shows the canonical question to compare. Your judgement of the match (0/1/2) goes into `tut.selfAsk`.
  - This applies both to live problems and to the simulator's `askCard`. Below that rung the card is byte-for-byte the same as before (tested).
  - The ask card shows how many times you have used each question and its rung.
- **H. Wiring**
  - **«امروز»:** one line per kind («🔭 n گامِ واقعی …» and «🧩 n مسئلهٔ تازه …»). Reviews use the existing line.
  - **`A.getProb` wrapper:** it finds live problems, so 🌱, spaced review and the mind card resolve them. `A.probs` is untouched, so live problems stay out of the sim, moves and the `prob` nodes.
  - **`e_prob` wrapper:** `e_prob/<livePid>` renders `lprob`.
  - **Graph:** a new graph type `lprob` (registered in `G.TYPES` and `test_graph.js`) with edges to the chosen moves, claim cases, knot cases, your related links and the parent problem. `recRef("eprob")` resolves live records.
  - **Other views:** `VIEW_META.lprob` and `SUB_VIEWS.lprob = "e_prob"`. The `e_prob` entry text now mentions the tab. The Drive mirror shows "unsolved" as the status. A kcase from a live problem links back to it (a19).
  - **Assistant hooks (conditional, so SYS is unchanged):**
    - The live-problem hook gives the phase and one suggested question, general to specific, from the same lists. It lists unused data by name, and says to never solve, never judge and never fill data-own fields.
    - `RULES` with `live_new` are added only when the message looks like a real open problem.
    - The generic solving tutor returns null on live problems, so two tutors never run at once.

## How it was verified
- New `apps/learning-architecture/tests/test_live_problem.js` (Playwright, only real UI controls, 390px viewport, clock at +1/+3/+7/+10/+21).
  - **The problem:** "accept the Shiraz job offer or stay in Tehran" (salary, rent, spouse's job, sick mother, deadline), a second assistant-created problem (German class) and the invented problem that returns.
  - **Covers:** A–H, fill-empty, data-own and labels on every form, no horizontal overflow at 390px, and the bidi rule.
- **Mutation sanity** (each one built, run, then reverted): with the unused-data prompt removed, without the `fcast` record and with the gate never opening, the test failed with exit 1 every time.
- All 61 `tests/test*.js` plus `scan_epi.js` were run in a pool of 4, judged by exit code: **61/61 pass** (including the updated `test_graph.js`).
- `build.py --check` is in sync. `pytest tests/test_learning_architecture_handbook.py` passes 6/6, and all other `learning_architecture` pytest files (except the browser runner, which repeats the above) pass 8/8.
- **Not done:** I did not run the real-model AI audit (`/api/inspection/audit/ai`). The AI route itself did not change; only conditional prompt hooks were added. SYS is 19988 characters, which was already the case before this change.

## HANDBOOK paragraph to add (§2, after «حلِ مسئله گام‌به‌گام»)
**«🔭 مسئلهٔ حل‌نشدهٔ خودم»** (مسئله‌های بزرگ ⇐ زبانهٔ همین نام): تصمیمی که باید بگیری، پروژه‌ای که گیر کرده یا پرسشی فکری که جوابش را نمی‌دانی — بی پاسخ. همان تونلِ حل، این بار روی واقعیت:
- **فهم:** اول کلِ مسئله در یک جمله و چرا می‌خواهی حلش کنی؛ بعد مجهول، **هر داده جدا**، شرط و کفایتش؛ و حدسی با اطمینان و آزمونش.
- **طرح:** یک پرسش در هر نوبت، از کلی به خاص، با «چرا این پرسش»:
  - مسئلهٔ مرتبط از کارهای خودت (با کد، واژه‌های مشترک)؛
  - «فرض کن حل شده — از آخر به عقب»؛
  - مسئلهٔ کمکی با پلِ برگشت؛
  - حرکت‌ها با دلیل؛
  - طرح ثبت نمی‌شود تا دربارهٔ هر داده‌ای که به کار نرفته، با نامش، بگویی چرا.
- **اجرا:** هر گامِ واقعی پیش از انجام یک پیش‌بینی با احتمال و روز دارد. همان روز در «امروز» می‌پرسد «انجامش دادی؟ چه شد؟» و هم‌خوانی را خودت داوری می‌کنی. پیش‌بینی‌ها در «🎯 دفترِ پیش‌بینی» و کالیبراسیونِ «🧠 کارنامهٔ ذهن» می‌نشینند.
- **پس از نتیجه:**
  - غافلگیری ⇐ گره‌گشا یا «دوباره فهمِ مسئله»؛
  - بی‌پیشرفت ⇐ «🌱»؛
  - گیر ⇐ گره‌گشا با همین مسئله.
- **ادعاها:** هر ادعای درونِ مسئله با یک کلیک پروندهٔ کارخانه می‌گیرد و درجهٔ موتور کنارش می‌آید.
- **بازنگری (یا کنار گذاشتنِ آگاهانه با دلیل):**
  - درس ⇐ کارتِ مرور؛
  - «کدام پرسش بیشتر کمک کرد» ثبت می‌شود؛
  - مسئلهٔ تازه‌ای که از آن ساختی سه روز بعد برای حل برمی‌گردد.
- **پرسش‌ها از آنِ خودت می‌شوند:** پرسشی که دو بار با فاصله کمکت کرده (پلهٔ ۳ ِ نردبان)، دیگر داده نمی‌شود. اول می‌پرسد «الان از خودت چه می‌پرسی؟» و بعد پرسشِ فهرست را برای مقایسه نشان می‌دهد. شبیه‌ساز هم همین‌طور است.

§10 decision: «حالتِ زنده در همان تونل، نه سامانهٔ موازی». Rejected alternatives:
- a separate "real problem" record type or view per book;
- AI-judged step correctness;
- a fixed-count threshold for internalisation.

The ladder rung is used instead.

## Pólya items I believe this now covers (for the independent re-audit; coverage.json was not edited)
Each is deep **for live problems** unless noted; the re-auditor decides.
- **Structural gap (#1):** the full tunnel (understanding card, ask-now, guess, step check, look-back, lessons, spaced reviews) now runs on unsolved real problems. **B239** too: the tunnel now works on non-mathematical problems.
- **Group A (missing material)**
  - **A050, C035, B086, B091:** per-datum usage is tracked in code. Each unused datum must be answered by name at the plan stage and again at look-back.
  - **B002:** data are entered as a separate list. Only partial: a datum's role and unit are not asked.
  - **B089:** "don't know where it fits" is presented as the missing-element clue, and the assistant gets the unused data by name.
  - **A147:** partial, through the look-back unused-data question.
  - Not covered: A052, B092, C006, B053, B058, B059, A151, B088 (concepts and definitions).
- **Group B (whole before parts)**
  - **A107, A191, A293, C082:** the whole in one sentence is required before the parts, and the test checks the order.
  - **B048:** required on live problems, but it does not return in the "u" review, so only partial.
  - **A195, B126:** an optional field relating the parts, so shallow.
- **Group C (look-back with no return)**
  - **A265, C119:** the invented problem returns to be solved.
  - **A157:** the "slightly different problem" is required.
  - **A143:** "what worked and how to repeat it" is optional but goes onto the review card, so shallow to partial.
  - **A138:** partial.
- **Group D (wanting the solution)**
  - **A099, B074:** "why do you want to solve it / what makes you curious" is required at the start and shown again at look-back.
- **Group E (internalising the questions)**
  - **A069, B237, C121:** self-ask before the canonical question at rung ≥ 3, compared and self-judged, in both the simulator and live problems.
  - **B148:** a "no" gets a follow-up.
  - **A253 (partial):** each question's help is self-judged and tracked by rung, and the most helpful question is recorded.
  - **C155:** shallow; the list of chosen moves is the record of keys tried.
- **Group F (real execution and prediction)**
  - **A126, B207:** a prediction and confidence come before every real step and are compared with the outcome.
  - **A130:** «روشن می‌بینی که این گام درست است؟» is required for every step.
  - **C029, B268:** partial, since calibration accumulates across steps.
- **Group G (plausible reasoning)**
  - **C091:** recorded feelings (predictions with confidence) are now compared with later outcomes and calibrated in the mind card.
  - **C095, C097, C099:** partial (the surprise card, the outcome per step, and progress per step).
- **Group H (assume it solved, working backwards outside mathematics)**
  - **B266, B272, B129:** a work-backwards card on real, non-mathematical problems.
  - **B270, B271:** stated in the card and lived in the flow (plan, then real steps).
  - **C177, C178:** stated, plus practised in the card.
  - **B273, C052, B127:** partial, through the card's text.
- **Group I (auxiliary problem):** **A252** is stated (shallow). **B029:** several auxiliary problems are allowed (partial).
- **Group J (non-mathematical examples):** **B239** (see above). **B137, B139:** an optional figure or table field, so shallow.
