# Tour 1 (Pólya), round 24: fixer «correction» (R3) — handoff (2026-10-25)

Scope: R3 of `DECISIONS_R24.md` («CORRECTIONS SPREAD AND NUMBER BOUNDARIES»). Files: `apps/learning-architecture/src/app/a38_live.js` (retract, copies, units, derived numbers),
`a27_tour.js` (retract side only: `subst19b`/`subst20`, `retractApply`/`retractRun20`, `askUser20`, `chLine20`, `liveRes20`, the A23-30 stale-result block), `a40_dossier.js`
(✏️ hand-off, dossier retract lines), `a44_route.js` (`fragOf`). Tests: `apps/learning-architecture/tests/test_tour1_r24_correction.js` + `tour1_r24_correction_bank.js`, bank copy
`apps/learning-architecture/tests/variants/VARIANTS_R24.json` (+ `.md`). Docs: WORKLOG 105, PROGRESS 114, HANDBOOK §2 bullet + §10 row + §12 rows 57 (a done) and 62, AUDIT_LOG,
REMOVAL_CANDIDATES, experience `model-reports-state-page-validates` (Update 2026-10-25).

## Contract 1 — one ✏️, one coach run (story / classify fixers)
- `AS.retractApply(s, x, {edit: true})` accepts an **array** of `{msg, what, fix, mid}` (all pairs of one ✏️); `retractRun20` runs every pair (the 3-pair cap is only for model reports)
  and de-duplicates `ch`, `pend`, `res.changed` (rec+new) and `res.ask` (id). `retNote.frag/fix` join all pairs. Anyone sending a multi-pair ✏️ must use the array form.
- In a ✏️ the page's own copy asks (se.retracts[last].ask) are now in `retNote.res.ask` — the model must not say «nothing was asked».
- `res.what` of a ✏️ comes from what changed or was asked (`stale`, `verdict`, `state`, `suff`, `coach` kinds excluded), not from every record of the edited message.

## Contract 2 — display (today / dossier / age fixers)
- One arrow direction for every change line: `APP.liveChFa(old, new)` ⇒ «new» (اصلاح شد ⇐ «old»). Asks and ask answers have no arrow: `APP.liveAskFa(old, new)` ⇒ «new» به‌جای «old»
  (`APP.liveAskPart(q)` uses it). Dossier retract headers use the change form; `a44 fragOf` reads both forms. **Age fixer (register):** `askUser20` lines go through the existing
  `toShoma` wrap in `coach_state` — keep it after any rewording of the ask line.
- The why of a change is never «»: chat ⇒ «به گفتهٔ خودش: «her full words, quotes kept»»; ✏️ ⇒ «با ✏️ خودش: «old» ⇐ «new»، …» (all pairs, as written in the ✏️ turn).

## Contract 3 — derived numbers (today / dossier / story fixers)
- `APP.liveStale(pid)` ⇒ live marks `[{k, lab, raw, v, re|null, ctx, from:{o,n}, at}]` (only numbers still present in their record). Stored in `L.stale24` (per correction).
  A number is stale when one arithmetic operation (+ − × ÷, small power) on the old value (or an already stale number) and a number written **before** it (statement, or the same
  record) gives it; `re` is the same computation with the new value, set only when every derivation agrees; a number that some derivation leaves unchanged is not stale; a unit
  family different from the old value's is skipped. The live view shows «🕰 کهنه پس از اصلاح» (`APP.liveStaleCard(pid)`); the result carries a `stale` change line.
  **Today/dossier fixer:** if you list problem records, show `liveStale` marks rather than re-deriving; nothing is rewritten without her «بله».
- Coach `res` events: besides the round-23 rule (span names the old value), a numeric result recorded **after** the corrected message gets `e.stale` when the datum is numeric and the
  model's `rests` (if given) include `solved`.

## Contract 4 — units and roles (everyone using `APP.liveNumOccs`/`liveOccX`)
- New units: `wk` (هفته) and `day` (روز) in family `days` (هفته = ۷ روز), `dom` (number before a Persian month name = day of the month), and Latin-glued units («160cm»).
  `liveOccX` adds `div` (the number follows «بر»); `numCopy23` never pairs a divisor with a non-divisor; `nbrOK` accepts same role (both divisors with ≥2 shared neighbours, or the same
  magnitude «میلیون/میلیونی» with ≥1). `mag` is read from the raw word (not the colloquial-normalised token).
- `APP.liveRolePair(old, fix, cur)`: when the model pairs two roles («۱۶ هفته» ⇐ «عروسی ۱۵ اسفنده»), the same-role value of her own message («۱۸ هفته») becomes the new value
  (exactly one candidate, else null). Used by `A.liveRetract` and the coach's D21. **Deadlines still read `R.fix`** (the date), unchanged.
- `fixVal`: an unitless number whose sentence neighbours carry one unit of the new value's family but a different unit is replaced with the number **and** its unit
  («۱۵۰ سانت ارتفاع»); without such neighbours, still the number only (R23 #109).
- Month days copy with their month («۳۰ مهر» ⇐ «۲ آبان» ⇒ «۲ آبان»).

## Contract 5 — chat drafts follow (story fixer: you own a45)
- `retractOne` ends with `chatDraftsFollow`: unconfirmed proposals (`L.uDraft.chat[f].st === "ask"` with `d[f] === chat[f].t`, `dl[i].chat`, `L.planChat`/`planDraft`), `L.chatUnk`,
  `L.chatImpItems` follow the same fact (role-aware `numCopy`), with `fixHist`/`was` history. `A.STORY.dest` reads them, so the 🧭 destination follows. **Story fixer:** if you
  change the draft shape (`chat` records), keep `st`, `t` and keep `d[f]` equal to `chat[f].t` until she confirms, or tell the correction owner.
- `stampUses`: a verdict/«حل شد» naming no datum rests on the declared data (u.one, u.c, dl, prac.measure); statement clauses only when nothing is declared.

## Bank results (VARIANTS_R24, R3.corrections_numbers, 28 entries)
- 28/28 pass. On the base build (3685102d), 16 of 28 fail; all 10 runner sentences fail there too.
- #68 (elder «شما»): the scenario sets the conversation register to «شما» (`coach.reg`) — deriving it from the age is the age fixer's R5 work.

## Not done (with reason)
- Multi-operation derivations without intermediate steps in the records (a loan instalment computed by a formula) are only marked when they are a chat result (Contract 3); typed
  records with such numbers are not detected (HANDBOOK §12 row 62 a).
- Recompute suggestions use exact equality; rounded values («حدودِ ۱۴») are not matched (row 62 b).
