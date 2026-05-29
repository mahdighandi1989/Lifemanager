---
task_id: task_00cbe582ce8b
title: اعمال تغییرات شمای Task با Alembic
type: other
priority: medium
execution_priority: 100
status: done
external_status: pending
verification_status: done
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-25T06:49:31.399333+00:00'
updated_at: '2026-05-29T20:33:05.916508+00:00'
archived: true
archived_at: '2026-05-26T10:29:36.958662+00:00'
tags:
- consolidated
- post_verify_merge
---

# اعمال تغییرات شمای Task با Alembic

## Raw Idea

🧬 این یک تسک تلفیقی است — از 2 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها مستقیماً به مدیریت پایگاه داده و تغییرات شمای مدل‌ها مربوط می‌شوند. پیاده‌سازی Alembic ابزار لازم برای مدیریت migrationها را فراهم می‌کند و افزودن فیلدها به مدل Task یک تغییر شمای مشخص است.
🎯 theme: مدیریت پایگاه داده و تکامل شمای مدل‌ها
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 2
  id: 58e07f53-a676-4433-a7e5-88440ee70dba
  عنوان اصلی: پیاده‌سازی Alembic برای مدیریت migrationها
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: alembic.ini, migrations/README

📋 acceptance_criteria کامل:
  - یک migration اولیه در پوشه migrations ایجاد شده است [verify_method=static] [verify_plan={"grep_patterns": ["revision", "down_revision", "create_table"], "files_hint": ["migrations/versions/"]}]
  - دستور alembic upgrade head بدون خطا اجرا می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_migration.py::test_alembic_upgrade_head", "timeout_seconds": 120}]
  - جدول‌های دیتابیس با مدل‌ها مطابقت دارند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_migration.py::test_tables_match_models", "timeout_seconds": 60}]

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
عدم استفاده از Alembic برای مدیریت migrationها

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `alembic.ini:1-50` — `alembic.ini` — فایل پیکربندی Alembic
  ```
  [alembic]
  script_location = migrations
  sqlalchemy.url = driver://user:pass@localhost/dbname
  ```
- `migrations/README:1-5` — `README` — پوشه migrations خالی است
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
Python، Alembic، SQLAlchemy

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/database.py` (سطر 10) — تنظیمات دیتابیس
- `app/models/__init__.py` (سطر 1) — مدل‌های دیتابیس

## 🌐 نقشهٔ وابستگی‌ها
این تغییر روی مدیریت نسخه دیتابیس تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
پروژه از Alembic برای مدیریت migrationها استفاده می‌کند (فایل alembic.ini وجود دارد)، اما هیچ migration واقعی در پوشه migrations وجود ندارد. این موضوع باعث می‌شود که تغییرات در مدل‌های دیتابیس به صورت دستی اعمال شوند که خطرناک و غیرقابل ردیابی است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] یک migration اولیه در پوشه migrations ایجاد شده است
- [ ] دستور alembic upgrade head بدون خطا اجرا می‌شود
- [ ] جدول‌های دیتابیس با مدل‌ها مطابقت دارند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک migration اولیه با استفاده از Alembic ایجاد کنید. دستور alembic revision --autogenerate -m "initial" را اجرا کنید و سپس migration را با alembic upgrade head اعمال کنید.

## 💡 نمونه‌های قبل/بعد
**ایجاد migration اولیه**

_قبل:_
```
پوشه migrations خالی است
```

_بعد:_
```
پوشه migrations شامل فایل‌های migration است
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `alembic revision --autogenerate -m "initial"`
- `alembic upgrade head`

## ⚠️ ریسک‌ها و موارد احتیاط
متوسط. ممکن است نیاز به تنظیمات اضافی در alembic.ini داشته باشد.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 2
  id: f54c3ab8-7515-428d-b204-0347e3a2d12c
  عنوان اصلی: افزودن فیلدهای برنامه‌ریزی به مدل Task
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/models/task.py

📋 acceptance_criteria کامل:
  - مدل Task شامل فیلدهای priority, estimated_duration, deadline, recurrence است [verify_method=static] [verify_plan={"grep_patterns": ["priority", "estimated_duration", "deadline", "recurrence"], "files_hint": ["app/models/task.py"]}]
  - migration جدید با موفقیت اجرا می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_migrations.py::test_run_migrations", "timeout_seconds": 120}]
  - schemaهای Pydantic به‌روز شده‌اند [verify_method=static] [verify_plan={"grep_patterns": ["priority", "estimated_duration", "deadline", "recurrence"], "files_hint": ["app/schemas/task.py"]}]
  - تست‌های موجود شکسته نمی‌شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]

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
مدل‌های دیتابیس فاقد فیلدهای ضروری برای برنامه‌ریزی هستند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/models/task.py:1-50` — `Task` — فیلدهای priority, estimated_duration, deadline, recurrence باید اضافه شوند
  ```python
  class Task(Base):
      __tablename__ = "tasks"
      id = Column(Integer, primary_key=True)
      title = Column(String, nullable=False)
      description = Column(Text)
      status = Column(String, default="todo")
      user_id = Column(Integer, ForeignKey("users.id"))
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
SQLAlchemy + Alembic + PostgreSQL

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/schemas/task_schema.py` (سطر 1) — طرح‌های Pydantic باید به‌روز شوند
- `migrations/versions/` (سطر 1) — نیاز به migration جدید

## 🌐 نقشهٔ وابستگی‌ها
تغییر در مدل Task بر تمام routeها، schemaها و سرویس‌های مرتبط با tasks تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
مدل Task در app/models/task.py فاقد فیلدهای مهمی مانند priority (اولویت)، estimated_duration (مدت زمان تخمینی)، deadline (مهلت) و recurrence (تکرار) است. این فیلدها برای پیاده‌سازی برنامه‌ریزی هوشمند ضروری هستند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مدل Task شامل فیلدهای priority, estimated_duration, deadline, recurrence است
- [ ] migration جدید با موفقیت اجرا می‌شود
- [ ] schemaهای Pydantic به‌روز شده‌اند
- [ ] تست‌های موجود شکسته نمی‌شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن فیلدهای priority (Integer)، estimated_duration (Interval)، deadline (DateTime)، recurrence (JSON) به مدل Task. همچنین ایجاد migration برای اعمال تغییرات در دیتابیس.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن فیلد priority**

_قبل:_
```
status = Column(String, default="todo")
```

_بعد:_
```
status = Column(String, default="todo")
priority = Column(Integer, default=0)
estimated_duration = Column(Interval, nullable=True)
deadline = Column(DateTime, nullable=True)
recurrence = Column(JSON, nullable=True)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `alembic upgrade head`
- `pytest tests/test_tasks.py -v`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر در مدل ممکن است باعث شکسته شدن queryهای موجود شود

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: medium

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
- در commit message: `merged-from: 58e07f53-a676-4433-a7e5-88440ee70dba, f54c3ab8-7515-428d-b204-0347e3a2d12c`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 2 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها مستقیماً به مدیریت پایگاه داده و تغییرات شمای مدل‌ها مربوط می‌شوند. پیاده‌سازی Alembic ابزار لازم برای مدیریت migrationها را فراهم می‌کند و افزودن فیلدها به مدل Task یک تغییر شمای مشخص است.
🎯 theme: مدیریت پایگاه داده و تکامل شمای مدل‌ها
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 2
  id: 58e07f53-a676-4433-a7e5-88440ee70dba
  عنوان اصلی: پیاده‌سازی Alembic برای مدیریت migrationها
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: alembic.ini, migrations/README

📋 acceptance_criteria کامل:
  - یک migration اولیه در پوشه migrations ایجاد شده است [verify_method=static] [verify_plan={"grep_patterns": ["revision", "down_revision", "create_table"], "files_hint": ["migrations/versions/"]}]
  - دستور alembic upgrade head بدون خطا اجرا می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_migration.py::test_alembic_upgrade_head", "timeout_seconds": 120}]
  - جدول‌های دیتابیس با مدل‌ها مطابقت دارند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_migration.py::test_tables_match_models", "timeout_seconds": 60}]

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
عدم استفاده از Alembic برای مدیریت migrationها

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `alembic.ini:1-50` — `alembic.ini` — فایل پیکربندی Alembic
  ```
  [alembic]
  script_location = migrations
  sqlalchemy.url = driver://user:pass@localhost/dbname
  ```
- `migrations/README:1-5` — `README` — پوشه migrations خالی است
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
Python، Alembic، SQLAlchemy

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/database.py` (سطر 10) — تنظیمات دیتابیس
- `app/models/__init__.py` (سطر 1) — مدل‌های دیتابیس

## 🌐 نقشهٔ وابستگی‌ها
این تغییر روی مدیریت نسخه دیتابیس تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
پروژه از Alembic برای مدیریت migrationها استفاده می‌کند (فایل alembic.ini وجود دارد)، اما هیچ migration واقعی در پوشه migrations وجود ندارد. این موضوع باعث می‌شود که تغییرات در مدل‌های دیتابیس به صورت دستی اعمال شوند که خطرناک و غیرقابل ردیابی است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] یک migration اولیه در پوشه migrations ایجاد شده است
- [ ] دستور alembic upgrade head بدون خطا اجرا می‌شود
- [ ] جدول‌های دیتابیس با مدل‌ها مطابقت دارند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک migration اولیه با استفاده از Alembic ایجاد کنید. دستور alembic revision --autogenerate -m "initial" را اجرا کنید و سپس migration را با alembic upgrade head اعمال کنید.

## 💡 نمونه‌های قبل/بعد
**ایجاد migration اولیه**

_قبل:_
```
پوشه migrations خالی است
```

_بعد:_
```
پوشه migrations شامل فایل‌های migration است
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `alembic revision --autogenerate -m "initial"`
- `alembic upgrade head`

## ⚠️ ریسک‌ها و موارد احتیاط
متوسط. ممکن است نیاز به تنظیمات اضافی در alembic.ini داشته باشد.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 2
  id: f54c3ab8-7515-428d-b204-0347e3a2d12c
  عنوان اصلی: افزودن فیلدهای برنامه‌ریزی به مدل Task
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/models/task.py

📋 acceptance_criteria کامل:
  - مدل Task شامل فیلدهای priority, estimated_duration, deadline, recurrence است [verify_method=static] [verify_plan={"grep_patterns": ["priority", "estimated_duration", "deadline", "recurrence"], "files_hint": ["app/models/task.py"]}]
  - migration جدید با موفقیت اجرا می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_migrations.py::test_run_migrations", "timeout_seconds": 120}]
  - schemaهای Pydantic به‌روز شده‌اند [verify_method=static] [verify_plan={"grep_patterns": ["priority", "estimated_duration", "deadline", "recurrence"], "files_hint": ["app/schemas/task.py"]}]
  - تست‌های موجود شکسته نمی‌شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]

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
مدل‌های دیتابیس فاقد فیلدهای ضروری برای برنامه‌ریزی هستند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/models/task.py:1-50` — `Task` — فیلدهای priority, estimated_duration, deadline, recurrence باید اضافه شوند
  ```python
  class Task(Base):
      __tablename__ = "tasks"
      id = Column(Integer, primary_key=True)
      title = Column(String, nullable=False)
      description = Column(Text)
      status = Column(String, default="todo")
      user_id = Column(Integer, ForeignKey("users.id"))
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
SQLAlchemy + Alembic + PostgreSQL

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/schemas/task_schema.py` (سطر 1) — طرح‌های Pydantic باید به‌روز شوند
- `migrations/versions/` (سطر 1) — نیاز به migration جدید

## 🌐 نقشهٔ وابستگی‌ها
تغییر در مدل Task بر تمام routeها، schemaها و سرویس‌های مرتبط با tasks تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
مدل Task در app/models/task.py فاقد فیلدهای مهمی مانند priority (اولویت)، estimated_duration (مدت زمان تخمینی)، deadline (مهلت) و recurrence (تکرار) است. این فیلدها برای پیاده‌سازی برنامه‌ریزی هوشمند ضروری هستند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مدل Task شامل فیلدهای priority, estimated_duration, deadline, recurrence است
- [ ] migration جدید با موفقیت اجرا می‌شود
- [ ] schemaهای Pydantic به‌روز شده‌اند
- [ ] تست‌های موجود شکسته نمی‌شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن فیلدهای priority (Integer)، estimated_duration (Interval)، deadline (DateTime)، recurrence (JSON) به مدل Task. همچنین ایجاد migration برای اعمال تغییرات در دیتابیس.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن فیلد priority**

_قبل:_
```
status = Column(String, default="todo")
```

_بعد:_
```
status = Column(String, default="todo")
priority = Column(Integer, default=0)
estimated_duration = Column(Interval, nullable=True)
deadline = Column(DateTime, nullable=True)
recurrence = Column(JSON, nullable=True)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `alembic upgrade head`
- `pytest tests/test_tasks.py -v`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر در مدل ممکن است باعث شکسته شدن queryهای موجود شود

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: medium

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
- در commit message: `merged-from: 58e07f53-a676-4433-a7e5-88440ee70dba, f54c3ab8-7515-428d-b204-0347e3a2d12c`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. یک migration اولیه در پوشه migrations ایجاد شده است _(verify: static)_
2. دستور alembic upgrade head بدون خطا اجرا می‌شود _(verify: backend_test)_
3. جدول‌های دیتابیس با مدل‌ها مطابقت دارند _(verify: backend_test)_
4. مدل Task شامل فیلدهای priority, estimated_duration, deadline, recurrence است _(verify: static)_
5. migration جدید با موفقیت اجرا می‌شود _(verify: backend_test)_
6. schemaهای Pydantic به‌روز شده‌اند _(verify: static)_
7. تست‌های موجود شکسته نمی‌شوند _(verify: backend_test)_

## Task Steps

### Step 1: بررسی اولیه repo برای وجود Alembic و migration‌های قبلی
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی کامل ساختار repo برای یافتن فایل‌های مرتبط با Alembic (alembic.ini، پوشه migrations، فایل‌های migration موجود) و همچنین بررسی مدل Task برای وجود فیلدهای priority, estimated_duration, deadline, recurrence است. هدف تعیین وضعیت فعلی و جلوگیری از بازسازی موارد موجود است. خارج از این مرحله: ایجاد تغییرات یا نوشتن کد جدید.
**Excerpt:**
```
♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.
```

### Step 2: ایجاد migration اولیه با Alembic (autogenerate)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای دستور `alembic revision --autogenerate -m "initial"` برای تولید یک فایل migration اولیه بر اساس مدل‌های موجود در app/models است. فایل تولید شده باید شامل دستورات create_table برای تمام جدول‌های مدل‌ها باشد. خارج از این مرحله: اجرای migration (upgrade head) و اعتبارسنجی.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
عدم استفاده از Alembic برای مدیریت migrationها

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_
- `alembic.ini:1-50` — `alembic.ini` — فایل پیکربندی Alembic
  ```
  [alembic]
  script_location = migrations
  sqlalchemy.url = driver://user:pass@localhost/dbname
  ```
- `migrations/README:1-5` — `README` — پوشه migrations خالی است
  ```
  Generic single-database configuration.
  ```
```

### Step 3: اجرای دستور alembic upgrade head و اعتبارسنجی اولیه
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای دستور `alembic upgrade head` برای اعمال migration اولیه بر روی دیتابیس است. انتظار می‌رود که دستور بدون خطا اجرا شود. خارج از این مرحله: تست‌های تطابق جدول‌ها با مدل‌ها.
**Excerpt:**
```
- [ ] دستور alembic upgrade head بدون خطا اجرا می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_migration.py::test_alembic_upgrade_head", "timeout_seconds": 120}]
```

### Step 4: تست تطابق جدول‌های دیتابیس با مدل‌ها
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تست `tests/test_migration.py::test_tables_match_models` است که بررسی می‌کند آیا ساختار جدول‌های موجود در دیتابیس با مدل‌های SQLAlchemy در app/models مطابقت دارد یا خیر. خارج از این مرحله: ایجاد migration جدید یا تغییر مدل‌ها.
**Excerpt:**
```
- [ ] جدول‌های دیتابیس با مدل‌ها مطابقت دارند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_migration.py::test_tables_match_models", "timeout_seconds": 60}]
```

### Step 5: اضافه کردن فیلد priority به مدل Task
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن فیلد `priority` از نوع `Integer` با مقدار پیش‌فرض 0 به کلاس `Task` در فایل `app/models/task.py` است. خارج از این مرحله: اضافه کردن سایر فیلدها (estimated_duration, deadline, recurrence) و ایجاد migration.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
مدل‌های دیتابیس فاقد فیلدهای ضروری برای برنامه‌ریزی هستند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_
- `app/models/task.py:1-50` — `Task` — فیلدهای priority, estimated_duration, deadline, recurrence باید اضافه شوند
  ```python
  class Task(Base):
      __tablename__ = "tasks"
      id = Column(Integer, primary_key=True)
      title = Column(String, nullable=False)
      description = Column(Text)
      status = Column(String, default="todo")
      user_id = Column(Integer, ForeignKey("users.id"))
  ```
```

### Step 6: اضافه کردن فیلد estimated_duration به مدل Task
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن فیلد `estimated_duration` از نوع `Interval` با قابلیت nullable=True به کلاس `Task` در فایل `app/models/task.py` است. خارج از این مرحله: اضافه کردن سایر فیلدها و ایجاد migration.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**اضافه کردن فیلد priority**

_قبل:_
```
status = Column(String, default="todo")
```

_بعد:_
```
status = Column(String, default="todo")
priority = Column(Integer, default=0)
estimated_duration = Column(Interval, nullable=True)
deadline = Column(DateTime, nullable=True)
recurrence = Column(JSON, nullable=True)
```
```

### Step 7: اضافه کردن فیلد deadline به مدل Task
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن فیلد `deadline` از نوع `DateTime` با قابلیت nullable=True به کلاس `Task` در فایل `app/models/task.py` است. خارج از این مرحله: اضافه کردن سایر فیلدها و ایجاد migration.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**اضافه کردن فیلد priority**

_بعد:_
```
status = Column(String, default="todo")
priority = Column(Integer, default=0)
estimated_duration = Column(Interval, nullable=True)
deadline = Column(DateTime, nullable=True)
recurrence = Column(JSON, nullable=True)
```
```

### Step 8: اضافه کردن فیلد recurrence به مدل Task
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن فیلد `recurrence` از نوع `JSON` با قابلیت nullable=True به کلاس `Task` در فایل `app/models/task.py` است. خارج از این مرحله: اضافه کردن سایر فیلدها و ایجاد migration.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**اضافه کردن فیلد priority**

_بعد:_
```
status = Column(String, default="todo")
priority = Column(Integer, default=0)
estimated_duration = Column(Interval, nullable=True)
deadline = Column(DateTime, nullable=True)
recurrence = Column(JSON, nullable=True)
```
```

### Step 9: ایجاد migration جدید برای فیلدهای اضافه شده به مدل Task
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای دستور `alembic revision --autogenerate -m "add_planning_fields"` برای تولید یک فایل migration جدید است که شامل دستورات `add_column` برای فیلدهای priority, estimated_duration, deadline, recurrence به جدول tasks است. خارج از این مرحله: اجرای migration و به‌روزرسانی schemaهای Pydantic.
**Excerpt:**
```
- [ ] migration جدید با موفقیت اجرا می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_migrations.py::test_run_migrations", "timeout_seconds": 120}]
```

### Step 10: اجرای migration جدید و تست آن
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای دستور `alembic upgrade head` برای اعمال migration جدید و سپس اجرای تست `tests/test_migrations.py::test_run_migrations` برای اطمینان از موفقیت‌آمیز بودن آن است. خارج از این مرحله: به‌روزرسانی schemaهای Pydantic و تست‌های مربوط به tasks.
**Excerpt:**
```
- [ ] migration جدید با موفقیت اجرا می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_migrations.py::test_run_migrations", "timeout_seconds": 120}]
```

### Step 11: به‌روزرسانی schemaهای Pydantic برای Task (فایل app/models/task.py)
**Status:** `done` (100%)
**Scope:** این مرحله شامل به‌روزرسانی فایل `app/models/task.py` (یا `app/schemas/task_schema.py`) برای اضافه کردن فیلدهای priority, estimated_duration, deadline, recurrence به کلاس‌های Schema مربوط به Task (مانند TaskCreate, TaskUpdate, TaskResponse) است. خارج از این مرحله: ایجاد migration یا تغییر مدل Task.
**Excerpt:**
```
- [ ] schemaهای Pydantic به‌روز شده‌اند [verify_method=static] [verify_plan={"grep_patterns": ["priority", "estimated_duration", "deadline", "recurrence"], "files_hint": ["app/models/task.py"]}]
```

### Step 12: اجرای تست‌های موجود برای اطمینان از عدم شکستگی
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تمام تست‌های موجود (به خصوص `tests/test_tasks.py`) با دستور `pytest tests/` برای اطمینان از اینکه تغییرات ایجاد شده باعث شکسته شدن هیچ تستی نشده است. خارج از این مرحله: نوشتن تست جدید.
**Excerpt:**
```
- [ ] تست‌های موجود شکسته نمی‌شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
```

### Step 13: اجرای linter و type-checker برای اطمینان از کیفیت کد
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای linter (مانند flake8 یا pylint) و type-checker (مانند mypy) بر روی کل پروژه برای اطمینان از عدم وجود warning یا error است. خارج از این مرحله: رفع خطاهای linting یا type-checking (در صورت وجود، باید در مرحله جداگانه انجام شود).
**Excerpt:**
```
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)
```

### Step 14: ثبت کامیت نهایی با پیام واضح و checklist
**Status:** `done` (100%)
**Scope:** این مرحله شامل ثبت یک یا چند کامیت با پیام‌های واضح است که تمام تغییرات انجام شده را پوشش می‌دهد. پیام کامیت باید شامل `merged-from: 58e07f53-a676-4433-a7e5-88440ee70dba, f54c3ab8-7515-428d-b204-0347e3a2d12c` باشد. همچنین یک checklist از تمام کامیت‌ها در PR description نوشته شود. خارج از این مرحله: اعمال تغییرات جدید.
**Excerpt:**
```
📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.
```
