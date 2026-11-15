# Pending: Pólya tour round 27 — fixer «classify» (R8) — 2026-11-15

> Temporary note for the other round-27 fixers and the integrator. Decisions: tour1_polya/DECISIONS_R27.md R8, C55, C22/C38, C82, C83.
> In this branch the entry is WORKLOG (138) / PROGRESS (135), HANDBOOK §10 row and §12 row 84 — the next free numbers on BASE27 (the
> build gate rejects gaps). The launch line assigned WORKLOG 144 / PROGRESS 141 — the coordinator renumbers at merge.

## Files and the exact functions changed
- `a27_tour.js` (shared with prior, story, dates):
  - new `OWN27_MIN`, `ownSpans27` (`AS.ownSpans27`), `HERFRAME27`, `pageQuote27`; `outMap25` is now a wrapper; the old body is
    `outMap25raw` (one change inside: `pageQuote27(qb, pre)` beside `pageLabel25`, and the local `pre`).
  - `regDom26`: the svg exclusion now spares `svg.rt-svg` (the 🧭 route map). Nothing else in it.
  - new `IDRAW27`, `forHer27` (`AS.forHer27`); `regStore25` calls it on every stored «سامانه» line before the register.
  - new `GM27`, `GMRE27`, `gregWrong27` (`AS.gregWrong27`) and one `why.push` line in `AS.replyCheck` (before `closing`).
  - new `bareAns27`; one extra condition on the `C.stmt` line in `coachPhase0` (`&& !bareAns27(s, mt)`).
  - Nothing in the turn-question, stage, date, story or arithmetic functions.
- `a43_age.js` (mine alone): new `KINP27`, `NAMES27`, `BARESTOP27`, `SAYV27`, `KINPOSS27`, `SAYRE27`, `POSTHON27`, `POSTSTOP27`,
  `privBare27` (`G.privBare27`), called at the end of `privPeople`; inside `privPeople` the HON26 rule also refuses a kin+possessive
  word («خانم همسایه‌مون») and the teacher look-ahead accepts a possessive suffix («خانم رستمی معلممون» ⇒ «[نامِ معلم]»).
- `a29_mind.js`: new `priorStep27`; one line in the `coachEv` loop of `M.phases` (`if (!st26) st26 = priorStep27(s, e);`).
- `a26_assist.js`: the follow-up text after navigation (`open27` beside `held26`). **AS.SYS untouched.**
- Tests: `tests/test_tour1_r27_classify.js`; `tests/variants/VARIANTS_R27.json` (byte copy of `T/VARIANTS_R27.json` — recopy if
  the bank changes).

## Contract: her words in page lines (everyone who writes a line that holds her text — dates, story, correction, prior)
- You may now glue a page label and her words in one string («درس: » + her lesson); the register gateway (`AS.regSys`, `regDom26`,
  `regStore25`) finds every run of ≥ 3 consecutive words that occurs verbatim in her messages/records and leaves its bytes alone.
  A run of 1–2 words of hers glued to page text is NOT protected — put it in «…».
- **Do not change her bytes before they reach the page line** (ZWNJ ⇒ space, «ي» ⇒ «ی»): the protection is a verbatim match. The
  s19 plan («هفته ای سه بار … می رم», ZWNJ lost) is the correction engine's text replacement (`subst*`/`fixVal` path after a ✏️), not
  the register — **correction: please keep ZWNJ in the replaced text** (B27·D4 family, bank R27 #290).
- C83: a «…» that is not hers takes the register, unless the words just before it frame it as hers («حرفِ خودت:»، «گفتی»، «نوشتی»,
  `HERFRAME27`). If you quote HER words, either quote them verbatim or put «از حرفِ خودت:» before the quote.
- dates: the date ask «📅 از حرفِ خودت: «» جواب رو نگو …»» starts her clip at a «»» of her text (aB4 p1) — the bytes are now kept and
  the frame is «شما», but the clip itself starts mid-quote; a sentence splitter that starts after her closing «»» would read better.

## Contract: lines in her bubble
- `forHer27` removes, from every stored «سامانه» line (outside «…»), a clause after « — » that carries a Latin bracket token
  («(prc)») and any raw record id (`prc_…`, `pb_…`, `achat_…`, …). The model still receives the raw action result in
  «[سامانه: …]». Write instructions to the model after « — » in such a clause, or keep them out of the result string.

## Contract: names (C22/C38/C82)
- `A.AGE.privLabel` now also masks: a name right after a kin word with a possessive («داداشم علی میگه», «دخترم نازنین», «بابام (علی)»)
  when a speech verb follows, the name is in brackets, or it is in the closed list `NAMES27`; and a name before a postposed
  «آقا/خانم» («حسن آقا»). Problem characters without a kin word, her own name, theorem and book names stay. Titles still go
  through `A.AGE.titleOf` / `AS.sessTitle26` — never `clip(message.text)`.

## Not done / not reproduced (HANDBOOK §12 row 84)
- D27-26 not reproduced after the page's «حل شد» (look-back question); the s38 shape (u0 while she already reported a result on an
  open live problem) is R4 «the stage moves forward when she reports her result» — prior.
- C26-33 not reproduced in the harness (pC1 form path with checkboxes and data-use selects, then «ثبتِ طرح» at once).
- Bank R27 #317 (a narrative first message held as the talk's matter) reported with its reason; needs a page question (R6).
- U35 (duplicate copy-ask, correction), U36 (prior work reaching the live problem, prior), U48 (assistant promises a birth line),
  D26-30/42/47 (practice cadence, a41) were not taken: other families' functions.
