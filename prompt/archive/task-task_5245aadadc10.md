---
task_id: task_5245aadadc10
title: رفع Race Condition و افزودن نوتیفیکیشن 'verify_failed'
type: other
priority: high
execution_priority: 100
status: awaiting_review
external_status: pending
verification_status: partial
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-25T06:43:35.670564+00:00'
updated_at: '2026-05-29T20:32:56.388039+00:00'
archived: true
archived_at: '2026-05-25T21:03:33.873768+00:00'
tags:
- consolidated
- post_verify_merge
---

# رفع Race Condition و افزودن نوتیفیکیشن 'verify_failed'

## Raw Idea

🧬 این یک تسک تلفیقی است — از 3 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این خوشه شامل تسک‌هایی است که به طور خاص به سیستم نوتیفیکیشن مربوط می‌شوند، از جمله رفع Race Condition، افزودن نوتیفیکیشن برای رویدادهای جدید و پیاده‌سازی قابلیت‌های پردازش دسته‌ای و ردیابی تحویل نوتیفیکیشن‌ها. این تسک‌ها عمدتاً فایل app/services/notification_service.py را درگیر می‌کنند.
🎯 theme: بهبود و توسعه سیستم نوتیفیکیشن
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 3
  id: 96644328-fca9-46c0-8492-8ae7f432390b
  عنوان اصلی: Resolve notification race condition
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/notification_service.py

📋 acceptance_criteria کامل:
  - Two concurrent workers do not send duplicate notifications [verify_method=backend_test] [verify_plan={"test_node": "tests/test_notification_service.py::test_concurrent_workers_no_duplicate", "timeout_seconds": 60}]
  - Notification status is atomically updated [verify_method=backend_test] [verify_plan={"test_node": "tests/test_notification_service.py::test_atomic_status_update", "timeout_seconds": 60}]
  - Performance impact is acceptable (< 10% overhead) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]

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
Race condition in notification sending without transaction isolation

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/notification_service.py:30-55` — `send_pending_notifications` — Race condition in notification processing
  ```python
  pending = db.query(Notification).filter(Notification.status == 'pending').all()
  for notif in pending:
      # ⚠️ no lock between read and update
      send_notification(notif)
      notif.status = 'sent'
  db.commit()
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
SQLAlchemy + PostgreSQL + Celery

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/models/notification.py` (سطر 15) — Notification model definition
- `app/tasks.py` (سطر 40) — Celery task that calls this service

## 🌐 نقشهٔ وابستگی‌ها
Used by Celery workers for async notification delivery.

## 🔍 Context و وضعیت فعلی
The notification service sends notifications in a loop without database transaction isolation. If multiple workers process the same notification batch concurrently, duplicate notifications can be sent. The code reads pending notifications and marks them as sent in separate operations.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Two concurrent workers do not send duplicate notifications
- [ ] Notification status is atomically updated
- [ ] Performance impact is acceptable (< 10% overhead)
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Use SELECT ... FOR UPDATE or optimistic locking to prevent concurrent processing of the same notifications. Alternatively, use a distributed lock mechanism.

## 💡 نمونه‌های قبل/بعد
**Add row-level lock**

_قبل:_
```
pending = db.query(Notification).filter(Notification.status == 'pending').all()
```

_بعد:_
```
pending = db.query(Notification).filter(Notification.status == 'pending').with_for_update().all()
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_notifications.py -k test_concurrent_sending`
- `celery -A app.celery_app inspect active`

## ⚠️ ریسک‌ها و موارد احتیاط
May cause deadlocks if not implemented carefully; need timeout on lock

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 3
  id: dd58cd1c-db92-4ab0-bfa5-c7355cd0c725
  عنوان اصلی: افزودن نوتیفیکیشن برای event 'verify_failed'
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\\(\"verify_failed\""], "files_hint": ["backend/app/"]}]
  - message template فارسی و معنادار است [verify_method=static] [verify_plan={"grep_patterns": ["verify_failed"], "files_hint": ["backend/app/"]}]
  - silent=False + priority="high" [verify_method=static] [verify_plan={"grep_patterns": ["silent=False", "priority=\"high\""], "files_hint": ["backend/app/"]}]
  - تست: trigger مصنوعی → notification در Telegram دیده می‌شود [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]

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
event critical 'verify_failed' هیچ notification ندارد

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🌐 نقشهٔ وابستگی‌ها
این مورد روی notification pipeline تأثیر می‌گذارد — همه consumer های این event باید چک شوند.

## 🔍 Context و وضعیت فعلی
## 📋 شرح (severity: high)
event `verify_failed` در سیستم به‌عنوان critical شناخته شده ولی هیچ `notify_event` call برای آن پیدا نشد.

## 🤔 چرا مهم است
critical event بدون notification یعنی کاربر هرگز از وقوع آن باخبر نمی‌شود. اگر «task failed» critical است ولی notification ندارد، کاربر روزها نمی‌فهمد سیستم خاموش بوده.

## 🔍 جزئیات
- علت: event critical 'verify_failed' هیچ notification ندارد
- پیشنهاد: اضافه کردن notify_event برای 'verify_failed' در failure handler مربوطه

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد
- [ ] message template فارسی و معنادار است
- [ ] silent=False + priority="high"
- [ ] تست: trigger مصنوعی → notification در Telegram دیده می‌شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: محل وقوع `verify_failed` در کد را پیدا کن.
گام ۲: `notification_service.notify_event("verify_failed", message, silent=False, priority="high", ...)` اضافه کن.
گام ۳: template message فارسی معنادار بنویس.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
اگر event پر-تکرار است، rate-limit اضافه کن تا spam نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: notification_audit
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 3
  id: 769bd4d2-80ff-4c5f-8eaa-aed986ca98e7
  عنوان اصلی: Implement notification batch processing and delivery tracking
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/services/notification_service.py

📋 acceptance_criteria کامل:
  - Notifications can be sent in batches (10+ at once) [verify_method=static] [verify_plan={"grep_patterns": ["def send_batch_notifications", "def batch_send", "List\\[Notification\\]", "notifications\\s*:\\s*list"], "files_hint": ["app/services/notification_service.py"]}]
  - Failed notifications are retried up to 3 times with backoff [verify_method=static] [verify_plan={"grep_patterns": ["retry", "backoff", "max_retries", "RETRY_LIMIT", "time\\.sleep", "exponential_backoff"], "files_hint": ["app/services/notification_service.py"]}]
  - Notification status is trackable via API [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/notifications/status", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["status", "sent", "failed", "pending"], "json_contains": null}]
  - Batch processing reduces API calls by 80% for bulk notifications [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]

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
Notification service missing batch processing and delivery status tracking

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/notification_service.py:1-60` — `send_notification` — No batch processing or status tracking
  ```python
  async def send_notification(notification):
      # Sends individually, no batch support
      await email_service.send(notification)
      return True
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + Celery + SQLAlchemy + Email/SMS service

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/models/notification.py` (سطر 1) — Model needs status field
- `app/routes/notifications.py` — API endpoints for notification management
- `app/tasks.py` — Celery tasks for async processing

## 🌐 نقشهٔ وابستگی‌ها
Requires Celery task queue. Changes to notification model require database migration.

## 🔍 Context و وضعیت فعلی
The notification service at app/services/notification_service.py appears to handle notifications individually without batch processing capabilities. There's no delivery status tracking (sent, failed, pending) or retry mechanism for failed deliveries. This could lead to performance issues with high notification volumes and no visibility into delivery failures.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Notifications can be sent in batches (10+ at once)
- [ ] Failed notifications are retried up to 3 times with backoff
- [ ] Notification status is trackable via API
- [ ] Batch processing reduces API calls by 80% for bulk notifications
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Implement batch notification processing using Celery tasks. Add a notification status field to the model (pending, sent, failed, read). Create a retry mechanism with exponential backoff for failed notifications. Add webhook delivery confirmation.

## 💡 نمونه‌های قبل/بعد
**Add batch processing and status tracking**

_قبل:_
```
async def send_notification(notification):
    await email_service.send(notification)
    return True
```

_بعد:_
```
@celery.task(bind=True, max_retries=3)
def send_notification_batch(self, notification_ids):
    notifications = Notification.query.filter(Notification.id.in_(notification_ids))
    for notification in notifications:
        try:
            await email_service.send(notification)
            notification.status = 'sent'
        except Exception as e:
            notification.status = 'failed'
            notification.error_message = str(e)
            self.retry(countdown=60 * 2 ** self.request.retries)
    db.session.commit()
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -X POST http://localhost:8000/api/notifications/batch -d '{"user_ids": [1,2,3,4,5], "message": "test"}'`
- `pytest tests/test_notifications.py -k batch`

## ⚠️ ریسک‌ها و موارد احتیاط
Database migration needed for status field; Celery setup required; may affect existing notification flow

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: large

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
- در commit message: `merged-from: 96644328-fca9-46c0-8492-8ae7f432390b, dd58cd1c-db92-4ab0-bfa5-c7355cd0c725, 769bd4d2-80ff-4c5f-8eaa-aed986ca98e7`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 3 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این خوشه شامل تسک‌هایی است که به طور خاص به سیستم نوتیفیکیشن مربوط می‌شوند، از جمله رفع Race Condition، افزودن نوتیفیکیشن برای رویدادهای جدید و پیاده‌سازی قابلیت‌های پردازش دسته‌ای و ردیابی تحویل نوتیفیکیشن‌ها. این تسک‌ها عمدتاً فایل app/services/notification_service.py را درگیر می‌کنند.
🎯 theme: بهبود و توسعه سیستم نوتیفیکیشن
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 3
  id: 96644328-fca9-46c0-8492-8ae7f432390b
  عنوان اصلی: Resolve notification race condition
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/notification_service.py

📋 acceptance_criteria کامل:
  - Two concurrent workers do not send duplicate notifications [verify_method=backend_test] [verify_plan={"test_node": "tests/test_notification_service.py::test_concurrent_workers_no_duplicate", "timeout_seconds": 60}]
  - Notification status is atomically updated [verify_method=backend_test] [verify_plan={"test_node": "tests/test_notification_service.py::test_atomic_status_update", "timeout_seconds": 60}]
  - Performance impact is acceptable (< 10% overhead) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]

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
Race condition in notification sending without transaction isolation

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/notification_service.py:30-55` — `send_pending_notifications` — Race condition in notification processing
  ```python
  pending = db.query(Notification).filter(Notification.status == 'pending').all()
  for notif in pending:
      # ⚠️ no lock between read and update
      send_notification(notif)
      notif.status = 'sent'
  db.commit()
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
SQLAlchemy + PostgreSQL + Celery

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/models/notification.py` (سطر 15) — Notification model definition
- `app/tasks.py` (سطر 40) — Celery task that calls this service

## 🌐 نقشهٔ وابستگی‌ها
Used by Celery workers for async notification delivery.

## 🔍 Context و وضعیت فعلی
The notification service sends notifications in a loop without database transaction isolation. If multiple workers process the same notification batch concurrently, duplicate notifications can be sent. The code reads pending notifications and marks them as sent in separate operations.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Two concurrent workers do not send duplicate notifications
- [ ] Notification status is atomically updated
- [ ] Performance impact is acceptable (< 10% overhead)
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Use SELECT ... FOR UPDATE or optimistic locking to prevent concurrent processing of the same notifications. Alternatively, use a distributed lock mechanism.

## 💡 نمونه‌های قبل/بعد
**Add row-level lock**

_قبل:_
```
pending = db.query(Notification).filter(Notification.status == 'pending').all()
```

_بعد:_
```
pending = db.query(Notification).filter(Notification.status == 'pending').with_for_update().all()
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_notifications.py -k test_concurrent_sending`
- `celery -A app.celery_app inspect active`

## ⚠️ ریسک‌ها و موارد احتیاط
May cause deadlocks if not implemented carefully; need timeout on lock

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 3
  id: dd58cd1c-db92-4ab0-bfa5-c7355cd0c725
  عنوان اصلی: افزودن نوتیفیکیشن برای event 'verify_failed'
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\\(\"verify_failed\""], "files_hint": ["backend/app/"]}]
  - message template فارسی و معنادار است [verify_method=static] [verify_plan={"grep_patterns": ["verify_failed"], "files_hint": ["backend/app/"]}]
  - silent=False + priority="high" [verify_method=static] [verify_plan={"grep_patterns": ["silent=False", "priority=\"high\""], "files_hint": ["backend/app/"]}]
  - تست: trigger مصنوعی → notification در Telegram دیده می‌شود [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]

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
event critical 'verify_failed' هیچ notification ندارد

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🌐 نقشهٔ وابستگی‌ها
این مورد روی notification pipeline تأثیر می‌گذارد — همه consumer های این event باید چک شوند.

## 🔍 Context و وضعیت فعلی
## 📋 شرح (severity: high)
event `verify_failed` در سیستم به‌عنوان critical شناخته شده ولی هیچ `notify_event` call برای آن پیدا نشد.

## 🤔 چرا مهم است
critical event بدون notification یعنی کاربر هرگز از وقوع آن باخبر نمی‌شود. اگر «task failed» critical است ولی notification ندارد، کاربر روزها نمی‌فهمد سیستم خاموش بوده.

## 🔍 جزئیات
- علت: event critical 'verify_failed' هیچ notification ندارد
- پیشنهاد: اضافه کردن notify_event برای 'verify_failed' در failure handler مربوطه

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد
- [ ] message template فارسی و معنادار است
- [ ] silent=False + priority="high"
- [ ] تست: trigger مصنوعی → notification در Telegram دیده می‌شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: محل وقوع `verify_failed` در کد را پیدا کن.
گام ۲: `notification_service.notify_event("verify_failed", message, silent=False, priority="high", ...)` اضافه کن.
گام ۳: template message فارسی معنادار بنویس.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
اگر event پر-تکرار است، rate-limit اضافه کن تا spam نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: notification_audit
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 3
  id: 769bd4d2-80ff-4c5f-8eaa-aed986ca98e7
  عنوان اصلی: Implement notification batch processing and delivery tracking
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/services/notification_service.py

📋 acceptance_criteria کامل:
  - Notifications can be sent in batches (10+ at once) [verify_method=static] [verify_plan={"grep_patterns": ["def send_batch_notifications", "def batch_send", "List\\[Notification\\]", "notifications\\s*:\\s*list"], "files_hint": ["app/services/notification_service.py"]}]
  - Failed notifications are retried up to 3 times with backoff [verify_method=static] [verify_plan={"grep_patterns": ["retry", "backoff", "max_retries", "RETRY_LIMIT", "time\\.sleep", "exponential_backoff"], "files_hint": ["app/services/notification_service.py"]}]
  - Notification status is trackable via API [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/notifications/status", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["status", "sent", "failed", "pending"], "json_contains": null}]
  - Batch processing reduces API calls by 80% for bulk notifications [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]

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
Notification service missing batch processing and delivery status tracking

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/notification_service.py:1-60` — `send_notification` — No batch processing or status tracking
  ```python
  async def send_notification(notification):
      # Sends individually, no batch support
      await email_service.send(notification)
      return True
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + Celery + SQLAlchemy + Email/SMS service

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/models/notification.py` (سطر 1) — Model needs status field
- `app/routes/notifications.py` — API endpoints for notification management
- `app/tasks.py` — Celery tasks for async processing

## 🌐 نقشهٔ وابستگی‌ها
Requires Celery task queue. Changes to notification model require database migration.

## 🔍 Context و وضعیت فعلی
The notification service at app/services/notification_service.py appears to handle notifications individually without batch processing capabilities. There's no delivery status tracking (sent, failed, pending) or retry mechanism for failed deliveries. This could lead to performance issues with high notification volumes and no visibility into delivery failures.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Notifications can be sent in batches (10+ at once)
- [ ] Failed notifications are retried up to 3 times with backoff
- [ ] Notification status is trackable via API
- [ ] Batch processing reduces API calls by 80% for bulk notifications
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Implement batch notification processing using Celery tasks. Add a notification status field to the model (pending, sent, failed, read). Create a retry mechanism with exponential backoff for failed notifications. Add webhook delivery confirmation.

## 💡 نمونه‌های قبل/بعد
**Add batch processing and status tracking**

_قبل:_
```
async def send_notification(notification):
    await email_service.send(notification)
    return True
```

_بعد:_
```
@celery.task(bind=True, max_retries=3)
def send_notification_batch(self, notification_ids):
    notifications = Notification.query.filter(Notification.id.in_(notification_ids))
    for notification in notifications:
        try:
            await email_service.send(notification)
            notification.status = 'sent'
        except Exception as e:
            notification.status = 'failed'
            notification.error_message = str(e)
            self.retry(countdown=60 * 2 ** self.request.retries)
    db.session.commit()
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -X POST http://localhost:8000/api/notifications/batch -d '{"user_ids": [1,2,3,4,5], "message": "test"}'`
- `pytest tests/test_notifications.py -k batch`

## ⚠️ ریسک‌ها و موارد احتیاط
Database migration needed for status field; Celery setup required; may affect existing notification flow

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: large

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
- در commit message: `merged-from: 96644328-fca9-46c0-8492-8ae7f432390b, dd58cd1c-db92-4ab0-bfa5-c7355cd0c725, 769bd4d2-80ff-4c5f-8eaa-aed986ca98e7`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. Two concurrent workers do not send duplicate notifications _(verify: backend_test)_
2. Notification status is atomically updated _(verify: backend_test)_
3. Performance impact is acceptable (< 10% overhead) _(verify: manual_only)_
4. `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد _(verify: static)_
5. message template فارسی و معنادار است _(verify: static)_
6. silent=False + priority="high" _(verify: static)_
7. تست: trigger مصنوعی → notification در Telegram دیده می‌شود _(verify: manual_only)_
8. Notifications can be sent in batches (10+ at once) _(verify: static)_
9. Failed notifications are retried up to 3 times with backoff _(verify: static)_
10. Notification status is trackable via API _(verify: api_response)_
11. Batch processing reduces API calls by 80% for bulk notifications _(verify: manual_only)_

## Task Steps

### Step 1: بررسی اولیه و تحلیل کد موجود برای رفع Race Condition
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی کامل کد موجود در فایل app/services/notification_service.py برای یافتن بخش‌های مرتبط با Race Condition است. باید با grep/search و خواندن فایل‌های مرتبط، وضعیت فعلی پیاده‌سازی را مشخص کرد. خارج از این مرحله، اعمال هرگونه تغییر در کد است. نکته حیاتی: قبل از هر اقدامی، باید مطمئن شویم که آیا بخشی از این قابلیت قبلاً پیاده‌سازی شده است یا خیر.
**Excerpt:**
```
♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.
```

### Step 2: پیاده‌سازی قفل سطح ردیف (SELECT ... FOR UPDATE) برای جلوگیری از ارسال نوتیفیکیشن تکراری
**Status:** `done` (100%)
**Scope:** این مرحله شامل تغییر کد در فایل app/services/notification_service.py برای افزودن قفل سطح ردیف با استفاده از `with_for_update()` است. هدف این است که دو worker هم‌زمان نتوانند نوتیفیکیشن‌های تکراری ارسال کنند. خارج از این مرحله، پیاده‌سازی optimistic locking یا distributed lock است. نکته حیاتی: باید timeout روی lock در نظر گرفته شود تا از deadlock جلوگیری شود.
**Excerpt:**
```
## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/notification_service.py:30-55` — `send_pending_notifications` — Race condition in notification processing
  ```python
  pending = db.query(Notification).filter(Notification.status == 'pending').all()
  for notif in pending:
      # ⚠️ no lock between read and update
      send_notification(notif)
      notif.status = 'sent'
  db.commit()
  ```
```

### Step 3: اطمینان از به‌روزرسانی اتمیک وضعیت نوتیفیکیشن
**Status:** `done` (100%)
**Scope:** این مرحله شامل اطمینان از اینکه عملیات خواندن و به‌روزرسانی وضعیت نوتیفیکیشن به صورت اتمیک انجام می‌شود. باید بررسی شود که تغییر وضعیت نوتیفیکیشن به 'sent' در همان تراکنش و با استفاده از قفل انجام شود. خارج از این مرحله، تغییر در مدل نوتیفیکیشن یا ساختار دیتابیس است. نکته حیاتی: باید از atomicity عملیات در سطح دیتابیس اطمینان حاصل شود.
**Excerpt:**
```
- [ ] Notification status is atomically updated [verify_method=backend_test] [verify_plan={"test_node": "tests/test_notification_service.py::test_atomic_status_update", "timeout_seconds": 60}]
```

### Step 4: بررسی دستی Performance Impact (کمتر از 10% overhead)
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی دستی تأثیر عملکردی تغییرات اعمال‌شده است. باید اطمینان حاصل شود که اضافه کردن قفل سطح ردیف باعث کاهش عملکرد بیش از 10% نشده است. خارج از این مرحله، انجام تست‌های خودکار performance است. نکته حیاتی: این بررسی به صورت دستی و با بازبینی کد و تست‌های عملکردی انجام می‌شود.
**Excerpt:**
```
- [ ] Performance impact is acceptable (< 10% overhead) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
```

### Step 5: بررسی اولیه و تحلیل کد موجود برای افزودن نوتیفیکیشن رویداد verify_failed
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی کامل کد موجود برای یافتن محل وقوع رویداد 'verify_failed' است. باید با grep/search و خواندن فایل‌های مرتبط، مکان دقیق وقوع این رویداد را پیدا کرد. خارج از این مرحله، اعمال هرگونه تغییر در کد است. نکته حیاتی: قبل از هر اقدامی، باید مطمئن شویم که آیا notify_event برای این رویداد قبلاً اضافه شده است یا خیر.
**Excerpt:**
```
♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.
```

### Step 6: اضافه کردن notify_event("verify_failed", ...) در محل وقوع رویداد
**Status:** `done` (100%)
**Scope:** این مرحله شامل اضافه کردن فراخوانی تابع `notify_event("verify_failed", ...)` در نقطه وقوع رویداد verify_failed است. باید محل دقیق وقوع این رویداد در کد پیدا شود و فراخوانی مناسب اضافه شود. خارج از این مرحله، نوشتن message template یا تنظیم silent و priority است. نکته حیاتی: باید از وجود تابع notify_event و نحوه استفاده از آن اطمینان حاصل شود.
**Excerpt:**
```
- [ ] `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\\(\"verify_failed\""], "files_hint": ["backend/app/"]}]
```

### Step 7: نوشتن message template فارسی و معنادار برای رویداد verify_failed
**Status:** `done` (100%)
**Scope:** این مرحله شامل نوشتن یک پیام template به زبان فارسی و معنادار برای رویداد verify_failed است. پیام باید به کاربر توضیح دهد که چه اتفاقی افتاده است. خارج از این مرحله، اضافه کردن notify_event یا تنظیم silent و priority است. نکته حیاتی: پیام باید واضح، مختصر و مفید باشد.
**Excerpt:**
```
- [ ] message template فارسی و معنادار است [verify_method=static] [verify_plan={"grep_patterns": ["verify_failed"], "files_hint": ["backend/app/"]}]
```

### Step 8: تنظیم silent=False و priority="high" برای notify_event verify_failed
**Status:** `done` (100%)
**Scope:** این مرحله شامل تنظیم پارامترهای `silent=False` و `priority="high"` در فراخوانی `notify_event` برای رویداد verify_failed است. خارج از این مرحله، اضافه کردن notify_event یا نوشتن message template است. نکته حیاتی: این تنظیمات تضمین می‌کند که نوتیفیکیشن به صورت صریح و با اولویت بالا ارسال شود.
**Excerpt:**
```
- [ ] silent=False + priority="high" [verify_method=static] [verify_plan={"grep_patterns": ["silent=False", "priority=\"high\""], "files_hint": ["backend/app/"]}]
```

### Step 9: تست دستی: trigger مصنوعی رویداد verify_failed و مشاهده نوتیفیکیشن در Telegram
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل تست دستی با ایجاد یک trigger مصنوعی برای رویداد verify_failed و مشاهده نوتیفیکیشن در Telegram است. خارج از این مرحله، نوشتن تست خودکار است. نکته حیاتی: این تست به صورت دستی و با بازبینی خروجی Telegram انجام می‌شود.
**Excerpt:**
```
- [ ] تست: trigger مصنوعی → notification در Telegram دیده می‌شود [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
```

### Step 10: بررسی اولیه و تحلیل کد موجود برای پیاده‌سازی Batch Processing و Delivery Tracking
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی کامل کد موجود در فایل app/services/notification_service.py برای یافتن بخش‌های مرتبط با batch processing و delivery tracking است. باید با grep/search و خواندن فایل‌های مرتبط، وضعیت فعلی پیاده‌سازی را مشخص کرد. خارج از این مرحله، اعمال هرگونه تغییر در کد است. نکته حیاتی: قبل از هر اقدامی، باید مطمئن شویم که آیا بخشی از این قابلیت قبلاً پیاده‌سازی شده است یا خیر.
**Excerpt:**
```
♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.
```

### Step 11: پیاده‌سازی تابع send_batch_notifications برای ارسال دسته‌ای نوتیفیکیشن‌ها
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیاده‌سازی تابع `send_batch_notifications` در فایل app/services/notification_service.py است که بتواند 10+ نوتیفیکیشن را به صورت همزمان ارسال کند. خارج از این مرحله، پیاده‌سازی مکانیزم retry یا tracking status است. نکته حیاتی: تابع باید از نوع Celery task باشد و بتواند لیستی از notification IDs را دریافت کند.
**Excerpt:**
```
- [ ] Notifications can be sent in batches (10+ at once) [verify_method=static] [verify_plan={"grep_patterns": ["def send_batch_notifications", "def batch_send", "List\\[Notification\\]", "notifications\\s*:\\s*list"], "files_hint": ["app/services/notification_service.py"]}]
```

### Step 12: پیاده‌سازی مکانیزم Retry با Backoff برای نوتیفیکیشن‌های ناموفق
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیاده‌سازی مکانیزم retry با backoff برای نوتیفیکیشن‌های ناموفق است. باید حداکثر 3 بار تلاش مجدد با استفاده از exponential backoff انجام شود. خارج از این مرحله، پیاده‌سازی تابع send_batch_notifications یا tracking status است. نکته حیاتی: باید از max_retries و countdown مناسب استفاده شود.
**Excerpt:**
```
- [ ] Failed notifications are retried up to 3 times with backoff [verify_method=static] [verify_plan={"grep_patterns": ["retry", "backoff", "max_retries", "RETRY_LIMIT", "time\\.sleep", "exponential_backoff"], "files_hint": ["app/services/notification_service.py"]}]
```

### Step 13: ایجاد API endpoint برای ردیابی وضعیت نوتیفیکیشن‌ها
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد یک API endpoint در فایل app/routes/notifications.py برای ردیابی وضعیت نوتیفیکیشن‌ها است. endpoint باید از نوع GET و در مسیر /api/notifications/status باشد و وضعیت‌های 'sent', 'failed', 'pending' را برگرداند. خارج از این مرحله، پیاده‌سازی تابع send_batch_notifications یا مکانیزم retry است. نکته حیاتی: پاسخ باید شامل فیلدهای required_fields باشد.
**Excerpt:**
```
- [ ] Notification status is trackable via API [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/notifications/status", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["status", "sent", "failed", "pending"], "json_contains": null}]
```

### Step 14: بررسی دستی کاهش 80% فراخوانی‌های API با Batch Processing
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی دستی تأثیر batch processing بر کاهش تعداد فراخوانی‌های API است. باید اطمینان حاصل شود که batch processing تعداد فراخوانی‌های API را برای نوتیفیکیشن‌های حجیم تا 80% کاهش می‌دهد. خارج از این مرحله، انجام تست‌های خودکار performance است. نکته حیاتی: این بررسی به صورت دستی و با بازبینی کد و مقایسه تعداد فراخوانی‌ها انجام می‌شود.
**Excerpt:**
```
- [ ] Batch processing reduces API calls by 80% for bulk notifications [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
```

### Step 15: اجرای تست‌های موجود و اطمینان از عدم شکست آن‌ها
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تمام تست‌های موجود (pytest) و اطمینان از عدم شکست آن‌ها پس از اعمال تغییرات است. خارج از این مرحله، نوشتن تست‌های جدید است. نکته حیاتی: باید از دستور `pytest` برای اجرای تست‌ها استفاده شود.
**Excerpt:**
```
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
```

### Step 16: اجرای linter و اطمینان از عبور بدون warning
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای linter (مانند flake8 یا pylint) و اطمینان از عبور بدون warning است. خارج از این مرحله، اصلاح خطاهای linter است. نکته حیاتی: باید از تنظیمات linter پروژه استفاده شود.
**Excerpt:**
```
- [ ] linter بدون warning عبور می‌کند
```

### Step 17: اجرای type-check و اطمینان از موفقیت آن
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای type-check (مانند mypy) و اطمینان از موفقیت آن است. خارج از این مرحله، اصلاح خطاهای type-check است. نکته حیاتی: باید از تنظیمات type-check پروژه استفاده شود.
**Excerpt:**
```
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)
```

### Step 18: بررسی و اطمینان از عدم وجود deadlock در پیاده‌سازی قفل
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی دستی کد برای اطمینان از عدم وجود deadlock در پیاده‌سازی قفل سطح ردیف است. باید timeout مناسب روی lock تنظیم شود. خارج از این مرحله، تغییر در منطق قفل‌گذاری است. نکته حیاتی: deadlock می‌تواند باعث توقف کامل سیستم شود.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
May cause deadlocks if not implemented carefully; need timeout on lock
```

### Step 19: بررسی و اطمینان از عدم spam شدن کاربر با نوتیفیکیشن‌های verify_failed
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی دستی کد برای اطمینان از عدم spam شدن کاربر با نوتیفیکیشن‌های verify_failed است. اگر رویداد پرتکرار است، باید rate-limit اضافه شود. خارج از این مرحله، تغییر در منطق ارسال نوتیفیکیشن است. نکته حیاتی: spam می‌تواند باعث نارضایتی کاربر شود.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
اگر event پر-تکرار است، rate-limit اضافه کن تا spam نشود.
```

### Step 20: بررسی نیاز به migration دیتابیس برای فیلد status
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی نیاز به migration دیتابیس برای افزودن فیلد status به مدل Notification است. اگر فیلد status وجود ندارد، باید migration ایجاد شود. خارج از این مرحله، ایجاد migration است. نکته حیاتی: تغییر در مدل دیتابیس نیاز به migration دارد.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
Database migration needed for status field; Celery setup required; may affect existing notification flow
```

### Step 21: بررسی و اطمینان از تنظیمات Celery برای پردازش async
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی و اطمینان از تنظیمات Celery برای پردازش async نوتیفیکیشن‌ها است. باید از وجود Celery app و تنظیمات مربوطه اطمینان حاصل شود. خارج از این مرحله، تغییر در تنظیمات Celery است. نکته حیاتی: Celery برای پردازش async ضروری است.
**Excerpt:**
```
## 🧱 پشتهٔ فناوری و معماری
SQLAlchemy + PostgreSQL + Celery
```

### Step 22: ثبت commit یا PR نهایی با پیام واضح و checklist
**Status:** `partial` (80%)
**Scope:** این مرحله شامل ثبت commit یا PR نهایی با پیام واضح و checklist از تمام تغییرات اعمال‌شده است. پیام commit باید شامل merged-from IDs باشد. خارج از این مرحله، اعمال تغییرات بیشتر است. نکته حیاتی: پیام commit باید واضح و جامع باشد.
**Excerpt:**
```
📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.
```
