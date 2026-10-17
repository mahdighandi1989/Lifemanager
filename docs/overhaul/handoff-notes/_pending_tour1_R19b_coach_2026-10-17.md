# Tour 1 (Pólya), round 19b: coach handoff (2026-10-17)

Scope (DECISIONS_R19b «Fixers / coach»): INF15 model side (retract, validation, reversal of the coach layer, fallback ask, mind-card withdrawal)
and INF17 (mind card «از کجا؟»). Base: `b889b855`.

Files changed:
- `apps/learning-architecture/src/app/a27_tour.js` (coach), `a29_mind.js` (mind card), rebuilt bundle.
- Tests: new `tests/test_tour1_r19b_coach.js` + byte copy of the independent bank at `tests/variants/VARIANTS_R19b.json`.
- Docs: `apps/learning-architecture/docs/WORKLOG.md` (75), `PROGRESS.md` row 91, a HANDBOOK §10 row.

Not touched: a38, a26 (the live builder's), a39. Nothing quarantined (no function replaced; the pattern-failure line gained two guards).

## Contract with the live side (a38)
- The coach calls `APP.liveRetract(pid, msgId, o)` once per problem bound to the session (bound pid, `s.lprob`, `s.lprobLog`), with
  `o = { what, fix, frag, old, msg: <text of the corrected user message>, n: <1-based user-message index, the same numbering as liveStepReport's msg>, at, sess, by: <msgId of the correcting message> }`.
  A string result (or `{changes:[…]}` / `{text}`) is added to the change list the model and the user see; a result starting «ثبت نشد/چیزی/هیچ» is ignored.
- `msgId` = `APP.ASSIST.msgId(m)`: `m.id` if present, else `"u" + m.seq` (a26 sets `seq` on every user message), else `"t" + m.at`.
  `APP.ASSIST.msgOf(s, id)` returns the message.
- If `liveRetract` is absent at run time, the coach tells the model «رکوردهای مسئلهٔ زنده … راهِ برگرداندن ندارند» (pending), never pretends.
- The mind card treats a live step outcome as withdrawn when `st.out.wd || st.out.retracted || st.out.withdrawn`, and a guess when `g.wd || g.retracted`.
  A corrected step that keeps its act (new value, history in `corr`) is listed once with the new value.
- The page-side ✏️ path can reuse `APP.ASSIST.retractApply(s, {msg, what, fix})` for the coach-layer records (it validates exactly like a model report:
  the current last user message must carry the fix and a correction signal; a «[اصلاحِ پیامِ قبلی] …» turn should therefore include the fix text).
- «📜» links: `A.go("dossier", pid, actRef)` is rendered only when `APP.V.dossier` exists.

## Items
| Item | What changed |
|---|---|
| INF15 doc | `retract {msg, what, fix, old?}` in «# گزارشِ وضع» (`AS.COACH_STATE_X`). |
| INF15 validate | fragment in an EARLIER user message of this session (not the assistant's), correction signal `AS.CORR_RE` in the current message and not someone else's/the assistant's error, fix in the current message, fix ≠ old. Refusals are logged in `s.coach.retracts` with the reason. |
| INF15 reverse | guesses (+ `coach.guess`, ai-message guess note), plans (+ new date from a weekday, follow-up deadline), promises, chat statement / own unknown, `ansLog`/`ownLog`, a «verified» verdict built on that message (→ unverified, `chkSup`), assistant-filled forms (`s.fills`, new log via a wrapper on `AS.DO.fill`), mind-card events (`wd`). Only the wrong part changes. History `corr[{old,new,note:"اصلاح شد ⇐ …"}]`. |
| INF15 source ids | every `coachEv` carries `msg` and `pid`; records created by a coach_state turn get `src`. |
| INF15 mind card | events of the corrected message withdrawn; failures of the correcting message withdrawn; one look-back + («selfcorr») only when something actually changed. |
| INF15 context | sys line «✓ اصلاح شد: …»; next turn «# اصلاحی که صفحه انجام داد» (once; «چیزی عوض نشد» when nothing was stored). |
| INF15 fallback | message with a correction signal ⇒ «# اصلاحِ پیامِ پیشین (شاید)» with candidates; reply without coach_state ⇒ next turn «(پشتیبان، فقط پرسش)» «کدام را اصلاح کنم؟». Never reverses. |
| bank #15/#16 | a lone «اشتباه کردم» (real-world action) is a pending pattern event, not a stage failure. |
| INF17 | stage rows: `X.acts` (id, src, ok, at, fa, pid) — one per counted act; `details.mind-from` in the «از کجا» cell; `APP.MIND.phases({pid})`; abilities: «از کجا؟ — هر بُعد» (`APP.MIND.dimActs`). |

## Bank results (VARIANTS_R19b, coach entries)
- INF15.retract 28/28, INF17.trace 20/20. Base b889b855: INF15 21/28 fail (the seven negatives pass trivially), INF17 no lists at all.
- #74 (one act moving an ability row and a stage row): the card has no step→ability mapping; none invented — the step is listed once in «اجرا».
- #82 (tour/test acts): tested as `sample` records excluded; separate test profiles are outside the page.
- Entries whose final state is the live side's (step outcome, live data field, problem guess g1) are checked as the call to `APP.liveRetract`
  with the right pid/msgId/what/fix; the stub changes nothing.
