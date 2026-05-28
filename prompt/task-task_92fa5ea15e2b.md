---
task_id: task_92fa5ea15e2b
title: افزودن نوتیفیکیشن `verify_failed` و رفع `caption_incomplete`
type: other
priority: high
execution_priority: 2000
status: pending
external_status: pending
verification_status: applied_externally_pending_verify
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-26T23:20:22.917998+00:00'
updated_at: '2026-05-27T23:13:09.520565+00:00'
tags:
- consolidated
- post_verify_merge
---

# افزودن نوتیفیکیشن `verify_failed` و رفع `caption_incomplete`

## Raw Idea

🧬 این یک تسک تلفیقی است — از 4 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها بر روی بازبینی، افزودن نوتیفیکیشن‌های جدید و تعریف صریح event_type برای بهبود قابلیت مشاهده و ارتباطات در سیستم نوتیفیکیشن تمرکز دارند.
🎯 theme: بازبینی و بهبود سیستم نوتیفیکیشن
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 4
  id: 405fd17d-8937-44d2-8cfc-dc8edf352ada
  عنوان اصلی: افزودن notification برای event 'verify_failed'
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\\(\"verify_failed\""], "files_hint": ["backend/app/handlers/failure_handler.py", "backend/app/services/notification_service.py"]}]
  - message template فارسی و معنادار است [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - silent=False + priority="high" [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\\(\"verify_failed\",\\s*.*silent=False,\\s*priority=\"high\""], "files_hint": ["backend/app/handlers/failure_handler.py"]}]
  - تست: trigger مصنوعی → notification در Telegram دیده می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/notifications/test_verify_failed_notification.py::test_telegram_notification_on_verify_failed", "timeout_seconds": 90}]

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
event critical 'verify_failed' هیچ notification ندارد

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
این مورد روی notification pipeline تأثیر می‌گذارد — همه consumer های این event باید چک شوند.

## 🔍 Context و وضعیت فعلی
## 📋 شرح (severity: high)
event `verify_failed` در سیستم به‌عنوان critical شناخته شده ولی هیچ `notify_event` call برای آن پیدا نشد.

## 🤔 چرا مهم است
critical event بدون notification یعنی کاربر هرگز از وقوع آن باخبر نمی‌شود. اگر «task failed» critical است ولی notification ندارد، کاربر روزها نمی‌فهمد سیستم خاموش بوده.

## 🔍 جزئیات
- علت: event critical 'verify_failed' هیچ notification ندارد
- پیشنهاد: اضافه کردن notify_event برای 'verify_failed' در failure handler مربوطه

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد
- [ ] message template فارسی و معنادار است
- [ ] silent=False + priority="high"
- [ ] تست: trigger مصنوعی → notification در Telegram دیده می‌شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: محل وقوع `verify_failed` در کد را پیدا کن.
گام ۲: `notification_service.notify_event("verify_failed", message, silent=False, priority="high", ...)` اضافه کن.
گام ۳: template message فارسی معنادار بنویس.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
اگر event پر-تکرار است، rate-limit اضافه کن تا spam نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: notification_audit
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 4
  id: 46bd8717-9ebc-4311-a4c9-8786b5db50e6
  عنوان اصلی: Complete audit notification caption
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/notification_service.py

📋 acceptance_criteria کامل:
  - این مورد بررسی و حل شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
audit notification: caption_incomplete

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/notification_service.py:494`

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

- `app/models/notification.py` — `notification_service.py` این فایل را import می‌کند
- `app/schemas/notification_schema.py` — `notification_service.py` این فایل را import می‌کند
- `app/tasks.py` — `notification_service.py` این فایل را import می‌کند
- `app/routes/notifications.py` — این فایل `notification_service.py` را import می‌کند (caller)
- `app/services/auth_service.py` — این فایل `notification_service.py` را import می‌کند (caller)
- `tests/test_notification_service.py` — این فایل `notification_service.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مورد روی notification pipeline تأثیر می‌گذارد — همه consumer های این event باید چک شوند.

## 🔍 Context و وضعیت فعلی
The `notify_event` function signature (and its usage across samples) lacks explicit parameters for a distinct 'title' and 'action_link'. For critical events like 'verify_failed', a clear, concise title and an immediate, actionable link are crucial for guiding the user and improving the notification's effectiveness. The current `message` parameter might be used for context, but a dedicated title an

🛠 پیشنهاد: Extend `notify_event` signature to include: `title: str`, `action_link: Optional[str] = None`, `action_text: Optional[str] = None` (for the button/link text).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] این مورد بررسی و حل شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
_(مجری بر اساس Context و معیارهای پذیرش، مراحل را تعیین کند)_

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/services/notification_service.py`
- `ruff check app/services/notification_service.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: notification_audit
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 4
  id: 3308eb75-2433-4199-bede-c6c7f7be65d2
  عنوان اصلی: تعریف event_type صریح برای نوتیفیکیشن
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: tests/test_notification_service.py

📋 acceptance_criteria کامل:
  - event_type معنادار snake_case تعیین شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\\(event=['\"]task_done['\"]"], "files_hint": ["tests/test_notification_service.py"]}]
  - در event registry ثبت شد [verify_method=static] [verify_plan={"grep_patterns": ["register_event\\(['\"]task_done['\"]\\)"], "files_hint": ["backend/app/notifications/event_registry.py", "backend/app/notifications/events.py"]}]
  - از UI tab notification settings این event قابل toggle است [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/settings/notifications"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "screenshot", "label": "notification_setting]

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
notification بدون event_type صریح در test_notification_service.py

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `tests/test_notification_service.py:174`

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

- `app/database.py` — `test_notification_service.py` این فایل را import می‌کند
- `app/models/notification.py` — `test_notification_service.py` این فایل را import می‌کند
- `app/services/notification_service.py` — `test_notification_service.py` این فایل را import می‌کند
- `app/services/__init__.py` — `test_notification_service.py` این فایل را import می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این مورد روی notification pipeline تأثیر می‌گذارد — همه consumer های این event باید چک شوند.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
در `tests/test_notification_service.py` یک `notify_event` call پیدا شد که اولین پارامتر (event_type) رشته‌ای ساده/مبهم است یا خالی.

## 🤔 چرا مهم است
event_type کلید routing و filter در سیستم notification است. بدون آن، نمی‌توان آن event را به‌صورت per-event mute/customize کرد.

## 🔍 جزئیات
- علت: notification call بدون event_type صریح — audit و filtering مشکل می‌شود
- پیشنهاد: event="task_done" یا مشابه اضافه کن

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] event_type معنادار snake_case تعیین شد
- [ ] در event registry ثبت شد
- [ ] از UI tab notification settings این event قابل toggle است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: event_type معنادار snake_case انتخاب کن (مثل `task_done_user_alert`).
گام ۲: در `notification_events.json` (اگر هست) registry به‌روز کن.
گام ۳: UI tab notification routing را تست کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile tests/test_notification_service.py`
- `ruff check tests/test_notification_service.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
اگر event_type قبلاً به نام دیگری در DB ذخیره شده، rename باعث می‌شود old records orphan شوند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: notification_audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 4
  id: 8ca2af99-2dbe-4f81-bd7f-70a2f98fff57
  عنوان اصلی: تعیین event_type صریح برای نوتیفیکیشن auth_service
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/auth_service.py

📋 acceptance_criteria کامل:
  - event_type معنادار snake_case تعیین شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\\(event=\"[a-z_]+\""], "files_hint": ["app/services/auth_service.py"]}]
  - در event registry ثبت شد [verify_method=static] [verify_plan={"grep_patterns": ["\"task_done\""], "files_hint": ["app/events/registry.py", "app/notifications/events.py", "app/config/events.py"]}]
  - از UI tab notification settings این event قابل toggle است [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/settings/notifications"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "screenshot", "label": "notification_setting]

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
notification بدون event_type صریح در auth_service.py

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/auth_service.py:130`

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

- `app/config.py` — `auth_service.py` این فایل را import می‌کند
- `config/settings.py` — `auth_service.py` این فایل را import می‌کند
- `app/models/user.py` — `auth_service.py` این فایل را import می‌کند
- `app/schemas/auth.py` — `auth_service.py` این فایل را import می‌کند
- `app/routes/auth.py` — این فایل `auth_service.py` را import می‌کند (caller)
- `app/routes/users.py` — این فایل `auth_service.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مورد روی notification pipeline تأثیر می‌گذارد — همه consumer های این event باید چک شوند.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
در `app/services/auth_service.py` یک `notify_event` call پیدا شد که اولین پارامتر (event_type) رشته‌ای ساده/مبهم است یا خالی.

## 🤔 چرا مهم است
event_type کلید routing و filter در سیستم notification است. بدون آن، نمی‌توان آن event را به‌صورت per-event mute/customize کرد.

## 🔍 جزئیات
- علت: notification call بدون event_type صریح — audit و filtering مشکل می‌شود
- پیشنهاد: event="task_done" یا مشابه اضافه کن

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] event_type معنادار snake_case تعیین شد
- [ ] در event registry ثبت شد
- [ ] از UI tab notification settings این event قابل toggle است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: event_type معنادار snake_case انتخاب کن (مثل `task_done_user_alert`).
گام ۲: در `notification_events.json` (اگر هست) registry به‌روز کن.
گام ۳: UI tab notification routing را تست کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/services/auth_service.py`
- `ruff check app/services/auth_service.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
اگر event_type قبلاً به نام دیگری در DB ذخیره شده، rename باعث می‌شود old records orphan شوند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: notification_audit
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
- در commit message: `merged-from: 405fd17d-8937-44d2-8cfc-dc8edf352ada, 46bd8717-9ebc-4311-a4c9-8786b5db50e6, 3308eb75-2433-4199-bede-c6c7f7be65d2, 8ca2af99-2dbe-4f81-bd7f-70a2f98fff57`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 4 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها بر روی بازبینی، افزودن نوتیفیکیشن‌های جدید و تعریف صریح event_type برای بهبود قابلیت مشاهده و ارتباطات در سیستم نوتیفیکیشن تمرکز دارند.
🎯 theme: بازبینی و بهبود سیستم نوتیفیکیشن
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 4
  id: 405fd17d-8937-44d2-8cfc-dc8edf352ada
  عنوان اصلی: افزودن notification برای event 'verify_failed'
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\\(\"verify_failed\""], "files_hint": ["backend/app/handlers/failure_handler.py", "backend/app/services/notification_service.py"]}]
  - message template فارسی و معنادار است [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - silent=False + priority="high" [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\\(\"verify_failed\",\\s*.*silent=False,\\s*priority=\"high\""], "files_hint": ["backend/app/handlers/failure_handler.py"]}]
  - تست: trigger مصنوعی → notification در Telegram دیده می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/notifications/test_verify_failed_notification.py::test_telegram_notification_on_verify_failed", "timeout_seconds": 90}]

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
event critical 'verify_failed' هیچ notification ندارد

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
این مورد روی notification pipeline تأثیر می‌گذارد — همه consumer های این event باید چک شوند.

## 🔍 Context و وضعیت فعلی
## 📋 شرح (severity: high)
event `verify_failed` در سیستم به‌عنوان critical شناخته شده ولی هیچ `notify_event` call برای آن پیدا نشد.

## 🤔 چرا مهم است
critical event بدون notification یعنی کاربر هرگز از وقوع آن باخبر نمی‌شود. اگر «task failed» critical است ولی notification ندارد، کاربر روزها نمی‌فهمد سیستم خاموش بوده.

## 🔍 جزئیات
- علت: event critical 'verify_failed' هیچ notification ندارد
- پیشنهاد: اضافه کردن notify_event برای 'verify_failed' در failure handler مربوطه

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد
- [ ] message template فارسی و معنادار است
- [ ] silent=False + priority="high"
- [ ] تست: trigger مصنوعی → notification در Telegram دیده می‌شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: محل وقوع `verify_failed` در کد را پیدا کن.
گام ۲: `notification_service.notify_event("verify_failed", message, silent=False, priority="high", ...)` اضافه کن.
گام ۳: template message فارسی معنادار بنویس.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
اگر event پر-تکرار است، rate-limit اضافه کن تا spam نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: notification_audit
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 4
  id: 46bd8717-9ebc-4311-a4c9-8786b5db50e6
  عنوان اصلی: Complete audit notification caption
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/notification_service.py

📋 acceptance_criteria کامل:
  - این مورد بررسی و حل شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]

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
audit notification: caption_incomplete

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/notification_service.py:494`

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

- `app/models/notification.py` — `notification_service.py` این فایل را import می‌کند
- `app/schemas/notification_schema.py` — `notification_service.py` این فایل را import می‌کند
- `app/tasks.py` — `notification_service.py` این فایل را import می‌کند
- `app/routes/notifications.py` — این فایل `notification_service.py` را import می‌کند (caller)
- `app/services/auth_service.py` — این فایل `notification_service.py` را import می‌کند (caller)
- `tests/test_notification_service.py` — این فایل `notification_service.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مورد روی notification pipeline تأثیر می‌گذارد — همه consumer های این event باید چک شوند.

## 🔍 Context و وضعیت فعلی
The `notify_event` function signature (and its usage across samples) lacks explicit parameters for a distinct 'title' and 'action_link'. For critical events like 'verify_failed', a clear, concise title and an immediate, actionable link are crucial for guiding the user and improving the notification's effectiveness. The current `message` parameter might be used for context, but a dedicated title an

🛠 پیشنهاد: Extend `notify_event` signature to include: `title: str`, `action_link: Optional[str] = None`, `action_text: Optional[str] = None` (for the button/link text).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] این مورد بررسی و حل شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
_(مجری بر اساس Context و معیارهای پذیرش، مراحل را تعیین کند)_

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/services/notification_service.py`
- `ruff check app/services/notification_service.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: notification_audit
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 4
  id: 3308eb75-2433-4199-bede-c6c7f7be65d2
  عنوان اصلی: تعریف event_type صریح برای نوتیفیکیشن
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: tests/test_notification_service.py

📋 acceptance_criteria کامل:
  - event_type معنادار snake_case تعیین شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\\(event=['\"]task_done['\"]"], "files_hint": ["tests/test_notification_service.py"]}]
  - در event registry ثبت شد [verify_method=static] [verify_plan={"grep_patterns": ["register_event\\(['\"]task_done['\"]\\)"], "files_hint": ["backend/app/notifications/event_registry.py", "backend/app/notifications/events.py"]}]
  - از UI tab notification settings این event قابل toggle است [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/settings/notifications"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "screenshot", "label": "notification_setting]

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
notification بدون event_type صریح در test_notification_service.py

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `tests/test_notification_service.py:174`

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

- `app/database.py` — `test_notification_service.py` این فایل را import می‌کند
- `app/models/notification.py` — `test_notification_service.py` این فایل را import می‌کند
- `app/services/notification_service.py` — `test_notification_service.py` این فایل را import می‌کند
- `app/services/__init__.py` — `test_notification_service.py` این فایل را import می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این مورد روی notification pipeline تأثیر می‌گذارد — همه consumer های این event باید چک شوند.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
در `tests/test_notification_service.py` یک `notify_event` call پیدا شد که اولین پارامتر (event_type) رشته‌ای ساده/مبهم است یا خالی.

## 🤔 چرا مهم است
event_type کلید routing و filter در سیستم notification است. بدون آن، نمی‌توان آن event را به‌صورت per-event mute/customize کرد.

## 🔍 جزئیات
- علت: notification call بدون event_type صریح — audit و filtering مشکل می‌شود
- پیشنهاد: event="task_done" یا مشابه اضافه کن

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] event_type معنادار snake_case تعیین شد
- [ ] در event registry ثبت شد
- [ ] از UI tab notification settings این event قابل toggle است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: event_type معنادار snake_case انتخاب کن (مثل `task_done_user_alert`).
گام ۲: در `notification_events.json` (اگر هست) registry به‌روز کن.
گام ۳: UI tab notification routing را تست کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile tests/test_notification_service.py`
- `ruff check tests/test_notification_service.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
اگر event_type قبلاً به نام دیگری در DB ذخیره شده، rename باعث می‌شود old records orphan شوند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: notification_audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 4
  id: 8ca2af99-2dbe-4f81-bd7f-70a2f98fff57
  عنوان اصلی: تعیین event_type صریح برای نوتیفیکیشن auth_service
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: app/services/auth_service.py

📋 acceptance_criteria کامل:
  - event_type معنادار snake_case تعیین شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\\(event=\"[a-z_]+\""], "files_hint": ["app/services/auth_service.py"]}]
  - در event registry ثبت شد [verify_method=static] [verify_plan={"grep_patterns": ["\"task_done\""], "files_hint": ["app/events/registry.py", "app/notifications/events.py", "app/config/events.py"]}]
  - از UI tab notification settings این event قابل toggle است [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/settings/notifications"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "screenshot", "label": "notification_setting]

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
notification بدون event_type صریح در auth_service.py

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/auth_service.py:130`

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

- `app/config.py` — `auth_service.py` این فایل را import می‌کند
- `config/settings.py` — `auth_service.py` این فایل را import می‌کند
- `app/models/user.py` — `auth_service.py` این فایل را import می‌کند
- `app/schemas/auth.py` — `auth_service.py` این فایل را import می‌کند
- `app/routes/auth.py` — این فایل `auth_service.py` را import می‌کند (caller)
- `app/routes/users.py` — این فایل `auth_service.py` را import می‌کند (caller)

## 🌐 نقشهٔ وابستگی‌ها
این مورد روی notification pipeline تأثیر می‌گذارد — همه consumer های این event باید چک شوند.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
در `app/services/auth_service.py` یک `notify_event` call پیدا شد که اولین پارامتر (event_type) رشته‌ای ساده/مبهم است یا خالی.

## 🤔 چرا مهم است
event_type کلید routing و filter در سیستم notification است. بدون آن، نمی‌توان آن event را به‌صورت per-event mute/customize کرد.

## 🔍 جزئیات
- علت: notification call بدون event_type صریح — audit و filtering مشکل می‌شود
- پیشنهاد: event="task_done" یا مشابه اضافه کن

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] event_type معنادار snake_case تعیین شد
- [ ] در event registry ثبت شد
- [ ] از UI tab notification settings این event قابل toggle است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: event_type معنادار snake_case انتخاب کن (مثل `task_done_user_alert`).
گام ۲: در `notification_events.json` (اگر هست) registry به‌روز کن.
گام ۳: UI tab notification routing را تست کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -m py_compile app/services/auth_service.py`
- `ruff check app/services/auth_service.py`
- `pytest -x`

## ⚠️ ریسک‌ها و موارد احتیاط
اگر event_type قبلاً به نام دیگری در DB ذخیره شده، rename باعث می‌شود old records orphan شوند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: notification_audit
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
- در commit message: `merged-from: 405fd17d-8937-44d2-8cfc-dc8edf352ada, 46bd8717-9ebc-4311-a4c9-8786b5db50e6, 3308eb75-2433-4199-bede-c6c7f7be65d2, 8ca2af99-2dbe-4f81-bd7f-70a2f98fff57`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد _(verify: static)_
2. message template فارسی و معنادار است _(verify: manual_only)_
3. silent=False + priority="high" _(verify: static)_
4. تست: trigger مصنوعی → notification در Telegram دیده می‌شود _(verify: backend_test)_
5. این مورد بررسی و حل شد _(verify: manual_only)_
6. event_type معنادار snake_case تعیین شد _(verify: static)_
7. در event registry ثبت شد _(verify: static)_
8. از UI tab notification settings این event قابل toggle است _(verify: ui_interaction)_

## Task Steps

### Step 1: بررسی وجود notify_event برای verify_failed در failure_handler.py
**Status:** `pending` (0%)
**Scope:** این مرحله شامل جستجوی grep برای یافتن notify_event("verify_failed") در فایل‌های backend/app/handlers/failure_handler.py و backend/app/services/notification_service.py است. هدف تعیین این است که آیا این call از قبل وجود دارد یا خیر. خارج از این مرحله: ایجاد یا تغییر کد. نکته حیاتی: اگر call وجود دارد، مرحله بعدی (اضافه کردن) را رد کن.
**Excerpt:**
```
- `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\(\"verify_failed\""], "files_hint": ["backend/app/handlers/failure_handler.py", "backend/app/services/notification_service.py"]}]
```

### Step 2: اضافه کردن notify_event برای verify_failed در failure_handler.py
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اضافه کردن یک notify_event("verify_failed", ...) در نقطه وقوع event verify_failed در فایل backend/app/handlers/failure_handler.py است. خارج از این مرحله: نوشتن message template یا تنظیم silent/priority. نکته حیاتی: اگر call از قبل وجود دارد، این مرحله را رد کن.
**Excerpt:**
```
- `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\(\"verify_failed\""], "files_hint": ["backend/app/handlers/failure_handler.py", "backend/app/services/notification_service.py"]}]
```

### Step 3: نوشتن message template فارسی و معنادار برای verify_failed
**Status:** `pending` (0%)
**Scope:** این مرحله شامل نوشتن یک message template به زبان فارسی است که معنادار و قابل فهم باشد. خارج از این مرحله: اضافه کردن notify_event call یا تنظیم silent/priority. نکته حیاتی: message باید به گونه‌ای باشد که کاربر متوجه شود چه event ای رخ داده است.
**Excerpt:**
```
- message template فارسی و معنادار است [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
```

### Step 4: تنظیم silent=False و priority='high' برای notify_event verify_failed
**Status:** `pending` (0%)
**Scope:** این مرحله شامل تنظیم پارامترهای silent=False و priority='high' در notify_event("verify_failed", ...) در فایل backend/app/handlers/failure_handler.py است. خارج از این مرحله: اضافه کردن notify_event call یا نوشتن message template. نکته حیاتی: این تنظیمات باید در همان call که اضافه شده است اعمال شوند.
**Excerpt:**
```
- silent=False + priority="high" [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\(\"verify_failed\",\\s*.*silent=False,\\s*priority=\"high\""], "files_hint": ["backend/app/handlers/failure_handler.py"]}]
```

### Step 5: نوشتن تست برای verify_failed notification در Telegram
**Status:** `pending` (0%)
**Scope:** این مرحله شامل نوشتن یک تست در tests/notifications/test_verify_failed_notification.py است که با trigger مصنوعی event verify_failed، ارسال notification به Telegram را بررسی می‌کند. خارج از این مرحله: اضافه کردن notify_event call یا تنظیم silent/priority. نکته حیاتی: تست باید timeout 90 ثانیه داشته باشد.
**Excerpt:**
```
- تست: trigger مصنوعی → notification در Telegram دیده می‌شود [verify_method=backend_test] [verify_plan={"test_node": "tests/notifications/test_verify_failed_notification.py::test_telegram_notification_on_verify_failed", "timeout_seconds": 90}]
```

### Step 6: بررسی و رفع مشکل caption_incomplete در notification_service.py
**Status:** `pending` (0%)
**Scope:** این مرحله شامل بررسی و رفع مشکل 'caption_incomplete' در فایل backend/app/services/notification_service.py است. خارج از این مرحله: اضافه کردن event_type جدید یا تغییر در سایر فایل‌ها. نکته حیاتی: این مرحله نیاز به بازبینی دستی دارد و ممکن است شامل اصلاح caption یا اضافه کردن پارامترهای جدید باشد.
**Excerpt:**
```
- این مورد بررسی و حل شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
```

### Step 7: بررسی وجود notify_event با event_type صریح در test_notification_service.py
**Status:** `pending` (0%)
**Scope:** این مرحله شامل جستجوی grep برای یافتن notify_event(event='task_done') در فایل tests/test_notification_service.py است. هدف تعیین این است که آیا این call از قبل وجود دارد یا خیر. خارج از این مرحله: ایجاد یا تغییر کد. نکته حیاتی: اگر call وجود دارد، مرحله بعدی (اضافه کردن) را رد کن.
**Excerpt:**
```
- event_type معنادار snake_case تعیین شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\(event=['\"]task_done['\"]"], "files_hint": ["tests/test_notification_service.py"]}]
```

### Step 8: اضافه کردن event_type صریح برای notify_event در test_notification_service.py
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اضافه کردن event_type صریح (مانند 'task_done') به notify_event call در فایل tests/test_notification_service.py است. خارج از این مرحله: ثبت event در registry یا UI. نکته حیاتی: اگر event_type از قبل وجود دارد، این مرحله را رد کن.
— [merged] این مرحله شامل اضافه کردن event_type صریح (مانند 'task_done') به notify_event call در فایل app/services/auth_service.py است. خارج از این مرحله: ثبت event در registry یا UI. نکته حیاتی: اگر event_type از قبل وجود دارد، این مرحله را رد کن.
**Excerpt:**
```
- event_type معنادار snake_case تعیین شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\(event=['\"]task_done['\"]"], "files_hint": ["tests/test_notification_service.py"]}]
```

### Step 9: بررسی ثبت event_type task_done در event registry
**Status:** `pending` (0%)
**Scope:** این مرحله شامل جستجوی grep برای یافتن register_event('task_done') در فایل‌های backend/app/notifications/event_registry.py و backend/app/notifications/events.py است. هدف تعیین این است که آیا این event از قبل ثبت شده است یا خیر. خارج از این مرحله: ایجاد یا تغییر کد. نکته حیاتی: اگر event ثبت شده است، مرحله بعدی (ثبت) را رد کن.
— [merged] این مرحله شامل ثبت event_type 'task_done' در فایل‌های backend/app/notifications/event_registry.py و backend/app/notifications/events.py است. خارج از این مرحله: اضافه کردن notify_event call یا UI. نکته حیاتی: اگر event از قبل ثبت شده است، این مرحله را رد کن.
— [merged] این مرحله شامل جستجوی grep برای یافتن '"task_done"' در فایل‌های app/events/registry.py, backend/app/notifications/events.py, و backend/app/notifications/events.py است. هدف تعیین این است که آیا این event از قبل ثبت شده است یا خیر. خارج از این مرحله: ایجاد یا تغییر کد. نکته حیاتی: اگر event ثبت شده است، مرحله بعدی (ثبت) را رد کن.
**Excerpt:**
```
- در event registry ثبت شد [verify_method=static] [verify_plan={"grep_patterns": ["register_event\(['\"]task_done['\"]\)"], "files_hint": ["backend/app/notifications/event_registry.py", "backend/app/notifications/events.py"]}]
```

### Step 10: بررسی قابلیت toggle event_type task_done از UI notification settings
**Status:** `pending` (0%)
**Scope:** این مرحله شامل بررسی UI برای اطمینان از اینکه event_type 'task_done' در tab notification settings قابل toggle است. خارج از این مرحله: تغییر UI یا backend. نکته حیاتی: این مرحله نیاز به تعامل با UI دارد و باید از طریق مرورگر انجام شود.
— [merged] این مرحله شامل بررسی UI برای اطمینان از اینکه event_type 'task_done' در tab notification settings قابل toggle است. خارج از این مرحله: تغییر UI یا backend. نکته حیاتی: این مرحله نیاز به تعامل با UI دارد و باید از طریق مرورگر انجام شود.
— [merged] این مرحله شامل بررسی UI برای اطمینان از اینکه event_type 'task_done' در tab notification settings قابل toggle است. خارج از این مرحله: تغییر UI یا backend. نکته حیاتی: این مرحله نیاز به تعامل با UI دارد و باید از طریق مرورگر انجام شود.
**Excerpt:**
```
- از UI tab notification settings این event قابل toggle است [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/settings/notifications"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "screenshot", "label": "notification_setting"}]}]
```

### Step 11: بررسی وجود notify_event با event_type صریح در auth_service.py
**Status:** `pending` (0%)
**Scope:** این مرحله شامل جستجوی grep برای یافتن notify_event(event='[a-z_]+') در فایل app/services/auth_service.py است. هدف تعیین این است که آیا این call از قبل وجود دارد یا خیر. خارج از این مرحله: ایجاد یا تغییر کد. نکته حیاتی: اگر call وجود دارد، مرحله بعدی (اضافه کردن) را رد کن.
**Excerpt:**
```
- event_type معنادار snake_case تعیین شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\(event=\"[a-z_]+\""], "files_hint": ["app/services/auth_service.py"]}]
```

### Step 12: ثبت event_type task_done در event registry (auth_service)
**Status:** `pending` (0%)
**Scope:** این مرحله شامل ثبت event_type 'task_done' در فایل‌های app/events/registry.py, backend/app/notifications/events.py, و backend/app/notifications/events.py است. خارج از این مرحله: اضافه کردن notify_event call یا UI. نکته حیاتی: اگر event از قبل ثبت شده است، این مرحله را رد کن.
**Excerpt:**
```
- در event registry ثبت شد [verify_method=static] [verify_plan={"grep_patterns": ["\"task_done\""], "files_hint": ["app/events/registry.py", "backend/app/notifications/events.py", "backend/app/notifications/events.py"]}]
```

### Step 13: اجرای pytest برای اطمینان از عدم شکست تست‌ها
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اجرای دستور pytest برای اطمینان از اینکه هیچ تستی fail نمی‌شود. خارج از این مرحله: تغییر کد. نکته حیاتی: این مرحله باید بعد از تمام تغییرات کد انجام شود.
**Excerpt:**
```
- هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
```

### Step 14: اجرای linter برای اطمینان از عدم وجود warning
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اجرای linter (مانند ruff) برای اطمینان از اینکه هیچ warning وجود ندارد. خارج از این مرحله: تغییر کد. نکته حیاتی: این مرحله باید بعد از تمام تغییرات کد انجام شود.
**Excerpt:**
```
- linter بدون warning عبور می‌کند (`ruff check app/services/auth_service.py`)
```

### Step 15: اجرای type-check برای اطمینان از موفقیت
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اجرای type-check (مانند mypy) برای اطمینان از موفقیت آن. خارج از این مرحله: تغییر کد. نکته حیاتی: این مرحله باید بعد از تمام تغییرات کد انجام شود.
**Excerpt:**
```
- type-check موفق است (`tsc --noEmit` / `mypy`)
```

### Step 16: اجرای npm run build برای اطمینان از موفقیت build
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اجرای دستور npm run build برای اطمینان از موفقیت build پروژه frontend است. خارج از این مرحله: تغییر کد. نکته حیاتی: این مرحله باید بعد از تمام تغییرات کد انجام شود.
**Excerpt:**
```
- `npm run build`
```

### Step 17: اجرای npm run lint برای اطمینان از عدم وجود warning
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اجرای دستور npm run lint برای اطمینان از اینکه هیچ warning وجود ندارد. خارج از این مرحله: تغییر کد. نکته حیاتی: این مرحله باید بعد از تمام تغییرات کد انجام شود.
**Excerpt:**
```
- `npm run lint`
```

### Step 18: بررسی و اضافه کردن rate-limit برای event verify_failed
**Status:** `pending` (0%)
**Scope:** این مرحله شامل بررسی نیاز به rate-limit برای event verify_failed و اضافه کردن آن در صورت لزوم است. خارج از این مرحله: تغییرات دیگر در notification pipeline. نکته حیاتی: اگر event پر-تکرار است، rate-limit اضافه کن تا spam نشود.
**Excerpt:**
```
اگر event پر-تکرار است، rate-limit اضافه کن تا spam نشود.
```

### Step 19: بررسی و رفع مشکل orphan records در صورت rename event_type
**Status:** `pending` (0%)
**Scope:** این مرحله شامل بررسی و رفع مشکل orphan records در صورت rename event_type در database است. خارج از این مرحله: تغییرات دیگر. نکته حیاتی: اگر event_type قبلاً به نام دیگری در DB ذخیره شده، rename باعث می‌شود old records orphan شوند.
— [merged] این مرحله شامل بررسی و رفع مشکل orphan records در صورت rename event_type در database است. خارج از این مرحله: تغییرات دیگر. نکته حیاتی: اگر event_type قبلاً به نام دیگری در DB ذخیره شده، rename باعث می‌شود old records orphan شوند.
**Excerpt:**
```
اگر event_type قبلاً به نام دیگری در DB ذخیره شده، rename باعث می‌شود old records orphan شوند.
```

### Step 20: بررسی و اطمینان از عدم وجود notify_event برای verify_failed در notification_service.py
**Status:** `pending` (0%)
**Scope:** این مرحله شامل جستجوی grep برای یافتن notify_event("verify_failed") در فایل backend/app/services/notification_service.py است. هدف تعیین این است که آیا این call از قبل وجود دارد یا خیر. خارج از این مرحله: ایجاد یا تغییر کد. نکته حیاتی: اگر call وجود دارد، مرحله اضافه کردن را رد کن.
**Excerpt:**
```
- `notify_event("verify_failed", ...)` call در نقطه وقوع اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\(\"verify_failed\""], "files_hint": ["backend/app/handlers/failure_handler.py", "backend/app/services/notification_service.py"]}]
```

### Step 21: بررسی و اطمینان از عدم وجود notify_event با event_type صریح در test_notification_service.py (تکمیلی)
**Status:** `pending` (0%)
**Scope:** این مرحله شامل جستجوی grep برای یافتن notify_event(event='task_done') در فایل tests/test_notification_service.py است. هدف تعیین این است که آیا این call از قبل وجود دارد یا خیر. خارج از این مرحله: ایجاد یا تغییر کد. نکته حیاتی: اگر call وجود دارد، مرحله اضافه کردن را رد کن.
— [merged] این مرحله شامل جستجوی grep برای یافتن notify_event(event='[a-z_]+') در فایل app/services/auth_service.py است. هدف تعیین این است که آیا این call از قبل وجود دارد یا خیر. خارج از این مرحله: ایجاد یا تغییر کد. نکته حیاتی: اگر call وجود دارد، مرحله اضافه کردن را رد کن.
**Excerpt:**
```
- event_type معنادار snake_case تعیین شد [verify_method=static] [verify_plan={"grep_patterns": ["notify_event\(event=['\"]task_done['\"]"], "files_hint": ["tests/test_notification_service.py"]}]
```

### Step 22: بررسی و اطمینان از ثبت event_type task_done در event registry (تکمیلی برای test_notification_service)
**Status:** `pending` (0%)
**Scope:** این مرحله شامل جستجوی grep برای یافتن register_event('task_done') در فایل‌های backend/app/notifications/event_registry.py و backend/app/notifications/events.py است. هدف تعیین این است که آیا این event از قبل ثبت شده است یا خیر. خارج از این مرحله: ایجاد یا تغییر کد. نکته حیاتی: اگر event ثبت شده است، مرحله ثبت را رد کن.
— [merged] این مرحله شامل جستجوی grep برای یافتن '"task_done"' در فایل‌های app/events/registry.py, backend/app/notifications/events.py, و backend/app/notifications/events.py است. هدف تعیین این است که آیا این event از قبل ثبت شده است یا خیر. خارج از این مرحله: ایجاد یا تغییر کد. نکته حیاتی: اگر event ثبت شده است، مرحله ثبت را رد کن.
**Excerpt:**
```
- در event registry ثبت شد [verify_method=static] [verify_plan={"grep_patterns": ["register_event\(['\"]task_done['\"]\)"], "files_hint": ["backend/app/notifications/event_registry.py", "backend/app/notifications/events.py"]}]
```
