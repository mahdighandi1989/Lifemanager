# Fixer «arith», round 28 — hand-back (branch worktree-agent-a4d898fe3ed758374, head bf4c5e21)

Base BASE28 4001c4cf. Branch numbers 148/145 (renumbered at merge).
Proven (a+b+c): S1 B28·D1 = C28-13, S1 A28-40, C28-12, C28-11, A28-9, A28-10, A28-11, A28-7, A28-8, D28-15.
Unit-only: C105, C106 ordinal/scale answers, C108, «A و N دهم», C9 tolerance.

## Root causes (a46_arith.js)
- **S1 B28·D1 = C28-13** (`chains`, r27b `m2L`): only one compound operand was re-read as thousands; a near units reading won first.
  `tokens(s, sel)` + `read(i, alt, sel)` judge every reading combination (≤ 5 compounds); C102 order; ✗ shows both values (`fmtCm`,
  C103); rounding «؟» only under the thousands reading (C28-12); «تومن» fixes units (C105).
- **S1 A28-40** (`leadOf` REM + `chains`): «، ۳ تا می‌مونه» is a remainder only after a division, else its own statement (C85, C109);
  with a stated total it is judged as kind `remc` (C108).
- A28-11 `m2Pick` + m2 branch in `ST.arithAnswer` (C106; a bare «آره» never picks). A28-7 «sqrt(». A28-8 «a√b ≈ c» نسنجیده.
  A28-9 a label after a scaled number. D26-24 «A و N دهم». C9 «≈» accepts rounding/truncation/two-step at her digits (no ±1 digit).
  C13 across messages (`prevReg`).

## Tests
`test_tour1_r28_arith.js` (54 errors, bank 16/48 on BASE28 ⇒ none, 48/48; #7, #10, #8, #9, #37 asserted per C102),
`test_tour1_r28_arith_replay.js` + `tests/fixtures/r28_arith/` (A s02, A pwA2 p10, B nB1 p3, C aC3, D tD1 p11 — ten checks red ⇒ green).
r27b_history A27_5 input changed (plays s02 p4 first; expectations unchanged). Suite: 161 on `2bd4b81a` (nine «Target crashed» from the
disk-full spell re-run green); after `bf4c5e21` all 66 tour tests R17–R28 + pytest green; ~95 non-tour tests not re-run.

## Not done
aD4 p4 narrative arithmetic across messages; «a√b» not computed; «M تا کم میاد»; 📜 mark after an m2 answer (story); m2 answer not in
the prior ledger; > 5 compounds. Shared changes: `arithChk` `rdC`/`rdShow`/kind `remc`; compound `said` = judged reading's digits; ✗
`valT` lists both; m2 asks with `re.rd`; narrower «≈». Handoff note `_pending_tour1_R28_arith_2026-11-16.md`.
