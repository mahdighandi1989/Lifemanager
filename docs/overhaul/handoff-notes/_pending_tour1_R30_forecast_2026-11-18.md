# Handoff — Pólya tour round 30, fixer «forecast» (F4) — 2026-11-18

Contracts the other round-30 fixers must respect (all in `apps/learning-architecture/src/app/`):

## Functions changed
- `a41_practice.js` — forecast-owned: `read28` (new helpers `now30`, `mid30`, `ell30`, `QW30`, `AND29` without «که»), `perf29` (accepts «بوده/شده»), `clean28` (numbers via `faD30`), `same28` (two-sided identity without an update marker), `GEN28` (weekday/«هفته/بعد» are time words, not outcome words), `verdict28` (C120 before the verb-only fallback), `approx28` (`nh30` «N و نیم», `faD30`), `outcome28` (`ell30` «X نه/X هم» beside a sibling verb), `PR.predVerdict` (explicit «پیش‌بینیِ … شد/نشد» binds to the page's own pending res question), new `PR.fcDueLeft30`, `PR.faD30`, `PR.now30`, `PR.mid30`.
- `a41_practice.js` — **dates-owned functions, minimal forecast hooks** (please keep them when you edit these):
  - `PR.dateAnswer`: `whatFor` returns `it.what` for a `pred` item (a 🎯 text is never replaced by her confirming sentence); `altFor` and the C72 branch never move a `pred` item to a day that is another item's asked day in the same ask (B30·D16 «آره، پنجشنبه درسته»); the closing «بی‌جواب ماند» line is split — non-`pred` items keep the 📅 line, `pred` items get `PR.fcDueLeft30` (one 🎯 line). `P0cur30` is set at the top of `L.forEach`.
  - `A.dueList` wrapper (Today rows): a `pred` item renders as «🎯 موعدِ این پیش‌بینی …» with «آره، همین / نه، بی موعد» (same `PR.dateResolve` taps), never as «📅 … درست است؟».
- `a31_tools.js` — `A.V.fcast` header: Brier with the Persian decimal «٫».
- `a29_mind.js` — new `fcLedger30` (`M.fcLedger30`) line «کالیبراسیونِ 🎯 دفترِ پیش‌بینی (گفت‌وگو و دفتر): N … · Brier … · طرفِ محتمل‌تر k بار از n» appended in `techSection` (both branches). Same `A.PSY.forecastEst`; no new number.

## Rules (binding for neighbours)
1. A 🎯 due confirm is a forecast item: whoever closes a date ask must route `pred` items through `PR.fcDueLeft30` and the 🎯 Today row (D30-3, C30-17).
2. A probability for a present/past hypothesis («الان …» without a future marker, «… بوده/شده») makes no 🎯 (C170); «الان» right before the confidence («الان ۸۰ درصد مطمئنم») is the confidence's, not the claim's.
3. «و N درصد (که) …» after her own confidence is a second 🎯 unless a quantity/change word follows the percent (C148/C169); an elliptic «… رو هم» borrows the first claim's verb (and leading weekday).
4. «حدودِ N» with any other same-unit value (incl. «N و نیم») always asks C120; numbers in 🎯 lines use «٫».

## Not touched
`AS.SYS` (unchanged), a40, a45, a46, a27, a38.
