---
title: "مدل حالت را گزارش می‌دهد، صفحه می‌سنجد — به‌جای حدسِ حالتِ کاربر با الگوی متن"
tags: ["ai", "assistant", "state-tracking", "regex", "validation", "tutoring"]
topic_canonical: "model-reports-state-page-validates"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-16T12:00:00Z"
created_at: "2026-10-16T12:00:00Z"
updated_at: "2026-10-18T16:00:00Z"
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

