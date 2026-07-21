---
title: "Soft-delete/merge is only done when every read path filters the tombstone"
tags: ["data-hygiene", "soft-delete", "merge", "dedup", "idempotency", "list-endpoints"]
topic_canonical: "soft-delete-tombstone-must-filter-every-read-path"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-21T00:00:00Z"
created_at: "2026-07-21T00:00:00Z"
updated_at: "2026-07-21T00:00:00Z"
merged_from: []
---

# Soft-delete/merge is only done when every read path filters the tombstone

## 🎯 چالش / Challenge

A "quarantine, don't hard-delete" policy is the right default: a dedup/merge
tool folds a duplicate into a survivor by **marking** the loser
(`merged_into_id = survivor`, or `is_active = False`, or `is_archived = True`)
rather than deleting the row, so the merge stays reversible.

But there's a silent trap: **if even one read path forgets to filter the
tombstone, the merge looks like a no-op.** The user runs "merge", the tool
reports success, and the duplicate is *still on screen* next to the survivor —
because the list endpoint never learned that a marked row is "gone". The tool
gets blamed as broken when the write side was actually correct; only the read
side was incomplete. The same class of bug hides duplicates the *user* keeps
creating (double-submit, re-dictation), because the create path has no guard.

## 💡 راه‌حل / Solution

Treat a soft-delete marker as a **read invariant**, not just a write action:

1. **Filter the tombstone on EVERY list/collection read**, using an operator
   that hides *only* an explicit mark and keeps legacy/NULL rows visible:
   - boolean flag: `WHERE is_active IS NOT False` (NULL stays visible — a
     pre-migration row was never merged, so it must not vanish).
   - self-reference merge pointer: `WHERE merged_into_id IS NULL`.
   Do NOT use `== True` for the flag — that also hides legacy NULL rows and
   silently drops data (violates "nothing disappears").
2. **Close the create path at the root** so new duplicates never form:
   - server-side **idempotent create**: pre-insert lookup on the natural key
     (owner + name); return the existing active row instead of inserting a
     second one.
   - client-side **synchronous in-flight guard**: a `useRef(false)` flipped
     *before* the await — framework state (`useState`) updates a render tick
     late, so a fast double-click fires two POSTs before the button disables.
3. **Widen dedup-candidate queries to closed/finished rows.** A "find
   duplicates before creating" step that only looks at *open* items will
   happily re-create something you already finished. Include done/cancelled
   states in the *keyword-match* branch (but keep the *recent fallback* narrow
   so context isn't flooded), and exclude already-merged rows so a tombstone
   can't re-surface as a match.
4. **Make the tool discoverable.** A correct-but-buried tool is a missing
   tool. Surface it as a first-class nav entry, not a sub-tab.
5. **Don't add the UNIQUE constraint until existing dupes are cleaned.** A
   `UNIQUE(owner, name)` index fails to apply while duplicate rows still
   exist. Order: filter reads → clean via the (now-effective) UI tool →
   *then* add the constraint.

## 🧪 نمونه کد (Anonymized)

```python
# READ: hide only explicit tombstones, keep legacy NULLs
q = select(Project).where(owner_scope(uid), Project.is_active.isnot(False))
q = select(Task).where(Task.user_id == uid, Task.merged_into_id.is_(None))

# CREATE: idempotent by natural key (root-cause fix for duplicates)
existing = (await db.execute(
    select(Project).where(
        Project.user_id == owner,
        Project.name == clean_name,
        Project.is_active.isnot(False),
    )
)).scalars().first()
if existing is not None:
    return serialize(existing)          # reuse, never insert a second row
```

```jsx
// CLIENT: synchronous guard beats the async state flag
const submitting = useRef(false);
async function handleAdd(e) {
  e.preventDefault();
  if (submitting.current) return;       // blocks the 2nd click instantly
  submitting.current = true;
  try { /* POST ... */ }
  finally { submitting.current = false; }
}
```

```python
# DEDUP CANDIDATES: match finished rows too, exclude tombstones
matched = select(Task.id, Task.title).where(
    owner_scope(uid),
    Task.merged_into_id.is_(None),                 # no resurrected merges
    or_(*[Task.title.ilike(f"%{k}%") for k in kws]) # ANY status, incl. done
)
```

## ⚠️ نکات حیاتی / Pitfalls

- **`== True` vs `IS NOT False`.** With a nullable boolean, `== True` drops
  NULL rows. Only `IS NOT False` (or `flag.isnot(False)` in SQLAlchemy) hides
  *just* the explicitly-marked rows. In SQL three-valued logic `NULL IS NOT
  False` → TRUE, and this holds on SQLite (0/1) too.
- **Single-GET can stay unfiltered.** Hiding a tombstone from *lists* is
  enough; a direct `GET /x/{id}` on a merged row is harmless (and lets an
  "undo" flow still fetch it).
- **The write side is usually already correct.** Resist "the merge tool is
  broken" — grep every SELECT that feeds a list before touching the merger.
- **Idempotent create returns 201 with an existing row.** Slightly odd
  semantically but harmless; clients only need the row. Don't 409 — that
  breaks the double-submit UX you're trying to smooth.
- **Order matters for the constraint.** Adding `UNIQUE` first will crash the
  migration on legacy dupes; clean, then constrain.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

Generic checklist when you adopt "soft-delete / soft-merge, don't hard-delete":

1. Enumerate **every** query that returns a collection of the entity (lists,
   search, counts, export, dedup candidates, AI context gatherers). Add the
   tombstone filter to each — a grep for `select(Entity)` is the audit.
2. Use `IS NOT False` / `IS NULL`-style filters so legacy rows survive.
3. Add a root-cause guard on the create path: idempotent server insert +
   synchronous client in-flight ref.
4. Make dedup-candidate queries span *finished* states, exclude tombstones.
5. Surface the merge/cleanup tool in primary nav.
6. Defer any `UNIQUE` constraint until existing duplicates are cleaned via the
   (now-effective) tool.
7. Add regression tests that plant a tombstoned row directly in the DB and
   assert the list endpoint hides it while a legacy/NULL row stays visible.

## 🔗 References

- مرتبط: `idempotent-seeding-vs-user-edits`,
  `periodic-attention-engine-cooldown-dedup`,
  `content-to-daily-directive-internalization-engine`
- الگوی «قرنطینه نه حذف»: CLAUDE.md rule 2
