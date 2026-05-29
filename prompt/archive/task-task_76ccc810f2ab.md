---
task_id: task_76ccc810f2ab
title: توسعه APIهای تسک و پروژه
type: other
priority: critical
execution_priority: 100
status: awaiting_review
external_status: pending
verification_status: partial
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-25T06:37:32.607881+00:00'
updated_at: '2026-05-29T20:32:49.494010+00:00'
archived: true
archived_at: '2026-05-25T12:39:58.217339+00:00'
tags:
- consolidated
- post_verify_merge
---

# توسعه APIهای تسک و پروژه

## Raw Idea

🧬 این یک تسک تلفیقی است — از 8 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این خوشه بر روی توسعه، اعتبارسنجی و مدیریت خطای APIهای اصلی برای تسک‌ها و پروژه‌ها تمرکز دارد. شامل اعتبارسنجی ورودی، تنظیم مسیرها، توسعه APIهای جدید، اصلاح مدل‌های داده و پیاده‌سازی مدیریت خطا در routeها می‌شود. فایل‌های مرتبط شامل app/routes/tasks.py، app/routes/projects.py و app/schemas/task_schema.py هستند.
🎯 theme: توسعه و اعتبارسنجی APIهای تسک و پروژه
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 8
  id: 857b4f2e-4d4c-4a40-aeb4-595395d2f23a
  عنوان اصلی: Add input validation for task title creation
  اولویت اصلی: critical
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/routes/tasks.py, app/schemas/task_schema.py

📋 acceptance_criteria کامل:
  - POST /api/tasks with empty title returns 422 validation error [verify_method=static] [verify_plan={"grep_patterns": ["POST", "tasks", "empty", "title", "returns", "validation", "error"], "files_hint": []}]
  - POST /api/tasks with title > 255 chars returns 422 [verify_method=static] [verify_plan={"grep_patterns": ["POST", "tasks", "title", "chars", "returns"], "files_hint": []}]
  - POST /api/tasks with valid title succeeds [verify_method=static] [verify_plan={"grep_patterns": ["POST", "tasks", "valid", "title", "succeeds"], "files_hint": []}]

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
Missing input validation for task title in create endpoint

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/schemas/task_schema.py:1-30` — `TaskCreate` — Schema definition that needs validation
  ```python
  class TaskCreate(BaseModel):
      title: str  # ⚠️ no min_length constraint
      description: Optional[str] = None
      ...
  ```
- `app/routes/tasks.py:15-40` — `create_task` — Route handler missing input validation
  ```python
  @router.post('/')
  async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
      # ⚠️ no validation before DB insert
      db_task = Task(**task.dict())
      db.add(db_task)
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
FastAPI + SQLAlchemy + Pydantic v2

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/models/task.py` (سطر 10) — Database model that stores the title
- `app/database.py` (سطر 25) — Database session dependency

## 🌐 نقشهٔ وابستگی‌ها
This affects all task creation flows including API, webhook, and potential bulk imports.

## 🔍 Context و وضعیت فعلی
The task creation endpoint does not validate the title field for empty or null values. This can lead to database integrity issues and inconsistent state. The Pydantic schema allows empty strings, and no additional validation is performed in the route handler.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] POST /api/tasks with empty title returns 422 validation error
- [ ] POST /api/tasks with title > 255 chars returns 422
- [ ] POST /api/tasks with valid title succeeds
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Add validation to ensure task title is non-empty and within reasonable length limits. Update the Pydantic schema to use constr(min_length=1, max_length=255) and add a check in the route handler.

## 💡 نمونه‌های قبل/بعد
**Add validation to schema**

_قبل:_
```
title: str
```

_بعد:_
```
title: constr(min_length=1, max_length=255)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -X POST http://localhost:8000/api/tasks -H 'Content-Type: application/json' -d '{"title": ""}'`
- `pytest tests/test_tasks.py -k test_create_task_empty_title`

## ⚠️ ریسک‌ها و موارد احتیاط
Minimal risk; existing valid requests will continue to work

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 8
  id: 58441a76-5ac5-4844-8d6e-8d5408685806
  عنوان اصلی: تنظیم endpointهای تسک به /api/tasks
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/tasks.py

📋 acceptance_criteria کامل:
  - فرانت‌اند بتواند تسک‌ها را با موفقیت fetch کند [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/tasks"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "assert_visible", "selector": "[data-testid='task-list']"}], ]
  - همه endpointهای تسک در backend با پیشوند /api/tasks در دسترس باشند [verify_method=static] [verify_plan={"grep_patterns": ["@router\\.(get|post|put|delete|patch)\\(\"/api/tasks"], "files_hint": ["app/routes/tasks.py"]}]
  - تست‌های integration backend پاس شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_tasks.py", "timeout_seconds": 60}]

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
ناسازگاری در نام endpoint بین frontend و backend برای مدیریت تسک‌ها

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:1-10` — `router prefix` — پیشوند v1 باعث ناسازگاری با فرانت‌اند می‌شود
  ```python
  router = APIRouter(prefix='/api/v1/tasks', tags=['tasks'])
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI backend با Next.js frontend

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/lib/api.ts` (سطر 25) — فرانت‌اند endpoint را بدون v1 صدا می‌زند
- `app/main.py` (سطر 15) — فایل اصلی که روترها را mount می‌کند

## 🌐 نقشهٔ وابستگی‌ها
تمام عملیات CRUD تسک‌ها تحت تأثیر این mismatch قرار دارند.

## 🔍 Context و وضعیت فعلی
در فایل frontend/src/lib/api.ts (فرضی) endpoint تسک‌ها با نام `/api/tasks` فراخوانی می‌شود، اما در backend (app/routes/tasks.py) endpoint با پیشوند `/api/v1/tasks` تعریف شده است. این mismatch باعث 404 در تمام درخواست‌های تسک از فرانت‌اند می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فرانت‌اند بتواند تسک‌ها را با موفقیت fetch کند
- [ ] همه endpointهای تسک در backend با پیشوند /api/tasks در دسترس باشند
- [ ] تست‌های integration backend پاس شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یکپارچه‌سازی مسیرها: یا پیشوند v1 را از backend حذف کنید، یا آن را در frontend اضافه کنید. ترجیحاً backend را تغییر دهید تا با frontend هماهنگ شود.

## 💡 نمونه‌های قبل/بعد
**تغییر پیشوند روتر**

_قبل:_
```
router = APIRouter(prefix='/api/v1/tasks', tags=['tasks'])
```

_بعد:_
```
router = APIRouter(prefix='/api/tasks', tags=['tasks'])
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl http://localhost:8000/api/tasks/`
- `npm run test -- tasks`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر مسیر ممکن است مستندات API قدیمی را نامعتبر کند

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
تسک 3 از 8
  id: 45e6dd7f-455c-441e-8483-149d792bd837
  عنوان اصلی: توسعه API ایجاد و لیست پروژه‌ها
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/projects.py

📋 acceptance_criteria کامل:
  - ارسال POST به /api/projects با بدنه معتبر، پروژه جدید ایجاد کند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/projects", "headers": {"Content-Type": "application/json"}, "json_body": {"name": "test project", "description": "test"}, "expected_status": 201, "required_fields": ["]
  - ارسال GET به /api/projects لیست پروژه‌ها را برگرداند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/projects", "headers": null, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null}]
  - تست واحد برای هر دو method اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_projects.py::test_create_project", "timeout_seconds": 60}]

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
عدم تطابق HTTP method برای ایجاد پروژه جدید

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/projects.py:15-20` — `create_project` — باید POST باشد نه GET
  ```python
  @router.get('/')
  async def create_project(project: ProjectCreate):
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + Pydantic validation

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/lib/api.ts` (سطر 42) — فرانت‌اند با POST صدا می‌زند
- `app/schemas/project_schema.py` (سطر 10) — schema مربوط به ProjectCreate

## 🌐 نقشهٔ وابستگی‌ها
تنها endpoint ایجاد پروژه تحت تأثیر است.

## 🔍 Context و وضعیت فعلی
در frontend (فرضی) برای ایجاد پروژه از POST به `/api/projects` استفاده می‌شود، اما backend در app/routes/projects.py این endpoint را با GET تعریف کرده است. این باعث خطای Method Not Allowed (405) می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] ارسال POST به /api/projects با بدنه معتبر، پروژه جدید ایجاد کند
- [ ] ارسال GET به /api/projects لیست پروژه‌ها را برگرداند
- [ ] تست واحد برای هر دو method اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تغییر decorator در backend از @router.get به @router.post برای endpoint ایجاد پروژه.

## 💡 نمونه‌های قبل/بعد
**تغییر HTTP method**

_قبل:_
```
@router.get('/')
async def create_project(project: ProjectCreate):
```

_بعد:_
```
@router.post('/')
async def create_project(project: ProjectCreate):
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -X POST http://localhost:8000/api/projects/ -H 'Content-Type: application/json' -d '{"name":"test"}'`
- `pytest tests/test_projects.py -k create`

## ⚠️ ریسک‌ها و موارد احتیاط
ندارد

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
  id: 837fc1d1-d647-45b4-8dfe-70bb8bbc212c
  عنوان اصلی: پیاده‌سازی اعتبارسنجی و پاکسازی ورودی در Task API
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/routes/tasks.py

📋 acceptance_criteria کامل:
  - فیلد title حداکثر 200 کاراکتر و فیلد description حداکثر 1000 کاراکتر باشد [verify_method=static] [verify_plan={"grep_patterns": ["title.*max_length.*200", "description.*max_length.*1000", "max_length.*200", "max_length.*1000"], "files_hint": ["app/routes/tasks.py"]}]
  - کاراکترهای HTML در title و description escape شوند [verify_method=static] [verify_plan={"grep_patterns": ["escape", "sanitize", "html.escape", "bleach", "markupsafe"], "files_hint": ["app/routes/tasks.py"]}]
  - SQL injection از طریق parameterized queries غیرممکن شود [verify_method=static] [verify_plan={"grep_patterns": ["execute\\(.*%s", "execute\\(.*\\?", "parameterized", "cursor\\.execute\\(.*,.*\\)"], "files_hint": ["app/routes/tasks.py"]}]
  - تست واحد برای validation و sanitization اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_tasks.py::test_validation_and_sanitization", "timeout_seconds": 60}]

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
عدم اعتبارسنجی ورودی در endpointهای ایجاد و ویرایش task

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:20-65` — `create_task` — endpointهای ایجاد و ویرایش task که نیاز به input validation دارند
  ```python
  @router.post('/tasks')
  async def create_task(request: Request):
      data = await request.json()
      # ⚠️ بدون validation
      task = Task(title=data['title'], description=data.get('description'))
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
FastAPI + Pydantic v2 + SQLAlchemy

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/schemas/task_schema.py` (سطر 1) — محل مناسب برای تعریف Pydantic models
- `app/models/task.py` (سطر 10) — مدل دیتابیس task
- `app/services/planner_service.py` (سطر 45) — سرویس planner که از task استفاده می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این تغییر روی تمام endpointهای CRUD task تأثیر می‌گذارد و نیاز به بازنویسی schemas و validation logic دارد.

## 🔍 Context و وضعیت فعلی
در فایل app/routes/tasks.py، endpointهای POST /tasks و PUT /tasks/{id} (خطوط 20-65) هیچ اعتبارسنجی روی فیلدهای ورودی انجام نمی‌دهند. این آسیب‌پذیری امکان XSS (Cross-Site Scripting) از طریق فیلدهای title و description و همچنین SQL injection در صورت استفاده مستقیم از مقادیر در queryها را فراهم می‌کند. شواهد: کد موجود در خطوط 20-65 مستقیماً از request.json() استفاده می‌کند بدون هیچ validation یا sanitization.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فیلد title حداکثر 200 کاراکتر و فیلد description حداکثر 1000 کاراکتر باشد
- [ ] کاراکترهای HTML در title و description escape شوند
- [ ] SQL injection از طریق parameterized queries غیرممکن شود
- [ ] تست واحد برای validation و sanitization اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن Pydantic models برای اعتبارسنجی ورودی با محدودیت طول رشته، escape کردن کاراکترهای خاص HTML، و استفاده از parameterized queries برای تمام عملیات دیتابیس.

## 💡 نمونه‌های قبل/بعد
**اعتبارسنجی با Pydantic**

_قبل:_
```
data = await request.json()
task = Task(title=data['title'])
```

_بعد:_
```
task_data = TaskCreate(**await request.json())
task = Task(title=escape_html(task_data.title), description=escape_html(task_data.description))
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_tasks.py -k test_input_validation`
- `curl -X POST http://localhost:8000/api/tasks -H 'Content-Type: application/json' -d '{"title": "<script>alert(1)</script>"}'`

## ⚠️ ریسک‌ها و موارد احتیاط
متوسط؛ نیاز به تغییر schemas و اضافه کردن sanitization utility

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
تسک 5 از 8
  id: d7f9cc88-9dce-4a64-be55-d9583024149d
  عنوان اصلی: اصلاح نوع داده due_date در Pydantic و SQLAlchemy
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/models/task.py, app/schemas/task_schema.py

📋 acceptance_criteria کامل:
  - فیلد due_date در schema از نوع date است [verify_method=static] [verify_plan={"grep_patterns": ["due_date: date", "due_date: datetime"], "files_hint": ["app/schemas/task_schema.py"]}]
  - ایجاد task با due_date بدون خطا کار می‌کند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/tasks", "headers": {"Content-Type": "application/json"}, "json_body": {"title": "test", "due_date": "2025-03-15"}, "expected_status": 201, "required_fields": ["id", "d]
  - تست‌های مربوط به tasks پاس می‌شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_tasks.py", "timeout_seconds": 60}]

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
عدم تطابق نوع داده در schemaهای Pydantic با مدل‌های SQLAlchemy

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/schemas/task_schema.py:10-15` — `TaskCreate` — فیلد due_date با نوع اشتباه
  ```python
  class TaskCreate(BaseModel):
      title: str
      description: str | None = None
      due_date: datetime  # باید date باشد
      priority: int = 0
  ```
- `app/models/task.py:15-20` — `Task` — مدل SQLAlchemy با نوع Date
  ```python
  class Task(Base):
      __tablename__ = 'tasks'
      id = Column(Integer, primary_key=True)
      title = Column(String, nullable=False)
      due_date = Column(Date, nullable=True)  # نوع Date
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Python، Pydantic، SQLAlchemy، FastAPI

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/tasks.py` (سطر 20) — از schemaها استفاده می‌کند
- `app/services/planner_service.py` (سطر 30) — از مدل Task استفاده می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این باگ می‌تواند باعث خطا در ایجاد و به‌روزرسانی tasks شود.

## 🔍 Context و وضعیت فعلی
در فایل app/schemas/task_schema.py، فیلد due_date از نوع datetime تعریف شده است، اما در مدل SQLAlchemy (app/models/task.py) این فیلد از نوع Date است. این عدم تطابق می‌تواند باعث خطاهای serialization/deserialization در API شود. شواهد: در task_schema.py: due_date: datetime، در task.py: due_date = Column(Date).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فیلد due_date در schema از نوع date است
- [ ] ایجاد task با due_date بدون خطا کار می‌کند
- [ ] تست‌های مربوط به tasks پاس می‌شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. نوع فیلد due_date را در schema به date تغییر دهید تا با مدل SQLAlchemy مطابقت داشته باشد. همچنین، سایر فیلدها را برای تطابق بررسی کنید.

## 💡 نمونه‌های قبل/بعد
**رفع نوع فیلد**

_قبل:_
```
due_date: datetime
```

_بعد:_
```
due_date: date
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_tasks.py`

## ⚠️ ریسک‌ها و موارد احتیاط
کم. تغییر نوع در schema ممکن است نیاز به تغییر در فرانت‌اند داشته باشد.

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
تسک 6 از 8
  id: bf2eeac2-387f-4b07-b4ec-9883e1349c78
  عنوان اصلی: پیاده‌سازی مدیریت خطا در routeها
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/tasks.py

📋 acceptance_criteria کامل:
  - همه routeها خطاهای 404، 422، 500 را به درستی مدیریت می‌کنند [verify_method=static] [verify_plan={"grep_patterns": ["raise HTTPException\\(status_code=404", "raise HTTPException\\(status_code=422", "raise HTTPException\\(status_code=500", "except.*HTTPException", "except.*Exception"], "files_hint]
  - خطاها در فایل لاگ ذخیره می‌شوند [verify_method=static] [verify_plan={"grep_patterns": ["logging\\.(error|exception|warning|info)", "logger\\.(error|exception|warning|info)", "import logging"], "files_hint": ["app/routes/tasks.py", "app/routes/projects.py"]}]
  - فرمت خطاها یکسان و قابل پیش‌بینی است [verify_method=static] [verify_plan={"grep_patterns": ["class.*ErrorResponse", "def.*error_response", "JSONResponse\\(status_code=.*, content=.*\\{.*\"detail\"", "\"detail\""], "files_hint": ["app/routes/tasks.py", "app/routes/projects.]
  - تست‌های خطا برای هر route اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_error_handling.py", "timeout_seconds": 60}]

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
مدیریت خطا (error handling) در routeها پیاده‌سازی نشده است

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:30-50` — `get_task` — اگر task وجود نداشته باشد، None برمی‌گرداند که باعث خطای 500 می‌شود
  ```python
  @router.get("/tasks/{task_id}")
  async def get_task(task_id: int, db: Session = Depends(get_db)):
      task = db.query(Task).filter(Task.id == task_id).first()
      return task
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + SQLAlchemy + Python logging

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/middleware.py` (سطر 1) — برای اضافه کردن global exception handler
- `config/logging_config.py` (سطر 1) — برای logging خطاها

## 🌐 نقشهٔ وابستگی‌ها
این تغییر بر تمام routeها تأثیر می‌گذارد. نیاز به هماهنگی با تیم فرانت‌اند برای فرمت خطاها.

## 🔍 Context و وضعیت فعلی
در اکثر routeها (مثلاً app/routes/tasks.py و app/routes/projects.py)، خطاها به درستی مدیریت نمی‌شوند. اگر دیتابیس در دسترس نباشد یا یک رکورد پیدا نشود، خطای 500 برمی‌گردد به جای خطای مناسب (404 برای not found، 503 برای unavailable). همچنین هیچ logging مناسبی برای خطاها وجود ندارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] همه routeها خطاهای 404، 422، 500 را به درستی مدیریت می‌کنند
- [ ] خطاها در فایل لاگ ذخیره می‌شوند
- [ ] فرمت خطاها یکسان و قابل پیش‌بینی است
- [ ] تست‌های خطا برای هر route اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن error handling مناسب در تمام routeها با استفاده از HTTPException و custom exception handlers. پیاده‌سازی logging ساختاریافته برای خطاها با استفاده از logging_config.py.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن error handling برای not found**

_قبل:_
```
task = db.query(Task).filter(Task.id == task_id).first()
return task
```

_بعد:_
```
task = db.query(Task).filter(Task.id == task_id).first()
if not task:
    raise HTTPException(status_code=404, detail="Task not found")
return task
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/ -v -k error`
- `curl -X GET http://localhost:8000/tasks/99999 | jq .`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر در فرمت خطاها ممکن است فرانت‌اند را بشکند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 8
  id: aafcddaf-eeec-49bf-8941-c247333114d4
  عنوان اصلی: پیاده‌سازی قوانین اعتبارسنجی Pydantic
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/schemas/task_schema.py, app/schemas/user_schema.py

📋 acceptance_criteria کامل:
  - TaskCreate.priority فقط مقادیر 0-5 را بپذیرد [verify_method=static] [verify_plan={"grep_patterns": ["priority.*Field.*ge=0.*le=5", "priority.*Field.*ge=0.*le=5"], "files_hint": ["app/schemas/task_schema.py"]}]
  - UserCreate.email با فرمت معتبر ایمیل بررسی شود [verify_method=static] [verify_plan={"grep_patterns": ["EmailStr", "email.*validator"], "files_hint": ["app/schemas/user_schema.py"]}]
  - UserCreate.password حداقل 8 کاراکتر باشد [verify_method=static] [verify_plan={"grep_patterns": ["password.*Field.*min_length=8", "password.*Field.*min_length=8"], "files_hint": ["app/schemas/user_schema.py"]}]
  - تست‌های unit برای validation اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_schemas.py", "timeout_seconds": 60}]

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
عدم وجود validation در schemaهای Pydantic

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/schemas/task_schema.py:1-30` — `TaskCreate` — فیلدهای due_date و priority validation ندارند
  ```python
  class TaskCreate(BaseModel):
      title: str
      description: str | None = None
      due_date: datetime | None = None
      priority: int = 0
  ```
- `app/schemas/user_schema.py:1-25` — `UserCreate` — فیلدهای email و password validation ندارند
  ```python
  class UserCreate(BaseModel):
      email: str
      password: str
      username: str
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Pydantic v2 + FastAPI

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/tasks.py` (سطر 15) — از TaskCreate برای دریافت داده استفاده می‌کند
- `app/routes/auth.py` (سطر 20) — از UserCreate برای ثبت‌نام استفاده می‌کند
- `app/services/auth_service.py` (سطر 30) — داده‌های کاربر را پردازش می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این تغییر بر تمام endpointهایی که از این schemaها استفاده می‌کنند تأثیر می‌گذارد

## 🔍 Context و وضعیت فعلی
در فایل app/schemas/task_schema.py، فیلدهای مهم مانند due_date و priority validation ندارند. این می‌تواند منجر به ذخیره داده‌های نامعتبر در دیتابیس شود. همچنین در app/schemas/user_schema.py، validation برای email و password strength وجود ندارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] TaskCreate.priority فقط مقادیر 0-5 را بپذیرد
- [ ] UserCreate.email با فرمت معتبر ایمیل بررسی شود
- [ ] UserCreate.password حداقل 8 کاراکتر باشد
- [ ] تست‌های unit برای validation اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن validators به Pydantic models برای اطمینان از صحت داده‌ها قبل از ذخیره‌سازی

## 💡 نمونه‌های قبل/بعد
**اضافه کردن validator به TaskCreate**

_قبل:_
```
priority: int = 0
```

_بعد:_
```
priority: int = Field(default=0, ge=0, le=5, description='Priority level 0-5')
```

**اضافه کردن validator به UserCreate**

_قبل:_
```
email: str
```

_بعد:_
```
email: EmailStr
password: str = Field(min_length=8, description='Password must be at least 8 characters')
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_tasks.py -v`
- `pytest tests/test_auth.py -v`
- `curl -X POST http://localhost:8000/api/tasks -H 'Content-Type: application/json' -d '{"priority": 10}'`

## ⚠️ ریسک‌ها و موارد احتیاط
شکستن درخواست‌های موجود با داده‌های نامعتبر

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
  id: 4124ff5c-4e78-491e-ae18-e11053f89b24
  عنوان اصلی: حذف فیلدهای اضافی از پاسخ بک‌اند
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/schemas/user_schema.py

📋 acceptance_criteria کامل:
  - endpoint /api/users/:id hashed_password را برنگرداند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/users/1", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["id", "email", "name"], "json_contains": null, "forbidden_fields": ["hashed_pa]
  - frontend بتواند response را با type جدید parse کند [verify_method=static] [verify_plan={"grep_patterns": ["hashed_password"], "files_hint": ["frontend/src/types/user.ts", "frontend/src/**/*.tsx"]}]
  - تست امنیتی برای عدم وجود hashed_password در response [verify_method=backend_test] [verify_plan={"test_node": "tests/test_user_schema.py::test_response_no_hashed_password", "timeout_seconds": 30}]

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
فیلدهای اضافی در response backend که frontend انتظار ندارد

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/schemas/user_schema.py:20-30` — `UserResponse` — hashed_password نباید در response باشد
  ```python
  class UserResponse(BaseModel):
      id: int
      email: str
      name: str
      hashed_password: str  # ⚠️ نباید expose شود
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Pydantic v2 + FastAPI

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/users.py` (سطر 12) — از UserResponse در endpointها استفاده می‌کند
- `frontend/src/types/user.ts` (سطر 5) — type تعریف شده در frontend

## 🌐 نقشهٔ وابستگی‌ها
تمام endpointهای user که اطلاعات کاربر را برمی‌گردانند تحت تأثیر هستند.

## 🔍 Context و وضعیت فعلی
در app/schemas/user_schema.py، مدل UserResponse شامل فیلد `hashed_password` است که در frontend استفاده نمی‌شود و یک vulnerability امنیتی محسوب می‌شود. frontend فقط `id`, `email`, `name` را انتظار دارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] endpoint /api/users/:id hashed_password را برنگرداند
- [ ] frontend بتواند response را با type جدید parse کند
- [ ] تست امنیتی برای عدم وجود hashed_password در response
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ایجاد یک Pydantic schema جدید به نام UserPublic که فقط فیلدهای امن را شامل شود و از آن در endpointهای عمومی استفاده شود.

## 💡 نمونه‌های قبل/بعد
**ایجاد UserPublic schema**

_قبل:_
```
class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    hashed_password: str
```

_بعد:_
```
class UserPublic(BaseModel):
    id: int
    email: str
    name: str

class UserResponse(UserPublic):
    hashed_password: str  # فقط برای internal use
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl http://localhost:8000/api/users/1 | jq '.hashed_password'`
- `pytest tests/test_users.py -k security`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر schema ممکن است clientهای قدیمی را بشکند

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
- در commit message: `merged-from: 857b4f2e-4d4c-4a40-aeb4-595395d2f23a, 58441a76-5ac5-4844-8d6e-8d5408685806, 45e6dd7f-455c-441e-8483-149d792bd837, 837fc1d1-d647-45b4-8dfe-70bb8bbc212c, d7f9cc88-9dce-4a64-be55-d9583024149d, bf2eeac2-387f-4b07-b4ec-9883e1349c78, aafcddaf-eeec-49bf-8941-c247333114d4, 4124ff5c-4e78-491e-ae18-e11053f89b24`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 8 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این خوشه بر روی توسعه، اعتبارسنجی و مدیریت خطای APIهای اصلی برای تسک‌ها و پروژه‌ها تمرکز دارد. شامل اعتبارسنجی ورودی، تنظیم مسیرها، توسعه APIهای جدید، اصلاح مدل‌های داده و پیاده‌سازی مدیریت خطا در routeها می‌شود. فایل‌های مرتبط شامل app/routes/tasks.py، app/routes/projects.py و app/schemas/task_schema.py هستند.
🎯 theme: توسعه و اعتبارسنجی APIهای تسک و پروژه
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 8
  id: 857b4f2e-4d4c-4a40-aeb4-595395d2f23a
  عنوان اصلی: Add input validation for task title creation
  اولویت اصلی: critical
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/routes/tasks.py, app/schemas/task_schema.py

📋 acceptance_criteria کامل:
  - POST /api/tasks with empty title returns 422 validation error [verify_method=static] [verify_plan={"grep_patterns": ["POST", "tasks", "empty", "title", "returns", "validation", "error"], "files_hint": []}]
  - POST /api/tasks with title > 255 chars returns 422 [verify_method=static] [verify_plan={"grep_patterns": ["POST", "tasks", "title", "chars", "returns"], "files_hint": []}]
  - POST /api/tasks with valid title succeeds [verify_method=static] [verify_plan={"grep_patterns": ["POST", "tasks", "valid", "title", "succeeds"], "files_hint": []}]

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
Missing input validation for task title in create endpoint

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/schemas/task_schema.py:1-30` — `TaskCreate` — Schema definition that needs validation
  ```python
  class TaskCreate(BaseModel):
      title: str  # ⚠️ no min_length constraint
      description: Optional[str] = None
      ...
  ```
- `app/routes/tasks.py:15-40` — `create_task` — Route handler missing input validation
  ```python
  @router.post('/')
  async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
      # ⚠️ no validation before DB insert
      db_task = Task(**task.dict())
      db.add(db_task)
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
FastAPI + SQLAlchemy + Pydantic v2

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/models/task.py` (سطر 10) — Database model that stores the title
- `app/database.py` (سطر 25) — Database session dependency

## 🌐 نقشهٔ وابستگی‌ها
This affects all task creation flows including API, webhook, and potential bulk imports.

## 🔍 Context و وضعیت فعلی
The task creation endpoint does not validate the title field for empty or null values. This can lead to database integrity issues and inconsistent state. The Pydantic schema allows empty strings, and no additional validation is performed in the route handler.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] POST /api/tasks with empty title returns 422 validation error
- [ ] POST /api/tasks with title > 255 chars returns 422
- [ ] POST /api/tasks with valid title succeeds
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Add validation to ensure task title is non-empty and within reasonable length limits. Update the Pydantic schema to use constr(min_length=1, max_length=255) and add a check in the route handler.

## 💡 نمونه‌های قبل/بعد
**Add validation to schema**

_قبل:_
```
title: str
```

_بعد:_
```
title: constr(min_length=1, max_length=255)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -X POST http://localhost:8000/api/tasks -H 'Content-Type: application/json' -d '{"title": ""}'`
- `pytest tests/test_tasks.py -k test_create_task_empty_title`

## ⚠️ ریسک‌ها و موارد احتیاط
Minimal risk; existing valid requests will continue to work

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 8
  id: 58441a76-5ac5-4844-8d6e-8d5408685806
  عنوان اصلی: تنظیم endpointهای تسک به /api/tasks
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/tasks.py

📋 acceptance_criteria کامل:
  - فرانت‌اند بتواند تسک‌ها را با موفقیت fetch کند [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/tasks"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "assert_visible", "selector": "[data-testid='task-list']"}], ]
  - همه endpointهای تسک در backend با پیشوند /api/tasks در دسترس باشند [verify_method=static] [verify_plan={"grep_patterns": ["@router\\.(get|post|put|delete|patch)\\(\"/api/tasks"], "files_hint": ["app/routes/tasks.py"]}]
  - تست‌های integration backend پاس شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_tasks.py", "timeout_seconds": 60}]

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
ناسازگاری در نام endpoint بین frontend و backend برای مدیریت تسک‌ها

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:1-10` — `router prefix` — پیشوند v1 باعث ناسازگاری با فرانت‌اند می‌شود
  ```python
  router = APIRouter(prefix='/api/v1/tasks', tags=['tasks'])
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI backend با Next.js frontend

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/lib/api.ts` (سطر 25) — فرانت‌اند endpoint را بدون v1 صدا می‌زند
- `app/main.py` (سطر 15) — فایل اصلی که روترها را mount می‌کند

## 🌐 نقشهٔ وابستگی‌ها
تمام عملیات CRUD تسک‌ها تحت تأثیر این mismatch قرار دارند.

## 🔍 Context و وضعیت فعلی
در فایل frontend/src/lib/api.ts (فرضی) endpoint تسک‌ها با نام `/api/tasks` فراخوانی می‌شود، اما در backend (app/routes/tasks.py) endpoint با پیشوند `/api/v1/tasks` تعریف شده است. این mismatch باعث 404 در تمام درخواست‌های تسک از فرانت‌اند می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فرانت‌اند بتواند تسک‌ها را با موفقیت fetch کند
- [ ] همه endpointهای تسک در backend با پیشوند /api/tasks در دسترس باشند
- [ ] تست‌های integration backend پاس شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یکپارچه‌سازی مسیرها: یا پیشوند v1 را از backend حذف کنید، یا آن را در frontend اضافه کنید. ترجیحاً backend را تغییر دهید تا با frontend هماهنگ شود.

## 💡 نمونه‌های قبل/بعد
**تغییر پیشوند روتر**

_قبل:_
```
router = APIRouter(prefix='/api/v1/tasks', tags=['tasks'])
```

_بعد:_
```
router = APIRouter(prefix='/api/tasks', tags=['tasks'])
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl http://localhost:8000/api/tasks/`
- `npm run test -- tasks`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر مسیر ممکن است مستندات API قدیمی را نامعتبر کند

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
تسک 3 از 8
  id: 45e6dd7f-455c-441e-8483-149d792bd837
  عنوان اصلی: توسعه API ایجاد و لیست پروژه‌ها
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/projects.py

📋 acceptance_criteria کامل:
  - ارسال POST به /api/projects با بدنه معتبر، پروژه جدید ایجاد کند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/projects", "headers": {"Content-Type": "application/json"}, "json_body": {"name": "test project", "description": "test"}, "expected_status": 201, "required_fields": ["]
  - ارسال GET به /api/projects لیست پروژه‌ها را برگرداند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/projects", "headers": null, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null}]
  - تست واحد برای هر دو method اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_projects.py::test_create_project", "timeout_seconds": 60}]

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
عدم تطابق HTTP method برای ایجاد پروژه جدید

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/projects.py:15-20` — `create_project` — باید POST باشد نه GET
  ```python
  @router.get('/')
  async def create_project(project: ProjectCreate):
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + Pydantic validation

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/lib/api.ts` (سطر 42) — فرانت‌اند با POST صدا می‌زند
- `app/schemas/project_schema.py` (سطر 10) — schema مربوط به ProjectCreate

## 🌐 نقشهٔ وابستگی‌ها
تنها endpoint ایجاد پروژه تحت تأثیر است.

## 🔍 Context و وضعیت فعلی
در frontend (فرضی) برای ایجاد پروژه از POST به `/api/projects` استفاده می‌شود، اما backend در app/routes/projects.py این endpoint را با GET تعریف کرده است. این باعث خطای Method Not Allowed (405) می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] ارسال POST به /api/projects با بدنه معتبر، پروژه جدید ایجاد کند
- [ ] ارسال GET به /api/projects لیست پروژه‌ها را برگرداند
- [ ] تست واحد برای هر دو method اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تغییر decorator در backend از @router.get به @router.post برای endpoint ایجاد پروژه.

## 💡 نمونه‌های قبل/بعد
**تغییر HTTP method**

_قبل:_
```
@router.get('/')
async def create_project(project: ProjectCreate):
```

_بعد:_
```
@router.post('/')
async def create_project(project: ProjectCreate):
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -X POST http://localhost:8000/api/projects/ -H 'Content-Type: application/json' -d '{"name":"test"}'`
- `pytest tests/test_projects.py -k create`

## ⚠️ ریسک‌ها و موارد احتیاط
ندارد

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
  id: 837fc1d1-d647-45b4-8dfe-70bb8bbc212c
  عنوان اصلی: پیاده‌سازی اعتبارسنجی و پاکسازی ورودی در Task API
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/routes/tasks.py

📋 acceptance_criteria کامل:
  - فیلد title حداکثر 200 کاراکتر و فیلد description حداکثر 1000 کاراکتر باشد [verify_method=static] [verify_plan={"grep_patterns": ["title.*max_length.*200", "description.*max_length.*1000", "max_length.*200", "max_length.*1000"], "files_hint": ["app/routes/tasks.py"]}]
  - کاراکترهای HTML در title و description escape شوند [verify_method=static] [verify_plan={"grep_patterns": ["escape", "sanitize", "html.escape", "bleach", "markupsafe"], "files_hint": ["app/routes/tasks.py"]}]
  - SQL injection از طریق parameterized queries غیرممکن شود [verify_method=static] [verify_plan={"grep_patterns": ["execute\\(.*%s", "execute\\(.*\\?", "parameterized", "cursor\\.execute\\(.*,.*\\)"], "files_hint": ["app/routes/tasks.py"]}]
  - تست واحد برای validation و sanitization اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_tasks.py::test_validation_and_sanitization", "timeout_seconds": 60}]

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
عدم اعتبارسنجی ورودی در endpointهای ایجاد و ویرایش task

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:20-65` — `create_task` — endpointهای ایجاد و ویرایش task که نیاز به input validation دارند
  ```python
  @router.post('/tasks')
  async def create_task(request: Request):
      data = await request.json()
      # ⚠️ بدون validation
      task = Task(title=data['title'], description=data.get('description'))
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
FastAPI + Pydantic v2 + SQLAlchemy

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/schemas/task_schema.py` (سطر 1) — محل مناسب برای تعریف Pydantic models
- `app/models/task.py` (سطر 10) — مدل دیتابیس task
- `app/services/planner_service.py` (سطر 45) — سرویس planner که از task استفاده می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این تغییر روی تمام endpointهای CRUD task تأثیر می‌گذارد و نیاز به بازنویسی schemas و validation logic دارد.

## 🔍 Context و وضعیت فعلی
در فایل app/routes/tasks.py، endpointهای POST /tasks و PUT /tasks/{id} (خطوط 20-65) هیچ اعتبارسنجی روی فیلدهای ورودی انجام نمی‌دهند. این آسیب‌پذیری امکان XSS (Cross-Site Scripting) از طریق فیلدهای title و description و همچنین SQL injection در صورت استفاده مستقیم از مقادیر در queryها را فراهم می‌کند. شواهد: کد موجود در خطوط 20-65 مستقیماً از request.json() استفاده می‌کند بدون هیچ validation یا sanitization.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فیلد title حداکثر 200 کاراکتر و فیلد description حداکثر 1000 کاراکتر باشد
- [ ] کاراکترهای HTML در title و description escape شوند
- [ ] SQL injection از طریق parameterized queries غیرممکن شود
- [ ] تست واحد برای validation و sanitization اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن Pydantic models برای اعتبارسنجی ورودی با محدودیت طول رشته، escape کردن کاراکترهای خاص HTML، و استفاده از parameterized queries برای تمام عملیات دیتابیس.

## 💡 نمونه‌های قبل/بعد
**اعتبارسنجی با Pydantic**

_قبل:_
```
data = await request.json()
task = Task(title=data['title'])
```

_بعد:_
```
task_data = TaskCreate(**await request.json())
task = Task(title=escape_html(task_data.title), description=escape_html(task_data.description))
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_tasks.py -k test_input_validation`
- `curl -X POST http://localhost:8000/api/tasks -H 'Content-Type: application/json' -d '{"title": "<script>alert(1)</script>"}'`

## ⚠️ ریسک‌ها و موارد احتیاط
متوسط؛ نیاز به تغییر schemas و اضافه کردن sanitization utility

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
تسک 5 از 8
  id: d7f9cc88-9dce-4a64-be55-d9583024149d
  عنوان اصلی: اصلاح نوع داده due_date در Pydantic و SQLAlchemy
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/models/task.py, app/schemas/task_schema.py

📋 acceptance_criteria کامل:
  - فیلد due_date در schema از نوع date است [verify_method=static] [verify_plan={"grep_patterns": ["due_date: date", "due_date: datetime"], "files_hint": ["app/schemas/task_schema.py"]}]
  - ایجاد task با due_date بدون خطا کار می‌کند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/tasks", "headers": {"Content-Type": "application/json"}, "json_body": {"title": "test", "due_date": "2025-03-15"}, "expected_status": 201, "required_fields": ["id", "d]
  - تست‌های مربوط به tasks پاس می‌شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_tasks.py", "timeout_seconds": 60}]

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
عدم تطابق نوع داده در schemaهای Pydantic با مدل‌های SQLAlchemy

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/schemas/task_schema.py:10-15` — `TaskCreate` — فیلد due_date با نوع اشتباه
  ```python
  class TaskCreate(BaseModel):
      title: str
      description: str | None = None
      due_date: datetime  # باید date باشد
      priority: int = 0
  ```
- `app/models/task.py:15-20` — `Task` — مدل SQLAlchemy با نوع Date
  ```python
  class Task(Base):
      __tablename__ = 'tasks'
      id = Column(Integer, primary_key=True)
      title = Column(String, nullable=False)
      due_date = Column(Date, nullable=True)  # نوع Date
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Python، Pydantic، SQLAlchemy، FastAPI

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/tasks.py` (سطر 20) — از schemaها استفاده می‌کند
- `app/services/planner_service.py` (سطر 30) — از مدل Task استفاده می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این باگ می‌تواند باعث خطا در ایجاد و به‌روزرسانی tasks شود.

## 🔍 Context و وضعیت فعلی
در فایل app/schemas/task_schema.py، فیلد due_date از نوع datetime تعریف شده است، اما در مدل SQLAlchemy (app/models/task.py) این فیلد از نوع Date است. این عدم تطابق می‌تواند باعث خطاهای serialization/deserialization در API شود. شواهد: در task_schema.py: due_date: datetime، در task.py: due_date = Column(Date).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فیلد due_date در schema از نوع date است
- [ ] ایجاد task با due_date بدون خطا کار می‌کند
- [ ] تست‌های مربوط به tasks پاس می‌شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. نوع فیلد due_date را در schema به date تغییر دهید تا با مدل SQLAlchemy مطابقت داشته باشد. همچنین، سایر فیلدها را برای تطابق بررسی کنید.

## 💡 نمونه‌های قبل/بعد
**رفع نوع فیلد**

_قبل:_
```
due_date: datetime
```

_بعد:_
```
due_date: date
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_tasks.py`

## ⚠️ ریسک‌ها و موارد احتیاط
کم. تغییر نوع در schema ممکن است نیاز به تغییر در فرانت‌اند داشته باشد.

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
تسک 6 از 8
  id: bf2eeac2-387f-4b07-b4ec-9883e1349c78
  عنوان اصلی: پیاده‌سازی مدیریت خطا در routeها
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/tasks.py

📋 acceptance_criteria کامل:
  - همه routeها خطاهای 404، 422، 500 را به درستی مدیریت می‌کنند [verify_method=static] [verify_plan={"grep_patterns": ["raise HTTPException\\(status_code=404", "raise HTTPException\\(status_code=422", "raise HTTPException\\(status_code=500", "except.*HTTPException", "except.*Exception"], "files_hint]
  - خطاها در فایل لاگ ذخیره می‌شوند [verify_method=static] [verify_plan={"grep_patterns": ["logging\\.(error|exception|warning|info)", "logger\\.(error|exception|warning|info)", "import logging"], "files_hint": ["app/routes/tasks.py", "app/routes/projects.py"]}]
  - فرمت خطاها یکسان و قابل پیش‌بینی است [verify_method=static] [verify_plan={"grep_patterns": ["class.*ErrorResponse", "def.*error_response", "JSONResponse\\(status_code=.*, content=.*\\{.*\"detail\"", "\"detail\""], "files_hint": ["app/routes/tasks.py", "app/routes/projects.]
  - تست‌های خطا برای هر route اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_error_handling.py", "timeout_seconds": 60}]

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
مدیریت خطا (error handling) در routeها پیاده‌سازی نشده است

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:30-50` — `get_task` — اگر task وجود نداشته باشد، None برمی‌گرداند که باعث خطای 500 می‌شود
  ```python
  @router.get("/tasks/{task_id}")
  async def get_task(task_id: int, db: Session = Depends(get_db)):
      task = db.query(Task).filter(Task.id == task_id).first()
      return task
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
FastAPI + SQLAlchemy + Python logging

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/middleware.py` (سطر 1) — برای اضافه کردن global exception handler
- `config/logging_config.py` (سطر 1) — برای logging خطاها

## 🌐 نقشهٔ وابستگی‌ها
این تغییر بر تمام routeها تأثیر می‌گذارد. نیاز به هماهنگی با تیم فرانت‌اند برای فرمت خطاها.

## 🔍 Context و وضعیت فعلی
در اکثر routeها (مثلاً app/routes/tasks.py و app/routes/projects.py)، خطاها به درستی مدیریت نمی‌شوند. اگر دیتابیس در دسترس نباشد یا یک رکورد پیدا نشود، خطای 500 برمی‌گردد به جای خطای مناسب (404 برای not found، 503 برای unavailable). همچنین هیچ logging مناسبی برای خطاها وجود ندارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] همه routeها خطاهای 404، 422، 500 را به درستی مدیریت می‌کنند
- [ ] خطاها در فایل لاگ ذخیره می‌شوند
- [ ] فرمت خطاها یکسان و قابل پیش‌بینی است
- [ ] تست‌های خطا برای هر route اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن error handling مناسب در تمام routeها با استفاده از HTTPException و custom exception handlers. پیاده‌سازی logging ساختاریافته برای خطاها با استفاده از logging_config.py.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن error handling برای not found**

_قبل:_
```
task = db.query(Task).filter(Task.id == task_id).first()
return task
```

_بعد:_
```
task = db.query(Task).filter(Task.id == task_id).first()
if not task:
    raise HTTPException(status_code=404, detail="Task not found")
return task
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/ -v -k error`
- `curl -X GET http://localhost:8000/tasks/99999 | jq .`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر در فرمت خطاها ممکن است فرانت‌اند را بشکند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 8
  id: aafcddaf-eeec-49bf-8941-c247333114d4
  عنوان اصلی: پیاده‌سازی قوانین اعتبارسنجی Pydantic
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/schemas/task_schema.py, app/schemas/user_schema.py

📋 acceptance_criteria کامل:
  - TaskCreate.priority فقط مقادیر 0-5 را بپذیرد [verify_method=static] [verify_plan={"grep_patterns": ["priority.*Field.*ge=0.*le=5", "priority.*Field.*ge=0.*le=5"], "files_hint": ["app/schemas/task_schema.py"]}]
  - UserCreate.email با فرمت معتبر ایمیل بررسی شود [verify_method=static] [verify_plan={"grep_patterns": ["EmailStr", "email.*validator"], "files_hint": ["app/schemas/user_schema.py"]}]
  - UserCreate.password حداقل 8 کاراکتر باشد [verify_method=static] [verify_plan={"grep_patterns": ["password.*Field.*min_length=8", "password.*Field.*min_length=8"], "files_hint": ["app/schemas/user_schema.py"]}]
  - تست‌های unit برای validation اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_schemas.py", "timeout_seconds": 60}]

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
عدم وجود validation در schemaهای Pydantic

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/schemas/task_schema.py:1-30` — `TaskCreate` — فیلدهای due_date و priority validation ندارند
  ```python
  class TaskCreate(BaseModel):
      title: str
      description: str | None = None
      due_date: datetime | None = None
      priority: int = 0
  ```
- `app/schemas/user_schema.py:1-25` — `UserCreate` — فیلدهای email و password validation ندارند
  ```python
  class UserCreate(BaseModel):
      email: str
      password: str
      username: str
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Pydantic v2 + FastAPI

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/tasks.py` (سطر 15) — از TaskCreate برای دریافت داده استفاده می‌کند
- `app/routes/auth.py` (سطر 20) — از UserCreate برای ثبت‌نام استفاده می‌کند
- `app/services/auth_service.py` (سطر 30) — داده‌های کاربر را پردازش می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این تغییر بر تمام endpointهایی که از این schemaها استفاده می‌کنند تأثیر می‌گذارد

## 🔍 Context و وضعیت فعلی
در فایل app/schemas/task_schema.py، فیلدهای مهم مانند due_date و priority validation ندارند. این می‌تواند منجر به ذخیره داده‌های نامعتبر در دیتابیس شود. همچنین در app/schemas/user_schema.py، validation برای email و password strength وجود ندارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] TaskCreate.priority فقط مقادیر 0-5 را بپذیرد
- [ ] UserCreate.email با فرمت معتبر ایمیل بررسی شود
- [ ] UserCreate.password حداقل 8 کاراکتر باشد
- [ ] تست‌های unit برای validation اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن validators به Pydantic models برای اطمینان از صحت داده‌ها قبل از ذخیره‌سازی

## 💡 نمونه‌های قبل/بعد
**اضافه کردن validator به TaskCreate**

_قبل:_
```
priority: int = 0
```

_بعد:_
```
priority: int = Field(default=0, ge=0, le=5, description='Priority level 0-5')
```

**اضافه کردن validator به UserCreate**

_قبل:_
```
email: str
```

_بعد:_
```
email: EmailStr
password: str = Field(min_length=8, description='Password must be at least 8 characters')
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_tasks.py -v`
- `pytest tests/test_auth.py -v`
- `curl -X POST http://localhost:8000/api/tasks -H 'Content-Type: application/json' -d '{"priority": 10}'`

## ⚠️ ریسک‌ها و موارد احتیاط
شکستن درخواست‌های موجود با داده‌های نامعتبر

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
  id: 4124ff5c-4e78-491e-ae18-e11053f89b24
  عنوان اصلی: حذف فیلدهای اضافی از پاسخ بک‌اند
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/schemas/user_schema.py

📋 acceptance_criteria کامل:
  - endpoint /api/users/:id hashed_password را برنگرداند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/users/1", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["id", "email", "name"], "json_contains": null, "forbidden_fields": ["hashed_pa]
  - frontend بتواند response را با type جدید parse کند [verify_method=static] [verify_plan={"grep_patterns": ["hashed_password"], "files_hint": ["frontend/src/types/user.ts", "frontend/src/**/*.tsx"]}]
  - تست امنیتی برای عدم وجود hashed_password در response [verify_method=backend_test] [verify_plan={"test_node": "tests/test_user_schema.py::test_response_no_hashed_password", "timeout_seconds": 30}]

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
فیلدهای اضافی در response backend که frontend انتظار ندارد

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/schemas/user_schema.py:20-30` — `UserResponse` — hashed_password نباید در response باشد
  ```python
  class UserResponse(BaseModel):
      id: int
      email: str
      name: str
      hashed_password: str  # ⚠️ نباید expose شود
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست

## 🧱 پشتهٔ فناوری و معماری
Pydantic v2 + FastAPI

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/users.py` (سطر 12) — از UserResponse در endpointها استفاده می‌کند
- `frontend/src/types/user.ts` (سطر 5) — type تعریف شده در frontend

## 🌐 نقشهٔ وابستگی‌ها
تمام endpointهای user که اطلاعات کاربر را برمی‌گردانند تحت تأثیر هستند.

## 🔍 Context و وضعیت فعلی
در app/schemas/user_schema.py، مدل UserResponse شامل فیلد `hashed_password` است که در frontend استفاده نمی‌شود و یک vulnerability امنیتی محسوب می‌شود. frontend فقط `id`, `email`, `name` را انتظار دارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] endpoint /api/users/:id hashed_password را برنگرداند
- [ ] frontend بتواند response را با type جدید parse کند
- [ ] تست امنیتی برای عدم وجود hashed_password در response
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ایجاد یک Pydantic schema جدید به نام UserPublic که فقط فیلدهای امن را شامل شود و از آن در endpointهای عمومی استفاده شود.

## 💡 نمونه‌های قبل/بعد
**ایجاد UserPublic schema**

_قبل:_
```
class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    hashed_password: str
```

_بعد:_
```
class UserPublic(BaseModel):
    id: int
    email: str
    name: str

class UserResponse(UserPublic):
    hashed_password: str  # فقط برای internal use
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl http://localhost:8000/api/users/1 | jq '.hashed_password'`
- `pytest tests/test_users.py -k security`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر schema ممکن است clientهای قدیمی را بشکند

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
- در commit message: `merged-from: 857b4f2e-4d4c-4a40-aeb4-595395d2f23a, 58441a76-5ac5-4844-8d6e-8d5408685806, 45e6dd7f-455c-441e-8483-149d792bd837, 837fc1d1-d647-45b4-8dfe-70bb8bbc212c, d7f9cc88-9dce-4a64-be55-d9583024149d, bf2eeac2-387f-4b07-b4ec-9883e1349c78, aafcddaf-eeec-49bf-8941-c247333114d4, 4124ff5c-4e78-491e-ae18-e11053f89b24`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. POST /api/tasks with empty title returns 422 validation error _(verify: static)_
2. POST /api/tasks with title > 255 chars returns 422 _(verify: static)_
3. POST /api/tasks with valid title succeeds _(verify: static)_
4. فرانت‌اند بتواند تسک‌ها را با موفقیت fetch کند _(verify: ui_interaction)_
5. همه endpointهای تسک در backend با پیشوند /api/tasks در دسترس باشند _(verify: static)_
6. تست‌های integration backend پاس شوند _(verify: backend_test)_
7. ارسال POST به /api/projects با بدنه معتبر، پروژه جدید ایجاد کند _(verify: api_response)_
8. ارسال GET به /api/projects لیست پروژه‌ها را برگرداند _(verify: api_response)_
9. تست واحد برای هر دو method اضافه شود _(verify: backend_test)_
10. فیلد title حداکثر 200 کاراکتر و فیلد description حداکثر 1000 کاراکتر باشد _(verify: static)_
11. کاراکترهای HTML در title و description escape شوند _(verify: static)_
12. SQL injection از طریق parameterized queries غیرممکن شود _(verify: static)_
13. تست واحد برای validation و sanitization اضافه شود _(verify: backend_test)_
14. فیلد due_date در schema از نوع date است _(verify: static)_
15. ایجاد task با due_date بدون خطا کار می‌کند _(verify: api_response)_
16. تست‌های مربوط به tasks پاس می‌شوند _(verify: backend_test)_
17. همه routeها خطاهای 404، 422، 500 را به درستی مدیریت می‌کنند _(verify: static)_
18. خطاها در فایل لاگ ذخیره می‌شوند _(verify: static)_
19. فرمت خطاها یکسان و قابل پیش‌بینی است _(verify: static)_
20. تست‌های خطا برای هر route اضافه شود _(verify: backend_test)_
21. TaskCreate.priority فقط مقادیر 0-5 را بپذیرد _(verify: static)_
22. UserCreate.email با فرمت معتبر ایمیل بررسی شود _(verify: static)_
23. UserCreate.password حداقل 8 کاراکتر باشد _(verify: static)_
24. تست‌های unit برای validation اضافه شود _(verify: backend_test)_
25. endpoint /api/users/:id hashed_password را برنگرداند _(verify: api_response)_
26. frontend بتواند response را با type جدید parse کند _(verify: static)_
27. تست امنیتی برای عدم وجود hashed_password در response _(verify: backend_test)_

## Task Steps

### Step 1: بررسی و تکمیل APIهای اصلی تسک و پروژه بر اساس یادداشت‌های مهم
**Status:** `done` (100%)
**Scope:** این بخش شامل دستورالعمل‌های عمومی برای مدل اجراکننده است: بررسی خودکار repo، شناسایی پیاده‌سازی‌های قبلی، جلوگیری از بازسازی، و مستندسازی تغییرات. این یک مرحله اجرایی نیست، بلکه یک هشدار و راهنما برای اجرای صحیح سایر بخش‌هاست. هیچ کد یا فایل جدیدی در این بخش ساخته نمی‌شود.
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

### Step 2: افزودن اعتبارسنجی ورودی برای فیلد title در endpoint ایجاد تسک
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن محدودیت min_length به فیلد title در schema TaskCreate و اطمینان از اعمال خودکار آن در route ایجاد تسک است. خارج از scope: تغییر در route handler، اضافه کردن validation سفارشی، یا تغییر در سایر endpointها.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
Missing input validation for task title in create endpoint

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/schemas/task_schema.py:1-30` — `TaskCreate` — Schema definition that needs validation
  ```python
  class TaskCreate(BaseModel):
      title: str  # ⚠️ no min_length constraint
      description: Optional[str] = None
      ...
  ```
- `app/routes/tasks.py:15-40` — `create_task` — Route handler missing input validation
  ```python
  @router.post('/')
  async def create_task(task: TaskCreate, db: Session = Depends(get_db)):
  ```
```

### Step 3: اعتبارسنجی فیلد title در endpoint ایجاد تسک برای جلوگیری از مقادیر خالی یا null
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن اعتبارسنجی در سطح Pydantic schema برای فیلد title در app/schemas/task_schema.py است تا از خالی یا null بودن آن جلوگیری شود. همچنین در صورت نیاز، اعتبارسنجی در route handler مربوطه در app/routes/tasks.py نیز اضافه می‌شود. این مرحله شامل تغییرات در دیتابیس یا مدل‌ها نیست و صرفاً به لایه validation مربوط می‌شود.
**Excerpt:**
```
The task creation endpoint does not validate the title field for empty or null values. This can lead to database integrity issues and inconsistent state. The Pydantic schema allows empty strings, and no additional validation is performed in the route handler.
```

### Step 4: اعتبارسنجی عنوان تسک در POST /api/tasks
**Status:** `done` (100%)
**Scope:** این بخش شامل پیاده‌سازی اعتبارسنجی برای عنوان تسک در endpoint POST /api/tasks است. محدوده شامل: به‌روزرسانی Pydantic schema برای اعمال constr(min_length=1, max_length=255)، اضافه کردن بررسی در route handler، و اطمینان از بازگشت 422 برای موارد نامعتبر. خارج از محدوده: سایر endpointها، validation برای فیلدهای دیگر، frontend validation، و تست‌های integration.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] POST /api/tasks with empty title returns 422 validation error
- [ ] POST /api/tasks with title > 255 chars returns 422
- [ ] POST /api/tasks with valid title succeeds
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Add validation to ensure task title is non-empty and within reasonable length limits. Update the Pydantic schema to use constr(min_length=1, max_length=255) and add a check in the route handler.
```

### Step 5: اعتبارسنجی به اسکیمای تسک و پروژه اضافه شود
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن constr با min_length=1 و max_length=255 به فیلد title در اسکیمای Pydantic تسک و پروژه است. فقط فایل‌های app/schemas/task_schema.py و app/schemas/project_schema.py تغییر می‌کنند. هیچ تغییری در مدل‌های دیتابیس، routeها یا frontend انجام نمی‌شود.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**Add validation to schema**

_قبل:_
```
title: str
```

_بعد:_
```
title: constr(min_length=1, max_length=255)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 6: تنظیم endpointهای تسک به /api/tasks
**Status:** `partial` (80%)
**Scope:** این بخش مربوط به تسک 2 از 8 است که هدف آن تغییر مسیر endpointهای مربوط به تسک‌ها از مسیر فعلی به /api/tasks می‌باشد. شامل تغییرات در فایل app/routes/tasks.py برای اطمینان از اینکه تمام endpointهای تسک با پیشوند /api/tasks در دسترس باشند. همچنین شامل اطمینان از اینکه فرانت‌اند بتواند تسک‌ها را fetch کند و تست‌های integration backend پاس شوند. این بخش مستقل است و وابستگی به تسک دیگری ندارد.
**Excerpt:**
```
تسک 2 از 8
  id: 58441a76-5ac5-4844-8d6e-8d5408685806
  عنوان اصلی: تنظیم endpointهای تسک به /api/tasks
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/tasks.py

📋 acceptance_criteria کامل:
  - فرانت‌اند بتواند تسک‌ها را با موفقیت fetch کند [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/tasks"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "assert_visible", "selector": "[data-testid='task-list']"}], ]
  - همه endpointهای تسک در backend با پیشوند /api/tasks در دسترس باشند [verify_method=static] [verify_plan={"grep_patterns": ["@router\\.(get|post|put|delete|patch)\\(\"/api/tasks"], "files_hint": ["app/routes/tasks.py"]}]
  - تست‌های integration backend پاس شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_tasks.py", "timeout_seconds": 60}]
```

### Step 7: بررسی و اعتبارسنجی اولیه مخزن قبل از اجرا
**Status:** `done` (100%)
**Scope:** این بخش یک یادداشت مهم برای مدل اجراکننده است و شامل دستورالعمل‌های پیش از اجرا می‌شود: بررسی خودکار مخزن، تشخیص پیاده‌سازی‌های قبلی، عدم بازسازی موارد موجود، و مسئولیت مدل در قضاوت مستقل. این بخش خود یک مرحله اجرایی نیست بلکه یک precondition برای تمام مراحل بعدی است.
— [merged] این بخش یک دستورالعمل متا برای مدل اجراکننده است و شامل هیچ مرحله اجرایی فنی نمی‌شود. وظیفه آن هشدار درباره احتمال پیاده‌سازی قبلی، لزوم بررسی مستقل مخزن، و مسئولیت‌پذیری در قبال تصمیمات است. این بخش صرفاً یک یادداشت رفتاری/رویه‌ای است و نباید به عنوان یک تسک فنی تفسیر شود.
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

### Step 8: رفع ناسازگاری پیشوند endpoint تسک‌ها بین backend و frontend
**Status:** `done` (100%)
**Scope:** این مرحله فقط تغییر پیشوند router تسک‌ها از `/api/v1/tasks` به `/api/tasks` را شامل می‌شود. هیچ تغییری در منطق business، schemaها، مدل‌ها یا endpointهای دیگر ایجاد نمی‌کند. نکته حیاتی: باید مطمئن شویم frontend از `/api/tasks` استفاده می‌کند و هیچ endpoint دیگری در backend به `/api/v1/tasks` وابسته نیست.
**Excerpt:**
```
ناسازگاری در نام endpoint بین frontend و backend برای مدیریت تسک‌ها

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:1-10` — `router prefix` — پیشوند v1 باعث ناسازگاری با فرانت‌اند می‌شود
  ```python
  router = APIRouter(prefix='/api/v1/tasks', tags=['tasks'])
  ```
```

### Step 9: رفع mismatch مسیر API بین فرانت‌اند و بک‌اند برای endpoint تسک‌ها
**Status:** `done` (100%)
**Scope:** این بخش صرفاً به رفع mismatch بین مسیر `/api/tasks` در فرانت‌اند و `/api/v1/tasks` در بک‌اند می‌پردازد. شامل تغییر مسیر در فرانت‌اند یا بک‌اند برای یکسان‌سازی است. سایر endpointها (پروژه‌ها و غیره) تحت تأثیر نیستند مگر اینکه mismatch مشابهی داشته باشند. نکته حیاتی: باید تصمیم گرفته شود که آیا پیشوند `v1` در بک‌اند حذف شود یا فرانت‌اند آن را اضافه کند.
**Excerpt:**
```
در فایل frontend/src/lib/api.ts (فرضی) endpoint تسک‌ها با نام `/api/tasks` فراخوانی می‌شود، اما در backend (app/routes/tasks.py) endpoint با پیشوند `/api/v1/tasks` تعریف شده است. این mismatch باعث 404 در تمام درخواست‌های تسک از فرانت‌اند می‌شود.
```

### Step 10: یکپارچه‌سازی مسیرهای API تسک بین فرانت‌اند و بک‌اند
**Status:** `done` (100%)
**Scope:** این مرحله شامل تغییر مسیرهای API در بک‌اند (app/main.py و app/routes/tasks.py) برای حذف پیشوند v1 و اطمینان از دسترسی endpointهای تسک با پیشوند /api/tasks است. فرانت‌اند (frontend/src/lib/api.ts) نیازی به تغییر ندارد. تست‌های integration (tests/test_tasks.py) باید پس از تغییر پاس شوند. خارج از scope: تغییرات در پروژه‌ها، مدل‌ها، اسکیماها، یا سرویس‌ها.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فرانت‌اند بتواند تسک‌ها را با موفقیت fetch کند
- [ ] همه endpointهای تسک در backend با پیشوند /api/tasks در دسترس باشند
- [ ] تست‌های integration backend پاس شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یکپارچه‌سازی مسیرها: یا پیشوند v1 را از backend حذف کنید، یا آن را در frontend اضافه کنید. ترجیحاً backend را تغییر دهید تا با frontend هماهنگ شود.
```

### Step 11: تغییر پیشوند روتر API از /api/v1 به /api در فایل routes/tasks.py
**Status:** `done` (100%)
**Scope:** این بخش فقط شامل تغییر پیشوند روتر در فایل app/routes/tasks.py از '/api/v1/tasks' به '/api/tasks' است. هیچ تغییر دیگری در منطق، schema، مدل، تست یا سایر فایل‌ها انجام نمی‌شود. این یک تغییر ساده و متمرکز در مسیریابی است.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**تغییر پیشوند روتر**

_قبل:_
```
router = APIRouter(prefix='/api/v1/tasks', tags=['tasks'])
```

_بعد:_
```
router = APIRouter(prefix='/api/tasks', tags=['tasks'])
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 12: توسعه API ایجاد و لیست پروژه‌ها در app/routes/projects.py
**Status:** `partial` (70%)
**Scope:** این مرحله شامل پیاده‌سازی دو endpoint در فایل app/routes/projects.py است: POST /api/projects برای ایجاد پروژه جدید و GET /api/projects برای دریافت لیست پروژه‌ها. همچنین باید تست‌های واحد مربوطه در tests/test_projects.py اضافه شود. ریسک تغییر مسیر و نامعتبر شدن مستندات API قدیمی باید مدنظر قرار گیرد. هیچ وابستگی به تسک‌های دیگر ندارد.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
تغییر مسیر ممکن است مستندات API قدیمی را نامعتبر کند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: small

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 8
  id: 45e6dd7f-455c-441e-8483-149d792bd837
  عنوان اصلی: توسعه API ایجاد و لیست پروژه‌ها
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/projects.py

📋 acceptance_criteria کامل:
  - ارسال POST به /api/projects با بدنه معتبر، پروژه جدید ایجاد کند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/projects", "headers": {"Content-Type": "application/json"}, "json_body": {"name": "test project", "description": "test"}, "expected_status": 201, "required_fields": ["]
  - ارسال GET به /api/projects لیست پروژه‌ها را برگرداند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/projects", "headers": null, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null}]
  - تست واحد برای هر دو method اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_projects.py::test_create_project", "timeout_seconds": 60}]
```

### Step 13: بررسی اولیه و تحلیل وضعیت موجود مخزن قبل از اجرا
**Status:** `done` (100%)
**Scope:** این بخش یک مرحله پیش‌نیاز و تحلیلی است که شامل بررسی کامل مخزن برای یافتن پیاده‌سازی‌های موجود، شناسایی فایل‌های مرتبط، تشخیص ناقصی‌ها یا اشتباهات، و مستندسازی وضعیت فعلی می‌شود. این مرحله هیچ تغییری در کد ایجاد نمی‌کند و صرفاً برای آماده‌سازی و جلوگیری از دوباره‌کاری است. شامل جستجوی grep برای کلاس‌ها، توابع، endpointها و فایل‌های ذکر شده در مسیرها می‌شود.
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

### Step 14: رفع عدم تطابق HTTP method برای ایجاد پروژه جدید (تغییر GET به POST)
**Status:** `done` (100%)
**Scope:** این مرحله صرفاً به رفع یک باگ در route مربوط به ایجاد پروژه می‌پردازد. شامل تغییر دکوریتور `@router.get` به `@router.post` در فایل `app/routes/projects.py` است. هیچ تغییری در منطق business، validation، یا سایر endpointها ایجاد نمی‌شود. endpointهای دیگر پروژه (لیست، ویرایش، حذف) خارج از scope این مرحله هستند.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
عدم تطابق HTTP method برای ایجاد پروژه جدید

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/projects.py:15-20` — `create_project` — باید POST باشد نه GET
  ```python
  @router.get('/')
  async def create_project(project: ProjectCreate):
  ```
```

### Step 15: رفع عدم تطابق متد HTTP در endpoint ایجاد پروژه (GET به POST)
**Status:** `done` (100%)
**Scope:** این بخش صرفاً به رفع خطای 405 Method Not Allowed در endpoint `/api/projects` مربوط است. backend در `app/routes/projects.py` متد GET را برای ایجاد پروژه تعریف کرده در حالی که frontend از POST استفاده می‌کند. scope شامل تغییر متد endpoint از GET به POST و اطمینان از سازگاری با schema `ProjectCreate` در `app/schemas/project_schema.py` است. خارج از scope: تغییر frontend، سایر endpointها، یا منطق business.
**Excerpt:**
```
در frontend (فرضی) برای ایجاد پروژه از POST به `/api/projects` استفاده می‌شود، اما backend در app/routes/projects.py این endpoint را با GET تعریف کرده است. این باعث خطای Method Not Allowed (405) می‌شود.
```

### Step 16: تغییر decorator endpoint ایجاد پروژه از GET به POST
**Status:** `done` (100%)
**Scope:** این مرحله فقط تغییر decorator در app/routes/projects.py از @router.get به @router.post برای endpoint ایجاد پروژه را شامل می‌شود. سایر endpointها (GET /api/projects) و تست‌ها و linter/type-check در این مرحله تغییر نمی‌کنند. نکته حیاتی: این تغییر صرفاً یک تغییر نحوی در decorator است و منطق business را تغییر نمی‌دهد.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] ارسال POST به /api/projects با بدنه معتبر، پروژه جدید ایجاد کند
- [ ] ارسال GET به /api/projects لیست پروژه‌ها را برگرداند
- [ ] تست واحد برای هر دو method اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. تغییر decorator در backend از @router.get به @router.post برای endpoint ایجاد پروژه.
```

### Step 17: رفع اشکال HTTP Method در endpoint ایجاد پروژه (تغییر GET به POST)
**Status:** `done` (100%)
**Scope:** این بخش صرفاً به تغییر یک خط کد در فایل app/routes/projects.py مربوط می‌شود: تغییر دکوراتور @router.get('/') به @router.post('/') برای تابع create_project. هیچ endpoint یا فایل دیگری تحت تأثیر قرار نمی‌گیرد. نکته حیاتی: این تغییر صرفاً متد HTTP را اصلاح می‌کند و منطق business یا schema را تغییر نمی‌دهد.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**تغییر HTTP method**

_قبل:_
```
@router.get('/')
async def create_project(project: ProjectCreate):
```

_بعد:_
```
@router.post('/')
async def create_project(project: ProjectCreate):
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 18: پیاده‌سازی اعتبارسنجی و پاکسازی ورودی در Task API
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیاده‌سازی محدودیت طول کاراکتر برای فیلدهای title (حداکثر 200 کاراکتر) و description (حداکثر 1000 کاراکتر)، escape کردن کاراکترهای HTML در این دو فیلد، و اطمینان از عدم امکان SQL injection از طریق parameterized queries در فایل app/routes/tasks.py است. همچنین شامل افزودن تست واحد برای validation و sanitization در tests/test_tasks.py می‌شود. خارج از scope: سایر APIها (مانند پروژه)، frontend، و سایر فایل‌های غیر از موارد ذکر شده.
**Excerpt:**
```
تسک 4 از 8
  id: 837fc1d1-d647-45b4-8dfe-70bb8bbc212c
  عنوان اصلی: پیاده‌سازی اعتبارسنجی و پاکسازی ورودی در Task API
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/routes/tasks.py

📋 acceptance_criteria کامل:
  - فیلد title حداکثر 200 کاراکتر و فیلد description حداکثر 1000 کاراکتر باشد [verify_method=static] [verify_plan={"grep_patterns": ["title.*max_length.*200", "description.*max_length.*1000", "max_length.*200", "max_length.*1000"], "files_hint": ["app/routes/tasks.py"]}]
  - کاراکترهای HTML در title و description escape شوند [verify_method=static] [verify_plan={"grep_patterns": ["escape", "sanitize", "html.escape", "bleach", "markupsafe"], "files_hint": ["app/routes/tasks.py"]}]
  - SQL injection از طریق parameterized queries غیرممکن شود [verify_method=static] [verify_plan={"grep_patterns": ["execute\(.*%s", "execute\(.*\?", "parameterized", "cursor\.execute\(.*,.*\)"], "files_hint": ["app/routes/tasks.py"]}]
  - تست واحد برای validation و sanitization اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_tasks.py::test_validation_and_sanitization", "timeout_seconds": 60}]
```

### Step 19: بررسی و اعتبارسنجی اولیه مخزن قبل از اجرای تغییرات
**Status:** `done` (100%)
**Scope:** این بخش یک مرحله پیش‌نیاز و غیرفنی است که وظیفه مدل اجراکننده را برای بررسی مستقل مخزن، شناسایی پیاده‌سازی‌های موجود، و جلوگیری از بازسازی غیرضروری مشخص می‌کند. شامل جستجوی فایل‌ها، خواندن کد موجود، و تصمیم‌گیری در مورد نیاز به تغییر یا ثبت کامیت no-op است. این مرحله هیچ تغییری در کد ایجاد نمی‌کند.
— [merged] این بخش یک مرحله پیش‌نیاز و غیرفنی است که وظیفه مدل اجراکننده را برای بررسی مستقل مخزن، شناسایی پیاده‌سازی‌های موجود، و جلوگیری از بازسازی موارد تکراری مشخص می‌کند. شامل جستجو با grep، خواندن فایل‌های مرتبط، و تصمیم‌گیری درباره نیاز به تغییر است. این مرحله هیچ کدی تولید نمی‌کند و صرفاً یک دستورالعمل رفتاری است.
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

### Step 20: اعتبارسنجی ورودی endpointهای ایجاد و ویرایش task
**Status:** `done` (100%)
**Scope:** این بخش شامل افزودن اعتبارسنجی ورودی (input validation) به endpointهای create_task و update_task در فایل app/routes/tasks.py است. اعتبارسنجی باید با استفاده از Pydantic schema (احتمالاً app/schemas/task_schema.py) انجام شود. خارج از scope این بخش: اعتبارسنجی endpointهای پروژه، اعتبارسنجی سطح database model، یا تغییر در frontend. نکته حیاتی: endpoint create_task در خطوط 20-65 فایل tasks.py قرار دارد و در حال حاضر مستقیماً از request.json() استفاده می‌کند.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
عدم اعتبارسنجی ورودی در endpointهای ایجاد و ویرایش task

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:20-65` — `create_task` — endpointهای ایجاد و ویرایش task که نیاز به input validation دارند
  ```python
  @router.post('/tasks')
  async def create_task(request: Request):
      data = await request.json()
```
```

### Step 21: افزودن اعتبارسنجی و sanitization به endpointهای POST و PUT تسک‌ها
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن Pydantic models برای اعتبارسنجی ورودی‌های title و description در endpointهای POST /tasks و PUT /tasks/{id} در فایل app/routes/tasks.py است. همچنین شامل پیاده‌سازی sanitization برای جلوگیری از XSS و SQL injection می‌شود. خارج از scope: تغییرات در endpointهای دیگر، مدل‌های دیتابیس، یا frontend.
**Excerpt:**
```
در فایل app/routes/tasks.py، endpointهای POST /tasks و PUT /tasks/{id} (خطوط 20-65) هیچ اعتبارسنجی روی فیلدهای ورودی انجام نمی‌دهند. این آسیب‌پذیری امکان XSS (Cross-Site Scripting) از طریق فیلدهای title و description و همچنین SQL injection در صورت استفاده مستقیم از مقادیر در queryها را فراهم می‌کند. شواهد: کد موجود در خطوط 20-65 مستقیماً از request.json() استفاده می‌کند بدون هیچ validation یا sanitization.
```

### Step 22: اعتبارسنجی و ایمن‌سازی ورودی‌های API تسک و پروژه با Pydantic
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن مدل‌های Pydantic برای اعتبارسنجی طول فیلدهای title (حداکثر 200 کاراکتر) و description (حداکثر 1000 کاراکتر)، escape کردن کاراکترهای HTML در این فیلدها، و استفاده از parameterized queries برای تمام عملیات دیتابیس است. خارج از scope: پیاده‌سازی endpointها، تست‌های واحد (مرحله بعدی)، linting و type-check (مرحله بعدی). نکته حیاتی: مدل‌ها باید در app/schemas/ ایجاد شوند و escape کردن باید در سطح schema انجام شود.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فیلد title حداکثر 200 کاراکتر و فیلد description حداکثر 1000 کاراکتر باشد
- [ ] کاراکترهای HTML در title و description escape شوند
- [ ] SQL injection از طریق parameterized queries غیرممکن شود
- [ ] تست واحد برای validation و sanitization اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن Pydantic models برای اعتبارسنجی ورودی با محدودیت طول رشته، escape کردن کاراکترهای خاص HTML، و استفاده از parameterized queries برای تمام عملیات دیتابیس.
```

### Step 23: اعتبارسنجی ورودی API با Pydantic و sanitize HTML در endpointهای تسک
**Status:** `done` (100%)
**Scope:** این مرحله شامل جایگزینی دریافت مستقیم JSON با استفاده از مدل Pydantic (TaskCreate) در endpointهای مربوط به تسک‌ها و افزودن escape_html روی فیلدهای متنی title و description است. فقط فایل app/routes/tasks.py و app/schemas/task_schema.py تحت تأثیر قرار می‌گیرند. خارج از scope: endpointهای پروژه، validationهای دیگر (مثل اعداد)، frontend، تست‌ها.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**اعتبارسنجی با Pydantic**

_قبل:_
```
data = await request.json()
task = Task(title=data['title'])
```

_بعد:_
```
task_data = TaskCreate(**await request.json())
task = Task(title=escape_html(task_data.title), description=escape_html(task_data.description))
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 24: اجرای دستورات اعتبارسنجی برای تست و بررسی امنیت API تسک
**Status:** `done` (100%)
**Scope:** این بخش شامل اجرای دو دستور مشخص برای اعتبارسنجی است: 1) اجرای تست pytest برای اعتبارسنجی ورودی در tests/test_tasks.py، 2) اجرای درخواست curl برای ارسال payload مخرب (XSS) به endpoint POST /api/tasks. هدف بررسی رفتار API در برابر ورودی‌های نامعتبر و ناامن است. هیچ تغییری در کد یا معماری در این بخش انجام نمی‌شود.
**Excerpt:**
```
## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_tasks.py -k test_input_validation`
- `curl -X POST http://localhost:8000/api/tasks -H 'Content-Type: application/json' -d '{"title": "<script>alert(1)</script>"}'`
```

### Step 25: اصلاح نوع داده due_date در Pydantic و SQLAlchemy
**Status:** `done` (100%)
**Scope:** این بخش شامل تغییر نوع فیلد due_date در مدل SQLAlchemy (app/models/task.py) و اسکیمای Pydantic (app/schemas/task_schema.py) از datetime به date است. همچنین شامل به‌روزرسانی تست‌های مربوطه (tests/test_tasks.py) و اطمینان از کارکرد صحیح API (POST /api/tasks) با مقدار due_date به فرمت 'YYYY-MM-DD' می‌باشد. خارج از scope: تغییرات در frontend، پروژه‌ها، یا سایر endpointها.
**Excerpt:**
```
تسک 5 از 8
  id: d7f9cc88-9dce-4a64-be55-d9583024149d
  عنوان اصلی: اصلاح نوع داده due_date در Pydantic و SQLAlchemy
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/models/task.py, app/schemas/task_schema.py

📋 acceptance_criteria کامل:
  - فیلد due_date در schema از نوع date است [verify_method=static] [verify_plan={"grep_patterns": ["due_date: date", "due_date: datetime"], "files_hint": ["app/schemas/task_schema.py"]}]
  - ایجاد task با due_date بدون خطا کار می‌کند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/tasks", "headers": {"Content-Type": "application/json"}, "json_body": {"title": "test", "due_date": "2025-03-15"}, "expected_status": 201, "required_fields": ["id", "d]}
  - تست‌های مربوط به tasks پاس می‌شوند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_tasks.py", "timeout_seconds": 60}]
```

### Step 26: بررسی و تحلیل پیش‌نیازهای اجرایی بر اساس یادداشت‌های مهم
**Status:** `pending` (0%)
**Scope:** این بخش یک مرحله تحلیلی-بررسی است که پیش از هرگونه تغییر کد باید اجرا شود. شامل جستجوی grep برای یافتن پیاده‌سازی‌های موجود، بررسی فایل‌های مرتبط با APIهای تسک و پروژه، و مستندسازی وضعیت فعلی repo است. هیچ تغییری در کد ایجاد نمی‌کند.
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

### Step 27: رفع عدم تطابق نوع داده فیلد due_date در TaskCreate از datetime به date
**Status:** `done` (100%)
**Scope:** این مرحله صرفاً به اصلاح نوع داده فیلد due_date در کلاس TaskCreate (فایل app/schemas/task_schema.py) از datetime به date می‌پردازد. هیچ تغییری در مدل SQLAlchemy (app/models/task.py) یا سایر فایل‌ها ایجاد نمی‌شود. فیلدهای دیگر TaskCreate (title, description, priority) دست نخورده باقی می‌مانند.
**Excerpt:**
```
عدم تطابق نوع داده در schemaهای Pydantic با مدل‌های SQLAlchemy

- `app/schemas/task_schema.py:10-15` — `TaskCreate` — فیلد due_date با نوع اشتباه
  ```python
  class TaskCreate(BaseModel):
      title: str
      description: str | None = None
      due_date: datetime  # باید date باشد
      priority: int = 0
  ```
- `app/models/task.py:15-20` — `Task` — مدل SQLAlchemy با نوع Date
  ```python
  class Task(Base):
      __tablename__ = 'tasks'
      id = Column(Integer, primary_key=True)
      title = Column(String, nullable=False)
      due_date = Column(Date, nullable=True)  # نوع Date
  ```
```

### Step 28: رفع عدم تطابق نوع فیلد due_date بین Pydantic schema و SQLAlchemy model
**Status:** `done` (100%)
**Scope:** این مرحله صرفاً به رفع عدم تطابق نوع داده‌ای فیلد `due_date` در فایل‌های `app/schemas/task_schema.py` و `app/models/task.py` می‌پردازد. شامل تغییر نوع فیلد در schema از `datetime` به `date` (یا برعکس) و اطمینان از سازگاری serialization/deserialization است. تغییرات در routeها یا سرویس‌ها جزو این scope نیست مگر اینکه مستقیماً ناشی از این تغییر نوع باشند.
**Excerpt:**
```
در فایل app/schemas/task_schema.py، فیلد due_date از نوع datetime تعریف شده است، اما در مدل SQLAlchemy (app/models/task.py) این فیلد از نوع Date است. این عدم تطابق می‌تواند باعث خطاهای serialization/deserialization در API شود. شواهد: در task_schema.py: due_date: datetime، در task.py: due_date = Column(Date).
```

### Step 29: تغییر نوع فیلد due_date در schema به date و تطبیق با مدل SQLAlchemy
**Status:** `done` (100%)
**Scope:** این مرحله شامل تغییر نوع فیلد due_date در فایل app/schemas/task_schema.py از نوع datetime (یا string) به date است تا با مدل SQLAlchemy در app/models/task.py مطابقت داشته باشد. همچنین سایر فیلدهای schema باید برای تطابق با مدل بررسی شوند. تست‌های مربوط به tasks (tests/test_tasks.py) باید پاس شوند و کل تست‌های پروژه (pytest) بدون خطا اجرا شوند. linter و type-check (mypy) نیز باید موفق باشند. این مرحله شامل تغییرات در frontend یا سایر بخش‌ها نمی‌شود.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فیلد due_date در schema از نوع date است
- [ ] ایجاد task با due_date بدون خطا کار می‌کند
- [ ] تست‌های مربوط به tasks پاس می‌شوند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. نوع فیلد due_date را در schema به date تغییر دهید تا با مدل SQLAlchemy مطابقت داشته باشد. همچنین، سایر فیلدها را برای تطابق بررسی کنید.
```

### Step 30: رفع نوع فیلد due_date از datetime به date در تمام لایه‌ها
**Status:** `done` (100%)
**Scope:** این بخش صرفاً به تغییر نوع فیلد `due_date` از `datetime` به `date` در مدل، اسکیما، و مسیرهای مرتبط با تسک و پروژه می‌پردازد. شامل تغییرات در لایه‌های مدل (SQLAlchemy)، اسکیما (Pydantic)، و مسیرهای API (FastAPI) می‌شود. تغییرات frontend و تست‌ها خارج از این scope هستند مگر اینکه صراحتاً در خواسته کاربر ذکر شده باشد. نکته حیاتی: این تغییر باید در تمام فایل‌هایی که `due_date` را به عنوان `datetime` تعریف کرده‌اند اعمال شود.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**رفع نوع فیلد**

_قبل:_
```
due_date: datetime
```

_بعد:_
```
due_date: date
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 31: پیاده‌سازی مدیریت خطا در routeهای tasks و projects
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیاده‌سازی مدیریت خطاهای 404، 422 و 500 در routeهای فایل app/routes/tasks.py است. همچنین شامل ذخیره خطاها در فایل لاگ، یکسان‌سازی فرمت خطاها و افزودن تست‌های خطا برای هر route می‌شود. فایل‌های دخیل: app/routes/tasks.py, app/routes/projects.py, tests/test_error_handling.py. خارج از scope: تغییرات در schemaها یا فرانت‌اند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - همه routeها خطاهای 404، 422، 500 را به درستی مدیریت می‌کنند [verify_method=static] [verify_plan={"grep_patterns": ["raise HTTPException\(status_code=404", "raise HTTPException\(status_code=422", "raise HTTPException\(status_code=500", "except.*HTTPException", "except.*Exception"], "files_hint]
  - خطاها در فایل لاگ ذخیره می‌شوند [verify_method=static] [verify_plan={"grep_patterns": ["logging\.(error|exception|warning|info)", "logger\.(error|exception|warning|info)", "import logging"], "files_hint": ["app/routes/tasks.py", "app/routes/projects.py"]}]
  - فرمت خطاها یکسان و قابل پیش‌بینی است [verify_method=static] [verify_plan={"grep_patterns": ["class.*ErrorResponse", "def.*error_response", "JSONResponse\(status_code=.*, content=.*\{.*\"detail\"", "\"detail\""], "files_hint": ["app/routes/tasks.py", "app/routes/projects.]
  - تست‌های خطا برای هر route اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_error_handling.py", "timeout_seconds": 60}]
```

### Step 32: بررسی و اعتبارسنجی اولیه مخزن پیش از اجرا
**Status:** `pending` (0%)
**Scope:** این بخش یک یادداشت مهم برای مدل اجراکننده است و شامل دستورالعمل‌های پیش از شروع کار می‌باشد. شامل بررسی وجود پیاده‌سازی قبلی، جستجوی فایل‌های مرتبط، و تصمیم‌گیری بر اساس قضاوت شخصی است. این بخش خود یک مرحله اجرایی نیست بلکه یک هشدار/راهنما برای نحوه برخورد با کل درخواست است.
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

### Step 33: پیاده‌سازی مدیریت خطا در route get_task برای جلوگیری از خطای 500 هنگام عدم وجود task
**Status:** `done` (100%)
**Scope:** این مرحله فقط به رفع مشکل بازگرداندن None در endpoint GET /tasks/{task_id} مربوط می‌شود. شامل افزودن بررسی وجود task و بازگرداندن پاسخ 404 با پیام خطای مناسب است. سایر routeها و خطاهای احتمالی دیگر (مانند خطای دیتابیس) در این مرحله پوشش داده نمی‌شوند. نکته حیاتی: باید از HTTPException با status_code=404 استفاده شود و خطای 500 فعلی حذف گردد.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
مدیریت خطا (error handling) در routeها پیاده‌سازی نشده است

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:30-50` — `get_task` — اگر task وجود نداشته باشد، None برمی‌گرداند که باعث خطای 500 می‌شود
  ```python
  @router.get("/tasks/{task_id}")
  async def get_task(task_id: int, db: Session = Depends(get_db)):
      task = db.query(Task).filter(Task.id == task_id).first()
      return task
  ```
```

### Step 34: پیاده‌سازی مدیریت خطا و لاگینگ در routeهای تسک و پروژه
**Status:** `pending` (0%)
**Scope:** این مرحله شامل افزودن exception handlerهای مناسب (404 برای not found، 503 برای unavailable) و logging خطاها در routeهای app/routes/tasks.py و app/routes/projects.py است. همچنین نیاز به اضافه کردن global exception handler در app/middleware.py و پیکربندی logging در config/logging_config.py دارد. خارج از scope: تغییرات در frontend، schemaها، models، database، یا tests.
— [merged] این مرحله شامل اضافه کردن error handling سفارشی (HTTPException و custom exception handlers) در تمام routeهای موجود در app/routes/tasks.py و app/routes/projects.py است. همچنین پیاده‌سازی logging ساختاریافته برای خطاها با استفاده از logging_config.py (که باید وجود داشته باشد یا ایجاد شود) در این مرحله انجام می‌شود. این مرحله شامل ایجاد تست‌های خطا (tests/test_error_handling.py) و اطمینان از عبور linter و type-check نیست؛ این موارد در مراحل بعدی پوشش داده می‌شوند.
**Excerpt:**
```
در اکثر routeها (مثلاً app/routes/tasks.py و app/routes/projects.py)، خطاها به درستی مدیریت نمی‌شوند. اگر دیتابیس در دسترس نباشد یا یک رکورد پیدا نشود، خطای 500 برمی‌گردد به جای خطای مناسب (404 برای not found، 503 برای unavailable). همچنین هیچ logging مناسبی برای خطاها وجود ندارد.

- `app/middleware.py` (سطر 1) — برای اضافه کردن global exception handler
- `config/logging_config.py` (سطر 1) — برای logging خطاها
```

### Step 35: اضافه کردن error handling برای not found در endpointهای تسک و پروژه
**Status:** `done` (100%)
**Scope:** این مرحله شامل اضافه کردن بررسی وجود رکورد و raise HTTPException با status 404 در تمام endpointهای GET, PUT, DELETE مربوط به Task و Project در فایل‌های app/routes/tasks.py و app/routes/projects.py است. موارد خارج از scope: تغییر schemaها، مدل‌ها، database، frontend، یا تست‌ها. نکته حیاتی: فقط endpointهایی که از first() استفاده می‌کنند و ممکن است None برگردانند باید اصلاح شوند.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**اضافه کردن error handling برای not found**

_قبل:_
```
task = db.query(Task).filter(Task.id == task_id).first()
return task
```

_بعد:_
```
task = db.query(Task).filter(Task.id == task_id).first()
if not task:
    raise HTTPException(status_code=404, detail="Task not found")
return task
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 36: پیاده‌سازی قوانین اعتبارسنجی Pydantic برای TaskCreate.priority، UserCreate.email و UserCreate.password
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن اعتبارسنجی‌های Pydantic به اسکیمای TaskCreate (محدودیت priority به 0-5) و UserCreate (اعتبارسنجی فرمت ایمیل با EmailStr و حداقل طول 8 کاراکتر برای password) در فایل‌های app/schemas/task_schema.py و app/schemas/user_schema.py است. همچنین شامل نوشتن تست‌های unit در tests/test_schemas.py برای این validationها می‌شود. تغییر در فرمت خطاها نباید انجام شود تا فرانت‌اند نشکند. این مرحله مستقل از سایر تسک‌هاست.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - TaskCreate.priority فقط مقادیر 0-5 را بپذیرد [verify_method=static] [verify_plan={"grep_patterns": ["priority.*Field.*ge=0.*le=5", "priority.*Field.*ge=0.*le=5"], "files_hint": ["app/schemas/task_schema.py"]}]
  - UserCreate.email با فرمت معتبر ایمیل بررسی شود [verify_method=static] [verify_plan={"grep_patterns": ["EmailStr", "email.*validator"], "files_hint": ["app/schemas/user_schema.py"]}]
  - UserCreate.password حداقل 8 کاراکتر باشد [verify_method=static] [verify_plan={"grep_patterns": ["password.*Field.*min_length=8", "password.*Field.*min_length=8"], "files_hint": ["app/schemas/user_schema.py"]}]
  - تست‌های unit برای validation اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_schemas.py", "timeout_seconds": 60}]
```

### Step 37: افزودن اعتبارسنجی (validation) به فیلدهای Pydantic schemaهای TaskCreate و UserCreate
**Status:** `done` (100%)
**Scope:** این مرحله فقط به فایل‌های app/schemas/task_schema.py و app/schemas/user_schema.py محدود می‌شود. هدف افزودن validatorهای Pydantic به فیلدهای due_date و priority در TaskCreate و فیلدهای email و password در UserCreate است. این مرحله شامل تغییر در routeها، modelها، یا تست‌ها نمی‌شود. نکته حیاتی: validatorها باید از نوع 'field_validator' یا 'model_validator' جدید Pydantic v2 باشند و خطاهای مناسب (ValueError) با پیام فارسی یا انگلیسی واضح برگردانند.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
عدم وجود validation در schemaهای Pydantic

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/schemas/task_schema.py:1-30` — `TaskCreate` — فیلدهای due_date و priority validation ندارند
  ```python
  class TaskCreate(BaseModel):
      title: str
      description: str | None = None
      due_date: datetime | None = None
      priority: int = 0
  ```
- `app/schemas/user_schema.py:1-25` — `UserCreate` — فیلدهای email و password validation ندارند
  ```python
  class UserCreate(BaseModel):
      email: str
      password: str
      username: str
  ```
```

### Step 38: افزودن اعتبارسنجی به فیلدهای due_date و priority در task_schema.py و فیلدهای email و password در user_schema.py
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن اعتبارسنجی (validation) به schemaهای Pydantic v2 در فایل‌های app/schemas/task_schema.py و app/schemas/user_schema.py است. برای task_schema.py، باید فیلد due_date (تاریخ معتبر) و priority (مقادیر مجاز) اعتبارسنجی شوند. برای user_schema.py، باید فیلد email (فرمت معتبر) و password (قدرت رمز عبور) اعتبارسنجی شوند. این مرحله شامل تغییر در routeها، سرویس‌ها یا مدل‌های دیتابیس نمی‌شود.
**Excerpt:**
```
در فایل app/schemas/task_schema.py، فیلدهای مهم مانند due_date و priority validation ندارند. این می‌تواند منجر به ذخیره داده‌های نامعتبر در دیتابیس شود. همچنین در app/schemas/user_schema.py، validation برای email و password strength وجود ندارد.
```

### Step 39: افزودن اعتبارسنجی به مدل‌های Pydantic برای محدودیت‌های priority، email و password
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن validator به مدل‌های Pydantic در فایل‌های app/schemas/task_schema.py و app/schemas/project_schema.py است. محدوده دقیق: (1) TaskCreate.priority فقط مقادیر 0-5 را بپذیرد، (2) UserCreate.email با فرمت معتبر ایمیل بررسی شود، (3) UserCreate.password حداقل 8 کاراکتر باشد. خارج از محدوده: تغییر در مدل‌های SQLAlchemy (app/models/task.py)، تغییر در routeها، یا اضافه کردن تست‌ها (تست‌ها در مرحله بعدی اضافه می‌شوند). نکته حیاتی: validatorها باید در سطح Pydantic schema اعمال شوند، نه در سطح دیتابیس.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] TaskCreate.priority فقط مقادیر 0-5 را بپذیرد
- [ ] UserCreate.email با فرمت معتبر ایمیل بررسی شود
- [ ] UserCreate.password حداقل 8 کاراکتر باشد
- [ ] تست‌های unit برای validation اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن validators به Pydantic models برای اطمینان از صحت داده‌ها قبل از ذخیره‌سازی
```

### Step 40: اضافه کردن validator به TaskCreate و UserCreate
**Status:** `done` (100%)
**Scope:** این بخش شامل افزودن اعتبارسنجی (validator) به اسکیمای TaskCreate و UserCreate است. برای TaskCreate، فیلد priority باید محدود به بازه 0-5 شود. برای UserCreate، فیلد email باید از نوع EmailStr باشد و فیلد password حداقل 8 کاراکتر داشته باشد. خارج از scope: تغییرات در routeها، مدل‌های دیتابیس، یا frontend.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**اضافه کردن validator به TaskCreate**

_قبل:_
```
priority: int = 0
```

_بعد:_
```
priority: int = Field(default=0, ge=0, le=5, description='Priority level 0-5')
```

**اضافه کردن validator به UserCreate**

_قبل:_
```
email: str
```

_بعد:_
```
email: EmailStr
password: str = Field(min_length=8, description='Password must be at least 8 characters')
```
```

### Step 41: حذف فیلد hashed_password از پاسخ endpoint /api/users/:id
**Status:** `done` (100%)
**Scope:** این بخش شامل اصلاح schema کاربر (app/schemas/user_schema.py) برای حذف فیلد hashed_password از response، به‌روزرسانی تایپ‌های فرانت‌اند (frontend/src/types/user.ts و فایل‌های tsx مرتبط) و افزودن تست امنیتی برای عدم وجود hashed_password در response است. خارج از scope: تغییرات در endpointهای tasks یا projects، تغییرات در مدل‌های دیتابیس، و هرگونه تغییر در منطق احراز هویت.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
شکستن درخواست‌های موجود با داده‌های نامعتبر

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: small

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 8 از 8
  id: 4124ff5c-4e78-491e-ae18-e11053f89b24
  عنوان اصلی: حذف فیلدهای اضافی از پاسخ بک‌اند
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/schemas/user_schema.py

📋 acceptance_criteria کامل:
  - endpoint /api/users/:id hashed_password را برنگرداند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/users/1", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["id", "email", "name"], "json_contains": null, "forbidden_fields": ["hashed_pa]
  - frontend بتواند response را با type جدید parse کند [verify_method=static] [verify_plan={"grep_patterns": ["hashed_password"], "files_hint": ["frontend/src/types/user.ts", "frontend/src/**/*.tsx"]}]
  - تست امنیتی برای عدم وجود hashed_password در response [verify_method=backend_test] [verify_plan={"test_node": "tests/test_user_schema.py::test_response_no_hashed_password", "timeout_seconds": 30}]
```

### Step 42: حذف hashed_password از UserResponse در schema کاربر
**Status:** `done` (100%)
**Scope:** این مرحله شامل اصلاح کلاس UserResponse در app/schemas/user_schema.py برای حذف فیلد hashed_password از response است. فیلد hashed_password باید از مدل حذف شود تا در پاسخ APIهای کاربر (مانند GET /users/me یا POST /users/) expose نشود. سایر فیلدهای UserResponse (id, email, name) بدون تغییر باقی می‌مانند. این مرحله شامل تغییر در schema است و نیازی به تغییر در routeها یا مدل‌های database ندارد.
**Excerpt:**
```
فیلدهای اضافی در response backend که frontend انتظار ندارد

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/schemas/user_schema.py:20-30` — `UserResponse` — hashed_password نباید در response باشد
  ```python
  class UserResponse(BaseModel):
      id: int
      email: str
      name: str
      hashed_password: str  # ⚠️ نباید expose شود
  ```
```

### Step 43: حذف فیلد hashed_password از مدل UserResponse در app/schemas/user_schema.py
**Status:** `done` (100%)
**Scope:** این مرحله فقط شامل حذف فیلد hashed_password از مدل Pydantic v2 UserResponse در فایل app/schemas/user_schema.py است. هیچ تغییری در دیتابیس، مدل SQLAlchemy، endpointها، یا frontend ایجاد نمی‌شود. فیلدهای id, email, name باید حفظ شوند. این یک تغییر امنیتی سمت schema است.
**Excerpt:**
```
در app/schemas/user_schema.py، مدل UserResponse شامل فیلد `hashed_password` است که در frontend استفاده نمی‌شود و یک vulnerability امنیتی محسوب می‌شود. frontend فقط `id`, `email`, `name` را انتظار دارد.
```

### Step 44: ایجاد Pydantic schema UserPublic برای حذف hashed_password از پاسخ API
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد یک Pydantic schema جدید به نام UserPublic است که فقط فیلدهای امن (بدون hashed_password) را شامل شود. سپس باید از این schema در endpointهای عمومی (مانند /api/users/:id) استفاده شود تا hashed_password در response برگردانده نشود. این مرحله شامل تست‌های امنیتی و اطمینان از عبور linter و type-check نیز می‌شود. خارج از scope: تغییرات در frontend یا سایر endpointها.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] endpoint /api/users/:id hashed_password را برنگرداند
- [ ] frontend بتواند response را با type جدید parse کند
- [ ] تست امنیتی برای عدم وجود hashed_password در response
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ایجاد یک Pydantic schema جدید به نام UserPublic که فقط فیلدهای امن را شامل شود و از آن در endpointهای عمومی استفاده شود.
```

### Step 45: ایجاد UserPublic schema و جداسازی فیلدهای حساس در UserResponse
**Status:** `done` (100%)
**Scope:** این بخش شامل ایجاد یک schema جدید به نام UserPublic است که فیلدهای عمومی کاربر (id, email, name) را در بر می‌گیرد و سپس اصلاح UserResponse به ارث‌بری از UserPublic به همراه فیلد hashed_password. این تغییر صرفاً در لایه schema انجام می‌شود و شامل تغییرات در routeها، models، یا frontend نیست. نکته حیاتی: فایل دقیق schema مشخص نشده، اما با توجه به لیست فایل‌ها، احتمالاً در app/schemas/user_schema.py یا فایل مشابه باید ایجاد شود.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**ایجاد UserPublic schema**

_قبل:_
```
class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    hashed_password: str
```

_بعد:_
```
class UserPublic(BaseModel):
    id: int
    email: str
    name: str

class UserResponse(UserPublic):
    hashed_password: str  # فقط برای internal use
```
```

### Step 46: مدیریت ریسک تغییر Schema و سازگاری با Clientهای قدیمی در Refactoring APIهای تسک و پروژه
**Status:** `done` (100%)
**Scope:** این بخش به ریسک‌های ناشی از تغییر schema در APIهای تسک و پروژه می‌پردازد. شامل شناسایی breaking changes، اعمال backward compatibility، و مستندسازی تغییرات برای clientهای قدیمی است. خارج از scope: پیاده‌سازی خود endpointها، تست‌های unit، و تغییرات frontend. نکته حیاتی: هر تغییری در schema باید با versioning یا field deprecation همراه باشد.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
تغییر schema ممکن است clientهای قدیمی را بشکند

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
