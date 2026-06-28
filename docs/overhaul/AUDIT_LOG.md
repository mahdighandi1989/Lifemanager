# Overhaul Audit Log

Running, append-only record of every finding, decision, change, and revert made while working
on this repository. **Newest entries are appended at the end.** This file is binding (CLAUDE.md
rule 5): keep it live after every task — no separate reminder needed.

Format per line/bullet:
`[type: FINDING|DECISION|CHANGE|REVERT|PROPOSAL] [optional tags] — detail + rationale (+ commit, + verification status)`

Group bullets under a `## YYYY-MM-DD — <phase/context>` heading.

---

## 2026-06-28 — Bootstrap: adopt trading-system documentation + merge workflow

- **DECISION** Establish a CLAUDE.md-driven "document-and-merge" workflow modeled on the
  trading-system repo, per the owner's request to replicate that repo's automatic
  documentation + direct-to-`main` commit habit. The mechanism is **pure instruction**
  (no git hook / CI gate) — it lives in `CLAUDE.md` and is honoured by whoever works the repo.
- **CHANGE** Added `CLAUDE.md` (root): non-negotiable rules (read `experiences/` first;
  quarantine-not-delete; behaviour-preserving; verify `pytest tests/` + `npm run build` before
  merge; append to this log), owner standing directives (document after every task; commit &
  merge straight to `main` once green, no PR unless asked — with a managed-session note that
  pins work to the assigned feature branch), system map, run/migration instructions, and a
  "where things live" + conventions section.
- **CHANGE** Created `docs/overhaul/` (this log + `README.md` + `REMOVAL_CANDIDATES.md`) and
  `docs/decisions/README.md`; extended `.gitignore` to keep ephemeral artifacts
  (`decision_*.md`, `inbox/` contents) out of git while tracking the folder READMEs.
- **FINDING** `experiences/README.md` already defines the kebab-case + YAML-frontmatter format
  (identical in spirit to trading-system), and a "Knowledge Center" (`/knowledge-center`) page
  is documented to read this folder — so no new experiences format was needed, only the audit
  log + decision-report conventions.
- **NOTE** This work is committed to the managed-session feature branch
  `claude/lifemanager-setup-nx9izb` (the environment forbids pushing elsewhere); the
  merge-to-`main` directive in CLAUDE.md governs unconstrained local work.
