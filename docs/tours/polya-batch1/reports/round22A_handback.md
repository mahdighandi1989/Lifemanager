## Round 22, group A: 2 of 13 scenarios pass with zero defects

Two scenarios pass: s06 and s08. The other 11 fail. There is one S1 defect, A22-24: the system cannot tell a missing prerequisite apart from a mind knot or low ability. It fails in all three prerequisite scenarios.

**How I ran it**
- **Build:** I checked main at b70c1fe8 and the dist built at 10:23; `build.py --check` was in sync.
- **Harness:** harness7 with Playwright `page.clock`, not the in-page dev clock.
- **Replay:** I replayed the round21A turns with the round-21 answers wherever the prompt blocks were identical. I answered by hand as the literal model wherever round-22 rules applied, including start_practice, rewrite requests and the new trials. coach_state was left out at least once per scenario.
- **Container restart:** after the restart I re-ran s01, s04, s09, s10 and pA1 from scratch on fresh harnesses. Identical turns reused my earlier answers (kept in `prev/`, ids remapped by `tools/prv.py` and `tools/redo.sh`). pA2 and pA3 were run after the restart.
- **Wrap-up:**
  - Every scenario ends with `{"exit":true}`.
  - DONE files and dossiers are written.
  - The mind card, Today and view_pre/post shots are taken.
  - Browser profiles are deleted and no harness processes are left.
  - 13 e-mails were sent («🧭 پولیا · دورِ ۲۲ · …»), each with the group A storyboard link.
- **Disk:** only 349 MB is free.

### Results by scenario
| Scenario | Result | Defects |
|---|---|---|
| s01 | FAIL | S2: A22-1, A22-2. S3: A22-5, A22-6, A21-22 |
| s02 | FAIL | S2: A22-1, A22-7. S3: A22-8, A22-9 |
| s03 | FAIL | S2: A22-1, A22-3, A22-7. S3: A22-20 |
| s04 | FAIL | S2: A22-3. S3: A22-4, A21-7 |
| s05 | FAIL | S2: A22-1, A22-10. S3: A22-4, A22-5, A21-11, A22-11, A22-20 |
| s06 | **PASS** | none |
| s07 | FAIL | S2: A22-10, A22-14, A22-15, A22-17. S3: A22-16, A22-18, A22-28 |
| s08 | **PASS** | none |
| s09 | FAIL | S2: A22-1, A22-30. S3: A22-5, A22-27, A22-28, A22-29 |
| s10 | FAIL | S2: A22-1, A22-3, A22-19. S3: A22-4 |
| pA1 (maths, one prerequisite: factoring a²−b²) | FAIL | S1: A22-24. S2: A22-22, A22-26. S3: A22-12, A22-13, A22-21, A22-23 |
| pA2 (life, one prerequisite: percent of a percent) | FAIL | S1: A22-24. S2: A22-26 |
| pA3 (several prerequisites, nested: triangle area, then Pythagoras, then square root) | FAIL | S1: A22-24. S2: A22-25, A22-26 |

### Defects (all class b unless marked)
**S1**
- **A22-24 – prerequisite treated as a knot or weakness:** nothing in the problem tunnel or the coach checks for a missing prerequisite.
  - The coach rule against naming the theorem, plus the generic stuck ladder (lemma, then auxiliary problem, then lemma again), kept pA1 stuck for 5 turns.
  - The concept was named only by rung 5 of the knot solver's AI hint ladder. It was taught only because the model improvised «(x−1)(x+1) را باز کن». There was no diagnostic question and no mastery check.
  - «🧩 نقشهٔ پیش‌نیازها» was never offered: 0 records in all three scenarios. The view has no link to the live problem, so it is an island.
  - The mind card booked the prerequisite stucks as stage weaknesses and named that stage the likely weakest: planning 65% in pA1, understanding 82% in pA2, planning 81% in pA3.
  - Files: a27 and a38 coach blocks, a32 prerequisite view, a29 stage booking.

**S2**
- **A22-1 – the page's own question triggers a rewrite:** the two-question check fires on the page's own two-sentence turn question asked verbatim. Seen in s02 p5, s05 p7, s01 p6, s09 p4, and in elliptic follow-ups (s03 p2, s10 p4). The rewrite note itself says «همان پرسشِ نوبت».
- **A22-2 – wrong stuck question (regression):** in s01 p9 her «این حساب سرانگشتی کافیه؟» got the set-aside-datum card although she was not stuck. It came again the next turn. a38_live.js:1749.
- **A22-3 – the "next step + prediction" question takes over:** the new successor question («گامِ بعدیِ تو چیست…؟», a38:1697/1780) wins even when she asks to restate (s04; the a27:2005 restate branch never runs), right after she named her step, and on proofs under review (s03 p8, s10).
- **A22-7 – re-check question with nothing to re-check:** after a correction, «با مقدارِ اصلاح‌شده … دوباره وارسی کند» is the turn question even with no result yet (s03 p11, where it displaced the guess-test question), and also in the turn where she reports the re-check (s02, s05). a27:4189.
- **A22-10 – T24 case misses page judgements:** a 🎯 judged on the page creates no case session. In s05 her 90% miss was hidden, so the case reads "underconfident". In s07 the case was "در حالِ تثبیت" with 0 sessions and a past due date. a41.
- **A22-14 – routing still misses s07 p1:** her opening problem message still goes to lla_assistant. s10 p1/p2 are fixed.
- **A22-15 – practice_log ignores the numbers:** a chat log on T24 is refused with "کدام؟" even when she names the prediction («گلدانِ ۲۴ ساعت … ۶۰٪»). Twice in s07. a41.
- **A22-17 – ✏️ edit misses her own form rows:** a ✏️ edit changing several numbers neither changes nor asks about her own understanding-form rows («۴ ساعت ⇒ ۹ سانت»). s07.
- **A22-19 – "nothing changed" after «بله»:** after her «بله» to the copy asks (statement, datum, and proof verdict set aside), the result block still says changed:[] and tells the model to say nothing changed. s10.
- **A22-22 – two turn questions in one prompt:** two unmarked turn-question directives in one prompt (knot-solver teacher frame plus the live block). pA1.
- **A22-25 – nested prerequisites not handled:** none of pA3's prerequisites was detected or ordered, the place in the main problem was not kept, and there was no mastery re-check.
- **A22-26 (gap) – no route map:** «🧭 نقشهٔ مسیرِ مسئله» does not exist. pA3 needed origin → now → destination, with three dotted detours and the return to the line.
- **A22-30 – correction misses a record built from two messages:** in s09 the composed statement's src.parts dropped the «۳۵ تا فروختم» clause, so «۳۵⇒۳۲» left the 🔭 statement unchanged. a38 liveSrcMulti.

**S3**
- **A22-4:** result block contradiction remains: changed plus «رکوردی ساخته نشده بود».
- **A22-5:** a practice request, correction or deadline message becomes the session's «مسئلهٔ گفت‌وگو».
- **A22-6:** the 🔭 page is not re-rendered after a chat start_practice.
- **A22-8:** unit-blind copy value «۱۵۰ سانت متر».
- **A22-9:** no confirmation after «بله»; the stale ask stays.
- **A22-11:** no restore or «حل شد؟» after the re-check says the result still holds.
- **A22-12:** first proof message is put in the look-back stage.
- **A22-13:** the spatial flag is set on a number-theory problem.
- **A22-16:** the inline plot is missing after a reload until the DOM changes (possibly caused by the harness).
- **A22-18:** clipped copy-ask line hides the changed numbers.
- **A22-20:** duplicate ✏️ events in the dossier.
- **A22-21:** stuck ladder cycles back to a general rung.
- **A22-23:** a refused look-back save wipes typed fields.
- **A22-27:** the "whole problem" question is asked again after she stated it in chat.
- **A22-28:** running-list items are not linked to their problem or session; Pareto has no share field; no chat action to add items.
- **A22-29:** «تا تا ۲۰ آذره» garble.
- **A21-7, A21-11, A21-22:** still open.

### Correction trials compared with round 21
| Scenario | Trial | Round 22 |
|---|---|---|
| s03 | 1 turn back, chat, 9⇒10 | ✓ (round 21 ✓); the next-turn re-check question is wrong (A22-7) |
| s03 | 3 back, ✏️ plan day | ✓ (✓); event appears twice in the dossier |
| s03 | 6 back, chat, guess | ✓, no garble (round 21 ✗ A21-5) |
| s03 | non-corrections | ✓ |
| s04 | 3 back, chat, price (colloquial vs written) | copy ask ✓ (round 21 ✗ A21-4) |
| s04 | 1 back, plan, sentence holding two facts | ✓ |
| s04 | 7 back, ✏️ «امسال» | datum asked ✓; condition still not asked (A21-7) |
| s04 | non-corrections | ✓ |
| s05 | 4 back, chat, دو⇒سه | statement ✓, verdict set aside ✓ (round 21 ✗ A21-3) |
| s05 | 1 back, ✏️ plan | ✓ |
| s05 | quote / question non-corrections | ✓ |
| s10 | 4 back, chat, سه‌نفره⇒چهارنفره | copy asks ✓, «بله» sets the verdict aside ✓ (round 21 ✗ A21-6); the model is told "nothing changed" (A22-19) |
| s10 | ✏️ plan | ✓; verdict stays ✓ |
| s10 | quote | ✓ |
| s02 (new) | verdict-dependent datum, different units | verdict, «حل شد» and sufficiency all set aside ✓; re-check asked ✓; copy value garbled (A22-8) |
| s09 (new) | deadline 7 turns back | ✓ moved to ۲۰ آذر with history |
| s09 (new) | record built from two messages | ✗ (A22-30) |
| s07 (new) | ✏️ edit changing several numbers | split per number ✓, statements ✓, plot ✓; her form rows ✗ (A22-17) |

### Routing
- Every ✏️ turn, `[سامانه]` follow-up and pure command went to lla_assistant ✓. Rewrites kept the tier of their turn ✓.
- All coaching turns went to lla_coach except s07 p1 (A22-14).
- Full tables are in each `findings.md`.

### Practice started from chat
- **s01, T41:** consent quoted («یه تمرینِ یادآوری برام بذار…»). One forgotten day, a week late at 40%, the cycle restarted, and «تثبیت شد: ۴ آذر» after day 1/3/7 counted from the last failure. That matches the technique's own text «چرخه روز ۱، ۳ و ۷». ✓
- **s05, T24:** consent quoted. Persian due dates are read ✓. Chat logs judge the 🎯 as one record ✓. Page judgements are not counted (A22-10). The technique's rule «پیش‌بینی‌ها در دست‌کم ۳ روزِ جدا» is still open, so it is correctly not stabilised.
- **s07, T24:** started from chat ✓; logging from chat is blocked (A22-15).

### Running lists
They were used for the first time:
- **s07 (maths/science):** mistakes folder, models shelf, signal/noise.
- **s09 (life):** assumptions, Pareto.

All of them came back in Today on their own rhythm (models weekly, the claim on its own date, mistakes monthly). Verdict: they have a unique role and should not be quarantined, but they should also appear inside the 🔭 flow. Gaps are listed under A22-28.

### Prerequisite lens on the other scenarios
No stuck point in s01–s10 was a missing prerequisite. Each was a knot or an epistemic error, and none was attributed to ability. A «## پیش‌نیاز» section is in every findings.md.

### Upgrades needed
1. A prerequisite layer in the 🔭 coach: name the concept and the step, ask a diagnostic question, teach briefly, check mastery, return to the same step, and record it in «🧩 نقشهٔ پیش‌نیازها» with a pid.
2. A cause field (prerequisite / knot / skill) in coach_state and the mind card.
3. A nested "place in the main problem" stack, and the «🧭 نقشهٔ مسیرِ مسئله».
4. Page judgement and chat log both book the same T24 session.
5. practice_log that uses the percent and the distinguishing numbers to pick the 🎯.
6. Unit-aware same-fact replacement.
7. The «بله» path updates the result structure the model receives.
8. One source for the successor question.
9. A chat action to add running-list items, with links to the problem and session and a Pareto share field.

### PARTS.md compared with round 21
- **Better:** chat and ✏️ correction (units, colloquial wording, verdict dependency, deadlines), dossier (no raw codes), practice from chat, T41, T24 (Persian dates, chat judging), Today, routing. Running lists are new and now used.
- **Worse:** the stuck ladder (A22-2) and the pre-display reply check on two questions (A22-1). The register check itself is fixed.
- **Same:** maps, factory.
- **Newly exposed:** tunnel, coach, mind card and prerequisite map do not separate a missing prerequisite from a knot or weakness (S1). The knot solver should merge with the tunnel's prerequisite layer.

Everything is in `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22A/`:
- `defects.md` (catalogue) and `PARTS.md`
- per scenario `<sid>/`: `findings.md`, `RESULT.txt`, `DONE`, `dossier22_*`, `mind22_after.txt`, `today22_end.txt`, `out/`
- tools in `tools/`