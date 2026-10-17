# Longitudinal-technique audit: `/apps/learning-architecture` (read-only, 2026-10-17)

**Question (owner):** many library techniques only work when you come back to them over days or weeks, and a "case" stays open until the skill or belief settles. (1) Is the infrastructure for using each one over time complete? (2) How can test scenarios exercise them?

**Scope:** all **45** techniques in `src/tech/t_a.js … t_e.js` (`window.T`, ids 1–45). Each technique's time shape comes from its own `dose` field (plus `ws` fields that ask you to come back later). Infrastructure was traced in `src/app/*.js`. Paths below are relative to `apps/learning-architecture/src/app/` unless they say otherwise.

---

## 0. Shared infrastructure (cited once, referenced in the table)

**B: baseline.** Every technique gets this, and it is the same for all 45:
- **Start from a real topic:** "شروع تمرین" in the workshop takes a topic (`a3_views.js:367-385`). A new topic can be created from there.
- **Stored record:** one `ex` record (`{tid, topic, status: draft|done, data, rubric}`) (`a3_views.js:366`). It holds only `created` and `updated` (`a1_base.js:224-227`). There is **no due date, no session log and no link to the previous attempt.**
- **Outcome per attempt:** a 0/1/2 self-scored rubric (`a3_views.js:395-406`) and an optional AI critic (`a3_views.js:409-420`).
- **History:** a per-technique table of past `ex` records with date and rubric % (`a3_views.js:352-362`).
- **"Stability" measure:** `A.mastery` (`a1_base.js:328-337`). It counts done `ex` records: n≥1 is "آزموده"; n≥3 with average ≥50 is "در حال تسلط"; n≥6 with average ≥75 is "روان". **It never looks at dates or spacing**, so 6 attempts on the same day count as "fluent".
- **Retention:** the technique's `card` template becomes an SM-2 card through "ساخت کارت مرور" (`a3_views.js:430`, `a1_base.js:300-318`). The card enters the due queue in Today (`a3_views.js:129-130`) and review (`a4_views2.js:314-352`).
- **Course:** a course lesson per technique, with warm-ups that ask about the technique itself at gaps of 1/3/7/21/60 days (`a11_course.js:280-331`). Closing a lesson auto-creates a card due tomorrow (`a11_course.js:532`).
- **Farm:** `A.onExDone` copies fields into the farm (`a5_farm.js:467`).
- **Mind card:** **B feeds nothing into the mind card.** `M.model` (`a29_mind.js:42-110`) reads `kitem`, `pbitem`, `eprog` guesses, moves, `case`, `wchain`, `fcast` and `prereq`. Cards count only as "cardSelf" (a self-graded count, `a29_mind.js:74-75`). `ex` records, rubric scores and P3/P4 recall % are never read.

**K: knot case.** A technique can run as an action inside a knot case. Its worksheet is stored as `ex` with `ex.kcase`, and the knot moves to "working" (`a16_knots.js:1605-1622`). The knot then has the strongest open-until-stable machinery in the page:
- `A.kmastery` (`a17_kpractice.js:1237-1290`): practice mode needs ≥3 correct answers in a row, in ≥3 forms, over ≥2 sessions ≥3 days apart, plus decoys. Experiment mode needs ≥3 complete experiments spread over ≥14 days.
- A new matching situation sets the knot to "returned" (`a17_kpractice.js:1241-1246`).
- Retention holds at 30 and 90 days (`a27_tour.js:60`, `a34_psy.js:108`).
- Host reminders (`a17_kpractice.js:1365-1412`).

**Stability is measured on the knot, not on the technique.** Inside a knot, a technique is a one-time "✓ انجام شد".

Techniques reachable as knot actions (from the `T(n)` calls in `a16_knots.js`): **1, 3, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 20, 21, 22, 23, 24, 25, 26, 28, 31, 32, 34, 35, 36, 37, 38, 41, 43, 45** (30). Not reachable: 2, 4, 12, 16, 17, 18, 19, 27, 29, 30, 33, 39, 40, 42, 44.

**J: journey step.** `a15_journey.js:20-31` assigns T33 (S1), T37 (S2), T4 (S5), T13 (S6) and T21 (S9). S10 schedules P3 1-3-7 for real (`a15_journey.js:210-211`).

**Other schedulers that exist but are separate from techniques.** There are about 12, each with its own interval table:

| Scheduler | Location |
|---|---|
| SM-2 cards | `a1_base.js:300-318` |
| P3 `sched` 1/3/7 | `a4_views2.js:178-181` |
| P2/P4/P5/P9 "since last run" | `a3_views.js:136-139` |
| Course warm-ups | `a11_course.js:280` |
| Epistemics course warm-ups | `a13_epi_course.js:251` |
| Moves ladder [1,3,7,21,60] | `a19_moves.js:593-594` |
| Knot items | `a17_kpractice.js:1341-1385` |
| Knot experiments `kexp` | `a17_kpractice.js:1349`, `:1869-1891` |
| Isomorph problems `pbitem` | `a20_similar.js:29` |
| Epistemic case `revdate` | `a6_epi.js:235-244` |
| Live problem steps, incubation, check-in, coaching | `a38_live.js:3621-3660` |
| 🌱 will | `a36_solve.js:1120-1135` |
| `fcast` and `wchain` due | `a31_tools.js:33`, `:83` |
| Tour facets and holds | `a27_tour.js:768-800` |
| Chat deadlines | `a33_dates.js:28-29` |

The array [1,3,7,21,60] is copied in `a11_course.js:280`, `a13_epi_course.js:251`, `a19_moves.js:593` and `a27_tour.js:2082`.

**Across all 45 worksheets, no field is of type `date`** (checked by dumping every `ws` field type). Wherever the text says "return in N days", the page has either a free-text field or a `lock` field with no schedule behind it.

---

## 1. Technique table

Time shapes:
- **1-shot:** one session per instance.
- **rep:** repeated independent instances that build a habit or skill.
- **redo:** the same artefact rebuilt from memory on fixed later days.
- **long:** the case stays open until a verdict, an outcome or stability arrives.

Verdicts:
- **ready:** the time part is supported end to end.
- **partial:** a dedicated time mechanism exists somewhere but isn't wired to the technique, or pieces are missing. For "rep" techniques, partial means B only: history plus a count, with no cue and no spacing.
- **missing:** the technique needs return or verdict tracking and nothing beyond B exists.

| # | Technique | Time shape (from `dose` / `ws`) | Existing infra (file:line) | Gaps for real multi-week use | Verdict |
|---|---|---|---|---|---|
| 1 | First Principles | rep: "۱–۲ بار در هفته", 2–3 core concepts per course | B; K (`a16_knots.js:132`) | No weekly cue; no series linking reconstructions of the same rule; count-only mastery | partial |
| 2 | Decomposition | redo: "بازنگری درخت پس از هر ۳–۵ جلسه" | B; `lock` recheck "مونتاژ از حافظه" in ws; card template is a from-memory prompt | Nothing counts sessions or triggers the revisit; a card answer can't hold a re-drawn tree; not reachable from a knot | partial |
| 3 | Pareto / Key Drivers | long: "بازبینی ماهانه با داده واقعی" | B; K | No monthly review date; drivers table never re-measured against new data; no trend of driver shares | **missing** |
| 4 | Structural Mapping | redo: rebuild from memory "پس از ۳ و ۷ روز" | B; J S5 (`a15_journey.js:25`); card template asks to redraw from memory | Days 3/7 aren't scheduled (the card gives 1 then 3 days); a redrawn map isn't stored or diffed against map1 | partial |
| 5 | Levels of Abstraction | rep: per session, start and end | B; K | Per-session habit has no cue or log | partial |
| 6 | Analogical Reasoning | 1-shot: 20–30 min per hard concept | B; K | (Optional) verify the analogy's prediction later: free text only | ready |
| 7 | Pattern Chunking | rep: "۲ تا ۳ بار در هفته با موارد مخلوط" | B; K; mixed recognition exists in kpractice (`a17_kpractice.js:1341`), isomorph problems (`a20_similar.js:29`), moves (`a19_moves.js:593-663`) | T7's own domain or case table never becomes a mixed recognition deck; the 10-min speed drill isn't scheduled; no accuracy-by-pattern trend | partial |
| 8 | Systems Archetypes | rep: "هفته‌ای یک موقعیت واقعی" | B; K | No weekly cue; no library of past archetype diagnoses to revisit when "falsify" evidence arrives | partial |
| 9 | Reference Class | long: estimates journal "ماهانه با نتایج واقعی مقایسه" | B; K; 🎯 `fcast` has the exact q/p/due/outcome schema (`a31_tools.js:72-100`) and feeds the mind card (`a29_mind.js:95-97`) | The T9 worksheet doesn't create an `fcast`; `final` estimate has no due or outcome; inside-vs-base gap never scored over time | partial |
| 10 | Signal vs Noise | long: verdict after out-of-sample data; ws asks "چه زمانی دوباره بررسی‌اش می‌کنم؟" | B; K | Recheck date is free text; nothing stores the out-of-sample result or re-runs; no list of open claims | **missing** |
| 11 | Inversion | 1-shot, plus review "پس از هر شکست بزرگ"; ws `today` field "کی بازبینی می‌کنم" | B; K | Review date is free text, not a due date (event-triggered, so acceptable) | ready |
| 12 | 5 Whys | 1-shot per error | B | A "recurring error" isn't linked to earlier chains (a knot's job, but T12 isn't reachable from knots) | ready |
| 13 | Socratic Questioning | rep: "هفته‌ای ۲–۳ ادعا" | B; K; J S6 | No cue; no claim record that collects repeated questioning | partial |
| 14 | Reframing | 1-shot (+ monthly for own plan) | B; K | The monthly self-reframe isn't scheduled | ready |
| 15 | Challenging Assumptions | long: "بازبینی فرض‌های باربر هر ماه یا با هر رویداد مهم" | B; K | No assumption register with review dates; load-bearing assumptions never come back | **missing** |
| 16 | Latticework of Models | long: weekly; admit a model "به شرط آنکه دست‌کم سه بار در موقعیت واقعی به کار رفته" | B | No model registry and no usage counter across sessions; not reachable from a knot; the "3 real uses" rule can't be enforced | **missing** |
| 17 | Abstraction & Generalization | rep: weekly principle "با مورد دوم از دامنه دیگر آزموده" | B | The second-domain test isn't linked to the principle; no principle register | partial |
| 18 | Integrative Thinking | 1-shot: 30–45 min per conflict, monthly | B | None material | ready |
| 19 | Cross-Pollination | rep plus a test: weekly "میز میکس", one transfer taken to testing | B | The transfer's test has no due or outcome; nothing enforces one transfer a week | partial |
| 20 | Multiple Perspectives | 1-shot | B; K | None material | ready |
| 21 | Hypothesis Testing | long: "اجرا از یک روز تا چهار هفته؛ حداکثر دو آزمون باز" | B; K; J S9; `kexp` plan/predict/conf/due/observe/outcome (`a17_kpractice.js:1869-1891`) in Today (`:1420-1428`) with an exp-mode criterion (≥3 experiments over ≥14 days, `:1249-1259`); live steps with prediction and due become `fcast` (`a38_live.js:2052`, `:3621-3660`) | A standalone T21 worksheet (library, course, journey) has no due date and no Today line, and its `update` lock relies on memory; no "≤2 open tests" view across sources | partial |
| 22 | Falsification | long: weekly "باور مقدس"; verdict after observation | B; K; epistemic `case` with `revdate`, Today (`a6_epi.js:235-244`, `a3_views.js:147-148`) and mind card s_epi (`a29_mind.js:79-91`) | T22 worksheet isn't connected to a case; one review only, with no re-review after the outcome; no weekly cue | partial |
| 23 | Rapid Feedback Loops | long: quiz now, "بازآزمایی یک روز بعد", trend review every 3–5 cycles | B; K; answer-checked immediate feedback with spaced retest in kpractice, pbitem and moves | The T23 loop defined in the worksheet has no retest schedule; no per-cycle score log or trend | partial |
| 24 | Calibration of Confidence | long: daily 3–5 predictions; monthly review "وقتی دست‌کم ۵۰ مورد داوری‌شده" | B; K; `calib` field → `A.calibPoints` (`a1_base.js:339-361`) → home Brier (`a3_views.js:194`); card confidence (`a4_views2.js:345-350`); 🎯 `fcast` → mind card | T24 predictions have no due date, so resolving one means remembering to reopen the `ex`; T24 rows never reach the mind card; standalone `fcast` and `wchain` due dates never appear in Today (see §3); no "50 resolved → review" prompt | partial |
| 25 | Peer Review / Red Team | 1-shot per output, with a round trip: "دست‌کم یک داور انسانی و یک دور تیم قرمز" | B; K; AI critic (`a3_views.js:409-420`) | No way to send to a human reviewer, receive the critique later, or track which critiques the next version fixed | partial |
| 26 | Visual Models | redo: "بازکشیدن آن از حافظه یک روز بعد" | B; K | Day+1 redraw isn't scheduled and the redraw isn't stored or compared | partial |
| 27 | Thought Experiments | 1-shot: "برای هر قاعده یا فرمول مهم یک بار"; 3–5 runs in one session | B; course simulators (`a14_sims.js`) | None for its own time shape | ready |
| 28 | Feynman | redo until stable: "بازنویسی نهایی را ۱ روز و ۱ هفته بعد بدون منبع دوباره بنویس" | B; K; `jargon` analyzer in ws | Day 1 and day 7 rewrites aren't scheduled; rewrites aren't versioned or compared (jargon count, length); no "explanation stable" exit | partial |
| 29 | Learning by Teaching | rep: "هفته‌ای ۱ جلسه با شنونده‌ی واقعی"; ≥1 day after study | B; nearby: live-problem coaching of another person with spaced follow-ups (`a38_live.js:361`, `:424`, `:3627`) | No weekly session cue; worksheet "stuck points" aren't carried into the next session; not reachable from a knot | partial |
| 30 | Zettelkasten / Reflective Notes | long: notes after every session plus "هفته‌ای یک بار ۲۰ دقیقه گشت‌وگذار" | B; the farm is the growing network (`a5_farm.js`, plant via `a3_views.js:432`), nursery count in Today (`a3_views.js:141-142`) | No weekly walk cue; no note-link growth metric; not reachable from a knot | partial |
| 31 | Growth Mindset | long: "بازگشت ۲ تا ۷ روز بعد برای سنجش نتیجه‌ی راهبرد تازه"; ws `result` lock says "پس از اجرا (۲ تا ۷ روز بعد) برگرد" | B; K | The return is promised in the text but never scheduled, reminded or surfaced; no strategy-outcome history | **missing** |
| 32 | Metacognitive Awareness | rep plus calibration: pauses each session; "هفته‌ای ۱–۲ بار" prediction table | B; K; `calib` field in ws | Judgement-of-learning predictions aren't fed to the mind card or resolved later; no weekly cue | partial |
| 33 | Curiosity-Driven | rep: pre/post per session | B; J S1; `calib` field | Parked "for later" branches have no queue | partial |
| 34 | Intellectual Humility | long: weekly belief; "پوشه‌ی اشتباهات فکری من" reread monthly | B; K | No mistakes log, no monthly reread, no belief revision history | **missing** |
| 35 | Embrace Ambiguity | long: "بازگشت پس از داده‌ی تازه"; "فهرست ثابت از ابهام‌های باز… هفته‌ای یک بار مرور" | B; K; ws `update` lock | No open-ambiguities register, weekly review or data-arrival trigger; probability updates aren't kept as history | **missing** |
| 36 | Situation Model (Kintsch) | rep: "هفته‌ای ۲–۳ متن کلیدی" | B; K | No cue or trend of model-vs-text mismatch | partial |
| 37 | Cognitive Load (Sweller) | rep habit: per-block setup; weekly course-list review; cap 1–2 active | B; K; J S2; active-sources cap warning in Today (`a3_views.js:151`), P10 queue | Weekly review isn't scheduled; block log or timer history isn't kept beyond one `ex` | partial |
| 38 | Dual Coding | redo: "یک روز بعد ۵ دقیقه بازسازی متن از روی تصویر ذهنی"; ws `recall` field | B; K | Day+1 recall lives in the same worksheet with no date or cue (it can be filled immediately, which defeats it) | partial |
| 39 | Double-Loop Learning | long: when a problem recurs three times; "بازبینی ماهانه یک متغیر حاکم" | B; P9 monthly line in Today (`a3_views.js:137-139`); knot "returned" status detects recurrence (`a17_kpractice.js:1241-1246`) | P9 and T39 are unlinked; recurrence (knot returned) doesn't suggest T39; governing variable not tracked monthly; not reachable from a knot | partial |
| 40 | ICAP | rep: weekly interactive session | B | No cue | partial |
| 41 | Retrieval Practice | long: "چرخه روز ۱، ۳ و ۷؛ برگه سفید هفتگی" | B; K; P3 `sched` 1/3/7 (`a4_views2.js:178-181`) in Today (`a3_views.js:131-134`) from topic, journey (`a15_journey.js:210-211`) and course (`a11_course.js:769`); P4 weekly (`a3_views.js:137`); recall % trend (`a1_base.js:363-366`) on home; gaps go to nursery (`a5_farm.js:476`) | The T41 worksheet itself doesn't start the cycle; the cycle stops at day 7 (no 21/60, no "stable" exit); recall % isn't in the mind card | partial |
| 42 | Spaced Repetition | long: SM-2 "۱ روز، ۶ روز، سپس حدود ×۲٫۵" | SM-2 (`a1_base.js:300-318`) (the code uses 1 then 3 days, not the 6 the text says); due queue (`a1_base.js:318`); Today (`a3_views.js:129-130`); review with pre-answer confidence (`a4_views2.js:331-352`); push reminder (`a33_dates.js:104-115`); auto cards from course, solve and tutor | Cards never retire (`susp` is read but never set); the push reminder is re-synced only on `newCard`, not after grading (§3); self-grades count only as cardSelf in the mind card; no leech detection; the text says 6 days, the code does 3 | ready |
| 43 | Interleaved Practice | rep: "۸–۱۵ مسئله از ۳–۴ نوع مشابه… هفته‌ای ۲–۳ بار" | B; K; review "mix" tab (`a4_views2.js:320`, `:325-330`); kpractice interleaving | The mix tab draws 12 random cards, not 3–4 similar types; T43 worksheet types and problems don't become a problem set; no per-type discrimination trend | partial |
| 44 | Generation Effect | 1-shot per item (pretest, ≤15 min attempt) | B | None for its own time shape | ready |
| 45 | Elaborative Interrogation | rep habit: 5–10 claims per session | B; K | No cue; claims aren't aggregated | partial |

**Counts**

| Time shape | Count | Techniques |
|---|---|---|
| 1-shot | 9 | 6, 11, 12, 14, 18, 20, 25, 27, 44 |
| rep | 15 | 1, 5, 7, 8, 13, 17, 19, 29, 32, 33, 36, 37, 40, 43, 45 |
| redo | 5 | 2, 4, 26, 28, 38 |
| long | 16 | 3, 9, 10, 15, 16, 21, 22, 23, 24, 30, 31, 34, 35, 39, 41, 42 |

| Verdict | Count | Techniques |
|---|---|---|
| ready | 9 | 6, 11, 12, 14, 18, 20, 27, 44, 42 |
| partial | 29 | — |
| missing | 7 | 3, 10, 15, 16, 31, 34, 35 |

Of the 16 longitudinal techniques, only **T42** is ready. Seven are partial: 9, 21, 22, 23, 24, 30, 39 and 41 have a dedicated mechanism somewhere, but it isn't wired to the technique. Seven are missing.

*Owner's examples that the library's own text calls one-shot:* **T27** (thought experiments: "یک بار" per rule) and **T25** (peer review: per output, but it needs a reviewer round trip, so it is rated partial).

---

## 2. Clock simulation: can a test move time?

**How "now" is computed**
- `A.today()` (`a1_base.js:55`) builds the date from `new Date()` directly. There is no `A.now()` and no injection point.
- `A.addDays`, `A.daysBetween` and `A.localDay` (`a1_base.js:56-65`) are pure. Good.
- Writes stamp `updated` and `created` from `new Date()` (`S.put`, `a1_base.js:224-227`).
- About ten modules have their own private clocks:
  - `now()` in `a16_knots.js:22` and `a26_assist.js:22`
  - `nowISO()` in `a17_kpractice.js:1209` and `a20_similar.js:18`
  - `nowIso()` in `a27_tour.js:27` and `a33_dates.js:13`
  - inline `new Date().toISOString()` in `a19_moves.js:599/609/626-628`, `a31_tools.js` (`outcomeAt`) and `a18_kmap.js:62`
- Throttles and windows on `Date.now()`:
  - `a27_tour.js:756-759`: sweep every 20 minutes
  - `a27_tour.js:886`: stall sync every hour
  - `a26_assist.js:381`: 2-minute sheet cache
  - `a26_assist.js:580`, `:616`: 30-day windows

**What already works:** Playwright's `page.clock` replaces the global `Date`, timers and `Date.now` together, so `A.today`, every private `now()`, the `S.put` timestamps and the throttles all move consistently. The repo already relies on this:
- `tests/test_audit_learn.js:11` installs the clock and `:181` calls `setSystemTime('2026-10-20')` then reloads to check that course warm-ups are due 7 days later.
- `tests/test_psy_v2.js:18`, `:101-123` use `install`, `runFor` and `setSystemTime`.

`localStorage` survives `reload()` in the same context, so a multi-day scenario can be written as: set day 0 → act → `S.flushNow()` → `setSystemTime(+n days)` → `reload()` → assert.

**What does not work, or needs care**
1. **Patching `APP.today` alone is unsafe.** Records keep a real-clock `created`, which code then compares against `A.today()`:
   - `lastRun` uses `A.localDay(r.created)` (`a3_views.js:136`).
   - Knot practice logs `d: A.today()` next to `at: nowISO()` (`a17_kpractice.js:1326`).
   - The mind card reads `at` while the knot mastery check reads `d`.

   The result is a mixed state that tells you nothing. Only a global clock is reliable (the one-off `Date.now` monkeypatch at `tests/test_tour1_r6_live.js:441` is fine only because it is that narrow).
2. **Throttles keep in-memory state.** Jumping forward is fine. Jumping backward blocks sweeps until reload. Always reload after a jump.
3. **Timezone.** `A.today` is local. Tests must set `timezoneId` (as `test_audit_learn.js:9` does) and cover the Tehran 00:00–03:30 edge described at `a1_base.js:57-58`.
4. **Host mode.** In Lifemanager the records and reminders go to the backend, which uses its own clock. The page clock cannot move the server. Reminder delivery is testable server-side because `deliver_due(db, now=…, senders=…)` accepts an injected time (`app/services/app_reminder_service.py:269-277`). End-to-end "a reminder arrives on day 7" needs pytest with injected `now`, plus a page-side stub of `A.HOST.remind` that captures the `{key, due_date}` payloads (`a17_kpractice.js:1412`, `a27_tour.js:835`, `a33_dates.js:112`).
5. **AI.** The critic (`a3_views.js:409-420`) and the assistant are nondeterministic. Multi-day scenarios should stub `A.HOST.ai` / `A.callAI`.
6. **Scenario runners that are not Playwright** (human-style tour runners using only the UI) have no way to move time. That needs an in-page hook: an `A.now()` used everywhere (replacing `new Date()`/`Date.now()` in the ~10 helpers above and in `S.put`), with an offset set by `?clock=YYYY-MM-DD` or `APP.clock.advance(n)`. It should be dev-only and visibly flagged.

**Features where a clock jump shows nothing,** because no code reads time for them. Today a test can only assert their absence:
- every generic technique worksheet (`ex` has no due date)
- `A.mastery` (date-blind)
- T24 prediction rows
- the "come back in N days" `lock` fields in T28, T31, T35 and T38, and the free-text return dates in T10 and T11
- standalone `fcast` and `wchain` due dates on the Today page (§3)

**Features that can be tested with the clock today:**
- cards (SM-2 due and reminder payload)
- P3 1/3/7 and P2/P4/P5/P9 cadence lines
- course and epistemics-course warm-ups
- knot items, experiments, mastery, "returned" status and 30/90 holds
- moves and isomorph ladders
- epistemic case `revdate`
- live-problem steps, incubation, check-in and coaching
- 🌱 will, tour follow-ups, chat deadlines

### How scenarios can exercise longitudinal techniques
- **Template.** Day 0: start from a real problem (topic, knot or live problem) → run the technique → assert that a dated follow-up exists. Then for each due day: `setSystemTime` → `reload` → assert the Today line and the captured `HOST.remind` payload → log an outcome. Include the failure branches:
  - a missed day (overdue still shows)
  - a failed recall (interval resets)
  - a new matching situation (knot becomes "returned")
  - a midnight edge in Tehran

  After N cycles, assert the exit criterion and the change in the mind card.
- **Use what is wired now.**
  - T42: cards.
  - T41: P3 1-3-7 plus P4.
  - T21: as a knot `kexp` ×3 over ≥14 days, which flips the knot to "practised".
  - T22: as an epistemic case with `revdate` → outcome → mind card s_epi.
  - T24: as `fcast` entries, which feed the mind card's calibration.
  - T39: P9 at 30 days.
  - T7 and T43: via kpractice.
- **Use gap-documenting scenarios for the rest.** Example: T31 strategy. On day 3, assert that nothing in Today asks "did the new strategy work?" This records the gap as a test until the infrastructure exists, and then flips to a positive assertion.

---

## 3. Concrete defects found along the way

1. **Standalone 🎯 `fcast` and ⛓ `wchain` due dates never appear in Today.** `a31_tools.js:1-8` says "در «امروز» موعدشان می‌آید", but no `A.dueList` wrapper reads `fcast` or `wchain`. They surface only through tour facets (`a27_tour.js:238`) and live-problem steps (`a38_live.js:3621-3660`). Wrappers exist only for kexp (`a17:1420`), kpractice (`a17:2175`), moves (`a19:657`), tour (`a27:768`), plans (`a27:3286`), live (`a38:3641`) and will (`a36:1120`).
2. **The card push reminder goes stale after review.** `AS.cardsPushSync` is hooked only to `A.newCard` (`a33_dates.js:115`). `A.srsGrade` (`a1_base.js:300`, called from `a4_views2.js:350`) doesn't re-sync, so after a review session the "cards:review" reminder keeps the old day until a new card is created.
3. **SM-2 text and code disagree.** T42's `dose` says the second interval is 6 days. The code uses 3 (`a1_base.js:305`).
4. **Cards can't be retired.** `susp` is read in `a1_base.js:318`, `a27_tour.js:51` and `a33_dates.js:106`, but nothing ever sets it.

---

## 4. Summary: root mechanisms that are missing (not per-technique)

1. **No follow-up primitive for technique worksheets.** An `ex` has no due date, return step, Today line or reminder, and none of the 45 worksheets has a date field. Yet the library text asks for returns in at least 20 techniques: 1 day or 1 week, 3/7 days, 2–7 days, monthly, "after data arrives". Twelve or more separate schedulers exist (cards, P3 sched, course warm-ups, moves, kpractice, kexp, pbitem, epistemic `revdate`, live steps, will, `fcast`/`wchain`, tour holds, deadlines), each with its own copy of [1,3,7,21,60]. A technique can't borrow any of them.
2. **No "case or series" for repeated use of a technique.** Each attempt is an unlinked `ex`. Re-drawing the same map, rewriting the same Feynman explanation or re-testing the same hypothesis creates a new, unrelated record with no versions, no diff and no per-session log. Only knots (`kcase`/`knot`) and live problems have an open-until-stable case, and there the technique is a one-time action.
3. **Stability is date-blind and self-graded.** `A.mastery` (`a1_base.js:328-337`) counts attempts and self-rubric scores and never looks at dates. The page already has good spacing-aware criteria:
   - `kmastery`: ≥2 sessions ≥3 days apart, 3 forms, decoys; experiments over ≥14 days
   - the mind card's spread of ≥3 days

   Neither is applied to techniques. No technique has an exit criterion, and cards never retire.
4. **Technique use is invisible to the mind card.** `M.model` doesn't read `ex`, rubric scores, T24 or T32/T33 `calib` rows, or P3/P4 recall %. Weeks of retrieval, calibration or Feynman work don't move it. Only the knot, problem, `fcast` and `case` paths do.
5. **Parallel ledgers that aren't wired together:**
   - T24 worksheet predictions vs 🎯 `fcast` vs card confidence
   - T21 worksheet vs `kexp` vs live steps
   - T22 worksheet vs epistemic `case`
   - T9 worksheet vs `fcast`

   In each pair, the version that has dates and outcomes is not the one the technique page or course opens.
6. **Weak links back to the problem.** An `ex` links to a topic, and to a `kcase` when started from a knot. It doesn't link to a live problem (`lprob`) or an epistemic case, and a technique's outcome never updates the status of the problem it served. Fifteen techniques (2, 4, 12, 16, 17, 18, 19, 27, 29, 30, 33, 39, 40, 42, 44) can't be started from a knot at all.
7. **No registers for longitudinal epistemic objects.** There is no assumption register (T15), model registry with a use counter (T16), mistakes folder (T34), open-ambiguities list (T35) or open-claims list (T10). These are the 7 "missing" verdicts.
8. **Clock.** Playwright's global clock works and is already used. What's missing is an in-page `A.now()`/offset hook for non-Playwright tour runners, plus a page-plus-server reminder test (`deliver_due(now=…)` exists server-side but isn't connected to the page scenarios).
