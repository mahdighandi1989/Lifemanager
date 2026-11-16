# Fixer «leftovers», round 27b — hand-back (branch worktree-agent-ad07b3c6e2ea79914, head 773fe978)

Base: BASE27B 01457e43. The branch used WORKLOG 146 / PROGRESS 143; renumbered to 147/144 at merge.
Commits: 1ff43395 (all mechanisms, tests, docs) · a01e32f7 (`narr27` narrowed to third-person statements; `test_assist` bigPage) ·
773fe978 (one R19b assertion changed for C58).
Suite: all 162 gate tests one at a time; only red was `r19b_coach` before its C58 assertion update, re-run green. Pytest 14 passed.

## Root causes and fixes
- **C58 one path** — a41 `rebook27` / `PR.rebook27`: a38 `retractSess`, a27 `retractApply` and `editBooked27` each moved/closed a booked day with
  their own history line. Now all call `rebook27` (one history line; ✏️ ⇒ «replaced» + one ask; chat correction naming the day ⇒ one move).
  Quarantined: `PR.R27_QUARANTINE.editBooked27a`, `AS.R27B_QUARANTINE.planMove27`; `retractSess`'s old move stays as fallback.
- **C68** — a38 `accept27` (first in `redoClear27`): accepting a proposal rewrites the ledger step with history only if a46 reads it correct;
  unmarked dependants get exact C47 proposals. `redoClear27` no longer clears a mark on a negation.
- **#71 / C63** — stale engine lexer `runs25` reads magnitude words (`MAGLX27`, `mag2nd27`); a46 `chains`: one fitting reading is used; a
  verdict that depends on the reading asks (`m2`); none fits ⇒ ✗ with both values.
- **C67** — a46 parser: «√(…)» exact or narrow rational interval, shown in her decimals; «۲√۳» «نسنجیده».
- **Offsets (WORKLOG 137)** — `norm` through `normM`/`rpM` with a position map; `arithChk` `pos`/`pe`/`cut` are offsets in her own text.
- **#84** — a45 `priorMerge` only: a digitless step with a reference word keeps the model's `dep`, else links to the one step sharing its
  quantity word; stale if that step is stale.
- **B27·D18** — a27 `coach_state`/`coachPhase0`: «حل شد» quoted inside her question became `P.strong`; now `strong` reads `ownText` and the
  stage credit comes from `phRep27`.
- **#317** — a27 `narr27`. **D27-24** — a38 `staleCore25` `push`. **C27-23** — a38 `staleCore25` `wr27` (rounding/restatement skips tiers ج/د).

## Tests
`tests/test_tour1_r27b_leftovers.js` (c58, c68, d18, arith, narr, d24, tier; positives red on BASE27B). Bank #71, #84 now real checks
(R2 36/36); #317 green in classify. Changed: `test_tour1_r19b_coach.js` inf15 (C58 one history line), with a comment.

## Not done
C68 only for the prior ledger (not chat-only problems, not «این‌جا هم عوض شود؟» ⇒ «بله»); `m2` «کدام؟» has no reader in `ST.arithAnswer`;
a ✏️ moving a booked day into the past asks nothing; move mode skips `PR.dateAnswer`; no real-model run.
Shared contracts: `arithChk` offsets in her text, new kind `m2`, new export `ST.arithNormM`, `PR.rebook27`.
Handoff note: `docs/overhaul/handoff-notes/_pending_tour1_R27B_leftovers_2026-11-16.md`.
