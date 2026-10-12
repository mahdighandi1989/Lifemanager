---
title: Hand-written multiple-choice items leak the answer through length — test the "longest-option bot"
tags:
  - education
  - quiz-design
  - content-quality
  - testing
topic_canonical: multiple-choice-longest-option-bias
source:
  type: claude-code-task
  origin: claude-code
  imported_at: "2026-10-13T00:00:00Z"
created_at: "2026-10-13"
updated_at: "2026-10-13"
merged_from: []
---

# Multiple-choice items leak the answer through length

## 🎯 چالش / Challenge

A practice simulator with ~78 historical decision points, each with one correct option and
several plausible dead ends, gated level-ups at 80% correct. An independent audit found that in
75 of 78 steps the correct option was the **longest** one: authors explain the right move with
nuance ("because X, and only if Y…") and write wrong moves as one-liners. A bot that always
picked the longest option passed the 80% gate without reading — so the score measured nothing.

## ✅ راه‌حل / Solution

- Rewrote options so right and wrong answers carry similar length and specificity (wrong options
  get their own plausible reasoning; the right one loses its hedges).
- Added a content test that, per problem: (a) the correct option is strictly the longest in
  ≤35% of steps/drills, (b) its length is within ±35% of the mean wrong-option length in most
  steps, and (c) a "longest-option bot" (ties broken in the bot's favour) scores < the pass gate.
- Kept the explanations (`why`) rich — the nuance belongs in the feedback, not in the option.

## 🧭 How to Apply Elsewhere

Any time humans or an LLM author multiple-choice content (quizzes, onboarding checks, sim
options, generated drills), add an automatic "dumb strategy" test: longest option, option with
the most hedging words, first/last position, option sharing the most words with the question.
If any dumb bot clears your pass threshold, the item set is grading surface features. Run it in
the build, not once, because new content re-introduces the bias.
