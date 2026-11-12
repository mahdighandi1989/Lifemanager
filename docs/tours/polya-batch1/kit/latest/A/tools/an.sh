#!/bin/bash
# an.sh SID N : fresh JSON answer from stdin for pN (manual mode, no replay); prints chat tail or next prompt view
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A
cat > $R/$1/ans_$2.json; python3 -c "import json;json.load(open('$R/$1/ans_$2.json'))" || exit 1
timeout 300 python3 $R/tools/d.py $1 ans $2 @$R/$1/ans_$2.json > $R/$1/_ans.txt 2>&1
if grep -q "=== AI" $R/$1/_ans.txt; then python3 $R/tools/v.py $1 ${@:3}; else grep "  MSG\|ERROR\|OVERLAY" $R/$1/_ans.txt | tail -3 | cut -c1-900; fi
