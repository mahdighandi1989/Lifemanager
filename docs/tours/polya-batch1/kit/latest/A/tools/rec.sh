#!/bin/bash
# rec.sh SID TAG : dump REC() to SID/corr_TAG.json
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21A
T=$(mktemp -p $R); echo '{"eval":"(()=>{if(!window.REC){'"$(python3 -c "import json;print(json.dumps(open('$R/tools/inject.js').read())[1:-1])")"'};return REC()})()"}' > $T
python3 -c "import json;json.load(open('$T'))" || { echo BADJSON; exit 1; }
python3 $R/tools/d.py $1 send @$T > $T.o; rm -f $T
N=$(ls $R/$1/ctl | sed 's/c//;s/.json//' | sort -n | tail -1)
python3 -c "
import json;o=json.load(open('$R/$1/out/s$N.json'));e=o.get('eval');print(o.get('error') or '')
v=json.loads(e) if isinstance(e,str) else e
json.dump(v,open('$R/$1/corr_$2.json','w'),ensure_ascii=False,indent=0)
print('saved corr_$2.json', len(json.dumps(v)))"
rm -f $T.o
