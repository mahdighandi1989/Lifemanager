#!/bin/bash
# od.sh sid k [kk]: word-diff R10 out k vs R11 out kk
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya
g(){ python3 -c "
import json,re,sys;o=json.load(open(sys.argv[1]));t=str(o.get('error') or '')+str(o.get('eval0') or '')+str(o.get('eval') or '');t=re.sub(r'pb_[a-z]_[a-z0-9]+','PB',t);t=re.sub(r'20\d\d-\d\d-\d\dT[\d:.]+Z','TS',t);t=re.sub(r'dl_[a-z0-9]+','DL',t);print(t)" $1 | tr ' ' '\n'; }
diff <(g $B/round15B/$1/out/s$2.json) <(g $B/round16B/$1/out/s${3:-$2}.json) | head -${N:-40}
