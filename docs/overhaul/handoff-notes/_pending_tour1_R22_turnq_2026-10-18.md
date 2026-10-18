# Pending: Pólya tour round 22 — fixer «turnq+class» (P4, P5) — 2026-10-18

> Temporary note for the other round-22 fixers and the integrator. Decisions: tour1_polya/DECISIONS_R22.md P4, P5. WORKLOG (92), PROGRESS 107.

Merged: prereq+route (95459379, fd496f7e) and practice+lists (23f76e4a) on top of this work; WORKLOG 91 / PROGRESS 106 (correction fixer) still missing, so the
handbook/ownership pytest numbering check fails until that branch is merged (verified green with the numbers closed up).

Files changed: `apps/learning-architecture/src/app/a38_live.js` (coachCore successor), `a27_tour.js` (turn signals, re-check, post-check,
final one-question pass, message classifier, register), `a26_assist.js` (prompt final pass, routing), rebuilt bundle.
Tests: new `apps/learning-architecture/tests/test_tour1_r22_turnq.js` + byte copy of the bank `tests/variants/VARIANTS_R22.json`.
No old assertion changed.

## Contract: one turn question per prompt (everyone who writes prompt blocks)
- `AS.prompt` (a26) runs `AS.oneTurnQ22(hookOut)` AFTER all `promptHooks` and `promptFilters`. It keeps exactly one turn-question line:
  the turn line of a `# پیش‌نیاز (` block (prereq stack, P1 — always first) > first `**پرسشِ این نوبت همین است:**` line (not context) > the `- در این نوبت فقط **یک** پرسش` line of `# مسئلهٔ زندهٔ این سشن` > the first such line.
  Every other one becomes `- زمینه (نه پرسشِ دوم؛ پرسشِ این نوبت همان یکی است): …` with «بپرس» neutralised.
- The kept turn line keeps the page question's exact text (its identity for the answer ledger, «کدام پرسش کمک کرد؟», page sync). A two-sentence page question
  is counted as ONE question by the post-check (B·D10); it is not rewritten in the prompt (that broke test_fixes_1015c and test_tour1_assist #6).
- A `- …` line (not context, not a turn line, not `- پرسش‌های…`) that contains `پیشنهاد بده («…؟»)` becomes context. **practice fixer:** the a41 line
  «- بازنگری: … پیشنهاد بده («می‌خواهی تمرینش کنیم؟»)» is now demoted by this pass; writing it as context at its source would be cleaner (HANDBOOK §12 #54).
- Outside the kept turn line, every «بپرس» outside «…» (context lines too) becomes «پرسشِ همین پاسخ کن» — a second imperative "ask" is a second turn
  question for the strict scans. **prereq fixer:** a44 `RULE` («… فقط همان پرسشِ تشخیصی را بپرس») is rewritten by this pass after the merge of 95459379;
  writing it without «بپرس» at the source is cleaner.
- If you add a new turn-question source, use one of the two marker forms above; never a third phrasing — the final pass and the post-check read only these.

## Contract: turn question after a step outcome (live fixer / prereq fixer)
- `coachCore` (a38): when there is no open step and the last step has an outcome, `nextItem22(r, s, Q, tx, L)` reads HER current turn first
  (restatement request, «به نظرت درسته؟»/«چیزی جا ننداختم؟» on steps, a proof/finding she presents, a next move she names ± prediction ± day)
  and its item beats the post-outcome questions (e4 gap, e5) and the successor `Q_NEXT_STEP`. Exported: `A.liveNextItem22(pid, text)`.
- The successor is the turn question once per outcome. "Asked" is `L.c0Asked[q] === outcomeKey` AND marked in a different turn (`L.c0Turn[q]` ≠ this turn key);
  several `liveCoach` calls in one turn count as one. **prereq fixer (P1):** a diagnosed prerequisite should be a `turn-…` pick in coachCore (step (1)), so it beats all of these.
- a27 `PRESTEP21` override does not replace a question that `A.liveNextItem22` produced for this turn.

## Contract: re-check after a correction (correction fixer)
- The «با مقدارِ اصلاح‌شده … دوباره وارسی کند» turn question needs `retNote.res.changed` (or `retNote.ch`) to contain a set-aside verdict («حکمِ وارسی»),
  «حل شد», a guess outcome («سرانجامِ حدس»), or — for `what:"ans"` — a re-booked result. **correction fixer (A22-19):** when the «بله» path sets a verdict aside,
  put it into `coach.retNote.res.changed` so this question appears. Never in a turn where her own message reports the re-check.
- Old rule: `AS.R22_QUARANTINE.hasRes21(N, s)`.

## Contract: message classification (everyone)
- `AS.metaMsg22(text)` ⇒ `"practice" | "keep" | "rating" | "correction" | "deadline" | ""`. A non-empty kind is never a problem statement (`statesProblem` false),
  never a guess (`notGuessMsg`), never stored as `coach.stmt`. **practice fixer:** use it rather than a second list when you title a practice subject (B·D17).
- `AS.open22(text)`: goal/stuck openings without «؟», «چه کنیم», a question about data she gave — part of `statesProblem`.
- `AS.ownOutcome22(text)`: her report of her own prediction/guess outcome — routes `lla_coach` when the coach block is present.
- Routing also goes to `lla_coach` when the prompt's `# مسئلهٔ بازِ تو` block says «حرفش دربارهٔ همین مسئله است».
- Register: bare «تو» is the pronoun only after a preposition, before «که/هم/رو/بگو/چی…» or alone at the end (`AS.toPron22`); old list rule `AS.R22_QUARANTINE.signTo21`.

## Post-check
- `AS.replyTwoQ(reply, pageQs)`: page questions from `AS.pageTQs22(prompt)` (balanced «…» from turn lines, plus their one-sentence form) and the session ledger
  `coach.pQs21`. Consecutive question sentences each with a majority of tokens in the same page question = one; «مثلاً/یعنی …؟» and a one-word head are one;
  ≥2 bullet lines with «؟» are a cheat sheet, not questions to her. The model's own extra questions are still flagged.

## Not done (with reason) / corrections
- A22-27 (whole question asked after she stated it in chat before the problem existed) and dp1 «مجهول چیست؟» repeated: not reproduced in this fixer's
  harness; the bank's «answered question» entry (#108) passes. Left for the next round's evidence.
- (Corrected) `test_fixes_1015c.js` and `test_tour1_assist.js` #6 were my regression (those tests ignore LLA_FILE, so my base check ran the wrong build): the prompt rewrite `oneQ22` broke the page question's identity. Removed; both green.
