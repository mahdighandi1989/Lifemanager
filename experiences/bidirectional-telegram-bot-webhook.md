---
title: "Bidirectional Telegram bot over a FastAPI webhook (send + receive + self-heal)"
tags: ["telegram", "bot", "webhook", "fastapi", "notifications", "self-heal"]
topic_canonical: "bidirectional-telegram-bot-webhook"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-06-28T00:00:00Z"
created_at: "2026-06-28T00:00:00Z"
updated_at: "2026-06-28T00:00:00Z"
merged_from: []
---

# Bidirectional Telegram bot over a FastAPI webhook

## 🎯 چالش / Challenge

A backend already sends one-way Telegram notifications (a fire-and-forget
`sendMessage` for critical events). We want it to become **two-way**: the bot
should answer commands and inline-button taps from the user (list tasks, create a
task, mark done, show status) — without a long-poll worker, without a second
process, and degrading to a clean no-op when no bot is configured (so dev/test
and unconfigured deploys never break).

Three sub-problems make this harder than "call `sendMessage`":
1. **Receiving** updates needs a public webhook that Telegram POSTs to, plus a
   dispatcher for `message` (commands) vs `callback_query` (button taps).
2. **The webhook silently rots.** After a redeploy the public URL changes, or
   Telegram pauses delivery once the pending queue backs up — and "every button I
   press does nothing" with no recovery path.
3. **Flooding.** Telegram rate-limits ~1 msg/sec/chat; a burst of notifications
   gets 429'd and drops the *important* messages (like the menu keyboard).

## 💡 راه‌حل / Solution

**One transport, two directions, all env-driven and fail-open.**

1. **Single send seam.** Put the actual `sendMessage` call in ONE sync helper
   (`send_message_sync`) and have the legacy one-way notifier *delegate* to it —
   so outbound notifications and the bot share identical config + no-op-without-token
   behaviour. The async bot client adds throttling + retries on top.

2. **Inbound dispatcher.** A `handle_update(update)` that:
   - branches on `callback_query` first, then `message.text`;
   - maps persistent-reply-keyboard button captions back to slash commands via an
     alias table;
   - **security-gates** on a single configured chat id (ignore everyone else);
   - is wrapped so the webhook route can ALWAYS return HTTP 200 (a 5xx makes
     Telegram retry-storm).

3. **Self-heal supervisor.** A background loop that every N minutes calls
   `getWebhookInfo` and re-`setWebhook` when the recorded URL ≠ our public URL or
   the pending queue exceeds a threshold. Idempotent; a no-op when healthy. Start
   it in a startup hook, stop it via an `asyncio.Event` on shutdown.

4. **Flood throttle.** A class-level per-chat token bucket (min interval) plus a
   global pause that absorbs Telegram's `429 retry_after`, with one automatic retry.

5. **Public URL resolution** in priority order from env (`BACKEND_PUBLIC_URL` →
   platform-provided `*_EXTERNAL_URL` → `PUBLIC_URL`); the webhook URL is
   `{public}/api/telegram/webhook`.

## 🧪 نمونه کد (Anonymized)

```python
# Single send seam — the one-way notifier delegates here.
def send_message_sync(*, body, chat_id=None) -> bool:
    token = os.environ.get("BOT_TOKEN")
    if not token:                      # dev/test/unconfigured → log + succeed
        log.info("no token; would send %r", body[:80]); return True
    with httpx.Client(timeout=15) as c:
        r = c.post(f"{API}/bot{token}/sendMessage",
                   json={"chat_id": chat_id or os.environ.get("CHAT_ID"), "text": body})
        return 200 <= r.status_code < 300

# Inbound dispatch — always returns a dict, never raises.
async def handle_update(update):
    if cb := update.get("callback_query"):
        return await handle_callback(cb)            # button taps
    msg = update.get("message") or {}
    text, chat_id = (msg.get("text") or "").strip(), (msg.get("chat") or {}).get("id")
    if not chat_id or not text: return {"ok": True, "ignored": True}
    text = ALIASES.get(text, text)                  # keyboard caption → command
    configured = os.environ.get("CHAT_ID", "")
    if configured and str(chat_id) != configured:   # security gate
        return {"ok": True, "ignored": True}
    return await dispatch_command(str(chat_id), text)

# Self-heal — re-register when Telegram's URL drifts or the queue backs up.
async def heal_once():
    token, public = os.environ.get("BOT_TOKEN"), resolve_public_url()
    if not token or not public: return {"skipped": "unconfigured"}
    info = (await get(f"{API}/bot{token}/getWebhookInfo"))["result"]
    expected = f"{public}/api/telegram/webhook"
    if info.get("url") == expected and info.get("pending_update_count", 0) < 100:
        return {"healthy": True}
    await post(f"{API}/bot{token}/setWebhook",
               json={"url": expected, "allowed_updates": ["message", "callback_query"],
                     "drop_pending_updates": info.get("pending_update_count", 0) > 100})
    return {"reset": True}

# Webhook route — ALWAYS 200 so Telegram never retry-storms.
@router.post("/api/telegram/webhook")
async def webhook(request: Request):
    try: update = await request.json()
    except Exception: return {"ok": True}
    try: return await bot.handle_update(update)
    except Exception as e: return {"ok": True, "handler_error": str(e)[:200]}
```

## ⚠️ نکات حیاتی / Pitfalls

- **Never return a non-200 from the webhook.** Telegram retries failed deliveries
  and a 500 turns one bad update into a flood. Catch everything; return 200.
- **`setWebhook` with `allowed_updates`** must list `callback_query`, or inline
  buttons silently never reach you.
- **Markdown is fragile** — an unescaped `_`/`*` in a user/title string makes
  `sendMessage` 400 with "can't parse". Retry once without `parse_mode`.
- **The webhook URL changes on every redeploy** on ephemeral hosts. Without a
  self-heal supervisor you'll be manually re-running `setWebhook` forever — this
  is the #1 "the bot stopped responding" cause.
- **Throttle is class-level, not per-instance** — recreating the client per
  request must not reset the bucket, or the throttle does nothing.
- **Security-gate inbound by chat id.** A public webhook can be POSTed by anyone;
  only act on your configured chat (and still answer `answerCallbackQuery` so a
  stray tap doesn't spin forever).
- **DB work from the bot has no request user.** Pick an owner id from env
  (single-tenant default = the anon bucket) and open your own session — don't try
  to thread a request-scoped session into the webhook handler.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. **Config (env, all optional):** `BOT_TOKEN`, `CHAT_ID`, `PUBLIC_URL` (+ platform
   fallback), an owner id for DB writes. Everything no-ops when unset.
2. **One send seam.** If you already send one-way, refactor the call into a single
   helper and delegate; add the async client (throttle + retries) on top.
3. **Webhook route** at a stable path; parse JSON defensively; ALWAYS 200.
4. **Dispatcher:** `callback_query` → `message.text`; alias keyboard captions;
   gate by chat id; wrap each handler so one crash can't take the webhook down.
5. **Registration endpoints:** `set-webhook` (auto-build URL from PUBLIC_URL),
   `delete-webhook`, `heal-webhook`, and a read-only `status`/`diag` that NEVER
   returns the token.
6. **Supervisor:** start a loop in a startup hook (initial delay so the app is
   healthy first), cancel it via an `asyncio.Event` on shutdown.
7. **Commands to ship first:** `/ping` (proves the webhook is live), `/diag`
   (chat id + webhook info — your fastest debugging tool), `/help` with a
   persistent keyboard, then your domain commands.
8. **Test without a network:** monkeypatch the DB-touching helpers and capture the
   async `send`; assert routing + message shape. Self-heal is testable by
   monkeypatching `getWebhookInfo` to return matching vs drifted URLs.

## 🔗 References
- منبع اولیه: ported pattern from a sibling project's oversight bot; re-implemented
  generically for a tasks/notifications domain.
- مرتبط: notification fan-out (`send_telegram` delegating to the shared seam).

## Update 2026-06-28 — Multimodal "compose": media burst → one analysed task

Extended the bot from text-only to a **compose** pipeline: a burst of voice /
photo / document / video / text messages becomes ONE AI-analysed task.

**Pattern (project-agnostic):**
1. **Detect + buffer in order.** A `detect_media(message)` maps Telegram's
   `voice/audio/photo[-largest]/document/video/video_note/animation` onto a
   descriptor; everything is appended to a per-chat, TTL'd buffer with a 1-based
   `order` (first-ness == priority). Plain text while a buffer is open is added
   as a text item; **commands and keyboard taps are NOT swallowed** (check them
   before routing to compose). A live status message is edited in place as items
   arrive (needs the send call to return `message_id` + an `editMessageText`).
2. **Download lazily at submit,** not on arrival — `getFile → file_path →
   /file/bot<token>/<path>` (20MB Bot-API cap).
3. **Analyse per type via ONE multimodal gateway.** Route images/PDF/audio/video
   to a vision/documents model. If your gateway resolves the model **by
   capability** (need="vision"/"documents"), that IS "activate the vision model
   when needed" — no manual model-toggling machinery required (the reference
   project temp-activates a model; capability-routing is strictly simpler).
   Audio/video transcribe only when the resolved model is audio-capable (e.g.
   Gemini passes any mime as inline_data); otherwise the item degrades to a
   labelled placeholder. Concatenate the per-item extractions IN ORDER.
4. **Structure with a text model** → strict JSON `{title, description, priority,
   target: task|list, list_name, due_date}`, then create the row (route to a list
   when one matches by name, else a plain task).

**New pitfalls:**
- **Inject the bot into `submit()`** (default to the singleton) or you can't
  capture sends in tests — the pipeline otherwise grabs the global instance.
- **Fallback title must skip section headers.** When AI is unavailable you build
  the task from the raw concatenation — derive the title from the first line that
  is NOT a `## attachment N` header / `[not analysed]` placeholder, or the title
  becomes a header.
- **Download at submit, not arrival** — users often send 5 files fast; downloading
  eagerly wastes bandwidth on items they then cancel, and holds bytes in memory
  for the whole TTL.
- **Test the create step with a StaticPool in-memory SQLite** — the pipeline opens
  its OWN sessions (not the request session), so a per-request `:memory:` DB is
  invisible to it; StaticPool (single shared connection) fixes that.
