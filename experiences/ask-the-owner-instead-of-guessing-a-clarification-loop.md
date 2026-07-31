---
title: Give an ingest pipeline a third option — ask the owner — via a dynamically generated form over a chat channel
tags:
  - ingest
  - human-in-the-loop
  - telegram
  - ai-triage
  - data-quality
topic_canonical: ask-the-owner-instead-of-guessing-a-clarification-loop
source:
  type: claude-code-task
  origin: claude-code
  imported_at: "2026-07-31T00:00:00Z"
created_at: "2026-07-31"
updated_at: "2026-07-31"
merged_from: []
---

# Ask the owner instead of guessing: a clarification loop

## 🎯 چالش / Challenge

An automated pipeline classifies incoming data and files it into domain
destinations. Every such pipeline eventually hits inputs it cannot resolve: two
plausible destinations, a missing field, an ambiguous entity match. With only
two options available — **guess** or **drop** — both outcomes are bad and both
are silent. Guessing corrupts real records (a balance written onto the wrong
account). Dropping loses the signal with no trace anyone will ever look at.

The owner's framing: *"make the connection more two-way, so the AI's
uncertainties get fixed instead of being left out or recorded wrongly."*

The obvious fix — "queue it for review" — fails in practice because a review
queue is a place you must remember to visit. What is needed is a loop that
**reaches out**, tolerates being ignored, and comes back.

## 💡 راه‌حل / Solution

A third option at every uncertain branch: `ask()`. One record type, one service,
one chat surface.

**1. Questions are generated per subject, never hardcoded.** A fixed form can
only ask what someone anticipated. The model receives the ambiguous content plus
the *live* list of destinations and returns a small field spec
(`key/label/type/choices/why/required`). Two guardrails matter:
- If the model reports no real ambiguity, **create nothing**. A loop that
  invents questions trains the user to ignore it.
- If the model is unavailable, fall back to a single open question, not to
  silence — silence is the failure being fixed.

**2. Partial answers are the normal case, not an error.** Each field is answered
or still open. A reply fills what it fills; the rest stays pending and is asked
again. Recognizing non-answers ("I don't know", "later", "-") as *unanswered*
rather than as content is essential — otherwise the loop closes a question it
never actually resolved.

**3. New questions merge into the open form; they never fork a parallel one.**
Dedupe on both the field key and the normalized question text, because a model
asked twice will phrase the same question two ways. Answers already given are
never overwritten by a merge.

**4. Re-ask on escalating backoff, and park instead of deleting.** Messages
scroll away; people are busy. Intervals of 0 / 6 / 24 / 72 / 168 hours cover
"they missed it" without becoming nagging. After N attempts the form is *parked*
— out of the asking cycle, still visible in the app, and **revived automatically
if a new question about the same subject appears**.

**5. Bind replies by message id, not by conversation state.** In a chat channel
with several open forms, `reply_to_message_id` is the only reliable binding. It
also means a form that scrolled far up is still answerable — scroll up, reply,
done. Per-chat "current question" state cannot do that.

**6. The reply parser needs a deterministic floor.** Model-based mapping from
free text to fields handles unordered, prose, and partial replies. Beneath it,
plain rules (`1) value`, `label: value`) must work with no model at all. One
trap: a single-question form with a bare reply should map the whole text to that
field — but strip the numbering prefix first, or `1) I don't know` gets stored
as a real answer because the *whole string* isn't in the non-answer list.

**7. Filing goes through a registry, and an owner's answer outranks automation.**
`{target_kind: applier}` keeps new destination types to one line. When the answer
resolves something the machine got wrong, record it with the same precedence as
a manual entry by the owner (here: an owner-timestamp that blocks later automatic
overwrites), so the correction cannot be undone by the next sync.

**8. Feedback must be honest.** Report what was recorded and where, what was not
understood, and how many questions remain open. "Thanks, got it" when nothing
parsed is how a human-in-the-loop system loses its human.

## ⚠️ دام‌ها / Pitfalls

- **Ask ordering vs. other handlers.** A form reply must be intercepted *before*
  generic text handling, or answering a question creates a new task.
- **Chat platforms limit one reply markup per message.** A force-reply prompt and
  action buttons cannot coexist. Put buttons on the reminder, not the first ask.
- **A user-initiated "show me the open questions" must not consume a retry.**
  Distinguish system attempts from user pulls, or asking for the list burns the
  backoff budget.
- **Cap open forms.** Uncertainty is unbounded; the user's attention is not.
- **Don't let asking block the data path.** File to the fallback destination as
  before *and* ask. If the answer never comes, nothing was lost.
- **Merging into a form whose answers were already filed is wrong** — that form
  is closed; a new question starts a new one.

## 🔁 How to Apply Elsewhere

1. Find the branches where your pipeline currently guesses or silently drops.
   Each is an `ask()` site.
2. Add one record type holding: subject, source context, dedupe key, target
   descriptor, dynamic field list with per-field answers, status, attempts.
3. Generate fields from the subject plus your live destination registry. Return
   nothing when there is no real ambiguity.
4. Deliver over whatever channel the user already reads. Bind replies by message
   id.
5. Parse tolerantly with a model, with a rule-based floor underneath.
6. File through a `{kind: applier}` registry; give the human answer the highest
   precedence your domain supports.
7. Re-ask on escalating backoff; park, never delete; revive on new questions.
8. Mirror the whole thing in-app, so a broken channel does not restore the
   silence you were eliminating.

## Update 2026-07-31 — editing answers, and the JSON column that silently discarded them

Three lessons from the first review pass of this loop.

**1. A mutable JSON column does not persist in-place edits — and same-session
tests will not catch it.** The obvious code is wrong:

```python
questions = list(row.questions or [])   # shallow copy: same dicts inside
questions[0]["answer"] = value          # mutates objects the OLD value also holds
row.questions = questions               # old == new → no UPDATE emitted
```

The ORM captures the previous value, compares it to the new one at flush, finds
them equal (they share the inner dicts), and emits nothing. Every test that
reads back through the same session passes, because the in-memory object *does*
have the answer. Only a read from a **fresh session** exposes it. Fix: deep-copy
before mutating and mark the attribute dirty explicitly. Then write the
regression test so it opens a new session — a test that reuses the session is
testing your object graph, not your database.

**2. The form must be re-fillable, and the numbering must be stable.** Rendering
only the *unanswered* fields seems tidy but is a correctness bug: after a partial
answer the list shrinks, so "2)" means a different question on the next send and
the user's reply lands on the wrong field. Number **all** fields every time and
print the current answer after the colon. Editing and filling then become the
same gesture — change the value and send — which is also the whole answer to
"can I correct something later?".

**3. Corrections must re-run the filing, not just update the form.** An edited
answer that is not re-applied leaves the original wrong value in the system,
which is precisely the failure the loop exists to prevent. Distinguish a *new*
answer from an *edited* one in the return value so the feedback can say which
happened, and skip the case where the user simply returns the prefilled form
unchanged — that is not an edit and should produce no noise.

## Update 2026-07-31 — a standing backlog must stop announcing itself

A related complaint surfaced in the same review: a separate digest was pushing
"80–100 files waiting for a password" every six hours, forever. It shares a root
cause with everything above — **a reminder loop that does not model whether
anything changed becomes noise, and noise trains the user to ignore the channel
you need for real questions.**

The discipline that fixed it generalizes to any "N items pending" notification:

- **Count only what is actionable.** The system already classified some of those
  files as not worth asking about; they were still in the number. An inflated
  count is not just noise, it destroys trust in every other number you report.
- **Push on change, not on schedule.** Hash the set of pending ids. Same set →
  stay silent; that is a dashboard state, not news.
- **Name what is new.** When the set grows, list the *new* items, not the whole
  backlog again.
- **Escalate then stop.** A few reminders at increasing intervals, then silence
  until the set actually changes — and say so in the last message, so silence
  reads as a decision rather than a failure.
