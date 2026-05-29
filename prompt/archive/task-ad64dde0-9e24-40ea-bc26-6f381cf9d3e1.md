---
task_id: ad64dde0-9e24-40ea-bc26-6f381cf9d3e1
title: پیاده‌سازی ارسال ایمیل و زمان‌بندی در سرویس اعلان
type: feature_request
priority: medium
execution_priority: 100
status: awaiting_review
external_status: pending
verification_status: partial
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-19T20:23:42.485490+00:00'
updated_at: '2026-05-29T20:26:31.192327+00:00'
archived: true
archived_at: '2026-05-25T06:51:17.518581+00:00'
tags:
- merged
target_files:
- app/services/notification_service.py
---

# پیاده‌سازی ارسال ایمیل و زمان‌بندی در سرویس اعلان

## Raw Idea

فایل app/services/notification_service.py به نظر می‌رسد فقط متدهای پایه (create, get, delete) را پیاده‌سازی کرده است. قابلیت‌های مهمی مانند ارسال اعلان از طریق کانال‌های مختلف (ایمیل، push notification)، زمان‌بندی اعلان‌ها، و مدیریت اولویت‌ها پیاده‌سازی نشده است.

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
سرویس اعلان‌ها (notification_service) فقط ساختار پایه دارد

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/notification_service.py:1-80` — `NotificationService` — متد create_notification باید واقعاً اعلان را ارسال کند
  ```python
  class NotificationService:
      async def create_notification(self, user_id: int, message: str):
          # TODO: Implement real notification sending
          return {"status": "created"}
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + Celery + Redis (برای task queue)

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/models/notification.py` (سطر 1) — مدل اعلان که باید به‌روز شود
- `app/celery_app.py` (سطر 1) — برای زمان‌بندی اعلان‌ها

## 🌐 نقشهٔ وابستگی‌ها
این سرویس توسط routeهای notifications و tasks استفاده می‌شود. همچنین با planner_service برای یادآوری‌ها ارتباط دارد.

## 🔍 Context و وضعیت فعلی
فایل app/services/notification_service.py به نظر می‌رسد فقط متدهای پایه (create, get, delete) را پیاده‌سازی کرده است. قابلیت‌های مهمی مانند ارسال اعلان از طریق کانال‌های مختلف (ایمیل، push notification)، زمان‌بندی اعلان‌ها، و مدیریت اولویت‌ها پیاده‌سازی نشده است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] سرویس notification_service می‌تواند اعلان را از طریق ایمیل ارسال کند
- [ ] اعلان‌ها با استفاده از Celery زمان‌بندی می‌شوند
- [ ] مدل notification شامل فیلد channel و status است
- [ ] تست‌های واحد برای هر کانال ارسال اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تکمیل سرویس notification_service با قابلیت‌های: ارسال اعلان از طریق کانال‌های مختلف (ایمیل، SMS، push)، زمان‌بندی اعلان‌ها با استفاده از Celery، مدیریت اولویت‌ها و گروه‌بندی اعلان‌ها.

## 💡 نمونه‌های قبل/بعد
**پیاده‌سازی ارسال اعلان از طریق ایمیل**

_قبل:_
```
async def create_notification(self, user_id: int, message: str):
    return {"status": "created"}
```

_بعد:_
```
async def create_notification(self, user_id: int, message: str, channel: str = "email"):
    notification = await self.db.save(Notification(user_id=user_id, message=message, channel=channel))
    if channel == "email":
        send_email.delay(user_id, message)
    elif channel == "push":
        send_push.delay(user_id, message)
    return notification
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_notifications.py -v`
- `celery -A app.celery_app worker --loglevel=info`

## ⚠️ ریسک‌ها و موارد احتیاط
نیاز به تنظیمات SMTP برای ایمیل؛ وابستگی به سرویس‌های خارجی برای push notification

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: feature_request
- اولویت: medium
- تخمین زمان: large

## Acceptance Criteria

1. سرویس notification_service می‌تواند اعلان را از طریق ایمیل ارسال کند _(verify: static)_
2. اعلان‌ها با استفاده از Celery زمان‌بندی می‌شوند _(verify: static)_
3. مدل notification شامل فیلد channel و status است _(verify: static)_
4. تست‌های واحد برای هر کانال ارسال اضافه شود _(verify: backend_test)_
