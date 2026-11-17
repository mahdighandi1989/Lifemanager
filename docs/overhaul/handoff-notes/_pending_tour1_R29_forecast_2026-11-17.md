# Handoff — tour 1 round 29, fixer «forecast» (R5; family F4; C148/C168–C171, C152, C119, C121)

WORKLOG (156) / PROGRESS (153) on this branch (assigned 160 / 157 — the coordinator renumbers at merge).

## Functions changed (all in `apps/learning-architecture/src/app/a41_practice.js` unless noted)
- `CONF28` «با N٪» pattern: a confidence only when followed by اطمینان/احتمال, phrase end, or «گفته/گفتم/بود/پیش‌بینی» (C148). Belief words untouched (C168).
- `PR.bookPred(s0, text, at, key, by, o28)` — same signature. New: same message + same `clean28` claim ⇒ the existing record (her clause text replaces the model quote; key «#n» kept); an `o28` update whose clause names a different day than the open 🎯's due/duePend (or the old day has arrived) makes a new 🎯 instead of updating.
- `UPDW28` gains «یعنی», «و».
- `read28`: «و N درصد که <future>» after an own confidence in the same sentence = a second confidence; confidences inside «…» dropped; «شاید N٪ <future>» = confidence (C170); a claim ending in a present-perfect verb (…ته/…ده, not future) is kind "past" ⇒ no 🎯 (C170). VAGUE28 path now blocked only by a percent, not by any digit (C119).
- `strip28` removes «شاید N٪». `clean28` strips «باشه/آره،» and «… حدسم اینه که».
- `PR.predExplicit`: quoted segments that contain a confidence are masked before every reader.
- `apply28`: a pure own confidence with «نه N»/«الان» updates the single open 🎯 (with p = N when «نه N»); sets `lp.dueAskAt` when the number answers a vague 🎯.
- `outcome28`: returns null for «[اصلاحِ …» (✏️) messages; unit conversions «N u = M u» removed from the sentence; when ≥2 candidates have a unique word in one sentence, each takes its own chunk (`multi29`), and a numeric chunk without a verb borrows the sibling's result verb.
- `isRep28`: «پیش‌بینی کردم/کرده بودم» and «برگردیم/بریم» are not reports. `EXC28`: «X نیست/نبود/نمیشه، Y» corrections.
- `verdict28`: a number she names with «پیش‌بینیم N» is the target. `approx28`: a verb after «حدودِ N» is not a unit (C120 question now appears for «حدودِ ۶٫۵ میشه» ⇐ «۶ شد»).
- `probOf27`: verbs/function words are not problem words; the problem with the most unique words wins (C121).
- `PR.datePend` — ONLY the forecast part (dates owns the rest): `fcW29`/`inFc29` — own date items and model-reported plans of this message that belong to a forecast clause are not asked (plan loses whenPend/whenAsk, gets `q.fcast29`); pred items of a vague 🎯 wait for its number (`y.dueAskAt`); pred items get their own line «🎯 موعدِ این پیش‌بینی «…» — <day> (از حرفِ خودت) است؟ …», ambiguous ones are prefixed «🎯 موعدِ این پیش‌بینی:». The answer path (`dateAnswer`/`bookItem26`) is unchanged.
- New export `PR.predPendDue29(fcId)`; `a31_tools.js` `A.V.fcast` shows «موعدِ پیشنهادی … — منتظرِ «آره»ی تو» instead of «بی موعد» while the confirm is open.

## Contracts for the other fixers
- **dates:** a sentence with a forecast confidence is read by the forecast reader first; do not re-add a plan/own date ask for that clause. The lapse line («بی‌جواب ماند … در «امروز» به‌شکلِ پرسش») is still the shared wording for pred items — yours to reword if you touch `dateAnswer`.
- **story:** 🎯 text is still the outcome only. A forecast sentence is a 🎯 (C149/B29·D2 is yours).
- **surface:** no AS.SYS change; no new user-prompt block.
