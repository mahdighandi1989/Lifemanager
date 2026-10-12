---
title: "Drive mirror of app records — the page builds a readable tabbed document, the server only writes it"
tags: ["google-drive", "google-sheets", "mirror", "sync", "extensibility", "background-job"]
topic_canonical: "drive-mirror-built-by-the-page-written-by-the-server"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-12T00:00:00Z"
created_at: "2026-10-12T00:00:00Z"
updated_at: "2026-10-12T00:00:00Z"
merged_from: []
---

# Drive mirror built by the page, written by the server

## 🎯 چالش / Challenge
مالک می‌خواهد هر «پرونده» و «موضوع» ِ یک بخشِ برنامه، فولدرِ خودش را در گوگل درایو داشته باشد با یک شیتِ تب‌دار، با لینک در برنامه،
بی‌آنکه بک‌اند سنگین شود و بی‌آنکه افزودنِ نوعِ تازه معماری را عوض کند. دادهٔ اصلی JSON ِ خودِ صفحه است که سرور معنایش را نمی‌داند.

## 💡 راه‌حل / Solution
1. پایگاه‌داده منبعِ اصلی می‌ماند؛ درایو **آینه** است (سریع، بی‌تعارضِ ویرایش).
2. **صفحه** (که برچسب‌های فارسیِ هر فیلد را می‌داند) برای هر رکورد یک سندِ خوانا می‌سازد: `{rec_id, group, title, tabs:[{name, rows}]}` و می‌فرستد.
3. **سرور** فقط سند را (با hash) در جدولِ صف نگه می‌دارد و یک کارِ دوره‌ای آن را می‌نویسد: `ریشه/app/group/«عنوان · شناسه»/` + یک شیت، یک تب برای هر بخش.
4. تکرارپذیر: hash ِ نوشته‌شده با hash ِ تازه برابر ⇒ رد؛ شناسهٔ فولدر و شیت کش می‌شود؛ اگر کسی در درایو حذفشان کرد، دوباره ساخته می‌شوند.
5. هرگز حذف نکن: رکوردِ حذف‌شده ⇒ فولدر با پیشوندِ «(حذف‌شده در برنامه)» تغییرِ نام می‌دهد.
6. درایوِ قطع ⇒ ردیف‌ها در صف می‌مانند با پیامِ روشن؛ دکمهٔ «همگام‌سازیِ الان» برای انتظار نکشیدن.

## 🧪 نمونه کد (Anonymized)
```js
BUILD.case = rec => ({ group: "Cases", title: rec.title, tabs: [
  { name: "Summary", rows: [["Field", "Value"], ["Title", rec.title]] },
  { name: "Claims",  rows: [["#", "Claim"]].concat(rec.claims.map((c, i) => [i + 1, c.text])) } ] });
```

## ⚠️ نکات حیاتی / Pitfalls
- شیتِ تازهٔ گوگل ۱۰۰۰ ردیف × ۲۶ ستون است؛ نوشتن بیرون از آن خطا می‌دهد ⇒ پیش از نوشتن `gridProperties.rowCount/columnCount` را با داده جور کن.
- نامِ تب در A1 باید بین `'…'` باشد؛ `'` را در نام عوض کن. سقفِ سلول ۵۰ هزار نویسه است.
- تبِ پیش‌فرض («Sheet1» / نامِ محلی) را فقط وقتی حذف کن که تب‌های واقعی ساخته شده‌اند.
- با اسکوپِ `drive.file` برنامه فقط فایل‌های خودش را می‌بیند — کافی است چون همه را خودش می‌سازد.
- اگر موتورِ کارها کفِ فاصله دارد (این‌جا ۱۵ دقیقه، با آزمون)، کار را کوتاه‌تر نکن؛ دکمهٔ «الان» بگذار.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] جدولِ صف: (کاربر، برنامه، شناسه، گروه، عنوان، سند، hash، hash ِ نوشته‌شده، شناسهٔ فولدر/شیت، خطا، حذف‌شده)
- [ ] endpoint ِ «صف کن» + «وضعیت و لینک‌ها» + «الان بنویس»
- [ ] کارِ دوره‌ای با محدودیتِ تعداد در هر اجرا
- [ ] سازنده‌های سند در خودِ صفحه؛ پرکردنِ اولیه برای رکوردهای قدیمی
- [ ] آزمون با سرویسِ جعلیِ Sheets که درخواست‌های دقیق را ضبط می‌کند

## 🔗 References
- مرتبط: owner-inspection-loop-with-supervisor-routines, mount-standalone-app-natively-instead-of-iframe, google-drive-oauth-offline-integration
