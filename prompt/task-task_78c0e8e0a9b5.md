---
task_id: task_78c0e8e0a9b5
title: پیاده‌سازی احراز هویت JWT و کنترل دسترسی کاربر
type: other
priority: critical
execution_priority: 1000
status: pending
external_status: pending
verification_status: applied_externally_pending_verify
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-26T23:17:02.934574+00:00'
updated_at: '2026-05-28T11:56:12.114435+00:00'
tags:
- consolidated
- post_verify_merge
---

# پیاده‌سازی احراز هویت JWT و کنترل دسترسی کاربر

## Raw Idea

🧬 این یک تسک تلفیقی است — از 10 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها به طور جامع به بهبود امنیت سیستم، شامل احراز هویت (JWT، مدیریت سشن‌ها)، مجوزدهی (دسترسی به داده‌های کاربر و داشبورد)، مدیریت کلیدهای محرمانه و اعتبارسنجی ورودی می‌پردازند. این موارد هم بک‌اند و هم فرانت‌اند را درگیر می‌کنند.
🎯 theme: تقویت امنیت و احراز هویت سیستم
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 10
  id: c179af95-95cb-4d09-8580-27c23c0b2ae4
  عنوان اصلی: اعمال احراز هویت در endpointهای TodoList و TodoItem
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/lists.py, app/routes/todo_items.py

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["No issues found", "0 warnings"], "files_hint": ["linter_output.log"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["Success: no issues found", "0 errors"], "files_hint": ["type_check_output.log"]}]

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
نبود احراز هویت در endpointهای TodoList و TodoItem

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/lists.py:66-78` — `list_lists` — این endpoint فاقد وابستگی get_current_user است و همه لیست‌ها را برمی‌گرداند.
  ```python
  @router.get("/api/lists", tags=["todo-lists"], response_model=List[TodoListOut])
  @router.get("/api/lists/", tags=["todo-lists"], response_model=List[TodoListOut])
  @handle_errors
  async def list_lists(
      include_archived: bool = Query(default=False),
      db: AsyncSession = Depends(get_db),
  ) -> List[dict]:
  ```
- `app/routes/todo_items.py:62-74` — `list_todo_items` — این endpoint فاقد وابستگی get_current_user است.
  ```python
  @router.get("/api/todo-items", tags=["todo-items"], response_model=List[TodoItemOut])
  @router.get("/api/todo-items/", tags=["todo-items"], response_model=List[TodoItemOut])
  @handle_errors
  async def list_todo_items(
      list_id: int | None = Query(default=None),
      starred_only: bool = Query(default=False),
      completed: bool | None = Query(default=None),
      db: AsyncSession = Depends(get_db),
  ) -> List[dict]:
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست 
[auto-re-registered from github_import at 2026-05-20T04:25:49.854717+00:00]

## 🧱 پشتهٔ فناوری و معماری
FastAPI + SQLAlchemy + JWT

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/lists.py` (سطر 66) — همه endpointهای این فایل نیاز به احراز هویت دارند.
- `app/routes/todo_items.py` (سطر 62) — همه endpointهای این فایل نیاز به احراز هویت دارند.
- `app/dependencies/auth.py` (سطر 1) — تابع get_current_user در این فایل تعریف شده است.
- `app/services/list_service.py` (سطر 1) — سرویس لیست‌ها باید بر اساس user_id فیلتر کند.
- `app/services/todo_item_service.py` (سطر 1) — سرویس آیتم‌ها باید بر اساس user_id فیلتر کند.
- `app/database.py` — `lists.py` این فایل را import می‌کند
- `app/middleware.py` — `lists.py` این فایل را import می‌کند
- `app/schemas/todo_item_schema.py` — `lists.py` این فایل را import می‌کند
- `app/schemas/todo_list_schema.py` — `lists.py` این فایل را import می‌کند
- `app/services/__init__.py` — `todo_items.py` این فایل را import می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این تغییرات بر روی 2 فایل route و 2 فایل service تأثیر می‌گذارد. همچنین، تست‌های مربوطه باید به‌روزرسانی شوند.

## 🔍 Context و وضعیت فعلی
تمام endpointهای مربوط به TodoList و TodoItem (در فایل‌های app/routes/lists.py و app/routes/todo_items.py) فاقد وابستگی get_current_user هستند. این بدان معناست که هر کاربر بدون احراز هویت می‌تواند لیست‌ها و آیتم‌های todo را ایجاد، مشاهده، ویرایش و حذف کند. این یک نقص امنیتی جدی است زیرا داده‌های کاربران در معرض دسترسی غیرمجاز قرار می‌گیرد. همچنین، عملیات share و unshare و move نیز بدون احراز هویت قابل انجام هستند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. به تمام endpointهای موجود در app/routes/lists.py و app/routes/todo_items.py وابستگی get_current_user را اضافه کنید. همچنین، منطق business را طوری تغییر دهید که عملیات فقط روی داده‌های متعلق به کاربر جاری انجام شود (مثلاً با فیلتر کردن بر اساس user_id).

## 💡 نمونه‌های قبل/بعد
**افزودن وابستگی get_current_user به list_lists**

_قبل:_
```
async def list_lists(
    include_archived: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
) -> List[dict]:
```

_بعد:_
```
async def list_lists(
    include_archived: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 10
  id: a7d8592f-349b-4fe2-b95a-8cbad7f24081
  عنوان اصلی: جلوگیری از شروع با JWT_SECRET_KEY پیش‌فرض
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: .env.example, app/config.py

📋 acceptance_criteria کامل:
  - اپلیکیشن در محیط production با JWT_SECRET_KEY پیش‌فرض از شروع به کار جلوگیری می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_config_security.py::test_jwt_secret_key_placeholder_prevents_startup_in_production", "timeout_seconds": 60}]
  - خطای واضح و مشخص در لاگ ثبت می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_config_security.py::test_jwt_secret_key_placeholder_prevents_startup_in_production", "timeout_seconds": 60}]
  - تست واحد برای این سناریو اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_config_security.py::test_jwt_secret_key_placeholder_prevents_startup_in_production", "timeout_seconds": 60}]

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
JWT_SECRET_KEY placeholder در .env.example و عدم بررسی کافی در startup

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `.env.example:16` — `JWT_SECRET_KEY` — مقدار placeholder که نباید در production استفاده شود
  ```
  JWT_SECRET_KEY=<YOUR_JWT_SECRET_KEY>
  ```
- `app/config.py:1-30` — `settings` — مقدار پیش‌فرض ضعیف که در production باید override شود
  ```python
  class Settings(BaseSettings):
      JWT_SECRET_KEY: str = "change-me-in-production"
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست 
[auto-re-registered from github_import at 2026-05-20T04:25:49.854717+00:00]

## 🧱 پشتهٔ فناوری و معماری
FastAPI + python-jose + pydantic-settings

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/main.py` (سطر 186) — startup event که می‌تواند بررسی امنیتی را انجام دهد
- `app/routes/auth.py` (سطر 45) — از JWT_SECRET_KEY برای امضای توکن استفاده می‌کند
- `main.py` — این فایل `config.py` را import می‌کند (caller)
- `app/services/auth_service.py` — این فایل `config.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این کلید توسط AuthService و تمام endpointهای نیازمند احراز هویت استفاده می‌شود.

## 🔍 Context و وضعیت فعلی
فایل `.env.example` حاوی `JWT_SECRET_KEY=<YOUR_JWT_SECRET_KEY>` است که یک placeholder است. اگر توسعه‌دهنده این فایل را مستقیماً به `.env` کپی کند و مقدار را تغییر ندهد، JWT با یک کلید ضعیف و قابل حدس امضا می‌شود. همچنین در `app/main.py` و `app/config.py` بررسی کافی برای اجباری بودن این کلید در محیط production وجود ندارد (تنها در `ENVIRONMENT=production` بررسی می‌شود که ممکن است تنظیم نشود). این آسیب‌پذیری به مهاجم اجازه می‌دهد توکن‌های JWT جعلی بسازد و به هر endpoint محافظت‌شده دسترسی پیدا کند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اپلیکیشن در محیط production با JWT_SECRET_KEY پیش‌فرض از شروع به کار جلوگیری می‌کند
- [ ] خطای واضح و مشخص در لاگ ثبت می‌شود
- [ ] تست واحد برای این سناریو اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. در `app/config.py` یک validator اضافه کنید که در محیط production اگر `JWT_SECRET_KEY` برابر با placeholder یا مقدار پیش‌فرض بود، اپلیکیشن با خطای واضح متوقف شود.
2. در `app/main.py` در startup event یک بررسی امنیتی انجام دهید.
3. مقدار پیش‌فرض `JWT_SECRET_KEY` را در settings به `None` تغییر دهید و در صورت `None` بودن در production، fail fast کنید.

## 💡 نمونه‌های قبل/بعد
**بررسی امنیتی در startup**

_قبل:_
```
@app.on_event("startup")
async def startup_event():
    # ... بررسی دیتابیس و migration
```

_بعد:_
```
@app.on_event("startup")
async def startup_event():
    if settings.ENVIRONMENT == "production" and (not settings.JWT_SECRET_KEY or settings.JWT_SECRET_KEY == "change-me-in-production"):
        raise RuntimeError("JWT_SECRET_KEY must be set in production!")
    # ... ادامه
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `ENVIRONMENT=production JWT_SECRET_KEY=change-me-in-production python -c "from app.config import settings; print(settings.JWT_SECRET_KEY)"`
- `pytest tests/test_config.py -k jwt_secret`

## ⚠️ ریسک‌ها و موارد احتیاط
هیچ ریسکی ندارد؛ فقط fail-fast در محیط production

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 10
  id: a2c055da-f0a2-48bd-98ff-ebe40e57725f
  عنوان اصلی: افزودن بررسی انقضای JWT در middleware
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/dependencies/auth.py

📋 acceptance_criteria کامل:
  - توکن منقضی شده با status code 401 رد شود [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/users/me", "headers": {"Authorization": "Bearer <EXPIRED_JWT>"}, "json_body": null, "expected_status": 401, "required_fields": null, "json_contains": {"detail": "Signat]
  - توکن معتبر بدون مشکل عبور کند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/users/me", "headers": {"Authorization": "Bearer <VALID_JWT>"}, "json_body": null, "expected_status": 200, "required_fields": ["id", "username", "email"], "json_contains]
  - تست واحد جدید برای بررسی expiry اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/unit/test_auth.py::test_jwt_expiry_rejection", "timeout_seconds": 60}]

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
عدم بررسی انقضای توکن JWT در middleware احراز هویت

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/dependencies/auth.py:1-50` — `get_current_user` — تابع اصلی dependency احراز هویت که باید اصلاح شود
  ```python
  async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
      # احتمالاً فقط decode می‌کند بدون بررسی expiry
      payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست 
[auto-re-registered from github_import at 2026-05-20T04:25:49.854717+00:00]

## 🧱 پشتهٔ فناوری و معماری
FastAPI + python-jose + JWT

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/auth.py` (سطر 85) — این endpoint توکن تولید می‌کند و باید expiry را تنظیم کند
- `app/config.py` (سطر 1) — تنظیمات JWT از اینجا خوانده می‌شود
- `app/routes/auth_google.py` — این فایل `auth.py` را import می‌کند (caller)
- `app/routes/ai.py` — این فایل `auth.py` را import می‌کند (caller)
- `app/routes/integrations.py` — این فایل `auth.py` را import می‌کند (caller)
- `app/routes/notifications.py` — این فایل `auth.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این تابع توسط تمام routeهای محافظت‌شده (users, tasks, projects, notifications, integrations, ai) استفاده می‌شود.

## 🔍 Context و وضعیت فعلی
در فایل `app/dependencies/auth.py`، تابع `get_current_user` که به عنوان dependency برای احراز هویت در اکثر endpointها استفاده می‌شود، احتمالاً انقضای توکن JWT را بررسی نمی‌کند. این یک آسیب‌پذیری امنیتی جدی است زیرا توکن‌های منقضی شده همچنان معتبر تلقی می‌شوند و مهاجم می‌تواند با یک توکن قدیمی به سیستم دسترسی پیدا کند. با توجه به اینکه `ACCESS_TOKEN_EXPIRE_MINUTES=30` در `.env.example` تنظیم شده، اما بررسی expiry در کد دیده نمی‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] توکن منقضی شده با status code 401 رد شود
- [ ] توکن معتبر بدون مشکل عبور کند
- [ ] تست واحد جدید برای بررسی expiry اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن بررسی `exp` (expiration time) در تابع `get_current_user` در `app/dependencies/auth.py`. از کتابخانه `python-jose` برای decode و بررسی خودکار expiry استفاده شود.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن بررسی expiry**

_قبل:_
```
payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
```

_بعد:_
```
payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_exp": True})
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_auth.py -k test_expired_token`
- `curl -H 'Authorization: Bearer EXPIRED_TOKEN' http://localhost:8000/api/tasks`

## ⚠️ ریسک‌ها و موارد احتیاط
کمترین ریسک؛ فقط توکن‌های منقضی شده را رد می‌کند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 10
  id: abb63a39-5994-4a6c-a0a8-3b4f983b8777
  عنوان اصلی: Implement Authorization for User Data Mutations
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - هر دو طرف ناسازگاری شناسایی + فرض‌هایشان مستند شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - ground truth تعیین شد و طرف دیگر align شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - integration test برای pipeline `auth` بدون شکست عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/integration/test_auth_pipeline.py::test_auth_flow_completes", "timeout_seconds": 60}]
  - PR description توضیح می‌دهد چرا این تصمیم گرفته شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
[منطق] Incomplete Authorization Coverage for User Data Mutations

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

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

## 🌐 نقشهٔ وابستگی‌ها
این مورد در pipeline auth است — همه فایل‌های این pipeline مرتبط هستند.

## 🔍 Context و وضعیت فعلی
## 📋 شرح ناسازگاری
در pipeline `auth` یک ناسازگاری منطقی پیدا شد:

The `app/services/auth_service.py` component is responsible for user registration and login. However, the provided descriptions do not explicitly mention how other user data mutations (e.g., updating user profiles, changing passwords, assigning roles, deleting accounts) are handled. While `app/dependencies/auth.py` is designed for authentication and authorization, there's no explicit component or interaction listed that confirms all such mutation paths leverage these dependencies for comprehensi

## 💥 پیامد (impact)
Without explicit authorization checks on all user data mutation paths, unauthorized users could potentially modify or delete other users' accounts, elevate their own privileges, or bypass security policies. This is a critical security vulnerability.

## 🛠 پیشنهاد رفع اولیه
Ensure that all API endpoints responsible for modifying user data (e.g., `/users/{user_id}`, `/me`) explicitly use FastAPI dependencies from `app/dependencies/auth.py` (like `get_current_user`, `get_current_active_user`, or custom role-based dependencies) to verify the requesting user's identity and permissions before allowing any changes. The `auth_service` should be designed to accept an authent

## 🤔 چرا مهم است
coherence issue یعنی دو بخش کد فرض‌های ناسازگار دارند — معمولاً نشانه‌ی refactor ناتمام یا feature flag rot است. این کلاس bug ها در test معمولی پیدا نمی‌شوند چون unit test ها در silo اجرا می‌شوند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هر دو طرف ناسازگاری شناسایی + فرض‌هایشان مستند شد
- [ ] ground truth تعیین شد و طرف دیگر align شد
- [ ] integration test برای pipeline `auth` بدون شکست عبور می‌کند
- [ ] PR description توضیح می‌دهد چرا این تصمیم گرفته شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: هر دو طرف ناسازگاری را بخوان و فرض‌هایشان را لیست کن.
گام ۲: تصمیم بگیر کدام طرف ground truth است — معمولاً business logic مهم‌تر است.
گام ۳: طرف دیگر را با ground truth align کن.
گام ۴: integration test برای این pipeline بنویس تا regression جلوگیری شود.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run test`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر یک طرف ممکن است downstream consumers را break کند. حتماً قبل از merge، همه caller های هر دو طرف را بررسی کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: logic_audit
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  - بررسی و مستندسازی وضعیت فعلی authorization در endpoint‌های mutation کاربر — بررسی و مستندسازی کامل تمام endpointهای mutation کاربر (update profile, change password, assign role, delete account) انجام نشده
  - اضافه کردن authorization به endpointهای فاقد آن در app/services/auth_service.py — endpoint مهم update_user_profile فاقد dependency get_current_user است
  - اضافه کردن role-based authorization برای endpointهای حساس (اختیاری اما توصیه‌شده) — role-based authorization برای endpointهای حساس (assign role, delete account) پیاده‌سازی نشده

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 10
  id: e0a59d8d-978f-4d02-a649-70311aac5127
  عنوان اصلی: پیاده‌سازی احراز هویت برای endpointهای داشبورد
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/projects.py, app/routes/tasks.py, frontend/src/pages/Dashboard.jsx

📋 acceptance_criteria کامل:
  - GET /api/t [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/tasks", "headers": null, "json_body": null, "expected_status": 401, "required_fields": null, "json_contains": {"detail": "Not authenticated"}}]

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
Dashboard از endpointهای بدون احراز هویت استفاده می‌کند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:129-134` — `list_tasks` — هیچ فیلتر user_id ندارد و نیاز به احراز هویت ندارد
  ```python
  @router.get("/api/tasks", tags=["tasks"])
  @router.get("/api/tasks/", tags=["tasks"])
  @handle_errors
  async def list_tasks(db: AsyncSession = Depends(get_db)) -> List[dict]:
      result = await db.execute(select(Task))
      return [_serialize(t) for t in result.scalars().all()]
  ```
- `app/routes/projects.py:51-56` — `list_projects` — همان مشکل: بدون فیلتر کاربر و بدون احراز هویت
  ```python
  @router.get("/api/projects", tags=["projects"])
  @router.get("/api/projects/", tags=["projects"])
  @handle_errors
  async def list_projects(db: AsyncSession = Depends(get_db)) -> List[dict]:
      result = await db.execute(select(Project))
      return [_serialize(p) for p in result.scalars().all()]
  ```
- `frontend/src/pages/Dashboard.jsx:30-55` — `fetchStats` — بدون هدر Authorization و بدون بررسی احراز هویت
  ```jsx
  const [tasksRes, projectsRes] = await Promise.all([
    fetch(`${API_BASE}/tasks`),
    fetch(`${API_BASE}/projects`),
  ]);
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست 
[auto-re-registered from github_import at 2026-05-20T04:25:49.854717+00:00]

## 🧱 پشتهٔ فناوری و معماری
FastAPI + React 18 + React Router v6

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/dependencies/auth.py` (سطر 1) — تابع get_current_user که باید به endpointها اضافه شود
- `frontend/src/context/AuthContext.jsx` (سطر 1) — محل ذخیره token که Dashboard باید از آن استفاده کند
- `app/database.py` — `tasks.py` این فایل را import می‌کند
- `app/middleware.py` — `tasks.py` این فایل را import می‌کند
- `app/models/task.py` — `tasks.py` این فایل را import می‌کند
- `app/schemas/task_schema.py` — `tasks.py` این فایل را import می‌کند
- `app/routes/__init__.py` — این فایل `tasks.py` را import می‌کند (caller)
- `app/models/project.py` — `projects.py` این فایل را import می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این باگ امنیتی روی دو endpoint اصلی (tasks و projects) و صفحه Dashboard تأثیر می‌گذارد. رفع آن نیازمند تغییر در backend (اضافه کردن وابستگی) و frontend (ارسال token) است.

## 🔍 Context و وضعیت فعلی
کامپوننت Dashboard.jsx در خطوط 33-35 با استفاده از fetch(`${API_BASE}/tasks`) و fetch(`${API_BASE}/projects`) داده‌ها را دریافت می‌کند. این endpointها در backend (app/routes/tasks.py و app/routes/projects.py) هیچ وابستگی به get_current_user ندارند و تمام رکوردهای جدول را برمی‌گردانند. این یعنی هر کاربر (حتی بدون لاگین) می‌تواند تمام tasks و projects همه کاربران را ببیند. همچنین Dashboard هیچ بررسی احراز هویت یا redirect به صفحه لاگین ندارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] GET /api/t
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ۱. به endpointهای GET /api/tasks و GET /api/projects وابستگی get_current_user اضافه شود تا فقط داده‌های کاربر جاری برگردد. ۲. در Dashboard.jsx، درخواست‌ها با هدر Authorization: Bearer <token> ارسال شوند. ۳. اگر توکن وجود نداشت، کاربر به صفحه لاگین هدایت شود.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن وابستگی get_current_user به list_tasks**

_قبل:_
```
async def list_tasks(db: AsyncSession = Depends(get_db)) -> List[dict]:
    result = await db.execute(select(Task))
```

_بعد:_
```
async def list_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[dict]:
    result = await db.execute(select(Task).where(Task.user_id == current_user.id))
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

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
تسک 6 از 10
  id: a14e9ff3-686c-4641-8e2b-2ac5e2365374
  عنوان اصلی: اعتبارسنجی ورودی endpoint جستجوی tasks
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["E\\d{3}", "W\\d{3}", "error:", "warning:"], "files_hint": ["backend/**/*.py"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["error:", "note:", "warning:", "incompatible type"], "files_hint": ["backend/**/*.py"]}]

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
عدم اعتبارسنجی ورودی در endpoint جستجوی tasks (SQL injection potential)

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

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

## 🔍 Context و وضعیت فعلی
در `app/routes/tasks.py`، endpoint `GET /api/tasks/search?q=...` از تابع `search_tasks` در `app/services/planner_service.py` استفاده می‌کند. اگرچه ادعا شده که از SQLAlchemy .ilike() استفاده می‌شود، اما بررسی دقیق کد نشان می‌دهد که query string مستقیماً به یک تابع خارجی پاس داده می‌شود و ممکن است sanitize نشود. این می‌تواند منجر به SQL injection شود اگر query string به درستی parameterize نشده باشد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. بررسی و اطمینان از اینکه query string در `search_tasks` با استفاده از parameterized query (مثلاً `text()` با bind parameters) به دیتابیس ارسال می‌شود. اضافه کردن sanitization اولیه برای حذف کاراکترهای

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

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
تسک 7 از 10
  id: 65f936fd-9d37-4f9e-a52d-559a13d4be7f
  عنوان اصلی: Strengthen Webhook HMAC signature default secret
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_webhook.py", "timeout_seconds": 60}]
  - linter بدون warning عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_lint.py", "timeout_seconds": 60}]
  - type-check موفق است [verify_method=backend_test] [verify_plan={"test_node": "tests/test_types.py", "timeout_seconds": 60}]

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
Webhook HMAC signature verification با secret پیش‌فرض ضعیف

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

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

## 🔍 Context و وضعیت فعلی
در `app/routes/webhook.py`، تابع `_webhook_secret()` از `os.environ.get

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
_(مجری بر اساس Context و معیارهای پذیرش، مراحل را تعیین کند)_

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

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
تسک 8 از 10
  id: 67d08afa-26f1-44d0-9892-c0ae5c9aae24
  عنوان اصلی: Address conditional inconsistency / stale assumption
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/dependencies/auth.py

📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["def get_current_user\\(.*\\) -> User:", "def get_current_active_user\\(.*\\) -> User:", "def get_current_admin_user\\(.*\\) -> User:", "def get_current_active_user\\(.*\\) -> OAuth]
  - تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_dependencies.py::test_type_mismatch_edge_case", "timeout_seconds": 60}]

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
Anti-pattern: Conditional inconsistency / Stale assumption

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/dependencies/auth.py:15`

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

- `app/routes/auth_google.py` — این فایل `auth.py` را import می‌کند (caller)
- `app/routes/ai.py` — این فایل `auth.py` را import می‌کند (caller)
- `app/routes/integrations.py` — این فایل `auth.py` را import می‌کند (caller)
- `app/routes/notifications.py` — این فایل `auth.py` را import می‌کند (caller)

## 🔍 Context و وضعیت فعلی
The `get_current_user` function is type-hinted to return `User`, but its dependent functions (`get_current_active_user`, `get_current_admin_user`) are type-hinted to receive `OAuthUser`. This creates a type mismatch. If `User` and `OAuthUser` are distinct models and `User` does not possess the `status` or `email` attributes expected by `OAuthUser`, this will lead to runtime `AttributeError`s when 

📁 file: app/dependencies/auth.py (line 15)

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
- `python -m py_compile app/dependencies/auth.py`
- `ruff check app/dependencies/auth.py`
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
تسک 9 از 10
  id: 0f9f5173-7ca9-43df-850b-7ac3c6b1a5c1
  عنوان اصلی: Optimize JWT Payload and Security
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - هر دو طرف ناسازگاری شناسایی + فرض‌هایشان مستند شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - ground truth تعیین شد و طرف دیگر align شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - integration test برای pipeline `auth` بدون شکست عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/integration/test_auth_pipeline.py::test_jwt_creation_and_validation", "timeout_seconds": 60}]
  - PR description توضیح می‌دهد چرا این تصمیم گرفته شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
[منطق] Lack of Explicit JWT Payload Minimization and Security Best Practices

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

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

## 🌐 نقشهٔ وابستگی‌ها
این مورد در pipeline auth است — همه فایل‌های این pipeline مرتبط هستند.

## 🔍 Context و وضعیت فعلی
## 📋 شرح ناسازگاری
در pipeline `auth` یک ناسازگاری منطقی پیدا شد:

`app/services/auth_service.py` is responsible for JWT creation. While it's standard to include some user information (like ID, roles) in the JWT payload, the description doesn't explicitly state that the payload is minimized to only essential, non-sensitive data required by the client. Additionally, the security practices around JWTs (e.g., short expiration times, revocation mechanisms, 'httpOnly' cookies for tokens if applicable, HTTPS enforcement) are not detailed. `frontend/src/context/AuthCo

## 💥 پیامد (impact)
Overly verbose JWT payloads can expose internal system details or sensitive user information to the client, even if signed. Long-lived tokens, lack of revocation, or storage in `localStorage` without robust XSS protection can lead to session hijacking if an attacker gains access to the token.

## 🛠 پیشنهاد رفع اولیه
Ensure JWT payloads contain only the absolute minimum information necessary for client-side operations (e.g., user ID, roles, expiration). Avoid sensitive data. While `localStorage` is common, consider alternatives like `httpOnly` cookies for enhanced security against XSS, especially for access tokens. If `localStorage` is used, ensure strong Content Security Policy (CSP) and other XSS prevention 

## 🤔 چرا مهم است
coherence issue یعنی دو بخش کد فرض‌های ناسازگار دارند — معمولاً نشانه‌ی refactor ناتمام یا feature flag rot است. این کلاس bug ها در test معمولی پیدا نمی‌شوند چون unit test ها در silo اجرا می‌شوند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هر دو طرف ناسازگاری شناسایی + فرض‌هایشان مستند شد
- [ ] ground truth تعیین شد و طرف دیگر align شد
- [ ] integration test برای pipeline `auth` بدون شکست عبور می‌کند
- [ ] PR description توضیح می‌دهد چرا این تصمیم گرفته شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: هر دو طرف ناسازگاری را بخوان و فرض‌هایشان را لیست کن.
گام ۲: تصمیم بگیر کدام طرف ground truth است — معمولاً business logic مهم‌تر است.
گام ۳: طرف دیگر را با ground truth align کن.
گام ۴: integration test برای این pipeline بنویس تا regression جلوگیری شود.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run test`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر یک طرف ممکن است downstream consumers را break کند. حتماً قبل از merge، همه caller های هر دو طرف را بررسی کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: logic_audit
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  - مستندسازی و پیاده‌سازی محدودیت payload JWT به حداقل اطلاعات ضروری — هیچ تغییری برای محدود کردن payload JWT به حداقل اطلاعات ضروری در auth_service.py مشاهده نشد.
  - پیاده‌سازی و مستندسازی بهترین شیوه‌های امنیتی JWT (انقضای کوتاه، revoke، httpOnly cookie) — زمان انقضای کوتاه پیاده‌سازی شده، اما مکانیزم revoke و httpOnly cookie وجود ندارد.
  - بازبینی و اصلاح فرانت‌اند (AuthContext) برای پشتیبانی از بهترین شیوه‌های امنیتی JWT — هیچ تغییری در AuthContext.jsx برای پشتیبانی از revoke یا httpOnly cookie مشاهده نشد.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 10 از 10
  id: 8efa28de-c550-4187-9dcc-298d7f901276
  عنوان اصلی: حذف متغیر محیطی بلااستفاده ACCESS_TOKEN_EXPIRE_MINUTES
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - `ACCESS_TOKEN_EXPIRE_MINUTES` در هیچ کدی خوانده نمی‌شود (تأیید شده) [verify_method=static] [verify_plan={"grep_patterns": ["os.getenv\\(['\"]ACCESS_TOKEN_EXPIRE_MINUTES['\"]\\)", "process.env.ACCESS_TOKEN_EXPIRE_MINUTES"], "files_hint": ["**/*.py", "**/*.js", "**/*.ts"]}]
  - از `.env.example` و deployment configs حذف شد [verify_method=static] [verify_plan={"grep_patterns": ["ACCESS_TOKEN_EXPIRE_MINUTES"], "files_hint": [".env.example", "deployment/config/*"]}]
  - اگر secret بوده، rotate شد و در deployment new value تنظیم شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
env var بلااستفاده: ACCESS_TOKEN_EXPIRE_MINUTES

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

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

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
env var `ACCESS_TOKEN_EXPIRE_MINUTES` در `.env`/config تعریف شده ولی در هیچ `os.getenv` یا `process.env` خوانده نمی‌شود.

## 🤔 چرا مهم است
یا (الف) reader حذف شده و باعث config drift می‌شود، یا (ب) leak اطلاعات حساس به repository است (مخصوصاً اگر secret است).

## 🔍 جزئیات
- علت: documented in .env.example/README but not used in code

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` در هیچ کدی خوانده نمی‌شود (تأیید شده)
- [ ] از `.env.example` و deployment configs حذف شد
- [ ] اگر secret بوده، rotate شد و در deployment new value تنظیم شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `ACCESS_TOKEN_EXPIRE_MINUTES` در همه کدبیس + CI configs + Dockerfile.
گام ۲: اگر unused است، از `.env.example` و docs حذف کن.
گام ۳: اگر secret leak شده، آن را rotate کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
اگر env var در CI/CD pipeline یا Dockerfile/Render config مصرف می‌شود، grep فقط روی کد ممکن است miss کند. حتماً همه‌جا چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: cleanup
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
- در commit message: `merged-from: c179af95-95cb-4d09-8580-27c23c0b2ae4, a7d8592f-349b-4fe2-b95a-8cbad7f24081, a2c055da-f0a2-48bd-98ff-ebe40e57725f, abb63a39-5994-4a6c-a0a8-3b4f983b8777, e0a59d8d-978f-4d02-a649-70311aac5127, a14e9ff3-686c-4641-8e2b-2ac5e2365374, 65f936fd-9d37-4f9e-a52d-559a13d4be7f, 67d08afa-26f1-44d0-9892-c0ae5c9aae24, 0f9f5173-7ca9-43df-850b-7ac3c6b1a5c1, 8efa28de-c550-4187-9dcc-298d7f901276`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 10 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها به طور جامع به بهبود امنیت سیستم، شامل احراز هویت (JWT، مدیریت سشن‌ها)، مجوزدهی (دسترسی به داده‌های کاربر و داشبورد)، مدیریت کلیدهای محرمانه و اعتبارسنجی ورودی می‌پردازند. این موارد هم بک‌اند و هم فرانت‌اند را درگیر می‌کنند.
🎯 theme: تقویت امنیت و احراز هویت سیستم
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 10
  id: c179af95-95cb-4d09-8580-27c23c0b2ae4
  عنوان اصلی: اعمال احراز هویت در endpointهای TodoList و TodoItem
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/lists.py, app/routes/todo_items.py

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["No issues found", "0 warnings"], "files_hint": ["linter_output.log"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["Success: no issues found", "0 errors"], "files_hint": ["type_check_output.log"]}]

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
نبود احراز هویت در endpointهای TodoList و TodoItem

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/lists.py:66-78` — `list_lists` — این endpoint فاقد وابستگی get_current_user است و همه لیست‌ها را برمی‌گرداند.
  ```python
  @router.get("/api/lists", tags=["todo-lists"], response_model=List[TodoListOut])
  @router.get("/api/lists/", tags=["todo-lists"], response_model=List[TodoListOut])
  @handle_errors
  async def list_lists(
      include_archived: bool = Query(default=False),
      db: AsyncSession = Depends(get_db),
  ) -> List[dict]:
  ```
- `app/routes/todo_items.py:62-74` — `list_todo_items` — این endpoint فاقد وابستگی get_current_user است.
  ```python
  @router.get("/api/todo-items", tags=["todo-items"], response_model=List[TodoItemOut])
  @router.get("/api/todo-items/", tags=["todo-items"], response_model=List[TodoItemOut])
  @handle_errors
  async def list_todo_items(
      list_id: int | None = Query(default=None),
      starred_only: bool = Query(default=False),
      completed: bool | None = Query(default=None),
      db: AsyncSession = Depends(get_db),
  ) -> List[dict]:
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست 
[auto-re-registered from github_import at 2026-05-20T04:25:49.854717+00:00]

## 🧱 پشتهٔ فناوری و معماری
FastAPI + SQLAlchemy + JWT

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/lists.py` (سطر 66) — همه endpointهای این فایل نیاز به احراز هویت دارند.
- `app/routes/todo_items.py` (سطر 62) — همه endpointهای این فایل نیاز به احراز هویت دارند.
- `app/dependencies/auth.py` (سطر 1) — تابع get_current_user در این فایل تعریف شده است.
- `app/services/list_service.py` (سطر 1) — سرویس لیست‌ها باید بر اساس user_id فیلتر کند.
- `app/services/todo_item_service.py` (سطر 1) — سرویس آیتم‌ها باید بر اساس user_id فیلتر کند.
- `app/database.py` — `lists.py` این فایل را import می‌کند
- `app/middleware.py` — `lists.py` این فایل را import می‌کند
- `app/schemas/todo_item_schema.py` — `lists.py` این فایل را import می‌کند
- `app/schemas/todo_list_schema.py` — `lists.py` این فایل را import می‌کند
- `app/services/__init__.py` — `todo_items.py` این فایل را import می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این تغییرات بر روی 2 فایل route و 2 فایل service تأثیر می‌گذارد. همچنین، تست‌های مربوطه باید به‌روزرسانی شوند.

## 🔍 Context و وضعیت فعلی
تمام endpointهای مربوط به TodoList و TodoItem (در فایل‌های app/routes/lists.py و app/routes/todo_items.py) فاقد وابستگی get_current_user هستند. این بدان معناست که هر کاربر بدون احراز هویت می‌تواند لیست‌ها و آیتم‌های todo را ایجاد، مشاهده، ویرایش و حذف کند. این یک نقص امنیتی جدی است زیرا داده‌های کاربران در معرض دسترسی غیرمجاز قرار می‌گیرد. همچنین، عملیات share و unshare و move نیز بدون احراز هویت قابل انجام هستند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. به تمام endpointهای موجود در app/routes/lists.py و app/routes/todo_items.py وابستگی get_current_user را اضافه کنید. همچنین، منطق business را طوری تغییر دهید که عملیات فقط روی داده‌های متعلق به کاربر جاری انجام شود (مثلاً با فیلتر کردن بر اساس user_id).

## 💡 نمونه‌های قبل/بعد
**افزودن وابستگی get_current_user به list_lists**

_قبل:_
```
async def list_lists(
    include_archived: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
) -> List[dict]:
```

_بعد:_
```
async def list_lists(
    include_archived: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 10
  id: a7d8592f-349b-4fe2-b95a-8cbad7f24081
  عنوان اصلی: جلوگیری از شروع با JWT_SECRET_KEY پیش‌فرض
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: .env.example, app/config.py

📋 acceptance_criteria کامل:
  - اپلیکیشن در محیط production با JWT_SECRET_KEY پیش‌فرض از شروع به کار جلوگیری می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_config_security.py::test_jwt_secret_key_placeholder_prevents_startup_in_production", "timeout_seconds": 60}]
  - خطای واضح و مشخص در لاگ ثبت می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_config_security.py::test_jwt_secret_key_placeholder_prevents_startup_in_production", "timeout_seconds": 60}]
  - تست واحد برای این سناریو اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_config_security.py::test_jwt_secret_key_placeholder_prevents_startup_in_production", "timeout_seconds": 60}]

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
JWT_SECRET_KEY placeholder در .env.example و عدم بررسی کافی در startup

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `.env.example:16` — `JWT_SECRET_KEY` — مقدار placeholder که نباید در production استفاده شود
  ```
  JWT_SECRET_KEY=<YOUR_JWT_SECRET_KEY>
  ```
- `app/config.py:1-30` — `settings` — مقدار پیش‌فرض ضعیف که در production باید override شود
  ```python
  class Settings(BaseSettings):
      JWT_SECRET_KEY: str = "change-me-in-production"
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست 
[auto-re-registered from github_import at 2026-05-20T04:25:49.854717+00:00]

## 🧱 پشتهٔ فناوری و معماری
FastAPI + python-jose + pydantic-settings

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/main.py` (سطر 186) — startup event که می‌تواند بررسی امنیتی را انجام دهد
- `app/routes/auth.py` (سطر 45) — از JWT_SECRET_KEY برای امضای توکن استفاده می‌کند
- `main.py` — این فایل `config.py` را import می‌کند (caller)
- `app/services/auth_service.py` — این فایل `config.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این کلید توسط AuthService و تمام endpointهای نیازمند احراز هویت استفاده می‌شود.

## 🔍 Context و وضعیت فعلی
فایل `.env.example` حاوی `JWT_SECRET_KEY=<YOUR_JWT_SECRET_KEY>` است که یک placeholder است. اگر توسعه‌دهنده این فایل را مستقیماً به `.env` کپی کند و مقدار را تغییر ندهد، JWT با یک کلید ضعیف و قابل حدس امضا می‌شود. همچنین در `app/main.py` و `app/config.py` بررسی کافی برای اجباری بودن این کلید در محیط production وجود ندارد (تنها در `ENVIRONMENT=production` بررسی می‌شود که ممکن است تنظیم نشود). این آسیب‌پذیری به مهاجم اجازه می‌دهد توکن‌های JWT جعلی بسازد و به هر endpoint محافظت‌شده دسترسی پیدا کند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اپلیکیشن در محیط production با JWT_SECRET_KEY پیش‌فرض از شروع به کار جلوگیری می‌کند
- [ ] خطای واضح و مشخص در لاگ ثبت می‌شود
- [ ] تست واحد برای این سناریو اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. در `app/config.py` یک validator اضافه کنید که در محیط production اگر `JWT_SECRET_KEY` برابر با placeholder یا مقدار پیش‌فرض بود، اپلیکیشن با خطای واضح متوقف شود.
2. در `app/main.py` در startup event یک بررسی امنیتی انجام دهید.
3. مقدار پیش‌فرض `JWT_SECRET_KEY` را در settings به `None` تغییر دهید و در صورت `None` بودن در production، fail fast کنید.

## 💡 نمونه‌های قبل/بعد
**بررسی امنیتی در startup**

_قبل:_
```
@app.on_event("startup")
async def startup_event():
    # ... بررسی دیتابیس و migration
```

_بعد:_
```
@app.on_event("startup")
async def startup_event():
    if settings.ENVIRONMENT == "production" and (not settings.JWT_SECRET_KEY or settings.JWT_SECRET_KEY == "change-me-in-production"):
        raise RuntimeError("JWT_SECRET_KEY must be set in production!")
    # ... ادامه
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `ENVIRONMENT=production JWT_SECRET_KEY=change-me-in-production python -c "from app.config import settings; print(settings.JWT_SECRET_KEY)"`
- `pytest tests/test_config.py -k jwt_secret`

## ⚠️ ریسک‌ها و موارد احتیاط
هیچ ریسکی ندارد؛ فقط fail-fast در محیط production

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 10
  id: a2c055da-f0a2-48bd-98ff-ebe40e57725f
  عنوان اصلی: افزودن بررسی انقضای JWT در middleware
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/dependencies/auth.py

📋 acceptance_criteria کامل:
  - توکن منقضی شده با status code 401 رد شود [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/users/me", "headers": {"Authorization": "Bearer <EXPIRED_JWT>"}, "json_body": null, "expected_status": 401, "required_fields": null, "json_contains": {"detail": "Signat]
  - توکن معتبر بدون مشکل عبور کند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/users/me", "headers": {"Authorization": "Bearer <VALID_JWT>"}, "json_body": null, "expected_status": 200, "required_fields": ["id", "username", "email"], "json_contains]
  - تست واحد جدید برای بررسی expiry اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/unit/test_auth.py::test_jwt_expiry_rejection", "timeout_seconds": 60}]

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
عدم بررسی انقضای توکن JWT در middleware احراز هویت

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/dependencies/auth.py:1-50` — `get_current_user` — تابع اصلی dependency احراز هویت که باید اصلاح شود
  ```python
  async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
      # احتمالاً فقط decode می‌کند بدون بررسی expiry
      payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست 
[auto-re-registered from github_import at 2026-05-20T04:25:49.854717+00:00]

## 🧱 پشتهٔ فناوری و معماری
FastAPI + python-jose + JWT

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/routes/auth.py` (سطر 85) — این endpoint توکن تولید می‌کند و باید expiry را تنظیم کند
- `app/config.py` (سطر 1) — تنظیمات JWT از اینجا خوانده می‌شود
- `app/routes/auth_google.py` — این فایل `auth.py` را import می‌کند (caller)
- `app/routes/ai.py` — این فایل `auth.py` را import می‌کند (caller)
- `app/routes/integrations.py` — این فایل `auth.py` را import می‌کند (caller)
- `app/routes/notifications.py` — این فایل `auth.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این تابع توسط تمام routeهای محافظت‌شده (users, tasks, projects, notifications, integrations, ai) استفاده می‌شود.

## 🔍 Context و وضعیت فعلی
در فایل `app/dependencies/auth.py`، تابع `get_current_user` که به عنوان dependency برای احراز هویت در اکثر endpointها استفاده می‌شود، احتمالاً انقضای توکن JWT را بررسی نمی‌کند. این یک آسیب‌پذیری امنیتی جدی است زیرا توکن‌های منقضی شده همچنان معتبر تلقی می‌شوند و مهاجم می‌تواند با یک توکن قدیمی به سیستم دسترسی پیدا کند. با توجه به اینکه `ACCESS_TOKEN_EXPIRE_MINUTES=30` در `.env.example` تنظیم شده، اما بررسی expiry در کد دیده نمی‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] توکن منقضی شده با status code 401 رد شود
- [ ] توکن معتبر بدون مشکل عبور کند
- [ ] تست واحد جدید برای بررسی expiry اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. اضافه کردن بررسی `exp` (expiration time) در تابع `get_current_user` در `app/dependencies/auth.py`. از کتابخانه `python-jose` برای decode و بررسی خودکار expiry استفاده شود.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن بررسی expiry**

_قبل:_
```
payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
```

_بعد:_
```
payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_exp": True})
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_auth.py -k test_expired_token`
- `curl -H 'Authorization: Bearer EXPIRED_TOKEN' http://localhost:8000/api/tasks`

## ⚠️ ریسک‌ها و موارد احتیاط
کمترین ریسک؛ فقط توکن‌های منقضی شده را رد می‌کند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 10
  id: abb63a39-5994-4a6c-a0a8-3b4f983b8777
  عنوان اصلی: Implement Authorization for User Data Mutations
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - هر دو طرف ناسازگاری شناسایی + فرض‌هایشان مستند شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - ground truth تعیین شد و طرف دیگر align شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - integration test برای pipeline `auth` بدون شکست عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/integration/test_auth_pipeline.py::test_auth_flow_completes", "timeout_seconds": 60}]
  - PR description توضیح می‌دهد چرا این تصمیم گرفته شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
[منطق] Incomplete Authorization Coverage for User Data Mutations

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

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

## 🌐 نقشهٔ وابستگی‌ها
این مورد در pipeline auth است — همه فایل‌های این pipeline مرتبط هستند.

## 🔍 Context و وضعیت فعلی
## 📋 شرح ناسازگاری
در pipeline `auth` یک ناسازگاری منطقی پیدا شد:

The `app/services/auth_service.py` component is responsible for user registration and login. However, the provided descriptions do not explicitly mention how other user data mutations (e.g., updating user profiles, changing passwords, assigning roles, deleting accounts) are handled. While `app/dependencies/auth.py` is designed for authentication and authorization, there's no explicit component or interaction listed that confirms all such mutation paths leverage these dependencies for comprehensi

## 💥 پیامد (impact)
Without explicit authorization checks on all user data mutation paths, unauthorized users could potentially modify or delete other users' accounts, elevate their own privileges, or bypass security policies. This is a critical security vulnerability.

## 🛠 پیشنهاد رفع اولیه
Ensure that all API endpoints responsible for modifying user data (e.g., `/users/{user_id}`, `/me`) explicitly use FastAPI dependencies from `app/dependencies/auth.py` (like `get_current_user`, `get_current_active_user`, or custom role-based dependencies) to verify the requesting user's identity and permissions before allowing any changes. The `auth_service` should be designed to accept an authent

## 🤔 چرا مهم است
coherence issue یعنی دو بخش کد فرض‌های ناسازگار دارند — معمولاً نشانه‌ی refactor ناتمام یا feature flag rot است. این کلاس bug ها در test معمولی پیدا نمی‌شوند چون unit test ها در silo اجرا می‌شوند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هر دو طرف ناسازگاری شناسایی + فرض‌هایشان مستند شد
- [ ] ground truth تعیین شد و طرف دیگر align شد
- [ ] integration test برای pipeline `auth` بدون شکست عبور می‌کند
- [ ] PR description توضیح می‌دهد چرا این تصمیم گرفته شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: هر دو طرف ناسازگاری را بخوان و فرض‌هایشان را لیست کن.
گام ۲: تصمیم بگیر کدام طرف ground truth است — معمولاً business logic مهم‌تر است.
گام ۳: طرف دیگر را با ground truth align کن.
گام ۴: integration test برای این pipeline بنویس تا regression جلوگیری شود.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run test`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر یک طرف ممکن است downstream consumers را break کند. حتماً قبل از merge، همه caller های هر دو طرف را بررسی کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: logic_audit
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  - بررسی و مستندسازی وضعیت فعلی authorization در endpoint‌های mutation کاربر — بررسی و مستندسازی کامل تمام endpointهای mutation کاربر (update profile, change password, assign role, delete account) انجام نشده
  - اضافه کردن authorization به endpointهای فاقد آن در app/services/auth_service.py — endpoint مهم update_user_profile فاقد dependency get_current_user است
  - اضافه کردن role-based authorization برای endpointهای حساس (اختیاری اما توصیه‌شده) — role-based authorization برای endpointهای حساس (assign role, delete account) پیاده‌سازی نشده

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 10
  id: e0a59d8d-978f-4d02-a649-70311aac5127
  عنوان اصلی: پیاده‌سازی احراز هویت برای endpointهای داشبورد
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/projects.py, app/routes/tasks.py, frontend/src/pages/Dashboard.jsx

📋 acceptance_criteria کامل:
  - GET /api/t [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/tasks", "headers": null, "json_body": null, "expected_status": 401, "required_fields": null, "json_contains": {"detail": "Not authenticated"}}]

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
Dashboard از endpointهای بدون احراز هویت استفاده می‌کند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:129-134` — `list_tasks` — هیچ فیلتر user_id ندارد و نیاز به احراز هویت ندارد
  ```python
  @router.get("/api/tasks", tags=["tasks"])
  @router.get("/api/tasks/", tags=["tasks"])
  @handle_errors
  async def list_tasks(db: AsyncSession = Depends(get_db)) -> List[dict]:
      result = await db.execute(select(Task))
      return [_serialize(t) for t in result.scalars().all()]
  ```
- `app/routes/projects.py:51-56` — `list_projects` — همان مشکل: بدون فیلتر کاربر و بدون احراز هویت
  ```python
  @router.get("/api/projects", tags=["projects"])
  @router.get("/api/projects/", tags=["projects"])
  @handle_errors
  async def list_projects(db: AsyncSession = Depends(get_db)) -> List[dict]:
      result = await db.execute(select(Project))
      return [_serialize(p) for p in result.scalars().all()]
  ```
- `frontend/src/pages/Dashboard.jsx:30-55` — `fetchStats` — بدون هدر Authorization و بدون بررسی احراز هویت
  ```jsx
  const [tasksRes, projectsRes] = await Promise.all([
    fetch(`${API_BASE}/tasks`),
    fetch(`${API_BASE}/projects`),
  ]);
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست 
[auto-re-registered from github_import at 2026-05-20T04:25:49.854717+00:00]

## 🧱 پشتهٔ فناوری و معماری
FastAPI + React 18 + React Router v6

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/dependencies/auth.py` (سطر 1) — تابع get_current_user که باید به endpointها اضافه شود
- `frontend/src/context/AuthContext.jsx` (سطر 1) — محل ذخیره token که Dashboard باید از آن استفاده کند
- `app/database.py` — `tasks.py` این فایل را import می‌کند
- `app/middleware.py` — `tasks.py` این فایل را import می‌کند
- `app/models/task.py` — `tasks.py` این فایل را import می‌کند
- `app/schemas/task_schema.py` — `tasks.py` این فایل را import می‌کند
- `app/routes/__init__.py` — این فایل `tasks.py` را import می‌کند (caller)
- `app/models/project.py` — `projects.py` این فایل را import می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این باگ امنیتی روی دو endpoint اصلی (tasks و projects) و صفحه Dashboard تأثیر می‌گذارد. رفع آن نیازمند تغییر در backend (اضافه کردن وابستگی) و frontend (ارسال token) است.

## 🔍 Context و وضعیت فعلی
کامپوننت Dashboard.jsx در خطوط 33-35 با استفاده از fetch(`${API_BASE}/tasks`) و fetch(`${API_BASE}/projects`) داده‌ها را دریافت می‌کند. این endpointها در backend (app/routes/tasks.py و app/routes/projects.py) هیچ وابستگی به get_current_user ندارند و تمام رکوردهای جدول را برمی‌گردانند. این یعنی هر کاربر (حتی بدون لاگین) می‌تواند تمام tasks و projects همه کاربران را ببیند. همچنین Dashboard هیچ بررسی احراز هویت یا redirect به صفحه لاگین ندارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] GET /api/t
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ۱. به endpointهای GET /api/tasks و GET /api/projects وابستگی get_current_user اضافه شود تا فقط داده‌های کاربر جاری برگردد. ۲. در Dashboard.jsx، درخواست‌ها با هدر Authorization: Bearer <token> ارسال شوند. ۳. اگر توکن وجود نداشت، کاربر به صفحه لاگین هدایت شود.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن وابستگی get_current_user به list_tasks**

_قبل:_
```
async def list_tasks(db: AsyncSession = Depends(get_db)) -> List[dict]:
    result = await db.execute(select(Task))
```

_بعد:_
```
async def list_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[dict]:
    result = await db.execute(select(Task).where(Task.user_id == current_user.id))
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

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
تسک 6 از 10
  id: a14e9ff3-686c-4641-8e2b-2ac5e2365374
  عنوان اصلی: اعتبارسنجی ورودی endpoint جستجوی tasks
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["E\\d{3}", "W\\d{3}", "error:", "warning:"], "files_hint": ["backend/**/*.py"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["error:", "note:", "warning:", "incompatible type"], "files_hint": ["backend/**/*.py"]}]

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
عدم اعتبارسنجی ورودی در endpoint جستجوی tasks (SQL injection potential)

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

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

## 🔍 Context و وضعیت فعلی
در `app/routes/tasks.py`، endpoint `GET /api/tasks/search?q=...` از تابع `search_tasks` در `app/services/planner_service.py` استفاده می‌کند. اگرچه ادعا شده که از SQLAlchemy .ilike() استفاده می‌شود، اما بررسی دقیق کد نشان می‌دهد که query string مستقیماً به یک تابع خارجی پاس داده می‌شود و ممکن است sanitize نشود. این می‌تواند منجر به SQL injection شود اگر query string به درستی parameterize نشده باشد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. بررسی و اطمینان از اینکه query string در `search_tasks` با استفاده از parameterized query (مثلاً `text()` با bind parameters) به دیتابیس ارسال می‌شود. اضافه کردن sanitization اولیه برای حذف کاراکترهای

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

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
تسک 7 از 10
  id: 65f936fd-9d37-4f9e-a52d-559a13d4be7f
  عنوان اصلی: Strengthen Webhook HMAC signature default secret
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_webhook.py", "timeout_seconds": 60}]
  - linter بدون warning عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_lint.py", "timeout_seconds": 60}]
  - type-check موفق است [verify_method=backend_test] [verify_plan={"test_node": "tests/test_types.py", "timeout_seconds": 60}]

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
Webhook HMAC signature verification با secret پیش‌فرض ضعیف

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

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

## 🔍 Context و وضعیت فعلی
در `app/routes/webhook.py`، تابع `_webhook_secret()` از `os.environ.get

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
_(مجری بر اساس Context و معیارهای پذیرش، مراحل را تعیین کند)_

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

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
تسک 8 از 10
  id: 67d08afa-26f1-44d0-9892-c0ae5c9aae24
  عنوان اصلی: Address conditional inconsistency / stale assumption
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/dependencies/auth.py

📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["def get_current_user\\(.*\\) -> User:", "def get_current_active_user\\(.*\\) -> User:", "def get_current_admin_user\\(.*\\) -> User:", "def get_current_active_user\\(.*\\) -> OAuth]
  - تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_auth_dependencies.py::test_type_mismatch_edge_case", "timeout_seconds": 60}]

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
Anti-pattern: Conditional inconsistency / Stale assumption

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/dependencies/auth.py:15`

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

- `app/routes/auth_google.py` — این فایل `auth.py` را import می‌کند (caller)
- `app/routes/ai.py` — این فایل `auth.py` را import می‌کند (caller)
- `app/routes/integrations.py` — این فایل `auth.py` را import می‌کند (caller)
- `app/routes/notifications.py` — این فایل `auth.py` را import می‌کند (caller)

## 🔍 Context و وضعیت فعلی
The `get_current_user` function is type-hinted to return `User`, but its dependent functions (`get_current_active_user`, `get_current_admin_user`) are type-hinted to receive `OAuthUser`. This creates a type mismatch. If `User` and `OAuthUser` are distinct models and `User` does not possess the `status` or `email` attributes expected by `OAuthUser`, this will lead to runtime `AttributeError`s when 

📁 file: app/dependencies/auth.py (line 15)

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
- `python -m py_compile app/dependencies/auth.py`
- `ruff check app/dependencies/auth.py`
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
تسک 9 از 10
  id: 0f9f5173-7ca9-43df-850b-7ac3c6b1a5c1
  عنوان اصلی: Optimize JWT Payload and Security
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - هر دو طرف ناسازگاری شناسایی + فرض‌هایشان مستند شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - ground truth تعیین شد و طرف دیگر align شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - integration test برای pipeline `auth` بدون شکست عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/integration/test_auth_pipeline.py::test_jwt_creation_and_validation", "timeout_seconds": 60}]
  - PR description توضیح می‌دهد چرا این تصمیم گرفته شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
[منطق] Lack of Explicit JWT Payload Minimization and Security Best Practices

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

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

## 🌐 نقشهٔ وابستگی‌ها
این مورد در pipeline auth است — همه فایل‌های این pipeline مرتبط هستند.

## 🔍 Context و وضعیت فعلی
## 📋 شرح ناسازگاری
در pipeline `auth` یک ناسازگاری منطقی پیدا شد:

`app/services/auth_service.py` is responsible for JWT creation. While it's standard to include some user information (like ID, roles) in the JWT payload, the description doesn't explicitly state that the payload is minimized to only essential, non-sensitive data required by the client. Additionally, the security practices around JWTs (e.g., short expiration times, revocation mechanisms, 'httpOnly' cookies for tokens if applicable, HTTPS enforcement) are not detailed. `frontend/src/context/AuthCo

## 💥 پیامد (impact)
Overly verbose JWT payloads can expose internal system details or sensitive user information to the client, even if signed. Long-lived tokens, lack of revocation, or storage in `localStorage` without robust XSS protection can lead to session hijacking if an attacker gains access to the token.

## 🛠 پیشنهاد رفع اولیه
Ensure JWT payloads contain only the absolute minimum information necessary for client-side operations (e.g., user ID, roles, expiration). Avoid sensitive data. While `localStorage` is common, consider alternatives like `httpOnly` cookies for enhanced security against XSS, especially for access tokens. If `localStorage` is used, ensure strong Content Security Policy (CSP) and other XSS prevention 

## 🤔 چرا مهم است
coherence issue یعنی دو بخش کد فرض‌های ناسازگار دارند — معمولاً نشانه‌ی refactor ناتمام یا feature flag rot است. این کلاس bug ها در test معمولی پیدا نمی‌شوند چون unit test ها در silo اجرا می‌شوند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هر دو طرف ناسازگاری شناسایی + فرض‌هایشان مستند شد
- [ ] ground truth تعیین شد و طرف دیگر align شد
- [ ] integration test برای pipeline `auth` بدون شکست عبور می‌کند
- [ ] PR description توضیح می‌دهد چرا این تصمیم گرفته شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: هر دو طرف ناسازگاری را بخوان و فرض‌هایشان را لیست کن.
گام ۲: تصمیم بگیر کدام طرف ground truth است — معمولاً business logic مهم‌تر است.
گام ۳: طرف دیگر را با ground truth align کن.
گام ۴: integration test برای این pipeline بنویس تا regression جلوگیری شود.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run test`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر یک طرف ممکن است downstream consumers را break کند. حتماً قبل از merge، همه caller های هر دو طرف را بررسی کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: logic_audit
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  - مستندسازی و پیاده‌سازی محدودیت payload JWT به حداقل اطلاعات ضروری — هیچ تغییری برای محدود کردن payload JWT به حداقل اطلاعات ضروری در auth_service.py مشاهده نشد.
  - پیاده‌سازی و مستندسازی بهترین شیوه‌های امنیتی JWT (انقضای کوتاه، revoke، httpOnly cookie) — زمان انقضای کوتاه پیاده‌سازی شده، اما مکانیزم revoke و httpOnly cookie وجود ندارد.
  - بازبینی و اصلاح فرانت‌اند (AuthContext) برای پشتیبانی از بهترین شیوه‌های امنیتی JWT — هیچ تغییری در AuthContext.jsx برای پشتیبانی از revoke یا httpOnly cookie مشاهده نشد.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 10 از 10
  id: 8efa28de-c550-4187-9dcc-298d7f901276
  عنوان اصلی: حذف متغیر محیطی بلااستفاده ACCESS_TOKEN_EXPIRE_MINUTES
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - `ACCESS_TOKEN_EXPIRE_MINUTES` در هیچ کدی خوانده نمی‌شود (تأیید شده) [verify_method=static] [verify_plan={"grep_patterns": ["os.getenv\\(['\"]ACCESS_TOKEN_EXPIRE_MINUTES['\"]\\)", "process.env.ACCESS_TOKEN_EXPIRE_MINUTES"], "files_hint": ["**/*.py", "**/*.js", "**/*.ts"]}]
  - از `.env.example` و deployment configs حذف شد [verify_method=static] [verify_plan={"grep_patterns": ["ACCESS_TOKEN_EXPIRE_MINUTES"], "files_hint": [".env.example", "deployment/config/*"]}]
  - اگر secret بوده، rotate شد و در deployment new value تنظیم شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
env var بلااستفاده: ACCESS_TOKEN_EXPIRE_MINUTES

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

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

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
env var `ACCESS_TOKEN_EXPIRE_MINUTES` در `.env`/config تعریف شده ولی در هیچ `os.getenv` یا `process.env` خوانده نمی‌شود.

## 🤔 چرا مهم است
یا (الف) reader حذف شده و باعث config drift می‌شود، یا (ب) leak اطلاعات حساس به repository است (مخصوصاً اگر secret است).

## 🔍 جزئیات
- علت: documented in .env.example/README but not used in code

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` در هیچ کدی خوانده نمی‌شود (تأیید شده)
- [ ] از `.env.example` و deployment configs حذف شد
- [ ] اگر secret بوده، rotate شد و در deployment new value تنظیم شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `ACCESS_TOKEN_EXPIRE_MINUTES` در همه کدبیس + CI configs + Dockerfile.
گام ۲: اگر unused است، از `.env.example` و docs حذف کن.
گام ۳: اگر secret leak شده، آن را rotate کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
اگر env var در CI/CD pipeline یا Dockerfile/Render config مصرف می‌شود، grep فقط روی کد ممکن است miss کند. حتماً همه‌جا چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: cleanup
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
- در commit message: `merged-from: c179af95-95cb-4d09-8580-27c23c0b2ae4, a7d8592f-349b-4fe2-b95a-8cbad7f24081, a2c055da-f0a2-48bd-98ff-ebe40e57725f, abb63a39-5994-4a6c-a0a8-3b4f983b8777, e0a59d8d-978f-4d02-a649-70311aac5127, a14e9ff3-686c-4641-8e2b-2ac5e2365374, 65f936fd-9d37-4f9e-a52d-559a13d4be7f, 67d08afa-26f1-44d0-9892-c0ae5c9aae24, 0f9f5173-7ca9-43df-850b-7ac3c6b1a5c1, 8efa28de-c550-4187-9dcc-298d7f901276`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. اعمال تغییر بدون شکستن تست‌های موجود _(verify: backend_test)_
2. linter بدون warning عبور می‌کند _(verify: static)_
3. type-check موفق است _(verify: static)_
4. اپلیکیشن در محیط production با JWT_SECRET_KEY پیش‌فرض از شروع به کار جلوگیری می‌کند _(verify: backend_test)_
5. خطای واضح و مشخص در لاگ ثبت می‌شود _(verify: backend_test)_
6. تست واحد برای این سناریو اضافه شود _(verify: backend_test)_
7. توکن منقضی شده با status code 401 رد شود _(verify: api_response)_
8. توکن معتبر بدون مشکل عبور کند _(verify: api_response)_
9. تست واحد جدید برای بررسی expiry اضافه شود _(verify: backend_test)_
10. GET /api/t _(verify: api_response)_
11. هر دو طرف ناسازگاری شناسایی + فرض‌هایشان مستند شد _(verify: manual_only)_
12. ground truth تعیین شد و طرف دیگر align شد _(verify: manual_only)_
13. integration test برای pipeline `auth` بدون شکست عبور می‌کند _(verify: backend_test)_
14. PR description توضیح می‌دهد چرا این تصمیم گرفته شد _(verify: manual_only)_
15. ریشه anti-pattern تشخیص داده شد _(verify: manual_only)_
16. یا کد اصلاح شد، یا کامنت توجیهی اضافه شد _(verify: static)_
17. تست edge case نوشته شد _(verify: backend_test)_
18. `ACCESS_TOKEN_EXPIRE_MINUTES` در هیچ کدی خوانده نمی‌شود (تأیید شده) _(verify: static)_
19. از `.env.example` و deployment configs حذف شد _(verify: static)_
20. اگر secret بوده، rotate شد و در deployment new value تنظیم شد _(verify: manual_only)_

## Task Steps

### Step 1: بررسی اولیه خودکار و جلوگیری از پیاده‌سازی مجدد قابلیت‌های موجود در repo
**Status:** `pending` (0%)
**Scope:** این بخش یک یادداشت هشداردهنده برای مدل اجراکننده است که قبل از هرگونه تغییر، باید با جستجو و خواندن فایل‌های مرتبط، وجود پیاده‌سازی قبلی را بررسی کند. شامل دستورالعمل‌هایی برای جلوگیری از بازسازی، اصلاح موارد ناقص، و ثبت کامیت توضیحی در صورت عدم نیاز به تغییر است. این بخش مستقیماً به کد خاصی اشاره نمی‌کند بلکه فرآیند اجرا را هدایت می‌کند.
— [merged] این بخش یک یادداشت هشداردهنده برای مدل اجراکننده است که قبل از هرگونه تغییر، باید با جستجو و خواندن فایل‌های مرتبط، وجود پیاده‌سازی قبلی را بررسی کند. اگر قابلیتی از قبل کامل است، دوباره ساخته نشود. اگر ناقص است، فقط تکمیل شود. اگر همه چیز درست است، یک کامیت no-op ثبت شود. این بخش شامل هیچ دستور اجرایی مستقیم نیست و صرفاً یک پروتکل رفتاری برای مدل است.
— [merged] این بخش یک یادداشت هشداردهنده برای مدل اجراکننده است که قبل از هرگونه تغییر، باید ساختار repo را مستقل بررسی کند. شامل دستورالعمل‌هایی برای جلوگیری از پیاده‌سازی مجدد، اصلاح موارد ناقص، و ثبت کامیت توضیحی در صورت عدم نیاز به تغییر است. این بخش شامل هیچ مرحله اجرایی مستقیم نیست و صرفاً یک راهنمای فرآیندی است.
— [merged] این بخش یک یادداشت مهم برای مدل اجراکننده است که پیش از هرگونه تغییر در repo باید اجرا شود. شامل دستورالعمل‌هایی برای بررسی وجود پیاده‌سازی قبلی، جستجوی فایل‌های مرتبط، و جلوگیری از ساخت دوباره کدهای موجود است. همچنین مسئولیت مدل اجراکننده را برای تصمیم‌گیری مستقل در صورت ابهام یا خطا در پرامپت مشخص می‌کند. این بخش هیچ کد یا تغییری را مستقیماً مشخص نمی‌کند، بلکه فرآیند اجرا را هدایت می‌کند.
— [merged] این بخش یک یادداشت هشداردهنده برای مدل اجراکننده است و شامل هیچ دستور اجرایی مستقیمی نیست. وظیفه آن اطمینان از عدم پیاده‌سازی مجدد کدهای موجود، بررسی ساختار repo با grep/search، و ثبت کامیت no-op در صورت کامل بودن قابلیت‌ها است. این بخش به‌عنوان یک مرحله پیش‌نیاز برای تمام مراحل بعدی عمل می‌کند و باید قبل از هر تغییر اجرا شود.
— [merged] این بخش یک یادداشت هشداردهنده برای مدل اجراکننده است که قبل از هرگونه تغییر، باید با جستجوی grep و خواندن فایل‌های مرتبط، وجود پیاده‌سازی قبلی را بررسی کند. اگر قابلیتی از قبل کامل است، دوباره ساخته نشود. اگر ناقص است، فقط تکمیل/اصلاح شود. اگر همه چیز درست است، یک کامیت no-op توضیحی ثبت شود. این بخش شامل هیچ مرحله اجرایی مستقیم نیست، بلکه یک دستورالعمل متدولوژیک است.
— [merged] این بخش یک یادداشت هشداردهنده برای مدل اجراکننده است که قبل از هرگونه تغییر، باید با جستجو در repo (grep/search) و خواندن فایل‌های مرتبط، وجود پیاده‌سازی قبلی را بررسی کند. اگر قابلیتی از قبل کامل است، دوباره ساخته نشود. اگر ناقص است، فقط تکمیل/اصلاح شود. اگر همه چیز درست است، یک کامیت no-op توضیحی ثبت شود. این بخش شامل هیچ دستور اجر
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

### Step 2: افزودن وابستگی احراز هویت به endpointهای list_lists و list_todo_items
**Status:** `pending` (0%)
**Scope:** این مرحله شامل افزودن پارامتر `current_user: AuthContext = Depends(get_current_user)` به دو endpoint مشخص شده در فایل‌های `app/routes/lists.py` و `app/routes/todo_items.py` است. هدف محدود کردن دسترسی به لیست‌ها و آیتم‌های todo فقط برای کاربران احراز هویت شده است. خارج از scope این مرحله: تغییر در منطق business (مثلاً فیلتر کردن بر اساس کاربر)، تغییر در schemaها، یا تغییر در سرویس‌ها. نکته حیاتی: endpointها باید پس از این تغییر، فقط آیتم‌های مربوط به کاربر جاری را برگردانند (که نیاز به تغییر در سرویس‌ها در مراحل بعدی دارد).
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
نبود احراز هویت در endpointهای TodoList و TodoItem

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/lists.py:66-78` — `list_lists` — این endpoint فاقد وابستگی get_current_user است و همه لیست‌ها را برمی‌گرداند.
  ```python
  @router.get("/api/lists", tags=["todo-lists"], response_model=List[TodoListOut])
  @router.get("/api/lists/", tags=["todo-lists"], response_model=List[TodoListOut])
  @handle_errors
  async def list_lists(
      include_archived: bool = Query(default=False),
      db: AsyncSession = Depends(get_db),
  ) -> List[dict]:
  ```
- `app/routes/todo_items.py:62-74` — `list_todo_items` — این endpoint فاقد وابستگی get_current_user است.
  ```python
  @router.get("/api/todo-items", tags=["todo-items"], response_model=List[TodoItemOut])
  @router.get("/api/todo-items/", tags=["todo-items"], response_model=List[TodoItemOut])
  @handle_errors
  async def list_todo_items(
      list_id: int | None = Query(default=None),
      starred_only: bool = Query(default=False),
      completed: bool | None = Query(default=None),
      db: AsyncSession = Depends(get_db),
  ) -> List[dict]:
  ```
```

### Step 3: افزودن وابستگی احراز هویت به تمام endpointهای TodoList و TodoItem
**Status:** `pending` (0%)
**Scope:** این مرحله شامل افزودن وابستگی get_current_user به تمام endpointهای موجود در فایل‌های app/routes/lists.py و app/routes/todo_items.py است. همچنین شامل به‌روزرسانی سرویس‌های مربوطه (list_service و todo_item_service) برای فیلتر کردن بر اساس user_id می‌شود. این مرحله شامل تغییر در منطق اشتراک‌گذاری (share/unshare) و جابجایی (move) نیز می‌شود. تست‌های مربوطه باید به‌روزرسانی شوند.
**Excerpt:**
```
تمام endpointهای مربوط به TodoList و TodoItem (در فایل‌های app/routes/lists.py و app/routes/todo_items.py) فاقد وابستگی get_current_user هستند. این بدان معناست که هر کاربر بدون احراز هویت می‌تواند لیست‌ها و آیتم‌های todo را ایجاد، مشاهده، ویرایش و حذف کند. این یک نقص امنیتی جدی است زیرا داده‌های کاربران در معرض دسترسی غیرمجاز قرار می‌گیرد. همچنین، عملیات share و unshare و move نیز بدون احراز هویت قابل انجام هستند.
```

### Step 4: افزودن وابستگی get_current_user به endpointها و فیلتر کردن داده‌ها بر اساس user_id
**Status:** `pending` (0%)
**Scope:** این مرحله شامل افزودن وابستگی get_current_user به تمام endpointهای موجود در فایل‌های app/routes/lists.py و app/routes/todo_items.py است. همچنین منطق business در سرویس‌های مربوطه (app/services/list_service.py و app/services/todo_item_service.py) باید تغییر کند تا عملیات فقط روی داده‌های متعلق به کاربر جاری انجام شود. تست‌های موجود نباید شکسته شوند و linter و type-check باید بدون مشکل عبور کنند.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. به تمام endpointهای موجود در app/routes/lists.py و app/routes/todo_items.py وابستگی get_current_user را اضافه کنید. همچنین، منطق business را طوری تغییر دهید که عملیات فقط روی داده‌های متعلق به کاربر جاری انجام شود (مثلاً با فیلتر کردن بر اساس user_id).
```

### Step 5: افزودن وابستگی get_current_user به endpoint list_lists
**Status:** `pending` (0%)
**Scope:** این بخش فقط شامل تغییر امضای تابع list_lists در فایل app/routes/lists.py است. وابستگی get_current_user به عنوان یک پارامتر جدید به تابع اضافه می‌شود. هیچ تغییری در منطق داخلی تابع، سایر endpointها، یا فایل‌های دیگر انجام نمی‌شود. نکته حیاتی: این یک تغییر صرفاً در امضای تابع است و رفتار observable تابع فعلاً تغییر نمی‌کند تا منطق استفاده از user در مرحله بعدی پیاده‌سازی شود.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**افزودن وابستگی get_current_user به list_lists**

_قبل:_
```
async def list_lists(
    include_archived: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
) -> List[dict]:
```

_بعد:_
```
async def list_lists(
    include_archived: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
    current_user: AuthContext = Depends(get_current_user),
) -> List[dict]:
```
```

### Step 6: جلوگیری از شروع اپلیکیشن در محیط production با JWT_SECRET_KEY پیش‌فرض
**Status:** `pending` (0%)
**Scope:** این مرحله شامل پیاده‌سازی مکانیزمی است که از راه‌اندازی اپلیکیشن در محیط production در صورت استفاده از مقدار پیش‌فرض JWT_SECRET_KEY جلوگیری می‌کند. فایل‌های دخیل app/config.py و .env.example هستند. تست واحد مربوطه در tests/test_config_security.py اضافه می‌شود. این مرحله شامل تغییرات در منطق startup یا validation config است و صرفاً به security مربوط می‌شود.
— [merged] این بخش شامل افزودن validator در app/config.py برای بررسی JWT_SECRET_KEY در محیط production، تغییر مقدار پیش‌فرض آن به None، و افزودن تست واحد در tests/test_config_security.py است. خارج از scope: تغییرات در app/main.py (چون مراحل پیشنهادی کاربر شامل آن است ولی معیار پذیرش صراحتاً به آن اشاره نکرده)، و هرگونه تغییر در سایر فایل‌ها. نکته حیاتی: رفتار قابل مشاهده توقف اپلیکیشن با خطای واضح در لاگ است، نه صرفاً هشدار.
**Excerpt:**
```
تسک 2 از 10
  id: a7d8592f-349b-4fe2-b95a-8cbad7f24081
  عنوان اصلی: جلوگیری از شروع با JWT_SECRET_KEY پیش‌فرض
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: .env.example, app/config.py

📋 acceptance_criteria کامل:
  - اپلیکیشن در محیط production با JWT_SECRET_KEY پیش‌فرض از شروع به کار جلوگیری می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_config_security.py::test_jwt_secret_key_placeholder_prevents_startup_in_production", "timeout_seconds": 60}]
  - خطای واضح و مشخص در لاگ ثبت می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_config_security.py::test_jwt_secret_key_placeholder_prevents_startup_in_production", "timeout_seconds": 60}]
  - تست واحد برای این سناریو اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_config_security.py::test_jwt_secret_key_placeholder_prevents_startup_in_production", "timeout_seconds": 60}]
```

### Step 7: رفع placeholder و پیش‌فرض ضعیف JWT_SECRET_KEY در .env.example و app/config.py
**Status:** `pending` (0%)
**Scope:** این مرحله شامل جایگزینی مقدار placeholder '<YOUR_JWT_SECRET_KEY>' در فایل .env.example با یک مقدار پیش‌فرض امن (مانند یک رشته تصادفی 64 کاراکتری) و همچنین جایگزینی مقدار پیش‌فرض ضعیف 'change-me-in-production' در کلاس Settings در app/config.py با یک مقدار امن مشابه است. همچنین شامل افزودن یک بررسی در زمان startup (مثلاً در تابع create_app یا main) برای اطمینان از اینکه JWT_SECRET_KEY در محیط production با مقدار پیش‌فرض ضعیف باقی نمانده است. این مرحله شامل تغییرات در فایل‌های tests/test_config_security.py برای تست این بررسی نمی‌شود مگر اینکه صراحتاً در بخش ذکر شده باشد.
**Excerpt:**
```
JWT_SECRET_KEY placeholder در .env.example و عدم بررسی کافی در startup

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `.env.example:16` — `JWT_SECRET_KEY` — مقدار placeholder که نباید در production استفاده شود
  ```
  JWT_SECRET_KEY=<YOUR_JWT_SECRET_KEY>
  ```
- `app/config.py:1-30` — `settings` — مقدار پیش‌فرض ضعیف که در production باید override شود
  ```python
  class Settings(BaseSettings):
      JWT_SECRET_KEY: str = "change-me-in-production"
  ```
```

### Step 8: اعتبارسنجی و اجباری‌سازی JWT_SECRET_KEY در محیط production
**Status:** `pending` (0%)
**Scope:** این بخش شامل بررسی و اصلاح فایل‌های app/config.py و app/main.py برای اطمینان از وجود مقدار معتبر برای JWT_SECRET_KEY در محیط production است. همچنین شامل به‌روزرسانی .env.example برای حذف placeholder و اضافه کردن هشدار می‌شود. خارج از scope: تغییر منطق احراز هویت، تغییر ساختار توکن، یا اضافه کردن endpoint جدید.
**Excerpt:**
```
فایل `.env.example` حاوی `JWT_SECRET_KEY=<YOUR_JWT_SECRET_KEY>` است که یک placeholder است. اگر توسعه‌دهنده این فایل را مستقیماً به `.env` کپی کند و مقدار را تغییر ندهد، JWT با یک کلید ضعیف و قابل حدس امضا می‌شود. همچنین در `app/main.py` و `app/config.py` بررسی کافی برای اجباری بودن این کلید در محیط production وجود ندارد (تنها در `ENVIRONMENT=production` بررسی می‌شود که ممکن است تنظیم نشود). این آسیب‌پذیری به مهاجم اجازه می‌دهد توکن‌های JWT جعلی بسازد و به هر endpoint محافظت‌شده دسترسی پیدا کند.
```

### Step 9: افزودن بررسی امنیتی JWT_SECRET_KEY در رویداد startup برنامه
**Status:** `pending` (0%)
**Scope:** این مرحله شامل افزودن یک بررسی امنیتی در تابع رویداد startup برنامه FastAPI است. در محیط production، اگر JWT_SECRET_KEY تنظیم نشده باشد یا مقدار پیش‌فرض 'change-me-in-production' داشته باشد، برنامه با خطا متوقف می‌شود. این مرحله فقط به فایل app/config.py و app/database.py (یا هر فایلی که رویداد startup در آن تعریف شده) مربوط است و شامل تغییرات دیگر نمی‌شود.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**بررسی امنیتی در startup**

_قبل:_
```
@app.on_event("startup")
async def startup_event():
    # ... بررسی دیتابیس و migration
```

_بعد:_
```
@app.on_event("startup")
async def startup_event():
    if settings.ENVIRONMENT == "production" and (not settings.JWT_SECRET_KEY or settings.JWT_SECRET_KEY == "change-me-in-production"):
        raise RuntimeError("JWT_SECRET_KEY must be set in production!")
    # ... ادامه
```
```

### Step 10: اعتبارسنجی تنظیمات JWT در محیط production
**Status:** `pending` (0%)
**Scope:** این بخش شامل دو دستور اعتبارسنجی است: یکی برای بررسی مقدار JWT_SECRET_KEY در محیط production از طریق خط فرمان، و دیگری برای اجرای تست pytest روی فایل tests/test_config.py با فیلتر k=jwt_secret. هدف اطمینان از عدم استفاده از مقدار پیش‌فرض change-me-in-production در محیط واقعی است. هیچ تغییری در کد یا فایلی ایجاد نمی‌شود.
**Excerpt:**
```
## 🧪 دستورات اعتبارسنجی
- `ENVIRONMENT=production JWT_SECRET_KEY=change-me-in-production python -c "from app.config import settings; print(settings.JWT_SECRET_KEY)"`
- `pytest tests/test_config.py -k jwt_secret`
```

### Step 11: افزودن بررسی انقضای JWT در middleware
**Status:** `pending` (0%)
**Scope:** این بخش شامل پیاده‌سازی بررسی انقضای توکن JWT در middleware احراز هویت است. فقط فایل app/dependencies/auth.py تحت تأثیر قرار می‌گیرد. توکن‌های منقضی شده باید با status code 401 و پیام خطای مناسب رد شوند. توکن‌های معتبر باید بدون مشکل عبور کنند. یک تست واحد جدید برای تأیید این رفتار اضافه می‌شود.
**Excerpt:**
```
تسک 3 از 10
  id: a2c055da-f0a2-48bd-98ff-ebe40e57725f
  عنوان اصلی: افزودن بررسی انقضای JWT در middleware
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/dependencies/auth.py

📋 acceptance_criteria کامل:
  - توکن منقضی شده با status code 401 رد شود [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/users/me", "headers": {"Authorization": "Bearer <EXPIRED_JWT>"}, "json_body": null, "expected_status": 401, "required_fields": null, "json_contains": {"detail": "Signat}]
  - توکن معتبر بدون مشکل عبور کند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/users/me", "headers": {"Authorization": "Bearer <VALID_JWT>"}, "json_body": null, "expected_status": 200, "required_fields": ["id", "username", "email"], "json_contains]
  - تست واحد جدید برای بررسی expiry اضافه شود [verify_method=backend_test] [verify_plan={"test_node": "tests/unit/test_auth.py::test_jwt_expiry_rejection", "timeout_seconds": 60}]
```

### Step 12: بررسی انقضای توکن JWT در middleware احراز هویت
**Status:** `pending` (0%)
**Scope:** این بخش شامل اصلاح تابع `get_current_user` در فایل `app/dependencies/auth.py` برای بررسی انقضای توکن JWT است. خارج از این scope: تغییرات در سایر فایل‌ها، اضافه کردن middleware جدید، یا تغییر در منطق تولید توکن.
**Excerpt:**
```
عدم بررسی انقضای توکن JWT در middleware احراز هویت

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/dependencies/auth.py:1-50` — `get_current_user` — تابع اصلی dependency احراز هویت که باید اصلاح شود
  ```python
  async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
      # احتمالاً فقط decode می‌کند بدون بررسی expiry
      payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
  ```
```

### Step 13: بررسی و رفع عدم بررسی انقضای توکن JWT در تابع get_current_user
**Status:** `pending` (0%)
**Scope:** این بخش صرفاً به بررسی و رفع مشکل عدم بررسی انقضای توکن JWT در تابع `get_current_user` در فایل `app/dependencies/auth.py` می‌پردازد. شامل اضافه کردن منطق بررسی `exp` (expiration) توکن پس از decode کردن آن است. خارج از scope این بخش: تغییر در تولید توکن (که در `app/dependencies/auth.py` انجام می‌شود)، تغییر در تنظیمات (که در `app/config.py` است)، یا تغییر در سایر routeها.
**Excerpt:**
```
در فایل `app/dependencies/auth.py`، تابع `get_current_user` که به عنوان dependency برای احراز هویت در اکثر endpointها استفاده می‌شود، احتمالاً انقضای توکن JWT را بررسی نمی‌کند. این یک آسیب‌پذیری امنیتی جدی است زیرا توکن‌های منقضی شده همچنان معتبر تلقی می‌شوند و مهاجم می‌تواند با یک توکن قدیمی به سیستم دسترسی پیدا کند. با توجه به اینکه `ACCESS_TOKEN_EXPIRE_MINUTES=30` در `.env.example` تنظیم شده، اما بررسی expiry در کد دیده نمی‌شود.
```

### Step 14: اضافه کردن بررسی انقضای توکن JWT در تابع get_current_user
**Status:** `pending` (0%)
**Scope:** این مرحله فقط شامل افزودن بررسی میدان `exp` (expiration time) در تابع `get_current_user` در فایل `app/dependencies/auth.py` است. از کتابخانه `python-jose` برای decode و بررسی خودکار expiry استفاده می‌شود. خارج از scope: تغییر ساختار توکن، تغییر نحوه تولید توکن، یا تغییر سایر dependencyها.
**Excerpt:**
```
1. اضافه کردن بررسی `exp` (expiration time) در تابع `get_current_user` در `app/dependencies/auth.py`. از کتابخانه `python-jose` برای decode و بررسی خودکار expiry استفاده شود.
```

### Step 15: اضافه کردن بررسی expiry به decode JWT
**Status:** `pending` (0%)
**Scope:** این بخش شامل تغییر کد در فایل‌های مرتبط با احراز هویت JWT است تا هنگام decode توکن، بررسی انقضا (expiry) به صورت صریح فعال شود. خارج از این بخش: تغییرات در endpointها، سرویس‌ها، یا منطق تجاری دیگر. نکته حیاتی: این تغییر باید در تمام مکان‌هایی که jwt.decode فراخوانی می‌شود اعمال گردد.
**Excerpt:**
```
**اضافه کردن بررسی expiry**

_قبل:_
```
payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
```

_بعد:_
```
payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_exp": True})
```
```

### Step 16: Implement Authorization for User Data Mutations
**Status:** `pending` (0%)
**Scope:** این بخش شامل پیاده‌سازی کامل مجوز (authorization) برای عملیات تغییر داده‌های کاربر (mutations) است. شامل شناسایی و مستندسازی ناسازگاری‌های دو طرف، تعیین ground truth و align کردن طرف دیگر، نوشتن integration test برای pipeline auth، و توضیح PR description. هیچ مرحله‌ای قبلاً انجام نشده و همه مراحل باقی‌مانده‌اند.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
کمترین ریسک؛ فقط توکن‌های منقضی شده را رد می‌کند

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 10
  id: abb63a39-5994-4a6c-a0a8-3b4f983b8777
  عنوان اصلی: Implement Authorization for User Data Mutations
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - هر دو طرف ناسازگاری شناسایی + فرض‌هایشان مستند شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - ground truth تعیین شد و طرف دیگر align شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - integration test برای pipeline `auth` بدون شکست عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/integration/test_auth_pipeline.py::test_auth_flow_completes", "timeout_seconds": 60}]
  - PR description توضیح می‌دهد چرا این تصمیم گرفته شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
```

### Step 17: بررسی اولیه خودکار و جلوگیری از پیاده‌سازی مجدد در بخش امنیت و احراز هویت
**Status:** `pending` (0%)
**Scope:** این بخش یک یادداشت هشداردهنده برای مدل اجراکننده است که قبل از هرگونه تغییر در repo باید بررسی کند آیا قابلیت‌های درخواستی قبلاً پیاده‌سازی شده‌اند یا خیر. شامل دستورالعمل‌هایی برای جستجو، تشخیص موارد تکراری، و مستندسازی عدم نیاز به تغییر است. این بخش مستقیماً به کد خاصی اشاره نمی‌کند بلکه فرآیند اجرا را هدایت می‌کند.
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

### Step 18: رفع ناقص بودن پوشش مجوزدهی برای تغییرات داده‌های کاربر
**Status:** `pending` (0%)
**Scope:** این مرحله به شناسایی و رفع نقاطی می‌پردازد که در آنها عملیات تغییر داده‌های کاربر (مانند ایجاد، ویرایش، حذف لیست‌ها و آیتم‌ها) بدون بررسی کامل مجوز انجام می‌شود. شامل بررسی مسیرهای lists و todo_items و سرویس‌های مربوطه است. خارج از این مرحله: احراز هویت JWT، مدیریت توکن، و مسائل امنیتی غیرمرتبط با مجوزدهی.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
[منطق] Incomplete Authorization Coverage for User Data Mutations

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
```

### Step 19: اعمال بررسی‌های مجوز (Authorization) بر روی تمامی endpointهای تغییردهنده داده‌های کاربر در pipeline auth
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اطمینان از استفاده صریح از وابستگی‌های FastAPI (مانند `get_current_user` و `get_current_active_user`) از فایل `app/dependencies/auth.py` در تمامی endpointهای مربوط به تغییر داده‌های کاربر (مانند به‌روزرسانی پروفایل، تغییر رمز عبور، حذف حساب) است. خارج از این scope، پیاده‌سازی منطق تجاری خود endpointها یا تغییر در سرویس احراز هویت (`AuthService`) قرار دارد. نکته حیاتی: این مرحله صرفاً بر روی endpointهای موجود در pipeline auth تمرکز دارد و فرض می‌کند که endpointهای مربوط به لیست‌ها و آیتم‌ها (`app/routes/lists.py`, `app/routes/todo_items.py`) قبلاً از طریق وابستگی‌های auth محافظت می‌شوند.
**Excerpt:**
```
Ensure that all API endpoints responsible for modifying user data (e.g., `/users/{user_id}`, `/me`) explicitly use FastAPI dependencies from `app/dependencies/auth.py` (like `get_current_user`, `get_current_active_user`, or custom role-based dependencies) to verify the requesting user's identity and permissions before allowing any changes. The `auth_service` should be designed to accept an authent
```

### Step 20: مستندسازی ناسازگاری‌ها و تعیین ground truth در احراز هویت
**Status:** `pending` (0%)
**Scope:** این مرحله شامل شناسایی و مستندسازی ناسازگاری‌های موجود بین دو طرف (احتمالاً بین سرویس‌ها یا ماژول‌های auth)، ثبت فرض‌های هر طرف، تعیین ground truth و هم‌راستا کردن طرف دیگر است. خروجی این مرحله یک سند یا کامیت است که تصمیمات را توضیح می‌دهد. خارج از scope: پیاده‌سازی کد جدید یا تغییر منطق.
— [merged] این مرحله شامل شناسایی و مستندسازی ناسازگاری‌های موجود بین دو طرف (احتمالاً backend و frontend یا بین سرویس‌ها) در pipeline احراز هویت است. فرض‌های هر طرف باید لیست شود، ground truth تعیین گردد و طرف دیگر با آن هماهنگ شود. خروجی این مرحله یک سند یا کامیت است که تصمیم نهایی را توضیح می‌دهد. این مرحله شامل پیاده‌سازی کد جدید نیست.
**Excerpt:**
```
- [ ] هر دو طرف ناسازگاری شناسایی + فرض‌هایشان مستند شد
- [ ] ground truth تعیین شد و طرف دیگر align شد
- [ ] integration test برای pipeline `auth` بدون شکست عبور می‌کند
- [ ] PR description توضیح می‌دهد چرا این تصمیم گرفته شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)
```

### Step 21: پیاده‌سازی احراز هویت برای endpointهای داشبورد
**Status:** `pending` (0%)
**Scope:** این بخش شامل پیاده‌سازی احراز هویت (JWT) برای endpointهای GET /api/tasks و GET /api/projects در مسیرهای app/routes/projects.py و app/routes/tasks.py است. همچنین شامل به‌روزرسانی فرانت‌اند Dashboard.jsx برای مدیریت خطای 401 (Not authenticated) می‌شود. endpointهای mutation کاربر (update profile, change password, assign role, delete account) خارج از این scope هستند و در تسک‌های دیگر بررسی می‌شوند.
**Excerpt:**
```
تسک 5 از 10
  id: e0a59d8d-978f-4d02-a649-70311aac5127
  عنوان اصلی: پیاده‌سازی احراز هویت برای endpointهای داشبورد
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/projects.py, app/routes/tasks.py, frontend/src/pages/Dashboard.jsx

📋 acceptance_criteria کامل:
  - GET /api/t [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/tasks", "headers": null, "json_body": null, "expected_status": 401, "required_fields": null, "json_contains": {"detail": "Not authenticated"}}]
```

### Step 22: افزودن احراز هویت و فیلتر کاربر به endpointهای Dashboard
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اصلاح دو endpoint بک‌اند (list_tasks و list_projects) برای دریافت user_id از توکن JWT و فیلتر کردن نتایج بر اساس آن است. همچنین شامل اصلاح فرانت‌اند (Dashboard.jsx) برای ارسال هدر Authorization با توکن JWT در درخواست‌های fetch می‌شود. خارج از scope: تغییرات در endpointهای دیگر، تغییر مدل‌های دیتابیس، یا اضافه کردن endpoint جدید.
**Excerpt:**
```
Dashboard از endpointهای بدون احراز هویت استفاده می‌کند

- `app/routes/tasks.py:129-134` — `list_tasks` — هیچ فیلتر user_id ندارد و نیاز به احراز هویت ندارد
  ```python
  @router.get("/api/tasks", tags=["tasks"])
  @router.get("/api/tasks/", tags=["tasks"])
  @handle_errors
  async def list_tasks(db: AsyncSession = Depends(get_db)) -> List[dict]:
      result = await db.execute(select(Task))
      return [_serialize(t) for t in result.scalars().all()]
  ```
- `app/routes/projects.py:51-56` — `list_projects` — همان مشکل: بدون فیلتر کاربر و بدون احراز هویت
  ```python
  @router.get("/api/projects", tags=["projects"])
  @router.get("/api/projects/", tags=["projects"])
  @handle_errors
  async def list_projects(db: AsyncSession = Depends(get_db)) -> List[dict]:
      result = await db.execute(select(Project))
      return [_serialize(p) for p in result.scalars().all()]
  ```
- `frontend/src/pages/Dashboard.jsx:30-55` — `fetchStats` — بدون هدر Authorization و بدون بررسی احراز هویت
  ```jsx
  const [tasksRes, projectsRes] = await Promise.all([
    fetch(`${API_BASE}/tasks`),
    fetch(`${API_BASE}/projects`),
  ]);
  ```
```

### Step 23: افزودن وابستگی احراز هویت به endpointهای tasks و projects و ارسال token از Dashboard
**Status:** `pending` (0%)
**Scope:** این مرحله شامل دو تغییر هماهنگ است: (1) در backend، وابستگی `get_current_user` به endpointهای GET در `app/routes/tasks.py` و `app/routes/projects.py` اضافه می‌شود تا فقط کاربران احراز هویت شده بتوانند داده‌ها را مشاهده کنند. (2) در frontend، کامپوننت `Dashboard.jsx` اصلاح می‌شود تا token ذخیره شده در `AuthContext` را در هدر Authorization درخواست‌های fetch به این endpointها ارسال کند. این مرحله شامل پیاده‌سازی redirect به صفحه لاگین در صورت عدم احراز هویت نیست (این مورد در scope نیست).
**Excerpt:**
```
کامپوننت Dashboard.jsx در خطوط 33-35 با استفاده از fetch(`${API_BASE}/tasks`) و fetch(`${API_BASE}/projects`) داده‌ها را دریافت می‌کند. این endpointها در backend (app/routes/tasks.py و app/routes/projects.py) هیچ وابستگی به get_current_user ندارند و تمام رکوردهای جدول را برمی‌گردانند. این یعنی هر کاربر (حتی بدون لاگین) می‌تواند تمام tasks و projects همه کاربران را ببیند. همچنین Dashboard هیچ بررسی احراز هویت یا redirect به صفحه لاگین ندارد.
```

### Step 24: افزودن وابستگی get_current_user به endpointهای GET /api/tasks و GET /api/projects و هدایت کاربر به لاگین در صورت عدم وجود توکن
**Status:** `pending` (0%)
**Scope:** این بخش شامل افزودن وابستگی get_current_user به endpointهای GET /api/tasks و GET /api/projects است تا فقط داده‌های کاربر جاری برگردد. همچنین شامل اصلاح Dashboard.jsx برای ارسال درخواست‌ها با هدر Authorization: Bearer <token> و هدایت کاربر به صفحه لاگین در صورت عدم وجود توکن می‌شود. خارج از scope: پیاده‌سازی get_current_user (فرض بر وجود آن در app/dependencies/auth.py است)، تغییرات در endpointهای دیگر، و تست‌های مربوط به احراز هویت.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] GET /api/t
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ۱. به endpointهای GET /api/tasks و GET /api/projects وابستگی get_current_user اضافه شود تا فقط داده‌های کاربر جاری برگردد. ۲. در Dashboard.jsx، درخواست‌ها با هدر Authorization: Bearer <token> ارسال شوند. ۳. اگر توکن وجود نداشت، کاربر به صفحه لاگین هدایت شود.
```

### Step 25: اضافه کردن وابستگی get_current_user به endpoint list_tasks و فیلتر کردن تسک‌ها بر اساس user_id
**Status:** `pending` (0%)
**Scope:** این مرحله شامل تغییر endpoint `list_tasks` در فایل `app/routes/lists.py` است. وابستگی `get_current_user` به پارامترهای تابع اضافه می‌شود و کوئری `select(Task)` با فیلتر `.where(Task.user_id == current_user.id)` محدود می‌شود. خارج از این مرحله: تغییرات در سایر endpointها، تغییرات در سرویس‌ها، یا تغییرات در schemaها.
**Excerpt:**
```
**اضافه کردن وابستگی get_current_user به list_tasks**

_قبل:_
```
async def list_tasks(db: AsyncSession = Depends(get_db)) -> List[dict]:
    result = await db.execute(select(Task))
```

_بعد:_
```
async def list_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[dict]:
    result = await db.execute(select(Task).where(Task.user_id == current_user.id))
```
```

### Step 26: اعتبارسنجی ورودی endpoint جستجوی tasks با رعایت احتیاط‌های پیش از merge
**Status:** `pending` (0%)
**Scope:** این بخش شامل ریسک‌ها و موارد احتیاط پیش از merge (اجرای تست‌های موجود برای جلوگیری از رگرشن) و acceptance_criteria کامل برای اعتبارسنجی ورودی endpoint جستجوی tasks است. خارج از scope: پیاده‌سازی خود اعتبارسنجی، تغییرات در فایل‌های غیرمرتبط، یا مراحل done شده قبلی.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

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
تسک 6 از 10
  id: a14e9ff3-686c-4641-8e2b-2ac5e2365374
  عنوان اصلی: اعتبارسنجی ورودی endpoint جستجوی tasks
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["E\\d{3}", "W\\d{3}", "error:", "warning:"], "files_hint": ["backend/**/*.py"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["error:", "note:", "warning:", "incompatible type"], "files_hint": ["backend/**/*.py"]}]
```

### Step 27: اعتبارسنجی ورودی در endpoint جستجوی tasks برای جلوگیری از SQL injection
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اضافه کردن اعتبارسنجی ورودی در endpoint جستجوی tasks (احتمالاً در app/routes/todo_items.py) برای جلوگیری از SQL injection است. خروجی این مرحله شامل پیاده‌سازی validation بر روی پارامترهای جستجو (مانند query string یا body) با استفاده از Pydantic schema یا کتابخانه‌های مشابه است. موارد خارج از scope شامل تغییرات در احراز هویت JWT، دسترسی کاربران، یا سایر endpointها می‌شود. نکته حیاتی: باید از کتابخانه‌های امن مانند SQLAlchemy با پارامترهای bind شده استفاده شود و از concatenation مستقیم رشته‌ها جلوگیری گردد.
**Excerpt:**
```
عدم اعتبارسنجی ورودی در endpoint جستجوی tasks (SQL injection potential)

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
تقویت جامع امنیت و احراز هویت (JWT، دسترسی و داده‌های کاربر)
```

### Step 28: رفع آسیب‌پذیری SQL Injection در endpoint جستجوی tasks با parameterize کردن query string
**Status:** `pending` (0%)
**Scope:** این مرحله فقط به بررسی و اصلاح endpoint `GET /api/tasks/search?q=...` در `app/routes/tasks.py` و تابع `search_tasks` در `app/services/planner_service.py` می‌پردازد. هدف اطمینان از این است که query string ورودی به صورت parameterized به SQLAlchemy پاس داده شود و مستقیماً در query string الحاق نشود. این مرحله شامل بازنویسی تابع جستجو برای استفاده از `.ilike()` با bind parameters است. سایر endpointها یا سرویس‌ها خارج از این scope هستند.
**Excerpt:**
```
در `app/routes/tasks.py`، endpoint `GET /api/tasks/search?q=...` از تابع `search_tasks` در `app/services/planner_service.py` استفاده می‌کند. اگرچه ادعا شده که از SQLAlchemy .ilike() استفاده می‌شود، اما بررسی دقیق کد نشان می‌دهد که query string مستقیماً به یک تابع خارجی پاس داده می‌شود و ممکن است sanitize نشود. این می‌تواند منجر به SQL injection شود اگر query string به درستی parameterize نشده باشد.
```

### Step 29: ایمن‌سازی query string در search_tasks با parameterized query
**Status:** `pending` (0%)
**Scope:** این مرحله شامل تغییر کد در endpoint جستجوی تسک‌ها (احتمالاً در app/routes/todo_items.py یا app/services/todo_item_service.py) برای استفاده از parameterized query به جای string concatenation است. همچنین شامل افزودن sanitization اولیه برای حذف کاراکترهای خطرناک از ورودی کاربر می‌شود. خارج از scope: تغییرات در احراز هویت JWT، دسترسی‌ها، یا سایر endpointها.
**Excerpt:**
```
1. بررسی و اطمینان از اینکه query string در `search_tasks` با استفاده از parameterized query (مثلاً `text()` با bind parameters) به دیتابیس ارسال می‌شود. اضافه کردن sanitization اولیه برای حذف کاراکترهای
```

### Step 30: تقویت امضای پیش‌فرض HMAC وب‌هوک
**Status:** `pending` (0%)
**Scope:** این بخش شامل اجرای تسک 7 از 10 با عنوان 'Strengthen Webhook HMAC signature default secret' است. هدف آن تقویت امنیت امضای HMAC وب‌هوک با تغییر یا بهبود مقدار پیش‌فرض secret است. این تسک مستقل بوده و وابستگی به تسک‌های دیگر ندارد. تغییرات باید بدون شکستن تست‌های موجود، عبور از linter و type-check انجام شود.
**Excerpt:**
```
تسک 7 از 10
  id: 65f936fd-9d37-4f9e-a52d-559a13d4be7f
  عنوان اصلی: Strengthen Webhook HMAC signature default secret
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_webhook.py", "timeout_seconds": 60}]
  - linter بدون warning عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_lint.py", "timeout_seconds": 60}]
  - type-check موفق است [verify_method=backend_test] [verify_plan={"test_node": "tests/test_types.py", "timeout_seconds": 60}]
```

### Step 31: رفع آسیب‌پذیری HMAC signature verification با secret پیش‌فرض ضعیف
**Status:** `pending` (0%)
**Scope:** این بخش به بررسی و اصلاح مکانیزم تأیید امضای HMAC در webhookها می‌پردازد که از یک secret پیش‌فرض ضعیف استفاده می‌کند. شامل شناسایی محل‌های استفاده از HMAC در کد، جایگزینی secret پیش‌فرض با یک مقدار امن (مثلاً از متغیر محیطی)، و اطمینان از عدم fallback به مقدار پیش‌فرض است. خارج از scope: پیاده‌سازی webhook جدید، تغییر پروتکل احراز هویت JWT، یا تغییر در ساختار دیتابیس.
**Excerpt:**
```
Webhook HMAC signature verification با secret پیش‌فرض ضعیف

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
تقویت جامع امنیت و احراز هویت (JWT، دسترسی و داده‌های کاربر)
```

### Step 32: بررسی و اصلاح تابع _webhook_secret() در app/routes/webhook.py برای استفاده از متغیر محیطی
**Status:** `pending` (0%)
**Scope:** این بخش به بررسی و اصلاح تابع _webhook_secret() در فایل app/routes/webhook.py می‌پردازد که از os.environ.get برای دریافت راز وب‌هوک استفاده می‌کند. شامل اطمینان از وجود متغیر محیطی، مدیریت خطا در صورت عدم وجود، و احتمالاً بهبود امنیت با استفاده از config مرکزی است. خارج از scope: تغییرات در سایر فایل‌ها، پیاده‌سازی JWT، یا احراز هویت کاربر.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست 
[auto-re-registered from github_import at 2026-05-20T04:25:49.854717+00:00]

## 🧱 پشتهٔ فناوری و معماری
Stack: fastapi, react, vite.

## 🔍 Context و وضعیت فعلی
در `app/routes/webhook.py`، تابع `_webhook_secret()` از `os.environ.get
```

### Step 33: اعمال معیارهای پذیرش و تضمین پایداری کد
**Status:** `pending` (0%)
**Scope:** این بخش شامل معیارهای پذیرش (AC) برای هر تغییری است که در پروژه اعمال می‌شود. هدف اطمینان از عدم شکست تست‌های موجود، عبور از linter و type-checker است. این بخش به‌تنهایی شامل پیاده‌سازی هیچ قابلیت جدیدی نیست، بلکه یک لایه تضمین کیفیت برای تمام تغییرات بعدی است. نکته حیاتی: هر تغییری باید قبل از commit این ACها را پاس کند.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
_(مجری بر اساس Context و معیارهای پذیرش، مراحل را تعیین کند)_

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 34: رفع ناسازگاری شرطی / فرضیه‌های کهنه در وابستگی‌های احراز هویت
**Status:** `pending` (0%)
**Scope:** این بخش شامل تحلیل و رفع anti-pattern مربوط به ناسازگاری شرطی (conditional inconsistency) یا فرضیه‌های کهنه (stale assumption) در فایل app/dependencies/auth.py است. همچنین شامل نوشتن تست edge case برای نوع ناسازگاری (type mismatch) و اضافه کردن کامنت توجیهی در صورت عدم تغییر کد می‌شود. خارج از scope: تغییرات در سایر فایل‌ها، بازنویسی کامل منطق احراز هویت.
**Excerpt:**
```
تسک 8 از 10
  id: 67d08afa-26f1-44d0-9892-c0ae5c9aae24
  عنوان اصلی: Address conditional inconsistency / stale assumption
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/dependencies/auth.py

📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=manual_only]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static]
  - تست edge case نوشته شد [verify_method=backend_test]
```

### Step 35: رفع Anti-pattern: Conditional inconsistency / Stale assumption در app/dependencies/auth.py:15
**Status:** `pending` (0%)
**Scope:** این بخش صرفاً به شناسایی یک anti-pattern (ناسازگاری شرطی / فرض کهنه) در خط 15 فایل app/dependencies/auth.py اشاره دارد. هیچ جزئیات اجرایی، کد، یا راه‌حل مشخصی ارائه نمی‌دهد. این یک اشاره به یک مشکل ساختاری است، نه یک وظیفه قابل اجرا. خارج از این محدوده، هیچ فایل، کلاس یا منطق دیگری تحت تأثیر قرار نمی‌گیرد.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
Anti-pattern: Conditional inconsistency / Stale assumption

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/dependencies/auth.py:15`

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
```

### Step 36: رفع ناسازگاری نوع بازگشتی get_current_user با نوع ورودی توابع وابسته
**Status:** `pending` (0%)
**Scope:** این بخش به رفع ناسازگاری type hint بین تابع get_current_user (که User برمی‌گرداند) و توابع get_current_active_user و get_current_admin_user (که OAuthUser دریافت می‌کنند) در فایل app/dependencies/auth.py می‌پردازد. خارج از scope: تغییر منطق احراز هویت، تغییر مدل‌های User یا OAuthUser، یا تغییر سایر فایل‌ها.
**Excerpt:**
```
The `get_current_user` function is type-hinted to return `User`, but its dependent functions (`get_current_active_user`, `get_current_admin_user`) are type-hinted to receive `OAuthUser`. This creates a type mismatch. If `User` and `OAuthUser` are distinct models and `User` does not possess the `status` or `email` attributes expected by `OAuthUser`, this will lead to runtime `AttributeError`s when 

📁 file: app/dependencies/auth.py (line 15)

🎯 پیشنهاد: این الگو معمولاً منطق سیستم را در شرایط لبه می‌شکند.
```

### Step 37: تشخیص و اصلاح anti-pattern در منطق احراز هویت و اضافه کردن guard/comment
**Status:** `pending` (0%)
**Scope:** این بخش بر بازنگری منطق موجود در نقطه‌ای از کد که anti-pattern ریشه‌ای در آن تشخیص داده شده تمرکز دارد. شامل اضافه کردن guard یا کامنت توجیهی، نوشتن تست edge case، و اطمینان از عبور تمام تست‌ها، linter و type-check است. خروجی مورد انتظار تغییر کد در فایل‌های مرتبط و یک commit/PR جدید است. این بخش به فایل‌های app/dependencies/auth.py و احتمالاً app/services/__init__.py مربوط می‌شود.
**Excerpt:**
```
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
```

### Step 38: تسک 9 از 10: بهینه‌سازی JWT Payload و امنیت
**Status:** `pending` (0%)
**Scope:** این بخش شامل شناسایی و مستندسازی ناسازگاری‌های دو طرف (احتمالاً بین payload JWT و نحوه استفاده از آن در سرویس‌ها)، تعیین ground truth و تطبیق طرف دیگر، اجرای تست یکپارچه‌سازی pipeline احراز هویت، و توضیح تصمیمات در PR description است. فایل‌های دخیل مشخص نیستند اما احتمالاً app/dependencies/auth.py و app/services/__init__.py مرتبط هستند. نکته حیاتی: acceptance_criteria شامل 4 آیتم explicit است که همگی باید انجام شوند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - هر دو طرف ناسازگاری شناسایی + فرض‌هایشان مستند شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - ground truth تعیین شد و طرف دیگر align شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - integration test برای pipeline `auth` بدون شکست عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/integration/test_auth_pipeline.py::test_jwt_creation_and_validation", "timeout_seconds": 60}]
  - PR description توضیح می‌دهد چرا این تصمیم گرفته شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
```

### Step 39: اعمال حداقل‌سازی صریح payload در JWT و رعایت بهترین شیوه‌های امنیتی
**Status:** `pending` (0%)
**Scope:** این مرحله شامل بازبینی و اصلاح payload توکن‌های JWT در پروژه برای حذف فیلدهای غیرضروری (مانند role, email, full_name) و نگهداری فقط شناسه کاربر (sub) و زمان‌های استاندارد (iat, exp) است. همچنین شامل اعمال best practices مانند امضای قوی (HS256/RS256)، تنظیم expiry کوتاه‌مدت، و عدم ذخیره‌سازی اطلاعات حساس در payload می‌شود. فایل‌های مرتبط: app/dependencies/auth.py (ساخت و اعتبارسنجی JWT) و app/config.py (تنظیمات JWT). خارج از scope: تغییر مکانیزم احراز هویت (مانند تغییر از JWT به session) یا بازنویسی کامل سیستم auth.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
[منطق] Lack of Explicit JWT Payload Minimization and Security Best Practices

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
تقویت جامع امنیت و احراز هویت (JWT، دسترسی و داده‌های کاربر)
```

### Step 40: رفع ناسازگاری منطقی در JWT payload و بهبود امنیت ذخیره‌سازی توکن در pipeline auth
**Status:** `pending` (0%)
**Scope:** این بخش شامل اصلاح JWT payload در app/services/auth_service.py برای حداقلی‌سازی داده‌های حساس و بازبینی مکانیزم ذخیره‌سازی توکن در frontend/src/context/AuthContext است. موارد خارج از scope: پیاده‌سازی کامل revocation، HTTPS enforcement، و تغییرات در middleware. نکته حیاتی: باید بررسی شود که آیا این بخش قبلاً در auto-re-registered از github_import پیاده‌سازی شده است.
**Excerpt:**
```
در pipeline `auth` یک ناسازگاری منطقی پیدا شد:

`app/services/auth_service.py` is responsible for JWT creation. While it's standard to include some user information (like ID, roles) in the JWT payload, the description doesn't explicitly state that the payload is minimized to only essential, non-sensitive data required by the client. Additionally, the security practices around JWTs (e.g., short expiration times, revocation mechanisms, 'httpOnly' cookies for tokens if applicable, HTTPS enforcement) are not detailed. `frontend/src/context/AuthCo

Overly verbose JWT payloads can expose internal system details or sensitive user information to the client, even if signed. Long-lived tokens, lack of revocation, or storage in `localStorage` without robust XSS protection can lead to session hijacking if an attacker gains access to the token.

Ensure JWT payloads contain only the absolute minimum information necessary for client-side operations (e.g., user ID, roles, expiration). Avoid sensitive data. While `localStorage` is common, consider alternatives like `httpOnly` cookies for enhanced security against XSS, especially for access tokens. If `localStorage` is used, ensure strong Content Security Policy (CSP) and other XSS prevention
```

### Step 41: حذف متغیر محیطی بلااستفاده ACCESS_TOKEN_EXPIRE_MINUTES
**Status:** `pending` (0%)
**Scope:** این مرحله شامل حذف کامل متغیر محیطی ACCESS_TOKEN_EXPIRE_MINUTES از تمام کدهای پایتون و جاوااسکریپت/تایپ‌اسکریپت، حذف از فایل .env.example و deployment configs، و در صورت نیاز چرخش (rotate) آن به عنوان یک secret است. خارج از scope: تغییرات در منطق احراز هویت JWT، پیاده‌سازی revoke یا httpOnly cookie.
— [merged] این بخش شامل حذف متغیر محیطی ACCESS_TOKEN_EXPIRE_MINUTES از کد و فایل‌های پیکربندی است. خارج از این بخش: تغییرات در منطق احراز هویت، JWT، یا سایر متغیرهای محیطی. نکته حیاتی: باید مطمئن شویم این متغیر در هیچ جای دیگری از پروژه استفاده نشده است.
**Excerpt:**
```
تسک 10 از 10
  id: 8efa28de-c550-4187-9dcc-298d7f901276
  عنوان اصلی: حذف متغیر محیطی بلااستفاده ACCESS_TOKEN_EXPIRE_MINUTES
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - `ACCESS_TOKEN_EXPIRE_MINUTES` در هیچ کدی خوانده نمی‌شود (تأیید شده) [verify_method=static] [verify_plan={"grep_patterns": ["os.getenv\(['\"]ACCESS_TOKEN_EXPIRE_MINUTES['\"]\)", "process.env.ACCESS_TOKEN_EXPIRE_MINUTES"], "files_hint": ["**/*.py", "**/*.js", "**/*.ts"]}]
  - از `.env.example` و deployment configs حذف شد [verify_method=static] [verify_plan={"grep_patterns": ["ACCESS_TOKEN_EXPIRE_MINUTES"], "files_hint": [".env.example", "deployment/config/*"]}]
  - اگر secret بوده، rotate شد و در deployment new value تنظیم شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
```

### Step 42: رفع عدم تطابق متغیر محیطی ACCESS_TOKEN_EXPIRE_MINUTES در کد
**Status:** `pending` (0%)
**Scope:** این مرحله شامل شناسایی و رفع مشکل متغیر محیطی ACCESS_TOKEN_EXPIRE_MINUTES است که در فایل‌های .env و config تعریف شده اما در هیچ کجای کد خوانده نمی‌شود. تمرکز بر فایل app/config.py و جستجوی سراسری برای یافتن محل صحیح استفاده از این متغیر است. خارج از scope این مرحله، تغییر در منطق احراز هویت یا JWT است.
**Excerpt:**
```
env var `ACCESS_TOKEN_EXPIRE_MINUTES` در `.env`/config تعریف شده ولی در هیچ `os.getenv` یا `process.env` خوانده نمی‌شود.

## 🤔 چرا مهم است
یا (الف) reader حذف شده و باعث config drift می‌شود، یا (ب) leak اطلاعات حساس به repository است (مخصوصاً اگر secret است).

## 🔍 جزئیات
- علت: documented in .env.example/README but not used in code
```

### Step 43: حذف کامل متغیر ACCESS_TOKEN_EXPIRE_MINUTES از کدبیس و پیکربندی‌ها
**Status:** `pending` (0%)
**Scope:** این مرحله شامل جستجوی کامل کدبیس، فایل‌های پیکربندی CI/CD، Dockerfile و فایل‌های محیطی (.env.example, deployment configs) برای یافتن و حذف تمام ارجاعات به ACCESS_TOKEN_EXPIRE_MINUTES است. همچنین شامل چرخش (rotate) secret در صورت وجود و تنظیم مقدار جدید در deployment می‌شود. خارج از scope: تغییر منطق احراز هویت یا پیاده‌سازی مکانیزم جایگزین.
**Excerpt:**
```
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` در هیچ کدی خوانده نمی‌شود (تأیید شده)
- [ ] از `.env.example` و deployment configs حذف شد
- [ ] اگر secret بوده، rotate شد و در deployment new value تنظیم شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `ACCESS_TOKEN_EXPIRE_MINUTES` در همه کدبیس + CI configs + Dockerfile.
```

### Step 44: بررسی جامع مصرف متغیرهای محیطی در CI/CD pipeline، Dockerfile و Render config برای جلوگیری از miss شدن در grep
**Status:** `pending` (0%)
**Scope:** این بخش شامل بررسی کامل و دستی تمام نقاط مصرف متغیرهای محیطی (env vars) در CI/CD pipeline، Dockerfile و Render config است. تمرکز بر روی اطمینان از اینکه grep روی کد به تنهایی کافی نیست و باید تمامی کانفیگ‌های خارج از کد نیز چک شوند. هیچ تغییری در کد ایجاد نمی‌شود، فقط بازبینی و مستندسازی نقاط مصرف انجام می‌گیرد. فایل‌های تحت بررسی: app/config.py, app/database.py, app/middleware.py, app/dependencies/auth.py و هر فایل CI/CD یا Dockerfile موجود در پروژه.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
اگر env var در CI/CD pipeline یا Dockerfile/Render config مصرف می‌شود، grep فقط روی کد ممکن است miss کند. حتماً همه‌جا چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: cleanup
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)
```
