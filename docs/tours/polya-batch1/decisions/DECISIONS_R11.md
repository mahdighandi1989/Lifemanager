# Round-11 decisions — zero-defect round 2 (owner: a batch ends only with NO defect of any class)

Round 11 = 38 PASS / 0 PARTIAL / 0 FAIL by criteria, but defects remain (1 S2 + many S3). Read reports/round11A_handback.md,
round11B_handback.md, round11C_handback.md, round11D_handback.md (+ round11X/<sid>/findings.md, round11C/scan.txt, round11A/tools/scan2.py).
DECISIONS_R2–R10 still bind. Lesson of round 11: J1 routed only SOME lines; every line that still says «بپرس»/asks a question on its own
became a second question. So:

K1 (STRUCTURAL, both fixers) — EVERY directive line in EVERY assistant hook block (coach, live, related-solved «# مسئلهٔ حل‌شدهٔ مرتبط»,
   open-problem «مسئلهٔ بازِ تو … همین را ادامه می‌دهی؟», teacher/parent frame lines, the generic claim rule «ادعای محلِ بحث…», the stage-profile
   line «چهار مرحلهٔ حل…»، proverb, 🌱) is either THE turn question or rendered «- زمینه (نه پرسشِ دوم):» with no «بپرس» and no question of its own.
   The related-solved blind recall and the open-problem continuation become MOMENTS in the one priority function (below this turn's own act),
   and are dropped when the user's message already answers them («مثل دیروز…»، he is already on that problem). Strengthen the structural
   test: across ALL prompts produced by tests r7–r11 fixtures, no line outside the turn line may contain «بپرس» or end with «؟» unless marked context.
K2 (coach) — guess detection: a declarative claim introduced by «به نظرم»، «شاید»، «فکر کنم»، «حدسم» about the problem's object is a guess at ANY
   ending (s21 p2, s22 p1, s23 p1, s26 p1, s29 p1), and turn.guess reaches liveCoach on a live problem (s29 p7). Controls: future intention
   («شاید فردا برم کوه») and opinions about the user himself are not guesses.
K3 (both) — «فقط جواب» family: «زود بگو»، «یه راه‌حل بده»، «فقط بگو X یا Y؟» with no visible attempt ⇒ A073 (s01, s02, s04, s05).
K4 (live) — «کدام پرسش کمک کرد؟»: QWORD accepts 2nd-person question verbs («می‌گویی/بگویی/می‌نویسی/می‌بینی…») so the coach's A191 question appears
   and maps to u5 when it is the same (s21, s23, s24, s28, s01, s02, s05, s06); a head with an inner parenthetical «— … —» keeps its referent
   (s01 «هنوز بی‌ربط است؟»).
K5 (coach) — kind unset ⇒ neutral coach header (liveClass respects liveKindInfo.set) and the pointer says «همان پرسشِ بلوکِ زنده» without naming a
   list when the live question is the judge question (s22 p4).
K6 (live) — soft-gate wording only over soft items; hard items listed separately; the reason field sits next to the list it refers to (s22, s26).
K7 (coach) — the stage proverb never repeats a quote already used in the same block (mushrooms, «جایی که اراده‌ای هست…»).
K8 (coach, a28 + registry) — relevant territory areas reach the chat by EXPLICIT LINKS from Pólya moments, not word overlap (E6 stays): a registry
   (data file, derived into the graph like other registries) maps moments/coverage items to area ids — refuted guess/hypothesis ⇒
   pr_hypothesis_testing; induction/«از چند حالت» ⇒ a_induction; «همیشه درست بوده»/confirmation ⇒ md_cognitive_biases (a_confirmation);
   negotiation problems ⇒ sc_negotiation (via the problem's own kind/words of the user's stated unknown) — shown as context «دانسته‌های قلمرو»
   when the moment fires (s04, s05, s07). Check the area ids exist in the territory registry; add none by hand to the graph.
K9 (coach) — «یه مسئلهٔ واقعی دارم: …» after a meta first message is a new problem introduction (A191 fires) (s30 p2).
K10 (coach) — «X رو بلدم ولی نمی‌دونم ربطش چیه» / «فرمولِ X رو بلدم … ربطش؟» ⇒ turn.related (s38 p7).
K11 (coach) — teacher frame: the «"خودم حلش کردم" یعنی خودِ او — بپرس…» line is a moment (A167 family) in the priority, not a free line (s15 p2,
   s16 p1); not when she already said which question she asked.
Process: two fixers (coach: K1 coach side, K2, K3 a27, K5, K7, K8, K9, K10, K11; live: K1 live side, K3 a38, K4, K6). Base = 9aa88c9.
Red-first tests on the real path (tests/test_tour1_r11_coach.js, test_tour1_r11_live.js) + the strengthened structural test. Run ALL page
tests before finishing. Handoffs `_pending_tour1_R11_<live|coach>_2026-10-16.md`. Then round 12 must report zero defects.
