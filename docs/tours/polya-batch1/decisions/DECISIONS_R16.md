# Round-16 decisions (main session; binding for both fixers)

Round 16 = 38/38 PASS on written criteria. Under the owner's need-map rule (roadmap §9: what each part is FOR and must deliver by itself +
what the person needs at each moment; unmet or poorly met ⇒ fail) several scenarios fail. Read reports/round16{A,B,C,D}_handback.md and
round16X/<sid>/findings.md («نقشهٔ نیاز»). DECISIONS_R2–R15 still bind except where replaced here.

I count as defects also two items runner B listed as "observations" because "no part is designed for it" — that is exactly what §9 forbids
excusing: the person's need counts even if no part was built for it (N6 below).

## Live fixer («live» = a38, +a29, a26)

L1 — «کدام پرسش کمک کرد؟» passage rule, refined (regressions of R15 O1; asymmetric error still holds: long > fragment > missing).
  a. «:» ends a sentence ONLY after a bare label (a short phrase that is itself only a label/title: «یک پرسش:»، «پرسش:»، «یک پرسشِ بازنگری:»،
     «… از همین فهرست:»). Otherwise the clause before «:» is the head of the question and stays («از آخر شروع کن: …؟», «حالت‌های خاص را بیازما:
     …؟», «پیش از رها کردنِ کلِ راه: …؟») — A·F5 (s06, s10), C·U1 (s25), and the s21/s23/s25 harmless cases.
  b. «؟» that is not followed by whitespace/end, or that is glued to a digit/letter on both sides («؟۴۸۷؟»), is a masked character, never a
     sentence end (D·D1 s37).
  c. Two question RUNS separated by a non-question sentence are TWO options unless the second run starts with an anaphor/connective (R15 O1
     said one option per message; that glued two different questions in s03 — A·F2). Within one contiguous run: one option.
  d. An option whose main referent is a clitic/demonstrative pointing to the problem's recorded guess or unknown («…اش؟», «این حدس…») gets the
     referent appended in parentheses from the record («(حدسِ تو: …)») — C observation; the person must be able to read each option alone.
  e. Own-words repeats: two 💬 options of the same problem collapse into the most recent one when the content words of one (after removing
     function words) are a subset of the other's — no numeric threshold (D·D2 s31: three variants of «همهٔ داده‌ها و کلِ شرط…», two taste
     questions).
L2 — the list is live: when a new assistant message arrives while the look-back card is open, `#lpBBest` re-renders (A·F3 s06, s10).
L3 — prove / pod / life wording for the UNDERSTANDING-phase page options and fields: pageQs/pageFields use the kind-specific list the card
  actually showed (حکم/فرض/«آیا همهٔ فرض لازم است؟»; life pod: فرضیه), not the generic find list (A·F1 s03, s05, s10).

## Coach fixer («coach» = a27, a28, a35, a36, a37)

N1 — chat closure completes the look-back. `chat_solved` (a27 ≈2208) accepts `taste` and `bestQ`; the closure prompt asks for both in the
  closure turn or the next one (one question per turn still); the page shows a small «بازنگری: دو پرسشِ باقی‌مانده» card on the problem until
  both are answered; the mind/report side reads taste from there as it does from the page look-back (D·D2 s31 S2, A·F4 s08).
N2 — the live tunnel is offered by meaning, not only by keyword. The compact rule for «🔭 مسئلهٔ حل‌نشدهٔ خودم» (one line: what it is, when to
  offer `live_new` — a real problem the user is stuck on / a long-running project or question) is ALWAYS in the prompt; the full block
  stays keyword-triggered. Offering is a suggestion, never auto-create. Extend LIVE_RE with the stuck-duration and "my mind doesn't work"
  family («ماه‌هاست»، «فکرم کار نمی‌کنه»، «گیر کردم روش»، «… یا نه» about one's own research) (B·D1 s20 S2).
N3 — `chat_invent` duplicate / `sameProblem` paths link the session to the existing problem (sessLink + lprobLog, as live_new does) and store
  a user guess as a GUESS on that problem, not only as a restatement (B·D1 s11).
N4 — register: the conversation's «شما/تو» is detected from the user's and assistant's recent messages and page questions inserted into the
  turn line are rendered in that register (at least RECALL_Q and every «بپرس «…»» template with تو-forms: یادت/راهت/می‌گویی…); plus a rule
  line «ضمیرِ گفت‌وگو (شما/تو) را عوض نکن» (B·D1 s12).
N5 — deferred requests are not lost: when the assistant defers something the user explicitly asked for («اول … بعد …», «بعداً»), it records a
  promise (session field) that appears as a context line in later turns until honoured or declined by the user (B obs. s14).
N6 — follow-up of the person's own stated plan: when the user states a dated or recurring plan/experiment of their own («هر هفته»، «سه‌شنبه
  امتحان می‌کنم»), the assistant offers a follow-up reminder with the existing remind action; «امروز» shows it (B obs. s15).

## Harness note (for the runners, not the page)
Shared `scratchpad/harness4.js` is now runner C's fixed copy (loop-scope `before`/`VALS`, repo dist path).

## Process
Base = branch tip (99a13f19 or later; fast-forward). Two worktrees in parallel; each writes red-first tests (`test_tour1_r16_live.js`,
`test_tour1_r16_coach.js`) from the runners' quoted messages plus controls (the R15 controls must stay green), then the fix, then
`python3 apps/learning-architecture/build.py`, then the whole page suite. Handoff notes `_pending_tour1_R16_<live|coach>_2026-10-17.md`.
Cross-area: if N2/N6 touch `s_problem`/territory registries, record with `scripts/supervisor/handoff.py add --by session`.
