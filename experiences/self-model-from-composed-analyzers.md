---
title: "Owner self-model (interests + willpower/diligence) by COMPOSING existing analyzers, not rebuilding"
tags: ["analytics", "self-model", "composition", "deterministic", "time-series", "profile"]
topic_canonical: "self-model-from-composed-analyzers"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-22T00:00:00Z"
created_at: "2026-07-22T00:00:00Z"
updated_at: "2026-07-22T00:00:00Z"
merged_from: []
---

# Owner self-model by composing existing analyzers

## 🎯 چالش / Challenge

A user wants the system to tell them, from their OWN accumulated data, *what
they're into* (interests) and *how disciplined they are* (willpower/diligence) —
and to track both over time. The raw signals (writings, goals, tasks + their
completion/abandonment) already exist, and several point-in-time analyzers
already run over them — but nothing fuses them into a single, longitudinal
self-portrait, and the interest inference ignores the richest source (the user's
own long-form writing).

## 💡 راه‌حل / Solution

Compose, don't rebuild. A thin new service that *calls* the existing heuristics
and persists a snapshot per refresh.

1. **Interests = keyword/category extraction over the WHOLE corpus.** Reuse the
   existing tokenizer + category map, but feed it every owner source — writings
   (title+body+category), tasks, list items, goal titles/domains — not just
   tasks. Aggregate surviving tokens (count ≥ 2) into categories, drop the
   catch-all "general", and also surface the top raw terms.
2. **Willpower = one 0-100 index from follow-through evidence.** Combine the
   signals that already exist: goal done-vs-missed rate, streaks, graduated
   count; task completion ratio; list-item completion ratio; minus an
   abandonment penalty (open items past their due date). Normalise to 0-100 with
   a small streak bonus and overdue penalty. Add a trend by comparing recent vs
   prior completion counts (use the one exact completion timestamp you have).
3. **Deterministic + SQL-only.** No LLM in the core path, so it works on a
   keyless deploy and always returns a stable number; layer an optional AI
   narrative on top later.
4. **Persist a snapshot per refresh for a free time-series.** Write each
   computation as a new row in the existing assessment table under a new
   `assessment_type` (store the numeric index in a score column, the composite
   as JSON) — one row per refresh gives the over-time chart with no new table.
5. **Additive, behaviour-preserving.** New `assessment_type`, new read/refresh
   endpoints, a new page — no existing analyzer signature or type touched.

## 🧪 نمونه کد (Anonymized)

```python
async def compute_diligence(db, uid):
    goals = await load(Goal, uid)
    done  = sum(g.times_done   for g in goals)
    miss  = sum(g.times_missed for g in goals)
    goal_rate = done/(done+miss) if done+miss else None
    tasks = await load(Task, uid)
    task_rate = ratio(tasks, done=DONE, open=(TODO, IN_PROGRESS))
    overdue   = count(t for t in tasks if open(t) and past_due(t))
    rates = [r for r in (goal_rate, task_rate, todo_rate) if r is not None]
    base  = mean(rates) if rates else 0
    score = clamp_0_100((base + streak_bonus - overdue_penalty) * 100)
    return {"score": score, "trend": trend, "overdue": overdue, ...}

async def build_self_model(db, uid):
    payload = {"interests": await compute_interests(db, uid),
               "diligence": await compute_diligence(db, uid),
               "generated_at": now_iso()}
    db.add(Assessment(user_id=uid, assessment_type="self_model",
                      score=payload["diligence"]["score"],
                      analysis_text=json.dumps(payload)))   # snapshot = free history
    await db.commit()
    return payload
```

## ⚠️ نکات حیاتی / Pitfalls

- **Interest inference blind to the richest source.** If the extractor reads only
  task titles, the person's actual passions (in their long-form writing) never
  surface. Widen the corpus first.
- **The catch-all category drowns everything.** Most tokens map to "general";
  exclude it from the ranked interest list or the result is meaningless.
- **No exact task-completion timestamp?** Lean on the one entity that has one
  (list items' `completed_at`) or an activity log's "complete" event; document
  the approximation rather than faking precision.
- **Scope + soft-delete.** Every read must honour the owner scope (user_id or
  NULL for anon) and filter soft-deleted rows, or counts inflate with trashed
  data and the score lies.
- **Keep it deterministic.** A willpower number that swings because an LLM was or
  wasn't reachable is worse than useless — compute it from SQL, add narrative
  only as optional garnish.
- **Snapshot, don't upsert, if you want history.** Upserting one row loses the
  time-series; insert a new row per refresh and read the last N for the trend.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. Inventory the analyzers you ALREADY have; write a composer that calls them,
   not a replacement.
2. Feed interest/topic inference every relevant source, not the most convenient
   one; drop the catch-all bucket.
3. Reduce follow-through evidence to a single normalised index with an explicit
   penalty for abandonment; add a trend from the timestamps you actually have.
4. Persist one snapshot per refresh under a new type in an existing table for a
   free time-series; expose read + refresh; render a compact number + trend +
   history + chips.
5. Keep the core deterministic; make any AI narrative optional and fail-open.

## 🔗 References
- مرتبط: `content-to-daily-directive-internalization-engine` (the willpower
  signals: strength/streak/graduated), `periodic-attention-engine-cooldown-dedup`
  (if you schedule a periodic refresh).
