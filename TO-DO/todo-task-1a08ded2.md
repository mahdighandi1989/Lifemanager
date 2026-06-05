# TODO — Task 1a08ded2 (نیاز به تکمیل دستی)

> **به‌روزرسانی خودکار دسترسی مدل‌ها**

## 🔎 خلاصه وضعیت

- **task_id**: `1a08ded2-2801-4389-905c-94972c928461`
- **repo**: `mahdighandi1989/Lifemanager`
- **verification_status**: `partial`
- **archived_reason**: `max_retries` — Claude به سقف retry رسید بدون اینکه verify=done شود
- **retries_done**: 1
- **verifier confidence**: 0.00
- **verifier model**: `—`
- **report_id**: `1435821c-2d52-4c05-935b-b9559adb39d2`
- **created_at**: 2026-06-05T05:33:23.475825+00:00

## 🚧 چه چیزی باقی مانده (مهم‌ترین بخش)

- [ ] فیلد provider از نوع str در AIModelConfig و AIModelConfigCreate به provider_id تغییر یافته
- [ ] endpoint PUT /api/ai/global-prompt فیلدهای last_edited_at و edited_by_user_id را تنظیم نمی‌کند
- [ ] migration Alembic برای جدول global_analysis_prompts ایجاد نشده
- [ ] endpoint PUT /api/ai/analysis_prompt برای کاربران غیرادمین 403 برنمی‌گرداند
- [ ] endpoint PUT /api/ai/analysis_prompt برای ادمین پرامپت را به‌روزرسانی نمی‌کند
- [ ] شمای AIContextResponse و AIContextItem در ai_schema.py تعریف نشده
- [ ] تست‌های واحد برای orchestrate_analysis در tests/test_ai_service.py اضافه نشده
- [ ] وظیفه Celery process_ai_ingestion_event در app/tasks.py تعریف نشده
- [ ] پس از ایجاد TodoItem جدید، وظیفه process_ai_ingestion_event در صف Celery قرار نمی‌گیرد
- [ ] مستندات docs/API.md برای فیلد provider به‌روزرسانی نشده

## ✅ چه چیزی Claude انجام داد

- [x] مدل AIProvider و جدول ai_providers در app/models/ai_provider.py ایجاد شده
- [x] مدل GlobalAnalysisPrompt و جدول global_analysis_prompts ایجاد شده
- [x] مسیرهای API برای CRUD ارائه‌دهندگان و مدل‌ها در app/routes/ai.py پیاده‌سازی شده
- [x] سرویس provider_service و model_service در app/services/ai/ پیاده‌سازی شده
- [x] صفحه AISettings.jsx در فرانت‌اند برای مدیریت ارائه‌دهندگان و مدل‌ها وجود دارد
- [x] رمزنگاری کلیدهای API از طریق crypt_service پیاده‌سازی شده
- [x] شمای AIProviderResponse در app/schemas/ai_provider_schema.py تعریف شده
- [x] endpoint GET /api/ai/global-prompt پرامپت تحلیل جهانی را برمی‌گرداند
- [x] فایل analysis_prompt.py و analysis_prompt_service.py ایجاد شده
- [x] سرویس ai_data_access_service.py برای بازیابی داده‌های کاربر ایجاد شده
- [x] endpoint GET /api/ai/user_data_context داده‌های متنی کاربر را برمی‌گرداند
- [x] سرویس ai_service.py از داده‌های context برای تحلیل استفاده می‌کند
- [x] endpoint POST /api/ai/analyze در app/routes/ai.py تعریف شده
- [x] متد orchestrate_analysis در ai_service.py پیاده‌سازی شده
- [x] قابلیت FEATURE_AI_ENABLED و بازگشت 403 در صورت غیرفعال بودن
- [x] صفحه Settings.jsx در فرانت‌اند ایجاد و از طریق /settings قابل دسترسی است
- [x] لینک تنظیمات در Sidebar و Header فرانت‌اند وجود دارد
- [x] مسیر /settings/ai-models برای مدیریت مدل‌های AI قابل دسترسی است
- [x] جدول global_settings با ستون‌های id, key, value ایجاد شده
- [x] endpoint GET و PUT برای /api/settings/global-analysis-prompt پیاده‌سازی شده
- [x] دکمه‌های ذخیره و لغو در صفحه تنظیمات پرامپت پیاده‌سازی شده
- [x] فایل event_publisher.py و تابع publish_data_change_event وجود دارد
- [x] سرویس ai_ingestion_service.py برای بازیابی TodoItem و ارسال به nlp_service ایجاد شده
- [x] تابع analyze_content در nlp_service.py برای تحلیل محتوای متنی پیاده‌سازی شده

## 📝 خلاصهٔ verifier

Verified step 6 (auto-update model access) fully implemented and passing: event_publisher.publish_data_change_event, Celery process_ai_ingestion_event, todo_items publishes created event, ai_ingestion_service.ingest_entity, nlp_service.analyze_content returns {summary,keywords}. 80 AI/core tests pass, no regression. No-op verification commit pushed to main.

## 📋 Acceptance Criteria (مرجع کامل)

این لیست معیار done شدن تسک است — هر آیتمی که هنوز satisfy نیست
باید توسط انسان تکمیل شود.

- جداول `ai_providers` و `ai_models` در پایگاه داده ایجاد شده باشند و جدول `ai_model_configs` با فیلدهای جدید `ai_model_id`, `alias`, `custom_api_key`, `custom_config_json`, `is_default_for_user` و حذف `model_name`, `provider` به‌روزرسانی شده باشد.
- مسیرهای API جدید برای CRUD ارائه‌دهندگان (مثلاً `POST /ai/providers`, `GET /ai/providers/{id}`) و مدل‌ها (مثلاً `POST /ai/models`, `GET /ai/models/{id}`) در `app/routes/ai.py` قابل دسترسی باشند.
- توابع سرویس در `app/services/ai/provider_service.py` و `app/services/ai/model_service.py` (یا فایل‌های مشابه) برای مدیریت `AIProvider` و `AIModel` و `AIModelConfig` (کاربر-محور) به درستی پیاده‌سازی شده باشند.
- یک صفحه تنظیمات در فرانت‌اند (مثلاً `frontend/src/pages/AISettings.jsx`) وجود داشته باشد که امکان مشاهده، افزودن و ویرایش ارائه‌دهندگان و مدل‌های هوش مصنوعی را فراهم کند.
- کلیدهای API (چه در سطح ارائه‌دهنده و چه در سطح کاربر) قبل از ذخیره در پایگاه داده رمزنگاری شوند و هنگام بازیابی رمزگشایی شوند.
- فایل `app/models/ai_provider.py` باید شامل تعریف کلاس `AIProvider` با فیلدهای `id`, `name`, `description`, `is_enabled`, `user_id`, `created_at`, `updated_at` باشد.
- فایل `app/schemas/ai_provider_schema.py` باید شامل شمای Pydantic `AIProviderResponse` با فیلدهای `id`, `name`, `description`, `is_enabled`, `user_id`, `created_at`, `updated_at` باشد.
- endpoint `POST /api/ai/providers` باید با احراز هویت ادمین، یک ارائه‌دهنده جدید ایجاد کرده و با کد وضعیت 200 یا 201 و جزئیات ارائه‌دهنده پاسخ دهد.
- endpoint `GET /api/ai/providers` باید با احراز هویت ادمین، لیستی از ارائه‌دهندگان هوش مصنوعی را برگرداند.
- کاربران غیر ادمین که تلاش می‌کنند به endpointهای مدیریت ارائه‌دهندگان (مانند `POST /api/ai/providers`) دسترسی پیدا کنند، باید خطای 403 Forbidden دریافت کنند.
- یک اسکریپت مهاجرت Alembic جدید باید جدول `ai_providers` را در دیتابیس ایجاد کند.
- مدل `AIModelConfig` در `app/models/ai_model_config.py` باید فیلد `provider` از نوع `str` داشته باشد.
- شمای `AIModelConfigCreate` در `app/schemas/ai_schema.py` باید شامل فیلد `provider` از نوع `str` باشد.
- `POST /api/ai/configs` باید امکان ایجاد یک مدل جدید را با تعیین `provider` فراهم کند و کد وضعیت 201 برگرداند. پاسخ باید شامل `id`, `name`, و `provider` باشد.
- `GET /api/ai/configs` باید لیست مدل‌ها را برگرداند و از پارامتر کوئری `provider` برای فیلتر کردن پشتیبانی کند. اگر `provider` مشخص شود، فقط مدل‌های آن ارائه‌دهنده برگردانده شوند.
- `PATCH /api/ai/configs/{config_id}` باید امکان به‌روزرسانی فیلد `provider` یک مدل موجود را فراهم کند و کد وضعیت 200 برگرداند.
- `DELETE /api/ai/configs/{config_id}` باید یک مدل را حذف کند و کد وضعیت 204 برگرداند.
- مستندات `docs/API.md` باید به‌روزرسانی شود تا فیلد `provider` در شمای مدل‌ها و قابلیت فیلتر کردن با پارامتر کوئری `provider` را منعکس کند.
- جدول `global_analysis_prompts` باید در پایگاه داده با فیلدهای `id`, `prompt_text`, `last_edited_at`, و `edited_by_user_id` وجود داشته باشد.
- endpoint `GET /api/ai/global-prompt` باید پرامپت تحلیل جهانی را برگرداند (یا یک پرامپت پیش‌فرض اگر وجود نداشت).
- endpoint `PUT /api/ai/global-prompt` باید بتواند پرامپت را به‌روزرسانی کند و فیلدهای `last_edited_at` و `edited_by_user_id` را به‌درستی تنظیم کند.
- سرویس‌های AI (مانند `app/services/ai_service.py` یا `app/services/ai/nlp_service.py`) باید بتوانند پرامپت تحلیل جهانی را از `global_prompt_service` دریافت و در عملیات خود استفاده کنند.
- یک migration Alembic برای ایجاد جدول `global_analysis_prompts` باید با موفقیت اعمال شود.
- فایل‌های `app/models/analysis_prompt.py` و `app/services/ai/analysis_prompt_service.py` ایجاد شده و شامل مدل و سرویس مربوطه باشند.
- endpoint `GET /api/ai/analysis_prompt` با موفقیت پرامپت تحلیل جهانی را برمی‌گرداند (کد وضعیت 200) و اگر پرامپتی وجود نداشته باشد، یک پرامپت پیش‌فرض خالی یا اولیه را برمی‌گرداند.
- endpoint `PUT /api/ai/analysis_prompt` برای کاربران غیر ادمین با کد وضعیت 403 (Forbidden) پاسخ می‌دهد.
- endpoint `PUT /api/ai/analysis_prompt` برای کاربر ادمین با موفقیت پرامپت را به‌روزرسانی می‌کند (کد وضعیت 200) و محتوای به‌روزرسانی شده را برمی‌گرداند.
- پس از به‌روزرسانی پرامپت توسط ادمین، فراخوانی مجدد `GET /api/ai/analysis_prompt` محتوای به‌روزرسانی شده را برمی‌گرداند که نشان‌دهنده ذخیره صحیح در پایگاه داده است.
- فایل `app/services/ai/ai_data_access_service.py` ایجاد شده و شامل توابعی برای بازیابی داده‌های `Task`, `Project`, `TodoItem` و `Notification` برای یک `user_id` مشخص است.
- یک endpoint جدید `GET /api/ai/user_data_context` در `app/routes/ai.py` تعریف شده که نیاز به احراز هویت دارد و داده‌های متنی کاربر را برمی‌گرداند.
- داده‌های بازگشتی از `GET /api/ai/user_data_context` فقط شامل اطلاعات مربوط به کاربر احراز هویت شده است و هیچ داده‌ای از کاربران دیگر را افشا نمی‌کند.
- شمای Pydantic `AIContextResponse` و `AIContextItem` در `app/schemas/ai_schema.py` تعریف شده‌اند که ساختار داده‌های بازگشتی برای AI را مشخص می‌کنند.
- سرویس `app/services/ai_service.py` قابلیت استفاده از داده‌های 'context' فراهم شده توسط `ai_data_access_service` را در توابع تولید/پرس‌وجوی AI دارد.
- یک endpoint جدید `POST /api/ai/analyze` در `app/routes/ai.py` تعریف شده باشد که `AIAnalysisRequest` را دریافت و `AIAnalysisResult` را برگرداند.
- متد `orchestrate_analysis` در `app/services/ai_service.py` پیاده‌سازی شده باشد که پرامپت، داده‌های مرتبط را دریافت و مدل AI را فراخوانی کند.
- ارسال یک درخواست `POST` به `/api/ai/analyze` با `model_id` و `prompt` معتبر، پاسخ `200 OK` با یک `AIAnalysisResult` معتبر را برگرداند.
- اگر `FEATURE_AI_ENABLED` در تنظیمات `app/core/config.py` غیرفعال باشد، endpoint `/api/ai/analyze` باید `403 Forbidden` برگرداند.
- تست‌های واحد برای متد `orchestrate_analysis` در `tests/test_ai_service.py` اضافه شده باشد که سناریوهای مختلف (انتخاب مدل، بازیابی داده، فراخوانی API) را پوشش دهد.
- فایل جدید `frontend/src/pages/Settings.jsx` ایجاد شده و یک کامپوننت React را export می‌کند.
- صفحه تنظیمات از طریق URL `/settings` قابل دسترسی است و در داخل کامپوننت `Layout` (شامل Header، Sidebar و Footer) رندر می‌شود.
- صفحه `Settings` شامل بخش‌های نگهدارنده مجزا برای «مدیریت ارائه‌دهندگان AI»، «مدیریت مدل‌های AI» و «جعبه پرامپت تحلیل» است.
- یک لینک ناوبری به صفحه «تنظیمات» در کامپوننت `Sidebar` وجود دارد.
- فایل `frontend/src/App.jsx` شامل مسیر جدید برای `/settings` است.
- کاربر می‌تواند به صفحه جدید تنظیمات ارائه‌دهندگان هوش مصنوعی از طریق مسیر `/settings` دسترسی پیدا کند.
- صفحه تنظیمات باید لیستی از ارائه‌دهندگان هوش مصنوعی موجود را نمایش دهد (با فراخوانی `GET /api/ai/configs`).
- کاربر می‌تواند از طریق یک فرم در صفحه تنظیمات، ارائه‌دهنده هوش مصنوعی جدیدی را اضافه کند (با فراخوانی `POST /api/ai/configs`).
- کاربر می‌تواند جزئیات یک ارائه‌دهنده هوش مصنوعی موجود را ویرایش کند (با فراخوانی `PATCH /api/ai/configs/{config_id}`).
- کاربر می‌تواند یک ارائه‌دهنده هوش مصنوعی را از لیست حذف کند (با فراخوانی `DELETE /api/ai/configs/{config_id}`).
- یک لینک به صفحه تنظیمات ارائه‌دهندگان هوش مصنوعی در نوار کناری (Sidebar) یا سربرگ (Header) فرانت‌اند وجود دارد.
- مسیر `/settings/ai-models` در فرانت‌اند قابل دسترسی باشد و صفحه مدیریت مدل‌های AI را نمایش دهد.
- صفحه مدیریت مدل‌ها، لیستی از مدل‌های AI موجود را از endpoint `/api/ai/configs` دریافت و نمایش دهد. این لیست باید شامل فیلدهای `id`, `name`, و `provider` باشد.
- کاربر بتواند از طریق فرم، یک مدل AI جدید اضافه کند که با `POST` به `/api/ai/configs` ارسال شود و پس از موفقیت، مدل جدید در لیست نمایش داده شود.
- کاربر بتواند یک مدل AI موجود را ویرایش کند که با `PATCH` به `/api/ai/configs/{id}` ارسال شود و تغییرات در لیست منعکس شود.
- کاربر بتواند یک مدل AI موجود را حذف کند که با `DELETE` به `/api/ai/configs/{id}` ارسال شود و از لیست حذف شود.
- فیلدهای فرم افزودن/ویرایش مدل شامل گزینه‌ای برای انتخاب ارائه‌دهنده (provider) باشد که از لیست ارائه‌دهندگان موجود پر شود.
- جدول `global_settings` با ستون‌های `id`, `key` (UNIQUE), `value` در پایگاه داده ایجاد شود.
- endpoint `GET /api/settings/global-analysis-prompt` برای ادمین، پرامپت تحلیل جهانی را برمی‌گرداند (یا یک مقدار پیش‌فرض اگر وجود نداشته باشد).
- endpoint `PUT /api/settings/global-analysis-prompt` برای ادمین، پرامپت تحلیل جهانی را به‌روزرسانی می‌کند.
- دسترسی به endpointهای `global-analysis-prompt` برای کاربران غیرادمین با خطای 403 Forbidden مواجه شود.
- یک لینک 'Settings' در `frontend/src/components/Sidebar.jsx` به مسیر `/settings` اضافه شود.
- صفحه `/settings` در فرانت‌اند یک `textarea` نمایش دهد که با مقدار فعلی پرامپت تحلیل جهانی پر شده است.
- دکمه 'ذخیره' در صفحه تنظیمات، تغییرات را به بک‌اند ارسال کرده و پرامپت را به‌روزرسانی کند.
- دکمه 'لغو' در صفحه تنظیمات، تغییرات محلی را نادیده گرفته و مقدار اصلی پرامپت را بازیابی کند.
- فایل `app/services/event_publisher.py` و تابع `publish_data_change_event` در آن وجود داشته باشد.
- وظیفه Celery به نام `process_ai_ingestion_event` در `app/tasks.py` تعریف شده باشد که `entity_type`, `entity_id`, و `action` را به‌عنوان آرگومان می‌پذیرد.
- پس از ایجاد یک `TodoItem` جدید (مثلاً از طریق `app/routes/todo_items.py` که `todo_item_service` را فراخوانی می‌کند)، یک وظیفه `process_ai_ingestion_event` با `entity_type='todo_item'`, `entity_id=<new_item_id>`, `action='created'` در صف Celery قرار گیرد.
- سرویس `app/services/ai_ingestion_service.py` بتواند یک `TodoItem` را با `ID` بازیابی کرده و محتوای متنی آن (مانند `description`) را به `app/services/ai/nlp_service.py` برای پردازش ارسال کند.
- تابع `analyze_content` در `app/services/ai/nlp_service.py` بتواند محتوای متنی را از انواع مختلف موجودیت‌ها پردازش کرده و یک نتیجه تحلیل (حداقل یک دیکشنری با فیلدهای `summary` و `keywords`) برگرداند.

## 🔬 Evidence که verifier پیدا کرد

**Commits:**
- `e98566a`
- `a56415e`
- `65440fd`
- `ad63491`
- `9227ac4`
- `3a66895`
- `91cc5a9`

**Files lams شده:**
- `app/models/ai_provider.py`
- `app/routes/ai.py`
- `app/services/ai/provider_service.py`
- `app/services/ai/model_service.py`
- `app/services/ai/ai_data_access_service.py`
- `app/services/ai/analysis_prompt_service.py`
- `app/services/ai/nlp_service.py`
- `app/services/ai_service.py`
- `app/services/event_publisher.py`

## 💡 ایدهٔ اصلی تسک

[ایدهٔ متنی همراه نیست — دستورالعمل/درخواست کاربر **داخل** محتوای فایل‌های پیوست است. لطفاً متن استخراج‌شدهٔ فایل‌ها را بخوان، دستورالعمل را از آنجا برداشت کن، و یک پرامپت کامل بساز.]

---
## 📎 فایل‌های پیوست (به ترتیب آپلود = ترتیب بخش‌ها)

## 📎 فایل پیوست #1: voice_292354_AgADih0A.ogg
_mime=audio/ogg • model=gemini-2.5-flash • 5 segment استخراج شد • 4,248 char متن_

## شرح ایده اصلی اپلیکیشن  _(at: audio/ogg)_

[00:00] یه صفحه تنظیمات باید توی سیستم باشه که تو اون مدل‌ها رو هم یعنی پرو پرووایدرا رو بتونم قرار بدم مثل دیپ سیک، جی پی تی، جیمنای، کلاد، گراک، پلکسیتی همچین چیزی و چند تای دیگه و اونجا بتونم مدل‌های هر کدوم از این پرووایدرا رو مپینگ کنم و اد کنم و اونها بتونن به صفحات و داده‌های داخل هر صفحه دسترسی داشته باشن و کار آنالیز رو به شکلی که میگم انجام بدن. شکلی هم که بهش میگم باید داخل همون صفحه تنظیمات یه تو اون قسمتی که مدل‌ها و اینها مپینگ شدن چیز کنن یه جعبه‌ای باشه اونجا توضیحات یعنی یه پرامپتی براش بنویسم که این پرامپت هم همیشه بتونه قابل ویرایش باشه. و حسب این پرامپت و این دستورات که هر سری من بهش بدم اونها کار آنالیز رو نسبت به داده‌هایی که توی صفحات دیگه هستن انجام بدن و هر صفحه و هر داده‌ای هم که اضافه میشه اینها باید سریع دسترسی بهش داشته باشن تا تو آنالیز دخالتش بدن.

## ویژگی‌های کلیدی و قابلیت‌ها  _(at: audio/ogg)_

[00:01] یه صفحه تنظیمات باید توی سیستم باشه که تو اون مدل‌ها رو هم یعنی پرو پرووایدرا رو بتونم قرار بدم مثل دیپ‌سیک، جی‌پی‌تی، جِمینای، کلاد، گراک، پرپلکسیتی همچین چیزی و چند تای دیگه و اونجا بتونم مدل‌های هر کدوم از این پرووایدرا رو مپینگ کن

## 📜 پرامپت اصلی (excerpt)

```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

📖 **خواندن کامل + اجرای مو-به-مو (بسیار مهم):**

این پرامپت — از این یادداشت تا انتها — یک سند واحد است که هر بخشش
حاوی الزام یا context منحصربه‌فرد است. خواندن سطحی یا skim کردن **ممنوع**
است.

- پرامپت را **سطر به سطر** بخوان، نه head/tail/فقط-بخش-اصلی.
- اگر بخشی به‌نظر طولانی یا تکراری آمد، **حتماً** بخوان — تفاوت‌های
  ریز ممکن است در آن جا اساسی باشند.
- هر جمله، URL، نام فایل، نام تابع، یا مقدار عددی که در پرامپت آمده،
  دقیقاً همان است که کاربر می‌خواهد — تغییرش نده، رندش نکن، خلاصه‌اش
  نکن.
- اگر پرامپت چندین درخواست/مرحله/زیرتسک دارد، **همه** را پیاده کن. حتی
  یکی را نه به‌عنوان "خارج از scope" حذف کن.

❌ ممنوعات صریح:
- خلاصه‌سازی متن کاربر در commit message یا response
- "این بخش اصلی نیست، رد می‌کنم"
- "کاربر احتمالاً منظورش این بود..." — منظورش همان است که نوشته
- "این URL/نام به نظر قدیمی است، آپدیتش کردم" — تغییر بدون درخواست ممنوع
- پیاده‌سازی فقط بخشی از پرامپت و تظاهر به کامل بودن
- "همه آیتم‌های لیست A را بررسی کردم، B و C مشابه بودند" — نه؛
  هرکدام را جداگانه

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
  با

_[truncated — full prompt در پنل]_
```

---

_این فایل توسط Claude Auto-Runner تولید شده است. تسک با حالت_ `max_retries` _آرشیو شده و دیگر به‌صورت خودکار pickup نمی‌شود._