#!/bin/bash
# rw.sh SID "new reply" [EXTRAJSON-without-braces] : answer the pending rewrite with prev old answer + new reply, then continue auto
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23A
N=$(python3 -c "
import os,re;D='$R/$1/ai';ns=sorted(int(m.group(1)) for f in os.listdir(D) for m in [re.match(r'p(\d+)\.json',f)] if m);print([x for x in ns if not os.path.exists(D+'/r%d.txt'%x)][0])")
M=$(python3 -c "import json;print(json.load(open('$R/$1/r10map.json')).get(str($N-1),'0'))")
X=$(python3 -c "import json,sys;d={'_reply':sys.argv[1]};print(json.dumps(d,ensure_ascii=False))" "$2")
echo "rewrite p$N <- old r$M"
bash $R/tools/nx.sh $1 $N $M "$X" 2>&1 | grep -v "^   BLK\|^   NL" | tail -${3:-8} | cut -c1-700
