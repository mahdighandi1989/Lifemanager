# Round-10 decisions — the ZERO-DEFECT round (owner 2026-10-16: a batch ends only when no scenario has ANY defect, S3 included)

Round 10 = 37 PASS / 1 PARTIAL (s38) / 0 FAIL. Read reports/round10A_handback.md … round10D_handback.md (+ round10X/<sid>/findings.md,
round10D/scan.txt). Every item below must be fixed — S3s too. DECISIONS_R2–R8 still bind.

J1 (coach, STRUCTURAL — ends a whole class): a coach block has exactly ONE turn question. All «moment» lines (A073 «فقط جواب»/«چرا»,
   guess test, A044, B231/C107 refutation, A263, A191, C145, C120 taste, B14, proverb, imaginary-teacher, mapping, 🌱, C095) go through ONE
   function with an explicit priority; the highest-priority moment that fires THIS turn becomes the turn question (replacing the list
   suggestion when it is more specific to this moment); every other moment line is rendered as «زمینه (نه پرسشِ دوم)» and carries no «بپرس».
   Priority (Pólya: answer the student's actual move): A073 «فقط جواب» with no visible attempt (s38 p1 — S2 regression) > guess test >
   refutation (B231) > A044 multi-unknown > C107 narrow-the-domain > A263 generalising > «چرا X؟» guess-first > A191 > list suggestion.
   With a live problem the live block's turn question stays authoritative (moment lines become context there, except A073-without-attempt,
   which is passed to liveCoach as a turn act). Proverb lines never carry «⇐ همان پرسش»; the rung-3 imaginary-teacher line becomes context
   when a turn question exists (s30). Add a STRUCTURAL test: build prompts for a set of real turns (reuse the r7–r9 test fixtures) and assert
   each coach+live block has ≤ 1 unmarked question directive (round10D/scan.txt shows the scan idea).
J2 (coach): guess detection without «؟»: «شاید …»، «حس می‌کنم درسته»، «به نظرم … باشه» (s20 p3). A129 vs A167 in the teacher frame: a
   teacher reporting her own question/hint («بعد خودم حل کردم» after a question) is the A167 moment, not A129 (s15 p2). A191 only on a message
   that introduces a problem — not «هنوز نمی‌دونم. گیرم…» in a new session after a closed problem (s26 p5), not when the claim is quoted in
   full after hours of work (s38 p6). Missing space «خواست:پیش» (s27, s20). «مطمئنی درسته؟» on a chosen option ⇒ turn question «گزینه‌ات
   را با تک‌تکِ بخش‌های شرط بسنج» (s13; Pólya: check the result against the condition).
J3 (live): lpBBest keeps the whole question: HEADQ_RE accepts 2nd-person perfect verbs («کرده‌ای»، «دیده‌ای»…), TAILREF_RE tails starting
   «و در/و آن» stay attached (s25 c16). A page question and its chat paraphrase are one option (dedupe by two-way match) (s05).
   D5: the «هنوز نه: «دو بچه»» data-use gate is a heuristic gate ⇒ per E4 it WARNS once and accepts «ثبت با همین — دلیل», never blocks; also
   match number-word compounds («دو بچه» ⇄ «دوفرزندی»: number + noun with «بچه/فرزند» as the same noun) (s28).
J4 (coach/assistant): live_new from chat confirms in the chat with a link/chip «🔭 مسئله ثبت شد — باز کن» and, when the user is not on a
   form, navigates to it (s13, s17, s19). Territory homograph (s18): «ثانیه» (second, time) must not pull `a_concept_types` («معقولات اولی و
   ثانیه») — investigate why E6 let it through and fix the rule (e.g. a parenthetical alternate name is not a distinctive term on its own).
Process: two fixers (coach: J1, J2, J4 ; live: J3 + liveCoach side of J1). Base = 97f1595. Red-first tests on the real path. Handoffs
`_pending_tour1_R10_<live|coach>_2026-10-16.md`. Then round 11 (all four runners) must report ZERO defects of any class.
