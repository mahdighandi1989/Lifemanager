# Tour 1 (Pólya), round 18: math fixer handoff (2026-10-17)

Scope: RM2 a–c, RM3, INF2, INF3, INF8 and INF9 from `DECISIONS_R18.md`. Base: `claude/life-program-flow-diagram-q37jvr` at 204585c1.

## Changed files
- `apps/learning-architecture/src/app/a39_math.js`: all the logic.
- `apps/learning-architecture/src/app/a27_tour.js`: one expression only. `lbOpts` now passes each option through `A.MATH.toPlain`. This list feeds the `#lpRBest` options and the stored `bestQ` on that card.
- No change to `a38_live.js` or `a26_assist.js`. The field preview, the chat-input preview, the symbol bar, the plot and the board are all attached from a39 by one `MutationObserver` and one `focusin` listener.
- Tests:
  - new `tests/test_tour1_r18_math.js`;
  - new `tests/variants/VARIANTS_R18.json`, a copy of the independent bank;
  - `tests/test_math_render.js`: two cases moved from the "plain" list to the "render" list (see Decision below).
  - `tests/test_tour1_assist.js` §18: the user bubble's formulas are now MathML. The bubble is found, and its isolates are read, through the source text (`bdi.mx[data-src]`). Every assertion is otherwise unchanged and still asserted: the three LTR runs, the unchanged source text, the RTL bubble, and plain bubbles without `<bdi>`.
- Docs: `docs/WORKLOG.md` (68), a `docs/PROGRESS.md` row (85), and a `docs/HANDBOOK.md` decision row with the new update date. The integrator may need to renumber these if the coach or live fixer also adds entries 68/85.

## What changed (root causes)
- **`APP.MATH.toPlain(text)`** (INF2, RM2a) converts formulas into readable Unicode for plain-text places.
  - It works on the source string, so the person's own spacing is kept.
  - TeX handled: `\frac` (parentheses only when needed), `\sqrt`, `^` and `_` (Unicode super/subscripts where they exist, otherwise `^(…)`), Greek letters, operators, `\cdot` → `·`, `\to`, `\dots`, `\text`, `\left`/`\right`.
  - Unknown commands lose the backslash (`\foo{x}` → `foo(x)`).
  - ASCII forms handled: `sqrt(`, `<=`, `*` and similar.
  - Text that is not math is returned character for character.
  - **Not done here:** the plain-text sinks in a38 (`chatItems`, `liveChatQItems` → `#lpBBest`) belong to the live fixer, per DECISIONS ("Plain sinks in a38 call APP.MATH.toPlain").
- **Tokenizer** (RM2b/c):
  - New characters: Persian digits and «٫» (shown as typed), × ÷ ² − ⇒ ≤ ≥, and «…» / «⋯» inside a run.
  - Persian letters count as variables only in a run that has an operator and a digit. A single letter on its own counts only between operators.
  - `tryAscii` restores the outer parentheses whenever the core would be unbalanced without them, e.g. `(10/n)^(n/2)`.
  - An ASCII subscript is read as one name: `g_EE`, `a_max`, `g_PV-E`.
  - The trigger now also covers Greek letters with a subscript (τ_I), Unicode powers after an operand, × or ÷ between operands, `dX/dY` derivatives, a lone numeric fraction, and a relation combined with arithmetic, a second relation, or a coefficient.
  - Unary −/+ gets `form=prefix` with zero spacing.
  - Punctuation glued to a formula sits with it in a `white-space:nowrap` box, so a line never starts with «،».
  - A lone relation at either end of a run belongs to the Persian sentence (D·D8: the «!» no longer reads as «!=»).
- **RM3:** the `# فرمول` line fires on content: the new message, the last 4 messages, or the focused live problem's statement (from the view or the session). It fires on any view and is marked «(زمینه، نه پرسشِ دوم)». The view-only trigger is gone.
- **INF3:**
  - Every `textarea` / text `input` with an `lp…` id, and the chat `.as-in`, gets a `.mx-prev[data-for=id]`. That covers 27 fields across understanding, plan, execution and look-back in the test.
  - On focus, a single «∑ فرمول» bar moves next to the field: x², √, ÷, ×, ≤, ≥, ⇒, subscript, fraction.
  - The bar inserts at the caret, keeps focus, and fires `input`.
- **INF8:** a two-column numeric table (3 or more rows) or a number series (4 or more numbers separated by «،», «,» or «و") shows a small inline SVG line plot under the message. Two series of equal length are plotted as x→y, as in the s07 hours→height data.
- **INF9:** a valid FEN (8 ranks, each summing to 8) shows an 8×8 Unicode board under the message, with the side to move.

## Decision
- `x² + 1` and `dV/dt = (πy²/9)·dy/dt` were in R17's "stays text" list. RM2b/c and B·D10 (the same dV/dt was a fraction in one place and text in another) override that. They are now render cases, moved rather than deleted.
- `n = ۳۰ و k = 2` still stays text: one relation and no arithmetic.

## Tests
`tests/test_tour1_r18_math.js` has seven sections: plain, notation, trigger, sinks, preview, plot and fen. It was red on the pre-fix build.
- It checks all 67 bank entries:
  - RM2.plain: 23, all pass.
  - RM2.notation: 26, all pass. The «و» half of entry 72 (no line break before «و») is a normal break at a space; the «،» half is enforced.
  - RM3.trigger: 18, all pass. Each positive entry is run on the home, today and lprob views; each negative on home, lprob and e_prob.
- It also checks the runners' quotes: A·X1, B·D3, B·D8, B·D9, B·D10, C·W1, C·W2, D·D1, D·D5, D·D7, D·D8, plus s07, s19, s20 and s21.
- **sinks:** a structural scan of a2x/a3x (except a38) for `liveChatQItems` / `liveChatQs` output going into a plain-text sink without `toPlain`, plus the behaviour of `#lpRBest`.
- **Suggestion for the integrator:** once the live fixer merges, drop the a38 exclusion in the scan.
