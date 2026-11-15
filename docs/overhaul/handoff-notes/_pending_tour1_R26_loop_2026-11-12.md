# Tour 1 (Pólya), round 26: fixer «loop» handoff (2026-11-12)

Scope (DECISIONS_R26 «Fixer split / loop»): Q7 — territory loop polish (U58, U59, U61, U62, U63, A26-35, A26-36, A26-50, C26-20, D26-19,
D26-20, D26-21, D26-22, D26-54) + clarifications C20 and C36. Base: `BASE26` (23e351f6).
**Only file touched in `src/`: `apps/learning-architecture/src/app/a44_route.js`** (no other fixer's file; the a26 system prompt untouched).

## Functions changed in a44 (all inside the «Q6 — حلقهٔ قلمرو» block unless noted)
- New: `foldW`, `VEND`, `nOf`, `idN`, `evOut`, `sheetSeen`, `sheetClose`, `candOf`, `herShare`, `tieCands`, `tiePick`, `tieChoose`, `tieNone`,
  `tieDrop`, `tieAnswer`, `mootWatch`, `closedBare`, `stepsSync`, `looseSheets`, `sheetNews`, `cardAnswer`; regexes `ORD_T`, `OTHER_T`, `NONE_T`,
  `NEG_T`, `PICK_T`, `TERR_AREA`.
- Rewritten: `rank`, `tok1` (calls `foldW`), `areaIdx` (builds the attested lexicon `lex` first, resets the token cache), `sysCard`.
- Edited: `score` (+ `nm` = the candidate's WHOLE name is in her step or the sheet title, + `st` = words shared with her step), `PRE.sysRank`
  (+ `tie`), `arrive` (6th argument `extra`; `tool.key`; unique back id; closes the sheet), `askFit` (`ask.alts[]`, `ask.evk`, names every tied
  candidate, reason wording), `mismatch` (7th argument `cameOv`; `e.openBy`; title names what came), `ruledFor` (+ `e.passed`), `sysLocal` (moot
  entries are watched), `sysSheet` (`filed` status; a bare close; `e.shSt`), `waitEv` (late wording, tie outcome), `herNo` (7th argument
  `others`; updates the earlier events' outcome), `takeBack` (tie ⇒ re-ask; the take-back note is the closing note), `lateScope`, `sysOpen`,
  `PRE.sysDone` (declined), `PRE.sysFit` (tie; same-turn guard), `sysLines` (tie answer; same-turn guard; tie wording of the turn question), the
  sys after-turn hook (unique resume id; `stepsSync`; acks), the `A.dueList` wrapper (tie names, late line, moot line, 📬 line), `PRE.sysCheck`
  (step-less sheets), `PRE.R24_QUARANTINE` (+ `rank25`).
- Outside the block: one condition in `ROUTE.model` (a withdrawn `sysback` event draws no «برگشت به گامِ منتظر»).

## Contract: model reports, page validates
- **Tie** (`ask.alts` non-empty): the page reads her choice itself from her message — whole name, a word that is only in that candidate's name
  (in a clause that picks or rejects: «همون/همین/می‌خوام…», a rejection form, or a short naming clause), «اولی/دومی/سومی», «آن یکی». Names win over
  ordinals; «هیچ‌کدام» wins over everything. Exactly one ⇒ it arrives («گفتی همان است»), the others go to `e.passed` (not `rejected`, no reopening
  note). «هیچ‌کدام» / a bare «نه» ⇒ all rejected, one note. A bare «آره» ⇒ nothing is picked; `ask.which` makes the coach ask which one. Only a
  rejection of one ⇒ the ask continues about the rest. The model may send `sys_fit {fit:true, quote, pick:"name or id"}`; the page checks that
  `pick` is one of the candidates. A `sys_fit {fit:false}` in the SAME message never rejects the tool she picked in that message (`tool.key`).
- `sys_done` now also applies to a `declined` entry (line + 📜 event, no sheet note).
- A sheet about the page itself (`gap.area` not `*-territory`) never becomes a waiting point of a CLOSED problem, even with a `gap.step`.

## Contract: data (`pre22.sys[]`, `achat.reports[]`) and API (`APP.PRE`)
- Entry gains: `openBy` (the page's own note reopened the sheet; cleared by the routine's next reply or by the close), `closeNote` (one-shot),
  `sheetClosedAt`, `shSt` (sheet status seen at the last read), `passed[]`, `backK` / `resK` / `resN` (ids of the latest back / resume events),
  `tool.key`, `ask.alts[]` / `ask.evk` / `ask.which`, `lastRej.alts[]`, `mootTool {kind,id,fa,go,at}` / `mootAck` / `mootSeen`; `checks[]` items may
  carry `drop`, `afterClose`, `bare`.
- States unchanged. `moot` entries are still watched by `sysLocal` (registry path only): a clear fit sets `mootTool`, never changes the state and
  never reopens the problem.
- Events: `sys23_<sw>_back`, `_back2`, …; `_ask`, `_ask2`, …; `_resume`, `_resume2`, …; new `_late` (`k: sysother`, a tool that came after the
  closure). The `out` of an earlier event is rewritten with what happened next («پس گرفته شد — …», «جواب: همان است — …», «جواب: همان نیست»).
- `achat.reports[i].news {st, seen, read[], at, ack, say}` — written by `sheetNews` for sheets that hold no waiting entry (no `facet`, not local).
- `A.dueList()` new items (kind `p`): `sys23` late waiting piece «⏸ تکهٔ «…» منتظرِ برگهٔ #n است»; `sys23` moot arrival «🛎 ابزارِ «…» آمد — گامِ «…»
  منتظرش بود»; `news26` «📬 برگهٔ #n جواب گرفت — «…»». The ❓ item names every tied candidate.
- `A.HOST.status(sheetId, "approved")` is called (if the host has it) after the closing note, only on her own confirmation. `AS._sheets` entries
  are patched in place (`status`) whenever the page writes a note or closes a sheet.
- New API: `PRE.sysTiePick(e, msg)`, `PRE.sysCardAnswer(sc, entryId, "yes"|"no"|candidateId|"none")`, `PRE.sysNews()`; `PRE.sysRank` returns `tie`.
- 🔭 card: `.lp-syscard [data-sysask] [data-fit=yes|no|<candidate id>|none]`.
- Matching: `PRE.sysToks` now folds two closed classes onto a stem that is attested in the registry's own vocabulary — a conjugated verb with
  prefix «می/ب» AND a personal ending, and a final colloquial «ـن/ـند» of a form that is itself not attested. Negatives are never folded.
  Clear = exactly one candidate meets (≥2 full words, ≥1 of her step, more than `rejS`), or exactly one of several carries its whole name in her
  step / the sheet title; several ⇒ ask naming all (order = the order of the routine's reply).

## For the other fixers
- **story (Q3/Q6):** `closedProb` is still the single «closed» check here. A late piece is judged by the sheet's AREA only; when a new problem
  gets its own record it is simply in scope. If you change session steps, `stepsSync` only strips «منتظرِ برگهٔ #n» from `achat.steps[].t` of an
  entry that no longer waits — it never changes a step's status.
- **today (Q5/Q8):** three more Today rows (above); keep `sys23` and `news26` rows separate when you merge rows by content. The 📬 row is
  acknowledged by the next message in that chat or by opening the row.
- **classify (Q9/Q10):** new page lines take her register through `shE(e)` / `shoma(se)` («گفتید/گفتی», «بگویید/بگو», «کارِ شما/تو», «خواستید/خواستی»).
  The 📬 line quotes the routine's reply (not her words). No new static strings outside a44.
- **arith / prior / correction:** nothing shared.
- **coordinator / RUNNER27:** the tour harness `HOST` has no `status`; add `status: async (id, st) => { sheet.status = st }` (the real host accepts
  only `open|approved`, and an owner note reopens an answered/approved sheet) or the close after a take-back stays invisible to runners.
- Docs numbers used: WORKLOG (135), PROGRESS 132, HANDBOOK §12 row 79. Lower numbers are left for the other fixers, so
  `tests/test_learning_architecture_handbook.py` reports a numbering gap on this branch alone until the merge.

## Suite note (resume, 2026-11-15)
Whole page suite on 9f5dfdc8: 141/142 green. The one red, `test_polya_fix5` «M3: current step shows one date», is a calendar
coincidence in that old test, not a44: it hard-codes «۲۵ آبان» (= 2026-11-16) and asserts that date differs from `T.d1` (tomorrow);
run on 2026-11-15 the two are the same day. It was green on 2026-11-12 and goes green again from 2026-11-16. Owner of that test should
compute the date from today instead of hard-coding it (FIX26 rule); not changed here (outside Q7).
