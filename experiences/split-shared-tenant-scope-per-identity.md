---
title: "جدا کردنِ scope ِ مشترکِ تک‌کاربره برای هویت‌های دوم — مالک سرِ جایش، بقیه ردیفِ سایه"
tags: ["auth", "multi-tenant", "oauth", "data-scope", "migration", "security"]
topic_canonical: "split-shared-tenant-scope-per-identity"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-18T09:30:00Z"
created_at: "2026-10-18T09:30:00Z"
updated_at: "2026-10-18T09:30:00Z"
merged_from: []
---

# جدا کردنِ scope ِ مشترک برای هویت‌های دوم

## 🎯 چالش / Challenge

اپی که تک‌کاربره شروع شده همهٔ داده‌اش را در یک scope ِ ثابت (مثلاً `user_id = 0`) دارد.
بعد ورود با یک ارائه‌دهندهٔ هویتِ دوم (OAuth) اضافه می‌شود که جدولِ کاربرِ **جدا** دارد و id اش
در فضای کلیدِ خارجیِ جدول‌های داده معتبر نیست؛ پس سادهٔ کار این بود که «هر حسابِ OAuth ⇒ scope 0».
تا وقتی یک نفر هست درست است؛ با تأییدِ نفرِ دوم، او همهٔ دادهٔ مالک را می‌خواند و رویش می‌نویسد.
محدودیت‌ها: دادهٔ مالک نباید جابه‌جا شود، نباید هیچ e-mail ای در کد بنشیند، و تغییر باید برگشت‌پذیر باشد.

## 💡 راه‌حل / Solution

1. **مالک را با پیکربندیِ موجود بشناس، نه با کد:** فهرستِ «مالک» (یک env تازه) ⇐ اگر خالی، فهرستِ
   سوپرادمین‌های bootstrap ⇐ اگر آن هم خالی، «اولین حسابِ ادمین» ⇐ «اولین حسابِ تأییدشده» (همان کسی
   که تا امروز از scope 0 استفاده می‌کرد). زنجیرهٔ fallback تضمین می‌کند مالک با پیکربندیِ ناقص هم
   از داده‌اش جدا نشود.
2. **هر هویتِ دیگرِ تأییدشده ⇒ یک ردیفِ سایه در جدولِ کاربرانِ اصلی** (همان که FKها به آن اشاره
   دارند)، get-or-create در لحظهٔ resolve. کلید: hash ِ e-mail ِ هویت در یک **دامنهٔ رزرو** (TLD
   ِ `.invalid`) که اعتبارسنجِ e-mail ِ ثبت‌نام/ورود ردش می‌کند، با رمزِ غیرقابلِ‌تطبیق (`!`). نتیجه:
   هیچ‌کس نمی‌تواند پیشاپیش آن ردیف را بسازد یا واردش شود (حملهٔ pre-hijack بسته است)، و FKها معتبرند.
   بی ستونِ تازه ⇒ بی مهاجرت.
3. **حالت‌های دیگر دست‌نخورده:** حسابِ در انتظار/ردشده همان رفتارِ ناشناس را می‌گیرد (و گیتِ سخت ۴۰۳ می‌دهد)،
   حسابِ محلی id ِ خودش، ناشناس scope 0.
4. **پشتِ یک فلگ با پیش‌فرضِ امن** (روشن = جدا) تا خاموش‌کردنش رفتارِ قدیم را عیناً برگرداند.
5. ساختِ ردیف در dependency commit می‌کند ⇒ هر ویژگیِ شیءِ کاربرِ احرازشده را **پیش از** resolve بخوان
   (در session با expire_on_commit می‌پرد) و رقابتِ دو درخواستِ هم‌زمان را با IntegrityError ⇒ rollback ⇒
   select ِ دوباره بپوشان.

## 🧪 نمونه کد (Anonymized)

```python
async def resolve_scope(token, db):
    p = validate(token)
    if p["typ"] != "oauth":
        return local_user_id(p)
    if not settings.PER_IDENTITY_SCOPE:
        return SHARED_SCOPE
    ident = await get_identity(db, int(p["sub"]))
    if ident is None or ident.status != "approved":
        return SHARED_SCOPE                      # unchanged; strict gate 403s these
    if await is_owner(db, ident):                # config list → bootstrap admins → first admin → first approved
        return SHARED_SCOPE
    email = f"idp-{sha256(ident.email)[:24]}@scope.invalid"   # reserved, unregistrable
    return await get_or_create_user(db, email=email, password_hash="!")
```

## ⚠️ نکات حیاتی / Pitfalls

- **هرگز با e-mail ِ واقعیِ هویت به ردیفِ محلیِ موجود وصل نکن** — کسی که پیشاپیش با همان e-mail
  حسابِ محلی ساخته (بدونِ تأییدِ e-mail) دادهٔ قربانی را می‌گیرد.
- fallback ِ «اولین حساب» را بنویس؛ اگر فهرستِ مالک در تولید خالی باشد، بی آن مالک ناگهان دادهٔ خالی می‌بیند.
- مسیرهای پس‌زمینه (اعلان، همگام‌سازیِ ایمیل، تلگرام) معمولاً به scope ِ مشترک سخت‌کد شده‌اند — کاربرِ دوم
  آن‌ها را ندارد؛ فهرستشان کن و صادقانه بگو، نه اینکه وانمود کنی چندکاربره شده.
- helperهای «scope 0 ردیف‌های NULL ِ قدیمی را هم می‌بیند» درست می‌مانند چون فقط برای 0 فعال‌اند.
- قفلِ e-mail ِ رزرو را تست کن (ثبت‌نام و ورود باید ۴۲۲ بدهند).

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. همهٔ جاهایی که scope ِ مشترک را فرض می‌کنند grep کن (`== 0`، `user_id=0`، jobهای پس‌زمینه).
2. تعریفِ «مالک» را از پیکربندیِ موجود + زنجیرهٔ fallback بساز؛ تستِ «مالک ⇒ همان scope» اول نوشته شود.
3. ردیفِ سایه با کلیدِ رزروِ غیرقابلِ‌ثبت؛ get-or-create با پوششِ رقابت.
4. فلگ با پیش‌فرضِ امن؛ تستِ «فلگ خاموش ⇒ رفتارِ قدیم».
5. تستِ API ِ واقعی: کاربرِ دوم هیچ رکورد/فیلدِ مالک را نمی‌بیند و نوشتنش به scope ِ مالک نمی‌رسد.

## 🔗 References
- مرتبط: write-gate-next-to-optional-identity
- تصمیم: docs/decisions/2026-10-18-age-and-user-scope.md (بند ۱)
