// Synchronisation helpers for the page tests — wait for the condition the next check reads, never a fixed sleep.
// (The merge gate runs these files in parallel; a fixed waitForTimeout that "usually" covers a 400 ms debounce does not under load.)
//
// The page defers many writes with short debounces (course/epi-course saveSoon, journey savef, worksheet A.debounce — ~400 ms):
// the in-memory record already carries the change, its S.put comes later. installWriteSpy() wraps S.put once per page load:
// every write is logged in window.__puts as "type:id" and the record's JSON at that write is kept. A record whose in-memory JSON
// differs from its last write has a write pending. settle() waits until no written record has one (optionally only some types).
// Records never written since the spy was installed are not tracked (reading normalises some of them in memory without writing —
// that is not a pending write).

exports.installWriteSpy = (p) => p.evaluate(() => {
  window.__puts = [];
  if (APP.S.put.__spy) return;
  const o = APP.S.put;
  window.__snap = {};
  const f = function (r) { window.__puts.push(r.type + ':' + r.id); const out = o.apply(this, arguments); try { window.__snap[r.id] = JSON.stringify(r); } catch (e) { } return out; };
  f.__spy = 1; APP.S.put = f;
  window.__pendingWrites = (types) => Object.keys(window.__snap).filter(id => {
    const r = APP.S.get(id); if (!r) return false;
    if (types && types.indexOf(r.type) < 0) return false;
    try { return JSON.stringify(r) !== window.__snap[id]; } catch (e) { return false; }
  });
});

// Waits until no tracked record has a write pending; returns the ids still pending on timeout (the caller's check then judges).
exports.settle = async (p, types, timeout = 15000) => {
  try { await p.waitForFunction(t => window.__pendingWrites && window.__pendingWrites(t).length === 0, types || null, { timeout, polling: 50 }); return []; }
  catch (e) { return p.evaluate(t => (window.__pendingWrites ? window.__pendingWrites(t) : []), types || null).catch(() => ['?']); }
};

// Waits for a page-side condition (the state a following read asserts); on timeout it returns false and the check reports.
exports.until = (p, fn, arg, timeout = 15000) => p.waitForFunction(fn, arg, { timeout, polling: 50 }).then(() => true, () => false);
