#!/bin/bash
# say2.sh sid textfile [advdays] : insert a say ctl at the current position, run it until the model is needed, show the prompt
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B; cd $B; s=$1
python3 -c "
import json,sys
d={'say':open(sys.argv[1]).read().strip()}
if len(sys.argv)>2 and sys.argv[2]!='0': d['eval0']='__adv(%s);1'%sys.argv[2]
print(json.dumps(d,ensure_ascii=False))" "$2" "${3:-0}" | TMO=${TMO:-60} bash tools/ins.sh $s | head -2
python3 tools/pq.py $s 2>/dev/null | grep -v '^--$\|^$\|^TODAY' | head -${PL:-40} | cut -c1-${PW:-700}
