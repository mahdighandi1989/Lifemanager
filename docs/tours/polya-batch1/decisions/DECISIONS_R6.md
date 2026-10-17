# Round-6 root-cause decisions (main session; binding for both fixers)

Round 6 = 33 PASS / 5 PARTIAL / 0 FAIL (round 5: 22/16/0). PARTIAL: s02, s07, s08 (A), s14, s18 (B). Read reports/round6A_handback.md,
round6B_handback.md, round6C_handback.md, round6D_handback.md (+ round6X/<sid>/findings.md). DECISIONS_R2–R5 still bind.
Most remaining defects are in ONE place: the turn signals and the per-turn question priority (F2) — stale signals, a generic fallback outranking
a specific card, and trigger regexes that are too wide (A191/A044) or too narrow (C107/B231/heuristic claim).

G1 (coach) — turn signals are scoped to (problem, the NEXT user message) and expire there. turnOf matches the previous report by problem key
   AND message, never by message key alone (s30 cross-problem «گیر کردم»). A stated result keeps priority only for the next user turn; it is
   cleared as soon as the user is stuck, asks, or offers something as a guess. «…درسته؟» after a value is a GUESS (ask «چطور می‌آزمایی‌اش؟»),
   not a result (s02, s07, s09). statedParts never writes the answered-ledger or a «[پاسخ گرفته]» tag (F1 again, s01 day 20) — it may only
   move the phase. A pasted, fully-stated puzzle: the model's validated {ph:"p", stuck} is accepted once the user's own message refers to
   working on it (not just re-pasting), so «stuck in plan ⇒ از خواسته به عقب» can fire (s08).
G2 (live) — liveCoach priority, refined (Pólya: answer the student's actual difficulty; the most specific valid question wins):
   (1) this turn's act — result (one turn), analogy carried, «نمی‌دونم چطور از X استفاده کنم» with a related problem ⇒ «نتیجه یا روشش را
       چگونه به کار می‌گیری؟ عنصرِ کمکی؟» (s35);
   (2) SPECIFIC page cards outrank generic ones — equations verdict (s26), equivalence Q_EQUIV (s36), sufficiency link «شرط کافی نبود؟» (s37),
       incubation «😴 چه به ذهنت رسید؟» and mid-course «میانهٔ راه» (s34), broken presupposition, set-aside datum after refutation;
   (3) stuck — in PLAN with unused data ⇒ «همهٔ داده‌ها را به کار برده‌ای؟» (this is Pólya's moment: stuck devising the plan — R5's «never
       before a plan» was too strict; keep it out only at the START of planning when not stuck, s02); in plan with all data used ⇒ «از خواسته به
       عقب»; in exec AFTER a failed step ⇒ restate; stuck with no step yet ⇒ never «این گام جواب نداد» (s25);
   (4) the page card's open question; (5) the ladder. Return `card` = the card actually on screen (incl. incubation, mid-course, sufficiency)
   so «همان که صفحه می‌پرسد» is true only when identical. One question per block: the 🌱/C095 lines must not issue a competing question (they
   become context, s04, s06, s21).
G3 (coach) — F6 trigger precision. A191 «اول کل را ببین» only on the message that INTRODUCES a problem (no bound problem / new problem
   detected) and only once per problem — not on greetings, results, checklists, returns (s07, s08, s11, s12, s30, s31, s34). A044 only when the
   user asks for two or more DIFFERENT unknown quantities (two interrogatives aimed at different nouns), never from a «؟» count (s12–s18,
   s36, s37). A263 only on GEN_RE (generalising talk), not every plan turn (s21). B162 whenever a plausible/inductive argument is offered as
   proof in ANY phase, bound or not (s07, s14), not on conditional real proofs (s38). C107 also on natural wording («کل قانونم خراب شد»،
   «استثناست، نادیده بگیرم؟») and on a refutation recorded on the page (s07, s20). B231 without the word «حدس» («X؟ نه. اشتباه بود», s12).
   A073 also on «بگو» to the machine («شما که ماشینی، بگو») and on «چرا X؟» ⇒ ask the learner's guess first (s12, s14). heurClaim on
   «۱۰ تا چک کردم… ثابت شد/دیگه اثباته» (s25). BRUTE_RE «همه‌ی X ها رو امتحان می‌کنم» (s21). Teacher lines A167/A129 once per moment
   (when the teacher reports a question asked / an authority move), not every teacher turn.
G4 (coach) — result phrases: «⇒ ۱۳/۲۷»، «یعنی ۱/۳!»، «پس اثر هست ولی کوچیک‌تره… پرونده رو بستم» (s28, s32); «حل کردم و یه مسئلهٔ تازه
   ساختم: Y» ⇒ old problem look-back AND Y from understanding (s11). Chat-only mid-work: when exec introduces new variables, a goal line
   «🎯 مجهول هنوز X است — این گام به آن نزدیک‌ترت کرد؟» (the chat twin of lpGoalW), and «داده‌ها چیست؟» is not suggested once the data were
   used (s18). The header phase agrees with the turn question (s28).
G5 (live) — kinds/types/wording: rain-tank (own tank, litres) ⇒ practical (natGuess regression s17); a puzzle saved via chat_solved/chat_invent
   gets natGuess, not life (s08); typeGuess «حدسم اینه که …» ⇒ pod, and chat_invent accepts a kind field (s25); live_new carries nat (s30, s13).
   Prove lists/proverb never say «مجهول/تعیینِ مجهول/اجرا روی واقعیت» (s03); life pod says «فرضیه/طرحِ آزمودن», never «حکم/طرحِ اثبات» (s05);
   no «حکم تهی» for a seating puzzle (s10); a find problem closes «✅ حل شد», never «اثبات شد» (s06); lpBLaw only for objective (s01);
   liveClosure liferef ⇒ refuted:true (s05); related-solved «نتیجه:» shows the chosen result (s01). A new guess from «ثبت به‌عنوانِ حدس»
   asks its OWN confidence and test (no inheritance of conf/ifRef; empty test refused, s01, s22). lpBBest strips only a leading preamble
   clause, never the part that carries the question's object (s23, s29).
G6 (live) — honest verdicts: a practical problem may close «✅ حل شد — جواب: بازه/دست‌نیافتنی (با دلیل)» when the honest answer is a range or
   "target not reachable" (s09) — not forced into defect/back. Goal-drift gate under a declared rotation checks the step against the GOAL
   (unknown), independent of stepFollowsTag (s35). mentions(): «1/((n+1)(n+2))» uses the datum «۱/(k(k+1))» (pattern instance, s25).
   Equivalence card not on identity simplification inside an induction step (s25). The duplicated «هنوز نه: بگو مجهول چگونه تغییر می‌کند»
   message appears once (s29). Factory case of a refuted guess is closed with its outcome (s11). Page refusals that are still unresolved
   reach the assistant regardless of age (s17).
G7 (coach, a36) — 🌱 «ثبتِ گامِ کوچک» confirms in place and clears the form (s19, s34).

Process: as before. Base = 522f92d (check `git log -1`; fast-forward if needed). Ownership: «live» = a38 (+a29, a26) — G2, G5, G6;
«coach» = a27, a28, a35, a36, a37 — G1, G3, G4, G7. Handoff notes `_pending_tour1_R6_<live|coach>_2026-10-16.md`.
