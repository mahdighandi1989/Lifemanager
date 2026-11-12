# Tour 1 round 26 — fixer «story» (Q3 + Q6, C21) — handoff note (2026-11-12)

For the other round-26 fixers and the coordinator. Page: `/apps/learning-architecture`. Numbering used on this branch: WORKLOG 130 / PROGRESS 127
(the handbook gate refuses gaps) — renumber to **132 / 129** at merge, as FIX26 assigns.

## Functions changed (keep your edits out of these, or re-run `tests/test_tour1_r26_story*.js`)

| File | Function / block | What it now guarantees |
|---|---|---|
| `a45_story.js` | `NEWPROB25`, `newProbAt`, the first prompt hook (`AS.promptHooks.unshift`), `splitNote`, `ST.keepSplit` | a new problem is introduced with words between («… هم از همون دوره دارم»), by ordinal («یه مسئلهٔ سوم هم دارم/هست», «و یه سومی: …») and also from a chat problem; block «# دو/چند مسئله در این گفت‌وگو» lists every problem and the focus of the turn |
| `a45_story.js` | new: `probs26`, `focus26`, `frames26`, `named26`, `named26FromList`, `hit26`, `focusTo26`, `backdate26`, `snap26`, `lived26`, `sameProb26`, `ST.namedClosed`, trailing prompt hook (pk renumber) | C21: naming binds the turn or the page asks (`C.ask26`); `C.probs26[pk]` keeps every chat problem; `C.focus26`, `C.focusLog26` |
| `a45_story.js` | `onState` (ask hold; in-message boundary `B26`; `X25.pre`), `importChat` (`chatImp.bmid/boff`), new `stmtOff26`, `bornFrom26`, `movedTo26`, wrappers of `AS.DO.chat_invent` / `AS.DO.live_new` (`C.moved26`) | a problem born or recognised from a sentence in the middle of her message owns everything from that sentence on |
| `a45_story.js` | new `ST.planOwner`; new `ST.probGroups`, `ST.probAt`, `ST.probOf` | one owner per «برنامهٔ خودت»; the session dossier counts problems |
| `a45_story.js` | `ansUnk` (`CLS26`), `ST.subRes(…, hard)`, `ST.finOf`, new `ST.wholeRes`; the `res` item in `onState` | one judgement of «whole answer» for the story ledger AND the chat stage |
| `a45_story.js` | `dataOf` (question sentences, «داده‌هام اینه:»), `UNKMARK24`, `NOTUNK24`, `qSentence`, new `METHODQ26`, `goalSentence26`, `ST.dest` (chat branch) | question sentences are not data; the destination is her goal, never a method question |
| `a45_story.js` | `priorClosed` neighbour `priorReview26`, the ledger caption in `paintPrior` | «بسته شد» only from the page's closure |
| `a45_story.js` | new prompt hook «# کدام پیش‌بینی؟»; wrappers of `A.PR.fcMatch`, `A.PR.fcNarrow`, `A.PR.predFor` | two open forecasts and an outcome that names neither ⇒ ask; her stated confidence names the forecast |
| `a27_tour.js` | `coachPhase0` (two lines: `afterClose23` guard with `ST.namedClosed`; `C.prev.noPh` when the session's problem is closed and no new statement was adopted); `AS.DO.coach_state` phase line (`sub25` now also `!ST.wholeRes`) | stage follows the one judgement; a closed problem suggests no stage card |
| `a40_dossier.js` | `addSessEvents` (plan owner line), `rev26`, both `state` computations, `A.dossierSess` (problem groups) | plan in one dossier; «وضع: در بازنگری»; «مسئلهٔ n از m» counts problems |
| `a44_route.js` | `A.ROUTE.model`: `rev26`, `solvedNow`, `atBack24`, `nowFa` | 🧭 says «بازنگری — هنوز بسته نشده» until the page's own closure |
| `a41_practice.js` | `t24Judge`: ONE added line (`if (pc != null) open = open.filter(…)`) | an open forecast whose confidence differs from the one she just stated is not a candidate |

## Contracts the other fixers must respect

1. **Which problem a turn is about** = `A.STORY.focus26(session)` (a live pid, or a chat pk `c:N`). Do not read `session.lprob` alone when you
   attribute a record of the current turn: after «برگردیم به مسئلهٔ …» the session IS re-bound before any block is built (first prompt hook),
   and the binding is stamped at her message time (`backdate26`), so `pidAt(session, message.at)` already answers the named problem.
2. **A closed problem can be the focus** (`A.STORY.namedClosed(session)` returns its pid). `AS.boundLive(s)` then returns `{done:true}`; the
   story key of that turn is a fresh chat pk with an empty statement — attribute session-level events by time (`A.STORY.owns`), not by pk.
3. **While `session.coach.ask26.open` for the current message, record nothing from that message** (the page asked «کدام مسئله؟»). `onState`
   already returns early; a41 guess/plan/prediction recorders are NOT gated by it — «today»/«prior»: if your recorder runs on that turn,
   check `C.ask26 && C.ask26.open && C.ask26.key === nz(text).slice(0,80)`.
4. **Plan ownership**: use `A.STORY.planOwner(session, plan, msgRef)`; never show a plan in a problem's 📜/🧭 because `planPid` is empty.
5. **Whole answer**: use `A.STORY.wholeRes(session, pid, userText, coachStateAction)`; do not add a second rule for «نتیجه ⇒ بازنگری».
   It asks `A.STORY.arithChk` (a46) for a `c.ok === false` item — «arith»: keep `ok === false` meaning «the page reads it wrong»; an item the
   reader cannot judge must not carry `ok:false`.
6. **«حل شد»**: on any surface read `A.liveClosure(pid).state` (`solved` | `review` | …), not `L.state === "solved"`.
7. **«today» (a41)**: `t24Judge` has one new line; `A.PR.fcMatch/fcNarrow/predFor` are wrapped in a45 (originals in
   `A.STORY.R26_QUARANTINE`). If you rewrite those, keep the rule «a stated confidence that differs from the forecast's own excludes it».
   Not done here and yours (Q8): an outcome sentence without the word «پیش‌بینی» (bank #78, #92) and the verdict sentence booked as a third
   forecast (second half of B26·D32).
8. **«correction» (a38/a40)**: with several problems in one session a chat correction that changed no record is hidden from every problem's
   📜 (`addSessEvents`: `!rp.length && !chatScope`) — after a return by naming it should show in the named problem (`own23(fragAt)`); left to you.
9. **«classify»**: `C.probs26` snapshots only statements that `AS.notProblem` accepts; a greeting kept as `C.stmt` (bp3) is merged into the
   real problem by `lived26` (no validated work of its own before the cut). If you change what becomes `C.stmt`, re-run section `count`.

## Not done (with reasons) — see the fixer report
C26-40 (not reproduced: replaying s28 p1–p5 on BASE26 shows no «نردبان … تمام شد» line; bank #173 is green on BASE26 too — `a38_live.js` is
untouched by «story»), C26-18 (the three group-C instances were not rebuilt as tests; bank #169 form passes), C25-10 remainder, B24·D15, B24·D18, D25-16, second half of B26·D32 (Q8),
bank #78/#92 (Q8 reading), no real-model run of the new blocks.
