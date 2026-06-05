# TODO — Task task_882 (نیاز به تکمیل دستی)

> **بهینه‌سازی اتصال DB و اصلاح الگوهای طراحی**

## 🔎 خلاصه وضعیت

- **task_id**: `task_882723eb07de`
- **repo**: `mahdighandi1989/Lifemanager`
- **verification_status**: `partial`
- **archived_reason**: `max_retries` — Claude به سقف retry رسید بدون اینکه verify=done شود
- **retries_done**: 1
- **verifier confidence**: 0.92
- **verifier model**: `—`
- **report_id**: `00db3821-98d1-4f62-a50a-da944d29fb77`
- **created_at**: 2026-06-05T06:12:05.595639+00:00

## 🚧 چه چیزی باقی مانده (مهم‌ترین بخش)

- [ ] تست edge case برای schema evolution در tests/test_database_schema.py نوشته نشده
- [ ] تست concurrent connections (100 درخواست همزمان) در tests/test_database.py نوشته نشده
- [ ] endpoint /api/oversight/status با بازگشت 503 در صورت connection timeout پیاده‌سازی نشده
- [ ] دستورات اعتبارسنجی (py_compile, ruff, pytest) برای تسک 1 اجرا نشده
- [ ] دستورات اعتبارسنجی (locust, pytest) برای تسک 2 اجرا نشده

## 👉 قدم‌های بعدی پیشنهادی (از verifier)

1. نوشتن تست test_schema_evolution_edge_case در tests/test_database_schema.py
2. نوشتن تست test_concurrent_connections در tests/test_database.py
3. پیاده‌سازی منطق connection timeout با بازگشت 503 در endpoint /api/oversight/status
4. اجرای python -m py_compile app/database.py و ruff check و pytest -x
5. اجرای locust -f tests/locustfile.py --headless -u 100 -r 10 و pytest tests/test_database.py -k pool

## ✅ چه چیزی Claude انجام داد

- [x] ریشه anti-pattern Under-engineering در app/database.py تشخیص داده و مستند شده
- [x] کامنت توجیهی برای استفاده از create_all در محیط غیرتولید اضافه شده
- [x] پیکربندی connection pool با pool_size, max_overflow, pool_recycle, pool_pre_ping انجام شده
- [x] async engine و async session management با asyncpg پیاده‌سازی شده
- [x] async session management با FastAPI dependency injection (get_db) کار می‌کند
- [x] وابستگی asyncpg در requirements.txt یا pyproject.toml اضافه شده
- [x] تنظیمات ASYNC_DATABASE_URL در app/config.py بررسی و به‌روزرسانی شده
- [x] app/main.py برای استفاده از async engine در startup به‌روزرسانی شده

## 📝 خلاصهٔ verifier

بخش عمده‌ای از بهینه‌سازی اتصال DB و اصلاح الگوهای طراحی انجام شده: تشخیص anti-pattern، افزودن کامنت توجیهی، پیکربندی connection pool، پیاده‌سازی async session management با asyncpg، و به‌روزرسانی تنظیمات و main.py. اما تست‌های edge case و concurrent connections نوشته نشده، endpoint 503 پیاده‌سازی نشده، و دستورات اعتبارسنجی اجرا نشده‌اند.

## 📋 Acceptance Criteria (مرجع کامل)

این لیست معیار done شدن تسک است — هر آیتمی که هنوز satisfy نیست
باید توسط انسان تکمیل شود.

- Connection pool handles 100 concurrent requests without errors
- Pool connections are recycled every hour to prevent stale connections
- Connection timeout returns 503 error after 30 seconds
- Async session management works with FastAPI dependency injection
- ریشه anti-pattern تشخیص داده شد
- یا کد اصلاح شد، یا کامنت توجیهی اضافه شد
- تست edge case نوشته شد

## 🔬 Evidence که verifier پیدا کرد

**Commits:**
- `a684df6`
- `c1457ec`
- `0bcbe7a`
- `64c7254`
- `2769910`

**Files lams شده:**
- `app/database.py`
- `app/config.py`
- `app/main.py`

## 💡 ایدهٔ اصلی تسک

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
- ممکن است

---

_این فایل توسط Claude Auto-Runner تولید شده است. تسک با حالت_ `max_retries` _آرشیو شده و دیگر به‌صورت خودکار pickup نمی‌شود._