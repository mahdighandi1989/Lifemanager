---
title: "Full-DB JSON export with degraded cloud backup (never raise, never single-copy)"
tags: ["backup", "sqlalchemy", "google-drive", "resilience", "background-loop", "memory-safety", "streaming"]
topic_canonical: "full-db-json-export-with-degraded-cloud-backup"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-20T00:00:00Z"
created_at: "2026-07-20T00:00:00Z"
updated_at: "2026-07-21T00:00:00Z"
merged_from: []
---

# Full-DB JSON Export with Degraded Cloud Backup

## 🎯 چالش / Challenge

داده‌های حیاتی کاربر فقط در یک دیتابیس ابری رایگان زندگی می‌کند (single-copy).
نیاز: پشتیبان‌گیری شبانهٔ خودکارِ «همهٔ جدول‌ها» به فضای ابری، طوری که:

- هیچ جدولی از قلم نیفتد (schema هر روز بزرگ‌تر می‌شود)؛
- بدون اعتبارنامهٔ ابری هم backup از بین نرود (fallback محلی)؛
- خطای backup هرگز اپ را نیندازد (never-raise)؛
- بیش از روزی یک بار اجرا نشود، حتی با restartهای مکرر.

## 💡 راه‌حل / Solution

1. **Export مبتنی بر metadata، نه لیست دستی جدول‌ها:** روی
   `Base.metadata.sorted_tables` حلقه بزن و `SELECT *` هر جدول را با
   `result.mappings()` بگیر. جدول جدید = خودکار داخل backup (به شرط اینکه
   ماژول مدل‌ها قبلش import شده باشد تا همه روی metadata ثبت شوند).
2. **سریال‌سازی JSON-safe با fallback نهایی:** datetime/date → isoformat،
   Decimal → str، bytes → base64، dict/list بازگشتی، و برای هر نوع ناشناخته
   `str(value)` — تا `json.dumps` هیچ‌وقت وسط backup منفجر نشود.
3. **زنجیرهٔ تنزل (degrade chain):** اول upload به فضای ابری از طریق همان
   seam تزریق‌پذیر موجود پروژه؛ اگر client ساخته نشد یا upload خطا داد،
   gzip را در دایرکتوری محلی بنویس و نتیجه را `degraded: true` علامت بزن —
   ولی همچنان `ok: true` چون داده حفظ شده. فقط وقتی هیچ نسخه‌ای ذخیره نشد
   `ok: false`. retention محلی: نام فایل شامل timestamp UTC است، پس sort
   لغوی = زمانی؛ قدیمی‌ترها را حذف کن (سقف N فایل).
4. **وضعیت در یک blob JSON در جدول key/value موجود:** last_attempt_at /
   last_ok_at / last_error / … در یک ردیف GlobalSetting — بدون migration.
   `is_stale` را موقع خواندن حساب کن (last_ok قدیمی‌تر از ~۲۶ ساعت).
5. **گیت روزانه با «روز تقویمیِ آخرین تلاش»، نه موفقیت:** tick فقط وقتی اجرا
   می‌کند که روز UTC آخرین *تلاش* با امروز فرق کند — یعنی Drive خراب هم
   باعث نمی‌شود هر ۱۵ دقیقه export کامل DB تکرار شود.
6. **حلقهٔ پس‌زمینه با stop_event:** grace اولیه (~۱۲۰ ثانیه بعد از boot)،
   سپس چک هر ~۱۵ دقیقه؛ هر چرخه session خودش را باز می‌کند و هر خطا فقط
   log می‌شود (fail-open). خاموشی با `stop_event.set()` + انتظار محدود.

## 🧪 نمونه کد (Anonymized)

```python
BACKUPS_DIR = Path("data/backups")  # module-level → tests monkeypatch it

async def export_all_tables(db):
    import myapp.models  # register every model on Base.metadata
    out, counts = {}, {}
    for table in Base.metadata.sorted_tables:
        rows = (await db.execute(select(table))).mappings().all()
        out[table.name] = [{k: json_safe(v) for k, v in dict(r).items()} for r in rows]
        counts[table.name] = len(out[table.name])
    return {"exported_at": utcnow().isoformat(), "tables": out, "counts": counts}

async def run_backup(db, now=None):
    try:
        gz = gzip.compress(json.dumps(await export_all_tables(db)).encode())
        try:
            file_id = await cloud_upload(db, gz)          # seam موجود پروژه
        except Exception:
            file_id = None
        if not file_id:                                   # degrade, don't fail
            Path(BACKUPS_DIR).mkdir(parents=True, exist_ok=True)
            (Path(BACKUPS_DIR) / name).write_bytes(gz)
            prune_oldest(BACKUPS_DIR, keep=14)
        await patch_status_blob(db, {...})
        return {"ok": True, "degraded": file_id is None, ...}
    except Exception as exc:
        await safe_rollback(db)
        return {"ok": False, "detail": repr(exc)[:300]}
```

## ⚠️ نکات حیاتی / Pitfalls

- **ترتیب route ها با SPA catch-all:** اگر اپ یک catch-all مثل
  `/{full_path:path}` دارد، router جدید باید *قبل* از آن ثبت شود؛ افزودن
  router بعد از ساخت اپ (مثلاً در تست) یعنی catch-all برنده می‌شود و
  endpoint جدید 404/redirect می‌گیرد. در تست باید route های جدید را قبل از
  catch-all در `app.router.routes` جا داد.
- **گیت روزانه را به last_ok گره نزن** — یک upload خرابِ دائمی، backup را به
  حلقهٔ full-export بی‌پایان تبدیل می‌کند. مقایسه با last_attempt امن است.
- **مسیر دایرکتوری محلی باید ثابتِ سطح ماژول باشد** و داخل تابع دوباره خوانده
  شود (`Path(BACKUPS_DIR)`)، وگرنه monkeypatch تست اثر نمی‌کند.
- **دایرکتوری backup را gitignore کن** — خروجی، دادهٔ خام زندگی کاربر است.
- **بعد از خطای export حتماً `rollback` قبل از نوشتن status** — session خراب،
  نوشتن status را هم می‌سوزاند و backup «بی‌صدا» گم می‌شود.
- **سریال‌سازی بدون fallback نهایی نگذار:** یک ستون UUID/Enum جدید در آینده
  نباید backup شبانه را بشکند.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. تابع export را روی `Base.metadata.sorted_tables` بنویس و ماژول مدل‌ها را
   اول import کن (تضمین پوشش خودکار جدول‌های آینده).
2. یک `json_safe` با fallback `str()` بساز؛ datetime/date/Decimal/bytes را
   صریح پوشش بده.
3. زنجیرهٔ «ابر → محلیِ degraded → ok:false فقط وقتی هیچ‌جا ذخیره نشد» را با
   قرارداد never-raise پیاده کن؛ نتیجه همیشه dict ساخت‌یافته با detail.
4. وضعیت را در key/value موجود (یا یک جدول settings) به شکل یک blob JSON
   نگه دار؛ staleness را موقع read حساب کن نه write.
5. گیت «یک بار در روز» را با روز تقویمی آخرین تلاش بساز؛ حلقهٔ background را
   با stop_event و grace اولیه و cadence کوتاه (۱۵ دقیقه) اجرا کن تا بعد از
   هر restart حداکثر ۱۵ دقیقه تأخیر داشته باشد، نه ۲۴ ساعت.
6. در تست‌ها: دایرکتوری محلی را monkeypatch کن به tmp، سازندهٔ client ابری را
   monkeypatch کن که None برگرداند، و یک ردیف با date واقعی درج کن تا
   سریال‌سازی end-to-end اثبات شود.

## Update 2026-07-21 — Streaming the export so it can't OOM the box

### 🎯 چالش تازه
نسخهٔ اول کل export را در RAM می‌ساخت: `dict` کاملِ همهٔ ردیف‌ها → `json.dumps`
(رشتهٔ کامل) → `gzip.compress` (کپی سوم). روی هاست ۵۱۲MB، با چند ماه لاگِ
append-only (activity/usage/webhook)، فشردنِ همین سه کپی + سربارِ per-row
`dict` پایتون از سقف رد شد و لحظه‌ای که کاربر «بکاپ فوری» را زد instance با
«Ran out of memory» کشته شد و کل اپ گیر کرد (رفرش هم جواب نمی‌داد). درسِ کلیدی:
**روی هاست محدود، «همه را در حافظه بساز بعد بنویس» یک بمب ساعتی است که با رشد
دیتابیس منفجر می‌شود — نه با یک تغییر کد.**

### 💡 راه‌حل
1. **سریال‌سازیِ استریمی به‌جای dict کامل:** یک async generator که سند JSON را
   تکه‌تکه (`bytes`) بیرون می‌دهد و هر جدول را **ردیف‌به‌ردیف** با `db.stream()`
   (نه `execute().all()`) می‌خواند. اوج حافظه = یک ردیف + بافر gzip، مستقل از
   حجم دیتابیس. `counts`/`table_errors`/`capped_tables` را **بعد از** بلوک
   `tables` منتشر کن (ترتیب کلید JSON بی‌اهمیت است) چون تا پایان استریم معلوم
   نیستند؛ برای دسترسی کالر بدون re-parse، همان dictها را به یک `sink` بده.
2. **gzip مستقیم روی دیسک:** استریم را با `gzip.open(tmp, "wb")` توی یک فایل
   موقت در **همان** دایرکتوری مقصد بنویس، بعد با `Path.replace` (rename اتمیک،
   نه copy) نهایی کن. آپلود ابری فقط همین فایلِ **کوچکِ فشرده** را یک‌بار به RAM
   می‌خواند.
3. **سقفِ شفاف روی جدول‌های لاگِ بی‌کران:** جدول‌های append-only تله‌متری
   (activity_logs/ai_usage_logs/behavior_logs/webhook_events/…) را به «N ردیف
   آخر» (`ORDER BY id DESC LIMIT N`) محدود کن و این را زیر کلید `capped_tables`
   **ثبت** کن. جدول‌های **محتوا** (tasks/writings/persons/transactions/…) هرگز
   سقف نمی‌خورند — «نه کم بشه». سقف = محافظ اندازهٔ فایل، نه جایگزین استریم.
4. **استریمِ HTTP بدونِ خطر lifecycle:** برای دانلود دستی، export را توی یک فایل
   موقت بریز (session درخواست همان‌جا و همان لحظه drain می‌شود)، بعد
   `FileResponse` فایل را از **دیسک** استریم کند و یک `BackgroundTask` پاکش کند.
   هرگز به «session وابسته به Depends داخل generatorِ StreamingResponse» تکیه
   نکن — teardown آن نسبت به استریم مبهم است.

```python
async def iter_export_bytes(db, *, redact_secrets=False, sink=None):
    yield b'{"exported_at": ' + dumps(utcnow()).encode() + b', "tables": {'
    first = True
    for table in Base.metadata.sorted_tables:
        if not first: yield b", "
        first = False
        yield dumps(table.name).encode() + b": ["
        n = 0
        try:
            sql = f"SELECT * FROM {q(table.name)}"
            if (cap := CAPS.get(table.name)) and "id" in table.columns:
                sql += f" ORDER BY {q('id')} DESC LIMIT {cap}"
            async for row in (await db.stream(text(sql))).mappings():
                if n: yield b", "
                yield dumps({k: json_safe(v) for k, v in row.items()}).encode()
                n += 1
        except Exception as exc:
            errors[table.name] = repr(exc)[:300]
            await db.rollback()          # PG: unpoison the aborted txn
        counts[table.name] = n
        yield b"]"
    yield b'}, "counts": ' + dumps(counts).encode() + b"}"   # counts AFTER tables
```

### ⚠️ نکات حیاتی تازه
- **`db.stream()` نه `execute().all()`** — دومی همان بمبِ حافظه است با یک نام
  دیگر. `AsyncResult.mappings()` روی aiosqlite و asyncpg هر دو کار می‌کند.
- **بعد از خطای هر جدول `rollback` کن** وگرنه روی Postgres تراکنشِ abortشده به
  همهٔ جدول‌های بعدی سرایت می‌کند و backup تقریباً خالی می‌شود.
- **rename اتمیک در همان فایل‌سیستم:** فایل موقت را در همان دایرکتوری مقصد بساز
  تا `replace` واقعاً اتمیک باشد؛ و prefixاش را طوری بگذار که با glob پرونرِ
  retention (`lifemanager-backup-*`) match نشود تا نیمه‌کاره پاک نشود.
- **سقف = کاهشِ داده؛ پس شفاف ثبتش کن.** فقط جدول‌های عملیاتی/تله‌متری را سقف
  بزن، نه محتوای کاربر، و لیست سقف‌خورده‌ها را در خروجی بیاور.
- **`Date.now()`/gzip mtime بی‌اهمیت‌اند** برای decompress؛ ولی خروجی gz را
  بین اجراها بایت‌به‌بایت مقایسه نکن.

## 🔗 References

- مرتبط: [google-drive-oauth-offline-integration]
- مرتبط: [periodic-attention-engine-cooldown-dedup] (الگوی blob تنظیمات + حلقهٔ stop_event)
