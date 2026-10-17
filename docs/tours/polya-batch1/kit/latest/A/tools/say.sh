#!/bin/bash
# say.sh SID TEXT
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round19A
T=$(mktemp -p $R); python3 -c "import json,sys;print(json.dumps({'say':sys.argv[1]},ensure_ascii=False))" "$2" > $T
python3 $R/tools/d.py $1 send @$T | python3 $R/tools/f.py; rm -f $T
