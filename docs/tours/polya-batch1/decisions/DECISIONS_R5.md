# Round-5 root-cause decisions (main session; binding for both fixers)

Round 5 = 22 PASS / 16 PARTIAL / 0 FAIL (round 4: 16/22/0). Read reports/round5A_handback.md, round5B_handback.md, round5C_handback.md,
reports/round5D.md (+ round5X/<sid>/findings.md). DECISIONS_R2–R4 still bind.

F1 (coach) — ASYMMETRY of error for the regex fallback. A false «answered»/«moved forward» silently skips Pólya's question (harmful); a false
   «not yet» only re-asks while the model sees the user's words (harmless). So: the fallback NEVER marks a question answered and never moves the
   phase forward on weak evidence; only (a) the model's validated coach_state, (b) a page answer, or (c) an unambiguous result phrase moves it.
   RESULT_RE «پس X = …» counts only when no continuation follows («حالا/بعد/دیگه فقط…» ⇒ intermediate, s18). «X تموم شد. حالا Y» ⇒ new
   problem Y from understanding (s29). PLAN_RE alone never jumps to plan from an opening that is discouragement or a brute-force intention
   (s34, s37). A first message that states its own result («حلش کردم! … = …») is NOT a pasted statement: said:result is kept ⇒ look-back (s31,
   s37); the validator never recomputes the phase backwards over a stronger earlier signal. realReply rejects «یادم نمیاد»، «گیرم». A heuristic
   «ثابت شد دیگه!» after drawings only (no argument) is a CLAIM ⇒ ask «برهانش؟», not look-back (s03).
F2 (live+coach) — ONE question per turn, one source. liveCoach.q is computed by the SAME function that decides the page card's open question,
   with this priority (Pólya: answer the student's actual difficulty first): (1) what the user did THIS turn — carried a ratio/relation to a new
   quantity ⇒ analogy-limit (s23); stated a result ⇒ look-back «از راهِ دیگر؟ نتیجه را وارسی کن» even for a bound problem before the page
   records it (s28); (2) failure-triggered — broken presupposition (also on the page outcome card, s22), set-aside datum after a refuted guess
   (s22), stuck forward in plan ⇒ «از خواسته به عقب» (s08: a pasted puzzle still counts as «unknown stated» once the user has read it; stuck/fail
   from coach_state are NOT dropped for pasted openings); (3) the page card's open question; (4) the ladder by rung. The block never says
   «همان که صفحه می‌پرسد» unless it is literally the same string. B3 «همهٔ داده‌ها؟» never before a plan exists (s30, s33, s35). The
   prediction question is not repeated once a prediction is recorded (s35).
F3 (coach) — ledger scoped per PROBLEM (pid), not per session (s24, s28); B4 «مسئلهٔ حل‌شدهٔ مرتبط» also for a parent closed in the same
   session. A new session with exactly one open live problem gets one hook line «مسئلهٔ بازِ تو: «…» — همین را ادامه می‌دهی؟» (suggest, never
   auto-bind; s34). The «# پس از شکست» block lives only in the turn of the failure and the next one (s28).
F4 (both) — kind/type: the chat coach's class for LIFE is «life», never «pract» (natClass/qClass, s13, s19, s34). The header word comes from type
   × kind: objective prove ⇒ «اثباتی»; pod life ⇒ «فرضیه»; the mere word «اثبات» in user text never sets prove (s14, s27, s05). typeGuess:
   «درسته؟»، «حق داره؟»، «همیشه … میشه»، «فکر کنم … درسته؟» ⇒ pod (s25, s33); a chat_invent update re-guesses type (s25). natGuess suggests
   practical for own real problems with a real resource («قالبِ من»، «سه نفریم… می‌رسیم؟»، s23, s26); a workplace conflict ⇒ life (s05);
   spatial suggestion not from «نشستن/صندلی» seating puzzles (s10). lpNat choice is saved immediately on change, not only with «ثبتِ فهم» (s13).
F5 (live) — look-back honesty, completed:
   - partNegated works: NEG must not swallow the clause it is testing; a check text whose number/claim contradicts a part's number/claim
     («۵ ساله نه ۷»، «۱۷٫۵… به ۲۰ نرسید» vs «≥ ۲۰») is flagged even when the user ticked «بله» (soft challenge, s01, s09).
   - Impossibility results: a per-part option «جوابی نیست — ثابت کردم این شرط‌ها با هم برآوردنی نیستند» that closes as «✅ ناممکن (اثبات شد)»
     (s11).
   - Life pod look-back gets the verdict select «تأیید شد / رد شد / هنوز نامعلوم — شواهدم ناکافی است» with per-part check (s05).
   - «بیش از یکی» + conceded insufficiency ⇒ not «اثبات شد» until all solutions are found or the condition is completed; understanding card
     «کافی است» updated (s29).
   - Filing a defect is never blocked by unanswered per-part checks (s03).
   - A second «✅ حل شد» after a fixed defect sets state «review» and drops the old defect label (s30).
   - «کجا خط می‌کشی = هیچی رو بیرون نمی‌ذارم/همه مهمه» ⇒ soft challenge (s01).
   - eqsOf: derived equations (obtained by substituting earlier ones) are not counted as new (s26).
   - stepFollowsTag: a negated OUTCOME word («مات نمی‌شود») does not unlink a step that executes the plan's ACTION (s21); the message names
     the real reason.
F6 (coach, lines in hooks — from coverage.json items, cite the item id; triggered by the matching moment, not tied to one phase):
   «حدس را بیازما» after a refuted guess (s05); Pólya's reasons a bad question is bad, in the teacher frame (s15); authority ⇒ forgetting in the
   parent/teacher frame (s16); many unknowns ⇒ ordered sub-problems (s17); «اول کل را ببین» on a long statement (s20); inventor's paradox
   whenever generalising is discussed («کلی‌تر سخت‌تره») and the heuristic-incomplete label whenever a plausible argument is offered as proof
   (s14, s20); «فقط جواب» ⇒ ask the learner's own attempt before the first hint (s38); imaginary teacher named at rung ≥ 3 (s30); fading — at
   rung ≥ 3 the reply is not longer than the user's own message (relative, no fixed number; s30); taste / good-authors line in plan and exec
   (s31); notation-aversion line when the user avoids letters (s36); backward branches / dead-end C095 and «بندازم دور» as abandoning (s06);
   counterexample ⇒ narrow the domain (s07); easy corollary (n ⇒ ∞) in proof look-back (s25); «why assume all hold?» for indirect proof (s10).
F7 (live) — «فقط بخشی از شرط» aux box and the relax card ask «مجهول چگونه تغییر می‌کند؟» (s04). Approximation vs actual margin compared when
   both are numbers with units (s02). lpBBest includes page-answered plan questions and strips chat preambles (s01, s23). Closure/related dates
   use APP.today (s01). mentions(): normalise digits/units and match number+noun («۳۰ پله»، «دو بچه»، «مسیرِ A»). lpOReflect «حدسِ تازه» offers
   «ثبت به‌عنوانِ حدس» (s22). Smalls in the reports (guess kit x/n tools for life, double unit message, 🌱 form confirmation, milestone↔backward
   link, squaring equivalence at the step, goal-drift under rotation, pod p9 «مجهول») — do them.

Process: as DECISIONS_R3/R4. Base = branch tip 8407984 (check `git log -1`; fast-forward if needed). Ownership: «live» = a38 (+a29, a26); «coach»
= a27, a28, a35, a36, a37. F2 spans both: the live fixer owns liveCoach.q priority and the page card; the coach fixer owns the hook text and the
coach_state/ledger side. Agree via the public API A.liveCoach(pid,{asked, turn:{analogy, result, stuck, fail}}) — the coach passes the turn
signals in; the live fixer implements the priority. Handoff notes `_pending_tour1_R5_<live|coach>_2026-10-16.md`.
