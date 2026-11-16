# Fixer «correction», round 28 — hand-back (branch worktree-agent-ac00a69a5f8e44bbf, head aa429895)

Base BASE28 4001c4cf. Branch numbers 148/145 (renumbered to 154/151 at merge).
Proven (a+b+c): A28-14, A28-16 (ledger pwA2 and live s04), B28·D8, D28-12, D28-13, A28-38; C28-2 via replay (c) + bank #60/#69.
Unit-only: C89 for two corrections (#51, #56, #70). Not fixed: D28-14 («۲۲ ⇒ ۲۴٫۲»; «۱۸ ⇒ ۲۰» is the a38 `runs25` reading of
«N میلیون و M»). Not replayed: C28-14 (pwC1). Partly: B28·D19.

## Root causes
- **A28-14:** a27 `retractApply` accepted the model's `old` only when `liveFixVal` succeeded; the r27 `fixVal` refuses inside an equation,
  so the coarse `coreDiff` window won. The minimal pair now comes from her words; `chLine20` shows a whole numeric phrase.
- **D28-12:** a38 `coreDiff` used a suffix/prefix window without `old`; `named28`/`locate28` read «X نیست، Y» / «Y … نه X» and find X
  (unit by stem; a lone number only if unique and not inside «۴ میلیون»); a27 `retractCheck` asks «کدام عدد؟» listing occurrences.
- **B28·D8:** `restate28` — a restated sentence changes only the one differing span.
- **C28-2:** a45 `subFrag` replaced the whole fragment; now the minimal a38 pair (old body `subFrag0`, fallback). A datum-only ledger step
  is rewritten with history, not marked stale.
- **A28-16 ledger:** a38 `accept27` refused on two hits of 24⇒20; `redoClear27` then cleared the mark as her redo. One home step per
  quantity; different quantities ⇒ «کدام؟»; `acc28` (acceptance and negation are never a redo); operands from a stale/rewritten step use
  its value; a refused arithmetic check is said aloud; `stale25` twin updated.
- **A28-16 live/chat (C68):** `accept28` for `L.stale24` / `s.stale26` records the acceptance and names the still-stale dependants.
- **C87/C111:** a proposal whose base changed again is not applied; the page names the old base and current value, shows the current exact
  proposal. **C89:** `staleCore25` `derOf` never takes a later sentence's value as source; `amb28` asks when a value equals both the datum
  and a stale result; `A.livePriorStale` `prev27` from open stale marks and `dep`; a45 re-marks a still-stale step (`staleHist`
  «superseded»).

## Tests
`test_tour1_r28_correction.js` (8 runner replays, `tests/fixtures/r28_correction/`; 7 positives red on BASE28),
`test_tour1_r28_correction_bank.js` (R2 #48–#86: 34/39; NC #59 shape no longer arises, #57 chat line not rewritten + `runs25` reads
«۴ میلیون و ۵۰۰ هزار» as 4, #61 chat-only datum quote, #64 result equal to the corrected value, #78 equal digits same unit). R27 banks
36/36. Page replays through each group's harness: A s04, A pwA2, B nB1, D tD1, C s25. Suite 166/167 on bd81ebd4 (r23_correction #102
fixed in aa429895; correction-related tests re-run on the final build). Pytest 14 passed.

## Not done
#57, #61, #64, #78, D28-14, C28-14 replay, A28-15 (S3). Shared: `A.liveCoreDiff` may return `c88`/`absent28`; stale items may carry
`acc` (views should filter accepted items); `staleHist` `how` values; a45 `subFrag` and the `EN26` re-mark block.
Handoff note `_pending_tour1_R28_correction_2026-11-16.md`.
