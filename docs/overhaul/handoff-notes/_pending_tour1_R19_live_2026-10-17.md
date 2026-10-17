# Tour 1 (Pólya), round 19: live fixer handoff (2026-10-17)

Scope: the a38 part of `DECISIONS_R19.md`: RN2 a, b and c, RN5, INF11, INF13, and the guess-note wording side of RN6c. Base: 4a836e85 on
branch `claude/life-program-flow-diagram-q37jvr`.

Files changed: `apps/learning-architecture/src/app/a38_live.js`, the new test `tests/test_tour1_r19_live.js` with a byte copy of the bank at
`tests/variants/VARIANTS_R19.json`, the docs (WORKLOG (73), PROGRESS row 89, a HANDBOOK §10 row, REMOVAL_CANDIDATES), and the rebuilt bundle.
a26, a27, a29 and a39 were not touched.

## What changed in a38_live.js
- **RN2a (one act, one record).** `A.liveStepReport` now sets `st.out = {done, what, match, from:"chat", msg, pending:true}` at once; `st.chatRep` is
  still written as before.
  - The step stays open until she confirms or edits it in the execution form, or until «✅ حل شد».
  - The execution form appears as soon as a chat report exists, even before the step's due date. It is prefilled and tagged «از گفت‌وگو».
  - If she confirms the report unchanged, `out.from` stays `"chat"` (with `confirmed:true`). If she edits it, `out.from` becomes `"page"` and the chat
    version is kept in `chatPrev`. Either way there is one record.
  - `liveCoach` no longer asks «موعدِ گامِ … رسیده» for a reported step. The prompt carries «نتیجه‌اش را خودش در گفت‌وگو گزارش کرد و ثبت شد» instead
    of «نتیجه را خودش در صفحه ثبت می‌کند».
  - The validation is stricter. A report is refused when her message is conditional («اگه/اگر …»), describes work in progress («دارم … می‌…»), talks
    about another problem («اون مسئله / مسئله‌ی قبلی»), or is only an acknowledgement («باشه»). It is also refused when the model's `what` is not in her
    own words. A wrong refusal only means she is asked at closing time.
- **RN2b.** `gateLine` gives each kind its own wording:
  - aux: «پلِ برگشت …»;
  - intuitive: «گامِ شهودیِ ثابت‌نشده»;
  - real step: «گامِ واقعیِ باز … نتیجه‌اش هنوز گفته نشده».

  A real step appears only at closing time or when this message is about it. Closing time means `L.closing`, the look-back state, or her message
  says «حل شد / تموم شد / تمام شد». The aux caveat appears only at closing time and only when an open aux item exists. The closing-card intro and the
  `liveClosure` "closing" label also name only the kinds that are present.
- **RN2c / INF11.** `uCard` treats a guess with no `conf` or no `test` as `fresh`. The kit therefore stays shown, prefilled with the chat guess and
  marked «از گفت‌وگو». On commit the guess keeps `chatFrom` and its original `at`.
- **RN5.** `qSplit` attaches a verbless question to the question before it. A question starting with «اگر/اگه» counts as complete. The run is cut only
  between two complete questions, and the pieces keep the message order.
- **RN6c (option side).** The note word comes from the session register via `ASSIST.convRegister(se, "", [pid])`, falling back to `se.coach.reg`.
  The default is «تو».
- **INF13.** `mx()` passes the text through `APP.MATH.nodes` in these places:
  - the header title and statement, and «صورتِ خودت»;
  - the understanding summary;
  - the step list (text, proof, prediction and result);
  - the outcome form header and the «گامِ جاری» line.

  The plan field already gets a39's preview through its `lp*` auto-attach.

## For the coach fixer (a27/a29)
- The mind card now sees a chat-reported step at once, through `st.out`. If a27 also books a `coachEv` chat failure for the same message, that is
  RN2e's duplicate. The act's identity is the user message `st.out.msg`.
- RN6c fallback: once `regIn` reads the user's forms, a38's note follows automatically, because it reads `convRegister`.

## Judgement calls
1. RN5.q bank entry «مجهول چیست؟ داده‌ها کدام‌اند؟» with no q expects two options. DECISIONS says to split only around q, so a run without q stays
   one option, as in rounds 14–18. Only "no note" is checked for this entry.
2. RN2.gate entry "aux added but not solved ⇒ no «حل شد ≠»": the page has no record of whether an aux problem was solved, so the caveat is
   conditional («اگر مسئلهٔ کمکی را حل کرده‌ای: …»). It appears only at closing time and only when an aux item is open.
3. RN2.step entry "y=۳ renders as math": a38 passes the text to `APP.MATH.nodes`. Whether «y=۳» is a formula is a39's decision (RN4). The test
   accepts plain text when `APP.MATH.has('y=۳')` is false.

## Quarantined (REMOVAL_CANDIDATES)
`qSplitR18` and `gateLineR18` are reachable through `APP.LIVE_R19_QUARANTINE` and are never called.
