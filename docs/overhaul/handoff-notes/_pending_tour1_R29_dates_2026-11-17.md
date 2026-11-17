# Tour 1 (Pólya), round 29: «dates» handoff (R4 date-ask engine, family F6, 2026-11-17)

Scope: DECISIONS_R29 R4 — C117 at page level in B and D shapes (and C, which only *looked* held), C144, C145, C146, C147, regression D29-25;
clarifications C165, C166, C167; S3 members of F6 (A29-5, A29-6, D28-21, B29·D22). Base: BASE29 = 40b34a51.
Docs: WORKLOG (156), PROGRESS 153, HANDBOOK §10 row (2026-11-17 «یک داور برای «زنگ زدم» …») and §12 row 101. The reserved numbers were
WORKLOG 161 / PROGRESS 158; the handbook gate rejects gaps, so the first free numbers on BASE29 were used — renumber at merge.

## Functions changed (nothing in AS.SYS; no prompt text added)
- `a41_practice.js` (date-ask functions only)
  - **new:** `cands29`, `close29`, `which29`, `stay29` (`PR.cands29`, `PR.stay29`), regex `KEEP29`; `bare29`, `objW29`, `newObj29`, `forAct29`
    (`PR.bare29`, `PR.forAct29`), `FILL29`, `MOOD29`, `state29` (`PR.state29`), `multi29` (`PR.multi29`); `pastAct29` (`PR.pastAct29`), `PASTX29`, `doneOn29`.
  - **rewritten:** `PR.doneFromHer28` — one judge over open 📌, her ⏰ AND the page's open date-ask items; «کدام؟» stores `s0._which29` and the next
    message is read clause by clause (named ⇒ closed, named with «بمونه/هنوز/نه» ⇒ kept, «هر دو» ⇒ all, «اولی/دومی»). Old body:
    `PR.R29_QUARANTINE.doneFromHer28` (REMOVAL_CANDIDATES 2026-11-17).
  - **edited:** `lapse27` (no longer closes ask items with `didIt28`; it calls `PR.doneFromHer28` once for the message), `herDays27` (`R.bareD`, `R.bareS`,
    `R.negAlt`; chunks split on «و» between days; state clauses give no day; «اشتباه کردم که …» is not a correction; «آره، راستی …» is a plain yes;
    yesDates split on «و»), `PR.dateAnswer` (`forAct29` everywhere a day had to be «for the same act»; bare-day sentence answers the newest ask;
    several days in one yes answer every waiting ask with those days; in-order mapping; a non-newest free row is answered by a day for the same act or
    by a bare restatement in a sentence naming it), `negBound28` (negation verbs are frame words), `rebook27` (✏️ detection also from `o.by === "edit"`
    / `o.why`; a record whose text this ✏️ did not change is never re-dated; a past-tense report with a past day ⇒ `doneOn29`), `editBooked27`
    (only records the edit touched — `apply` or `unapply`), `PR.datePend` (✏️ past-day ask: no second «از حرفِ خودت» row for the same act; C133
    self-dated items booked at once with her words; prediction items rendered as one «🎯 موعدِ داوریِ پیش‌بینی: … — درست است؟» line instead of the
    plan-style «📅 … در «امروز» بیاید؛ درست است؟»), `PR.herDates` (past month-day whose nearest occurrence is past ⇒ C93 item, never next year; per-clause
    labels when a sentence has two dated clauses; «یعنی حدودِ …» drops the idiom row; split before «آخر/اول/وسطِ ماه»), `clauseOk26` (possessive
    third person with copula, «… همکارمه»), `pastDay28` (copula after the month, «۳۰ آبانه»), `nrm26` (tatweel between letters removed),
    `PR.dlDoneFromHer` (records `doneBy.day` when she named a past day), `PR.herLater` (no deferred request when the request's day is the act's own day).
- `a27_tour.js`: `retractApply`, deadline loop only — on a ✏️ a deadline whose text `sub()` does not change is skipped (C144).
- `a38_live.js`: `retractSess`, deadline loop only — on a ✏️ (`o.by !== "model"`) a deadline that `fixVal` finds nothing in is skipped (C144).

## Contracts for the other fixers
- **One done-judge (C117).** Anything that closes a plan/deadline/ask from «I did it» must go through `PR.doneFromHer28` (or at least through
  `PR.cands29`): it is the only place that sees booked records and pending asks together. Do not re-add closing in `lapse27`.
- **`s0._which29`** = `{ at, list: [{ k, q | r | ask: { P, it }, what }] }` — set when the page asked «کدام؟»; consumed by the next message.
- **`doneBy.day`** (plan or deadline) = the past day she said the act was done (C146/C166). 📜 (story) may show it; nothing else reads it yet.
- **Forecast (owner of 🎯):** prediction items in a date ask (`it.pred`) are now rendered on their own line starting «🎯 موعدِ داوریِ پیش‌بینی:». The
  answer path (`bookItem26` ⇒ `fc27`) is unchanged; if forecast makes C152 drop `duePend` entirely, that line simply never appears.
- **Story:** C166 «a 📜 line of her report» for a past act with no open plan — the date reader creates no plan row and no ask (verified, bank #163);
  the 📜 line itself is story's.
- **Correction (a38):** the new early `return` in `retractSess`'s deadline loop only fires on her ✏️ when `fixVal` finds nothing in that deadline.
