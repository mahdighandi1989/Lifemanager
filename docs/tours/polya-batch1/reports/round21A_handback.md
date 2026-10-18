Round 21 Pólya tour, runner A (s01–s10), is finished. **No scenario reached zero defects: 0 of 10.** Every written criterion still passes on replay, and there are no S1 defects. There are 10 S2 and 12 S3 defects. s02, s06 and s09 fail on one defect each: two of them only on raw codes showing in the conversation dossier, and s06 on a false rewrite request (S2).

Build checked: branch at aa8f1e06 (docs only after ef3c1c67), `build.py --check` in sync, dist newer than the merge. Nothing in the repo was edited.

**How I ran it**
- **Harness:** I replayed the round-20 runs from round20A with harness7, which is harness6 plus Playwright's `page.clock`, starting 2026-10-16. Clock steps go forward only, the page reloads after each jump and the view is restored.
- **Why not the page's own test clock:** in dev mode, records made under the test clock disappear from all lists once the offset goes back to 0 (A21-21). My first s05 attempt hit this, so I threw it away and restarted.
- **Model answers:** old answers were reused only where the prompt blocks were identical. I answered by hand wherever round-21 rules applied: s03 is now in the «تو» register, plus all corrections, practice turns and rewrite requests. I left coach_state out in at least one turn per scenario.
- **Scans:** 104 prompts checked, with 0 unmarked second-question directives and 0 developer notes.
- **Wrap-up:** 33 dossiers (problem and conversation), Today and mind card shots, `{"exit":true}` in every scenario, DONE files written, browser profiles deleted, no processes left running.
- **E-mails:** 10 sent («🧭 پولیا · دورِ ۲۱ · sNN · … · ⚠️»), each linking the A storyboard https://claude.ai/artifact/91WEMispzw9gyGiD4L1n4c.

**Result per scenario** (all: written criteria pass)
| Scenario | Defects |
|---|---|
| s01 | S2: A21-8. S3: A21-14, 16, 17, 22 |
| s02 | S3: A21-14 |
| s03 | S3: A21-5, 14 |
| s04 | S2: A21-1, 2, 4. S3: A21-5, 7, 14, 19 |
| s05 | S2: A21-1, 2, 3, 4, 8, 9, 12. S3: A21-11, 14, 15 |
| s06 | S2: A21-1 |
| s07 | S2: A21-8, 9, 10, 13. S3: A21-11, 14, 18 |
| s08 | S2: A21-1. S3: A21-14 |
| s09 | S3: A21-14 |
| s10 | S2: A21-6, 13. S3: A21-14, 19, 20 |

**S2 defects** (all class b)
- **A21-1 – false register rewrite:** the page's pre-display register check treats «باید / نباید / بیاید / می‌گوید / بیشترین» as «شما» and asks to rewrite replies that are correct «تو» replies. Seen at s04 p7, s05 p5, s06 p5, s08 p8. Cause: `a27_tour.js:2862` (`SIGN_SH` patterns `[بن][آ-ی]{1,10}(?:ید|ین)` and `ن?می…(?:ید|ین)`), used by `regSigns` in `replyCheck` (`:3934–3936`).
- **A21-2 – wrong turn question after a step outcome:** once she records a step's outcome with her own reflection, the page's question falls back to e1 «پیش از این گام: فکر می‌کنی چه می‌شود…», a step that no longer exists. s05 p4; s04 p5–p11, where she is angry and wants to restate the problem. Round 20 asked e4 here, so this is a regression: the round-20 fix (#142, `L.c0Asked`) suppressed e4 without a successor. `a38_live.js` liveCoach.
- **A21-3 – statement does not follow a chat correction:** a statement built from her message records only one clause as its source. Correcting «دو نفر ⇒ سه نفر» changed nothing, and the page replied «رکوردی ساخته نشده بود». s05. `a38` src stamping for key `stmt`.
- **A21-4 – no «این‌جا هم عوض شود؟» on the chat path:** fields she typed herself on the page are not asked about when her wording differs between colloquial and written forms (خونه / خانه, می‌ارزه / می‌ارزد, نفر / همکار). s04 price 8→11, s05. The ✏️ path (s04 d3) and identical wording (s10) do ask. `a38` sameFact.
- **A21-6 – proof verdict survives a changed datum:** in s10, after her «بله» changed «سه‌نفره» to «چهارنفره» in the statement and data, the problem stays «✅ اثبات شد» and the mind card still counts it. `a38` liveCopyAnswer, `a27` retNote.
- **A21-8 – practice cannot start from chat:** `start_practice` is described to the model only when a practice case already exists (`a41` `PR.promptBlock` returns empty otherwise). Her explicit «تمرین برام بذار» in s01, s05 and s07 could only be redirected to the page.
- **A21-9 – Persian dates ignored in the calibration worksheet (T24):** «موعد داوری» written as «۱۵ آبان» produces no 🎯, no case and no warning. s05, s07. `a41` parseWhen only reads ISO, «N روز» and «فردا».
- **A21-10 – chat practice log on a calibration case:** it creates a session but leaves the 🎯 unjudged, so one act becomes two records and two Today lines. The system line also says «اطمینانِ اعلام‌شده (۰٪)» when she said 60%. s07. `a41` practice_log.
- **A21-12 – plan answer lost:** after the overdue «انجام شد؟», the next prompt drops the plan id. Her «آره، ثبت‌نام کردم» cannot be reported, and the plan ends as expired with `done:false`. s05. `a27_tour.js:3300` (open-plan list filter).
- **A21-13 – routing misses opening problem messages:** first-turn problem or guess messages without the keyword signals go to `lla_assistant`: s07 p1, s10 p1 and p2. `a26` `AS.chatTask`.

**S3 defects**
- **A21-5:** the coach-side replacement garbles text: g1 becomes «…توی خودِ ضلعه، یعنی ۱» and the datum ledger keeps only «۱۱ میلیارد». She sees it.
- **A21-7:** a condition holding the same fact is not asked about, and the «متناقض است» judgment is not flagged for re-check.
- **A21-11:** the calibration case row in the mind card has no measurements («۰ جلسه» / «اندازه‌ای نیست»).
- **A21-14:** dossier problems:
  - Corrections made only in chat get no event.
  - One problem's plan leaks into other problems' dossiers (s03).
  - Raw «chatok|…» codes appear in 9 conversation dossiers.
  - A heading reads «از گفت‌وگو — از گفت‌وگو».
- **A21-15:** a plan message is booked as «فهم +», the event keeps its stale text after ✏️, and a correction that changed nothing books no self-correction event.
- **A21-16:** the problem's frame card is not owned by its retrieval case and stayed overdue for 7 weeks.
- **A21-17:** an overdue step of the 1-3-7 cycle is not marked late in Today.
- **A21-18:** the habit block fires on a calibration-practice request.
- **A21-19:** misleading correction texts: the correction message offered as a «صورت» candidate, and «هیچ رکوردی ساخته نشده بود» on a repeated ✏️.
- **A21-20:** the result block says «چیزی عوض نشد» while the same prompt's page lines say things changed.
- **A21-21:** test infrastructure: records made under the test clock vanish when the offset returns to 0 (`a1_base.js:281`).
- **A21-22:** a guess verdict set to «نادرست» is not re-judged after the problem closes verified. This was also present in round 20, unreported.

**Fixed since round 20 (verified by execution)**
- A1 (S1): the «شنبه / پنجشنبه» correction now lands on Saturday, and Today asks that day.
- A3: the ✏️ editor text is readable.
- A4: no «شاید اصلاح» block on ✏️ turns.
- A5: mind events are re-booked after a correction.
- A6, partly: chat plans now appear in the dossier.
- A7: dossier order follows event time.
- A8: after a late failed session, the cycle restarts and stale lines disappear.
- A9: one row per T41 case in the mind card.
- A10: correct guess status on a proven problem.
- A11: practice sessions carry their own dates.
- A12: register no longer taken from quoted textbook text.
- A13: no spurious deferred-request candidate.
- A15: the add-point form opens only on its own plot.
- A17: «ردش» stays with the guess question.
- Still open: A16 (garbled replacement), now limited to the coach side (A21-5).

**Correction trials**
| Scenario | How far back / path | Result |
|---|---|---|
| s03 | 1 turn, chat, 9→10 | Statement and chat message fixed (minimal span); assistant claimed only after the page result ✓ |
| s03 | 3 turns, ✏️ plan day | Plan, Today on Thursday and mind event all followed ✓ |
| s03 | 6 turns, chat guess | Problem's guess fixed ✓; coach copy garbled ✗ (A21-5) |
| s03 | non-correction | Nothing changed ✓ |
| s03 | page-typed copy | Not set up: the proof-type form had no data field (my method, d) |
| s04 | 3 turns, chat, price | Only the chat ledger changed, and garbled; her own form field not asked ✗ |
| s04 | 1 turn, chat, plan day (sentence with two facts) | Plan moved to Saturday, Today followed, the second fact untouched ✓ |
| s04 | 7 turns, ✏️ «امسال» | Copy ask ✓ and «بله» changed the datum ✓; condition and «متناقض» untouched ✗ |
| s04 | repeated ✏️, two non-corrections | Nothing changed ✓ |
| s05 (new) | 4 turns, chat «دو→سه» | Nothing changed, nothing asked, nothing shown to her ✗; verdict stayed ✓ |
| s05 | 1 turn, ✏️ plan | Plan and Today followed ✓; mind event text stale (S3) |
| s05 | quote and question non-corrections | Nothing changed ✓ |
| s10 (new) | 4 turns, chat «سه‌نفره→چهارنفره» (two facts in one sentence) | Both page copies asked ✓, «۹ نفر» kept ✓; proof verdict not set aside ✗ |
| s10 | 1 turn, ✏️ plan (verdict must stay) | Plan, Today and verdict all correct ✓ |
| s10 | quote non-correction | Nothing changed ✓ |

**Routing** (104 turns; per-scenario tables are in each `findings.md`)
- All ✏️ turns, `[سامانه]` follow-ups and action-only commands («ثبتش کن», «اینو ثبت کن») went to `lla_assistant` ✓.
- Rewrite requests kept the tier of the user's turn ✓.
- Coaching turns went to `lla_coach`, except the three wrong ones: s07 p1, s10 p1, s10 p2 (A21-13).
- Observation: «آره، ثبتش کن» is routed fast as the rule says, but its reply also carries the first coaching question.

**Time and practice**
- **s01 (T41):** day 0 and day 1 on the page, day 3 forgotten, day 7 six days late through chat at 40%. The cycle restarted, three dated retrievals gave «تثبیت شد», and the durability check came back by itself. Today showed one line per act. The mind card has one row with 7 sessions. The dossier lists every session at its own date.
- **s03 (T41):** 20 days late, 45%, logged through chat, then the cycle restarted and stabilised.
- **s05 (T24):** Persian due dates failed silently, the case ended up unlinked («آزاد»), it could not be logged from chat, and the mind card shows 0 sessions.
- **s07 (T24 on the live problem):** the chat log broke the one-record rule (A21-10), and there was one late regression.
- **Not started for s02, s04, s06, s08, s09, s10:** none of these people asked to practise, and starting a case without their words would break the "from her own words" rule.

**Upgrades needed**
- `start_practice` always available in the coach prompt, with quoted consent.
- One shared Persian date parser for every due field.
- A chat action to judge a 🎯, with T24 practice_log linked to that 🎯.
- Fact matching by meaning: the model names which page record holds the same fact, and the page asks.
- Dependency from proof/verdict to the data it used, so a data correction sends it back for re-check.
- A practice case suggested by the assistant is linked to her problem or session, not «آزاد».
- One retrieval queue per problem, so frame cards fall under the retrieval case.
- A small geometry / 3D canvas.

**Parts table** (`PARTS.md`, with the «نسبت به دورِ ۲۰» column)
- **Better:**
  - Understanding: copy asks now happen.
  - Look-back.
  - Spaced review: now inside the retrieval case.
  - ✏️ editing.
  - Chat corrections: the S1 is gone.
  - Dossier.
  - Today.
  - T41 practice and the mind card's technique rows.
  - Math tools.
- **Worse:** execution/steps, because of the turn question after an outcome (A21-2).
- **New:**
  - The pre-display reply check: helpful for claims, harmful for register (A21-1).
  - Routing.
  - The T24 case: needs merging with 🎯.
- **Same:** planning, maps, factory.
- **Unused two rounds in a row:** the running lists (assumptions, models, mistakes, ambiguities, Pareto, signal/noise) were never touched. Under roadmap §12, propose quarantine or merge to the owner.

Everything is in `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21A/`. Each `sNN/` folder holds `findings.md`, `RESULT.txt`, `DONE`, `mail21.html`, `out/`, the `corr_*.json` record dumps and `dossier21_*.txt`. Also `PARTS.md`, the shared defect catalogue in `gen21/defs.py`, and the tools including `tools/harness7.js`.