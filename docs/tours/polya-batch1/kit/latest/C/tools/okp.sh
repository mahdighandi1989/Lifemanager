#!/bin/bash
# okp.sh sid N newprc -> reuse mapped r21 reply replacing any prc_ id with newprc
cd /tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round23C
m=$(python3 -c "import json;print(json.load(open('$1/drv.json'))['map'].get('$2',-1))")
python3 -c "
import re,sys;t=open('../round22C/$1/ai/r$m.txt').read();t=re.sub(r'prc_[a-z0-9]+','$3',t);print(t)" | python3 tools/nr.py $1 $2
