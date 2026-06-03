---
task_id: task_882723eb07de
title: بهینه‌سازی اتصال DB و اصلاح الگوهای طراحی
type: other
priority: high
execution_priority: 2350
status: awaiting_review
external_status: done
verification_status: applied_externally_pending_verify
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-26T23:18:00.915795+00:00'
updated_at: '2026-06-03T18:30:58.961061+00:00'
tags:
- consolidated
- post_verify_merge
---

# بهینه‌سازی اتصال DB و اصلاح الگوهای طراحی

## Raw Idea

🧬 این یک تسک تلفیقی است — از 2 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها مستقیماً به بهینه‌سازی تعامل با پایگاه داده، از جمله مدیریت اتصال و سشن‌ها، و رفع الگوهای طراحی نامناسب در لایه دیتابیس می‌پردازند.
🎯 theme: بهینه‌سازی عملکرد پایگاه داده و رفع مشکلات معماری
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 2
  id: f46ea7ab-024f-4499-9440-af0d62516292
  عنوان اصلی: Fix Under-engineering Anti-pattern
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/database.py

📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["# This function is intended for development/testing environments only.", "# Production deployments require a dedicated schema migration tool (e.g., Alembic).", "alembic.command.upg]
  - تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_database_schema.py::test_schema_evolution_edge_case", "timeout_seconds": 60}]

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
Anti-pattern: Under-engineering

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/database.py:30`

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست 
[auto-re-registered from github_import at 2026-05-20T04:25:49.854717+00:00]

## 🧱 پشتهٔ فناوری و معماری
Stack: fastapi, react, vite.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/main.py` — این فایل `database.py` را import می‌کند (caller)
- `app/routes/auth_google.py` — این فایل `database.py` را import می‌کند (caller)
- `main.py` — این فایل `database.py` را import می‌کند (caller)
- `app/routes/ai.py` — این فایل `database.py` را import می‌کند (caller)

## 🔍 Context و وضعیت فعلی
The `init_db` function uses `Base.metadata.create_all` for database table creation. While suitable for development or testing environments, this approach is under-engineered for production. It does not provide a mechanism for schema migrations (e.g., adding/modifying columns, handling data changes) which are essential for evolving applications without data loss. In a production setup, a dedicated 

📁 file: app/database.py (line 30)

🎯 پیشنهاد: این الگو معمولاً منطق سیستم را در شرایط لبه می‌شکند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] ریشه anti-pattern تشخیص داده شد
- [ ] یا کد اصلاح شد، یا کامنت توجیهی اضافه شد
- [ ] تست edge case نوشته شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. بازنگری منطق در این نقطه و اضافه‌کردن guard/comment مناسب.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/database.py`
- `ruff check app/database.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug_fix
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 2
  id: 6e6ec128-ec0f-4b85-bcf6-2e039a27da20
  عنوان اصلی: Optimize database connection pooling and sessions
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/database.py

📋 acceptance_criteria کامل:
  - Connection pool handles 100 concurrent requests without errors [verify_method=backend_test] [verify_plan={"test_node": "tests/test_database.py::test_concurrent_connections", "timeout_seconds": 120}]
  - Pool connections are recycled every hour to prevent stale connections [verify_method=static] [verify_plan={"grep_patterns": ["pool_recycle", "pool_pre_ping"], "files_hint": ["app/database.py"]}]
  - Connection timeout returns 503 error after 30 seconds [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/oversight/status", "headers": null, "json_body": null, "expected_status": 503, "required_fields": [], "json_contains": null}]
  - Async session management works with FastAPI dependency injection [verify_method=static] [verify_plan={"grep_patterns": ["AsyncSession", "async_sessionmaker", "async with session"], "files_hint": ["app/database.py"]}]

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
Database connection pooling and session management not optimized

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/database.py:1-40` — `engine` — Default connection pool settings, no async support
  ```python
  engine = create_engine(DATABASE_URL)
  SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + SQLAlchemy + PostgreSQL

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/config.py` (سطر 1) — Database configuration settings
- `app/main.py` — Application startup that initializes database

## 🌐 نقشهٔ وابستگی‌ها
Affects all database operations. May require asyncpg installation for async support.

## 🔍 Context و وضعیت فعلی
The database configuration at app/database.py likely uses default SQLAlchemy connection pooling settings without optimization for concurrent requests. There's no evidence of async session management or connection pool sizing based on expected load. This could lead to connection exhaustion under high traffic and slow query performance.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Connection pool handles 100 concurrent requests without errors
- [ ] Pool connections are recycled every hour to prevent stale connections
- [ ] Connection timeout returns 503 error after 30 seconds
- [ ] Async session management works with FastAPI dependency injection
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Configure SQLAlchemy connection pool with appropriate min/max sizes based on server resources. Implement async session management using asyncpg for PostgreSQL. Add connection pool monitoring and automatic recovery. Configure pool timeout and overflow settings.

## 💡 نمونه‌های قبل/بعد
**Optimize connection pooling**

_قبل:_
```
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
```

_بعد:_
```
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=3600,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Async support
async_engine = create_async_engine(ASYNC_DATABASE_URL, pool_size=20)
AsyncSessionLocal = async_sessionmaker(async_engine)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `locust -f tests/locustfile.py --headless -u 100 -r 10`
- `pytest tests/test_database.py -k pool`

## ⚠️ ریسک‌ها و موارد احتیاط
Changing pool settings may cause connection issues if not tuned properly; async migration may break existing sync code

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
- در commit message: `merged-from: f46ea7ab-024f-4499-9440-af0d62516292, 6e6ec128-ec0f-4b85-bcf6-2e039a27da20`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 2 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها مستقیماً به بهینه‌سازی تعامل با پایگاه داده، از جمله مدیریت اتصال و سشن‌ها، و رفع الگوهای طراحی نامناسب در لایه دیتابیس می‌پردازند.
🎯 theme: بهینه‌سازی عملکرد پایگاه داده و رفع مشکلات معماری
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 2
  id: f46ea7ab-024f-4499-9440-af0d62516292
  عنوان اصلی: Fix Under-engineering Anti-pattern
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/database.py

📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["# This function is intended for development/testing environments only.", "# Production deployments require a dedicated schema migration tool (e.g., Alembic).", "alembic.command.upg]
  - تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_database_schema.py::test_schema_evolution_edge_case", "timeout_seconds": 60}]

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
Anti-pattern: Under-engineering

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/database.py:30`

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست 
[auto-re-registered from github_import at 2026-05-20T04:25:49.854717+00:00]

## 🧱 پشتهٔ فناوری و معماری
Stack: fastapi, react, vite.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/main.py` — این فایل `database.py` را import می‌کند (caller)
- `app/routes/auth_google.py` — این فایل `database.py` را import می‌کند (caller)
- `main.py` — این فایل `database.py` را import می‌کند (caller)
- `app/routes/ai.py` — این فایل `database.py` را import می‌کند (caller)

## 🔍 Context و وضعیت فعلی
The `init_db` function uses `Base.metadata.create_all` for database table creation. While suitable for development or testing environments, this approach is under-engineered for production. It does not provide a mechanism for schema migrations (e.g., adding/modifying columns, handling data changes) which are essential for evolving applications without data loss. In a production setup, a dedicated 

📁 file: app/database.py (line 30)

🎯 پیشنهاد: این الگو معمولاً منطق سیستم را در شرایط لبه می‌شکند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] ریشه anti-pattern تشخیص داده شد
- [ ] یا کد اصلاح شد، یا کامنت توجیهی اضافه شد
- [ ] تست edge case نوشته شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. بازنگری منطق در این نقطه و اضافه‌کردن guard/comment مناسب.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/database.py`
- `ruff check app/database.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug_fix
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 2
  id: 6e6ec128-ec0f-4b85-bcf6-2e039a27da20
  عنوان اصلی: Optimize database connection pooling and sessions
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/database.py

📋 acceptance_criteria کامل:
  - Connection pool handles 100 concurrent requests without errors [verify_method=backend_test] [verify_plan={"test_node": "tests/test_database.py::test_concurrent_connections", "timeout_seconds": 120}]
  - Pool connections are recycled every hour to prevent stale connections [verify_method=static] [verify_plan={"grep_patterns": ["pool_recycle", "pool_pre_ping"], "files_hint": ["app/database.py"]}]
  - Connection timeout returns 503 error after 30 seconds [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/oversight/status", "headers": null, "json_body": null, "expected_status": 503, "required_fields": [], "json_contains": null}]
  - Async session management works with FastAPI dependency injection [verify_method=static] [verify_plan={"grep_patterns": ["AsyncSession", "async_sessionmaker", "async with session"], "files_hint": ["app/database.py"]}]

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
Database connection pooling and session management not optimized

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/database.py:1-40` — `engine` — Default connection pool settings, no async support
  ```python
  engine = create_engine(DATABASE_URL)
  SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + SQLAlchemy + PostgreSQL

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/config.py` (سطر 1) — Database configuration settings
- `app/main.py` — Application startup that initializes database

## 🌐 نقشهٔ وابستگی‌ها
Affects all database operations. May require asyncpg installation for async support.

## 🔍 Context و وضعیت فعلی
The database configuration at app/database.py likely uses default SQLAlchemy connection pooling settings without optimization for concurrent requests. There's no evidence of async session management or connection pool sizing based on expected load. This could lead to connection exhaustion under high traffic and slow query performance.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Connection pool handles 100 concurrent requests without errors
- [ ] Pool connections are recycled every hour to prevent stale connections
- [ ] Connection timeout returns 503 error after 30 seconds
- [ ] Async session management works with FastAPI dependency injection
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Configure SQLAlchemy connection pool with appropriate min/max sizes based on server resources. Implement async session management using asyncpg for PostgreSQL. Add connection pool monitoring and automatic recovery. Configure pool timeout and overflow settings.

## 💡 نمونه‌های قبل/بعد
**Optimize connection pooling**

_قبل:_
```
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
```

_بعد:_
```
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=3600,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Async support
async_engine = create_async_engine(ASYNC_DATABASE_URL, pool_size=20)
AsyncSessionLocal = async_sessionmaker(async_engine)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `locust -f tests/locustfile.py --headless -u 100 -r 10`
- `pytest tests/test_database.py -k pool`

## ⚠️ ریسک‌ها و موارد احتیاط
Changing pool settings may cause connection issues if not tuned properly; async migration may break existing sync code

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
- در commit message: `merged-from: f46ea7ab-024f-4499-9440-af0d62516292, 6e6ec128-ec0f-4b85-bcf6-2e039a27da20`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. Connection pool handles 100 concurrent requests without errors _(verify: backend_test)_
2. Pool connections are recycled every hour to prevent stale connections _(verify: static)_
3. Connection timeout returns 503 error after 30 seconds _(verify: api_response)_
4. Async session management works with FastAPI dependency injection _(verify: static)_
5. ریشه anti-pattern تشخیص داده شد _(verify: manual_only)_
6. یا کد اصلاح شد، یا کامنت توجیهی اضافه شد _(verify: static)_
7. تست edge case نوشته شد _(verify: backend_test)_

## Task Steps

### Step 1: تشخیص ریشه anti-pattern Under-engineering در app/database.py
**Status:** `done` (100%)
**Scope:** بررسی کامل فایل app/database.py برای شناسایی دقیق ریشه anti-pattern Under-engineering. این مرحله شامل تحلیل کد موجود، جستجوی الگوهای نادرست مانند استفاده از create_all در production، و مستندسازی یافته‌ها است. خارج از این مرحله: اعمال تغییرات کد یا نوشتن تست. نکته حیاتی: این مرحله صرفاً تشخیصی است و هیچ تغییری در کد ایجاد نمی‌کند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["# This function is intended for development/testing environments only.", "# Production deployments require a dedicated schema migration tool (e.g., Alembic).", "alembic.command.upg"]}]
  - تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_database_schema.py::test_schema_evolution_edge_case", "timeout_seconds": 60}]
```

### Step 2: اصلاح کد یا افزودن کامنت توجیهی برای Under-engineering در app/database.py
**Status:** `done` (100%)
**Scope:** اعمال تغییرات در فایل app/database.py برای رفع anti-pattern Under-engineering. این شامل دو گزینه است: (1) اصلاح کد با جایگزینی create_all با ابزار migration مانند Alembic، یا (2) افزودن کامنت توجیهی که توضیح دهد چرا create_all مناسب است و چه محدودیت‌هایی دارد. خارج از این مرحله: نوشتن تست edge case. نکته حیاتی: کامنت‌های توجیهی باید دقیقاً با الگوهای مشخص شده در AC مطابقت داشته باشند.
**Excerpt:**
```
- یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["# This function is intended for development/testing environments only.", "# Production deployments require a dedicated schema migration tool (e.g., Alembic).", "alembic.command.upg"]}]
```

### Step 3: نوشتن تست edge case برای schema evolution در tests/test_database_schema.py
**Status:** `not_done` (0%)
**Scope:** ایجاد فایل tests/test_database_schema.py با تابع تست test_schema_evolution_edge_case که سناریوهای لبه مربوط به تغییر schema را پوشش می‌دهد. این تست باید بررسی کند که اضافه کردن ستون جدید به جدول موجود بدون از دست رفتن داده‌های قبلی کار می‌کند. خارج از این مرحله: تغییر کد اصلی یا تست‌های دیگر. نکته حیاتی: تست باید با timeout 60 ثانیه اجرا شود.
**Excerpt:**
```
- تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_database_schema.py::test_schema_evolution_edge_case", "timeout_seconds": 60}]
```

### Step 4: اجرای دستورات اعتبارسنجی برای تسک 1 (py_compile, ruff, pytest)
**Status:** `not_done` (0%)
**Scope:** اجرای دستورات اعتبارسنجی مشخص شده برای تسک 1: python -m py_compile app/database.py، ruff check app/database.py، و pytest -x. این مرحله تضمین می‌کند که تغییرات اعمال شده در مراحل قبل باعث خطاهای کامپایل، linting، یا تست نمی‌شوند. خارج از این مرحله: تغییر کد یا تست. نکته حیاتی: اگر هر یک از این دستورات fail شود، باید به مرحله قبل برگردیم.
**Excerpt:**
```
🧪 دستورات اعتبارسنجی
- `python -m py_compile app/database.py`
- `ruff check app/database.py`
- `pytest -x`
```

### Step 5: پیکربندی connection pool با پارامترهای بهینه در app/database.py
**Status:** `done` (100%)
**Scope:** تغییر فایل app/database.py برای پیکربندی SQLAlchemy connection pool با پارامترهای pool_size=20، max_overflow=10، pool_timeout=30، pool_recycle=3600، و pool_pre_ping=True. این مرحله شامل جایگزینی create_engine ساده با نسخه پیکربندی شده است. خارج از این مرحله: پیاده‌سازی async support یا تست concurrent. نکته حیاتی: پارامترها باید دقیقاً مطابق با نمونه بعد در idea_prompt باشند.
**Excerpt:**
```
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=3600,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### Step 6: پیاده‌سازی async session management با asyncpg در app/database.py
**Status:** `not_done` (0%)
**Scope:** افزودن async engine و async session maker به فایل app/database.py با استفاده از create_async_engine و async_sessionmaker. این شامل تعریف async_engine با ASYNC_DATABASE_URL و AsyncSessionLocal است. خارج از این مرحله: تغییر dependency injection در FastAPI یا تست concurrent. نکته حیاتی: async support باید با FastAPI dependency injection سازگار باشد.
**Excerpt:**
```
# Async support
async_engine = create_async_engine(ASYNC_DATABASE_URL, pool_size=20)
AsyncSessionLocal = async_sessionmaker(async_engine)
```

### Step 7: نوشتن تست concurrent connections در tests/test_database.py
**Status:** `not_done` (0%)
**Scope:** ایجاد یا به‌روزرسانی فایل tests/test_database.py با تابع تست test_concurrent_connections که 100 درخواست همزمان را شبیه‌سازی می‌کند و بررسی می‌کند که connection pool بدون خطا کار می‌کند. این تست باید با timeout 120 ثانیه اجرا شود. خارج از این مرحله: تست‌های دیگر یا تغییر کد اصلی. نکته حیاتی: تست باید واقعاً 100 اتصال همزمان ایجاد کند.
**Excerpt:**
```
- Connection pool handles 100 concurrent requests without errors [verify_method=backend_test] [verify_plan={"test_node": "tests/test_database.py::test_concurrent_connections", "timeout_seconds": 120}]
```

### Step 8: تست connection timeout با بازگشت 503 در endpoint /api/oversight/status
**Status:** `not_done` (0%)
**Scope:** ایجاد یا به‌روزرسانی endpoint /api/oversight/status در app/routes/ai.py یا فایل مناسب دیگر که در صورت timeout اتصال به پایگاه داده، خطای 503 بازگرداند. این مرحله شامل پیاده‌سازی منطق timeout و بازگشت status code مناسب است. خارج از این مرحله: تست concurrent یا تغییر pool settings. نکته حیاتی: timeout باید 30 ثانیه باشد.
**Excerpt:**
```
- Connection timeout returns 503 error after 30 seconds [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/oversight/status", "headers": null, "json_body": null, "expected_status": 503, "required_fields": [], "json_contains": null}]
```

### Step 9: تأیید static async session management با FastAPI dependency injection
**Status:** `not_done` (0%)
**Scope:** بررسی static کد برای اطمینان از اینکه async session management با FastAPI dependency injection کار می‌کند. این شامل جستجوی الگوهای 'async with session' در فایل‌های routes است. خارج از این مرحله: تغییر کد یا تست. نکته حیاتی: این مرحله صرفاً تأیید static است و نیازی به تغییر کد ندارد.
**Excerpt:**
```
- Async session management works with FastAPI dependency injection [verify_method=static] [verify_plan={"grep_patterns": ["AsyncSession", "async_sessionmaker", "async with session"], "files_hint": ["app/database.py"]}]
```

### Step 10: اجرای دستورات اعتبارسنجی برای تسک 2 (locust و pytest)
**Status:** `not_done` (0%)
**Scope:** اجرای دستورات اعتبارسنجی مشخص شده برای تسک 2: locust -f tests/locustfile.py --headless -u 100 -r 10 و pytest tests/test_database.py -k pool. این مرحله تضمین می‌کند که تغییرات connection pool و async support به درستی کار می‌کنند. خارج از این مرحله: تغییر کد یا تست. نکته حیاتی: locust باید 100 کاربر همزمان را شبیه‌سازی کند.
**Excerpt:**
```
🧪 دستورات اعتبارسنجی
- `locust -f tests/locustfile.py --headless -u 100 -r 10`
- `pytest tests/test_database.py -k pool`
```

### Step 11: بررسی وابستگی‌ها و نصب asyncpg در صورت نیاز
**Status:** `done` (100%)
**Scope:** بررسی فایل requirements.txt یا pyproject.toml برای اطمینان از وجود asyncpg به عنوان وابستگی. اگر asyncpg نصب نیست، آن را به فایل وابستگی اضافه کنید. خارج از این مرحله: تغییر کد اصلی یا تست. نکته حیاتی: asyncpg برای async support با PostgreSQL ضروری است.
**Excerpt:**
```
May require asyncpg installation for async support.
```

### Step 12: بررسی و به‌روزرسانی app/config.py برای تنظیمات پایگاه داده
**Status:** `not_done` (0%)
**Scope:** بررسی فایل app/config.py برای اطمینان از وجود متغیرهای ASYNC_DATABASE_URL و سایر تنظیمات مورد نیاز برای async support. اگر وجود ندارند، آن‌ها را اضافه کنید. خارج از این مرحله: تغییر app/database.py یا تست. نکته حیاتی: ASYNC_DATABASE_URL باید با فرمت asyncpg سازگار باشد.
**Excerpt:**
```
app/config.py (سطر 1) — Database configuration settings
```

### Step 13: بررسی و به‌روزرسانی app/main.py برای استفاده از async engine
**Status:** `done` (100%)
**Scope:** بررسی فایل app/main.py برای اطمینان از اینکه async engine به درستی در startup برنامه مقداردهی می‌شود. اگر نیاز به تغییر است، آن را اعمال کنید. خارج از این مرحله: تغییر app/database.py یا تست. نکته حیاتی: async engine باید قبل از شروع سرویس مقداردهی شود.
**Excerpt:**
```
app/main.py — Application startup that initializes database
```
