# Round-21 decisions — ROOT MECHANISMS (main session; binding)

Round 21 (code ef3c1c67 = R20 fixes): B 0/10 · C 0/9 · D 0/9 · A (see addendum) zero-defect. Written criteria pass almost everywhere.
Correction engine much better (B s18 6/6; C 5/10 full + 4 partial vs 1/6; D plans/lesson/✏️/non-corrections ✓; non-corrections 100%
unchanged; no claim before the page result). Model tier: models21 prod 5/2/1 · models21 haiku 1/5/2 (models20 haiku 2/2/4 · sonnet 4/4/0) —
routing confirmed; page compensations lifted the floor (FAIL 4→2, pivotal-turn failures 4/8→1½/8). Reports: reports/round21{A,B,C,D}_handback.md,
round21X/<sid>/findings.md + routing.md, round21X/PARTS.md, round21B/CATALOGUE.md, round21C/defects.md, models21/SUMMARY.md.
DECISIONS_R2–R20 bind except where replaced.

## Root mechanisms

R1 — ROUTING BY KEYWORD (B·D1, C21-1, D·1, models N1: 12/51 prod, 19 in B, 12/89 in C, 23 in D — the decisive opening turns). ⇒ AS.chatTask
  decides from the page's own classification, not message regexes: lla_coach whenever the coach layer is on for THIS turn — a chat problem in
  focus (the same condition that writes «مسئلهٔ گفت‌وگو» into «# وضعِ کنونی»), the «# مربیِ حل» block, a live problem, a tour tutor block,
  look-back, a correction typed in chat, an open practice case being worked; also her first message that states a problem/decision (the
  page's own problem detector). ACT_ONLY only for messages that are nothing but a command (mixed «…ثبتش کن» stays coach); the «باز کن» check
  comes after the live-problem head. ✏️ turns and «[سامانه …]» follow-ups stay lla_assistant; rewrites keep the turn's tier.
R2 — PRACTICE CANNOT START FROM CHAT (B·D2, C21-2, D·2). ⇒ start_practice is described in the prompt whenever the session has a subject
  (problem, technique, chat problem) even with no case open, and at look-back as an offer; the technique list sent to the model is complete
  (no 1–25 clip); the «🧪» view gets a start button; consent rule of R20 unchanged.
R3 — A CORRECTION DOES NOT REACH EVERY RECORD OF THE FACT (B·D3/D4/D7/D13/D14, C21-3/4/5/6/16, D·3/4/5/6/7). ⇒
  (a) ONE result structure {changed[], ask[], note} shared by a27/a38/a40; the model receives it verbatim in the next (or same ✏️) turn —
      nothing starting «چیزی…» is dropped, a no-op or refusal is told to her in one plain line;
  (b) a record composed from several messages carries one src per span (statement/title filled by the assistant from two messages, or in a
      «[سامانه]» follow-up ⇒ src = her messages it quotes); plan src always has a span;
  (c) «same fact» by meaning: normalized value+unit equivalence (۲۰۰ مترمربع = 200 m^2 = ۲۰۰ متر مربع), plus the model may name the page
      field (retract.key = field:<id>); copy candidates include 🌱 check-ins, step outcomes, plans, look-back fields, understanding-form
      fields (field-level keys); stale drafts and placeholders are never candidates; labels shown are her field names, never ids;
  (d) dependencies: a verdict, guess outcome, «حل شد» or check records the data it used; a datum changed by retract OR by «بله» to the copy
      ask sets those aside with the reason (execution reopens);
  (e) deadlines: span = her clause, `deadline` in the prompt's key list, the reminder follows;
  (f) minimal span everywhere: lesson clause, ✏️ edits changing several numbers ⇒ one fragment per changed span;
  (g) the corrected content is re-booked (result, lesson) and the self-correction event is booked for every accepted correction;
  (h) the change line shows the differing fragment (no common-prefix clip); a chat-corrected bubble is marked and its plot redrawn.
R4 — SESSION DOSSIER THIN / RAW (B·D5/D9, C21-13/14, D·11/12). ⇒ «📜 پروندهٔ این گفت‌وگو» reads the same event log: chat guesses and verdicts,
  chat plans, corrections (including no-ops and refusals), practice_log sessions, T24 judgements, 🎯; correct title when a live problem
  exists (link to its dossier); chat-closed problems keep their chat work; never raw keys («chat|», «chatok|», «rebook:», «more»,
  «intuitive» ⇒ VERD_FA); «منبع» points to the message the text came from; a practice report in a new session is not a new chat problem.
R5 — PRACTICE TIME RULES (C21-11/12/17, B·D6/D11/D15, D·8/9/10). ⇒ stability only from the technique's own evidence AFTER the last failure
  (the run of successes at growing intervals the technique names; a regression resets the run; «زودتر از موعد» never labels a failure);
  T24: the worksheet row IS the 🎯 record (one record; practice_log and page judgement both judge it; case due advances); T23 due never
  NaN (all step shapes); a case on a live problem owns every linked dated item (lesson card for T28 like T41); overdue label on the case
  line; recall-trend chart from case sessions; practice_log accepts «دیروز/…» as the session day and a typed number; her own rhythm
  («هر دو هفته») sets udue; calibCrit shows nothing until data; a one-night 🌱 expires after its day.
R6 — FLOOR-MODEL COMPENSATIONS (models21 classes 2/5/7/12, N3/N4/N5, C21-8/15). ⇒ closure fallback: verified answer + her stated lesson
  and no chat_solved ⇒ the page books the lesson and asks HER «حل شد؟» once (N5); result+fail while a live step is open ⇒ the page asks
  «نتیجهٔ گامِ N؟» with buttons (class 5); «ثبتش کن/ثبت کن» about the problem she is working on ⇒ live_new opened (chat_invent only for a
  problem she asks to keep for later) (class 7); guess/defer quotes matched by normalized tokens and formula equivalence, a refusal shown
  to her and the model (class 2); the same file id re-asked after the model said it did not receive it ⇒ stop and tell her (N3); notes
  addressed to the model are never shown to her — a refused deadline / chat_invent gets a user line + one corrective turn (N4, C21-8);
  «صفحه در پیامش نتیجه‌ای نیافت» only when her message holds no result (C21-15); mind card weakest stage from her evidence, not the phase.
R7 — POST-CHECK ACCURACY (B·D10, C21-7, D·10, models). ⇒ two independent questions in one reply (two «؟» with separate asks, not an
  «… یا …؟» alternative) trigger the rewrite; not claims: «صفحه می‌گوید/کجاها عوض شد/فرستادم»; «می‌گوید» is not «شما»; «پرونده» of the
  factory is not a practice case; one turn question after a correction.
R8 — TURN QUESTION / STATEMENT EDGES (C21-9/10, B·D12, D·10). ⇒ the unknown is never her own sentence («مجهول هنوز «سه تاشو چک کردم»»); the
  closure message is never taken as the statement; ✏️ substitution leaves no stray words; no taste question on a datum-correction turn; a
  question already answered is not re-asked.
R9 — SMALL (D·s31 her 3 look-back «new problems» lost ⇒ kept in the look-back; «خفته تا» never a past date; B·s19 weight log as records so
  the plot follows a correction).

## Fixers (four worktrees)
- route+coach (a26 chatTask, a27): R1, R3 coach side (a, f lesson, g, h), R6 (closure fallback, step alias, quote matching, mind stage,
  C21-15), R7, R8.
- live+dossier (a38, a40, a33 deadlines): R3 (a page side, b, c, d, e, f ✏️, h bubble/plot), R4, R6 (live_new on «ثبت کن», reread stop,
  user lines for refusals), R9.
- practice (a41, a42, a36): R2, R5.
- (no backend change expected; if one appears, record it with handoff.py)
Independent bank VARIANTS_R21 (parallel, no code). Docs numbering decided at merge (check origin/main for routine entries first).

## ADDENDUM — group A (round21A; A 0/10 ⇒ round 21 total 0/38)
A adds no new root, but confirms R1/R2/R3/R4/R5/R7, and adds these binding items:
- R7+ (A21-1): the register check reads «تو/شما» only from pronouns and verb endings at the end of a word whose stem is a 2nd-person verb
  form. Never from «باید/نباید/بیاید/می‌گوید/بیشترین» or other 3rd-person and modal forms. A false rewrite is a defect.
- R8+ (A21-2, regression): after a step outcome with her reflection, the turn question moves to the NEXT open item (next step, look-back,
  restatement if she asks for it). Never back to e1 of a step that no longer exists. Root-cause the R20 #142 `L.c0Asked` change.
- R3+ (A21-3/4/5/6/7/19/20): «خونه/خانه، می‌ارزه/می‌ارزد، نفر/همکار» colloquial ⇄ written equivalence in same-fact matching; conditions
  and «متناقض» judgements that hold the corrected fact are copy candidates / set aside; the coach-side replacement must not garble (A16
  remainder); a correction message is never offered as a «صورت» candidate; «هیچ رکوردی ساخته نشده بود» is never shown on a repeated ✏️ when
  the earlier one did change something; the result block must agree with the page lines in the same prompt.
- R5+ (A21-9/10/11/16/17/18): ONE Persian date parser for every due field («۱۵ آبان», «پنجشنبه», «هفتهٔ بعد», ISO, «N روز»); T24 chat log
  judges the 🎯 with her stated confidence; the mind card's calibration row shows measured values; frame/reconstruction cards owned by the
  problem's retrieval case; late label on overdue cycle steps; the habit block does not fire on a practice request; a case the assistant
  suggests is linked to her problem/session (never «آزاد»).
- R4+ (A21-14): one problem's plan never appears in another problem's dossier; no doubled headings («از گفت‌وگو — از گفت‌وگو»).
- R6+ (A21-12): the open-plan list in the prompt keeps an overdue plan until she answers it; her «آره، انجام دادم» closes it as done.
- R9+ (A21-22): a guess judged «نادرست» is re-judged when the problem closes verified (re-check prompt to her, not silent).
- Test infra (A21-21): records made under the dev clock (`simClock`) stay visible after the offset returns to 0, at least in dev mode.
  Tests must not depend on records vanishing.
- Parts verdict (roadmap §12): the running lists (assumptions, models, mistakes, ambiguities, Pareto, signal/noise) have had no evidence
  for two rounds. That is a coverage gap, not proof of uselessness ⇒ do NOT quarantine. Round 22 routes at least two scenarios through them
  (one math, one life) and judges them.
