# تصمیم: «مرکز توسعه» — آینهٔ GitHub/Render داخل Lifemanager (2026-07-18)

## صورت‌مسئله (خواستهٔ مالک)

زیرساخت سینک اپ خواهرِ project-management (سینک مخزن‌ها با توکن GitHub، سینک
چند-ثانیه‌ای لاگ سرویس‌ها با توکن Render — همان پنل تنظیمات/لاگ زندهٔ اسکرین‌شات)
داخل Lifemanager پیاده شود؛ بخش «پروژه‌ها» وضعیت واقعی هر پروژه را نشان دهد؛
لاگ‌های خام تکراری/انگلیسی به «امروز در هر پروژه چه کردم» فارسی تبدیل و هم در
لاگ کلی هم ذیل هر پروژه ثبت شود؛ و **هیچ موازی‌کاری با خود project-management
نشود** (آن اپ مرجع مدیریت مهندسی می‌ماند).

## آنچه از اپ خواهر الگو گرفته شد (و آنچه عمداً نگرفتیم)

گرفتیم: GET `/user/repos` صفحه‌بندی‌شده؛ Render `/v1/owners→/services→/logs`;
چیپ‌های سرویس/سطح + بازه + جستجو + پنل مونوی تیره + poll ده‌ثانیه‌ای؛ نگاشت
service→project; تنظیم توکن از UI.
نگرفتیم (تعمداً، ضد-موازی‌کاری): ایشوسازی مهندسی از خطاها، health analysis /
engineering report، آرشیو gzip لاگ (اینجا «کارنامهٔ روزانه» رکورد بلندمدت است)،
env-var editor / restart / deploy از داخل اپ. به‌جایش فقط «وظیفهٔ زندگی»
(رسیدگی/پیگیری) ساخته می‌شود که به پروژهٔ زندگی لینک است.

## تفاوت‌های معماری با مرجع (چرا)

| مرجع (PM app) | اینجا | چرا |
|---|---|---|
| SQLAlchemy سینکرون + JSON فایل روی دیسک | async SQLAlchemy + پنج جدول | قرارداد repo؛ دیسک ephemeral |
| توکن plaintext در DB + echo به .env | Fernet encrypted-at-rest، has_api_key فقط | قانون Secrets در CLAUDE.md |
| APScheduler | حلقهٔ asyncio با الگوی attention engine | free tier بدون worker؛ الگوی بومی repo |
| WebSocket استریم | poll سبک ۱۰ثانیه‌ای (fetch→read) | سادگی/سازگاری با SPA موجود |
| retention+آرشیو gzip | retention کوتاه + کارنامهٔ فارسی به‌عنوان آرشیو | خواستهٔ مالک: خلاصهٔ انسانی، نه لاگ خام |

## طرح داده

`dev_integrations` (توکن رمز‌شده per-provider)؛ `dev_projects` (mirror مخزن؛
`linked_project_id` پل به پروژه‌های زندگی)؛ `dev_services` (PK=srv-id رندر؛
auto-link به مخزن از روی repo URL)؛ `dev_logs` (PK=hash محتوا ⇒ dedup)؛
`dev_log_summaries` (per service × local-date؛ `ai_model NULL` ⇒ متن fallback).
Migration 0038 + ثبت در `models/__init__` (بدون ALTER — همه جدول جدیدند).

## جریان‌ها

- موتور `dev_sync_loop`: مخزن‌ها ۶۰د، سرویس‌ها ۳۰د، لاگ ۱۲۰ث، پاکسازی ۶س،
  کارنامه هر شب ساعت ۲۲ محلی (env/UI قابل تنظیم؛ DEFAULTS < env < blob).
- کارنامه: digest deterministic (گروه‌بندی پیام‌های عددزدوده، خطاهای distinct،
  رویداد deploy) → LLM (task `dev_log_summary` از gateway موجود) → fallback
  فارسی بدون AI؛ ثبت در `record_activity` با entity=dev_project و
  context=پروژهٔ زندگی ⇒ در «لاگ فعالیت‌ها»ی کلی و پنل ذیل پروژه دیده می‌شود.
- «نیازمند رسیدگی» (بدون تداخل با PM): آستانهٔ خطای ۲۴س، سرویس suspended/gone،
  رکود مخزن > N روز → دکمهٔ «ایجاد وظیفه» → Task زندگی.

## UI

صفحهٔ `/dev-center` (نمای کلی | لاگ زنده | آمار | کارنامهٔ روزانه | تنظیمات) +
تب سوم «پروژه‌های توسعه» در هاب پروژه‌ها + لینک سایدبار «مرکز توسعه». پنل لاگ
`dir="ltr"`؛ متن‌های فارسیِ mixed داخل ancestorهای rtl (قانون bidi).

## استقرار (اقدام مالک در Render)

سرویس Lifemanager → Environment → دو متغیر: `GITHUB_TOKEN` (PAT با read repo)
و `RENDER_API_KEY` (Account Settings → API Keys). بدون این‌ها اپ سالم می‌ماند
(no_token، پاسخ‌های خالی)؛ با UI هم می‌شود توکن را رمز‌شده در DB گذاشت که بر env
اولویت دارد. برای کیفیت کارنامه، یک مدل متنی در «تنظیمات AI» فعال باشد؛ نبودش
⇒ fallback قطعی.

## Verify

`tests/test_dev_sync*.py` (۲۸ تست: توکن/ماسک، سینک‌ها با fetcher تقلبی، dedup،
فیلترها، fallback کارنامه + آینهٔ activity، ماتریس تصمیم‌های موتور)؛ زنجیرهٔ
alembic تا 0038 روی DB خالی سبز؛ کل suite برابر بیس‌لاین (۱۳ خطای از-قبل)؛
`npm run build` سبز؛ بازبینی چندبعدی خصمانه (workflow) اجرا و یافته‌ها اعمال شد
(جزئیات در AUDIT_LOG).
