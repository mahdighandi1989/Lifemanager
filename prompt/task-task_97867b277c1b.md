---
task_id: task_97867b277c1b
title: پیاده‌سازی معیارهای عملکردی و پاکسازی کد AI
type: other
priority: critical
execution_priority: 1300
status: awaiting_review
external_status: pending
verification_status: partial
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-26T23:19:08.370502+00:00'
updated_at: '2026-05-28T11:52:55.477049+00:00'
tags:
- consolidated
- post_verify_merge
---

# پیاده‌سازی معیارهای عملکردی و پاکسازی کد AI

## Raw Idea

🧬 این یک تسک تلفیقی است — از 3 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها شامل پیاده‌سازی معیارهای عملکردی و مکانیزم‌های بازخورد برای هسته هوش مصنوعی و همچنین پاکسازی کدها و endpointهای بلااستفاده مرتبط با آن هستند.
🎯 theme: بهبود و پاکسازی سیستم هوش مصنوعی
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 3
  id: e374a41e-09c7-4a27-8a4d-cbd3befcd47a
  عنوان اصلی: پیاده‌سازی معیارهای عملکردی هسته هوش مصنوعی
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - outcome target به‌صورت measurable بازنویسی شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - کد تغییر کرد تا outcome target محقق شود [verify_method=static] [verify_plan={"grep_patterns": ["ai_response_processor", "ai_feedback_logger", "ai_performance_tracker"], "files_hint": ["backend/app/ai_service.py", "backend/app/metrics.py", "backend/app/logging.py"]}]
  - test E2E که outcome را اندازه می‌گیرد عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/e2e/test_ai_performance.py::test_ai_outcome_metrics", "timeout_seconds": 120}]
  - metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد [verify_method=static] [verify_plan={"grep_patterns": ["ai_response_latency_ms", "ai_response_quality_score", "log.info.*ai_performance", "metric_collector.record_ai_latency", "metric_collector.record_ai_quality"], "files_hint": ["backe]

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
[Effectiveness] عدم وجود معیارهای عملکردی هسته هوش مصنوعی (AI)

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
## 🎯 هدف مطلوب (outcome target)
دستیابی به میانگین امتیاز کیفیت پاسخ AI برابر با 4.0/5.0 (بر اساس بازخورد کاربر یا ارزیابی داخلی) و حفظ تاخیر پاسخ AI زیر 500 میلی‌ثانیه برای 95% درخواست‌ها.

## 📊 وضعیت فعلی
سیستم نرخ خطای عملیاتی 0% را نشان می‌دهد که حاکی از پایداری بالای کامپوننت‌های زیرساختی است. با این حال، هیچ داده‌ای برای ارزیابی عملکرد، کیفیت یا اثربخشی قابلیت اصلی چت AI موجود نیست.

## 🛠 اقدام پیشنهادی
پیاده‌سازی لاگ‌گیری و مانیتورینگ جامع برای معیارهای خاص AI، شامل تاخیر پاسخ، میزان مصرف توکن، و مکانیزم‌هایی برای جمع‌آوری بازخورد کاربر در مورد کیفیت پاسخ (مانند لایک/دیسلایک، امتیازدهی صریح). تعیین یک خط مبنا و هدف برای این معیارها.

## ⚙️ ماهیت این finding
این یک effectiveness issue است — کد ممکن است syntactically کار کند ولی **outcome مطلوب** (مثل: «فرم باید ایمیل ارسال کند») حاصل نمی‌شود. verify باید outcome را اندازه بگیرد، نه فقط وجود فایل/خط.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] outcome target به‌صورت measurable بازنویسی شد
- [ ] کد تغییر کرد تا outcome target محقق شود
- [ ] test E2E که outcome را اندازه می‌گیرد عبور می‌کند
- [ ] metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: outcome target را به‌صورت قابل اندازه‌گیری بازنویسی کن (مثلاً: «email send rate > 95% در ۱۰۰ تلاش»).
گام ۲: کد را تغییر بده تا outcome محقق شود.
گام ۳: یک end-to-end test که outcome را اندازه می‌گیرد بنویس.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest -k 'outcome or e2e'`

## ⚠️ ریسک‌ها و موارد احتیاط
بهبود outcome ممکن است latency یا cost را افزایش دهد — قبل/بعد metric ها را compare کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: logic_audit
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  - پیاده‌سازی لاگ‌گیری مصرف توکن AI

🔧 مراحل remaining که در super-task باید انجام شوند:
  - پیاده‌سازی لاگ‌گیری تاخیر پاسخ AI — لاگ‌گیری زمان شروع/پایان و محاسبه تاخیر پاسخ AI به میلی‌ثانیه با timestamp و request_id
  - پیاده‌سازی مکانیزم بازخورد لایک/دیسلایک برای پاسخ‌های AI — دکمه‌های لایک/دیسلایک در UI چت، endpoint ثبت بازخورد، ذخیره در دیتابیس
  - پیاده‌سازی مکانیزم امتیازدهی صریح (1-5) برای پاسخ‌های AI — امتیازدهی عددی ۱-۵ در UI، endpoint ثبت امتیاز، ذخیره در دیتابیس
  - تعیین خط مبنا و هدف برای معیارهای AI — تعیین و ثبت خط مبنا و اهداف کمی برای تاخیر و مصرف توکن در config
  - پیاده‌سازی ذخیره‌سازی و بازیابی معیارهای AI در دیتابیس — مدل دیتابیس برای ذخیره تاخیر، توکن، بازخورد و CRUD اولیه
  - ایجاد endpoint API برای دریافت آمار معیارهای AI — endpoint GET برای بازگرداندن آمار خلاصه معیارهای AI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 3
  id: ef6adabf-2d02-475e-88aa-997c388b4023
  عنوان اصلی: حذف کد مرده `generate_text` و اصلاح endpoint
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/ai.py

📋 acceptance_criteria کامل:
  - import generate_text از فایل ai.py حذف شود [verify_method=static] [verify_plan={"grep_patterns": ["^from app.services.ai_service import generate_text"], "files_hint": ["app/routes/ai.py"]}]
  - endpoint /ai/generate از AIService استفاده کند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/ai/generate", "headers": {"Content-Type": "application/json"}, "json_body": {"prompt": "Write a short story about a cat."}, "expected_status": 200, "required_fields": ]
  - هیچ خطای import در زمان اجرا رخ ندهد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_ai_service.py::test_ai_service_initializes_without_import_errors", "timeout_seconds": 60}]

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
Dead code: تابع `generate_text` در `app/services/ai_service.py` هرگز فراخوانی نمی‌شود

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/ai.py:26-27` — `import generate_text` — import dead code
  ```python
  from app.services.ai_service import AIService, generate_text
  ```
- `app/routes/ai.py:74-79` — `generate_text call` — استفاده از تابعی که وجود خارجی ندارد
  ```python
  result = await generate_text(
      prompt=payload.prompt,
      max_tokens=payload.max_tokens or 512,
      temperature=payload.temperature or 0.7,
  )
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
FastAPI + Python async

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/services/ai_service.py` (سطر 1) — فایلی که supposed to contain generate_text
- `app/database.py` — `ai.py` این فایل را import می‌کند
- `app/dependencies/auth.py` — `ai.py` این فایل را import می‌کند
- `app/middleware.py` — `ai.py` این فایل را import می‌کند
- `app/models/user.py` — `ai.py` این فایل را import می‌کند
- `app/routes/__init__.py` — این فایل `ai.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این تابع تنها در یک route استفاده می‌شود و هیچ وابستگی دیگری ندارد.

## 🔍 Context و وضعیت فعلی
در `app/routes/ai.py` خط ۷۴، تابع `generate_text` از ماژول `app.services.ai_service` import شده و در endpoint `/ai/generate` استفاده می‌شود. اما بررسی محتوای فایل `app/services/ai_service.py` نشان می‌دهد که این تابع تعریف نشده است (فایل در اسکن موجود نیست، اما import آن در route نشان‌دهنده وجود آن است). همچنین تابع `generate_text` در هیچ جای دیگری از پروژه استفاده نمی‌شود و تنها در همین route import شده است. این یک dead code است که باعث سردرگمی و خطاهای احتمالی در زمان اجرا می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] import generate_text از فایل ai.py حذف شود
- [ ] endpoint /ai/generate از AIService استفاده کند
- [ ] هیچ خطای import در زمان اجرا رخ ندهد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. حذف import و استفاده از `generate_text` در `app/routes/ai.py` و جایگزینی با فراخوانی `ai_service.generate()` یا حذف کامل endpoint اگر غیرفعال است.

## 💡 نمونه‌های قبل/بعد
**رفع dead code**

_قبل:_
```
from app.services.ai_service import AIService, generate_text

@router.post("/generate")
async def generate(payload):
    result = await generate_text(...)
```

_بعد:_
```
from app.services.ai_service import AIService

@router.post("/generate")
async def generate(payload, ai_service: AIService = Depends(get_ai_service)):
    result = await ai_service.generate(...)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_ai.py -v`
- `curl -X POST http://localhost:8000/ai/generate -H 'Content-Type: application/json' -d '{"prompt":"test"}'`

## ⚠️ ریسک‌ها و موارد احتیاط
کم — فقط یک import و یک فراخوانی تغییر می‌کند

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
تسک 3 از 3
  id: 69704426-46ed-4dda-976f-79070c807694
  عنوان اصلی: رسیدگی به endpoint بلااستفاده: POST /generate
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/ai.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `POST /generate` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["/generate:", "test_generate", "client.post(\"/generate\")"], "files_hint": ["openapi.yaml", "tests/"]}]

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
endpoint بک‌اند بلااستفاده: POST /generate

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/ai.py`

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

- `app/database.py` — `ai.py` این فایل را import می‌کند
- `app/dependencies/auth.py` — `ai.py` این فایل را import می‌کند
- `app/middleware.py` — `ai.py` این فایل را import می‌کند
- `app/models/user.py` — `ai.py` این فایل را import می‌کند
- `app/routes/__init__.py` — این فایل `ai.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
endpoint `POST /generate` در `app/routes/ai.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `POST`
- path: `/generate`
- فایل: `app/routes/ai.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `POST /generate` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/generate` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
گام ۲: اگر internal است، در README یا OpenAPI tag `internal` بزن.
گام ۳: اگر منسوخ است، حذف کن (شامل تست‌ها).

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/routes/ai.py`
- `ruff check app/routes/ai.py`
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
- در commit message: `merged-from: e374a41e-09c7-4a27-8a4d-cbd3befcd47a, ef6adabf-2d02-475e-88aa-997c388b4023, 69704426-46ed-4dda-976f-79070c807694`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 3 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها شامل پیاده‌سازی معیارهای عملکردی و مکانیزم‌های بازخورد برای هسته هوش مصنوعی و همچنین پاکسازی کدها و endpointهای بلااستفاده مرتبط با آن هستند.
🎯 theme: بهبود و پاکسازی سیستم هوش مصنوعی
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 3
  id: e374a41e-09c7-4a27-8a4d-cbd3befcd47a
  عنوان اصلی: پیاده‌سازی معیارهای عملکردی هسته هوش مصنوعی
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - outcome target به‌صورت measurable بازنویسی شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - کد تغییر کرد تا outcome target محقق شود [verify_method=static] [verify_plan={"grep_patterns": ["ai_response_processor", "ai_feedback_logger", "ai_performance_tracker"], "files_hint": ["backend/app/ai_service.py", "backend/app/metrics.py", "backend/app/logging.py"]}]
  - test E2E که outcome را اندازه می‌گیرد عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/e2e/test_ai_performance.py::test_ai_outcome_metrics", "timeout_seconds": 120}]
  - metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد [verify_method=static] [verify_plan={"grep_patterns": ["ai_response_latency_ms", "ai_response_quality_score", "log.info.*ai_performance", "metric_collector.record_ai_latency", "metric_collector.record_ai_quality"], "files_hint": ["backe]

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
[Effectiveness] عدم وجود معیارهای عملکردی هسته هوش مصنوعی (AI)

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
## 🎯 هدف مطلوب (outcome target)
دستیابی به میانگین امتیاز کیفیت پاسخ AI برابر با 4.0/5.0 (بر اساس بازخورد کاربر یا ارزیابی داخلی) و حفظ تاخیر پاسخ AI زیر 500 میلی‌ثانیه برای 95% درخواست‌ها.

## 📊 وضعیت فعلی
سیستم نرخ خطای عملیاتی 0% را نشان می‌دهد که حاکی از پایداری بالای کامپوننت‌های زیرساختی است. با این حال، هیچ داده‌ای برای ارزیابی عملکرد، کیفیت یا اثربخشی قابلیت اصلی چت AI موجود نیست.

## 🛠 اقدام پیشنهادی
پیاده‌سازی لاگ‌گیری و مانیتورینگ جامع برای معیارهای خاص AI، شامل تاخیر پاسخ، میزان مصرف توکن، و مکانیزم‌هایی برای جمع‌آوری بازخورد کاربر در مورد کیفیت پاسخ (مانند لایک/دیسلایک، امتیازدهی صریح). تعیین یک خط مبنا و هدف برای این معیارها.

## ⚙️ ماهیت این finding
این یک effectiveness issue است — کد ممکن است syntactically کار کند ولی **outcome مطلوب** (مثل: «فرم باید ایمیل ارسال کند») حاصل نمی‌شود. verify باید outcome را اندازه بگیرد، نه فقط وجود فایل/خط.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] outcome target به‌صورت measurable بازنویسی شد
- [ ] کد تغییر کرد تا outcome target محقق شود
- [ ] test E2E که outcome را اندازه می‌گیرد عبور می‌کند
- [ ] metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: outcome target را به‌صورت قابل اندازه‌گیری بازنویسی کن (مثلاً: «email send rate > 95% در ۱۰۰ تلاش»).
گام ۲: کد را تغییر بده تا outcome محقق شود.
گام ۳: یک end-to-end test که outcome را اندازه می‌گیرد بنویس.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest -k 'outcome or e2e'`

## ⚠️ ریسک‌ها و موارد احتیاط
بهبود outcome ممکن است latency یا cost را افزایش دهد — قبل/بعد metric ها را compare کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: logic_audit
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  - پیاده‌سازی لاگ‌گیری مصرف توکن AI

🔧 مراحل remaining که در super-task باید انجام شوند:
  - پیاده‌سازی لاگ‌گیری تاخیر پاسخ AI — لاگ‌گیری زمان شروع/پایان و محاسبه تاخیر پاسخ AI به میلی‌ثانیه با timestamp و request_id
  - پیاده‌سازی مکانیزم بازخورد لایک/دیسلایک برای پاسخ‌های AI — دکمه‌های لایک/دیسلایک در UI چت، endpoint ثبت بازخورد، ذخیره در دیتابیس
  - پیاده‌سازی مکانیزم امتیازدهی صریح (1-5) برای پاسخ‌های AI — امتیازدهی عددی ۱-۵ در UI، endpoint ثبت امتیاز، ذخیره در دیتابیس
  - تعیین خط مبنا و هدف برای معیارهای AI — تعیین و ثبت خط مبنا و اهداف کمی برای تاخیر و مصرف توکن در config
  - پیاده‌سازی ذخیره‌سازی و بازیابی معیارهای AI در دیتابیس — مدل دیتابیس برای ذخیره تاخیر، توکن، بازخورد و CRUD اولیه
  - ایجاد endpoint API برای دریافت آمار معیارهای AI — endpoint GET برای بازگرداندن آمار خلاصه معیارهای AI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 3
  id: ef6adabf-2d02-475e-88aa-997c388b4023
  عنوان اصلی: حذف کد مرده `generate_text` و اصلاح endpoint
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/ai.py

📋 acceptance_criteria کامل:
  - import generate_text از فایل ai.py حذف شود [verify_method=static] [verify_plan={"grep_patterns": ["^from app.services.ai_service import generate_text"], "files_hint": ["app/routes/ai.py"]}]
  - endpoint /ai/generate از AIService استفاده کند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/ai/generate", "headers": {"Content-Type": "application/json"}, "json_body": {"prompt": "Write a short story about a cat."}, "expected_status": 200, "required_fields": ]
  - هیچ خطای import در زمان اجرا رخ ندهد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_ai_service.py::test_ai_service_initializes_without_import_errors", "timeout_seconds": 60}]

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
Dead code: تابع `generate_text` در `app/services/ai_service.py` هرگز فراخوانی نمی‌شود

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/ai.py:26-27` — `import generate_text` — import dead code
  ```python
  from app.services.ai_service import AIService, generate_text
  ```
- `app/routes/ai.py:74-79` — `generate_text call` — استفاده از تابعی که وجود خارجی ندارد
  ```python
  result = await generate_text(
      prompt=payload.prompt,
      max_tokens=payload.max_tokens or 512,
      temperature=payload.temperature or 0.7,
  )
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
FastAPI + Python async

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `app/services/ai_service.py` (سطر 1) — فایلی که supposed to contain generate_text
- `app/database.py` — `ai.py` این فایل را import می‌کند
- `app/dependencies/auth.py` — `ai.py` این فایل را import می‌کند
- `app/middleware.py` — `ai.py` این فایل را import می‌کند
- `app/models/user.py` — `ai.py` این فایل را import می‌کند
- `app/routes/__init__.py` — این فایل `ai.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این تابع تنها در یک route استفاده می‌شود و هیچ وابستگی دیگری ندارد.

## 🔍 Context و وضعیت فعلی
در `app/routes/ai.py` خط ۷۴، تابع `generate_text` از ماژول `app.services.ai_service` import شده و در endpoint `/ai/generate` استفاده می‌شود. اما بررسی محتوای فایل `app/services/ai_service.py` نشان می‌دهد که این تابع تعریف نشده است (فایل در اسکن موجود نیست، اما import آن در route نشان‌دهنده وجود آن است). همچنین تابع `generate_text` در هیچ جای دیگری از پروژه استفاده نمی‌شود و تنها در همین route import شده است. این یک dead code است که باعث سردرگمی و خطاهای احتمالی در زمان اجرا می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] import generate_text از فایل ai.py حذف شود
- [ ] endpoint /ai/generate از AIService استفاده کند
- [ ] هیچ خطای import در زمان اجرا رخ ندهد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. حذف import و استفاده از `generate_text` در `app/routes/ai.py` و جایگزینی با فراخوانی `ai_service.generate()` یا حذف کامل endpoint اگر غیرفعال است.

## 💡 نمونه‌های قبل/بعد
**رفع dead code**

_قبل:_
```
from app.services.ai_service import AIService, generate_text

@router.post("/generate")
async def generate(payload):
    result = await generate_text(...)
```

_بعد:_
```
from app.services.ai_service import AIService

@router.post("/generate")
async def generate(payload, ai_service: AIService = Depends(get_ai_service)):
    result = await ai_service.generate(...)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest tests/test_ai.py -v`
- `curl -X POST http://localhost:8000/ai/generate -H 'Content-Type: application/json' -d '{"prompt":"test"}'`

## ⚠️ ریسک‌ها و موارد احتیاط
کم — فقط یک import و یک فراخوانی تغییر می‌کند

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
تسک 3 از 3
  id: 69704426-46ed-4dda-976f-79070c807694
  عنوان اصلی: رسیدگی به endpoint بلااستفاده: POST /generate
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/routes/ai.py

📋 acceptance_criteria کامل:
  - مشخص شد endpoint `POST /generate` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["/generate:", "test_generate", "client.post(\"/generate\")"], "files_hint": ["openapi.yaml", "tests/"]}]

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
endpoint بک‌اند بلااستفاده: POST /generate

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/routes/ai.py`

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

- `app/database.py` — `ai.py` این فایل را import می‌کند
- `app/dependencies/auth.py` — `ai.py` این فایل را import می‌کند
- `app/middleware.py` — `ai.py` این فایل را import می‌کند
- `app/models/user.py` — `ai.py` این فایل را import می‌کند
- `app/routes/__init__.py` — این فایل `ai.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
endpoint `POST /generate` در `app/routes/ai.py` تعریف شده ولی هیچ `fetch`، `axios`، `apiClient.*`، یا frontend call به آن دیده نمی‌شود.

## 🔍 جزئیات
- method: `POST`
- path: `/generate`
- فایل: `app/routes/ai.py`
- علت: no frontend fetch + no recent call in logs

## 🤔 چرا مهم است
endpoint بدون caller یا (الف) به‌صورت اشتباه orphan شده و frontend feature روی آن broken است، یا (ب) admin/internal endpoint است که از طریق curl/Postman فقط مصرف می‌شود (مستندسازی لازم دارد)، یا (ج) قدیمی است و باید حذف شود (با ۴۱۰ Gone یا حذف کامل).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] مشخص شد endpoint `POST /generate` در کدام دسته است (orphan/internal/deprecated)
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: grep روی `/generate` در frontend + scripts/ + docs/ — اگر caller هست، اتصال را drop شده اصلاح کن.
گام ۲: اگر internal است، در README یا OpenAPI tag `internal` بزن.
گام ۳: اگر منسوخ است، حذف کن (شامل تست‌ها).

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/routes/ai.py`
- `ruff check app/routes/ai.py`
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
- در commit message: `merged-from: e374a41e-09c7-4a27-8a4d-cbd3befcd47a, ef6adabf-2d02-475e-88aa-997c388b4023, 69704426-46ed-4dda-976f-79070c807694`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. outcome target به‌صورت measurable بازنویسی شد _(verify: manual_only)_
2. کد تغییر کرد تا outcome target محقق شود _(verify: static)_
3. test E2E که outcome را اندازه می‌گیرد عبور می‌کند _(verify: backend_test)_
4. metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد _(verify: static)_
5. import generate_text از فایل ai.py حذف شود _(verify: static)_
6. endpoint /ai/generate از AIService استفاده کند _(verify: api_response)_
7. هیچ خطای import در زمان اجرا رخ ندهد _(verify: backend_test)_
8. مشخص شد endpoint `POST /generate` در کدام دسته است (orphan/internal/deprecated) _(verify: manual_only)_
9. اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف _(verify: manual_only)_
10. اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد _(verify: static)_

## Task Steps

### Step 1: بررسی اولیه وجود پیاده‌سازی‌های قبلی معیارهای عملکردی AI
**Status:** `done` (100%)
**Scope:** این مرحله شامل جستجو و بررسی فایل‌های backend/app/ai_service.py، backend/app/metrics.py، backend/app/logging.py و tests/e2e/test_ai_performance.py برای یافتن هرگونه پیاده‌سازی موجود از معیارهای عملکردی AI است. هدف تعیین این است که چه کدی از قبل وجود دارد تا از بازنویسی جلوگیری شود. خارج از این مرحله: ایجاد یا تغییر هیچ کدی انجام نمی‌شود. نکته حیاتی: اگر همه چیز از قبل به درستی انجام شده، یک کامیت توضیحی (no-op) ثبت شود.
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

### Step 2: بازنویسی outcome target به صورت قابل اندازه‌گیری
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل بازنویسی هدف (outcome target) برای معیارهای عملکردی AI به صورت قابل اندازه‌گیری است. هدف فعلی: 'دستیابی به میانگین امتیاز کیفیت پاسخ AI برابر با 4.0/5.0 و حفظ تاخیر پاسخ AI زیر 500 میلی‌ثانیه برای 95% درخواست‌ها'. این هدف باید در یک فایل پیکربندی یا مستندات ثبت شود. خارج از این مرحله: تغییر کد برای رسیدن به این هدف یا نوشتن تست. نکته حیاتی: این یک مرحله manual_only است و نیاز به بازبینی دستی دارد.
**Excerpt:**
```
- [ ] outcome target به‌صورت measurable بازنویسی شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
## 🎯 هدف مطلوب (outcome target)
دستیابی به میانگین امتیاز کیفیت پاسخ AI برابر با 4.0/5.0 (بر اساس بازخورد کاربر یا ارزیابی داخلی) و حفظ تاخیر پاسخ AI زیر 500 میلی‌ثانیه برای 95% درخواست‌ها.
```

### Step 3: تغییر کد برای محقق‌سازی outcome target (لاگ‌گیری تاخیر پاسخ AI)
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیاده‌سازی لاگ‌گیری تاخیر پاسخ AI است. باید زمان شروع و پایان هر درخواست AI ثبت شود و تاخیر به میلی‌ثانیه محاسبه گردد. این لاگ‌ها باید شامل timestamp و request_id باشند. فایل‌های هدف: backend/app/ai_service.py، backend/app/metrics.py، backend/app/logging.py. خارج از این مرحله: پیاده‌سازی بازخورد لایک/دیسلایک یا امتیازدهی صریح. نکته حیاتی: از تابع‌های record_ai_latency و metric_collector.record_ai_latency استفاده شود.
— [merged] این مرحله شامل پیاده‌سازی لاگ‌گیری امتیاز کیفیت پاسخ AI است. باید یک مکانیزم برای ثبت امتیاز کیفیت (مثلاً از 0 تا 1) برای هر پاسخ AI ایجاد شود. این می‌تواند بر اساس بازخورد کاربر یا ارزیابی داخلی باشد. فایل‌های هدف: backend/app/ai_service.py، backend/app/metrics.py، backend/app/logging.py. خارج از این مرحله: پیاده‌سازی UI برای بازخورد کاربر. نکته حیاتی: از تابع metric_collector.record_ai_quality استفاده شود.
**Excerpt:**
```
🔧 مراحل remaining که در super-task باید انجام شوند:
  - پیاده‌سازی لاگ‌گیری تاخیر پاسخ AI — لاگ‌گیری زمان شروع/پایان و محاسبه تاخیر پاسخ AI به میلی‌ثانیه با timestamp و request_id
- [ ] کد تغییر کرد تا outcome target محقق شود [verify_method=static] [verify_plan={"grep_patterns": ["ai_response_processor", "ai_feedback_logger", "ai_performance_tracker"], "files_hint": ["backend/app/ai_service.py", "backend/app/metrics.py", "backend/app/logging.py"]}]
```

### Step 4: تغییر کد برای محقق‌سازی outcome target (لاگ‌گیری مصرف توکن AI)
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیاده‌سازی لاگ‌گیری مصرف توکن AI است. باید تعداد توکن‌های مصرف‌شده در هر درخواست AI ثبت شود. این مورد به عنوان 'pre_done' در تسک 1 ذکر شده، اما برای اطمینان از کامل بودن، باید بررسی و در صورت نیاز تکمیل شود. فایل‌های هدف: backend/app/ai_service.py، backend/app/metrics.py. خارج از این مرحله: پیاده‌سازی معیارهای دیگر. نکته حیاتی: اگر قبلاً به طور کامل پیاده‌سازی شده، فقط مستند شود.
**Excerpt:**
```
✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  - پیاده‌سازی لاگ‌گیری مصرف توکن AI
```

### Step 5: نوشتن تست E2E برای اندازه‌گیری outcome معیارهای AI
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل نوشتن یک تست End-to-End (E2E) است که outcome معیارهای عملکردی AI را اندازه‌گیری می‌کند. تست باید در فایل tests/e2e/test_ai_performance.py و با نام تابع test_ai_outcome_metrics نوشته شود. این تست باید یک درخواست به endpoint AI ارسال کند و تاخیر پاسخ و امتیاز کیفیت را بررسی کند. خارج از این مرحله: نوشتن تست‌های unit. نکته حیاتی: timeout تست 120 ثانیه است.
**Excerpt:**
```
- [ ] test E2E که outcome را اندازه می‌گیرد عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/e2e/test_ai_performance.py::test_ai_outcome_metrics", "timeout_seconds": 120}]
```

### Step 6: اضافه کردن metric/log برای تشخیص outcome rate در production
**Status:** `done` (100%)
**Scope:** این مرحله شامل اضافه کردن metric و logهای لازم است تا بتوان نرخ تحقق outcome (outcome rate) را در محیط production تشخیص داد. باید از metric_collector برای ثبت معیارها و از log.info برای ثبت رویدادهای مرتبط با عملکرد AI استفاده شود. فایل‌های هدف: backend/app/metrics.py، backend/app/logging.py. خارج از این مرحله: ایجاد endpoint API برای دریافت آمار. نکته حیاتی: از grep_patternهای مشخص شده استفاده شود.
**Excerpt:**
```
- [ ] metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد [verify_method=static] [verify_plan={"grep_patterns": ["ai_response_latency_ms", "ai_response_quality_score", "log.info.*ai_performance", "metric_collector.record_ai_latency", "metric_collector.record_ai_quality"], "files_hint": ["backe]
```

### Step 7: پیاده‌سازی مکانیزم بازخورد لایک/دیسلایک برای پاسخ‌های AI
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل پیاده‌سازی کامل مکانیزم بازخورد لایک/دیسلایک است. این شامل: 1) اضافه کردن دکمه‌های لایک/دیسلایک در UI چت، 2) ایجاد endpoint برای ثبت بازخورد، 3) ذخیره‌سازی بازخورد در دیتابیس. فایل‌های هدف: frontend (کامپوننت چت)، backend (endpoint جدید)، و دیتابیس (مدل جدید). خارج از این مرحله: پیاده‌سازی امتیازدهی صریح 1-5. نکته حیاتی: این یک feature کامل است و باید تمام لایه‌ها را پوشش دهد.
**Excerpt:**
```
🔧 مراحل remaining که در super-task باید انجام شوند:
  - پیاده‌سازی مکانیزم بازخورد لایک/دیسلایک برای پاسخ‌های AI — دکمه‌های لایک/دیسلایک در UI چت، endpoint ثبت بازخورد، ذخیره در دیتابیس
```

### Step 8: پیاده‌سازی مکانیزم امتیازدهی صریح (1-5) برای پاسخ‌های AI
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل پیاده‌سازی مکانیزم امتیازدهی صریح با مقیاس 1 تا 5 است. این شامل: 1) اضافه کردن UI برای امتیازدهی عددی در چت، 2) ایجاد endpoint برای ثبت امتیاز، 3) ذخیره‌سازی امتیاز در دیتابیس. خارج از این مرحله: پیاده‌سازی لایک/دیسلایک (که در مرحله قبل انجام شده). نکته حیاتی: این مکانیزم باید جدا از لایک/دیسلایک باشد و امتیازدهی دقیق‌تری ارائه دهد.
**Excerpt:**
```
🔧 مراحل remaining که در super-task باید انجام شوند:
  - پیاده‌سازی مکانیزم امتیازدهی صریح (1-5) برای پاسخ‌های AI — امتیازدهی عددی ۱-۵ در UI، endpoint ثبت امتیاز، ذخیره در دیتابیس
```

### Step 9: تعیین خط مبنا و هدف برای معیارهای AI در config
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل تعیین و ثبت خط مبنا (baseline) و اهداف کمی برای معیارهای تاخیر و مصرف توکن در یک فایل پیکربندی (مثلاً config.yaml یا settings.py) است. خط مبنا باید بر اساس داده‌های فعلی یا تخمین اولیه تعیین شود. اهداف باید همان اهداف تعیین‌شده در مرحله 2 باشند. خارج از این مرحله: تغییر کد برای رسیدن به این اهداف. نکته حیاتی: این مقادیر باید به راحتی قابل تغییر باشند.
**Excerpt:**
```
🔧 مراحل remaining که در super-task باید انجام شوند:
  - تعیین خط مبنا و هدف برای معیارهای AI — تعیین و ثبت خط مبنا و اهداف کمی برای تاخیر و مصرف توکن در config
```

### Step 10: پیاده‌سازی ذخیره‌سازی و بازیابی معیارهای AI در دیتابیس
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل ایجاد مدل دیتابیس برای ذخیره معیارهای AI (تاخیر، توکن، بازخورد) و پیاده‌سازی عملیات CRUD اولیه برای آن است. فایل‌های هدف: مدل دیتابیس (مثلاً models/ai_metrics.py) و repository layer. خارج از این مرحله: ایجاد endpoint API. نکته حیاتی: مدل باید شامل فیلدهای request_id, latency_ms, token_count, feedback_type, score باشد.
**Excerpt:**
```
🔧 مراحل remaining که در super-task باید انجام شوند:
  - پیاده‌سازی ذخیره‌سازی و بازیابی معیارهای AI در دیتابیس — مدل دیتابیس برای ذخیره تاخیر، توکن، بازخورد و CRUD اولیه
```

### Step 11: ایجاد endpoint API برای دریافت آمار معیارهای AI
**Status:** `partial` (30%)
**Scope:** این مرحله شامل ایجاد یک endpoint GET است که آمار خلاصه معیارهای AI را بازمی‌گرداند. این آمار می‌تواند شامل میانگین تاخیر، میانگین امتیاز کیفیت، تعداد کل درخواست‌ها و ... باشد. خارج از این مرحله: پیاده‌سازی UI برای نمایش این آمار. نکته حیاتی: endpoint باید از دیتابیس خوانده شود و داده‌های real-time یا near-real-time ارائه دهد.
**Excerpt:**
```
🔧 مراحل remaining که در super-task باید انجام شوند:
  - ایجاد endpoint API برای دریافت آمار معیارهای AI — endpoint GET برای بازگرداندن آمار خلاصه معیارهای AI
```

### Step 12: بررسی اولیه وجود کد مرده generate_text در app/routes/ai.py
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی فایل app/routes/ai.py برای یافتن import و استفاده از تابع generate_text است. باید مشخص شود که آیا این تابع در فایل backend/app/ai_service.py تعریف شده است یا خیر. خارج از این مرحله: ایجاد یا تغییر هیچ کدی انجام نمی‌شود. نکته حیاتی: این یک مرحله بررسی است و باید با grep و cat انجام شود.
**Excerpt:**
```
♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
```

### Step 13: حذف import generate_text از فایل app/routes/ai.py
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل حذف خط import مربوط به generate_text از فایل app/routes/ai.py است. خط مورد نظر: 'from app.services.ai_service import AIService, generate_text' که باید به 'from app.services.ai_service import AIService' تغییر یابد. خارج از این مرحله: تغییر endpoint /ai/generate. نکته حیاتی: فقط import حذف می‌شود، نه استفاده از AIService.
**Excerpt:**
```
- [ ] import generate_text از فایل ai.py حذف شود [verify_method=static] [verify_plan={"grep_patterns": ["^from app.services.ai_service import generate_text"], "files_hint": ["app/routes/ai.py"]}]
```

### Step 14: اصلاح endpoint /ai/generate برای استفاده از AIService به جای generate_text
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل تغییر endpoint /ai/generate در فایل app/routes/ai.py است تا به جای تابع generate_text (که حذف شده) از سرویس AIService استفاده کند. باید فراخوانی ai_service.generate() جایگزین فراخوانی generate_text() شود. خارج از این مرحله: حذف endpoint. نکته حیاتی: endpoint باید همچنان کار کند و پاسخ 200 برگرداند.
**Excerpt:**
```
- [ ] endpoint /ai/generate از AIService استفاده کند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/ai/generate", "headers": {"Content-Type": "application/json"}, "json_body": {"prompt": "Write a short story about a cat."}, "expected_status": 200, "required_fields": ]
```

### Step 15: بررسی عدم وجود خطای import در زمان اجرا با تست backend
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل اجرای تست backend برای اطمینان از عدم وجود خطای import در زمان اجرا است. تست مورد نظر: tests/test_ai_service.py::test_ai_service_initializes_without_import_errors. خارج از این مرحله: اجرای سایر تست‌ها. نکته حیاتی: این تست باید با timeout 60 ثانیه اجرا شود.
**Excerpt:**
```
- [ ] هیچ خطای import در زمان اجرا رخ ندهد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_ai_service.py::test_ai_service_initializes_without_import_errors", "timeout_seconds": 60}]
```

### Step 16: بررسی اولیه وضعیت endpoint POST /generate (orphan/internal/deprecated)
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی endpoint POST /generate در فایل app/routes/ai.py برای تعیین وضعیت آن است. باید مشخص شود که آیا این endpoint توسط frontend فراخوانی می‌شود (orphan)، یک endpoint داخلی است (internal)، یا منسوخ شده است (deprecated). برای این کار باید در frontend، scripts و docs جستجو شود. خارج از این مرحله: اعمال تغییر. نکته حیاتی: این یک مرحله manual_only است.
**Excerpt:**
```
- [ ] مشخص شد endpoint `POST /generate` در کدام دسته است (orphan/internal/deprecated) [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
```

### Step 17: انجام اقدام مناسب برای endpoint POST /generate (حذف، تگ internal، یا اتصال مجدد)
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل انجام اقدام مناسب بر اساس نتیجه مرحله قبل است. اگر endpoint orphan است، باید اتصال frontend برقرار شود. اگر internal است، باید تگ internal در OpenAPI و README اضافه شود. اگر deprecated است، باید endpoint حذف شود. خارج از این مرحله: حذف تست‌ها (در مرحله بعد انجام می‌شود). نکته حیاتی: اقدام باید متناسب با وضعیت endpoint باشد.
**Excerpt:**
```
- [ ] اقدام مناسب انجام شد: یا connection باز شد، یا تگ internal، یا حذف [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
```

### Step 18: حذف تست‌های مربوط به endpoint POST /generate (در صورت حذف endpoint)
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل حذف تست‌های مربوط به endpoint POST /generate است، در صورتی که در مرحله قبل تصمیم به حذف endpoint گرفته شده باشد. باید تست‌هایی که شامل '/generate' یا 'test_generate' هستند حذف شوند. خارج از این مرحله: به‌روزرسانی OpenAPI. نکته حیاتی: اگر endpoint حذف نشده، این مرحله انجام نمی‌شود.
**Excerpt:**
```
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["/generate:", "test_generate", "client.post(\"/generate\")"], "files_hint": ["openapi.yaml", "tests/"]}]
```

### Step 19: به‌روزرسانی OpenAPI پس از حذف endpoint POST /generate (در صورت لزوم)
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل به‌روزرسانی فایل OpenAPI (openapi.yaml) برای حذف endpoint POST /generate است، در صورتی که endpoint حذف شده باشد. خارج از این مرحله: حذف تست‌ها. نکته حیاتی: اگر endpoint حذف نشده، این مرحله انجام نمی‌شود.
**Excerpt:**
```
- [ ] اگر حذف شد، تست‌های مربوطه هم حذف شدند و OpenAPI به‌روز شد [verify_method=static] [verify_plan={"grep_patterns": ["/generate:", "test_generate", "client.post(\"/generate\")"], "files_hint": ["openapi.yaml", "tests/"]}]
```

### Step 20: اجرای تست‌های backend برای اطمینان از عدم شکست
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل اجرای تمام تست‌های backend با دستور pytest -x است تا اطمینان حاصل شود که هیچ تستی پس از تغییرات شکست نمی‌خورد. خارج از این مرحله: اجرای linter. نکته حیاتی: اگر تستی شکست خورد، باید رفع شود.
**Excerpt:**
```
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
## 🧪 دستورات اعتبارسنجی
- `pytest -x`
```

### Step 21: اجرای linter برای اطمینان از عدم وجود warning
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای linter (ruff) روی فایل‌های تغییر یافته برای اطمینان از عدم وجود warning است. دستور: ruff check app/routes/ai.py. خارج از این مرحله: اجرای type-check. نکته حیاتی: اگر warning وجود داشت، باید رفع شود.
**Excerpt:**
```
- [ ] linter بدون warning عبور می‌کند
## 🧪 دستورات اعتبارسنجی
- `ruff check app/routes/ai.py`
```

### Step 22: اجرای type-check برای اطمینان از صحت نوع‌ها
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای type-check (mypy) روی پروژه برای اطمینان از صحت نوع‌ها است. خارج از این مرحله: اجرای تست‌ها. نکته حیاتی: اگر type-check شکست خورد، باید رفع شود.
**Excerpt:**
```
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)
```

### Step 23: بررسی نهایی و مستندسازی تغییرات در commit message
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی نهایی تمام تغییرات اعمال شده و نوشتن یک commit message جامع است. commit message باید شامل merged-from با شناسه‌های تسک‌ها و توضیح دقیق تغییرات باشد. خارج از این مرحله: ایجاد PR. نکته حیاتی: commit message باید واضح و کامل باشد.
**Excerpt:**
```
📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.
```

### Step 24: ایجاد PR با checklist کامل از کامیت‌ها
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل ایجاد یک Pull Request (PR) با checklist کامل از تمام کامیت‌های انجام شده است. PR description باید شامل merged-from و توضیح دقیق تغییرات باشد. خارج از این مرحله: مرج کردن PR. نکته حیاتی: PR باید برای بازبینی آماده باشد.
**Excerpt:**
```
📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.
```
