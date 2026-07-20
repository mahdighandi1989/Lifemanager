# Removal Candidates (Quarantine Ledger)

Per CLAUDE.md rule 2, capabilities are **never deleted** — they are quarantined (unmounted /
flagged / parked) and recorded here. Deletion requires the owner's explicit approval.

Format: `## <capability> — quarantined YYYY-MM-DD` then why it looks dead, why it's kept, and
how to revive it.

---

## app/routes/auth_google.py — pre-existing (kept)

- **Looks dead:** the router is conditionally mounted (only when `GOOGLE_CLIENT_ID` is set);
  static "file without import reference" audits flag it.
- **Kept because:** it is the forthcoming Google sign-in flow; `app/main.py` documents the
  explicit mount and the gating. This is the canonical "quarantine not delete" example.
- **Revive:** set `GOOGLE_CLIENT_ID` (and the related OAuth env vars) — `main.py` mounts it
  automatically.

## Legacy AI provider/model/context config (Settings) — quarantined 2026-06-28

- **Looks redundant:** the new AI catalog (`/ai-settings`, `ai_catalog_*` tables) supersedes the
  old per-user provider/model management that used to be the whole `/settings` page.
- **Kept because:** the legacy per-user `AIProvider` / `AIModelConfig` rows still feed the
  existing analysis pipeline (`app/services/ai/provider_service.resolve_provider_routing`), and
  the "جعبه پرامپت تحلیل" (global analysis prompt) is a real feature not covered by the catalog.
- **Where it lives now (Update 2026-06-28):** the «پیشرفته (قدیمی)» tab was **retired** (owner
  approval). The legacy provider/model/context **UI** was removed (the context knobs
  `context_type`/`dynamic_response`/`token_limit` had **no live consumers** — verified by grep).
  The one piece that IS used — the global **analysis prompt** (`/api/ai/global-prompt`, read by
  `model_service` + `task_feedback`) — was **relocated into the «هوش مصنوعی» tab** (AISettings).
  The legacy **endpoints** `/api/ai/providers` and `/api/ai/configs` (+ the `AIProvider` /
  `AIModelConfig` models + rows) are **unchanged** — only their UI was dropped; capability and
  data are preserved.
- **Revive/retire:** to fully retire the legacy `AIProvider`/`AIModelConfig` system, first migrate
  the analysis pipeline (`provider_service.resolve_provider_routing`) to resolve through the new
  catalog (`ai_manager`); then the endpoints can be removed with owner approval.

<!-- Add new quarantined capabilities below this line. -->

## 2026-07-20 — رفتارهای قرنطینه‌شدهٔ seed خودسازی (کد حفظ شد، شرط مخرب غیرفعال)

- **شرط count-mismatch در HARD RESET لیست «مرد الهی»** (`app/main.py` بلوک divine_man):
  قبلاً `len(rows) != len(seed)` به‌تنهایی کل لیست را حذف/بازسازی می‌کرد — یعنی افزودن یا
  حذف یک آیتم توسط مالک، در بوت بعدی همهٔ داده‌اش را می‌پراند. از این تاریخ reset فقط با
  حکم `divine_man_hard_reset_verdict` (تعداد برابر seed + محتوای صددرصد seed + صفر تیک)
  اجرا می‌شود. حالت‌های قبلی حذف نشده‌اند — فقط پشت گارد بدون‌خسارت رفته‌اند و در log با
  reason ثبت می‌شوند. بازگردانی: حذف گارد (یک if) — ولی فقط با تأیید صریح مالک.
- **حذف پیشوندی نامشروط «مراقبه:/نکته:» در لیست محاسبه**
  (`app/services/self_improvement_service.py`): قبلاً در هر بوت/GET هر ردیفی با این
  پیشوندها حذف سخت می‌شد (یادداشت‌های آیندهٔ مالک هم). حالا فقط وقتی ردیف‌های exact-match
  قدیمی (وضعیت پیش-مهاجرت) حاضر باشند اجرا می‌شود. بازگردانی: برداشتن شرط `if exact_stale`.
