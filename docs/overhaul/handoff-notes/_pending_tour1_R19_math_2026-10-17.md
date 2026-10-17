# Tour 1 (Pólya), round 19: math fixer handoff (2026-10-17)

Scope: RN4 a–e, INF12 and INF14 from `DECISIONS_R19.md`. Base: `claude/life-program-flow-diagram-q37jvr`.

## Changed files
- `apps/learning-architecture/src/app/a39_math.js` holds all the logic. No other source file changed; a27, a29 and a38 are untouched.
- Tests:
  - new `tests/test_tour1_r19_math.js`, with sections run, order, plot, add and dir;
  - new `tests/variants/VARIANTS_R19.json`, a copy of the independent bank. Another fixer may add the same copy; the content is identical.
  - `tests/test_math_render.js`: two counts change, each with a «دورِ ۱۹» note (see Decisions).
  - `tests/test_tour1_r18_math.js`: the plot-safety whitelist now also allows `button` and `input`. These come from the page's own «افزودنِ نقطه» form, not from the message text. The injection check itself is unchanged.
- Docs: WORKLOG (74), PROGRESS row 90 and a HANDBOOK §10 decision row. **The numbers were assigned by the coordinator.** On this branch alone, `build.py` reports gaps (72, 73 and 88, 89 belong to the other two fixers). The gaps close when the three fixes are merged.

## Root causes and changes
- **RN4a (D·2 s37).**
  - A lone number glued to a Persian word, with a relation after it, goes back to the sentence (`LONENUM`, flagged per run in `asciiSegs`). «بر ۸ ⇒ y=۲» now renders as «بر ۸ ⇒» followed by the formula [y=۲]. The order check measures the real bubble.
  - A bare relation with a Latin variable («x=۲», «y=۶», «xy=۱۰۰») counts as a formula only when the same message has other math evidence: another formula, or a glued coefficient like «۴۷y». `segments` makes two passes to decide this.
  - «n = ۳۰ و k = 2» on its own stays text, as decided in R18.
  - Arithmetic with a single Latin letter and a digit («x+۴+۱+۲») triggers without a relation. «Wi-Fi» and «A-B» do not.
- **RN4b (C·X6).** The `CODE` word rule: uppercase letters, or two or more letters, then a hyphen, digits, and optional `/ . - :` digit groups. Such a word is never math, and `toPlain` leaves it unchanged.
- **RN4c (C·X5).** An ellipsis (`…`, `⋯` or `...`) that follows an operator moves into the formula. This also holds at the end of a quote, as in «…»».
- **RN4d (D·6).** New notation:
  - ≈ between two operands;
  - «·» only when glued, as in «n·ln» or «1·2·3» (a spaced «۲ از ۵ · ۳» stays text);
  - named functions with an argument (ln, log, sin, cos, tan, exp, …); «فایل log» stays text;
  - Unicode subscripts, as in «a₁».
- **RN4e (A·D3, A·D4, B·D8).**
  - Index tick labels use the message's own digit system.
  - A plot appears only under the message where its numbers first appear. A reply that quotes them gets no plot; a reply with new data gets its own.
- **INF14.**
  - Axis names come from the message's own words: the table header, the series header before «:», or the unit after the series. They are shown as an RTL line under the caption.
  - «➕ افزودنِ نقطه» opens labelled inputs and extends the same plot. Added points are drawn hollow and counted in the caption. They are stored on the message record (`msgs[i].plotAdd`) and survive reopening the panel.
- **INF12.** A field (`lp…` or the chat input) whose content has math gets `unicode-bidi:plaintext` and `text-align:start`, so each line takes its direction from its own content. Prose fields are unchanged.

## Decisions
- `test_math_render.js`: «k=1» in «مجموعِ 1/(k(k+1)) از k=1 تا n» and «n ≥ 1» in the statement preview now render. This follows the bank («x=۲» and «xy=۱۰۰» when the message has other math), so the counts change from 1 to 2 and from 3 to 5.
- Rejected:
  - spaced «·» as a multiplication sign;
  - storing added plot points in `localStorage`, which would never reach other devices.
- No bank entry contradicted DECISIONS_R19.

## Tests
- `tests/test_tour1_r19_math.js` fails 40 checks on the pre-fix build (base a39), across all five sections. All pass after the fix.
- Bank: all 22 RN4.run entries pass (13 pos, 9 neg). The four plot entries run in the plot section; the rest run in the run section.
- Runner quotes covered: D·2 (the full s37 message), C·X5 (s25 and the system note), C·X6, D·6, A·D3/A·D4 (s07), B·D8 (s19), s07 two-series axis names, and s20 header names.
- The R18 RM2/RM3 bank (`test_tour1_r18_math.js`) still passes.
