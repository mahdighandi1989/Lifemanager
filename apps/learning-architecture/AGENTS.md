# AGENTS.md — «معماری یادگیری عمیق و کارخانهٔ معرفت‌شناسی» (`/apps/learning-architecture`)

> برای **هر** نشست/ایجنت/ناظرِ خودکاری که به این صفحه دست می‌زند. قواعدِ کلیِ ریپو (`/CLAUDE.md`) هم برقرارند؛ این‌جا فقط
> چیزهای مخصوصِ این صفحه است. توضیحِ کامل و فلسفه: [`docs/HANDBOOK.md`](docs/HANDBOOK.md) (همان «📘 دفترچهٔ راهنما» ِ داخلِ صفحه).

## پیش از هر کار، بخوان
1. [`docs/HANDBOOK.md`](docs/HANDBOOK.md) — دست‌کم §۰ واژه‌نامه، §۱ سه اصلِ ثابت، §۶ سه آزمون، §۱۰ تصمیم‌ها (و گزینه‌های ردشده)، §۱۲ کارهای باز، §۱۳ روال.
2. انتهای [`docs/WORKLOG.md`](docs/WORKLOG.md) — آخرین کارها.

## دامنه
- فقط همین صفحه. **چیزی از بقیهٔ Lifemanager** (که هنوز قطعی نیست) وارد این پوشه یا دفترچه نمی‌شود، مگر مالک صریحاً بخواهد.
  اتصال به بخش‌های دیگر را مالک خودش بعداً تعیین می‌کند.

## نقشهٔ پوشه
| مسیر | چیست | دستی ویرایش؟ |
|---|---|---|
| `src/app/*.js`, `src/app/style.css` | برنامه (JS ِ بی‌چارچوب) و دادهٔ کارخانه (`epi_*.js`) | **بله — تنها جای تغییرِ برنامه** |
| `src/tech/*.js` | محتوای ۴۵ تکنیک و متنِ عینیِ منبع | بله |
| `src/app/Code.gs`, `EpiServer.gs`, `README.md` | نسخهٔ Google Apps Script | بله |
| `build.py` | ساخت + همگام‌سازی + `--check` | بله (با احتیاط) |
| `tools/handbook.py` | تجزیه‌گر و دروازهٔ اسناد، سازندهٔ فهرست و نمودار | بله (با احتیاط؛ `slug` با `frontend/src/lib/llaHandbook.js` یکی بماند) |
| `docs/HANDBOOK.md` | دفترچهٔ راهنما | بله — **جز** بلوک‌های بینِ `TOC:BEGIN/END` و `PROGRESS-CHART:BEGIN/END` (ساخته می‌شوند) |
| `docs/PROGRESS.md` | دفترِ پیشرفت (منبعِ نمودار) | فقط **افزودنِ** سطر |
| `docs/WORKLOG.md` | دفترِ کار | فقط **افزودنِ** بخش به انتها |
| `docs/audits/` | گزارش‌های ممیزی و بازسازیِ تاریخچه (مدرک) | فقط افزودن |
| `docs/specs/` | طرح‌های مرجعِ بخش‌های بزرگ (مثلاً `KNOTS.md` برای «گره‌گشا»؛ §۱۲ ِ آن الزامی است) | بله — تغییرِ طرح ⇒ WORKLOG |
| `backtest/corpus/*.json` | پیکرهٔ بک‌تستِ پیوسته (افزودهٔ هر دور؛ واقعی + انتزاعی، رمزگذاریِ کور) | فقط با `tools/epi_backtest.js add`؛ اصلاحِ یافته یا `excluded` با دلیل |
| `backtest/samples/*.json` | قاب‌های بی‌گزینش برای سنجشِ مقدارهای پایه (k+1)/(n+2) | فقط با `tools/epi_backtest.js sample`؛ قابِ دست‌چین یا موردِ احرازنشده ممنوع؛ ردِ مالک ⇒ `excluded` |
| `src/app/epi_territory.js` | نقشهٔ کاملِ قلمروِ معرفت‌شناسی (گروه‌ها/حوزه‌ها/منابع/بخش‌های جزوه) | فقط با منبعِ معتبر و آزمون (`tests/test_territory.js`)؛ حذفِ حوزه ممنوع |
| `backtest/territory.json`، `backtest/reviews/*.json`، `docs/TERRITORY.md` | پیشرفتِ هر حوزه، بازبینی‌های مستقل، سندِ زندهٔ قلمرو | فقط با `epi_backtest.js territory|review|run`؛ TERRITORY.md را ابزار می‌سازد |
| `backtest/ledger.json`, `findings.json`, `results.json`, `proposals.json` | دفترِ دورها، یافته‌ها و سرانجامشان، حکمِ هر واقعه، پیشنهادهای منتظرِ مالک | `ledger/results` **هرگز** (ساختهٔ `run`)؛ `findings` فقط علت/اصلاح/وضع؛ `proposals` افزودن |
| `tools/epi_backtest.js` | اجراکنندهٔ قطعیِ بک‌تستِ پیوسته (`status`/`add`/`run`) — همان موتورِ صفحه در Node | بله (با احتیاط؛ آزمون: `tests/test_backtest_tool.js`) |
| `src/app/epi_found.js` | مبنای درجه‌ها: اصولِ بدیهی، قضیه‌ها با برهان، اشتقاقِ هر سقف (B/S/O/X)، سنجشِ پایه فقط با نمونهٔ بی‌گزینش و کافی | بله، ولی هر قضیهٔ تازه برهان از اصولِ موجود می‌خواهد؛ آزمون: `tests/test_found.js`. عددِ برازش‌شده روی پیکره ممنوع |
| `docs/VERIFIED_BOOKLET.md` | «جزوهٔ متقن» — هر بخشِ جزوه با وضعِ آزموده‌شدنش | **هرگز** (ساختهٔ `run`) |
| `sources/` | متن‌های خامِ اسنادِ مالک و جزوه (برای `tools/parse_epi.py`) | نه |
| `tests/*.js` | آزمون‌های مرورگرِ سازنده (Playwright روی `dist/learning-architecture.html`) | بله |
| `dist/` | خروجیِ ساخت (gitignored): artifact، html ِ مستقل، Apps Script + zip | نه |
| `frontend/public/assets/lla/**`, `frontend/src/lib/llaBundle.js` | خروجیِ همگام‌سازی | **هرگز** |
| `frontend/src/pages/LearningArchitecturePage.jsx`, `frontend/src/components/learning-architecture/`, `frontend/src/lib/llaHandbook.js` | میزبان و نمایشگرِ دفترچه | بله |
| `app/routes/app_records.py`, `app/models/app_record.py`, `app_mirror.py`, `app_file.py`, `app_reminder.py`, `app/services/app_mirror_service.py`, `app/services/app_reminder_service.py` | دادهٔ برنامه (`app_records`)، مسیرِ AI، آینهٔ درایو، پیوست‌ها، یادآورها (کارهای `app_mirror` و `app_reminders`). AI/درایو/پیوست/یادآور **فقط برای مالک** (`_owner_channels`) | بله، با قواعدِ ریپو |
| `app/routes/inspection_audit.py` | ممیزیِ فقط‌خواندنیِ ناظر + `POST /api/inspection/audit/ai` (اجرای همان کارِ AI ِ این صفحه با پرسش‌های خنثی، برای آزمودنِ مسیرِ واقعی) | بله |

## هر تغییر — به همین ترتیب
1. منبع را تغییر بده (`src/…` یا میزبان).
2. `python apps/learning-architecture/build.py`
3. ثبت:
   - یک بخش به انتهای `docs/WORKLOG.md`: `## YYYY-MM-DD (n) — عنوان` (n = بعدی)، سطرهای نوع‌دار، و **سطرِ آخر امضا**:
     `> **امضا:** \`چه کسی\` · YYYY-MM-DD · چطور راستی‌آزمایی شد` (بدونِ نامِ مدل؛ ناظرِ خودکار: `ناظرِ خودکار (Claude Code routine)`).
   - اگر صفحه جلو/عقب رفت یا خطایی اصلاح شد: یک سطر در `docs/PROGRESS.md` با `WORKLOG (n)` — نقطهٔ بی‌سند ممنوع.
   - بخشِ مربوطِ `docs/HANDBOOK.md`: تصمیم ⇒ §۱۰ (با «ردشده»)، کارِ باز ⇒ §۱۲، عددِ تازهٔ آزمون ⇒ §۶، و «به‌روزرسانی:» به امروز.
4. دوباره `python apps/learning-architecture/build.py` (فهرست و نمودار و نسخه‌های فرانت را بازمی‌سازد).
5. دروازه (قانونِ ۴ ِ ریپو): `python -m pytest tests/ -q` و `cd frontend && npm run build`. اگر رفتارِ برنامه عوض شد:
   `cd apps/learning-architecture && npm i --no-save playwright@1.56 && for t in tests/*.js; do node $t; done`
   (Chromium در `/opt/pw-browsers`؛ `playwright install` نزن). هر آزمون باید «NO ERRORS» بدهد (`scan_epi.js` «no page errors» و `test3.js` «no errors» چاپ می‌کنند — همان معنا).
   اگر مسیرِ AI عوض شد، یک بار با مدلِ واقعی هم اجرا کن (`POST /api/inspection/audit/ai` با توکنِ ناظر؛ الگو: WORKLOG (22)) — هوش مصنوعیِ ساختگی بریدگیِ پاسخ و JSON ِ بدشکل را نشان نمی‌دهد.
   اگر ذخیره/ورود/تاریخچه/آینه/پیوست/میزبان عوض شد: `python apps/learning-architecture/tests/host/run_host_e2e.py`
   (برنامهٔ واقعی با پایگاه‌دادهٔ موقت؛ آزمون‌های `tests/host/*.js`) — باید «host e2e: all NO ERRORS» بدهد.
6. ثبتِ عمومی: `docs/overhaul/AUDIT_LOG.md` و درس در `experiences/` — بعد ادغام در `main` طبقِ `/CLAUDE.md`.

## خطوطِ قرمز
- **متنِ جزوه** (`src/app/epi_book.js`) را ویرایش نکن؛ نقد = ثبت در «جزوهٔ زنده»/اختلاف‌ها یا WORKLOG.
- **هوش مصنوعی در داوری نقشی ندارد** — فقط پیشنهاد به صفِ تأیید. هیچ مسیری نساز که خروجیِ AI بی‌تأییدِ مالک وارد کتابخانه/داوری شود.
  **استثنای صریحِ مالک (۲۰۲۶-۱۰-۱۳): پیکرهٔ بک‌تستِ پیوسته** (`backtest/corpus/`) را روتین هر دور خودکار می‌افزاید (گردآوری + رمزگذاریِ
  کور) — لایهٔ اکتشافی و جدا: وارد کتابخانهٔ صفحه، «سه آزمون» یا حکمِ پرونده‌های مالک **نمی‌شود**؛ داوری همان موتورِ قطعی است؛ مالک هر
  واقعه را در «♾ بک‌تستِ پیوسته» رد می‌کند (`ebtp_x_<id>` ⇒ `excluded`). دستورِ دور: `docs/supervisor/BACKTEST_PROMPT.md`؛ ابزار:
  `tools/epi_backtest.js`؛ آزمون: `tests/test_backtest_tool.js`. قاعده/سقف/ایستگاه فقط با «بپذیر» ِ مالک روی پیشنهاد.
- **وزن/قاعده را برای سبز شدنِ یک واقعه عوض نکن**؛ «داوریِ رشته» (`epi_field.js`) را از روی جزوه ننویس. تغییرِ داوری ⇒ علت در WORKLOG، سه آزمون دوباره، عددها در §۶، سطر در PROGRESS.
- بسته را از جای دیگری (پیوستِ برگه، آپلود) جایگزین نکن — بسته هم‌مبدأ اجرا می‌شود و به توکن دسترسی دارد.
- سطرِ قدیمیِ PROGRESS/WORKLOG را پاک یا بازنویسی نکن؛ اصلاح = سطرِ تازه (↩ / `[CORRECTION]`).
- نسخهٔ قدیمی (`?legacy=1`) قرنطینه است؛ حذف فقط با تأییدِ صریحِ مالک.

## برگهٔ «نظارت و سرکشی» روی این صفحه
کادر می‌گوید کجا: `section_id` = نمای برنامه (مثلاً `e_bt`، با `?tab=`)، یا anchor ِ بخشِ دفترچه (با `?doc=HANDBOOK#…`)، یا
`progress-chart`. اولی ⇒ منبع در `src/app/`؛ دومی ⇒ `docs/HANDBOOK.md` (یا PROGRESS/WORKLOG)؛ سومی ⇒ `docs/PROGRESS.md` یا
`frontend/src/components/learning-architecture/ProgressChart.jsx`. بعد همان روالِ «هر تغییر». جوابِ زیرِ برگه شمارهٔ WORKLOG را بگوید.
