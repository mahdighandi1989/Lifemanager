#!/bin/bash
# tdrive.sh : continue tA1 through planned notes; stops on loop-stops (diff) for manual answer
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27A; S=${1:-tA1}
python3 - "$S" <<'PY' > $R/$S/_plan.txt
import json,sys
R='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27A'
for i,a,num,t in json.load(open(R+'/'+sys.argv[1]+'/notes_plan.json')): print(i,num,a)
PY
while true; do
  POS=$(cat $R/$S/pos)
  L=$(tail -1 $R/$S/drive.out)
  # pending AI? then stop for manual
  N=$(ls $R/$S/ai | grep -c '^p'); if [ $N -gt 0 ] && [ ! -f $R/$S/ai/r$N.txt ]; then
    SL=$(grep "##### STOP p$N \|NO R10 match for p$N " $R/$S/auto.log | tail -1)
    echo "$SL" | grep -q "STOP p$N " || { echo "PENDING p$N (no match) pos=$POS"; break; }
    M=$(echo "$SL" | sed -E 's/.*old r17 p([0-9]+).*/\1/'); { echo "== p$N <- r$M"; W=300 python3 $R/tools/vv.py $S $N | grep "^TQ\|^TURN\|LASTSYS\|  changed\|  ask\|  note\|✗\|؟ «"; } >> $R/$S/fwd.log
    bash $R/tools/nx.sh $S $N $M > /dev/null 2>&1; echo "auto p$N<-r$M"; continue; fi
  NEXT=$(awk -v p=$POS '$1>p{print; exit}' $R/$S/_plan.txt)
  if [ -n "$NEXT" ] && [ "$(echo $NEXT | cut -d' ' -f1)" = "$((POS+1))" ]; then
     set -- $NEXT; T=$(python3 -c "import json;print([x[3] for x in json.load(open('$R/$S/notes_plan.json')) if x[0]==$1][0])")
     python3 $R/tools/note.py $S $2 $3 "$T"; echo "NOTE before c$1"; NEXT=$(awk -v p=$1 '$1>p{print; exit}' $R/$S/_plan.txt)
  fi
  SC=$(echo "$NEXT" | cut -d' ' -f1); echo "STOPCTL=$SC" > $R/$S/stops.env
  STOPCTL=$SC python3 -u $R/tools/auto3.py $S >> $R/$S/auto.log 2>&1
  NODATE=1 bash $R/tools/bg.sh $S > /dev/null 2>&1
  tail -3 $R/$S/drive.out | grep -q "LOOP-STOP" && { echo "LOOPSTOP pos=$(cat $R/$S/pos)"; tail -12 $R/$S/drive.out | grep -v "^  D\|^   " | cut -c1-500; break; }
  [ "$(cat $R/$S/pos)" = "$POS" ] && { echo "NO PROGRESS pos=$POS"; tail -3 $R/$S/auto.log | cut -c1-300; break; }
  [ -z "$SC" ] && { echo "DONE plan"; break; }
done
