#!/bin/bash
# stat.sh SID... : compact view of the latest stop of each scenario (only when its loop is done)
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24A
for s in "$@"; do
  L=$(tail -1 $R/$s/drive.out 2>/dev/null)
  echo "$L" | grep -q "LOOPDONE\|FULLDONE" || { echo "== $s running ($L)"; continue; }
  echo "======== $s"
  sed -n "$(grep -n 'STOP p\|NO R10\|^END\|cannot map' $R/$s/auto.log | tail -1 | cut -d: -f1),\$p" $R/$s/auto.log | grep -v "^   BLK\|^   NL\|^NEWHEADS\|^EXIT" | cut -c1-${W:-800} | head -${H:-14}
done
