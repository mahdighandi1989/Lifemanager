#!/bin/bash
# ev1.sh SID 'js' : eval and print EVAL line
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round27A
python3 -c "import json,sys;print(json.dumps({'eval':sys.argv[1]},ensure_ascii=False))" "$2" | timeout 200 bash $R/tools/s.sh $1 | grep -a "EVAL\|ERROR" | cut -c1-${W:-3000}
