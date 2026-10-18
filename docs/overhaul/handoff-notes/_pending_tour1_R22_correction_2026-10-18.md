# Tour 1 (Pólya), round 22: fixer «correction» (P3) — handoff (2026-10-18)

Scope: P3 of `DECISIONS_R22.md` («موتورِ اصلاح، باقی‌مانده»). Files: `apps/learning-architecture/src/app/a38_live.js` (retract and copies),
`a27_tour.js` (retract side only: `retractCheck`, `retractApply`, `retractXs22`, `corrAsk20`, `corrCands`/`dlIds22`, the retract prompt lines, `liveRes20`),
`a40_dossier.js` (retract events, bubble mark). Test: `apps/learning-architecture/tests/test_tour1_r22_correction.js` (+ `tour1_r22_correction_bank.js`),
bank copy `apps/learning-architecture/tests/variants/VARIANTS_R22.json`. Docs: WORKLOG (91), PROGRESS 106, HANDBOOK §2 bullet + §10 row + §12 row 53,
AUDIT_LOG, REMOVAL_CANDIDATES, experience update.

## Contract 1 — `retract.rests` (basis of each judgement), for the coach/turn-question fixers

- The model may add `"rests": ["verdict"|"solved"|"guess"|"guess:gN"|"suff"]` to `coach_state.retract` (also in the system rule line and the «شاید اصلاح» block).
  `[]` means none of them rests on the corrected datum.
- The page checks it (`APP.liveRestsOf`, `setAsideDeps` in a38): anything named in `rests` is set aside. Anything not named stays, unless its own written
  evidence names the old value: `chkHow`/`chkRes`/`chkMsgs` for the verdict, `L.chat.solution` for «حل شد», the guess test plus guess steps for the guess.
  Without `rests`, the round-21 `uses` rule applies unchanged.
- `key: "deadline:…"` sets nothing aside. The sufficiency judgement is reset only when a declared datum changed (`u1.dl`, `u1.c`, `prac.measure`), or when the problem
  has no declared data.
- **Turn-question fixer (P4):** a re-check question only when `res.changed` holds a verdict/«حل شد»/guess item (rec «حکمِ وارسی…»، ««حل شد»»، «سرانجامِ حدس»).

## Contract 2 — one application per correction

- On a ✏️ turn, `APP.liveRetract` returns `{ok:true, changed:[], ask:[], edit:true}` when the page's `retractMsg` already handled that message
  (`se.retracts` entry by the user). `AS.liveRes20` drops that note. The coach's result takes the page changes from `se.retracts` (the R3+ merge).
- **Anyone calling `liveRetract` with a bare fragment:** pass `by` (the id of the correcting message), so this guard can see the ✏️ turn.

## Contract 3 — copies by meaning

- `APP.liveNumCopy(text, D, oldClause)` gives the copy with the new value. It matches value plus unit family, converting units (mm/cm/m/km, m², m³/litre,
  g/kg, min/hr, پیمانه). It also matches number words. Without a unit, it needs a shared neighbour (a number, or a majority of the words). A lone digit never matches.
- New units: `g`, `cup` (پیمانه/پیمونه) and `m` (a bare «متر»). `APP.liveUnitCanon` now maps them too.
- New copy candidates: auxiliary problem `aux:<i>` (`t`) and its bridge `auxb:<i>`.
- `APP.liveAskPart(q)` gives the changed part of an ask. Ask lines now show that part plus the full new text.
- `APP.liveAskCopy(sid, pid, {path,label,old,new}, ctx)` asks about any page field. The coach uses it for a lesson whose in-place rewrite would garble.
  A «بله» on `b.use` updates `so.lessons` and the review card.
- `APP.liveSameVal(frag, fix)`: a "correction" that keeps the same value by meaning («۷۴ کیلو» = «۷۴ کیلوئه») is refused.

## Contract 4 — results the model receives

- `APP.liveCopyAnswer` (on «بله» or «نه») pushes a `{copy:true}` entry to `se.retracts` and patches `se.coach.retNote.res`: it adds `changed`, removes the
  answered `ask`, and sets `shown = ""`, so the next turn's «# اصلاحی که صفحه انجام داد» block is current. The dossier skips `copy` entries (the
  «copyans» event already shows them).
- In a session without a live problem, the coach applies session-level records (deadlines, measures, cards) **before** writing its result:
  `APP.liveRetractSessApply(sid, srcId, {frag, fix, old, key, cur})`. The old after-hook (`liveRetractSess`) is now a no-op for the same correction.
- Notes agree with `changed`: a «nothing recorded» note is dropped whenever something changed or was asked. The «کارنامه» item carries old/new.
- `m.corr[].n` counts the changes; the bubble shows «اصلاح شد» only when `n > 0` (otherwise «گفتی … — رکوردی از آن ثبت نشده بود»).

## Contract 5 — which problems a correction reaches

- `APP.livePidsOfSess(sid)` covers the session's own problems plus every live problem with a record whose `src.sess` is this session; the coach uses the same set.
- When the corrected sentence is in an earlier session of a live problem, `retractCheck` returns `srcSess`. `retractXs22` then changes only that session's
  problem records, and the event goes to that problem's dossier.
- Dossier: one event per correction (`APP.dossierDedupRet`). A coach retract event appears only in the dossier of the problem whose `L.retracts` holds it.

## Bank results (VARIANTS_R22, P3.correction_engine, 40 entries)

- 39 pass. 1 not covered (#96: withdrawing mind-card step successes by basis belongs to a29; the contract is `rests`/`uses` above).
- On the base build (e3fcb898), 21 of the 39 checks fail. All 18 runner sentences fail there too.

## P8 items given to this fixer (coordinator, same day)

- #174: invented look-back problems (`b.newProbs`) come back in Today on rung 2 of the ladder (`APP.liveDue().kept`). The Today line opens that problem's dossier,
  where «باز کن» is.
- #179/#187: `a29` skips the «بازنگری — نتیجه سالم ماند» success while the verdict is set aside (`b.superseded` with `chkBy:"superseded"`). It comes back once she re-verifies.
- #180: `a39` decorate retries up to 5 times when the message record is not found yet (after a reload).
- #175/#188, #176/#186, #177/#183, #184 were already right after the P3 work (`dossier.state` guards; title by meaning; ZWNJ kept; `dedupRet22`). They are now covered by tests.
- Bank result: 11/11 pass (4 of them are red on the base build).

## Not done (with reason)

- #96 mind-card step successes by basis: a29 (prereq+route fixer).
- Editing the proposed lesson text inside the ask box before «بله»: §12 row 53.
- A22-30 (s09 «۳۵ تا فروختم» dropped from `src.parts`): the bank twin #79 passes after the `partOf` fix. The exact s09 record could not be replayed here.
- `#180` passes on the base build too in this harness: the simulated "reload" triggers a DOM mutation. The retry path is new, but this test cannot show that it was red before.
