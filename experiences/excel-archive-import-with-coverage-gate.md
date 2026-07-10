---
title: "Importing a legacy multi-sheet Excel archive with a machine-checked completeness gate"
tags: ["excel", "import", "seed", "data-migration", "openpyxl", "idempotent"]
topic_canonical: "excel-archive-import-with-coverage-gate"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-10T00:00:00Z"
created_at: "2026-07-10T00:00:00Z"
updated_at: "2026-07-10T00:00:00Z"
merged_from: []
---

# Importing a legacy multi-sheet Excel archive with a machine-checked completeness gate

## 🎯 چالش / Challenge

A user hands you a years-old personal Excel workbook — many sheets, mixed
layouts (side-by-side tables, dated journal blocks, scratch notes, expense
ledgers, long free-text reviews) — and requires that **every piece of content**
be moved into the app's proper sections, with **zero loss or truncation**, and
that missing sections be created. Hand-copying ~1,300 rows is guaranteed to
drop cells; a naive column importer mangles multi-table sheets; and you cannot
reach the production DB directly (ephemeral deploys).

## 💡 راه‌حل / Solution

Three-part pipeline, each part independently verifiable:

1. **Generator with a coverage gate.** A committed script reads the workbook
   with explicit per-sheet extraction rules. Every cell access goes through a
   `take(row, col)` that records the cell as *consumed*. After extraction, the
   script scans ALL non-empty cells and **refuses to emit output if any cell
   was not consumed** — completeness becomes a machine property, not a promise.
   Structural cells (pure row-numbering, column headers) are consumed
   explicitly as metadata so they can't hide real content.

2. **Generated seed module, committed.** The output is a plain-data Python
   module (lists/items + finance transactions) with **pinned counts**
   (`EXPECTED_LIST_COUNT` …) baked in. Regeneration must be byte-stable; tests
   pin the totals so a regressed regeneration fails loudly.

3. **Idempotent startup seeder.** A small service inserts the data on boot —
   skip any list that already has items, create the archive finance account
   only once — so the content reaches the production DB via a normal deploy,
   and repeated boots are no-ops (same pattern as the app's other seeds).

## 🧪 نمونه کد (Anonymized)

```python
class Sheet:
    def __init__(self, ws):
        self.ws, self.consumed = ws, set()
    def take(self, r, c):                    # every read marks consumption
        self.consumed.add((r, c))
        v = self.ws.cell(row=r, column=c).value
        return "" if v is None else str(v).strip()
    def unconsumed(self):
        return [(r, c) for r in range(1, self.ws.max_row + 1)
                       for c in range(1, self.ws.max_column + 1)
                if self._has(r, c) and (r, c) not in self.consumed]

# ... per-sheet rules build lists/transactions via sh.take(...) only ...

problems = [x for sh in sheets for x in sh.unconsumed()]
if problems:
    print("UNCONSUMED CELLS — generation refused:", problems)
    sys.exit(1)                              # the completeness gate

# runtime seeder (idempotent):
async def ensure_seeded(db):
    for spec in LISTS:
        lst = await get_by_name(db, spec["name"])
        if lst is not None and await count_items(db, lst.id):
            continue                          # already seeded → no-op
        ...create list + ordered items...
    if not await account_exists(db, ACCOUNT_NAME):
        ...create archive account + all transactions...
    await db.commit()
```

## ⚠️ نکات حیاتی / Pitfalls

- **Multi-table sheets**: one sheet often holds 2+ unrelated tables side by
  side (e.g. bad-habits cols 2-9 next to daily-habits cols 12-15). Column
  census first (`col → populated row-ranges`) — never assume one table/sheet.
- **Row-numbering columns** (1..N pre-filled, mostly empty rows): consume the
  numbers as *structure*, emit items only when the content column is non-empty
  — otherwise you seed dozens of empty rows or fail the gate.
- **Merged/side annotations**: stray cells in adjacent columns (a margin note,
  an "انجام شد" flag, a date tag) belong to their row's item `description`, not
  to a separate list. Handle them per-row or the gate exposes them.
- **Ledger months without a title row**: infer the period from the surrounding
  headers and give per-row dates a month-start fallback — a transaction model
  usually needs a timestamp.
- **Old balance snapshots**: do NOT seed them as live accounts — stale balances
  corrupt the user's current finance view. Archive them as list items instead.
- **Long free-text cells (multi-KB)** survive only if every storage column on
  the path is `Text`; add a not-truncated test (`len(desc) > 3000`).
- **Use `data_only=True`** in openpyxl or formula cells yield formulas, not
  values; datetime cells need explicit ISO conversion.
- Don't commit the source workbook (personal data); the generated module IS
  the archived content, and the committed generator makes re-import cheap.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. Column-census every sheet programmatically; read only ambiguous regions by
   hand to write the rules.
2. Write per-sheet rules against a consumption-tracking wrapper; end with the
   refuse-if-unconsumed gate.
3. Emit a committed plain-data module with pinned totals; assert regeneration
   is byte-stable.
4. Seed idempotently at startup (skip-if-populated per collection; created-once
   markers for singletons) so production gets the data via a normal deploy.
5. Pin the totals in tests + spot-check order and the longest text; a future
   regeneration that loses content then fails CI, not the user.

## 🔗 References
- مرتبط: [registry-driven-import-engine] (the app's general import surface)

## Update 2026-07-10 — Word documents (.doc/.docx) + exact-duplicate-only merge

Extending the pattern to legacy Word files (a memoir in 3 overlapping .doc
revisions + a long goals document):

- **Extractor quality is a correctness issue, not a convenience.** Compare
  extractors on *normalized* content before trusting one: here `catdoc`
  produced mojibake AND silently dropped a whole dated section that `antiword
  -m UTF-8` preserved; LibreOffice headless failed outright (writer filters not
  installed — `libreoffice-core` alone cannot convert). Always diff two
  extractions (`re.sub(r"\s+", "", text)`) and keep the superset.
- **Check for byte-identical files first** (md5 of extracted text): two of the
  three "different" files were the same document — the real merge problem was
  2 revisions, not 3 files.
- **Exact-duplicate-only merge of revisions:** newest revision verbatim as the
  base; sentence-split the older one, keep every sentence whose normalized form
  is NOT a substring of the normalized base, and append those blocks under a
  clearly-marked appendix («ضمیمه — بخش‌های نسخهٔ قدیمی‌تر…»). Then a machine
  gate: every sentence of EVERY revision must appear verbatim in the merged
  output, or generation fails. Reworded passages survive as both variants —
  that is the requirement (only *exact* duplicates may be dropped).
- **Long-form documents need a WHOLE-document home,** not list items. If the
  app only has item-shaped storage, build a writings section (title/category/
  body-Text/source_note/written_at): items scatter a memoir; a reader page
  with `whitespace-pre-wrap` keeps it intact. Record merge provenance in a
  `source_note` column so future-you knows what was merged and why.
- **Seed idempotency by title** (skip-if-exists) — not delete-and-recreate — so
  the user's later in-app edits survive every redeploy.
