#!/bin/bash
# st.sh sid [src] : fresh dir, start harness (own pid recorded), run drv in bg -> g_sid.txt
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B; cd $B; s=$1; src=${2:-$s}
mkdir -p $s; [ -f $s/inject.js ] || cp tools/inject.js $s/
echo $src > $s/src.txt; [ -f $s/base.txt ] || python3 -c "import datetime;print((datetime.date(2026,10,25)-datetime.datetime.utcnow().date()).days)" > $s/base.txt
[ -f $s/seq.json ] || python3 -c "import json,os,re;n=len([x for x in os.listdir('../round25B/$src/ctl') if re.match(r'c\d+\.json$',x)]);json.dump([{'src':k} for k in range(1,n+1)],open('$s/seq.json','w'))"
PAGE=${PAGE:-} nohup node tools/harness26bm.js $B/$s >> $B/$s/harness.log 2>&1 &
echo $! > $B/$s/pid.txt; echo "$! harness $s" >> $B/pids.txt; sleep 8
STOPAT=${STOPAT:-0} nohup python3 tools/drv26bm.py $s $src > g_$s.txt 2>&1 &
echo $! > $B/$s/dpid.txt; echo "$! drv $s" >> $B/pids.txt
echo "started $s src=$src harness=$(cat $s/pid.txt)"
