---
task_id: 3a76ab9d-bc7d-49d1-b8f3-9bd98470a0fe
title: پیاده‌سازی Dependency Injection در سرویس‌ها
type: refactor
priority: medium
execution_priority: 100
status: awaiting_review
external_status: pending
verification_status: partial
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-19T20:23:42.558226+00:00'
updated_at: '2026-05-25T06:47:43.663144+00:00'
archived: true
archived_at: '2026-05-25T06:47:43.663144+00:00'
tags:
- merged
target_files:
- app/services/ai_service.py
- app/services/auth_service.py
---

# پیاده‌سازی Dependency Injection در سرویس‌ها

## Raw Idea

در فایل app/services/ai_service.py و app/services/auth_service.py، dependencyها به صورت مستقیم import شده‌اند و از DI pattern استفاده نشده است. این باعث می‌شود تست‌نویسی و mock کردن سرویس‌ها دشوار شود.

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
عدم استفاده از dependency injection در services

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/ai_service.py:1-20` — `AIService` — وابستگی‌ها به صورت مستقیم import شده‌اند
  ```python
  from app.database import get_db
  from app.config import settings
  
  class AIService:
      def __init__(self):
          self.db = get_db()
          self.api_key = settings.OPENAI_API_KEY
  ```
- `app/services/auth_service.py:1-25` — `AuthService` — وابستگی‌ها به صورت مستقیم import شده‌اند
  ```python
  from app.database import get_db
  from app.config import settings
  
  class AuthService:
      def __init__(self):
          self.db = get_db()
          self.secret_key = settings.SECRET_KEY
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + Python 3.10+

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/ai.py` (سطر 10) — از AIService استفاده می‌کند
- `app/routes/auth.py` (سطر 15) — از AuthService استفاده می‌کند
- `app/database.py` (سطر 1) — وابستگی اصلی که باید inject شود

## 🌐 نقشهٔ وابستگی‌ها
این تغییر بر تمام routeهایی که از این سرویس‌ها استفاده می‌کنند تأثیر می‌گذارد

## 🔍 Context و وضعیت فعلی
در فایل app/services/ai_service.py و app/services/auth_service.py، dependencyها به صورت مستقیم import شده‌اند و از DI pattern استفاده نشده است. این باعث می‌شود تست‌نویسی و mock کردن سرویس‌ها دشوار شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] AIService و AuthService از DI استفاده کنند
- [ ] تست‌ها بتوانند به راحتی mock کنند
- [ ] همه routeها با سرویس‌های جدید سازگار شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. بازنویسی سرویس‌ها با استفاده از FastAPI Depends برای injection وابستگی‌ها

## 💡 نمونه‌های قبل/بعد
**استفاده از DI در AIService**

_قبل:_
```
class AIService:
    def __init__(self):
        self.db = get_db()
```

_بعد:_
```
class AIService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/ -v`
- `python -c "from app.services.ai_service import AIService; print('OK')"`

## ⚠️ ریسک‌ها و موارد احتیاط
شکستن تست‌های موجود در صورت عدم به‌روزرسانی

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: medium

## Acceptance Criteria

1. AIService و AuthService از DI استفاده کنند _(verify: static)_
2. تست‌ها بتوانند به راحتی mock کنند _(verify: backend_test)_
3. همه routeها با سرویس‌های جدید سازگار شوند _(verify: static)_
