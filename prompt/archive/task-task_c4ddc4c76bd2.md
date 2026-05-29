---
task_id: task_c4ddc4c76bd2
title: پیاده‌سازی ارسال ایمیل و انتزاع ذخیره‌سازی
type: other
priority: medium
execution_priority: 100
status: awaiting_review
external_status: pending
verification_status: partial
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-25T06:51:17.518562+00:00'
updated_at: '2026-05-29T20:33:11.209067+00:00'
archived: true
archived_at: '2026-05-26T17:08:15.143573+00:00'
tags:
- consolidated
- post_verify_merge
---

# پیاده‌سازی ارسال ایمیل و انتزاع ذخیره‌سازی

## Raw Idea

🧬 این یک تسک تلفیقی است — از 2 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها هر دو به پیاده‌سازی قابلیت‌های جدید و بنیادین در سرویس‌های اصلی سیستم می‌پردازند: یکی برای گسترش سرویس اعلان با امکانات ایمیل و زمان‌بندی، و دیگری برای ایجاد یک لایه انتزاعی برای مدیریت ذخیره‌سازی فایل‌ها.
🎯 theme: توسعه قابلیت‌های بنیادین سرویس‌ها
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 2
  id: ad64dde0-9e24-40ea-bc26-6f381cf9d3e1
  عنوان اصلی: پیاده‌سازی ارسال ایمیل و زمان‌بندی در سرویس اعلان
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/notification_service.py

📋 acceptance_criteria کامل:
  - سرویس notification_service می‌تواند اعلان را از طریق ایمیل ارسال کند [verify_method=static] [verify_plan={"grep_patterns": ["def send_email", "def send_notification.*email", "smtp", "send_mail"], "files_hint": ["app/services/notification_service.py"]}]
  - اعلان‌ها با استفاده از Celery زمان‌بندی می‌شوند [verify_method=static] [verify_plan={"grep_patterns": ["celery", "apply_async", "delay", "schedule", "beat"], "files_hint": ["app/services/notification_service.py"]}]
  - مدل notification شامل فیلد channel و status است [verify_method=static] [verify_plan={"grep_patterns": ["channel", "status"], "files_hint": ["app/models/notification.py"]}]
  - تست‌های واحد برای هر کانال ارسال اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_notification_service.py", "timeout_seconds": 60}]

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

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 2
  id: 44ddf42d-c215-44db-a374-1ddd821356ac
  عنوان اصلی: ایجاد Storage Abstraction برای فایل‌ها و attachmentها
  اولویت اصلی: low
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/services/__init__.py

📋 acceptance_criteria کامل:
  - یک interface StorageBackend با متدهای upload و download وجود دارد [verify_method=static] [verify_plan={"grep_patterns": ["class StorageBackend", "def upload", "def download"], "files_hint": ["app/services/__init__.py"]}]
  - پیاده‌سازی محلی (LocalStorage) و S3 (S3Storage) اضافه شده است [verify_method=static] [verify_plan={"grep_patterns": ["class LocalStorage", "class S3Storage"], "files_hint": ["app/services/__init__.py"]}]
  - می‌توان با تغییر یک متغیر محیطی بین آن‌ها سوئیچ کرد [verify_method=static] [verify_plan={"grep_patterns": ["STORAGE_BACKEND", "os.getenv", "LocalStorage", "S3Storage"], "files_hint": ["app/services/__init__.py"]}]

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
عدم وجود storage abstraction برای فایل‌ها و attachmentها

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/__init__.py:1-10` — `__init__` — فایل __init__ سرویس‌ها که باید storage_service را هم شامل شود
  ```python
  from .auth_service import *
  from .crypt_service import *
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
Python + boto3 (برای S3) + FastAPI

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/models/task.py` (سطر 1) — مدل Task که ممکن است به attachment نیاز داشته باشد
- `app/models/project.py` (سطر 1) — مدل Project که ممکن است به attachment نیاز داشته باشد

## 🌐 نقشهٔ وابستگی‌ها
اضافه کردن storage abstraction بر مدل‌ها و سرویس‌های مربوط به فایل تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
مدل Task و Project احتمالاً نیاز به attachment یا فایل دارند (بر اساس نام پروژه 'Lifemanager')، اما هیچ abstraction برای storage (محلی، S3، یا CDN) وجود ندارد. فایل app/services/crypt_service.py نشان می‌دهد که رمزنگاری وجود دارد اما برای storage نیست. این موضوع مقیاس‌پذیری را محدود می‌کند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] یک interface StorageBackend با متدهای upload و download وجود دارد
- [ ] پیاده‌سازی محلی (LocalStorage) و S3 (S3Storage) اضافه شده است
- [ ] می‌توان با تغییر یک متغیر محیطی بین آن‌ها سوئیچ کرد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک interface برای storage (مثلاً StorageBackend) ایجاد کنید و پیاده‌سازی‌های محلی و S3 را اضافه کنید. سپس از آن در سرویس‌های مربوطه استفاده کنید.

## 💡 نمونه‌های قبل/بعد
**ایجاد interface storage**

_قبل:_
```
# هیچ storage abstraction وجود ندارد
```

_بعد:_
```
class StorageBackend(ABC):
    @abstractmethod
    async def upload(self, file: UploadFile) -> str: ...
    @abstractmethod
    async def download(self, path: str) -> bytes: ...
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest app/tests/test_storage.py`
- `python -c 'from app.services.storage_service import LocalStorage; s = LocalStorage(); print(s.upload(...))'`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییرات backward-compatible هستند اگر interface به درستی طراحی شود

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: feature_request
- اولویت: low
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
- در commit message: `merged-from: ad64dde0-9e24-40ea-bc26-6f381cf9d3e1, 44ddf42d-c215-44db-a374-1ddd821356ac`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 2 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها هر دو به پیاده‌سازی قابلیت‌های جدید و بنیادین در سرویس‌های اصلی سیستم می‌پردازند: یکی برای گسترش سرویس اعلان با امکانات ایمیل و زمان‌بندی، و دیگری برای ایجاد یک لایه انتزاعی برای مدیریت ذخیره‌سازی فایل‌ها.
🎯 theme: توسعه قابلیت‌های بنیادین سرویس‌ها
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 2
  id: ad64dde0-9e24-40ea-bc26-6f381cf9d3e1
  عنوان اصلی: پیاده‌سازی ارسال ایمیل و زمان‌بندی در سرویس اعلان
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/notification_service.py

📋 acceptance_criteria کامل:
  - سرویس notification_service می‌تواند اعلان را از طریق ایمیل ارسال کند [verify_method=static] [verify_plan={"grep_patterns": ["def send_email", "def send_notification.*email", "smtp", "send_mail"], "files_hint": ["app/services/notification_service.py"]}]
  - اعلان‌ها با استفاده از Celery زمان‌بندی می‌شوند [verify_method=static] [verify_plan={"grep_patterns": ["celery", "apply_async", "delay", "schedule", "beat"], "files_hint": ["app/services/notification_service.py"]}]
  - مدل notification شامل فیلد channel و status است [verify_method=static] [verify_plan={"grep_patterns": ["channel", "status"], "files_hint": ["app/models/notification.py"]}]
  - تست‌های واحد برای هر کانال ارسال اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_notification_service.py", "timeout_seconds": 60}]

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

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 2
  id: 44ddf42d-c215-44db-a374-1ddd821356ac
  عنوان اصلی: ایجاد Storage Abstraction برای فایل‌ها و attachmentها
  اولویت اصلی: low
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/services/__init__.py

📋 acceptance_criteria کامل:
  - یک interface StorageBackend با متدهای upload و download وجود دارد [verify_method=static] [verify_plan={"grep_patterns": ["class StorageBackend", "def upload", "def download"], "files_hint": ["app/services/__init__.py"]}]
  - پیاده‌سازی محلی (LocalStorage) و S3 (S3Storage) اضافه شده است [verify_method=static] [verify_plan={"grep_patterns": ["class LocalStorage", "class S3Storage"], "files_hint": ["app/services/__init__.py"]}]
  - می‌توان با تغییر یک متغیر محیطی بین آن‌ها سوئیچ کرد [verify_method=static] [verify_plan={"grep_patterns": ["STORAGE_BACKEND", "os.getenv", "LocalStorage", "S3Storage"], "files_hint": ["app/services/__init__.py"]}]

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
عدم وجود storage abstraction برای فایل‌ها و attachmentها

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/__init__.py:1-10` — `__init__` — فایل __init__ سرویس‌ها که باید storage_service را هم شامل شود
  ```python
  from .auth_service import *
  from .crypt_service import *
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
Python + boto3 (برای S3) + FastAPI

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/models/task.py` (سطر 1) — مدل Task که ممکن است به attachment نیاز داشته باشد
- `app/models/project.py` (سطر 1) — مدل Project که ممکن است به attachment نیاز داشته باشد

## 🌐 نقشهٔ وابستگی‌ها
اضافه کردن storage abstraction بر مدل‌ها و سرویس‌های مربوط به فایل تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
مدل Task و Project احتمالاً نیاز به attachment یا فایل دارند (بر اساس نام پروژه 'Lifemanager')، اما هیچ abstraction برای storage (محلی، S3، یا CDN) وجود ندارد. فایل app/services/crypt_service.py نشان می‌دهد که رمزنگاری وجود دارد اما برای storage نیست. این موضوع مقیاس‌پذیری را محدود می‌کند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] یک interface StorageBackend با متدهای upload و download وجود دارد
- [ ] پیاده‌سازی محلی (LocalStorage) و S3 (S3Storage) اضافه شده است
- [ ] می‌توان با تغییر یک متغیر محیطی بین آن‌ها سوئیچ کرد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک interface برای storage (مثلاً StorageBackend) ایجاد کنید و پیاده‌سازی‌های محلی و S3 را اضافه کنید. سپس از آن در سرویس‌های مربوطه استفاده کنید.

## 💡 نمونه‌های قبل/بعد
**ایجاد interface storage**

_قبل:_
```
# هیچ storage abstraction وجود ندارد
```

_بعد:_
```
class StorageBackend(ABC):
    @abstractmethod
    async def upload(self, file: UploadFile) -> str: ...
    @abstractmethod
    async def download(self, path: str) -> bytes: ...
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest app/tests/test_storage.py`
- `python -c 'from app.services.storage_service import LocalStorage; s = LocalStorage(); print(s.upload(...))'`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییرات backward-compatible هستند اگر interface به درستی طراحی شود

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: feature_request
- اولویت: low
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
- در commit message: `merged-from: ad64dde0-9e24-40ea-bc26-6f381cf9d3e1, 44ddf42d-c215-44db-a374-1ddd821356ac`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. سرویس notification_service می‌تواند اعلان را از طریق ایمیل ارسال کند _(verify: static)_
2. اعلان‌ها با استفاده از Celery زمان‌بندی می‌شوند _(verify: static)_
3. مدل notification شامل فیلد channel و status است _(verify: static)_
4. تست‌های واحد برای هر کانال ارسال اضافه شود _(verify: backend_test)_
5. یک interface StorageBackend با متدهای upload و download وجود دارد _(verify: static)_
6. پیاده‌سازی محلی (LocalStorage) و S3 (S3Storage) اضافه شده است _(verify: static)_
7. می‌توان با تغییر یک متغیر محیطی بین آن‌ها سوئیچ کرد _(verify: static)_

## Task Steps

### Step 1: اضافه کردن متد send_email به NotificationService
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن متد send_email به کلاس NotificationService در فایل app/services/notification_service.py است. این متد باید ایمیل را با استفاده از SMTP یا سرویس ایمیل موجود ارسال کند. خارج از این مرحله: تغییر مدل Notification، اضافه کردن زمان‌بندی Celery، یا نوشتن تست. نکته حیاتی: از تنظیمات SMTP موجود در پروژه استفاده شود و متد به صورت async تعریف شود.
**Excerpt:**
```
- سرویس notification_service می‌تواند اعلان را از طریق ایمیل ارسال کند [verify_method=static] [verify_plan={"grep_patterns": ["def send_email", "def send_notification.*email", "smtp", "send_mail"], "files_hint": ["app/services/notification_service.py"]}]
```

### Step 2: اضافه کردن زمان‌بندی Celery به NotificationService
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن قابلیت زمان‌بندی اعلان‌ها با استفاده از Celery به NotificationService است. باید از celery_app و متدهای apply_async یا delay استفاده شود. خارج از این مرحله: تنظیمات Celery beat یا ایجاد taskهای جدید. نکته حیاتی: اطمینان از اینکه celery_app به درستی import شده است.
**Excerpt:**
```
- اعلان‌ها با استفاده از Celery زمان‌بندی می‌شوند [verify_method=static] [verify_plan={"grep_patterns": ["celery", "apply_async", "delay", "schedule", "beat"], "files_hint": ["app/services/notification_service.py"]}]
```

### Step 3: اضافه کردن فیلدهای channel و status به مدل Notification
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن فیلدهای channel و status به مدل Notification در فایل app/models/notification.py است. فیلد channel باید نوع کانال (email, push, sms) و فیلد status باید وضعیت (pending, sent, failed) را مشخص کند. خارج از این مرحله: تغییر سرویس notification_service یا نوشتن تست. نکته حیاتی: از Enum یا String با validation استفاده شود.
**Excerpt:**
```
- مدل notification شامل فیلد channel و status است [verify_method=static] [verify_plan={"grep_patterns": ["channel", "status"], "files_hint": ["app/models/notification.py"]}]
```

### Step 4: نوشتن تست‌های واحد برای هر کانال ارسال
**Status:** `partial` (75%)
**Scope:** این مرحله شامل نوشتن تست‌های واحد برای هر کانال ارسال (ایمیل، push، SMS) در فایل tests/test_notification_service.py است. تست‌ها باید با pytest اجرا شوند و timeout 60 ثانیه داشته باشند. خارج از این مرحله: تست‌های integration یا end-to-end. نکته حیاتی: از mock برای سرویس‌های خارجی استفاده شود.
**Excerpt:**
```
- تست‌های واحد برای هر کانال ارسال اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_notification_service.py", "timeout_seconds": 60}]
```

### Step 5: ایجاد interface StorageBackend با متدهای upload و download
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد یک کلاس انتزاعی (interface) به نام StorageBackend با متدهای abstract upload و download در فایل app/services/__init__.py است. خارج از این مرحله: پیاده‌سازی LocalStorage یا S3Storage. نکته حیاتی: از ABC و abstractmethod استفاده شود.
**Excerpt:**
```
- یک interface StorageBackend با متدهای upload و download وجود دارد [verify_method=static] [verify_plan={"grep_patterns": ["class StorageBackend", "def upload", "def download"], "files_hint": ["app/services/__init__.py"]}]
```

### Step 6: پیاده‌سازی LocalStorage برای ذخیره‌سازی محلی
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیاده‌سازی کلاس LocalStorage که از StorageBackend ارث‌بری می‌کند، در فایل app/services/__init__.py است. متد upload باید فایل را در دایرکتوری محلی ذخیره کند و متد download باید فایل را برگرداند. خارج از این مرحله: پیاده‌سازی S3Storage. نکته حیاتی: مسیر ذخیره‌سازی باید قابل تنظیم باشد.
**Excerpt:**
```
- پیاده‌سازی محلی (LocalStorage) و S3 (S3Storage) اضافه شده است [verify_method=static] [verify_plan={"grep_patterns": ["class LocalStorage", "class S3Storage"], "files_hint": ["app/services/__init__.py"]}]
```

### Step 7: پیاده‌سازی S3Storage برای ذخیره‌سازی در S3
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیاده‌سازی کلاس S3Storage که از StorageBackend ارث‌بری می‌کند، در فایل app/services/__init__.py است. متد upload باید فایل را در S3 bucket آپلود کند و متد download باید فایل را دانلود کند. خارج از این مرحله: پیاده‌سازی LocalStorage. نکته حیاتی: از boto3 و تنظیمات AWS استفاده شود.
**Excerpt:**
```
- پیاده‌سازی محلی (LocalStorage) و S3 (S3Storage) اضافه شده است [verify_method=static] [verify_plan={"grep_patterns": ["class LocalStorage", "class S3Storage"], "files_hint": ["app/services/__init__.py"]}]
```

### Step 8: اضافه کردن قابلیت سوئیچ بین storage backends با متغیر محیطی
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن منطق انتخاب بین LocalStorage و S3Storage بر اساس متغیر محیطی STORAGE_BACKEND در فایل app/services/__init__.py است. باید از os.getenv استفاده شود. خارج از این مرحله: تغییر مدل‌ها یا سرویس‌های دیگر. نکته حیاتی: مقدار پیش‌فرض باید LocalStorage باشد.
**Excerpt:**
```
- می‌توان با تغییر یک متغیر محیطی بین آن‌ها سوئیچ کرد [verify_method=static] [verify_plan={"grep_patterns": ["STORAGE_BACKEND", "os.getenv", "LocalStorage", "S3Storage"], "files_hint": ["app/services/__init__.py"]}]
```

### Step 9: نوشتن تست‌های واحد برای storage backends
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل نوشتن تست‌های واحد برای LocalStorage و S3Storage در فایل app/tests/test_storage.py است. تست‌ها باید با pytest اجرا شوند. خارج از این مرحله: تست‌های integration. نکته حیاتی: از mock برای S3 استفاده شود.
**Excerpt:**
```
- `pytest app/tests/test_storage.py`
```

### Step 10: بررسی و تکمیل فایل app/services/__init__.py برای export storage_service
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی فایل app/services/__init__.py و اطمینان از اینکه storage_service (شامل StorageBackend, LocalStorage, S3Storage) به درستی export شده است. خارج از این مرحله: تغییر سرویس‌های دیگر. نکته حیاتی: از importهای صریح استفاده شود.
**Excerpt:**
```
- `app/services/__init__.py:1-10` — `__init__` — فایل __init__ سرویس‌ها که باید storage_service را هم شامل شود
```

### Step 11: بررسی و تکمیل فایل app/celery_app.py برای پشتیبانی از tasks جدید
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی فایل app/celery_app.py و اطمینان از اینکه tasks مربوط به notification_service (مانند send_email) به درستی registered شده‌اند. خارج از این مرحله: تغییر notification_service. نکته حیاتی: از decorator @app.task استفاده شود.
**Excerpt:**
```
- `app/celery_app.py` (سطر 1) — برای زمان‌بندی اعلان‌ها
```

### Step 12: بررسی و تکمیل فایل app/models/task.py برای پشتیبانی از attachment
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی فایل app/models/task.py و اطمینان از اینکه مدل Task دارای فیلد attachment یا فایل مرتبط است. خارج از این مرحله: تغییر storage_service. نکته حیاتی: از ForeignKey یا JSONField استفاده شود.
— [merged] این مرحله شامل بررسی فایل app/models/project.py و اطمینان از اینکه مدل Project دارای فیلد attachment یا فایل مرتبط است. خارج از این مرحله: تغییر storage_service. نکته حیاتی: از ForeignKey یا JSONField استفاده شود.
**Excerpt:**
```
- `app/models/task.py` (سطر 1) — مدل Task که ممکن است به attachment نیاز داشته باشد
```

### Step 13: اجرای تست‌ها و linter برای اطمینان از عدم شکست
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تمام تست‌ها (pytest) و linter (مثلاً flake8 یا pylint) برای اطمینان از اینکه هیچ تستی fail نمی‌شود و هیچ warningی وجود ندارد. خارج از این مرحله: تغییر کد. نکته حیاتی: تمام تست‌ها باید عبور کنند.
**Excerpt:**
```
- هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- linter بدون warning عبور می‌کند
- type-check موفق است (`tsc --noEmit` / `mypy`)
```
