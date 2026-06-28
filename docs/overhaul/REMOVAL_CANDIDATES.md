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
- **Where it lives now:** moved out of the default Settings view into the **«پیشرفته (قدیمی)»**
  tab of the tabbed Settings page (`frontend/src/pages/Settings.jsx` → `LegacyAiSettings`). All
  endpoints (`/api/ai/providers`, `/api/ai/configs`, `/api/ai/global-prompt`) are unchanged.
- **Revive/retire:** once the analysis pipeline is migrated to resolve through the new catalog
  (`ai_manager`), this tab can be retired with owner approval.

<!-- Add new quarantined capabilities below this line. -->
