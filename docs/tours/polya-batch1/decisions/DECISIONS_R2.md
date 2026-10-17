# Round-2 root-cause decisions (main session; binding for both fixers)

Read all four round-2 reports first: reports/rerunA.md, rerunB.md, rerunC.md, rerunD.md (evidence in rerunX/<sid>/findings.*).
The goal is that the PAGE and the PROMPT it sends ENFORCE Pólya's spirit, not that a good model happens to behave well.

R1 — Stop gating the solving coach on regexes (structural; most PARTIALs come from this).
  - A session that created or opened a live problem is BOUND to it (fix live_new binding; never rebind another session; a session keeps its
    lprob until the user switches). While bound, its live block is ALWAYS in the prompt (compact), regardless of word overlap or view.
  - For any user turn that is not clearly page-help/navigation/small-talk, include a compact **solving-coach block** (the Pólya teacher rules:
    one question at a time general→specific, never give away, after silence repeat with small variation, which phase the user is in, the
    phase's questions, end-of-ladder rule per C188 = isolate the key idea and give ONLY the next step, then "close the book and redo",
    small successes matter, think aloud by MODELLING one short inner-dialogue line, imaginary teacher, every proverb has its opposite, look-back
    is the most important part / no problem is ever finished). Detect "not a problem" by a short negative list (greeting, thanks, page/how-to-use
    questions, settings), NOT by trying to recognise every problem phrasing. Keep SYS ≤ 20000; hooks go in the user message.
  - The chat coach gets a real question list (phase-aware, kind-aware) — never `qs: []`.
  - Discouragement: also rely on the model-facing rule ("if the user shows discouragement/shame/giving up, offer 🌱 the smallest next step")
    instead of only a lexicon; keep the lexicon for page-side cards and extend it (ولش کنم، پس راهی نیست، هیچ کاری نمیشه کرد، عصبانیم، وقتم هدر
    رفت، استعدادشو ندارم، انصراف بدم، خجالت کشیدم).
R2 — One source of truth for a problem's KIND (life / practical / objective) and spatial flag.
  - Stored on the record; never overwritten by a draft default; prove/pod ⇒ objective; children (look-back new problem, invented, chat_invent)
    INHERIT parent's kind and spatial flag; the code's suggestion is PRE-SELECTED (user can change) instead of defaulting to life; Persian
    digits in natGuess; spatial detection by explicit choice + suggestion (not forced by words like «حجم»/«چیدمان»; add «مماس/مسیر/حوض» only as
    suggestion).
  - Everything kind-aware: exec question (objective ⇒ «روشن می‌بینی؟ می‌توانی ثابت کنی؟», base cases for induction/«n ≥ k»), back-phase
    questions (proof ⇒ every hypothesis used? where did the argument use the definition (Pascal)? equivalence after transformations), tour
    milestones (objective facets don't need prediction/outcome).
R3 — "Used datum" must be honest.
  - Chat mentions do NOT count as use (dismissal is common). Use = referenced in plan/steps/backwards/notation/equations, or explicitly set aside
    with a reason. Extend NEG for page text too (بی‌فایده، تزئینی، به درد نمی‌خوره، مهم نیست…). Stem bug «مرز»≠«مربع».
  - Condition parts from understanding are listed at plan and execution: "which part of the condition does this step/equation use?"; count
    equations vs unknowns when the user writes equations.
R4 — Gates must check SUBSTANCE, not word overlap.
  - "New problem" in look-back and "related" checks: the user declares WHAT is shared (method / unknown / data / condition / form) from a select +
    one line; the code checks only that it is not a near-copy and the line is specific. No "nothing in common" rejection by words.
  - Plan-move reason: anti-copy only against the statement, not against shared words. Plan-switch: compare against the plan's declared steps
    and allow declared rotations.
  - "Whole in one sentence": near-copy check only; no "shorter than statement" rule for short statements.
R5 — Closure honesty.
  - An auxiliary problem solved ≠ main solved: require the bridge back (how the aux result gives the main result) before «حل شد».
  - Look-back that reports a defect (unused hypothesis, conclusion ≠ claim, «ایرادی یافتم») cannot close as solved; status «ناتمام — برگرد به …».
  - After a full proof, the guess panel shows «اثبات شد» (not «۵۰٪ هرگز یقین»).
  - «حدسم نادرست بود» ⇒ follow-up: why did intuition fail / which hidden assumption.
  - 100% claims (wanted or not) get the prove-or-refute challenge; lpIfRef «آزمون را نادیده می‌گیرم» gets Pólya's reaction.
R6 — Relevance for «دانسته‌های قلمرو» / «حوزه‌های هم‌خوان»: show only with an explicit link (problem/knot/case already linked to the area) or ≥2
  distinctive shared terms after morphological normalisation (no prefix matches like «مقابل»~«مقابله», «رشد»~«رشد پس از سختی»); otherwise nothing.
R7 — Phases record (A.MIND.phases) must count chat-coach failures and knot/sieve findings per phase, and must not count an assistant-made look-back
  (chat_solved) as the user's success unless the user wrote it.
R8 — Smaller items from the reports (all listed there): duplicates from chat_solved (update not create), confirmations in chat, «امروز» counts/wording,
  mid-course check-in on long problems from the problem's own ladder, taste field in look-back (C120/C117), figure prompt in chat (B139),
  stall nudges never after the user's deadline, e-mail after a facet milestone, off-path station save button, chart title contrast, «دو جواب»
  in an objective step ⇒ sufficiency link, «کدام پرسش کمک کرد؟» lists only questions, idea_counter `nt` dedupe bug and false «انجام نشد» turn,
  bidi of → and unit formulas, units check in «ریاضی‌کردن», guess-kit table internal checks (did you count all? does your recurrence reproduce
  your own table?), isomorphic problems via the user's own declared mapping, attachments linked to the live problem, pod card labels.
