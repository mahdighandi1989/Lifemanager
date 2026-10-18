---
title: "مدل حالت را گزارش می‌دهد، صفحه می‌سنجد — به‌جای حدسِ حالتِ کاربر با الگوی متن"
tags: ["ai", "assistant", "state-tracking", "regex", "validation", "tutoring"]
topic_canonical: "model-reports-state-page-validates"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-16T12:00:00Z"
created_at: "2026-10-16T12:00:00Z"
updated_at: "2026-10-18T12:00:00Z"
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
