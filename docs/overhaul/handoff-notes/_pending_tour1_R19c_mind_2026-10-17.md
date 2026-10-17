# Tour 1 (Pólya), round 19c: mind handoff (2026-10-17)

Scope (DECISIONS_R19c «Fixers / mind»): LT4 — technique work feeds the mind card. Base: 19b coach work (`e76821ee`) merged onto
`claude/life-program-flow-diagram-q37jvr`.

Files changed:
- `apps/learning-architecture/src/app/a29_mind.js` only (plus the rebuilt bundle).
- Tests: new `tests/test_tour1_r19c_mind.js` + byte copy of the independent bank at `tests/variants/VARIANTS_R19c.json`.
- Docs: `apps/learning-architecture/docs/WORKLOG.md` (79), `PROGRESS.md` row 95, a HANDBOOK §10 row.

Not touched: a40/a41 (sched/practice builders), a27, a33, a38. Nothing quarantined (no function replaced; `M.model` and the dimension numbers are unchanged).

## What the card reads now (`APP.MIND.techWork()`, section «🏋 کارِ تکنیک‌ها» after «🧩 چهار مرحلهٔ حل»)
| Source | Read as |
|---|---|
| `practice` records (a41) | one line per session; `measured` = the person's own measured result; `score` = self-score (never measured); `outcome`/`done` text shown |
| `ex` with `status:"done"` | one session line; rubric % labelled «خودسنجی (اندازه نیست)»; AI critic (`ex.ai`) never read |
| `calib` table rows of any worksheet (T24 `preds`, T32 `claims`, T33 `preq`) | one calibration act per resolved row (درست/نادرست); «نامعلوم»/empty = pending, not counted |
| `pr` P3 / P4 `status:"done"` with `data.pct` | measured recall % (1-3-7 cycle / weekly blank page), first → last per topic |

Rules: each session once (act ids `prac:<rec>:<session id|index>`, `ex:<id>`, `pr:<id>`, `exrow:<ex>:<i>`); same row + same local day ⇒ one line (the later
session stands, «n بار در همین روز — یک بار شمرده شد»); withdrawn (`wd|retracted|withdrawn`), drafts (`draft`, `status:"draft"`) and pending
predictions are not counted; records with `sample|test|tour|tourRun|sim|simulated|fixture|demo` are never counted. Every line is dated (`data-at`)
and opens its source (`data-go`: `practice|id` when `APP.V.practice` exists, else `tech|tid`; `tech|tid|ws:<ex>`; `proto|P3|<run>`; `e_case|<id>`).

Dimension mapping: only through sources the card already maps — a practice case whose subject is an epistemic `case` ⇒ «داوریِ معرفتی» (the case
path itself moves s_epi; the session is not counted again); a session/row that is the same act as a 🎯 `fcast` ⇒ that fcast's dimension (counted
only as the fcast). Everything else is «بی‌نگاشت» and stays out of the dimension numbers (no technique→dimension mapping invented; territory tool
counts spread each technique over 3–6 systems, so they are not a mapping).

## Contract with the practice builder (a41) — please keep or tell the mind side
- `practice`: `{id, type:"practice", tech, subject, sessions:[…], state, history?:[{at, state:"stable"|…, why?}]}`; `subject` = string, record id,
  or `{kind, id, title}` (`kind:"case"` links the epistemic case). Started by the assistant ⇒ `by|via|from|origin|startedBy: "assistant"`.
- session: `{id?, at, done, outcome, score, measured, ok?, resolvedAt?, ex?, pr?, src?, fcast?, learner?, draft?, wd?}`.
  `measured`: number (percent, e.g. recall 80) | `{v|pct|value, of?}` | `{pred, of?, actual?, resolvedAt?}` (judgement of learning; no `actual` ⇒ pending) |
  `{pre?, post?, quiz}` (T33) | `{p, ok}` (one resolved prediction). `measured.by:"ai"` or `measuredBy:"ai"` ⇒ ignored (AI critic is never the person's result).
  Teaching someone else ⇒ `learner` (or `of`/`who` ≠ "self"): listed as teaching activity; the learner's score is never the person's own.
- A session that saved a worksheet / protocol run should carry its id in `ex` / `pr` (or `src`): the card then shows the session once (the `ex`/`pr`
  line is suppressed; an `ex`'s calibration rows still count once). A T24 row or session that is an fcast should carry `fcast: <id>` (text equality with
  the fcast question is the fallback).
- A tour/test run must mark what it creates (`test:true` or `tour:true`); the card cannot otherwise tell a simulated-clock record from a real one.

## Bank results (VARIANTS_R19c, LT4.mind entries #57–#73)
- 17/17 green after the change; on the 19b base the test fails entirely (`APP.MIND.techWork` absent; the card read no technique work at all).
- #58: the T24 rows appear in a separate «کالیبراسیونِ برگه‌ها و تمرین‌ها» block (Brier, hit rate vs mean confidence) — «بی‌نگاشت», so they do not
  enter a dimension's calibration; the fcast entry stays in its dimension.
- #62: tested with a practice case whose subject is the epistemic case; s_epi moves through the existing case path (one act).
- #66: T24 row + fcast (same question) + card confidence ⇒ one calibration act (the fcast); card confidence was never part of the card's calibration.
- #67: tested as `test:true` / `tour:true` / `sample:true` records; the simulated clock itself is LT8 (sched side).
- `practice` records are created in the test with the contract above (a41 was not present on this base).
