---
title: "Age-aware comparison and audience — ask for the date, never fall back to a default prior"
tags: ["psychometrics", "norms", "age", "prompting", "safety", "minors", "sync"]
topic_canonical: "age-aware-norms-and-audience-without-a-default-prior"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-10-18T09:30:00Z"
created_at: "2026-10-18T09:30:00Z"
updated_at: "2026-10-18T09:30:00Z"
merged_from: []
---

# Age-aware comparison and audience — ask for the date, never fall back to a default prior

## 🎯 چالش / Challenge
An app compares a person with "people like them" (population norms) and talks to them through an LLM. Three
silent failures were present: (1) when the age was unknown, the comparison quietly used a standard-normal prior
and a label that claimed "the source has no age data" — a fabricated comparison with a false explanation;
(2) ages outside the source's sampled range (children, older adults) fell into the same default; (3) the
conversation never adapted to age, and a minor got exactly the adult treatment (including requests for personal
data). The date of birth also lived in two stores (the app's own settings and the account profile) with no sync.

## 💡 راه‌حل / Solution
1. **One date, computed age.** Store only the date of birth; compute the age on every read. When two stores
   exist, read the account store first, fall back to the local one, and sync only by *fill-empty in both
   directions* (never overwrite an existing value automatically). An explicit user entry writes to both.
2. **No default prior.** The comparison function returns a typed "no norm" result (`none: "birth"` or
   `none: "age"`) instead of numbers. The UI turns `birth` into "give your exact date of birth (one sentence why)"
   and `age` into one plain line ("no valid norm exists for this age") plus the person's own trend. No
   percentile, no encouragement.
3. **Coverage is data, not code.** Each source carries the ages it actually sampled; each band can be marked
   `valid: false` with a written reason (e.g. a cell whose people are concentrated at one end of its label).
   Check the reason against the raw data, not the paper's summary.
4. **New norms only on a method match.** Accept a published band only if items, scoring, time limit and the
   reported statistics (mean/sd/n on the same scale) match; record rejected candidates with the mismatch.
5. **Audience block, not new logic.** Derive an age band from documented developmental boundaries (school stages,
   cognitive-development stages, the legal definition of a child, the WHO definition of older people) and add a
   short prompt block that changes only *how* things are said: language level, sentence length, examples, step
   size, encouragement without flattery, minors' safety (no personal-data requests, no adult topics, involve a
   parent/teacher when stakes are real), patience without condescension for older adults. Adults get no block,
   so existing behaviour is untouched.
6. **The page asks, not the model.** A missing date is asked by a deterministic UI card once per session after
   the first turn; the model is told "age unknown — do not ask", so the one-question-per-turn rules of the main
   logic are not disturbed.

## 🧪 نمونه کد (Anonymized)
```js
function peers(scale, age) {
  if (age == null) return { none: "birth" };
  const hit = scale.bands.find(b => age >= b.lo && (b.hi == null || age <= b.hi));
  if (hit && hit.valid !== false && hit.mu != null) return { mu: hit.mu, sd: hit.sd, label: hit.label };
  return { none: "age" };          // never { mu: 0, sd: 1 }
}
async function syncBirth(host, local) {
  const h = valid(await host.get().catch(() => "")), l = valid(local.get());
  if (h && !l) local.set(h);       // fill-empty, one way
  else if (!h && l) await host.set(l); // fill-empty, the other way
  return h || l;                   // account store wins on read
}
```

## ⚠️ نکات حیاتی / Pitfalls
- A "whole sample" fallback is still a different population; for a minor against an adult sample it is invalid.
- A wide band can be mostly one end of its label — check the age distribution inside the band.
- A malformed value from the account store must not trigger an overwrite of that store.
- Any test harness that awaits a page call must exit on a thrown error, or a red run hangs instead of failing.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] Store dates, compute ages; list every place that reads age and route it through one function.
- [ ] Replace every default prior/fallback in comparisons with a typed "no norm" result and an honest UI line.
- [ ] Put source age coverage and band validity in the data file, with reasons verified from raw data.
- [ ] Accept new norms only on a full method match; log rejections with the mismatch.
- [ ] Add an audience block derived from cited developmental boundaries; leave adults unchanged; test that all
      other prompt parts are byte-identical across ages.
- [ ] Ask for missing data with a deterministic UI element, once per session, never blocking other work.

## 🔗 References
- Related: `grounding-confidence-numbers-in-axioms`, `write-gate-next-to-optional-identity`, `tests-that-cannot-fail-the-red-baseline`
