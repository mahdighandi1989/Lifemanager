# Round-25 fixer «correction» (P4 + C11) — hand-back (2026-11-11)
Branch worktree-agent-a439159abebb3e517, final commit 3b016baf (base eeb11d1f). WORKLOG 121 / PROGRESS 120.
Root causes: a38 staleScan (round 24) counted a number as derived whenever one operation on the old value and ANY earlier number gave it,
and the same coincidence supplied the «new value» (A25-9, C25-4, D25-19, goal half of B25·D10); a unit-less old value paired raw with a
unit-bearing one; a27 retractApply / num24 / byRes presumed «a numeric result or guess after the datum rests on all data» (D25-18,
B25·D10, C25-8); a38 setAsideDeps reset the sufficiency verdict on any changed declared datum.
Fix: new engine staleCore25 in a38 — a number is stale only if her own text shows it as a RESULT (position markers) and its relation to
the corrected value is identified (written expression, then a word of the sentence, then one dimension-checked operation). Data, indices,
labels, years are never candidates. C11: a value is proposed only when every relation of the deciding class agrees and no operand is
uncertain; otherwise the card asks with no number. Chat results and prior-ledger steps are read as records (stale25). A.liveRestsOn
(yes/no/unknown) gates the two a27 presumptions. One a27 addition: correction cue «X ندارم/نیستیم، <عدد>». Old scan quarantined.
Tests: tests/test_tour1_r25_correction.js (11 red on base ⇒ green); bank P4 24/24 (13 red on base). Partial expectations: #146 the ledger
row text «کهنه پس از اصلاح — دوباره بسنج» is a45's (prior); #145 «پس ۴ تا بخاری» marked stale without a value (rounding up is not an
identified relation); #159 «۸، ۱۸» neither marked nor asked. Suite 134/135 on the first pass; the one failure (R24 bank #67) fixed; only the
correction and retract tests were rerun after that — the merge gate covers the rest.
Open: ledger-row rendering of stale25, moving the resume point and the chat-only story ledger (C25-15) are left to «prior»; multi-operation
or rounded relations are asked, never computed; a measured report of the same kind as the corrected value is still presumed stale when the
model gives no `rests`; a fraction as a result is not marked; a single coincidental relation in a result position can still give one wrong
proposal (reduced, not excluded); two harmless debug helpers remain in a38.
