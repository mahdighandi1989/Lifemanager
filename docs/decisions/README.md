# docs/decisions/ — decision & analysis reports

Point-in-time reports worth keeping: a root-cause analysis, a design trade-off write-up, an
AI-assisted review whose conclusion the owner wants to revisit later.

Conventions (modeled on the trading-system repo):

- A **valuable, durable** report lives here as `YYYY-MM-DD-<slug>.md` and is **tracked** in git.
- A scratch/ephemeral report dropped at the repo root as `decision_*.md` is **gitignored**
  (safe to delete after review). Promote it here if it's worth keeping.
- A **reusable, project-agnostic lesson** does NOT belong here — it goes in `../../experiences/`
  (merge, don't replace), per `experiences/README.md`.

This README is tracked; it documents the convention even when the folder is otherwise empty.
