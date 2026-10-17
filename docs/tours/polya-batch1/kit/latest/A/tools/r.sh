#!/bin/bash
# r.sh SID N [OLDPID NEWPID] : replay round15A/SID/ctl/cN.json, filtered output
R=/tmp/claude-0/-home-user-Lifemanager/4dcd6f42-cccf-526a-8c49-83a147c47cb5/scratchpad/tour1_polya
T=$(mktemp -p $R/round16A); if [ -n "$3" ]; then sed "s/$3/$4/g; s#round15A#round16A#g" $R/round15A/$1/ctl/c$2.json > $T; else sed "s#round15A#round16A#g" $R/round15A/$1/ctl/c$2.json > $T; fi
python3 $R/round16A/tools/d.py $1 send @$T | python3 $R/round16A/tools/f.py; rm -f $T
