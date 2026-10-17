# Round-3 root-cause decisions (main session; binding for both fixers)

Read all four round-3 reports first: reports/round3A.md, round3B.md, round3C.md, round3D.md (evidence in round3X/<sid>/). Also re-read
DECISIONS_R2.md — those decisions still bind; round 3 found where they were implemented only partly.
Standard (owner): the page + the prompt it sends must ENFORCE Pólya's spirit. No conventional numbers (thresholds only from axioms A0–A4 /
existing theorems — e.g. A4's «> ½»); honesty over flattering closure; no islands (extend existing functions, never add a parallel path).

Owner-delegated decisions taken here (decided from his recorded concerns, not asked):
 D1 pod (prove-or-disprove) is OBJECTIVE BY DEFAULT, not forced: the kind picker preselects objective for prove/pod but the user may set life
    (a life hypothesis "is X true for me?" is pod-shaped yet has no proof). natOf() keeps the default only when no explicit nat is stored.
 D2 Coach question order = Pólya's general→specific by the user's RUNG on the current phase (how many of that phase's questions were already
    asked/answered in this problem), never by message count/seed. Answered questions (answeredIn) are skipped, not re-suggested.
 D3 End-of-ladder (C188) wording: «اگر نردبان تمام شد: ایدهٔ کلیدی را جدا کن و فقط گامِ بعد را بگو، سپس «کتاب را ببند و خودت دوباره حل کن»».
    Remove any «هرگز کلِ حل» line that contradicts it.
 D4 natGuess / spatial / unit regexes match WHOLE WORDS (Persian word boundaries: start/space/ZWNJ/punct), never substrings («تاست»≠تاس,
    «کمتره»≠متر). Unset kind ⇒ NEUTRAL frame (ask the kind), not the life frame. Textbook problems with units suggest objective, not practical
    (practical = the user's own real-world constraint/resource, not mere units).

A — live tunnel (a38_live.js + its card/flows) — fixer «live»
 A1 S1 refuted guess shown «اثبات شد» (a38 ~1876): proved only when verdict==="proved" AND the guess was not refuted (g.hit!==false / no
    refutation recorded). Refuted ⇒ «رد شد» + the R5 «why did intuition fail?» follow-up.
 A2 Units checker accepts compound units (مترمربع، مترمکعب، متر مربع، m^2, cm³ …) — normalise before comparing (a38 ~403).
 A3 Aux bridge (R5) checks SUBSTANCE: the bridge line must name how the aux result yields the main result; a special→general step without a
    generalisation argument (induction / "for any" / symmetry) is flagged «از حالت خاص به عام بدون استدلال» and cannot close as proved.
 A4 Look-back "structure / isomorphic" uses liveMapOk (the user's declared mapping), like the related-problem gate.
 A5 lpBLimit (limits/boundary question) for every kind where data have ranges, not only spatial.
 A6 sat/suff (is the condition sufficient?) answers that presuppose the unknown (circular) are flagged.
 A7 Analogy step asks for the analogy's LIMITS («کجا این شباهت می‌شکند؟»).
 A8 stepFollowsTag fixed both directions (induction plan; checking / new-datum steps are legitimate).
 A9 eqsOf counts only real equations (has «=» with symbols on both sides, not prose, not a simplification chain a=b=c counted N times); the
    equations-vs-unknowns card hidden for proofs.
 A10 pod look-back disambiguates «the refuted claim» vs «your refutation».
 A11 u/p (understand/plan) question lists kind-aware (practical ⇒ QK.pract restored; life ⇒ life list; objective ⇒ math list) (a38 ~1173).
 A12 liveClosure never says «حل شد» before look-back is done; mind card: a failed live step is a failure, not a success (R7).
 A13 Small: «؟۴۸۷؟» not a sentence end; refutedLine prints the claim, not a count; practical frame rejects empty answers; pod card gets
    «برآوردنی؟» and the relax-condition card; limiting case suggested before an experiment; lpDep revisited at look-back; «کدام پرسش کمک کرد؟»
    lists whole questions; a plan-question answer counts as a used tool; letter-form and angle transfer prompts; near-copy checks normalised
    (spaces/ZWNJ/digits) rather than stricter; chart axis labels ≥ 11px; stale toasts cleared on view change; bidi: wrap → and results in the
    same isolate.

B — assistant / coach / tour (a27_tour.js, a28_systerr.js, a36 hooks, a37) — fixer «coach»
 B1 Chat-only coach ADVANCES the phase from the user's own words (u→p when the unknown/data/condition were stated; p→e when a plan is stated;
    e→b when a result is stated) and the plan phase includes working backwards («از خواسته به عقب») (s08 FAIL; a27 ~896 TQ.plan, QK.obj.p).
 B2 Order per D2 (a27 ~1124 open[seed%…], ~1334 seed:userTries).
 B3 Stuck with unused data ⇒ the next question moves to «آیا همهٔ داده‌ها را به کار برده‌ای؟ همهٔ شرط را؟» before re-asking «پیش‌تر دیده‌ای؟».
 B4 New session about a closed related problem gets its result + method + look-back line (the a38 hook must not return "" when ph==="done";
    give a compact "solved earlier: method/result" block).
 B5 Look-back raises the qRung (look-back questions count).
 B6 Coach kind/phase misreads: «رسید به»، «جواب اینه»، «تموم شد»، «پس ثابت شد» ⇒ result stated ⇒ look-back, never "stuck".
 B7 R7 false failures: UNSOLVED_RE must not fire on «غلط بود» describing a discarded earlier attempt that was followed by a new result.
 B8 Territory relevance (R6 again): «دانسته‌های قلمرو» relevance text must come from the USER turn, not the auto-turn instruction (a28 ~121-177);
    stem() must not truncate «اثبات»→«اثب» (minimum stem length / exception list).
 B9 willHookOn (a36 ~1102) uses the shared lexicon (FAIL_ME); add «اعصابم خورده»، «خیلی عصبانیم». 🌱 after a setback: card + push for the
    smallest next step (model rule + page card).
 B10 Teacher/parent coach mode reachable from chat (detect «به بچه‌ام / شاگردم یاد بدم» ⇒ teacher frame: ask the student, don't solve).
 B11 Cross-session fade for chat-only work (the coach remembers the phase/rung of the bound problem across sessions).
 B12 live_new regex extended for common phrasings («یه مسئله دارم»، «می‌خوام حل کنم»، «گیر کردم توی») — still binding by explicit action first.
 B13 chat_invent without a parent gets nat from natGuess (D4) instead of none; look-back + chat_invent never create duplicates (update by title
    near-copy).
 B14 Proverbs kind-aware; taste lines available beyond look-back where Pólya places them; incubation wording («بگذار ته‌نشین شود، بعد برگرد»).

Process (both fixers): your own worktree, commit early and often (container restarts happen), every fix with a test that FAILS before the fix
(red baseline) and drives the REAL user path (not hand-built features). Run every page test by exit code. Edit only src/, run build.py; never
edit the bundle. Keep SYS ≤ 20000 (prompt text goes in hooks). Do not touch the other fixer's files except via its public APIs; if you must,
say so in your final report. Final report: list of A*/B* items with commit + test name, and anything you could NOT do with the reason.
