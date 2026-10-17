ROUND 3 B (s11–s20, build a53d07c): 2 PASS (s11, s13), 8 PARTIAL, 0 FAIL. Evidence round3B/<sid>/findings.md; 10 e-mails sent.
Fixed & verified: coach block on every non-help turn (s11/s12/s15/s16/s18/s20 first turns); live_new binds (s17); 🔭-form binds open chat (s13/s19); judge pre-select
& inheritance (s11); units check on «ریاضی‌کردن» (s17); 100% claim challenge, «چرا شهودت خطا رفت», «اثبات شد» instead of 50% cap (s11); R7 phases count chat
failures (s14); mid-course check-in in Today + page + prompt (s19); idea_counter nt revision + no false «انجام نشد» (s20); chat_solved confirmed in chat (s12/s14/s18).
Remaining (class, severity, file:line):
S2 (c) s11 refuted guess reported «اثبات شد» — a38_live.js:1876 (shown whenever verdict=proved, ignores hit=نادرست).
S2 (c) s17 units checker rejects correct joined units «مترمربع/مترمکعب» ⇒ understanding cannot be saved — a38_live.js:403 UNIT_T (:411-446).
S2 (b) s15/s16 teacher/parent coach mode unreachable from chat; coach always treats user as solver — a38 RULES :2034 / lprob map line; a27 coach block.
S2 (b) s19 no 🌱 card in live problem after setback (only prompt rule) — a38 outcome handler.
S2 (b) s12 no cross-session fade for chat-only work (rungs count page answers only) — a27 rung line (A.qRung).
S3 (c) s16/s18/s20/s14 chat-only coach kind wrong («تصمیم/کارِ واقعی» for textbook/research problems; «اثباتی» sticky after the word «اثبات») — a27 coach class.
S3 (c) s16/s18/s20/s15 coachPhase misses «رسید به…/جواب اینه/تموم شد» and misreads «خودم حل کردم» (teacher) — a27 coachPhase.
S3 (c) s18 bidi still wrong: «cm³/s ÷ cm² = cm/s» ⇒ result outside the <bdi>, «y→0» not isolated (screenshot) — a26_assist.js:962-984.
S3 (c) s11 duplicate unused-data line in live block (a38 + a27) — a27_tour.js:1254/1320, a38_live.js:2064; phase list cut at 7 — a27_tour.js:1318.
S3 (b) s13/s19 live_new rule still regex-gated (LIVE_RE) — a38_live.js:2036-2039.
S3 (b) s11 indirect⇒direct only for prove/pod — a38_live.js:1694; s13 natGuess money ⇒ practical for ethics dilemma; plan ladder geometry wording for life problems (a19 A.PLAN_QS).
S3 (b) s17 page refusals older than 4 min invisible to assistant; double unit messages (a38 + a16).
S3 (b) territory noise persists (s12 dual coding, s13 attention, s17 premortem, s20 IQ) — a28_systerr.js.
S3 (b) missing book elements in chat: inventor's paradox, «mushrooms» cluster, «label heuristic as incomplete», «authority⇒forgetting», «keep goal in view».
