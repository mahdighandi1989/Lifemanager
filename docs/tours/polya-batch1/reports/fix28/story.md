# Fixer «story», round 28 — hand-back (branch worktree-agent-ae6ac1555a037867b, head 2f77dae7)

Base BASE28 4001c4cf. Branch numbers 153/150 (renumbered to 151/148 at merge).
Proven (a+b+c): F3/C86 (S1 A28-5), F10/C95 (oA1: 0 ⇒ 56 `.lp-dmv`), F9/C96+C125, F11/C97, A28-12, A28-27. Unit-only: C123, C124, 🎯
and ledger-step moves. Not proven at page level: A28-13 (the replay never recreates the side problem).

## Root causes
1. **C86 (S1 A28-5):** the mark was written once into the event's `lines`; later corrections string-substituted the number
   (`a38` `storyFollow26` → `evFix`, the `f.st26` yes path). `ST.relines28` recomputes the mark from the new text; the old one goes to
   history («نشانِ پیشینِ صفحه …»).
2. **C95:** `a40` `mvView27` gave buttons only to `L.evlog` events. New `mvApply28` wrapping `A.dossier`, `A.dossierMove28`/`Unmove28`:
   «↪» on every line, the statement (C123), every 🎯 and ledger step; destination copy with «↩»; «جابه‌جا شد / برگشت» on the page
   clock; a step with dependants asks all / only this / none (C124). `ST.moveItem27` + `dlMv28`: a moved datum leaves the draft (flagged).
   nB1 «floor shows shelves» was a harness bug (ctl opened the same pid twice).
3. **C96/C125:** `ST.otherWork27` rewritten with `attr28` + `ST.dataSrc28` (old body quarantined as `ST.otherWork27R27`,
   REMOVAL_CANDIDATES): a calculation verb or «… حساب… کرد:» ⇒ کارِ دیگری; a saying verb only with a calculation, answer claim or
   confidence; otherwise a datum with «منبع: به گفتهٔ «X»»; «کمکم کرد» and «خودم حساب کردم» stay hers; span = one sentence or its list.
4. **A28-12 / A28-30 / #201:** after-turn hook `ST.ownCalc28` files her calculations (kind `ccalc`, no stage move), another's work and
   her quantity sentences from her own text, without duplicating model reports.
5. **C97 (B28·D10):** `a38` `inventGate` kept it back; «جدا» / «یه مسئلهٔ دیگه» ⇒ own record (live with «می‌خوام … حل کنم»).
6. **A28-27:** `chat_invent` wrapper records offset 0 and a keepback entry; `ST.owns`.
7. **A28-13:** `a40` `addSessEvents` / `dossierSess(sid, pk)` give a correction to the corrected message's problem.

## Tests
`test_tour1_r28_story.js` (20 sections; 15 red on BASE28), `test_tour1_r28_story_replay.js` + `tests/fixtures/r28_story/` (A_s01,
A_oA1, A_aA1, A_s02, A_s03, A_s08, B_s20, B_oB1, C_aC1, D_tD1 — all green), `test_tour1_r28_story_bank.js` (39/41; #199 checked via the
s03 replay, #213 is practice filing). Changed with comments: r27b_history #234 (C123), r19b_live INF16 #11 (C95).
Suite: 166 one at a time; four failures re-run green.

## Not done
A28-13 at page level; a46 `OTHER` regex misses «X یه حسابِ دیگه (هم) کرد:» in the coach line (C28-8; 📜 is right); a moved 🎯 does not
rewrite `x.prob`; tD1 brother's line under two problems. Handoff note `_pending_tour1_R28_story_2026-11-16.md`.
Merge note: prior's one-line change to `ST.otherWork27` landed in the quarantined `otherWork27R27`; story's new function limits the span
to one sentence (prior's B28·D9 test re-run on the merge).
