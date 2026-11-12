#!/bin/bash
# loop.sh SID : while the last stop is BLOCKS EQUAL with no new heads, answer with the old reply and continue
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A
for k in $(seq 1 80); do
  L=$(grep -n "##### STOP\|^END$\|cannot map\|NO R10 match" $R/$1/auto.log | tail -1)
  echo "$L" | grep -q "STOP p" || { echo "LOOP-END: $L"; break; }
  N=$(echo "$L" | sed -E 's/.*STOP p([0-9]+).*/\1/'); M=$(echo "$L" | sed -E 's/.*old r17 p([0-9]+).*/\1/')
  [ -f $R/$1/ai/r$N.txt ] && { echo "already answered p$N"; break; }
  { echo ",${STOPS:-}," | grep -q ",$N," || echo ",${STOPM:-}," | grep -q ",$M,"; } && { echo "LOOP-STOP at p$N (STOPS)"; sed -n "$(echo "$L" | cut -d: -f1),\$p" $R/$1/auto.log | grep -v "^   BLK:\|^   NL:" | cut -c1-1500; break; }
  T=$(sed -n "$(echo "$L" | cut -d: -f1),\$p" $R/$1/auto.log)
  if echo "$T" | grep -q "^TURN: # نوبتِ تازه | \[سامانه:"; then echo "auto-sys p$N <- r$M"; X="{}"; bash $R/tools/nx.sh $1 $N $M "$X" > /dev/null 2>&1; continue; fi
  { echo "$T" | grep -q "^BLOCKS EQUAL" && echo "$T" | grep "^NEWHEADS: " | head -1 | python3 $R/tools/okheads.py $1 $N; } || { [ -z "$STRICT" ] && echo "$T" | python3 $R/tools/softok.py && echo "soft p$N"; } || { echo "LOOP-STOP at p$N (diff/newheads)"; echo "$T" | grep "^TURN\|^OLD REPLY\|^OLD ACTIONS\|^NEWHEADS\|یک\*\* پرسش\|پرسشِ این نوبت همین\|کارِ پیشین\|حسابِ صفحه\|NO R10\|NEWRULE" | cut -c1-900; break; }
  python3 -c "
import json,sys
u=json.load(open('$R/$1/ai/p$N.json'))['user']
sys.exit(1 if ('): ✗ ' in u.split('# گفت‌وگو تا')[0] and '# حسابِ صفحه' in u) or '📅 از حرفِ خودت' in u.split('# گفت‌وگو تا')[-1][-900:] else 0)" || { echo "LOOP-STOP at p$N (page ✗ or date ask)"; echo "$T" | grep "^TURN\|^OLD REPLY" | cut -c1-600; break; }
  grep -qE "20[0-9]{2}-[01][0-9]-[0-3][0-9]" /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A/_old/$1/ai/r$M.txt && { echo "LOOP-STOP at p$N (old answer has a date)"; echo "$T" | grep -v "^   BLK:\|^   NL:" | cut -c1-1200; break; }
  X="{}"; [ -f $R/$1/over_$N.json ] && X=$(cat $R/$1/over_$N.json); echo "auto p$N <- r$M $X" | cut -c1-200; bash $R/tools/nx.sh $1 $N $M "$X" > /dev/null 2>&1
done
