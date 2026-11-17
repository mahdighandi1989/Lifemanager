# Tour 1 (Pólya), round 29: fixer «prior» handoff (2026-11-17)

Scope (DECISIONS_R29 R3, family F17): C139 one judge (S1 B29·D11), D29-7 (no page-made «new text»; later messages are not redos), B29·D25
(an unchanged step keeps its reason), s28 p4 / C25-7′ (prior block at a second problem's opening); plus C163 and the ledger half of C164.
Base `BASE29` = `40b34a51`. FIX29 assigns WORKLOG 157 / PROGRESS 154; **on this branch the entries carry 156 / 153** (first free numbers;
the docs gate refuses gaps). **Coordinator: renumber at merge** (WORKLOG heading, PROGRESS row + its `WORKLOG (n)` cell, HANDBOOK §10 cell,
§12 row 101 if a sibling took it, the AUDIT_LOG line).

## Functions I changed or added — `a45_story.js` only
- `tryFix(x, t, at, by, v, soft)` — **contract changed**: returns `true` (fixed) | `false` (retry recorded) | `null` (soft and not read:
  nothing recorded). The old ✗ (`x.badC`) is re-judged by `ST.arithChk(t)` entries with the same `kNorm(expr)`; the light reader
  (`calcs`/`numsOf`) only confirms, or adds «نسنجیده» (`x.retry.nc = true`); it rejects only when the engine's value is evidence (her written
  result is the plain number of the quote, e.g. «۱۲ جعبه» ⇒ 10). `x.retry.chk` / `x.retry.chkM` now carry the engine's note (her view without
  the right number / the coach with both readings). `soft` = true (page-built text: record nothing) or a string (her own sentence to quote).
- new `fixK(x, t, at, soft, v)` ⇒ `"fix" | "retry" | ""`; callers push nothing on `""`.
- new `TAG163` (C163 confirmation tag); new `stmtHit29(pid, t)` (C25-7′).
- changed callers: `priorTurn25` (retract path: soft, a stale-able step becomes stale instead of a fabricated retry; «گام/نتیجه» path:
  `stale29` / `strong29`, soft for word-only links, `TAG163`), `priorReply` (pair acceptance: soft with her sentence), `pageFix` (`fx(x, nt, made)`;
  the dependant sentence found by the light reader is judged by the engine), `stepLine` (renders `retry.nc` and `retry.chkM`), the
  «به‌روز شد» label (`retry.nc` ⇒ «متنِ تازه را صفحه نسنجید»), `whyNow27` (no split inside amounts; byte-exact when nothing is dropped),
  `priorAsk` (+`stmtHit29`), `priorOpenAt` (`other29`: messages owned by another closed live problem do not block), `BAREW28` (+ scale words).

## Contracts for the other fixers
- **arith:** I use only `ST.arithChk` (`ok === true/false`, `expr`, `said`) and `ST.arithNote(ck, "wrong")` (`chk`, `chkM`). The engine's `val`
  for a compound «N میلیون و M» chain is not a usable value (−6000142 for «۸ میلیون − ۶ میلیون و ۱۵۰»); I never compare it unless her
  quote holds the plain said number. When you publish the per-clause export (C138), the prior ledger can switch to it — keep `expr`
  so `kNorm(expr)` still matches the stored `badC.key`.
- **correction:** a page-built substitution (`subFrag`/`subNum`) that the engine does not read is never shown as her text; if your
  retract path needs a visible state for such a step, use `x.stale` (with `nums` from `A.livePriorStale`), never `x.retry`. Bank R29 #112:
  `A.livePriorStale` returns no proposal for dependants written in compound amounts («۵ میلیون + ۷۵۰ هزار = ۵ میلیون و ۷۵۰»).
- **story:** `stmtHit29` reads the live problem's statement and title (`A.liveRec`); a ledger for a second problem is opened when the
  model reports `prior` at that opening (the recorded s28 reply has none — the page only asks).

## Tests
`apps/learning-architecture/tests/test_tour1_r29_prior.js` (+ `tests/fixtures/r29_prior/*.json`, read-only copies of T/round29X ctl + ai;
`tests/variants/VARIANTS_R29.{json,md}` byte copies of the bank).
