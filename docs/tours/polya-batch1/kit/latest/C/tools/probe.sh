#!/bin/bash
# probe.sh sid 'js-expr' -> run a probe eval in a finished scenario (restart harness, eval, exit), print result
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round18C
n=$(ls $1/ctl | sed 's/c//;s/.json//' | sort -n | tail -1)
python3 -c "import json,sys;json.dump({'eval':sys.argv[1]},open('$1/ctl/c$((n+1)).json','w'))" "$2"
echo '{"exit":true}' > $1/ctl/c$((n+2)).json
ps aux | grep "[h]arness5.js" | grep -q "round18C/$1\$" || bash tools/start.sh $1 >/dev/null
for i in $(seq 1 90); do [ -f $1/out/s$((n+2)).json ] && break; sleep 2; done
python3 -c "import json;r=json.load(open('$1/out/s$((n+1)).json'));print(r.get('eval') or r.get('error'))"
