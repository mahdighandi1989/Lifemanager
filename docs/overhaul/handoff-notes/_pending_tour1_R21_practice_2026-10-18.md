# Tour 1 (Pólya), round 21: practice handoff (2026-10-18)

Scope (DECISIONS_R21 «Fixers / practice» + ADDENDUM R5+): R2 (practice from chat), R5 (practice time rules), A21-9/10/11/16/17/18 and «a case the assistant suggests is never آزاد».
Base: `claude/life-program-flow-diagram-q37jvr` (round-21 reports merged). Not touched: a26, a27, a29, a38, a40, a33, backend.

## Files
- `apps/learning-architecture/src/app/a41_practice.js` — main work (stability run, T24 one record, practice_log day/number/judging, practice_rhythm, promptBlock subject + full technique list,
  «🧪» start box, card ownership, recall trend, plan ⇄ 🎯, habit-block filter).
- `a36_solve.js` (one-night 🌱 expiry: `A.willExpire`, `A.willOneNight`), `a42_sched.js` (🎯 `dupOf` via `A.PR.fcDup`), `a3_views.js` (late label on the current P3 line).
- Tests: new `tests/test_tour1_r21_practice.js`; byte copy of the bank `tests/variants/VARIANTS_R21.json`. No old assertion changed.
- Docs: WORKLOG (87), PROGRESS 102, HANDBOOK §4 (practice bullet), §10 row, §12 row 51. Route+coach (85)/100 and live (86)/101 are merged into this branch (da9d10e0); numbering is continuous.

## Contracts for the other fixers
- **route/coach (a26/a27):**
  - `APP.PR.promptBlock(subject, session, msg)` — `msg` is new (third arg; the hook already passes it). With a session «subject» (live pid of the session, `s.coach.stmt`, a technique or
    move named in her words — `APP.PR.namedIn(text)`, the open tech page) it returns the start_practice description + the complete list of 45 techniques, even with no case open;
    with no subject and no case it returns "". Only cases of THIS session's subject (session problem, `c.sess === s.id`, `s.prcs`) are listed right under
    «# پرونده‌های تمرینِ باز» (the coaching signal of `AS.chatTask`); cases merely due elsewhere follow a «- اگر خودش گزارشِ جلسهٔ … را داد» line, so `PRAC_CASE` does not fire
    on them. Without cases the header is «# پرونده‌های تمرینِ باز: هنوز هیچ …» followed by «- پروندهٔ تازه …» (also not a case line; keeps the a27 fallback from adding a second block).
  - `APP.PR.sessSubject(s, msg)` → `{pids, chat, techs, moves, view, back, any}` — `back` = look-back (`s.coach.ph === "b"`, `closedPid`, or a solved session problem). The look-back
    offer line appears once per session per subject (`s.prcOffer`).
  - Routing (R1): an open practice case being worked ⇒ `APP.PR.sessCases(s)` (unchanged); a practice report needs no keyword.
  - New action `practice_rhythm` `{"prc"|tid+pid/topic, "quote"}`; `start_practice` accepts `rhythm: "quote"`. `practice_log` now reads the session day from her words
    (`APP.PR.sessDay(a, text)`; also `a.d` = YYYY-MM-DD), the percent from her message (`APP.PR.pctIn`), refuses future talk («فردا …»), and on a calibration case judges the 🎯
    (result line «🎯 «…» (70٪) ⇐ شد»).
  - `turnMsgs` (consent): a page «sys» line is no longer taken as the previous assistant message.
  - Prompt filter (A21-18): the a27 block «# عادت و برنامه» is dropped from `hookOut` when her message names a technique/move and talks about practice («تمرین/پرونده»). The a27 hook itself is untouched.
- **live/dossier (a38/a40):** practice sessions logged from chat on T24 carry `meas {p, ok, out, fc}`; judged 🎯 carry `judgedBy {kind: "chat"|"plan", sess, quote|id, d}`.
  Case history gains `ev: "rhythm"` (`APP.PR.events` → `kind: "prc:rhythm"`). `APP.PR.cardPid(card)` names the live problem a card belongs to (pb, `tutor:back:<pid>`, `chat:solved:<pid>`,
  `lprob:practical` via `u[n].pracCard`). Assistant-started cases carry `c.sess`.
- **mind (a29, A21-11):** calibration sessions now have measured values `{p, ok}` (readable by `measOf` as kind "cal"). A worksheet session holds only the latest judgement of that day;
  showing all judged 🎯 of a case in one row is a29's (HANDBOOK §12 row 51).

## Behaviour notes
- Stability (steps shape): `cnt` = successes after the last failure; «تثبیت شد» needs `cnt ≥ steps.length`. Late success still earns the longer interval (round 20) but counts once.
  After the technique's steps without stability (late success, or T23's knot criterion) the next gap is the next rung of the page ladder (`A.knextIv`). Any failure (early included) restarts.
- Bank #111 assumed «3 successes at 2→7→14 days»; T41's own rule («چرخه روز ۱، ۳ و ۷» from the last failure) is used ⇒ stable on 2026-11-01; 11-15 is a check-in.
- T24: `PR.wsOfCase` reopens the worksheet that holds the open predictions; a judged row saves the case (due advances). Due fields use `A.willWhen` (one parser).
- `PR.entries` exposes `until` for steps as the last on-time day (late from the next day), so `A.SCHED.dueText` and the case's own «late» agree.
- One-night 🌱 = a 🌱 whose own day is the day it was written; closed with `expired` after its check day.

## Bank VARIANTS_R21 (R2 + R5) — tests/test_tour1_r21_practice.js
R2 #38–#54: 17/17 green. R5 #110–#130: 21/21 green. Runner sequences s29, s23, s31 and A21-9/10/11/16/17/18 + «not آزاد» green. Red on the base build: 29 (9 negatives also pass on base).

## Not done / open
- The mind-card row display (a29) and the session dossier listing of 🎯 judgements (a40) are the other fixers'.
- T32/T33 calibration worksheets are still one-stage (from round 20).
