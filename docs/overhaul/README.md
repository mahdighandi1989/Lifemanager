# docs/overhaul/ — living audit & ledgers

This folder is the repository's "source of truth" for ongoing work, modeled on the
trading-system repo's overhaul docs. It is **tracked in git** (the READMEs and ledgers
persist; ephemeral artifacts are gitignored — see root `.gitignore`).

| File | Purpose |
|------|---------|
| `AUDIT_LOG.md` | **Binding, append-only.** Every finding / decision / change / revert, dated and typed. Keep it live after every task (CLAUDE.md rules 1 & 5). |
| `REMOVAL_CANDIDATES.md` | Quarantine ledger. Capabilities that look dead but are kept (never deleted without owner approval — CLAUDE.md rule 2). |

Related, elsewhere:

- `../ARCHITECTURE_INVENTORY.md` / `.json` — endpoint/model/page inventory.
- `../API.md` — endpoint specs.
- `../decisions/` — point-in-time decision/analysis reports (root `decision_*.md` is gitignored).
- `../../experiences/` — reusable, project-agnostic engineering lessons (binding; read first).

## How to use it

1. **Before a task:** skim the newest `AUDIT_LOG.md` entries and the relevant `experiences/`.
2. **While working:** if you find something dead-looking, quarantine it and log it in
   `REMOVAL_CANDIDATES.md` rather than deleting.
3. **After the task:** append a dated `AUDIT_LOG.md` entry, record any reusable lesson in
   `experiences/` (merge, don't replace), verify green, then commit & merge per CLAUDE.md.
