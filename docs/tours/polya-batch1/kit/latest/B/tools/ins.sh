#!/bin/bash
# ins.sh sid  (ctl json on stdin): insert into seq at current position, run exactly that ctl, print result
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21B; cd $B; s=$1
cat > $s/_ins.json
n=$(ls $s/ctl | grep -c '^c[0-9]*.json$')
python3 - $s $n <<'PY'
import json,sys
s,n=sys.argv[1],int(sys.argv[2]); B='/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round21B'
L=json.load(open(f'{B}/{s}/seq.json')); L.insert(n,{'ctl':json.load(open(f'{B}/{s}/_ins.json'))}); json.dump(L,open(f'{B}/{s}/seq.json','w'),ensure_ascii=False,indent=0)
PY
STOPAT=$((n+2)) timeout ${TMO:-150} python3 tools/drv.py $s $(cat $s/src.txt) > /dev/null 2>&1; rc=$?
k=$((n+1)); echo "rc=$rc c$k"; python3 -c "
import json,os;f='$B/$s/out/s$k.json'
if os.path.exists(f):
  o=json.load(open(f));print('EVAL:',str(o.get('eval'))[:int(os.environ.get('EL','2500'))]);print('ERR:',o.get('error'));print('VIEW:',o['state'].get('view'),o['state'].get('arg'),o['state'].get('sub'));print('MSGS:',o['state']['msgs'][-2:])
else: print('no out yet')"
