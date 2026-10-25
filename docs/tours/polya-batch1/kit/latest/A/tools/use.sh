#!/bin/bash
# use.sh SID N M : answer pN with r11 rM and record map
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25A
bash $R/tools/ra.sh $1 $2 $3 | tail -3
python3 -c "
import json,os,sys;f='$R/$1/r10map.json';m=json.load(open(f)) if os.path.exists(f) else {};m['$2']='$3';json.dump(m,open(f,'w'))"
