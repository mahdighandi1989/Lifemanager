---
title: "Versioned eval/training dataset from heterogeneous agent-tour artifacts"
tags: ["dataset", "evaluation", "llm", "dedup", "train-eval-split", "scrubbing", "idempotent"]
topic_canonical: "versioned-eval-dataset-from-agent-tour-artifacts"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-18T00:00:00Z"
created_at: "2026-10-18T00:00:00Z"
updated_at: "2026-10-18T00:00:00Z"
merged_from: []
---

# Versioned eval/training dataset from heterogeneous agent-tour artifacts

## 🎯 چالش / Challenge
Many scenario-test rounds of an in-page AI were run by different agents. Each agent kept its own file layout
(request/reply files, replay overrides, control scripts, state snapshots, free-text findings, defect catalogues), some
rounds were partly pruned, and the requests are huge (tens of KB, mostly repeated). We want one durable, private,
versioned dataset: a benchmark (scenarios + judges), labelled exchanges, and the page's own checks. It must be small
enough for git, honest about who wrote each reply, and its held-out split must never move.

## 💡 راه‌حل / Solution
1. **Survey before parsing.** Count each artifact kind per round/group first; it shows which rounds have full
   request/reply pairs and which only fragments. Label the gaps (`request_missing`, `source_layout: fragments`) instead
   of inventing them.
2. **Author from provenance, never from style.** Map the run directory (and, for a routed pass, the request's task field)
   to the author label through the run's own instructions; anything not documented is `unknown`.
3. **Section-level dedup.** Cut the prompt before every markdown heading; store pieces ≥1 KB once by hash, keep short
   ones inline. Lossless, and it removed ~98% of the bytes (gzip alone cannot: its window is 32 KB).
4. **Link judgments by explicit references only.** A finding goes to turn N when it names `pN`/`rN`/«turn N», or a
   control step that a file-mtime table maps to that call. Everything else stays scenario-level. Report the ratio.
5. **Outcome from what the harness recorded.** The snapshot taken after the control step that produced the call
   (ctl mtime ≤ request mtime ≤ snapshot mtime) gives the shown text and the page's own system lines.
6. **Sticky stratified split.** Hash rank with a salt, coverage pass (every stratum gets an eval member), then fill
   to the target fraction; once written to the manifest, an assignment never changes.
7. **Idempotent and monotonic writer.** gzip `mtime=0`, sorted keys, no timestamps ⇒ a rerun writes zero files. A shard
   whose source shrank is kept, not overwritten. Scrub before hashing so hashes never encode personal data.

## 🧪 نمونه کد (Anonymized)
```python
def split_prompt(text, store, min_bytes=1024):
    out = []
    for piece in re.split(r"(?m)^(?=#{1,3} )", text):
        if len(piece.encode()) >= min_bytes:
            h = sha256(piece.encode()).hexdigest()[:24]
            store.setdefault(h, piece)
            out.append({"b": h})
        elif piece:
            out.append(piece)
    return out          # "".join(p if str else store[p["b"]]) == text
```

## ⚠️ نکات حیاتی / Pitfalls
- Substring keyword rules on non-Latin text match inside longer words; use word-boundary regexes.
- Prompts may contain lone UTF-16 surrogates; normalise before encoding or the writer crashes mid-run.
- Snapshot ids like `s12` can collide with scenario ids; do not use them as turn references.
- A reply file newer than the next request was edited after the system read it; flag it, because the recorded outcome
  belongs to the earlier text.
- Replies written by a vendor model may carry terms-of-use limits for training other models; keep the author label
  and treat them as eval/reference unless the owner confirms otherwise.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] Inventory every run dir: which artifact kinds exist, in which counts.
- [ ] Define the record schema with explicit `null` + flags for anything missing; version it in a SCHEMA file.
- [ ] Derive author/source labels only from run metadata; default `unknown`.
- [ ] Content-address repeated large text (system prompts, repeated prompt sections) and reference it.
- [ ] Link verdicts by explicit turn references; publish the linked ratio.
- [ ] Sticky, salted-hash, stratified split stored in the manifest; test that adding items never moves old ones.
- [ ] Deterministic gzip, monotonic shards, scrub-before-hash; test idempotence byte-for-byte.
- [ ] Wire the collector into the routine checkpoint so the dataset never lags.

## 🔗 References
- Related: `paired-agent-live-campaign-for-an-in-page-ai`, `two-sided-needs-judging-for-scenario-tours`, `model-reports-state-page-validates`
