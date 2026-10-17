# Round-19 decisions — ROOT MECHANISMS + INFRASTRUCTURE (main session; binding for all three fixers)

Round 19 (main 313b64b8): 13/38 zero-defect (A 8/10 · B 4/10 · C 1/9 · D 0/9), up from 6/38. Written criteria: all pass except
C s22 s23 s24 s25 (each from a defect below). Every round-18 defect is fixed except B·D7/D·D4 (listed again below). Read
reports/round19{A,B,C,D}_handback.md and round19X/<sid>/findings.md. DECISIONS_R2–R18 bind except where replaced. Roadmap §10 and §11
bind: root causes only, variant bank proof, the bar only rises, model reports / page validates, infrastructure in the same round.

## Six root mechanisms

RN1 — THE DEFERRED-REQUEST FALLBACK (deferCand, a27 ~3021–3037) IS A DETECTOR THAT DECIDES ALONE (A·D1, B·D4, C·X1 in 6 scenarios, D·3).
  It pairs the user's message with the LAST assistant message (often the reply to a «[سامانه: …]» turn, which never has coach_state), so
  it claims «گزارشِ وضعِ آن نوبت نیامد» falsely; reads the copula «می‌شه/میشه» ("becomes") as a polite request; splits sentences at a
  decimal point; tests "covered" by ≥½ token overlap; offers the problem's own question, honoured requests and closed promises.
  ⇒ pair each user message with THE reply to it (by order, skipping system-turn replies); a candidate exists only when that reply
  omitted coach_state; the candidate must be a request addressed to the assistant (imperative, or «می‌شه/میشه … ؟» ending in a
  question mark, or «بگو/توضیح بده/…»), never a copula clause, never the live problem's statement, never a request already honoured
  or a promise already closed; sentence split respects decimals («۳.۶۷», «3.67»). Still ASK-only (asymmetric), never store.
RN2 — ONE REAL ACT, SEVERAL UNLINKED RECORDS (B·D1 D2 D3-s19, C·X2 X3 X7, D·1 D·9).
  a. A step outcome reported in chat (validated coach_state.step) is stored only as st.chatRep and applied at «✅ حل شد» (a38 ~2174,
     ~2201) ⇒ apply it to the step at once: the execution form shows it prefilled and marked «از گفت‌وگو»; the coach line and the gate
     treat the step as reported (C·X3 «نتیجه را خودش در صفحه ثبت می‌کند» must not appear).
  b. Gate items: a38 ~3667 maps every non-aux item to «گامِ شهودیِ ثابت‌نشده» + «مسئلهٔ کمکی حل شد ≠ …» and the line appears in every
     turn ⇒ each item kind (aux, intuitive, real step) has its own wording; the closing caveat appears only when that kind applies; a
     real open step is mentioned only at closing time or when she reports on it.
  c. A chat guess written to solve.g[1] with empty conf/test hides the guess kit (a27 ~2794 guessToProblem, a38 638 `fresh`) ⇒ the kit
     stays shown, PREFILLED with the chat guess, until confidence and test are filled; calibration is never lost.
  d. Plans vs live steps and guesses: a plan that is the same act as a live step shares its state (D·9 s35); a plan with on_guess is
     closed for review when its guess is refuted or confirmed (C·X7 s22); no «انجام شد؟» for an act already recorded.
  e. Mind card counts each act once (B·D3 s19 setback counted twice) — evidence carries the act's id; duplicates collapse.
RN3 — MIND-CARD LABELS WITHOUT ENOUGH EVIDENCE (C·X4, D·10, B·D3 s12).
  a. «ضعیف‌ترین» is named only when some stage has at least one failure AND it is strictly lower than every other stage on the
     observed data (no tie, not decided by table order or the prior); otherwise «هنوز تمایزی دیده نشده». Same rule for the coach line.
  b. A calibration black spot («بیش‌اطمینانی …») needs at least one event of THAT kind (a confident prediction that failed); a correct
     prediction never produces it (s33: 1 correct ⇒ 64% via prior, a29 ~157).
  c. Missing evidence sources: her own restatement (validated said u/c) ⇒ understanding success; validated plan_done ⇒ execution
     success; a refuted guess in a turn without coach_state is NOT booked to a stage by pattern (asymmetric); a plan+result turn
     (validated) ⇒ planning + execution success.
RN4 — MATH RUN BOUNDARIES DECIDED BY SINGLE CHARACTERS (C·X5 X6, D·2 D·6, A·D3 D4, B·D8).
  a. A run never starts at a lone number glued to a Persian word («بر ۸ ⇒ y=۲» — the «۸» belongs to the sentence when a Persian word
     precedes it and the relation follows); D·2's message must read exactly as typed.
  b. Codes are not math: letters-hyphen-digits(/digits) patterns («TR-2026/10», «A-12», «ISO-9001») stay text.
  c. «…» that follows an operator stays inside the run even at the end before Persian text (C·X5).
  d. Notation: ≈, ·, ln, log, sin, cos, tan, exp (D·6 «n≈3.7», «n·ln(10/n)»).
  e. Plot: tick labels in the digit system of the message (Persian digits when the message uses them); a plot is attached only to the
     message where the data first appears, not to a reply that quotes it; axis names from the message's own header words (INF14).
RN5 — QUESTION SEGMENTATION AROUND q (A·D2 order reversed, D·5 one question cut in two; a38 ~2849–2855).
  ⇒ the q option keeps its place in the conversation order; a fragment that elaborates q («با کدام وارسی یا حالتِ خاص؟») stays with q;
  splitting happens only between two complete questions.
RN6 — PHASE / REGISTER / PROMPT EDGES.
  a. D·4 (R18 D4 still open): the «؟» filter at a27 ~2033 drops «بعدی؟», so a closing remark becomes a new problem statement ⇒
     a short meta turn («بعدی؟»، «خب؟»، «ادامه؟») after chat_solved never creates a problem or a phase card.
  b. D·7 s38: a VALIDATED model report said:result (the result text present in her message) moves the phase; only unvalidated
     patterns lost that power in R18.
  c. Register fallback (B·D7): when the model gives no register, the fallback reads only the USER's forms («نگو، بپرس، صبر کن، باورت»);
     the assistant's own «می‌پرسید» never flips it. The guess note's wording follows the conversation's register (B·D5 «حدسِ شما»).
  d. Plan ids are shown in the prompt («pl1: …») so plan.same / plan_done are reported without guessing (D·8).

## Infrastructure built this round (need maps; roadmap §10.3)

INF10 — Today «📌 برنامهٔ خودت» line: one-tap «انجام دادم / انجام ندادم / هنوز نه» (A s01) — writes the same plan state.
INF11 — guess kit prefilled from a chat guess (RN2c).
INF12 — fields whose content is math type left-to-right (dir by content, per line), so typed formulas do not scramble (C s25).
INF13 — formulas rendered in saved views too: step list, statement header, saved plan/understanding texts (B s11).
INF14 — plot axis names from the message's header words, and «افزودنِ نقطه» to extend the same plot (A s07, B s20).
Recorded for batch 2's simulator rule (HANDBOOK open item 47, append): interactive chess board (s21), suspect × evidence table (s22),
units-aware recipe scaler (s23), unknowns/equations counter (s26), argument map (s27), 3-D box sketch (s02), hourglass simulator
(s08), seating-rule checker (s10), two-request timeline simulator (s06), parent card / wall card / role-play (s15 s16).

## Model-tier track (roadmap §11) — starts in round 20, in parallel

A fifth runner replays 8 scenarios (2 per group, at least half deep, incl. math: s03 s10 s18 s19 s25 s29 s31 s38) with the SAME page
prompts, but each assistant reply is generated by a real lighter model given only that prompt (no runner rewriting). Measures per
model tier: valid coach_state rate, single-question rule, 🔭 offer rule, correctness of reported fields against her text, `$…$` use,
Persian quality, scenario success by the need maps. Findings feed RN-style decisions (page compensates, or data says coaching turns
need a stronger tier).

## Fixers (three worktrees, in parallel)

- coach (a27, a29): RN1, RN2 d e, RN3, RN6 a b c d, INF10 (Today line lives in a27 dueList).
- live (a38): RN2 a b c, RN5, INF11, INF13 (saved views in a38), RN6c guess-note wording.
- math (a39): RN4 a–e, INF12, INF14.
Each: red-first tests from the runners' quotes + the VARIANT BANK `tour1_polya/VARIANTS_R19.md/.json` (written in parallel by an agent
who never sees the code; wait for it if absent) + controls (all r10–r18 tests and VARIANTS_R18 green). build.py; the whole page suite;
before the final commit merge the integration branch head; handoff note `_pending_tour1_R19_<name>_2026-10-17.md`; quarantine, never
delete (REMOVAL_CANDIDATES).

## Addendum (owner question 2026-10-17) — correcting an earlier message, for round 20
Today there is no correction path: the model sees the whole chat and memory, so it can follow «اشتباه گفتم، منظورم … بود» in
conversation, but what the page already stored from the wrong message (validated guess/plan/step/said/ans, promises, mind-card events,
forms filled by assistant actions, live-problem fields) is not reversed — validation only checks that the quoted text occurs in a
user message, and the wrong message still does. Round 20 builds INF15: coach_state.retract {msg, what, fix} reported by the model when
the user corrects an earlier message (any distance back); the page validates (the cited message is hers, the current message corrects
it) and reverses every record derived from that message (records carry their source message id — RN2e act ids), applies the fix, and
says what it changed. Mind card: a self-corrected slip is not a failure (self-correction is look-back evidence). Plus «✏️ اصلاح» on her
own bubbles. Variant bank + runner probes «correct 1, 2, 3 turns back».
