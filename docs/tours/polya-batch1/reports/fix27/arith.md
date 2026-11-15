# Fixer «arith», round 27 — hand-back (branch worktree-agent-aa5ef84a8d8e74507: 467aac34, 57233130)

**Result:** both S1 of the family (D27-18, D27-1) reproduced red on BASE27 and are fixed. R1 and C59–C65 are done except «Not done».
Suite: 163/163 page tests; handbook + ownership pytest 14 passed. Bank R1 64/64 (red-first: 24/64, 50 errors).

## Root causes (a46_arith.js)
- **D27-18 (S1-a, C40):** the «و» branch of `trailOf` built only a sum. It now also keeps the product (`mulAlt`). If the sum fails and
  the product fits, the line becomes the new «؟» kind `andmul` («ضرب کردی؟»), never ✗.
- **D27-1 (S1-b, C43/C65/C57), three causes:**
  1. `disowned` hid another person's wrong line (also D27-6).
  2. A newer «؟» dropped every older open «؟».
  3. `arithAnswer` accepted asks only from the previous message.

  Fixes:
  - `otherSpans` marks another person's lines `c.other` («کارِ دیگری»). They are checked and shown, never hidden, never in
    `arithSaid`.
  - An open «؟» waits until it is answered.
  - An answer binds by the number she names. A bare «آره» binds only to the previous message's «؟».
  - Several candidates ⇒ the page asks «کدام؟».
- **C41 shapes:**
  - «A متر در B متر» via `darProd` (keeps the text length; length-by-length only);
  - counter words `CNT`, «N تا M تا», number words before «تا»;
  - verb operators `WOP`, running sums, «میشه درست N»;
  - «ذرع» is now «نسنجیده».
- **C42/C64:** `apAt` computes arithmetic progressions exactly (descending, decimal and negative included). Any other ellipsis stays
  «نسنجیده».
- **C44/C61:** an integer percentage that is a rounding gets «؟».
- **C45/C62:** `fmtSc` writes the value in her scale (cause of B27·D13).
- **C59:** `unitQ` gives the coach one line about the unit.
- **C60:** number words as operands are read.
- **A27-13 (coach side):** the `MINE` marker brings the full block.

## Tests
- `tests/test_tour1_r27_arith.js`, built from the sentences of groups A–D, each with its negative.
- Five old expectations changed, each with a comment citing its clarification:
  - C44 «۱۵٪» ⇒ ASK;
  - C42 ellipsis ⇒ OK;
  - C41 «سه تا ۸۰» ⇒ OK;
  - R26 bank #19;
  - R25 «۳ متر در ۴ متر».
- Replay of all 1,012 round-27 user messages through the old and new reader: 26 changed, all toward R1. One false attribution was
  introduced and closed («گفت» now counts only with a number after it).

## Not reproduced
A27-16: the line already reached the coach as ✓ in s09 p15; the cited p16 does not contain it.

## Not done (HANDBOOK §12 row 84)
- Narrative arithmetic with no operator (C17: «۷۹ و ۷ دهم»).
- C63: when no reading fits, the line is ✗ without asking which reading she meant.
- C67: √ is not recomputed.
- C57 attribution needs a relation or role word, not a bare first name.
- The displayed expression drops the second factor's unit.
- A «؟» answer is not written into the prior ledger.
- Older `norm` rewrites (درصد، میشه، ضرب در، تقسیم بر، منفی) still change the text length.
- C66 belongs to correction.

## Shared exports (additive only)
- `arithChk` entries: `kind: "andmul"`; new fields `mulT`, `other`, `unitQ`.
- `arithAnswer` returns `which` when no line was picked.
- `arithAsk` entries stay open until answered.
- Functions changed: `docs/overhaul/handoff-notes/_pending_tour1_R27_arith_2026-11-15.md`.
