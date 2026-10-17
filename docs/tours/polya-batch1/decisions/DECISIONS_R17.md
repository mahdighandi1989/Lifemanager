# Round-17 decisions — ROOT CAUSES, not symptoms (main session; binding for all three fixers)

Round 17: 15/38 scenarios zero-defect; the rest fail on defects that are almost all side effects of the round-16 additions. Read
reports/round17{A,B,C,D}_handback*.md and round17X/<sid>/findings.md. DECISIONS_R2–R16 bind except where replaced here.

## Owner's rule for every round from now on (binding)

A defect is never fixed "for that scenario". Every defect id is first traced to the MECHANISM that produced it; the fix changes the
mechanism so the whole family disappears. Proof is required: each fix ships with a VARIANT BANK test — the scenario's wording plus the
independent paraphrases in `tour1_polya/VARIANTS_R17.md` (written by an agent who never saw the code) — and must pass all of them.
A fix that passes the scenario sentence but fails a paraphrase is not a fix.

## The five root mechanisms behind round 17

RC1 — SEMANTIC JUDGEMENTS MADE BY KEYWORD PATTERNS (the round-16 detectors). «برنامهٔ خودش» vs a complaint (A·D1 s01, D·5 s32/s34),
  a deferred request vs a question (D·6 s32, B obs. pr2), taste vs «نمی‌دونم» (D·2 s31), register from one word (C·V4 s27), a formula
  guess with no "words" (C·V2 s25). Patterns cannot tell these apart; the model can, and our proven principle is «the model reports
  state, the page validates» (experiences/model-reports-state-page-validates.md).
  ⇒ coach_state gains optional fields the MODEL fills when (and only when) they occur in the user's message:
     plan: {text, when}        — the user's OWN intended future action with a time (not a habit complaint, not a deadline the user is
                                  already under)
     defer: {what}              — something the user asked FOR that the assistant postponed
     taste: {text} | "unknown"  — "unknown" never stores a taste and does not count as asked-and-answered
     register: "تو" | "شما"     — only when the user's own message shows it
     guess: {text}              — any claimed value/formula/claim offered as possibly right
  The page VALIDATES (the quoted text, or its numbers/symbols, actually occur in the user's message; dates are real dates) and only then
  acts. The keyword patterns stay only as a fallback that may OFFER/ASK, never store (asymmetric error, R5/F1). Remove the regex-driven
  storing paths (quarantine the functions, do not delete).
RC2 — THE «کدام پرسش کمک کرد؟» SOURCE IS TOO WIDE AND GUESSES REFERENTS.
  a. A chat-closed problem's window ENDS at its chat_solved moment (B·D1 s14: whole session listed).
  b. Questions emitted by our own look-back/closure lines (best question, taste) are tagged at emission and never become options
     (A·D5, B·D2/D·1 s14 s18 s31 s38).
  c. «(حدسِ تو: …)» only from a guess QUOTED IN THE SAME MESSAGE (or recorded with an id the model's coach_state.guess points to in that
     turn); never the problem's current recorded guess by default (A·D2, B·D1 s11d, C·V1 s21 s28).
  d. A head is a "bare label" when it has no finite verb (structural), not by lexicon (D·7: «یک قدم دقیق‌تر:»، «میانهٔ راه:»، «فقط یک
     چیز:»، «و یک پرسشِ آخر، کوتاه:»، C·V3 «پس پرسشِ دیگری از همین فهرست:»); anaphora starts include compound prepositions
     («پیش از آن»، «بعد از این»… D·8 s36).
  e. Own-words dedupe compares the question's object, not its frame: a sentence that says «همان پرسش» / repeats with a new preface
     collapses (A·D3).
RC3 — TWO RULES FOR THE SAME ACT IN ONE PROMPT. LIVE_FALLBACK «ثبتش کن» vs LIVE_COMPACT «فقط پیشنهاد» (A·G1 S2, B·D4).
  ⇒ one source of truth per action's modality (offer vs do); the long block REFERENCES the compact rule; plus a structural test over
  the whole prompt: for every action name, all lines that mention it agree on modality.
RC4 — "VERIFIED" BY TOKEN OVERLAP. userWrote ≈60% overlap with one message (D·4 s31 «وارسی نشد» though she verified in three
  messages). ⇒ the model reports which user messages carry the check (coach_state.check: {msgs:[…]}) and the page validates they exist
  and are the user's; overlap stays only as fallback for "maybe", never to deny.
RC5 — NAG COUNTERS COUNT ONLY THE PAGE'S OWN ASKS. ⇒ the asked-ledger counts a look-back question as asked when it appears in an
  assistant message too, and as answered when the model reports it (A·D4, D·3); the turn line is computed after this turn's
  chat_lookback is applied.
Cosmetic: A·D6 singular/plural «همان‌ها» ⇒ number agreement from the count; B·D5 register converter covers imperative stems generically
(«بزن/بکن/بگو…» ⇒ «بزنید…»), not by adding words one at a time.

## Infrastructure the need maps ask for (owner's second point — done now, not later)

INF1 — formulas. 14/38 scenarios are numeric/formula/proof; chat and fields show formulas as plain text. Build ONE math renderer
  (new module `src/app/a39_math.js`): inline `$…$` / `\(…\)` LaTeX-lite and plain ASCII math («1/((n+1)(n+2))», «x^2», «a_n») ⇒ native
  MathML (no external library — the page is a standalone bundle; Chrome/Firefox/Safari render MathML Core); used by the assistant's
  message renderer and by a live preview under the problem's text fields; the assistant's SYS line tells the model it may write
  `$…$`. Safety: escape everything; unknown input stays text. Tests: rendering, escaping, RTL mixing, no change for non-math text.

## Fixers (three worktrees, in parallel)

- coach (a27, a28, a35, a36, a37): RC1, RC3, RC4, RC5, A·D6, B·D5.
- live (a38): RC2 a–e.
- math (new a39_math.js + the minimal hook in a26's message renderer and the field preview; nothing else in a26/a38): INF1.
Each: red-first tests from the runners' quotes + the VARIANT BANK (`tour1_polya/VARIANTS_R17.md`, wait for it if absent — it is being
written in parallel) + controls (all r10–r16 tests green). build.py; the whole page suite; handoff note `_pending_tour1_R17_<name>_2026-10-17.md`.
