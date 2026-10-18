# Tour dataset for a future local model (owner 2026-10-18 — binding, standing, from now on)

**Goal.** A future local or offline language model should reach this page's coaching quality. It needs three things, all built from the
tours and none of which have to be rebuilt later:
1. **Benchmark:** the scenarios plus the judges. This is the yardstick for any model.
2. **Training data.**
3. **Validators:** the page's own checks, used as automatic filters or rewards.

## What is collected (every round, every AI call, from round 1 on)
For each exchange `(round, group, scenario, turn n)`:
- `request`: the page's exact request (system + messages + task tier). The repeated system prompt is stored once, by hash.
- `reply`: the reply the page received, with `author` ∈ {runner-simulated, real-haiku, real-sonnet, real-other, human}.
- `page_outcome`: what the page accepted or refused from that reply (coach_state fields, actions, retracts, rewrites requested), taken from
  the harness logs and records.
- `verdict`: the judge's per-turn verdict. Defects are tied to turns (id, class, severity, file:line) with the «ارتقای لازم» text, and the
  need-map lines that apply.
- `better`: the corrected or ideal reply, only where a runner or the owner wrote one.
- `meta`: build commit, persona (age band, topic, technique, Pólya stage), language and register.
Scenario-level data: persona, goal, user turns, criteria, final RESULT and the defect list. The variant banks (VARIANTS_R*) are stored as
labelled single-turn cases.

## Storage (durable, versioned, private)
- `docs/tours/dataset/` in git:
  - `SCHEMA.md` with a version number;
  - `manifest.json`: counts, hashes, the split and the provenance of every shard;
  - `system/<hash>.txt.gz`: deduplicated system prompts;
  - `exchanges/<round>.jsonl.gz`;
  - `scenarios.jsonl.gz`;
  - `banks.jsonl.gz`.
- The owner's e-mail address and any personal data are scrubbed («<owner-email>»). Test records only.
- **Split:** fixed by scenario (never by turn), so the benchmark stays clean. About 20% of scenarios are held out as `eval` permanently,
  covering every age band and every mechanism family. Later rounds add new scenarios to both sides by the same rule.
- Every round the collector runs again (idempotent; new rounds append). `checkpoint.sh` calls it, so the dataset can never lag behind.

## Honest limits (written so nothing has to be redone later)
- **Terms of use.** Most replies so far were written by Claude playing the model. Anthropic's terms restrict using Claude outputs to train
  other AI models. So Claude-authored replies are labelled `author` and kept for evaluation, not as training targets, unless the owner
  confirms the terms allow his use.
- **The clean training path:**
  - the local model generates candidate replies to the same requests;
  - the page validators and the judge criteria filter them (rejection sampling or preference pairs);
  - the owner or human-written `better` replies supply the gold.
  The benchmark, the user turns, the criteria and the validators are all ours and fully usable.
- **Synthetic people.** The people in the scenarios are simulated by runners. Real sessions with the owner's consent can be added later,
  with the same schema and a `source:real` tag.
- **Quality gates for any trained model:** the held-out eval scenarios, judged by the same RUNNER rules. Pass rate is compared against the
  real-haiku and real-sonnet passes (models20/21). No model replaces the routed tier until it matches on eval.
