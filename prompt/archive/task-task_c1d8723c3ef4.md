---
task_id: task_c1d8723c3ef4
title: یکپارچه‌سازی و استانداردسازی نام‌گذاری Endpointهای API
type: other
priority: medium
execution_priority: 100
status: awaiting_review
external_status: pending
verification_status: partial
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-25T06:48:39.223983+00:00'
updated_at: '2026-05-26T10:00:57.624284+00:00'
archived: true
archived_at: '2026-05-26T10:00:57.624270+00:00'
tags:
- consolidated
- post_verify_merge
---

# یکپارچه‌سازی و استانداردسازی نام‌گذاری Endpointهای API

## Raw Idea

🧬 این یک تسک تلفیقی است — از 2 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): هر دو تسک به استانداردسازی و یکپارچه‌سازی قواعد نام‌گذاری برای Endpointهای API می‌پردازند. این کار باعث افزایش وضوح، کاهش ابهام و بهبود تجربه توسعه‌دهندگان می‌شود.
🎯 theme: استانداردسازی نام‌گذاری Endpointهای API
💎 estimated_difficulty: small

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 2
  id: c840ca53-4831-4bac-a9a2-522c7f509949
  عنوان اصلی: استانداردسازی naming convention endpointهای API به plural
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/ai.py, app/routes/auth.py, app/routes/tasks.py

📋 acceptance_criteria کامل:
  - تمام endpointها از prefix plural استفاده کنند [verify_method=static] [verify_plan={"grep_patterns": ["prefix\\s*=\\s*['\"]/tasks['\"]", "prefix\\s*=\\s*['\"]/ai['\"]", "prefix\\s*=\\s*['\"]/auth['\"]"], "files_hint": ["app/routes/tasks.py", "app/routes/ai.py", "app/routes/auth.py"]]
  - تست‌های موجود با prefix جدید تطبیق داده شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - مستندات API به‌روزرسانی شود [verify_method=static] [verify_plan={"grep_patterns": ["/tasks", "/ai", "/auth"], "files_hint": ["docs/"]}]

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
ناسازگاری در naming convention endpointهای API (plural vs singular)

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:1-10` — `router prefix` — این prefix صحیح است و باید به عنوان استاندارد در نظر گرفته شود
  ```python
  router = APIRouter(prefix='/tasks', tags=['tasks'])
  ```
- `app/routes/ai.py:1-10` — `router prefix` — این prefix با استاندارد plural همخوانی ندارد
  ```python
  router = APIRouter(prefix='/ai', tags=['ai'])
  ```
- `app/routes/auth.py:1-10` — `router prefix` — این prefix با استاندارد plural همخوانی ندارد
  ```python
  router = APIRouter(prefix='/auth', tags=['auth'])
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

- `app/routes/projects.py` (سطر 1) — از prefix /projects استفاده می‌کند (صحیح)
- `app/routes/users.py` (سطر 1) — از prefix /users استفاده می‌کند (صحیح)
- `app/routes/notifications.py` (سطر 1) — از prefix /notifications استفاده می‌کند (صحیح)

## 🌐 نقشهٔ وابستگی‌ها
این تغییر بر تمام کلاینت‌هایی که از این endpointها استفاده می‌کنند تأثیر می‌گذارد، از جمله فرانت‌اند و تست‌ها

## 🔍 Context و وضعیت فعلی
در فایل app/routes/tasks.py از prefix /tasks استفاده شده، در حالی که app/routes/projects.py از /projects و app/routes/users.py از /users استفاده می‌کند. این ناسازگاری در naming convention باعث سردرگمی در توسعه و مستندسازی می‌شود. همچنین app/routes/ai.py از /ai و app/routes/auth.py از /auth استفاده می‌کند که با بقیه همخوانی ندارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تمام endpointها از prefix plural استفاده کنند
- [ ] تست‌های موجود با prefix جدید تطبیق داده شوند
- [ ] مستندات API به‌روزرسانی شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یکپارچه‌سازی naming convention تمام endpointها به صورت plural (مثلاً /ai → /ai-services یا /ai-assistants) و اطمینان از consistency در کل پروژه

## 💡 نمونه‌های قبل/بعد
**تغییر prefix در ai.py**

_قبل:_
```
router = APIRouter(prefix='/ai', tags=['ai'])
```

_بعد:_
```
router = APIRouter(prefix='/ai-services', tags=['ai'])
```

**تغییر prefix در auth.py**

_قبل:_
```
router = APIRouter(prefix='/auth', tags=['auth'])
```

_بعد:_
```
router = APIRouter(prefix='/auth-services', tags=['auth'])
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/ -v`
- `curl http://localhost:8000/openapi.json | jq '.paths | keys'`

## ⚠️ ریسک‌ها و موارد احتیاط
شکستن کلاینت‌های موجود در صورت عدم به‌روزرسانی همزمان

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
تسک 2 از 2
  id: 1bd8a657-b5c1-48bc-8921-ae65fa7c2464
  عنوان اصلی: تغییر naming convention endpointهای notification به snake_case
  اولویت اصلی: low
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/notifications.py

📋 acceptance_criteria کامل:
  - همه endpointهای notification از snake_case استفاده کنند [verify_method=static] [verify_plan={"grep_patterns": ["@router\\.(get|post|put|delete|patch)\\(.*[a-z][A-Z]"], "files_hint": ["app/routes/notifications.py"]}]
  - frontend به روز شود تا از naming جدید استفاده کند [verify_method=manual_only] [verify_plan={"reason": "AI پس از force re-enrich نتوانست ui_steps واقعی (click/fill/assert) تولید کند — این AC نیاز به بازبینی دستی دارد", "previous_plan": {"base": "frontend", "ui_steps": [], "grep_patterns": []]
  - تست‌های integration پاس شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_notifications.py", "timeout_seconds": 60}]

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
عدم تطابق در naming convention endpointهای notification

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/notifications.py:25-30` — `mark_as_read` — باید به snake_case تغییر کند
  ```python
  @router.post('/markAsRead')
  async def mark_as_read(notification_id: int):
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + REST API design

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/tasks.py` (سطر 20) — نمونه endpoint با snake_case
- `frontend/src/lib/api.ts` (سطر 60) — فرانت‌اند از camelCase استفاده می‌کند

## 🌐 نقشهٔ وابستگی‌ها
تمام endpointهای notification تحت تأثیر هستند.

## 🔍 Context و وضعیت فعلی
در app/routes/notifications.py، endpointها با naming convention camelCase (مثلاً `/api/notifications/markAsRead`) تعریف شده‌اند، در حالی که بقیه endpointهای پروژه از snake_case استفاده می‌کنند (مثلاً `/api/tasks/create_task`). این inconsistency باعث سردرگمی توسعه‌دهندگان می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] همه endpointهای notification از snake_case استفاده کنند
- [ ] frontend به روز شود تا از naming جدید استفاده کند
- [ ] تست‌های integration پاس شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تغییر naming convention endpointهای notification به snake_case برای هماهنگی با بقیه پروژه.

## 💡 نمونه‌های قبل/بعد
**تغییر naming convention**

_قبل:_
```
@router.post('/markAsRead')
```

_بعد:_
```
@router.post('/mark_as_read')
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl http://localhost:8000/api/notifications/mark_as_read/1`
- `pytest tests/test_notifications.py`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر naming ممکن است clientهای قدیمی را بشکند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: low
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
- در commit message: `merged-from: c840ca53-4831-4bac-a9a2-522c7f509949, 1bd8a657-b5c1-48bc-8921-ae65fa7c2464`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 2 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): هر دو تسک به استانداردسازی و یکپارچه‌سازی قواعد نام‌گذاری برای Endpointهای API می‌پردازند. این کار باعث افزایش وضوح، کاهش ابهام و بهبود تجربه توسعه‌دهندگان می‌شود.
🎯 theme: استانداردسازی نام‌گذاری Endpointهای API
💎 estimated_difficulty: small

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 2
  id: c840ca53-4831-4bac-a9a2-522c7f509949
  عنوان اصلی: استانداردسازی naming convention endpointهای API به plural
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/ai.py, app/routes/auth.py, app/routes/tasks.py

📋 acceptance_criteria کامل:
  - تمام endpointها از prefix plural استفاده کنند [verify_method=static] [verify_plan={"grep_patterns": ["prefix\\s*=\\s*['\"]/tasks['\"]", "prefix\\s*=\\s*['\"]/ai['\"]", "prefix\\s*=\\s*['\"]/auth['\"]"], "files_hint": ["app/routes/tasks.py", "app/routes/ai.py", "app/routes/auth.py"]]
  - تست‌های موجود با prefix جدید تطبیق داده شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - مستندات API به‌روزرسانی شود [verify_method=static] [verify_plan={"grep_patterns": ["/tasks", "/ai", "/auth"], "files_hint": ["docs/"]}]

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
ناسازگاری در naming convention endpointهای API (plural vs singular)

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:1-10` — `router prefix` — این prefix صحیح است و باید به عنوان استاندارد در نظر گرفته شود
  ```python
  router = APIRouter(prefix='/tasks', tags=['tasks'])
  ```
- `app/routes/ai.py:1-10` — `router prefix` — این prefix با استاندارد plural همخوانی ندارد
  ```python
  router = APIRouter(prefix='/ai', tags=['ai'])
  ```
- `app/routes/auth.py:1-10` — `router prefix` — این prefix با استاندارد plural همخوانی ندارد
  ```python
  router = APIRouter(prefix='/auth', tags=['auth'])
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

- `app/routes/projects.py` (سطر 1) — از prefix /projects استفاده می‌کند (صحیح)
- `app/routes/users.py` (سطر 1) — از prefix /users استفاده می‌کند (صحیح)
- `app/routes/notifications.py` (سطر 1) — از prefix /notifications استفاده می‌کند (صحیح)

## 🌐 نقشهٔ وابستگی‌ها
این تغییر بر تمام کلاینت‌هایی که از این endpointها استفاده می‌کنند تأثیر می‌گذارد، از جمله فرانت‌اند و تست‌ها

## 🔍 Context و وضعیت فعلی
در فایل app/routes/tasks.py از prefix /tasks استفاده شده، در حالی که app/routes/projects.py از /projects و app/routes/users.py از /users استفاده می‌کند. این ناسازگاری در naming convention باعث سردرگمی در توسعه و مستندسازی می‌شود. همچنین app/routes/ai.py از /ai و app/routes/auth.py از /auth استفاده می‌کند که با بقیه همخوانی ندارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تمام endpointها از prefix plural استفاده کنند
- [ ] تست‌های موجود با prefix جدید تطبیق داده شوند
- [ ] مستندات API به‌روزرسانی شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یکپارچه‌سازی naming convention تمام endpointها به صورت plural (مثلاً /ai → /ai-services یا /ai-assistants) و اطمینان از consistency در کل پروژه

## 💡 نمونه‌های قبل/بعد
**تغییر prefix در ai.py**

_قبل:_
```
router = APIRouter(prefix='/ai', tags=['ai'])
```

_بعد:_
```
router = APIRouter(prefix='/ai-services', tags=['ai'])
```

**تغییر prefix در auth.py**

_قبل:_
```
router = APIRouter(prefix='/auth', tags=['auth'])
```

_بعد:_
```
router = APIRouter(prefix='/auth-services', tags=['auth'])
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/ -v`
- `curl http://localhost:8000/openapi.json | jq '.paths | keys'`

## ⚠️ ریسک‌ها و موارد احتیاط
شکستن کلاینت‌های موجود در صورت عدم به‌روزرسانی همزمان

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
تسک 2 از 2
  id: 1bd8a657-b5c1-48bc-8921-ae65fa7c2464
  عنوان اصلی: تغییر naming convention endpointهای notification به snake_case
  اولویت اصلی: low
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/notifications.py

📋 acceptance_criteria کامل:
  - همه endpointهای notification از snake_case استفاده کنند [verify_method=static] [verify_plan={"grep_patterns": ["@router\\.(get|post|put|delete|patch)\\(.*[a-z][A-Z]"], "files_hint": ["app/routes/notifications.py"]}]
  - frontend به روز شود تا از naming جدید استفاده کند [verify_method=manual_only] [verify_plan={"reason": "AI پس از force re-enrich نتوانست ui_steps واقعی (click/fill/assert) تولید کند — این AC نیاز به بازبینی دستی دارد", "previous_plan": {"base": "frontend", "ui_steps": [], "grep_patterns": []]
  - تست‌های integration پاس شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_notifications.py", "timeout_seconds": 60}]

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
عدم تطابق در naming convention endpointهای notification

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/notifications.py:25-30` — `mark_as_read` — باید به snake_case تغییر کند
  ```python
  @router.post('/markAsRead')
  async def mark_as_read(notification_id: int):
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + REST API design

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/tasks.py` (سطر 20) — نمونه endpoint با snake_case
- `frontend/src/lib/api.ts` (سطر 60) — فرانت‌اند از camelCase استفاده می‌کند

## 🌐 نقشهٔ وابستگی‌ها
تمام endpointهای notification تحت تأثیر هستند.

## 🔍 Context و وضعیت فعلی
در app/routes/notifications.py، endpointها با naming convention camelCase (مثلاً `/api/notifications/markAsRead`) تعریف شده‌اند، در حالی که بقیه endpointهای پروژه از snake_case استفاده می‌کنند (مثلاً `/api/tasks/create_task`). این inconsistency باعث سردرگمی توسعه‌دهندگان می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] همه endpointهای notification از snake_case استفاده کنند
- [ ] frontend به روز شود تا از naming جدید استفاده کند
- [ ] تست‌های integration پاس شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تغییر naming convention endpointهای notification به snake_case برای هماهنگی با بقیه پروژه.

## 💡 نمونه‌های قبل/بعد
**تغییر naming convention**

_قبل:_
```
@router.post('/markAsRead')
```

_بعد:_
```
@router.post('/mark_as_read')
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl http://localhost:8000/api/notifications/mark_as_read/1`
- `pytest tests/test_notifications.py`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر naming ممکن است clientهای قدیمی را بشکند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: low
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
- در commit message: `merged-from: c840ca53-4831-4bac-a9a2-522c7f509949, 1bd8a657-b5c1-48bc-8921-ae65fa7c2464`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. تمام endpointها از prefix plural استفاده کنند _(verify: static)_
2. تست‌های موجود با prefix جدید تطبیق داده شوند _(verify: backend_test)_
3. مستندات API به‌روزرسانی شود _(verify: static)_
4. همه endpointهای notification از snake_case استفاده کنند _(verify: static)_
5. frontend به روز شود تا از naming جدید استفاده کند _(verify: manual_only)_
6. تست‌های integration پاس شوند _(verify: backend_test)_

## Task Steps

### Step 1: بررسی اولیه و تحلیل وضعیت فعلی naming convention در repo
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی کامل repo برای شناسایی وضعیت فعلی naming convention تمام endpointهای API است. باید با grep/search و خواندن فایل‌های مرتبط مشخص شود که کدام prefixها و naming conventions در حال حاضر استفاده می‌شوند. این مرحله فقط تحلیل است و هیچ تغییری در کد ایجاد نمی‌کند. خارج از این مرحله: تغییر کد، نوشتن تست، یا به‌روزرسانی مستندات.
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

### Step 2: تغییر prefix در app/routes/ai.py از '/ai' به '/ai-services'
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل تغییر مستقیم prefix router در فایل app/routes/ai.py از '/ai' به '/ai-services' است. همچنین باید tags مربوطه بررسی و در صورت نیاز به‌روزرسانی شوند. خارج از این مرحله: تغییر در فایل‌های دیگر، به‌روزرسانی تست‌ها، یا تغییر مستندات.
— [merged] این مرحله شامل تغییر مستقیم prefix router در فایل app/routes/auth.py از '/auth' به '/auth-services' است. همچنین باید tags مربوطه بررسی و در صورت نیاز به‌روزرسانی شوند. خارج از این مرحله: تغییر در فایل‌های دیگر، به‌روزرسانی تست‌ها، یا تغییر مستندات.
**Excerpt:**
```
- `app/routes/ai.py:1-10` — `router prefix` — این prefix با استاندارد plural همخوانی ندارد
  ```python
  router = APIRouter(prefix='/ai', tags=['ai'])
  ```

**تغییر prefix در ai.py**

_قبل:_
```
router = APIRouter(prefix='/ai', tags=['ai'])
```

_بعد:_
```
router = APIRouter(prefix='/ai-services', tags=['ai'])
```
```

### Step 3: بررسی prefix در app/routes/tasks.py برای اطمینان از صحت
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی فایل app/routes/tasks.py برای اطمینان از اینکه prefix '/tasks' به درستی و با استاندارد plural تنظیم شده است. اگر prefix صحیح است، هیچ تغییری ایجاد نمی‌شود. خارج از این مرحله: تغییر در فایل‌های دیگر، به‌روزرسانی تست‌ها، یا تغییر مستندات.
**Excerpt:**
```
- `app/routes/tasks.py:1-10` — `router prefix` — این prefix صحیح است و باید به عنوان استاندارد در نظر گرفته شود
  ```python
  router = APIRouter(prefix='/tasks', tags=['tasks'])
  ```
```

### Step 4: به‌روزرسانی تست‌های موجود برای تطبیق با prefix جدید در ai.py و auth.py
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل به‌روزرسانی تمام تست‌های موجود در tests/ است که از endpointهای ai.py یا auth.py استفاده می‌کنند. باید مسیرهای URL در تست‌ها از '/ai/...' به '/ai-services/...' و از '/auth/...' به '/auth-services/...' تغییر یابند. خارج از این مرحله: تغییر در فایل‌های routes، فرانت‌اند، یا مستندات.
**Excerpt:**
```
- تست‌های موجود با prefix جدید تطبیق داده شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
```

### Step 5: به‌روزرسانی مستندات API برای انعکاس prefix جدید
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل به‌روزرسانی تمام فایل‌های مستندات در docs/ است که به endpointهای ai.py و auth.py اشاره می‌کنند. باید تمام ارجاعات به '/ai' و '/auth' به '/ai-services' و '/auth-services' تغییر یابند. خارج از این مرحله: تغییر در کد، تست‌ها، یا فرانت‌اند.
**Excerpt:**
```
- مستندات API به‌روزرسانی شود [verify_method=static] [verify_plan={"grep_patterns": ["/tasks", "/ai", "/auth"], "files_hint": ["docs/"]}]
```

### Step 6: اجرای تست‌های نهایی و اعتبارسنجی linting/type-check
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تمام تست‌ها (pytest)، linter، و type-checker (mypy) برای اطمینان از عدم وجود خطا پس از تغییرات است. خارج از این مرحله: تغییرات جدید در کد یا مستندات.
**Excerpt:**
```
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)
```

### Step 7: تغییر naming convention endpoint mark_as_read در app/routes/notifications.py به snake_case
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل تغییر مستقیم endpoint '/markAsRead' در فایل app/routes/notifications.py به '/mark_as_read' است. همچنین باید تابع مربوطه (mark_as_read) بررسی شود که از snake_case استفاده می‌کند. خارج از این مرحله: تغییر در فایل‌های دیگر، به‌روزرسانی فرانت‌اند، یا تغییر تست‌ها.
**Excerpt:**
```
- `app/routes/notifications.py:25-30` — `mark_as_read` — باید به snake_case تغییر کند
  ```python
  @router.post('/markAsRead')
  async def mark_as_read(notification_id: int):
  ```

**تغییر naming convention**

_قبل:_
```
@router.post('/markAsRead')
```

_بعد:_
```
@router.post('/mark_as_read')
```
```

### Step 8: بررسی و به‌روزرسانی سایر endpointهای notification در app/routes/notifications.py برای snake_case
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی تمام endpointهای موجود در فایل app/routes/notifications.py و اطمینان از اینکه همه از snake_case استفاده می‌کنند. اگر endpointهای دیگری با camelCase وجود دارند، باید به snake_case تغییر یابند. خارج از این مرحله: تغییر در فایل‌های دیگر، به‌روزرسانی فرانت‌اند، یا تغییر تست‌ها.
**Excerpt:**
```
- همه endpointهای notification از snake_case استفاده کنند [verify_method=static] [verify_plan={"grep_patterns": ["@router\\.(get|post|put|delete|patch)\\(.*[a-z][A-Z]"], "files_hint": ["app/routes/notifications.py"]}]
```

### Step 9: به‌روزرسانی فرانت‌اند (frontend/src/lib/api.ts) برای تطبیق با naming جدید notification
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل به‌روزرسانی فایل frontend/src/lib/api.ts برای استفاده از naming جدید snake_case در endpointهای notification است. باید تمام ارجاعات به '/markAsRead' به '/mark_as_read' تغییر یابند. خارج از این مرحله: تغییر در فایل‌های routes، تست‌ها، یا مستندات.
**Excerpt:**
```
- frontend به روز شود تا از naming جدید استفاده کند [verify_method=manual_only] [verify_plan={"reason": "AI پس از force re-enrich نتوانست ui_steps واقعی (click/fill/assert) تولید کند — این AC نیاز به بازبینی دستی دارد", "previous_plan": {"base": "frontend", "ui_steps": [], "grep_patterns": []}
```

### Step 10: به‌روزرسانی تست‌های integration برای notification (tests/test_notifications.py)
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل به‌روزرسانی فایل tests/test_notifications.py برای تطبیق با naming جدید snake_case در endpointهای notification است. باید تمام ارجاعات به '/markAsRead' به '/mark_as_read' تغییر یابند. خارج از این مرحله: تغییر در فایل‌های routes، فرانت‌اند، یا مستندات.
**Excerpt:**
```
- تست‌های integration پاس شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_notifications.py", "timeout_seconds": 60}]
```

### Step 11: اجرای تست‌های نهایی و اعتبارسنجی linting/type-check برای تغییرات notification
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تمام تست‌ها (pytest)، linter، و type-checker (mypy) برای اطمینان از عدم وجود خطا پس از تغییرات notification است. خارج از این مرحله: تغییرات جدید در کد یا مستندات.
**Excerpt:**
```
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)
```

### Step 12: ایجاد commit با پیام واضح و merge message برای تغییرات تسک 1 (prefix plural)
**Status:** `partial` (70%)
**Scope:** این مرحله شامل ایجاد یک commit با پیام واضح برای تمام تغییرات مربوط به تسک 1 (تغییر prefix به plural) است. پیام commit باید شامل merged-from: c840ca53-4831-4bac-a9a2-522c7f509949 باشد. خارج از این مرحله: تغییرات مربوط به تسک 2 (notification snake_case).
**Excerpt:**
```
- در commit message: `merged-from: c840ca53-4831-4bac-a9a2-522c7f509949, 1bd8a657-b5c1-48bc-8921-ae65fa7c2464`
```

### Step 13: ایجاد commit با پیام واضح و merge message برای تغییرات تسک 2 (notification snake_case)
**Status:** `partial` (70%)
**Scope:** این مرحله شامل ایجاد یک commit با پیام واضح برای تمام تغییرات مربوط به تسک 2 (تغییر naming notification به snake_case) است. پیام commit باید شامل merged-from: 1bd8a657-b5c1-48bc-8921-ae65fa7c2464 باشد. خارج از این مرحله: تغییرات مربوط به تسک 1 (prefix plural).
**Excerpt:**
```
- در commit message: `merged-from: c840ca53-4831-4bac-a9a2-522c7f509949, 1bd8a657-b5c1-48bc-8921-ae65fa7c2464`
```
