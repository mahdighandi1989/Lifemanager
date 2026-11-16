# Handoff — tour 1 round 28, fixer «forecast» (R4; C90, C91, C118–C122; family F4)

WORKLOG (148) / PROGRESS (145) on this branch (assigned 152 / 149 — the coordinator renumbers at merge).

## Functions changed (all in `apps/learning-architecture/src/app/a41_practice.js` unless noted)
- `PV_NO`, `PV_OK`: window 0–8 words (was 0–4); «شد/نشد» directly before a number is not a verdict.
- `PR.bookPred(s0, text, at, key, by, o28)` — new optional 6th argument `o28 = { p, raw, notP, upd, vague }`.
  With `o28` the confidence is `o28.p` (never the first percent of the message); `same28` updates the same outcome
  with `pHist` (C77). Old callers (no `o28`) behave as before.
- `predDue(s0, text, at, own28)` — new 4th argument: a clause of a multi-forecast message takes its due only from its own words.
- `PR.predExplicit`: calls `apply28(read28(...))` first; the round-27 paths stay as the fallback (pure confidence of the
  previous message, «پیش‌بینیم: …» without a number). The PRED_EXPL path now skips past reports (`past27`) and books
  the text after «پیش‌بینیم اینه که / :».
- `PR.predVerdict`: answers to an open `predAsk` are read by `ansRes28` / `ansWhich28`; `outcome28` replaces the
  `outcome27` calls (`outcome27` stays exported, unchanged). `predAsk` gains `pkey`, `cand` (keys `at|key` of the
  «کدام؟» candidates) and `approx` (the C120 question).
- New exports: `PR.read28`, `PR.same28`, `PR.verdict28`, `PR.outcome28`, `PR.approx28`, `PR.ansRes28`, `PR.ansWhich28`.
- `FV27`: «بشه/بشن/بشم» ⇒ شد, «بمونه» ⇒ موند, «بشکنه/می‌شکنه» ⇒ شکست, «بیاد/بیان» ⇒ اومد.
- `a31_tools.js` `A.V.fcast`: open and settled lists (`.fc-openl`, `.fc-donel`); a settled row keeps its select (same
  aria-label «نتیجهٔ «…»») under «تغییرِ داوری:»; «(دورِ ۲۷، C53)» removed from her view.

## Contracts for the other fixers
- **dates:** a forecast clause still sets `x.duePend` from her own day (C12); bank R28 #138 asks that a weekday inside a
  forecast raises no date ask — that is `PR.datePend` (yours). `predDue(…, own28)` only narrows which words a clause reads.
- **story:** the 🎯 text is now the outcome only (no confidence, counter or lead words); `predEv27`/`predFc27` read it as before.
  «↪» for 🎯 (C95) is yours. C121: `probOf27` unchanged.
- **surface:** «(دورِ ۲۷، C53)» is gone from `A.V.fcast`; no AS.SYS change.
- A sentence with a correction («اشتباه کردم/گفتم», «اصلاح کنم», «اولش گفتم»), «پارسال / سالِ پیش», or «هنوز … نگرفتم»
  never settles or asks about a 🎯 (`EXC28`).
