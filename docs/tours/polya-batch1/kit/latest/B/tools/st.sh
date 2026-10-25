#!/bin/bash
# st.sh sid [src] : fresh dir (keeps seq/akey/apatch/aovr/stop_*), start harness5, run drv in bg -> g_sid.txt
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round25B; cd $B; s=$1; src=${2:-$s}
mkdir -p $s; cp ../round24B/$src/inject.js $s/ 2>/dev/null; [ -f $s/inject.js ] || cp tools/inject.js $s/; [ -f $s/inject.js ] || cp tools/inject.js $s/
echo $src > $s/src.txt
[ -f $s/seq.json ] || python3 -c "import json,os,re;n=len([x for x in os.listdir('../round24B/$src/ctl') if re.match(r'c\d+\.json$',x)]);json.dump([{'src':k} for k in range(1,n+1)],open('$s/seq.json','w'))"
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad && nohup node harness5.js $B/$s >> $B/$s/harness.log 2>&1 &
echo $! > $B/$s/pid.txt; sleep 7; cd $B; STOPAT=${STOPAT:-0} nohup python3 tools/drv25b.py $s $src > g_$s.txt 2>&1 &
echo "started $s src=$src harness=$(cat $s/pid.txt)"
