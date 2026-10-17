# Tour 1 (Pólya), round 19b: live fixer handoff (2026-10-17)

Scope: the page side of `DECISIONS_R19b.md`, meaning INF15 (correcting an earlier message: reversal API, ✏️ on her own bubbles) and INF16 (dossier). Base:
b889b855 on branch `claude/life-program-flow-diagram-q37jvr`, merged up to the integration head before the final commit.

Files changed:
- `apps/learning-architecture/src/app/a38_live.js`: the reversal engine, source tags on records, and history markers in the saved views.
- `apps/learning-architecture/src/app/a26_assist.js`: two hooks only, `AS.msgTools(s, m)` inside each bubble and `AS.sessTools(s)` under the pin line.
- New `apps/learning-architecture/src/app/a40_dossier.js`, added to the module list in `build.py`.
- New `tests/test_tour1_r19b_live.js`, with a byte copy of the bank at `tests/variants/VARIANTS_R19b.json`.
- Docs: WORKLOG (76), PROGRESS row 92, a HANDBOOK section in the «🔭» chapter, and a §10 decision row.

a27 and a29 were not touched. Nothing was removed, so there is no REMOVAL_CANDIDATES entry.

**Docs numbering:** WORKLOG (76) and PROGRESS 92 assume the coach's (75) and 91 land first. Until then, `build.py`'s documentation gate reports a gap on
this branch alone. Merge the coach's branch first; the gap then closes without edits.

## Contract for the coach builder (a27/a29)

**Message id.** `APP.liveMsgId(m)` returns `m.id` if it is set, otherwise `"m@" + m.at`. It is stable as long as `m.at` does not change. An edit through ✏️
keeps `m.at` and moves the old text into `m.textHist`.

**Source tags.** Any record you write from a chat message should carry `src: { sess, mid }`. Records written today without it:

| Record | Written by | How the page finds its source now |
|---|---|---|
| `so.g[1]` | `guessToProblem` and `a27 ~2324` | Falls back to `from:"chat"` + `sess` + `at` (the last user message at or before `at`) |
| `L.chat` | `a27 ~2270` | Falls back the same way; please add `mid` |
| `so.u[1]` | written with `from:"chat"` | Falls back the same way; please add `mid` |
| `b[1].chkMsgs` | | Matched by message text |

Adding `src` makes the match exact.

**Checking and reversing a model report.** For `coach_state.retract {msg, what, fix}`, call `APP.liveRetractChat(sess.id, rt, curUserText)`.
- It returns `{ok, changed:[{kind,label,old,new,pid}], note, dup}` or `{ok:false, err}`.
- It checks that:
  - the fragment is in an EARLIER user message of this session (a system turn or a «[اصلاحِ پیامِ قبلی]» turn never counts);
  - the fix is in the current message;
  - the current message has a first-person correction signal (`APP.liveSelfCorr`);
  - the fix is not the same value.
- `err` is written for the assistant. When the fix is missing, it says to ask for the correct value.

**Single entry for any path.** `APP.retractMsg(sessId, msgRef, newText|null, {frag, fix, what, by, corr})`.
- `msgRef` can be the message object, its id, a 1-based user index, or a text fragment.
- With `newText` it takes the ✏️ path: the bubble text changes and the diff is computed from the two texts.

**Per-problem call.** `APP.liveRetract(pid, msgRef, {what, fix, frag, sess})`.

**Hooks.** `APP.onRetract(cb)` returns an unsubscribe function.
- `cb(ev)` runs once per reversal, after the page has reversed its own records. This applies to both ✏️ and model reports.
- `ev = {sess, mid, msg, frag, fix, what, by:"user"|"model", newText, diff:{o,n}, changed, pids}`.
- Reverse your own stores in the callback: `coach.guess`, said/ans evidence, plans, promises, and the mind-card events of that message (`withdrawn`, never counted as
  a failure; the self-correction is look-back evidence).
- Return strings or `{kind,label,old,new}` objects. They are appended to `changed` and appear in the assistant's next-turn context.
- For weekday shifts use `APP.retractShiftDate(iso, oldTok, newTok)`. It works on the Persian week, and «… بعد» or a past date means next week.
  Example: bank #11, Fri 2026-10-23 with «شنبه‌ی بعد» gives 2026-10-24.
- `APP.liveFixVal(value, diff)` applies the same text replacement the page uses, so a coach store follows the same rule.

**Asking instead of reversing.** When the reply has no `coach_state.retract`, `APP.liveRetractCands(sessId)` lists `{pid, mid, kind, label, value, msg}` for an
ask-only «کدام را اصلاح کنم؟». The page never reverses on a pattern alone.

**The ✏️ turn.** After a ✏️ save, a user turn «[اصلاحِ پیامِ قبلی] «old» ⇐ «new» — متنِ درستِ پیامم: «…»» is sent. The reversal has already been applied when
it is sent. a27 should treat this turn like a system turn:
- no new guess, plan or step from it;
- no second retract. A second `retractMsg` with the same diff is a no-op (`dup`) anyway.

**Assistant context.** A prompt hook adds «# اصلاحِ پیامِ قبلی — صفحه همین حالا انجام داد» on the next turn. It lists what changed, or says «هیچ رکوردی ساخته
نشده بود — نگو چیزی را عوض کردی».

**Dossier links for INF17.** `APP.dossierLink(pid, label)` returns a button that opens `dossier/pid`. `APP.dossier(pid).events[]` has
`{k, at, title, lines, out, hist, src, mind:[{row, sign, withdrawn}]}`.
- If a29 exposes per-act contributions, for example on `A.MIND.model().events` with `pid` or `src.id` and `withdrawn`, the dossier already shows events with
  `e.pid === pid` or `e.src.id === pid` and greys withdrawn ones.
- Until then, the timeline match is the problem title in «…».

## What the page reverses (records derived from the message)

The `what` filter (guess / step / plan / ans / fact / said / form) is tried first, then everything else derived from the same message.

- Guess `g[1]` (and the draft guess).
- Step outcome `st.out` and `chatRep`, by re-reading the correction:
  - «هنوز … نه» reopens the step, and the old outcome becomes «پس گرفته شد»;
  - «فقط شروع» makes it part;
  - «جواب نداد» makes it a non-match.
  
  The forecast outcome is reverted as well.
- Step text and due date for steps with `st.src`. A weekday change moves the due date and the reminder.
- `L.plan` text, `t2` and due.
- `u[1]` one, u, c, `dl[]` items and `nota`.
- `uDraft` fields filled by the assistant in that turn (tagged at save time through `APP.liveTurnSrc()`).
- `L.chat.solution`. A check verdict that rested on it becomes `unverified` with `superseded` and `verdictHist`.
- `r.p.statement` when the problem was created from that message.

History lives in `fixHist` on each record, with `{at, field, old, new, why:"اصلاح شد ⇐ «…»", src, sess, by, d}`. The log is in `L.retracts` and `se.retracts`.

## Judgement calls

1. **Bank entries owned by the coach.**
   - Some INF15 entries expect things the page does not own: `coach.guess`, promise or plan dates in the chat (#2, #9, #11), the one-line assistant
     sentence, and the mind-card withdrawal of the guess event (#0, #28).
   - The test checks them up to the page boundary. It checks page records where they exist, the `onRetract` event with the right `frag/fix/what`,
     `retractShiftDate`, and the prompt hook.
   - The coach side has to complete them.
2. **Negative chat entries without a report.** These are #15–#22, #24, #26 and #27. They are tested as "the most plausible wrong model report is refused by the
   page, and nothing changes".
   - Single-message entries fail because the fragment is not in an earlier message.
   - #19, #20 and #27 fail because the fix equals the old value, or because there is no self-correction signal (#17).
   - #25 checks that there is no reversal without `coach_state` and that `liveRetractCands` lists the guess and the plan.
3. **Dossier #53 ("withdrawn mind-card event shown as withdrawn").** The page shows a withdrawn step outcome and its «اجرا» chip as withdrawn. A withdrawn
   guess event needs a29's event flag.
4. **Dossier #60 (tour/test data).** The page excludes records flagged `sample`, `test`, `seed`, `tourTest` or `runner`. Tour runners should set one of these on
   seeded records.
5. **Last activity in the index.** It is the maximum of `updated` on the record and its progress record, and `created`.

## Not done
- **Forms filled through assistant actions on views other than the «🔭» understanding card** are not tagged. Examples are idea, knot and case forms. INF15 covers
  live-problem records.
- **The bank's "assistant answers in شما" (#8)** is the coach's register.
