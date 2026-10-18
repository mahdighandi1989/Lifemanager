#!/bin/bash
# ctl.sh sid <mk-expr>  e.g. ctl.sh bp1 'mk.prer()' : insert a helper ctl from tools/mk.py and run it
B=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya/round24B; cd $B; s=$1
python3 -c "
import sys,json;sys.path.insert(0,'tools');import mk;print(json.dumps(eval(sys.argv[1])['ctl'],ensure_ascii=False))" "$2" | EL=${EL:-3000} TMO=${TMO:-60} bash tools/ins.sh $s | grep -v "^MSGS"
