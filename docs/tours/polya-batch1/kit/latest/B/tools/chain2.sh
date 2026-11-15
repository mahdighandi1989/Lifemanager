#!/bin/bash
# chain2.sh sid... : run each; if it stops for a manual answer, wait until its drv.log ends with END (answers given via nx.sh), then fin and next
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27B; cd $B
for s in "$@"; do
  [ -f $s/DONE ] && continue
  r=$(WAIT=900 bash tools/run.sh $s); echo "$(date +%T) $r" >> chain.log
  until tail -3 $s/drv.log 2>/dev/null | grep -q "^END"; do sleep 15; done
  bash tools/fin.sh $s >> chain.log 2>&1; echo "$(date +%T) FIN $s" >> chain.log
done; echo "CHAIN2 DONE" >> chain.log
