---
task_id: a2c055da-f0a2-48bd-98ff-ebe40e57725f
title: افزودن بررسی انقضای JWT در middleware
type: security
priority: critical
execution_priority: 100
status: awaiting_review
external_status: pending
verification_status: partial
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-26T20:25:22.291033+00:00'
updated_at: '2026-05-29T20:33:23.496656+00:00'
archived: true
archived_at: '2026-05-26T23:17:22.514633+00:00'
tags:
- merged
target_files:
- app/dependencies/auth.py
---

# افزودن بررسی انقضای JWT در middleware

## Raw Idea

در فایل `app/dependencies/auth.py`، تابع `get_current_user` که به عنوان dependency برای احراز هویت در اکثر endpointها استفاده می‌شود، احتمالاً انقضای توکن JWT را بررسی نمی‌کند. این یک آسیب‌پذیری امنیتی جدی است زیرا توکن‌های منقضی شده همچنان معتبر تلقی می‌شوند و مهاجم می‌تواند با یک توکن قدیمی به سیستم دسترسی پیدا کند. با توجه به اینکه `ACCESS_TOKEN_EXPIRE_MINUTES=30` در `.env.example` تنظیم شده، اما بررسی expiry در کد دیده نمی‌شود.

## Prompt

## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

---


## 🎯 هدف (خلاصه ساختاریافته)
عدم بررسی انقضای توکن JWT در middleware احراز هویت

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/dependencies/auth.py:1-50` — `get_current_user` — تابع اصلی dependency احراز هویت که باید اصلاح شود
  ```python
  async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
      # احتمالاً فقط decode می‌کند بدون بررسی expiry
      payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست 
[auto-re-registered from github_import at 2026-05-20T04:25:49.854717+00:00]

## 🧱 پشتهٔ فناوری و معماری
FastAPI + python-jose + JWT

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/auth.py` (سطر 85) — این endpoint توکن تولید می‌کند و باید expiry را تنظیم کند
- `app/config.py` (سطر 1) — تنظیمات JWT از اینجا خوانده می‌شود
- `app/routes/auth_google.py` — این فایل `auth.py` را import می‌کند (caller)
- `app/routes/ai.py` — این فایل `auth.py` را import می‌کند (caller)
- `app/routes/integrations.py` — این فایل `auth.py` را import می‌کند (caller)
- `app/routes/notifications.py` — این فایل `auth.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این تابع توسط تمام routeهای محافظت‌شده (users, tasks, projects, notifications, integrations, ai) استفاده می‌شود.

## 🔍 Context و وضعیت فعلی
در فایل `app/dependencies/auth.py`، تابع `get_current_user` که به عنوان dependency برای احراز هویت در اکثر endpointها استفاده می‌شود، احتمالاً انقضای توکن JWT را بررسی نمی‌کند. این یک آسیب‌پذیری امنیتی جدی است زیرا توکن‌های منقضی شده همچنان معتبر تلقی می‌شوند و مهاجم می‌تواند با یک توکن قدیمی به سیستم دسترسی پیدا کند. با توجه به اینکه `ACCESS_TOKEN_EXPIRE_MINUTES=30` در `.env.example` تنظیم شده، اما بررسی expiry در کد دیده نمی‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] توکن منقضی شده با status code 401 رد شود
- [ ] توکن معتبر بدون مشکل عبور کند
- [ ] تست واحد جدید برای بررسی expiry اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن بررسی `exp` (expiration time) در تابع `get_current_user` در `app/dependencies/auth.py`. از کتابخانه `python-jose` برای decode و بررسی خودکار expiry استفاده شود.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن بررسی expiry**

_قبل:_
```
payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
```

_بعد:_
```
payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_exp": True})
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_auth.py -k test_expired_token`
- `curl -H 'Authorization: Bearer EXPIRED_TOKEN' http://localhost:8000/api/tasks`

## ⚠️ ریسک‌ها و موارد احتیاط
کمترین ریسک؛ فقط توکن‌های منقضی شده را رد می‌کند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

## Acceptance Criteria

1. توکن منقضی شده با status code 401 رد شود _(verify: api_response)_
2. توکن معتبر بدون مشکل عبور کند _(verify: api_response)_
3. تست واحد جدید برای بررسی expiry اضافه شود _(verify: backend_test)_
