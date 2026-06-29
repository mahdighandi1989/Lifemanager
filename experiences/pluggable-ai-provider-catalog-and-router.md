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

## Update 2026-06-28 — subscription OAuth tokens need a beta header, not just a Bearer

When a provider authenticates with a **subscription OAuth token** (e.g. a
Claude Pro/Max "Claude Code" token) instead of an API key, three things must ALL
be present on the chat call or the provider returns **401 Unauthorized**:

1. `Authorization: Bearer <oauth_token>` (NOT the api-key header), AND
2. the provider's OAuth **beta header** — for Anthropic: `anthropic-beta: oauth-2025-04-20`
   (combine with other betas comma-separated, e.g. `oauth-2025-04-20,pdfs-2024-09-25`), AND
3. the client "spoof" system block the token is scoped to (Anthropic: a first
   system block exactly `"You are Claude Code, Anthropic's official CLI for Claude."`).

Pitfall: it's easy to wire (1) and (3) and forget (2) — the request then looks
right but 401s. Apply the SAME header on every call site for that provider: the
chat endpoint, the multimodal endpoint, AND the model-discovery (`GET /v1/models`)
endpoint, or "test"/"sync models" will fail while one path works.

Operator caveat to surface in the UI/docs: subscription OAuth **access** tokens
are short-lived (hours) and need refreshing; a single pasted access token will
start 401-ing once expired. Offer a plain API-key provider as the durable path.

How to apply elsewhere: model `auth_scheme` per provider ("api_key" vs
"oauth_bearer"); branch headers on it in ONE helper reused by every call site;
add a test that asserts the oauth path sends Bearer + the beta header and that
the api-key path still uses the key header with NO beta.

### Refinement: the User-Agent is the decisive header (not just the beta)

The oauth beta header + Bearer + system spoof are necessary but STILL 401 if the
request's `User-Agent` looks like a generic HTTP client. Anthropic gates
subscription OAuth tokens on a Claude-CLI user-agent, so an httpx/requests default
(`python-httpx/…`) is rejected with 401. Send **`user-agent: claude-cli/1.0 (external)`**
on every OAuth call (chat, multimodal, model-discovery). Full working recipe for a
Claude Pro/Max OAuth token on `/v1/messages`:

```
authorization: Bearer <sk-ant-oat01-…>
anthropic-version: 2023-06-01
anthropic-beta: oauth-2025-04-20            # + ,pdfs-2024-09-25 for documents
user-agent: claude-cli/1.0 (external)       # ← the piece everyone forgets
system[0] = "You are Claude Code, Anthropic's official CLI for Claude."
```

Debugging lesson: when a 401 persists after the "obvious" auth headers are right,
**diff against a known-working implementation of the same provider** rather than
assuming the credential is bad — here the only delta between the broken and working
repos was this one user-agent line.

### Refinement: newer Anthropic models reject `temperature` (a 400 after auth is fixed)

Once OAuth auth is correct, the next failure on Claude Opus 4.x is
`400 invalid_request_error: 'temperature' is deprecated for this model`. Two
defences: (1) a connectivity ping should send NO temperature; (2) wrap the
`/v1/messages` POST with a self-healing retry — on a 400 whose body mentions
`temperature`, drop it and POST once more. This keeps a configured temperature
from breaking real inference on models that deprecate it, and keeps the call
working across model generations without a per-model allow/deny list.

Debugging lesson (again): the cause was only visible because the test surfaced
the provider's response BODY. A bare "400 Bad Request" or "401" hides the one
sentence that pinpoints the fix — always bubble up `error.type` + `error.message`.
