# Removal Candidates (Quarantine Ledger)

Per CLAUDE.md rule 2, capabilities are **never deleted** — they are quarantined (unmounted /
flagged / parked) and recorded here. Deletion requires the owner's explicit approval.

Format: `## <capability> — quarantined YYYY-MM-DD` then why it looks dead, why it's kept, and
how to revive it.

---

## app/routes/auth_google.py — pre-existing (kept)

- **Looks dead:** the router is conditionally mounted (only when `GOOGLE_CLIENT_ID` is set);
  static "file without import reference" audits flag it.
- **Kept because:** it is the forthcoming Google sign-in flow; `app/main.py` documents the
  explicit mount and the gating. This is the canonical "quarantine not delete" example.
- **Revive:** set `GOOGLE_CLIENT_ID` (and the related OAuth env vars) — `main.py` mounts it
  automatically.

## Legacy AI provider/model/context config (Settings) — quarantined 2026-06-28

- **Looks redundant:** the new AI catalog (`/ai-settings`, `ai_catalog_*` tables) supersedes the
  old per-user provider/model management that used to be the whole `/settings` page.
- **Kept because:** the legacy per-user `AIProvider` / `AIModelConfig` rows still feed the
  existing analysis pipeline (`app/services/ai/provider_service.resolve_provider_routing`), and
  the "جعبه پرامپت تحلیل" (global analysis prompt) is a real feature not covered by the catalog.
- **Where it lives now (Update 2026-06-28):** the «پیشرفته (قدیمی)» tab was **retired** (owner
  approval). The legacy provider/model/context **UI** was removed (the context knobs
  `context_type`/`dynamic_response`/`token_limit` had **no live consumers** — verified by grep).
  The one piece that IS used — the global **analysis prompt** (`/api/ai/global-prompt`, read by
  `model_service` + `task_feedback`) — was **relocated into the «هوش مصنوعی» tab** (AISettings).
  The legacy **endpoints** `/api/ai/providers` and `/api/ai/configs` (+ the `AIProvider` /
  `AIModelConfig` models + rows) are **unchanged** — only their UI was dropped; capability and
  data are preserved.
- **Revive/retire:** to fully retire the legacy `AIProvider`/`AIModelConfig` system, first migrate
  the analysis pipeline (`provider_service.resolve_provider_routing`) to resolve through the new
  catalog (`ai_manager`); then the endpoints can be removed with owner approval.

<!-- Add new quarantined capabilities below this line. -->

## 2026-07-20 — رفتارهای قرنطینه‌شدهٔ seed خودسازی (کد حفظ شد، شرط مخرب غیرفعال)

- **شرط count-mismatch در HARD RESET لیست «مرد الهی»** (`app/main.py` بلوک divine_man):
  قبلاً `len(rows) != len(seed)` به‌تنهایی کل لیست را حذف/بازسازی می‌کرد — یعنی افزودن یا
  حذف یک آیتم توسط مالک، در بوت بعدی همهٔ داده‌اش را می‌پراند. از این تاریخ reset فقط با
  حکم `divine_man_hard_reset_verdict` (تعداد برابر seed + محتوای صددرصد seed + صفر تیک)
  اجرا می‌شود. حالت‌های قبلی حذف نشده‌اند — فقط پشت گارد بدون‌خسارت رفته‌اند و در log با
  reason ثبت می‌شوند. بازگردانی: حذف گارد (یک if) — ولی فقط با تأیید صریح مالک.
- **حذف پیشوندی نامشروط «مراقبه:/نکته:» در لیست محاسبه**
  (`app/services/self_improvement_service.py`): قبلاً در هر بوت/GET هر ردیفی با این
  پیشوندها حذف سخت می‌شد (یادداشت‌های آیندهٔ مالک هم). حالا فقط وقتی ردیف‌های exact-match
  قدیمی (وضعیت پیش-مهاجرت) حاضر باشند اجرا می‌شود. بازگردانی: برداشتن شرط `if exact_stale`.

## 2026-07-20 — Celery/beat به‌عنوان مسیر زمان‌بندی (قرنطینه — جایگزین: jobs_engine)

- `app/celery_app.py` + `app/tasks.py` + مصرف صف `process_ai_ingestion_event`: در تولید
  هرگز اجرا نمی‌شدند (broker هاردکد localhost؛ render.yaml بدون worker/beat/redis —
  یافتهٔ #1 ممیزی). از این تاریخ مسیر canonical زمان‌بندی
  `app/services/jobs_engine.py` (حلقهٔ in-process با stamp در GlobalSetting) است و
  ingestion رویدادی از `event_publisher` به‌صورت in-process اجرا می‌شود. کد celery حذف
  نشده — دست‌نخورده مانده تا اگر روزی worker واقعی مستقر شد قابل احیا باشد.
  بازگردانی: استقرار redis+worker+beat و برداشتن حلقهٔ jobs_engine از main.py.

## 2026-07-21 — قرنطینهٔ ناوبری (ممیزیِ «کمتر ولی زنده»؛ کد و مسیر حفظ شد)

- **نوارِ ناوبریِ افقیِ Header** (`frontend/src/components/Header.jsx`): ردیفِ لینک‌های
  دسکتاپِ Header با برچسب‌های انگلیسیِ `Dashboard/Tasks/Projects` (نقضِ قانونِ all-Persian/RTL)
  که سایدبارِ فارسی را در دسکتاپ تکرار می‌کرد، حذف شد. Header اکنون فقط لوگو + جستجو + زنگِ
  اعلان + هویت/خروج است. مجموعهٔ کاملِ لینک‌ها هنوز در منوی موبایل (که همان `Sidebar LINKS` را
  می‌خواند) هست، پس هیچ مسیری روی موبایل غیرقابل‌دسترس نشد. بازگردانی: افزودن دوبارهٔ آرایهٔ
  `navLinks` و بلوکِ `<nav className="hidden md:flex">`.
- **«مدیریت کاربران» `/admin/users`** از ناو (Header + منوی موبایل) خارج شد: اپ تک‌کاربره است و
  مدیریتِ کاربر معنا ندارد. مسیرِ `/admin/users` و صفحهٔ `AdminUsers` و بک‌اندِ `users.py`
  دست‌نخورده‌اند و همچنان resolve می‌شوند. بازگردانی: افزودن دوبارهٔ آیتمِ admin به منوی موبایل.
- **تبِ «پروژه‌های خارجی»** در `ProjectsHub` (اتصال به Jira/Linear/Asana): برای مالکِ تک‌کاربره
  که از این ابزارها استفاده نمی‌کند یک سطحِ مرده بود؛ از نوارِ تب حذف شد. صفحهٔ `ExternalProjects`
  + بک‌اندِ `/api/external` + مسیرِ `/external-projects` دست‌نخورده‌اند (مسیر همچنان به `ProjectsHub`
  می‌رسد و روی تبِ پیش‌فرض می‌نشیند). بازگردانی: افزودن دوبارهٔ آیتمِ `external` به `TABS` و
  رندرِ `<ExternalProjects embedded />`.

## 2026-07-25 — جمع‌وجورکردن طبق نقشهٔ بررسیِ صفحه‌به‌صفحه (کد و مسیر حفظ شد)

همه از نوعِ «یک حقیقت، دو رندر» یا «سطحِ همیشه‌خالی»‌اند. هیچ endpoint، صفحه، مسیر یا
کامپوننتی حذف نشد؛ فقط درِ ورودیِ تکراری بسته شد.

- **چهار کارتِ مالیِ «پروندهٔ زندگی»** (`LifeFilePage`: RTA/سالیک، اشتراک‌ها، نتلر،
  شیت‌های بانکی): عیناً همان endpointهایی بودند که تبِ «حساب‌های دیگر»ِ `FinanceHub`
  رندر می‌کند. از این صفحه برداشته شدند و جایشان یک لینک به `/budget?tab=others`
  نشست؛ `OtherAccountsPanel` و همهٔ endpointها دست‌نخورده‌اند. در عوض این صفحه
  **فرمِ ثبتِ دستیِ مدارک** گرفت (مدارک عمداً OCR نمی‌شوند، پس بدون فرم همیشه خالی
  می‌ماند). بازگردانی: برگرداندنِ چهار `<LifeCard>` از تاریخچهٔ git.
- **تبِ «پروژه‌های توسعه»** در `ProjectsHub`: همان `DevProjectsOverview`ِ صفحهٔ
  «مرکز توسعه». از نوارِ تب برداشته شد و لینکِ «مرکز توسعه» جایش را گرفت؛ لینکِ قدیمیِ
  `/projects?tab=dev` هنوز همان پنل را باز می‌کند. بازگردانی: افزودن دوبارهٔ آیتمِ
  `dev` به `TABS`.
- **سه تبِ اضافهٔ «دستیار هوشمند»** (`تاریخچه پیشنهادات` که در واقع همان پیشنهادهای
  جاری را نشان می‌داد، `پروفایل شخصیت`، `ترسیم آینده`): از نوارِ تب قرنطینه شدند و در
  `QUARANTINED_TABS` نگه داشته می‌شوند؛ مسیرهای `/recommendations`، `/personality`،
  `/career-planning` و `?tab=…` همچنان پنلِ خودشان را باز می‌کنند (و همان لحظه تبشان
  در نوار دیده می‌شود). بازگردانی: انتقالِ آیتم‌ها از `QUARANTINED_TABS` به `TABS`.
- **تبِ «دارایی‌ها» (رسانه‌ای)** در `FinanceHub`: محتوایش فیلم/کتاب/فایل است نه پول، و
  اسکنرش فقط یک پوشهٔ سروری را می‌خواند که روی محیطِ استقرار وجود ندارد — همیشه خالی.
  از نوار قرنطینه شد؛ `AssetsPage` و مسیرِ `/assets` و `?tab=assets` سرِ جایشان‌اند.
  بازگردانی (یا بهتر: وصل‌کردنِ اسکن به درایو) با انتقال از `QUARANTINED_TABS`.
- **ورودیِ منوی «پاک‌سازی و ادغام»** (`/merge`): همان تبی که داخلِ «داده» هست. ورودیِ
  دومِ منو برداشته شد و برچسبِ «داده» به «داده (ایمپورت و ادغام)» تغییر کرد؛ مسیرِ
  `/merge` دست‌نخورده و حالا ورودیِ «داده» را هم روشن می‌کند. بازگردانی: افزودن دوبارهٔ
  آیتمِ merge به `LINKS`.
- **جای «مرکز توسعه» در منو**: از گروهِ «سیستم و فنی» به «صفحه‌های زندگی» منتقل شد با
  برچسبِ «کار و توسعه» — این ابزارِ دیباگ نیست، **کارِ** مالک است. مسیر و testid همان.
- **`/welcome`**: قبلاً هم از هیچ‌جا لینک نمی‌شد (عملاً قرنطینه). مسیر **مونت می‌ماند**
  چون تنها درِ عمومیِ برنامه است؛ فقط متنِ نادرستش («مدیریت تسک‌ها و یادآوری‌ها») با
  واقعیتِ امروزِ برنامه هماهنگ شد.

## 2026-07-25 — لاغرکردنِ میز فرمان (هیچ عدد و لینکی حذف نشد)

- **سه کارتِ بزرگِ شمارنده** (`StatCard`: کل وظایف / پروژه‌های فعال / وظایف تکمیل‌شده) و
  **چهار کارتِ لینکِ «دسترسی سریع»** با هم نزدیک به نصفِ ارتفاعِ صفحه را می‌گرفتند بدون
  اینکه چیزی به «امروزِ من» اضافه کنند (همان لینک‌ها در سایدبار هستند). در یک **نوارِ
  فشرده** جمع شدند: هر سه عدد + هر پنج لینک (وظایف، پروژه‌ها، نقشهٔ خداشهر، مراقبت و مرور،
  ادغام) با همان testidها. کامپوننتِ `StatCard` چون دیگر مصرف‌کننده نداشت برداشته شد
  (کامپوننتِ نمایشیِ داخلی، نه قابلیت). بازگردانی: از تاریخچهٔ git.
- **چهار کارتِ حوزه‌ای** (تقویم/مالی/افراد/رشد) وقتی **خالی‌اند** در یک خط جمع می‌شوند
  («آرام امروز: تقویم · افراد») و با یک کلیک برمی‌گردند. کارتی که محتوا دارد **هرگز**
  جمع نمی‌شود، و تا وقتی داده نیامده یا fetch شکست خورده هم هیچ‌چیز جمع نمی‌شود (تا
  «آرام»ِ دروغین ساخته نشود).

## 2026-08-02 — دو کارتِ معیوبِ «من که هستم» از سطحِ تازه بیرون گذاشته شد

`/api/facets` (دهانِ دومِ ستون‌فقراتِ `owner_insight`) این دو کارت را **سرو نمی‌کند**.
هیچ کد و هیچ تستی حذف نشد و `/api/identity-profile` هم مثلِ قبل هر دو را برمی‌گرداند —
این قرنطینه است، نه حذف. بازگردانی: `?include=<key>`، یا برداشتنِ کلید از
`QUARANTINED_KEYS` در `app/routes/facets.py`.

- **`self_model_diligence`** («پشتکارت این دوره …»)
  - *چرا:* همان «شاخص پشتکار ۱۰/۱۰۰» است که مالک درباره‌اش گفت «احمقانه»، فقط این بار
    در قالبِ جمله — همان `compute_diligence`، همان نمرهٔ ۰ تا ۱۰۰، همان موضعِ نمره‌دادن
    به ارادهٔ او.
  - *و جمله‌اش دروغ است:* «این دوره» هیچ پنجرهٔ زمانی ندارد.
    `self_model_service.compute_diligence` نسبت‌های **مادام‌العمر** را می‌گیرد (هیچ فیلترِ
    تاریخی روی فرمان‌ها، کارها و قلم‌های فهرست نیست)، پس یک انباشتِ دو سالِ پیش نمره را
    برای همیشه پایین نگه می‌دارد و جمله **هرگز نمی‌تواند بهتر شود**. اتهامی بدونِ درِ خروج.
  - *و آستانه‌اش تقریباً وجود ندارد:* با ۸ ردیف (۳ کار + ۴ قلم) شلیک می‌کند و
    «از هر ۱۰ تا حدود ۰ تا را نگه داشته‌ای» می‌گوید — در حالی که معادلش در `habits`
    حداقل ۱۵ قلم می‌خواهد. **اجرا شد و تأیید شد.**
- **`self_model_interests`** («بیشترِ چیزی که می‌نویسی حولِ … می‌چرخد»)
  - *چرا:* دسته‌بندِ `profile_analysis.categorize` با **زیررشته** تطبیق می‌دهد. اجرا شد:
    «برنامه» و «برنامه‌ریزی» و «کدام» و «داده» همه → `technology`؛ «خدا»، «نماز»،
    «خانواده»، «سلامتی» → `general` که در `self_model_service` دور ریخته می‌شود.
    یعنی این کارت **ساختاراً** نمی‌تواند دربارهٔ ایمان، خانواده، سلامت یا کارِ مالک
    چیزی بگوید و عملاً همیشه «فناوری» می‌گوید.

همچنین دو **گروه** به‌طور پیش‌فرض ساکت‌اند (خراب نیستند، جای دیگری دارند) و با
`?groups=unlinked` یا `?groups=facts` کاملاً برمی‌گردند:

- **`unlinked`** — گزارشِ ستون‌های بی‌مصرفِ خودِ برنامه (`users.bio`، `users.interests`…).
  خطاب به «تو» ولی پر از نامِ جدول و ستون. یک‌بار خواندنی است، هر روز دیدنش نه.
  صاحبش `/system-map` است و همان‌جا می‌ماند.
- **`facts`** — رونوشتِ مدارکِ هویتی (نام روی گواهینامه، تاریخ تولد، ملیت). مالک
  این‌ها را می‌داند. ضمناً این استقرار `REQUIRE_AUTH=False` دارد، پس بیرون‌گذاشتن از
  یک روتِ تازه یک تصمیمِ حریمِ خصوصی هم هست.
