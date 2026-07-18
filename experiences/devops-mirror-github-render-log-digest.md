---
title: "آینهٔ DevOps در اپ شخصی — GitHub/Render mirror با کارنامهٔ روزانهٔ AI"
tags: ["integration", "github", "render", "logs", "scheduler", "ai-summary", "fastapi"]
topic_canonical: "devops-mirror-github-render-log-digest"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-18T00:00:00Z"
created_at: "2026-07-18T00:00:00Z"
updated_at: "2026-07-18T00:00:00Z"
merged_from: []
---

# DevOps mirror (GitHub repos + PaaS services/logs) with daily AI digest

## 🎯 چالش / Challenge

یک اپ می‌خواهد وضعیت پروژه‌های نرم‌افزاری کاربر را از دو منبع بیرونی آینه کند —
مخزن‌های GitHub (با PAT) و سرویس‌ها/لاگ‌های یک PaaS مثل Render (با API key) — و
لاگ‌های خام پرتکرارِ انگلیسی را به «امروز در این پروژه چه گذشت»ِ خوانا به زبان
کاربر تبدیل کند. محدودیت‌ها: host رایگان بدون worker جدا، تست‌ها بدون شبکه، توکن‌ها
هرگز به کلاینت برنگردند، و اپ مرجعِ مدیریت‌پروژهٔ موجود دوباره‌سازی نشود (فقط
mirror + وظیفهٔ «رسیدگیِ» سطح-زندگی).

## 💡 راه‌حل / Solution

1. **پنج جدول، پنج نقش:** `integrations(provider, api_key_encrypted, last_sync_*)`،
   `projects_mirror(repo_full_name unique-per-scope, linked_life_id nullable)`،
   `services(id = PaaS's own id as PK)`، `logs(id = content-hash PK)`،
   `daily_summaries(service_id, local_date, summary, stats, ai_model)`.
   PK سرویس = idِ خود PaaS (`srv-…`) تا join لاگ‌ها lookup نخواهد؛ PK لاگ =
   `md5(service|timestamp|message)` تا **dedup بین چرخه‌های poll رایگان** شود
   (همان upsert-by-natural-key).
2. **Resolution توکن: DB (رمزگشایی‌شده) اول، env بعد** (`GITHUB_TOKEN`/`GH_TOKEN`،
   `RENDER_API_KEY`). پاسخ‌ها فقط `has_api_key` + `source` را می‌دهند؛ پاک‌کردن =
   PUT با رشتهٔ خالی. probe («بررسی اتصال») endpoint جدا با پیام دلیل‌دار.
3. **Fetcher تزریق‌پذیر در همهٔ سرویس‌ها** (`fetcher(url, headers) -> json`):
   تست‌ها هم مسیر service-level (پارامتر مستقیم) و هم route-level
   (monkeypatch `_default_fetcher` ماژول) را بدون شبکه می‌پوشانند.
4. **همگام‌سازی upsert-نه-delete:** repoهایی که upstream ناپدید شدند فقط
   به‌روزرسانی نمی‌شوند؛ سرویس ناپدیدشده `status='gone'` می‌گیرد (قانون
   quarantine-not-delete). link خودکار service→repo از URL مخزنِ گزارش‌شده توسط
   PaaS با normalize `owner/name` (lowercase، بدون `.git`).
5. **کارنامهٔ روزانه = digest دومرحله‌ای:** (الف) فشرده‌سازی deterministic —
   شمارش per-level، رویدادهای deploy، **گروه‌کردن پیام‌ها بعد از حذف عدد/hex**
   (`\b[0-9a-f]{8,}\b|\d+` → `#`) تا "GET /items/101" و "/102" یکی شوند،
   نمونه‌های خطای distinct با سقف؛ (ب) همان digest به LLM با پرامپت زبان-کاربر
   («فقط از همین داده‌ها، تکراری‌ها را یکی کن») و **fallback بدون-AI از همان
   digest** (provenance: `ai_model NULL` ⇒ متن قطعی). خلاصه در activity log هم
   ثبت می‌شود (entity = پروژهٔ mirror؛ context = پروژهٔ زندگیِ لینک‌شده) تا هم
   صفحهٔ لاگ کلی و هم پنل per-entity رایگان آن را نشان دهند.
6. **نگهداری کوتاه لاگ خام + خلاصه به‌جای آرشیو:** حذف دوره‌ای سطرهای قدیمی‌تر از
   N ساعت؛ رکورد بلندمدت همان `daily_summaries` است (به‌جای آرشیو gzip اپ مرجع).
7. **یک loop asyncio با «هر دغدغه cadence خودش»:** settings + stampها در یک
   GlobalSetting JSON blob؛ اولویت DEFAULTS < env < blob؛ توابع تصمیم خالص
   (`due(last_iso, interval, now)`، `summary_decision(cfg, now)`)؛ tick کوتاه
   (۳۰s) که هر concern خودش می‌سنجد due است یا نه؛ **stamp قبل از اجرا جلو
   می‌رود** تا توکن خراب hot-loop نسازد؛ fail-open per concern.
8. **UI زنده:** poll سبک ۱۰ثانیه‌ای کلاینت = `POST /logs/fetch` (کشیدن از PaaS)
   سپس `GET /logs` (خواندن DB با فیلتر سرویس/سطح/بازه/جستجو) — بدون WebSocket.

## 🧪 نمونه کد (Anonymized)

```python
def log_row_id(service_id, ts_raw, message):        # dedup-by-content PK
    return "rl_" + hashlib.md5(f"{service_id}|{ts_raw}|{message}".encode()).hexdigest()

_FRACTION = re.compile(r"\.(\d{7,})")
def parse_ts(value):                                 # PaaS sends nanoseconds
    text = _FRACTION.sub(lambda m: "." + m.group(1)[:6], value)
    return datetime.fromisoformat(text.replace("Z", "+00:00"))

async def tick(db, now):
    cfg = await load_settings(db)                    # DEFAULTS < env < blob
    if due(cfg.get("last_log_poll_at"), cfg["log_poll_seconds"], now):
        cfg["last_log_poll_at"] = now.isoformat()    # advance BEFORE running
        result = await sync_logs(db)                 # never raises
    if summary_decision(cfg, now):                   # once per LOCAL day
        cfg["last_summary_date"] = local_date(now, cfg["tz_offset_minutes"]).isoformat()
        await generate_daily_summaries(db, ...)
    await save_settings(db, cfg)
```

## ⚠️ نکات حیاتی / Pitfalls

- **`server_default=sa.text("1")` روی ستون Boolean در Postgres می‌شکند** (SQLite
  قبولش می‌کند و تست سبز می‌ماند!). همیشه `sa.true()/sa.false()` که per-dialect
  کامپایل می‌شود.
- **timestampهای Render نانوثانیه دارند** (`…T07:49:47.947123456Z`) —
  `fromisoformat` رد می‌کند؛ قبل از parse کسر ثانیه را به ۶ رقم کوتاه کن.
- SQLite برای `DateTime(timezone=True)` مقدار **naive** برمی‌گرداند؛ هر مقایسهٔ
  پایتونی را با helper `as_utc()` (tzinfo=None ⇒ UTC) نرمال کن وگرنه
  naive-vs-aware TypeError فقط در پروڈاکشن/Postgres یا برعکس ظاهر می‌شود.
- شمارش لاگ برای نمودار ساعتی را **در پایتون bucket کن** نه SQL — توابع تاریخ
  SQLite/Postgres ناسازگارند و ستون‌ها کم‌حجم‌اند (فقط ts/level/service را select کن).
- پیام خطای همگام‌سازی (`last_sync_error`) را قبل از ذخیره کوتاه کن و مطمئن شو
  exception transport هرگز خود توکن را در متن ندارد (httpx URL/header را در پیام
  نمی‌گذارد؛ ولی اگر fetcher عوض شد دوباره چک کن).
- گزارش «probe بدون توکن» را به‌جای 4xx با `{ok:false, reason:'no_token', detail:فارسی}`
  برگردان تا UI بدون حالت خاص پیامش را نشان دهد.
- تست inventory/registry-of-pages اگر در repo هست، صفحهٔ جدید frontend را هم
  باید در JSONِ inventory ثبت کنی — build سبز این را نمی‌گیرد، تست می‌گیرد.

## 🔁 How to Apply Elsewhere

1. جدول‌ها را با نام‌گذاری مجزا از سیستم موجود بساز (`dev_*`/`mirror_*`) و PKهای
   طبیعی (id سرویسِ PaaS؛ hash محتوا برای لاگ).
2. توکن‌ها: ستون `api_key_encrypted` + الگوی has_api_key/masked اپ میزبان؛
   resolution DB-اول-env-بعد؛ probe جدا.
3. هر سرویس sync را با `fetcher` تزریق‌پذیر بنویس و `{ok, ...}` برگردان — هیچ
   exception به route نرسد.
4. loop پس‌زمینه را از الگوی scheduler موجودِ میزبان کپی کن (settings blob +
   توابع تصمیم خالص + tick کوتاه) و stampها را قبل از کار جلو ببر.
5. digest → LLM → fallback deterministic؛ خروجی را در activity log میزبان هم
   ثبت کن تا در نماهای موجود ظاهر شود؛ لاگ خام را کوتاه‌عمر نگه دار.
