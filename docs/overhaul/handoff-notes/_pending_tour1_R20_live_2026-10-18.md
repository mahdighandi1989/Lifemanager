# Tour 1 (Pólya), round 20: live + dossier fixer handoff (2026-10-18)

Scope: the live + dossier part of `DECISIONS_R20.md`: RO1/RO2 (page side), RO5 (editor + one engine), RO6, MT1 (open on request, chat_invent gate), RO9 (A15, A17, D·14).
Files: `apps/learning-architecture/src/app/a38_live.js`, `a40_dossier.js`, `a39_math.js` (A15 + D·14 only), `style.css` (editor), the new test
`tests/test_tour1_r20_live.js` with a byte copy of the bank at `tests/variants/VARIANTS_R20.json`, docs (WORKLOG (81), PROGRESS 97, HANDBOOK §2 bullet + §10 row,
REMOVAL_CANDIDATES), rebuilt bundle. a26, a27, a29, a41, a42 and the backend were not edited (a26 is only reached through its existing `AS.msgTools` / `AS.sessTools` hooks).

## Contract 1: source stamp (`src`)

Every record written from chat now carries
`src = { sess, mid, msg, span, key, at, val }` — `mid` and `msg` are the same message id (`APP.liveMsgId` = `AS.msgId`), `span` is the sentence/clause of HER
message the record came from, `key` names the fact (`stmt`, `unknown`, `cond`, `datum:<id>`, `guess:g1`, `plan`, `step:<n>`, `lesson`, `check`, `ans`, `deadline`, `card`),
`val` is the value at write time (an edit by her after that sets `src.edited = true`, and a correction then only asks).

- Make one: `APP.liveSrc(sessId, msgRef|null, key, value)`. With `msgRef = null` it uses the message the current assistant turn answers (or the best-overlap message).
- `APP.liveSrcSpan(text, value)` gives the clause alone.
- A record with `srcSet: true` and no `src` means "source unknown": the dossier says «منبع: نامعلوم» and nothing attributes it to the closing message.
- Stamped automatically by the page (no coach work needed): problems made by `live_new` / `chat_invent`; everything `chat_solved` writes (statement, understanding
  form one/u, `L.chat`, look-back `use`/`glance`/`chkHow` and the lesson card); deadlines and cards created in an assistant turn (wrapper on `AS.run`); understanding
  draft fields the assistant fills (`L.uDraft.src[k]`, with span); a statement filled into `lpNewS` by the assistant (`s.fills` → `r.src`, `edited` if she changed it).
- **Coach (a27):** for records you keep in your own stores (`s.plans`, `coach.guesses`, `promises`, `coachEv`), please use the same shape so a correction can match by span:
  `q.src = APP.liveSrc(s.id, msgId, "plan:" + q.id, q.text)` (today `q.src` is the bare message id; the dossier accepts both).

## Contract 2: retract result

Both paths (✏️ `APP.retractMsg(sess, msg, newText, {by:"user", keepText:true})` and chat `APP.liveRetractChat(sess, rt, curText)` / per problem
`APP.liveRetract(pid, msgId, {frag, fix, what, key, old, by, sess})`) run the same engine (`retractOne` + `retractSess`) and return:

```
{ ok, changed: [{kind, label, old, new, pid?}], ask: [{id, pid, path, label, old, new, state:"open"}], note, text?, frag, fix, mid, dup }
```

- A record changes only if its `src.span` contains the corrected fragment (fuzzy: digits in any script, ی/ک, ZWNJ, kasra) **or** its `src.key` matches the reported
  `key` (`rt.key` / `opts.key`, e.g. `datum:rate`). Records of the same message whose span does not contain the fragment are untouched.
- A check verdict is superseded only if a datum it used changed (answer, statement, understanding data) or the check clause itself was corrected.
- `kind` values: `guess, step, stepPlan, plan, ans, verdict, u, draft, stmt, lesson, card, deadline`. Labels and old/new are Persian (dates via `A.fdate`, times in Persian
  digits) — never ISO, never raw ids.
- `ask`: page-typed copies of the same fact (`sameFact`: the words around the old value are in the corrected clause; «۱۸» is not «۸»). They are **not** changed.
  They wait in `se.copyAsk` until she answers in the assistant panel (`APP.liveCopyAnswer(sess, askId, yes)`); "no" is never asked again. Open asks are shown to the
  model on every turn as context («… هنوز جواب نداده؛ نگو عوض شد»).
- `note` / `text` say only what changed, then the ask line. An empty `changed` says «از آن پیام چیزی در صفحه ثبت نشده بود» — **coach: do not claim a change then (RO3)**.
- ✏️: `frag`/`fix` are exact substrings of the old/new text (punctuation and parentheses kept), so `AS.retractApply` can find them with `hasFrag`.
- Session-level records (deadlines/reminders and cards) follow too. When the session has no live problem, the page applies them after `AS.DO.coach_state` with a
  `retract` (wrapper; repeated application is a no-op), via `APP.liveRetractSess(sess, rt, curText)`.
- The page now also accepts «X نه Y» (Y in the earlier fragment) and «تصحیح می‌کنم» as the self-correction signal; a message ending in «؟» never is.

## Contract 3: event log for the dossier (`APP.EVLOG`)

```
APP.EVLOG.add({ pid | sess, k, at, title, lines:[...], out, src, sign:[{row, sign}], by, id })   // at = when the act HAPPENED (ISO), not save time
APP.EVLOG.of({ pid } | { sess })
```

- Stored on the problem (`eprog_<pid>.solve.live.evlog`) or on the session (`achat.evlog`); same `id` again replaces (no duplicate on re-save / page load).
- The dossier (`APP.dossier(pid)`, or `APP.dossier(sessId)` / `APP.dossierSess(sessId)` for a session without a live problem) merges: its own record-derived events,
  the session's chat plans (`s.plans`, with `corr` history and `done/state/doneAt`), corrections (`se.retracts`, `s.coach.retracts`, de-duplicated by mid+frag+fix), open
  and answered copy asks, set-aside/return, mid-course check-ins, waking a dormant problem, a41's practice sessions (a41 wraps `A.dossier`), and every `EVLOG` event.
  Order = event time; ties follow the solving order (statement → understanding → guess → plan → step → outcome → answer → verdict → «حل شد» → look-back).
- **Coach:** please write corrections you apply in your own stores, chat-closed work and Today answers with `EVLOG.add` (`k: "retract" | "act" | "today"`), signs as
  `{row: <mind row fa>, sign: "+"|"−"}`. **Practice:** sessions dated with `A.now`; `EVLOG.add({pid, k:"practice", at, title, lines, sign})` for anything not on a case.
- Status and stages come from one source (`A.livePhase`); the current stage is «در جریان». Step signs are read from `A.MIND.phases({pid})` act `lstep:<pid>:<stepId>`.

## Other changes worth knowing

- `live_new` on her request opens the problem at the end of that turn's actions, also from another problem's page (s29); «فعلاً نه / فقط ببینم» ⇒ only the «باز کن» line.
  `chat_invent` inside an assistant turn needs her request (`APP.liveReqSignals(text)` → `{req, now, notNow}`); otherwise it returns «ثبت نشد: … فقط پیشنهاد بده».
  «همین الان روش کار کنیم» turns it into an opened `live_new`. Short statements, duplicates and calls outside a turn keep the old behaviour.
- `L.plan` re-saved with the same text keeps its `at`, `src`, `fixHist`, `due`.
- `APP.liveAnaQ(q)`: a question whose object is a pronoun clitic («ردش کند») stays with the question before it in «کدام پرسش کمک کرد؟».
- a39: «(۳۵۲)» alone after a space ends a formula run; the add-point form is hidden until its own «➕» is pressed.

## Not done (with reason)

- C20-14 (⏱ badge over «↩ برگرد») — the badge is created and placed by a42 (`#llaClockFlag`); left to the practice+sched fixer.
- RO1 #9 (two guesses in one message), re-booking the corrected act and withdrawing/rebooking mind events, the «(شاید)» block, ✏️ evidence booking, register — coach (a27/a29).
- RO1 #12 (moving the plotted point on a chat correction) — the plot is drawn from her bubble text, which a chat correction does not edit; open.
- RO2 #9 (practice case topic), #10 (🌱 habit reminder), RO6 #5 (practice dates) — a41/a42.
- RO2 #6 recompute of the contradiction flag after «بله» — the page has no stored contradiction flag to recompute; not covered.

## Older expectations replaced (marked «دورِ ۲۰» in the tests)
`test_tour1_r10_coach` (open from another problem's page on her request); `test_tour1_r2_assist`, `r3_coach`, `r4_coach`, `r5_coach`, `r13`, `r16_coach`, `r17_coach` and
`test_tour1_integration` (the user turn now asks «ثبتش کن» before a chat_invent that creates a new problem); `test_tour1_r18_coach` (the «# صفحهٔ فعلی» block now holds her own
problem title — her data, not a developer note);
`test_tour1_r19b_live` (current stage «در جریان»; mind row name «اجرای طرح»), `test_tour1_r19_math` («(۳۵۲)» outside the formula).
