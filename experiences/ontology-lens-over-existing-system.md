---
title: "Retrofit a worldview ontology as a READ-ONLY lens over an existing system (not a rebuild)"
tags: ["ontology", "taxonomy", "architecture", "classification", "scoring", "dashboard"]
topic_canonical: "ontology-lens-over-existing-system"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-22T00:00:00Z"
created_at: "2026-07-22T00:00:00Z"
updated_at: "2026-07-22T00:00:00Z"
merged_from: []
---

# Retrofit a worldview ontology as a read-only lens

## 🎯 چالش / Challenge

Deep into a project, the owner articulates the system's true organizing
principle — a worldview taxonomy (here: the human dimensions per Shia fiqh —
relations with God / self / others / environment) — and asks that EVERYTHING
already built (tasks, writings, emails, finance, people, documents, digital
clutter) be re-organized under it, with a live visual map, principled
(non-arbitrary) scoring, and automatic placement of anything added later.
The trap: treating this as a rebuild (new schemas, migrating every row,
re-tagging by hand) — months of churn, broken behavior, and another layer of
UI clutter.

## 💡 راه‌حل / Solution

Implement the ontology as a **read-only aggregation lens**, not a data model:

1. **Taxonomy as code, not schema.** Define the dimensions (`SAHATS`) and their
   metadata in one service module. No new tables, no columns on existing
   entities, no migration. Nothing already built changes behavior.
2. **Deterministic classification at read time.** Each entity type gets a rule:
   relational facts first (task linked to a person/project → "others"; a
   directive's domain field → its dimension), then keyword rules on titles,
   then an explicit default. Because classification happens at aggregation
   time, every NEW row anywhere classifies itself automatically — zero upkeep.
3. **Pin the owner's named backbone.** The owner named specific lists/writings
   as the "prayer-bead string" (نخ تسبیح) of dimensions — pin those by name
   substring with a `backbone` flag so they render as first-class progress
   threads, not generic rows.
4. **Principled weights from the worldview itself.** Scores must have اصالت:
   anchor the severity ladder in the worldview's own hierarchy (here the fiqhi
   مفسده ladder: obligations-to-others 5 > self-harm 4 > growth 3 > waste 1),
   and apply it to observable states (overdue owed work, expired documents,
   stalled backbone, clutter). **Never score intentions** — a machine judging
   نیت corrupts the practice it serves (and invites gamified spirituality);
   score deeds and follow-through only.
5. **One map page = the navigation hub.** Render one clean screen: a balance
   strip (one bar per dimension) + one card per dimension (score, progress,
   backbone threads, worst weighted attention items, links to that dimension's
   existing pages). The map becomes the menu for that area — anti-octopus:
   navigation flows map → dimension → page instead of a longer sidebar.
6. **Trend for free.** Persist a snapshot per refresh into an existing
   assessment/history table (type='<map>'), plus a daily job so the series
   fills without clicks.

## 🧪 نمونه کد (Anonymized)

```python
DIMENSIONS = {"god": {...}, "self_psyche": {...}, "others": {...}, "environment": {...}}
W_OWED, W_SELF_HARM, W_GROWTH, W_WASTE = 5, 4, 3, 1     # from the worldview, not invented

def classify_text(title, default="self_psyche"):
    for token, dim in BACKBONE_PINS:                     # owner-named threads first
        if token in title: return dim
    for dim, words in KEYWORDS:
        if any(w in title.lower() for w in words): return dim
    return default                                       # explicit, never "unclassified"

async def build_map(db, uid):
    cells = {k: empty() for k in DIMENSIONS}
    for t in await load_tasks(db, uid):
        dim = "others" if (t.linked_person or t.project_id) else classify_text(t.title)
        cells[dim].count(t)
        if overdue(t):
            cells[dim].attend(t.title, W_OWED if dim == "others" else W_GROWTH)
    ...                                                   # each source: read, bucket, weigh
    return score(cells)                                   # completion − capped weighted penalty
```

## ⚠️ نکات حیاتی / Pitfalls

- **Default must be explicit.** "Everything has a place" means the classifier
  NEVER returns unknown — pick a meaningful default (an unmarked personal task
  = a commitment to oneself) and document it.
- **Don't score the sacred.** If the worldview involves intention/spirituality,
  the numbers must measure follow-through, not devotion — say so in the UI, or
  the tool corrupts the practice it serves.
- **M2M links hide in association tables.** An item's list membership (or a
  task's people) may live in an M2M table, not an FK column — read the
  association table, or whole categories silently bucket to the default.
- **Penalty needs a cap.** Weighted attention items can swamp the completion
  signal; cap the total penalty or one bad week zeroes every score.
- **The map must REPLACE navigation, not add to it.** If the ontology page is
  added alongside the old menu, you've built another octopus arm. Put it at the
  head of its group and make its cards the links into the area.
- **Adding a taxonomy page trips page-inventory gates.** If the repo enforces a
  docs inventory of frontend pages, register the new page or CI fails.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. Encode the taxonomy + weights in ONE service module; resist new schema.
2. Write per-entity-type classification rules: relations → explicit fields →
   keywords → explicit default.
3. Pin owner-named backbone items by name with special rendering.
4. Derive the severity ladder from the worldview's own value hierarchy and
   apply it only to observable states.
5. One page: balance strip + per-dimension cards that double as navigation.
6. Snapshot per refresh into an existing history table + a daily job.

## 🔗 References
- مرتبط: `self-model-from-composed-analyzers` (the compose-don't-rebuild
  precedent + snapshot-for-history pattern), `holistic-island-audit-with-
  adversarial-verification` (mapping everything that exists before layering).

## Update 2026-07-22 — the owner audited the ontology: three corrections that generalize

The first deployed map drew an immediate domain-expert correction that exposed a
classification bug invisible to any test: a broker's margin-call email had been
weighted as "obligation to others" (حق‌الناس). The fixes are reusable rules:

1. **Weights need a TEST, not a category.** "Email needing action → obligation
   class" was surface-matching. Every severity class must be defined by a
   decidable question ("is another person's right involved?"), documented next
   to the constant, and the classifier must apply the question — here: sender
   is a real human awaiting a reply → obligation; automated alert about one's
   own account → self-harm(financial) class; other machine mail → waste. Reuse
   the codebase's existing human-vs-automated sender heuristic instead of
   inventing one.
2. **Dedup attention items by content key.** Five copies of the same alert
   rendered five weighted rows — dedup by subject/label before display, count
   the collapse.
3. **Threads registry = the accretion contract.** The owner's real ask behind
   "nothing may be lost" is *accretion*: new scattered content must self-attach
   to a named stream and become trackable with zero manual filing. A tiny
   registry (`THREADS`: key, dimension, title, match-tokens, link) checked at
   read time gives that: any new writing/list/goal naming a thread joins it
   instantly, and EMPTY threads still render — an honest gap beats a hidden
   hole. Adding a stream is one registry line.
4. **When the hub page proves itself, demote its children in the menu.** After
   the owner approved the map-as-hub, the seven scattered life links moved
   behind the "more" drawer (routes/testids intact, drawer auto-opens on their
   routes) — the map became the single door. Update the nav test to LOCK the
   new design, don't fight it.

## Update 2026-07-22 — the owner rejected v1 («a dirty mosque»): a read-only lens is a dead lens

The owner's verdict on the deployed v1 was total: the ontology page read as a
*caricature* of the worldview («مسجد مجازی» — a virtual mosque), classification
felt childish, and the whole thing was an ISLAND that increased disorder. The
corrections generalize far beyond this repo:

1. **A read-only, read-time-guessed ontology stays an island.** If no other
   page shows the classification and the owner cannot correct it, the lens is
   one dead screen. The fix has three legs, all required: (a) a nullable
   ``<dimension>`` column on every primary content table — **stored value
   always wins** over the classifier (fill-empty, behavior preserving);
   (b) an *effective-dimension* field in every list serializer so every page
   can SHOW the lens; (c) a correction chip on every row (one assign endpoint,
   `{entity_type, entity_id, dimension}`) — the owner's correction is final
   and immediately global. Auto-guess + owner-override is the whole design.
2. **The machine must never issue the worldview's verdicts — only flag
   probability.** v1 auto-labeled every overdue person/project task and every
   lapsed CRM follow-up as the heaviest moral class (حق‌الناس). The expert saw
   it instantly as nonsense («فکر می‌کنه من احمقم»). Rule: reserve the heaviest
   class for narrow, marker-gated matches (person linked AND promise/debt
   token), label it *probable* («احتمالِ …»), give every attention item a
   ``kind`` + honest badge, and downgrade everything else (project overdue →
   growth; follow-up → relationship upkeep). A false heavy flag costs more
   trust than ten missed ones.
3. **Check machine-alert patterns BEFORE the is-human heuristic.** The broker
   margin-call regression re-appeared because a named sender
   («John Smith <john@brokerx.com>») passed `_is_human` and the financial-alert
   regex never ran. Order of tests IS the classifier.
4. **Content is presence, not achievement.** v1 counted every writing as
   done/total=1/1 («a written piece IS the artifact») → fake 100% scores.
   Score follow-through (tasks/items/directives) only; report content as mass
   («N writings, N projects, N files»), unscored.
5. **A city, not a shrine: the worldview must dignify the mundane.** The owner
   wanted a خداشهر (God-city / مدینه فاضله): the sacred relation is the qibla
   the whole city faces — a full-width orientation band — while the BULK of
   the map is ordinary life (trade, hobbies, errands, مباحات) standing in its
   own districts. Extend the keyword tables with the owner's REAL data names
   (their actual list titles), not pious vocabulary, or everything defaults
   into the spiritual bucket and reads as caricature.
6. **A hub without drill-down is a dead end; give every dimension a district
   page.** One map card → `/dimension/:key` page aggregating that dimension's
   item-level content across every entity type (with an aggregated 'self' key
   when facets exist) — the chain map → district → thread → page/item is what
   makes the ontology *navigation* instead of decoration.
7. **Registries the owner must extend go in the DB, seeded from code.** The
   thread («نخِ تسبیح») registry moved to a table (code list = seed + keyless
   fallback, soft deactivate) with tiny CRUD + an add-form on the district
   page — «I added something new» must never require a deploy.
