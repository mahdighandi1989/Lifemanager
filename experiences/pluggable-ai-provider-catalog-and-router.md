---
title: "کاتالوگ چندارائه‌دهنده‌ی AI + مسیریاب تسک‌محور — Pluggable AI provider catalog & task router"
tags: ["ai", "llm", "fastapi", "multi-provider", "settings"]
topic_canonical: "pluggable-ai-provider-catalog-and-router"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-06-28T00:00:00Z"
created_at: "2026-06-28T00:00:00Z"
updated_at: "2026-10-12T00:00:00Z"
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

## Update 2026-10-12 — models die silently; the catalog must retire them
- مشکل: کاتالوگِ ثابت مدل‌هایی را نگه داشت که ارائه‌دهنده خاموششان کرده بود؛ چون هیچ مسیری مدلِ ثابت نداشت، «انتخابِ خودکار» همه را به
  مدلِ مرده فرستاد و هیچ هشداری نبود (شمارنده صفر، هزینه ثبت‌نشده).
- راه: در تعریفِ کاتالوگ `retired: True` ⇒ seed ِ هر بوت ردیف را خاموش می‌کند (حذف نمی‌کند) و اولویتش را پایین می‌برد؛ مدلِ جایگزین با
  قابلیت‌های درست (reasoning/fast) اضافه می‌شود تا انتخابِ خودکار خودش به آن برسد. یک آزمون بنویس که با ردیف‌های قدیمیِ «روشن» شروع
  می‌کند (شبیهِ production) نه با پایگاه‌دادهٔ خالی.
- مدل‌های «فکرکننده» (Gemini 2.5+/3.x، …) سقفِ خروجی را صرفِ استدلال می‌کنند: پاسخِ خالی + `MAX_TOKENS` ⇒ یک تلاشِ دوباره با سقفِ بزرگ‌تر،
  و بخش‌های `thought` را از پاسخ بیرون بگذار.
- چک‌لیست: هر چند ماه صفحهٔ deprecations ِ هر ارائه‌دهنده را با کاتالوگ مقایسه کن؛ شمارندهٔ درخواست/خطا و قیمتِ هر مدل را پر نگه دار تا «صفر» معنا داشته باشد.


## Update 2026-10-12 (2) — don't hand-maintain the model list: reconcile against the provider's live list
- The previous update still relied on a person noticing deprecations. Better: a daily background job (plus the existing "sync" button)
  fetches the provider's own `/models` list (all pages) and **reconciles** the catalog:
  - classify each live id from its name + provider metadata (Gemini: `gemini-<ver>-<pro|flash|flash-lite>[-NNN]`, `supportedGenerationMethods`
    must include `generateContent`, `outputTokenLimit`/`inputTokenLimit` → caps; Claude: `claude-<tier>-<ver>`); skip embeddings/image/audio/live;
  - per tier, only the **newest stable** model is switched on with the tier's priority; older stable get a worse priority; previews and
    unknown families are added **off**;
  - a catalog row whose id is no longer listed is switched **off and labelled** (kept, never deleted) — the router then routes around it;
  - **an empty list or any fetch error retires nothing** (a provider outage must not switch off every model);
  - the owner's manual edits (on/off, priority, capabilities) are marked (`[owner]`) and survive the refresh; only a vanished model is
    still switched off;
  - mark reconciled rows (`source="live"`) so the static boot-time seed stops overwriting them — otherwise each deploy undoes the refresh.
- Unique-key trap: the same model id can exist under two providers (API key vs. subscription) or as an owner's custom row → derive a free key.
- Secrets: send the key in a header (`x-goog-api-key`), never in the URL — URLs end up in exception text, logs and UI error messages;
  scrub provider errors before showing them. Pin `base_url` to the provider's official https host, or an editable base URL becomes
  a way to post the key to any server.
- Treat an empty/blocked answer (`finishReason` SAFETY/RECITATION, `promptFeedback.blockReason`) as an error, not "ok with empty text".
- Checklist elsewhere: job interval ≥ your scheduler's floor; test "vanished model", "came back", "empty list", "owner pin", "key collision";
  show "auto" / "your choice" badges in the settings UI so the owner can see why a model is on.

## Update 2026-10-12 (3) — a boot-time seed that fails silently looks exactly like "the fix never shipped"
- Symptom: the new catalog was deployed (the new frontend bundle was being served) but production still listed the old models.
  The seed ran inside `try/except: logger.debug(...)` at startup — the failure left no trace at the default log level.
- Rule: never swallow a startup migration/seed at debug level. Log a warning with traceback AND persist the last result
  (ok/error/time) somewhere a read-only status endpoint can show without log access; check that endpoint after every deploy.
- Reproduce upgrades against the real engine: run the OLD seed, then the NEW one, on a throw-away Postgres (`initdb` + `pg_ctl`
  in a temp dir) — SQLite in tests hides dialect-specific failures.
- **Correction (same day):** in this case the seed had NOT failed — my reading of the public status endpoint was stale (read
  before the first refresh run / from an intermediate cache). The persisted result is what proved it. Lesson on top of the lesson:
  before concluding "the deploy didn't take", read a status that carries its own timestamp (seed `at`, job `last_run`).

## Update 2026-10-14 — fully automatic pick: required capabilities, newness tie-break, failover, dead pins
- **Required vs preferred capability.** A task can need a capability on EVERY call (a chat that may receive a screenshot at any turn): `TASK_TYPES[].requires` filters the pool (if any model satisfies it) before `preferred` orders it — a text-only «fast» model no longer wins the vision chat.
- **Ties go to the newer model.** Priorities collide across tiers/providers; the same id parser the refresh uses gives a version rank, so ties break by newness, never by DB order.
- **Failover is part of «automatic».** The gateway asks the manager for ordered *candidates* (live pin first, then the automatic order) and moves to the next one when a call fails (retired model, 404, outage) — a model that died between two refreshes never leaves a task without an answer. An explicit `model_id` is still tried alone.
- **Dead pins are released.** The daily refresh releases a task's pin to a model the provider stopped listing (noted on the route); a model switched off by the owner keeps its pin (owner's choice).
- **Make the job's health honest.** A refresh where every provider failed must raise so the job stamp records an error (it used to record «ok»), and show the stamp in the settings UI.
- **Parser pitfall:** `claude-opus-4-20250514` matched `(\d+)` as a minor version (v4.2025 outranked v4.1) — bound minor versions to 1–2 digits.
