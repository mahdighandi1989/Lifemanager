#!/bin/bash
# probe.sh sid jsfile -> append an eval ctl (+exit) to src and run it; print the eval result
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24C
s=$1; n=$(ls src/$s/ctl/c*.json | wc -l)
python3 -c "import json,sys;js=open('$2').read();json.dump({'eval':js},open('src/$s/ctl/c$((n+1)).json','w'),ensure_ascii=False)"
echo '{"exit":true}' > src/$s/ctl/c$((n+2)).json
T=300 W=300 tools/d.sh $s > $s/probe.txt 2>&1
python3 -c "import json;print(json.load(open('$s/out/s$((n+1)).json')).get('eval'))"
