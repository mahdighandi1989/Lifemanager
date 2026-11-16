# Tour 1 (Pólya), round 28: fixer «arith» handoff (2026-11-16)

Scope: DECISIONS_R28 R1 (S1 B28·D1 = C28-13, A28-40; C84 as replaced by C102, C85, C103–C109). Base: BASE28 = 4001c4cf. WORKLOG (148), PROGRESS 145, HANDBOOK §10 row (2026-11-16) + §12 row 93.
Files: `src/app/a46_arith.js` ONLY. Tests: new `tests/test_tour1_r28_arith.js`, `tests/test_tour1_r28_arith_replay.js` (+ `tests/fixtures/r28_arith/*.json`, built read-only from T/round28X/<sid>/ctl and ai/); byte copies `tests/variants/VARIANTS_R28.json|md`.

## Functions changed in a46
`tokens` (new 2nd arg `sel`; compound tokens carry `mR`, `cmT`, and under a selection `rdK`/`rdU`; C105 «تومن» after M ⇒ no `alt`; «A و N دهم/صدم/هزارم» merged into one decimal token `dw`; «sqrt(» ⇒ `f` token), `read` inside `chains` (3rd arg `sel`), `chains` (C84/C102 enumeration replaces the round-27b `m2L` block; C85 `remW` drop; C108 `remc` line; label words after a scaled number are not unknown units), `leadOf` (`X.remW`), `numeric` («a√b» ⇒ unread), `near` + `tolSaid` (C9: `t.rt` ⇒ round / truncate / double-round at her digits instead of ±1 digit), new `fmtCm`, `askT` (m2 text order: first «M هزار», second «M» units), `ST.arithLines` (✓ line names the reading: «(با خوانشِ …)» or, C102 other-reading, «— یعنی …»), new `m2Pick` / `ST.arithM2Pick`, `ST.arithAnswer` (m2 branch first; yes/no never binds an m2 ask), the prompt hook that registers asks (m2 now registered with `m2M`, `m2K`, `m2U`, `m2A`, `m2W`).

## Contracts other fixers must respect
- **`arithChk` entries (additive):** `rdC` (text of the reading used), `rdShow` (✓ only under a non-thousand reading — tell her), kind `remc` (a remainder clause judged on its own; `expr` = «total − result», `said` = her remainder). `kind: "m2"` with `m2Both` is no longer produced (C102) but still rendered for stored older asks.
- **`said` of a compound result** is now the digits of the reading that was judged (e.g. «12700000» for «۱۲ میلیون و ۷۰۰» under the thousand reading; before it was always the units digits «12000700»). correction/prior: if you match `c.said` against numbers, use `ST.arithChk` again on the current text rather than a stored digit string.
- **`valT` of a ✗ compound line** is «K (با «… هزار») یا U (با «…» ِ واحد)» plus, when her result is compound, «؛ نوشتهٔ او «…» نه … است نه …». Do not parse it; it is for the coach.
- **`s.coach.arithAsk`** may hold `kind: "m2"` entries; an answer closes them with `re = {at, to, rd: "k"|"u", apx: false, her}`. A wrong-reading answer adds an `arithBad` entry (contestable like any ✗).
- **Tolerance:** «≈ x.yz» now accepts the exact value only when it rounds, truncates or double-rounds to her digits. Any code that relied on ±1 last digit through `ST.arithChk` sees ✗ there.
- **Offsets:** every new rewrite keeps text length; `pos/pe` of a `remc` line cover the remainder clause.

## Not done
HANDBOOK §12 row 93: D26-24 aD4 p4 (operator-less narrative arithmetic whose operands are in earlier messages), «a√b» not computed (unread is allowed by C107), «M تا کم میاد» not judged, 📜 mark of the line does not change after an m2 answer (C86 is story's), m2 answer not written into the prior ledger, more than 5 compounds in one line fall back to the old reading.
