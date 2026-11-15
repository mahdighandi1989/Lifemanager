# Tour batch 1 (Pólya) — ROUND 27 (read RUNNER.md … RUNNER26.md incl. all ADDENDA, then this; this overrides)

Page: main 253b357a (round-26 merge; `build.py --check` in sync, dist newer — else STOP). What changed: DECISIONS_R26.md Q1–Q10 with its
binding Clarifications C15–C39, the fixers' hand-backs reports/fix26/*.md (read their «Not done» lists — each is a claim to test), the
handoff notes docs/overhaul/handoff-notes/_pending_tour1_R26_{arith,correction,story,prior,today,loop,classify}_2026-11-12.md, and
WORKLOG (137): three clashes between fixers found only after the merge («÷» keeps its length; «موقعیت»; replay fixtures).
Runner model this round: the session model (Opus). In the blind comparison of round 26 this model judged accurately but did NOT
EXERCISE six branches. So this round every arm below is named; an arm you could not run is written «NOT RUN: <why>» in the arms table,
never silently skipped. A scenario with an un-run required arm cannot be PASS.

REQUIRED THIS ROUND (everything in RUNNER26 still applies; the bar only rises):
1. RE-RUN EVERY round-26 scenario of your group (incl. arm runs and the prior-work scenarios). For each round-26 defect id of your group
   (and every U-id of the blind table that belongs to your scenarios) write «<id>: FIXED | STILL | CHANGED (how)» with the turn p<N>.
   Every defect binds, S3 included, PASS scenarios included.
2. THREE COMPENSATIONS (binding from this round, COMPARE26_result.md):
   (a) in every multi-problem scenario, match each problem's 📜 line by line against that problem's own events — a line under the wrong
       problem, a missing line, or a line of the session that belongs to no problem is a defect;
   (b) a defect is booked in EVERY scenario whose evidence shows it, not only in the first one (a scenario that shows a known defect is
       never PASS);
   (c) the arms below are run on purpose, each in at least one scenario of your group, with the turn p<N> in the arms table.
3. ARMS (each group, each one at least once; «NOT RUN: why» if impossible):
   T1 a real TIE: two candidates fit her reply equally — the page must ask naming both, never ask and declare together.
   T2 a PIECE AFTER CLOSURE: she brings a piece for a problem already closed — own waiting entry, the closed problem untouched.
   T3 the «= N unit» shape: «… = ۱۲ متر», «۳ متر در ۴ متر = ۱۲ مترمربع», «۲۹۴۳۰۰ ÷ ۴۸ = ۶۱۳۱ ثانیه، حدودِ ۱۰۲ دقیقه» — correct AND wrong.
   T4 a THIRD prior-work report in the same problem (the ledger merges, waiting steps stay).
   T5 she TAKES BACK her own dispute («نه، اشتباه کردم، درسته»): restored with history.
   T6 «جمعهٔ بعد» and «باشه» as answers to the Friday / date question — both read and recorded.
   T7 a correction of a datum that earlier work used, small step (۵ ⇒ ۴): every number really built on it is named stale with the exact
      new value; nothing else (C11).
   T8 TWO open predictions at once; an outcome sentence goes to the right one or the page asks which.
   T9 a COINCIDENTAL number: a value equal to the corrected one but not derived from it (the cable «۱۵ متر» beside the height «۱۵ متره»)
      — never stale.
   T10 division written three ways in one scenario: «÷», «تقسیم بر», and a glued fraction «۱۳/۱۲» — the first two are division, the third
      a fraction; check what the page shows ✓/✗/؟ and that the coach is told the same.
   T11 a correction AND a question in one message (A26-34): the correction is recorded, never «پرسش بود».
   T12 a mid-session calculation that must NOT open prior-work; an opening with ONE worked step that must.
4. ARITHMETIC (Q1, C15–C29): in every scenario with numbers, correct work in the shapes the round-26 S1 misread (a fraction identity,
   a running sum with a unit word, a scale word «میلیون/هزار», «و خرده‌ای، یعنی …», π, a percentage «۲۰ درصدِ ۳۰۰»), the same shapes
   genuinely wrong, a rounded value (the page asks «؟», C16/C25), an ellipsis sum «۱ + ۲ + … + ۲۰ = ۲۱۰» (fixer: unread «—», test it),
   and look-alikes (date, score, congruence, equation with an unknown). Verify every number with exact arithmetic before judging.
   Correct work ✗ or wrong work ✓ = S1, in her view or told to the coach.
5. The fixers' «Not done» lists are claims: arith («۳ متر در ۴ متر», ellipsis sums), correction (A26-15 s07 ✏️, C25-15 pwC2), story
   (bank #78/#92 outcome without «پیش‌بینی»), prior (D25-15), today («آخرِ سال»، «عید»، «سرِ برج»), classify (bare first names,
   two people in one browser — Q10, an open sheet). Run each at least once in the group that owns the scenario and say what happened.
6. Carried, not settled in round 26: D25-17 and B25·D17 (session pin / wrong Gregorian text) — two runs each; C12 on a wrong sentence;
   C2 fully; aA2 forgetting/regression (build the practice ids from the page, never hard-coded); group C: the s29 sketch turn (make the
   image again) and pC3's plan forms.
7. Owner question bank 1–53 (split below), in natural words inside real problems; 42–53 are new — each needs «هست، این‌جا» with a
   screenshot, or «نیست» ⇒ sheet. Split: A 1–10 + 42–44 · B 11–20 + 45–47 · C 21–31 + 48–50 · D 32–41 + 51–53.
8. Depth (roadmap §7), the two need maps (§9), the five-way parts table (§12), ages (§14), prerequisites (§15–16), dataset addendum
   (p<N>, better/rN.txt, keep ai/, ≥1 look-back scenario) — unchanged and binding. UTF-8 only: write findings with a heredoc or Write,
   and check the file decodes (`python -c "open(f,encoding='utf-8').read()"`) before DONE — four group-A files broke in round 26.
Everything else as RUNNER26. Output round27<X>/. E-mails «🧭 پولیا · دورِ ۲۷ · …» (one per scenario, structure per RUNNER16 / roadmap §6);
if sending is refused, write mail.html and mail.subject.txt and say so — never ask another agent to send it; the main session sends them.
Final message: per scenario RESULT + defects (with p<N>) + «ارتقای لازم» + the round-26 defect table + ARMS TABLE (T1–T12: scenario, p<N>,
verdict or NOT RUN) + 📜 line-match table per multi-problem scenario + prior-work verdict table + arithmetic table (what she wrote · exact
value · what the page said · verdict) + chat⇄page verdicts + owner-bank table + routing + PARTS.md «نسبت به دورِ ۲۶» + new owner-like
questions + your token/time use if you can see it.
