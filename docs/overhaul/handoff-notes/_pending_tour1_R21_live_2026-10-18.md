# Tour 1 (Pólya), round 21: live + dossier fixer handoff (2026-10-18)

Scope: the live + dossier part of `DECISIONS_R21.md` and its ADDENDUM: R3 page side (a, b, c, d, e, f ✏️, h bubble/plot), R4, R6 page side,
R9, plus A21-2 (turn question after a step outcome), A21-3/4/6/7/14/19 and A21-21 (test infra).
Files: `apps/learning-architecture/src/app/a38_live.js`, `a40_dossier.js`, `a33_dates.js` (deadline refusal line only), `a39_math.js` (plot from
records only), `a1_base.js` (one line: dev-clock visibility), new test `tests/test_tour1_r21_live.js` with a byte copy of the bank at
`tests/variants/VARIANTS_R21.json`, `tests/test_graph.js` (`mlog` listed as non-graph), `tests/test_tour1_r20_live.js` (MT1 #17 expectation,
marked «دورِ ۲۱»), docs (WORKLOG (86), PROGRESS 101, HANDBOOK §2 bullet + §10 row, AUDIT_LOG). a26, a27, a29, a41, a42 and the backend were
not edited (a26/a27 are reached only through their existing hooks: `AS.replyCheck`, `AS.replyFix`, `AS.prompt`, `AS.run`, `AS.DO.*`).

## Contract 1: one result structure (R3a) — for the route+coach fixer

Every page retract path returns the same object (`APP.liveRetractShape` builds it):

```
{ ok, changed: [{ rec, old, new, why, kind, label, pid? }], ask: [{ field, label, old, new, id, pid, path }], note: "", parts?: [{frag, fix}] }
```

- `APP.liveRetract(pid, msgId, o)` (also `.changes`/`.text` kept for the old reader), `APP.liveRetractSess(sid, rt, cur)`,
  `APP.liveRetractChat(sid, rt, cur)`, `APP.retractMsg(...)`.
- No change ⇒ `note` = «از آن تکه رکوردی ساخته نشده بود — چیزی در صفحه ثبت نشده بود که عوض شود.» (starts with «از»). Refusal ⇒ `ok:false`,
  `note` = «ثبت نشد: …», logged in `se.retracts` with `refused: true`. Missing value («اون ۳۰ رو اشتباه زدم») ⇒ `ok:false`,
  `ask: [{field: "value", label: "مقدارِ درست", old, new: ""}]`.
- **Coach, please:** read `lr.changed / lr.ask / lr.note` (not `pending`, and do not drop a note because it starts with «چیزی»/«از»); give the model
  the note verbatim; a no-op or refusal is one plain line for her. The old `lr.text` still starts with «چیزی…» for a no-op so the R20 reader
  does not claim a change.
- A chat correction pushes `m.corr` on the source bubble (the ✏️ mark), one entry per fragment.

## Contract 2: sources, same fact, field keys (R3b/R3c)

- `src.parts = [{mid, sess, span, at, vc}]` when a value came from several of her messages (`APP.liveSrcMulti(sid, value, key)`); `src.mid` is
  the message with the most overlap. A correction changes only the clause of the value (`vc`) that came from the corrected message.
- The model may name a page field: `retract.key = "field:<id>"` — ids: `lpOne`, `lpUnk`, `lpCond`, `lpD_<dataId>`, `lpPrVague|lpPrLine|lpPrApprox|lpPrPrior|lpPrMeasure`,
  `lpPlan`, `lpStep`, `lpOWhat`, or the candidate path (`dl:d1`, `u.c`, `prac.measure`, `out:<stepId>`, `will:<id>`, `willck:<id>:<n>`, `b.use`…).
  **Coach: please add `deadline` and `field:<id>` to the key list in the retract prompt line (a27 ~3046).**
- Candidate labels are her field names; `ask[].field` is the candidate path. Placeholders («مثلاً «…»») and unsaved drafts are never candidates.
  **Coach:** the `s.fills` pending lines in a27 still use `f.label`/sig — a stale `lpNewS` draft should not be offered (C21-5).

## Contract 3: dependencies (R3d)

`APP.liveStampUses(pid)` stamps `b.uses`, `L.solvedUses`, `g.uses` (the data each rested on). `APP.liveSetAsideDeps(pid, D, {at, mid, by})` sets
aside what used the changed datum (verdict ⇒ `superseded`, «حل شد» ⇒ `L.state = "open"` + `L.reopened`, guess outcome ⇒ `g.outSup` / `out.guessSup`,
sufficiency judgement ⇒ «هنوز نمی‌دانم»). Called by the retract engine and by `APP.liveCopyAnswer(..., yes)` (returns `changed` too).
**Coach:** chat guesses in `coach.guesses` are still the coach's — please set them aside the same way when their test used the datum.

## Contract 4: R6 page side

- `APP.liveInventGate(action, sid)` ⇒ `{k: raw | live | keepback | refuse}`. `live` on «ثبتش کن» about the problem she is on; `keepback` ⇒ the
  look-back's `b.newProbs` (promote only by her choice: `APP.livePromoteNew(pid, id)`); `refuse` ⇒ she sees one plain line.
- `AS.replyCheck` is wrapped: when the reply claims a refused `chat_invent`/`deadline`, ONE rewrite is requested with the model-directed note.
  `AS.deadlineRefusal(a)` (a33) is the one deadline validity check.
- `AS.replyFix` is wrapped: a reread id the model said it did not receive is dropped and she gets a plain line; the next prompt says so.

## Contract 5: measures (R9) and dossier (R4)

- Her own measures become records: `m.pts` on the message (a39 plots from it) and `mlog` per session (`APP.liveMeasLog(sid)`); corrections change
  them. Booked on `AS.prompt` of her turn (`APP.liveMeasBook(sid, msgRef)` for tests).
- `APP.dossierSess(sid)` now carries `lives` (title + link) and reads `coach.guesses`, `coach.retracts` (all, including `err`), `se.prcs` /
  practice sessions with `chat.sess`, and `fcast` of those cases.

## Bank results (VARIANTS_R21, this fixer's mechanisms)

R3 35/35 (3 not covered: #77 re-book/«از کجا؟», #91 reply claim, #92 spelling — coach), R4 13/13 (4 not covered: #98/#105 practice — the T24 row
= 🎯 record is a41; #102 practice report vs chat problem — a27; #108 mind card — a29), R6 7/7 (10 not covered: closure fallback, step alias,
quote matching, mind stage, C21-15 — coach), R9 16/16. Base build: 49 bank entries and 17/17 runner quotes red.

## Not done (with reason)

- A21-5 (coach-side replacement garbles), A21-15/20/22, R7, R8 except A21-2 — a27/a29 (route+coach fixer).
- Moving the coach's `s.plans` / `coach.guesses` with the new fragments is the coach engine's (a40 now sends one `AS.retractApply` per fragment).
