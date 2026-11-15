# Pending: Pólya tour round 26 — fixer «classify» (Q9 + Q10) — 2026-11-12

> Temporary note for the other round-26 fixers and the integrator. Decisions: tour1_polya/DECISIONS_R26.md Q9, Q10, C22, C38, C39.
> In this branch the entry is WORKLOG (130) and PROGRESS 127, HANDBOOK §12 row 74 — the next free numbers on BASE26 (the build gate
> forbids gaps). The launch line assigned WORKLOG 136 / PROGRESS 133 — the coordinator renumbers at merge.

## Files and the exact functions changed
- `a43_age.js` (mine alone): `G.privText` (body moved), new `privSchool`, `privPeople`, `schoolIsPrivate`, `G.privLabel(t, ctx)`,
  `G.titleOf(t)`, `G.titleDossier26(D)`, the two dossier wrappers (`A.dossierSess`, `A.dossier`), `G.CHILD_Q`, `G.childBand`, `G.childQ`.
- `a27_tour.js`: `AS.notProblem` (one line) + new `pageAsk26`; `idPrefix25` (one alternative) + new `schoolCl26`; `STEMS` (+ «فهم»);
  after `SH_RX`: `POSS26`, `NOTPOSS26`, three pushed rules; `AS.regPage` (now via new `pageSess26`); new `hersText26`, `regDom26`, the
  `A.render` wrapper and the `MutationObserver`; new `privStore26` + a second `S.put` wrapper; `SIGN_SH` (now a `RegExp` built from
  `STEMS_SH26`), `SIGN_TO18` (`CLIT26`, `JOINED26`), `no3sg21` (four ordinals/nouns), `NOUNYI25` (adjectives); `noPlural25(t, hers)` +
  new `plural26`, `GROUP26`; two call sites of `noPlural25` and one new variable inside the register block of `AS.replyCheck`;
  `quotesNotHers23` (one rule); `AS.finalFilter25` (one line). Nothing in the turn-question, stage, date or story functions.
- `a26_assist.js`: `provisional`, the session-list title, new `title26`, `liveTitle26`, `AS.sessTitle26`; the follow-up text inside
  `turn()` (`held26`), new `AS.HOLDS26`. **AS.SYS untouched** (19,988 characters).
- `a29_mind.js`: `PH_SRC` (+ `prior`), new `srcFa26`, the source cell of the phase table, two early returns at the top of the
  `coachEv` loop in `M.phases`.
- Outside my launch files, each a small edit inside one function (please keep when you merge):
  - `a45_story.js` `unkOf` + `UNKMARK24` + new `LABELD26` (U54).
  - `a44_route.js` `entOf` and the detour key in `A.ROUTE.model` + new `movedSess26` (C26-34). Nothing in the `sys*` functions.
  - `a41_practice.js` `PR.eval`: `extGap` + new `capped26`, `capReason26`, the `R.reason` line (C26-42); the `ok` sign of a refuted
    assumption in the `A.MIND.techWork` wrapper (U30). Nothing in the date, forecast or list functions.
- Tests: `tests/test_tour1_r26_classify.js`, `tests/variants/VARIANTS_R26.json` (byte copy of the independent bank — recopy if the
  bank changes again).

## Contract: titles and labels (everyone who shows a title built from her words — story, today, loop, prior)
- **Never build a title with `clip(message.text, n)`.** Use `A.AGE.titleOf(text)` (greeting and self-introduction stripped, third-party
  names replaced) or, for a session, `AS.sessTitle26(s, null, n)` (model title ⇒ bound live problem's title ⇒ `titleOf` of the first
  message).
- `A.AGE.privLabel(text, ctx)` is the mask: «[نامِ مدرسه]», «[نامِ معلم]», «[نامِ شخص]». It runs on write for `coach.stmt`, the
  session `title` and a live problem's `title` (`S.put` hook). So `C.stmt` may contain a placeholder: **do not match `C.stmt` against
  the raw message by string equality**; `sameStmt` (token based) still works. `C.stmtRaw24` and her messages are never masked.
- Known remaining sites that still clip a raw message: `a40_dossier.js` lines with `x.title || clip(((x.msgs || [])[0] || {}).text, 50)`
  (session lists) — today's file; one call to `AS.sessTitle26(x, null, 50)` closes them.
- A school name is masked for a minor, for a sentence that ties the school to a relative or third party, or when the age is unknown
  and the sentence is the speaker's own schooling. An adult's own workplace stays (bank #241).

## Contract: the register (everyone who writes page text)
- Keep writing page text in «تو». A new word of the shape «stem + ت» (second-person possessive) must be added to `POSS26` (stem only)
  or, if it merely ends in «ت», to `NOTPOSS26` — `test_tour1_r26_classify.js` section `reg` scans `src/app/a*.js` and fails on an
  unclassified form. This replaces adding words to `SH_POS` one by one (`SH_POS` still works).
- Static text of the views now passes `AS.regSys` after every render (`regDom26`) when her register is «شما». It skips «…», form
  values, the chat panel, SVG, and any text node that is a substring of her own writing. **Put her words in «…» or leave them as a
  whole text node**; do not concatenate her words and page words in one string outside guillemets.
- `AS.oneQ25` and the one-question gate are unchanged (round-25 contract). Bank #231's «not two glued with a comma» is NOT met: the
  page question text is the registry question's identity; see the reason in the test's `info.nc[231]`.
- For the bands early/child the five understanding questions reach the model in child wording (`A.AGE.CHILD_Q`); ids `u1…u5` are
  unchanged. Do not match the prompt text of those questions for a child.

## Contract: the reply post-check
- Register signs decide only what they can read: a verb stem after «بـ/نـ», the clitic «ـت» only on a known possessive, joined «می»
  only with a verb stem. A sentence with a group word («همه», «هر کدام», «هر دو») or whose verb she used in first person plural is a
  real plural and is not «شما». If you add a rule that needs a new sign, add it to the stem lists, not as an open pattern.
  An explicit «شما» with no group word stays a «شما» sign even when she used the same verb in first person plural («دو شیر داریم» ⇒
  «شما چه داده‌ای دارید؟» is a mix; R21 bank #152).
- Guillemets round a proposition or a label («این‌که «…»», «… را «…» می‌نامیم») are not a quotation of her.

## Contract: mind card
- A `coachEv` of `src: "prior"` with `ok: false` is counted only while the ledger step (`A.STORY.priorFor`) is `verdict: "wrong"`.
  prior: if you add a verdict value, decide whether it is a failure.
- A `how: "res"` credit is dropped when `A.STORY.arithNote(A.STORY.arithChk(text)).bad` is true for its message. arith: keep `.bad`
  meaning «the page marked a line ✗» (not «unchecked», not «asked»).

## Contract: follow-up after navigation
- `AS.HOLDS26[view] = function (session) { return { title, what, go: [view, arg] } | null; }` — when a list-plus-form view already
  holds the item for this session's problem, the follow-up says «open it». Add a finder for your own view if it has the same shape.

## Not done (reasons in HANDBOOK §12 row 74)
- Bare first names with no marker; two-word names after an honorific; `a40` session-list titles; child wording beyond the
  understanding phase; text inside SVG; C26-33 not reproduced; two people in one browser (open sheet).

## Resume after the pause (2026-11-15)
- The WIP snapshot was reviewed hunk by hunk and kept: the `oneQ25` cut is reverted (round-25 contract kept, bank #231 second half
  reported), `regDom26` no longer re-reads text it wrote itself (`__r26`), «استادِ دانشگاه» is not «استاد + name».
- Re-checked C23–C39: C38 (her own words stay as typed) and C39 (no interval number; line and schedule follow one count) were already
  built in; the bank copy equals `T/VARIANTS_R26.json`; bank result unchanged (34 green, #231 half / #257 with reasons).
- Whole suite one at a time found one regression of mine: `plural26` turned an explicit «شما … دارید» into a group address when she
  had written «داریم» (R21 bank #152) — fixed with its look-alike. `test_tour1_r25_prior` A25-10 now accepts «برهانتان را خودتان»
  (one register, D26-40). `test_polya_fix5` M3 fails on 2026-11-15 only because its typed «۲۵ آبان» is tomorrow (calendar collision in
  an old test that hard-codes a date; not this branch).
