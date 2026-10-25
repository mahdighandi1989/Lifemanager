# Tour 1 (Pólya), round 24: «today» handoff (R7, 2026-10-25)

Scope (DECISIONS_R24 R7): deadline_done from her words, chat-guess outcomes, one stuck one line, no plan from a question / no model date
without her words, promises only when unfulfilled, one prediction one 🎯, route events bound to their own problem, look-back remain line,
the look-back conjecture she tests becomes live, one voice for «🔭 نگه داشتم», no «fill the fields» for a view without fields.
Base: 3685102d. Docs: WORKLOG (110), PROGRESS 119, HANDBOOK (§10 row, §12 row 67, 🧪 bullet). Numbers assume siblings 105–109 / 114–118 /
§12 62–66 are merged first (merge order correction ⇐ story ⇐ loop ⇐ classify ⇐ age ⇐ today).
Files: `a41_practice.js` (most), `a27_tour.js` (`plan18` only), `a29_mind.js` (`causes.prereq` dedup), `a38_live.js` (`inventGate` only), `a45_story.js`
(`importChat` only), `a44_route.js` (remain line only), `a26_assist.js` (follow-up text only), `a33_dates.js` (`AS.herDay24`).

## Contracts for the other fixers
- **Deadlines:** `PR.dlDoneFromHer(s)` now works clause by clause (split at «. ! ؟ ، ,» and «ولی/اما»); a clause counts only if it is a first-person past report,
  not negated, not a question. No word overlap but the clause names an exam and exactly ONE open exam deadline is due ⇒ that one. `doneBy.quote` = her whole message.
- **Chat guesses:** `PR.guessOwnTest(s)` adds four shapes, each with `g.resFrom` = her sentence: (1) the guess message itself after the guess text, with her
  computation and a refute marker (`TEST_NO` or `OVER24`: «زیاد/کم شد»، «از معیارم بیشتره»، «کافی/بس نیست»، «درنمیاد»); (2) a guess with no number —
  only the IMMEDIATELY next user message: test verb + ✓/✗ marker, or «ولی/اما/نه …» + her measured result («۱۹ از ۲۰ گرفتم»); (3) all expressions + «چون … پس/میشه/=» ⇒ confirmed;
  (4) a one-number guess («چهار تا بسه», word numbers before «تا» are read) + refute marker + a «پس …» conclusion with another number ⇒ refuted.
  It still never touches `res`, `withdrawn`, `resRecheck`.
- **Promises:** `PR.herLater(s, acts)` — `acts` = the turn's action list (afterTurnHooks 3rd arg). `PR.turnFulfilled(acts)`: any action other than
  coach_state/go/ask/steps/promise_done/plan_done/deadline_done/highlight/register/tour_* ⇒ fulfilled ⇒ no promise. `ctx` (the assistant question) is kept only
  when her message starts with «آره/بله/نه/باشه/اوکی/حتماً/چشم».
- **Plans (story/correction touching a27):** `plan18` returns early when `askOnly24(ut, pt)` (the plan sentence ends with «؟» or the next sentence is «خوبه؟/درسته؟/چطوره؟…»);
  a future model `when` with no time words (`HER_WHEN24` = `PLAN_WHEN` + today/«روزی»/«روزانه»/month names/«ساعت n»/«تا n»/«n روز دیگه») in her plan, this message or her two previous ones ⇒ `"next-session"`
  (a past model date is still rejected as before).
  The `o.step` branch of `plan19` (plan = live step) does not go through this check.
- **Predictions / 🎯:** `PR.bookPred` takes her percent from the same message («۸۰ درصد مطمئنم») when the guess text has none. `PR.chatFcastOf(q)` = an open chat
  🎯 (`by:"chat"` or `src.chat`, no outcome) whose text contains or is contained in q. The 🎯 form submit with such a match does NOT create a record; it fills the
  existing one's missing `p` (drops `est`) or `due`, with a toast.
- **chat_invent gate (a38 `inventGate`, used by run AND the reply pre-check):** new kinds — when she states her own conjecture and her own test
  (`OWNCONJ24` + `TESTS24`, statement overlap ≥ 0.6), before `keepback`: `wake` (a dormant live child of the same look-back parent with ≥2 shared words — bound, `woke`, no second record),
  `promote` (a `b.newProbs` child, via `A.livePromoteNew`), else `live`; `backpend` when `A.PR.backPendOk(se, a)` (look-back of a chat problem, no bound live problem),
  before `refuse`. `A.PR.backPendAdd(se, a)` writes `s.backPend` and returns the «🔭 نگه داشتم» info. The round-23 wrapper in a41 stays as a fallback.
- **Chat import (a45 `importChat`):** when the live statement shares ≥ max(2, 40%) content words with a later user message of the pk window but the window's first
  message has < half of that, the window starts at that message (`L.chatImp.from`, old start in `L.chatImp.cut`); items, `chatUnk` and the pre-stack before it are not imported.
  `A.STORY.owns` reads that window, so the dossier and 🧭 follow.
- **Mind card:** `M.phases().causes.prereq` keeps one entry per stuck turn (counts unchanged; R22/R23 prereq tests rely on it) and now carries `pre`; only the rendered list in `causesSection` groups by (pid, phase, pre id, concept, step, quote) with «در n نوبت».
- **Route:** phase b (or all stages reached) and not solved ⇒ remain = «فقط بازنگریِ خودت — حل به نتیجه رسید» (+ open prereqs / waits).
- **Deadline dates:** `AS.herDay24(text)` — exactly one relative day («فردا»، «پس‌فردا»، a weekday) and no explicit date ⇒ the page's date; `AS.DO.deadline`
  replaces a different model date with it.

## Tests — `apps/learning-architecture/tests/test_tour1_r24_today.js`
- Runner sentences: 17 checks (16 red on base 3685102d; the «فردا صبح … زنگ می‌زنم» plan guard green on both).
- Bank `tests/variants/VARIANTS_R24.json`, R7 #142–#160: 19/19 (16 red on base: #142–#154, #157, #158, #160; the negatives #155, #156, #159 green on both).

## Not done / notes
- B24·D21 second half (s15 teacher strip «اکنون: فهمِ مسئله · مقصد: چیکار کنم؟» after three weeks) is the story stage (R2), not touched here.
- A23-32 has a second root outside R7: the pk did not change when the new problem arrived mid-chat (story/classify). The import cut makes the dossier and 🧭 right either way.
- «Fulfilled» is read from the action list, not from each action's result: a write action the page refused still counts as fulfilled.
