---
title: "گیت احراز هویتِ سخت‌گیر کنار هویتِ اختیاری — قفل واقعی با یک فلگ"
tags: ["auth", "security", "fastapi", "single-tenant", "dependency-injection"]
topic_canonical: "write-gate-next-to-optional-identity"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-20T23:30:00Z"
created_at: "2026-07-20T23:30:00Z"
updated_at: "2026-07-20T23:30:00Z"
merged_from: []
---

# گیت احراز هویتِ سخت‌گیر کنار هویتِ اختیاری

## 🎯 چالش / Challenge

اپ تک‌کاربره روی URL عمومی با یک فلگ «REQUIRE_AUTH» که پیش‌فرض خاموش است تا در
مرحلهٔ login-bypass کار کند. مشکل: وقتی هر route از یک وابستگیِ *اختیاریِ* هویت
(«اگر توکن بود بخوان، وگرنه scope ناشناس») استفاده کند، فلیپ‌کردن REQUIRE_AUTH هیچ
چیزی را نمی‌بندد — چون آن وابستگی اصلاً REQUIRE_AUTH را نمی‌خواند و هرگز 401 نمی‌دهد.
نتیجهٔ فاجعه‌بار: یک endpoint «export کل دیتابیس» با همین الگو، حتی بعد از فعال‌کردن
REQUIRE_AUTH، هش پسوردها را به هر ناشناسی می‌داد.

## 💡 راه‌حل / Solution

یک وابستگیِ گیتِ جداگانه که *کنار* وابستگیِ هویت می‌نشیند (نه جایگزین آن):

- توکن نامعتبر/منقضی → همیشه 401 (سیگنال حمله).
- بی‌توکن + REQUIRE_AUTH=true → 401.
- بی‌توکن + REQUIRE_AUTH=false → عبور (رفتار فعلی حفظ می‌شود).

چون گیت جداست، وابستگیِ هویت (که تست‌ها با dependency-override کنترلش می‌کنند) دست‌نخورده
می‌ماند و منطق مجوزدهی همچنان overridable است، در حالی که «سخت‌گیری» یک‌جا و سازگار روی
هر دو نوع endpoint اعمال می‌شود: هم mutationها و هم *readهایی که سطح کل-دیتابیس را لو
می‌دهند* (export، گزارش‌ها، جستجوی سراسری، دستیار). همان یک نام روی هر دو ⇒ فلیپ فلگ
واقعاً کل سطح عمومی را قفل می‌کند.

دفاع در عمق برای دادهٔ فوق‌حساس: خروجیِ *دستیِ* HTTP ستون‌های اعتباری (هش/کلید) را redact
می‌کند، در حالی که مسیر خودکارِ بکاپ به فضای خصوصیِ مالک (Drive) کامل می‌ماند.

## 🧪 نمونه کد (Anonymized)

```python
async def enforce_auth_when_required(request, db=Depends(get_db)) -> None:
    token = _extract_token(request)
    if token is None:
        if settings.REQUIRE_AUTH:
            raise HTTPException(401, "Authentication required")
        return                         # open when the flag is off
    if await _resolve_scope(token, db) is None:
        raise HTTPException(401, "Invalid or expired token")

# usage — sits NEXT TO the (test-overridable) identity dep:
async def export_all(user_id=Depends(get_optional_user_id),
                     _gate=Depends(enforce_auth_when_required)):
    ...
```

## ⚠️ نکات حیاتی / Pitfalls

- **یک endpoint «export/backup همه‌چیز» ذاتاً حساس‌تر از بقیهٔ اپ است** — حتی در حالت
  تک‌کاربرهٔ باز، دادن هش پسورد به ناشناس بد است؛ redact ستون‌های اعتباری در مسیر دستی.
- اگر «درمانِ مستندشده» (فلیپ یک فلگ) یک endpoint را نمی‌بندد، آن endpoint گیت جدا لازم
  دارد؛ صرفِ داشتنِ فلگ کافی نیست اگر مسیرها آن را نخوانند.
- readهایی که کل دامنه را برمی‌گردانند (جستجوی سراسری، دستیارِ داده‌محور، گزارش) را هم
  گیت کن، نه فقط writeها.
- endpointهای گران/AI را rate-limit کن — دسترسی باز یعنی DoS و سوختن سهمیهٔ مدل.
- نامِ گیت را خنثی بگذار (نه «write») چون روی readها هم می‌نشیند؛ نامِ قدیمی را alias کن.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. هر endpoint که از هویتِ *اختیاری* استفاده می‌کند و دادهٔ مالک را برمی‌گرداند/تغییر
   می‌دهد فهرست کن.
2. یک گیتِ «strict-when-configured» بساز و کنار وابستگیِ هویت بگذار (نه جایگزین).
3. مطمئن شو فلیپِ فلگ *همهٔ* آن‌ها را می‌بندد؛ تستِ «۴۰۱ با فلگ روشن» برای هرکدام بنویس.
4. دادهٔ فوق‌حساس در مسیر دستی redact شود؛ مسیر خودکار به فضای خصوصی کامل بماند.
5. readهای دامنه‌ای را user-scope کن تا با multi-user آینده نشت نکنند.

## 🔗 References

- منبع اولیه: بازبینی خصمانهٔ 2026-07-20 همین مخزن (یافتهٔ بحرانی backup export).
- مرتبط: [idempotent-seeding-vs-user-edits]، [holistic-island-audit-with-adversarial-verification]
