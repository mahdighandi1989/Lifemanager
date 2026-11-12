#!/bin/bash
# nx.sh sid [answer.json] : answer the pending call (if a file is given), resume the driver, show the next pending prompt compactly
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round26B; cd $B; s=$1
if [ -n "$2" ]; then python3 tools/sv.py $s $2 || exit 1; fi
[ -n "$HOLD" ] && export STOPAT=$(( $(ls $s/ctl | grep -c "^c[0-9]*.json$") + 1 ))
WAIT=${WAIT:-100} bash tools/run.sh $s | cut -c1-260
k=$(ls $s/out 2>/dev/null | grep -c '^s[0-9]*.json$'); [ "$k" -gt 0 ] && python3 -c "
import json,os
o=json.load(open('$s/out/s$k.json'))
if o.get('exit'): print('EXITED')
else:
    print('LAST s$k eval:',str(o.get('eval'))[:int(os.environ.get('EL','300'))],'| err:',str(o.get('error'))[:120])
    for m in (o.get('state') or {}).get('msgs',[])[-int(os.environ.get('NM','3')):]:
        if m.startswith('sys'): print('   ',m[:int(os.environ.get('MW','420'))].replace(chr(10),' ⏎ '))"
python3 tools/pq.py $s 2>/dev/null | grep -v '^--$\|^$\|^TODAY' | head -${PL:-40} | cut -c1-${PW:-700}
