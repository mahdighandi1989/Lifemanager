# Tour 1 (Pólya), round 20: «routing» fixer handoff (2026-10-18)

Scope: MT2 of `DECISIONS_R20.md` — coaching turns of the floating assistant go to a stronger tier. Files: backend
`app/services/ai/catalog.py`, `app/services/ai/manager.py`, `app/services/ai/model_discovery.py`, `app/routes/app_records.py`
(area `app`, owners urgent/general — recorded with `handoff.py add --by session`); page `apps/learning-architecture/src/app/a26_assist.js`
(the one chat call site). No push, no merge to main.

## Evidence
`models20/SUMMARY.md`: same page and prompts on 8 scenarios — haiku 2/2/4 (PASS/PARTIAL/FAIL), sonnet 4/4/0. Classes 12 (state-blindness)
and 13 (decisive-turn judgment) are what the tier fixes; classes 1–10 appear in both tiers (page work for the other fixers).

## Tier chosen and why
`lla_coach`: `preferred: "reasoning"`, `tier: "balanced"`, `requires: ["vision", "documents"]`.
- The catalog has no capability or tier literally named "balanced". Its own tier definition is `model_discovery._TIER_PRIORITY`
  («Flash / Sonnet for reasoning, Flash-Lite / Haiku for fast work, Pro / Opus only on explicit pin»), so balanced = reasoning-capable
  and not in the top tier. `TOP_TIERS` is derived from that table (named tiers with the highest priority number ⇒ opus, pro).
- `preferred: "reasoning"` alone is not enough: in the static seed Opus has priority 1, so the auto pick was Opus (the top tier the
  decision rules out). With `tier: "balanced"`, `_auto_order` puts top-tier models after the balanced ones among the preferred models.
  Result: static seed ⇒ Sonnet; after the live refresh ⇒ newest Flash (not Pro); Opus only if it is the only capable model; pins win.
- Only tasks carrying `tier` are affected (only `lla_coach`); every other route's order is unchanged.

## Page decision (`AS.chatTask`, pure)
- `lla_coach` when the built prompt contains a coach-layer block: «# مسئلهٔ زندهٔ این سشن», «# معلمِ حلِ مسئله», «# پاسخ به پرسشِ بازنگری»,
  «# سلیقه برای بازنگریِ», «# اصلاحِ پیامِ …» / «# اصلاحی که صفحه …», «# مسئلهٔ واقعیِ حل‌نشده» (full rule; the always-present
  «🔭 … (قاعدهٔ کوتاه)» does not count), «# مسئلهٔ حل‌شدهٔ مرتبط», «# پس از شکست…».
- The general «# مربیِ حل» block is added to every non-greeting turn, so alone it is not a signal: it counts with a problem/decision/stuck/
  failure/life signal in her message (a27's CHAT_PROB, LIVE_RE2, LIVE_ASK, LIVE_STUCK, FAIL_ME, plus عادت|سلامت|رژیم|ورزش|تصمیم|زندگی) or when
  her previous turn was a coach turn (`s.aiTask`).
- `lla_assistant`: action-only commands without a problem signal (ثبت کن، برو به، بنویس، باز کن، پر کن …), the ✏️ turn
  («[اصلاحِ پیامِ قبلی] …» — the page applied the correction itself), every `[سامانه: …]` follow-up. The two follow-ups that write the
  answer to her same message (domain knowledge, file re-read) keep the user turn's tier (`inherit`).
- Fallback: a failed `lla_coach` call is retried once on `lla_assistant` (no error shown, no model named); a 422 sets `AS._coachOff`
  for the page load.

## Tests
- `tests/test_lla_coach_route.py` (9 tests).
- `apps/learning-architecture/tests/test_tour1_r20_routing.js`: pure function (17 cases), 16 real page turns, no-model and 422 fallback,
  no model names; bank `tests/variants/VARIANTS_R20.json` MT2.routing 19/19 (13 on the page; #3 #4 page + backend capability;
  #5 #6 #7 #16 #18 delegated by name to the pytest file).

## Open / not done
- The real-model check of the routing (`POST /api/inspection/audit/ai` pattern) was not run here (no provider key in this sandbox).
- `ACT_ONLY` is a short verb list; a long mixed message («ثبتش کن و بگو گامِ بعد چیه؟») goes to the coach (it has a question mark) — intended.
