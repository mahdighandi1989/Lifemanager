# Tour batch 1 (Pólya) — ROUND 23 (read RUNNER.md … RUNNER22.md incl. all ADDENDA, then this; this overrides)

Page: main after the round-22 merge (bd687cfb or later; `build.py --check` in sync, dist newer — else STOP). What changed: DECISIONS_R22.md,
handoff notes docs/overhaul/handoff-notes/_pending_tour1_R22_{prereq,correction,turnq,practice}_*.md and _pending_age_*.md.
- Prerequisite layer: coach_state.prereq {concept, step, quote} validated by the page; diagnostic question; teach only as far as the step;
  mastery re-check; stack of waiting places (nested, several); exact return; 🧩 item with pid; mind card cause per stuck (prerequisite /
  knot / skill / «هنوز نامعلوم»), prerequisite stucks never a weak stage, learning = progress; «خنگم» ⇒ the named gap.
- «🧭 نقشهٔ مسیرِ مسئله» (view route + geography strip): origin → now → destination, dotted detours, back-jumps for corrections, hover details.
- Corrections: same fact by meaning (units, number words), single application of ✏️, basis-only set-asides, deadlines, «بله» reaches the model.
- One turn question per prompt (prerequisite stack first); message classification (practice/self-rating/correction notes are never problems).
- Practice: every judgement books its session; practice_log matches by numbers; plan ⇄ case; her rhythm; misfit warning.
- Running lists: lifecycle, links to problem/session, dossier + mind card, assistant list_add/list_update.
- AGE (first round): «# مخاطب» block by age band (child 0–5 / 6–11, teen 12–17, adult, 60+), minors' safety lines, birth-date card, mind card
  compares only within the person's own band; under 18 and 50+ ⇒ «برای این سن هنجارِ معتبر در دست نیست».

REQUIRED THIS ROUND (everything in RUNNER22 still applies; the bar only rises):
1. AGE SCENARIOS (roadmap §14): each group adds THREE new age scenarios across topics, e.g. a 9-year-old with a word problem, a 14-year-old
   with a study/school decision, a 16-year-old with a proof, a 67-year-old with a health or money plan, a 72-year-old learning a new skill.
   Set the person's birth date the way a real user would (the birth-date card, or her own words to the assistant). Judge: tone and language
   fit the age (no childishness for teens, no condescension for elders), engagement, real arrival at the result (not a show), minors'
   safety lines, the mind card's age-band comparison or the honest no-norm line, and the Pólya logic unchanged. Re-judge the existing
   scenarios whose persona states an age (all 38 do): does the page now use that age correctly once the birth date is given?
2. PREREQUISITES: re-run every round-22 prerequisite scenario (pA*, bp*, pC*, dp*) and judge P1/P2 fully: exact concept and step named,
   diagnostic question, teaching only as far as needed, mastery check, nested order, exact return, 🧩 linked, mind card causes, «🧭» map
   (shoot it at three moments: before the detour, inside a nested detour, after the return; hover one point of each kind).
3. Re-run every round-22 correction trial and every running-list scenario; judge against round 22.
4. Look for regressions of everything rounds 21–22 marked fixed.
Everything else as RUNNER22 (harness, shots, ZERO-DEFECT, two need maps, «ارتقای لازم», mind card plausibility, strict prompt scan,
routing table, round23<X>/<sid>/, DONE, e-mails «🧭 پولیا · دورِ ۲۳ · …», never pkill others, delete profiles).
Final message: per scenario RESULT + defects + «ارتقای لازم» + age verdicts + prerequisite verdicts + correction table vs round 22 + routing
+ PARTS.md summary with «نسبت به دورِ ۲۲».

ADDENDUM — dataset (roadmap §17, docs/decisions/2026-10-18-tour-dataset-for-local-model.md; collector scripts/tours/collect_dataset.py):
(a) Name the turn in every defect, criterion verdict and need-map line: write «p<N>» (the ai/pN.json number) at the start of the line,
    or «scenario» if it truly has no single turn.
(b) For every turn you judge as FAILED, write the reply that should have been given to `<sid>/better/r<N>.txt`, using the same output format
    as the model. Label it in the first line `# author: runner-simulated`.
(c) Keep the ai/ folders (pN.json + rN.txt) of every scenario. Do not delete them at cleanup. Delete only the browser profiles.
(d) Each group adds at least one LOOK-BACK-family scenario (Pólya's fourth stage as the main act): the dataset currently has only one.
