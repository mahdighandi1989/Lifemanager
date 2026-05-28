---
task_id: task_f826e4ed34ff
title: رفع Anti-pattern، مسیر و دکمه‌های فرانت‌اند
type: other
priority: high
execution_priority: 100
status: done
external_status: pending
verification_status: done
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-26T23:24:13.222328+00:00'
updated_at: '2026-05-27T17:56:28.948150+00:00'
archived: true
archived_at: '2026-05-27T17:56:25.835469+00:00'
tags:
- consolidated
- post_verify_merge
---

# رفع Anti-pattern، مسیر و دکمه‌های فرانت‌اند

## Raw Idea

🧬 این یک تسک تلفیقی است — از 3 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها به طور خاص به مسائل مربوط به فرانت‌اند می‌پردازند، از جمله رفع باگ‌های UI/UX (مانند دکمه‌های بدون handler)، رسیدگی به الگوهای طراحی نامناسب در زمینه فرانت‌اند و پاکسازی مسیرهای بلااستفاده فرانت‌اند.
🎯 theme: بهبود رابط کاربری و پاکسازی کد فرانت‌اند
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 3
  id: f0e87289-ec88-4bfd-a31a-35f73bfea95c
  عنوان اصلی: Anti-pattern: Threshold-Outcome mismatch
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: frontend/src/context/AuthContext.jsx

📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=static] [verify_plan={"grep_patterns": ["API_BASE = \"\""], "files_hint": ["frontend/src/context/AuthContext.jsx"]}]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["process.env.REACT_APP_API_BASE"], "files_hint": ["frontend/src/context/AuthContext.jsx"]}]
  - تست edge case نوشته شد [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/dashboard"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "assert_visible", "selector": "[data-testid='dashboard-co]

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
Anti-pattern: Threshold-Outcome mismatch

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/context/AuthContext.jsx:6`

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

- `frontend/src/pages/Login.jsx` — این فایل `AuthContext.jsx` را import می‌کند (caller)
- `frontend/src/pages/Notifications.jsx` — این فایل `AuthContext.jsx` را import می‌کند (caller)
- `frontend/src/pages/Register.jsx` — این فایل `AuthContext.jsx` را import می‌کند (caller)
- `frontend/src/components/Footer.jsx` — این فایل `AuthContext.jsx` را import می‌کند (caller)

## 🔍 Context و وضعیت فعلی
The `API_BASE` is an empty string, which means all API calls will be relative to the current origin. This is a fragile configuration and will likely lead to failed API requests in most deployment scenarios (e.g., different domains/ports for frontend/backend). It should be configured via environment variables to ensure correct API endpoint resolution.

📁 file: frontend/src/context/AuthContext.jsx (line 6)

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
- `npm run lint`
- `npm run build`

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
تسک 2 از 3
  id: f7c47da1-dd62-45dc-a974-ac69d2cd6d04
  عنوان اصلی: رسیدگی به route فرانت‌اند بلااستفاده /Dashboar
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - تأیید شد که `/Dashboar` orphan است (هیچ Link/router.push اشاره نمی‌کند) [verify_method=static] [verify_plan={"grep_patterns": ["<Link href=\"/Dashboar\"", "router.push('/Dashboar')", "window.location.href = '/Dashboar'", "redirect: '/Dashboar'"], "files_hint": ["frontend/**/*.tsx", "frontend/**/*.jsx", "fro]
  - یا navigation link اضافه شد، یا route حذف/redirect شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - تست navigation: کاربر بتواند به این صفحه (یا destination) برسد [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/Dashboar"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "screenshot", "label": "dashboar_page_loaded"}, {"action":]

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
route فرانت‌اند بلااستفاده: /Dashboar

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
route `/Dashboar` در فایل `` تعریف شده ولی هیچ `Link`، `router.push`، یا redirect در کدبیس به آن اشاره نمی‌کند.

## 🔍 جزئیات
- route path: `/Dashboar`
- فایل: ``
- علت: route exists in app router but no Link/router.push/nav-config references it

## 🤔 چرا مهم است
route orphan یعنی صفحه‌ای که فقط با تایپ مستقیم URL قابل دسترسی است. یا فراموش شده یا منسوخ. باعث می‌شود کاربر هرگز به feature نرسد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تأیید شد که `/Dashboar` orphan است (هیچ Link/router.push اشاره نمی‌کند)
- [ ] یا navigation link اضافه شد، یا route حذف/redirect شد
- [ ] تست navigation: کاربر بتواند به این صفحه (یا destination) برسد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: بررسی کن آیا این route از طریق dynamic URL (مثل sidebar config) اشاره می‌شود — grep روی `/Dashboar` در کل کدبیس بزن.
گام ۲: اگر orphan واقعی است، یا (الف) lin/redirect در navigation اصلی اضافه کن، یا (ب) فایل route را حذف کن.
گام ۳: اگر deprecated است، redirect 301 به route جدید بنویس.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف route ممکن است bookmark خارجی/SEO link خارجی را بشکند. اگر SEO اهمیت دارد، redirect بنویس نه delete.

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
تسک 3 از 3
  id: ffc7fd33-e90b-4546-9645-feca2412ee9a
  عنوان اصلی: بررسی و رفع دکمه حذف بدون handler
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: frontend/src/pages/Lists.jsx

📋 acceptance_criteria کامل:
  - git blame مشخص می‌کند چرا این دکمه `onDelete(list.id)}
        className="text-gray-400 hover:text-red-600 text-sm"
` فاقد handler است [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - یکی از این سه حالت تعیین شده: (a) handler restore شده + کار می‌کند، (b) دکمه حذف شده، (c) به‌صورت decorative علامت‌گذاری شده [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اگر دکمه باقی ماند، تست end-to-end (Playwright یا cypress) برای کلیک و تأیید رفتار اضافه شده [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/lists"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "screenshot", "label": "before_delete_interaction"}, {"action]

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
دکمه‌ی UI بدون handler: onDelete(list.id)}
        className="text-gray-400 hover:text-red-600 text-sm"

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/pages/Lists.jsx`

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
یک دکمه/کنترل UI در فایل `frontend/src/pages/Lists.jsx` پیدا شد که هیچ event handler معنادار به آن متصل نیست (onClick، onChange، form submit، router push، یا API call شناسایی نشد).

## 🔍 جزئیات
- label/متن دکمه: `onDelete(list.id)}
        className="text-gray-400 hover:text-red-600 text-sm"
`
- فایل: `frontend/src/pages/Lists.jsx`
- علت تشخیص stale_detector: button has no onClick handler

## 🤔 چرا مهم است
دکمه بدون handler از دید کاربر کار نمی‌کند و دو حالت دارد:
  ۱) **dead UI**: دکمه از قبل کار می‌کرده و در refactor شکست خورده (regression) — باید handler بازگردانده شود.
  ۲) **forgotten option**: دکمه placeholder بوده و هرگز پیاده‌سازی نشده — باید یا حذف شود یا پیاده‌سازی کامل شود.
  ۳) **decorative**: فقط نمایشی است — باید با `aria-disabled` یا `role="presentation"` علامت شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] git blame مشخص می‌کند چرا این دکمه `onDelete(list.id)}
        className="text-gray-400 hover:text-red-600 text-sm"
` فاقد handler است
  🎯 معیار قابل-verify: git blame خروجی + توضیح در PR description
- [ ] یکی از این سه حالت تعیین شده: (a) handler restore شده + کار می‌کند، (b) دکمه حذف شده، (c) به‌صورت decorative علامت‌گذاری شده
  🎯 معیار قابل-verify: تست دستی روی UI + screenshot قبل/بعد
- [ ] اگر دکمه باقی ماند، تست end-to-end (Playwright یا cypress) برای کلیک و تأیید رفتار اضافه شده
  🎯 معیار قابل-verify: test passing + assertion روی نتیجه کلیک
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: مشخص کن کدام یک از سه حالت بالاست — git blame روی این خط بزن تا commit اصلی + intent اولیه را ببینی.
گام ۲: اگر regression است، handler از commit قبلی را restore کن.
گام ۳: اگر forgotten است، یا feature را کامل پیاده کن یا دکمه را حذف کن.
گام ۴: اگر decorative است، attribute مناسب اضافه کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `npm run lint`
- `npm run build`

## ⚠️ ریسک‌ها و موارد احتیاط
اگر این دکمه از طریق DOM event delegation در فایل دیگری handle می‌شود، حذف آن سکوت می‌شکند. قبل از حذف، grep روی `data-action`، `data-testid`، یا label/text در کل کدبیس انجام شود.

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
- در commit message: `merged-from: f0e87289-ec88-4bfd-a31a-35f73bfea95c, f7c47da1-dd62-45dc-a974-ac69d2cd6d04, ffc7fd33-e90b-4546-9645-feca2412ee9a`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

🧬 این یک تسک تلفیقی است — از 3 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها به طور خاص به مسائل مربوط به فرانت‌اند می‌پردازند، از جمله رفع باگ‌های UI/UX (مانند دکمه‌های بدون handler)، رسیدگی به الگوهای طراحی نامناسب در زمینه فرانت‌اند و پاکسازی مسیرهای بلااستفاده فرانت‌اند.
🎯 theme: بهبود رابط کاربری و پاکسازی کد فرانت‌اند
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 3
  id: f0e87289-ec88-4bfd-a31a-35f73bfea95c
  عنوان اصلی: Anti-pattern: Threshold-Outcome mismatch
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: frontend/src/context/AuthContext.jsx

📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=static] [verify_plan={"grep_patterns": ["API_BASE = \"\""], "files_hint": ["frontend/src/context/AuthContext.jsx"]}]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["process.env.REACT_APP_API_BASE"], "files_hint": ["frontend/src/context/AuthContext.jsx"]}]
  - تست edge case نوشته شد [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/dashboard"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "assert_visible", "selector": "[data-testid='dashboard-co]

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
Anti-pattern: Threshold-Outcome mismatch

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/context/AuthContext.jsx:6`

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

- `frontend/src/pages/Login.jsx` — این فایل `AuthContext.jsx` را import می‌کند (caller)
- `frontend/src/pages/Notifications.jsx` — این فایل `AuthContext.jsx` را import می‌کند (caller)
- `frontend/src/pages/Register.jsx` — این فایل `AuthContext.jsx` را import می‌کند (caller)
- `frontend/src/components/Footer.jsx` — این فایل `AuthContext.jsx` را import می‌کند (caller)

## 🔍 Context و وضعیت فعلی
The `API_BASE` is an empty string, which means all API calls will be relative to the current origin. This is a fragile configuration and will likely lead to failed API requests in most deployment scenarios (e.g., different domains/ports for frontend/backend). It should be configured via environment variables to ensure correct API endpoint resolution.

📁 file: frontend/src/context/AuthContext.jsx (line 6)

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
- `npm run lint`
- `npm run build`

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
تسک 2 از 3
  id: f7c47da1-dd62-45dc-a974-ac69d2cd6d04
  عنوان اصلی: رسیدگی به route فرانت‌اند بلااستفاده /Dashboar
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - تأیید شد که `/Dashboar` orphan است (هیچ Link/router.push اشاره نمی‌کند) [verify_method=static] [verify_plan={"grep_patterns": ["<Link href=\"/Dashboar\"", "router.push('/Dashboar')", "window.location.href = '/Dashboar'", "redirect: '/Dashboar'"], "files_hint": ["frontend/**/*.tsx", "frontend/**/*.jsx", "fro]
  - یا navigation link اضافه شد، یا route حذف/redirect شد [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - تست navigation: کاربر بتواند به این صفحه (یا destination) برسد [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/Dashboar"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "screenshot", "label": "dashboar_page_loaded"}, {"action":]

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
route فرانت‌اند بلااستفاده: /Dashboar

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
route `/Dashboar` در فایل `` تعریف شده ولی هیچ `Link`، `router.push`، یا redirect در کدبیس به آن اشاره نمی‌کند.

## 🔍 جزئیات
- route path: `/Dashboar`
- فایل: ``
- علت: route exists in app router but no Link/router.push/nav-config references it

## 🤔 چرا مهم است
route orphan یعنی صفحه‌ای که فقط با تایپ مستقیم URL قابل دسترسی است. یا فراموش شده یا منسوخ. باعث می‌شود کاربر هرگز به feature نرسد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تأیید شد که `/Dashboar` orphan است (هیچ Link/router.push اشاره نمی‌کند)
- [ ] یا navigation link اضافه شد، یا route حذف/redirect شد
- [ ] تست navigation: کاربر بتواند به این صفحه (یا destination) برسد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: بررسی کن آیا این route از طریق dynamic URL (مثل sidebar config) اشاره می‌شود — grep روی `/Dashboar` در کل کدبیس بزن.
گام ۲: اگر orphan واقعی است، یا (الف) lin/redirect در navigation اصلی اضافه کن، یا (ب) فایل route را حذف کن.
گام ۳: اگر deprecated است، redirect 301 به route جدید بنویس.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest`
- `npm run build`
- `npm run lint`

## ⚠️ ریسک‌ها و موارد احتیاط
حذف route ممکن است bookmark خارجی/SEO link خارجی را بشکند. اگر SEO اهمیت دارد، redirect بنویس نه delete.

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
تسک 3 از 3
  id: ffc7fd33-e90b-4546-9645-feca2412ee9a
  عنوان اصلی: بررسی و رفع دکمه حذف بدون handler
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: frontend/src/pages/Lists.jsx

📋 acceptance_criteria کامل:
  - git blame مشخص می‌کند چرا این دکمه `onDelete(list.id)}
        className="text-gray-400 hover:text-red-600 text-sm"
` فاقد handler است [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - یکی از این سه حالت تعیین شده: (a) handler restore شده + کار می‌کند، (b) دکمه حذف شده، (c) به‌صورت decorative علامت‌گذاری شده [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی", "grep_patterns": [], "files_hint": []}]
  - اگر دکمه باقی ماند، تست end-to-end (Playwright یا cypress) برای کلیک و تأیید رفتار اضافه شده [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/lists"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "screenshot", "label": "before_delete_interaction"}, {"action]

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
دکمه‌ی UI بدون handler: onDelete(list.id)}
        className="text-gray-400 hover:text-red-600 text-sm"

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/pages/Lists.jsx`

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
یک دکمه/کنترل UI در فایل `frontend/src/pages/Lists.jsx` پیدا شد که هیچ event handler معنادار به آن متصل نیست (onClick، onChange، form submit، router push، یا API call شناسایی نشد).

## 🔍 جزئیات
- label/متن دکمه: `onDelete(list.id)}
        className="text-gray-400 hover:text-red-600 text-sm"
`
- فایل: `frontend/src/pages/Lists.jsx`
- علت تشخیص stale_detector: button has no onClick handler

## 🤔 چرا مهم است
دکمه بدون handler از دید کاربر کار نمی‌کند و دو حالت دارد:
  ۱) **dead UI**: دکمه از قبل کار می‌کرده و در refactor شکست خورده (regression) — باید handler بازگردانده شود.
  ۲) **forgotten option**: دکمه placeholder بوده و هرگز پیاده‌سازی نشده — باید یا حذف شود یا پیاده‌سازی کامل شود.
  ۳) **decorative**: فقط نمایشی است — باید با `aria-disabled` یا `role="presentation"` علامت شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] git blame مشخص می‌کند چرا این دکمه `onDelete(list.id)}
        className="text-gray-400 hover:text-red-600 text-sm"
` فاقد handler است
  🎯 معیار قابل-verify: git blame خروجی + توضیح در PR description
- [ ] یکی از این سه حالت تعیین شده: (a) handler restore شده + کار می‌کند، (b) دکمه حذف شده، (c) به‌صورت decorative علامت‌گذاری شده
  🎯 معیار قابل-verify: تست دستی روی UI + screenshot قبل/بعد
- [ ] اگر دکمه باقی ماند، تست end-to-end (Playwright یا cypress) برای کلیک و تأیید رفتار اضافه شده
  🎯 معیار قابل-verify: test passing + assertion روی نتیجه کلیک
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: مشخص کن کدام یک از سه حالت بالاست — git blame روی این خط بزن تا commit اصلی + intent اولیه را ببینی.
گام ۲: اگر regression است، handler از commit قبلی را restore کن.
گام ۳: اگر forgotten است، یا feature را کامل پیاده کن یا دکمه را حذف کن.
گام ۴: اگر decorative است، attribute مناسب اضافه کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `npm run lint`
- `npm run build`

## ⚠️ ریسک‌ها و موارد احتیاط
اگر این دکمه از طریق DOM event delegation در فایل دیگری handle می‌شود، حذف آن سکوت می‌شکند. قبل از حذف، grep روی `data-action`، `data-testid`، یا label/text در کل کدبیس انجام شود.

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
- در commit message: `merged-from: f0e87289-ec88-4bfd-a31a-35f73bfea95c, f7c47da1-dd62-45dc-a974-ac69d2cd6d04, ffc7fd33-e90b-4546-9645-feca2412ee9a`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. ریشه anti-pattern تشخیص داده شد _(verify: static)_
2. یا کد اصلاح شد، یا کامنت توجیهی اضافه شد _(verify: static)_
3. تست edge case نوشته شد _(verify: ui_interaction)_
4. تأیید شد که `/Dashboar` orphan است (هیچ Link/router.push اشاره نمی‌کند) _(verify: static)_
5. یا navigation link اضافه شد، یا route حذف/redirect شد _(verify: manual_only)_
6. تست navigation: کاربر بتواند به این صفحه (یا destination) برسد _(verify: ui_interaction)_
7. git blame مشخص می‌کند چرا این دکمه `onDelete(list.id)}
        className="text-gray-400 hover:text-red-600 text-sm"
` فاقد handler است _(verify: manual_only)_
8. یکی از این سه حالت تعیین شده: (a) handler restore شده + کار می‌کند، (b) دکمه حذف شده، (c) به‌صورت decorative علامت‌گذاری شده _(verify: manual_only)_
9. اگر دکمه باقی ماند، تست end-to-end (Playwright یا cypress) برای کلیک و تأیید رفتار اضافه شده _(verify: ui_interaction)_

## Task Steps

### Step 1: بررسی و رفع Anti-pattern Threshold-Outcome mismatch در AuthContext.jsx
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی و رفع anti-pattern مربوط به API_BASE خالی در فایل frontend/src/context/AuthContext.jsx است. باید ریشه مشکل تشخیص داده شود و یا کد اصلاح شود (با استفاده از process.env.REACT_APP_API_BASE) یا کامنت توجیهی اضافه شود. همچنین باید تست edge case نوشته شود. خارج از این مرحله: تغییر در سایر فایل‌ها یا رفع سایر anti-patternها.
— [merged] این مرحله شامل تشخیص ریشه anti-pattern Threshold-Outcome mismatch در فایل frontend/src/context/AuthContext.jsx است. باید با استفاده از grep_patterns مشخص شده (API_BASE = "")، وجود این الگو تأیید شود. خارج از این مرحله: اصلاح کد یا اضافه کردن کامنت.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
Anti-pattern: Threshold-Outcome mismatch

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/context/AuthContext.jsx:6`

...

## 🔍 Context و وضعیت فعلی
The `API_BASE` is an empty string, which means all API calls will be relative to the current origin. This is a fragile configuration and will likely lead to failed API requests in most deployment scenarios (e.g., different domains/ports for frontend/backend). It should be configured via environment variables to ensure correct API endpoint resolution.

📁 file: frontend/src/context/AuthContext.jsx (line 6)
```

### Step 2: بررسی و رفع route فرانت‌اند بلااستفاده /Dashboar (مرحله 1: تشخیص orphan)
**Status:** `done` (100%)
**Scope:** این مرحله شامل تأیید orphan بودن route /Dashboar است. باید با grep در کل کدبیس (frontend/**/*.tsx, frontend/**/*.jsx) جستجو شود که آیا هیچ Link، router.push، یا redirect به این route اشاره می‌کند یا خیر. خارج از این مرحله: اضافه کردن navigation link، حذف route، یا نوشتن redirect.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
route فرانت‌اند بلااستفاده: /Dashboar

...

## 🔍 Context و وضعیت فعلی
## 📋 شرح
route `/Dashboar` در فایل `` تعریف شده ولی هیچ `Link`، `router.push`، یا redirect در کدبیس به آن اشاره نمی‌کند.

## 🔍 جزئیات
- route path: `/Dashboar`
- فایل: ``
- علت: route exists in app router but no Link/router.push/nav-config references it
```

### Step 3: بررسی و رفع route فرانت‌اند بلااستفاده /Dashboar (مرحله 2: تصمیم‌گیری و اقدام)
**Status:** `done` (100%)
**Scope:** این مرحله شامل تصمیم‌گیری و اقدام بر اساس نتیجه مرحله قبل است. اگر route /Dashboar orphan است، باید یا (الف) navigation link در منوی اصلی اضافه شود، یا (ب) route حذف شود، یا (ج) redirect 301 به route جدید نوشته شود. خارج از این مرحله: نوشتن تست navigation.
**Excerpt:**
```
گام ۲: اگر orphan واقعی است، یا (الف) lin/redirect در navigation اصلی اضافه کن، یا (ب) فایل route را حذف کن.
گام ۳: اگر deprecated است، redirect 301 به route جدید بنویس.
```

### Step 4: بررسی و رفع route فرانت‌اند بلااستفاده /Dashboar (مرحله 3: نوشتن تست navigation)
**Status:** `done` (100%)
**Scope:** این مرحله شامل نوشتن تست navigation برای route /Dashboar (یا destination جدید) است. تست باید با استفاده از ui_interaction، کاربر را به این مسیر هدایت کند و بارگذاری صفحه را تأیید کند. خارج از این مرحله: تغییر در کد route یا navigation.
— [merged] این مرحله شامل اجرای تست navigation نوشته شده برای route /Dashboar است. باید اطمینان حاصل شود که تست پاس می‌شود و صفحه به درستی بارگذاری می‌شود. خارج از این مرحله: تغییر در کد route یا navigation.
**Excerpt:**
```
- تست navigation: کاربر بتواند به این صفحه (یا destination) برسد [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/Dashboar"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "screenshot", "label": "dashboar_page_loaded"}, {"action":]
```

### Step 5: بررسی و رفع دکمه حذف بدون handler در Lists.jsx (مرحله 1: تشخیص علت با git blame)
**Status:** `done` (100%)
**Scope:** این مرحله شامل استفاده از git blame برای تشخیص علت فقدان handler در دکمه حذف در فایل frontend/src/pages/Lists.jsx است. باید مشخص شود که آیا این یک regression است (handler قبلاً وجود داشته و در refactor شکسته شده)، یک forgotten option است (هرگز پیاده‌سازی نشده)، یا decorative است. خارج از این مرحله: اعمال تغییرات.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
دکمه‌ی UI بدون handler: onDelete(list.id)}
        className="text-gray-400 hover:text-red-600 text-sm"

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/pages/Lists.jsx`

...

## 🔍 Context و وضعیت فعلی
## 📋 شرح
یک دکمه/کنترل UI در فایل `frontend/src/pages/Lists.jsx` پیدا شد که هیچ event handler معنادار به آن متصل نیست (onClick، onChange، form submit، router push، یا API call شناسایی نشد).
```

### Step 6: بررسی و رفع دکمه حذف بدون handler در Lists.jsx (مرحله 2: اعمال تغییرات)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اعمال تغییرات بر اساس تشخیص مرحله قبل است. بسته به تشخیص، باید یکی از سه حالت زیر انجام شود: (a) handler restore شده و کار کند، (b) دکمه حذف شود، (c) به‌صورت decorative علامت‌گذاری شود (با aria-disabled یا role="presentation"). خارج از این مرحله: نوشتن تست end-to-end.
**Excerpt:**
```
گام ۲: اگر regression است، handler از commit قبلی را restore کن.
گام ۳: اگر forgotten است، یا feature را کامل پیاده کن یا دکمه را حذف کن.
گام ۴: اگر decorative است، attribute مناسب اضافه کن.
```

### Step 7: بررسی و رفع دکمه حذف بدون handler در Lists.jsx (مرحله 3: نوشتن تست end-to-end)
**Status:** `done` (100%)
**Scope:** این مرحله شامل نوشتن تست end-to-end (Playwright یا Cypress) برای دکمه حذف است، در صورتی که دکمه باقی مانده باشد. تست باید کلیک روی دکمه و تأیید رفتار (مثلاً حذف آیتم) را پوشش دهد. خارج از این مرحله: تغییر در کد دکمه.
— [merged] این مرحله شامل اجرای تست end-to-end نوشته شده برای دکمه حذف در فایل frontend/src/pages/Lists.jsx است. باید اطمینان حاصل شود که تست پاس می‌شود و کلیک روی دکمه منجر به رفتار مورد انتظار می‌شود. خارج از این مرحله: تغییر در کد دکمه.
**Excerpt:**
```
- اگر دکمه باقی ماند، تست end-to-end (Playwright یا cypress) برای کلیک و تأیید رفتار اضافه شده [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/lists"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "screenshot", "label": "before_delete_interaction"}, {"action}]
```

### Step 8: اجرای Linter و Type-Check برای تسک 1 (AuthContext.jsx)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای linter و type-check برای اطمینان از عدم وجود warning یا error پس از تغییرات در فایل frontend/src/context/AuthContext.jsx است. دستورات npm run lint و tsc --noEmit اجرا می‌شوند. خارج از این مرحله: اجرای تست‌ها.
**Excerpt:**
```
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)
```

### Step 9: اجرای تست‌ها برای تسک 1 (AuthContext.jsx)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تست‌های موجود (npm run test / pytest) برای اطمینان از عدم شکستن آنها پس از تغییرات در فایل frontend/src/context/AuthContext.jsx است. خارج از این مرحله: اجرای linter یا type-check.
**Excerpt:**
```
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
```

### Step 10: اجرای Linter و Type-Check برای تسک 2 (/Dashboar route)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای linter و type-check برای اطمینان از عدم وجود warning یا error پس از تغییرات مربوط به route /Dashboar است. دستورات npm run lint و tsc --noEmit اجرا می‌شوند. خارج از این مرحله: اجرای تست‌ها.
**Excerpt:**
```
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)
```

### Step 11: اجرای تست‌ها برای تسک 2 (/Dashboar route)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تست‌های موجود (npm run test / pytest) برای اطمینان از عدم شکستن آنها پس از تغییرات مربوط به route /Dashboar است. خارج از این مرحله: اجرای linter یا type-check.
**Excerpt:**
```
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
```

### Step 12: اجرای Linter و Type-Check برای تسک 3 (دکمه حذف در Lists.jsx)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای linter و type-check برای اطمینان از عدم وجود warning یا error پس از تغییرات در فایل frontend/src/pages/Lists.jsx است. دستورات npm run lint و tsc --noEmit اجرا می‌شوند. خارج از این مرحله: اجرای تست‌ها.
**Excerpt:**
```
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)
```

### Step 13: اجرای تست‌ها برای تسک 3 (دکمه حذف در Lists.jsx)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تست‌های موجود (npm run test / pytest) برای اطمینان از عدم شکستن آنها پس از تغییرات در فایل frontend/src/pages/Lists.jsx است. خارج از این مرحله: اجرای linter یا type-check.
**Excerpt:**
```
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
```

### Step 14: بررسی و رفع Anti-pattern Threshold-Outcome mismatch در AuthContext.jsx (مرحله 2: اصلاح کد یا اضافه کردن کامنت)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اصلاح کد یا اضافه کردن کامنت توجیهی در فایل frontend/src/context/AuthContext.jsx است. باید از process.env.REACT_APP_API_BASE برای مقداردهی API_BASE استفاده شود یا کامنت توجیهی برای خالی ماندن آن اضافه شود. خارج از این مرحله: نوشتن تست edge case.
**Excerpt:**
```
- یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["process.env.REACT_APP_API_BASE"], "files_hint": ["frontend/src/context/AuthContext.jsx"]}]
```

### Step 15: بررسی و رفع Anti-pattern Threshold-Outcome mismatch در AuthContext.jsx (مرحله 3: نوشتن تست edge case)
**Status:** `done` (100%)
**Scope:** این مرحله شامل نوشتن تست edge case برای رفع anti-pattern در فایل frontend/src/context/AuthContext.jsx است. تست باید با استفاده از ui_interaction، رفتار برنامه را در شرایط لبه (مثلاً عدم وجود environment variable) بررسی کند. خارج از این مرحله: اصلاح کد یا اضافه کردن کامنت.
— [merged] این مرحله شامل اجرای تست edge case نوشته شده برای رفع anti-pattern در فایل frontend/src/context/AuthContext.jsx است. باید اطمینان حاصل شود که تست پاس می‌شود و رفتار برنامه در شرایط لبه به درستی مدیریت می‌شود. خارج از این مرحله: اصلاح کد یا اضافه کردن کامنت.
**Excerpt:**
```
- تست edge case نوشته شد [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/dashboard"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "assert_visible", "selector": "[data-testid='dashboard-co]
```

### Step 16: بررسی و رفع route فرانت‌اند بلااستفاده /Dashboar (مرحله 5: اجرای تست‌های موجود)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تست‌های موجود (npm run test / pytest) برای اطمینان از عدم شکستن آنها پس از تغییرات مربوط به route /Dashboar است. خارج از این مرحله: اجرای linter یا type-check.
**Excerpt:**
```
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
```

### Step 17: بررسی و رفع دکمه حذف بدون handler در Lists.jsx (مرحله 5: اجرای تست‌های موجود)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تست‌های موجود (npm run test / pytest) برای اطمینان از عدم شکستن آنها پس از تغییرات در فایل frontend/src/pages/Lists.jsx است. خارج از این مرحله: اجرای linter یا type-check.
**Excerpt:**
```
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
```

### Step 18: بررسی و رفع Anti-pattern Threshold-Outcome mismatch در AuthContext.jsx (مرحله 5: اجرای تست‌های موجود)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تست‌های موجود (npm run test / pytest) برای اطمینان از عدم شکستن آنها پس از تغییرات در فایل frontend/src/context/AuthContext.jsx است. خارج از این مرحله: اجرای linter یا type-check.
**Excerpt:**
```
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
```

### Step 19: بررسی و رفع route فرانت‌اند بلااستفاده /Dashboar (مرحله 6: اجرای Linter و Type-Check)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای linter و type-check برای اطمینان از عدم وجود warning یا error پس از تغییرات مربوط به route /Dashboar است. دستورات npm run lint و tsc --noEmit اجرا می‌شوند. خارج از این مرحله: اجرای تست‌ها.
**Excerpt:**
```
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)
```
