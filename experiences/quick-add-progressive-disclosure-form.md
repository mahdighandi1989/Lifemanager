---
title: "فرم quick-add با افشای تدریجی — payloadهای اختیاری با نگاشت round-trip تأییدشده"
tags: ["frontend", "forms", "ux", "api-contract", "react", "lazy-mount"]
topic_canonical: "quick-add-progressive-disclosure-form"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-20T21:00:00Z"
created_at: "2026-07-20T21:00:00Z"
updated_at: "2026-07-20T21:00:00Z"
merged_from: []
---

# Quick-add form with progressive disclosure & round-trip-verified payloads

## 🎯 چالش / Challenge

یک فرم «افزودن سریع» (فقط عنوان + Enter) باید فیلدهای اختیاری بگیرد
(تاریخ، اولویت enum، FK، عدد) بدون این که مسیر تک‌ضربه‌ای خراب شود؛ و
مقادیر enum باید طوری فرستاده شوند که بعد از serialize شدن دوباره همان
برگردند. هم‌زمان یک پنل سنگینِ خود-fetch‌کننده باید داخل صفحهٔ دیگری
embed شود بدون این که خطاهایش صفحهٔ میزبان را سفید کند.

## 💡 راه‌حل / Solution

1. **افشای تدریجی**: فیلدهای اختیاری پشت یک تاگل «جزئیات بیشتر»
   (پیش‌فرض بسته). مسیر سریع (عنوان تنها) نه یک کلیک اضافه می‌گیرد نه
   payloadش عوض می‌شود.
2. **payload شرطی**: هر فیلد اختیاری فقط وقتی پر است به body اضافه شود
   (`if (v) payload.k = v`). بک‌اندهایی که `exclude_unset` دارند بین
   «نیامده» و «null صریح» فرق می‌گذارند — برای *پاک‌کردن* یک مقدار باید
   کلید را صریحاً `null` بفرستی، برای *دست‌نزدن* اصلاً نفرستی.
3. **نگاشت round-trip را از serializer بخوان، نه از request-schema**:
   دامنهٔ ورودی (مثلاً int 0..5) ممکن است چندبه‌یک به enum نگاشت شود و
   serializer فقط نمایندهٔ هر گروه را برگرداند (LOW→1, MEDIUM→2,
   HIGH→4). اگر UI مقدار «زیاد=3» بفرستد، در پاسخ 2 (متوسط) می‌بیند و
   انتخاب کاربر بی‌صدا گم می‌شود. گزینه‌های select باید دقیقاً همان
   نماینده‌های سریال‌شده باشند.
4. **نشان (badge) برای مقدار پیش‌فرض نکش**: وقتی serializer برای مقدار
   تهی یک پیش‌فرض برمی‌گرداند (unset→MEDIUM→2)، نشان دادن آن روی همهٔ
   ردیف‌های قدیمی نویز خالص است — فقط مقادیر غیرپیش‌فرض badge بگیرند.
5. **embed تنبل و fail-open**: پنل سنگین را collapsed-by-default و
   *unmounted* نگه دار (`{open && <Panel/>}`) — تا باز نشود هیچ
   fetch‌ای شلیک نمی‌شود؛ و مطمئن شو خود پنل همهٔ خطاهای API‌اش را
   می‌بلعد (`.catch(() => {})`) تا صفحهٔ میزبان هرگز سفید نشود.

## 🧪 نمونه کد (Anonymized)

```jsx
// 2) conditional payload — bare fast-path unchanged
const payload = { title: title.trim() };
if (dueDate) payload.due_date = dueDate;          // omit = untouched
if (priority) payload.priority = Number(priority); // "" = omit
// clearing an existing value later needs the explicit null:
// PATCH body: { due_date: value || null }

// 3) options mirror the serializer's representatives, not the schema range
<select>
  <option value="">بدون</option>
  <option value="1">کم</option>     {/* LOW→1 */}
  <option value="2">متوسط</option>  {/* MEDIUM→2 (also the unset default) */}
  <option value="4">زیاد</option>   {/* HIGH→4 — NOT 3, which round-trips to 2 */}
</select>

// 5) lazy fail-open embed
{open && <HeavySelfFetchingPanel />} // no mount ⇒ no requests
```

## ⚠️ نکات حیاتی / Pitfalls

- تست سبز نگاشت اشتباه enum را نمی‌گیرد — باید serializer بک‌اند را
  خواند و مقدار برگشتی را assert کرد، نه فقط مقدار ارسالی.
- `exclude_unset` یعنی `{k: null}` پاک می‌کند ولی نبودِ `k` دست نمی‌زند؛
  UI پاک‌کردن باید null صریح بفرستد.
- مقایسهٔ تاریخ «گذشته» را با تاریخ *محلی* بساز نه `toISOString()`
  (که UTC است و نزدیک نیمه‌شب یک روز خطا می‌زند).
- در تست، مجموعهٔ شکست‌های suite را *قبل* از تغییر ثبت کن و بعد از
  تغییر مقایسه کن — «۱۶ شکست» فقط وقتی قابل قبول است که دقیقاً همان
  ۱۶ شکست قبلی باشد.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. فرم سریع را با یک فیلد نگه دار؛ بقیه پشت تاگل collapsed.
2. برای هر فیلد اختیاری: خالی ⇒ کلید حذف؛ پاک‌کردن ⇒ null صریح.
3. قبل از ساخت select برای enum: serializer را باز کن، نگاشت
   بیرونی→درونی→بیرونی را روی کاغذ round-trip کن، فقط نماینده‌ها را
   گزینه کن.
4. badge فقط برای انحراف از پیش‌فرض.
5. پنل embed شده: mount شرطی + خطاخوریِ داخلی؛ با ماک‌های reject شده
   تست کن که میزبان زنده می‌ماند.
6. baseline شکست‌های تست را قبل از شروع ثبت کن.

## 🔗 References

- منبع اولیه: پیاده‌سازی فاز ۲ فرانت‌اند (فرم تسک، موعد آیتم لیست،
  کارت‌های دامنهٔ داشبورد + پنل گوگل تاشو) — 2026-07-20
- مرتبط: [idempotent-seeding-vs-user-edits]
