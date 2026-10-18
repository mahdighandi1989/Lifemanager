# Round-20 decisions — ROOT MECHANISMS + model tier (main session; binding)

Round 20 (main a94614ae; first round with correction trials, dossier, parts tables, simulated time and the model-tier tour):
zero-defect A 3/10 (s05 s09 s10) · B 0/10 · C 0/9 · D 3/9 (s32 s33 s36) = 6/38. Written criteria pass almost everywhere; the new
infrastructure (19b/19c) failed its first real use — correction trials failed in all 8 scenarios that ran them. Model tier (8 scenarios,
same prompts): simulated 4 pass/2 partial/2 fail · haiku 2/2/4 · sonnet 4/4/0. Reports: reports/round20{A,B,C,D}_handback.md,
round20X/<sid>/findings.md, round20X/PARTS.md, models20/SUMMARY.md. DECISIONS_R2–R19c bind except where replaced.

## Root mechanisms

RO1 — A CORRECTION REVERSES BY MESSAGE, NOT BY FACT (A·A5, B·D2, C·C20-1/4/5, D·1/2). Everything derived from the corrected message is
  withdrawn (mind events, verdicts, «حل شد»), the corrected text is not booked again, and the thing actually corrected often does not
  change. ⇒ every derived record carries src {sess, msg, span (the sentence or clause it came from), key (what fact: datum:x, guess:g1,
  plan:pl1, step:st2, lesson, verdict)}; a correction changes only records whose span overlaps the corrected fragment or whose key the
  model reports; the corrected content is re-booked as a new act from the current message; a verdict changes only if a datum it used
  changed; withdrawn ≠ deleted (history stays).
RO2 — RECORDS WRITTEN WITHOUT A SOURCE (A·A2, B·D1, C·C20-2, D·3/4). chat_invent / chat_solved problems, assistant form fills, the
  look-back lesson, cards, deadlines/reminders, statement and understanding fields: no src, so nothing follows a correction; page-typed
  copies of the same fact never follow. ⇒ every write path from chat stamps src; for copies typed by her on the page (same key/text),
  the page asks once «این‌جا هم عوض شود؟» with both values, never silently overwrites her own typing.
RO3 — THE ASSISTANT CLAIMS BEFORE THE PAGE CONFIRMS (A·A1, B·D3, D·3). The prompt says «صفحه برمی‌گرداند/انجام داد» before the page has
  done anything; refusals are not told. ⇒ the model learns what changed only from the page's result block of the NEXT turn (or the same
  turn when the page applied it before the reply is shown); a refusal is shown to her in one plain line and to the model with its reason.
RO4 — CORRECTION MATCHING IS RAW TEXT (A·A1 «شنبه» ⊂ «پنجشنبه» S1, B·D3 punctuation, A·A16/B·D4/C·C20-9 garbled replacement, models
  class 4 «پس جوابم غلط بود» not seen as self-correction). ⇒ normalized token matching (punctuation, ZWNJ, Persian/Latin digits,
  word boundaries); replace the minimal differing span between old and fix; the self-correction signal is validated from the model's
  retract report + the fragment existing in an earlier message of hers, not from a closed phrase list (patterns may only ask).
RO5 — THE ✏️ PATH (A·A3/A4, B·D5/D17, C·C20-6/7, D·9). Editor text invisible; the ✏️ system turn gets the «اصلاح شاید» fallback and its
  coach_state books evidence; ✏️ books no self-correction. ⇒ visible editor (contrast in both themes); the ✏️ turn is system-origin:
  no fallback, no evidence booking except the self-correction look-back event; one engine for chat and ✏️ (C PARTS verdict «ادغام»).
RO6 — THE DOSSIER IS BUILT FROM SOME RECORDS, ORDERED BY SAVE TIME (A·A6/A7, B·D7, C·C20-10, D·5/6/15). ⇒ one event log the dossier reads:
  every act with src and time (chat plans, corrections, chat-closed problems, practice sessions, check-ins, day-N returns, Today
  answers), ordered by event time; a dossier for sessions without a live problem; one status source (no «در جریان» next to «هنوز
  نرسیده»); typed rendering (no «[object Object]»); dossier and mind card read the same act signs.
RO7 — ONE ACT, MANY RECORDS IN PRACTICE / TODAY (A·A8/A9/A10/A11, B·D8/D9/D10/D11/D12/D16, C·C20-11/12/13, D·7/8/11/12).
  practice case vs P3 1-3-7 cycle vs T41 worksheet vs 🔭 spaced review; T24 rows vs 🎯; plan vs 🌱 vs live step; `withdrawn=[]` read as
  withdrawn; guessStatus reading only prcTests; `new Date()` in a41; default routine shown to every new user. ⇒ the practice case owns
  the schedule of every record linked to it (linked dated items close/advance when a case session is logged, one Today line per act);
  T24 is two-stage (each prediction becomes a dated 🎯 when written; reflections after outcomes; next turn from the open criterion);
  plan ⇄ live step ⇄ 🌱 linked at creation (one-click «همان برنامه؟»), one state; guess status from the problem's guess records;
  mind card reads practice records (fix the truthy-empty bug) one row per case with the measured values; built-in routines appear only
  after she starts them; a41 uses A.now; start_practice consent from the model's validated report (not keywords); the practice block
  appears in the prompt whenever an open case exists for the subject, plus a chat action to log a session.
RO8 — TURN QUESTION / REGISTER / DEFER EDGES (A·A12 register from a quoted textbook line, A·A13/B·D15/C·C20-15 defer residue, A·A14
  e4/e5 alternating, B·D13 A191 «اول کل» regression, B·D14 questions after corrections, D·13 headers after «بعدی؟»). ⇒ quoted text
  («…», after «سؤال:», pasted statements) never counts as register evidence; a request already satisfied by an action in the reply is
  not a defer candidate; a question answered through a form is not re-asked; the A191 intro condition is restored (root-cause the
  regression first); after a correction the turn question is recomputed from the corrected state; post-closure headers follow the
  phase of the open item or are omitted.
RO9 — SMALL (D·14 «y=۲ (۳۵۲)» run boundary; A·A15 «➕ افزودنِ نقطه» opens another plot's form; A·A17 «ردش» split; C·C20-14 ⏱ badge
  covers «↩ برگرد»).

## Model tier (roadmap §11 — decided by the data)

MT1 — page compensations (both tiers benefit): stage from her own evidence, never from the model's phase label alone (models class 1);
  accept the harmless format aliases (top-level retract, taste as object, said:result without text → ask); tolerant quote matching
  (normalized tokens / formula notation) + one structured re-ask; a targeted line when a live step is open («آیا این پیام نتیجهٔ گامِ N
  است؟»); open every live problem created on her request, chat_invent only on her request, and chat_invent → live_new when she asks to
  work now; post-check: one question per turn and no «حل شد» confirmation (one rewrite request); register post-check; habit / plan /
  health-habit problems are in scope of the life tunnel (prompt); a one-line «وضعِ کنونی» summary at the top of the prompt; for counting
  problems, check the statement's plurals before reducing to two unknowns (s31).
MT2 — routing: coaching turns on deep, ill-posed or life problems go to a stronger tier (evidence: haiku FAIL 4/8 → sonnet 0/8 on the
  same prompts; the decisive-turn judgment is the difference). New task route «lla_coach» (catalog, preferred: the balanced/reasoning
  tier — not the top tier; requires vision + documents) used by the page when the coach layer is active (live problem in focus, tour
  coaching, look-back); action-only and automatic follow-up turns stay on «lla_assistant» (fast). No model names hard-coded; the auto
  model selection picks within the tier. Backend change: app/services/ai/catalog.py + app/routes/app_records.py `_AI_TASKS` — check
  docs/supervisor/ownership.json and record with handoff.py if outside the LLA area.

## Fixers (four worktrees)

- coach (a27, a29): RO1 (coach side + re-book), RO3, RO4 (matching), RO5 (✏️ turn handling), RO8, MT1 (prompt/validation parts),
  mind-card reading of practice (RO7 truthy bug + one row per case).
- live+dossier (a38, a40, a26 bubble): RO1/RO2 (src stamping on all live/chat write paths, page-typed copies prompt), RO5 (editor), RO6,
  MT1 (open live problem on request; chat_invent → live_new), RO9 (A15/A17 if a38/a39 boundary).
- practice+sched (a41, a42, a31/a33 hooks): RO7, RO9 (badge), D·7 T24 two-stage.
- routing (backend + the one page call site): MT2, with backend tests (pytest) and the page test that coaching turns use «lla_coach».
Independent bank VARIANTS_R20 (written in parallel, no code). Docs numbering: coach WORKLOG (80)/PROGRESS 96, live (81)/97, practice
(82)/98, routing (83)/99. Before final commit merge the integration head; whole page suite + pytest for the routing fixer.
