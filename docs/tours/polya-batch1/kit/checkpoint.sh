#!/bin/bash
# Copy the tour's durable state (text only, no model transcripts, no e-mail bodies) from the scratchpad into the repo,
# so a session that dies mid-round can resume from GitHub. Usage: checkpoint.sh <repo-root>
set -e
SP=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad
T=$SP/tour1_polya
D=${1:-/home/user/Lifemanager}/docs/tours/polya-batch1
mkdir -p "$D"/plan "$D"/decisions "$D"/runners "$D"/reports "$D"/findings "$D"/kit
cp "$T"/scenarios.md "$T"/scenarios.json "$T"/coverage_matrix.json "$D"/plan/
cp "$T"/DECISIONS_R*.md "$D"/decisions/
cp "$T"/RUNNER*.md "$D"/runners/
cp "$T"/reports/*.md "$D"/reports/
# findings of every round (the book's evidence): findings/<round>/<sid>.md
for r in "$T"/round*/ "$T"/rerun?/ "$T"/run?/; do [ -d "$r" ] || continue; rn=$(basename "$r")
  for f in "$r"*/findings.md; do [ -f "$f" ] || continue; mkdir -p "$D/findings/$rn"; cp "$f" "$D/findings/$rn/$(basename "$(dirname "$f")").md"; done; done
# replay kit of the LATEST round: tools + per-scenario control scripts
last=$(ls -d "$T"/round*A 2>/dev/null | sed 's/.*round\([0-9]*\)A/\1/' | sort -n | tail -1)
rm -rf "$D"/kit/latest && mkdir -p "$D"/kit/latest
for g in A B C D; do src="$T/round${last}$g"; [ -d "$src" ] || continue
  mkdir -p "$D/kit/latest/$g"; [ -d "$src/tools" ] && cp -r "$src/tools" "$D/kit/latest/$g/"
  for c in "$src"/*/ctl; do [ -d "$c" ] && { s=$(basename "$(dirname "$c")"); mkdir -p "$D/kit/latest/$g/$s"; cp -r "$c" "$D/kit/latest/$g/$s/"; }; done; done
# book evidence: every round's model replies per scenario (text, small) — the worked examples are rewritten from these + findings
for r in "$T"/round*/; do rn=$(basename "$r"); for sd in "$r"s[0-9][0-9]*/; do [ -d "$sd" ] || continue; ls "$sd"ans_*.json >/dev/null 2>&1 || continue
  mkdir -p "$D/evidence/$rn/$(basename "$sd")"; cp "$sd"ans_*.json "$D/evidence/$rn/$(basename "$sd")/" 2>/dev/null; done; done
echo "$last" > "$D"/kit/latest/ROUND
cp "$SP"/harness5.js "$SP"/storyboard.py "$SP"/storyboard.css "$SP"/savehb.py "$SP"/gate_wt.sh "$SP"/resolve_bundle.sh "$SP"/checkpoint.sh "$SP"/pack_sb.py "$D"/kit/
# never commit the owner's address
grep -rlI "<owner-email>" "$D" | xargs -r sed -i 's/mohamad\.mahdi1988@gmail\.com/<owner-email>/g'
du -sh "$D"
