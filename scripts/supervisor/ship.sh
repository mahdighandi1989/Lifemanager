#!/usr/bin/env bash
# Ship the supervisor's work: verify ⇒ commit ⇒ push to main (= Render deploy).
# Ported from Detective-1's scripts/ship.sh, with ALLIN1's fallback branch.
#
#   scripts/supervisor/ship.sh "type(scope): summary" [pending-label]
#
# - Refuses to ship unless the merge gate (CLAUDE.md rule 4) is green:
#   `python -m pytest tests/ -q` and `cd frontend && npm run build`.
# - Never force-pushes. Behind main ⇒ rebase onto origin/main, gate again, push.
# - If main still refuses the push (a permission guard, a protected branch), the
#   work goes to `supervisor-pending/<pending-label>` (default `run-<date>`) and
#   the script exits 7 with the exact error — the next urgent round merges it
#   (URGENT_PROMPT.md §1.2). Work is never left only on a claude/... branch.
#
# Exit: 0 shipped to main · 1 gate red / nothing to ship · 7 parked on supervisor-pending/*
set -euo pipefail

MSG="${1:-}"
LABEL="${2:-run-$(date -u +%Y-%m-%d)}"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

say() { printf '\n\033[1;36m== %s\033[0m\n' "$*"; }
retry() { # network ops: 4 retries with exponential backoff (2s, 4s, 8s, 16s)
  local n=0 delay=2
  until "$@"; do
    n=$((n + 1)); [ "$n" -ge 5 ] && return 1
    echo "retrying in ${delay}s…"; sleep "$delay"; delay=$((delay * 2))
  done
}

# --- 1. checks -------------------------------------------------------------
say "Source files hidden by .gitignore"
hidden="$(git ls-files --others --ignored --exclude-standard -- app frontend/src tests migrations scripts docs experiences \
  | grep -v -E '(__pycache__|\.pyc$|\.pytest_cache|^docs/supervisor/inspection/(QUEUE|URGENT)\.md|^docs/supervisor/inspection/(shots|files)/)' || true)"
if [ -n "$hidden" ]; then
  echo "$hidden"
  echo "❌ these source files exist locally but .gitignore hides them — they would be missing on Render. Fix .gitignore."
  exit 1
fi

gate() {
  say "Backend tests (rule 4)"
  python -m pytest tests/ -q -p no:cacheprovider >/tmp/ship-pytest.log 2>&1 \
    || { tail -40 /tmp/ship-pytest.log; echo "❌ pytest red — not shipping"; return 1; }
  tail -1 /tmp/ship-pytest.log
  say "Frontend build (rule 4)"
  (cd frontend && { [ -d node_modules ] || npm ci --no-audit --no-fund; } && npm run build >/tmp/ship-build.log 2>&1) \
    || { tail -40 /tmp/ship-build.log; echo "❌ frontend build red — not shipping"; return 1; }
  echo "build ok"
}
# --- 1b. hand-off guard: a routine that changed ANOTHER routine's area must have recorded the hand-off
#         (docs/supervisor/ownership.json + docs/supervisor/handoffs/<id>.json, one file per entry; owner 2026-10-14 —
#         «کارها جزیره‌ای نشود»). Each routine prompt exports SUPERVISOR_ROUTINE=<general|urgent|backtest>; unset (a human
#         session) ⇒ skipped. A plain `git push` skips all of this — so every prompt says «ship.sh only», and the merge gate
#         re-checks what actually landed: `handoff.py audit` (tests/test_supervisor_handoff_guard.py) reads the «Routine:»
#         line of every commit since the baseline and fails on a cross-area commit without that routine's `did`.
say "Hand-off guard (${SUPERVISOR_ROUTINE:-no routine})"
git fetch -q origin main 2>/dev/null || true
python3 scripts/supervisor/handoff.py guard --routine "${SUPERVISOR_ROUTINE:-}" --base origin/main || exit 1
python3 scripts/supervisor/handoff.py check --fix >/dev/null || true   # regenerate the HANDOFFS.md view
python3 scripts/supervisor/handoff.py check || exit 1

gate || exit 1

# --- 2. commit (the build rewrites frontend/dist/index.html, which is tracked) ---
if [ -n "$(git status --porcelain)" ]; then
  [ -n "$MSG" ] || { echo "❌ uncommitted changes: pass a commit message"; exit 1; }
  say "Commit"
  git add -A
  # «Routine: <name>» trailer — `handoff.py precheck`/`audit` see WHICH routine made each commit on an area. `--trailer` puts
  # it into the message's trailer block (next to any Co-Authored-By), so a later paragraph can never orphan it (review
  # 2026-10-15: `-m "Routine: …"` followed by an attribution paragraph lost the trailer).
  if [ -n "${SUPERVISOR_ROUTINE:-}" ]; then git commit -q -m "$MSG" --trailer "Routine: ${SUPERVISOR_ROUTINE}"; else git commit -q -m "$MSG"; fi
fi

# --- 3. push to main ----------------------------------------------------------
say "Push to main"
retry git fetch -q origin main
if ! git merge-base --is-ancestor origin/main HEAD; then
  echo "main has moved — rebasing onto origin/main and running the hand-off checks and the gate again"
  old_base="$(git merge-base HEAD origin/main)"
  git rebase -q origin/main || { git rebase --abort; echo "❌ rebase conflict — resolve it, nothing was pushed"; exit 1; }
  # another routine's work/hand-offs arrived: regenerate the view (merge=union), say which arrived commits touched the same
  # files (the other routine may have done this very work — then it is an owner-did, not a second copy), and run the guard and
  # the strict ledger check again on the REBASED work, exactly as before the first commit (review 2026-10-15, #12).
  python3 scripts/supervisor/handoff.py check --fix >/dev/null || true
  python3 scripts/supervisor/handoff.py overlap --old "$old_base" --new origin/main --base origin/main || true
  python3 scripts/supervisor/handoff.py guard --routine "${SUPERVISOR_ROUTINE:-}" --base origin/main || exit 1
  python3 scripts/supervisor/handoff.py check || exit 1
  gate || exit 1
  if [ -n "$(git status --porcelain)" ]; then git add -A && git commit -q -m "build: frontend/dist after rebase" ${SUPERVISOR_ROUTINE:+--trailer "Routine: ${SUPERVISOR_ROUTINE}"}; fi
fi
if out="$(retry git push origin HEAD:main 2>&1)"; then
  echo "$out" | tail -3
  say "Shipped $(git rev-parse --short HEAD) to main — Render deploys it automatically"
  exit 0
fi
echo "$out"
say "main refused the push — parking the work on supervisor-pending/$LABEL"
retry git push -q origin "HEAD:refs/heads/supervisor-pending/$LABEL"
echo "⚠️ parked on supervisor-pending/$LABEL (exit 7). Report the error above verbatim; the next urgent round merges it."
exit 7
