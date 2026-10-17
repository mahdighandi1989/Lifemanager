# Round-12 decisions — zero-defect round 4

Round 12 = 36 PASS / 2 PARTIAL (s27, s38) / 0 FAIL; S2s all from K2 (guess detection now too broad) + S3s. Read reports/round12A_handback.md
… round12D_handback.md (+ round12X/<sid>/findings.md and their scan tools). DECISIONS_R2–R11 still bind.

L1 (coach) — GUESS precision (both directions burned us: R10 too narrow, R11 too broad). A guess = the user asserts ONE candidate claim about
   the problem's object, tentatively, and has NOT yet tested it. Not a guess (each from a report; add each as a control in the test):
   - conditional framing «اگه فکر کنم، …» naming his unknown (s01 p3); a hedge he cancels himself «شاید X ولی … ربط ندارن» (s01 p6);
   - a verdict after his own worked result/check: «فکر کنم حل شد»، «به نظرم منطقیه»، «درسته» (s03 p5, s38 p5) ⇒ result path (look-back);
   - his own chosen action/plan: «شاید یه اسکیس… فردا صبح ۲۰ دقیقه» (s34 p2) ⇒ step/🌱 path;
   - an enumeration of candidate meanings or explicit doubt «یه بار… یه بار…، نمی‌دونم کدوم» (s27 p2), a definition question «X یعنی…؟»
     (s13 p3) ⇒ A038 «به تعریف‌ها برگرد» is the turn question;
   - already tested + asks for proof «امتحان کردم، نشد… فکر می‌کنم نمیشه… چطور ثابتش کنم؟» (s11 p3) ⇒ the proof question (C145 family /
     the plan card), not the test question.
   When ambiguous, the asymmetry rule applies: a false guess REPLACES Pólya's question (costly), a missed guess leaves the generic claim line as
   context (cheap) ⇒ require positive evidence. turn.guess to liveCoach follows the same function.
L2 (both) — STRUCTURAL, final: the structural test scans the WHOLE user prompt (every block: coach, live, related, open-problem, sieve
   «# غربالِ لایه‌ها» (a32 «پرسش‌های بدهکار»), idea «💡» (a35), will/🌱 WILL_RULES (a36, also on turns with no coach block), imaginary-teacher
   example (a27:1490 — no fixed example question; use the turn question or none), objective-frame line «روشن می‌بینی… ثابتش کنی؟», silence rule
   (a27:1489 — point to the turn question, never "the previous one")). The only allowed unmarked directive besides the turn line is the
   SAFETY line of the «# تور» block (explicit allowlist in the test). Everything else is the turn question or «زمینه (نه پرسشِ دوم)».
L3 (coach, a35) — the idea_counter confirmation shown in the chat must be written FOR THE USER (no «از کاربر بپرس» instruction leak), and the
   instruction to the model goes only into the prompt (s20 p4/p5).
L4 (live) — pageQ in phase u respects the whole-first sub-step: while the «اول کل، بعد جزءها» card is open, the page question IS that card
   (s21…s29). The incubation card is dropped as turn question when the message already reports the idea (s34 p6).
L5 (live) — «کدام پرسش کمک کرد؟»: chatQs only from AI messages about THIS problem (s29 c23); a multi-sentence page turn question (guess test
   «… چطور می‌آزمایی‌اش؟ کدام حالتِ خاص…؟») stays ONE option (s02, s11).
L6 (coach) — proverb picker also avoids the counter-proverb (PROV_OPP) already used in the block (s25, s26). CERT_RE adds «معلومه»، «واضحه»،
   «بدیهیه»، «شکی نیست» ⇒ B107 + md_cognitive_biases link (s28 p1). Post-close «نمی‌دونم…» about the closed problem ⇒ related-solved lesson is
   the turn question, not u1 (s26 p5).
L7 (coach, registry) — territory: s14 statistics (σ/√n, n−1, «میانگینِ نمونه») reaches pr_statistical via the same explicit cues_fa mechanism
   as negotiation (matched on the problem's own statement/unknown) (s14); a_induction via B162 is shown only when the argument is an induction
   from instances, not for exam help on a formula (s14 p9).
Process: two fixers (coach: L1, L2 coach/a32/a35/a36 parts + the structural test, L3, L6, L7; live: L2 live part, L4, L5). Base = 53d0fc6.
Red-first tests (tests/test_tour1_r12_coach.js, test_tour1_r12_live.js). Run the full page suite (LLA_BROWSER_JOBS=3) before finishing; kill
only processes you started; keep scratch small (disk is limited). Handoffs `_pending_tour1_R12_<live|coach>_2026-10-17.md`.
