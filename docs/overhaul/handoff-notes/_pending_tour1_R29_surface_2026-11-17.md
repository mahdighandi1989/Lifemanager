# Handoff — Pólya tour round 29, fixer «surface» (R7), 2026-11-17

Contracts the other round-29 fixers must respect (and the functions this fixer changed):

- **Rule registry (C150).** `a1_base.js` — NEW `A.PAGE_RULES`, `A.pageRule({id, fa, see?, asks?, by})`, `A.ruleBy(path)`. A rule you add or change
  appears in the assistant's «## خودِ سامانه» block (under «### قاعده‌هایی که صفحه خودش اجرا می‌کند») the next time the prompt is built,
  with no prompt edit — **register it**: `A.pageRule({ id: "C1xx", by: "ST.yourExport", fa: "<what the page does, in her words>", see: "<where she sees/undoes it>" })`
  (beside your function, or in the list in `a26_assist.js` above `AS.manifest`). `by` must be an exported function path
  (`A.*`, `AS.*`, `ST.*`, `PR.*`, `PRE.*`); a rule whose function is absent is not shown. The text must be what the page does after your merge —
  **story:** the `C138/C139` entry (by `ST.arithChk`) states «one mark per clause; an unread clause gets «؟ نسنجیده»» — make it true or edit it;
  **correction:** `C87/C111` (by `A.liveAccept27`); **story:** `C124` (by `A.dossierMove28`), `C96/C125` (by `ST.dataSrc28`), `C57` (by `ST.otherWork27`);
  **dates:** `C49` (by `PR.dateAnswer`); **forecast:** `C90/C91` (by `PR.predFor`). Rule numbers stay model-facing evidence only (C174).
- **Labels never in her view (C151/C174).** `a27_tour.js` NEW `A.noLabels29(text)`: removes page-made «(C57)», «(دورِ ۲۷، C53)», «قاعدهٔ C124»,
  «(it1_xxxx)» and bare «it1_xxxx» **outside «…» only** (her quoted words stay byte-exact). Applied in `AS.regSys` (every sys line, bubble and
  prompt history), `a40` `EVL.add` (lines) and `clean` (old stored lines), `a26` the ai bubble text (post-check). Do not add new labels to visible
  text; if you must keep an id for the model, put it in a prompt block, not in a sys line.
- **System questions (C99, F13).** `a27_tour.js` — `sysQ28` now also calls NEW `sysQ29` (exported `AS.sysQ29`): the system as the subject
  (bare «سامانه/دستیار» followed by a function word/verb, «این/همین صفحه», «این برنامه/اپ/سایت» only with «ساخته شده/کار می‌کنه/بلده…»), a
  `A.SELF_FACTS` facet with 2nd-person (آفلاین، مدلت/مدلِ خودتون، هوش مصنوعی), «نشونم بده/میدی» of a page artifact about her own work. All
  number-free. `onlySysQ28`: `preamble29` (greeting, «یه روز گذشت», «چند تا سؤال دارم:», «… دربارهٔ خودِ سامانه:» which covers every following
  question), a short follow-up question (≤4 words, no number), and «می‌خوام فقط ببینمشون». `ST.metaQ27` (a45) inherits it unchanged.
- **Piece after closure (C27-6).** `a27_tour.js` NEW `BACKREF29` / `AS.backRef29`; in the phase pass `afterClose23` is also true when a closed
  problem exists and she refers back by description («دربارهٔ همون … که حلش کردیم/بستیم», «تیکهٔ تازه برای همون …»). `PLAN28` gains the
  «یه نقشه‌ی راه … می‌خوام بچینم» order.
- **See-only (C175).** `a27_tour.js` NEW `AS.seeOnly29(msg)`; `a26_assist.js` the follow-up after a view opens: a see-only message ⇒ «fill
  nothing, press no button, say what she sees».
- **Sheet sweep (B27·D16).** `a44_route.js` `PRE.sysSweep`: a sweep without `A.HOST.sheet` does not hold the 2-minute slot; every `A.go`
  (her look) sweeps at once (A.go is wrapped here, `A.go._look29`); one sweep in flight at a time (`busy29`). Force still always runs.
- `tests/tour1_r28_replay.js` — NEW `opt.allEval` (default off): runs every recorded `eval` (the runners' F/P/B form helpers).
- Tests: `tests/test_tour1_r29_surface.js`, `tests/test_tour1_r29_surface_replay.js`, `tests/fixtures/r29_surface/` (packed from T/round29X;
  `B_tB1n` = round-28 `B_tB1s` without the forced sweep at c17). Bank copy `tests/variants/VARIANTS_R29.{json,md}` added here.
