Round-24 fixer «age» (R5: age and register surfaces) is done on branch `worktree-agent-aa4343a42a9d6c844`. Nothing was pushed and main is untouched. The final full page-suite run had 128 tests green and 2 red; both are now green alone (details under Tests). The handbook pytest fails only on the numbering gap the brief expects.

**Commits** (on top of 3685102d + the bank #87 fix)
- ea5d4c1c — the R5 fix
- 27208693 — merge of the finished sibling classify (046d813d). It was not named to me, but it comes before me in the merge order. Source merged cleanly; only the docs needed appending in order 108 ⇒ 109, and the bundle was rebuilt.
- 49a4f79d — the post-check now catches bank R24 #138 and #140. Classify had left these two R6 entries to me.
- 21e67ca7 — handoff note
- ee23b076 — one test adjusted to my own new post-check

No mode-120000 entry is staged, and the node_modules symlink is untracked.

**Coordinator note (system-prompt cap):** I added nothing to `AS.SYS` in a26. All new model guidance is page-side: the `replyCheck` rewrite lines, and the `# مخاطب` text, which lives in a user-prompt hook. `test_assist` (the cap test) and `test_tour1_r7_coach` pass; the latter reports sys = 19,988. I did not merge loop 54f9ebeb, since you will merge in order.

**Root causes**
- **One birth confirmation per date** (B24·D6, D24-5, A24-20, C): every confirmation used `A.AGE.faBoth`, which adds the ISO date in brackets. Three writers each pushed their own line with no shared marker: `fromChat` and the card (a43 `askNode`), plus `DO.birth` (a34 ~454). Now `A.AGE.confirmOnce` is the single writer and shows only the Jalali date (`faDate`). `faBoth` is quarantined.
- **Model date overriding the page** (B24·D7): `DO.birth` called `setBirth` with the model's ISO date even after the page had read her sentence. Now `A.AGE.fromModel` re-reads her latest message, and the page's own parse wins.
- **Birth card** (B24·D1): the parser needed a 4-digit year in numeric dates and knew only Persian month names. The card forgot a day typed in the card itself. Fixed: `96/2/30`, `30/2/96`, `17 Esfand 1388`, and «۱۷ اسفند» then «88».
- **Age in words** (A24-10): `AGE_SAID` read digits only. New `A.AGE.numWords` reads number words only when they come right before «سال…».
- **Audience block** (B24·D8): the «از تاریخِ تولدِ ثبت‌شده» wording was hard-coded; it now appears only when a date is stored.
- **Register for elders** (B24·D11, A23-14): `regOf` (a27) had no age input. Elders (60+) now get «شما» unless they explicitly ask for «تو». The post-check never forces «تو» on an elder, and now flags a «تو» reply to one.
- **Register signs from verbs only** (C24-10, C24-15):
  - «ببینم» and «بذار ببینم» are no longer «تو» signs (they matched `SIGN_TO18` «[بن]STEM(م|مون)»).
  - The noun «روتین» is no longer a «شما» sign (it matched `SIGN_SH` «[آ-ی]{2,10}[دت](ید|ین)»).
  - A command to the machine («ثبتش کن») is no register evidence.
  - `toShoma` now converts «سنجیدی‌اش».
  - The old regexes are in `AS.R24_QUARANTINE`.
- **Never ISO to a person** (D24-6): ISO dates reached people through the model's memory and reply. `A.faDates` now runs in `AS.regSys` (the single gate for page lines), on the displayed model reply (a26) and in the Drive mirror (a12). The post-check also flags ISO in a reply.
- **Mind-card date field** (A24-13): it only showed a passing toast. It now shows an error under the field, in her register.
- **"Compared with people" cell** (D24-10, plus the a29 norm line): it said «هنوز … جواب نداده‌ای» for ages no source covers. New `P.noNormFor` uses the same judgement as `peers` and gives the honest «برای این سن هنجارِ معتبر در دست نیست» line.
- **Daily puzzle for minors** (C24-18): opening `A.V.psy_item` directly showed and opened an adult-normed item for a 9-year-old. That path is now gated too.
- **Minor's school name** (B): 📜 quoted it verbatim. `A.AGE.privText` plus a wrapper on `A.dossier` replace it; her own chat message is not changed.

**Tests**
- New `tests/test_tour1_r24_age.js`, built from the runners' sentences with the page clock frozen; expected dates are also checked against ICU. It had 28 errors on the base build and is green after the fix.
- New `tests/test_tour1_r24_age_bank.js`: every R5 entry of `tests/variants/VARIANTS_R24.json` (a byte copy of the bank) passes, 23/23, plus R6 #138 and #140, so 25/25. Entries are judged by their text, not their number, and an entry with no judge counts as an error.
- Old assertions changed only where DECISIONS_R24 R5 replaces them, each with a comment:
  - `test_tour1_r23_ageclass.js` — the confirmation is Jalali only, and the model action in a session confirms once.
  - `test_tour1_r18_coach.js` — the bank entry «آره ثبتش کن» is no longer «تو» evidence.
- The R17–R23 banks are green.
- **Final full page-suite run** (one test at a time, 130 tests): 128 green, 2 red, both now green alone.
  - `test_tour1_r24_age` failed because my own new post-check sends an ISO reply back once for rewriting. I fixed the test, and it is green.
  - `test_tour1_r2_live` closed its browser under load and is green on its own. It is the only test that failed under load and passed alone without a code change.
- **Earlier full run** (before the merge and the last fixes): four tests failed and were fixed, then rerun green — `test_age_sync`, `test_psy`, `test_tour1_r18_coach`, `test_tour1_r23_ageclass`. A fifth, `test_tour1_r7_coach`, hit the 900s timeout and passed on its own with a longer timeout.
- The handbook + ownership pytest has 3 failures, all from the WORKLOG/PROGRESS numbering gap (105–107 and 114–116 belong to the siblings that are not merged yet).

**Docs:** WORKLOG (109), PROGRESS 118, a HANDBOOK §10 decision row and §12 open item 63 (renumbered from 62 after merging classify), AUDIT_LOG, REMOVAL_CANDIDATES, an update section in `experiences/age-aware-norms-and-audience-without-a-default-prior.md`, and the handoff note `docs/overhaul/handoff-notes/_pending_tour1_R24_age_2026-10-25.md` with the contracts for the other fixers.

**Not done**
- **Intro stripping with ages in words** (second half of A24-10) belongs to the classify fixer: `AS.stripIntro23` still matches only digit ages, so «من هشتاد و یک سالمه، …» stays in the chat problem title. The contract is `A.AGE.numWords`.
- **No-anchor constructs:** for constructs with no anchored puzzle at all, the assistant's copy in a29 still says «هنوز … جواب داده نشده». The a34 table is correct.
- **Teen addressed as «شما»:** a teen still gets «شما» in a page question (A23-14, pA1 p1).
- **Real-model check:** no run with the real model of the `birth` action with the date given as she said it.