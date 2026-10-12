---
title: "Guardrails for a self-diagnosis / 'find my mental knot' tool"
tags: ["learning", "diagnosis", "llm", "safety", "privacy", "assessment-design"]
topic_canonical: "self-diagnosis-tool-guardrails"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-12T20:00:00Z"
created_at: "2026-10-12T20:00:00Z"
updated_at: "2026-10-12T20:00:00Z"
merged_from: []
---

# Guardrails for a "why did I get stuck / why did I do that" diagnosis tool

## 🎯 چالش / Challenge
A tool that takes a moment where the user got stuck (a puzzle, a behaviour, a social outcome), finds the "root knot", and trains it away
with varied practice. Built naively it over-attributes to the user's mind, lets an LLM "diagnose" (including other people), grades itself
with the same model, leaks sensitive self-analysis into mirrors/notifications, and promises transfer it can't deliver.

## 💡 راه‌حل / Solution
1. **Premise step first:** "is this even a knot?" — one-off vs recurring, base rate, whether the "better way" is really better; self-claims
   ("this shows I…") go to a claim-evaluation step.
2. **A fixed, cited taxonomy** (12 families incl. "situation/structure — not in your head" and "decision/self-regulation"), always all visible;
   ranking only orders examination ("not a probability"); signal scores normalised per family; evidence weighted by type
   (performance contrast > fact > counterfactual self-prediction — Nisbett & Wilson).
3. **Dynamic-assessment hint ladder** only when the answer hasn't been seen; otherwise isomorphs. An unlock step is weak evidence.
4. **The user confirms the root**, with evidence, ≥1 "why" with evidence and an external rival per internal why.
5. **Practice items**: generate in code with computed answers wherever possible; LLM items only as strict JSON with constrained answer
   types, accepted when 3 independently-phrased solvers agree and report no ambiguity, plus a leak check; provenance stored; "faulty" button.
6. **Mastery = near-transfer criterion** (streak across forms, spaced sessions, decoys with confidence) named "practised", never "solved";
   social/behavioural knots close only through logged real-world experiments; "returned" when a new real case links.
7. **Safety & privacy**: local self-harm keyword gate (normalised, stem + first-person patterns) before intake and every LLM call; no
   clinical labels; LLM output about a third party's mental state is dropped; whole-word name redaction; neutral notifications by default;
   mirrors opt-in per record, sensitive families gated separately.
8. **Delivery honesty**: transports that "succeed" when unconfigured must be reported as `skipped_unconfigured`; send only inside a local
   window; cap from a send log; retry only the failed channel.

## 🧪 نمونه کد (Anonymized)
```js
// whole-word redaction (a substring replace turns "فعلی" into "ف[شخص]")
function redact(text, names) {
  const W = "[\\p{L}\\p{M}\\p{N}\\u200c]";
  return names.reduce((t, n) => t.replace(new RegExp(`(?<!${W})${escape(n)}(?!${W})`, "gu"), "[شخص]"), norm(text));
}
```

## ⚠️ نکات حیاتی / Pitfalls
- Two modules defining the same global map (`STATUS`) silently broke a state transition — namespace exports, test the integrated bundle.
- "Five whys" on the mind invites confabulation: cap depth, demand evidence per step.
- A single LLM verifying its own items is not independent.
- Never claim IQ gain or "won't come back" (Sala & Gobet 2017; te Nijenhuis 2007).

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] Premise check before diagnosis; external/structural causes always on the list.
- [ ] Taxonomy as data with citations; ranking explained, normalised, labelled as order.
- [ ] Human confirms the root; evidence + rival required.
- [ ] Code-generated items first; LLM items need multi-solver agreement + leak check + provenance.
- [ ] Safety gate before every LLM call; no third-party mind-reading; whole-word redaction.
- [ ] Opt-in mirrors; neutral notifications; honest per-channel delivery status.
- [ ] An independent review of the design BEFORE building and an adversarial e2e audit AFTER.

## 🔗 References
- مرتبط: [client-save-queue-and-mirror-hardening], [pluggable-ai-provider-catalog-and-router]
