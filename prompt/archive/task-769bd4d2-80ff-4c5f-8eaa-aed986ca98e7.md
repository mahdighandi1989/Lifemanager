---
task_id: 769bd4d2-80ff-4c5f-8eaa-aed986ca98e7
title: Implement notification batch processing and delivery tracking
type: refactor
priority: medium
execution_priority: 100
status: pending
external_status: pending
verification_status: pending
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-19T20:23:42.329998+00:00'
updated_at: '2026-05-29T20:26:04.037950+00:00'
archived: true
archived_at: '2026-05-25T06:43:51.786843+00:00'
tags:
- merged
target_files:
- app/services/notification_service.py
---

# Implement notification batch processing and delivery tracking

## Raw Idea

The notification service at app/services/notification_service.py appears to handle notifications individually without batch processing capabilities. There's no delivery status tracking (sent, failed, pending) or retry mechanism for failed deliveries. This could lead to performance issues with high notification volumes and no visibility into delivery failures.

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

## Acceptance Criteria

1. Notifications can be sent in batches (10+ at once) _(verify: static)_
2. Failed notifications are retried up to 3 times with backoff _(verify: static)_
3. Notification status is trackable via API _(verify: api_response)_
4. Batch processing reduces API calls by 80% for bulk notifications _(verify: manual_only)_
