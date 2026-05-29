---
task_id: task_ab8f402b21d2
title: بازآرایی معماری و بهبود کیفیت کد سرویس‌های اصلی
type: other
priority: medium
execution_priority: 100
status: done
external_status: pending
verification_status: done
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-25T06:47:29.260217+00:00'
updated_at: '2026-05-29T20:33:00.463953+00:00'
archived: true
archived_at: '2026-05-26T09:35:20.785075+00:00'
tags:
- consolidated
- post_verify_merge
---

# بازآرایی معماری و بهبود کیفیت کد سرویس‌های اصلی

## Raw Idea

🧬 این یک تسک تلفیقی است — از 4 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها بر روی بهبود ساختار کد، معماری داخلی سرویس‌ها، و متمرکزسازی الگوهای توسعه مانند مدیریت خطا و تزریق وابستگی تمرکز دارند. هدف، افزایش خوانایی، نگهداری‌پذیری و مقیاس‌پذیری سیستم است.
🎯 theme: بهبود ساختار و معماری داخلی سرویس‌ها
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 4
  id: 229eec3d-3c79-484a-a91e-7dc924daa735
  عنوان اصلی: تقسیم ai_service.py به ۳ فایل مجزا
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/ai_service.py

📋 acceptance_criteria کامل:
  - فایل ai_service.py به 3 فایل مجزا تقسیم شود [verify_method=static] [verify_plan={"grep_patterns": ["class.*:", "def.*:"], "files_hint": ["app/services/ai_service.py"]}]
  - هر فایل جدید کمتر از 250 خط باشد [verify_method=static] [verify_plan={"grep_patterns": ["^.*$"], "files_hint": ["app/services/ai_service_part1.py", "app/services/ai_service_part2.py", "app/services/ai_service_part3.py"]}]
  - تمامی importها در routeها و سایر فایل‌ها به‌روزرسانی شوند [verify_method=static] [verify_plan={"grep_patterns": ["from app.services.ai_service import", "import app.services.ai_service"], "files_hint": ["app/routes/", "app/services/"]}]
  - تست‌های جدید برای هر سرویس اضافه شود (حداقل 50 خط تست برای هر سرویس) [verify_method=backend_test] [verify_plan={"test_node": "tests/test_ai.py", "timeout_seconds": 60}]

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
فایل‌های بزرگ: app/services/ai_service.py بیش از 500 خط

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/ai_service.py:1-600` — `AIService` — فایل بزرگ که باید تقسیم شود
  ```python
  class AIService:
      def process_text(self, text): ...
      def analyze_image(self, image): ...
      def manage_models(self): ...
      # 600 خط کد
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

- `tests/test_ai.py` (سطر 1) — تست‌های ناقص با 50 خط
- `app/routes/ai.py` (سطر 1) — از AIService استفاده می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این سرویس توسط route AI و احتمالاً taskهای Celery استفاده می‌شود.

## 🔍 Context و وضعیت فعلی
فایل app/services/ai_service.py حدود 600 خط کد دارد که شامل logicهای مختلف AI (مدل‌های مختلف، پردازش زبان طبیعی، تحلیل تصویر) است. این حجم باعث کاهش خوانایی و افزایش پیچیدگی نگهداری می‌شود. همچنین تست‌های مربوطه (tests/test_ai.py) فقط 50 خط هستند که پوشش کافی ندارند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل ai_service.py به 3 فایل مجزا تقسیم شود
- [ ] هر فایل جدید کمتر از 250 خط باشد
- [ ] تمامی importها در routeها و سایر فایل‌ها به‌روزرسانی شوند
- [ ] تست‌های جدید برای هر سرویس اضافه شود (حداقل 50 خط تست برای هر سرویس)
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تقسیم ai_service.py به چند فایل مجزا: ai_model_service.py (مدیریت مدل‌ها), ai_nlp_service.py (پردازش متن), ai_image_service.py (تحلیل تصویر). همچنین تست‌های مربوطه را گسترش دهید تا هر سرویس جدید پوشش داده شود.

## 💡 نمونه‌های قبل/بعد
**تقسیم فایل**

_قبل:_
```
app/services/ai_service.py (600 lines)
```

_بعد:_
```
app/services/ai/
  __init__.py
  model_service.py (200 lines)
  nlp_service.py (200 lines)
  image_service.py (200 lines)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `wc -l app/services/ai/*.py`
- `pytest tests/test_ai.py -v`
- `grep -r 'from app.services.ai_service' app/ --include='*.py'`

## ⚠️ ریسک‌ها و موارد احتیاط
شکستن importها در routeها و taskها؛ نیاز به تست کامل

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
تسک 2 از 4
  id: 759e4e7a-009b-4a88-a8e2-3e29dceb1dbf
  عنوان اصلی: متمرکزسازی مدیریت خطا با دکوراتور
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/routes/projects.py, app/routes/tasks.py

📋 acceptance_criteria کامل:
  - یک decorator handle_errors در middleware.py ایجاد شود [verify_method=static] [verify_plan={"grep_patterns": ["def handle_errors"], "files_hint": ["app/middleware.py"]}]
  - تمامی routeها از decorator استفاده کنند [verify_method=static] [verify_plan={"grep_patterns": ["@handle_errors"], "files_hint": ["app/routes/tasks.py", "app/routes/projects.py"]}]
  - هیچ try-except تکراری در routeها باقی نماند [verify_method=static] [verify_plan={"grep_patterns": ["try\\s*:"], "files_hint": ["app/routes/tasks.py", "app/routes/projects.py"]}]
  - تست‌های خطا همچنان پاس شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_errors.py", "timeout_seconds": 60}]

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

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 4
  id: 180e99ba-9dda-483d-8bdb-445695cb1404
  عنوان اصلی: حذف تابع encrypt_password از crypt_service.py
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/crypt_service.py

📋 acceptance_criteria کامل:
  - تابع encrypt_password از crypt_service.py حذف شده است [verify_method=static] [verify_plan={"grep_patterns": ["def encrypt_password"], "files_hint": ["app/services/crypt_service.py"]}]
  - هیچ خطای ایمپورتی در پروژه رخ نمی‌دهد [verify_method=static] [verify_plan={"grep_patterns": ["from app.services.crypt_service import encrypt_password", "from app.services.crypt_service import.*encrypt_password"], "files_hint": ["app/"]}]
  - تمامی تست‌ها پاس می‌شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]

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
Dead code در app/services/crypt_service.py

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/crypt_service.py:1-30` — `encrypt_password` — تابع dead code
  ```python
  def encrypt_password(password: str) -> str:
      # این تابع استفاده نمی‌شود
      return hashlib.sha256(password.encode()).hexdigest()
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Python، hashlib

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/services/auth_service.py` (سطر 15) — تابع hash_password جایگزین است
- `app/routes/auth.py` (سطر 10) — از auth_service استفاده می‌کند

## 🌐 نقشهٔ وابستگی‌ها
حذف این کد تأثیری روی عملکرد برنامه ندارد.

## 🔍 Context و وضعیت فعلی
فایل app/services/crypt_service.py شامل توابعی است که در هیچ جای دیگری از پروژه استفاده نمی‌شوند. به‌ویژه، تابع encrypt_password به نظر می‌رسد که منسوخ شده و با تابع hash_password در auth_service.py جایگزین شده است. این dead code باعث افزایش حجم کد و سردرگمی توسعه‌دهندگان می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تابع encrypt_password از crypt_service.py حذف شده است
- [ ] هیچ خطای ایمپورتی در پروژه رخ نمی‌دهد
- [ ] تمامی تست‌ها پاس می‌شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. توابع استفاده‌نشده را از crypt_service.py حذف کنید. اگر تابعی در آینده ممکن است مفید باشد، آن را به عنوان کامنت نگه دارید یا به ماژول دیگری منتقل کنید.

## 💡 نمونه‌های قبل/بعد
**حذف dead code**

_قبل:_
```
def encrypt_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()
```

_بعد:_
```
# تابع حذف شد
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`

## ⚠️ ریسک‌ها و موارد احتیاط
کم. فقط کد بلااستفاده حذف می‌شود.

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
تسک 4 از 4
  id: 3a76ab9d-bc7d-49d1-b8f3-9bd98470a0fe
  عنوان اصلی: پیاده‌سازی Dependency Injection در سرویس‌ها
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/ai_service.py, app/services/auth_service.py

📋 acceptance_criteria کامل:
  - AIService و AuthService از DI استفاده کنند [verify_method=static] [verify_plan={"grep_patterns": ["class AIService", "class AuthService", "def __init__"], "files_hint": ["app/services/ai_service.py", "app/services/auth_service.py"]}]
  - تست‌ها بتوانند به راحتی mock کنند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_services.py", "timeout_seconds": 60}]
  - همه routeها با سرویس‌های جدید سازگار شوند [verify_method=static] [verify_plan={"grep_patterns": ["from app.services.ai_service import AIService", "from app.services.auth_service import AuthService"], "files_hint": ["app/routes/"]}]

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
- در commit message: `merged-from: 229eec3d-3c79-484a-a91e-7dc924daa735, 759e4e7a-009b-4a88-a8e2-3e29dceb1dbf, 180e99ba-9dda-483d-8bdb-445695cb1404, 3a76ab9d-bc7d-49d1-b8f3-9bd98470a0fe`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 4 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها بر روی بهبود ساختار کد، معماری داخلی سرویس‌ها، و متمرکزسازی الگوهای توسعه مانند مدیریت خطا و تزریق وابستگی تمرکز دارند. هدف، افزایش خوانایی، نگهداری‌پذیری و مقیاس‌پذیری سیستم است.
🎯 theme: بهبود ساختار و معماری داخلی سرویس‌ها
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 4
  id: 229eec3d-3c79-484a-a91e-7dc924daa735
  عنوان اصلی: تقسیم ai_service.py به ۳ فایل مجزا
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/ai_service.py

📋 acceptance_criteria کامل:
  - فایل ai_service.py به 3 فایل مجزا تقسیم شود [verify_method=static] [verify_plan={"grep_patterns": ["class.*:", "def.*:"], "files_hint": ["app/services/ai_service.py"]}]
  - هر فایل جدید کمتر از 250 خط باشد [verify_method=static] [verify_plan={"grep_patterns": ["^.*$"], "files_hint": ["app/services/ai_service_part1.py", "app/services/ai_service_part2.py", "app/services/ai_service_part3.py"]}]
  - تمامی importها در routeها و سایر فایل‌ها به‌روزرسانی شوند [verify_method=static] [verify_plan={"grep_patterns": ["from app.services.ai_service import", "import app.services.ai_service"], "files_hint": ["app/routes/", "app/services/"]}]
  - تست‌های جدید برای هر سرویس اضافه شود (حداقل 50 خط تست برای هر سرویس) [verify_method=backend_test] [verify_plan={"test_node": "tests/test_ai.py", "timeout_seconds": 60}]

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
فایل‌های بزرگ: app/services/ai_service.py بیش از 500 خط

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/ai_service.py:1-600` — `AIService` — فایل بزرگ که باید تقسیم شود
  ```python
  class AIService:
      def process_text(self, text): ...
      def analyze_image(self, image): ...
      def manage_models(self): ...
      # 600 خط کد
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

- `tests/test_ai.py` (سطر 1) — تست‌های ناقص با 50 خط
- `app/routes/ai.py` (سطر 1) — از AIService استفاده می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این سرویس توسط route AI و احتمالاً taskهای Celery استفاده می‌شود.

## 🔍 Context و وضعیت فعلی
فایل app/services/ai_service.py حدود 600 خط کد دارد که شامل logicهای مختلف AI (مدل‌های مختلف، پردازش زبان طبیعی، تحلیل تصویر) است. این حجم باعث کاهش خوانایی و افزایش پیچیدگی نگهداری می‌شود. همچنین تست‌های مربوطه (tests/test_ai.py) فقط 50 خط هستند که پوشش کافی ندارند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل ai_service.py به 3 فایل مجزا تقسیم شود
- [ ] هر فایل جدید کمتر از 250 خط باشد
- [ ] تمامی importها در routeها و سایر فایل‌ها به‌روزرسانی شوند
- [ ] تست‌های جدید برای هر سرویس اضافه شود (حداقل 50 خط تست برای هر سرویس)
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تقسیم ai_service.py به چند فایل مجزا: ai_model_service.py (مدیریت مدل‌ها), ai_nlp_service.py (پردازش متن), ai_image_service.py (تحلیل تصویر). همچنین تست‌های مربوطه را گسترش دهید تا هر سرویس جدید پوشش داده شود.

## 💡 نمونه‌های قبل/بعد
**تقسیم فایل**

_قبل:_
```
app/services/ai_service.py (600 lines)
```

_بعد:_
```
app/services/ai/
  __init__.py
  model_service.py (200 lines)
  nlp_service.py (200 lines)
  image_service.py (200 lines)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `wc -l app/services/ai/*.py`
- `pytest tests/test_ai.py -v`
- `grep -r 'from app.services.ai_service' app/ --include='*.py'`

## ⚠️ ریسک‌ها و موارد احتیاط
شکستن importها در routeها و taskها؛ نیاز به تست کامل

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
تسک 2 از 4
  id: 759e4e7a-009b-4a88-a8e2-3e29dceb1dbf
  عنوان اصلی: متمرکزسازی مدیریت خطا با دکوراتور
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/routes/projects.py, app/routes/tasks.py

📋 acceptance_criteria کامل:
  - یک decorator handle_errors در middleware.py ایجاد شود [verify_method=static] [verify_plan={"grep_patterns": ["def handle_errors"], "files_hint": ["app/middleware.py"]}]
  - تمامی routeها از decorator استفاده کنند [verify_method=static] [verify_plan={"grep_patterns": ["@handle_errors"], "files_hint": ["app/routes/tasks.py", "app/routes/projects.py"]}]
  - هیچ try-except تکراری در routeها باقی نماند [verify_method=static] [verify_plan={"grep_patterns": ["try\\s*:"], "files_hint": ["app/routes/tasks.py", "app/routes/projects.py"]}]
  - تست‌های خطا همچنان پاس شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_errors.py", "timeout_seconds": 60}]

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

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 4
  id: 180e99ba-9dda-483d-8bdb-445695cb1404
  عنوان اصلی: حذف تابع encrypt_password از crypt_service.py
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/crypt_service.py

📋 acceptance_criteria کامل:
  - تابع encrypt_password از crypt_service.py حذف شده است [verify_method=static] [verify_plan={"grep_patterns": ["def encrypt_password"], "files_hint": ["app/services/crypt_service.py"]}]
  - هیچ خطای ایمپورتی در پروژه رخ نمی‌دهد [verify_method=static] [verify_plan={"grep_patterns": ["from app.services.crypt_service import encrypt_password", "from app.services.crypt_service import.*encrypt_password"], "files_hint": ["app/"]}]
  - تمامی تست‌ها پاس می‌شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]

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
Dead code در app/services/crypt_service.py

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/crypt_service.py:1-30` — `encrypt_password` — تابع dead code
  ```python
  def encrypt_password(password: str) -> str:
      # این تابع استفاده نمی‌شود
      return hashlib.sha256(password.encode()).hexdigest()
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Python، hashlib

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/services/auth_service.py` (سطر 15) — تابع hash_password جایگزین است
- `app/routes/auth.py` (سطر 10) — از auth_service استفاده می‌کند

## 🌐 نقشهٔ وابستگی‌ها
حذف این کد تأثیری روی عملکرد برنامه ندارد.

## 🔍 Context و وضعیت فعلی
فایل app/services/crypt_service.py شامل توابعی است که در هیچ جای دیگری از پروژه استفاده نمی‌شوند. به‌ویژه، تابع encrypt_password به نظر می‌رسد که منسوخ شده و با تابع hash_password در auth_service.py جایگزین شده است. این dead code باعث افزایش حجم کد و سردرگمی توسعه‌دهندگان می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تابع encrypt_password از crypt_service.py حذف شده است
- [ ] هیچ خطای ایمپورتی در پروژه رخ نمی‌دهد
- [ ] تمامی تست‌ها پاس می‌شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. توابع استفاده‌نشده را از crypt_service.py حذف کنید. اگر تابعی در آینده ممکن است مفید باشد، آن را به عنوان کامنت نگه دارید یا به ماژول دیگری منتقل کنید.

## 💡 نمونه‌های قبل/بعد
**حذف dead code**

_قبل:_
```
def encrypt_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()
```

_بعد:_
```
# تابع حذف شد
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`

## ⚠️ ریسک‌ها و موارد احتیاط
کم. فقط کد بلااستفاده حذف می‌شود.

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
تسک 4 از 4
  id: 3a76ab9d-bc7d-49d1-b8f3-9bd98470a0fe
  عنوان اصلی: پیاده‌سازی Dependency Injection در سرویس‌ها
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/ai_service.py, app/services/auth_service.py

📋 acceptance_criteria کامل:
  - AIService و AuthService از DI استفاده کنند [verify_method=static] [verify_plan={"grep_patterns": ["class AIService", "class AuthService", "def __init__"], "files_hint": ["app/services/ai_service.py", "app/services/auth_service.py"]}]
  - تست‌ها بتوانند به راحتی mock کنند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_services.py", "timeout_seconds": 60}]
  - همه routeها با سرویس‌های جدید سازگار شوند [verify_method=static] [verify_plan={"grep_patterns": ["from app.services.ai_service import AIService", "from app.services.auth_service import AuthService"], "files_hint": ["app/routes/"]}]

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
- در commit message: `merged-from: 229eec3d-3c79-484a-a91e-7dc924daa735, 759e4e7a-009b-4a88-a8e2-3e29dceb1dbf, 180e99ba-9dda-483d-8bdb-445695cb1404, 3a76ab9d-bc7d-49d1-b8f3-9bd98470a0fe`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. فایل ai_service.py به 3 فایل مجزا تقسیم شود _(verify: static)_
2. هر فایل جدید کمتر از 250 خط باشد _(verify: static)_
3. تمامی importها در routeها و سایر فایل‌ها به‌روزرسانی شوند _(verify: static)_
4. تست‌های جدید برای هر سرویس اضافه شود (حداقل 50 خط تست برای هر سرویس) _(verify: backend_test)_
5. یک decorator handle_errors در middleware.py ایجاد شود _(verify: static)_
6. تمامی routeها از decorator استفاده کنند _(verify: static)_
7. هیچ try-except تکراری در routeها باقی نماند _(verify: static)_
8. تست‌های خطا همچنان پاس شوند _(verify: backend_test)_
9. تابع encrypt_password از crypt_service.py حذف شده است _(verify: static)_
10. هیچ خطای ایمپورتی در پروژه رخ نمی‌دهد _(verify: static)_
11. تمامی تست‌ها پاس می‌شوند _(verify: backend_test)_
12. AIService و AuthService از DI استفاده کنند _(verify: static)_
13. تست‌ها بتوانند به راحتی mock کنند _(verify: backend_test)_
14. همه routeها با سرویس‌های جدید سازگار شوند _(verify: static)_

## Task Steps

### Step 1: ایجاد فایل ai_model_service.py برای مدیریت مدل‌ها
**Status:** `done` (100%)
**Scope:** ایجاد فایل جدید app/services/ai_model_service.py با کلاس ModelService که شامل منطق مدیریت مدل‌های AI است. این مرحله فقط شامل استخراج کد مربوط به مدیریت مدل‌ها از ai_service.py است. خارج از این مرحله: پردازش متن، تحلیل تصویر، و به‌روزرسانی importها.
**Excerpt:**
```
فایل ai_service.py به 3 فایل مجزا تقسیم شود [verify_method=static] [verify_plan={"grep_patterns": ["class.*:", "def.*:"], "files_hint": ["app/services/ai_service.py"]}]
```

### Step 2: ایجاد فایل ai_nlp_service.py برای پردازش متن
**Status:** `done` (100%)
**Scope:** ایجاد فایل جدید app/services/ai_nlp_service.py با کلاس NlpService که شامل منطق پردازش متن (process_text) است. خارج از این مرحله: مدیریت مدل‌ها، تحلیل تصویر، و به‌روزرسانی importها.
**Excerpt:**
```
فایل ai_service.py به 3 فایل مجزا تقسیم شود [verify_method=static] [verify_plan={"grep_patterns": ["class.*:", "def.*:"], "files_hint": ["app/services/ai_service.py"]}]
```

### Step 3: ایجاد فایل ai_image_service.py برای تحلیل تصویر
**Status:** `done` (100%)
**Scope:** ایجاد فایل جدید app/services/ai_image_service.py با کلاس ImageService که شامل منطق تحلیل تصویر (analyze_image) است. خارج از این مرحله: مدیریت مدل‌ها، پردازش متن، و به‌روزرسانی importها.
**Excerpt:**
```
فایل ai_service.py به 3 فایل مجزا تقسیم شود [verify_method=static] [verify_plan={"grep_patterns": ["class.*:", "def.*:"], "files_hint": ["app/services/ai_service.py"]}]
```

### Step 4: اطمینان از کمتر از 250 خط بودن هر فایل جدید
**Status:** `done` (100%)
**Scope:** بررسی و اطمینان از اینکه هر یک از سه فایل جدید (ai_model_service.py, ai_nlp_service.py, ai_image_service.py) کمتر از 250 خط کد دارند. اگر بیش از 250 خط هستند، باید بیشتر تقسیم شوند. خارج از این مرحله: ایجاد فایل‌ها یا به‌روزرسانی importها.
**Excerpt:**
```
هر فایل جدید کمتر از 250 خط باشد [verify_method=static] [verify_plan={"grep_patterns": ["^.*$"], "files_hint": ["app/services/ai_service_part1.py", "app/services/ai_service_part2.py", "app/services/ai_service_part3.py"]}]
```

### Step 5: به‌روزرسانی importها در routeها و سایر فایل‌ها برای سرویس‌های جدید
**Status:** `done` (100%)
**Scope:** به‌روزرسانی تمام importها در فایل‌های app/routes/ و app/services/ که از app.services.ai_service به سرویس‌های جدید (model_service, nlp_service, image_service) اشاره می‌کنند. خارج از این مرحله: ایجاد فایل‌های جدید یا تغییر منطق.
**Excerpt:**
```
تمامی importها در routeها و سایر فایل‌ها به‌روزرسانی شوند [verify_method=static] [verify_plan={"grep_patterns": ["from app.services.ai_service import", "import app.services.ai_service"], "files_hint": ["app/routes/", "app/services/"]}]
```

### Step 6: اضافه کردن تست‌های جدید برای ModelService (حداقل 50 خط)
**Status:** `done` (100%)
**Scope:** اضافه کردن حداقل 50 خط تست جدید در tests/test_ai.py برای پوشش متدهای ModelService. خارج از این مرحله: تست‌های NlpService و ImageService.
— [merged] اضافه کردن حداقل 50 خط تست جدید در tests/test_ai.py برای پوشش متدهای NlpService. خارج از این مرحله: تست‌های ModelService و ImageService.
— [merged] اضافه کردن حداقل 50 خط تست جدید در tests/test_ai.py برای پوشش متدهای ImageService. خارج از این مرحله: تست‌های ModelService و NlpService.
**Excerpt:**
```
تست‌های جدید برای هر سرویس اضافه شود (حداقل 50 خط تست برای هر سرویس) [verify_method=backend_test] [verify_plan={"test_node": "tests/test_ai.py", "timeout_seconds": 60}]
```

### Step 7: ایجاد decorator handle_errors در middleware.py
**Status:** `done` (100%)
**Scope:** ایجاد یک decorator به نام handle_errors در فایل app/middleware.py که خطاهای ValidationError و Exception را به HTTPException تبدیل می‌کند. خارج از این مرحله: به‌روزرسانی routeها یا حذف try-exceptهای موجود.
**Excerpt:**
```
یک decorator handle_errors در middleware.py ایجاد شود [verify_method=static] [verify_plan={"grep_patterns": ["def handle_errors"], "files_hint": ["app/middleware.py"]}]
```

### Step 8: اعمال decorator handle_errors در routeهای tasks.py
**Status:** `done` (100%)
**Scope:** اضافه کردن decorator @handle_errors به تمام endpointهای فایل app/routes/tasks.py و حذف try-exceptهای تکراری. خارج از این مرحله: routeهای projects.py و users.py.
**Excerpt:**
```
تمامی routeها از decorator استفاده کنند [verify_method=static] [verify_plan={"grep_patterns": ["@handle_errors"], "files_hint": ["app/routes/tasks.py", "app/routes/projects.py"]}]
```

### Step 9: اعمال decorator handle_errors در routeهای projects.py
**Status:** `done` (100%)
**Scope:** اضافه کردن decorator @handle_errors به تمام endpointهای فایل app/routes/projects.py و حذف try-exceptهای تکراری. خارج از این مرحله: routeهای tasks.py و users.py.
**Excerpt:**
```
تمامی routeها از decorator استفاده کنند [verify_method=static] [verify_plan={"grep_patterns": ["@handle_errors"], "files_hint": ["app/routes/tasks.py", "app/routes/projects.py"]}]
```

### Step 10: اعمال decorator handle_errors در routeهای users.py
**Status:** `done` (100%)
**Scope:** اضافه کردن decorator @handle_errors به تمام endpointهای فایل app/routes/users.py و حذف try-exceptهای تکراری. خارج از این مرحله: routeهای tasks.py و projects.py.
**Excerpt:**
```
تمامی routeها از decorator استفاده کنند [verify_method=static] [verify_plan={"grep_patterns": ["@handle_errors"], "files_hint": ["app/routes/tasks.py", "app/routes/projects.py"]}]
```

### Step 11: حذف تمام try-exceptهای تکراری از routeها
**Status:** `done` (100%)
**Scope:** بررسی و اطمینان از اینکه هیچ try-except تکراری در فایل‌های app/routes/tasks.py, app/routes/projects.py, app/routes/users.py باقی نمانده است. خارج از این مرحله: ایجاد decorator یا تغییر منطق.
**Excerpt:**
```
هیچ try-except تکراری در routeها باقی نماند [verify_method=static] [verify_plan={"grep_patterns": ["try\\s*:"], "files_hint": ["app/routes/tasks.py", "app/routes/projects.py"]}]
```

### Step 12: اجرای تست‌های خطا برای اطمینان از پاس شدن
**Status:** `done` (100%)
**Scope:** اجرای تست‌های موجود در tests/test_errors.py و اطمینان از پاس شدن تمام تست‌ها پس از تغییرات. خارج از این مرحله: نوشتن تست‌های جدید.
**Excerpt:**
```
تست‌های خطا همچنان پاس شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_errors.py", "timeout_seconds": 60}]
```

### Step 13: حذف تابع encrypt_password از crypt_service.py
**Status:** `done` (100%)
**Scope:** حذف تابع encrypt_password از فایل app/services/crypt_service.py. خارج از این مرحله: تغییر سایر توابع یا فایل‌ها.
**Excerpt:**
```
تابع encrypt_password از crypt_service.py حذف شده است [verify_method=static] [verify_plan={"grep_patterns": ["def encrypt_password"], "files_hint": ["app/services/crypt_service.py"]}]
```

### Step 14: بررسی عدم وجود خطای ایمپورتی پس از حذف encrypt_password
**Status:** `done` (100%)
**Scope:** بررسی تمام فایل‌های پروژه برای اطمینان از اینکه هیچ فایلی encrypt_password را از crypt_service.py import نمی‌کند. خارج از این مرحله: تغییر importها.
**Excerpt:**
```
هیچ خطای ایمپورتی در پروژه رخ نمی‌دهد [verify_method=static] [verify_plan={"grep_patterns": ["from app.services.crypt_service import encrypt_password", "from app.services.crypt_service import.*encrypt_password"], "files_hint": ["app/"]}]
```

### Step 15: اجرای تمام تست‌ها برای اطمینان از پاس شدن پس از حذف encrypt_password
**Status:** `done` (100%)
**Scope:** اجرای تمام تست‌های پروژه (pytest) و اطمینان از پاس شدن همه تست‌ها. خارج از این مرحله: نوشتن تست‌های جدید.
**Excerpt:**
```
تمامی تست‌ها پاس می‌شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
```

### Step 16: بازنویسی AIService برای استفاده از DI با تزریق db و api_key
**Status:** `done` (100%)
**Scope:** بازنویسی کلاس AIService در app/services/ai_service.py (یا فایل‌های جدید) به طوری که وابستگی‌های db و api_key از طریق __init__ تزریق شوند، نه اینکه مستقیماً import شوند. خارج از این مرحله: AuthService و routeها.
**Excerpt:**
```
AIService و AuthService از DI استفاده کنند [verify_method=static] [verify_plan={"grep_patterns": ["class AIService", "class AuthService", "def __init__"], "files_hint": ["app/services/ai_service.py", "app/services/auth_service.py"]}]
```

### Step 17: بازنویسی AuthService برای استفاده از DI با تزریق db و secret_key
**Status:** `done` (100%)
**Scope:** بازنویسی کلاس AuthService در app/services/auth_service.py به طوری که وابستگی‌های db و secret_key از طریق __init__ تزریق شوند. خارج از این مرحله: AIService و routeها.
**Excerpt:**
```
AIService و AuthService از DI استفاده کنند [verify_method=static] [verify_plan={"grep_patterns": ["class AIService", "class AuthService", "def __init__"], "files_hint": ["app/services/ai_service.py", "app/services/auth_service.py"]}]
```

### Step 18: به‌روزرسانی routeهای ai.py برای سازگاری با AIService جدید
**Status:** `done` (100%)
**Scope:** به‌روزرسانی فایل app/routes/ai.py به طوری که AIService با وابستگی‌های تزریق شده (از طریق FastAPI Depends) استفاده شود. خارج از این مرحله: routeهای auth.py.
**Excerpt:**
```
همه routeها با سرویس‌های جدید سازگار شوند [verify_method=static] [verify_plan={"grep_patterns": ["from app.services.ai_service import AIService", "from app.services.auth_service import AuthService"], "files_hint": ["app/routes/"]}]
```

### Step 19: به‌روزرسانی routeهای auth.py برای سازگاری با AuthService جدید
**Status:** `done` (100%)
**Scope:** به‌روزرسانی فایل app/routes/auth.py به طوری که AuthService با وابستگی‌های تزریق شده (از طریق FastAPI Depends) استفاده شود. خارج از این مرحله: routeهای ai.py.
**Excerpt:**
```
همه routeها با سرویس‌های جدید سازگار شوند [verify_method=static] [verify_plan={"grep_patterns": ["from app.services.ai_service import AIService", "from app.services.auth_service import AuthService"], "files_hint": ["app/routes/"]}]
```

### Step 20: به‌روزرسانی تست‌های test_services.py برای پشتیبانی از DI
**Status:** `done` (100%)
**Scope:** به‌روزرسانی تست‌های موجود در tests/test_services.py به طوری که بتوانند به راحتی وابستگی‌های AIService و AuthService را mock کنند. خارج از این مرحله: نوشتن تست‌های جدید.
**Excerpt:**
```
تست‌ها بتوانند به راحتی mock کنند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_services.py", "timeout_seconds": 60}]
```

### Step 21: اجرای تمام تست‌ها برای اطمینان از پاس شدن پس از تغییرات DI
**Status:** `done` (100%)
**Scope:** اجرای تمام تست‌های پروژه (pytest) و اطمینان از پاس شدن همه تست‌ها پس از تغییرات DI. خارج از این مرحله: تغییر کد.
**Excerpt:**
```
همه routeها با سرویس‌های جدید سازگار شوند [verify_method=static] [verify_plan={"grep_patterns": ["from app.services.ai_service import AIService", "from app.services.auth_service import AuthService"], "files_hint": ["app/routes/"]}]
```

### Step 22: بررسی عدم وجود linter warning در تمام فایل‌های تغییر یافته
**Status:** `done` (100%)
**Scope:** اجرای linter (مثلاً flake8 یا pylint) روی تمام فایل‌های تغییر یافته و اطمینان از عدم وجود warning. خارج از این مرحله: تغییر کد.
**Excerpt:**
```
linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["def handle_errors"], "files_hint": ["app/middleware.py"]}]
```

### Step 23: بررسی موفقیت type-check (mypy) در تمام فایل‌های تغییر یافته
**Status:** `done` (100%)
**Scope:** اجرای mypy روی تمام فایل‌های تغییر یافته و اطمینان از موفقیت type-check. خارج از این مرحله: تغییر کد.
**Excerpt:**
```
type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["def handle_errors"], "files_hint": ["app/middleware.py"]}]
```

### Step 24: ایجاد فایل __init__.py در مسیر app/services/ai/
**Status:** `done` (100%)
**Scope:** ایجاد فایل __init__.py در مسیر app/services/ai/ برای تبدیل آن به یک پکیج Python. خارج از این مرحله: انتقال فایل‌ها به این مسیر.
**Excerpt:**
```
app/services/ai/ __init__.py model_service.py (200 lines) nlp_service.py (200 lines) image_service.py (200 lines)
```

### Step 25: انتقال فایل‌های سرویس AI به مسیر app/services/ai/
**Status:** `done` (100%)
**Scope:** انتقال فایل‌های ai_model_service.py, ai_nlp_service.py, ai_image_service.py به مسیر app/services/ai/ و تغییر نام آن‌ها به model_service.py, nlp_service.py, image_service.py. خارج از این مرحله: به‌روزرسانی importها.
**Excerpt:**
```
app/services/ai/ __init__.py model_service.py (200 lines) nlp_service.py (200 lines) image_service.py (200 lines)
```

### Step 26: به‌روزرسانی importها برای مسیر جدید app/services/ai/
**Status:** `done` (100%)
**Scope:** به‌روزرسانی تمام importها در routeها و سایر فایل‌ها که به سرویس‌های AI اشاره می‌کنند تا به مسیر جدید app/services/ai/ اشاره کنند. خارج از این مرحله: انتقال فایل‌ها.
**Excerpt:**
```
app/services/ai/ __init__.py model_service.py (200 lines) nlp_service.py (200 lines) image_service.py (200 lines)
```
