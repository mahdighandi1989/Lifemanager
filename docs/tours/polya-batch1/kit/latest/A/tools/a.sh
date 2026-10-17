#!/bin/bash
# a.sh SID N  (reads JSON answer from stdin)
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round15A
cat > $R/$1/ans_$2.json
python3 $R/tools/d.py $1 ans $2 @$R/$1/ans_$2.json
