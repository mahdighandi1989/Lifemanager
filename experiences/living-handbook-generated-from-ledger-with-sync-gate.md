---
title: "Living handbook — one source on GitHub and in the app, chart and TOC generated from a ledger, drift fails the merge gate"
tags: ["documentation", "handbook", "progress-chart", "ci-gate", "markdown", "mermaid", "agents"]
topic_canonical: "living-handbook-generated-from-ledger-with-sync-gate"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-11T00:00:00Z"
created_at: "2026-10-11T00:00:00Z"
updated_at: "2026-10-11T00:00:00Z"
merged_from: []
---

# Living handbook with a generated progress chart and a sync gate

## 🎯 چالش / Challenge
مالک می‌خواهد برای یک بخشِ سامانه «جزوه»ای داشته باشد که: فلسفه، نقشهٔ اجزا و طرزِ استفاده را بگوید؛ هر تغییر را ثبت کند؛
نمودارِ پیشرفت/پسرفت داشته باشد؛ فهرست داشته باشد؛ هم در GitHub و هم **داخلِ برنامه** دیده شود و این دو همیشه یکی باشند؛ و هر
نشست/ایجنتِ بعدی بداند چطور نگهش دارد. در دو پروژهٔ الگو همین جزوه‌ها با دست نگه داشته می‌شدند و **رانش کردند**: نمودار از دفترِ
پیشرفت عقب افتاد، شماره‌ها تکراری شدند، سطرها ستونِ کم داشتند، تاریخِ «به‌روزرسانی» کهنه ماند — چون هیچ چیز آن را نمی‌سنجید.

## 💡 راه‌حل / Solution
1. **سه سند، سه نقش:** `HANDBOOK.md` (چرا/چطور/تصمیم‌ها/کارهای باز)، `PROGRESS.md` (یک سطر برای هر رویدادِ روند با جهت ▲▼↩●،
   سنجه‌های وضعیت و ارجاع به دفترِ کار)، `WORKLOG.md` (بخش‌های نوع‌دار، append-only، **سطرِ آخرِ هر بخش امضا**).
2. **زنجیرهٔ مدرک:** نقطهٔ نمودار ⇐ سطرِ PROGRESS ⇐ بخشِ WORKLOG. سطرِ بی‌ارجاع یا ارجاع به بخشِ ناموجود = خطا.
3. **هرچه می‌تواند رانش کند، تولید می‌شود:** فهرست (از عنوان‌های `##` با slug ِ GitHub) و نمودارِ mermaid (از PROGRESS) بینِ
   نشانگرهای `<!-- …:BEGIN -->/<!-- …:END -->` بازنویسی می‌شوند؛ دست به آن‌ها نمی‌خورد.
4. **یک تجزیه‌گر، سه مصرف‌کننده:** همان ماژولِ پایتون (الف) بلوک‌ها را می‌سازد، (ب) `progress.json` برای نمودارِ بومیِ داخلِ برنامه
   می‌نویسد، (ج) در دروازه بررسی می‌کند. هیچ دو کدی یک قاعده را جدا پیاده نمی‌کنند — جز slug که در فرانت هم لازم است و یک تست
   برابریِ دو پیاده‌سازی را روی همهٔ عنوان‌های واقعی می‌سنجد.
5. **رساندن به برنامه بدونِ خواندنِ ریپو در زمانِ اجرا:** اسکریپتِ ساخت اسناد را با **نامِ هش‌دار** در `public/` کپی و در یک
   مانیفستِ تولیدی نام می‌برد (بی‌کشِ کهنه؛ و کار می‌کند حتی اگر `docs/` از تصویرِ Docker بیرون باشد).
6. **دروازه در همان آزمونِ ادغام:** `build.py --check` همه‌چیز را در حافظه می‌سازد و با دیسک مقایسه می‌کند (فایلِ جامانده، فایلِ
   کهنه، فایلِ اضافه) + قواعدِ دفترها. یک تستِ جدا ثابت می‌کند خودِ دروازه رانش را **می‌گیرد** (سطرِ بی‌سند، شمارهٔ پرشی، بی‌امضا،
   نمودارِ کهنه، پیوندِ شکسته) — گیتی که نمی‌تواند قرمز شود گیت نیست.
7. **نمایشگرِ داخلِ برنامه:** markdown + mermaid ِ تنبل‌بار؛ idها = anchor ِ GitHub؛ هر `##` در یک بخش با شناسهٔ همان anchor
   (برای ابزارِ «گزارش روی همین‌جا»/inspection) و نشانیِ `?doc=X#anchor` که دقیقاً همان‌جا را باز می‌کند؛ پیوندِ `X.md` بینِ اسناد
   داخلِ برنامه می‌ماند و بقیهٔ پیوندهای نسبی به GitHub می‌روند.
8. **تاریخچهٔ پیش از دفتر:** از رونوشتِ کار بازسازی کن، با برچسبِ «بازسازی‌شده» و ارجاعِ خط‌به‌خط؛ عددی که آن موقع اندازه گرفته
   نشده را ننویس. پسرفت‌ها (شکایتِ بجا، طراحیِ غلط، ادعای «تأیید» که بعداً دوری درآمد) را هم سطر کن — نمودارِ بی‌پسرفت دروغ است.

## 🧪 نمونه کد (Anonymized)
```python
def validate(handbook, progress, worklog):
    rows, problems = parse_progress(progress)            # header, 1..N, dates, ▲▼↩●, numeric metrics, WORKLOG (n)
    entries, p2 = parse_worklog(worklog); problems += p2  # "## YYYY-MM-DD (n) — title", 1..N, signature last
    problems += [f"cites missing WORKLOG ({r})" for row in rows for r in row["refs"] if r not in entries]
    problems += check_anchors(handbook)                   # every (#anchor) resolves with GitHub slug rules
    if regenerate(handbook, rows) != handbook: problems.append("TOC/chart stale — run build")
    return rows, entries, problems
```

## ⚠️ نکات حیاتی / Pitfalls
- slug ِ GitHub برای فارسی: نیم‌فاصله (ZWNJ، دستهٔ Cf) حذف می‌شود، کسره/همزه (Mn) می‌ماند، «—» حذف و دو فاصلهٔ کنارش دو خط‌تیره
  می‌شود. فرانت و دروازه را با یک تستِ برابری روی عنوان‌های واقعی قفل کن.
- `import './x'` ِ بی‌پسوند در Vite کار می‌کند ولی در Node ِ ESM نه؛ اگر تستی ماژولِ فرانت را با node وارد می‌کند، پسوند `.js` بنویس.
- mermaid بعد از رندر ارتفاعِ صفحه را عوض می‌کند: پرش به anchor را **بعد از** رندرِ نمودارها تکرار کن و `scroll-margin-top` بده
  (سرآیندِ چسبان).
- امتیازِ جهت را طوری بگذار که «خراب شد و همان‌جا درست شد» (▼↩) صفر شود؛ وگرنه نمودار اصلاح را پسرفت نشان می‌دهد.
- محتوای سند فقط از ریپو؛ اگر روزی ورودیِ کاربر وارد شد، HTML ِ markdown را sanitize کن.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] پوشهٔ محدود برای آن بخش: `src/` + `build.py` + `docs/{HANDBOOK,PROGRESS,WORKLOG}.md` + `AGENTS.md`
- [ ] قالب‌های سخت‌گیر و قابلِ‌تجزیه برای PROGRESS و WORKLOG (با امضا)
- [ ] فهرست و نمودار بینِ نشانگرها، تولیدی
- [ ] یک ماژولِ تجزیه/اعتبارسنجی؛ `--check` در آزمونِ ادغام + تستِ «دروازه قرمز می‌شود»
- [ ] کپیِ هش‌دارِ اسناد در دارایی‌های فرانت + مانیفستِ تولیدی
- [ ] نمایشگرِ داخلِ برنامه با anchor ِ GitHub، بخش‌های قابلِ‌نشانی برای inspection، نمودارِ بومی از JSON
- [ ] اشاره در CLAUDE.md و دستورِ روتین‌های ناظر به `AGENTS.md` ِ همان پوشه

## 🔗 References
- مرتبط: mount-standalone-app-natively-instead-of-iframe, tests-that-cannot-fail-the-red-baseline, owner-inspection-loop-with-supervisor-routines
