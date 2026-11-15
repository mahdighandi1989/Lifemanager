# Tour 1 (Pólya), round 27: «dates» handoff (R3 date-ask engine, 2026-11-15)

Scope: DECISIONS_R27 R3 — C49–C52, C58, C69–C73; C19/C35 restated; idiom dates (C50, C70). Base: BASE27 = 4273c7f1.
Docs: WORKLOG (141), PROGRESS 138, HANDBOOK §10 row and §12 row 87 (numbers assume the siblings merge first).

## Functions changed
- `a41_practice.js`
  - **new:** `idiom27`, `farv27` (C50/C70), `herDays27` (exported `PR.herDays27`), `ovD27` (`PR.ovD27`), `lapsed27` (`PR.lapsed27`), `didIt27`, `lapse27`
    (`PR.lapse27`), `editOf27` (`PR.editOf27`), `negBooked27`, `negBookedDl27`, `editBooked27` (`PR.editBooked27`); regexes `REL_DAY27`, `IMPER27`, `OTHERN27`,
    `PERF3_27`, `YES27`, `YESW27`, `CORRW27`, `NEGV27`, `DATEW27`.
  - **rewritten:** `PR.dateAnswer` (the round-26 body is kept, unused, as `PR.R27_QUARANTINE.dateAnswer26`).
  - **edited:** `PR.whenInfo` (one idiom call; duration rule with «الان»), `DT26` (idiom spans), `clauseOk26` (three grammar exits + `IMPER27`/`OTHERN27`),
    `PR.herDates` (split on idioms; `free`/`fq` fields; idiom dates of today kept), `itemLine26` (free items), `bookItem26` (`q.date0`; C73 link),
    `dlBook25` (`r.date0`), `PR.planWhen26` (re-report of a plan said on an earlier day ⇒ `{when: ""}`), `PR.datePend` (lapse before and after the answer,
    re-derive only on changed text anchored on `P.d0`, ✏️ handling, booked-negation, D27-4 «از حرفِ خودت», free ask line, «(به‌جای …)»),
    the date prompt hook `say()` (free items), `AS.DO.deadline` wrapper (anchor on the message's own day; negated day refused; C52 attach line),
    the last `A.dueList` layer (lapsed asks hidden; free «کدام روز؟» row).
- `a27_tour.js`: `plan18` — one guard: a plan text with «اگه/اگر» is not a plan (C35). Nothing else.
- `AS.SYS`: nothing added.

## Contracts for the other fixers
- **Pending item shape** gains `free: true` (no day yet: «بعد از عید», «وسطِ ماه», a negated day with no replacement) with `fq` (the question text) and
  `amb: true`; `date` is only the anchor (answers ≥ it). `was` = the day it replaced. A free item is never booked by a yes; only by a day she names.
- **`P.state`** may now be `lapsed` or `replaced`; `P.lapsed[]` / `P.replaced[]` keep history. `PR.datePends` still returns only `open|waiting`.
- **A yes binds only the `open` ask** (the one under the page's last reply). Waiting asks: «تاریخ درسته/نه» (newest pending only), the «امروز» buttons, or her
  restating the same act on that day (`ovD27` ≥ 1, date words removed). Anyone booking a date from chat must go through `PR.dateAnswer`.
- **✏️ turns** («[اصلاحِ پیامِ قبلی] …») are never answers. `PR.editOf27(s0, text)` ⇒ `{text, at, apply}`. A booked plan/deadline from the edited message is
  closed as «replaced» (history; `r.date` restored to the booked day) and the new day is asked once — even when `retractApply` already moved the record's
  date (correction: please converge on this; DECISIONS_R27 C58 replaces R25 bank #239's direct move).
- **Negated days** (`s0.dateNo`) are refused by the `deadline` wrapper unless her current message puts the day forward again.
- **Records:** `q.date0` / `r.date0` = the day booked by her yes. `q.whenHist[]` = days un-booked (negation/✏️). `q.remind` = a C73 reminder day.
- **Story (📜):** a follow-up ⏰ attached to a 📌 (`r.plan`) is one commitment; 📜 still lists it separately (not touched here).

## Tests
- `apps/learning-architecture/tests/test_tour1_r27_dates.js` — 51 checks (runner sentences A/B/C/D + C69–C73), each positive with its look-alike; 40 red on BASE27.
- `apps/learning-architecture/tests/test_tour1_r27_dates_bank.js` — VARIANTS_R27 R3 #100–#150: 51/51 (26 red on BASE27; the others were negatives already green).
- R17–R26 banks and tests unchanged and green (see the fixer report for the suite run).

## Not reproduced / not done
- All R3 defects reproduced. U50 itself (one item) already held at the record level; its round-27 trace (C27-17) was the second «ثبت شد ⏰» line — fixed.
- D27-29's other half (the open practice case's schedule absent from the assistant's prompt, bank 51) is not a date-ask defect; not touched.
- The new prompt texts were not run against a real model.
