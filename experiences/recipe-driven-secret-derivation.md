---
title: "Recipe-driven secret derivation from untrusted instructions + reusable encrypted fact store"
tags: ["security", "ai", "secrets", "encryption", "prompt-injection", "ingest", "credential-vault"]
topic_canonical: "recipe-driven-secret-derivation"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-07-22T00:00:00Z"
created_at: "2026-07-22T00:00:00Z"
updated_at: "2026-07-22T00:00:00Z"
merged_from: []
---

# Recipe-driven secret derivation from untrusted instructions

## 🎯 چالش / Challenge

A locked file (a password-protected bank/broker statement) needs a password the
system doesn't have — but the sender's own message usually *explains how the
password is formed*: "your password is the last 3 digits of your card + your
date of birth." A dumb "enter password" box is the wrong UX: it asks for a
secret the user has to reconstruct every time and forgets. The system should
READ the formation rule, ask the user once for exactly the *components* it
names, store those components reusably, derive the password, and remember it
forever for that sender — while treating the instruction text (attacker-
controllable) as hostile input.

## 💡 راه‌حل / Solution

Split the secret into a **recipe** (public: which components, in what order) and
**facts** (private: the component values), and never let the untrusted recipe do
anything but concatenate the user's own stored facts.

1. **Fetch the instruction on demand, don't store it.** Pull the full message
   body only when a locked file appears; never persist it (keeps a
   metadata-only-at-rest invariant intact).
2. **Extract a STRUCTURED recipe with the LLM, then validate it in code.** Ask
   for `{has_recipe, components:[{key,label,kind}], template}` where `template`
   is `"{card_last3}{dob}"`. Canonicalise: map freeform component names onto a
   fixed vocabulary, and REJECT any recipe whose template references a token not
   declared as a component. The LLM proposes; deterministic code disposes.
3. **Reusable encrypted fact store, keyed by canonical slug.** `card_last3`,
   `dob`, `national_id`… each stored once, Fernet-encrypted at rest, exposed to
   the client only as `{label, has_value}` — never the plaintext (mirror your
   API-key masking convention). Facts are reused across every sender.
4. **Derivation is PURE token substitution.** Replace `{key}` with the stored
   value via a regex — never `str.format`, never `eval`, never a shell. A
   hostile recipe can then only concatenate the user's OWN facts; it cannot read
   arbitrary attributes, inject format specs, or exfiltrate anything.
5. **Derive → verify → remember, with a safe fallback.** If all facts are
   present, derive and TRY to open the file. On success, cache the derived
   password per sender (future files open silently). On failure (misread recipe
   / wrong format) fall back to asking — a wrong derivation must degrade to a
   prompt, never a silent retry loop. If facts are missing, ask for ONLY the
   missing components (labeled), not the whole password.
6. **One request type per file, deduped across statuses.** The "give me these
   components" request is a review-queue row keyed by the file's source_ref,
   deduped across pending|filed|dismissed so re-scans don't re-ask.

## 🧪 نمونه کد (Anonymized)

```python
# LLM proposes, code validates — reject undeclared template tokens
def canonicalise(recipe):
    if not recipe.get("has_recipe"): return {"has_recipe": False}
    template = recipe.get("template", "").strip()
    comps = [c for c in recipe.get("components", []) if c.get("key")]
    tokens = set(re.findall(r"\{(\w+)\}", template))
    if not tokens or not tokens.issubset({c["key"] for c in comps}):
        return {"has_recipe": False}                      # hostile / malformed
    return {"has_recipe": True, "template": template,
            "components": [c for c in comps if c["key"] in tokens]}

# derivation is pure substitution — NOT str.format, NOT eval
def derive(template, values):
    return re.sub(r"\{(\w+)\}", lambda m: str(values.get(m.group(1), "")), template)

# reusable fact store: encrypt at rest, never return plaintext
async def set_fact(db, *, key, value, user_id):
    await upsert(db, user_id, key, encrypt_data(value))     # Fernet
async def list_facts(db, *, user_id):
    return [{"key": r.key, "label": r.label, "has_value": True}  # masked
            for r in await rows(db, user_id)]

# derive → verify → remember, else fall back
values = await get_many(db, keys=[c["key"] for c in recipe["components"]], user_id=uid)
missing = [c for c in recipe["components"] if not values.get(c["key"])]
if not missing:
    pw = derive(recipe["template"], values)
    if (await open_file(data, password=pw))["ok"]:
        await store_password(db, sender_domain, pw)         # remember forever
    # else: wrong recipe → fall through to ask (no silent loop)
else:
    await ask_only_for(missing)                             # not the whole password
```

## ⚠️ نکات حیاتی / Pitfalls

- **The instruction text is an injection vector.** It reaches an LLM and then
  drives a secret computation. Never let it flow into `str.format`/`eval`/shell.
  Whitelist the component vocabulary; substitute, don't interpret.
- **Confirm before the first auto-derivation.** Show the components to the user
  and let them fill values — don't silently derive-and-submit off a recipe the
  model read from attacker text.
- **A wrong password must fall back, not loop.** The decryptor already reports
  "still locked"; treat derive→still-locked as "ask manually," never re-derive.
- **Format variance across senders.** Bank A wants DOB as YYMMDD, bank B as
  DDMMYYYY. Encode the required format in the component *label* the user fills,
  or the derived password will be wrong — but because of the fallback above, a
  wrong format degrades to a prompt rather than corrupting anything.
- **Never echo secrets back.** Facts and derived passwords return only as
  `has_value`/masked hints, same as API keys.
- **New table ⇒ register + migrate + create_all.** A keyed fact table needs the
  model registered, an alembic migration, AND to be seen by `create_all()` on a
  free-tier startup path — three places, not one.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. Whenever a secret is *derived from stable user attributes named in untrusted
   text*, split it into a validated recipe + an encrypted, reusable fact store.
2. Keep the derivation a pure, whitelisted substitution; validate the recipe in
   code after the LLM proposes it.
3. Ask for the smallest missing set of components, labeled; store each once and
   reuse across sources.
4. Derive → verify against the real check → cache on success → fall back to a
   prompt on failure. Never silent-loop.
5. Mask every secret in API responses; encrypt at rest with the app's existing
   crypt service.

## 🔗 References
- مرتبط: `multimodal-file-ingest-to-review-queue` (the locked-file flow this
  upgrades), `periodic-attention-engine-cooldown-dedup` (dedup/cooldown of the
  request rows), `pluggable-ai-provider-catalog-and-router` (the `complete`
  inference seam the extractor calls).
