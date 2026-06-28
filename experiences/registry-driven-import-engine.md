---
title: "موتور ایمپورت رجیستری‌محور: صفحه‌گسترده + استخراج با AI — Registry-driven import engine"
tags: ["import", "csv", "xlsx", "etl", "fastapi", "ai-extraction"]
topic_canonical: "registry-driven-import-engine"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-06-28T00:00:00Z"
created_at: "2026-06-28T00:00:00Z"
updated_at: "2026-06-28T00:00:00Z"
merged_from: []
---

# Registry-driven import engine (spreadsheet bulk + AI document)

## 🎯 چالش / Challenge

می‌خواهیم کاربر بتواند داده را هم از فایل صفحه‌گسترده (CSV/XLSX/JSON) و هم از سند نامرتب
(PDF/تصویر) به چند نوع موجودیت مختلف وارد کند، با پیش‌نمایش امن (dry-run)، جلوگیری از تکرار
(idempotent)، و گزارش خطای ردیف‌به‌ردیف — بدون نوشتن کد جدا برای هر موجودیت.

## 💡 راه‌حل / Solution

یک **رجیستری مقصدها** + یک **هسته‌ی واحد persist**:

- `IMPORT_TARGETS[target] = {columns, build(row,user)->model, dedup_key(row)}`. افزودن یک
  موجودیت جدید = افزودن یک ورودی به رجیستری (نه یک endpoint جدید).
- `parse_table(bytes, filename)` بر اساس پسوند به CSV/XLSX/JSON تقسیم می‌شود (openpyxl را
  lazy وارد کن تا نبودش فقط XLSX را از کار بیندازد نه کل ایمپورت).
- `import_rows(db, target, rows, dry_run)`: کلیدهای طبیعیِ موجودِ کاربر را یک‌بار می‌خواند،
  هر ردیف را build+validate می‌کند، تکراری‌ها (در DB و داخل فایل) را skip می‌کند، خطاها را با
  شماره‌ی ردیف جمع می‌کند، و فقط وقتی `dry_run=False` است `add_all`+commit می‌کند. خروجی:
  `{total_rows, created, would_create, skipped_existing, errors[]}`.
- **دو مسیر، یک هسته:** مسیر صفحه‌گسترده مستقیم `import_rows` را صدا می‌زند؛ مسیر AI ابتدا با
  مدل (multimodal برای PDF/تصویر، متنی برای بقیه) ردیف‌های JSON را استخراج می‌کند، بعد همان
  `import_rows`. چون LLM کند است، مسیر AI به‌صورت **job ناهمزمان** اجرا می‌شود و فرانت poll می‌کند.

## 🧪 نمونه کد (Anonymized)

```python
async def import_rows(db, target, rows, *, user_id, dry_run=False):
    spec = REGISTRY[target]; Model = spec["model"]; key = spec["dedup_key"]
    existing = {norm(v) for v in await scalars(select(getattr(Model, spec["attr"]))
                                              .where(Model.user_id == user_id))}
    seen, created, skipped, errors, to_add = set(), 0, 0, [], []
    for i, row in enumerate(rows, start=2):           # row 1 = header
        k = key(row)
        if k and (norm(k) in existing or norm(k) in seen): skipped += 1; continue
        try: obj = spec["build"](row, user_id)
        except ValueError as e: errors.append({"row": i, "error": str(e)}); continue
        if k: seen.add(norm(k))
        to_add.append(obj); created += 1
    if not dry_run and to_add: db.add_all(to_add); await db.commit()
    return {"total_rows": len(rows), "created": 0 if dry_run else created,
            "would_create": created, "skipped_existing": skipped, "errors": errors}
```

## ⚠️ نکات حیاتی / Pitfalls

- **dry-run را واقعی نگه دار:** هرگز قبل از commit چیزی ننویس؛ همان منطق را با شاخه‌ی dry_run
  اجرا کن تا پیش‌نمایش دقیقاً برابر اجرای واقعی باشد.
- **dedup هم در DB و هم داخل خود فایل:** وگرنه ردیف‌های تکراریِ یک فایل دوبار وارد می‌شوند.
- **خطای ردیف کل ایمپورت را نکُشد:** خطا را با شماره‌ی ردیف جمع کن و ردیف‌های سالم را وارد کن.
- **job ناهمزمان و session:** پردازش پس‌زمینه session مستقل (factory) می‌گیرد؛ در تست‌های
  in-memory که session درخواست ≠ session پس‌زمینه است، هسته‌ی استخراج+persist را مستقیم
  unit-test کن (مدل را monkeypatch کن) به‌جای تست HTTP سرتاسری.
- **وابستگی سنگین را lazy وارد کن** (openpyxl) تا نبودنش فقط یک فرمت را غیرفعال کند.
- **پارسر JSON مدل را بردبار بنویس:** code-fenceها و متن اضافی را تحمل کند (اولین `[...]` را بردار).

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. یک رجیستری `target → {columns, build, dedup_key}` بساز؛ موجودیت‌های user-scoped و
   بدون وابستگی FK را اول هدف بگیر.
2. `parse_table` چندفرمتی با تشخیص پسوند + lazy-import برای XLSX.
3. هسته‌ی `import_rows` با dry-run + dedup + جمع‌آوری خطا.
4. endpointها: `targets`, `{target}/template` (CSV)، `POST {target}?dry_run=`, و برای AI:
   `analyze` (job) + `jobs/{id}` (poll) + `ai-models` (مدل‌های capable).
5. مسیر AI = استخراج ردیف‌های JSON (multimodal/متنی) → همان `import_rows`.
6. UI: انتخاب مقصد، dry-run preview، ثبت نهایی، و تاریخچه‌ی job.

## 🔗 References
- Source: Lifemanager task — porting ALLIN1's import feature (docs/overhaul/AUDIT_LOG.md, 2026-06-28).
- Related: `pluggable-ai-provider-catalog-and-router` (the AI gateway the AI path calls).
