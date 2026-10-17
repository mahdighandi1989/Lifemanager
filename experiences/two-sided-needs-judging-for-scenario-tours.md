---
title: "داوریِ دوسویهٔ نیازها در تورهای سناریو — هر بخش تشنهٔ چیست، هر سناریو تشنهٔ چیست"
tags: ["testing", "scenario-tour", "acceptance", "coverage", "ai-assistant"]
topic_canonical: "two-sided-needs-judging-for-scenario-tours"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-17T07:00:00Z"
created_at: "2026-10-17T07:00:00Z"
updated_at: "2026-10-17T19:00:00Z"
merged_from: []
---

# داوریِ دوسویهٔ نیازها در تورهای سناریو

## 🎯 چالش / Challenge
یک تورِ آزمونِ سناریومحور فقط «معیارهای موفقیتِ نوشته‌شده» را می‌سنجید. سناریویی از بخشی از سامانه گذشت که کارش ساختنِ یک ابزار (مثلاً شبیه‌ساز برای تمرین) است، ولی ابزار ساخته نشد یا بد ساخته شد — و سناریو «موفق» اعلام شد، چون آن ابزار در فهرستِ معیارهایش نبود. مالک ناچار بود هر قلم را یکی‌یکی یادآوری کند و هر یادآوری یک قاعدهٔ تازه در طرح می‌شد. فهرستِ دستی هرگز کامل نمی‌شود.

## 💡 راه‌حل / Solution
داوری از **دو نقشهٔ نیاز** بیرون می‌آید، نه از فهرستِ اقلام:

1. **هر بخش تشنهٔ چیست** (از درکِ خودِ بخش، نه از سناریو): برای هر نما/تونل/ابزار، از سندِ طراحی و رجیستری‌ها بنویس «این بخش برای چیست، در چه لحظه‌ای باید خودش وارد شود، و چه باید تحویل دهد» (مثلاً: بخشِ تکنیک‌های یادگیری ⇒ وقتی مهارتی تمرین می‌خواهد، خودش شبیه‌ساز/تمرینِ مناسب پیشنهاد و می‌سازد؛ کارنامه ⇒ پس از هر حلِ معنادار تغییرِ منطقی نشان می‌دهد).
2. **هر سناریو تشنهٔ چیست** (از چشمِ آدمِ سناریو): در هر لحظه این آدم به چه نیاز دارد — حتی اگر خودش آن را نخواهد یا نشناسد.
3. **قاعدهٔ داوری:** سناریو از هر بخشی که گذشت، اگر نیازِ آن بخش در آن لحظه برآورده نشد (کاری که باید خودش می‌کرد نکرد)، یا نیازِ آدمِ سناریو برآورده نشد، یا برآورده شد ولی بی‌کیفیت (ناقص، نادقیق، باگ‌دار) ⇒ **ناموفق**، حتی اگر در معیارهای نوشته‌شده نبود. معیارهای نوشته‌شده کفِ داوری‌اند، نه سقفش.
4. اجراکننده پیش از داوریِ هر سناریو این دو نقشه را برای بخش‌هایی که سناریو از آن‌ها گذشت می‌نویسد و کنارِ یافته‌ها ثبت می‌کند، تا بازبین ببیند چه چیزی سنجیده شد.

## 🧪 نمونه کد (Anonymized)
```
for part in parts_touched(scenario):
    for need in part.needs_at(moment) + person.needs_at(moment):   # two maps, written before judging
        got = observe(page, assistant, need)
        if got is None:            defect(need, "not delivered")
        elif not good_enough(got): defect(need, "delivered poorly")   # coverage, accuracy, bugs
verdict = PASS only if no defect AND all written criteria pass
```

## ⚠️ نکات حیاتی / Pitfalls
- نیازِ بخش را از سناریو استخراج نکن؛ از هدفِ طراحیِ خودِ بخش بیرون بیاور، وگرنه همان کوریِ سناریو تکرار می‌شود.
- «کاربر نخواست» عذر نیست وقتی هدفِ بخش این است که خودش در لحظهٔ درست وارد شود.
- کیفیت هم داوری می‌شود: ابزاری که ساخته شد ولی موضوع را کامل نمی‌پوشاند یا نتیجهٔ نادرست می‌دهد، کمبود است.
- از فهرست‌کردنِ اقلام به‌جای نقشهٔ نیاز بپرهیز؛ فهرست همیشه عقب می‌ماند.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- برای هر سامانه با بخش‌های متعدد: یک جدولِ «بخش → هدف → لحظهٔ ورود → خروجیِ لازم» از اسنادِ طراحی بساز و به اجراکنندهٔ تور بده.
- برای هر سناریو: «آدم → نیازها در هر لحظه» را پیش از اجرا بنویس.
- داوری = اشتراکِ این دو با آنچه واقعاً رخ داد؛ هر خلأ یا کیفیتِ پایین ⇒ ناموفق.
- بازبینِ مستقل، پیش از اجرا، این دو نقشه را می‌سنجد (کامل؟ از طراحیِ بخش آمده؟).

## 🔗 References
- مرتبط: paired-agent-live-campaign-for-an-in-page-ai، holistic-island-audit-with-adversarial-verification


## Update 2026-10-17 — root causes and a variant bank, or the fixes breed new defects
A round that fixed each need-map defect with a new keyword detector (plan / promise / taste / register) produced a fresh crop of
look-alike defects the next round (a complaint read as a plan, «I don't know» stored as taste, one «شما» flipping the register). Two rules
stop this: (1) trace every defect to the mechanism that made it and change the mechanism — semantic judgements go to the model, which
reports them as structured state that the page validates, while patterns may only offer or ask, never store; (2) prove every fix against
a variant bank written by an agent who never saw the code: positives AND confusable negatives in several registers. A fix that passes the
scenario sentence but fails a paraphrase is not a fix. The same need maps also yield infrastructure work (e.g. formula display), which is
built in the same round, not deferred.

## Update 2026-10-17 (2) — five axes per part, coverage from the registries, and a necessity verdict
Need maps alone still let whole parts go untested (no scenario ever entered them) and never asked whether a part should exist at all.
Two additions: (1) the list of parts comes from the system's own registries (view registry, graph), and a coverage matrix built from it
before each tour forces a scenario through every part — or a written reason why not; (2) every part a scenario passes is judged on five
axes: purpose/philosophy (from its own design doc), function, quality/gaps, both thirsts, and necessity/overlap («unique role» /
«merge with X» / «should appear inside flow Y, not as a separate place» / «unused ⇒ quarantine candidate»). A part judged unused or
overlapping in two consecutive rounds becomes a merge/quarantine proposal to the owner (never a silent deletion). This is what makes
the review holistic without the owner having to name parts one by one.
