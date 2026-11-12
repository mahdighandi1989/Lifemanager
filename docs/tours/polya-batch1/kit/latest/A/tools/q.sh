#!/bin/bash
# q.sh SID N 'reply' 'coach_state extras JSON' ['extra actions JSON list'] ['top-level extras JSON'] : compact fresh answer via n.sh
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26A
python3 - "$3" "${4:-{\}}" "${5:-[]}" "${6:-{\}}" > $R/$1/_q.json <<'P'
import json,sys
reply,cs,ex,top=sys.argv[1],json.loads(sys.argv[2]),json.loads(sys.argv[3]),json.loads(sys.argv[4])
c={"do":"coach_state","ph":"e","said":[],"ans":[],"stuck":False,"fail":False,"role":"self","nat":"objective","register":"تو"}
c.update(cs)
d={"reply":reply,"status":"related","next":False,"outside":"","know":[],"actions":[c]+ex}
d.update(top)
print(json.dumps(d,ensure_ascii=False))
P
W=${W:-150} TW=${TW:-700} CT=${CT:-4} CW=${CW:-220} bash $R/tools/n.sh $1 $2 < $R/$1/_q.json | cut -c1-${OUTW:-1100}
