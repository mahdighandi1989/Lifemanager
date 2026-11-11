---
title: "Display transform at write time, not only at paint"
tags: ["rendering", "storage", "i18n", "register", "testing", "single-gateway"]
topic_canonical: "display-transform-at-write-not-only-at-paint"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-11-11T12:00:00Z"
created_at: "2026-11-11T12:00:00Z"
updated_at: "2026-11-11T12:00:00Z"
merged_from: []
---

# Display transform at write time, not only at paint

## 🎯 چالش / Challenge
A system writes its own lines into a stored conversation (confirmations, notices). The wording must follow something that
belongs to the conversation — the form of address, the calendar, the locale. The transform was applied in one place only:
the function that paints the chat bubble. The bubble was right, but every other reader of the stored record (export, e-mail,
dossier, audit tool, the reviewer's dump) still saw the raw wording. The defect was reported as «still open» for three review
rounds, each time «fixed» again in the painter.

A second, related failure: page-built questions were handed to a model with two or three question marks while a post-check
rejected any reply with two questions. Each producer of a question was patched separately; the next producer broke it again.

## 💡 راه‌حل / Solution
1. Keep ONE transform function (the gateway). Call it in two places: where the record is **stored** and where it is painted.
2. On store: `text` = what a person sees; `text0` = the raw line; `textR` = the last transformed text. Painting always starts
   from `text0`, so a later change of the conversation's setting re-renders correctly, and the transform never has to be
   idempotent.
3. If other code edits `text` afterwards (`text !== textR`), treat the edited text as a new raw line.
4. For «every producer must obey rule X» (one question per turn): put a **final filter after all producers**, not a rule in
   each producer. Producers may keep their natural wording; the last gate guarantees the invariant.
5. Never match a stored system line by wording that the transform can change — carry a field on the record instead.

## 🧪 نمونه کد (Anonymized)
```js
function storeGate(rec) {
  rec.items.forEach(function (m) {
    if (m.role !== "system") return;
    var raw = m.text0 != null && m.text === m.textR ? m.text0 : m.text, out = transform(rec, raw);
    if (out !== raw) { m.text0 = raw; m.text = out; m.textR = out; }
    else if (m.text0 != null) { m.text = raw; delete m.text0; delete m.textR; }
  });
}
var put0 = store.put;
store.put = function (r) { if (r && r.type === "conversation") storeGate(r); return put0.apply(this, arguments); };
// painter and prompt history: transform(rec, m.text0 != null && m.text === m.textR ? m.text0 : m.text)
```

## ⚠️ نکات حیاتی / Pitfalls
- A reviewer who reads storage and a user who reads the screen see different things; «fixed on screen» does not close a
  finding made on storage. Ask first where the evidence was read from.
- Quoted text: decide by ownership, not by punctuation. A short quoted label that the user never wrote is the system's own
  label and takes the transform; the user's own words never do.
- A whole-DOM transform is tempting and wrong: it rewrites the user's own text shown in forms. Mark the user's text first.
- The final filter must run after every other filter, or a later producer re-introduces the violation.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] List every reader of the stored record, not only the main view.
- [ ] One transform function; call it at write and at paint; keep the raw text beside the shown text.
- [ ] Write the test on the STORED text and on the painted text, and on a change of the setting afterwards.
- [ ] For a cross-producer invariant, add one last gate and a test that feeds it every entry of the producers' registry.

## 🔗 References
- مرتبط: [soft-delete-tombstone-must-filter-every-read-path], [model-reports-state-page-validates]
