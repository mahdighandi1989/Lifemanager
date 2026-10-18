## Round 22, runner D (s30–s38 plus prerequisite scenarios dp1–dp3): no scenario is zero-defect

The container restarted partway through. Following your instruction, I deleted my stale profiles and re-ran every scenario that had no DONE from scratch — all 12. Replies came from cached overrides, so each replay is deterministic.

The page under test was main b70c1fe8, with the dist built at 10:23 and `build.py --check` reporting it in sync. For time I used the in-page Date patch, as in round 21. Every scenario has `findings.md` (owner summary, the two need maps, «## پیش‌نیاز», «ارتقای لازم», mind card before/after), `routing.md`, `part_*` shots and `DONE`. All 12 e-mails were sent with subject «🧭 پولیا · دورِ ۲۲ · …», each linking the D storyboard https://claude.ai/artifact/89Rq3mP3Vs2CYfJqZPZ75L. I added a line to STORYBOARD_LINKS.md. Profiles are deleted and none of my processes are running.

### Results per scenario
| Scenario | RESULT | Main remaining defects |
|---|---|---|
| s30 | PARTIAL | S2: the 800→750 correction also appears in the support-tickets problem's dossier. S3: a packaging question appears in the tickets problem's «کدام پرسش کمک کرد؟» list. S3: correction events doubled in the dossier. |
| s31 | PASS / ZD FAIL | S3: routing p17. S3: T24 stability text cites «قاعدهٔ گره» instead of the technique's own text. S3: her 3 invented problems never return in Today. |
| s32 | PASS / ZD FAIL | S3: after a claim verdict, her "one more month" recheck gets no due date. S3: the list page has no verdict/load-bearing/share controls. S3: the assistant has no list action. |
| s33 | PASS (zero-defect in itself) | — |
| s34 | PARTIAL | S3: the copy-ask proposes garbled text («یه تا اسکیس»). S3: correction events doubled in the dossier. S3: routing p14/p16 (returns in a new session). S3: T23's stability criteria don't fit a project. S3: the sufficiency judgement is set aside for an unused datum. |
| s35 | PARTIAL | S2: a deadline built from two of her messages has only one source, so correcting the "what" part was refused. S3: no "late" label in T15. S3: the T15 case does not feed the assumptions list. S3: routing p1. |
| s36 | PARTIAL | S2: «ظرفِ اول ۳۰ لیتر بود، نه ۲۰ لیتر. پس جوابم عوض میشه؟» was refused as «پرسش است، نه اصلاح» (a27_tour.js:3589). S3: a guess her own ✏️ refuted stays open. S3: other copies not asked. S3: a list item is not linked to its problem. S3: «یه ماه دیگه» not read as rhythm. |
| s37 | PARTIAL | S2 (new): after a ✏️ "۴⇒۵", the page offered to change the lesson «بر ۴» to «بر ۵» (a38_live.js:4279–4300). S3: two copies not asked. S3: mind-card step successes resting on the old datum are not withdrawn. S3: «خفته تا ۲۹ مهر» shown as a past date. |
| s38 | PARTIAL | S2: the deadline fix (11 turns back, key=datum) still does nothing, and her plain line falsely says nothing was recorded (a38_live.js:3974, KEY_KIND.datum has no deadline). S2: the lesson fix now garbles the lesson and its card (a27_tour.js:3784 `lessonSub20`). S3: ✏️ event doubled in the dossier. S3: over-triggered "two questions" rewrites. |
| dp1 (math, one prerequisite: triangle area, age 12) | FAIL (prerequisite criteria) | S2: no prerequisite moment in the coach; the turn question repeats an already-answered «مجهول چیست؟». S2: «🧩 نقشهٔ پیش‌نیازها» is an island (0 maps). S2: the mind card books the stuck point as planning weakness (weakest 88%) and later learning is not progress. |
| dp2 (science, one prerequisite: km/h→m/s, age 16) | FAIL (prerequisite criteria) | Same S2s as dp1. Booked as execution weakness (72%). Day-2 mastery not booked. |
| dp3 (several nested: triangle area → Pythagoras → (14−x)², adult) | FAIL (prerequisite criteria) | All detection, ordering and return were done by the model only. S2: register error — «تو» (meaning "in") read as the 2nd-person pronoun, forcing a «تو» rewrite. S2: the "teacher" role books nothing of her own learning. S3: repeated turn question. |

Across all prerequisite scenarios, «🧭 نقشهٔ مسیرِ مسئله» does not exist. I recorded it as an S2 gap in all 12 scenarios, each with what the person needed to see.

### Fixed since round 21 (verified)
- **Routing:** 4 wrong out of 136 turns, down from 23 out of 115. Every opening coaching turn is now `lla_coach`.
- **start_practice from chat:** works in 6 scenarios with quoted consent: s30 T32, s34 T23, s35 T15, s36 T31, s37 T17, s38 T41.
- **Her own rhythm:** «هر روز» and «هر دو هفته» set the due date.
- **T41 regression:** restarts the cycle, and «تثبیت شد» is not declared on one success. The technique's text is «چرخه روز ۱، ۳ و ۷».
- **T23:** no more NaN due date.
- **T24:** the worksheet row is the 🎯 record and is judged; the case due date advances; a chat log judges with her stated confidence.
- **practice_log:** «دیروز» is booked as the day before.
- **Corrections:**
  - The page result reaches the model verbatim.
  - Dependencies (verdict, guess, «حل شد») are set aside after «بله» (s36, s37).
  - «دو ماه» reaches the live statement (s34).
  - A copy with different wording is asked (s30).
  - A 🌱 copy is asked (s34).
  - A deadline fixed 8 turns back with key `deadline:d1` works (s35).
  - ✏️ re-books the corrected result (s38).
  - One fragment per number in ✏️ (s37).
- **Dossier:** no raw keys; «intuitive» is gone.
- **Today:** one line per act (s34, s38).

### Correction trials vs round 21
| Scenario | Trial | Back | Path | R21 | R22 |
|---|---|---|---|---|---|
| s38 | ✏️ a/2 | 1 | ✏️ | ✓ but result not re-booked | ✓, re-booked |
| s38 | lesson | 4 | chat | whole lesson replaced | ✗ garbled |
| s38 | deadline 08⇒10 | 11 | chat, key=datum | ✗, no line | ✗, false "nothing recorded" line |
| s38 | non-corrections (question, «اشتباه کردم», quote) | — | chat | ✓ | ✓ |
| s34 | plan date | 1 | chat | ✓ | ✓ |
| s34 | «دو تا اسکیس» | 3 | ✏️ | no ask | ask ✓, but garbled value |
| s34 | «دو ماه» | 10 | chat | chat only | chat + live statement ✓ |
| s35 | شنبه⇒یکشنبه | 1 | chat | ✓ | ✓ |
| s37 | datum she also typed (verdict depends on it) | 5 | chat | verdict kept; model told nothing | ask ✓, verdict/guess set aside ✓, model told ✓ (2 copies still not asked) |
| s37 | ✏️ several numbers | 1 | ✏️ | ✓ | ✓, plus a new spurious copy-ask «بر ۴⇒۵» |
| s35 | **NEW** deadline, two-message record, date part | 8 | chat, key deadline:d1 | — | ✓ date + reminder; what-part kept |
| s35 | **NEW** same record, "what" part | 9 | chat | — | ✗ refused |
| s36 | **NEW** datum a verdict depends on | 9–10 | chat | — | first try refused (S2, ends with «؟»); second try ask ✓ + «حل شد» set aside ✓, but no explicit re-check question |
| s36 | **NEW** ✏️ several numbers + words | 1 | ✏️ | — | text ✓; refuted guess stays open |
| s30 | **NEW** copy typed with different wording | 2 | chat | — | ✓ |

### Routing (wrong / judged)
| s30 | s31 | s32 | s33 | s34 | s35 | s36 | s37 | s38 | dp1 | dp2 | dp3 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0/9 | 1/16 | 0/9 | 0/5 | 2/17 | 1/16 | 0/11 | 0/12 | 0/17 | 0/9 | 0/6 | 0/9 |

The 4 remaining errors are returns in a new session about an open problem (s34 p14 and p16, s31 p17) and an opening message that starts with a proverb (s35 p1). The strict structural prompt scan found no prompt with more than one unmarked question directive.

### Practice from chat
All six cases opened from chat with consent; four ran over days with a regression.
- **s38 T41:** sessions on days 1, 5 (chat, late), 9 (fail), 21; the cycle restarted correctly.
- **s34 T23:** daily rhythm; regression on day 9.
- **s35 T15:** 14-day rhythm; regression on day 45; no late label.
- **s30 T32:** «دیروز» booked correctly; regression on day 35.
- **s37 T17 and s36 T31:** opened from chat; s36's rhythm was not applied.

### Running lists (first evidence in two rounds)
- **s32 (life):** a signal/noise claim with recheck date, assumptions (one load-bearing) and Pareto shares. Today returned the claim on its date (day 66); the verdict «سیگنال» was recorded through the T10 worksheet.
- **s36 (math):** mistakes folder and models shelf. The monthly review came due; the shelf counted two uses on one day once, as T16's text requires.

Verdict: each list has a unique place and should not be quarantined. They need:
- an assistant action to write to them;
- controls on the list page for verdict, load-bearing and share;
- a link to the problem and the case;
- a recheck after a verdict.

### «ارتقای لازم» (main items)
1. A prerequisite moment in the coach, reported by the model in coach_state as `prereq {concept, step, quote}` and checked by the page, followed by:
   - a short diagnostic;
   - teaching only as far as needed;
   - a stack that holds the waiting step and returns to it;
   - nesting handled the same way;
   - an entry in that problem's «🧩 نقشهٔ پیش‌نیازها».
2. The mind card books a cause for every stuck point (prerequisite / knot / skill) and counts a learned prerequisite as progress. Learning by a "teacher" role is booked too.
3. Build «🧭 نقشهٔ مسیرِ مسئله» (roadmap §16).
4. Corrections:
   - Judge the clause, not the message's final «؟».
   - The datum key reaches deadlines, and deadline ids are visible in the prompt.
   - A record built from several messages keeps one source per part.
   - "Same fact" never matches a lone digit.
   - Show the full new lesson or copy text for her to confirm before saving.
   - One dossier event per correction, never in another problem's dossier.
5. An assistant action for the running lists, and controls on the list page.
6. Read «یه ماه دیگه» as her rhythm; warn when a technique's stability criteria don't fit the subject.

### PARTS.md summary («نسبت به دورِ ۲۱»)
- **Better:**
  - routing
  - 🧪 practice
  - correction engine
  - 📜 dossier (with two new defects)
  - Today
- **Same:** 💬 replyCheck — the register check is worse, with the new «تو» = "in" error.
- **Same, with a new defect from the prerequisite lens:** 🧠 mind card.
- **First judged this round:**
  - the coach's prerequisite moment ✗
  - 🧩 prerequisite map (an island; it should appear inside the solving tunnel)
  - running lists (unique place; need writing paths)
- **Missing:** 🧭 problem route map.

### My own mistakes (class d, not defects)
- Old replies carried dates from the previous day; I shifted them by one day before running.
- In s32 the first fill of the required worksheet fields was incomplete; I re-ran from scratch.
- In s36 I did not re-select the verification result when re-closing.
- In s37 an id substitution moved the practice subject from the wheat problem to the sheep problem.

### Files
All under `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22D/`:
- `<sid>/findings.md`, `<sid>/routing.md` and `<sid>/out/` for each of the 12 scenarios
- `PARTS.md`
- `<sid>.ins.py` / `<sid>.items.py` (what was inserted or scripted) and `<sid>.ovr/` (model replies I wrote)
- `tools/` (`drive22.py`, `mkplan22.py`, `newplan.py`, `dump.py`, `pv.py`, `rtab.py`, `lists.js`)