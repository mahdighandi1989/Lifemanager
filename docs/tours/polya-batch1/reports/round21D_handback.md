## Round 21, runner D (s30–s38): no scenario is zero-defect

Every scenario still passes its written Pólya criteria, but none is free of defects.

The new correction engine is clearly better than round 20:
- **Plans:** fixes land correctly, including the «شنبه⊂یکشنبه» trap.
- **Lesson:** the lesson and its card follow the fix, and the verdict stays.
- **✏️:** the minimal fragment is shown, and the mind card is no longer wiped.
- **Copies she typed:** the page asks «این‌جا هم عوض شود؟» with both values.
- **Non-corrections:** they change nothing.

Still failing:
- deadlines
- the problem statement the assistant prefilled
- verdicts that rest on a corrected datum
- the "page result" reaching the model

Practice cases cannot be opened from chat in any scenario. Routing sends pre-live-problem coaching turns to `lla_assistant`.

Page: HEAD aa8f1e06 (docs only after ef3c1c67). `build.py --check` says in sync, and the dist is newer than the merge.

### Results per scenario
| Scenario | Result | Main defects |
|---|---|---|
| s30 | PASS criteria / ZD FAIL | S2: case can't start from chat. S3: practice_log has no "day done" ("دیروز" logged as today) |
| s31 | PARTIAL | S2: T24 worksheet outcomes never reach 🎯, so calibration n=0, «اطمینان ۰٪», case due stuck in the past, Today asks "شد یا نشد؟" until day 58. S2: her 3 invented look-back problems are lost. S3: dossier lacks 🎯; pct read as a measurement |
| s32 | PASS / ZD FAIL | S2: all 5 coaching turns on lla_assistant. S3: session dossier exists now but is thin, with raw «chatok|u|…». S3: false rewrite «پروندهٔ تمرینی باز نشده» (the "پرونده" was the factory case) |
| s33 | PASS / ZD FAIL | S3: routing p1–p2 |
| s34 | PARTIAL | S2c: T23 due becomes NaN after a late chat log («Invalid Date» in sys line and dossier; case drops from Today). S2: «دو ماه» never reaches the live statement (no src on the assistant-filled statement). S2: no copy-ask for her 🌱 check-in text. S3: Today shows two lines for one act (day 2 and day 7); dossier shows raw «more»; prompt carries two turn questions (p13). S2: routing p10/p14/p16 |
| s35 | PASS criteria + trial / ZD FAIL | S2: case can't start from chat. S3: «rebook:u6» shown in «از کجا؟»; her "every two weeks" ignored; routing |
| s36 | PASS / ZD FAIL | S3: routing p1 |
| s37 (new trial scenario) | PARTIAL | S2: verdict and guess outcome stay after the datum fix (even after her "yes"). S2: next-turn block tells the model «چیزی عوض نشد». S3: lpOne and step-2 copies not asked; «حکم: intuitive»; «خفته تا» a past date |
| s38 | PARTIAL | S2: deadline fix (7 back) does nothing and shows no line at all. S2: lesson fix replaces the whole sentence and loses «با یه صفحه ببُر». S2: routing p1–p4. S3: regression logged as «زودتر از موعد» and ignored by «تثبیت شد»; corrected result not re-booked; «می‌گوید» read as «شما»; raw «chat|…» in the session dossier |

### Defects by root (class, severity, file:line)
1. **S2 b — routing.**
   - `AS.chatTask` uses a keyword sig and ignores the page's own coach header and chat-problem state. Result: 23 wrong turns across 9 scenarios, mostly the decisive first coaching turns. `a26_assist.js:560–571`.
   - The «باز کن» action-only check runs before the live-problem head. `a26_assist.js:567`.
2. **S2 b — start_practice is never offered when no case is open.** `PR.promptBlock` returns "". `a41_practice.js:1159`. Seen in s30, s34, s35, s37, s38; every case had to be started from the page.
3. **S2 b — deadline correction.** The coach path uses the deadline title as its span. `a27_tour.js:3611–3613`; also `a38_live.js:4072`. The prompt's key list has no `deadline`. A refusal or no-op is never shown to her.
4. **S2 b — the page result never reaches the model.** a27 reads `lr.pending` and `lr.changes`, and drops any text starting «چیزی…» (`a27_tour.js:3666–3668`). a38 puts its asks in `ask` and never sets `pending` (`a38_live.js:4044–4045`).
5. **S2 b — verdict and guess are not set aside after a datum change via copy-yes.** `A.liveCopyAnswer` changes only the field. `a38_live.js:4123–4133`.
6. **S2 b — copy-ask scope.**
   - `copyCands` omits 🌱 check-ins and step outcomes. `a38_live.js:4098–4111`.
   - `sameFact` misses rephrased copies. `a38_live.js:4093`.
   - A statement filled during a «[سامانه]» follow-up has no src. `a38_live.js:4101`.
7. **S2 b — lesson correction replaces the whole sentence.** `whole … R.what==="lesson"` ⇒ `R.fix`. `a27_tour.js:3637`.
8. **S2 c — T23 NaN due.** In steps-shape with `steps:[1]` and crit ≠ "steps", a late success leaves no due. `a41_practice.js:226–229`.
9. **S2 b — T24 outcome sync.** Worksheet outcomes don't reach the linked 🎯, and the case due doesn't advance. `a41_practice.js:620`.
10. **S3 b — practice and replies.**
    - A failed session before its due is labelled «زودتر از موعد». `a41_practice.js:221`.
    - False rewrite on «پرونده باز شد». `a27_tour.js:3932`.
    - «می‌گوید» read as «شما». `a27_tour.js:2862`.
    - Two turn questions after a correction. `a27_tour.js:3974`.
11. **S3 b — raw values in the dossier and mind card.**
    - «chat|…» keys. `a40_dossier.js:184`.
    - «intuitive»: missing from `VERD_FA`. `a40_dossier.js:28`.
    - «more» in the mid-course card.
    - «rebook:u6». `a27_tour.js:3660`.
12. **S3 b — a practice report in a new session is read as a new «مسئلهٔ گفت‌وگو».**

Fixed since round 20 (verified):
- ✏️ no longer wipes the mind card.
- «صبح صبح», pl ids and ISO dates no longer reach the user.
- `[object Object]` is gone from the dossier.
- Dossier signs now agree with the mind card (s30).
- Sessions without a live problem now have a dossier (s32).
- Built-in routines no longer show to a new user (s30).
- «(۳۵۲)» is no longer glued to the formula.
- The mid-course check-in is in the dossier.
- T41 runs end to end to «تثبیت شد» with dated evidence (s38).

### «ارتقای لازم»
- start_practice offered from her own words, plus a practice suggestion at look-back time.
- One correction result structure (changed + ask) shared by the page and the coach.
- Dependencies: a verdict, guess or check records which data it used, so a datum fix sets it aside with a reason.
- Deadlines carry her clause as their span and appear in the prompt's correction keys.
- Routing decided from the page's own classification, not keywords.
- One record per act: plan ⇄ 🌱 ⇄ practice case linked at creation; each T24 row is the same record as its 🎯.
- practice_log gains a "day done" and a typed number; the case accepts her own rhythm (udue).
- Look-back "new problems" kept in the look-back itself even when no live problem is created.

### Correction-trial table (summary)
| Scenario | Trial | Back | Path | Expected | Result |
|---|---|---|---|---|---|
| s38 | derivation | 1 | ✏️ | text, history, exec event; plan event stays | ✓ (better). Corrected result not re-booked |
| s38 | lesson | 4 | chat | lesson + card change, verdict stays | ✓, but whole sentence replaced |
| s38 | deadline (two-fact sentence) | 11 | chat | deadline + reminder change | ✗, no line shown |
| s38 | question / «اشتباه کردم» / quote | — | chat | nothing changes | ✓ |
| s34 | plan date | 1 | chat | text + due | ✓ (better) |
| s34 | «دو تا اسکیس» | 3 | ✏️ | text; ask for her 🌱 copy | text ✓; no ask ✗ |
| s34 | «دو ماه» (multi-fact) | 10 | chat | chat + live statement change; «گیر» event stays | chat only ✗; «گیر» kept ✓ |
| s34 | question / quote | — | chat | nothing changes | ✓ |
| s35 | «شنبه⇐یکشنبه» | 1 | chat | text + due | ✓ |
| s35 | quote | — | chat | nothing changes | ✓ |
| s37 | datum she also typed (verdict depends on it) | 5 | chat | copy-ask; verdict set aside | ask ✓ for 2 of 4 copies; verdict kept ✗; model told «nothing changed» ✗ |
| s37 | ✏️ | 1 | ✏️ | minimal fragment | ✓ |
| s37 | question | — | chat | nothing changes | ✓ |

### Routing table
Per scenario in `round21D/<sid>/routing.md` (wrong coaching turns over turns judged):

| s30 | s31 | s32 | s33 | s34 | s35 | s36 | s37 | s38 |
|---|---|---|---|---|---|---|---|---|
| 1/8 | 2/16 | 5/7 | 2/5 | 3/17 | 3/12 | 1/4 | 2/12 | 4/17 |

- Every ✏️ turn and every «[سامانه]» follow-up was correctly `lla_assistant`.
- Practice-report turns are defensible either way; that covers s30 p8 and s31 p16.

### PARTS.md, with the «نسبت به دورِ ۲۰» column
- **Better:**
  - assistant (claims only after the page result)
  - correction engine
  - 📜 dossier
  - mind card stages and 🏋 row
  - tunnel («📌 همان برنامه؟»)
  - Today in s38/s30
  - T41 practice
- **Same:**
  - deadlines
  - the 🌱 card
  - formula tool
  - factory
  - plot
  - Today duplicates in s34
- **Worse:**
  - look-back "new problems" are lost
  - T23 NaN due
- **New part:** routing (`AS.chatTask`).
- **Merge proposal:** «📌 برنامه» + «🌱» + «🧪» are one act.
- **No evidence for two rounds running:** 🗺 maps and the running lists. Proposal: route a batch-2 scenario through them, not quarantine.

### Notes
- **coach_state:** omitted in at least one turn per scenario (the replayed omissions, plus s34 pl8 and s31 pl36).
- **Prompt scans:** struct found one violation (s34 p13, defect 10). The strict scan with LIVEOK found nothing.
- **Seeded data:** all runner-profile test data. The date patch was used as in round 20, so there is no simClock tag.
- **My own mistakes (class d), rerun cleanly:**
  - s34: I had inserted a session break before the «دو ماه» correction, and one replayed reply clicked a home-page button key that had shifted.
  - s30: my first plan moved the clock backwards.
  - s35: the script did not answer the «همان برنامه؟» offer.

### Housekeeping
- Every scenario has `findings.md` (summary for the owner, criteria, correction trials, dossier, time/practice, routing, need map, defects, «ارتقای لازم», mind card before/after), `DONE`, and `part_*` shots including full-page dossiers and mind «از کجا؟».
- Nine e-mails sent, subject «🧭 پولیا · دورِ ۲۱ · …», RUNNER16 structure, each linking the D storyboard: https://claude.ai/artifact/89Rq3mP3Vs2CYfJqZPZ75L
- Profiles deleted. None of my processes is running, and I did not touch other runners.

Everything is in `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21D/`:
- `<sid>/findings.md`, `<sid>/routing.md`, `<sid>/out/part_*.png`
- `PARTS.md`
- `<sid>.ins.py` (insertion spec) and `<sid>.plan.json` (the plan built from it); `<sid>.ovr/` holds the model replies I wrote
- `tools/` — `drive21.py`, `mkplan21.py`, `rec21.js`, `prc.js`, `post21.sh`, `rtab.py`, `kdrift.py`, `cmp20.py`