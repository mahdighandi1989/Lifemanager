# Round-14 decisions — zero-defect round 6

Round 14: every defect left is in «کدام پرسش کمک کرد؟» (lpBBest / liveChatQs). The window rule oscillated (R12 too wide, R13 too narrow).
Read reports/round14A_handback.md … round14D_handback.md. DECISIONS_R2–R13 bind.

N1 (a38) — ONE window rule, stated by its boundary, not by how the problem was created:
   window(P) = messages of the session from the LATER of {session start, the moment the previous DIFFERENT subject ended in this session
   (its switch/close message — e.g. «X تموم شد. حالا Y», another problem bound, lprobLog entry for another pid)} up to the moment the session
   switched away from P. "Subject ended" is the only cut; creation method (live_new, form «ساختن» by assistant or user, chat_invent,
   chat_solved, session switch) no longer matters. Controls that must stay green: s29 c23 (garden question not in pond's list), s30 support
   tickets, s31 chat_invent problems, s36 radical vs brine. Cases that must come back: s03, s07, s10, s11 (r1, r2), s21, s23, s25, s29 c10/c23
   own questions, s33, s35, s36 brine, s37 (4 questions).
N2 (a38) — an option always shows the question the assistant ACTUALLY asked (its own joined sentences), never the page's generic text;
   mapping to a page/list question is used only to dedupe and to give the option its list id. Demonstratives inside a self-contained question
   («کجا این شباهت می‌شکند…») do not trigger a join. No trailing page instruction («(بعد در صفحه…)») unless the assistant said it (s02, s23).
Process: one fixer; red-first tests (tests/test_tour1_r14.js) with every case above; full page suite (LLA_BROWSER_JOBS=3, at most twice);
kill only your processes; small scratch. Handoff `_pending_tour1_R14_2026-10-17.md`.
