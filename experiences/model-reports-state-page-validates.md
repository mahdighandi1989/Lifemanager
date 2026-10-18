---
title: "مدل حالت را گزارش می‌دهد، صفحه می‌سنجد — به‌جای حدسِ حالتِ کاربر با الگوی متن"
tags: ["ai", "assistant", "state-tracking", "regex", "validation", "tutoring"]
topic_canonical: "model-reports-state-page-validates"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-16T12:00:00Z"
created_at: "2026-10-16T12:00:00Z"
updated_at: "2026-10-18T14:00:00Z"
updated_at: "2026-10-18T16:00:00Z"
updated_at: "2026-10-18T20:00:00Z"
merged_from: []
---

# Model reports state, page validates

## 🎯 چالش / Challenge
یک مربیِ درون‌صفحه باید بداند کاربر در کدام مرحلهٔ کار است: کدام پرسش را واقعاً جواب داد، کی نتیجه گفت و کی گیر کرد. اولین راه‌حل الگوهای متنی بود (regex). این الگوها در هر دو جهت خطا می‌کردند:
- **مثبتِ کاذب:** هر «؟» را «مجهول گفته شد» می‌گرفتند، هر رقم را «داده»، و هر پیامِ بعدی را «جواب داد».
- **منفیِ کاذب:** «جواب ۱.۳»، «غلطه» و «پرونده رو بستم» را نمی‌شناختند.

هر دور آزمون ده‌ها عبارتِ تازه پیدا می‌کرد. افزودنِ الگو پایان نداشت.

## 💡 راه‌حل / Solution
1. **مدل گزارش می‌دهد.** در پایانِ هر پاسخ یک کنشِ ساختاری می‌فرستد، مثلاً `{"do":"coach_state","ph":…,"said":[…],"ans":[ids],"stuck":…,"fail":…}`. این گزارش فقط دربارهٔ پیامِ کاربر است، نه پاسخِ خودِ مدل. هر پرسش شناسهٔ کوتاه دارد تا گزارش دقیق باشد.
2. **صفحه هر ادعا را می‌سنجد** و فقط بعد ثبت می‌کند. «ans» فقط اگر پیامِ کاربر پس از آن پرسش پاسخِ واقعی باشد، نه «نمی‌دونم». «said» فقط از متنِ خودِ کاربر، نه متنِ چسبانده‌شده. داور (نوعِ مسئله) فقط پیشنهاد است و انتخابِ صریحِ کاربر برنده است.
3. **عدمِ تقارنِ خطا** پشتیبانِ الگویی را تعیین می‌کند. پرسیدن که کدام خطا گران‌تر است: «جواب‌گرفته»ی دروغ پرسشِ مهمی را بی‌صدا حذف می‌کند؛ «هنوز نه»ی دروغ فقط دوباره می‌پرسد. پس پشتیبان هرگز در جهتِ گران خطا نمی‌کند.
4. **سیگنال‌ها دامنه دارند:** هر سیگنال به (مسئله، پیامِ بعدیِ کاربر) بسته است و بعد منقضی می‌شود. دفترِ پاسخ‌ها برای هر مسئله جداست، نه برای هر گفت‌وگو.
5. **یک پرسش در هر نوبت، از یک تابع.** اولویتِ صریح دارد: کارِ همین نوبتِ کاربر، بعد کارتِ خاصِ صفحه، بعد گیر، بعد نردبان. چت و صفحه همان رشته را نشان می‌دهند.

## 🧪 نمونه کد (Anonymized)
```js
DO.coach_state = function (a) {
  var u = lastUserText(), led = ledgerFor(problemKey());
  (a.ans || []).forEach(function (id) { if (askedBefore(id) && realReply(u)) led.ans[id] = true; });
  if ((a.said || []).indexOf("result") >= 0 && !pastedOnly(u)) led.ph = "b";
  if (a.fail) recordPhaseFailure(led.ph);
  return "";                      // no visible chat message
};
// fallback (model omitted the report): may move phase on strong evidence, NEVER marks answered
```

## ⚠️ نکات حیاتی / Pitfalls
- گزارشِ مدل یک نوبت دیر می‌رسد، چون پرامپتِ این نوبت پیش از گزارش ساخته شده. پس سیگنالِ کهنه را دقیقاً یک نوبت نگه دار و بعد پاک کن.
- «حرکت به عقب» را محدود کن: گزارشِ ضعیف‌تر نباید نشانهٔ قوی‌ترِ قبلی را بازنویسی کند.
- آزمون را با دو مدلِ ساختگی بنویس: یکی که گزارش می‌دهد و یکی که نمی‌دهد. هر دو مسیر باید درست باشند.
- متنِ دستورِ گزارش را در قلابِ پیامِ کاربر بگذار، نه در پرامپتِ سیستم، اگر سیستم سقفِ طول دارد.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
هر جا که برنامه باید حالتِ گفت‌وگو را بداند، این الگو کاربرد دارد. نمونه‌ها: مرحلهٔ فروش، وضعیتِ تیکت، و پیشرفتِ آموزش.
1. یک طرحوارهٔ کوچکِ حالت تعریف کن، با شناسه برای هر مورد.
2. از مدل بخواه گزارشِ ساختاری بدهد.
3. هر ادعا را با شواهدِ قطعیِ سمتِ برنامه بسنج: متنِ کاربر، فرم‌های ثبت‌شده، و زمان.
4. برای پشتیبان، جهتِ گران‌ترِ خطا را پیدا کن و پشتیبان را فقط در جهتِ ارزان خطاپذیر بساز.

## 🔗 References
- `tests-that-cannot-fail-the-red-baseline.md`
- `paired-agent-live-campaign-for-an-in-page-ai.md`

## Update 2026-10-18 — one classifier, one result structure
Two follow-up lessons from the round-21 tour:
- **Route by the page's own classification, never by a second keyword list.** The router (which model tier gets a turn) had its own small keyword gate. Meanwhile
  the page already showed "chat problem in focus" in its state line. The two disagreed on 12 of 51 decisive turns. The fix is one detector that feeds the state line,
  the problem statement and the router. A pure command is recognised by structure ("every clause is a page command or filler"), not by "contains a command word".
- **Hand results between modules as a structure, not as prose.** One module returned a sentence, and the caller dropped any sentence starting with «چیزی…» as "nothing".
  As a result, no-ops and pending questions never reached the model or the user. Now the page uses one shape `{changed:[{rec,old,new,why}], ask:[{field,label,old,new}], note}`:
  it is merged across modules, given verbatim to the model, and turned into one plain line for the user.
  If changed is empty, the user is still told.
## Update 2026-10-18 — a correction must reach every copy of the fact, and what rested on it
Matching a correction to records by identical words misses most copies: units written differently (۲۰۰ مترمربع / 200 m^2), colloquial vs
written forms, a record composed from two messages, a field she typed herself. Three rules fixed it at the root: (1) a value composed from
several messages keeps one source span per message, and a correction changes only the clause that came from the corrected message;
(2) "same fact" is judged on normalized meaning (units, colloquial forms, function words ignored), never by a hand list per scenario, and the
model may name the page field; a different unit is never the same fact; (3) every judgement (verdict, guess outcome, "solved") records the
data it used at the moment it was made, and a changed datum — by correction or by her "yes" to a copy — sets aside only the judgements that
used it, with the reason. Return one result structure ({changed, ask, note}) from every path, so the model is told exactly what changed,
what is waiting for her answer, and what was refused.

## Update 2026-10-18 — a reported cause with a stack, and a map derived from the same event log
- **Challenge:** a tutor treated every stuck point as a mind knot or low ability. A learner who only lacked one concept (factoring a² − b²) got five turns of generic hints, the concept was never named, and the progress card booked those stucks as a stage weakness. Nested gaps (area ⇒ Pythagoras ⇒ expanding (14−x)²) lost the waiting place entirely.
- **What worked:** the model reports `prereq {concept, step, quote}` (or several, in priority order, with `parent` for nesting) plus lifecycle reports (`diag: missing|had`, `mastery: yes|no`, `learned`, `cause: knot|skill`), each with her own quote. The page validates (quote in her latest message after ZWNJ/ezafe normalisation, a specific concept not a field name, an open problem and an open step, not "I learned it last year") and only then keeps a **stack of waiting places on the problem itself**. The turn question comes from the stack top through the single existing turn-question source, and every other block's turn question is demoted to context. After mastery the page restates the exact waiting place and checks once, before display, that the reply returned to it.
- **Cause, not verdict:** every stuck point carries a cause with evidence (prerequisite / knot / skill / "not yet known"). A stuck point never gets knot or skill without a quote. Prerequisite-caused stucks never lower a stage, and a learned prerequisite counts as progress, including when learned while teaching someone else.
- **Map without a second store:** the problem route map (origin ⇒ now ⇒ destination, dotted detours for prerequisites, auxiliary problems and tested guesses, back-jumps for corrections, hover details) is computed on each render from the same dossier/event log, plus the stack. Opening it writes nothing.
- **How to apply elsewhere:** whenever an assistant must say *why* a user is stuck, have it report the cause and the user's own words, and have deterministic code accept the cause, order nested work and own the "where were we" state. Draw any progress view only from the event log you already keep.
## Update 2026-10-18 — apply a correction once, by meaning, from the basis each judgement used
Round 22 showed what still broke after "reach every copy":
- **Two engines applying the same correction.** The page applied a ✏️ edit from the full old/new texts. Then the coach re-sent each bare fragment («۱» ⇒ «۱.۵», «۴» ⇒ «۵»)
  to the same engine, which applied it again on the already-corrected text («۱.۵.۵») or matched an unrelated lone digit («بر ۴»). Rule: one correction is applied
  once, by the engine that has its full context. Every later path reads that result; it never re-applies the change.
- **Replace the minimal span, keep the person's wording.** When the model reports `old` plus a longer `fix` («۵۰» ⇒ «۶۰ متر مربعه»), replace only the number
  if the rest of `fix` is the unit already in the text. A replacement that would duplicate words already next to it («عروسی … تا عروسی») takes in those
  neighbouring words instead. A whole-sentence fix that would land in the middle of a clause is not applied in place: show the full proposed text and ask.
- **"Same fact" means value plus unit family, with conversion.** «پنجاه متر مربع» = «۵۰ مترمربع» and «۱۵ سانتی‌متر» = «۱۵۰ میلی‌متر». A lone number with no unit
  and no shared neighbour (a word or another number) is never the same fact. When a correction moves a number, write the new value in the copy's own
  unit and digits.
- **Dependencies come from the basis the model reports; the page checks the written evidence.** A verdict the model says does not rest on the datum
  («مربع بهترین است» for any perimeter) stays unless its own evidence text names the old value. A deadline correction touches no verdict or guess.
- **One structure, updated by every later answer.** The person's «بله» to a copy-ask must update the same result the model reads next turn, or the model says
  "nothing changed" about a change the page already made.
## Update 2026-10-18 — one turn question per prompt, decided last; "answered" means answered in another turn
Round 22 showed the turn-question layer drifting in four ways, all from the same root (several modules each choosing "the" question):
- **Decide the single turn question after every module has written.** Each block (live problem, tutor frame, practice block, correction
  block) emitted its own "ask exactly this" line, so prompts carried two. A final pass after all hooks/filters keeps one (explicit moment >
  live-problem line > first) and marks the others as context, without the verb "ask". Any per-module demotion is only a partial fix.
- **The successor question must never override the user's own act in the same turn.** After a step outcome the page asked "what is your
  next step?" even when she asked to restate, had just named her next step, asked "is this right?" about her steps, or presented a proof.
  Read her current turn first; the generic successor is only for a turn that carries none of these, and only once per outcome.
- **"Already asked" must be keyed by turn, not by call.** The question builder ran twice per turn (two hooks); the second call saw the
  question it had just chosen as "asked" and moved on. Record the turn key with the mark and treat calls of the same turn as one.
- **The post-check must recognise the page's own question in every surface form**: nested quotes inside it, a preamble before it, a
  two-sentence page question, "e.g. …?" elaborations and cheat-sheet bullets. Compare by token majority against the page questions in the
  prompt (balanced-quote extraction), not by substring. And make the page's own turn question one sentence before it reaches the model.
- **Classify meta messages before problem detection.** Practice requests, "keep what I learned", self-ratings ("maybe 40%"), corrections
  and deadline notes were being taken as a new chat problem or as a guess. One classifier, consulted by the problem detector, the guess
  detector and the statement holder, removes all three symptoms.

## Update 2026-10-18 (round 22, practice + lists)
Derive a record's dependent rows from the record itself, never from the path that changed it. A calibration case booked a session only when the
judgement arrived through the chat action, so a prediction judged on its own page (or in a worksheet row) left the case "stabilising with zero
sessions" and hid a 90% miss. The fix books the session from every judged linked prediction on save (one per judgement day, removed again when
the judgement is withdrawn). The same rule picks the record a report refers to: when several candidates share words, use the numbers the person
said (her stated confidence must equal the record's, other numbers must appear in its text) and ask "which?" only if more than one still fits —
never invent a new record because no word matched. For lists the model fills from conversation, require the same consent check as for any other
write, and accept numbers and dates only if they occur in her own message.

## Update 2026-10-18 (round 23, story) — a validated report must reach every reader, not just the module that validated it
The coach's validated reports (said, plan, step, result) were stored only where the chat module kept its own state, while the forms, the stage,
the dossier and the route map read only the forms. So the system "knew" she had stated the whole and a plan, yet asked for the whole again and
showed "no plan yet". Lessons:
- **Write each validated item once into the shared event log** (the same one the dossier and map read) with its source message, and derive every
  view from that log. A second "chat copy" of the record is the bug, not the fix.
- **Feed forms only as proposals:** fill an empty field, mark it «from chat — correct?», never overwrite her typed text, never refill a field the
  chat filled once (her edit wins). Commit stays her click.
- **One stage source = max(form stage, validated story stage)**; change the readers' source, not the old stage function many callers rely on.
- **Every event carries its owner** (which problem, by binding time or the problem's chat window); "the only live problem of the session" is not an owner.
- **Explicit markers beat inference for summary acts:** a "whole in one sentence" is recognised only from her explicit marker ("in one sentence: …"),
  never from `said:u` alone.
