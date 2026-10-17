# Tour 1 (Pólya), round 17: math fixer handoff (2026-10-17)

Scope: INF1 from `DECISIONS_R17.md`, which asks for proper display of formulas. Base: the `claude/life-program-flow-diagram-q37jvr` tip 14988f56 (fast-forwarded).

Changed files:
- new `src/app/a39_math.js`;
- `build.py` (one entry in the app file list, after `a38_live.js`);
- one expression in `a26_assist.js`;
- two field calls in `a38_live.js`;
- tests;
- the rebuilt bundle.

Not done here: WORKLOG/PROGRESS/HANDBOOK, AUDIT_LOG, experiences, and the merge. These are left for the integrator, as in the other R17 fixers.

## What renders (`APP.MATH`, native MathML, no library)
- **Explicit LaTeX-lite** inside `$…$`, `$$…$$` and `\(…\)`:
  - `\frac` / `\dfrac` / `\tfrac`, `^` and `_` (with braces), `\sqrt` and `\sqrt[n]`;
  - `\sum` / `\prod` with limits (munderover), `\int` / `\oint` (msubsup), `\lim` and `\max` / `\min` with limits;
  - Greek letters, and the operators `\le \ge \ne \cdot \times \div \pm \to \Rightarrow \approx \equiv \in \subset \cup \cap \ldots`;
  - `\text{…}` (Persian allowed), `\mathbb{R}`, `\binom`, `\left` / `\right`, `\overline` / `\hat` / `\vec`, and spacing commands.
  - `$5 and $10` is not taken as math (pandoc rule: no space just inside the `$`, and no digit after the closing `$`).
- **Plain ASCII math** written by Persian users. Only a run of non-RTL words that is clearly math is converted. A run counts as math when it has:
  - `^`;
  - `_` after a single letter;
  - `√` or `sqrt(`;
  - a `\command`;
  - a `/` next to a parenthesis;
  - or `∑ ∫ ∏`.

  Examples: «1/((n+1)(n+2))» → 1 over (n+1)(n+2); «n(n+1)/2» → n(n+1) over 2; «x^2+1»; «a_n»; «√2»; «x^(n+1) − 1 = 0»; «dy/dt = −5/(16π)».

  How ASCII is read:
  - `/` makes a fraction from the product chain on each side. A single pair of parentheses around the numerator or denominator is removed.
  - `^(…)` and `_(…)` also drop their parentheses.
  - `<=`, `>=`, `!=`, `->`, `=>` and `*` become ≤ ≥ ≠ → ⇒ ⋅.
- **Stays text:**
  - «۳۰ پله», «۴۰ درصد», «40%», «n = ۳۰»;
  - dates such as ۱۴۰۲/۰۵/۱۲;
  - URLs, `file_name.txt`, `C:\Users`, «a/b»;
  - «dV/dt = (πy²/9)·dy/dt» (no structure to gain, so it keeps the existing `<bdi>` isolate);
  - unknown `\commands`, unbalanced parentheses, and Persian letters outside `\text`;
  - any Latin word of 3 or more letters that is not a function name («src=x», «onerror=…»). This keeps English or HTML text from being turned into italic letters.
- **Safety:** every node is built with `createElementNS` / `createTextNode` / `setAttribute`. Nothing from the input goes through `innerHTML`. Malformed input throws a private `Bad` exception, and that segment stays text.
- **RTL:** each `<math dir="ltr" displaystyle="true">` sits in `<bdi dir="ltr" class="mx" style="unicode-bidi:isolate…" data-src="source">`. Text segments around it still go through `bidiNodes` in the chat.

## Hooks (smallest change)
- **a26 message renderer**, one expression: `bidiNodes(m.text)` → `A.MATH ? A.MATH.nodes(m.text, bidiNodes) : bidiNodes(m.text)`. `AS.bidiNodes` itself is unchanged, and the r2/r3/r4 tests that call it directly are untouched.
- **a38**, two calls only: `#lpNewS` (problem statement) and `#lpStep` (next step) are wrapped in `(A.MATH ? A.MATH.attach : Object)(field(…))`.
  - `attach` adds a `.mx-prev` line under the field, «نمایشِ فرمول: …» with the whole text and its formulas rendered.
  - The line updates on every `input` event. It is hidden when the text has no formula, and the field value is never changed.
  - Nothing else in a38 was touched.
- **Assistant prompt line — deviation from the decision text, on purpose.** At runtime `AS.SYS` is 19,988 characters (a27 appends its own lines), and `test_assist.js` caps it below 20,000, so a 120-character line cannot fit.
  - Following AGENTS.md rule 8, the line is added through `AS.promptHooks` from a39 instead: «# فرمول — اگر فرمول می‌نویسی، میانِ $…$ بنویس (مثلاً $\frac{1}{n(n+1)}$، $x^2$، $a_n$، $\sqrt{2}$، $\sum_{k=1}^{n} k$)… عدد درونِ جمله را بی $ بنویس».
  - It is added only on a math turn: the new message or the last 4 messages contain a formula pattern, or the view is `e_prob` / `lprob`.
  - SYS is unchanged.

## Tests
`apps/learning-architecture/tests/test_math_render.js` (sections `render`, `plain`, `xss`, `chat`, `preview`; `ONLY=`, `SHOT_DIR=`):
- **render:** 16 cases, compared on exact MathML structure. Also checks the MathML namespace and the LTR isolate, and that a fraction is really laid out stacked (its height is more than 1.5× a digit's).
- **plain:** 17 non-math strings come out with byte-identical textContent and no `<math>`.
- **xss:** 8 hostile inputs (`<img onerror>`, `</math><img>` inside `\text`, attribute breakouts, `<svg onload>`). No HTML element or `on*` attribute is created, and no handler runs.
- **chat:** stub model, real panel.
  - The user's «1/(k(k+1))» and the assistant's three formulas render as `<math>` in LTR isolates, in order.
  - The Persian sentence order holds, measured on the screen: the opening word is right of the first formula and «پله» is left of the last.
  - «۳۰ پله یا ۴۰ درصد» stays text.
  - The prompt line is present on a math turn and absent on «سلام، امروز حالم خوب نیست» in the home view.
  - SYS stays under 20k.
- **preview:** `#lpNewS` shows 3 formulas live and hides for «در ۳۰ روز ۴۰ درصدِ کارها…».
  - `#lpStep` is tested in the exec view, with understanding and a plan seeded in the shape the forms write. Its preview shows the step's formula, and the field value is unchanged.
- **Adjusted:** `tests/test_tour1_assist.js` §18. The assistant's «dy/dt = −5/(16π)» is now a MathML fraction, so the test also finds the bubble by `bdi.mx[data-src]`. Every other assertion of §18 is unchanged and green: user text, isolates, the plain-bubble control.

Screenshots, checked by eye: the chat bubble reads in the correct RTL order with stacked fractions; the statement preview; and the step preview, which also fixes the bidi scramble the raw textarea shows. Paths are in the fixer's report.

## Results
- `node tests/test_math_render.js`: NO ERRORS.
- `test_tour1_assist.js` and `test_assist.js`: NO ERRORS.
- `build.py --check`: in sync.
- `tests/test_learning_architecture_handbook.py` and `test_learning_architecture_integrity.py`: 7 passed.
- `python -m pytest tests/test_learning_architecture_graph_browser.py -q`: 96 passed (whole page suite, includes the new test).
