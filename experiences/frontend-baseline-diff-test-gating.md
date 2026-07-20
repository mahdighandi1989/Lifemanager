---
title: "گیت تست با baseline-diff — افزودن UI به suite‌ای که شکست‌های موروثی دارد"
tags: ["testing", "vitest", "frontend", "ci", "baseline"]
topic_canonical: "frontend-baseline-diff-test-gating"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-20T21:30:00Z"
created_at: "2026-07-20T21:30:00Z"
updated_at: "2026-07-20T21:30:00Z"
merged_from: []
---

# گیت تست با baseline-diff در suite دارای شکست موروثی

## 🎯 چالش / Challenge

باید به چند صفحهٔ فرانت‌اند قابلیت اضافه می‌شد، ولی suite تست از قبل
شکست‌های موروثی داشت (تست‌های قدیمی برای کامپوننت‌هایی که بعداً عوض
شده‌اند). «همهٔ تست‌ها سبز» گیتِ قابل‌اجرایی نبود؛ گیت واقعی این است:
**هیچ شکست جدیدی نسبت به قبل از تغییر اضافه نشود.** بدتر این‌که working
tree با یک session موازی مشترک بود و وسط کار فایل‌های تست جدید (از آن
session) به suite اضافه می‌شد و شمارنده‌های خام (N passed / M failed)
را بی‌معنی می‌کرد.

## 💡 راه‌حل / Solution

1. **قبل از هر ویرایش،** یک run کامل بگیر و *نامِ* تست‌های شکست‌خورده
   (نه فقط تعدادشان) را در فایل scratch ذخیره کن.
2. تغییرات را بده؛ برای فایل‌های لمس‌شده تست هدفمند بنویس/اجرا کن.
3. در پایان دوباره run کامل بگیر و **مجموعهٔ نام شکست‌ها** را با
   baseline مقایسه کن — نه شمارنده‌ها را. تعداد فایل/تست ممکن است به
   دلایل بی‌ربط (session موازی، فایل تازه) عوض شود؛ فقط دیفِ نام‌ها
   ملاک است.
4. اگر تست موجودی به markup صفحه وابسته است (testid یا متن)، هنگام
   تغییر UI همان قلاب را حفظ کن (مثلاً testid قدیمی را روی ظرفِ جایگزین
   بگذار) تا تغییرِ رفتاری بدون شکستن قرارداد تست انجام شود.

## 🧪 نمونه کد (Anonymized)

```bash
# baseline قبل از تغییر — نام شکست‌ها، نه شمارنده
npx vitest run 2>&1 | grep " FAIL " | sort -u > /tmp/scratch/baseline_failures.txt

# ... تغییرات ...

npx vitest run 2>&1 | grep " FAIL " | sort -u > /tmp/scratch/after_failures.txt
diff /tmp/scratch/baseline_failures.txt /tmp/scratch/after_failures.txt && echo "NO NEW FAILURES"
```

```jsx
// حفظ قرارداد تستِ موجود هنگام تعویض UI:
// قبلاً: <p data-testid="summary-total">{total}</p>
// حالا همان testid روی ظرفِ ردیف‌های جایگزین می‌ماند
<div data-testid="summary-total">
  {rows.map((r) => (
    <div key={r.key}>…</div>
  ))}
</div>
```

## ⚠️ نکات حیاتی / Pitfalls

- مقایسهٔ «تعداد پاس/فیل» به‌جای «نام تست‌ها» در محیط مشترک/موازی
  گمراه‌کننده است — فایل‌های جدیدِ دیگران شمارنده را جابه‌جا می‌کنند.
- تست‌هایی که mock سراسری `api` دارند (مثلاً فقط `get`) با هر fetch
  جدیدِ mount-time می‌شکنند؛ fetch جدید را یا lazy کن (فقط در تبِ فعال)
  یا مطمئن شو mock موجود URLهای ناشناخته را بی‌خطر جواب می‌دهد.
- `fireEvent.click` روی دکمهٔ submit در jsdom قابل‌اتکا نیست؛ برای فرم
  از `fireEvent.submit(input.closest('form'))` استفاده کن.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

- [ ] قبل از دست‌زدن به کد، run کامل بگیر و نام شکست‌ها را ذخیره کن.
- [ ] برای هر فایل لمس‌شده تست هدفمند اجرا کن (سریع‌تر از suite کامل).
- [ ] در پایان دیفِ «مجموعهٔ نام شکست‌ها» را گزارش کن، نه شمارنده‌ها.
- [ ] هنگام جایگزینی UI، قلاب‌های تست موجود (testid/متن) را روی عنصر
      جایگزین منتقل کن مگر تغییرشان عمداً خواسته شده باشد.
- [ ] در working tree مشترک، قبل از نتیجه‌گیری `git status` بگیر تا
      تغییرات موازی را از تغییرات خودت جدا کنی.

## 🔗 References

- منبع اولیه: تسک فاز ۴ فرانت‌اند (چت دستیار + گزارش مالی + CRM)، 2026-07-20
- مرتبط: [holistic-island-audit-with-adversarial-verification]
