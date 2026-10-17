# Round-4 root-cause decisions (main session; binding for both fixers)

Round 4 = 16 PASS / 22 PARTIAL / 0 FAIL (round 3: 11/24/3). Read reports/round4A.md, round4B_handback.md, round4C_handback.md,
round4D_handback.md (+ round4X/<sid>/findings.md). DECISIONS_R2.md and DECISIONS_R3.md still bind.

The dominant remaining class is ONE root cause: the chat coach infers the user's state (parts stated, question answered, result stated,
stuck/failed, teacher role, kind) from loose regexes — wrong in both directions (statedParts: any «؟»/digit/«فقط»; answeredIn: any later message
or 60% token overlap; RESULT_RE / UNSOLVED_RE / STUCK_RE / TEACH_RE / LIVE_ASK misses; FIRST_P too loose). More regex will not end it.

E1 (structural, coach fixer) — the model REPORTS the turn's state; the page VALIDATES and keeps the ledger.
   - Add a compact instruction in the coach hook (NOT SYS; SYS stays ≤ 20000): at the end of every coaching reply the model emits one action
     {"do":"coach_state","ph":"u|p|e|b","said":["u","d","c","plan","result"],"ans":["<question id>"…],"stuck":bool,"fail":bool,
      "role":"self|teacher","nat":"objective|practical|life|?"} describing ONLY what the USER's last message did (not the model's reply).
     Question ids = the ids the hook already lists for the current phase (give each listed question a short id in the hook).
   - The page treats it as a CLAIM checked against the user text: an «ans» counts only if the user's message after that question is
     non-empty and not a stuck/«نمی‌دونم» reply; «said» parts count only if the user's own text (not a pasted statement before any problem,
     not the model's text) is non-trivial; «result» moves to look-back; «fail» feeds A.MIND.phases (R7). nat from the model is only a
     SUGGESTION (user's explicit choice wins, D1/D4).
   - The regexes stay as the FALLBACK when the action is absent (behaviour-preserving), but tightened per the reports: statedParts needs a
     bound problem or explicit «مجهول/خواسته/می‌خوام بدونم…» phrasing (no bare «؟»/digit/«فقط»); RESULT_RE adds «جواب X»، «پس X = …»،
     «رسید به …»، «تموم شد دیگه»، «پرونده رو بستم»، «خودم ساختمش»; UNSOLVED_RE adds «غلطه»، «نمی‌شه!»؛ STUCK_RE adds «پس راهی نیست»،
     «هیچ کاری نمیشه کرد»; TEACH_RE adds «شاگردام»، «تو شاگرد باش من معلم»، «دخترم/پسرم یه مسئله داره… چطوری بهش بگم»; LIVE_ASK adds
     «یه مسئلهٔ واقعی دارم… با هم حلش کنیم»، «مسئلهٔ حل‌نشدهٔ خودم»، «یه برنامهٔ دقیق می‌خوام»; will hook adds fatigue «خیلی خسته‌ام… تو رو خدا».
   - Test with a literal-average-model stub that DOES emit coach_state and one that does NOT (fallback path).
E2 (live fixer) — kind suggestion: practical needs the user's OWN real-world stake (first-person + a real resource/deadline/consequence
   that is the user's), not first-person plural textbook wording («داریم/کنیم/اضافه کنیم/تحویل بدم» in a problem with complete numeric
   data and a single computed unknown ⇒ objective). natGuess for an ethics dilemma ignores money words. «آیا…؟» statements suggest pod.
   live_new carries the type (prove for «ثابت کنید»), and look-back children get their own type, not the parent's.
E3 (both) — question lists: practical and life lists are Pólya's core list REWORDED, never a subset. Every kind keeps: «به مجهول نگاه کن»,
   «به تعریف‌ها برگرد» (regression s13), «مسئلهٔ مرتبط — نتیجه یا روشش؟ عنصرِ کمکی» (regression s35), «دادهٔ دیگری لازم است؟»,
   «مسئله را به شکلِ دیگری بیان کن» (exec, after a failed step), «از خواسته به عقب» which is SUGGESTED FIRST when the user is stuck going
   forward in plan (s08). Life pod wording: no «حکم تهی»/«اثباتی» on a life pod; pod understanding card uses «فرض/حکم» not «مجهول/داده».
   The hook list is not cut at 7 when the suggested question is beyond (s11). B3 («همهٔ داده‌ها؟») only after a plan exists or the user is
   stuck — never at the start of planning.
E4 (live fixer) — heuristic gates WARN, they do not BLOCK. A check that can be wrong on wording (circular reason, approximation, limit case,
   units, «کجا خط می‌کشی»، near-copy, ±10%) shows its challenge once and offers «ثبت با همین — دلیل:…» (one line, stored); only
   substance-verified checks block. Fix the false positives too: CIRC_RE drops «معلوم است»; circular = the reason asserts the unknown's
   value/identity, not merely mentions its word; APPROX accepts word quantities («ده سانت»، «نصف خانوارها»، «±۱۰٪»); limit-case required only
   for objective find problems with numeric data (chess square names are not data); units checker splits on ⇒ / → / «پس» too; lpPrApprox
   accepts non-numeric unknowns (who/which) with «تقریب لازم نیست — مجهول کیفی است».
E5 (live fixer) — look-back checks the result against EACH recorded condition part (checkbox per part: «نتیجه این بخش را برآورده می‌کند؟»);
   any «نه» or a check text that negates a part ⇒ «ناتمام — برگرد به …», never «سالم» (s01, s09). Pod look-back gets a third option
   «هیچ‌کدام — استدلالم شکاف دارد» (s27). A saved presupposition (suffCirc) is raised again when a step result contradicts it (s22).
   The step outcome moves the exec question to «فاصله با پیش‌بینی…» (s04, s07). Analogy limits are asked whenever a ratio/relation is
   carried to a new quantity in a step or chat («X هم ... برابر؟») — usesAnalogy extended (s23). lpBBest always present, listing page- and
   chat-answered questions as whole questions. Aside-data («تزئینی») is raised again when the user is stuck. Isomorphism mapping is carried to
   the child page and its hook (s24). The equations verdict reaches liveCoach.q (s26). Indirect⇒direct offered for any proof-shaped step.
E6 (coach fixer) — R6 territory relevance, third time: drop single-word matching for user turns. Show a territory only with an explicit link
   (problem/knot/case linked to the area) or ≥2 whole-word shared terms that are DISTINCTIVE — a term shared by more than half of all
   territories is not distinctive (A4's > ½, no tuned number). Add a test with the noisy pairs from the reports (ln_attention, ln_dual_coding,
   sf_personality, sf_intelligence_g, dc_premortem, dc_habits, dc_sunk_cost, «امن»→اجتناب، «دو روز»→منحنی فراموشی، «اسناد»).
E7 (coach fixer) — chat_invent twin check compares digits/numbers too («جمعِ ۱۰۰۰» ≠ «جمعِ ۱۰»), and paraphrases of the look-back child
   (same parent, same numbers, near-copy after normalisation) update instead of creating a second record (s11, s25, s31).
E8 smalls (owner as listed in the reports): incubation card «دیروز» at +2 days ⇒ real day count (live); idea hook not on «ایده برای پلان» /
   incubation insight (coach, a35 — record cross-file); stale toasts dropped from «پیام‌های اخیرِ صفحه» once the save succeeds (live/a26);
   empty 🌱 card after save (live); mid-course check-in shows saved state (live); bidi of «cm³/s ÷ cm² = cm/s» and «y→0» (a26); induction
   question not truncated in the hook; lpSuff options per type; stepFollowsTag respects «کیش نیست»; kCountRe «روش»; Pascal's rule in prove/pod
   exec list; after a defect, livePhase/closure.back/view agree; «آزمون را نادیده می‌گیرم» needs a reason that names a test cost/risk; objective
   problems get no «پیش‌بینی در موعد» life wording; practical look-back units field; spatial look-back «بیش از یکی؟» follow-up; lpBDep select
   label/value made unambiguous (class d confusion in s-B); the user's own proverb gets a prompt line; inventor's paradox / «قارچ‌ها خوشه‌ای»
   / «اثباتِ اکتشافی را ناتمام برچسب بزن» / «به تعریف برگرد» lines in the matching phase hooks (from coverage.json items, not invented).

Process: same as DECISIONS_R3 (own worktree based on the CURRENT branch tip a5e54dc — check `git log -1` first and fast-forward if needed;
commit early and often; red-baseline tests on the real path; edit only src/ then build.py; SYS ≤ 20000; no conventional numbers; no islands;
no push/merge/docs; a handoff note `_pending_tour1_R4_<live|coach>_2026-10-16.md`; final report per item).
Ownership: «live» = a38_live.js (+a29, a26 bidi/toasts); «coach» = a27, a28, a35, a36, a37. E3 touches both: list CONTENT lives in a38 (QK),
coach consumes it — the live fixer owns the lists, the coach fixer owns ordering/suggestion and the hook cut-off.
