---
task_id: task_3ed5aa5e7332
title: شناسایی و حذف Endpointهای بلااستفاده بک‌اند
type: other
priority: high
execution_priority: 100
status: done
external_status: pending
verification_status: done
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-26T23:26:23.150681+00:00'
updated_at: '2026-05-27T17:10:19.044095+00:00'
archived: true
archived_at: '2026-05-27T17:10:19.044093+00:00'
tags:
- consolidated
- post_verify_merge
---

# شناسایی و حذف Endpointهای بلااستفاده بک‌اند

## Raw Idea

🧬 این یک تسک تلفیقی است — از 7 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این خوشه به صورت سیستمی به شناسایی، بازبینی و حذف endpointهای API بلااستفاده یا مرده در سرویس‌های مختلف بک‌اند می‌پردازد که منجر به بهبود نگهداری کد و کاهش سطح حمله می‌شود.
🎯 theme: شناسایی و حذف Endpointهای بلااستفاده بک‌اند
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 7
  id: 7eb3c581-9ee4-468e-9498-b6496872b131
  عنوان اصلی: حذف مسیر /api/search از tasks.py
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/tasks.py

📋 acceptance_criteria کامل:
  - مسیر /api/search دیگر 200 برنمی‌گرداند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/search", "headers": null, "json_body": null, "expected_status": 404, "required_fields": null, "json_contains": null}]
  - مسیر /api/tasks/search همچنان کار می‌کند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/tasks/search", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["tasks"], "json_contains": null}]
  - هیچ کلاینتی از /api/search استفاده نمی‌کند [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
ناسازگاری در مسیرهای API: /api/search در tasks.py با هیچ endpoint دیگری همخوانی ندارد

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:95-96` — `search_tasks_endpoint` — مسیر /api/search در این router تعریف شده اما mount نشده است
  ```python
  @router.get("/api/tasks/search", tags=["tasks"])
  @router.get("/api/search", tags=["tasks"])
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
FastAPI router با prefix خالی mount شده

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/main.py` (سطر 364) — محل mount شدن routerها
- `docs/API.md` (سطر 28) — مستندات API که این مسیر را ثبت کرده
- `app/database.py` — `tasks.py` این فایل را import می‌کند
- `app/middleware.py` — `tasks.py` این فایل را import می‌کند
- `app/models/task.py` — `tasks.py` این فایل را import می‌کند
- `app/schemas/task_schema.py` — `tasks.py` این فایل را import می‌کند
- `app/routes/__init__.py` — این فایل `tasks.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مسیر فقط در tasks.py و docs/API.md وجود دارد و frontend از آن استفاده نمی‌کند

## 🔍 Context و وضعیت فعلی
در app/routes/tasks.py خط 96، یک مسیر GET /api/search تعریف شده که alias برای /api/tasks/search است. این مسیر در docs/API.md ثبت شده اما در app/main.py هیچ include_router متناظری ندارد که این مسیر را mount کند. router tasks با prefix خالی mount شده (خط 364 main.py) و مسیرهای /api/tasks/... کار می‌کنند، اما /api/search یک مسیر سطح بالا است که با هیچ router دیگری تطابق ندارد. این باعث 404 برای کلاینت‌هایی می‌شود که سعی می‌کنند از /api/search استفاده کنند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مسیر /api/search دیگر 200 برنمی‌گرداند
- [ ] مسیر /api/tasks/search همچنان کار می‌کند
- [ ] هیچ کلاینتی از /api/search استفاده نمی‌کند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. مسیر /api/search را از tasks.py حذف کنید یا یک router جداگانه برای آن ایجاد کنید و در main.py mount کنید. ترجیحاً حذف شود چون docs/API.md آن را به عنوان alias معرفی کرده و frontend از آن استفاده نمی‌کند.

## 💡 نمونه‌های قبل/بعد
**حذف مسیر اضافی**

_قبل:_
```
@router.get("/api/tasks/search", tags=["tasks"])
@router.get("/api/search", tags=["tasks"])
```

_بعد:_
```
@router.get("/api/tasks/search", tags=["tasks"])
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/api/search`
- `curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/api/tasks/search?q=test`

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
تسک 2 از 7
  id: 43280a1a-7bdd-41b3-9b98-c6d198e6fe3b
  عنوان اصلی: بررسی و اقدام در مورد endpoint بلااستفاده GET /api/health
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/main.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `GET /api/health` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 404, "required_fields": null, "json_contains": null}]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["- /api/health", "def test_health", "router.get(\"/health\""], "files_hint": ["openapi.yaml", "swagger.json", "tests/", "app/main.py"]}]

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
endpoint بک‌اند بلااستفاده: GET /api/health

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/main.py`

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

- `app/middleware.py` — `main.py` این فایل را import می‌کند
- `app/config.py` — `main.py` این فایل را import می‌کند
- `config/settings.py` — `main.py` این فایل را import می‌کند
- `app/database.py` — `main.py` این فایل را import می‌کند
- `main.py` — این فایل `main.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
endpoint `GET /api/health` در `app/main.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `GET`
- path: `/api/health`
- فایل: `app/main.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `GET /api/health` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/api/health` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
گام ۲: اگر internal است، در README یا OpenAPI tag `internal` بزن.
گام ۳: اگر منسوخ است، حذف کن (شامل تست‌ها).

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/main.py`
- `ruff check app/main.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 7
  id: 97f4adbb-3347-43d6-977c-439c94daf969
  عنوان اصلی: تعیین وضعیت endpoint بلااستفاده: GET /auth/google
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/auth_google.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `GET /auth/google` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=static] [verify_plan={"grep_patterns": ["def google_auth_callback", "router.get(\"/auth/google\""], "files_hint": ["app/routes/auth_google.py"]}]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["test_auth_google", "/auth/google:"], "files_hint": ["tests/", "openapi.yaml", "swagger.json"]}]

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
endpoint بک‌اند بلااستفاده: GET /auth/google

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/auth_google.py`

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

- `app/database.py` — `auth_google.py` این فایل را import می‌کند
- `app/services/google_auth.py` — `auth_google.py` این فایل را import می‌کند
- `app/dependencies/auth.py` — `auth_google.py` این فایل را import می‌کند
- `app/models/user_oauth.py` — `auth_google.py` این فایل را import می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
endpoint `GET /auth/google` در `app/routes/auth_google.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `GET`
- path: `/auth/google`
- فایل: `app/routes/auth_google.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `GET /auth/google` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/auth/google` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
گام ۲: اگر internal است، در README یا OpenAPI tag `internal` بزن.
گام ۳: اگر منسوخ است، حذف کن (شامل تست‌ها).

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/routes/auth_google.py`
- `ruff check app/routes/auth_google.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 7
  id: 7b202e2d-f763-4cd0-82bd-9d026facbbd5
  عنوان اصلی: رسیدگی به endpoint بلااستفاده: PATCH /{integration_id}
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/routes/integrations.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `PATCH /{integration_id}` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=static] [verify_plan={"grep_patterns": ["app.patch(\"/{integration_id}\")"], "files_hint": ["app/routes/integrations.py"]}]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["def test_patch_integration", "client.patch('/api/integrations/", "/integrations/{integration_id}:", "  patch:"], "files_hint": ["tests/routes/test_integrations.py", "openapi.yaml"]]

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
endpoint بک‌اند بلااستفاده: PATCH /{integration_id}

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/integrations.py`

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

- `app/database.py` — `integrations.py` این فایل را import می‌کند
- `app/schemas/integration_schema.py` — `integrations.py` این فایل را import می‌کند
- `app/services/integration_service.py` — `integrations.py` این فایل را import می‌کند
- `app/models/user.py` — `integrations.py` این فایل را import می‌کند
- `app/routes/__init__.py` — این فایل `integrations.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
endpoint `PATCH /{integration_id}` در `app/routes/integrations.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `PATCH`
- path: `/{integration_id}`
- فایل: `app/routes/integrations.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `PATCH /{integration_id}` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/{integration_id}` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
گام ۲: اگر internal است، در README یا OpenAPI tag `internal` بزن.
گام ۳: اگر منسوخ است، حذف کن (شامل تست‌ها).

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/routes/integrations.py`
- `ruff check app/routes/integrations.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 7
  id: c746c13c-67ac-4d6b-ace8-1319c37a824e
  عنوان اصلی: رسیدگی به endpoint بک‌اند بلااستفاده: GET /api/lists/{list_id}
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/lists.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `GET /api/lists/{list_id}` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=static] [verify_plan={"grep_patterns": ["@router.get(\"/lists/{list_id}\")", "def get_list_by_id"], "files_hint": ["app/routes/lists.py"]}]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
endpoint بک‌اند بلااستفاده: GET /api/lists/{list_id}

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/lists.py`

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

- `app/database.py` — `lists.py` این فایل را import می‌کند
- `app/middleware.py` — `lists.py` این فایل را import می‌کند
- `app/schemas/todo_item_schema.py` — `lists.py` این فایل را import می‌کند
- `app/schemas/todo_list_schema.py` — `lists.py` این فایل را import می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
endpoint `GET /api/lists/{list_id}` در `app/routes/lists.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `GET`
- path: `/api/lists/{list_id}`
- فایل: `app/routes/lists.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `GET /api/lists/{list_id}` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/api/lists/{list_id}` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
گام ۲: اگر internal است، در README یا OpenAPI tag `internal` بزن.
گام ۳: اگر منسوخ است، حذف کن (شامل تست‌ها).

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/routes/lists.py`
- `ruff check app/routes/lists.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 6 از 7
  id: c35d2627-d972-47c2-8f42-aa6a713f8c66
  عنوان اصلی: تعیین تکلیف endpoint بلااستفاده PATCH /{notification_id}/read
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/notifications.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `PATCH /{notification_id}/read` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=static] [verify_plan={"grep_patterns": ["-(?!.*@app\\.patch\\('/{notification_id}/read'\\))", "internal_tag_or_decorator_pattern"], "files_hint": ["app/routes/notifications.py", "frontend/**/*.js", "frontend/**/*.ts", "fr]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["-(?!.*patch:)", "-(?!.*notification_id)", "-(?!.*read:)"], "files_hint": ["tests/test_notifications.py", "openapi.yaml", "swagger.json"]}]

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
endpoint بک‌اند بلااستفاده: PATCH /{notification_id}/read

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/notifications.py`

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

- `app/database.py` — `notifications.py` این فایل را import می‌کند
- `app/schemas/notification_schema.py` — `notifications.py` این فایل را import می‌کند
- `app/services/notification_service.py` — `notifications.py` این فایل را import می‌کند
- `app/models/user.py` — `notifications.py` این فایل را import می‌کند
- `app/routes/__init__.py` — این فایل `notifications.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
endpoint `PATCH /{notification_id}/read` در `app/routes/notifications.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `PATCH`
- path: `/{notification_id}/read`
- فایل: `app/routes/notifications.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `PATCH /{notification_id}/read` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/{notification_id}/read` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
گام ۲: اگر internal است، در README یا OpenAPI tag `internal` بزن.
گام ۳: اگر منسوخ است، حذف کن (شامل تست‌ها).

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/routes/notifications.py`
- `ruff check app/routes/notifications.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 7
  id: 30d713d5-62c6-485d-9de5-040d9900f29d
  عنوان اصلی: رسیدگی به endpoint بلااستفاده GET /api/projects/{project_id}
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/projects.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `GET /api/projects/{project_id}` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/projects/123", "headers": null, "json_body": null, "expected_status": 404, "required_fields": null, "json_contains": null}]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["def test_get_project_by_id", "/api/projects/{project_id}:"], "files_hint": ["tests/test_projects.py", "openapi.yaml", "openapi.json"]}]

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
endpoint بک‌اند بلااستفاده: GET /api/projects/{project_id}

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/projects.py`

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

- `app/database.py` — `projects.py` این فایل را import می‌کند
- `app/middleware.py` — `projects.py` این فایل را import می‌کند
- `app/models/project.py` — `projects.py` این فایل را import می‌کند
- `app/schemas/project_schema.py` — `projects.py` این فایل را import می‌کند
- `app/routes/__init__.py` — این فایل `projects.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
endpoint `GET /api/projects/{project_id}` در `app/routes/projects.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `GET`
- path: `/api/projects/{project_id}`
- فایل: `app/routes/projects.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `GET /api/projects/{project_id}` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/api/projects/{project_id}` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
گام ۲: اگر internal است، در README یا OpenAPI tag `internal` بزن.
گام ۳: اگر منسوخ است، حذف کن (شامل تست‌ها).

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/routes/projects.py`
- `ruff check app/routes/projects.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
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
- در commit message: `merged-from: 7eb3c581-9ee4-468e-9498-b6496872b131, 43280a1a-7bdd-41b3-9b98-c6d198e6fe3b, 97f4adbb-3347-43d6-977c-439c94daf969, 7b202e2d-f763-4cd0-82bd-9d026facbbd5, c746c13c-67ac-4d6b-ace8-1319c37a824e, c35d2627-d972-47c2-8f42-aa6a713f8c66, 30d713d5-62c6-485d-9de5-040d9900f29d`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 7 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این خوشه به صورت سیستمی به شناسایی، بازبینی و حذف endpointهای API بلااستفاده یا مرده در سرویس‌های مختلف بک‌اند می‌پردازد که منجر به بهبود نگهداری کد و کاهش سطح حمله می‌شود.
🎯 theme: شناسایی و حذف Endpointهای بلااستفاده بک‌اند
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 7
  id: 7eb3c581-9ee4-468e-9498-b6496872b131
  عنوان اصلی: حذف مسیر /api/search از tasks.py
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/tasks.py

📋 acceptance_criteria کامل:
  - مسیر /api/search دیگر 200 برنمی‌گرداند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/search", "headers": null, "json_body": null, "expected_status": 404, "required_fields": null, "json_contains": null}]
  - مسیر /api/tasks/search همچنان کار می‌کند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/tasks/search", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["tasks"], "json_contains": null}]
  - هیچ کلاینتی از /api/search استفاده نمی‌کند [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
ناسازگاری در مسیرهای API: /api/search در tasks.py با هیچ endpoint دیگری همخوانی ندارد

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:95-96` — `search_tasks_endpoint` — مسیر /api/search در این router تعریف شده اما mount نشده است
  ```python
  @router.get("/api/tasks/search", tags=["tasks"])
  @router.get("/api/search", tags=["tasks"])
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
FastAPI router با prefix خالی mount شده

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/main.py` (سطر 364) — محل mount شدن routerها
- `docs/API.md` (سطر 28) — مستندات API که این مسیر را ثبت کرده
- `app/database.py` — `tasks.py` این فایل را import می‌کند
- `app/middleware.py` — `tasks.py` این فایل را import می‌کند
- `app/models/task.py` — `tasks.py` این فایل را import می‌کند
- `app/schemas/task_schema.py` — `tasks.py` این فایل را import می‌کند
- `app/routes/__init__.py` — این فایل `tasks.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مسیر فقط در tasks.py و docs/API.md وجود دارد و frontend از آن استفاده نمی‌کند

## 🔍 Context و وضعیت فعلی
در app/routes/tasks.py خط 96، یک مسیر GET /api/search تعریف شده که alias برای /api/tasks/search است. این مسیر در docs/API.md ثبت شده اما در app/main.py هیچ include_router متناظری ندارد که این مسیر را mount کند. router tasks با prefix خالی mount شده (خط 364 main.py) و مسیرهای /api/tasks/... کار می‌کنند، اما /api/search یک مسیر سطح بالا است که با هیچ router دیگری تطابق ندارد. این باعث 404 برای کلاینت‌هایی می‌شود که سعی می‌کنند از /api/search استفاده کنند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مسیر /api/search دیگر 200 برنمی‌گرداند
- [ ] مسیر /api/tasks/search همچنان کار می‌کند
- [ ] هیچ کلاینتی از /api/search استفاده نمی‌کند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. مسیر /api/search را از tasks.py حذف کنید یا یک router جداگانه برای آن ایجاد کنید و در main.py mount کنید. ترجیحاً حذف شود چون docs/API.md آن را به عنوان alias معرفی کرده و frontend از آن استفاده نمی‌کند.

## 💡 نمونه‌های قبل/بعد
**حذف مسیر اضافی**

_قبل:_
```
@router.get("/api/tasks/search", tags=["tasks"])
@router.get("/api/search", tags=["tasks"])
```

_بعد:_
```
@router.get("/api/tasks/search", tags=["tasks"])
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/api/search`
- `curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/api/tasks/search?q=test`

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
تسک 2 از 7
  id: 43280a1a-7bdd-41b3-9b98-c6d198e6fe3b
  عنوان اصلی: بررسی و اقدام در مورد endpoint بلااستفاده GET /api/health
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/main.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `GET /api/health` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 404, "required_fields": null, "json_contains": null}]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["- /api/health", "def test_health", "router.get(\"/health\""], "files_hint": ["openapi.yaml", "swagger.json", "tests/", "app/main.py"]}]

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
endpoint بک‌اند بلااستفاده: GET /api/health

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/main.py`

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

- `app/middleware.py` — `main.py` این فایل را import می‌کند
- `app/config.py` — `main.py` این فایل را import می‌کند
- `config/settings.py` — `main.py` این فایل را import می‌کند
- `app/database.py` — `main.py` این فایل را import می‌کند
- `main.py` — این فایل `main.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
endpoint `GET /api/health` در `app/main.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `GET`
- path: `/api/health`
- فایل: `app/main.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `GET /api/health` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/api/health` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
گام ۲: اگر internal است، در README یا OpenAPI tag `internal` بزن.
گام ۳: اگر منسوخ است، حذف کن (شامل تست‌ها).

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/main.py`
- `ruff check app/main.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 7
  id: 97f4adbb-3347-43d6-977c-439c94daf969
  عنوان اصلی: تعیین وضعیت endpoint بلااستفاده: GET /auth/google
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/auth_google.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `GET /auth/google` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=static] [verify_plan={"grep_patterns": ["def google_auth_callback", "router.get(\"/auth/google\""], "files_hint": ["app/routes/auth_google.py"]}]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["test_auth_google", "/auth/google:"], "files_hint": ["tests/", "openapi.yaml", "swagger.json"]}]

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
endpoint بک‌اند بلااستفاده: GET /auth/google

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/auth_google.py`

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

- `app/database.py` — `auth_google.py` این فایل را import می‌کند
- `app/services/google_auth.py` — `auth_google.py` این فایل را import می‌کند
- `app/dependencies/auth.py` — `auth_google.py` این فایل را import می‌کند
- `app/models/user_oauth.py` — `auth_google.py` این فایل را import می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
endpoint `GET /auth/google` در `app/routes/auth_google.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `GET`
- path: `/auth/google`
- فایل: `app/routes/auth_google.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `GET /auth/google` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/auth/google` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
گام ۲: اگر internal است، در README یا OpenAPI tag `internal` بزن.
گام ۳: اگر منسوخ است، حذف کن (شامل تست‌ها).

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/routes/auth_google.py`
- `ruff check app/routes/auth_google.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 7
  id: 7b202e2d-f763-4cd0-82bd-9d026facbbd5
  عنوان اصلی: رسیدگی به endpoint بلااستفاده: PATCH /{integration_id}
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/routes/integrations.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `PATCH /{integration_id}` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=static] [verify_plan={"grep_patterns": ["app.patch(\"/{integration_id}\")"], "files_hint": ["app/routes/integrations.py"]}]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["def test_patch_integration", "client.patch('/api/integrations/", "/integrations/{integration_id}:", "  patch:"], "files_hint": ["tests/routes/test_integrations.py", "openapi.yaml"]]

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
endpoint بک‌اند بلااستفاده: PATCH /{integration_id}

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/integrations.py`

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

- `app/database.py` — `integrations.py` این فایل را import می‌کند
- `app/schemas/integration_schema.py` — `integrations.py` این فایل را import می‌کند
- `app/services/integration_service.py` — `integrations.py` این فایل را import می‌کند
- `app/models/user.py` — `integrations.py` این فایل را import می‌کند
- `app/routes/__init__.py` — این فایل `integrations.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
endpoint `PATCH /{integration_id}` در `app/routes/integrations.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `PATCH`
- path: `/{integration_id}`
- فایل: `app/routes/integrations.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `PATCH /{integration_id}` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/{integration_id}` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
گام ۲: اگر internal است، در README یا OpenAPI tag `internal` بزن.
گام ۳: اگر منسوخ است، حذف کن (شامل تست‌ها).

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/routes/integrations.py`
- `ruff check app/routes/integrations.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 7
  id: c746c13c-67ac-4d6b-ace8-1319c37a824e
  عنوان اصلی: رسیدگی به endpoint بک‌اند بلااستفاده: GET /api/lists/{list_id}
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/lists.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `GET /api/lists/{list_id}` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=static] [verify_plan={"grep_patterns": ["@router.get(\"/lists/{list_id}\")", "def get_list_by_id"], "files_hint": ["app/routes/lists.py"]}]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
endpoint بک‌اند بلااستفاده: GET /api/lists/{list_id}

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/lists.py`

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

- `app/database.py` — `lists.py` این فایل را import می‌کند
- `app/middleware.py` — `lists.py` این فایل را import می‌کند
- `app/schemas/todo_item_schema.py` — `lists.py` این فایل را import می‌کند
- `app/schemas/todo_list_schema.py` — `lists.py` این فایل را import می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
endpoint `GET /api/lists/{list_id}` در `app/routes/lists.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `GET`
- path: `/api/lists/{list_id}`
- فایل: `app/routes/lists.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `GET /api/lists/{list_id}` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/api/lists/{list_id}` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
گام ۲: اگر internal است، در README یا OpenAPI tag `internal` بزن.
گام ۳: اگر منسوخ است، حذف کن (شامل تست‌ها).

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/routes/lists.py`
- `ruff check app/routes/lists.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 6 از 7
  id: c35d2627-d972-47c2-8f42-aa6a713f8c66
  عنوان اصلی: تعیین تکلیف endpoint بلااستفاده PATCH /{notification_id}/read
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/notifications.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `PATCH /{notification_id}/read` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=static] [verify_plan={"grep_patterns": ["-(?!.*@app\\.patch\\('/{notification_id}/read'\\))", "internal_tag_or_decorator_pattern"], "files_hint": ["app/routes/notifications.py", "frontend/**/*.js", "frontend/**/*.ts", "fr]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["-(?!.*patch:)", "-(?!.*notification_id)", "-(?!.*read:)"], "files_hint": ["tests/test_notifications.py", "openapi.yaml", "swagger.json"]}]

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
endpoint بک‌اند بلااستفاده: PATCH /{notification_id}/read

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/notifications.py`

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

- `app/database.py` — `notifications.py` این فایل را import می‌کند
- `app/schemas/notification_schema.py` — `notifications.py` این فایل را import می‌کند
- `app/services/notification_service.py` — `notifications.py` این فایل را import می‌کند
- `app/models/user.py` — `notifications.py` این فایل را import می‌کند
- `app/routes/__init__.py` — این فایل `notifications.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
endpoint `PATCH /{notification_id}/read` در `app/routes/notifications.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `PATCH`
- path: `/{notification_id}/read`
- فایل: `app/routes/notifications.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `PATCH /{notification_id}/read` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/{notification_id}/read` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
گام ۲: اگر internal است، در README یا OpenAPI tag `internal` بزن.
گام ۳: اگر منسوخ است، حذف کن (شامل تست‌ها).

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/routes/notifications.py`
- `ruff check app/routes/notifications.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 7
  id: 30d713d5-62c6-485d-9de5-040d9900f29d
  عنوان اصلی: رسیدگی به endpoint بلااستفاده GET /api/projects/{project_id}
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/projects.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `GET /api/projects/{project_id}` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/projects/123", "headers": null, "json_body": null, "expected_status": 404, "required_fields": null, "json_contains": null}]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["def test_get_project_by_id", "/api/projects/{project_id}:"], "files_hint": ["tests/test_projects.py", "openapi.yaml", "openapi.json"]}]

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
endpoint بک‌اند بلااستفاده: GET /api/projects/{project_id}

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/projects.py`

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

- `app/database.py` — `projects.py` این فایل را import می‌کند
- `app/middleware.py` — `projects.py` این فایل را import می‌کند
- `app/models/project.py` — `projects.py` این فایل را import می‌کند
- `app/schemas/project_schema.py` — `projects.py` این فایل را import می‌کند
- `app/routes/__init__.py` — این فایل `projects.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
endpoint `GET /api/projects/{project_id}` در `app/routes/projects.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `GET`
- path: `/api/projects/{project_id}`
- فایل: `app/routes/projects.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `GET /api/projects/{project_id}` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/api/projects/{project_id}` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
گام ۲: اگر internal است، در README یا OpenAPI tag `internal` بزن.
گام ۳: اگر منسوخ است، حذف کن (شامل تست‌ها).

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/routes/projects.py`
- `ruff check app/routes/projects.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
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
- در commit message: `merged-from: 7eb3c581-9ee4-468e-9498-b6496872b131, 43280a1a-7bdd-41b3-9b98-c6d198e6fe3b, 97f4adbb-3347-43d6-977c-439c94daf969, 7b202e2d-f763-4cd0-82bd-9d026facbbd5, c746c13c-67ac-4d6b-ace8-1319c37a824e, c35d2627-d972-47c2-8f42-aa6a713f8c66, 30d713d5-62c6-485d-9de5-040d9900f29d`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. مسیر /api/search دیگر 200 برنمی‌گرداند _(verify: api_response)_
2. مسیر /api/tasks/search همچنان کار می‌کند _(verify: api_response)_
3. هیچ کلاینتی از /api/search استفاده نمی‌کند _(verify: manual_only)_
4. مشخص شد endpoint `GET /api/health` در کدام دسته است (orphan/internal/deprecated) _(verify: manual_only)_
5. اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف _(verify: api_response)_
6. اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد _(verify: static)_
7. مشخص شد endpoint `GET /auth/google` در کدام دسته است (orphan/internal/deprecated) _(verify: manual_only)_
8. مشخص شد endpoint `PATCH /{integration_id}` در کدام دسته است (orphan/internal/deprecated) _(verify: manual_only)_
9. مشخص شد endpoint `GET /api/lists/{list_id}` در کدام دسته است (orphan/internal/deprecated) _(verify: manual_only)_
10. مشخص شد endpoint `PATCH /{notification_id}/read` در کدام دسته است (orphan/internal/deprecated) _(verify: manual_only)_
11. مشخص شد endpoint `GET /api/projects/{project_id}` در کدام دسته است (orphan/internal/deprecated) _(verify: manual_only)_

## Task Steps

### Step 1: بررسی و اعتبارسنجی خودکار پرامپت پیش از اجرا
**Status:** `done` (100%)
**Scope:** این بخش یک یادداشت هشداردهنده برای مدل اجراکننده است و شامل هیچ دستور اجرایی یا تغییر کد نمی‌شود. وظیفه آن صرفاً آگاه‌سازی مدل از احتمال وجود خطا در پرامپت، احتمال پیاده‌سازی قبلی، و لزوم بررسی مستقل repo است. هیچ فایل، endpoint، یا تابعی در این بخش ذکر نشده که نیاز به تغییر داشته باشد.
— [merged] این بخش یک یادداشت هشداردهنده برای مدل اجراکننده است و شامل هیچ دستور اجرایی مستقیمی نیست. وظیفه آن است که مدل را ملزم به بررسی مستقل repo، شناسایی پیاده‌سازی‌های قبلی، و جلوگیری از بازسازی موارد موجود کند. این بخش هیچ endpoint، فایل، یا تغییری را مشخص نمی‌کند و صرفاً یک پروتکل رفتاری برای مدل تعریف می‌کند.
— [merged] این بخش یک یادداشت هشداردهنده برای مدل اجراکننده است و شامل هیچ دستور اجرایی مستقیمی نیست. وظیفه آن اطلاع‌رسانی درباره احتمال خطا در پرامپت، احتمال پیاده‌سازی قبلی، و مسئولیت مدل برای بررسی مستقل repo است. این بخش نباید به عنوان یک مرحله اجرایی در نظر گرفته شود، بلکه یک راهنمای پیش‌نیاز برای تمام مراحل بعدی است.
**Excerpt:**
```
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
```

### Step 2: رفع ناسازگاری مسیر /api/search در tasks.py
**Status:** `done` (100%)
**Scope:** این مرحله شامل حذف مسیر تکراری /api/search از دکوراتور @router.get در app/routes/tasks.py خط 96 است. مسیر /api/tasks/search باید حفظ شود. هیچ تغییری در mount کردن router یا فایل‌های دیگر انجام نمی‌شود. فقط خط 96 حذف می‌شود.
**Excerpt:**
```
ناسازگاری در مسیرهای API: /api/search در tasks.py با هیچ endpoint دیگری همخوانی ندارد

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/tasks.py:95-96` — `search_tasks_endpoint` — مسیر /api/search در این router تعریف شده اما mount نشده است
  ```python
  @router.get("/api/tasks/search", tags=["tasks"])
  @router.get("/api/search", tags=["tasks"])
  ```
```

### Step 3: رفع مسیر GET /api/search که alias برای /api/tasks/search است و به دلیل mount ناقص باعث 404 می‌شود
**Status:** `done` (100%)
**Scope:** این بخش فقط به مسیر GET /api/search در app/routes/tasks.py خط 96 مربوط است. هدف این است که این مسیر alias به درستی کار کند یا حذف شود. شامل بررسی mount شدن router در app/main.py خط 364 و مستندات docs/API.md خط 28 است. خارج از scope: سایر مسیرهای /api/tasks/...، تغییرات در database، middleware، models، schemas یا auth.
**Excerpt:**
```
در app/routes/tasks.py خط 96، یک مسیر GET /api/search تعریف شده که alias برای /api/tasks/search است. این مسیر در docs/API.md ثبت شده اما در app/main.py هیچ include_router متناظری ندارد که این مسیر را mount کند. router tasks با prefix خالی mount شده (خط 364 main.py) و مسیرهای /api/tasks/... کار می‌کنند، اما /api/search یک مسیر سطح بالا است که با هیچ router دیگری تطابق ندارد. این باعث 404 برای کلاینت‌هایی می‌شود که سعی می‌کنند از /api/search استفاده کنند.
```

### Step 4: حذف endpoint بلااستفاده /api/search از tasks.py و مستندات
**Status:** `done` (100%)
**Scope:** این مرحله شامل حذف مسیر /api/search از app/routes/tasks.py، به‌روزرسانی docs/API.md برای حذف اشاره به این alias، و اطمینان از عدم تأثیر بر مسیر /api/tasks/search است. تغییرات فقط به این دو فایل محدود می‌شود و شامل تغییر در main.py یا سایر فایل‌ها نیست مگر اینکه وابستگی import ایجاد شود. نکته حیاتی: باید بررسی شود که هیچ کلاینتی (frontend یا external) از این endpoint استفاده نمی‌کند و تمام تست‌ها و linter پس از تغییر پاس می‌شوند.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مسیر /api/search دیگر 200 برنمی‌گرداند
- [ ] مسیر /api/tasks/search همچنان کار می‌کند
- [ ] هیچ کلاینتی از /api/search استفاده نمی‌کند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. مسیر /api/search را از tasks.py حذف کنید یا یک router جداگانه برای آن ایجاد کنید و در main.py mount کنید. ترجیحاً حذف شود چون docs/API.md آن را به عنوان alias معرفی کرده و frontend از آن استفاده نمی‌کند.
```

### Step 5: حذف مسیر تکراری /api/search از tasks.py
**Status:** `done` (100%)
**Scope:** این مرحله شامل حذف دکوراتور تکراری @router.get("/api/search", tags=["tasks"]) از فایل app/routes/tasks.py است. فقط مسیر اضافی حذف می‌شود و مسیر اصلی /api/tasks/search باقی می‌ماند. هیچ تغییر دیگری در کد یا فایل‌های دیگر انجام نمی‌شود.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**حذف مسیر اضافی**

_قبل:_
```
@router.get("/api/tasks/search", tags=["tasks"])
@router.get("/api/search", tags=["tasks"])
```

_بعد:_
```
@router.get("/api/tasks/search", tags=["tasks"])
```
```

### Step 6: بررسی و اقدام در مورد endpoint بلااستفاده GET /api/health
**Status:** `done` (100%)
**Scope:** این بخش شامل تسک 2 از 7 با شناسه 43280a1a-7bdd-41b3-9b98-c6d198e6fe3b است. هدف آن بررسی endpoint `GET /api/health` در فایل `app/main.py` و دسته‌بندی آن به عنوان orphan/internal/deprecated و سپس انجام اقدام مناسب (اتصال مجدد، تگ internal، یا حذف) است. در صورت حذف، باید تست‌ها و مستندات OpenAPI نیز به‌روزرسانی شوند. این تسک مستقل است و وابستگی به تسک‌های دیگر ندارد.
**Excerpt:**
```
تسک 2 از 7
  id: 43280a1a-7bdd-41b3-9b98-c6d198e6fe3b
  عنوان اصلی: بررسی و اقدام در مورد endpoint بلااستفاده GET /api/health
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/main.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `GET /api/health` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 404, "required_fields": null, "json_contains": null}]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["- /api/health", "def test_health", "router.get(\"/health\""], "files_hint": ["openapi.yaml", "swagger.json", "tests/", "app/main.py"]}]
```

### Step 7: حذف endpoint GET /api/health از app/main.py
**Status:** `done` (100%)
**Scope:** این بخش صرفاً به endpoint GET /api/health در فایل app/main.py می‌پردازد. شامل حذف کامل endpoint از کد بک‌اند است. خارج از scope: بررسی frontend callها، مستندسازی، یا اضافه کردن 410 Gone. نکته حیاتی: قبل از حذف، باید با grep روی کل کدبیس (شامل frontend, tests, docs) بررسی شود که هیچ caller دیگری (مانند healthcheck در Docker/k8s) وجود نداشته باشد.
**Excerpt:**
```
## 📋 شرح
endpoint `GET /api/health` در `app/main.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `GET`
- path: `/api/health`
- فایل: `app/main.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).
```

### Step 8: تعیین وضعیت و اقدام روی endpoint GET /api/health
**Status:** `done` (100%)
**Scope:** این بخش شامل تحلیل endpoint GET /api/health برای تعیین دسته (orphan/internal/deprecated) و انجام اقدام متناسب است. شامل جستجوی callerها در frontend، scripts و docs، اصلاح اتصال در صورت وجود caller، حذف endpoint در صورت orphan بودن، به‌روزرسانی OpenAPI و تست‌ها، و عبور از linter و type-check می‌شود. خارج از scope: سایر endpointها و تحلیل‌های غیرمرتبط با /api/health.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `GET /api/health` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/api/health` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
```

### Step 9: بررسی ریسک‌های حذف endpoint بلااستفاده GET /auth/google و تعیین وضعیت نهایی آن
**Status:** `done` (100%)
**Scope:** این بخش شامل بررسی ریسک‌های حذف endpoint GET /auth/google است. باید قبل از هر اقدامی، لاگ‌های ۳۰ روز اخیر (Render logs یا nginx access logs) برای اطمینان از عدم استفاده در production (cron/webhook خارجی) بررسی شود. سپس بر اساس acceptance_criteria، وضعیت endpoint (orphan/internal/deprecated) تعیین و اقدام مناسب (باز کردن connection، افزودن تگ internal، یا حذف) انجام شود. در صورت حذف، تست‌ها و مستندات OpenAPI نیز باید به‌روز شوند. فایل‌های دخیل: app/routes/auth_google.py, tests/, openapi.yaml/swagger.json.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 7
  id: 97f4adbb-3347-43d6-977c-439c94daf969
  عنوان اصلی: تعیین وضعیت endpoint بلااستفاده: GET /auth/google
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/auth_google.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `GET /auth/google` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=static] [verify_plan={"grep_patterns": ["def google_auth_callback", "router.get(\"/auth/google\""], "files_hint": ["app/routes/auth_google.py"]}]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["test_auth_google", "/auth/google:"], "files_hint": ["tests/", "openapi.yaml", "swagger.json"]}]
```

### Step 10: حذف endpoint بلااستفاده GET /auth/google از فایل auth_google.py
**Status:** `done` (100%)
**Scope:** این بخش صرفاً به حذف endpoint GET /auth/google از فایل app/routes/auth_google.py می‌پردازد. هیچ تغییر دیگری در سایر فایل‌ها یا منطق احراز هویت گوگل انجام نمی‌شود. اگر این endpoint در جای دیگری (مثلاً app/main.py) ثبت شده باشد، باید آن ثبت نیز حذف شود. این بخش شامل مرور کد یا مستندات نیست.
**Excerpt:**
```
endpoint بک‌اند بلااستفاده: GET /auth/google

📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/auth_google.py`
```

### Step 11: بررسی و حذف endpoint بلااستفاده GET /auth/google
**Status:** `done` (100%)
**Scope:** این بخش به بررسی endpoint `GET /auth/google` در فایل `app/routes/auth_google.py` می‌پردازد که هیچ فراخوانی از frontend (fetch, axios, apiClient) یا log اخیر ندارد. هدف تصمیم‌گیری بین حذف کامل، بازگردانی 410 Gone، یا مستندسازی به‌عنوان endpoint داخلی/admin است. فایل‌های مرتبط شامل `app/database.py`, `app/services/google_auth.py`, `app/dependencies/auth.py`, `app/models/user_oauth.py` هستند که توسط `auth_google.py` import شده‌اند. این بخش شامل تحلیل وابستگی‌ها و تصمیم‌گیری نهایی است.
**Excerpt:**
```
## 🔍 Context و وضعیت فعلی
## 📋 شرح
endpoint `GET /auth/google` در `app/routes/auth_google.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `GET`
- path: `/auth/google`
- فایل: `app/routes/auth_google.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).
```

### Step 12: بررسی و اقدام روی endpoint GET /auth/google بر اساس معیارهای پذیرش
**Status:** `done` (100%)
**Scope:** این بخش شامل معیارهای پذیرش رفتار-محور برای endpoint GET /auth/google است. وظیفه: تعیین دسته (orphan/internal/deprecated)، انجام اقدام مناسب (رفع اتصال، تگ internal، یا حذف)، و در صورت حذف، به‌روزرسانی تست‌ها و OpenAPI. همچنین شامل مراحل اجرایی پیشنهادی (گام ۱: grep برای یافتن callerها) است. خارج از scope: سایر endpointها، پیاده‌سازی جزئیات فنی فراتر از grep.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `GET /auth/google` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/auth/google` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
```

### Step 13: رسیدگی به endpoint بلااستفاده: PATCH /{integration_id}
**Status:** `done` (100%)
**Scope:** این بخش شامل تحلیل و اقدام روی endpoint PATCH /{integration_id} در فایل app/routes/integrations.py است. ریسک حذف endpointهایی که فقط در production مصرف می‌شوند (cron/webhook خارجی) باید با بررسی Render logs یا nginx access logs آخرین ۳۰ روز مدیریت شود. acceptance_criteria شامل سه حالت است: اتصال مجدد (connection باز شود)، تگ internal، یا حذف کامل. اگر حذف انجام شود، تست‌ها و OpenAPI نیز باید به‌روز شوند. این بخش مستقل است و وابستگی به تسک دیگری ندارد.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 7
  id: 7b202e2d-f763-4cd0-82bd-9d026facbbd5
  عنوان اصلی: رسیدگی به endpoint بلااستفاده: PATCH /{integration_id}
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: app/routes/integrations.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `PATCH /{integration_id}` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=static] [verify_plan={"grep_patterns": ["app.patch(\"/{integration_id}\")"], "files_hint": ["app/routes/integrations.py"]}]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["def test_patch_integration", "client.patch('/api/integrations/", "/integrations/{integration_id}:", "  patch:"], "files_hint": ["tests/routes/test_integrations.py", "openapi.yaml"]}
```

### Step 14: بررسی و اعتبارسنجی خودکار پرامپت پیش از اجرا — اطمینان از عدم پیاده‌سازی قبلی و صحت مسیرها
**Status:** `done` (100%)
**Scope:** این بخش یک مرحلهٔ پیش‌نیاز (pre-flight check) است که پیش از هرگونه تغییر اجرایی در پروژه انجام می‌شود. شامل: (۱) جستجوی grep برای وجود فایل‌ها/توابع/کلاس‌های ذکرشده در repo، (۲) بررسی اینکه آیا بخشی از این درخواست قبلاً پیاده‌سازی شده (کامل یا ناقص)، (۳) تأیید مسیرهای فایل‌های ذکرشده (app/routes/tasks.py, app/main.py, docs/API.md, app/database.py, app/middleware.py, app/models/task.py, app/schemas/task_schema.py, app/routes/__init__.py, app/config.py, app/routes/auth_google.py, app/services/google_auth.py, app/dependencies/auth.py) و اصلاح آن‌ها در صورت نیاز. خارج از scope: اجرای واقعی تغییرات، کدنویسی، تست، یا کامیت.
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

### Step 15: حذف endpoint بلااستفاده PATCH /{integration_id} از app/routes/integrations.py
**Status:** `done` (100%)
**Scope:** این بخش صرفاً به حذف endpoint PATCH /{integration_id} از فایل app/routes/integrations.py می‌پردازد. هیچ فایل دیگری در این مرحله تغییر نمی‌کند. endpoint مورد نظر باید به طور کامل از مسیریابی (routing) حذف شود. هیچ endpoint دیگری در این فایل تحت تأثیر قرار نمی‌گیرد.
— [merged] این بخش به بررسی endpoint PATCH /{integration_id} در فایل app/routes/integrations.py می‌پردازد که هیچ فراخوانی از frontend یا log اخیر ندارد. شامل تحلیل orphan بودن، مستندسازی یا حذف endpoint است. فایل‌های مرتبط: app/database.py, app/schemas/integration_schema.py, app/services/integration_service.py, app/models/user.py, app/routes/__init__.py. خارج از scope: سایر endpointها، frontend components.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
endpoint بک‌اند بلااستفاده: PATCH /{integration_id}

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/integrations.py`

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
```

### Step 16: بررسی و دسته‌بندی endpoint PATCH /{integration_id} و اعمال اقدام مناسب
**Status:** `done` (100%)
**Scope:** این مرحله شامل تحلیل endpoint PATCH /{integration_id} برای تعیین دسته (orphan/internal/deprecated) و سپس اجرای اقدام متناظر (باز کردن connection، افزودن تگ internal، یا حذف) است. در صورت حذف، تست‌های مرتبط و مستندات OpenAPI نیز باید به‌روزرسانی شوند. خروجی نهایی باید بدون خطا در تست‌ها، linter و type-check باشد. فایل‌های درگیر: app/routes/tasks.py, docs/API.md, و هر فایل تست مرتبط.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `PATCH /{integration_id}` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/{integration_id}` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
```

### Step 17: بررسی ریسک‌های حذف endpoint GET /api/lists/{list_id} و احتیاط‌های لازم
**Status:** `done` (100%)
**Scope:** این بخش شامل بررسی ریسک‌های حذف endpoint بلااستفاده GET /api/lists/{list_id} است. تمرکز بر اطمینان از عدم استفاده endpoint در production (cron jobs، webhook‌های خارجی) با بررسی Render logs یا nginx access logs آخرین ۳۰ روز می‌باشد. این بخش مستقل از سایر تسک‌ها است و هیچ وابستگی ندارد. نکته حیاتی: قبل از هر اقدامی برای حذف، باید لاگ‌ها چک شوند تا از silent failure جلوگیری شود.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 7
  id: c746c13c-67ac-4d6b-ace8-1319c37a824e
  عنوان اصلی: رسیدگی به endpoint بک‌اند بلااستفاده: GET /api/lists/{list_id}
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/lists.py
```

### Step 18: بررسی و اعتبارسنجی خودکار پیش‌نیازهای اجرایی قبل از شروع پیاده‌سازی
**Status:** `done` (100%)
**Scope:** این بخش یک مرحله پیش‌اجرایی (pre-flight) است که وظیفه دارد قبل از هرگونه تغییر کد، وضعیت فعلی repo را از نظر وجود پیاده‌سازی‌های قبلی، صحت مسیرهای فایل‌های ذکر شده، و تطابق آن‌ها با درخواست اصلی بررسی کند. شامل جستجوی grep برای فایل‌ها و توابع مرتبط، خواندن محتوای فایل‌های موجود، و تصمیم‌گیری در مورد نیاز به تغییر یا skip است. خارج از scope: اجرای مستقیم تغییرات کد، نوشتن تست، یا اصلاح فایل‌ها.
— [merged] این مرحله یک مرحلهٔ پیش‌اجرا (pre-flight check) است که وظیفه دارد پیش از هرگونه تغییر کد، وجود پیاده‌سازی‌های قبلی، صحت مسیرهای فایل، و تطابق ساختار repo با ادعاهای پرامپت را بررسی کند. شامل جستجوی grep برای فایل‌ها و توابع ذکرشده، خواندن فایل‌های موجود، و تصمیم‌گیری در مورد نیاز به تغییر یا skip است. این مرحله هیچ کدی تولید نمی‌کند و صرفاً یک بررسی و مستندسازی وضعیت موجود است. خروجی این مرحله یک تصمیم (تغییر/بدون تغییر) و یک کامیت توضیحی (no-op یا تغییر واقعی) خواهد بود.
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

### Step 19: شناسایی و حذف endpoint بلااستفاده GET /api/lists/{list_id} از app/routes/lists.py
**Status:** `done` (100%)
**Scope:** این بخش صرفاً به endpoint GET /api/lists/{list_id} در فایل app/routes/lists.py می‌پردازد. هدف حذف کامل این endpoint از کد و مستندات مرتبط است. هیچ endpoint دیگری در این مرحله بررسی نمی‌شود. فرض بر این است که بلااستفاده بودن این endpoint قبلاً تأیید شده است.
**Excerpt:**
```
endpoint بک‌اند بلااستفاده: GET /api/lists/{list_id}

📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_
- `app/routes/lists.py`
```

### Step 20: بررسی و حذف endpoint GET /api/lists/{list_id} در app/routes/lists.py
**Status:** `done` (100%)
**Scope:** این بخش شامل تحلیل endpoint GET /api/lists/{list_id} است که در app/routes/lists.py تعریف شده و هیچ فراخوانی از سمت فرانت‌اند یا لاگ اخیر ندارد. هدف تصمیم‌گیری بین حذف کامل endpoint (با 410 Gone)، مستندسازی به‌عنوان internal endpoint، یا رفع broken frontend feature است. فایل‌های مرتبط شامل app/database.py، app/middleware.py، app/schemas/todo_item_schema.py و app/schemas/todo_list_schema.py هستند. نکته حیاتی: قبل از هر تغییری باید grep روی نام symbol/path اصلی انجام شود تا وابستگی‌های پنهان شناسایی شوند.
**Excerpt:**
```
endpoint `GET /api/lists/{list_id}` در `app/routes/lists.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `GET`
- path: `/api/lists/{list_id}`
- فایل: `app/routes/lists.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).
```

### Step 21: بررسی و دسته‌بندی endpoint GET /api/lists/{list_id} و انجام اقدام اصلاحی
**Status:** `done` (100%)
**Scope:** این بخش شامل بررسی endpoint مشخص شده (GET /api/lists/{list_id}) برای تعیین وضعیت آن (orphan/internal/deprecated) و انجام اقدامات متناظر است. اقدامات شامل: باز کردن connection در صورت orphan بودن، افزودن تگ internal، یا حذف کامل endpoint. در صورت حذف، تست‌های مرتبط و مستندات OpenAPI نیز باید به‌روزرسانی شوند. خروجی این مرحله باید بدون خطا در تست‌ها، linter و type-checker باشد. خارج از scope: سایر endpointها، تغییرات در معماری کلی، یا بازنویسی منطق business.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `GET /api/lists/{list_id}` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/api/lists/{list_id}` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
```

### Step 22: بررسی و تعیین تکلیف endpoint بلااستفاده PATCH /{notification_id}/read با احتیاط از حذف مصرف‌شونده‌های production
**Status:** `done` (100%)
**Scope:** این بخش شامل بررسی endpoint `PATCH /{notification_id}/read` در فایل `app/routes/notifications.py` است. هدف تعیین دسته‌بندی آن (orphan/internal/deprecated) و انجام اقدام مناسب (اتصال مجدد، تگ internal، یا حذف) می‌باشد. نکات حیاتی: قبل از حذف، باید لاگ‌های Render یا nginx access logs آخرین ۳۰ روز چک شود تا از silent failure جلوگیری گردد. این بخش مستقل از سایر تسک‌ها است.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 6 از 7
  id: c35d2627-d972-47c2-8f42-aa6a713f8c66
  عنوان اصلی: تعیین تکلیف endpoint بلااستفاده PATCH /{notification_id}/read
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/notifications.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `PATCH /{notification_id}/read` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=static] [verify_plan={"grep_patterns": ["-(?!.*@app\\.patch\('/{notification_id}/read'\))", "internal_tag_or_decorator_pattern"], "files_hint": ["app/routes/notifications.py", "frontend/**/*.js", "frontend/**/*.ts", "fr]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["-(?!.*patch:)", "-(?!.*notification_id)", "-(?!.*read:)"], "files_hint": ["tests/test_notifications.py", "openapi.yaml", "swagger.json"]}]
```

### Step 23: بررسی و اعتبارسنجی خودکار پرامپت پیش از اجرا — جستجوی پیاده‌سازی‌های قبلی و تطبیق با ساختار واقعی repo
**Status:** `done` (100%)
**Scope:** این مرحله یک مرحلهٔ پیش‌اجرا (pre-flight) است که وظیفه دارد پیش از هرگونه تغییر، پرامپت ورودی را با واقعیت repo تطبیق دهد. شامل: (۱) جستجوی grep برای فایل‌ها/کلاس‌های ذکرشده در پرامپت، (۲) بررسی وجود پیاده‌سازی‌های قبلی برای هر آیتم، (۳) تشخیص مواردی که پرامپت اشتباه یا ناقص است، (۴) تصمیم‌گیری در مورد نیاز به تغییر یا skip. این مرحله شامل هیچ تغییری در کد نمی‌شود — فقط تحلیل و مستندسازی وضعیت موجود است.
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

### Step 24: حذف endpoint بلااستفاده PATCH /{notification_id}/read از مسیر notifications
**Status:** `done` (100%)
**Scope:** این بخش صرفاً به حذف endpoint PATCH /{notification_id}/read از فایل app/routes/notifications.py اشاره دارد. هیچ فایل دیگری تحت تأثیر قرار نمی‌گیرد. نیازی به تغییر schema، model یا database نیست. این یک حذف ساده route است.
**Excerpt:**
```
endpoint بک‌اند بلااستفاده: PATCH /{notification_id}/read

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/notifications.py`
```

### Step 25: بررسی و حذف endpoint بلااستفاده PATCH /{notification_id}/read در app/routes/notifications.py
**Status:** `done` (100%)
**Scope:** این بخش صرفاً به endpoint PATCH /{notification_id}/read در فایل app/routes/notifications.py می‌پردازد. شامل تحلیل orphan بودن endpoint، تصمیم‌گیری برای حذف کامل یا جایگزینی با 410 Gone، و بررسی وابستگی‌های import شده (database, schemas, services, models) است. frontend call یا log اخیر ندارد. خارج از scope: سایر endpointهای notifications، فایل‌های tasks، auth، یا main.py.
**Excerpt:**
```
endpoint `PATCH /{notification_id}/read` در `app/routes/notifications.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `PATCH`
- path: `/{notification_id}/read`
- فایل: `app/routes/notifications.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).
```

### Step 26: تحلیل و اقدام روی endpoint PATCH /{notification_id}/read
**Status:** `done` (100%)
**Scope:** این بخش به بررسی endpoint مشخص PATCH /{notification_id}/read می‌پردازد و آن را در یکی از دسته‌های orphan/internal/deprecated قرار می‌دهد. سپس اقدام متناسب (اتصال مجدد، تگ internal، یا حذف) انجام می‌شود. در صورت حذف، تست‌های مرتبط و مستندات OpenAPI نیز به‌روزرسانی می‌شوند. خروجی نهایی باید بدون خطا در تست‌ها، linter و type-checker باشد.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `PATCH /{notification_id}/read` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/{notification_id}/read` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
```

### Step 27: بررسی ریسک‌های حذف endpoint و چک کردن لاگ‌های ۳۰ روز اخیر
**Status:** `done` (100%)
**Scope:** این بخش شامل بررسی ریسک‌های مرتبط با حذف endpoint است. تمرکز بر اطمینان از عدم حذف endpointهایی است که فقط در production (cron/webhook خارجی) مصرف می‌شوند. برای این منظور، لاگ‌های Render یا nginx access logs آخرین ۳۰ روز باید چک شوند. این بخش شامل خود حذف endpoint نیست و صرفاً یک مرحله احتیاطی و پیش‌نیاز است.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.
```

### Step 28: حذف endpoint بلااستفاده GET /api/projects/{project_id} از app/routes/projects.py
**Status:** `done` (100%)
**Scope:** این بخش صرفاً به حذف endpoint GET /api/projects/{project_id} از فایل app/routes/projects.py اشاره دارد. هیچ فایل دیگری در این بخش ذکر نشده است. کاربر صراحتاً endpoint را 'بلااستفاده' معرفی کرده و هدف پروژه شناسایی و حذف endpointهای بلااستفاده بک‌اند است. هیچ اشاره‌ای به مرور، done یا قبلاً اجرا شده در این بخش وجود ندارد.
— [merged] این بخش صرفاً به endpoint GET /api/projects/{project_id} در فایل app/routes/projects.py می‌پردازد. شامل تحلیل orphan بودن endpoint، تصمیم‌گیری برای حذف یا مستندسازی، و اجرای تغییر (حذف کد یا افزودن 410 Gone) است. فایل‌های مرتبط (app/database.py, app/middleware.py, app/models/project.py, app/schemas/project_schema.py, app/routes/__init__.py) باید برای حذف import‌های بلااستفاده بررسی شوند. خارج از scope: سایر endpointها، frontend refactoring، یا تغییرات در auth.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
endpoint بک‌اند بلااستفاده: GET /api/projects/{project_id}

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/projects.py`

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
```

### Step 29: تحلیل و اقدام روی endpoint GET /api/projects/{project_id} بر اساس معیارهای پذیرش
**Status:** `done` (100%)
**Scope:** این بخش شامل تحلیل یک endpoint خاص (GET /api/projects/{project_id}) برای تعیین دسته‌بندی آن (orphan/internal/deprecated) و انجام اقدام مناسب (اتصال مجدد، تگ internal، یا حذف) است. در صورت حذف، تست‌های مرتبط و مستندات OpenAPI نیز باید به‌روزرسانی شوند. خروجی نهایی باید بدون خطا در تست‌ها، linter و type-checker باشد. گام اول پیشنهادی شامل جستجوی caller در frontend، scripts و docs است.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `GET /api/projects/{project_id}` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/api/projects/{project_id}` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
```

### Step 30: بررسی ریسک‌های حذف endpointهای بلااستفاده با چک کردن لاگ‌های production
**Status:** `done` (100%)
**Scope:** این بخش شامل شناسایی و مستندسازی ریسک‌های مرتبط با حذف endpointهایی است که ممکن است در production توسط cron jobs یا webhookهای خارجی مصرف شوند. تمرکز بر چک کردن Render logs یا nginx access logs برای آخرین ۳۰ روز است تا از حذف اشتباهی endpointهای فعال جلوگیری شود. این مرحله صرفاً یک بررسی احتیاطی (audit) است و شامل حذف واقعی endpointها نمی‌شود.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
حذف endpoint که فقط در production مصرف می‌شود (cron/webhook خارجی) باعث silent failure می‌شود. قبل از حذف، Render logs یا nginx access logs آخرین ۳۰ روز را چک کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium
```
