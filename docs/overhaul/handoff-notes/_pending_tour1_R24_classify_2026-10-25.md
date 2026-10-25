# Pending: Pólya tour round 24 — fixer «classify» (R4, R6) — 2026-10-25

> Temporary note for the other round-24 fixers and the integrator. Decisions: tour1_polya/DECISIONS_R24.md R4, R6. WORKLOG (108), PROGRESS 117
> (numbers as assigned at launch; the coordinator renumbers at merge).

Files changed: `apps/learning-architecture/src/app/a27_tour.js` (detector, intro strip, classification, turn-question fit, guess, post-check),
`a26_assist.js` (`chatTask`: one line), `a44_route.js` (`ABILITY`, natural-return acceptance in the prerequisite post-check), rebuilt bundle.
Test: `apps/learning-architecture/tests/test_tour1_r24_classify.js` + byte copy of the bank `tests/variants/VARIANTS_R24.json`.

## Contract: one problem detector for the opening (story, prereq/loop, today — everyone who asks «is this a problem?»)
- `AS.statesProblem(text)` now also returns true when the greeting/intro stripper removed a lead-in that NAMES the problem («مسئله: …»,
  «معلممون این سؤال رو داده: …», «تمرینِ کتاب: …») and something real is left. Use it (never a private regex) for chat focus, routing, titles.
- The kept chat statement is `coach.stmt` (stripped). `coach.stmtRaw24` holds the raw opening message when it was a problem; `AS.chatFocus(s)` (= the
  «مسئلهٔ گفت‌وگو» line of «# وضعِ کنونی», hence the coach tier and «# پیش‌نیاز») checks both. **story fixer:** if you rewrite `coach.stmt` from a
  correction, keep `stmtRaw24` as is — the check compares the two with `sameStmt` and stops trusting the raw text once they diverge.
- Intro forms added: «سلام، سارام کلاس دهم.» (after a greeting: name+«م» + grade/age) and «سارام کلاس دهم، …» (no greeting: name+«م» + an ORDINAL grade,
  «کلاس دهم/سومم/۱۰»). «خسته‌ام کلاس داشتم» is not an intro.
- No «# اصلاحِ پیامِ پیشین (شاید)» block when the message is the first user message of the session AND states a problem («… مامانم گفت غلطه. چرا غلطه؟»).
  A correction in turn 2+ is unchanged. **correction fixer:** your own correction paths are untouched; only this block's trigger.
- `AS.notProblem("...")` is false now: silence keeps «# مربیِ حل» and the silence rule. Greeting-only still true.

## Contract: message kinds (everyone who reads `AS.metaMsg22`)
- `"use"` is no longer returned when the same message says she is stuck (`AS.stuckSaid24`: STUCK_RE, «دیگه نمی‌دونم چی کار کنم/چطوری ادامه بدم»).
- `AS.chatTask`: `metaMsg22` = `use` | `rating` is a coach signal (practice reports and self-ratings go to `lla_coach` when the prompt has the coach block).
  They are still never a new problem (`statesProblem` false, no whole-first).

## Contract: turn-question fit (`AS.unfit23`) — story fixer (R2) owns the stage, classify owns these reasons
- «مجهول چیست؟» is not stale on a next-step question («بعدش/حالا/دیگه چی کار کنم؟»); her own decision question («با این بودجه چیکار کنم؟») still is.
- The e1 «چه پیش‌بینی می‌کنی و چقدر مطمئنی؟» is stale only on a real confidence: a percent tied to «مطمئن/اطمینان/احتمال/شانس», «مطمئنم/مطمئن نیستم»,
  a scale «از ۱۰ تا ۷», or a bare percent right after the assistant asked «چقدر مطمئنی؟». Data percents never count.
- «جواب را در شرط جای‌گذاری کن / در شرط بگذار» is stale when she reported a substitution check earlier in the session after her last result.

## Contract: guesses and confidence (today fixer — R7 guess outcomes; story fixer)
- `AS.coachGuess`: «… درسته؟» after her own reported check (`CHECKED24`: «با ضرب هم چک کردم», «وارسی کردم», «امتحانش کردم، درست درومد») with no
  failure is NOT a guess. «حدس می‌زنم/شاید … باشه» stays a guess even with a check. «فکر کنم (کل) مسئله حل شد» is a result, like «فکر کنم حل شد».
- `AS.confOwn24(text)` ⇒ number | null — the confidence of a chat guess is booked only from her words (`solve.g[1].conf` in `guessToProblem`).
- `AS.partSolved24(pid, text)`: «X رو (این‌طوری) حل کردم» where X is a word of the live problem's plan/steps/sub-problems and not of its title ⇒ part
  solved; the coach's «می‌گوید حل شد» (problem level) is not added.

## Contract: post-check (everyone who writes a reply rule into `AS.replyCheck`)
- Two question segments are one when ANY page question in `coach.pQs21` (the session's page-question log) covers both (`inPageAll24`). The old
  first-match lookup is `AS.R24_QUARANTINE.inPage22First`. **loop/story fixers:** if you add page questions with two sentences, nothing to do — they are
  logged by `pageTQs22` from the prompt as before.
- A «…» after «مثلاً / برای مثال / به شکلِ / شبیهِ / فرض کن» in the same sentence is the assistant's illustration, not a quote of her (unless the
  sentence attributes it: «گفتی/نوشتی/حرفت/جمله‌ات/ثبت»). A SHORT quote right after «گفتی/نوشتی/حرفت» is now checked too (must be in her messages).
- a44 prerequisite return: a reply is accepted as the return when it carries at least half (or three) of the waiting step's / parent's meaningful
  words and numbers (`APP.PRE.backTo24`), not only the exact step text.
- `whyAsk` (moment A073w «خودت فکر می‌کنی چرا؟") is off for a question about the system («سیستم/سامانه/این برنامه/دستیار/این صفحه … ؟») and for a «چرا»
  inside «مثلاً نمی‌دونم … چرا …».

## Bank (VARIANTS_R24, R4 + R6)
- All entries of this fixer's mechanisms judged green. Given to others with reasons: #138 (register for elders), #140 (ISO to a person) → age fixer (R5);
  #137 «reply gives a child the full next step ⇒ caught» names no R6 mechanism and no such post-check exists — not built (HANDBOOK §12 row 64).
