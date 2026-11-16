# Tour 1 (Pólya), round 27B: fixer «leftovers» — handoff (2026-11-16)

Scope: the «leftovers» launch line of `docs/tours/polya-batch1/runners/FIX27B.md` (engine items the seven round-27 fixers reported «not done»).
Base: BASE27B = 01457e43. Docs: WORKLOG / PROGRESS on this branch use the next free numbers (146 / 143; assigned 147 / 144 — the gate rejects
gaps, the coordinator renumbers at merge), HANDBOOK §10 row + §12 row, AUDIT_LOG, REMOVAL_CANDIDATES (2026-11-16 entry).
Tests: `apps/learning-architecture/tests/test_tour1_r27b_leftovers.js` (sections `SEC=c58,c68,d18,arith,narr,tier,d24`), bank #71 and #84 now
checked in `tests/tour1_r27_correction_bank.js` (no longer NC), bank #317 in `tests/test_tour1_r27_classify.js`.

## Functions changed (exact)
- `a41_practice.js` — **new** `rebook27` (`PR.rebook27`): the ONE function for a correction of a booked plan/deadline day. `editBooked27` now
  delegates to it (old body quarantined: `PR.R27_QUARANTINE.editBooked27a`).
- `a27_tour.js` — `retractApply` (plan-day branch and deadline-day branch call `A.PR.rebook27`; old direct move quarantined as
  `AS.R27B_QUARANTINE.planMove27`); `AS.DO.coach_state` (stage credit `phRep27`, B27·D18); `coachPhase0` (`C.prev.strong` reads `ownText`;
  new `narr27` guard on the talk's matter, bank #317; exported `AS.narr27`).
- `a38_live.js` — `runs25` (magnitude-aware lexing: `MAGLX27`, `magV27`, `mag2nd27`, `A.liveMag2nd27`; bank #71/C63); `retractSess` (deadline
  day through `A.PR.rebook27`); new `accept27` (`A.liveAccept27`, C68) called first in `redoClear27`; `redoClear27` ignores a negating message;
  `staleCore25` (one guard `wr27`, C27-23).
- `a45_story.js` — `priorMerge` only: a new digit-free step with a reference word (`REF27B`) gets its dependency and the stale mark of the step it rests on
  (bank #84). One function, as FIX27B allows.
- `a46_arith.js` — `norm` rebuilt on `normM`/`rpM` (same normal form; position map), `backPos` applied in `arithChk` (pos/pe/cut now in HER text),
  `ST.arithNormM` (new export); `tokens` (√ token `f`); parser `atom` (√, exact or 15-digit rational interval: `isqrtIv`); `okNext`/`okPrev`/`hasOp`
  (√); `leadOf`/`trailOf` (an expression may start with √); `agree` (irrational exact ⇒ C16 ask; compound operands count as a scale word for C15);
  `chains` (C63 `m2` kind; C67 `√N ≈ x` display); `askT` (`m2`).

## Contracts for the other fixers
1. **C58 one path.** Anyone who corrects the day of a booked plan or deadline calls `A.PR.rebook27(session, record, {kind: "plan"|"deadline", date|src,
   at, why, by, move, queue})` — never `record.when = …` / `record.date = …` directly. `move: false` (✏️) closes the booked record as «replaced» with
   ONE history line and asks once (queued in `s._re26`, drained by `PR.datePend`); `move: true` (her chat correction) moves the record once with ONE
   history line (`fixHist` for a deadline; for a plan the caller's `corr` with `oldWhen` when `hist: false`). A second caller in the same turn finds
   nothing to do (closed, or the same date).
2. **arith positions.** `ST.arithChk` entries' `pos`/`pe` (and `unread[].pos/pe/cut`) are now offsets in the text passed in (her text, or `ctx`), not in the
   normalised text. `norm`'s output is unchanged. Anyone who used to compensate for the shift must stop.
3. **New `arithChk` kind `m2`** (C63): `ok: true, ask: true`, fields `m2T` (her compound, e.g. «۲ میلیون و ۸۰۰»), `m2W` («هزار»), `m2A` (the two values).
   Consumers that book «درست» keep testing `c.ok && !c.ask`. A ✗ whose value depends on the reading now shows both values in `valT`.
4. **√ (C67).** «√(…)» and «√N» are read. `c.irr = true` when the display is `√N ≈ x`.
5. **C68.** `A.liveAccept27(session)` runs in the afterTurn hook before the redo clearing. It never changes a step whose new text a46 reads as wrong.
6. **#84.** A new ledger step without digits and with «همون/همان/اون مقدار…» keeps the model's `dep` (validated by the reference word) or links to the
   only step that shares its quantity word; resting on a stale step makes it stale with no number.

## Not done (reported)
See the fixer report `docs/tours/polya-batch1/reports/fix27b/leftovers.md`.
