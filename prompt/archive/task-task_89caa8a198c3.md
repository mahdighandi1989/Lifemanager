---
task_id: task_89caa8a198c3
title: پیاده‌سازی Alembic و پیکربندی CORS
type: other
priority: critical
execution_priority: 100
status: awaiting_review
external_status: pending
verification_status: partial
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-25T06:46:03.832894+00:00'
updated_at: '2026-05-25T22:33:57.396846+00:00'
archived: true
archived_at: '2026-05-25T22:33:57.396831+00:00'
tags:
- consolidated
- post_verify_merge
---

# پیاده‌سازی Alembic و پیکربندی CORS

## Raw Idea

🧬 این یک تسک تلفیقی است — از 8 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این خوشه بر روی جنبه‌های زیرساختی و پیکربندی سیستم تمرکز دارد. شامل همگام‌سازی Migrationها، اصلاح پیکربندی CORS، مدیریت وابستگی‌ها و متغیرهای محیطی، به‌روزرسانی پکیج‌ها برای رفع آسیب‌پذیری‌ها، بهینه‌سازی اتصال به دیتابیس و پیاده‌سازی Feature Flagها و مدیریت زمان‌بندی فراخوانی‌های API خارجی می‌شود.
🎯 theme: پیکربندی و بهینه‌سازی زیرساخت سیستم
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 8
  id: a8e41a8b-31f7-4e4b-bd7d-2b65982a47cf
  عنوان اصلی: همگام‌سازی Migrations با مدل‌های فعلی
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: migrations/README

📋 acceptance_criteria کامل:
  - دستور alembic upgrade head بدون خطا اجرا می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_migrations.py::test_alembic_upgrade_head", "timeout_seconds": 120}]
  - همه جدول‌های مدل‌ها در دیتابیس ایجاد می‌شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_migrations.py::test_all_tables_created", "timeout_seconds": 120}]
  - فایل migration شامل همه مدل‌ها است [verify_method=static] [verify_plan={"grep_patterns": ["User", "Task", "Project", "Notification", "AiModelConfig"], "files_hint": ["migrations/versions/*.py"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
Migrations با مدل‌های فعلی sync نیستند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `migrations/README:1-10` — `README` — فایل README نشان می‌دهد که migrations پیکربندی شده‌اند اما استفاده نشده‌اند
  ```
  Generic single-database configuration.
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
SQLAlchemy + Alembic + PostgreSQL (احتمالی)

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/models/user.py` (سطر 1) — مدل User که باید در migration باشد
- `app/models/task.py` (سطر 1) — مدل Task که باید در migration باشد
- `app/models/project.py` (سطر 1) — مدل Project که باید در migration باشد
- `app/models/notification.py` (سطر 1) — مدل Notification که باید در migration باشد
- `app/models/ai_model_config.py` (سطر 1) — مدل AiModelConfig که باید در migration باشد

## 🌐 نقشهٔ وابستگی‌ها
این مشکل بر کل دیتابیس تأثیر می‌گذارد و بدون آن، پروژه در محیط production قابل اجرا نیست.

## 🔍 Context و وضعیت فعلی
پوشه migrations شامل فایل‌های اولیه Alembic است اما هیچ migration واقعی برای مدل‌های موجود (User, Task, Project, Notification, AiModelConfig) وجود ندارد. مدل‌ها در app/models/ تعریف شده‌اند اما migrations/ خالی است. این یعنی دیتابیس نمی‌تواند با دستور alembic upgrade head ساخته شود و توسعه‌دهندگان مجبور به استفاده از create_all هستند که برای production مناسب نیست.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] دستور alembic upgrade head بدون خطا اجرا می‌شود
- [ ] همه جدول‌های مدل‌ها در دیتابیس ایجاد می‌شوند
- [ ] فایل migration شامل همه مدل‌ها است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک migration اولیه با دستور alembic revision --autogenerate -m 'initial' ایجاد کنید. سپس فایل migration را بررسی و ویرایش کنید تا همه مدل‌ها را پوشش دهد.

## 💡 نمونه‌های قبل/بعد
**ایجاد migration اولیه**

_قبل:_
```
ls migrations/versions/
# خالی
```

_بعد:_
```
ls migrations/versions/
# 0001_initial.py
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `alembic upgrade head`
- `alembic current`
- `python -c 'from app.database import engine; from app.models import Base; Base.metadata.create_all(engine)'`

## ⚠️ ریسک‌ها و موارد احتیاط
اگر دیتابیس production وجود داشته باشد، migration ممکن است با داده‌های موجود conflict داشته باشد

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 8
  id: a3b4e148-5171-4a53-926f-17cce5bfa3d6
  عنوان اصلی: اصلاح پیکربندی CORS
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/main.py

📋 acceptance_criteria کامل:
  - درخواست از دامنه‌های غیرمجاز HTTP 403 برمی‌گرداند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/oversight/status", "headers": {"Origin": "https://evil.com"}, "json_body": null, "expected_status": 403, "required_fields": [], "json_contains": null}]
  - درخواست از دامنه‌های مجاز به درستی پردازش می‌شود [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/oversight/status", "headers": {"Origin": "https://allowed.example.com"}, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null}]
  - لیست دامنه‌های مجاز در environment variable ذخیره شود [verify_method=static] [verify_plan={"grep_patterns": ["ALLOWED_ORIGINS", "os\\.getenv\\("], "files_hint": ["app/main.py"]}]
  - تست واحد برای CORS validation اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_cors.py::test_cors_validation", "timeout_seconds": 60}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
CORS پیکربندی بیش از حد باز (Allow All Origins)

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/main.py:15-20` — `CORS_config` — پیکربندی CORS که باید اصلاح شود
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=['*'],  # ⚠️ خطرناک
      allow_credentials=True,
      allow_methods=['*'],
      allow_headers=['*']
  )
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + Starlette CORS middleware

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `config/settings.py` (سطر 30) — محل مناسب برای ذخیره لیست دامنه‌های مجاز
- `app/config.py` (سطر 25) — فایل کانفیگ اصلی برنامه

## 🌐 نقشهٔ وابستگی‌ها
این تغییر روی تمام endpointهای API تأثیر می‌گذارد و نیاز به هماهنگی با تیم frontend برای تعیین دامنه‌های مجاز دارد.

## 🔍 Context و وضعیت فعلی
در فایل app/main.py (خطوط 15-20)، CORS middleware با allow_origins=['*'] پیکربندی شده است. این پیکربندی به هر دامنه‌ای اجازه می‌دهد به API دسترسی داشته باشد و امکان CSRF (Cross-Site Request Forgery) و data exfiltration را فراهم می‌کند. شواهد: کد موجود در خط 18: `app.add_middleware(CORSMiddleware, allow_origins=['*'], ...)`

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] درخواست از دامنه‌های غیرمجاز HTTP 403 برمی‌گرداند
- [ ] درخواست از دامنه‌های مجاز به درستی پردازش می‌شود
- [ ] لیست دامنه‌های مجاز در environment variable ذخیره شود
- [ ] تست واحد برای CORS validation اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تغییر CORS پیکربندی به allow_origins با لیست سفید دامنه‌های مجاز (مثلاً frontend دامنه) و فعال کردن credentials فقط برای دامنه‌های مشخص.

## 💡 نمونه‌های قبل/بعد
**CORS محدود به دامنه‌های مجاز**

_قبل:_
```
allow_origins=['*']
```

_بعد:_
```
allow_origins=['https://app.lifemanager.com', 'http://localhost:3000']
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_cors.py`
- `curl -H 'Origin: https://evil.com' -H 'Host: localhost:8000' http://localhost:8000/api/tasks -w '%{http_code}'`

## ⚠️ ریسک‌ها و موارد احتیاط
کم؛ فقط نیاز به تغییر یک خط کد و اضافه کردن environment variable

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 8
  id: 60167e0a-572b-4b14-ba47-812722d8f5aa
  عنوان اصلی: تطبیق نسخه‌های وابستگی در requirements.txt
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: requirements.txt

📋 acceptance_criteria کامل:
  - تمام وابستگی‌ها در requirements.txt دارای نسخه دقیق هستند [verify_method=static] [verify_plan={"grep_patterns": ["^[a-zA-Z0-9_\\-]+==[0-9]+\\.[0-9]+\\.[0-9]+"], "files_hint": ["requirements.txt"]}]
  - نصب وابستگی‌ها با pip install -r requirements.txt بدون خطا انجام می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_dependencies.py::test_install_requirements", "timeout_seconds": 120}]
  - برنامه با موفقیت اجرا می‌شود [verify_method=ui_interaction] [verify_plan={"base": "backend", "ui_steps": [{"action": "navigate", "url": "/"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "assert_visible", "selector": "body"}], "expected_api_calls": []}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
عدم تطابق نسخه‌های وابستگی در requirements.txt با محیط اجرا

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `requirements.txt:1-30` — `requirements.txt` — کل فایل requirements.txt نیاز به قفل‌سازی نسخه‌ها دارد
  ```
  fastapi>=0.68.0
  uvicorn>=0.15.0
  sqlalchemy>=1.4.0
  celery>=5.1.0
  ...
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Python 3.9+، FastAPI، SQLAlchemy، Celery

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `Dockerfile` (سطر 10) — از requirements.txt برای نصب وابستگی‌ها استفاده می‌کند
- `docker-compose.yml` (سطر 15) — محیط اجرا را تعریف می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این تغییر روی کل فرآیند نصب وابستگی‌ها در محیط‌های توسعه و تولید تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
فایل requirements.txt شامل وابستگی‌هایی است که ممکن است با نسخه‌های نصب‌شده در Dockerfile یا محیط اجرا ناسازگار باشند. به‌ویژه، نسخه‌های مشخص‌شده برای کتابخانه‌های کلیدی مانند FastAPI، SQLAlchemy، و Celery ممکن است با یکدیگر تداخل داشته باشند. این ناسازگاری می‌تواند باعث خطاهای runtime مانند ImportError یا TypeError شود. شواهد: در requirements.txt، نسخه‌های دقیق مشخص نشده‌اند (مثلاً fastapi>=0.68.0) که می‌تواند منجر به نصب نسخه‌های جدیدتر با APIهای شکسته شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تمام وابستگی‌ها در requirements.txt دارای نسخه دقیق هستند
- [ ] نصب وابستگی‌ها با pip install -r requirements.txt بدون خطا انجام می‌شود
- [ ] برنامه با موفقیت اجرا می‌شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. نسخه‌های دقیق و تست‌شده را در requirements.txt قفل کنید. از pip freeze برای گرفتن نسخه‌های فعلی استفاده کنید و آن‌ها را در فایل قرار دهید. همچنین، از یک فایل requirements.lock یا Pipfile.lock برای مدیریت دقیق‌تر وابستگی‌ها استفاده کنید.

## 💡 نمونه‌های قبل/بعد
**قفل‌سازی نسخه‌ها**

_قبل:_
```
fastapi>=0.68.0
```

_بعد:_
```
fastapi==0.68.1
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pip install -r requirements.txt`
- `python app/main.py`

## ⚠️ ریسک‌ها و موارد احتیاط
کم. ممکن است نیاز به تست مجدد برخی از ویژگی‌ها باشد.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 8
  id: b315f6e3-8b82-4eca-b103-ceb96e9f5934
  عنوان اصلی: افزودن متغیرهای محیطی به .env.example
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: .env.example, app/config.py

📋 acceptance_criteria کامل:
  - تمام متغیرهای محیطی استفاده‌شده در app/config.py در .env.example وجود دارند [verify_method=static] [verify_plan={"grep_patterns": ["DATABASE_URL", "SECRET_KEY", "CELERY_BROKER_URL", "REDIS_URL"], "files_hint": ["app/config.py", ".env.example"]}]
  - هر متغیر دارای یک مقدار پیش‌فرض یا توضیح است [verify_method=static] [verify_plan={"grep_patterns": ["DATABASE_URL=", "SECRET_KEY=", "CELERY_BROKER_URL=", "REDIS_URL="], "files_hint": [".env.example"]}]
  - برنامه با استفاده از .env.example قابل اجرا است [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
متغیرهای محیطی ارجاع‌شده در کد اما در .env.example وجود ندارند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/config.py:1-30` — `Settings` — کلاس Settings که متغیرهای محیطی را تعریف می‌کند
  ```python
  class Settings(BaseSettings):
      DATABASE_URL: str = Field(..., env='DATABASE_URL')
      SECRET_KEY: str = Field(..., env='SECRET_KEY')
      CELERY_BROKER_URL: str = Field(..., env='CELERY_BROKER_URL')
      REDIS_URL: str = Field(..., env='REDIS_URL')
  ```
- `.env.example:1-10` — `.env.example` — فایل .env.example که باید به‌روز شود
  ```
  # این فایل نمونه‌ای از متغیرهای محیطی است
  # DATABASE_URL=postgresql://user:pass@localhost/db
  # SECRET_KEY=your-secret-key
  # CELERY_BROKER_URL=redis://localhost:6379/0
  # REDIS_URL=redis://localhost:6379/1
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Python، Pydantic Settings، FastAPI

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/database.py` (سطر 5) — از DATABASE_URL استفاده می‌کند
- `app/celery_app.py` (سطر 3) — از CELERY_BROKER_URL استفاده می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این تغییر روی راه‌اندازی اولیه پروژه و مستندات تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
در فایل app/config.py، متغیرهای محیطی مانند DATABASE_URL، SECRET_KEY، CELERY_BROKER_URL و REDIS_URL استفاده شده‌اند، اما در فایل .env.example تعریف نشده‌اند. این موضوع باعث می‌شود که توسعه‌دهندگان جدید نتوانند به راحتی محیط توسعه را راه‌اندازی کنند و ممکن است با خطاهای runtime مواجه شوند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تمام متغیرهای محیطی استفاده‌شده در app/config.py در .env.example وجود دارند
- [ ] هر متغیر دارای یک مقدار پیش‌فرض یا توضیح است
- [ ] برنامه با استفاده از .env.example قابل اجرا است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تمام متغیرهای محیطی استفاده‌شده در کد را به فایل .env.example اضافه کنید. برای هر متغیر یک مقدار پیش‌فرض (در صورت امکان) و توضیح کوتاه قرار دهید.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن متغیر به .env.example**

_قبل:_
```
# DATABASE_URL=postgresql://user:pass@localhost/db
```

_بعد:_
```
DATABASE_URL=postgresql://user:pass@localhost/lifemanager
# توضیح: آدرس دیتابیس PostgreSQL
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cp .env.example .env`
- `python app/main.py`

## ⚠️ ریسک‌ها و موارد احتیاط
کم. فقط مستندات و فایل پیکربندی تغییر می‌کند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 8
  id: 8b0d273d-5f29-47cd-8d0e-0366911cd716
  عنوان اصلی: جایگزینی مقادیر حساس در .env.example
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: .env.example

📋 acceptance_criteria کامل:
  - هیچ مقدار واقعی یا نزدیک به واقعی در .env.example وجود نداشته باشد [verify_method=static] [verify_plan={"grep_patterns": ["^(?!.*=.*<.*>).*=.*[a-zA-Z0-9]{8,}", "^(?!.*=.*placeholder).*=.*[a-zA-Z0-9]{8,}"], "files_hint": [".env.example"]}]
  - تمام مقادیر با placeholderهای واضح جایگزین شوند [verify_method=static] [verify_plan={"grep_patterns": ["=.*<[^>]+>", "=.*placeholder", "=.*your_", "=.*YOUR_"], "files_hint": [".env.example"]}]
  - .env.example در production مستقر نشود [verify_method=static] [verify_plan={"grep_patterns": ["\\.env\\.example"], "files_hint": [".dockerignore", ".gitignore", "Dockerfile", "deploy/**/*"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
فایل .env.example حاوی اطلاعات حساس است

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `.env.example:1-20` — `کل فایل` — کل فایل حاوی مقادیر نمونه است
  ```
  DATABASE_URL=postgresql://user:password@localhost:5432/lifemanager
  JWT_SECRET_KEY=your-secret-key-here-change-in-production
  OPENAI_API_KEY=sk-your-openai-api-key
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Python + dotenv

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/config.py` (سطر 1) — متغیرهای محیطی را از .env می‌خواند
- `docker-compose.yml` (سطر 5) — ممکن است از .env استفاده کند
- `.gitignore` (سطر 1) — باید شامل .env باشد

## 🌐 نقشهٔ وابستگی‌ها
این فایل به عنوان راهنما برای توسعه‌دهندگان جدید استفاده می‌شود و مستقیماً در کد استفاده نمی‌شود.

## 🔍 Context و وضعیت فعلی
فایل .env.example در ریشه پروژه حاوی نمونه‌هایی از متغیرهای محیطی با مقادیر پیش‌فرض است. اگرچه این فایل معمولاً برای راهنمایی استفاده می‌شود، اما وجود مقادیر واقعی یا نزدیک به واقعی برای کلیدهای API، رمزهای عبور و توکن‌ها خطرناک است. همچنین اگر .env.example در production مستقر شود، اطلاعات حساس فاش می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ مقدار واقعی یا نزدیک به واقعی در .env.example وجود نداشته باشد
- [ ] تمام مقادیر با placeholderهای واضح جایگزین شوند
- [ ] .env.example در production مستقر نشود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. فایل .env.example را بازبینی کنید و تمام مقادیر حساس را با placeholderهای واضح (مانند YOUR_API_KEY_HERE) جایگزین کنید. اطمینان حاصل کنید که .env.example در .gitignore نیست و در production مستقر نمی‌شود.

## 💡 نمونه‌های قبل/بعد
**پاکسازی .env.example**

_قبل:_
```
DATABASE_URL=postgresql://user:password@localhost:5432/lifemanager
```

_بعد:_
```
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/lifemanager
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cat .env.example | grep -E "(password|secret|key|token|api)"`
- `grep -r "YOUR_" .env.example`

## ⚠️ ریسک‌ها و موارد احتیاط
بدون خطر، فقط نیاز به بازبینی و جایگزینی مقادیر است.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 6 از 8
  id: cbe369a5-7bac-4983-853d-e5d8c18b1412
  عنوان اصلی: به‌روزرسانی dependencies برای رفع آسیب‌پذیری‌ها
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: requirements.txt

📋 acceptance_criteria کامل:
  - تمام dependencies به آخرین ورژن پایدار به‌روزرسانی شوند [verify_method=static] [verify_plan={"grep_patterns": ["Flask==[0-9]+\\.[0-9]+\\.[0-9]+", "SQLAlchemy==[0-9]+\\.[0-9]+\\.[0-9]+"], "files_hint": ["requirements.txt"]}]
  - هیچ آسیب‌پذیری شناخته شده‌ای در dependencies وجود نداشته باشد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
  - تست‌های پروژه پس از به‌روزرسانی پاس شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
ورژن‌های قدیمی dependencies با آسیب‌پذیری‌های شناخته شده

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `requirements.txt:1-30` — `کل فایل` — ورژن‌های قدیمی که نیاز به بررسی دارند
  ```
  Flask==2.0.1
  SQLAlchemy==1.4.22
  requests==2.25.1
  PyJWT==2.1.0
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Python + pip

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `Dockerfile` (سطر 5) — از requirements.txt برای نصب dependencies استفاده می‌کند
- `docker-compose.yml` (سطر 10) — محیط اجرا را مشخص می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این فایل تمام dependencies پروژه را مشخص می‌کند و به‌روزرسانی آن بر کل پروژه تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
بررسی فایل requirements.txt نشان می‌دهد که برخی dependencies دارای ورژن‌های قدیمی با آسیب‌پذیری‌های شناخته شده (CVE) هستند. به عنوان مثال، Flask ممکن است ورژن قدیمی داشته باشد و SQLAlchemy نیز ممکن است نیاز به به‌روزرسانی داشته باشد. این آسیب‌پذیری‌ها می‌توانند منجر به حملات مختلفی مانند SQL injection یا remote code execution شوند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تمام dependencies به آخرین ورژن پایدار به‌روزرسانی شوند
- [ ] هیچ آسیب‌پذیری شناخته شده‌ای در dependencies وجود نداشته باشد
- [ ] تست‌های پروژه پس از به‌روزرسانی پاس شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تمام dependencies را به آخرین ورژن‌های پایدار به‌روزرسانی کنید. از ابزارهایی مانند pip-audit یا safety برای شناسایی خودکار آسیب‌پذیری‌ها استفاده کنید. همچنین می‌توانید از Dependabot یا Renovate برای به‌روزرسانی خودکار استفاده کنید.

## 💡 نمونه‌های قبل/بعد
**به‌روزرسانی Flask**

_قبل:_
```
Flask==2.0.1
```

_بعد:_
```
Flask==2.3.3
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pip-audit -r requirements.txt`
- `safety check -r requirements.txt`
- `pytest`

## ⚠️ ریسک‌ها و موارد احتیاط
به‌روزرسانی dependencies ممکن است باعث شکستن compatibility با کد موجود شود. نیاز به تست کامل دارد.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 8
  id: 43092a7f-819f-40fc-a7e1-5af467f6cba9
  عنوان اصلی: Implement external API call timeouts
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/integration_service.py

📋 acceptance_criteria کامل:
  - External API calls timeout after 30 seconds by default [verify_method=static] [verify_plan={"grep_patterns": ["timeout=30", "timeout=30.0", "httpx.Timeout(30", "aiohttp.ClientTimeout(total=30"], "files_hint": ["app/services/integration_service.py"]}]
  - Timeout value is configurable via environment variable [verify_method=static] [verify_plan={"grep_patterns": ["os.getenv.*TIMEOUT", "environ.get.*TIMEOUT", "settings.*timeout"], "files_hint": ["app/services/integration_service.py"]}]
  - Timeout raises appropriate HTTPException with 504 status [verify_method=static] [verify_plan={"grep_patterns": ["HTTPException.*504", "status_code=504", "status.HTTP_504_GATEWAY_TIMEOUT"], "files_hint": ["app/services/integration_service.py"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
Missing timeout on external API calls in integration service

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/integration_service.py:20-35` — `call_external_api` — External API call without timeout
  ```python
  async with httpx.AsyncClient() as client:
      response = await client.post(url, json=data)  # ⚠️ no timeout
      return response.json()
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + httpx + asyncio

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/config.py` (سطر 50) — Configuration for timeout values
- `app/routes/integrations.py` (سطر 25) — Route that triggers this service

## 🌐 نقشهٔ وابستگی‌ها
Used by all third-party integrations including calendar, email, and webhook services.

## 🔍 Context و وضعیت فعلی
The integration service makes HTTP calls to external services without setting a timeout. This can cause the application to hang indefinitely if the external service is unresponsive, leading to resource exhaustion and denial of service.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] External API calls timeout after 30 seconds by default
- [ ] Timeout value is configurable via environment variable
- [ ] Timeout raises appropriate HTTPException with 504 status
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Add a configurable timeout (default 30 seconds) to all external HTTP calls using httpx or aiohttp client timeout.

## 💡 نمونه‌های قبل/بعد
**Add timeout configuration**

_قبل:_
```
response = await client.post(url, json=data)
```

_بعد:_
```
response = await client.post(url, json=data, timeout=30.0)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_integrations.py -k test_external_api_timeout`
- `curl -X POST http://localhost:8000/api/integrations/test`

## ⚠️ ریسک‌ها و موارد احتیاط
Existing integrations may need longer timeouts; ensure configuration is flexible

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 8 از 8
  id: 5e17178a-d5f6-4d73-ba0b-b5f0aa93c834
  عنوان اصلی: پیاده‌سازی Feature flags در کلاس Settings
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/config.py

📋 acceptance_criteria کامل:
  - کلاس Settings شامل فیلدهای FEATURE_AI_ENABLED و FEATURE_INTEGRATIONS_ENABLED است [verify_method=static] [verify_plan={"grep_patterns": ["FEATURE_AI_ENABLED", "FEATURE_INTEGRATIONS_ENABLED"], "files_hint": ["app/config.py"]}]
  - مقادیر پیش‌فرض False هستند [verify_method=static] [verify_plan={"grep_patterns": ["FEATURE_AI_ENABLED\\s*=\\s*False", "FEATURE_INTEGRATIONS_ENABLED\\s*=\\s*False"], "files_hint": ["app/config.py"]}]
  - می‌توان با متغیر محیطی آن‌ها را true کرد [verify_method=static] [verify_plan={"grep_patterns": ["os\\.getenv\\s*\\(\\s*[\"']FEATURE_AI_ENABLED[\"']", "os\\.getenv\\s*\\(\\s*[\"']FEATURE_INTEGRATIONS_ENABLED[\"']"], "files_hint": ["app/config.py"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
Feature flags در کد وجود ندارند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/config.py:1-30` — `Settings` — کلاس Settings باید فیلدهای feature flag را اضافه کند
  ```python
  class Settings(BaseSettings):
      DATABASE_URL: str = Field(..., env='DATABASE_URL')
      SECRET_KEY: str = Field(..., env='SECRET_KEY')
      ...
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + pydantic-settings + Python 3.11

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `config/settings.py` (سطر 1) — تنظیمات ثانویه که باید هماهنگ شوند
- `app/main.py` (سطر 1) — نقطه ورود که باید feature flags را بررسی کند

## 🌐 نقشهٔ وابستگی‌ها
تغییر در config.py بر تمام سرویس‌ها و روترهایی که از تنظیمات استفاده می‌کنند تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
هیچ مکانیزم feature flag در پروژه دیده نمی‌شود. فایل config/settings.py و app/config.py شامل تنظیمات پایه هستند اما هیچ flag برای فعال/غیرفعال کردن ویژگی‌ها (مانند AI یا integration) وجود ندارد. این موضوع باعث می‌شود که اضافه کردن تدریجی ویژگی‌ها یا A/B testing غیرممکن باشد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] کلاس Settings شامل فیلدهای FEATURE_AI_ENABLED و FEATURE_INTEGRATIONS_ENABLED است
- [ ] مقادیر پیش‌فرض False هستند
- [ ] می‌توان با متغیر محیطی آن‌ها را true کرد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک سیستم ساده feature flags با استفاده از متغیرهای محیطی یا یک فایل JSON اضافه کنید. از pydantic-settings برای مدیریت آن‌ها استفاده کنید.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن feature flags به Settings**

_قبل:_
```
class Settings(BaseSettings):
    DATABASE_URL: str
```

_بعد:_
```
class Settings(BaseSettings):
    DATABASE_URL: str
    FEATURE_AI_ENABLED: bool = Field(False, env='FEATURE_AI_ENABLED')
    FEATURE_INTEGRATIONS_ENABLED: bool = Field(False, env='FEATURE_INTEGRATIONS_ENABLED')
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest app/tests/test_config.py -k feature_flags`
- `FEATURE_AI_ENABLED=true python -c 'from app.config import settings; print(settings.FEATURE_AI_ENABLED)'`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییرات backward-compatible هستند و ریسک کمی دارند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 نکات استاندارد (همان bullet هایی که در ساخت پرامپت‌های معمولی پروژه رعایت می‌شود — وراثت کامل، نه کپی):
- ساختار AC ها: acceptance_criteria با verify_method و verify_plan و evidence_locations برای هر AC
- edge cases را در نظر بگیر و در پرامپت ذکر کن
- وابستگی‌ها را اول حل کن (dependency-aware ordering)
- اگر بخشی از یکی از تسک‌ها قبلاً done است (pre_done در بالا)، تکرار نکن — فقط روی remaining_parts تمرکز کن
- در commit message: `merged-from: a8e41a8b-31f7-4e4b-bd7d-2b65982a47cf, a3b4e148-5171-4a53-926f-17cce5bfa3d6, 60167e0a-572b-4b14-ba47-812722d8f5aa, b315f6e3-8b82-4eca-b103-ceb96e9f5934, 8b0d273d-5f29-47cd-8d0e-0366911cd716, cbe369a5-7bac-4983-853d-e5d8c18b1412, 43092a7f-819f-40fc-a7e1-5af467f6cba9, 5e17178a-d5f6-4d73-ba0b-b5f0aa93c834`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 8 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این خوشه بر روی جنبه‌های زیرساختی و پیکربندی سیستم تمرکز دارد. شامل همگام‌سازی Migrationها، اصلاح پیکربندی CORS، مدیریت وابستگی‌ها و متغیرهای محیطی، به‌روزرسانی پکیج‌ها برای رفع آسیب‌پذیری‌ها، بهینه‌سازی اتصال به دیتابیس و پیاده‌سازی Feature Flagها و مدیریت زمان‌بندی فراخوانی‌های API خارجی می‌شود.
🎯 theme: پیکربندی و بهینه‌سازی زیرساخت سیستم
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 8
  id: a8e41a8b-31f7-4e4b-bd7d-2b65982a47cf
  عنوان اصلی: همگام‌سازی Migrations با مدل‌های فعلی
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: migrations/README

📋 acceptance_criteria کامل:
  - دستور alembic upgrade head بدون خطا اجرا می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_migrations.py::test_alembic_upgrade_head", "timeout_seconds": 120}]
  - همه جدول‌های مدل‌ها در دیتابیس ایجاد می‌شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_migrations.py::test_all_tables_created", "timeout_seconds": 120}]
  - فایل migration شامل همه مدل‌ها است [verify_method=static] [verify_plan={"grep_patterns": ["User", "Task", "Project", "Notification", "AiModelConfig"], "files_hint": ["migrations/versions/*.py"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
Migrations با مدل‌های فعلی sync نیستند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `migrations/README:1-10` — `README` — فایل README نشان می‌دهد که migrations پیکربندی شده‌اند اما استفاده نشده‌اند
  ```
  Generic single-database configuration.
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
SQLAlchemy + Alembic + PostgreSQL (احتمالی)

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/models/user.py` (سطر 1) — مدل User که باید در migration باشد
- `app/models/task.py` (سطر 1) — مدل Task که باید در migration باشد
- `app/models/project.py` (سطر 1) — مدل Project که باید در migration باشد
- `app/models/notification.py` (سطر 1) — مدل Notification که باید در migration باشد
- `app/models/ai_model_config.py` (سطر 1) — مدل AiModelConfig که باید در migration باشد

## 🌐 نقشهٔ وابستگی‌ها
این مشکل بر کل دیتابیس تأثیر می‌گذارد و بدون آن، پروژه در محیط production قابل اجرا نیست.

## 🔍 Context و وضعیت فعلی
پوشه migrations شامل فایل‌های اولیه Alembic است اما هیچ migration واقعی برای مدل‌های موجود (User, Task, Project, Notification, AiModelConfig) وجود ندارد. مدل‌ها در app/models/ تعریف شده‌اند اما migrations/ خالی است. این یعنی دیتابیس نمی‌تواند با دستور alembic upgrade head ساخته شود و توسعه‌دهندگان مجبور به استفاده از create_all هستند که برای production مناسب نیست.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] دستور alembic upgrade head بدون خطا اجرا می‌شود
- [ ] همه جدول‌های مدل‌ها در دیتابیس ایجاد می‌شوند
- [ ] فایل migration شامل همه مدل‌ها است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک migration اولیه با دستور alembic revision --autogenerate -m 'initial' ایجاد کنید. سپس فایل migration را بررسی و ویرایش کنید تا همه مدل‌ها را پوشش دهد.

## 💡 نمونه‌های قبل/بعد
**ایجاد migration اولیه**

_قبل:_
```
ls migrations/versions/
# خالی
```

_بعد:_
```
ls migrations/versions/
# 0001_initial.py
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `alembic upgrade head`
- `alembic current`
- `python -c 'from app.database import engine; from app.models import Base; Base.metadata.create_all(engine)'`

## ⚠️ ریسک‌ها و موارد احتیاط
اگر دیتابیس production وجود داشته باشد، migration ممکن است با داده‌های موجود conflict داشته باشد

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 8
  id: a3b4e148-5171-4a53-926f-17cce5bfa3d6
  عنوان اصلی: اصلاح پیکربندی CORS
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/main.py

📋 acceptance_criteria کامل:
  - درخواست از دامنه‌های غیرمجاز HTTP 403 برمی‌گرداند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/oversight/status", "headers": {"Origin": "https://evil.com"}, "json_body": null, "expected_status": 403, "required_fields": [], "json_contains": null}]
  - درخواست از دامنه‌های مجاز به درستی پردازش می‌شود [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/oversight/status", "headers": {"Origin": "https://allowed.example.com"}, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null}]
  - لیست دامنه‌های مجاز در environment variable ذخیره شود [verify_method=static] [verify_plan={"grep_patterns": ["ALLOWED_ORIGINS", "os\\.getenv\\("], "files_hint": ["app/main.py"]}]
  - تست واحد برای CORS validation اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_cors.py::test_cors_validation", "timeout_seconds": 60}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
CORS پیکربندی بیش از حد باز (Allow All Origins)

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/main.py:15-20` — `CORS_config` — پیکربندی CORS که باید اصلاح شود
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=['*'],  # ⚠️ خطرناک
      allow_credentials=True,
      allow_methods=['*'],
      allow_headers=['*']
  )
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + Starlette CORS middleware

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `config/settings.py` (سطر 30) — محل مناسب برای ذخیره لیست دامنه‌های مجاز
- `app/config.py` (سطر 25) — فایل کانفیگ اصلی برنامه

## 🌐 نقشهٔ وابستگی‌ها
این تغییر روی تمام endpointهای API تأثیر می‌گذارد و نیاز به هماهنگی با تیم frontend برای تعیین دامنه‌های مجاز دارد.

## 🔍 Context و وضعیت فعلی
در فایل app/main.py (خطوط 15-20)، CORS middleware با allow_origins=['*'] پیکربندی شده است. این پیکربندی به هر دامنه‌ای اجازه می‌دهد به API دسترسی داشته باشد و امکان CSRF (Cross-Site Request Forgery) و data exfiltration را فراهم می‌کند. شواهد: کد موجود در خط 18: `app.add_middleware(CORSMiddleware, allow_origins=['*'], ...)`

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] درخواست از دامنه‌های غیرمجاز HTTP 403 برمی‌گرداند
- [ ] درخواست از دامنه‌های مجاز به درستی پردازش می‌شود
- [ ] لیست دامنه‌های مجاز در environment variable ذخیره شود
- [ ] تست واحد برای CORS validation اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تغییر CORS پیکربندی به allow_origins با لیست سفید دامنه‌های مجاز (مثلاً frontend دامنه) و فعال کردن credentials فقط برای دامنه‌های مشخص.

## 💡 نمونه‌های قبل/بعد
**CORS محدود به دامنه‌های مجاز**

_قبل:_
```
allow_origins=['*']
```

_بعد:_
```
allow_origins=['https://app.lifemanager.com', 'http://localhost:3000']
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_cors.py`
- `curl -H 'Origin: https://evil.com' -H 'Host: localhost:8000' http://localhost:8000/api/tasks -w '%{http_code}'`

## ⚠️ ریسک‌ها و موارد احتیاط
کم؛ فقط نیاز به تغییر یک خط کد و اضافه کردن environment variable

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 8
  id: 60167e0a-572b-4b14-ba47-812722d8f5aa
  عنوان اصلی: تطبیق نسخه‌های وابستگی در requirements.txt
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: requirements.txt

📋 acceptance_criteria کامل:
  - تمام وابستگی‌ها در requirements.txt دارای نسخه دقیق هستند [verify_method=static] [verify_plan={"grep_patterns": ["^[a-zA-Z0-9_\\-]+==[0-9]+\\.[0-9]+\\.[0-9]+"], "files_hint": ["requirements.txt"]}]
  - نصب وابستگی‌ها با pip install -r requirements.txt بدون خطا انجام می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_dependencies.py::test_install_requirements", "timeout_seconds": 120}]
  - برنامه با موفقیت اجرا می‌شود [verify_method=ui_interaction] [verify_plan={"base": "backend", "ui_steps": [{"action": "navigate", "url": "/"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "assert_visible", "selector": "body"}], "expected_api_calls": []}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
عدم تطابق نسخه‌های وابستگی در requirements.txt با محیط اجرا

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `requirements.txt:1-30` — `requirements.txt` — کل فایل requirements.txt نیاز به قفل‌سازی نسخه‌ها دارد
  ```
  fastapi>=0.68.0
  uvicorn>=0.15.0
  sqlalchemy>=1.4.0
  celery>=5.1.0
  ...
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Python 3.9+، FastAPI، SQLAlchemy، Celery

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `Dockerfile` (سطر 10) — از requirements.txt برای نصب وابستگی‌ها استفاده می‌کند
- `docker-compose.yml` (سطر 15) — محیط اجرا را تعریف می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این تغییر روی کل فرآیند نصب وابستگی‌ها در محیط‌های توسعه و تولید تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
فایل requirements.txt شامل وابستگی‌هایی است که ممکن است با نسخه‌های نصب‌شده در Dockerfile یا محیط اجرا ناسازگار باشند. به‌ویژه، نسخه‌های مشخص‌شده برای کتابخانه‌های کلیدی مانند FastAPI، SQLAlchemy، و Celery ممکن است با یکدیگر تداخل داشته باشند. این ناسازگاری می‌تواند باعث خطاهای runtime مانند ImportError یا TypeError شود. شواهد: در requirements.txt، نسخه‌های دقیق مشخص نشده‌اند (مثلاً fastapi>=0.68.0) که می‌تواند منجر به نصب نسخه‌های جدیدتر با APIهای شکسته شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تمام وابستگی‌ها در requirements.txt دارای نسخه دقیق هستند
- [ ] نصب وابستگی‌ها با pip install -r requirements.txt بدون خطا انجام می‌شود
- [ ] برنامه با موفقیت اجرا می‌شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. نسخه‌های دقیق و تست‌شده را در requirements.txt قفل کنید. از pip freeze برای گرفتن نسخه‌های فعلی استفاده کنید و آن‌ها را در فایل قرار دهید. همچنین، از یک فایل requirements.lock یا Pipfile.lock برای مدیریت دقیق‌تر وابستگی‌ها استفاده کنید.

## 💡 نمونه‌های قبل/بعد
**قفل‌سازی نسخه‌ها**

_قبل:_
```
fastapi>=0.68.0
```

_بعد:_
```
fastapi==0.68.1
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pip install -r requirements.txt`
- `python app/main.py`

## ⚠️ ریسک‌ها و موارد احتیاط
کم. ممکن است نیاز به تست مجدد برخی از ویژگی‌ها باشد.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 8
  id: b315f6e3-8b82-4eca-b103-ceb96e9f5934
  عنوان اصلی: افزودن متغیرهای محیطی به .env.example
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: .env.example, app/config.py

📋 acceptance_criteria کامل:
  - تمام متغیرهای محیطی استفاده‌شده در app/config.py در .env.example وجود دارند [verify_method=static] [verify_plan={"grep_patterns": ["DATABASE_URL", "SECRET_KEY", "CELERY_BROKER_URL", "REDIS_URL"], "files_hint": ["app/config.py", ".env.example"]}]
  - هر متغیر دارای یک مقدار پیش‌فرض یا توضیح است [verify_method=static] [verify_plan={"grep_patterns": ["DATABASE_URL=", "SECRET_KEY=", "CELERY_BROKER_URL=", "REDIS_URL="], "files_hint": [".env.example"]}]
  - برنامه با استفاده از .env.example قابل اجرا است [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
متغیرهای محیطی ارجاع‌شده در کد اما در .env.example وجود ندارند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/config.py:1-30` — `Settings` — کلاس Settings که متغیرهای محیطی را تعریف می‌کند
  ```python
  class Settings(BaseSettings):
      DATABASE_URL: str = Field(..., env='DATABASE_URL')
      SECRET_KEY: str = Field(..., env='SECRET_KEY')
      CELERY_BROKER_URL: str = Field(..., env='CELERY_BROKER_URL')
      REDIS_URL: str = Field(..., env='REDIS_URL')
  ```
- `.env.example:1-10` — `.env.example` — فایل .env.example که باید به‌روز شود
  ```
  # این فایل نمونه‌ای از متغیرهای محیطی است
  # DATABASE_URL=postgresql://user:pass@localhost/db
  # SECRET_KEY=your-secret-key
  # CELERY_BROKER_URL=redis://localhost:6379/0
  # REDIS_URL=redis://localhost:6379/1
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Python، Pydantic Settings، FastAPI

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/database.py` (سطر 5) — از DATABASE_URL استفاده می‌کند
- `app/celery_app.py` (سطر 3) — از CELERY_BROKER_URL استفاده می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این تغییر روی راه‌اندازی اولیه پروژه و مستندات تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
در فایل app/config.py، متغیرهای محیطی مانند DATABASE_URL، SECRET_KEY، CELERY_BROKER_URL و REDIS_URL استفاده شده‌اند، اما در فایل .env.example تعریف نشده‌اند. این موضوع باعث می‌شود که توسعه‌دهندگان جدید نتوانند به راحتی محیط توسعه را راه‌اندازی کنند و ممکن است با خطاهای runtime مواجه شوند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تمام متغیرهای محیطی استفاده‌شده در app/config.py در .env.example وجود دارند
- [ ] هر متغیر دارای یک مقدار پیش‌فرض یا توضیح است
- [ ] برنامه با استفاده از .env.example قابل اجرا است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تمام متغیرهای محیطی استفاده‌شده در کد را به فایل .env.example اضافه کنید. برای هر متغیر یک مقدار پیش‌فرض (در صورت امکان) و توضیح کوتاه قرار دهید.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن متغیر به .env.example**

_قبل:_
```
# DATABASE_URL=postgresql://user:pass@localhost/db
```

_بعد:_
```
DATABASE_URL=postgresql://user:pass@localhost/lifemanager
# توضیح: آدرس دیتابیس PostgreSQL
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cp .env.example .env`
- `python app/main.py`

## ⚠️ ریسک‌ها و موارد احتیاط
کم. فقط مستندات و فایل پیکربندی تغییر می‌کند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 8
  id: 8b0d273d-5f29-47cd-8d0e-0366911cd716
  عنوان اصلی: جایگزینی مقادیر حساس در .env.example
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: .env.example

📋 acceptance_criteria کامل:
  - هیچ مقدار واقعی یا نزدیک به واقعی در .env.example وجود نداشته باشد [verify_method=static] [verify_plan={"grep_patterns": ["^(?!.*=.*<.*>).*=.*[a-zA-Z0-9]{8,}", "^(?!.*=.*placeholder).*=.*[a-zA-Z0-9]{8,}"], "files_hint": [".env.example"]}]
  - تمام مقادیر با placeholderهای واضح جایگزین شوند [verify_method=static] [verify_plan={"grep_patterns": ["=.*<[^>]+>", "=.*placeholder", "=.*your_", "=.*YOUR_"], "files_hint": [".env.example"]}]
  - .env.example در production مستقر نشود [verify_method=static] [verify_plan={"grep_patterns": ["\\.env\\.example"], "files_hint": [".dockerignore", ".gitignore", "Dockerfile", "deploy/**/*"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
فایل .env.example حاوی اطلاعات حساس است

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `.env.example:1-20` — `کل فایل` — کل فایل حاوی مقادیر نمونه است
  ```
  DATABASE_URL=postgresql://user:password@localhost:5432/lifemanager
  JWT_SECRET_KEY=your-secret-key-here-change-in-production
  OPENAI_API_KEY=sk-your-openai-api-key
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Python + dotenv

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/config.py` (سطر 1) — متغیرهای محیطی را از .env می‌خواند
- `docker-compose.yml` (سطر 5) — ممکن است از .env استفاده کند
- `.gitignore` (سطر 1) — باید شامل .env باشد

## 🌐 نقشهٔ وابستگی‌ها
این فایل به عنوان راهنما برای توسعه‌دهندگان جدید استفاده می‌شود و مستقیماً در کد استفاده نمی‌شود.

## 🔍 Context و وضعیت فعلی
فایل .env.example در ریشه پروژه حاوی نمونه‌هایی از متغیرهای محیطی با مقادیر پیش‌فرض است. اگرچه این فایل معمولاً برای راهنمایی استفاده می‌شود، اما وجود مقادیر واقعی یا نزدیک به واقعی برای کلیدهای API، رمزهای عبور و توکن‌ها خطرناک است. همچنین اگر .env.example در production مستقر شود، اطلاعات حساس فاش می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ مقدار واقعی یا نزدیک به واقعی در .env.example وجود نداشته باشد
- [ ] تمام مقادیر با placeholderهای واضح جایگزین شوند
- [ ] .env.example در production مستقر نشود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. فایل .env.example را بازبینی کنید و تمام مقادیر حساس را با placeholderهای واضح (مانند YOUR_API_KEY_HERE) جایگزین کنید. اطمینان حاصل کنید که .env.example در .gitignore نیست و در production مستقر نمی‌شود.

## 💡 نمونه‌های قبل/بعد
**پاکسازی .env.example**

_قبل:_
```
DATABASE_URL=postgresql://user:password@localhost:5432/lifemanager
```

_بعد:_
```
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/lifemanager
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cat .env.example | grep -E "(password|secret|key|token|api)"`
- `grep -r "YOUR_" .env.example`

## ⚠️ ریسک‌ها و موارد احتیاط
بدون خطر، فقط نیاز به بازبینی و جایگزینی مقادیر است.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 6 از 8
  id: cbe369a5-7bac-4983-853d-e5d8c18b1412
  عنوان اصلی: به‌روزرسانی dependencies برای رفع آسیب‌پذیری‌ها
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: requirements.txt

📋 acceptance_criteria کامل:
  - تمام dependencies به آخرین ورژن پایدار به‌روزرسانی شوند [verify_method=static] [verify_plan={"grep_patterns": ["Flask==[0-9]+\\.[0-9]+\\.[0-9]+", "SQLAlchemy==[0-9]+\\.[0-9]+\\.[0-9]+"], "files_hint": ["requirements.txt"]}]
  - هیچ آسیب‌پذیری شناخته شده‌ای در dependencies وجود نداشته باشد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
  - تست‌های پروژه پس از به‌روزرسانی پاس شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
ورژن‌های قدیمی dependencies با آسیب‌پذیری‌های شناخته شده

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `requirements.txt:1-30` — `کل فایل` — ورژن‌های قدیمی که نیاز به بررسی دارند
  ```
  Flask==2.0.1
  SQLAlchemy==1.4.22
  requests==2.25.1
  PyJWT==2.1.0
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Python + pip

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `Dockerfile` (سطر 5) — از requirements.txt برای نصب dependencies استفاده می‌کند
- `docker-compose.yml` (سطر 10) — محیط اجرا را مشخص می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این فایل تمام dependencies پروژه را مشخص می‌کند و به‌روزرسانی آن بر کل پروژه تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
بررسی فایل requirements.txt نشان می‌دهد که برخی dependencies دارای ورژن‌های قدیمی با آسیب‌پذیری‌های شناخته شده (CVE) هستند. به عنوان مثال، Flask ممکن است ورژن قدیمی داشته باشد و SQLAlchemy نیز ممکن است نیاز به به‌روزرسانی داشته باشد. این آسیب‌پذیری‌ها می‌توانند منجر به حملات مختلفی مانند SQL injection یا remote code execution شوند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تمام dependencies به آخرین ورژن پایدار به‌روزرسانی شوند
- [ ] هیچ آسیب‌پذیری شناخته شده‌ای در dependencies وجود نداشته باشد
- [ ] تست‌های پروژه پس از به‌روزرسانی پاس شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تمام dependencies را به آخرین ورژن‌های پایدار به‌روزرسانی کنید. از ابزارهایی مانند pip-audit یا safety برای شناسایی خودکار آسیب‌پذیری‌ها استفاده کنید. همچنین می‌توانید از Dependabot یا Renovate برای به‌روزرسانی خودکار استفاده کنید.

## 💡 نمونه‌های قبل/بعد
**به‌روزرسانی Flask**

_قبل:_
```
Flask==2.0.1
```

_بعد:_
```
Flask==2.3.3
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pip-audit -r requirements.txt`
- `safety check -r requirements.txt`
- `pytest`

## ⚠️ ریسک‌ها و موارد احتیاط
به‌روزرسانی dependencies ممکن است باعث شکستن compatibility با کد موجود شود. نیاز به تست کامل دارد.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 8
  id: 43092a7f-819f-40fc-a7e1-5af467f6cba9
  عنوان اصلی: Implement external API call timeouts
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/integration_service.py

📋 acceptance_criteria کامل:
  - External API calls timeout after 30 seconds by default [verify_method=static] [verify_plan={"grep_patterns": ["timeout=30", "timeout=30.0", "httpx.Timeout(30", "aiohttp.ClientTimeout(total=30"], "files_hint": ["app/services/integration_service.py"]}]
  - Timeout value is configurable via environment variable [verify_method=static] [verify_plan={"grep_patterns": ["os.getenv.*TIMEOUT", "environ.get.*TIMEOUT", "settings.*timeout"], "files_hint": ["app/services/integration_service.py"]}]
  - Timeout raises appropriate HTTPException with 504 status [verify_method=static] [verify_plan={"grep_patterns": ["HTTPException.*504", "status_code=504", "status.HTTP_504_GATEWAY_TIMEOUT"], "files_hint": ["app/services/integration_service.py"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
Missing timeout on external API calls in integration service

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/integration_service.py:20-35` — `call_external_api` — External API call without timeout
  ```python
  async with httpx.AsyncClient() as client:
      response = await client.post(url, json=data)  # ⚠️ no timeout
      return response.json()
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + httpx + asyncio

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/config.py` (سطر 50) — Configuration for timeout values
- `app/routes/integrations.py` (سطر 25) — Route that triggers this service

## 🌐 نقشهٔ وابستگی‌ها
Used by all third-party integrations including calendar, email, and webhook services.

## 🔍 Context و وضعیت فعلی
The integration service makes HTTP calls to external services without setting a timeout. This can cause the application to hang indefinitely if the external service is unresponsive, leading to resource exhaustion and denial of service.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] External API calls timeout after 30 seconds by default
- [ ] Timeout value is configurable via environment variable
- [ ] Timeout raises appropriate HTTPException with 504 status
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Add a configurable timeout (default 30 seconds) to all external HTTP calls using httpx or aiohttp client timeout.

## 💡 نمونه‌های قبل/بعد
**Add timeout configuration**

_قبل:_
```
response = await client.post(url, json=data)
```

_بعد:_
```
response = await client.post(url, json=data, timeout=30.0)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_integrations.py -k test_external_api_timeout`
- `curl -X POST http://localhost:8000/api/integrations/test`

## ⚠️ ریسک‌ها و موارد احتیاط
Existing integrations may need longer timeouts; ensure configuration is flexible

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 8 از 8
  id: 5e17178a-d5f6-4d73-ba0b-b5f0aa93c834
  عنوان اصلی: پیاده‌سازی Feature flags در کلاس Settings
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/config.py

📋 acceptance_criteria کامل:
  - کلاس Settings شامل فیلدهای FEATURE_AI_ENABLED و FEATURE_INTEGRATIONS_ENABLED است [verify_method=static] [verify_plan={"grep_patterns": ["FEATURE_AI_ENABLED", "FEATURE_INTEGRATIONS_ENABLED"], "files_hint": ["app/config.py"]}]
  - مقادیر پیش‌فرض False هستند [verify_method=static] [verify_plan={"grep_patterns": ["FEATURE_AI_ENABLED\\s*=\\s*False", "FEATURE_INTEGRATIONS_ENABLED\\s*=\\s*False"], "files_hint": ["app/config.py"]}]
  - می‌توان با متغیر محیطی آن‌ها را true کرد [verify_method=static] [verify_plan={"grep_patterns": ["os\\.getenv\\s*\\(\\s*[\"']FEATURE_AI_ENABLED[\"']", "os\\.getenv\\s*\\(\\s*[\"']FEATURE_INTEGRATIONS_ENABLED[\"']"], "files_hint": ["app/config.py"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
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
Feature flags در کد وجود ندارند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/config.py:1-30` — `Settings` — کلاس Settings باید فیلدهای feature flag را اضافه کند
  ```python
  class Settings(BaseSettings):
      DATABASE_URL: str = Field(..., env='DATABASE_URL')
      SECRET_KEY: str = Field(..., env='SECRET_KEY')
      ...
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + pydantic-settings + Python 3.11

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `config/settings.py` (سطر 1) — تنظیمات ثانویه که باید هماهنگ شوند
- `app/main.py` (سطر 1) — نقطه ورود که باید feature flags را بررسی کند

## 🌐 نقشهٔ وابستگی‌ها
تغییر در config.py بر تمام سرویس‌ها و روترهایی که از تنظیمات استفاده می‌کنند تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
هیچ مکانیزم feature flag در پروژه دیده نمی‌شود. فایل config/settings.py و app/config.py شامل تنظیمات پایه هستند اما هیچ flag برای فعال/غیرفعال کردن ویژگی‌ها (مانند AI یا integration) وجود ندارد. این موضوع باعث می‌شود که اضافه کردن تدریجی ویژگی‌ها یا A/B testing غیرممکن باشد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] کلاس Settings شامل فیلدهای FEATURE_AI_ENABLED و FEATURE_INTEGRATIONS_ENABLED است
- [ ] مقادیر پیش‌فرض False هستند
- [ ] می‌توان با متغیر محیطی آن‌ها را true کرد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک سیستم ساده feature flags با استفاده از متغیرهای محیطی یا یک فایل JSON اضافه کنید. از pydantic-settings برای مدیریت آن‌ها استفاده کنید.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن feature flags به Settings**

_قبل:_
```
class Settings(BaseSettings):
    DATABASE_URL: str
```

_بعد:_
```
class Settings(BaseSettings):
    DATABASE_URL: str
    FEATURE_AI_ENABLED: bool = Field(False, env='FEATURE_AI_ENABLED')
    FEATURE_INTEGRATIONS_ENABLED: bool = Field(False, env='FEATURE_INTEGRATIONS_ENABLED')
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest app/tests/test_config.py -k feature_flags`
- `FEATURE_AI_ENABLED=true python -c 'from app.config import settings; print(settings.FEATURE_AI_ENABLED)'`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییرات backward-compatible هستند و ریسک کمی دارند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 نکات استاندارد (همان bullet هایی که در ساخت پرامپت‌های معمولی پروژه رعایت می‌شود — وراثت کامل، نه کپی):
- ساختار AC ها: acceptance_criteria با verify_method و verify_plan و evidence_locations برای هر AC
- edge cases را در نظر بگیر و در پرامپت ذکر کن
- وابستگی‌ها را اول حل کن (dependency-aware ordering)
- اگر بخشی از یکی از تسک‌ها قبلاً done است (pre_done در بالا)، تکرار نکن — فقط روی remaining_parts تمرکز کن
- در commit message: `merged-from: a8e41a8b-31f7-4e4b-bd7d-2b65982a47cf, a3b4e148-5171-4a53-926f-17cce5bfa3d6, 60167e0a-572b-4b14-ba47-812722d8f5aa, b315f6e3-8b82-4eca-b103-ceb96e9f5934, 8b0d273d-5f29-47cd-8d0e-0366911cd716, cbe369a5-7bac-4983-853d-e5d8c18b1412, 43092a7f-819f-40fc-a7e1-5af467f6cba9, 5e17178a-d5f6-4d73-ba0b-b5f0aa93c834`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. دستور alembic upgrade head بدون خطا اجرا می‌شود _(verify: backend_test)_
2. همه جدول‌های مدل‌ها در دیتابیس ایجاد می‌شوند _(verify: backend_test)_
3. فایل migration شامل همه مدل‌ها است _(verify: static)_
4. درخواست از دامنه‌های غیرمجاز HTTP 403 برمی‌گرداند _(verify: api_response)_
5. درخواست از دامنه‌های مجاز به درستی پردازش می‌شود _(verify: api_response)_
6. لیست دامنه‌های مجاز در environment variable ذخیره شود _(verify: static)_
7. تست واحد برای CORS validation اضافه شود _(verify: backend_test)_
8. تمام وابستگی‌ها در requirements.txt دارای نسخه دقیق هستند _(verify: static)_
9. نصب وابستگی‌ها با pip install -r requirements.txt بدون خطا انجام می‌شود _(verify: backend_test)_
10. برنامه با موفقیت اجرا می‌شود _(verify: ui_interaction)_
11. تمام متغیرهای محیطی استفاده‌شده در app/config.py در .env.example وجود دارند _(verify: static)_
12. هر متغیر دارای یک مقدار پیش‌فرض یا توضیح است _(verify: static)_
13. برنامه با استفاده از .env.example قابل اجرا است _(verify: manual_only)_
14. هیچ مقدار واقعی یا نزدیک به واقعی در .env.example وجود نداشته باشد _(verify: static)_
15. تمام مقادیر با placeholderهای واضح جایگزین شوند _(verify: static)_
16. .env.example در production مستقر نشود _(verify: static)_
17. تمام dependencies به آخرین ورژن پایدار به‌روزرسانی شوند _(verify: static)_
18. هیچ آسیب‌پذیری شناخته شده‌ای در dependencies وجود نداشته باشد _(verify: manual_only)_
19. تست‌های پروژه پس از به‌روزرسانی پاس شوند _(verify: backend_test)_
20. کلاس Settings شامل فیلدهای FEATURE_AI_ENABLED و FEATURE_INTEGRATIONS_ENABLED است _(verify: static)_
21. مقادیر پیش‌فرض False هستند _(verify: static)_
22. می‌توان با متغیر محیطی آن‌ها را true کرد _(verify: static)_
23. External API calls timeout after 30 seconds by default _(verify: static)_
24. Timeout value is configurable via environment variable _(verify: static)_
25. Timeout raises appropriate HTTPException with 504 status _(verify: static)_

## Task Steps

### Step 1: بررسی اولیه خودکار و جلوگیری از پیاده‌سازی مجدد قابلیت‌های موجود
**Status:** `done` (100%)
**Scope:** این بخش یک یادداشت مهم برای مدل اجراکننده است و شامل دستورالعمل‌های پیش از اجرا می‌باشد. محتوای آن دستور می‌دهد که قبل از هر تغییری، ساختار repo، فایل‌های ذکرشده و وابستگی‌ها مستقل بررسی شوند. اگر قابلیتی از قبل وجود دارد، نباید دوباره ساخته شود. این بخش شامل لیست شماره‌دار با ≥۳ آیتم نیست و صرفاً یک هشدار/دستورالعمل است. خروجی این بخش باید یک مرحله اجرایی باشد که شامل بررسی وجود فایل‌ها و قابلیت‌های قبلی است.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.
```

### Step 2: همگام‌سازی Migrations با مدل‌های فعلی دیتابیس
**Status:** `done` (100%)
**Scope:** این بخش شامل بررسی و رفع عدم همگام‌سازی بین فایل‌های migration موجود و مدل‌های SQLAlchemy در پروژه است. تمرکز بر روی مدل‌های تعریف‌شده در app/models/ (user, task, project, notification, ai_model_config) و فایل database.py است. خارج از scope: تغییر در منطق business، اضافه کردن مدل جدید، یا تغییر در پیکربندی Alembic.
**Excerpt:**
```
Migrations با مدل‌های فعلی sync نیستند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `migrations/README:1-10` — `README` — فایل README نشان می‌دهد که migrations پیکربندی شده‌اند اما استفاده نشده‌اند
  ```
  Generic single-database configuration.
  ```
```

### Step 3: ایجاد migration اولیه برای مدل‌های موجود با استفاده از Alembic
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد یک migration اولیه (initial migration) با استفاده از Alembic است که تمام مدل‌های موجود (User, Task, Project, Notification, AiModelConfig) را به صورت خودکار تشخیص داده و اسکریپت migration مربوطه را تولید می‌کند. خارج از scope این مرحله: اجرای migration روی دیتابیس (alembic upgrade head)، تست migration، یا تغییر در مدل‌ها. نکته حیاتی: این مرحله فرض می‌کند که Alembic از قبل پیکربندی شده است (فایل alembic.ini و env.py وجود دارد) و مدل‌ها در app.models ایمپورت شده‌اند.
**Excerpt:**
```
پوشه migrations شامل فایل‌های اولیه Alembic است اما هیچ migration واقعی برای مدل‌های موجود (User, Task, Project, Notification, AiModelConfig) وجود ندارد. مدل‌ها در app/models/ تعریف شده‌اند اما migrations/ خالی است. این یعنی دیتابیس نمی‌تواند با دستور alembic upgrade head ساخته شود و توسعه‌دهندگان مجبور به استفاده از create_all هستند که برای production مناسب نیست.
```

### Step 4: ایجاد و تأیید migration اولیه Alembic برای همه مدل‌ها
**Status:** `done` (100%)
**Scope:** این بخش شامل ایجاد یک migration اولیه با دستور `alembic revision --autogenerate -m 'initial'` و سپس بررسی و ویرایش فایل migration برای پوشش همه مدل‌ها (User, Task, Project, Notification, AiModelConfig) است. همچنین شامل اجرای `alembic upgrade head` و تأیید ایجاد همه جدول‌ها در دیتابیس می‌شود. خارج از scope: اجرای تست‌ها، linter و type-check (این موارد در AC ذکر شده‌اند اما بخشی از این مرحله نیستند). نکته حیاتی: فایل migration باید دستی بررسی شود تا مطمئن شویم همه مدل‌ها و روابط آنها به درستی منعکس شده‌اند.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] دستور alembic upgrade head بدون خطا اجرا می‌شود
- [ ] همه جدول‌های مدل‌ها در دیتابیس ایجاد می‌شوند
- [ ] فایل migration شامل همه مدل‌ها است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک migration اولیه با دستور alembic revision --autogenerate -m 'initial' ایجاد کنید. سپس فایل migration را بررسی و ویرایش کنید تا همه مدل‌ها را پوشش دهد.
```

### Step 5: ایجاد migration اولیه برای مدل‌های دیتابیس
**Status:** `done` (100%)
**Scope:** این بخش شامل ایجاد اولین فایل migration (initial migration) برای مدل‌های تعریف‌شده در app/models/ است. خروجی مورد انتظار وجود فایل 0001_initial.py در مسیر migrations/versions/ است. این بخش شامل تغییر کد در فایل‌های مدل یا database.py نیست و صرفاً به تولید فایل migration با استفاده از Alembic اشاره دارد.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**ایجاد migration اولیه**

_قبل:_
```
ls migrations/versions/
# خالی
```

_بعد:_
```
ls migrations/versions/
# 0001_initial.py
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 6: اصلاح پیکربندی CORS برای مسدودسازی دامنه‌های غیرمجاز
**Status:** `done` (100%)
**Scope:** این مرحله شامل اصلاح فایل app/main.py برای اعمال محدودیت CORS بر اساس متغیر محیطی ALLOWED_ORIGINS است. دامنه‌های غیرمجاز باید HTTP 403 دریافت کنند و دامنه‌های مجاز (مانند https://allowed.example.com) به درستی پردازش شوند. تست واحد مربوطه در tests/test_cors.py نیز باید اضافه شود. ریسک اصلی تداخل با دیتابیس production در migration است که در این مرحله مستقیماً اعمال نمی‌شود.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
اگر دیتابیس production وجود داشته باشد، migration ممکن است با داده‌های موجود conflict داشته باشد

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 8
  id: a3b4e148-5171-4a53-926f-17cce5bfa3d6
  عنوان اصلی: اصلاح پیکربندی CORS
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/main.py

📋 acceptance_criteria کامل:
  - درخواست از دامنه‌های غیرمجاز HTTP 403 برمی‌گرداند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/oversight/status", "headers": {"Origin": "https://evil.com"}, "json_body": null, "expected_status": 403, "required_fields": [], "json_contains": null}]
  - درخواست از دامنه‌های مجاز به درستی پردازش می‌شود [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/oversight/status", "headers": {"Origin": "https://allowed.example.com"}, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null}]
  - لیست دامنه‌های مجاز در environment variable ذخیره شود [verify_method=static] [verify_plan={"grep_patterns": ["ALLOWED_ORIGINS", "os\\.getenv\\("], "files_hint": ["app/main.py"]}]
  - تست واحد برای CORS validation اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_cors.py::test_cors_validation", "timeout_seconds": 60}]
```

### Step 7: بررسی و اعتبارسنجی اولیه پیش از اجرا — اطمینان از عدم پیاده‌سازی قبلی و صحت مسیرها
**Status:** `done` (100%)
**Scope:** این بخش یک مرحلهٔ پیش‌نیاز (pre-flight check) است که پیش از هر تغییر اجرایی انجام می‌شود. شامل: (۱) جستجوی grep برای یافتن پیاده‌سازی‌های موجود مرتبط با این درخواست، (۲) بررسی فایل‌های ذکرشده در مسیرها و کلاس‌ها برای تأیید وجود/عدم وجود کد، (۳) تصمیم‌گیری در مورد نیاز به تغییر یا no-op. خارج از scope: اجرای واقعی تغییرات، نوشتن کد جدید، اصلاح فایل‌ها.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.
```

### Step 8: اصلاح پیکربندی CORS برای محدود کردن دامنه‌های مجاز
**Status:** `done` (100%)
**Scope:** این بخش شامل اصلاح پیکربندی CORS در فایل app/main.py است. هدف جایگزینی allow_origins=['*'] با لیست مشخصی از دامنه‌های مجاز (مانند دامنه فرانت‌اند) و غیرفعال کردن allow_credentials=True در صورت استفاده از wildcard است. این مرحله شامل تغییرات در خطوط 15-20 فایل main.py می‌شود و نیازی به تغییر در سایر فایل‌ها یا تست‌ها ندارد.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
CORS پیکربندی بیش از حد باز (Allow All Origins)

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/main.py:15-20` — `CORS_config` — پیکربندی CORS که باید اصلاح شود
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=['*'],  # ⚠️ خطرناک
      allow_credentials=True,
      allow_methods=['*'],
      allow_headers=['*']
  )
  ```
```

### Step 9: پیکربندی CORS با دامنه‌های مجاز به جای allow_origins=['*']
**Status:** `done` (100%)
**Scope:** این مرحله شامل جایگزینی مقدار allow_origins=['*'] در CORS middleware فایل app/main.py با لیست دامنه‌های مجاز ذخیره‌شده در فایل کانفیگ (app/config.py یا config/settings.py) است. خارج از scope: تعیین لیست نهایی دامنه‌ها (نیاز به هماهنگی با تیم frontend دارد)، تغییر سایر تنظیمات CORS (مانند allow_methods یا allow_headers). نکته حیاتی: فایل config/settings.py در لیست مسیرهای داده‌شده نیست، بنابراین باید از app/config.py استفاده شود.
**Excerpt:**
```
## 🔍 Context و وضعیت فعلی
در فایل app/main.py (خطوط 15-20)، CORS middleware با allow_origins=['*'] پیکربندی شده است. این پیکربندی به هر دامنه‌ای اجازه می‌دهد به API دسترسی داشته باشد و امکان CSRF (Cross-Site Request Forgery) و data exfiltration را فراهم می‌کند. شواهد: کد موجود در خط 18: `app.add_middleware(CORSMiddleware, allow_origins=['*'], ...)`

## 🔗 فایل‌های مرتبط (Cross-references)
- `config/settings.py` (سطر 30) — محل مناسب برای ذخیره لیست دامنه‌های مجاز
- `app/config.py` (سطر 25) — فایل کانفیگ اصلی برنامه
```

### Step 10: پیاده‌سازی CORS با لیست سفید دامنه‌های مجاز و تست‌های رفتار-محور
**Status:** `done` (100%)
**Scope:** این مرحله شامل تغییر پیکربندی CORS در app/main.py برای استفاده از allow_origins با لیست سفید دامنه‌های مجاز (خوانده شده از environment variable) و فعال کردن credentials فقط برای دامنه‌های مشخص است. همچنین شامل افزودن تست واحد در tests/test_cors.py برای تأیید رفتارهای HTTP 403 برای دامنه‌های غیرمجاز و پردازش صحیح دامنه‌های مجاز می‌شود. خارج از scope: تغییرات در مدل‌ها، migrations، یا سایر فایل‌های غیر از main.py و test_cors.py.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] درخواست از دامنه‌های غیرمجاز HTTP 403 برمی‌گرداند
- [ ] درخواست از دامنه‌های مجاز به درستی پردازش می‌شود
- [ ] لیست دامنه‌های مجاز در environment variable ذخیره شود
- [ ] تست واحد برای CORS validation اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تغییر CORS پیکربندی به allow_origins با لیست سفید دامنه‌های مجاز (مثلاً frontend دامنه) و فعال کردن credentials فقط برای دامنه‌های مشخص.
```

### Step 11: محدودسازی CORS به دامنه‌های مجاز در app/main.py
**Status:** `done` (100%)
**Scope:** این بخش صرفاً به تغییر پیکربندی CORS در فایل app/main.py مربوط است. شامل جایگزینی allow_origins=['*'] با لیست مشخصی از دامنه‌های مجاز (https://app.lifemanager.com و http://localhost:3000) می‌شود. هیچ تغییر دیگری در کد یا فایل‌های دیگر مدنظر نیست.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**CORS محدود به دامنه‌های مجاز**

_قبل:_
```
allow_origins=['*']
```

_بعد:_
```
allow_origins=['https://app.lifemanager.com', 'http://localhost:3000']
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 12: تطبیق نسخه‌های وابستگی در requirements.txt
**Status:** `partial` (90%)
**Scope:** این مرحله شامل به‌روزرسانی فایل requirements.txt برای اطمینان از اینکه تمام وابستگی‌ها دارای نسخه دقیق (مثلاً package==1.2.3) هستند، می‌باشد. همچنین شامل اجرای pip install -r requirements.txt برای تأیید نصب بدون خطا و اجرای برنامه برای تأیید عملکرد صحیح است. خارج از این مرحله: تغییرات در کد برنامه، پیکربندی محیط، یا سایر فایل‌ها.
**Excerpt:**
```
تسک 3 از 8
  id: 60167e0a-572b-4b14-ba47-812722d8f5aa
  عنوان اصلی: تطبیق نسخه‌های وابستگی در requirements.txt
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: requirements.txt

📋 acceptance_criteria کامل:
  - تمام وابستگی‌ها در requirements.txt دارای نسخه دقیق هستند [verify_method=static] [verify_plan={"grep_patterns": ["^[a-zA-Z0-9_\\-]+==[0-9]+\\.[0-9]+\\.[0-9]+"], "files_hint": ["requirements.txt"]}]
  - نصب وابستگی‌ها با pip install -r requirements.txt بدون خطا انجام می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_dependencies.py::test_install_requirements", "timeout_seconds": 120}]
  - برنامه با موفقیت اجرا می‌شود [verify_method=ui_interaction] [verify_plan={"base": "backend", "ui_steps": [{"action": "navigate", "url": "/"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "assert_visible", "selector": "body"}], "expected_api_calls": []}]
```

### Step 13: بررسی و اعتبارسنجی اولیه پیش از اجرا — جلوگیری از پیاده‌سازی مجدد و تشخیص خطاهای پرامپت
**Status:** `done` (100%)
**Scope:** این بخش یک مرحله پیش‌نیاز (pre-flight check) است که پیش از هر تغییر اجرایی در repo انجام می‌شود. شامل: جستجوی grep برای وجود فایل‌ها/کلاس‌ها/توابع ذکرشده در پرامپت، بررسی کامل فایل‌های مرتبط (به‌ویژه app/models/ai_model_config.py و tests/test_migrations.py)، و تصمیم‌گیری در مورد نیاز به تغییر یا no-op. خارج از scope: اجرای واقعی تغییرات، نوشتن کد جدید، یا اصلاح باگ — این مرحله فقط تشخیص و گزارش است.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در commit message توضیح بده.
```

### Step 14: قفل‌سازی نسخه‌های وابستگی در requirements.txt برای تطابق با محیط اجرا
**Status:** `partial` (80%)
**Scope:** این مرحله شامل بازنویسی کامل فایل requirements.txt با نسخه‌های دقیق (pinned) برای تمام وابستگی‌های موجود است. وابستگی‌های فعلی (fastapi>=0.68.0, uvicorn>=0.15.0, sqlalchemy>=1.4.0, celery>=5.1.0) باید با نسخه‌های مشخص و تست‌شده جایگزین شوند. خارج از scope: اضافه کردن وابستگی‌های جدید، تغییر کد پایتون، یا اصلاح فایل‌های دیگر. نکته حیاتی: نسخه‌های دقیق باید با محیط اجرای فعلی (Python 3.9+) سازگار باشند.
**Excerpt:**
```
عدم تطابق نسخه‌های وابستگی در requirements.txt با محیط اجرا

- `requirements.txt:1-30` — `requirements.txt` — کل فایل requirements.txt نیاز به قفل‌سازی نسخه‌ها دارد
  ```
  fastapi>=0.68.0
  uvicorn>=0.15.0
  sqlalchemy>=1.4.0
  celery>=5.1.0
  ...
  ```
```

### Step 15: رفع ناسازگاری نسخه‌های وابستگی‌ها در requirements.txt
**Status:** `done` (100%)
**Scope:** این بخش شامل بررسی و اصلاح فایل requirements.txt برای رفع ناسازگاری‌های احتمالی بین نسخه‌های FastAPI، SQLAlchemy، Celery و سایر وابستگی‌ها است. محدوده شامل تعیین نسخه‌های دقیق و سازگار برای جلوگیری از خطاهای runtime مانند ImportError یا TypeError می‌شود. خارج از محدوده: تغییر Dockerfile یا docker-compose.yml (فقط به‌عنوان مرجع ذکر شده‌اند). نکته حیاتی: باید از سازگاری متقابل کتابخانه‌ها با یکدیگر و با Python 3.9+ اطمینان حاصل شود.
**Excerpt:**
```
فایل requirements.txt شامل وابستگی‌هایی است که ممکن است با نسخه‌های نصب‌شده در Dockerfile یا محیط اجرا ناسازگار باشند. به‌ویژه، نسخه‌های مشخص‌شده برای کتابخانه‌های کلیدی مانند FastAPI، SQLAlchemy، و Celery ممکن است با یکدیگر تداخل داشته باشند. این ناسازگاری می‌تواند باعث خطاهای runtime مانند ImportError یا TypeError شود. شواهد: در requirements.txt، نسخه‌های دقیق مشخص نشده‌اند (مثلاً fastapi>=0.68.0) که می‌تواند منجر به نصب نسخه‌های جدیدتر با APIهای شکسته شود.
```

### Step 16: قفل‌سازی نسخه‌های دقیق وابستگی‌ها در requirements.txt
**Status:** `partial` (90%)
**Scope:** این مرحله شامل قفل‌سازی تمام وابستگی‌های پروژه با نسخه‌های دقیق (مثلاً package==1.2.3) در فایل requirements.txt است. از دستور pip freeze برای استخراج نسخه‌های فعلی استفاده می‌شود. همچنین ایجاد یک فایل قفل اضافی (مانند requirements.lock یا Pipfile.lock) برای مدیریت دقیق‌تر وابستگی‌ها در نظر گرفته شده است. خارج از scope: تغییر کد برنامه، تست‌ها، یا پیکربندی linter/type-checker.
— [merged] این مرحله شامل جایگزینی تمام وابستگی‌های موجود در فایل requirements.txt با نسخه‌های دقیق (==) به جای محدوده‌های باز (>=, <=, ~=) است. فقط فایل requirements.txt هدف است و نه فایل‌های دیگر. خروجی شامل یک commit یا PR با پیام واضح است.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تمام وابستگی‌ها در requirements.txt دارای نسخه دقیق هستند
- [ ] نصب وابستگی‌ها با pip install -r requirements.txt بدون خطا انجام می‌شود
- [ ] برنامه با موفقیت اجرا می‌شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. نسخه‌های دقیق و تست‌شده را در requirements.txt قفل کنید. از pip freeze برای گرفتن نسخه‌های فعلی استفاده کنید و آن‌ها را در فایل قرار دهید. همچنین، از یک فایل requirements.lock یا Pipfile.lock برای مدیریت دقیق‌تر وابستگی‌ها استفاده کنید.
```

### Step 17: افزودن متغیرهای محیطی به .env.example
**Status:** `done` (100%)
**Scope:** این بخش شامل افزودن تمام متغیرهای محیطی استفاده‌شده در app/config.py به فایل .env.example است. هر متغیر باید دارای یک مقدار پیش‌فرض یا توضیح باشد. فایل‌های دخیل: .env.example و app/config.py. این مرحله بخشی از تسک 4 از 8 با اولویت high است.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
کم. ممکن است نیاز به تست مجدد برخی از ویژگی‌ها باشد.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 8
  id: b315f6e3-8b82-4eca-b103-ceb96e9f5934
  عنوان اصلی: افزودن متغیرهای محیطی به .env.example
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: .env.example, app/config.py

📋 acceptance_criteria کامل:
  - تمام متغیرهای محیطی استفاده‌شده در app/config.py در .env.example وجود دارند [verify_method=static] [verify_plan={"grep_patterns": ["DATABASE_URL", "SECRET_KEY", "CELERY_BROKER_URL", "REDIS_URL"], "files_hint": ["app/config.py", ".env.example"]}]
  - هر متغیر دارای یک مقدار پیش‌فرض یا توضیح است [verify_method=static] [verify_plan={"grep_patterns": ["DATABASE_URL=", "SECRET_KEY=", "CELERY_BROKER_URL=", "REDIS_URL="], "files_hint": [".env.example"]}]
  - برنامه با استفاده از .env.example قابل اجرا است [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
```

### Step 18: بررسی و اعتبارسنجی پیش‌نیازهای اجرایی قبل از شروع پیاده‌سازی
**Status:** `done` (100%)
**Scope:** این بخش یک یادداشت اجباری برای مدل اجراکننده است که شامل دستورالعمل‌های عمومی برای بررسی وجود پیاده‌سازی قبلی، اعتبارسنجی مستقل ساختار repo، و تفسیر معیارهای پذیرش می‌باشد. این بخش هیچ مرحله اجرایی مستقیمی ندارد و صرفاً چارچوب رفتاری را تعیین می‌کند. خارج از scope: هیچ فایل یا کلاسی مستقیماً تغییر نمی‌کند.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.
```

### Step 19: به‌روزرسانی فایل .env.example با متغیرهای محیطی گمشده از کلاس Settings
**Status:** `done` (100%)
**Scope:** این مرحله شامل شناسایی متغیرهای محیطی تعریف‌شده در کلاس Settings (فایل app/config.py) که در فایل .env.example وجود ندارند و افزودن آنها به .env.example است. متغیرهای موجود در .env.example که در Settings نیستند، حذف نمی‌شوند. فقط متغیرهای گمشده اضافه می‌شوند. فایل .env واقعی تغییر نمی‌کند.
**Excerpt:**
```
متغیرهای محیطی ارجاع‌شده در کد اما در .env.example وجود ندارند

- `app/config.py:1-30` — `Settings` — کلاس Settings که متغیرهای محیطی را تعریف می‌کند
  ```python
  class Settings(BaseSettings):
      DATABASE_URL: str = Field(..., env='DATABASE_URL')
      SECRET_KEY: str = Field(..., env='SECRET_KEY')
      CELERY_BROKER_URL: str = Field(..., env='CELERY_BROKER_URL')
      REDIS_URL: str = Field(..., env='REDIS_URL')
  ```
- `.env.example:1-10` — `.env.example` — فایل .env.example که باید به‌روز شود
  ```
  # این فایل نمونه‌ای از متغیرهای محیطی است
  # DATABASE_URL=postgresql://user:pass@localhost/db
  # SECRET_KEY=your-secret-key
  # CELERY_BROKER_URL=redis://localhost:6379/0
  # REDIS_URL=redis://localhost:6379/1
  ```
```

### Step 20: اضافه کردن متغیرهای محیطی گمشده به فایل .env.example
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن متغیرهای محیطی DATABASE_URL، SECRET_KEY، CELERY_BROKER_URL و REDIS_URL به فایل .env.example است. این مرحله شامل تغییر در فایل app/config.py یا هر فایل دیگر نمی‌شود. فقط فایل .env.example باید به‌روزرسانی شود. مقادیر پیش‌فرض باید به‌گونه‌ای باشند که برای محیط توسعه محلی مناسب باشند.
**Excerpt:**
```
در فایل app/config.py، متغیرهای محیطی مانند DATABASE_URL، SECRET_KEY، CELERY_BROKER_URL و REDIS_URL استفاده شده‌اند، اما در فایل .env.example تعریف نشده‌اند. این موضوع باعث می‌شود که توسعه‌دهندگان جدید نتوانند به راحتی محیط توسعه را راه‌اندازی کنند و ممکن است با خطاهای runtime مواجه شوند.
```

### Step 21: اضافه کردن تمام متغیرهای محیطی به .env.example با مقادیر پیش‌فرض و توضیحات
**Status:** `done` (100%)
**Scope:** این مرحله شامل شناسایی تمام متغیرهای محیطی استفاده‌شده در app/config.py و اضافه کردن آن‌ها به فایل .env.example است. هر متغیر باید دارای یک مقدار پیش‌فرض (در صورت امکان) و توضیح کوتاه باشد. این مرحله شامل تغییر در کد اصلی برنامه یا تست‌ها نمی‌شود. خروجی این مرحله یک فایل .env.example کامل و قابل استفاده است.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تمام متغیرهای محیطی استفاده‌شده در app/config.py در .env.example وجود دارند
- [ ] هر متغیر دارای یک مقدار پیش‌فرض یا توضیح است
- [ ] برنامه با استفاده از .env.example قابل اجرا است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تمام متغیرهای محیطی استفاده‌شده در کد را به فایل .env.example اضافه کنید. برای هر متغیر یک مقدار پیش‌فرض (در صورت امکان) و توضیح کوتاه قرار دهید.
```

### Step 22: اضافه کردن متغیر DATABASE_URL به .env.example با توضیح
**Status:** `done` (100%)
**Scope:** این بخش شامل افزودن متغیر محیطی DATABASE_URL به فایل .env.example است. متغیر باید از حالت کامنت‌شده خارج شود و مقدار پیش‌فرض lifemanager به آن اختصاص یابد. همچنین یک توضیح کوتاه به صورت کامنت در خط بعدی اضافه می‌شود. این مرحله صرفاً مربوط به فایل .env.example است و شامل تغییر در کد اصلی یا فایل‌های پیکربندی دیگر نمی‌شود.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**اضافه کردن متغیر به .env.example**

_قبل:_
```
# DATABASE_URL=postgresql://user:pass@localhost/db
```

_بعد:_
```
DATABASE_URL=postgresql://user:pass@localhost/lifemanager
# توضیح: آدرس دیتابیس PostgreSQL
```
```

### Step 23: جایگزینی مقادیر حساس در .env.example با placeholderهای واضح
**Status:** `done` (100%)
**Scope:** این مرحله شامل بازبینی و ویرایش فایل .env.example است تا تمام مقادیر واقعی یا نزدیک به واقعی (مانند رمز عبور، کلید API، توکن‌ها) با placeholderهای واضح و غیرقابل استفاده جایگزین شوند. همچنین باید اطمینان حاصل شود که فایل .env.example در محیط production مستقر نمی‌شود (بررسی فایل‌های .dockerignore, .gitignore, Dockerfile, deploy/**/*). این مرحله صرفاً تغییر مستندات و فایل پیکربندی است و هیچ تغییری در کد اصلی یا منطق برنامه ایجاد نمی‌کند.
**Excerpt:**
```
تسک 5 از 8
  id: 8b0d273d-5f29-47cd-8d0e-0366911cd716
  عنوان اصلی: جایگزینی مقادیر حساس در .env.example
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: .env.example

📋 acceptance_criteria کامل:
  - هیچ مقدار واقعی یا نزدیک به واقعی در .env.example وجود نداشته باشد [verify_method=static] [verify_plan={"grep_patterns": ["^(?!.*=.*<.*>).*=.*[a-zA-Z0-9]{8,}", "^(?!.*=.*placeholder).*=.*[a-zA-Z0-9]{8,}"], "files_hint": [".env.example"]}]
  - تمام مقادیر با placeholderهای واضح جایگزین شوند [verify_method=static] [verify_plan={"grep_patterns": ["=.*<[^>]+>", "=.*placeholder", "=.*your_", "=.*YOUR_"], "files_hint": [".env.example"]}]
  - .env.example در production مستقر نشود [verify_method=static] [verify_plan={"grep_patterns": ["\\.env\\.example"], "files_hint": [".dockerignore", ".gitignore", "Dockerfile", "deploy/**/*"]}]
```

### Step 24: بررسی اولیه خودکار و جلوگیری از پیاده‌سازی مجدد
**Status:** `pending` (0%)
**Scope:** این بخش یک یادداشت هشداردهنده برای مدل اجراکننده است که قبل از شروع هر تغییری باید بررسی کند که آیا قابلیت‌های درخواستی قبلاً پیاده‌سازی شده‌اند یا خیر. شامل دستورالعمل‌هایی برای جستجو در repo، عدم بازسازی موارد موجود، و ثبت کامیت توضیحی در صورت عدم نیاز به تغییر است. همچنین بر مسئولیت مدل اجراکننده برای بررسی مستقل ساختار repo و فایل‌ها تأکید دارد. این بخش خود یک مرحله اجرایی نیست، بلکه یک پیش‌شرط برای تمام مراحل بعدی است.
— [merged] این بخش یک یادداشت مهم برای مدل اجراکننده است که پیش از هر تغییری باید repo را به‌طور مستقل بررسی کند. شامل دستورالعمل‌هایی برای جستجوی پیاده‌سازی‌های قبلی، عدم بازسازی قابلیت‌های موجود، و ثبت کامیت no-op در صورت کامل بودن کار است. همچنین مسئولیت مدل را برای قضاوت مستقل در صورت ابهام یا خطا در پرامپت مشخص می‌کند. این بخش هیچ مرحله اجرایی مستقیمی ندارد و صرفاً یک راهنمای رفتاری است.
**Excerpt:**
```
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
```

### Step 25: حذف اطلاعات حساس از فایل .env.example
**Status:** `done` (100%)
**Scope:** این مرحله شامل بازبینی و اصلاح فایل .env.example در ریشه پروژه است. هدف حذف کامل مقادیر واقعی یا نمونه‌ای که شبیه مقادیر واقعی هستند (مانند رمز عبور، کلیدهای API، کلیدهای JWT) و جایگزینی آنها با placeholderهای generic و غیرحساس. این مرحله شامل تغییر فایل‌های دیگر یا پیکربندی runtime نیست.
**Excerpt:**
```
فایل .env.example حاوی اطلاعات حساس است

- `.env.example:1-20` — `کل فایل` — کل فایل حاوی مقادیر نمونه است
  ```
  DATABASE_URL=postgresql://user:password@localhost:5432/lifemanager
  JWT_SECRET_KEY=your-secret-key-here-change-in-production
  OPENAI_API_KEY=sk-your-openai-api-key
  ```
```

### Step 26: پاکسازی و ایمن‌سازی فایل .env.example از مقادیر واقعی و حساس
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی و اصلاح فایل .env.example در ریشه پروژه است. هدف حذف یا جایگزینی تمام مقادیر واقعی کلیدهای API، رمزهای عبور، توکن‌ها و سایر اطلاعات حساس با مقادیر ساختگی یا پیش‌فرض امن است. همچنین اطمینان از اینکه فایل .env در .gitignore قرار دارد تا از commit شدن آن جلوگیری شود. این مرحله شامل تغییر در فایل‌های app/config.py یا docker-compose.yml نمی‌شود.
**Excerpt:**
```
فایل .env.example در ریشه پروژه حاوی نمونه‌هایی از متغیرهای محیطی با مقادیر پیش‌فرض است. اگرچه این فایل معمولاً برای راهنمایی استفاده می‌شود، اما وجود مقادیر واقعی یا نزدیک به واقعی برای کلیدهای API، رمزهای عبور و توکن‌ها خطرناک است. همچنین اگر .env.example در production مستقر شود، اطلاعات حساس فاش می‌شود.
```

### Step 27: پاکسازی فایل .env.example از مقادیر واقعی و جایگزینی با placeholderهای واضح
**Status:** `done` (100%)
**Scope:** این مرحله صرفاً به فایل .env.example اختصاص دارد. شامل بازبینی تمام مقادیر حساس (API Keyها، توکن‌ها، رمزهای عبور، URLهای واقعی) و جایگزینی آنها با placeholderهای توصیفی مانند YOUR_API_KEY_HERE می‌شود. اطمینان از اینکه .env.example در .gitignore نیست و در production مستقر نمی‌شود نیز بخشی از این مرحله است. خارج از scope: تغییر فایل .env واقعی، تغییر کدهای برنامه، اجرای تست‌ها یا linter.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ مقدار واقعی یا نزدیک به واقعی در .env.example وجود نداشته باشد
- [ ] تمام مقادیر با placeholderهای واضح جایگزین شوند
- [ ] .env.example در production مستقر نشود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. فایل .env.example را بازبینی کنید و تمام مقادیر حساس را با placeholderهای واضح (مانند YOUR_API_KEY_HERE) جایگزین کنید. اطمینان حاصل کنید که .env.example در .gitignore نیست و در production مستقر نمی‌شود.
```

### Step 28: پاکسازی فایل .env.example با جایگزینی مقادیر واقعی با placeholder
**Status:** `done` (100%)
**Scope:** این مرحله فقط شامل ویرایش فایل .env.example در ریشه پروژه است. محتوای فایل باید به‌روزرسانی شود تا مقادیر حساس (مانند رمز عبور) با placeholderهای عمومی (مانند YOUR_USER, YOUR_PASSWORD) جایگزین شوند. سایر فایل‌ها یا پیکربندی‌ها تحت تأثیر قرار نمی‌گیرند.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**پاکسازی .env.example**

_قبل:_
```
DATABASE_URL=postgresql://user:password@localhost:5432/lifemanager
```

_بعد:_
```
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/lifemanager
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 29: به‌روزرسانی dependencies برای رفع آسیب‌پذیری‌ها
**Status:** `pending` (0%)
**Scope:** این مرحله شامل به‌روزرسانی تمام dependencies در فایل requirements.txt به آخرین ورژن پایدار است. هیچ ریسک خاصی وجود ندارد و فقط نیاز به بازبینی و جایگزینی مقادیر است. مرحله مستقل بوده و وابستگی به تسک دیگری ندارد. اولویت بالا و تخمین زمان کوچک دارد.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
بدون خطر، فقط نیاز به بازبینی و جایگزینی مقادیر است.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 6 از 8
  id: cbe369a5-7bac-4983-853d-e5d8c18b1412
  عنوان اصلی: به‌روزرسانی dependencies برای رفع آسیب‌پذیری‌ها
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: requirements.txt

📋 acceptance_criteria کامل:
  - تمام dependencies به آخرین ورژن پایدار به‌روزرسانی شوند [verify_method=static] [verify_plan={"grep_patterns": ["Flask==[0-9]+\\.[0-9]+\\.[0-9]+", "SQLAlchemy==[0-9]+\\.[0-9]+\\.[0-9]+"], "files_hint": ["requirements.txt"]}]
  - هیچ آسیب‌پذیری شناخته شده‌ای در dependencies وجود نداشته باشد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
  - تست‌های پروژه پس از به‌روزرسانی پاس شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
```

### Step 30: به‌روزرسانی وابستگی‌های قدیمی با آسیب‌پذیری‌های شناخته شده در requirements.txt
**Status:** `pending` (0%)
**Scope:** این مرحله شامل بررسی و به‌روزرسانی چهار وابستگی مشخص شده در فایل requirements.txt (Flask, SQLAlchemy, requests, PyJWT) به آخرین نسخه‌های پایدار و امن است. خارج از scope: سایر وابستگی‌های فایل، تغییر کد منبع، تست‌های یکپارچه‌سازی. نکته حیاتی: پس از به‌روزرسانی، باید تست‌های واحد و یکپارچه‌سازی اجرا شوند تا از عدم شکستگی اطمینان حاصل شود.
**Excerpt:**
```
ورژن‌های قدیمی dependencies با آسیب‌پذیری‌های شناخته شده

- `requirements.txt:1-30` — `کل فایل` — ورژن‌های قدیمی که نیاز به بررسی دارند
  ```
  Flask==2.0.1
  SQLAlchemy==1.4.22
  requests==2.25.1
  PyJWT==2.1.0
  ```
```

### Step 31: به‌روزرسانی dependencies قدیمی و آسیب‌پذیر در requirements.txt
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی و به‌روزرسانی تمام dependencies موجود در فایل requirements.txt به آخرین نسخه‌های پایدار و امن است. تمرکز بر رفع آسیب‌پذیری‌های شناخته شده (CVE) در Flask و SQLAlchemy می‌باشد. تغییرات باید در فایل requirements.txt اعمال شده و سپس با نصب مجدد dependencies در محیط توسعه و Docker تست شوند. این مرحله شامل تغییر کد منبع یا منطق برنامه نمی‌شود.
**Excerpt:**
```
بررسی فایل requirements.txt نشان می‌دهد که برخی dependencies دارای ورژن‌های قدیمی با آسیب‌پذیری‌های شناخته شده (CVE) هستند. به عنوان مثال، Flask ممکن است ورژن قدیمی داشته باشد و SQLAlchemy نیز ممکن است نیاز به به‌روزرسانی داشته باشد. این آسیب‌پذیری‌ها می‌توانند منجر به حملات مختلفی مانند SQL injection یا remote code execution شوند.
```

### Step 32: به‌روزرسانی وابستگی‌ها و رفع آسیب‌پذیری‌های شناخته شده
**Status:** `done` (100%)
**Scope:** این بخش شامل به‌روزرسانی تمام وابستگی‌های پروژه به آخرین نسخه‌های پایدار، شناسایی و رفع آسیب‌پذیری‌های شناخته شده با ابزارهایی مانند pip-audit یا safety، و اطمینان از عبور تست‌ها، linter و type-check پس از به‌روزرسانی است. خارج از این بخش: تغییر در منطق کسب‌وکار، افزودن ویژگی جدید، یا تغییر در معماری سیستم.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تمام dependencies به آخرین ورژن پایدار به‌روزرسانی شوند
- [ ] هیچ آسیب‌پذیری شناخته شده‌ای در dependencies وجود نداشته باشد
- [ ] تست‌های پروژه پس از به‌روزرسانی پاس شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تمام dependencies را به آخرین ورژن‌های پایدار به‌روزرسانی کنید. از ابزارهایی مانند pip-audit یا safety برای شناسایی خودکار آسیب‌پذیری‌ها استفاده کنید. همچنین می‌توانید از Dependabot یا Renovate برای به‌روزرسانی خودکار استفاده کنید.
```

### Step 33: به‌روزرسانی Flask به نسخه 2.3.3
**Status:** `pending` (0%)
**Scope:** این بخش صرفاً به به‌روزرسانی نسخه Flask در فایل requirements.txt یا فایل مشابه مدیریت وابستگی‌ها می‌پردازد. شامل تغییرات کد در فایل‌های مرتبط با Flask (مانند app/main.py) نمی‌شود مگر اینکه API شکسته شده باشد. خروجی مورد انتظار یک commit یا PR با پیام واضح است.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**به‌روزرسانی Flask**

_قبل:_
```
Flask==2.0.1
```

_بعد:_
```
Flask==2.3.3
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 34: پیاده‌سازی Timeout برای فراخوانی‌های API خارجی با قابلیت تنظیم از طریق متغیر محیطی و خطای 504
**Status:** `done` (100%)
**Scope:** این بخش صرفاً به پیاده‌سازی timeout 30 ثانیه‌ای برای فراخوانی‌های API خارجی در فایل app/services/integration_service.py می‌پردازد. شامل: تنظیم پیش‌فرض 30 ثانیه، قابلیت پیکربندی از طریق متغیر محیطی، و پرتاب HTTPException با status_code=504 در صورت timeout. خارج از scope: سایر سرویس‌ها، تست‌ها، یا تغییرات در فایل‌های config.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
به‌روزرسانی dependencies ممکن است باعث شکستن compatibility با کد موجود شود. نیاز به تست کامل دارد.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 8
  id: 43092a7f-819f-40fc-a7e1-5af467f6cba9
  عنوان اصلی: Implement external API call timeouts
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/integration_service.py

📋 acceptance_criteria کامل:
  - External API calls timeout after 30 seconds by default [verify_method=static] [verify_plan={"grep_patterns": ["timeout=30", "timeout=30.0", "httpx.Timeout(30", "aiohttp.ClientTimeout(total=30"], "files_hint": ["app/services/integration_service.py"]}]
  - Timeout value is configurable via environment variable [verify_method=static] [verify_plan={"grep_patterns": ["os.getenv.*TIMEOUT", "environ.get.*TIMEOUT", "settings.*timeout"], "files_hint": ["app/services/integration_service.py"]}]
  - Timeout raises appropriate HTTPException with 504 status [verify_method=static] [verify_plan={"grep_patterns": ["HTTPException.*504", "status_code=504", "status.HTTP_504_GATEWAY_TIMEOUT"], "files_hint": ["app/services/integration_service.py"]}]
```

### Step 35: بررسی و اعتبارسنجی اولیه درخواست پیش از اجرا
**Status:** `pending` (0%)
**Scope:** این بخش یک یادداشت هشداردهنده برای مدل اجراکننده است و شامل دستورالعمل‌های اجرایی مستقیم نیست. وظیفه آن اطمینان از بررسی دقیق repo پیش از هرگونه تغییر، جلوگیری از پیاده‌سازی مجدد قابلیت‌های موجود، و تشویق به قضاوت مستقل در صورت ناقص یا اشتباه بودن پرامپت است. این بخش هیچ فایل، کلاس یا تابع جدیدی را تعریف نمی‌کند و صرفاً یک راهنمای رفتاری برای مدل است.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.
```

### Step 36: افزودن timeout به فراخوانی API خارجی در سرویس یکپارچه‌سازی
**Status:** `done` (100%)
**Scope:** این مرحله فقط به افزودن timeout به فراخوانی `call_external_api` در فایل `app/services/integration_service.py` محدود می‌شود. تغییرات شامل تنظیم timeout برای `httpx.AsyncClient` است. سایر فراخوانی‌های API در این فایل یا سایر فایل‌ها در این مرحله پوشش داده نمی‌شوند. نکته حیاتی: timeout باید به گونه‌ای تنظیم شود که از قطع شدن طولانی مدت درخواست جلوگیری کند و خطاهای مربوط به timeout به درستی مدیریت شوند.
**Excerpt:**
```
Missing timeout on external API calls in integration service

- `app/services/integration_service.py:20-35` — `call_external_api` — External API call without timeout
  ```python
  async with httpx.AsyncClient() as client:
      response = await client.post(url, json=data)  # ⚠️ no timeout
      return response.json()
  ```
```

### Step 37: افزودن timeout به درخواست‌های HTTP سرویس یکپارچه‌سازی
**Status:** `done` (100%)
**Scope:** این بخش مربوط به افزودن timeout به تمام درخواست‌های HTTP خروجی سرویس یکپارچه‌سازی (integrations) است. شامل تغییر در app/config.py برای تعریف timeout و اعمال آن در کد سرویس می‌شود. خارج از scope: تغییر مسیرها، لاگینگ، retry logic. نکته حیاتی: timeout باید از config خوانده شود و hard-coded نباشد.
**Excerpt:**
```
The integration service makes HTTP calls to external services without setting a timeout. This can cause the application to hang indefinitely if the external service is unresponsive, leading to resource exhaustion and denial of service.

## 🔗 فایل‌های مرتبط (Cross-references)
- `app/config.py` (سطر 50) — Configuration for timeout values
- `app/routes/integrations.py` (سطر 25) — Route that triggers this service

## 🌐 نقشهٔ وابستگی‌ها
Used by all third-party integrations including calendar, email, and webhook services.
```

### Step 38: افزودن timeout قابل تنظیم برای فراخوانی‌های HTTP خارجی
**Status:** `done` (100%)
**Scope:** این بخش مربوط به افزودن timeout پیش‌فرض ۳۰ ثانیه‌ای به تمام فراخوانی‌های HTTP خارجی است. timeout باید از طریق متغیر محیطی قابل تنظیم باشد و در صورت انقضا، HTTPException با وضعیت ۵۰۴ برگرداند. این مرحله شامل پیاده‌سازی در سطح کلاینت HTTP (httpx یا aiohttp) است و نه تغییر در endpointهای داخلی. فایل‌های مرتبط: app/config.py برای متغیر محیطی، و فایل‌های استفاده‌کننده از HTTP client.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] External API calls timeout after 30 seconds by default
- [ ] Timeout value is configurable via environment variable
- [ ] Timeout raises appropriate HTTPException with 504 status
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Add a configurable timeout (default 30 seconds) to all external HTTP calls using httpx or aiohttp client timeout.
```

### Step 39: افزودن timeout به درخواست‌های HTTP ناهمگام
**Status:** `done` (100%)
**Scope:** این مرحله شامل تغییر کد در فایل‌های مرتبط با فراخوانی‌های HTTP ناهمگام (async) برای افزودن پارامتر timeout=30.0 به متد client.post است. فقط فراخوانی‌هایی که فاقد timeout هستند باید اصلاح شوند. فایل‌های tests و config خارج از scope هستند مگر اینکه مستقیماً حاوی client.post باشند.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**Add timeout configuration**

_قبل:_
```
response = await client.post(url, json=data)
```

_بعد:_
```
response = await client.post(url, json=data, timeout=30.0)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 40: پیاده‌سازی Feature flags در کلاس Settings
**Status:** `done` (100%)
**Scope:** این بخش شامل پیاده‌سازی دو feature flag (FEATURE_AI_ENABLED و FEATURE_INTEGRATIONS_ENABLED) در کلاس Settings فایل app/config.py است. مقادیر پیش‌فرض False بوده و قابلیت تنظیم از طریق متغیرهای محیطی را دارند. این تسک مستقل است و وابستگی به تسک‌های دیگر ندارد. اولویت medium و تخمین زمان small است.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - کلاس Settings شامل فیلدهای FEATURE_AI_ENABLED و FEATURE_INTEGRATIONS_ENABLED است [verify_method=static] [verify_plan={"grep_patterns": ["FEATURE_AI_ENABLED", "FEATURE_INTEGRATIONS_ENABLED"], "files_hint": ["app/config.py"]}]
  - مقادیر پیش‌فرض False هستند [verify_method=static] [verify_plan={"grep_patterns": ["FEATURE_AI_ENABLED\\s*=\\s*False", "FEATURE_INTEGRATIONS_ENABLED\\s*=\\s*False"], "files_hint": ["app/config.py"]}]
  - می‌توان با متغیر محیطی آن‌ها را true کرد [verify_method=static] [verify_plan={"grep_patterns": ["os\\.getenv\\s*\\(\\s*[\"']FEATURE_AI_ENABLED[\"']", "os\\.getenv\\s*\\(\\s*[\"']FEATURE_INTEGRATIONS_ENABLED[\"']"], "files_hint": ["app/config.py"]}]
```

### Step 41: بررسی اولیه خودکار و پیش‌نیازهای اجرایی برای تقویت پایداری و امنیت زیرساخت
**Status:** `pending` (0%)
**Scope:** این بخش شامل دستورالعمل‌های پیش‌نیاز برای مدل اجراکننده است: بررسی وجود پیاده‌سازی قبلی، جستجوی فایل‌های مرتبط، و تصمیم‌گیری بر اساس قضاوت مستقل. این بخش خود یک مرحله اجرایی نیست، بلکه یک یادداشت هشداردهنده برای جلوگیری از دوباره‌کاری و خطا است. خارج از این بخش: هیچ تغییر مستقیمی در کد یا پیکربندی انجام نمی‌شود.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.
```

### Step 42: افزودن فیلدهای Feature Flag به کلاس Settings در app/config.py
**Status:** `done` (100%)
**Scope:** این مرحله فقط شامل افزودن فیلدهای feature flag به کلاس Settings در فایل app/config.py است. هیچ تغییری در سایر فایل‌ها یا منطق استفاده از feature flags انجام نمی‌شود. فیلدها باید با استفاده از Field و env تعریف شوند. خارج از scope: پیاده‌سازی منطق feature flags در سایر بخش‌های کد، تست‌های مربوطه، یا تغییر در کلاس‌های دیگر.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
Feature flags در کد وجود ندارند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/config.py:1-30` — `Settings` — کلاس Settings باید فیلدهای feature flag را اضافه کند
  ```python
  class Settings(BaseSettings):
      DATABASE_URL: str = Field(..., env='DATABASE_URL')
      SECRET_KEY: str = Field(..., env='SECRET_KEY')
      ...
  ```
```

### Step 43: پیاده‌سازی مکانیزم Feature Flag در تنظیمات پروژه
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن feature flags به فایل config/settings.py و app/config.py برای فعال/غیرفعال کردن ویژگی‌هایی مانند AI و integration است. همچنین باید app/main.py را برای بررسی این flags به‌روزرسانی کند. خارج از scope: پیاده‌سازی کامل A/B testing یا تغییرات در سرویس‌های دیگر.
**Excerpt:**
```
هیچ مکانیزم feature flag در پروژه دیده نمی‌شود. فایل config/settings.py و app/config.py شامل تنظیمات پایه هستند اما هیچ flag برای فعال/غیرفعال کردن ویژگی‌ها (مانند AI یا integration) وجود ندارد. این موضوع باعث می‌شود که اضافه کردن تدریجی ویژگی‌ها یا A/B testing غیرممکن باشد.
```

### Step 44: پیاده‌سازی سیستم Feature Flags با استفاده از pydantic-settings و متغیرهای محیطی
**Status:** `done` (100%)
**Scope:** این بخش شامل ایجاد یک کلاس Settings با فیلدهای FEATURE_AI_ENABLED و FEATURE_INTEGRATIONS_ENABLED است که مقادیر پیش‌فرض False دارند و می‌توانند از طریق متغیرهای محیطی به True تغییر کنند. پیاده‌سازی باید با استفاده از pydantic-settings در فایل app/config.py انجام شود. خارج از scope: تغییرات در سایر فایل‌ها، تست‌های یکپارچه‌سازی، یا پیاده‌سازی منطق feature flags در سایر بخش‌های برنامه.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] کلاس Settings شامل فیلدهای FEATURE_AI_ENABLED و FEATURE_INTEGRATIONS_ENABLED است
- [ ] مقادیر پیش‌فرض False هستند
- [ ] می‌توان با متغیر محیطی آن‌ها را true کرد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک سیستم ساده feature flags با استفاده از متغیرهای محیطی یا یک فایل JSON اضافه کنید. از pydantic-settings برای مدیریت آن‌ها استفاده کنید.
```

### Step 45: اضافه کردن feature flags به Settings
**Status:** `done` (100%)
**Scope:** این بخش شامل افزودن فیلدهای feature flag به کلاس Settings در فایل app/config.py است. فقط تغییرات در کلاس Settings مد نظر است و شامل هیچ فایل یا کلاس دیگری نمی‌شود. feature flags به صورت بولین با مقدار پیش‌فرض False و با استفاده از Field و env برای خواندن از متغیرهای محیطی تعریف می‌شوند.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**اضافه کردن feature flags به Settings**

_قبل:_
```
class Settings(BaseSettings):
    DATABASE_URL: str
```

_بعد:_
```
class Settings(BaseSettings):
    DATABASE_URL: str
    FEATURE_AI_ENABLED: bool = Field(False, env='FEATURE_AI_ENABLED')
    FEATURE_INTEGRATIONS_ENABLED: bool = Field(False, env='FEATURE_INTEGRATIONS_ENABLED')
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 46: مستندسازی ریسک‌ها و وابستگی‌های بخش ریسک‌ها و موارد احتیاط
**Status:** `pending` (0%)
**Scope:** این بخش صرفاً شامل ابرداده (metadata) و توضیحات مربوط به ریسک‌ها، وابستگی‌ها، دسته‌بندی و وضعیت مراحل است. هیچ تغییر عملیاتی یا کدنویسی در این بخش وجود ندارد. تمام محتوای این بخش جنبه مستندسازی و برنامه‌ریزی دارد و نیازی به اجرای هیچ مرحله فنی نیست.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
تغییرات backward-compatible هستند و ریسک کمی دارند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)
```
