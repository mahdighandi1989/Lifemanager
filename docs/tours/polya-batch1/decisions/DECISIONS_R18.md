# Round-18 decisions — ROOT MECHANISMS + INFRASTRUCTURE (main session; binding for all three fixers)

Round 18 (on main 204585c1, harness5 with before/after shots of the mind card, maps and Today): 6/38 zero-defect
(A 0/10 · B 2/10 s15 s17 · C 1/9 s28 · D 3/9 s32 s36 s37). Every written criterion passed in all 38; the failures are S2/S3 found
by the need maps, the new math tool and the new before/after check of the mind card. All round-17 defects are fixed except B·D1
(window start, half fixed). Read reports/round18{A,B,C,D}_handback.md and round18X/<sid>/findings.md. DECISIONS_R2–R17 bind except
where replaced here. Roadmap §10 binds: root causes only, variant bank proof, semantic judgements from the model validated by the page,
infrastructure from the need maps built in the same round.

## Six root mechanisms

RM1 — THE MIND CARD IS FED ONLY BY FAILURES AND RANKS WHAT IT HAS NOT SEEN (A·M1, B·D5, C·W3, D·D6; 14 scenarios).
  a. coachEv writes ok:false only (a27_tour.js ~2064–2067, 2393); a29_mind.js ~342–381 reads only those. A validated chat success
     (coach_state.ans accepted, a phase passed, chat_solved, a verified check) must write ok:true for its stage.
  b. The live tunnel never feeds M.phases: plan form saved, data-use gate passed, auxiliary problem, a step that led to «حل شد»,
     look-back verified, proof saved ⇒ evidence for planning / execution / look-back. One evidence function per source, no weights
     invented: a success is one event, a failure is one event (the existing Rasch/Beta machinery stays).
  c. A stage with 0 events is shown as «هنوز داده‌ای نیست» and is NEVER named weakest/strongest (no ranking from the ½ prior).
  d. Closing a problem with open steps (a38_live.js ~2147 auto-close done:"no", auto:"solved") asks the outcome of each open step
     instead of recording "no"; if the user already reported it in chat (model's coach_state), use that.
  e. A verified proof / solve leaves a trace on the abilities radar where the existing card maps that stage to an ability (A ارتقا 6);
     if no mapping exists, say so on the card, do not invent one.

RM2 — MATH HAS ONE INPUT ALPHABET (ASCII) AND ONE OUTPUT (MathML).
  a. Plain-text sinks show raw TeX: <option>/<select> (lbOpts a27 ~2485, chatItems/liveChatQItems a38 ~2592/2836), stored bestQ,
     toasts, Today lines, e-mail bodies (A·X1, B·D3, D·D7). ⇒ APP.MATH.toPlain(text): $…$, \(…\), ASCII math ⇒ readable Unicode
     (x², a₁, p₁+p₂+p₃, \frac{a}{b} ⇒ a/b with parentheses when needed, \to ⇒ →, \dots ⇒ …, \sqrt{x} ⇒ √x / √(…)). EVERY place that
     puts assistant/user text into a non-HTML sink calls it. Structural test: grep the page source for option/textContent/title sinks
     fed from chat text and require toPlain on each.
  b. Notation the people actually type is not recognised: Persian digits ۰–۹ and ٫, ×, ÷, ², ³, −, ⇒, ≤, ≥, √ typed directly,
     Persian-letter variables (s36 «ع+۶ = ع²»), «…» / «⋯» inside a run (C·W1, C·W2, D·D8, D ارتقا1). ⇒ a tokenizer that knows these
     characters; Persian digits are displayed as typed (not converted to Latin); a Persian letter is a variable only inside a run that
     already has an operator/relation and digits (never plain prose).
  c. Tokenizer bugs: bare() strips a leading «(» and trailing «)» (D·D5 «(10/n)^(n/2)»); «_» takes one letter (B·D8 g_EE, g_PV-E;
     «-» between two letter runs with no spaces is part of a name, not a minus); τ_I shown I_τ in RTL (B·D9); the same «dV/dt» stacked
     in one place and slashed in another, unary minus spaced as binary, a line break before the following «،» (B·D10). ⇒ fix in the
     tokenizer, each with a variant entry.
  d. Markdown-lite in bubbles: «**…**» renders as bold (B·D11) — the prompt itself uses ** so a literal model mirrors it.

RM3 — THE FORMULA LINE AND PREVIEWS ARE TRIGGERED BY VIEW, NOT CONTENT (A·F1 39/59 prompts, D·D1, C obs. FEN).
  ⇒ the «# فرمول» line fires only when the problem text or the recent conversation contains math by the RM2 tokenizer (FEN, dates,
  prices, version numbers, phone numbers are not math); it is marked «(زمینه، نه پرسشِ دوم)» per R12/R13; it fires on any view when
  the content is math (D·D1 s38 p7 «(n−۲)×۱۸۰»).

RM4 — GUESS ATTRIBUTION BY PROXIMITY, NOT IDENTITY (A·N2 s03 s04 s05, B·D2 s12 s18, C·W6 s24).
  a. guessQuote takes any «…» next to «حدس»: the system's own label, a reported fact, a proverb. ⇒ quarantine guessQuote as a storing
     path; a «(حدسِ تو: …)» note may only carry a guess that occurs in a USER message (validated coach_state.guess, or the problem's
     recorded guess with its source message id).
  b. m.guess is put on the whole assistant message and guessFor applies it to any option with a demonstrative/clitic. ⇒
     coach_state.guess gains optional `q`: the question (verbatim from this assistant message) that tests the guess. The page validates
     q is a substring of that message and attaches the note ONLY to the option made from it. No q ⇒ no note.
  c. A validated guess about the focused live problem is stored on that problem (solve.g) as the chat_invent path already does.

RM5 — PLANS AND REQUESTS HAVE NO LIFECYCLE (D·D2 s34 s35, C·W5 s22, B·D7 s14o, A ارتقا 4).
  a. plan.when is validated against today: a past date is never offered; a plan whose date has passed asks «انجام شد؟» once; model may
     report plan_done:{id}. Plans have state open|done|expired; the follow-up line lists only open, future ones.
  b. Dedupe: planSeen pairs a plan with the previous user message whatever the elapsed time (a27 ~2802) ⇒ the model may report
     plan.same:<id>; the page also refuses a second plan with the same validated text in the same day.
  c. A plan that acts on a guess still untested (s22 «همین امروز باهاش برخورد کنم» while «کار سرایداره» is only a guess): the model
     reports plan.on_guess:true; the page then offers «اول حدس را بیازما» instead of a follow-up of the action.
  d. A deferred request survives an omitted coach_state: the fallback may detect a CANDIDATE request (any unanswered request/question
     form of the user) and only ASK in the next prompt («اگر هنوز پاسخش نداده‌ای…»); it never stores (asymmetric error).
  e. Self-commitments without a date («دیگه ستون اضافه نمی‌کنم») become plan with when:"next-session" — reminded once next session.

RM6 — STRUCTURAL TEXT RULES THAT GUESS (one root: a heuristic decides alone where the model's report or the data's identity exists).
  a. Register (A·R1 s06, B·D6 s16): SIGN_TO is a closed list (a27 ~2735). ⇒ accept the model's register unless the user's own text
     carries evidence of the other register (2nd-person plural ending/ imperative -ید/-ین for «شما»; for «تو»: 2nd-sg verb ending
     -ی/-ت, imperative without -ید, compound imperatives «ثبت کن»، «کمک کن»). The assistant's own words never count.
  b. bareLabel (A·N1 s01): drop a verbless head only if the remaining question is self-contained; keep it when the question needs its
     referent (an option letter, «گزینهٔ …», a named object, or a deictic in the question).
  c. RESULT_WEAK (B·D1 s11): a formula/number inside a claim or while the problem is being stated is not a result. The phase moves to
     look-back only on the model's report or a recorded result; the pattern may only offer.
  d. transfIn (A·E1 s03): a numeric evaluation (no unknown on both sides) is not an equation transformation; the «تبدیل‌ها هم‌ارز
     بودند؟» gate needs a transformation of an expression with an unknown.
  e. chkWindow/sameStmt (D·D3 s31): the window starts at the problem's creation message id, not the last text that looks like the
     statement; sameStmt counts distinct tokens. B·D4 s14: a chat-closed problem's window STARTS at its first mention (chat_invent id
     or creation), not the session start.
  f. After chat_solved with no open problem in focus, no phase card is suggested (D·D4 s31 p13).
  g. Developer notes never reach the model (A·L1, a27 ~1668 «دورِ ۱۷، RC3…»). Structural test: no prompt line contains «دورِ \d»,
     «RC\d», «R1\d», «DECISIONS», file names.

## Infrastructure built this round (need maps; roadmap §10.3)

INF2 — APP.MATH.toPlain and its use in every plain sink (RM2a).
INF3 — formula preview under EVERY text field of the live problem (understanding/sufficiency, plan, steps, proof, base case, look-back
       glance/letter/check, guess kit) and in the chat input; plus a small «∑ فرمول» symbol bar (x², √, ÷, ×, ≤, ≥, ⇒, subscript,
       fraction) that inserts at the caret, in chat and fields.
INF4 — plan lifecycle (RM5) with a Today line per open plan.
INF5 — mind-card evidence from successes and live saves (RM1).
INF6 — closing asks the outcome of open steps (RM1d).
INF7 — «پیامِ کامل» next to the look-back select: shows the full source message of the chosen option (A ارتقا 3).
INF8 — mini plot: a two-column numeric table or a number series in a chat message (user or assistant) renders a small inline SVG line
       plot under it (s07 hours→height, s19 weight log, s20 results table). No library; escape everything.
INF9 — chess board from a FEN in chat (s21): a static 8×8 Unicode board under the message.
Recorded for batch 2 (they are simulators/tools the §8 simulator rule must propose by itself and batch 2 judges): probability case
tree (s28), geometry canvas (s29), isomorphism mapping table checked on small cases (s24), crossword letter grid (s12), rehearsal space
for a hard conversation (s13), «which formula when» practice from his own sheet (s14), units-aware calculator (s17), related-rates
«vary the quantity» simulator (s18), per-problem notation setting (s20). → HANDBOOK open items.

## Fixers (three worktrees, in parallel)

- coach (a27, a29 mind, prompts): RM1 a–c e, RM4 b (coach_state side) c, RM5, RM6 a c f g, RM2d (bubble markdown-lite is in a26's
  renderer: coach fixer owns it), INF4, INF5.
- live (a38): RM1d/INF6, RM4 a b (option side), RM6 b d e, INF7. Plain sinks in a38 call `APP.MATH && APP.MATH.toPlain`.
- math (a39 + the hooks): RM2 a–c, RM3, INF2 (toPlain + the a27 lbOpts sink + structural sink test), INF3, INF8, INF9.
Each: red-first tests from the runners' quotes + the VARIANT BANK (`tour1_polya/VARIANTS_R18.md/.json`, wait for it if absent — it
is written in parallel by an agent who never sees the code) + controls (all r10–r17 tests green). build.py; the whole page suite;
handoff note `_pending_tour1_R18_<name>_2026-10-17.md`. Quarantined paths (guessQuote storing, old SIGN_TO list) are kept reachable
and recorded in REMOVAL_CANDIDATES.
