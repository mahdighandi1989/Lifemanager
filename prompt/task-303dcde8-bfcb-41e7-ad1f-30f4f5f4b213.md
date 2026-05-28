---
task_id: 303dcde8-bfcb-41e7-ad1f-30f4f5f4b213
title: حذف داده‌ی بی‌مصرف از self.db
type: cleanup
priority: low
execution_priority: 4300
status: awaiting_review
external_status: pending
verification_status: partial
watched_id: 44aa6743-bf59-4b44-85ae-54f8af548cc3
project: mahdighandi1989/Lifemanager
created_at: '2026-05-26T20:28:08.561121+00:00'
updated_at: '2026-05-28T19:49:41.281092+00:00'
target_files:
- app/services/ai/image_service.py
---

# حذف داده‌ی بی‌مصرف از self.db

## Raw Idea

## 📋 شرح
attribute `self.db` در `app/services/ai/image_service.py` نوشته می‌شود ولی هیچ reader در کدبیس آن را مصرف نمی‌کند.

## 🤔 چرا مهم است
write بدون read یعنی یا (الف) reader حذف شده (regression)، یا (ب) از قبل برای feature آینده گذاشته شده و فراموش شده.

## 🔍 جزئیات
- علت: self.db write می‌شود ولی هرگز read نشده

## Prompt

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
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

🔗 **وابستگی‌ها و همگام‌سازی (بسیار حیاتی — هرگز skip نکن):**

این بخش از همهٔ بخش‌های دیگرِ این یادداشت **مهم‌تر** است. اگر نقض شود،
نتیجهٔ کار ممکن است مشروع به‌نظر برسد ولی در عمل بخش‌های دیگر سیستم را عقب
بیندازد، broken reference تولید کند، یا منجر به data corruption شود.

پیش از و حین تغییر، تمام وابستگی‌ها را در **چهار جهت** به‌طور **کامل و
بدون هیچ خلاصه‌سازی** شناسایی و همگام کن:

**۱. وابستگی‌های upstream (این تسک به چه چیزهایی متکی است):**
- چه فایل‌ها، توابع، کلاس‌ها، API endpoint ها، schema های دیتابیس،
  env vars، یا config هایی که این تسک نیاز دارد؟
- آیا قرار است چیزی را ویرایش/حذف کنی که جای دیگر (signature، رفتار،
  return type، side effect) از آن انتظار خاصی می‌رود؟
- اگر dependency جدیدی اضافه می‌کنی، آیا با dependencyهای موجود تداخل
  دارد (نسخه، compat، lock file)؟

**۲. وابستگی‌های downstream (چه چیزهایی به این تسک متکی‌اند):**
- چه فایل‌ها، توابع، تست‌ها، migrations، docs، یا UI component هایی از
  کدی که داری ویرایش/اضافه/حذف می‌کنی **استفاده می‌کنند**؟
- با grep و reference search **همه‌ی** call sites، importها، subclassها،
  reference های مستقیم و غیرمستقیم را پیدا کن — نه فقط چند مورد اصلی.
- خصوصاً برای حذف یا rename: هیچ broken reference نباید باقی بماند.

**۳. وابستگی‌های cross-tier (بسیار مهم — هرگز فقط یک لایه را نبین):**

تسک شما ممکن است از backend، frontend، database، worker، یا هر tier
دیگری شروع شده باشد. ولی تغییرات تقریباً همیشه روی tier های دیگر هم
اثر می‌گذارند. **مستقل از اینکه تسک از کدام tier است**، این چک‌های دو
طرفه را همیشه انجام بده:

🔁 **اگر backend را تغییر دادی** (API، service، model، route):
  → frontend: کدام component/page/hook این endpoint یا data shape را
    مصرف می‌کند؟ type definition، state shape، error handling، loading
    state، form validation، URL routing همگی باید همگام شوند.
  → mobile/SDK/client library (اگر پروژه دارد): همان داستان frontend.
  → database: آیا migration لازم است؟ آیا rollback امن است؟
  → background workers: آیا event producer/consumer ها تحت تأثیرند؟
  → rate limit، auth، CORS، CSP: آیا رفتار جدید پشتیبانی می‌شود؟

🔁 **اگر frontend را تغییر دادی** (component، form، state، route):
  → backend: آیا endpoint جدید/تغییریافته لازم است؟ آیا data shape ای
    که ارسال می‌شود با schema سرور سازگار است؟
  → backend validation: آیا برای ورودی‌های جدید UI کافی است؟
  → permissions/RBAC: آیا feature جدید نیاز به role check جدید دارد؟
  → analytics/tracking: آیا event های جدید باید در backend log شوند؟
  → SEO/SSR: آیا تغییر route نیاز به sitemap/meta tags جدید دارد؟

🔁 **اگر database/migration را تغییر دادی**:
  → backend models (ORM، Pydantic، dataclasses) همگی به‌روزند؟
  → query های raw SQL یا ORM queries با schema جدید سازگارند؟
  → seed data، fixtures، factory functions تست‌ها به‌روزند؟
  → frontend: آیا data shape جدید در UI به‌درستی render می‌شود؟
  → rollback migration نوشته شده و امن است؟

🔁 **اگر API contract یا event schema را تغییر دادی** (REST، GraphQL،
   WebSocket، gRPC، Kafka، …):
  → OpenAPI/GraphQL schema/proto file آپدیت شد؟
  → همه‌ی consumer ها (client، subscriber، webhook، external API
    user) با version جدید سازگارند؟
  → backward compatibility حفظ شده یا migration path روشن است؟
  → versioning header/path اگر breaking change است؟

🔁 **اگر infrastructure یا config را تغییر دادی** (Dockerfile، CI، Render
   config، env، secrets):
  → README setup/installation section به‌روزه؟
  → `.env.example` با env vars جدید آپدیت شد؟
  → deploy script یا CI workflow هم تغییر کرد؟
  → docs/architecture یا diagram های infrastructure به‌روزند؟

⚠️ **هرگز فقط یک tier را تغییر نده و فرض کنی بقیه خودکار همگام می‌شوند.**
   حتی برای تغییرات به‌ظاهر «کوچک»، چک کن.

**۴. وابستگی‌های جانبی (artifacts که همیشه چک شوند):**

تغییرات کد همیشه روی این artifact ها اثر دارند. **همه را** بررسی و
به‌روز کن — مستندات اولویت **بالا** دارد چون فراموش‌شدنی‌ترین است.

  📝 **مستندات** (همیشه چک کن — حتی برای تغییر کوچک کد):
    - README.md (شرح، setup، نمونه‌های استفاده، badge ها)
    - CHANGELOG.md / RELEASE_NOTES.md
    - docs/ folder (architecture، API reference، user guides، runbooks)
    - inline docstrings/کامنت‌های توابع و کلاس‌های تغییریافته
    - OpenAPI/Swagger annotations، JSDoc/TSDoc
    - architecture diagrams (اگر component اضافه/حذف شد)
    - migration guides (اگر breaking change است)

  🌍 **مستندات کاربر**:
    - i18n files و translation keys
    - UI labels، tooltip ها، help text، error messages
    - in-app onboarding (اگر flow جدید است)

  🧪 **تست‌ها**:
    - unit tests (همه‌ی فایل‌های مرتبط — حتی اگر «بی‌ربط» به‌نظر می‌رسد)
    - integration tests
    - e2e tests (Playwright/Cypress/Selenium)
    - snapshot tests (اگر UI تغییر کرد)
    - contract tests (Pact یا مشابه)
    - performance benchmarks (اگر behavior performance-sensitive تغییر کرد)

  🧬 **type definitions و contracts**:
    - .d.ts files
    - Pydantic models، dataclasses
    - Protobuf/Avro/Thrift schemas
    - GraphQL schema definitions
    - JSON Schemas

  🏗 **infrastructure و config**:
    - Dockerfile، docker-compose.yml
    - Kubernetes manifests
    - Render/Vercel/Netlify config
    - GitHub Actions / GitLab CI workflows
    - environment templates (.env.example، .env.sample)
    - feature flags (LaunchDarkly، GrowthBook، config)

  📊 **monitoring و observability**:
    - logging keys (اگر اضافه/حذف شد، log parser ها هم به‌روز شوند)
    - metric names (Prometheus، Datadog)
    - tracing spans
    - alert rules و dashboards
    - error tracking (Sentry rules، groupings)

  🔐 **security**:
    - auth rules (rate limit، CORS، CSP، HSTS)
    - permissions/RBAC config
    - secrets rotation policies
    - audit log events (اگر action جدید اضافه شد)

  💾 **caches و serialization**:
    - cache keys و TTL (اگر data shape یا lifecycle تغییر کرد)
    - serializer formats (Redis، session storage)
    - browser storage (localStorage، IndexedDB schemas)

**قانون مطلق همگام‌سازی:**
- هر چیزی که در (۱)، (۲)، (۳)، یا (۴) شناسایی شد، در **همان workflow
  این تسک** همگام و به‌روز شود. هرگز برای بعد رها نکن.
- اگر یک فایل/تست/docs نسبت به تغییر شما عقب بماند، در بهترین حالت bug،
  در بدترین حالت مشکل امنیتی یا data corruption تولید می‌کند.
- تغییرات همگام‌سازی می‌توانند در commit جداگانه باشند (در همان task)،
  ولی نباید skip شوند یا به «refactor آینده» سپرده شوند.

**هرگز این جمله‌ها قابل قبول نیست:**
- ❌ «بعداً پیداش می‌کنم»
- ❌ «احتمالاً جای دیگه‌ای استفاده نمی‌شه»
- ❌ «این یه refactor جداگانه‌ست — out of scope»
- ❌ «فقط فایل‌های اصلی رو بررسی کردم»
- ❌ «حدس می‌زنم چیزی بهش وابسته نیست»
- ❌ «دامنه‌ی وابستگی‌ها رو خلاصه کردم» — هرگز خلاصه نکن
- ❌ «این task فقط backend است؛ frontend مشکل خودش» — هرگز
- ❌ «این task فقط frontend است؛ backend از قبل کار می‌کند» — هرگز ثابت نکرده
- ❌ «مستندات بعداً به‌روز می‌شن» — همیشه same-task همگام شوند
- ❌ «testها رو نگاه نکردم چون فقط یه تغییر کوچیک بود»

**در commit message یا PR description**، دامنهٔ وابستگی‌های شناسایی‌شده و
همگام‌شده را به‌طور explicit و **per-tier** بنویس. مثال:
```
Dependencies synced:
- upstream: User model schema, auth middleware
- downstream: 3 API endpoints, 5 frontend components, 12 tests
- cross-tier (backend → frontend): UserProfile.tsx, useUser.ts hook,
  api-types.ts (TS definitions)
- cross-tier (backend → infra): .env.example added NEW_AUTH_SCOPES
- side artifacts: OpenAPI spec, README API section, i18n keys for
  new errors, Sentry alert rule for new error code
```
اگر هیچ وابستگی پیدا نکردی در هر کدام از چهار جهت، صریحاً بنویس:
«بررسی شد — هیچ وابستگی upstream / downstream / cross-tier (backend↔
frontend↔db↔infra) / side شناسایی نشد» تا مشخص باشد بررسی **انجام شده**
نه اینکه فراموش شده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

---


---

## 📥 درخواست خام کاربر (verbatim — همان متنی که کاربر نوشت)
_(همهٔ URL ها، آدرس‌ها، نام‌ها، و کلمات کلیدی در این متن دست‌نخورده هستند.)_

```
## 📋 شرح
attribute `self.db` در `app/services/ai/image_service.py` نوشته می‌شود ولی هیچ reader در کدبیس آن را مصرف نمی‌کند.

## 🤔 چرا مهم است
write بدون read یعنی یا (الف) reader حذف شده (regression)، یا (ب) از قبل برای feature آینده گذاشته شده و فراموش شده.

## 🔍 جزئیات
- علت: self.db write می‌شود ولی هرگز read نشده
```

## 📋 چک‌لیست مراحل (3 مرحله)

این تسک به مراحل کوچک‌تر تقسیم شده. **در هر verify خودکار، وضعیت هر مرحله به‌صورت `[ ]` (انجام نشده)، `[~]` (ناقص)، یا `[x]` (انجام شده) به‌روز می‌شود.**
وقتی تمام مراحل `[x]` شدند، تسک به‌طور خودکار به «انجام شده» منتقل می‌شود.

- [ ] **مرحله 1: تحلیل و حذف یا توجیه attribute self.db در image_service.py** — این مرحله شامل تحلیل کامل فایل app/services/ai/image_service.py برای یافتن تمام نقاطی است که self.db نوشته (assign) می‌شود و سپس جستجوی کامل در کل کدبیس برای یافتن هرگونه خواندن (read) از self.db است. اگر هیچ reader یافت نشد، باید تصمیم گرفته شود که آیا self.db باید حذف شود (اگر dead code است) یا یک
- [ ] **مرحله 2: حذف self.db از image_service.py در صورت dead code بودن** — این مرحله شامل حذف تمام خطوطی است که self.db را در app/services/ai/image_service.py مقداردهی می‌کنند (write) اگر در مرحله قبل مشخص شد که هیچ readerی وجود ندارد و self.db dead code است. باید اطمینان حاصل شود که حذف self.db باعث شکستن هیچ functional requirement دیگری نمی‌شود. خارج از این مرحله: اضافه 
- [ ] **مرحله 3: اضافه کردن reader برای self.db در صورت regression بودن** — این مرحله فقط در صورتی اجرا می‌شود که در مرحله 1 مشخص شود self.db باید خوانده شود ولی reader به اشتباه حذف شده است. شامل شناسایی جایی که self.db باید مصرف شود (مثلاً در یک متد خاص) و اضافه کردن کد خواندن از self.db. خارج از این مرحله: حذف self.db، تغییر logic اصلی سرویس، یا اضافه کردن feature جدید.

---

# 🔹 مرحله 1: تحلیل و حذف یا توجیه attribute self.db در image_service.py

**Scope:** این مرحله شامل تحلیل کامل فایل app/services/ai/image_service.py برای یافتن تمام نقاطی است که self.db نوشته (assign) می‌شود و سپس جستجوی کامل در کل کدبیس برای یافتن هرگونه خواندن (read) از self.db است. اگر هیچ reader یافت نشد، باید تصمیم گرفته شود که آیا self.db باید حذف شود (اگر dead code است) یا یک reader باید اضافه شود (اگر regression است). این مرحله شامل تغییر کد نمی‌شود، فقط تحلیل و مستندسازی است. خارج از این مرحله: تغییرات واقعی کد، اضافه کردن reader جدید، یا حذف self.db.
**Key terms:** app/services/ai/image_service.py, self.db, image_service

**بخش مربوط از متن کاربر:**
```
attribute `self.db` در `app/services/ai/image_service.py` نوشته می‌شود ولی هیچ reader در کدبیس آن را مصرف نمی‌کند. علت: self.db write می‌شود ولی هرگز read نشده
```

## 🎯 هدف (خلاصه ساختاریافته)
تحلیل و مستندسازی dead code: self.db در image_service.py

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/ai/image_service.py:20-28` — `class AIImageService` — این کامنت تأیید می‌کند که self.db قبلاً وجود داشته و به دلیل عدم استفاده حذف شده است. نیازی به تغییر کد نیست، فقط مستندسازی.
  ```python
  class AIImageService:
      """Placeholder image-analysis service.
  
      Kept as a class for parity with AIService — when a real vision
      provider is wired in, the constructor can take whatever dependency
      (httpx client, db session, etc.) it needs at that time. The unused
      ``db`` parameter was removed because no caller ever supplied it
      and no method ever read it.
      """
  ```
- `app/services/ai/image_service.py:30-55` — `async def analyze_image`
  ```python
  async def analyze_image(
      self,
      image_url: str,
      *,
      prompt: Optional[str] = None,
      max_tokens: int = 256,
  ) -> dict:
      """Return a description of the image at ``image_url``.
  
      Until a real vision provider is wired in, this returns a
      deterministic placeholder so the route layer / tests have a
      stable shape to assert against:
  
          {"description":
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست 
[auto-re-registered from github_import at 2026-05-20T04:25:49.854717+00:00]

## 🔍 Context و وضعیت فعلی
تحلیل و حذف یا توجیه attribute self.db در app/services/ai/image_service.py. این مرحله شامل تحلیل کامل فایل app/services/ai/image_service.py برای یافتن تمام نقاطی است که self.db نوشته (assign) می‌شود و سپس جستجوی کامل در کل کدبیس برای یافتن هرگونه خواندن (read) از self.db است. اگر هیچ reader یافت نشد، باید تصمیم گرفته شود که آیا self.db باید حذف شود (اگر dead code است) یا یک reader باید اضافه شود (اگر regression است). این مرحله شامل تغییر کد نمی‌شود، فقط تحلیل و مستندسازی است. خارج از این مرحله: تغییرات واقعی کد، اضافه کردن reader جدید، یا حذف self.db.

بر اساس بررسی کد واقعی در app/services/ai/image_service.py (خطوط 20-55)، کلاس AIImageService در حال حاضر فاقد متد __init__ است و هیچ attribute ای به نام self.db در بدنه کلاس یا متدهای آن (analyze_image) تعریف یا استفاده نشده است. با این حال، در کامنت خطوط 23-27 اشاره شده که 'when a real vision provider is wired in, the constructor can take whatever dependency (httpx client, db session, etc.) it needs at that time. The unused db parameter was removed because no caller ever supplied it and no method ever read it.' این نشان می‌دهد که self.db قبلاً وجود داشته و حذف شده است. جستجوی کامل در کل کدبیس (شامل فایل‌های deep-read شده مانند app/services/ai/__init__.py, app/services/ai/model_service.py, app/services/ai/nlp_service.py, app/services/ai/provider_service.py, app/routes/ai.py, app/services/ai_service.py و سایر فایل‌ها) هیچ ارجاعی به self.db یا AIImageService.db پیدا نکرد. بنابراین self.db در image_service.py یک dead code است که قبلاً پاکسازی شده و نیازی به اقدام ندارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. تأیید کنید که فایل app/services/ai/image_service.py در خطوط 20-55 حاوی هیچ self.db ای نیست.
2. کامنت موجود در خطوط 23-27 را به‌روزرسانی کنید تا به وضوح بگوید که self.db حذف شده و در صورت نیاز به DB در آینده، باید از طریق constructor تزریق شود.
3. یک جستجوی grep در کل پروژه برای الگوی 'self\.db' در فایل‌های .py انجام دهید تا مطمئن شوید هیچ instance دیگری از این dead code باقی نمانده است.
4. نتیجه تحلیل را در یک فایل مستندسازی (مانند docs/DEAD_CODE_ANALYSIS.md) ثبت کنید.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: low
- تخمین زمان: small

---

# 🔹 مرحله 2: حذف self.db از image_service.py در صورت dead code بودن

**Scope:** این مرحله شامل حذف تمام خطوطی است که self.db را در app/services/ai/image_service.py مقداردهی می‌کنند (write) اگر در مرحله قبل مشخص شد که هیچ readerی وجود ندارد و self.db dead code است. باید اطمینان حاصل شود که حذف self.db باعث شکستن هیچ functional requirement دیگری نمی‌شود. خارج از این مرحله: اضافه کردن reader جدید، تغییر logic سرویس، یا حذف importهای مرتبط با self.db.
**Key terms:** app/services/ai/image_service.py, self.db, image_service

**بخش مربوط از متن کاربر:**
```
attribute `self.db` در `app/services/ai/image_service.py` نوشته می‌شود ولی هیچ reader در کدبیس آن را مصرف نمی‌کند. علت: self.db write می‌شود ولی هرگز read نشده
```

## 🎯 هدف (خلاصه ساختاریافته)
حذف self.db dead code از AIImageService در image_service.py

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/ai/image_service.py:20-28` — `AIImageService` — کلاس AIImageService — docstring قبلاً اشاره دارد که پارامتر db حذف شده. اگر هنوز self.db در __init__ وجود دارد، باید حذف شود.
  ```python
  class AIImageService:
      """Placeholder image-analysis service.
  
      Kept as a class for parity with AIService — when a real vision
      provider is wired in, the constructor can take whatever dependency
      (httpx client, db session, etc.) it needs at that time. The unused
      ``db`` parameter was removed because no caller ever supplied it
      and no method ever read it.
      """
  ```
- `app/services/ai/image_service.py:30-55` — `AIImageService.analyze_image`
  ```python
  async def analyze_image(
      self,
      image_url: str,
      *,
      prompt: Optional[str] = None,
      max_tokens: int = 256,
  ) -> dict:
      """Return a description of the image at ``image_url``."""
      logger.info(
          "image-analysis placeholder hit
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست 
[auto-re-registered from github_import at 2026-05-20T04:25:49.854717+00:00]

## 🔍 Context و وضعیت فعلی
کاربر درخواست حذف `self.db` از `app/services/ai/image_service.py` را دارد، زیرا این attribute در کلاس `AIImageService` نوشته می‌شود (write) اما هیچ readerای در کل کدبیس آن را مصرف نمی‌کند. بر اساس تحلیل کد واقعی در `app/services/ai/image_service.py` (خطوط 20-55)، کلاس `AIImageService` دارای متد `__init__` پیش‌فرض (از object) است و `self.db` در هیچ‌کجای کلاس مقداردهی یا استفاده نشده است. همچنین متد `analyze_image` (خطوط 30-55) و تابع ماژول-سطح `analyze_image` (خطوط 58-70) هیچ ارجاعی به `self.db` ندارند. بررسی importها در `app/services/ai/__init__.py` و `app/routes/ai.py` نشان می‌دهد که این سرویس از طریق `from app.services.ai.image_service import analyze_image` فراخوانی می‌شود و هیچ‌کدام از callerها به `self.db` وابسته نیستند. بنابراین `self.db` در این کلاس dead code محسوب می‌شود و حذف آن بی‌خطر است. توجه: کاربر تأکید کرده که خارج از این مرحله، اضافه کردن reader جدید، تغییر logic سرویس، یا حذف importهای مرتبط با `self.db` مجاز نیست.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. در فایل `app/services/ai/image_service.py`، کلاس `AIImageService` را بررسی کن. در حال حاضر کلاس `__init__` صریحی ندارد و `self.db` در بدنه کلاس تعریف نشده است. اگر `self.db` در `__init__` یا جای دیگری از کلاس مقداردهی شده (مثلاً در commitهای قبلی یا در شاخه‌های دیگر)، آن خطوط را حذف کن. 2. اگر کلاس `AIImageService` دارای `__init__` با پارامتر `db` است، آن پارامتر و خط `self.db = db` را حذف کن. 3. اطمینان حاصل کن که متد `analyze_image` (خطوط 30-55) و تابع ماژول-سطح `analyze_image` (خطوط 58-70) هیچ ارجاعی به `self.db` ندارند. 4. importهای مرتبط با `self.db` (مثلاً `from app.database import SessionLocal` اگر فقط برای `self.db` استفاده می‌شده) را حذف نکن مگر اینکه dead import باشند. 5. تست‌های موجود در `tests/services/test_image_service.py` (اگر وجود دارد) را اجرا کن تا مطمئن شوی تغییری در رفتار سرویس ایجاد نشده است.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: low
- تخمین زمان: small

---

# 🔹 مرحله 3: اضافه کردن reader برای self.db در صورت regression بودن

**Scope:** این مرحله فقط در صورتی اجرا می‌شود که در مرحله 1 مشخص شود self.db باید خوانده شود ولی reader به اشتباه حذف شده است. شامل شناسایی جایی که self.db باید مصرف شود (مثلاً در یک متد خاص) و اضافه کردن کد خواندن از self.db. خارج از این مرحله: حذف self.db، تغییر logic اصلی سرویس، یا اضافه کردن feature جدید.
**Key terms:** app/services/ai/image_service.py, self.db, image_service

**بخش مربوط از متن کاربر:**
```
attribute `self.db` در `app/services/ai/image_service.py` نوشته می‌شود ولی هیچ reader در کدبیس آن را مصرف نمی‌کند. علت: self.db write می‌شود ولی هرگز read نشده
```

## 🎯 هدف (خلاصه ساختاریافته)
اضافه کردن reader برای self.db در image_service در صورت regression

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `app/services/ai/image_service.py:20-55` — `AIImageService`
  ```python
  class AIImageService:
      """Placeholder image-analysis service.
  
      Kept as a class for parity with AIService — when a real vision
      provider is wired in, the constructor can take whatever dependency
      (httpx client, db session, etc.) it needs at that time. The unused
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست 
[auto-re-registered from github_import at 2026-05-20T04:25:49.854717+00:00]

## 🔍 Context و وضعیت فعلی
کاربر درخواست 'اضافه کردن reader برای self.db در صورت regression بودن' را داده است. این یک تسک cleanup با اولویت low است. متن کامل درخواست: 'این مرحله فقط در صورتی اجرا می‌شود که در مرحله 1 مشخص شود self.db باید خوانده شود ولی reader به اشتباه حذف شده است. شامل شناسایی جایی که self.db باید مصرف شود (مثلاً در یک متد خاص) و اضافه کردن کد خواندن از self.db. خارج از این مرحله: حذف self.db، تغییر logic اصلی سرویس، یا اضافه کردن feature جدید.' بخش مربوط از درخواست اصلی کاربر: 'attribute self.db در app/services/ai/image_service.py نوشته می‌شود ولی هیچ reader در کدبیس آن را مصرف نمی‌کند. علت: self.db write می‌شود ولی هرگز read نشده'. کلیدواژه‌ها: app/services/ai/image_service.py, self.db, image_service. در کد فعلی فایل app/services/ai/image_service.py (خطوط 20-55)، کلاس AIImageService فاقد attribute self.db است. در واقع، کلاس AIImageService در خط 20 تعریف شده و هیچ constructor (__init__) ندارد. تنها متد آن analyze_image است که image_url, prompt, max_tokens را می‌گیرد و یک dict placeholder برمی‌گرداند. هیچ اثری از self.db در این فایل دیده نمی‌شود. این نشان می‌دهد که یا self.db در نسخه‌های قبلی وجود داشته و حذف شده، یا کاربر به اشتباه فکر می‌کند وجود دارد. بر اساس deep context، فایل app/services/ai/image_service.py در خطوط 20-55 هیچ self.db ندارد. بنابراین، این تسک برای بررسی regression است: اگر در مرحله 1 مشخص شود که self.db باید در یک متد خاص (مثلاً analyze_image) خوانده شود ولی به اشتباه حذف شده، باید reader اضافه شود. در غیر این صورت، نیازی به تغییر نیست. فایل‌های مرتبط: app/services/ai/__init__.py (که image_service را export می‌کند)، app/routes/ai.py (که analyze_image را call می‌کند)، و app/services/ai_service.py (که سرویس‌های AI را orchestrate می‌کند).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. بررسی فایل app/services/ai/image_service.py برای وجود attribute self.db. در کد فعلی (خطوط 20-55)، کلاس AIImageService هیچ __init__ ندارد و self.db وجود ندارد. 2. اگر در مرحله 1 مشخص شود که self.db باید در متد analyze_image (خط 30) خوانده شود (مثلاً برای ذخیره/بازیابی نتایج تحلیل تصویر از دیتابیس)، باید: a) یک __init__ به کلاس AIImageService اضافه کرد که self.db = db را تنظیم کند. b) در متد analyze_image، از self.db برای خواندن داده استفاده کرد (مثلاً session = self.db() یا self.db.execute(...)). 3. اگر self.db نباید وجود داشته باشد (یعنی regression نیست)، هیچ تغییری نده و فقط در مستندات ذکر کن که self.db در image_service وجود ندارد. 4. فایل‌های مرتبط: app/services/ai/__init__.py (برای export سرویس جدید)، app/routes/ai.py (برای استفاده از analyze_image با db)، و app/services/ai_service.py (برای هماهنگی با سایر سرویس‌های AI). 5. تست‌های مربوطه: tests/test_image_service.py (اگر وجود دارد) یا tests/test_integration_services.py را برای پوشش analyze_image با db به‌روز کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: low
- تخمین زمان: small

---

## ✅ معیارهای پذیرش کلی (همهٔ مراحل)
- [ ] همهٔ مراحل بالا با موفقیت پیاده‌سازی شده‌اند
- [ ] تست‌های موجود pass می‌شوند
- [ ] هیچ regression رخ نداده

## Acceptance Criteria

1. یا reader اضافه شد، یا write حذف شد _(verify: manual_only)_
2. اگر در DB persist می‌شد، migration drop column نوشته شد _(verify: manual_only)_

## Task Steps

### Step 1: تحلیل و حذف یا توجیه attribute self.db در image_service.py
**Status:** `pending` (0%)
**Scope:** این مرحله شامل تحلیل کامل فایل app/services/ai/image_service.py برای یافتن تمام نقاطی است که self.db نوشته (assign) می‌شود و سپس جستجوی کامل در کل کدبیس برای یافتن هرگونه خواندن (read) از self.db است. اگر هیچ reader یافت نشد، باید تصمیم گرفته شود که آیا self.db باید حذف شود (اگر dead code است) یا یک reader باید اضافه شود (اگر regression است). این مرحله شامل تغییر کد نمی‌شود، فقط تحلیل و مستندسازی است. خارج از این مرحله: تغییرات واقعی کد، اضافه کردن reader جدید، یا حذف self.db.
**Excerpt:**
```
attribute `self.db` در `app/services/ai/image_service.py` نوشته می‌شود ولی هیچ reader در کدبیس آن را مصرف نمی‌کند. علت: self.db write می‌شود ولی هرگز read نشده
```

### Step 2: حذف self.db از image_service.py در صورت dead code بودن
**Status:** `pending` (0%)
**Scope:** این مرحله شامل حذف تمام خطوطی است که self.db را در app/services/ai/image_service.py مقداردهی می‌کنند (write) اگر در مرحله قبل مشخص شد که هیچ readerی وجود ندارد و self.db dead code است. باید اطمینان حاصل شود که حذف self.db باعث شکستن هیچ functional requirement دیگری نمی‌شود. خارج از این مرحله: اضافه کردن reader جدید، تغییر logic سرویس، یا حذف importهای مرتبط با self.db.
**Excerpt:**
```
attribute `self.db` در `app/services/ai/image_service.py` نوشته می‌شود ولی هیچ reader در کدبیس آن را مصرف نمی‌کند. علت: self.db write می‌شود ولی هرگز read نشده
```

### Step 3: اضافه کردن reader برای self.db در صورت regression بودن
**Status:** `pending` (0%)
**Scope:** این مرحله فقط در صورتی اجرا می‌شود که در مرحله 1 مشخص شود self.db باید خوانده شود ولی reader به اشتباه حذف شده است. شامل شناسایی جایی که self.db باید مصرف شود (مثلاً در یک متد خاص) و اضافه کردن کد خواندن از self.db. خارج از این مرحله: حذف self.db، تغییر logic اصلی سرویس، یا اضافه کردن feature جدید.
**Excerpt:**
```
attribute `self.db` در `app/services/ai/image_service.py` نوشته می‌شود ولی هیچ reader در کدبیس آن را مصرف نمی‌کند. علت: self.db write می‌شود ولی هرگز read نشده
```
