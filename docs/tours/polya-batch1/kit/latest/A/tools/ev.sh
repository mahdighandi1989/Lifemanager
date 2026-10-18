#!/bin/bash
# ev.sh SID 'JS expr' [key=eval|eval0] : send one eval ctl, print result + errors
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24A
T=$(mktemp -p $R); python3 -c "import json,sys;print(json.dumps({sys.argv[2]:sys.argv[1]},ensure_ascii=False))" "$2" "${3:-eval}" > $T
python3 $R/tools/d.py $1 send @$T | grep -v "^VIEW\|^  MSG" | cut -c1-${4:-5000}; rm -f $T
