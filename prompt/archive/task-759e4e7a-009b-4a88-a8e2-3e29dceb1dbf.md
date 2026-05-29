---
task_id: 759e4e7a-009b-4a88-a8e2-3e29dceb1dbf
title: متمرکزسازی مدیریت خطا با دکوراتور
type: refactor
priority: medium
execution_priority: 100
status: pending
external_status: pending
verification_status: pending
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-19T20:23:42.402193+00:00'
updated_at: '2026-05-29T20:26:16.481120+00:00'
archived: true
archived_at: '2026-05-25T06:47:43.663144+00:00'
tags:
- merged
target_files:
- app/routes/tasks.py
- app/routes/projects.py
---

# متمرکزسازی مدیریت خطا با دکوراتور

## Raw Idea

در routeهای مختلف (tasks.py, projects.py, users.py) الگوی try-except یکسانی برای مدیریت خطاهای دیتابیس و اعتبارسنجی تکرار شده است. این duplicate logic باعث افزایش حجم کد و کاهش قابلیت نگهداری می‌شود. در صورت تغییر در نحوه مدیریت خطا، باید تمام routeها به‌روزرسانی شوند.

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
Duplicate logic: مدیریت خطا در routeهای مختلف تکرار شده

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:15-30` — `create_task` — الگوی تکراری مدیریت خطا
  ```python
  try:
      task = task_service.create_task(data)
      return task
  except ValidationError as e:
      raise HTTPException(status_code=400, detail=str(e))
  except Exception as e:
      raise HTTPException(status_code=500, detail="Internal server error")
  ```
- `app/routes/projects.py:12-27` — `create_project` — همان الگوی تکراری
  ```python
  try:
      project = project_service.create_project(data)
      return project
  except ValidationError as e:
      raise HTTPException(status_code=400, detail=str(e))
  except Exception as e:
      raise HTTPException(status_code=500, detail="Internal server error")
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + Python 3.11

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/middleware.py` (سطر 1) — محل مناسب برای پیاده‌سازی decorator مرکزی
- `app/routes/users.py` (سطر 10) — route دیگری با الگوی تکراری

## 🌐 نقشهٔ وابستگی‌ها
این تغییر روی تمام routeهایی که از try-except استفاده می‌کنند تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
در routeهای مختلف (tasks.py, projects.py, users.py) الگوی try-except یکسانی برای مدیریت خطاهای دیتابیس و اعتبارسنجی تکرار شده است. این duplicate logic باعث افزایش حجم کد و کاهش قابلیت نگهداری می‌شود. در صورت تغییر در نحوه مدیریت خطا، باید تمام routeها به‌روزرسانی شوند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] یک decorator handle_errors در middleware.py ایجاد شود
- [ ] تمامی routeها از decorator استفاده کنند
- [ ] هیچ try-except تکراری در routeها باقی نماند
- [ ] تست‌های خطا همچنان پاس شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ایجاد یک decorator یا middleware مرکزی برای مدیریت خطاها در app/middleware.py. سپس تمام routeها را به استفاده از این decorator تغییر دهید تا logic تکراری حذف شود.

## 💡 نمونه‌های قبل/بعد
**استفاده از decorator**

_قبل:_
```
try:
    result = service.method(data)
except ValidationError as e:
    raise HTTPException(400, str(e))
```

_بعد:_
```
@handle_errors
def endpoint(data):
    return service.method(data)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -r 'try:' app/routes/ --include='*.py' | wc -l`
- `pytest tests/`

## ⚠️ ریسک‌ها و موارد احتیاط
نیاز به تست کامل routeها برای اطمینان از عدم تغییر رفتار

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: medium

## Acceptance Criteria

1. یک decorator handle_errors در middleware.py ایجاد شود _(verify: static)_
2. تمامی routeها از decorator استفاده کنند _(verify: static)_
3. هیچ try-except تکراری در routeها باقی نماند _(verify: static)_
4. تست‌های خطا همچنان پاس شوند _(verify: backend_test)_
