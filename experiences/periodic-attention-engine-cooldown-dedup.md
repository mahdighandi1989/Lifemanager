---
title: "موتور توجه دوره‌ای با dedup مبتنی بر cooldown — Periodic attention engine with cooldown dedup"
tags: ["scheduler", "reminders", "notifications", "dedup", "asyncio", "fastapi", "timezone"]
topic_canonical: "periodic-attention-engine-cooldown-dedup"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-18T00:00:00Z"
created_at: "2026-07-18T00:00:00Z"
updated_at: "2026-07-18T00:00:00Z"
merged_from: []
---

# Periodic attention engine with cooldown dedup

## 🎯 چالش / Challenge

اپی چند-ماژوله پر از «تاریخ» است (ددلاین کار، انقضای مدرک، موعد پرداخت اشتراک،
آیتم‌های رسیدگی‌نشده) ولی هیچ‌کس سراغ کاربر نمی‌رود — کاربر باید خودش یادش باشد هر
صفحه را چک کند. می‌خواهیم یک موتور پس‌زمینه که دوره‌ای همهٔ ماژول‌ها را اسکن کند و
هشدار بفرستد (درون‌برنامه + پیام‌رسان)، **بدون** این‌که: (الف) هر ۱۰ دقیقه همان
هشدار تکرار شود، (ب) یک جدول خراب کل اسکن را بخواباند، (ج) به worker/broker جدا
نیاز باشد، و (د) «یک‌بار در روزِ» پیام صبحگاهی به‌خاطر UTC بودن سرور در ساعت غلط
محلی بیفتد.

## 💡 راه‌حل / Solution

1. **قوانین = توابع کوچکِ جدا-شکست.** هر rule فقط از ستون‌هایی که واقعاً وجود
   دارند می‌خواند و در try/except خودش است — خروجی همه هم‌شکل:
   `{rule, entity_id, label, detail, date, priority}`. تاریخ‌های رشته‌ایِ
   «همان‌طور که روی کارت نوشته» (مثل "14 Aug 2027") با یک parser چند-فرمتی
   best-effort خوانده می‌شوند؛ نامعلوم ⇒ skip، نه crash.

2. **Dedup با «جدول علامت» + cooldown per-rule.** جدول کوچک
   `marks(dedup_key unique-ish, rule, last_sent_at)` با کلید `{rule}:{entity_id}`.
   قبل از ارسال: علامت‌های موجود را بخوان؛ فقط یافته‌هایی که علامت ندارند یا
   cooldownشان گذشته «تازه»اند. بعد از ارسال: upsert. نتیجه: کار عقب‌افتاده روزانه
   nag می‌شود، سند در حال انقضا هفتگی؛ و موجودیتِ *جدید* بلافاصله هشدار می‌گیرد حتی
   وقتی بقیه در cooldownاند. (Dedup روی وضعیت ارسال است نه روی یافته — اسکنِ خشک
   همیشه همهٔ یافته‌ها را برمی‌گرداند تا UI وضعیت کامل را نشان دهد.)

3. **تجمیع per-rule، نه پیام per-entity.** ده کار عقب‌افتاده = یک پیام با لیست
   گلوله‌ای (سقف نمایش + «و N مورد دیگر»)، نه ده پیام. کانال‌ها را از رجیستری
   رویدادِ سیستم اعلانِ موجود بگیر تا ترجیحات کاربر (خاموش/روشن per-event) رایگان
   اعمال شود.

4. **تصمیم‌های زمانی = توابع خالص با ساعت محلی.** سرور UTC است؛ کاربر جای دیگر.
   یک `tz_offset_minutes` در تنظیمات، و توابع خالص
   `brief_decision(cfg, now_utc)` / `review_decision(cfg, now_utc)` که local را
   حساب می‌کنند و با «تاریخِ محلیِ آخرین ارسال» یک‌بار-در-روز/هفته را تضمین
   می‌کنند. خالص بودن ⇒ تست ماتریسی بدون حلقه و بدون sleep.

5. **یک loop برای همه.** `tick(db, now)` = اسکن-روی-interval + brief + weekly؛
   `loop(stop_event)` با تأخیر اولیه (تا تست‌ها/بوت تداخل نکنند)، cadence ثابت،
   fail-open per cycle؛ start/stop در startup/shutdown اپ با stop_event و
   `wait_for(timeout=...)`. تنظیمات و stampها (last_scan_at, last_brief_date) در
   یک key/value JSON blob — نه فایل (hostهای ephemeral پاکش می‌کنند).

## 🧪 نمونه کد (Anonymized)

```python
def brief_decision(cfg, now_utc):                    # PURE — matrix-testable
    if not cfg.get("brief_enabled", True): return False
    local = now_utc + timedelta(minutes=cfg.get("tz_offset_minutes", 0))
    if local.hour < cfg.get("brief_hour", 7): return False
    return cfg.get("last_brief_date") != local.date().isoformat()

async def send_alerts(db, now):
    findings = await scan_findings(db, now)          # dry scan: ALL findings
    fresh = await filter_by_marks(db, findings, now) # cooldown per rule
    for rule, items in group(fresh).items():
        await notify_event("attention_alert", title=TITLES[rule],
                           message="\n".join(f"• {i['label']} — {i['detail']}" for i in items[:10]))
    await upsert_marks(db, fresh, now)

async def loop(stop_event):
    try:
        await asyncio.wait_for(stop_event.wait(), timeout=30); return  # boot grace
    except asyncio.TimeoutError: pass
    while not stop_event.is_set():
        try:
            async with SessionLocal() as s: await tick(s)
        except Exception: pass                        # fail-open per cycle
        try:
            await asyncio.wait_for(stop_event.wait(), timeout=600)
        except asyncio.TimeoutError: continue
```

## ⚠️ نکات حیاتی / Pitfalls

- **Dedup را روی «ارسال» بگذار نه «یافتن»:** اگر اسکن، یافته‌های در-cooldown را حذف
  کند، صفحهٔ وضعیت UI هم کور می‌شود. دو خروجی جدا: findings (همه) و fresh (قابل
  ارسال).
- **کلید dedup باید موجودیت-محور باشد** (`rule:entity_id`)، نه rule-محور — وگرنه
  یک هشدارِ رفته، هشدارِ موجودیت جدید را هم می‌خورد.
- **timestampهای naive قدیمی:** موقع خواندن last_sent_at از DB، tzinfo نداشته ⇒
  به UTC اجبار کن، وگرنه تفریق datetime می‌ترکد (همان درسی که حلقهٔ قبلی خورد).
- **تأخیر اولیهٔ loop (۳۰s):** بدون آن، TestClientها که startup را اجرا می‌کنند
  ممکن است در میانهٔ تست، اسکن واقعی و notification ناخواسته بسازند.
- **پیام‌های زمان‌بند خودشان تلگرام می‌فرستند ⇒ رویدادشان را in_app-only ثبت کن**،
  وگرنه fan-out رجیستری همان متن را دوبار می‌فرستد.
- **رشته‌تاریخ‌ها locale-حساسند:** `%d %b %Y` فقط با locale C انگلیسی جواب می‌دهد؛
  فرمت‌ها را صریح لیست کن و روی خطا skip کن.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. جدول marks + کلید `{rule}:{entity_id}` + جدول/blob تنظیمات با stampها بساز.
2. هر منبع تاریخ‌دار را یک rule-تابعِ fail-open کن با خروجی هم‌شکل.
3. cooldown per rule تعریف کن (روزانه برای فوری‌ها، هفتگی برای دوردست‌ها).
4. ارسال را از مسیر سیستم اعلان موجود (با رجیستری/ترجیحات) عبور بده و per-rule
   تجمیع کن.
5. تصمیم‌های «یک‌بار در روز/هفته» را توابع خالص با tz_offset کن و ماتریسی تست کن.
6. یک loop با initial-grace + stop_event در lifecycle اپ ثبت کن؛ هر tick را
   مستقلاً fail-open نگه دار.

## 🔗 References

- الگوی خواهر: [universal-capture-inbox-with-ai-triage] (صندوق ورودی که این موتور به آن nag می‌زند)
- الگوی خواهر: [notification-channel-event-preferences] (مسیر ارسال + ترجیحات)
- الگوی خواهر: [bidirectional-telegram-bot-webhook] (send seam و fail-open بدون توکن)

## Update 2026-07-22 — value-filter + batch-digest for machine-generated alerts

A locked-file detector proved that cooldown/dedup alone isn't enough — an
auto-ingest pipeline flooded the owner with 106 unread notifications and dozens
of "enter password" cards, one per file, most for worthless boilerplate. The
noise came from four missing guards. The reusable rule for ANY system that
turns detected items into user-facing alerts:

1. **Value-filter BEFORE you alert.** Not every detected item deserves a prompt.
   Classify by cheap metadata (filename/sender) into worth-acting vs boilerplate
   with an ALLOW-list that overrides the DENY-list (`_FINANCIAL_RE` wins over
   `_BOILERPLATE_RE`), so a genuine "Statement of Terms" still flows while
   "Terms and Conditions" is dropped silently — no row, no push.
2. **Batch the push, not the record.** Keep creating the per-item record (the
   inbox row stays), but hoist the NOTIFICATION out of the per-item loop to the
   batch caller: one digest ("N files waiting: •a •b …") per run, not N pushes.
3. **Durable cooldown, never in-process.** The digest fires at most once per
   window using a timestamp in a settings/GlobalSetting row — an in-process
   timer resets on every free-tier restart and the flood resumes.
4. **Dedup across ALL statuses + retroactive purge.** Dedup the "already
   proposed" check on the source key across pending|filed|dismissed (pending-only
   lets dismissed items resurface every re-scan). Ship a reversible retroactive
   cleanup (soft-delete/dismiss) AND run it as an idempotent startup one-shot, so
   the EXISTING backlog clears without the owner hunting for a button — plus a
   bulk `mark_all_read` for the notification pile (mark read, never delete).

Pitfall: an auto-purge that runs on startup must match EXACTLY (whole value ==
a test token), never substring, or it silently deletes legitimate rows on every
deploy. Substring/ambiguous matches belong in the manual, explicitly-confirmed
tool only.
