---
title: "Mount a standalone single-page app natively inside a host SPA instead of an iframe"
tags: ["frontend", "integration", "react", "embedding", "persistence", "observability"]
topic_canonical: "mount-standalone-app-natively-instead-of-iframe"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-11T00:00:00Z"
created_at: "2026-10-11T00:00:00Z"
updated_at: "2026-10-12T00:00:00Z"
merged_from: []
---

# Mount a standalone app natively inside a host SPA

## 🎯 چالش / Challenge
یک برنامهٔ مستقلِ بزرگ (vanilla JS، داده در localStorage/IndexedDB، کلید AI در مرورگر) باید جای صفحه‌ای در یک SPA ِ میزبان بنشیند.
iframe ِ sandbox ساده است ولی: ابزارهای ناظرِ میزبان (گزارشِ «این بخش را ببین»، deep-link، دکمهٔ بازگشت) داخلِ iframe را نمی‌بینند،
ذخیره‌سازِ shim شده سقفِ کوچکی دارد، و AI از مسیرِ مرکزیِ میزبان (مدل/هزینه/کلید) نمی‌گذرد.

## 💡 راه‌حل / Solution
1. در برنامهٔ مهمان یک **رابطِ میزبان** تعریف کن: `window.HOST = {load, saveMany, del, ai, navigate, initial}`؛ اگر هست، به‌جای storage/AI ِ محلی از آن استفاده کن و boot ِ خودکار را خاموش کن.
2. در میزبان یک «جدولِ رکوردِ عمومی» (user, app, rec_id, type, data) با GET/bulk/DELETE و یک endpoint ِ AI که از gateway ِ مرکزی رد می‌شود.
3. بسته را در build ِ مهمان **هش‌دار** بساز (js + css)، CSS را زیرِ یک کلاسِ ریشه scope کن (`:root/body` ⇒ `.root`؛ dark-mode حذف) و نامِ هش‌دار را در یک ماژولِ کوچک بنویس.
4. صفحهٔ میزبان: CSS/JS را تزریق کند، `HOST` را بسازد، در `div` ِ خودش mount کند. وضعیتِ ناوبری ⇒ query string (`?tab=`) و `popstate` ⇒ `goFromURL`.
5. روی ریشهٔ محتوای هر نما `data-report-section` + label بگذار تا ناظرِ میزبان بخش را بشناسد.
6. نسخهٔ قدیمی را با `?legacy=1` قرنطینه کن.

## 🧪 نمونه کد (Anonymized)
```js
window.APP_HOST = {
  load: () => api.get(`/api/app-records/${APP}`).then(r => r.data.records),
  saveMany: recs => api.post(`/api/app-records/${APP}/bulk`, { records: recs }),
  del: id => api.delete(`/api/app-records/${APP}/${id}`),
  ai: (prompt, system) => api.post(`/api/app-records/${APP}/ai`, { prompt, system }).then(r => r.data.text),
  navigate: s => navigate(`?${new URLSearchParams(s)}`),
  initial: () => Object.fromEntries(new URLSearchParams(location.search)),
};
```

## ⚠️ نکات حیاتی / Pitfalls
- mount ِ هم‌مبدأ = کدِ مهمان به توکن دسترسی دارد. فقط برای کدی که از مخزنِ خودت ساخته می‌شود؛ هرگز برای آپلودِ کاربر (آن‌ها iframe بمانند).
- مسیرِ مشخص را **پیش از** مسیرِ wildcard (`/apps/:slug`) ثبت کن و پیوندِ تکراریِ ساید‌بار را dedupe کن.
- ذخیره را دسته‌ای و با تأخیرِ کوتاه flush کن؛ سقفِ اندازه برای هر رکورد و هر درخواست بگذار.
- `navigate` از سمتِ مهمان نباید دوباره render ِ مهمان را از URL راه بیندازد (اگر state همان است، نادیده بگیر).
- در آزمونِ e2e نوعِ واقعیِ رکورد را بسنج، نه حدسِ نام را (یک بار «ذخیره نشد» فقط اشتباهِ نامِ نوع در خودِ آزمون بود).

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] رابطِ HOST در مهمان + خاموشیِ boot ِ خودکار وقتی HOST هست
- [ ] جدولِ رکوردِ عمومیِ per-user + فهرستِ سفید ِ app
- [ ] بستهٔ هش‌دار + CSS ِ scope شده
- [ ] state در URL + `data-report-section`
- [ ] قرنطینهٔ نسخهٔ قدیمی با پرچمِ query
- [ ] e2e: mount، ذخیره→بازگذاری، back، بی‌خطای کنسول، موبایل

## 🔗 References
- مرتبط: owner-inspection-loop-with-supervisor-routines, addressable-rows-not-just-pages

## Update 2026-10-12 — in-app "back" trail in a host that mirrors state into the URL
- مهمان یک «ردِ پا» (پشته‌ای از جاهای قبلی + اسکرول) دارد و دکمهٔ «↩ برگرد». میزبان هر حرکت را در نشانی می‌نویسد و با تغییرِ نشانی
  دوباره `goFromURL` ِ مهمان را صدا می‌زند. **دام:** اگر `goFromURL` هر بار ردِ پا را با نشانی «هم‌تراز» کند، همان پژواکِ حرکتِ خودِ مهمان
  ردِ پا را پاک می‌کند. قاعده: اگر نشانی همان جای فعلی است، هیچ کاری نکن؛ فقط وقتی نشانی به جای دیگری رفته (Back ِ مرورگر) ردِ پا را تا
  آن نقطه کوتاه کن.
- دکمهٔ شناورِ «برگرد» را `position:fixed` نگذار وقتی میزبان منوی کناریِ خودش را دارد — رویش می‌افتد؛ `position:sticky; bottom` در ستونِ
  محتوای خودِ مهمان هم در نسخهٔ مستقل کار می‌کند هم در میزبان.
- منوی اصلی = «شروعِ تازه» (ردِ پا پاک)، زبانه‌های یک صفحه = بی‌ردِ پا، پیوندِ درونِ محتوا = ردِ پا + «از بخشِ X آمدی» (نزدیک‌ترین کارت/بخشِ عنوان‌دار).

