# Tour batch 1 (Pólya) — RUNNER instructions (read fully)

You run scenarios from /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/scenarios.json
(read scenarios.md for the Persian text, and the 9 global invariants) on the REAL page apps/learning-architecture (built file
/home/user/Lifemanager/apps/learning-architecture/dist/learning-architecture.html — do NOT rebuild, do NOT edit the repo).

SELF-AWARENESS FIRST (owner's rule): before judging the system, know it. Read /home/user/Lifemanager/apps/learning-architecture/AGENTS.md,
apps/learning-architecture/docs/HANDBOOK.md §2 (how to use) and the «🔭 مسئلهٔ حل‌نشدهٔ خودم», «حلِ مسئله گام‌به‌گام», moves, knots,
factory parts. If a scenario seems unsupported, FIRST look for the right place in the system (views via APP.go, VIEW_META, the assistant)
— suspect your own ignorance before calling it a gap. Only then record a gap.

HARNESS: reuse the proven paired harness in /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/camp/
(read USER.md, USER2.md, USER3.md, MODEL.md, MODEL3.md, harness3.js, start.sh). Copy what you need into your own scenario dirs
(<YOUR_DIR>/<sid>/). You play BOTH roles in turn: (1) the human user/tester following the scenario script; (2) the page's language
model — for every AI call (<DIR>/ai/pN.json) answer strictly as MODEL.md says, following the given system prompt honestly (you must
not use your tester knowledge to make the system look good or bad; answer as the page's model would). Prefer exercising the page's own
non-AI mechanisms (understanding card, ask-now, simulator, live unsolved-problem tunnel «🔭», moves/drills, guess kit, look-back, will
card, knot solver, factory cases) directly through the UI, and use the assistant where the scenario is conversational. Advance the
clock (the harness / APP.today override as earlier campaigns did) to test multi-day behaviour and spaced returns.

FOR EACH SCENARIO produce in <YOUR_DIR>/<sid>/:
- findings.md: for every success criterion: `- [PASS|FAIL|PARTIAL] criterion — what you executed — evidence (sN, quote)`; then
  defects S1/S2/S3 with repro, and for each FAIL classify (a) book not understood/seen, (b) not (correctly) implemented, (c) runtime bug,
  (d) my own mistake/ignorance (then it is not a defect).
- verdict line: `RESULT: PASS` only if every criterion passed by execution.
- an e-mail to the owner, SENT with the Gmail tool (load it with ToolSearch "gmail send"; to: <owner-email> — the owner
  explicitly asked for one e-mail per scenario). Persian, RTL HTML (dir="rtl"), clearer than before: FIRST LINE = the result in plain
  words («✅ این سناریو کامل از سامانه گذشت» / «⚠️ این سناریو گیر کرد در …»); then: the scenario in 2 lines (who, what problem, which
  parts of Pólya's spirit it tests); what the system did well (2–4 bullets with evidence); what was missing or broken (each in one plain
  sentence + why it matters for the owner); what happens next (fix/retest). No code, no ids like «A013» in the body except in a small
  final «برای ناظر» footer. Subject: «🧭 تورِ پولیا (دستهٔ ۱) · <sid> · <domain> · ✅/⚠️». If the Gmail tool is unavailable, write
  mail.html + mail.json in the dir and say so.
Do NOT fix code. Your output feeds the fixer. Final message: per scenario RESULT + the list of defects with class and severity.
