# Tour 1 (Pólya), round 23: «today» handoff (Q7, 2026-10-19)

Scope (DECISIONS_R23 «Fixers / today»): Q7 — one Today line per act, look-back problems in Today, `deadline_done` from her words,
no raw ids / raw values, chat guess outcomes, duplicate correction/result lines, promises, `list_add` quotes and model dedup,
the practice window, prediction ≠ guess.
Base: main 574f4a30. Docs: WORKLOG (98), PROGRESS 113, HANDBOOK (🧪 bullet, §10 row, §12 row 61). These numbers assume siblings
94–97 / 109–112 / §12 57–60 are merged first (merge order correction ⇐ story ⇐ prereq ⇐ ageclass ⇐ today).
Files: `a41_practice.js` (most), `a27_tour.js` (plan line, `predTurn23`, rule text, result block, promise wording), `a40_dossier.js`,
`a38_live.js` (one line in the `chat_invent` gate), `a33_dates.js` / `a36_solve.js` (ids on Today items only).

## Contracts for the other fixers
- **Today (all):** `PR.actMerge(items)` is the LAST `A.dueList` layer (end of a41). A Today item takes part only if `actOf` recognises it:
  plan (`it.pid` + «📌»), deadline (`it.dl`), single 🎯 (`it.sched` = `"fcast:<id>"`), aggregated 🎯 (`it.sched` array — a linked
  prediction is moved out), practice case (`it.prc`), P3 sheet (`it.sid`), the card line (`it.k === "review"`, only when every due card
  has the same `pb`), solve review (`it.pids` with one id), user promise (`it.prom` + `it.psess`).
  "Same act" = a shared key (`plan:<sess>:<id>`, `fc:<id>`, `prc:<id>`, `dl:<id>`, `prom:<sess>:<id>`, `recall:<normalised problem title>`)
  or, for plan/deadline/🎯/promise only, the same due day AND content overlap (`PR.ovS`: ≥2 words; ≥1 in the same session; or text vs
  the other record's source message ≥2). The owner line keeps its `txt`/`acts`; the rest go to `it.merged` and «همان کار: …». **A new Today
  line that is the same act as an existing record should carry the id field above** (e.g. prereq/territory «ابزارِ لازم آمد» lines are
  different acts — leave them without these fields and they are never merged).
- **Plan line text (a27):** «📌 برنامهٔ خودت[ (دیروز گفتی | n روز پیش گفتی)]: «…»» — no `(plN)`; ids stay only in the prompt block «# برنامه‌های بازِ خودش (شناسه‌ها)».
- **Deadlines:** `PR.dlDoneFromHer(s)` runs after every turn (afterTurnHooks): first-person past-tense report, no negation, not a
  question, only ONE open deadline (date ≤ tomorrow) with the top overlap ⇒ `done`, `doneBy {kind:"her-words", sess, at, quote}`.
  `PR.dlVerb(what)` gives the question/verb (exam / delivery / other). A plan tap «انجام دادم/ندادم» on a merged line sets
  `doneBy {kind:"plan"}` on its deadline.
- **Chat guesses (story, correction):** `PR.guessOwnTest(s)` (afterTurnHooks) sets `g.res`, `g.resBy = "her-test"`, `g.resFrom`, `g.resKey`
  from her own later message (all guess expressions present + ✓/«درسته»/«ثابت کردم»/test verb ⇒ confirmed; refute marker ⇒ refuted;
  numeric guess + «امتحان کردم ۱۵ شد» ⇒ refuted). It never touches a guess with `res`, `withdrawn` or `resRecheck`. The route map and the
  dossier read `g.res` as before.
- **Predictions (ageclass/turnq):** `AS.predTurn23(s, text)` = explicit «پیش‌بینی می‌کنم/پیش‌بینیم…», or a numeric/quantity answer to the
  previous assistant question that asked for a prediction. `guessWhy` returns "" for it (no `GUESS_Q`); `coach_state.guess` on such a turn
  goes to `PR.bookPred(s, text, at, key, by)` ⇒ `s.coach.preds[{text, key, at, due, fc}]`; with a due date (her words, else the open
  dated plan of the same session) a 🎯 `fcast` with `src {chat, quote}`, `by:"chat"`, `p` only from her percent (`est:true` without),
  and `plan {sess, id}` when the date came from the plan. A plan's done state is never written to that prediction.
- **Promises:** `PR.herLater(s)` ⇒ `s.promises {id, ask, ctx (the assistant question she answered), at, d, due, done:false, by:"user"}`.
  They show in the in-session block (a27, wording «خودش گذاشت برای بعد»), in a new prompt block for OTHER sessions
  («# خواسته‌های عقب‌افتادهٔ خودش از سشن‌های دیگر», ≤3), and in Today on `due` (or the day after it was said). `promise_done` closes them.
- **Look-back problems before the record exists:** a refused `chat_invent` while `s.coach.ph === "b"` and no bound problem ⇒ `s.backPend`
  (info line «🔭 نگه داشتم …»); the next `chat_solved` of that session moves them with `A.liveKeepBackNew` into `b.newProbs` (ladder step 2 ⇒ Today).
- **Dossier (correction):** `dedupRet22` keeps one line per change label («برچسب: «…»») when two writers recorded the same correction —
  the first writer's format wins. Raw record values go through `RAWFA`/`hv` in all three views; `A.dossierRawFa(x)` is exported.
- **Correction result block (correction):** when `N.res.changed` is non-empty the prose no longer repeats the list (one copy, the JSON).
- **Lists:** `PR.herQuote(q, s)` (current message, or two pieces from her last two messages); `PR.modelNamed(name, said)`;
  `PR.modelLike(name)` + `PR.modelUseAsk(name, u, host)` (page «همان مدل؟»).
- **Window:** `PR.lastOnTime(c)` is the one window end (steps shape: `until − 1`); `PR.dueText` uses it.

## Tests — `apps/learning-architecture/tests/test_tour1_r23_today.js`
- Runner sentences: 28 checks (26 red on base 574f4a30; the 2 negative guards green on both).
- Bank `tests/variants/VARIANTS_R23.json`, Q7 #168–#187: 20/20 (red on base: #168, #170–#176, #178, #179, #187; #186 not reached on base — exception at #178).

## Not done / notes
- A23-16: the only duplicate found in the s04 p11 prompt was the rule text containing «# اصلاحی که صفحه انجام داد/نپذیرفت» (fixed).
  No literal second block was reproduced; if a run sees one again, check `retNote` (`N.same`) when the same turn's prompt is rebuilt.
- The card line «N کارت مرور» merges only when every due card belongs to that problem (mixed cards keep their own line).
- A page-made 🎯 with no shared words and no link to a plan (e.g. plan «تا پس‌فردا انجامش میدم») can only be joined through the plan's
  source message; otherwise it stays its own line (no forced link).
