# Round-13 decisions — zero-defect round 5

Round 13: all 38 scenarios PASS their criteria; group B fully clean; remaining defects (A: B1, B3, B4; C: Q1; D: 1, 2). DECISIONS_R2–R12 bind.
One fixer this round (the items touch a38 and a27 together; one owner avoids merge conflicts).

M1 (a38) — «کدام پرسش کمک کرد؟» scoping, ONE rule for every way a problem enters a session: a problem's chat window starts at the
   message where THIS problem became the session's subject — the live_new reply, OR the reply whose action created/opened it by the form
   («ساختن» click), OR chat_invent/chat_solved, OR `se.lprobAt` when the session switched to it — and ends where the session switched away.
   If none is known, use `r.created` as the start. (s29 c23, s30, s31, s36)
M2 (a38) — page turn questions that do not end with «؟» (Q_LINK, resultQ «…(بعد در صفحه «✅ حل شد» و بازنگری)», Q_LINE, EQ_FEW) are still
   recognised as questions when echoed: match on the page question's known text, not on a trailing «؟» (s06). A paraphrased multi-sentence
   page question joins its continuation sentences when the continuation refers back («ردش»، «آن»، «این») — one option, no non-question
   preamble kept (s01 c40).
M3 (a27+a38) — the whole-first question (Q_WHOLE / A191) gets an id (e.g. "u0") in the coach list and the live «asked/answered» ledger, so
   the model's coach_state can mark it answered and the validated ledger stops the repeat when her reply gives the whole problem (goal +
   condition) in one go (s01 p2→p3). The page card still shows until «ثبتِ کل».
M4 (a27) — PROOF_Q depends on what the tested cases showed: cases that WORKED + "how do I prove the general case?" ⇒ «چرا برای هر حالت؟ در
   حالت‌هایی که امتحان کردی، کدام ویژگی کار را درست کرد — همان را برای حالتِ کلی نشان بده»; cases that FAILED + "it's impossible?" ⇒ the current
   impossibility wording (s38 p6 vs s11 p3).
Process: red-first tests on the real path (tests/test_tour1_r13.js), every case above + the prior controls; full page suite
(LLA_BROWSER_JOBS=3) before finishing; kill only your processes; small scratch. Handoff `_pending_tour1_R13_2026-10-17.md`.
