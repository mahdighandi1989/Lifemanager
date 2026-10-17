# Tour batch 1 (Pólya) — ROUND 16 (read RUNNER.md … RUNNER15.md, then this; this overrides)

Page rebuilt after the round-15 fixes (branch claude/life-program-flow-diagram-q37jvr, merge 7ab9eee5 or later; built file
apps/learning-architecture/dist/learning-architecture.html — check `python3 apps/learning-architecture/build.py --check` says in sync and
the dist mtime is after the merge; if stale, STOP and say so). What changed: tour1_polya/DECISIONS_R15.md and
/home/user/Lifemanager/docs/overhaul/handoff-notes/_pending_tour1_R15_live_2026-10-17.md. In short: «کدام پرسش کمک کرد؟» now makes ONE
option per assistant message = its whole question passage (dash heads, «مثلاً», «اگر», asides and an anaphor's preceding sentence kept);
dedupe by the set of page questions it contains; a page question also counts as answered when its own field is filled (lpOne ⇒ whole-first).
Your round-15 findings: round15<X>/<sid>/ and reports/round15<X>_handback.md. Use dir round16<X>/<sid>.

ZERO-DEFECT round 7 (owner: batch 1 ends only if NO scenario has ANY defect of any class; report every S3 even on a PASS; do not invent
defects). Verify every round-15 defect in your scenarios is fixed end to end; compare each problem's list item by item with what was asked
about THAT problem; look hard for regressions caused by the new passage rule (over-long options that swallow a SECOND, different question;
lost questions; wrong problem). Strict prompt scan as before (>1 unmarked question directive). Same STRICT rule, literal average model,
coach_state omitted in ≥1 turn per scenario.

NEW — owner oversight (binding from this round on):
1. Harness: use `/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/harness4.js` instead of harness3.js
   (same interface). After every page action (form fill, select, click) it also saves `out/s<N>_page.png` with the touched field in view and
   the assistant panel folded, so the owner SEES the forms, not only the chat. If harness4 fails where harness3 worked, say so and fall back.
2. As soon as a scenario is finished, write `<sid>/DONE` (empty file) — the main session publishes each scenario's storyboard while you run.
3. findings.md starts with a section `## خلاصه برای مالک` (Persian, plain, 3–6 lines): who, what problem, how far she got, what the system did
   well, what was wrong — no code, no file names, no S1/S2/S3/E1 labels. The technical part follows as before.
4. E-mail (one per scenario) — the previous ones were vague. Structure, Persian, RTL:
   - subject «🧭 پولیا · دورِ ۱۶ · <sid> · <عنوانِ سادهٔ ماجرا> · ✅/⚠️»
   - one sentence: the result in plain words;
   - the story: who, what she wanted (2 lines);
   - 3–6 key moments, each: what she wrote (quoted), what the assistant answered (quoted, shortened with …), what the page showed or what
     she filled in;
   - what worked; what was wrong — each from HER side: what she saw, why it is bad, what she should have seen;
   - «تصویرنامهٔ گام‌به‌گام: <link>» with the group link: A https://claude.ai/artifact/91WEMispzw9gyGiD4L1n4c ; B, C, D: the links in
     tour1_polya/STORYBOARD_LINKS.md.
   No line numbers, no file names, no ids.
Never pkill processes you did not start. Keep scratch small (disk is tight: delete browser profiles and copies when done).
Final message: per scenario RESULT + remaining defects (class a/b/c/d, severity, repro, file:line).

ADDENDUM (owner, binding, applies to this round already) — judge by TWO NEED MAPS, not only by the written criteria
(docs/decisions/2026-10-15-sources-roadmap.md §9). For every scenario, before the verdict, write in findings.md a section «## نقشهٔ نیاز»:
(1) for each part of the system the scenario passed through (the live-problem page and its cards, the assistant, any other view it
touched): what that part is FOR, at which moment it should step in BY ITSELF, and what it must deliver — derived from the part's own design
(apps/learning-architecture/docs/HANDBOOK.md, AGENTS.md, VIEW_META in a26_assist.js), not from the scenario; (2) what the scenario's person
needed at each key moment, even if she did not ask. A need of either map that was not met, or met poorly (incomplete, inaccurate, buggy) is a
defect even if no written criterion mentions it — e.g. a part whose design is to offer practice/simulation at that moment and did not.
Written criteria are the floor, not the ceiling. Report such defects with class and severity like any other.
