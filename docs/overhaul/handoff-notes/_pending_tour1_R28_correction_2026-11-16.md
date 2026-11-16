# Handoff — Pólya tour round 28, fixer «correction» (R2: C87, C88, C89; families F7, F8)

Numbering: WORKLOG 148 / PROGRESS 145 (the assigned 149/146 left a gap the gate refuses; the coordinator renumbers at merge).

## Functions changed (exactly)
- `a38_live.js`
  - New: `named28`, `locate28`, `restate28`, `A.liveNamed28`, `A.liveRestate28`, `A.liveOccOf28`, `acc28`, `accept28`, `A.liveAccept28`.
  - `coreDiff`: one more wrapper over the previous one (`coreDiff27`, kept and still used). It returns `{o, n, c88: "named"|"restate"}`. `absent28: true` means X was named but is not in the fragment.
  - `accept27`: one home for the same quantity; «کدام؟» for different quantities; the base check (C87/C111); operands from dep steps; a line when the arithmetic check refuses; the live twin ledger is updated.
  - `redoClear27`: an acceptance is never a redo; `stale25` is cleared on a rewritten step.
  - `A.liveStale`: skips accepted items; ignores accepting and negating messages.
  - `A.livePriorStale`: `prev27` is built from `steps[i].stale` and from the dep steps.
  - `staleCore25`: `der` entries carry `ri28`/`s28`, and there are new helpers `after28`, `kind28` and `amb28`. `derOf` only takes sources written earlier and prefers the ledger chain. `newV` returns null when the value has two meanings.
- `a27_tour.js`
  - `retractCheck`: named X. If it is absent, or a bare number with several meanings, the page asks «کدام عدد؟». A located X counts as `byOld`.
  - `retractApply`: a minimal pair from her words beats the model's window. `sub` makes no cruder replacement after `fixVal` refuses.
  - `chLine20`: a whole numeric phrase is shown as the fragment.
  - The refusal map passes through the «کدام عدد را اصلاح» text.
- `a45_story.js` (shared with story/prior)
  - `subFrag` now uses the a38 minimal pair; the old body is `subFrag0` and is still the fallback.
  - The `EN26` call passes `steps[i].stale`.
  - A still-stale ok step is re-marked by a later correction; the old proposal goes to `staleHist` as «superseded by a later correction».
  - A datum-only step (no arithmetic) is rewritten (`applyFix` kind `corr`) instead of being marked stale.

## Contracts for the other fixers
- Shared export shapes:
  - `A.liveCoreDiff` may now return `c88`/`absent28`. Callers that ignore these fields are unaffected.
  - Stale items (`L.stale24[].items[]`, `s.stale26[].items[]`) may carry `acc: {at, mid, base}`. An accepted item is no longer stale; filter it out in any new view (story/📜).
  - Ledger steps may carry `staleHist` entries with `how` set to «superseded by a later correction», «accepted proposal», «step rewritten» or «her redo».
- No text length that another part reads by offset was changed (the arithmetic offsets of WORKLOG 137 are untouched).
- AS.SYS was not touched.
