# Tour 1 (Pólya), round 28: fixer «prior» handoff (2026-11-16)

Scope (DECISIONS_R28 R6): C98 (F12), the D28-6 regression (a new problem never extends another ledger), B28·D9 (her fix of a ledger step
lands; each live problem carries its own ledger), C27-21 (a fixed step drops its stale reason), C97 on the ledger side, plus C126 (a
hypothetical is not a new problem). Base `BASE28` = `4001c4cf`.
FIX28 assigns WORKLOG 150 / PROGRESS 147. **On this branch the entries carry 148 / 145** (next free numbers on BASE28; the docs gate refuses
gaps). **Coordinator: renumber to 150 / 147 at merge** (WORKLOG heading, PROGRESS row and its `WORKLOG (n)` cell, the HANDBOOK §10 cell, the
§12 row number if a sibling took it, the AUDIT_LOG line).

Tests: new `apps/learning-architecture/tests/test_tour1_r28_prior.js`; fixture `tests/variants/R28_prior_runs.json` (the round-28 runners'
own turns from T/round28X/<sid>/ai: user text + recorded model reply; `fresh` marks a new chat as in the runner's ctl) for pwA1, dp2, pwB2,
nB1, pwC1, tD2; byte copy of the bank `tests/variants/VARIANTS_R28.json`.

## Functions I changed or added (keep your edits out of these, or tell the coordinator)
`a45_story.js`
- new: `BAREW28`, `bareQ28` (`ST.bareQ28`), `bareMsg28` (`ST.bareMsg28`) — C98; `UNKQ28`, `FRAME28`, `newProb28` (`ST.newProb28`),
  `closedNew28` (`ST.closedNew28`), `splitNow28` — C97 ledger side / D28-6 / C126; `NEWSTEP28` («یه گامِ تازه» merges into the same ledger);
  `prop28` (exact proposals for dependants after her own fix, via a38 `A.livePriorStale`); `whyLine28` (`ST.whyLine28`) — C27-21.
- changed: `priorAsk` (C98 bare question; one product in small talk without a problem signal is not prior work; a new problem after a
  closed one or split off in this message opens its own ledger), `priorTurn25` (bare-question steps dropped from the report; `open0` for
  a new problem; `NEWSTEP28` in `open`; `prop28` after relink), `priorPid27` (+`newProb28`), `onState` (one block before `ppid27`: a new
  problem after a closed one bumps `C.pk` only when the chat key still holds the closed problem's ledger copy, and sets `C.np28`), the
  «کارِ پیشینِ تو» prompt hook (`cn28`: the closed ledger is not shown for a new problem), `stepLine` (4th arg `pr`; reason via
  `whyLine28`; `fix28` proposals shown; callers in `priorLines`, `priorTurn25` and the lprob card pass `pr`), `importChat` (the live
  problem's ledger comes from the chat problem whose statement matches it, `L.priorPk28`).
- **story's area, minimal:** `ST.otherWork27` — the «کارِ دیگری» span now also ends at a sentence that starts with «پس / بنابراین / در نتیجه»
  (her own inference after reported speech). Root of the B28·D9 regression: «مادرم اولش نه گفت … . پس نمره‌ی مادر … ۷ … = ۷٫۷» was all
  «کارِ دیگری». The start of the span and the attribution are unchanged (C96/C125 stay story's: «X گفت» + a calculation is still X's work).

`a46_arith.js` (arith's file) — only `ST.arithContest`: re-typing her own earlier ✗ line word for word with nothing else (C28-4, bank #247)
is no dispute; returns `null` before the re-check. Any contest word or extra insistence still contests.

Guards found by the whole suite (kept): the single-product small-talk gate in `priorAsk` is skipped for «حساب کرده‌ام» and English own-work
markers («I computed it myself», bank R27 #156, R25 P1 #3); `prop28` gives no proposal to a dependant she re-wrote in the same message and
that still does not read (bank R26 #112 — the page does not hand her the number). `newProb28` ignores a message that names a step of the
closed ledger («تو گامِ ۶ منظورم …», found by the page replay of pwA1 p18) and needs a quantity/choice question for «own unknown».

## Contract (for the siblings)
- **story (C97 record side):** the ledger now follows `C.split25` (key of this message) and `C.np28`; when you register a separate problem,
  keep `C.split25`'s `key` = `nz(text).slice(0, 80)` so `splitNow28` sees it. `importChat` picks the ledger by statement overlap; do not
  copy `E.prior` from `C.pk` for a live problem that is another chat problem.
- **correction:** `prop28` calls `A.livePriorStale({old, fix, steps, cur})` and stores `x.stale = {frag, fix, at, nums, by: "fix28", from}`
  so that `accept27` («آره، همون ۲۵۰۰ درسته») works on it. Keep that shape.
- **arith:** if you rewrite `ST.arithContest`, keep the re-typing guard (C28-4) next to the `hypoCut` rule.

## Not done (with reasons)
- bank #226 (C74 fact «اصلاً ۴ لیتر بوده» ⇒ exact chain 80000/10/2000): the a38 retract engine does not accept the fact in this shape, so
  no stale/proposal is made — correction's engine (C88/C89).
- bank #229 (stage moves to look-back after «کلش رو حساب کردم: ۱۲٫۵ بار، یعنی ۲۵۰۰ هزار تومن»): step 3 takes her value; step 4 gets the
  exact proposal 2500 but is not rewritten (one sentence, two steps), and the stage stays — story's `finOf`.
- bank #235 (title): the title comes from the model's `live_new`/a27 routing, not the ledger.
