---
title: "A hand-kept word list drifts — classify the product's own vocabulary and let a test catch the unclassified"
tags: ["i18n", "morphology", "register", "testing", "drift-guard", "false-positives"]
topic_canonical: "closed-word-list-vs-own-vocabulary-guard"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-11-12T12:00:00Z"
created_at: "2026-11-12T12:00:00Z"
updated_at: "2026-11-12T12:00:00Z"
merged_from: []
---

# A hand-kept word list drifts — classify the product's own vocabulary and let a test catch the unclassified

## 🎯 چالش / Challenge
A product rewrites its own interface text into another form of address (informal ⇒ formal). One suffix is ambiguous: it is a
second-person possessive on some words and simply the last letter of others. The transform kept a hand-written list of the
possessive forms. The interface had about two hundred such forms; the list had forty. Every new line of interface text could
bring a form nobody had listed, and the result was a sentence in two forms of address at once. The same defect was reported
in three review rounds and «fixed» each time by adding the two or three words of that report.

The mirror image sat in the checker that reads a generated reply for the wrong form of address. There the rule was
open-ended («any word with that ending before these particles is the possessive»), so ordinary nouns were read as informal
address and correct replies were sent back for rewriting.

## 💡 راه‌حل / Solution
1. Treat the product's own strings as the vocabulary. A form is a **candidate** when the word ends in the ambiguous suffix
   and the word without the suffix also occurs in the product's strings.
2. Keep two explicit lists next to the transform: stems that take the suffix as a possessive, and words that merely end in
   it. Both are data, not regular expressions scattered through the code.
3. Add a test that reads the source strings, builds the candidate set the same way, and fails on any candidate that is in
   neither list. A new line of text with a new form now fails the build until someone classifies it.
4. Give the checker the **same** knowledge: it calls a word a possessive only when it is in the classified set (or carries
   an unambiguous spelling). Outside the set it does not judge. A missed sign costs little, because a reply in the wrong
   form of address shows it in several other ways; a false sign costs a rewrite every time.
5. For verb endings, anchor on a list of verb stems instead of «any letters between prefix and ending».

## 🧪 نمونه کد (Anonymized)
```js
// transform side
const POSSESSIVE_STEMS = ["progress", "answer", "plan" /* … */];
const NOT_POSSESSIVE   = ["correct", "state", "card" /* words that only end in the suffix */];
rules.push([new RegExp(B + "(" + POSSESSIVE_STEMS.join("|") + ")" + SUFFIX + E, "g"), "$1" + FORMAL_SUFFIX]);

// test side (runs in the build)
const words = countWords(stripComments(readAllSourceStrings()));
const candidates = Object.keys(words).filter(w => w.endsWith(SUFFIX) && words[w.slice(0, -SUFFIX.length)]);
const unclassified = candidates.filter(w => transform(w) === w && !NOT_POSSESSIVE.includes(w));
assert(unclassified.length === 0, "classify these forms: " + unclassified.join(" "));

// checker side: the same set, never an open pattern
const CLITIC = "(?:" + POSSESSIVE_STEMS.join("|") + ")" + SUFFIX;
```

## ⚠️ نکات حیاتی / Pitfalls
- The candidate rule over-generates on purpose (a word and its stem both existing does not prove a possessive). The second
  list is what makes the guard usable; without it the test is noise and gets disabled.
- Strip comments before scanning, or prose in comments creates candidates.
- Do not let the checker use a wider rule than the transform. The two must agree on what the form is.
- Every fix needs its look-alike negative in the same test: the word that ends in the suffix and must stay as it is, the
  real plural that is not a polite form, the genuinely mixed sentence that must still be caught.
- A test that only lists today's failing words passes forever after; the scan over the source is what keeps it honest.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] Find the hand-kept list that a text transform depends on. Count how many forms the product actually contains.
- [ ] Define «candidate» mechanically from the product's own strings.
- [ ] Split candidates into two explicit lists; put both beside the transform.
- [ ] Add the scanning test; make it print the unclassified forms.
- [ ] Point every detector of the same phenomenon at the same lists.
- [ ] When a rule cannot decide, let it stay silent rather than guess — and measure which error is cheaper.

## 🔗 References
- مرتبط: [display-transform-at-write-not-only-at-paint]
- مرتبط: [model-reports-state-page-validates]
