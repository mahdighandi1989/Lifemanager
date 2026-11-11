#!/bin/bash
# Inverse of checkpoint.sh: rebuild the scratchpad working tree of the tour from the repo after a NEW container
# (the scratchpad does not survive; git does). Usage: restore.sh <repo-root> <scratchpad>
# Restores: briefs, decisions, reports, plan, findings (as roundX/<sid>/findings.md), model answers, the latest round's
# tools + ctl scripts, and the kit scripts. Not restorable (never committed): screenshots, ai/pN.json transcripts, better/.
set -e
R=${1:-/home/user/Lifemanager}; SP=${2:?scratchpad dir}
D=$R/docs/tours/polya-batch1; T=$SP/tour1_polya
mkdir -p "$T"/reports
cp "$D"/plan/* "$T"/; cp "$D"/decisions/*.md "$T"/; cp "$D"/decisions/*.json "$T"/ 2>/dev/null || true
cp "$D"/runners/*.md "$T"/; cp "$D"/reports/*.md "$T"/reports/; cp -r "$D"/reports/fix* "$T"/reports/ 2>/dev/null || true
cp "$D"/STORYBOARD_LINKS.md "$T"/
for rd in "$D"/findings/*/; do rn=$(basename "$rd"); for f in "$rd"*.md; do b=$(basename "$f" .md)
  case "$b" in _defects) mkdir -p "$T/$rn"; cp "$f" "$T/$rn/defects.md";; _PARTS) mkdir -p "$T/$rn"; cp "$f" "$T/$rn/PARTS.md";;
    *) mkdir -p "$T/$rn/$b"; cp "$f" "$T/$rn/$b/findings.md";; esac; done; done
for rd in "$D"/evidence/*/; do rn=$(basename "$rd"); for sd in "$rd"*/; do mkdir -p "$T/$rn/$(basename "$sd")"; cp "$sd"* "$T/$rn/$(basename "$sd")/"; done; done
last=$(cat "$D"/kit/latest/ROUND)
for g in A B C D; do src="$D/kit/latest/$g"; [ -d "$src" ] || continue; dst="$T/round${last}$g"; mkdir -p "$dst"
  [ -d "$src/tools" ] && cp -r "$src/tools" "$dst/"
  for c in "$src"/*/ctl; do [ -d "$c" ] && { s=$(basename "$(dirname "$c")"); mkdir -p "$dst/$s"; cp -r "$c" "$dst/$s/"; }; done; done
cp "$D"/kit/*.js "$D"/kit/*.py "$D"/kit/*.css "$D"/kit/*.sh "$SP"/ 2>/dev/null || true
echo "restored round $last into $T"; du -sh "$T"
