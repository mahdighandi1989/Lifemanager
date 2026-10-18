#!/bin/bash
# go2.sh sid : answer pending from akey and run to END/next stop (foreground), show last msgs
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round22B; cd $B; s=$1
TMO=${TMO:-90} timeout 200 python3 tools/drv.py $s $(cat $s/src.txt) > /dev/null 2>&1; echo "rc=$?"; tail -n 2 $s/drv.log | cut -c1-200
k=$(ls $s/out | grep -c '^s[0-9]*.json$'); python3 -c "
import json;o=json.load(open('$s/out/s$k.json'));print('MSGS:');[print('  ',m[:900]) for m in o['state']['msgs'][-3:]]"
