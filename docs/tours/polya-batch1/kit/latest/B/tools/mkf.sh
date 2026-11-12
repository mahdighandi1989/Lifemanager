#!/bin/bash
# mkf.sh sid : fj/<sid>.py -> <sid>/f.json -> findings + mail
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B; cd $B
python3 -c "
import json;g={};exec(open('fj/$1.py').read(),g);json.dump(g['F'],open('$1/f.json','w'),ensure_ascii=False,indent=1)" && python3 tools/gen26.py $1
