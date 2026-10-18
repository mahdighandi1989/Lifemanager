# Tour batch 1 (Pólya) — ROUND 24 (read RUNNER.md … RUNNER23.md incl. all ADDENDA, then this; this overrides)

Page: main eee4ff0f (round-23 merge; `build.py --check` in sync, dist newer — else STOP). What changed: DECISIONS_R23.md (Q1–Q7) and the
handoff notes docs/overhaul/handoff-notes/_pending_tour1_R23_{ageclass,prereq,story,correction,today}_2026-10-19.md. In short:
- Q1 age/identity: Jalali or Gregorian birth date anywhere (card, birth action, «X سالمه، تولدم روزِ Y», Persian/Latin digits, month names,
  two-digit years, a human error for a day that does not exist; a day without a year ⇒ the card asks only the year); her own birth sentence
  in chat is saved by the page (someone else's birthday, deadlines, past events are not); page-written lines follow her register (شما/تو,
  her explicit request wins and is remembered); greetings/self-introductions never in titles; no adult-normed daily puzzle for a child;
  the system map tells the model what age is for, where data is stored, offline, model-independent («خودِ سامانه» facts).
- Q2 prerequisites: opening-turn scope; every stuck under an open stack booked cause = prerequisite (mind card AND dossier); missing tool ⇒
  cause = system; no mastery close while a child is open; ability rule after closure; «مغزم نمی‌کشه» = self-label; 🧩 follows a chat
  problem that becomes live.
- Q3 one story: validated chat events fill the forms as «از گفت‌وگو: … درست است؟», never re-asked; live stage advances from chat; the
  whole-first question dropped once said; a later live problem imports the chat work; route map for chat problems (origin, destination,
  main line from the chat plan, nesting kept after closure, unclipped labels, real guess outcomes, fresh geo strip); the model can open it.
- Q4 corrections: all copy kinds (goal, ans, statement, typed rows), number roles (range bounds, counts, masked digits), multi-pair ✏️,
  deadline "what", misstated ≠ refuted, neighbour words kept, verdicts not consuming the datum kept, chat «بله» answers the copy ask,
  never silent, change line with reason, dependent guesses and title follow.
- Q5 classification/routing/turn question/post-check (see DECISIONS_R23 Q5).
- Q6 TERRITORY LOOP — NOW BUILT: waiting marker (sheet id on 🔭, route map «⏸ منتظر #n — step», dossier); the page notices a registry change
  or a sheet reply «پاسخ به برگهٔ دستیار #n», checks the new thing answers that step, adds a Today line «ابزارِ لازم آمد», resumes the step;
  coach_state.sys_done when she took the step another way; the full territory list is in the prompt before the gap decision.
- Q7 Today one line per act; look-back invented problems in Today; deadline_done from her words; no raw ids; chat guess outcomes in the
  dossier; no duplicate lines; deferred requests stored as promises that return; list_add from consecutive messages; one practice window;
  a prediction is never a guess.

REQUIRED THIS ROUND (everything in RUNNER23 + its three ADDENDA still applies; the bar only rises):
1. RE-RUN EVERY round-23 scenario of your group (old s*, the prerequisite p*, the age a<X>*, the territory, owner-like and look-back ones),
   replaying round 23's controls/answers with your round-23 harness; add new replies only where round-24 rules require. For each round-23
   defect id (round23X/defects.md or CATALOGUE.md) write a line «<id>: FIXED | STILL | CHANGED (how)» with the turn p<N> as evidence.
   Every defect binds, S3 included, PASS scenarios included.
2. AGE: in every age scenario give the birth date at least once in JALALI the way a real Iranian user types it (e.g. «۱۲ خرداد ۸۸»,
   «متولد ۱۳۸۸/۳/۱۲», «۱۵ سالمه، تولدم ۲۰ اردیبهشته»), once with Latin digits, and once an invalid day (e.g. ۳۱ اسفند of a non-leap year)
   to judge the error line. Judge: stored date equals the ICU conversion; band and «# مخاطب» block; register; the mind card band line.
   Each group adds ONE more age scenario at an age not yet covered by your group (child 6–8, early teen 12–13, 80+ …).
3. TERRITORY LOOP end to end, in every territory scenario: gap sheet filed → waiting marker visible in 🔭 / 🧭 / 📜 (shoot each) → simulate
   the build through a REAL path the owner would use (a reply on the sheet «پاسخ به برگهٔ دستیار #n» in «نظارت و سرکشی», or a real registry
   entry in a scratch copy of the page — never by poking page internals) → the page notices, verifies, writes «ابزارِ لازم آمد» in Today,
   resumes the exact step → she finishes the problem. Also run the negative arms: a reply that does NOT answer the step (must not resume,
   must say why) and «خودم یه راه دیگه پیدا کردم» (sys_done ⇒ state other). Record how you simulated the build.
4. CHAT ⇄ PAGE: in at least three scenarios per group work mainly in chat, then open the live problem page/forms: the forms show the chat
   work as «از گفت‌وگو: … درست است؟», the stage matches, nothing asked twice; shoot the route map of the chat problem at three moments.
5. OWNER QUESTION BANK (roadmap §20, docs/tours/owner-question-bank.md): across the four groups every bank question must be asked at least
   once in natural words inside a real problem. Group A: questions 1–4, B: 5–8, C: 9–12, D: 13–15 plus any added since. For each: «هست —
   کجا — چطور (evidence p<N>)» or «نیست — برگهٔ … با دلیل». A show or a generic answer is a defect. Add new questions you think the owner
   would ask to «## ایده‌ها» and to the final message (the main session updates the bank).
6. Regressions: everything rounds 21–23 marked fixed; the round-23 test files (test_tour1_r23_*.js) name the exact sentences — re-try
   them in the live page with the real model, not only the mocks.
7. Dataset addendum unchanged (p<N> on every line, better/r<N>.txt for every failed turn, keep ai/ folders, ≥1 look-back scenario).
Everything else as RUNNER23 (harness, shots, ZERO-DEFECT, two need maps, «ارتقای لازم», mind card plausibility, strict prompt scan,
routing table, round24<X>/<sid>/, DONE, e-mails «🧭 پولیا · دورِ ۲۴ · …», never pkill others, delete only browser profiles).
Final message: per scenario RESULT + defects (with p<N>) + «ارتقای لازم» + the round-23 defect table (FIXED/STILL/CHANGED) + age verdicts
(incl. Jalali checks) + territory-loop verdicts (positive and both negative arms) + chat⇄page verdicts + owner-bank table + correction table
vs round 23 + routing + PARTS.md summary with «نسبت به دورِ ۲۳» + new owner-like questions.
