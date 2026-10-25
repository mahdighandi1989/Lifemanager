# Tour 1 (Pólya), round 24: fixer «loop» handoff (2026-10-25)

Scope (DECISIONS_R24 «Fixer split / loop»): R1 — territory loop matching (the round's only S1). Base: `3685102d` (main + backtest rounds 16–18 + round-24 records).
Files: `apps/learning-architecture/src/app/a44_route.js` (the sys* part of the Q6 block, `sysOpen`, `sysDone`, `sysLines`, the after-turn hook, `dueList` wrapper, `sysCard`,
`DET_K.sysask`, the «# پیش‌نیاز» RULE line — where the model learns the `gap.step` / system-itself / `sys_fit` contract), `apps/learning-architecture/src/app/a26_assist.js`
(`AS.triage`: a kind=fix gap never carries `step`). **The a26 system prompt was NOT extended: it is at ~19,988 of the server's 20,000-character limit (test_assist.js) —
any fixer adding text there must make room first.**
Tests: new `tests/test_tour1_r24_loop.js` + byte copy of the bank `tests/variants/VARIANTS_R24.json` (+ `.md`). Changed: `test_tour1_r23_prereq.js` — G102 now carries
`gap.step` (DECISIONS_R24 R1 removes the «now» fallback; commented in the test).
Docs: WORKLOG (107), PROGRESS 116, HANDBOOK (§2 bullet before «گفت‌وگو ⇄ صفحه», §10 row 2026-10-25), AGENTS.md (§«💬 دستیار» reply contract, round-24 paragraph),
AUDIT_LOG, REMOVAL_CANDIDATES (`APP.PRE.R24_QUARANTINE.fits23 / namedItems23 / stepNow23`). Numbering leaves 105/106 and 114/115 for correction and story (merge order).

## Contract: model reports, page validates
- `gap.step` — only for a step of HER problem. A sheet about the system itself (kind `fix`, self-knowledge, companion book, model benchmark, general question) has no step.
  The page: `kind:"fix"` ⇒ no entry; `gap.step` ⇒ that step; «گامِ #k» in the gap text ⇒ the k-th item of `s.steps`; a `s.steps` item naming «#n» (the sheet) ⇒ that step;
  otherwise the sheet goes to `pre22.sysPend` (no waiting mark) and binds later when a `s.steps` item names «#n». **No fallback to the «now» step any more.**
- `gap.why_not` — name ruled-out areas by id (or Persian name): they are never accepted as «the tool needed». Ids in comparison/negation clauses of `evidence`/`missing` count too
  (not for `kind:"priority"`).
- `coach_state.sys_done {sheet, quote}` — unchanged shape; the page now rejects a quote that ends with «؟» or has no completion verb (bank R24 #25/#26), writes a page line
  (her register: «برداشتید» for «شما») and a note under the sheet («… هنوز لازم است؟»).
- NEW `coach_state.sys_fit {sheet, fit: true|false, quote}` — her answer to the page's «این ابزارِ تازه همان است که برای گامِ … لازم بود؟». The page also reads a plain
  «آره/بله/همونه…» or «نه/همون نیست…» at the start of the next message.

## Contract: data and API (`APP.PRE`)
- Entry (`pre22.sys[]`) gains: `ruled[]`, `ask {id, kind, fa, go, text, how, w, at, key, n}` (state stays `wait` while asking), `asked[]`, `rejected[]`, `readNotes[]`,
  `waitAt`, `waitSrc`, `lastEvAt`, `how: "sheet"|"registry"|"ask"`. Store also has `pre22.sysPend[] {number, sheet, g, fp, msg, at}`.
- New API: `PRE.sysRank(e, items)` → `{clear, best:{id,n,a,w}, all}`; `PRE.sysNegFree(t)`; `PRE.sysNamed(t)`; `PRE.sysRuled(whyNot, other)`; `PRE.sysReplies(rep)`;
  `PRE.sysWaitEv(sc, e)`; `PRE.sysFit(s, a)`. `PRE.sysFits(e, it)` keeps its shape (now = clear-match words or null).
- Events: new `sys23_<swN>_ask` (`k: sysask`, detour kind `sys` in the route map); repeated mismatches get ids `…_mis2`, `…_mis3` (`k` stays `sysmis`); the `…_wait` event is
  rewritten in place with the current outcome (`out`: منتظر / منتظر — پاسخِ آمده گام را جواب نداد… / منتظر — ابزاری آمد؛ پرسیدم… / رسید / رسید (تأییدِ تو) / رسید — همان گام از سر گرفته شد /
  از راهِ دیگری برداشته شد / برگه بی ساختن بسته شد — راهِ دیگر / مسئله پیش از رسیدن بسته شد) and the current step name. Event times of one entry are monotonic.
- `A.dueList()`: new item «❓ برگهٔ #n جواب گرفت: «X» — همان ابزارِ گامِ «…» است؟» (`sys23`) while an ask is pending.
- Matching (deterministic, no model): reply notes only (not the filing text, not «[دستیار · …]» notes); candidates = ids / `view`s / Persian area names in non-negated clauses
  of the reply ∪ registry diff, minus ruled-out and rejected; generic words: the DECISIONS_R24 list + the loop's own vocabulary + `dfWide`; «clear» = ≥2 shared words (R6 rule),
  ≥1 of them in the step/title, no tie ⇒ arrived; anchored but not clear ⇒ ask (once per candidate); otherwise mismatch (+ note, reopened). A reply claiming a build with nothing
  visible ⇒ the old «⏳ … هنوز دیده نمی‌شود» lag line; «ساخته نشد» with «فعلاً/هنوز/بعداً» is not a decline.

## For the other fixers
- **story (R2):** the route map's `sys` detour now also gets `sysask` points; `DET_K` change is one key. I did not touch `A.STORY` or the import.
- **today (R7):** the Today wrapper adds the ❓ ask line (kind `p`, `sys23`) — if you merge Today rows by content, keep `sys23` items separate (they already carry their entry id).
- **age (R5):** the loop's page lines now take her register only in the sys_done line, the arrival line («گفتید/گفتی همان است») and the ask line («از شما/تو می‌پرسم»); other
  loop lines are neutral. If you add a shared register helper, `shoma(s)` in a44 is the source used here.
- **classify (R4/R6):** the ask turn question is a page question («**پرسشِ این نوبت همین است:**»); it counts as ONE question.
