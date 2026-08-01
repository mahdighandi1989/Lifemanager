---
title: A standing red baseline hides tests that cannot fail — triage every failure by asking "is the product wrong, or is the test?"
tags:
  - testing
  - test-quality
  - security-coverage
  - flaky-tests
  - time-dependent-tests
  - merge-gate
topic_canonical: tests-that-cannot-fail-the-red-baseline
source:
  type: claude-code-task
  origin: claude-code
  imported_at: "2026-08-01T00:00:00Z"
created_at: "2026-08-01"
updated_at: "2026-08-01"
merged_from: []
---

# A standing red baseline hides tests that cannot fail

## 🎯 چالش / Challenge

A suite settles into a "known baseline" of N failing tests. Everyone learns to
read `13 failed, 1560 passed` as green-enough, and the merge gate silently
becomes "no NEW failures" instead of "no failures". That is comfortable and
wrong, for a reason that is not obvious: **a test sitting in the baseline is
not merely un-run — it can be actively lying about coverage.** A test whose
setup dies before the assertion still *looks* like a guard on the thing it
names. Delete the feature it guards and nothing turns red, because it was
already red.

The baseline also hides the opposite error: a genuinely failing product.
You cannot tell the two apart without triaging each one.

## 💡 راه‌حل / Solution

Triage every baseline failure into exactly one of four buckets, and fix
according to the bucket — never by making the assertion match today's output.

1. **Product is wrong.** Fix the product. (Rarest, but this is the reason to
   triage at all.)
2. **Test pins an API instead of a behaviour.** The implementation was
   refactored — a parameter renamed, a collaborator inlined — and the test
   still patches a symbol that no longer exists. It dies in setup. Rewrite the
   test against the current signature, keeping the *behaviour* it asserted.
3. **Test pins a contract the product deliberately changed.** Realign the
   test, and say in the test's own docstring what changed and why, so the
   next reader doesn't "fix" it back.
4. **Test is a time bomb.** It stores an absolute timestamp and calls product
   code that filters on a *rolling* window against the real clock. Green on
   the day it was written, red on a date nobody chose. Make the fixture data
   relative to now.

Then apply the decisive check for buckets 2 and 3: **mutation-test the fix.**
Break the behaviour the test claims to guard and confirm the test fails. If it
still passes, you rewrote the symptom, not the guard.

## 🧪 نمونه کد (Anonymized)

Bucket 2 — the shape that produces fake coverage. The gate lives in the
*signature*, so calling the handler as a plain function never runs it:

```python
# ✗ This can only ever fail on `db=None`. Remove the admin gate entirely
#   and this test still "passes" the same way it always did.
with pytest.raises(HTTPException) as exc:
    await approve_user_handler(user_id=9, db=None, current_user=non_admin)
assert exc.value.status_code == 403

# ✓ Drive it through the framework so the dependency actually evaluates.
app.include_router(router)
app.dependency_overrides[get_current_user] = lambda: non_admin
assert client.post("/admin/approve-user/9").status_code == 403
```

Bucket 4 — the time bomb, and the probe that finds the rest of them:

```python
# ✗ FIXED_DAY ages out of the endpoint's rolling `now() - 7d` window.
seed(received_at=FIXED_DAY)
assert client.get("/items", params={"recent": True}).json() != []

# ✓ Date the fixture relative to the same clock the product reads.
seed(received_at=datetime.now(timezone.utc) - timedelta(hours=2))
```

```python
# A throwaway pytest plugin (loaded with `-p timeshift`, so it patches
# BEFORE application modules import) runs the suite as if it were N days
# from now. Whatever breaks is a time bomb you have not found yet.
import datetime as _dt
SHIFT = _dt.timedelta(days=120)
_real = _dt.datetime

class _Shifted(_real):
    @classmethod
    def now(cls, tz=None): return _real.now(tz) + SHIFT
    @classmethod
    def utcnow(cls): return _real.utcnow() + SHIFT

_dt.datetime = _Shifted
```

## ⚠️ نکات حیاتی / Pitfalls

- **Do not "fix" a failure by copying the observed value into the assertion.**
  Decide first which side is wrong. `assert status == 401` is right only after
  you have established that 401 is the contract you want.
- **401 vs 403 is not cosmetic.** 401 means no credential was offered and
  carries `WWW-Authenticate`; 403 means an identified caller lacks permission.
  Clients branch on this — a stale-token cleanup keyed on 401 never fires if
  the server answers 403. When a test disagrees with the server here, check
  the *client* before deciding who is wrong.
- **A test that dies in `setUp` is worse than a missing test**, because it
  occupies the slot a real test would have. Grep the baseline for setup
  errors specifically — they are the fake-coverage tell.
- **The mutation check is the only proof.** Rewriting a broken test *feels*
  like restoring coverage; only breaking the product and watching it go red
  demonstrates it.
- Patching `datetime` in a probe does not shift `time.time()` or C-level
  clocks, and only reaches modules imported *after* the patch. It finds the
  rolling-window class of bug, not every clock dependency.
- **Fix the gate, not just the tests.** Once the baseline is zero, make the
  merge gate mean zero — otherwise the next stale test just starts a new
  baseline.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere

1. Dump the current failure list. Treat it as a work-list, not as weather.
2. For each failure, read the *traceback location*: an error inside the test's
   own helper/setup ⇒ bucket 2 (fake coverage). An assertion on a value ⇒
   bucket 1 or 3. A date/window in the fixture ⇒ bucket 4.
3. For bucket 1, change the product. For 2–4, change the test — and record in
   the test's docstring what the real contract is and why it moved.
4. Mutation-test every security- or invariant-related rewrite: break the
   behaviour, confirm red, restore.
5. Run the suite once under a shifted clock to flush out the remaining time
   bombs before they pick their own date.
6. Drive the baseline to zero, then tighten the gate to "zero failures" so it
   cannot silently re-accumulate.

## 🔗 References

- مرتبط: [frontend-baseline-diff-test-gating](frontend-baseline-diff-test-gating.md)
  — the same disease on the frontend side (a baseline that drifts into being
  the definition of "passing").
- مرتبط: [write-gate-next-to-optional-identity](write-gate-next-to-optional-identity.md)
  — the auth split (401 vs 403, strict vs lenient identity) that the
  status-code bucket above turns on.
