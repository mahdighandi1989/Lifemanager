#!/bin/bash
# man.sh SID N M : answer pN with my JSON (stdin), record map N->M (M = old prompt number it replaces, or 0)
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A
cat > $R/$1/ans_$2.json
python3 -c "import json;json.load(open('$R/$1/ans_$2.json'))" || exit 1
python3 -c "
import json,os;f='$R/$1/r10map.json';m=json.load(open(f)) if os.path.exists(f) else {};m['$2']='$3';json.dump(m,open(f,'w'))"
python3 $R/tools/d.py $1 ans $2 @$R/$1/ans_$2.json | python3 $R/tools/f.py | tail -5
