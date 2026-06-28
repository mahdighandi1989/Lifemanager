---
title: "کاتالوگ چندارائه‌دهنده‌ی AI + مسیریاب تسک‌محور — Pluggable AI provider catalog & task router"
tags: ["ai", "llm", "fastapi", "multi-provider", "settings"]
topic_canonical: "pluggable-ai-provider-catalog-and-router"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-06-28T00:00:00Z"
created_at: "2026-06-28T00:00:00Z"
updated_at: "2026-06-28T00:00:00Z"
merged_from: []
---

# Pluggable AI provider catalog & task router

## 🎯 چالش / Challenge

یک اپ می‌خواهد قابلیت‌های مختلف (چت، خلاصه‌سازی، استخراج از سند، …) را به مدل‌های مختلف
LLM وصل کند، با چند ارائه‌دهنده (Anthropic / OpenAI / Gemini / OpenAI-compatible) و این‌که
مدیر بتواند از UI کلید بگذارد، اتصال را تست کند و برای هر قابلیت مدل انتخاب کند — بدون
hard-code کردن یک ارائه‌دهنده و بدون پاک‌کردن سیستم قبلیِ موجود.

## 💡 راه‌حل / Solution

سه‌لایه‌ی ساده و قابل‌تعمیم:

1. **کاتالوگ ثابت (کد):** فهرست curated از `providers → models(capabilities)` + لیست
   `tasks(preferred_capability)`. یک `seed_catalog(db)` آن را idempotent داخل سه جدول می‌ریزد:
   `providers(key PK)`، `models(id, capabilities[], priority, source)`، `task_routes(task PK, model_id?)`.
   Seed، ارائه‌دهنده‌ی جدید را غیرفعال می‌سازد و فقط metadataـی catalog را refresh می‌کند
   (پرچم enabled و کلید را دست نمی‌زند) و ردیف‌های custom را هرگز.
2. **Resolver:** `resolve(task) → ResolvedModel|None` به ترتیب: (الف) route صریح و فعال،
   (ب) مدلِ فعالِ با بالاترین priority که `preferred_capability` تسک را دارد و ارائه‌دهنده‌اش
   پیکربندی‌شده، (ج) هر مدلِ پیکربندی‌شده. کلید را اول از DB (رمزگشایی) و بعد از env می‌خواند.
3. **Gateway:** بر اساس خانواده‌ی ارائه‌دهنده dispatch می‌کند (Anthropic `/v1/messages` با
   `x-api-key` یا Bearter برای OAuth؛ Gemini `:generateContent`؛ بقیه = OpenAI `/chat/completions`).
   خروجی یکنواخت `{ok, text, model, error}` و هرگز exception به بالا نمی‌دهد.

نکته‌ی همزیستی: جدول‌ها را با نام مجزا (مثل `*_catalog_*`) بساز تا با سیستم قبلی تداخل نکند؛
سیستم قبلی را نگه دار (rule «هیچ قابلیتی حذف نمی‌شود»).

## 🧪 نمونه کد (Anonymized)

```python
@dataclass
class ResolvedModel:
    provider_key: str; model_key: str; api_key: str | None
    auth_scheme: str; base_url: str | None; capabilities: list[str]
    @property
    def is_usable(self): return bool(self.api_key)

async def resolve(db, task):
    provs = {p.key: p for p in await all_providers(db)}
    ok = {k for k,p in provs.items() if p.enabled and effective_key(p)}
    route = await get_route(db, task)
    if route and route.model_id:
        m = await db.get(Model, route.model_id)
        if m and m.enabled and m.provider_key in ok: return build(m, provs[m.provider_key])
    pool = [m for m in await enabled_models(db) if m.provider_key in ok]
    need = preferred_capability(task)
    cand = [m for m in pool if need in m.capabilities] or pool
    return build(min(cand, key=lambda m: m.priority), ...) if cand else None

def effective_key(p):                       # DB secret first, env fallback
    return decrypt(p.api_key_encrypted) if p.api_key_encrypted else os.environ.get(p.env_key)
```

## ⚠️ نکات حیاتی / Pitfalls

- **`from __future__ import annotations` در ماژول route/schema، بدنه‌ی `Body(...)` را خراب
  می‌کند:** annotationها به‌صورت رشته (forward-ref) می‌مانند و pydantic v2 هنگام ساخت
  TypeAdapter خطای *"TypeAdapter … is not fully defined"* می‌دهد — فقط موقع POST/PUT واقعی،
  نه موقع import یا build. راه‌حل: این import را از ماژول‌های schema بدنه و route حذف کن.
- کلیدها را **رمزنگاری‌شده** ذخیره کن و هرگز برنگردان؛ فقط `has_api_key` + hint ماسک‌شده.
- جدول جدید ⇒ هم مدل را در رجیستری metadata ثبت کن (برای `create_all`) و هم یک migration
  alembic بنویس، وگرنه تست «همه‌ی جدول‌ها بعد از upgrade head ساخته شدند» می‌شکند.
- seed باید idempotent باشد و پرچم enabled/custom را clobber نکند (هر بار boot اجرا می‌شود).
- gateway نباید exception بدهد؛ خطای ارائه‌دهنده را به `{ok: False}` تبدیل کن تا route همیشه
  بتواند به پاسخ placeholder تنزل کند.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. سه جدول `providers/models/task_routes` با نام مجزا بساز (تداخل با هر سیستم قبلی نکن).
2. کاتالوگ ثابت + `seed_catalog` idempotent بنویس؛ در startup صدا بزن.
3. `resolve(task)` با ترتیب route → capability+priority → fallback پیاده کن؛ کلید از DB سپس env.
4. gateway را بر اساس خانواده‌ی ارائه‌دهنده dispatch کن و خروجی یکنواخت بده.
5. endpointها: `overview` (یک‌جا برای کل صفحه)، `PUT providers/{key}`، CRUD مدل،
   `test`، `sync-models`، `PUT routes/{task}`.
6. مراقب pitfall ‏`__future__ annotations` روی بدنه‌های FastAPI باش.
7. migration alembic فراموش نشود.

## 🔗 References
- Source: Lifemanager task — porting ALLIN1's AI settings (docs/overhaul/AUDIT_LOG.md, 2026-06-28).
- Related: legacy per-user provider system kept (Settings page); see CLAUDE.md rule 2.
