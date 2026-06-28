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

<!-- Add new quarantined capabilities below this line. -->
