# Tour 1 (Pólya), round 27: fixer «arith» handoff (2026-11-15)

Scope: DECISIONS_R27 R1 (S1 D27-18, D27-1 first; C40–C45) + C59–C65. Base: BASE27 = 4273c7f1. WORKLOG (138), PROGRESS 135, HANDBOOK §10 row (2026-11-15) + §12 row 84.
Files: `src/app/a46_arith.js` ONLY (no line of a45, a27, a29, a38, a26). Tests: new `tests/test_tour1_r27_arith.js`; byte copies `tests/variants/VARIANTS_R27.json|md`;
changed with comments: `test_tour1_r26_arith.js` (C42, C44, C41 replaced five expectations), `test_tour1_r25_arith.js` (one guard, C41).

## Functions changed in a46
`norm` (+ new `darProd`; «در صد»; the «A از B … میشه N٪» rewrite widened and made length-preserving), `tokens` (number words: `NUMW_C` before «تا», `nwV`/`NUMW_U`/`NUMW_T` for C60),
`trailOf` (C41 counter words `CNT`, «N تا M تا», verb operator `WOP`, «با ⟨name⟩ N» running sum, C40 `mulAlt`, C42 entry), `leadOf` (filler «درست/دقیقاً», C42), `stripUW`
(verb after a unit, trailing comma), new `apAt` (C42/C64), `agree` (C44: integer % is `exact`), `chains` (C40 `andmul`, C45 literal-vs-scaled value, C59 `unitQ`, «ذرع» unread),
new `fmtSc` (C45/C62), `disowned` (C57: another person's line is kept), new `otherSpans`/`OTHER`/`RECLAIM`, `run` (marks `c.other`), `ST.arithSaid` (drops other's lines),
`askT` (andmul), `ST.arithLines` (other prefix, unitQ line), `ST.arithAnswer` (rewritten for C43/C65), both prompt hooks (asks kept open; `MINE` for A27-13).

## Contracts other fixers must respect
- **`arithChk` entries — additive fields only (no field removed or renamed):**
  - `kind: "andmul"` (C40) is a «؟» state: `ok: true, ask: true`, `valT` = the sum, `mulT` = the product. Consumers that book «درست» keep testing `c.ok && !c.ask`.
  - `c.other` = the attribution word («برادرم», «نوه‌م») for a line of another person (C57). Also on `ck.unread` entries. **story/prior:** never book such a line as her step or result; `arithSaid` already skips them. `arithLines` prints «(کارِ دیگری — «…»؛ …)» after the mark (lines still start with ✓/✗/؟/—).
  - `c.unitQ` (C59) on a ✓ line: the coach alone gets a unit question; not a flag.
  - `valT` of a scaled result now follows C45/C62 («۳۵۳٫۱۶ هزار», «۶ میلیون», «۵۴۰ هزار»).
- **`s.coach.arithAsk`:** an open ask is no longer dropped when a newer ask is registered (it waits until answered; still capped at 12). Entries may carry `other`. `kind` may be `andmul`. Answers: `re = {at, to, apx, her}` as before.
- **`ST.arithAnswer` ⇒ `{yes, no, lines, which}`:** `which` (new) = the candidates when the answer did not pick one («کدام؟»; nothing stored). A named «گرد کردم» with nothing waiting returns one «—» line and stores nothing.
- **prior / correction:** call `ST.arithChk` / `arithNote` / `arithSaid` — never a local copy. `disowned` now keeps another person's wrong line (marked `other`) unless she herself calls it wrong.
- **Offsets:** every round-27 rewrite in `norm` keeps the text length. Older rewrites («درصد ⇒ %», «میشه ⇒ ＝», «ضرب در», «تقسیم بر», «منفی») still change it — `pos/pe` on those lines are shifted against her original text (HANDBOOK §12 row 84 (چ)); do not rely on them for slicing her text there.
- **classify (post-check):** a «؟ … ضرب کردی؟» line is an asked line, not a verdict; the «فقط برای تو (مربی)» unit line must not be repeated to her as an error.

## Not done
See HANDBOOK §12 row 84: operator-less narrative arithmetic (aD4 «۷۹ و ۷ دهم»), C63 «which reading» question when neither fits (✗ is given), C67 (√ recomputation), name-only attribution («علی نوشته»), unit of the second factor in the displayed expression, the answer to «؟» is not written into the prior ledger.
