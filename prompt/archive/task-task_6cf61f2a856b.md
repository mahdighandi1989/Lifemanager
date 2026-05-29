---
task_id: task_6cf61f2a856b
title: بهبود مدیریت خطا، تست و همگام‌سازی کد بک‌اند
type: other
priority: high
execution_priority: 100
status: done
external_status: pending
verification_status: done
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-26T23:23:04.518981+00:00'
updated_at: '2026-05-29T20:35:49.987747+00:00'
archived: true
archived_at: '2026-05-27T23:04:29.230896+00:00'
tags:
- consolidated
- post_verify_merge
---

# بهبود مدیریت خطا، تست و همگام‌سازی کد بک‌اند

## Raw Idea

🧬 این یک تسک تلفیقی است — از 7 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این خوشه شامل مجموعه‌ای از رفع باگ‌های با اولویت بالا و تلاش‌های بازسازی عمومی در سرویس‌ها و مدل‌های مختلف بک‌اند است که به خطاهای پنهان، عدم تطابق قراردادها، الگوهای طراحی نامناسب و تکرار کد می‌پردازد.
🎯 theme: رفع باگ‌های حیاتی و بازسازی ساختار بک‌اند
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 7
  id: c73103a6-9711-489c-8031-020af6052a2c
  عنوان اصلی: Fix silent failures from unlogged crucial exceptions
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/list_service.py

📋 acceptance_criteria کامل:
  - نوع exception specific شده (نه bare except/catch) [verify_method=static] [verify_plan={"grep_patterns": ["except [A-Za-z]+Error:", "except [A-Za-z]+Exception:"], "files_hint": ["app/services/list_service.py"]}]
  - log با level مناسب (warning/error) + context کامل اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["logger.warning\\(", "logger.error\\("], "files_hint": ["app/services/list_service.py"]}]
  - تست unit برای edge case شکست‌خورده عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/services/test_list_service.py::test_edge_case_failure_handled", "timeout_seconds": 30}]
  - اگر failure قابل recovery است، fallback مستند شده [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
Silent failure — except/catch بدون log در مسیر crucial

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/list_service.py:192`

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

- `app/models/todo_list.py` — `list_service.py` این فایل را import می‌کند
- `app/models/todo_item.py` — `list_service.py` این فایل را import می‌کند
- `app/services/_todo_seed_data.py` — `list_service.py` این فایل را import می‌کند
- `app/main.py` — این فایل `list_service.py` را import می‌کند (caller)
- `app/routes/lists.py` — این فایل `list_service.py` را import می‌کند (caller)

## 🔍 Context و وضعیت فعلی
## 📋 شرح
در `app/services/list_service.py` (line 192) یک exception handler خاموش (مثل `except: pass`) در مسیر اصلی کد پیدا شد.

## 🔍 جزئیات
- علت: bare 'except: pass' — هیچ‌چیز handle یا log نمی‌شود

## 🤔 چرا مهم است
silent failure خطرناک‌ترین bug است — کد به‌نظر کار می‌کند ولی در شرایط لبه data drop می‌شود بدون اینکه کسی متوجه شود. production incidents معمولاً ریشه‌شان همین است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] نوع exception specific شده (نه bare except/catch)
- [ ] log با level مناسب (warning/error) + context کامل اضافه شد
- [ ] تست unit برای edge case شکست‌خورده عبور می‌کند
- [ ] اگر failure قابل recovery است، fallback مستند شده
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: مشخص کن چه exception ای واقعاً ممکن است در این نقطه رخ دهد.
گام ۲: یا (الف) آن exception را به‌صورت specific catch کن و log + decision بنویس، یا (ب) اجازه bdo bubble up.
گام ۳: تست unit برای edge case (شکست عمدی این مسیر) بنویس.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/services/list_service.py`
- `ruff check app/services/list_service.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر silent failure به raise ممکن است upstream caller را break کند که فرض می‌کرده این تابع همیشه return می‌کند. caller را هم چک کن.

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
تسک 2 از 7
  id: 6514c312-2549-4400-81db-d1c5da2284e1
  عنوان اصلی: همگام‌سازی contract فیلد status در Tasks
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": ".", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["warning", "error"], "files_hint": ["app/", "frontend/"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["error:", "Type error:"], "files_hint": ["app/", "frontend/"]}]

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
عدم تطابق contract بین backend و frontend برای فیلد status در Tasks

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
در app/routes/tasks.py خط 83، فیلد status به صورت t.status.value سریالایز می‌شود که مقادیری مانند 'todo', 'in_progress', 'completed' برمی‌گرداند. اما در frontend/src/pages/Tasks.jsx خط 7-11، STATUS_LABELS فقط سه کلید 'pending', 'in_progress', 'completed' را تعریف کرده و 'todo' را پشتیبانی نمی‌کند. این باعث می‌شود وظایف با status='todo' در frontend با label پیش‌فرض نمایش داده شوند. همچنین در Dashboard.jsx خط 42، فیلتر completed با t.status === 'completed' انجام می‌شود که با مقادیر backend همخوانی دارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. STATUS_LABELS در Tasks.jsx را به روز کنید تا 'todo' را نیز پشتیبانی کند، یا backend را تغییر دهید تا 'pending' برگرداند. راه حل بهتر: backend را تغییر دهید چون 'pending' در frontend و docs استفاده شده است.

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
تسک 3 از 7
  id: fa7a1b47-90af-46a4-983d-47cede49382c
  عنوان اصلی: یکپارچه کردن default فیلد 'background'
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - `background` در همه‌جا از یک منبع default می‌گیرد [verify_method=static] [verify_plan={"grep_patterns": ["background=[\"']card[\"']", "background=[\"']container[\"']", "DEFAULT_BACKGROUND_VALUE"], "files_hint": ["**/*.py", "**/*.js", "**/*.ts"]}]
  - تست fixture رفتار پیش‌فرض را تأیید می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_default_background.py::test_background_default_value", "timeout_seconds": 30}]
  - اگر default value تغییر کرد، migration یا backward-compat layer اضافه شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
تضاد default برای فیلد 'background'

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
## 📋 شرح
فیلد `background` در `` در دو یا چند جای مختلف default value متفاوت دارد.

## 🤔 چرا مهم است
defaults متناقض باعث می‌شود رفتار سیستم به ترتیب اجرا/import وابسته شود — bug های غیرقابل reproduce.

## 🔍 جزئیات
- علت: field background has different defaults: ['"card">', '"container">']

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] `background` در همه‌جا از یک منبع default می‌گیرد
- [ ] تست fixture رفتار پیش‌فرض را تأیید می‌کند
- [ ] اگر default value تغییر کرد، migration یا backward-compat layer اضافه شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: همه جاهایی که `background` default می‌گیرد لیست کن.
گام ۲: یک default واحد انتخاب کن و یک منبع (مثل config یا constant).
گام ۳: تست fixture برای رفتار پیش‌فرض بنویس.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر default value برای کاربران فعلی silent behavior change است — حتماً release note بنویس.

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
تسک 4 از 7
  id: 84de4a11-9e40-4e40-a55a-2c35d6aa05ee
  عنوان اصلی: Fix stale assumption anti-pattern
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/models/user.py

📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["Sanitized at the route layer with bleach.clean", "Sanitization handled at application layer", "bleach.clean\\(self\\.bio\\)"], "files_hint": ["app/models/user.py"]}]
  - تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_user_model_security.py::test_bio_display_name_sanitization_edge_case", "timeout_seconds": 60}]

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
Anti-pattern: Stale assumption

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/models/user.py:17`

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

- `app/database.py` — `user.py` این فایل را import می‌کند
- `app/routes/ai.py` — این فایل `user.py` را import می‌کند (caller)
- `app/routes/integrations.py` — این فایل `user.py` را import می‌کند (caller)
- `app/routes/notifications.py` — این فایل `user.py` را import می‌کند (caller)
- `app/routes/users.py` — این فایل `user.py` را import می‌کند (caller)

## 🔍 Context و وضعیت فعلی
The comment explicitly states that `bio` and `display_name` are 'Sanitised at the route layer with bleach.clean'. This represents a `Stale assumption` because the model itself has no enforcement mechanism for this critical security measure. If the application layer's sanitization logic (e.g., `app/routes/users.py::_sanitize_html`) is ever bypassed, removed, or not consistently applied across all d

📁 file: app/models/user.py (line 17)

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
- `python -m py_compile app/models/user.py`
- `ruff check app/models/user.py`
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
تسک 5 از 7
  id: 162451d8-5d39-4be1-be49-2c1021068120
  عنوان اصلی: Resolve broken feedback loop anti-pattern
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/main.py

📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["except QueuePool.TimeoutError", "TODO: Handle QueuePool.TimeoutError", "FIXME: QueuePool.TimeoutError feedback loop"], "files_hint": ["app/main.py"]}]
  - تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_database_timeout.py::test_queue_pool_timeout_handling", "timeout_seconds": 60}]

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
Anti-pattern: Broken feedback loop

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/main.py:150`

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

## 🔍 Context و وضعیت فعلی
Related to the incomplete database timeout handling, if `QueuePool.TimeoutError` occurs, the system will likely return a generic 500 error or crash. Without a specific handler, there's no mechanism to log the specific database connection issue, provide a user-friendly error, or trigger alerts, thus breaking the feedback loop necessary for diagnosing and responding to database resource exhaustion.

📁 file: app/main.py (line 150)

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
- `python -m py_compile app/main.py`
- `ruff check app/main.py`
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
تسک 6 از 7
  id: a5be2def-27aa-48e9-9d19-36c9b18a4f88
  عنوان اصلی: Refactor duplicate `_serialize` functions
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/linter_checks.py::test_no_warnings", "timeout_seconds": 60}]
  - type-check موفق است [verify_method=backend_test] [verify_plan={"test_node": "tests/type_checks.py::test_type_check_passes", "timeout_seconds": 60}]

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
Duplicate logic: توابع `_serialize` در `app/routes/lists.py` و `app/routes/todo_items.py`

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
در `app/routes/lists.py` خطوط ۴۷-۶۱ و `app/routes/todo_items.py` خطوط ۳۵-۵۷، دو تابع `_serialize` تقریباً یکسان برای سریالایز کردن `TodoItem` وجود دارد. هر دو فیلدهای `id`, `content`, `description`, `is_completed`, `is_starred`, `parent_id`, `due_date`, `owner_id`, `list_ids`, `completed_at`, `created_at`, `updated_at` را سریالایز می‌کنند. تفاوت جزئی در نحوه مدیریت `subitem_ids` و `list_ids` وجود دارد. این تکرار کد باعث می‌شود

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
- نوع: refactor
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 7
  id: 5c2edeec-613f-4daf-959b-45dd19920202
  عنوان اصلی: Address over-engineering anti-pattern
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/middleware.py

📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["# (TODO|FIXME|NOTE): Revisit ValidationError handling to align with FastAPI defaults and return 422 Unprocessable Entity with structured errors."], "files_hint": ["app/middleware.p]
  - تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_validation_error_handling.py::test_pydantic_validation_error_returns_422_with_structured_body", "timeout_seconds": 60}]

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
Anti-pattern: Over-engineering

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/middleware.py:40`

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

- `app/main.py` — این فایل `middleware.py` را import می‌کند (caller)
- `app/routes/ai.py` — این فایل `middleware.py` را import می‌کند (caller)
- `app/routes/lists.py` — این فایل `middleware.py` را import می‌کند (caller)
- `app/routes/projects.py` — این فایل `middleware.py` را import می‌کند (caller)

## 🔍 Context و وضعیت فعلی
The handling of `ValidationError` maps it to `HTTP_400_BAD_REQUEST` with a generic string detail (`str(exc)`). FastAPI's default error handling for Pydantic `ValidationError` (specifically `RequestValidationError`) typically returns a `422 Unprocessable Entity` with a structured JSON body detailing the validation errors. By catching `ValidationError` here and converting it to a generic `400` with 

📁 file: app/middleware.py (line 40)

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
- `python -m py_compile app/middleware.py`
- `ruff check app/middleware.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug_fix
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
- در commit message: `merged-from: c73103a6-9711-489c-8031-020af6052a2c, 6514c312-2549-4400-81db-d1c5da2284e1, fa7a1b47-90af-46a4-983d-47cede49382c, 84de4a11-9e40-4e40-a55a-2c35d6aa05ee, 162451d8-5d39-4be1-be49-2c1021068120, a5be2def-27aa-48e9-9d19-36c9b18a4f88, 5c2edeec-613f-4daf-959b-45dd19920202`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 7 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این خوشه شامل مجموعه‌ای از رفع باگ‌های با اولویت بالا و تلاش‌های بازسازی عمومی در سرویس‌ها و مدل‌های مختلف بک‌اند است که به خطاهای پنهان، عدم تطابق قراردادها، الگوهای طراحی نامناسب و تکرار کد می‌پردازد.
🎯 theme: رفع باگ‌های حیاتی و بازسازی ساختار بک‌اند
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 7
  id: c73103a6-9711-489c-8031-020af6052a2c
  عنوان اصلی: Fix silent failures from unlogged crucial exceptions
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/list_service.py

📋 acceptance_criteria کامل:
  - نوع exception specific شده (نه bare except/catch) [verify_method=static] [verify_plan={"grep_patterns": ["except [A-Za-z]+Error:", "except [A-Za-z]+Exception:"], "files_hint": ["app/services/list_service.py"]}]
  - log با level مناسب (warning/error) + context کامل اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["logger.warning\\(", "logger.error\\("], "files_hint": ["app/services/list_service.py"]}]
  - تست unit برای edge case شکست‌خورده عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/services/test_list_service.py::test_edge_case_failure_handled", "timeout_seconds": 30}]
  - اگر failure قابل recovery است، fallback مستند شده [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
Silent failure — except/catch بدون log در مسیر crucial

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/list_service.py:192`

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

- `app/models/todo_list.py` — `list_service.py` این فایل را import می‌کند
- `app/models/todo_item.py` — `list_service.py` این فایل را import می‌کند
- `app/services/_todo_seed_data.py` — `list_service.py` این فایل را import می‌کند
- `app/main.py` — این فایل `list_service.py` را import می‌کند (caller)
- `app/routes/lists.py` — این فایل `list_service.py` را import می‌کند (caller)

## 🔍 Context و وضعیت فعلی
## 📋 شرح
در `app/services/list_service.py` (line 192) یک exception handler خاموش (مثل `except: pass`) در مسیر اصلی کد پیدا شد.

## 🔍 جزئیات
- علت: bare 'except: pass' — هیچ‌چیز handle یا log نمی‌شود

## 🤔 چرا مهم است
silent failure خطرناک‌ترین bug است — کد به‌نظر کار می‌کند ولی در شرایط لبه data drop می‌شود بدون اینکه کسی متوجه شود. production incidents معمولاً ریشه‌شان همین است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] نوع exception specific شده (نه bare except/catch)
- [ ] log با level مناسب (warning/error) + context کامل اضافه شد
- [ ] تست unit برای edge case شکست‌خورده عبور می‌کند
- [ ] اگر failure قابل recovery است، fallback مستند شده
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: مشخص کن چه exception ای واقعاً ممکن است در این نقطه رخ دهد.
گام ۲: یا (الف) آن exception را به‌صورت specific catch کن و log + decision بنویس، یا (ب) اجازه bdo bubble up.
گام ۳: تست unit برای edge case (شکست عمدی این مسیر) بنویس.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/services/list_service.py`
- `ruff check app/services/list_service.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر silent failure به raise ممکن است upstream caller را break کند که فرض می‌کرده این تابع همیشه return می‌کند. caller را هم چک کن.

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
تسک 2 از 7
  id: 6514c312-2549-4400-81db-d1c5da2284e1
  عنوان اصلی: همگام‌سازی contract فیلد status در Tasks
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": ".", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["warning", "error"], "files_hint": ["app/", "frontend/"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["error:", "Type error:"], "files_hint": ["app/", "frontend/"]}]

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
عدم تطابق contract بین backend و frontend برای فیلد status در Tasks

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
در app/routes/tasks.py خط 83، فیلد status به صورت t.status.value سریالایز می‌شود که مقادیری مانند 'todo', 'in_progress', 'completed' برمی‌گرداند. اما در frontend/src/pages/Tasks.jsx خط 7-11، STATUS_LABELS فقط سه کلید 'pending', 'in_progress', 'completed' را تعریف کرده و 'todo' را پشتیبانی نمی‌کند. این باعث می‌شود وظایف با status='todo' در frontend با label پیش‌فرض نمایش داده شوند. همچنین در Dashboard.jsx خط 42، فیلتر completed با t.status === 'completed' انجام می‌شود که با مقادیر backend همخوانی دارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. STATUS_LABELS در Tasks.jsx را به روز کنید تا 'todo' را نیز پشتیبانی کند، یا backend را تغییر دهید تا 'pending' برگرداند. راه حل بهتر: backend را تغییر دهید چون 'pending' در frontend و docs استفاده شده است.

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
تسک 3 از 7
  id: fa7a1b47-90af-46a4-983d-47cede49382c
  عنوان اصلی: یکپارچه کردن default فیلد 'background'
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - `background` در همه‌جا از یک منبع default می‌گیرد [verify_method=static] [verify_plan={"grep_patterns": ["background=[\"']card[\"']", "background=[\"']container[\"']", "DEFAULT_BACKGROUND_VALUE"], "files_hint": ["**/*.py", "**/*.js", "**/*.ts"]}]
  - تست fixture رفتار پیش‌فرض را تأیید می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_default_background.py::test_background_default_value", "timeout_seconds": 30}]
  - اگر default value تغییر کرد، migration یا backward-compat layer اضافه شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
تضاد default برای فیلد 'background'

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
## 📋 شرح
فیلد `background` در `` در دو یا چند جای مختلف default value متفاوت دارد.

## 🤔 چرا مهم است
defaults متناقض باعث می‌شود رفتار سیستم به ترتیب اجرا/import وابسته شود — bug های غیرقابل reproduce.

## 🔍 جزئیات
- علت: field background has different defaults: ['"card">', '"container">']

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] `background` در همه‌جا از یک منبع default می‌گیرد
- [ ] تست fixture رفتار پیش‌فرض را تأیید می‌کند
- [ ] اگر default value تغییر کرد، migration یا backward-compat layer اضافه شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: همه جاهایی که `background` default می‌گیرد لیست کن.
گام ۲: یک default واحد انتخاب کن و یک منبع (مثل config یا constant).
گام ۳: تست fixture برای رفتار پیش‌فرض بنویس.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر default value برای کاربران فعلی silent behavior change است — حتماً release note بنویس.

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
تسک 4 از 7
  id: 84de4a11-9e40-4e40-a55a-2c35d6aa05ee
  عنوان اصلی: Fix stale assumption anti-pattern
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/models/user.py

📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["Sanitized at the route layer with bleach.clean", "Sanitization handled at application layer", "bleach.clean\\(self\\.bio\\)"], "files_hint": ["app/models/user.py"]}]
  - تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_user_model_security.py::test_bio_display_name_sanitization_edge_case", "timeout_seconds": 60}]

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
Anti-pattern: Stale assumption

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/models/user.py:17`

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

- `app/database.py` — `user.py` این فایل را import می‌کند
- `app/routes/ai.py` — این فایل `user.py` را import می‌کند (caller)
- `app/routes/integrations.py` — این فایل `user.py` را import می‌کند (caller)
- `app/routes/notifications.py` — این فایل `user.py` را import می‌کند (caller)
- `app/routes/users.py` — این فایل `user.py` را import می‌کند (caller)

## 🔍 Context و وضعیت فعلی
The comment explicitly states that `bio` and `display_name` are 'Sanitised at the route layer with bleach.clean'. This represents a `Stale assumption` because the model itself has no enforcement mechanism for this critical security measure. If the application layer's sanitization logic (e.g., `app/routes/users.py::_sanitize_html`) is ever bypassed, removed, or not consistently applied across all d

📁 file: app/models/user.py (line 17)

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
- `python -m py_compile app/models/user.py`
- `ruff check app/models/user.py`
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
تسک 5 از 7
  id: 162451d8-5d39-4be1-be49-2c1021068120
  عنوان اصلی: Resolve broken feedback loop anti-pattern
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/main.py

📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["except QueuePool.TimeoutError", "TODO: Handle QueuePool.TimeoutError", "FIXME: QueuePool.TimeoutError feedback loop"], "files_hint": ["app/main.py"]}]
  - تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_database_timeout.py::test_queue_pool_timeout_handling", "timeout_seconds": 60}]

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
Anti-pattern: Broken feedback loop

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/main.py:150`

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

## 🔍 Context و وضعیت فعلی
Related to the incomplete database timeout handling, if `QueuePool.TimeoutError` occurs, the system will likely return a generic 500 error or crash. Without a specific handler, there's no mechanism to log the specific database connection issue, provide a user-friendly error, or trigger alerts, thus breaking the feedback loop necessary for diagnosing and responding to database resource exhaustion.

📁 file: app/main.py (line 150)

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
- `python -m py_compile app/main.py`
- `ruff check app/main.py`
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
تسک 6 از 7
  id: a5be2def-27aa-48e9-9d19-36c9b18a4f88
  عنوان اصلی: Refactor duplicate `_serialize` functions
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/linter_checks.py::test_no_warnings", "timeout_seconds": 60}]
  - type-check موفق است [verify_method=backend_test] [verify_plan={"test_node": "tests/type_checks.py::test_type_check_passes", "timeout_seconds": 60}]

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
Duplicate logic: توابع `_serialize` در `app/routes/lists.py` و `app/routes/todo_items.py`

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
در `app/routes/lists.py` خطوط ۴۷-۶۱ و `app/routes/todo_items.py` خطوط ۳۵-۵۷، دو تابع `_serialize` تقریباً یکسان برای سریالایز کردن `TodoItem` وجود دارد. هر دو فیلدهای `id`, `content`, `description`, `is_completed`, `is_starred`, `parent_id`, `due_date`, `owner_id`, `list_ids`, `completed_at`, `created_at`, `updated_at` را سریالایز می‌کنند. تفاوت جزئی در نحوه مدیریت `subitem_ids` و `list_ids` وجود دارد. این تکرار کد باعث می‌شود

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
- نوع: refactor
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 7
  id: 5c2edeec-613f-4daf-959b-45dd19920202
  عنوان اصلی: Address over-engineering anti-pattern
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/middleware.py

📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["# (TODO|FIXME|NOTE): Revisit ValidationError handling to align with FastAPI defaults and return 422 Unprocessable Entity with structured errors."], "files_hint": ["app/middleware.p]
  - تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_validation_error_handling.py::test_pydantic_validation_error_returns_422_with_structured_body", "timeout_seconds": 60}]

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
Anti-pattern: Over-engineering

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/middleware.py:40`

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

- `app/main.py` — این فایل `middleware.py` را import می‌کند (caller)
- `app/routes/ai.py` — این فایل `middleware.py` را import می‌کند (caller)
- `app/routes/lists.py` — این فایل `middleware.py` را import می‌کند (caller)
- `app/routes/projects.py` — این فایل `middleware.py` را import می‌کند (caller)

## 🔍 Context و وضعیت فعلی
The handling of `ValidationError` maps it to `HTTP_400_BAD_REQUEST` with a generic string detail (`str(exc)`). FastAPI's default error handling for Pydantic `ValidationError` (specifically `RequestValidationError`) typically returns a `422 Unprocessable Entity` with a structured JSON body detailing the validation errors. By catching `ValidationError` here and converting it to a generic `400` with 

📁 file: app/middleware.py (line 40)

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
- `python -m py_compile app/middleware.py`
- `ruff check app/middleware.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug_fix
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
- در commit message: `merged-from: c73103a6-9711-489c-8031-020af6052a2c, 6514c312-2549-4400-81db-d1c5da2284e1, fa7a1b47-90af-46a4-983d-47cede49382c, 84de4a11-9e40-4e40-a55a-2c35d6aa05ee, 162451d8-5d39-4be1-be49-2c1021068120, a5be2def-27aa-48e9-9d19-36c9b18a4f88, 5c2edeec-613f-4daf-959b-45dd19920202`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. نوع exception specific شده (نه bare except/catch) _(verify: static)_
2. log با level مناسب (warning/error) + context کامل اضافه شد _(verify: static)_
3. تست unit برای edge case شکست‌خورده عبور می‌کند _(verify: backend_test)_
4. اگر failure قابل recovery است، fallback مستند شده _(verify: manual_only)_
5. اعمال تغییر بدون شکستن تست‌های موجود _(verify: backend_test)_
6. linter بدون warning عبور می‌کند _(verify: static)_
7. type-check موفق است _(verify: static)_
8. `background` در همه‌جا از یک منبع default می‌گیرد _(verify: static)_
9. تست fixture رفتار پیش‌فرض را تأیید می‌کند _(verify: backend_test)_
10. اگر default value تغییر کرد، migration یا backward-compat layer اضافه شد _(verify: manual_only)_
11. ریشه anti-pattern تشخیص داده شد _(verify: manual_only)_
12. یا کد اصلاح شد، یا کامنت توجیهی اضافه شد _(verify: static)_
13. تست edge case نوشته شد _(verify: backend_test)_

## Task Steps

### Step 1: رفع silent failure در app/services/list_service.py:192 با exception خاص و log
**Status:** `done` (100%)
**Scope:** در app/services/list_service.py خط 192، bare except:pass را با یک exception خاص (مثلاً ValueError یا Exception خاص) جایگزین کن. log با سطح error/warning و context کامل اضافه کن. اگر failure قابل recovery است، fallback را مستند کن. خارج از scope: تغییر در callerها یا upstream. نکته حیاتی: callerها ممکن است به return value این تابع وابسته باشند.
**Excerpt:**
```
در `app/services/list_service.py` (line 192) یک exception handler خاموش (مثل `except: pass`) در مسیر اصلی کد پیدا شد.
- علت: bare 'except: pass' — هیچ‌چیز handle یا log نمی‌شود
- نوع exception specific شده (نه bare except/catch) [verify_method=static] [verify_plan={"grep_patterns": ["except [A-Za-z]+Error:", "except [A-Za-z]+Exception:"], "files_hint": ["app/services/list_service.py"]}]
- log با level مناسب (warning/error) + context کامل اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["logger.warning\(", "logger.error\("], "files_hint": ["app/services/list_service.py"]}]
```

### Step 2: نوشتن تست unit برای edge case شکست‌خورده در list_service
**Status:** `done` (100%)
**Scope:** در tests/services/test_list_service.py یک تست unit با نام test_edge_case_failure_handled بنویس که edge case شکست مسیر خط 192 را شبیه‌سازی کند و مطمئن شود exception به‌درستی log می‌شود و کد crash نمی‌کند. خارج از scope: تست integration یا end-to-end. نکته: تست باید با timeout 30 ثانیه عبور کند.
**Excerpt:**
```
- تست unit برای edge case شکست‌خورده عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/services/test_list_service.py::test_edge_case_failure_handled", "timeout_seconds": 30}]
- اگر failure قابل recovery است، fallback مستند شده [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
```

### Step 3: بررسی دستی fallback مستند برای failure قابل recovery در list_service
**Status:** `done` (100%)
**Scope:** بررسی دستی که آیا failure در خط 192 list_service.py قابل recovery است یا خیر. اگر هست، fallback را مستند کن (مثلاً در کامنت یا docstring). خارج از scope: تغییر کد برای اضافه کردن fallback. نکته: این مرحله manual_only است و نیاز به قضاوت انسانی دارد.
**Excerpt:**
```
- اگر failure قابل recovery است، fallback مستند شده [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
```

### Step 4: همگام‌سازی contract فیلد status در Tasks بین backend و frontend
**Status:** `done` (100%)
**Scope:** رفع عدم تطابق contract فیلد status بین backend (app/routes/tasks.py) که 'todo', 'in_progress', 'completed' برمی‌گرداند و frontend (frontend/src/pages/Tasks.jsx) که فقط 'pending', 'in_progress', 'completed' را پشتیبانی می‌کند. راه حل: backend را تغییر بده تا 'pending' برگرداند چون در frontend و docs استفاده شده. خارج از scope: تغییر Dashboard.jsx. نکته: تست‌های موجود نباید بشکنند.
**Excerpt:**
```
در app/routes/tasks.py خط 83، فیلد status به صورت t.status.value سریالایز می‌شود که مقادیری مانند 'todo', 'in_progress', 'completed' برمی‌گرداند. اما در frontend/src/pages/Tasks.jsx خط 7-11، STATUS_LABELS فقط سه کلید 'pending', 'in_progress', 'completed' را تعریف کرده و 'todo' را پشتیبانی نمی‌کند.
- اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": ".", "timeout_seconds": 120}]
- linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["warning", "error"], "files_hint": ["app/", "frontend/"]}]
```

### Step 5: اجرای linter و type-check برای همگام‌سازی status
**Status:** `done` (100%)
**Scope:** پس از تغییر backend برای برگرداندن 'pending' به جای 'todo'، linter (ruff) و type-check (mypy) را اجرا کن تا مطمئن شوی هیچ warning یا error جدیدی اضافه نشده. خارج از scope: تغییر frontend type definitions. نکته: این مرحله verification است.
**Excerpt:**
```
- linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["warning", "error"], "files_hint": ["app/", "frontend/"]}]
- type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["error:", "Type error:"], "files_hint": ["app/", "frontend/"]}]
```

### Step 6: یکپارچه‌سازی default فیلد 'background' از یک منبع واحد
**Status:** `done` (100%)
**Scope:** همه جاهایی که فیلد 'background' default value می‌گیرد (در فایل‌های .py، .js، .ts) را شناسایی کن. یک منبع واحد (مثلاً constant در config یا یک متغیر سراسری) برای default value انتخاب کن و همه جا را به آن ارجاع بده. خارج از scope: تغییر migration دیتابیس. نکته: default value فعلی 'card' یا 'container' است — یکی را به‌عنوان واحد انتخاب کن.
**Excerpt:**
```
فیلد `background` در `` در دو یا چند جای مختلف default value متفاوت دارد.
- `background` در همه‌جا از یک منبع default می‌گیرد [verify_method=static] [verify_plan={"grep_patterns": ["background=[\"']card[\"']", "background=[\"']container[\"']", "DEFAULT_BACKGROUND_VALUE"], "files_hint": ["**/*.py", "**/*.js", "**/*.ts"]}]
- علت: field background has different defaults: ['"card">', '"container">']
```

### Step 7: نوشتن تست fixture برای رفتار پیش‌فرض background
**Status:** `done` (100%)
**Scope:** در tests/test_default_background.py یک تست با نام test_background_default_value بنویس که تأیید کند فیلد background در همه مدل‌ها از default value واحد استفاده می‌کند. خارج از scope: تست integration. نکته: timeout 30 ثانیه.
**Excerpt:**
```
- تست fixture رفتار پیش‌فرض را تأیید می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_default_background.py::test_background_default_value", "timeout_seconds": 30}]
```

### Step 8: بررسی دستی backward-compat برای تغییر default value background
**Status:** `done` (100%)
**Scope:** بررسی دستی که اگر default value background تغییر کرد، migration یا backward-compat layer اضافه شود. اگر تغییری لازم نیست، مستند کن. خارج از scope: پیاده‌سازی migration. نکته: manual_only.
**Excerpt:**
```
- اگر default value تغییر کرد، migration یا backward-compat layer اضافه شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
```

### Step 9: تشخیص ریشه anti-pattern Stale assumption در app/models/user.py
**Status:** `done` (100%)
**Scope:** در app/models/user.py خط 17، کامنت 'Sanitised at the route layer with bleach.clean' نشان‌دهنده Stale assumption است. ریشه anti-pattern را تشخیص بده: مدل هیچ enforcement مکانیزمی برای sanitization ندارد و اگر route layer bypass شود، امنیت می‌شکند. خارج از scope: تغییر route layer. نکته: manual_only.
**Excerpt:**
```
The comment explicitly states that `bio` and `display_name` are 'Sanitised at the route layer with bleach.clean'. This represents a `Stale assumption` because the model itself has no enforcement mechanism for this critical security measure.
- ریشه anti-pattern تشخیص داده شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
📁 file: app/models/user.py (line 17)
```

### Step 10: اصلاح یا مستندسازی Stale assumption در app/models/user.py
**Status:** `done` (100%)
**Scope:** یا کد app/models/user.py را اصلاح کن (مثلاً اضافه کردن sanitization در setter) یا کامنت توجیهی اضافه کن که توضیح دهد چرا این assumption پذیرفته شده است. خارج از scope: تغییر route layer. نکته: grep برای 'Sanitized at the route layer with bleach.clean' یا 'Sanitization handled at application layer' یا 'bleach.clean(self.bio)'.
**Excerpt:**
```
- یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["Sanitized at the route layer with bleach.clean", "Sanitization handled at application layer", "bleach.clean\(self\.bio\)"], "files_hint": ["app/models/user.py"]}]
```

### Step 11: نوشتن تست edge case برای sanitization در user model
**Status:** `done` (100%)
**Scope:** در tests/test_user_model_security.py یک تست با نام test_bio_display_name_sanitization_edge_case بنویس که edge caseهای sanitization (مثل HTML injection در bio و display_name) را تست کند. خارج از scope: تست route layer. نکته: timeout 60 ثانیه.
**Excerpt:**
```
- تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_user_model_security.py::test_bio_display_name_sanitization_edge_case", "timeout_seconds": 60}]
```

### Step 12: تشخیص ریشه anti-pattern Broken feedback loop در app/main.py
**Status:** `done` (100%)
**Scope:** در app/main.py خط 150، عدم handling QueuePool.TimeoutError باعث broken feedback loop می‌شود. ریشه anti-pattern را تشخیص بده: بدون handler خاص، خطا به 500 generic تبدیل می‌شود و feedback loop برای تشخیص مشکل قطع می‌شود. خارج از scope: پیاده‌سازی handler. نکته: manual_only.
**Excerpt:**
```
Related to the incomplete database timeout handling, if `QueuePool.TimeoutError` occurs, the system will likely return a generic 500 error or crash. Without a specific handler, there's no mechanism to log the specific database connection issue, provide a user-friendly error, or trigger alerts, thus breaking the feedback loop.
- ریشه anti-pattern تشخیص داده شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
📁 file: app/main.py (line 150)
```

### Step 13: اصلاح یا مستندسازی Broken feedback loop در app/main.py
**Status:** `done` (100%)
**Scope:** یا کد app/main.py را اصلاح کن (مثلاً اضافه کردن except QueuePool.TimeoutError با log و user-friendly error) یا کامنت توجیهی اضافه کن. خارج از scope: تغییر middleware. نکته: grep برای 'except QueuePool.TimeoutError' یا 'TODO: Handle QueuePool.TimeoutError' یا 'FIXME: QueuePool.TimeoutError feedback loop'.
**Excerpt:**
```
- یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["except QueuePool.TimeoutError", "TODO: Handle QueuePool.TimeoutError", "FIXME: QueuePool.TimeoutError feedback loop"], "files_hint": ["app/main.py"]}]
```

### Step 14: نوشتن تست edge case برای QueuePool.TimeoutError handling
**Status:** `done` (100%)
**Scope:** در tests/test_database_timeout.py یک تست با نام test_queue_pool_timeout_handling بنویس که edge case timeout دیتابیس را شبیه‌سازی کند و مطمئن شود handler به‌درستی کار می‌کند. خارج از scope: تست integration. نکته: timeout 60 ثانیه.
**Excerpt:**
```
- تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_database_timeout.py::test_queue_pool_timeout_handling", "timeout_seconds": 60}]
```

### Step 15: رفع duplicate _serialize functions در app/routes/lists.py و app/routes/todo_items.py
**Status:** `done` (100%)
**Scope:** دو تابع _serialize تقریباً یکسان در app/routes/lists.py (خطوط 47-61) و app/routes/todo_items.py (خطوط 35-57) را به یک تابع مشترک refactor کن. فیلدهای مشترک: id, content, description, is_completed, is_starred, parent_id, due_date, owner_id, list_ids, completed_at, created_at, updated_at. تفاوت در subitem_ids و list_ids را با پارامتر مدیریت کن. خارج از scope: تغییر serialization logic. نکته: تست‌های موجود نباید بشکنند.
**Excerpt:**
```
در `app/routes/lists.py` خطوط ۴۷-۶۱ و `app/routes/todo_items.py` خطوط ۳۵-۵۷، دو تابع `_serialize` تقریباً یکسان برای سریالایز کردن `TodoItem` وجود دارد. هر دو فیلدهای `id`, `content`, `description`, `is_completed`, `is_starred`, `parent_id`, `due_date`, `owner_id`, `list_ids`, `completed_at`, `created_at`, `updated_at` را سریالایز می‌کنند.
- اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
```

### Step 16: اجرای linter بدون warning برای refactor _serialize
**Status:** `done` (100%)
**Scope:** پس از refactor، linter (ruff) را اجرا کن تا مطمئن شوی هیچ warning جدیدی اضافه نشده. خارج از scope: رفع warningهای موجود قبلی. نکته: از tests/linter_checks.py::test_no_warnings استفاده کن.
**Excerpt:**
```
- linter بدون warning عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/linter_checks.py::test_no_warnings", "timeout_seconds": 60}]
```

### Step 17: اجرای type-check موفق برای refactor _serialize
**Status:** `done` (100%)
**Scope:** پس از refactor، type-check (mypy) را اجرا کن تا مطمئن شوی هیچ type error جدیدی اضافه نشده. خارج از scope: رفع type errorهای موجود قبلی. نکته: از tests/type_checks.py::test_type_check_passes استفاده کن.
**Excerpt:**
```
- type-check موفق است [verify_method=backend_test] [verify_plan={"test_node": "tests/type_checks.py::test_type_check_passes", "timeout_seconds": 60}]
```

### Step 18: تشخیص ریشه anti-pattern Over-engineering در app/middleware.py
**Status:** `done` (100%)
**Scope:** در app/middleware.py خط 40، handling ValidationError به HTTP_400_BAD_REQUEST با generic string detail، over-engineering است. FastAPI به‌طور پیش‌فرض 422 با structured body برمی‌گرداند. ریشه anti-pattern را تشخیص بده. خارج از scope: تغییر handler. نکته: manual_only.
**Excerpt:**
```
The handling of `ValidationError` maps it to `HTTP_400_BAD_REQUEST` with a generic string detail (`str(exc)`). FastAPI's default error handling for Pydantic `ValidationError` (specifically `RequestValidationError`) typically returns a `422 Unprocessable Entity` with a structured JSON body.
- ریشه anti-pattern تشخیص داده شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
📁 file: app/middleware.py (line 40)
```

### Step 19: اصلاح یا مستندسازی Over-engineering در app/middleware.py
**Status:** `done` (100%)
**Scope:** یا کد app/middleware.py را اصلاح کن (مثلاً حذف handler اضافی و اجازه bubble up به default FastAPI) یا کامنت توجیهی اضافه کن. خارج از scope: تغییر route layer. نکته: grep برای '# (TODO|FIXME|NOTE): Revisit ValidationError handling to align with FastAPI defaults and return 422 Unprocessable Entity with structured errors.'
**Excerpt:**
```
- یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["# (TODO|FIXME|NOTE): Revisit ValidationError handling to align with FastAPI defaults and return 422 Unprocessable Entity with structured errors."], "files_hint": ["app/middleware.py"]}]
```

### Step 20: نوشتن تست edge case برای ValidationError handling در middleware
**Status:** `done` (100%)
**Scope:** در tests/test_validation_error_handling.py یک تست با نام test_pydantic_validation_error_returns_422_with_structured_body بنویس که edge case ValidationError را شبیه‌سازی کند و مطمئن شود response 422 با structured body برگردانده می‌شود. خارج از scope: تست سایر error handling‌ها. نکته: timeout 60 ثانیه.
**Excerpt:**
```
- تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_validation_error_handling.py::test_pydantic_validation_error_returns_422_with_structured_body", "timeout_seconds": 60}]
```

### Step 21: بررسی دستی callerهای list_service برای compatibility پس از تغییر exception handling
**Status:** `done` (100%)
**Scope:** بررسی دستی callerهای list_service (app/main.py, app/routes/lists.py) که ممکن است به return value تابع وابسته باشند. اگر تغییر exception handling به raise منجر شود، callerها را به‌روز کن. خارج از scope: تغییر logic callerها. نکته: manual_only.
**Excerpt:**
```
تغییر silent failure به raise ممکن است upstream caller را break کند که فرض می‌کرده این تابع همیشه return می‌کند. caller را هم چک کن.
- ⚠️ ریسک‌ها و موارد احتیاط
```

### Step 22: اجرای py_compile برای list_service.py پس از تغییر
**Status:** `done` (100%)
**Scope:** پس از تغییر exception handling در app/services/list_service.py، python -m py_compile را اجرا کن تا مطمئن شوی syntax error وجود ندارد. خارج از scope: اجرای تست. نکته: مرحله verification.
**Excerpt:**
```
- `python -m py_compile app/services/list_service.py`
- 🧪 دستورات اعتبارسنجی
```

### Step 23: اجرای ruff check برای list_service.py پس از تغییر
**Status:** `done` (100%)
**Scope:** پس از تغییر exception handling در app/services/list_service.py، ruff check را اجرا کن تا مطمئن شوی linting issue وجود ندارد. خارج از scope: رفع warningهای موجود قبلی. نکته: مرحله verification.
**Excerpt:**
```
- `ruff check app/services/list_service.py`
- 🧪 دستورات اعتبارسنجی
```

### Step 24: اجرای pytest برای list_service پس از تغییر
**Status:** `done` (100%)
**Scope:** پس از تغییر exception handling در app/services/list_service.py، pytest -x را اجرا کن تا مطمئن شوی همه تست‌ها عبور می‌کنند. خارج از scope: تست integration. نکته: مرحله verification نهایی.
**Excerpt:**
```
- `pytest -x`
- 🧪 دستورات اعتبارسنجی
```

### Step 25: بررسی دستی release note برای تغییر default value background
**Status:** `done` (100%)
**Scope:** بررسی دستی که اگر default value background تغییر کرد، release note نوشته شود. خارج از scope: نوشتن release note. نکته: manual_only.
**Excerpt:**
```
تغییر default value برای کاربران فعلی silent behavior change است — حتماً release note بنویس.
- ⚠️ ریسک‌ها و موارد احتیاط
```

### Step 26: اجرای py_compile برای user.py پس از تغییر
**Status:** `done` (100%)
**Scope:** پس از تغییر در app/models/user.py، python -m py_compile را اجرا کن تا مطمئن شوی syntax error وجود ندارد. خارج از scope: اجرای تست. نکته: مرحله verification.
**Excerpt:**
```
- `python -m py_compile app/models/user.py`
- 🧪 دستورات اعتبارسنجی
```

### Step 27: اجرای ruff check برای user.py پس از تغییر
**Status:** `done` (100%)
**Scope:** پس از تغییر در app/models/user.py، ruff check را اجرا کن تا مطمئن شوی linting issue وجود ندارد. خارج از scope: رفع warningهای موجود قبلی. نکته: مرحله verification.
**Excerpt:**
```
- `ruff check app/models/user.py`
- 🧪 دستورات اعتبارسنجی
```

### Step 28: اجرای pytest برای user model پس از تغییر
**Status:** `done` (100%)
**Scope:** پس از تغییر در app/models/user.py، pytest -x را اجرا کن تا مطمئن شوی همه تست‌ها عبور می‌کنند. خارج از scope: تست integration. نکته: مرحله verification نهایی.
**Excerpt:**
```
- `pytest -x`
- 🧪 دستورات اعتبارسنجی
```

### Step 29: اجرای py_compile برای main.py پس از تغییر
**Status:** `done` (100%)
**Scope:** پس از تغییر در app/main.py، python -m py_compile را اجرا کن تا مطمئن شوی syntax error وجود ندارد. خارج از scope: اجرای تست. نکته: مرحله verification.
**Excerpt:**
```
- `python -m py_compile app/main.py`
- 🧪 دستورات اعتبارسنجی
```

### Step 30: اجرای ruff check برای main.py پس از تغییر
**Status:** `done` (100%)
**Scope:** پس از تغییر در app/main.py، ruff check را اجرا کن تا مطمئن شوی linting issue وجود ندارد. خارج از scope: رفع warningهای موجود قبلی. نکته: مرحله verification.
**Excerpt:**
```
- `ruff check app/main.py`
- 🧪 دستورات اعتبارسنجی
```

### Step 31: اجرای pytest برای main.py پس از تغییر
**Status:** `done` (100%)
**Scope:** پس از تغییر در app/main.py، pytest -x را اجرا کن تا مطمئن شوی همه تست‌ها عبور می‌کنند. خارج از scope: تست integration. نکته: مرحله verification نهایی.
**Excerpt:**
```
- `pytest -x`
- 🧪 دستورات اعتبارسنجی
```

### Step 32: اجرای py_compile برای middleware.py پس از تغییر
**Status:** `done` (100%)
**Scope:** پس از تغییر در app/middleware.py، python -m py_compile را اجرا کن تا مطمئن شوی syntax error وجود ندارد. خارج از scope: اجرای تست. نکته: مرحله verification.
**Excerpt:**
```
- `python -m py_compile app/middleware.py`
- 🧪 دستورات اعتبارسنجی
```

### Step 33: اجرای ruff check برای middleware.py پس از تغییر
**Status:** `done` (100%)
**Scope:** پس از تغییر در app/middleware.py، ruff check را اجرا کن تا مطمئن شوی linting issue وجود ندارد. خارج از scope: رفع warningهای موجود قبلی. نکته: مرحله verification.
**Excerpt:**
```
- `ruff check app/middleware.py`
- 🧪 دستورات اعتبارسنجی
```

### Step 34: اجرای pytest برای middleware.py پس از تغییر
**Status:** `done` (100%)
**Scope:** پس از تغییر در app/middleware.py، pytest -x را اجرا کن تا مطمئن شوی همه تست‌ها عبور می‌کنند. خارج از scope: تست integration. نکته: مرحله verification نهایی.
**Excerpt:**
```
- `pytest -x`
- 🧪 دستورات اعتبارسنجی
```

### Step 35: اجرای pytest کامل برای تسک 1 (list_service)
**Status:** `done` (100%)
**Scope:** اجرای کامل pytest برای اطمینان از اینکه همه تست‌های مرتبط با list_service عبور می‌کنند. خارج از scope: تست frontend. نکته: timeout 120 ثانیه.
**Excerpt:**
```
- هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
```

### Step 36: اجرای linter برای تسک 1 (list_service)
**Status:** `done` (100%)
**Scope:** اجرای linter (ruff) برای اطمینان از اینکه هیچ warning جدیدی اضافه نشده. خارج از scope: رفع warningهای موجود قبلی. نکته: مرحله verification.
**Excerpt:**
```
- linter بدون warning عبور می‌کند
- ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
```

### Step 37: اجرای type-check برای تسک 1 (list_service)
**Status:** `done` (100%)
**Scope:** اجرای type-check (mypy) برای اطمینان از اینکه هیچ type error جدیدی اضافه نشده. خارج از scope: رفع type errorهای موجود قبلی. نکته: مرحله verification.
**Excerpt:**
```
- type-check موفق است (`tsc --noEmit` / `mypy`)
- ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
```

### Step 38: اجرای pytest کامل برای تسک 2 (status contract)
**Status:** `done` (100%)
**Scope:** اجرای کامل pytest برای اطمینان از اینکه همه تست‌های مرتبط با status contract عبور می‌کنند. خارج از scope: تست frontend. نکته: timeout 120 ثانیه.
**Excerpt:**
```
- اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": ".", "timeout_seconds": 120}]
- ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
```

### Step 39: اجرای npm run build برای تسک 2 (status contract)
**Status:** `done` (100%)
**Scope:** اجرای npm run build برای اطمینان از اینکه build frontend بدون error انجام می‌شود. خارج از scope: تست unit frontend. نکته: مرحله verification.
— [merged] اجرای npm run lint برای اطمینان از اینکه linting frontend بدون warning انجام می‌شود. خارج از scope: رفع warningهای موجود قبلی. نکته: مرحله verification.
**Excerpt:**
```
- `npm run build`
- 🧪 دستورات اعتبارسنجی
```

### Step 40: اجرای pytest کامل برای تسک 3 (background default)
**Status:** `done` (100%)
**Scope:** اجرای کامل pytest برای اطمینان از اینکه همه تست‌های مرتبط با background default عبور می‌کنند. خارج از scope: تست frontend. نکته: مرحله verification.
**Excerpt:**
```
- `pytest`
- 🧪 دستورات اعتبارسنجی
```

### Step 41: اجرای npm run build برای تسک 3 (background default)
**Status:** `done` (100%)
**Scope:** اجرای npm run build برای اطمینان از اینکه build frontend بدون error انجام می‌شود. خارج از scope: تست unit frontend. نکته: مرحله verification.
— [merged] اجرای npm run lint برای اطمینان از اینکه linting frontend بدون warning انجام می‌شود. خارج از scope: رفع warningهای موجود قبلی. نکته: مرحله verification.
**Excerpt:**
```
- `npm run build`
- 🧪 دستورات اعتبارسنجی
```

### Step 42: اجرای pytest کامل برای تسک 6 (refactor _serialize)
**Status:** `done` (100%)
**Scope:** اجرای کامل pytest برای اطمینان از اینکه همه تست‌های مرتبط با refactor _serialize عبور می‌کنند. خارج از scope: تست frontend. نکته: timeout 120 ثانیه.
**Excerpt:**
```
- اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
- ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
```

### Step 43: اجرای npm run build برای تسک 6 (refactor _serialize)
**Status:** `done` (100%)
**Scope:** اجرای npm run build برای اطمینان از اینکه build frontend بدون error انجام می‌شود. خارج از scope: تست unit frontend. نکته: مرحله verification.
— [merged] اجرای npm run lint برای اطمینان از اینکه linting frontend بدون warning انجام می‌شود. خارج از scope: رفع warningهای موجود قبلی. نکته: مرحله verification.
**Excerpt:**
```
- `npm run build`
- 🧪 دستورات اعتبارسنجی
```
