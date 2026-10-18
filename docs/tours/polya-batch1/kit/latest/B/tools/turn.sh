#!/bin/bash
# turn.sh sid 'text' [advdays] : insert a say ctl and run it
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23B; cd $B; s=$1
python3 -c "
import json,sys
d={'say':sys.argv[1]}
if len(sys.argv)>2 and sys.argv[2]!='0': d['eval0']='__adv(%s);1'%sys.argv[2]
print(json.dumps(d,ensure_ascii=False))" "$2" "${3:-0}" | TMO=${TMO:-60} bash tools/ins.sh $s
