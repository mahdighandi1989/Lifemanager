# Tour 1 (Pólya), round 25: fixer «arith» handoff (2026-11-11)

Scope (DECISIONS_R25 «Fixer split / arith»): P2 — the page's arithmetic check (S1 D25-12; S2 C25-1, A25-8, B25·D5/D14, B_s D1) + clarifications C9, C10
(and the check C8 relies on). Base: `eeb11d1f`. WORKLOG (124), PROGRESS 123 (on this branch; the launch numbers 124/123 apply after the coordinator renumbers at merge — the docs gate demands 1..N without gaps), HANDBOOK §10 row (2026-11-11) + §12 row 70.

Files: NEW `src/app/a46_arith.js` (the whole engine; loaded after a45 — `build.py` file list). `src/app/a45_story.js`: ONLY these spots —
(1) after the old `arithChk`: `ST.arithChkR24 = arithChk; ST.arithChk = arithChk;` (a46 then replaces `ST.arithChk`); (2) in `priorOf`, the three lines that
computed `ck / bad / chk / chkM` now read `ST.arithChk(span, hm)`, `ST.arithNote(ck, v)` and set `v = "wrong"` when `nt.bad`; (3) in `priorOf`'s `steps.push`,
`said: ST.arithSaid(ck)`. Nothing else in a45, a27, a29, a38 was touched. Tests: new `tests/test_tour1_r25_arith.js`, byte copies `tests/variants/VARIANTS_R25.json|md`;
one assertion of `tests/test_tour1_r24_story.js` (#160) replaced with a comment (no «درست» beside ✗).

## Contract: `A.STORY.arithChk(text, ctx?)` (for prior — C8, merge of later reports; for correction — stale numbers)
- Returns `[{expr, said, saidT, val, valT, ok, kind, unit?, conv?, sx?, unitUnread?, pos, pe}]`, in text order. `kind`: `chain` (one link of an equality),
  `run` (running sum), `quot` (integer quotient reading), `floor` («N و خرده‌ای»), `conv` (unit conversion), `mix` (sum of two quantities), `factor` (stated unit
  factor), `dim` (bare product/quotient whose operands carry units elsewhere in the same message).
- `ctx` = the whole message the quote comes from. Pass it: the quote is then located inside the message and only the checks that END inside the quote come back
  (a running sum takes its previous number from the message; her own rounded numbers and the unit of each number come from it). Without `ctx` the text is read alone.
- An empty array means «the page read nothing» — never treat it as «right». `ok:false` is a real mismatch under every natural reading of what she wrote.
- **C8 (prior):** to apply her own fix, run `A.STORY.arithChk(fixText, wholeMessage)`; apply only when no check is `ok:false`; when there is one, show
  `A.STORY.arithNote(ck, verdict).chk` (her line, no correct number) and ask. `arithNote(...).chkM` is coach-facing (carries the number + «عددِ درست را لو نده»):
  it must not reach 🧭, 📜 or her view (your B25·D6) — `priorLines` still prints `chkM || chk`.
- `A.STORY.arithSaid(ck)` = the numbers a later step may depend on: for a step the page found wrong, only the wrong numbers; otherwise its numeric results
  (not conversions, not expression-valued right sides). The dependency rule itself («more than a shared number», B25·D7) stays yours.
- `A.STORY.arithNote(ck, verdict)` ⇒ `{bad, chk, chkM}`. Beside a `wrong` verdict whose arithmetic holds the text is
  «حسابِ «…» را صفحه سنجید و می‌خواند؛ ایرادِ این گام در خودِ این حساب نیست» — no word «درست». Do not re-add «درست» beside ✗ anywhere.
- `A.STORY.arithLines(ck)` = prompt lines (✓/✗) used by the block below; `A.STORY.unitAt(text)` = the unit at the start of a string (`{dim, f, ex, si, w}`).

## Contract: tolerance (C9) and silence (C10)
- A written value is accepted when the exact value rounds or truncates to it at the digits she wrote (`s − ½u ≤ v < s + u`); with «حدود/تقریباً/≈» the round-24
  rule (rank of the last non-zero digit). A number she herself rounded («حدودِ ۰٫۲۹», or a result whose exact value differs from what she wrote) is an interval when
  she uses it as an operand later in the same message. No other tolerance; integers are exact.
- Not read at all (no line, no verdict): anything next to a Latin letter, symbolic parentheses, function words («جذرِ», «نصفِ», `sin`), «۳ تا ۵», «۲ سوم», «۳ به ۲»,
  dates, clock times, scores, congruences, number vs number («n = 12»), number words, expressions with units between the numbers, running sums with words between
  the numbers, a calculation she calls wrong or quotes from someone else («… که غلطه», «قبلاً نوشته بودم …»). Ambiguous readings («۱/۲ + ۱/۳ = ۲/۵») ⇒ silent.
- Units: unknown or compound units are not read; two unit-carrying operands the page cannot relate ⇒ `unitUnread` and the line «واحدش را صفحه نسنجیده».

## Contract: the prompt block (for classify / story — the a26 post-check)
- Page-built user-prompt block «# حسابِ صفحه روی همین پیام» (an `AS.promptHooks` entry in a46; nothing in `AS.SYS`). It appears when her message has a readable
  calculation AND (the problem has a prior ledger, or the message is her own work (`A.STORY.workMsg`), or a check is wrong). Lines «✓ «a = b» می‌خواند» /
  «✗ «a» را «b» نوشته — حسابِ صفحه: v» + «عددِ درست را لو نده». The post-check should treat a reply that states the ✗ number outright as a leak, and a reply that
  calls a ✓ line wrong as a contradiction — not built here.

## Not done (HANDBOOK §12 row 70)
- Running sums with words between the numbers (bank R25 #62, #63): not read; only «never flagged» is guaranteed.
- The result of the later-message check is in the coach prompt only; writing it into the prior ledger is the ledger's merge (prior).
- A real-model run on the new block before round 26.
