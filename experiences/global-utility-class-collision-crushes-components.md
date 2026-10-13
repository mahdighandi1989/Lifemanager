---
title: "برخوردِ کلاسِ کوتاهِ سراسری با کلاسِ اصلاح‌گرِ کامپوننت — دکمه‌های له‌شده"
tags: ["css", "frontend", "ui", "regression-testing", "playwright"]
topic_canonical: "global-utility-class-collision-crushes-components"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-13T12:00:00Z"
created_at: "2026-10-13T12:00:00Z"
updated_at: "2026-10-13T12:00:00Z"
merged_from: []
---

# Short global class names collide with component modifiers

## 🎯 چالش / Challenge
یک کلاسِ کوتاهِ سراسری برای جزئی بی‌ربط (مثلاً `.lg` = «خطِ راهنمای نمودار»: `width:22px;height:0;border-top`)
با همان نامِ اصلاح‌گرِ اندازهٔ دکمه (`.btn.lg` = «دکمهٔ بزرگ») برخورد کرد. `.btn.lg` فقط padding و font را تعیین
می‌کرد، پس width/height ِ `.lg` برنده می‌شد ⇒ دکمه‌های اصلی ۲۲px و برچسبشان بیرون ریخت. ساخت سبز، آزمون‌های
رفتاری سبز (کلیک با Playwright روی دکمهٔ له‌شده هم کار می‌کند) — فقط چشمِ کاربر دید. تلاشِ اول (دست‌کاریِ
`overflow-wrap`) علت نبود؛ علت فقط با فهرستِ قاعده‌های منطبق بر عنصر پیدا شد.

## 💡 راه‌حل / Solution
1. برای دکمهٔ معیوب **همهٔ قاعده‌های CSS ِ منطبق** را فهرست کن (`[...document.styleSheets]` ⇒ `el.matches(rule.selectorText)`) — حدس نزن.
2. کلاسِ سراسری را محدود کن (`.lg:not(.btn)` یا بهتر: نامِ اختصاصی مثلِ `.legend-line`)، نه این‌که برای دکمه خاصیت‌ها را «پس بگیری».
3. آزمونِ بازگشتِ هندسی: اندازهٔ واقعیِ `getBoundingClientRect()` ِ دکمه‌ها (> حداقلِ معقول) و `scrollWidth <= clientWidth` برای برچسب‌ها؛ و ثابت کن آزمون روی کدِ قدیم **شکست** می‌خورد.
4. یک اسکنرِ کلیِ همهٔ نماها در چند عرض (۱۲۸۰/۹۰۰/۳۹۰) برای دکمه‌های سرریز یا باریک.

## 🧪 نمونه کد (Anonymized)
```js
const rules = []; for (const sh of document.styleSheets) for (const r of sh.cssRules)
  if (r.selectorText && el.matches(r.selectorText)) rules.push(r.cssText);
// assert: [...document.querySelectorAll('.btn.lg')].every(b => b.getBoundingClientRect().width > 60)
```

## ⚠️ نکات حیاتی / Pitfalls
- نام‌های یک‌دو حرفی (`.lg`, `.sm`, `.on`, `.ok`) در CSS ِ تک‌فایلیِ بزرگ تقریباً حتماً برخورد می‌کنند.
- آزمون‌های کلیک‌محور این را نمی‌گیرند؛ اسکرین‌شات یا سنجهٔ هندسی لازم است.
- `all:unset` + `white-space:nowrap` در ستونِ باریک ⇒ برچسب از قابش بیرون می‌زند؛ `min-width:0` و شکستنِ خط بده.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] پیش از افزودنِ کلاسِ سراسری، grep کن که آن نام جای دیگری به‌عنوانِ اصلاح‌گر به کار نرفته باشد.
- [ ] کلاس‌های جزءِ خاص را با پیشوند/ظرف محدود کن.
- [ ] برای گزارشِ «دکمه له شده» اول قاعده‌های منطبق را فهرست کن.
- [ ] یک آزمونِ هندسی در مجموعهٔ رگرسیون نگه دار.

## 🔗 References
- مرتبط: owner-supplied-content-not-builder-samples
