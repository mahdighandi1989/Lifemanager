# Round-7 root-cause decisions (main session; binding for both fixers)

Round 7 = 34 PASS / 4 PARTIAL / 0 FAIL (round 6: 33/5/0). PARTIAL: s02, s04 (A), s15, s16 (B). Read reports/round7A_handback.md,
round7B_handback.md, round7C_handback.md, round7D_handback.md (+ round7X/<sid>/findings.md). DECISIONS_R2–R6 still bind.
Remaining defects are almost all PRECISION of the per-turn signals and their priority. Principle for every detector this round (from the
asymmetry in R5/F1): a wrong positive that REPLACES Pólya's question is costlier than a miss — so detectors that override the turn question
must require positive evidence of THAT act by the USER in THIS message (not quoted text, not role-play lines, not a phrase anywhere).

H1 (coach) — signal precision.
  - guess: «…یا نه؟» in a QUESTION about the user's own decision is not a guess (s01, s02); a guess = the user asserts a candidate value/claim
    and asks if it is right («فکر کنم X»، «X درسته؟»، «حدسم X»), also declarative «فکر کنم آخرش ستان باشه» (s12). Text inside quotes/role-play
    lines is excluded; in the teacher frame a self-check about the teacher's own hint («باز لو دادم نه؟») is NOT a guess — it is hint-ladder
    feedback (s15).
  - abandon: turnSig carries `abandon` (and `text`) to A.liveCoach so a38's abandon rule fires from chat (s04, s06).
  - fresh finding clears carried stuck: «پس … هیچ‌جا استفاده نکرده!»، «پیدا شد»، «آهان» (s33, s12); «# پس از شکست» not on a success turn.
  - WHY_RE (A073) only when the user asks for an explanation they have not attempted and did not self-answer in the same message (s31), not
    on the turn that already is the guess (s14); in the parent/teacher frame the authority⇒forgetting moment (A129) outranks A073 (s16);
    TA_RE adds «من گفتم»، «قبول کرد چون من باباشم/معلمشم» (s16).
  - A191 only on a message that introduces a problem — not on the first message of a session that is a taste/return/talk (s31 week 4); ranges
    and dimensions («۱۰×۱۰»، «۵۰-۱۰۰») are data, not the user's own formula (s11, s13).
  - A263 not on «حالت کلی» meaning "the general case" in a stuck sentence (s38) — only on talk of generalising the problem.
  - B162 on evidence counts «۳۸ تاش جور درمیاد»، «نشونه‌ها خیلی زیاده» (s20). «راست میگی» is not a claim (s11).
  - Result/close: «پس + number» is a result only when the problem has been stated and understood (not in the opening that creates it, s28);
    «X تموم شد. حالا Y» = new problem Y from understanding (s29, restore R5/N3; «پیداش کردم … حالا Y» same, s12). A044 adds «چطور(ی)»،
    «چه شکلیه» and yes/no quantity questions (s23, s29). PLAN_RE: «با معنی سوم کار می‌کنم» before the claim/assumptions are written stays in
    understanding (s27).
  - Refutation lines (B231 / a38 refuted line / C107) are fresh only within the same day as the refutation (s19); C107 not for a one-off life
    hypothesis (s05).
  - The 🎯 goal line quotes the user's latest restatement of the unknown (C.unkBy), not a raw earlier message (s18); a varEq turn is exec
    immediately.
  - live_new template gets "nat" (s19).
H2 (live) — priority refinements in coachCore.
  - Stuck questions get MORE SPECIFIC on consecutive stuck turns (Pólya general→specific): the stuck sequence advances by the problem's rung
    (all-data → which datum/condition part is unused (name it) → backwards → auxiliary/related), never the identical question twice in a row
    (s02).
  - A set-aside datum WITH a reason is «رسیدگی‌شده»: it becomes the turn question only after a refuted guess or when the user is stuck and every
    other datum is used (s30).
  - Specific card order: equivalence / multi-answer / presupposition / aside / equations verdict BEFORE incubation and mid-course (s36). The
    mid-course card is not due on the first day of work (count from the first step, not creation) and holds the turn question for one turn
    only; the user's own explicit question in that turn outranks it (s01, s04).
  - An unresolved page refusal (e.g. goal gate) outranks the mid-course card (s35). Goal gate: a rotation step that names an action toward the
    goal is not flagged by word overlap alone (s35).
  - Practical over-collecting («می‌ترسم جا انداخته باشم، کِی بسه؟») ⇒ «کجا خط می‌کشی؟», never «همهٔ داده‌ها؟» (s01).
  - Exec stuck with no step and all data used ⇒ the kind's exec ladder (induction: base case/where the hypothesis is used) or backwards, not the
    "check each step" card (s25).
  - Two-question blocks: when the turn question is the guess test, C145 «برهانش؟» becomes context (s25); the mapping line on a child problem is
    context (s24).
H3 (live) — wording/flags: prove-problem proverb in chat via the proofLike rewrite (s03); lpBLaw never for a life/practical decision (s01);
  life-pod plan/exec cards without «مجهول» (s05); lpBBest includes every question asked in chat that the user answered, incl. «همهٔ داده‌ها؟»
  (s02); «ثبت به‌عنوانِ حدس» keeps the refuted guess in history so «دوباره پیشنهاد نکن» stays (s01); header phase wording for practical «اجرا
  روی واقعیت» consistent between header and block (s22); a new guess starting a new problem has header «فهم» (s25); on «چطوری بگم؟» in a
  proof look-back the direct-proof item b6 is the turn question (s10).

Process: as before. Base = branch tip (check `git log -1` on claude/life-program-flow-diagram-q37jvr — 3c2846b or later; fast-forward).
Ownership: «coach» = a27, a28, a35, a36, a37 (H1); «live» = a38 (+a29, a26) (H2, H3). Handoff notes `_pending_tour1_R7_<live|coach>_2026-10-16.md`.
